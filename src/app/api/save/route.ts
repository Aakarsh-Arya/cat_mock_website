/**
 * @fileoverview Save Response API Route
 * @description Saves user's answer to a question during exam
 * @blueprint Security Audit - P0 Fix - Rate Limiting, Session Locking
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

export async function POST(req: NextRequest) {
    // Create a single response object up-front so any auth cookie mutations
    // made by supabase SSR actually get returned to the client.
    const res = NextResponse.next();

    try {
        const body = await req.json();
        const {
            attemptId,
            questionId,
            answer,
            sessionToken,
            force_resume,
            status,
            isMarkedForReview,
            isVisited,
            timeSpentSeconds,
            visitCount,
        } = body ?? {};

        const referer = req.headers.get('referer') ?? '';
        let refererAttemptId: string | null = null;
        try {
            const path = new URL(referer).pathname;
            const parts = path.split('/');
            if (parts[1] === 'exam' && parts[2]) refererAttemptId = parts[2];
        } catch {
            // ignore malformed referer
        }

        if (!isNonEmptyString(attemptId)) {
            return addVersionHeader(NextResponse.json({ error: 'attemptId is required' }, { status: 400 }));
        }
        if (!isNonEmptyString(questionId)) {
            return addVersionHeader(NextResponse.json({ error: 'questionId is required' }, { status: 400 }));
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

        // P0 FIX: Rate limiting per user
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

        // Ensure the attempt belongs to the user (service role read to avoid RLS false negatives)
        const adminClient = getServiceRoleClient();
        let effectiveAttemptId = attemptId;
        let { data: attempt, error: attemptError } = await adminClient
            .from('attempts')
            .select('id, user_id, status, started_at, paper_id')
            .eq('id', attemptId)
            .maybeSingle();

        if ((!attempt || attemptError) && refererAttemptId && refererAttemptId !== attemptId) {
            const { data: refererAttempt, error: refererError } = await adminClient
                .from('attempts')
                .select('id, user_id, status, started_at, paper_id')
                .eq('id', refererAttemptId)
                .maybeSingle();
            if (refererAttempt && !refererError) {
                attempt = refererAttempt;
                effectiveAttemptId = refererAttemptId;
            }
        }

        if (attemptError) {
            console.log('API_SAVE_ATTEMPT_LOOKUP_FAILED', {
                attemptId,
                userId: session.user.id,
                status: null,
                errorCode: attemptError.code ?? null,
                errorMessage: attemptError.message ?? 'Attempt lookup failed',
            });
            return NextResponse.json(
                {
                    error: 'Failed to fetch attempt',
                    ...(process.env.NODE_ENV !== 'production'
                        ? {
                            debug: {
                                attemptId,
                                refererAttemptId,
                                userId: session.user.id,
                                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
                                hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
                                attemptErrorCode: attemptError.code ?? null,
                                attemptErrorMessage: attemptError.message ?? null,
                            },
                        }
                        : {}),
                },
                { status: 500 }
            );
        }

        if (!attempt || attempt.user_id !== session.user.id) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
            }

            console.log('API_SAVE_ATTEMPT_FORBIDDEN', {
                attemptId,
                userId: session.user.id,
                status: attempt?.status ?? null,
                errorCode: 'FORBIDDEN',
                errorMessage: 'Attempt not found or not owned by user',
            });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // P0 FIX: Don't allow saves on completed/submitted attempts
        if (attempt.status !== 'in_progress') {
            console.log('API_SAVE_ATTEMPT_STATUS_MISMATCH', {
                attemptId,
                userId: session.user.id,
                status: attempt.status,
                errorCode: 'INVALID_ATTEMPT_STATUS',
                errorMessage: 'Attempt is not in progress',
            });
            return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
        }

        if (!sessionToken) {
            return NextResponse.json({ error: 'Missing session token' }, { status: 400 });
        }

        const { data: isValidSession, error: validateError } = await supabase.rpc('validate_session_token', {
            p_attempt_id: effectiveAttemptId,
            p_session_token: sessionToken,
            p_user_id: session.user.id,
            // Disambiguate overloaded RPC (uuid vs text signature)
            p_force_resume: false,
        });

        if (validateError) {
            examLogger.securityEvent('Save session validation RPC error', {
                attemptId,
                errorMessage: validateError.message,
                errorCode: validateError.code,
            });
            // If RPC error and force_resume is set, try to proceed with force resume
            if (force_resume === true) {
                const { error: forceResumeError } = await supabase.rpc('force_resume_exam_session', {
                    p_attempt_id: effectiveAttemptId,
                    p_new_session_token: sessionToken,
                });
                if (!forceResumeError) {
                    // Force resume succeeded, continue with save
                } else {
                    return NextResponse.json(
                        {
                            error: 'Failed to validate session',
                            code: 'VALIDATION_RPC_ERROR',
                            ...(process.env.NODE_ENV !== 'production'
                                ? {
                                    debug: {
                                        attemptId: effectiveAttemptId,
                                        validateErrorCode: validateError.code ?? null,
                                        validateErrorMessage: validateError.message ?? null,
                                    },
                                }
                                : {}),
                        },
                        { status: 500 }
                    );
                }
            } else {
                return NextResponse.json(
                    {
                        error: 'Failed to validate session',
                        code: 'VALIDATION_RPC_ERROR',
                        ...(process.env.NODE_ENV !== 'production'
                            ? {
                                debug: {
                                    attemptId: effectiveAttemptId,
                                    validateErrorCode: validateError.code ?? null,
                                    validateErrorMessage: validateError.message ?? null,
                                },
                            }
                            : {}),
                    },
                    { status: 500 }
                );
            }
        }

        if (!isValidSession) {
            if (force_resume === true) {
                const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
                const userAgent = req.headers.get('user-agent') ?? 'unknown';

                examLogger.securityEvent('Force resume (save)', {
                    attemptId: effectiveAttemptId,
                    ip,
                    userAgent,
                });

                const { error: forceResumeError } = await supabase.rpc('force_resume_exam_session', {
                    p_attempt_id: effectiveAttemptId,
                    p_new_session_token: sessionToken,
                });

                if (forceResumeError) {
                    if (
                        forceResumeError.message?.includes('FORCE_RESUME_STALE') ||
                        forceResumeError.message?.includes('stale')
                    ) {
                        return NextResponse.json(
                            {
                                error: 'Force resume denied. Session is too old.',
                                code: 'FORCE_RESUME_STALE',
                            },
                            { status: 409 }
                        );
                    }

                    return NextResponse.json({ error: 'Failed to force resume session' }, { status: 500 });
                }
            } else {
                examLogger.securityEvent('Save session token mismatch', { attemptId: effectiveAttemptId });
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

        // P0 FIX: Server-side section timer validation
        // Check if too much time has elapsed since exam started (dynamic per paper)
        if (attempt.started_at) {
            const { data: paperTiming, error: paperTimingError } = await supabase
                .from('papers')
                .select('sections')
                .eq('id', attempt.paper_id)
                .maybeSingle();

            if (paperTimingError) {
                return NextResponse.json(
                    {
                        error: 'Failed to fetch paper timing',
                        ...(process.env.NODE_ENV !== 'production'
                            ? {
                                debug: {
                                    attemptId: effectiveAttemptId,
                                    paperId: attempt.paper_id,
                                    paperTimingErrorCode: paperTimingError.code ?? null,
                                    paperTimingErrorMessage: paperTimingError.message ?? null,
                                },
                            }
                            : {}),
                    },
                    { status: 500 }
                );
            }

            const totalMinutes = (paperTiming?.sections || []).reduce(
                (sum: number, s: { time?: number }) => sum + (s.time || 0),
                0
            );

            const maxDurationMs = Math.max(1, totalMinutes || 120) * 60 * 1000;
            const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes grace

            const startedAt = new Date(attempt.started_at).getTime();
            const elapsed = Date.now() - startedAt;

            if (elapsed > maxDurationMs + GRACE_PERIOD_MS) {
                return NextResponse.json(
                    {
                        error: 'Exam time has expired. Saves are no longer accepted.',
                        code: 'TIME_EXPIRED',
                    },
                    { status: 400 }
                );
            }
        }

        // Upsert response
        const upsertPayload: Record<string, unknown> = {
            attempt_id: effectiveAttemptId,
            question_id: questionId,
            answer: answer ?? null,
        };

        if (typeof status === 'string') upsertPayload.status = status;
        if (typeof isMarkedForReview === 'boolean') upsertPayload.is_marked_for_review = isMarkedForReview;
        if (typeof isVisited === 'boolean') upsertPayload.is_visited = isVisited;
        if (typeof timeSpentSeconds === 'number') upsertPayload.time_spent_seconds = timeSpentSeconds;
        if (typeof visitCount === 'number') upsertPayload.visit_count = visitCount;

        const { data, error } = await supabase
            .from('responses')
            .upsert(upsertPayload, { onConflict: 'attempt_id,question_id' })
            .select('attempt_id, question_id, answer, updated_at')
            .single();

        if (error) {
            const errorMessage = error.message ?? 'Upsert failed';
            const errorCode = error.code ?? null;
            const isRls =
                errorCode === '42501' ||
                errorMessage.toLowerCase().includes('row-level security') ||
                errorMessage.toLowerCase().includes('permission denied');

            if (isRls) {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    return NextResponse.json(
                        { error: 'Session expired. Please sign in again.' },
                        { status: 401 }
                    );
                }

                return NextResponse.json(
                    { error: 'Insufficient permissions to save response.' },
                    { status: 403 }
                );
            }

            console.log('API_SAVE_RESPONSE_UPSERT_FAILED', {
                attemptId,
                userId: session.user.id,
                status: attempt.status,
                errorCode,
                errorMessage,
            });
            return NextResponse.json(
                {
                    error: errorMessage,
                    ...(process.env.NODE_ENV !== 'production'
                        ? {
                            debug: {
                                attemptId: effectiveAttemptId,
                                questionId,
                                errorCode,
                                errorMessage,
                            },
                        }
                        : {}),
                },
                { status: 500 }
            );
        }

        // Add rate limit headers to successful response
        const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SAVE_RESPONSE.limit);

        // Create proper JSON response with cookie mutations from res preserved
        const response = NextResponse.json({ success: true, data }, { status: 200 });
        Object.entries(successHeaders).forEach(([k, v]) => response.headers.set(k, String(v)));
        // Copy any auth cookies set by supabase SSR
        res.cookies.getAll().forEach(cookie => {
            response.cookies.set(cookie.name, cookie.value);
        });

        return addVersionHeader(response);
    } catch {
        return addVersionHeader(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
    }
}
