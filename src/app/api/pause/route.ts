import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { pauseExam } from '@/features/exam-engine/lib/actions';
import { examLogger } from '@/lib/logger';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
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

        // Phase 4: Validate session token if provided (keeps pause consistent with save/submit)
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
                    examLogger.securityEvent('Pause session mismatch', { attemptId });
                    return addVersionHeader(NextResponse.json({
                        error: 'Session conflict detected',
                        code: 'SESSION_CONFLICT',
                        canForceResume: true,
                    }, { status: 409 }));
                }
            }
        }

        let adminClient: ReturnType<typeof getServiceRoleClient>;
        try {
            adminClient = getServiceRoleClient();
        } catch {
            return addVersionHeader(serverMisconfiguredResponse());
        }
        const { data: attemptRow, error: attemptError } = await adminClient
            .from('attempts')
            .select('id, paper_id, papers(allow_pause)')
            .eq('id', attemptId)
            .maybeSingle();

        if (attemptError || !attemptRow) {
            return addVersionHeader(NextResponse.json({ error: 'Attempt not found' }, { status: 404 }));
        }

        const paperRel = attemptRow.papers as { allow_pause?: boolean } | { allow_pause?: boolean }[] | null;
        const allowPause = Array.isArray(paperRel) ? paperRel[0]?.allow_pause : paperRel?.allow_pause;

        if (allowPause === false) {
            return addVersionHeader(NextResponse.json({ error: 'Pausing not allowed for this exam' }, { status: 400 }));
        }

        const result = await pauseExam({
            attemptId,
            timeRemaining,
            currentSection: currentSection as import('@/types/exam').SectionName,
            currentQuestion,
        });

        if (!result.success) {
            return addVersionHeader(NextResponse.json({ error: result.error || 'Failed to pause exam' }, { status: 400 }));
        }

        const success = NextResponse.json({ success: true });
        res.cookies.getAll().forEach((cookie) => success.cookies.set(cookie));
        return addVersionHeader(success);
    } catch {
        return addVersionHeader(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
    }
}
