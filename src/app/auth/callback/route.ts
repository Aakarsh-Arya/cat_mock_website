import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(req: NextRequest) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

    const redirectTo = req.nextUrl.searchParams.get('redirect_to') || '/dashboard';
    const finalUrl = new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin);
    const response = NextResponse.redirect(finalUrl);

    const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            get(name: string) {
                return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
                response.cookies.set({ name, value: '', ...options });
            },
        },
    });

    // Exchange the auth code for a session and set cookies
    const code = req.nextUrl.searchParams.get('code');
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            console.error('Auth callback error:', error.message);
            const errorUrl = new URL('/auth/sign-in', req.nextUrl.origin);
            errorUrl.searchParams.set('error', 'auth_failed');
            return NextResponse.redirect(errorUrl);
        }
    }

    return response;
}
