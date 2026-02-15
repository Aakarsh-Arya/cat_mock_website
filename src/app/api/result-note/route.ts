import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import {
    addVersionHeader,
    getSupabaseConfig,
    isNonEmptyString,
    serverMisconfiguredResponse,
} from '../_utils/validation';

const MAX_NOTE_WORDS = 50;

function clampUserNote(note: string): string {
    const trimmed = note.trim();
    if (!trimmed) return '';

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length <= MAX_NOTE_WORDS) return trimmed;
    return words.slice(0, MAX_NOTE_WORDS).join(' ');
}

function countWords(note: string): number {
    const trimmed = note.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest) {
    const res = NextResponse.next();

    try {
        const body = await req.json();
        const { attemptId, questionId, userNote } = body ?? {};

        if (!isNonEmptyString(attemptId)) {
            return addVersionHeader(NextResponse.json({ error: 'attemptId is required' }, { status: 400 }));
        }
        if (!isNonEmptyString(questionId)) {
            return addVersionHeader(NextResponse.json({ error: 'questionId is required' }, { status: 400 }));
        }
        if (typeof userNote !== 'string') {
            return addVersionHeader(NextResponse.json({ error: 'userNote must be a string' }, { status: 400 }));
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

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
            return addVersionHeader(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        }

        let adminClient: ReturnType<typeof getServiceRoleClient>;
        try {
            adminClient = getServiceRoleClient();
        } catch {
            return addVersionHeader(serverMisconfiguredResponse());
        }

        const { data: attempt, error: attemptError } = await adminClient
            .from('attempts')
            .select('id, user_id, status')
            .eq('id', attemptId)
            .maybeSingle();

        if (attemptError || !attempt) {
            return addVersionHeader(NextResponse.json({ error: 'Attempt not found' }, { status: 404 }));
        }
        if (attempt.user_id !== user.id) {
            return addVersionHeader(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
        }
        if (!['in_progress', 'paused', 'submitted', 'completed'].includes(attempt.status)) {
            return addVersionHeader(NextResponse.json({ error: 'Attempt is not editable' }, { status: 400 }));
        }

        const sanitizedNote = clampUserNote(userNote);
        const { data: updatedResponse, error: updateError } = await adminClient
            .from('responses')
            .update({ user_note: sanitizedNote })
            .eq('attempt_id', attemptId)
            .eq('question_id', questionId)
            .select('question_id, user_note')
            .maybeSingle();

        if (updateError) {
            return addVersionHeader(NextResponse.json({ error: 'Failed to update note' }, { status: 500 }));
        }
        if (!updatedResponse) {
            return addVersionHeader(NextResponse.json({ error: 'Response not found' }, { status: 404 }));
        }

        const success = NextResponse.json({
            success: true,
            data: {
                questionId: updatedResponse.question_id,
                userNote: updatedResponse.user_note ?? '',
                wordCount: countWords(updatedResponse.user_note ?? ''),
            },
        });
        res.cookies.getAll().forEach((cookie) => success.cookies.set(cookie));
        return addVersionHeader(success);
    } catch {
        return addVersionHeader(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
    }
}

