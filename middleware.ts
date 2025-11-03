import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './src/utils/update-session';
import type { CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
    const res = await updateSession(req);

    try {
        const pathname = req.nextUrl.pathname;
        const isProtected = pathname.startsWith('/exam/') || pathname.startsWith('/result/') || pathname.startsWith('/dashboard');

        if (isProtected) {
            // Recreate a server client to read the user for gating (cookies copied on res)
            const { createServerClient } = await import('@supabase/ssr');
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

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                const redirect = new URL('/auth/sign-in', req.url);
                const returnTo = pathname + (req.nextUrl.search || '');
                redirect.searchParams.set('redirect_to', returnTo);
                return NextResponse.redirect(redirect);
            }
        }

        return res;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Middleware error', err);
        return res;
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/exam/:path*', '/result/:path*'],
};
