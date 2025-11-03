import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(req: NextRequest) {
    // Validate auth session and that user owns the attemptId; compute score server-side (stub)
    try {
        const { attemptId, responses, timeRemaining } = await req.json();
        if (!attemptId) {
            return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
        }
        const res = NextResponse.next();
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
        const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined;
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
        // Placeholder success response
        return NextResponse.json({ success: true, score: 0, accuracy: 0, echo: { attemptId, count: Array.isArray(responses) ? responses.length : 0, timeRemaining } });
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}
