import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { updateAttemptProgress } from '@/features/exam-engine/lib/actions';
import { examLogger } from '@/lib/logger';
import {
    isNonEmptyString,
    isFiniteNumber,
    isValidTimeRemaining,
    getSupabaseConfig,
    serverMisconfiguredResponse,
    addVersionHeader,
} from '../_utils/validation';

export async function POST(req: NextRequest) {
    const res = NextResponse.next();

    try {
        const { attemptId, timeRemaining, currentSection, currentQuestion, sessionToken } = await req.json();

        if (!isNonEmptyString(attemptId)) {
            return addVersionHeader(NextResponse.json({ error: 'attemptId is required' }, { status: 400 }));
        }
        if (!isValidTimeRemaining(timeRemaining)) {
            return addVersionHeader(NextResponse.json({ error: 'timeRemaining is invalid' }, { status: 400 }));
        }
        if (!isNonEmptyString(currentSection)) {
            return addVersionHeader(NextResponse.json({ error: 'currentSection is required' }, { status: 400 }));
        }
        // CRITICAL: Use isFiniteNumber to correctly handle currentQuestion = 0
        if (!isFiniteNumber(currentQuestion)) {
            return addVersionHeader(NextResponse.json({ error: 'currentQuestion is invalid' }, { status: 400 }));
        }

        // Phase 4: Validate session token if provided (keeps heartbeat consistent)
        if (sessionToken) {
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
            if (user) {
                const { data: isValidSession } = await supabase.rpc('validate_session_token', {
                    p_attempt_id: attemptId,
                    p_session_token: sessionToken,
                    p_user_id: user.id,
                });

                if (isValidSession === false) {
                    console.log('API_PROGRESS_SESSION_MISMATCH', {
                        attemptId,
                        userId: user.id,
                        status: null,
                        errorCode: 'SESSION_CONFLICT',
                        errorMessage: 'Progress session mismatch',
                    });
                    examLogger.securityEvent('Progress session mismatch', { attemptId });
                    return addVersionHeader(NextResponse.json({
                        error: 'Session conflict detected',
                        code: 'SESSION_CONFLICT',
                        canForceResume: true,
                    }, { status: 409 }));
                }
            }
        }

        const result = await updateAttemptProgress({
            attemptId,
            timeRemaining,
            currentSection: currentSection as import('@/types/exam').SectionName,
            currentQuestion,
        });

        if (!result.success) {
            if (result.error === 'Authentication required' || result.error === 'Unauthorized') {
                return addVersionHeader(NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 }));
            }
            console.log('API_PROGRESS_UPDATE_FAILED', {
                attemptId,
                userId: null,
                status: null,
                errorCode: 'UPDATE_FAILED',
                errorMessage: result.error ?? 'Failed to update progress',
            });
            return addVersionHeader(NextResponse.json({ error: result.error || 'Failed to update progress' }, { status: 400 }));
        }

        const success = NextResponse.json({ success: true });
        res.cookies.getAll().forEach((cookie) => success.cookies.set(cookie));
        return addVersionHeader(success);
    } catch {
        return addVersionHeader(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
    }
}
