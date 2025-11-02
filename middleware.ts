import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next({ request: { headers: req.headers } });

    try {
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

        // Refresh session cookies if needed
        await supabase.auth.getSession();

        const pathname = req.nextUrl.pathname;
        const isProtected = pathname.startsWith('/exam/') || pathname.startsWith('/result/') || pathname === '/dashboard';

        if (isProtected) {
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
        // Fail-open during debugging: don’t crash the whole app on middleware errors
        // eslint-disable-next-line no-console
        console.error('Middleware error', err);
        return res;
    }
}

export const config = {
    matcher: ['/exam/:path*', '/result/:path*', '/dashboard'],
};
