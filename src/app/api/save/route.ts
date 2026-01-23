/**
 * @fileoverview Save Response API Route
 * @description Saves user's answer to a question during exam
 * @blueprint Security Audit - P0 Fix - Rate Limiting, Session Locking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';
import { examLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { attemptId, questionId, answer, sessionToken, force_resume } = await req.json();
        if (!attemptId || !questionId) {
            return NextResponse.json({ error: 'attemptId and questionId required' }, { status: 400 });
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

        // Ensure the attempt belongs to the user
        const { data: attempt } = await supabase
            .from('attempts')
            .select('id, user_id, status, session_token, started_at, last_activity_at, paper_id')
            .eq('id', attemptId)
            .maybeSingle();

        if (!attempt || attempt.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // P0 FIX: Don't allow saves on completed/submitted attempts
        if (attempt.status !== 'in_progress') {
            return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
        }

        // P0 FIX: Session token validation (multi-device/tab prevention)
        // If session token is provided and attempt has one, validate they match
        if (attempt.session_token && sessionToken && attempt.session_token !== sessionToken) {
            // Allow force_resume to recover from browser crash/tab close
            if (force_resume === true) {
                const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;
                const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
                const userAgent = req.headers.get('user-agent') ?? 'unknown';

                if (isStale) {
                    examLogger.securityEvent('Force resume rejected (stale)', {
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

                examLogger.securityEvent('Force resume: updating session token', {
                    attemptId,
                    oldToken: attempt.session_token,
                    newToken: sessionToken,
                    ip,
                    userAgent,
                });
                await supabase
                    .from('attempts')
                    .update({ session_token: sessionToken })
                    .eq('id', attemptId);
            } else {
                examLogger.securityEvent('Save session token mismatch', { attemptId, expected: attempt.session_token });
                return NextResponse.json({
                    error: 'Session conflict detected. This exam may be open in another tab or device.',
                    code: 'SESSION_CONFLICT',
                    canForceResume: true
                }, { status: 409 });
            }
        }

        // P0 FIX: Server-side section timer validation
        // Check if too much time has elapsed since exam started (dynamic per paper)
        if (attempt.started_at) {
            const { data: paperTiming } = await supabase
                .from('papers')
                .select('sections')
                .eq('id', attempt.paper_id)
                .maybeSingle();

            const totalMinutes = (paperTiming?.sections || [])
                .reduce((sum: number, s: { time?: number }) => sum + (s.time || 0), 0);
            const maxDurationMs = Math.max(1, totalMinutes || 120) * 60 * 1000;
            const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes grace

            const startedAt = new Date(attempt.started_at).getTime();
            const elapsed = Date.now() - startedAt;

            if (elapsed > maxDurationMs + GRACE_PERIOD_MS) {
                return NextResponse.json({
                    error: 'Exam time has expired. Saves are no longer accepted.',
                    code: 'TIME_EXPIRED'
                }, { status: 400 });
            }
        }

        // Update last_activity_at for session tracking
        await supabase
            .from('attempts')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('id', attemptId);

        // Upsert response
        const { data, error } = await supabase
            .from('responses')
            .upsert({ attempt_id: attemptId, question_id: questionId, answer }, { onConflict: 'attempt_id,question_id' })
            .select('attempt_id, question_id, answer, updated_at')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add rate limit headers to successful response
        const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SAVE_RESPONSE.limit);
        return NextResponse.json({ success: true, data }, { headers: successHeaders });
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}
