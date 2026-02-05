/**
 * @fileoverview Save Responses Batch API Route
 * @description Saves a batch of answers during an exam to reduce request volume
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';
import { examLogger } from '@/lib/logger';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import {
    isNonEmptyString,
    getSupabaseConfig,
    serverMisconfiguredResponse,
    addVersionHeader,
} from '../_utils/validation';

type BatchItem = {
    questionId: string;
    answer: string | null;
    status?: string;
    isMarkedForReview?: boolean;
    isVisited?: boolean;
    timeSpentSeconds?: number;
    visitCount?: number;
};

export async function POST(req: NextRequest) {
    const res = NextResponse.next();

    try {
        const body = await req.json();
        const { attemptId, responses, sessionToken, force_resume } = body ?? {};

        if (!isNonEmptyString(attemptId)) {
            return addVersionHeader(NextResponse.json({ error: 'attemptId is required' }, { status: 400 }));
        }
        if (!Array.isArray(responses) || responses.length === 0) {
            return addVersionHeader(NextResponse.json({ error: 'responses array is required' }, { status: 400 }));
        }

        const config = getSupabaseConfig();
        if (!config) {
            return addVersionHeader(serverMisconfiguredResponse());
        }

        const supabase = createServerClient(config.url, config.anonKey, {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    res.cookies.set({ name, value: '', ...options });
                },
            },
        });

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return addVersionHeader(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        }

        // Rate limit (batch counts as one save request)
        const rateLimitKey = userRateLimitKey('save', session.user.id);
        const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.SAVE_RESPONSE);

        if (!rateLimitResult.allowed) {
            const headers = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SAVE_RESPONSE.limit);
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded. Please slow down.',
                    retryAfterSeconds: Math.ceil(rateLimitResult.retryAfterMs / 1000),
                },
                { status: 429, headers }
            );
        }

        const adminClient = getServiceRoleClient();
        const { data: attempt, error: attemptError } = await adminClient
            .from('attempts')
            .select('id, user_id, status, started_at, paper_id, submitted_at')
            .eq('id', attemptId)
            .maybeSingle();

        if (attemptError || !attempt) {
            return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 });
        }

        if (attempt.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // FIX: Allow saves during submit transition grace period (60 seconds after submit)
        // This prevents data loss when submit times out but actually succeeds on server
        const isInProgress = attempt.status === 'in_progress';
        const isRecentlySubmitted = attempt.status === 'submitted' && attempt.submitted_at &&
            (Date.now() - new Date(attempt.submitted_at as string).getTime()) < 60000; // 60 second grace

        if (!isInProgress && !isRecentlySubmitted) {
            // Log for debugging - don't error if attempt is completed/submitted beyond grace
            console.log('Save-batch rejected - attempt not in progress', {
                attemptId,
                status: attempt.status,
                submitted_at: attempt.submitted_at,
            });
            return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
        }

        if (!sessionToken) {
            return NextResponse.json({ error: 'Missing session token' }, { status: 400 });
        }

        const { data: isValidSession, error: validateError } = await supabase.rpc('validate_session_token', {
            p_attempt_id: attemptId,
            p_session_token: sessionToken,
            p_user_id: session.user.id,
            p_force_resume: false,
        });

        if (validateError) {
            examLogger.securityEvent('Save-batch session validation RPC error', {
                attemptId,
                errorMessage: validateError.message,
                errorCode: validateError.code,
            });
            if (force_resume === true) {
                const { error: forceResumeError } = await supabase.rpc('force_resume_exam_session', {
                    p_attempt_id: attemptId,
                    p_new_session_token: sessionToken,
                });
                if (forceResumeError) {
                    return NextResponse.json({ error: 'Failed to validate session', code: 'VALIDATION_RPC_ERROR' }, { status: 500 });
                }
            } else {
                return NextResponse.json({ error: 'Failed to validate session', code: 'VALIDATION_RPC_ERROR' }, { status: 500 });
            }
        }

        if (!isValidSession) {
            if (force_resume === true) {
                const { error: forceResumeError } = await supabase.rpc('force_resume_exam_session', {
                    p_attempt_id: attemptId,
                    p_new_session_token: sessionToken,
                });
                if (forceResumeError) {
                    return NextResponse.json({ error: 'Failed to force resume session' }, { status: 500 });
                }
            } else {
                examLogger.securityEvent('Save-batch session token mismatch', { attemptId });
                return NextResponse.json(
                    {
                        error: 'Session conflict detected. This exam may be open in another tab or device.',
                        code: 'SESSION_CONFLICT',
                        canForceResume: true,
                    },
                    { status: 409 }
                );
            }
        }

        // Build rows
        const rows = (responses as BatchItem[])
            .filter((r) => r && isNonEmptyString(r.questionId))
            .map((r) => {
                const row: Record<string, unknown> = {
                    attempt_id: attemptId,
                    question_id: r.questionId,
                    answer: r.answer ?? null,
                };

                if (typeof r.status === 'string') row.status = r.status;
                if (typeof r.isMarkedForReview === 'boolean') row.is_marked_for_review = r.isMarkedForReview;
                if (typeof r.isVisited === 'boolean') row.is_visited = r.isVisited;
                if (typeof r.timeSpentSeconds === 'number') row.time_spent_seconds = r.timeSpentSeconds;
                if (typeof r.visitCount === 'number') row.visit_count = r.visitCount;

                return row;
            });

        if (rows.length === 0) {
            return addVersionHeader(NextResponse.json({ success: true, saved: 0 }, { status: 200 }));
        }

        const { error } = await supabase
            .from('responses')
            .upsert(rows, { onConflict: 'attempt_id,question_id' });

        if (error) {
            return NextResponse.json({ error: error.message ?? 'Upsert failed' }, { status: 500 });
        }

        const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SAVE_RESPONSE.limit);
        const response = NextResponse.json({ success: true, saved: rows.length }, { status: 200 });
        Object.entries(successHeaders).forEach(([k, v]) => response.headers.set(k, String(v)));
        res.cookies.getAll().forEach((cookie) => response.cookies.set(cookie.name, cookie.value));
        return addVersionHeader(response);
    } catch {
        return addVersionHeader(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
    }
}
