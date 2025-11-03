import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(req: NextRequest) {
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

    // Exchange the auth code for a session and set cookies (explicit code param)
    const code = req.nextUrl.searchParams.get('code');
    if (code) {
        await supabase.auth.exchangeCodeForSession(code);
    }

    const redirectTo = req.nextUrl.searchParams.get('redirect_to') || '/dashboard';
    const finalUrl = new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL || req.url);
    return NextResponse.redirect(finalUrl);
}
