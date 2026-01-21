/**
 * @fileoverview Next.js Middleware
 * @description Auth session management and security headers
 * @blueprint Security Audit - P0 Fix - Security Headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './src/utils/update-session';
import type { CookieOptions } from '@supabase/ssr';

/**
 * Apply security headers to response
 * @blueprint Security Audit - P0 Fix - Prevent clickjacking, XSS, MIME sniffing
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
    // Prevent MIME type sniffing
    res.headers.set('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking - only allow same origin framing
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Legacy XSS protection for older browsers
    res.headers.set('X-XSS-Protection', '1; mode=block');

    // Control referrer information sent with requests
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Prevent caching of sensitive pages (exam content)
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');

    return res;
}

export async function middleware(req: NextRequest) {
    const res = await updateSession(req);

    // Apply security headers to all matched routes
    applySecurityHeaders(res);

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
        console.error('Middleware error', err);
        return res;
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/exam/:path*', '/result/:path*'],
};
