import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import {
    isNonEmptyString,
    getSupabaseConfig,
    serverMisconfiguredResponse,
    addVersionHeader,
} from '../_utils/validation';

export async function POST(req: NextRequest) {
    const res = NextResponse.next();

    try {
        const { attemptId } = await req.json();

        if (!isNonEmptyString(attemptId)) {
            return addVersionHeader(NextResponse.json({ error: 'attemptId required' }, { status: 400 }));
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

        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('id, user_id, status, submitted_at, completed_at')
            .eq('id', attemptId)
            .maybeSingle();

        if (attemptError || !attempt) {
            return addVersionHeader(NextResponse.json({ error: 'Attempt not found' }, { status: 404 }));
        }

        if (attempt.user_id !== user.id) {
            return addVersionHeader(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
        }

        const success = NextResponse.json({
            success: true,
            data: {
                status: attempt.status,
                submitted_at: attempt.submitted_at ?? null,
                completed_at: attempt.completed_at ?? null,
            },
        });
        res.cookies.getAll().forEach((cookie) => success.cookies.set(cookie));
        return addVersionHeader(success);
    } catch {
        return addVersionHeader(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
    }
}
