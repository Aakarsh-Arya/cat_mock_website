/**
 * @fileoverview Submit Exam API Route
 * @description Submits exam attempt and triggers scoring
 * @blueprint Security Audit - P0 Fix - Rate Limiting, Integrity & Session Locking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';
import { submitExam } from '@/features/exam-engine/lib/actions';
import { examLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { attemptId, sessionToken, force_resume, submissionId } = await req.json();
        if (!attemptId) {
            return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
        }

        const res = NextResponse.next();
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
        const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
        const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
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

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // P0 FIX: Rate limiting for submissions (strict - 5 per minute)
        const rateLimitKey = userRateLimitKey('submit', session.user.id);
        const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.SUBMIT_EXAM);

        if (!rateLimitResult.allowed) {
            const headers = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SUBMIT_EXAM.limit);
            return NextResponse.json(
                {
                    error: 'Too many submission attempts. Please wait before trying again.',
                    retryAfterSeconds: Math.ceil(rateLimitResult.retryAfterMs / 1000),
                },
                { status: 429, headers }
            );
        }

        // P0 FIX: Pre-validate session token before calling submitExam
        // This catches multi-device/tab attacks at the API layer
        if (sessionToken) {
            const { data: attempt } = await supabase
                .from('attempts')
                .select('session_token, last_activity_at')
                .eq('id', attemptId)
                .maybeSingle();

            if (attempt?.session_token && attempt.session_token !== sessionToken) {
                if (force_resume === true) {
                    const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                    const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;
                    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
                    const userAgent = req.headers.get('user-agent') ?? 'unknown';

                    if (isStale) {
                        examLogger.securityEvent('Force resume rejected (stale) (submit)', {
                            attemptId,
                            oldToken: attempt.session_token,
                            lastActivityAt: attempt.last_activity_at,
                            ip,
                            userAgent,
                        });
                        return NextResponse.json({
                            error: 'Force resume denied. Session is too old.',
                            code: 'FORCE_RESUME_STALE',
                        }, { status: 409 });
                    }

                    examLogger.securityEvent('Force resume: updating session token (submit)', {
                        attemptId,
                        oldToken: attempt.session_token,
                        ip,
                        userAgent,
                    });
                    await supabase
                        .from('attempts')
                        .update({ session_token: sessionToken })
                        .eq('id', attemptId);
                } else {
                    examLogger.securityEvent('Submit session mismatch', { attemptId });
                    return NextResponse.json({
                        error: 'Session conflict detected. This exam may be open in another tab or device.',
                        code: 'SESSION_CONFLICT',
                        canForceResume: true
                    }, { status: 409 });
                }
            }
        }

        // Use the server action which has full validation, timer checks, and scoring
        const result = await submitExam(attemptId, { sessionToken, force_resume, submissionId });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Add rate limit headers to successful response
        const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SUBMIT_EXAM.limit);
        return NextResponse.json({ success: true, ...result.data }, { headers: successHeaders });
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}
