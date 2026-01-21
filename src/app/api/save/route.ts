/**
 * @fileoverview Save Response API Route
 * @description Saves user's answer to a question during exam
 * @blueprint Security Audit - P0 Fix - Rate Limiting, Session Locking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const { attemptId, questionId, answer, sessionToken } = await req.json();
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
            .select('id, user_id, status, session_token, started_at')
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
            console.warn(`Session token mismatch for attempt ${attemptId}: expected ${attempt.session_token}, got ${sessionToken}`);
            return NextResponse.json({
                error: 'Session conflict detected. This exam may be open in another tab or device.',
                code: 'SESSION_CONFLICT'
            }, { status: 409 });
        }

        // P0 FIX: Server-side section timer validation
        // Check if too much time has elapsed since exam started
        if (attempt.started_at) {
            const MAX_EXAM_DURATION_MS = 3 * 40 * 60 * 1000; // 120 minutes
            const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes grace
            const startedAt = new Date(attempt.started_at).getTime();
            const elapsed = Date.now() - startedAt;

            if (elapsed > MAX_EXAM_DURATION_MS + GRACE_PERIOD_MS) {
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
