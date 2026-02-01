import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Keeps Supabase auth cookies fresh during SSR/middleware and returns a response to continue.
export async function updateSession(req: NextRequest) {
    const res = NextResponse.next({ request: { headers: req.headers } });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

    const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
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

    // Touch the auth session to ensure cookies are refreshed when needed
    await supabase.auth.getSession();

    return res;
}
