/**
 * @fileoverview Submit Exam API Route
 * @description Submits exam attempt and triggers scoring
 * @blueprint Security Audit - P0 Fix - Rate Limiting, Integrity & Session Locking
 * @blueprint Phase 4 - Idempotent submit (duplicate calls return success)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';
import { submitExam } from '@/features/exam-engine/lib/actions';
import { examLogger } from '@/lib/logger';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import {
    isNonEmptyString,
    getSupabaseConfig,
    serverMisconfiguredResponse,
    addVersionHeader,
} from '../_utils/validation';

export async function POST(req: NextRequest) {
    const res = NextResponse.next();

    try {
        const { attemptId, sessionToken, force_resume, submissionId } = await req.json();

        if (!isNonEmptyString(attemptId)) {
            return addVersionHeader(NextResponse.json({ error: 'attemptId required' }, { status: 400 }));
        }

        // Attempt ID from body; also try to extract from Referer as a fallback.
        const referer = req.headers.get('referer') ?? '';
        let refererAttemptId: string | null = null;
        try {
            const path = new URL(referer).pathname;
            const parts = path.split('/');
            if (parts[1] === 'exam' && parts[2]) refererAttemptId = parts[2];
        } catch {
            // ignore malformed referer
        }

        console.log('SUBMIT_ATTEMPT_ID_RECEIVED:', attemptId, 'submissionId:', submissionId ?? 'none');
        if (refererAttemptId) {
            console.log('SUBMIT_REFERER_ATTEMPT_ID:', refererAttemptId);
        }

        const config = getSupabaseConfig();
        if (!config) {
            return addVersionHeader(serverMisconfiguredResponse());
        }

        const supabase = createServerClient(config.url, config.anonKey, {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookies.set({ name, value, ...options });
                    });
                },
            },
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const unauthorized = addVersionHeader(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
            res.cookies.getAll().forEach((cookie) => unauthorized.cookies.set(cookie));
            return unauthorized;
        }

        // P0 FIX: Rate limiting for submissions (strict - 5 per minute)
        const rateLimitKey = userRateLimitKey('submit', user.id);
        const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.SUBMIT_EXAM);

        if (!rateLimitResult.allowed) {
            const headers = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SUBMIT_EXAM.limit);
            return addVersionHeader(NextResponse.json(
                {
                    error: 'Too many submission attempts. Please wait before trying again.',
                    retryAfterSeconds: Math.ceil(rateLimitResult.retryAfterMs / 1000),
                },
                { status: 429, headers }
            ));
        }

        const adminClient = getServiceRoleClient();
        let { data: attempt, error: attemptError } = await adminClient
            .from('attempts')
            .select('id, user_id, status')
            .eq('id', attemptId)
            .maybeSingle();

        // If the schema doesn't have submission_id, avoid hard failure by retrying without it.
        if (attemptError?.code === '42703') {
            const retry = await adminClient
                .from('attempts')
                .select('id, user_id, status')
                .eq('id', attemptId)
                .maybeSingle();
            attempt = retry.data ?? attempt;
            attemptError = retry.error ?? null;
        }

        console.log('SUBMIT_ATTEMPT_QUERY_RESULT:', attempt);

        // Track the effective attemptId - may change if fallback or referer is used
        let effectiveAttemptId = attemptId;

        if (attemptError || !attempt) {
            const reason = attemptError
                ? `error:${attemptError.code ?? 'unknown'}`
                : 'no_rows';
            console.log('SUBMIT_ATTEMPT_QUERY_ERROR:', attemptError);
            console.log('SUBMIT_ATTEMPT_QUERY_REASON:', reason);

            // First, try referer attempt id (common mismatch when client has stale state)
            if (refererAttemptId && refererAttemptId !== attemptId) {
                const { data: refererAttempt, error: refererError } = await adminClient
                    .from('attempts')
                    .select('id, user_id, status')
                    .eq('id', refererAttemptId)
                    .maybeSingle();
                if (refererAttempt && !refererError) {
                    console.log('SUBMIT_REFERER_ATTEMPT_USED:', refererAttempt);
                    console.log('SUBMIT_REFERER_ID_PROMOTION:', `${attemptId} -> ${refererAttempt.id}`);
                    attempt = refererAttempt;
                    effectiveAttemptId = refererAttempt.id;
                }
            }

            if (!attempt) {
            const { data: fallbackAttempt, error: fallbackError } = await adminClient
                .from('attempts')
                .select('id, user_id, status')
                .eq('user_id', user.id)
                .eq('status', 'in_progress')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

                if (fallbackAttempt && !fallbackError) {
                    console.log('SUBMIT_FALLBACK_ATTEMPT_USED:', fallbackAttempt);
                    console.log('SUBMIT_FALLBACK_ID_PROMOTION:', `${attemptId} -> ${fallbackAttempt.id}`);
                    attempt = fallbackAttempt;
                    // CRITICAL FIX: Promote the fallback attempt ID for all downstream operations
                    effectiveAttemptId = fallbackAttempt.id;
                }
            }

            if (!attempt) {
                const { data: recentAttempts, error: recentError } = await adminClient
                    .from('attempts')
                    .select('id, status, user_id, paper_id, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);
                console.log('SUBMIT_RECENT_ATTEMPTS_FOR_USER:', recentAttempts ?? null, 'error:', recentError ?? null);
                console.log('API_SUBMIT_ATTEMPT_LOOKUP_FAILED', {
                    attemptId,
                    userId: user.id,
                    status: null,
                    errorCode: attemptError?.code ?? null,
                    errorMessage: attemptError?.message ?? 'Attempt not found',
                });
                const notFound = addVersionHeader(NextResponse.json(
                    {
                        error: 'Attempt not found',
                        code: 'ATTEMPT_NOT_FOUND',
                        ...(process.env.NODE_ENV !== 'production'
                            ? {
                                debug: {
                                    attemptId,
                                    refererAttemptId,
                                    userId: user.id,
                                    supabaseUrl: config.url,
                                    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
                                    attemptErrorCode: attemptError?.code ?? null,
                                    attemptErrorMessage: attemptError?.message ?? null,
                                    recentAttempts: recentAttempts ?? null,
                                },
                            }
                            : {}),
                    },
                    { status: 404 }
                ));
                res.cookies.getAll().forEach((cookie) => notFound.cookies.set(cookie));
                return notFound;
            }
        }

        if (attempt.user_id !== user.id) {
            const forbidden = addVersionHeader(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
            res.cookies.getAll().forEach((cookie) => forbidden.cookies.set(cookie));
            return forbidden;
        }

        // IDEMPOTENT: If already submitted, return success (don't error on retries)
        if (attempt.status === 'completed' || attempt.status === 'submitted') {
            console.log('SUBMIT_ALREADY_COMPLETED:', effectiveAttemptId, 'status:', attempt.status);
            const already = addVersionHeader(NextResponse.json({ success: true, already_submitted: true }, { status: 200 }));
            res.cookies.getAll().forEach((cookie) => already.cookies.set(cookie));
            return already;
        }

        if (attempt.status !== 'in_progress') {
            console.log('API_SUBMIT_ATTEMPT_STATUS_MISMATCH', {
                attemptId: effectiveAttemptId,
                userId: user.id,
                status: attempt.status,
                errorCode: 'INVALID_ATTEMPT_STATUS',
                errorMessage: 'Attempt is not in progress',
            });
            const invalidStatus = addVersionHeader(NextResponse.json(
                { error: 'Attempt is not in progress', code: 'INVALID_ATTEMPT_STATUS' },
                { status: 409 }
            ));
            res.cookies.getAll().forEach((cookie) => invalidStatus.cookies.set(cookie));
            return invalidStatus;
        }

        // P0 FIX: Pre-validate session token before calling submitExam
        // This catches multi-device/tab attacks at the API layer
        if (!sessionToken) {
            return addVersionHeader(NextResponse.json({ error: 'Missing session token' }, { status: 400 }));
        }

        const { data: isValidSession, error: validateError } = await supabase
            .rpc('validate_session_token', {
                p_attempt_id: effectiveAttemptId,
                p_session_token: sessionToken,
                p_user_id: user.id,
                // Disambiguate overloaded RPC (uuid vs text signature)
                p_force_resume: false,
            });

        if (validateError) {
            examLogger.securityEvent('Session validation RPC error', {
                attemptId: effectiveAttemptId,
                errorMessage: validateError.message,
                errorCode: validateError.code,
            });
            // If RPC error and force_resume is set, try to proceed with force resume
            if (force_resume === true) {
                const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
                const userAgent = req.headers.get('user-agent') ?? 'unknown';

                examLogger.securityEvent('Force resume on RPC error (submit)', {
                    attemptId: effectiveAttemptId,
                    ip,
                    userAgent,
                });

                const { error: forceResumeError } = await supabase
                    .rpc('force_resume_exam_session', {
                        p_attempt_id: effectiveAttemptId,
                        p_new_session_token: sessionToken,
                    });

                if (!forceResumeError) {
                    // Force resume succeeded, continue with submit
                    const result = await submitExam(effectiveAttemptId, { sessionToken, force_resume: true, submissionId });
                    if (!result.success) {
                        return addVersionHeader(NextResponse.json({ error: result.error }, { status: 400 }));
                    }
                    const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SUBMIT_EXAM.limit);
                    const success = addVersionHeader(NextResponse.json({ success: true, ...result.data }, { headers: successHeaders }));
                    res.cookies.getAll().forEach((cookie) => success.cookies.set(cookie));
                    return success;
                }
            }
            return addVersionHeader(NextResponse.json({ error: 'Failed to validate session', code: 'VALIDATION_RPC_ERROR' }, { status: 500 }));
        }

        if (!isValidSession) {
            if (force_resume === true) {
                const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
                const userAgent = req.headers.get('user-agent') ?? 'unknown';

                examLogger.securityEvent('Force resume (submit)', {
                    attemptId: effectiveAttemptId,
                    ip,
                    userAgent,
                });

                const { error: forceResumeError } = await supabase
                    .rpc('force_resume_exam_session', {
                        p_attempt_id: effectiveAttemptId,
                        p_new_session_token: sessionToken,
                    });

                if (forceResumeError) {
                    if (forceResumeError.message?.includes('FORCE_RESUME_STALE') || forceResumeError.message?.includes('stale')) {
                        return addVersionHeader(NextResponse.json({
                            error: 'Force resume denied. Session is too old.',
                            code: 'FORCE_RESUME_STALE',
                        }, { status: 409 }));
                    }

                    return addVersionHeader(NextResponse.json({ error: 'Failed to force resume session' }, { status: 500 }));
                }
            } else {
                examLogger.securityEvent('Submit session mismatch', { attemptId: effectiveAttemptId });
                return addVersionHeader(NextResponse.json({
                    error: 'Session conflict detected. This exam may be open in another tab or device.',
                    code: 'SESSION_CONFLICT',
                    canForceResume: true
                }, { status: 409 }));
            }
        }

        // Use the server action which has full validation, timer checks, and scoring
        const result = await submitExam(effectiveAttemptId, { sessionToken, force_resume, submissionId });

        if (!result.success) {
            // Phase 1: Include code for SESSION_CONFLICT so client can handle it
            const isConflict = result.error === 'SESSION_CONFLICT' || result.error?.includes('session');
            const failure = addVersionHeader(NextResponse.json(
                {
                    error: result.error,
                    code: isConflict ? 'SESSION_CONFLICT' : undefined,
                    canForceResume: isConflict
                },
                { status: isConflict ? 409 : 400 }
            ));
            res.cookies.getAll().forEach((cookie) => failure.cookies.set(cookie));
            return failure;
        }

        // Add rate limit headers to successful response
        const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SUBMIT_EXAM.limit);
        const success = addVersionHeader(NextResponse.json({ success: true, ...result.data }, { headers: successHeaders }));
        res.cookies.getAll().forEach((cookie) => success.cookies.set(cookie));
        return success;
    } catch {
        return addVersionHeader(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
    }
}
