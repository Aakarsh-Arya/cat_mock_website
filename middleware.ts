/**
 * @fileoverview Next.js Middleware
 * @description Auth session management and security headers
 * @blueprint Security Audit - P0 Fix - Security Headers
 * 
 * CRITICAL FIX (2026-02-02): 
 * - Avoid double Supabase client creation (was causing cookie race conditions)
 * - Skip session refresh for API routes (they handle their own auth)
 * - Single client instance for protected route checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { fetchAccessStatus, resolveIsAdmin } from '@/lib/access-control';
import { incrementMetric } from '@/lib/telemetry';

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

/**
 * Get Supabase configuration from environment
 */
function getSupabaseConfig(): { url: string; anonKey: string } | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.error('Middleware: Missing Supabase configuration');
        return null;
    }

    return { url, anonKey };
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // =========================================================================
    // API ROUTES: Skip middleware auth entirely - APIs handle their own auth
    // This prevents token refresh race conditions during exam submit
    // =========================================================================
    if (pathname.startsWith('/api/')) {
        const res = NextResponse.next({ request: { headers: req.headers } });
        applySecurityHeaders(res);
        return res;
    }

    // =========================================================================
    // PAGE ROUTES: Handle session refresh and protection
    // =========================================================================

    // Create response object
    const res = NextResponse.next({ request: { headers: req.headers } });
    applySecurityHeaders(res);

    // Block test login in production
    if (pathname.startsWith('/auth/test-login') && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }

    // Determine if route needs protection
    const isProtected = pathname.startsWith('/exam/') ||
        pathname.startsWith('/result/') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/mocks') ||
        pathname.startsWith('/mock/');
    const isAdminRoute = pathname.startsWith('/admin');

    // Only create Supabase client if we need to check auth
    if (!isProtected && !isAdminRoute) {
        return res;
    }

    // Get Supabase config
    const config = getSupabaseConfig();
    if (!config) {
        // Allow request to proceed - let page handle the error
        return res;
    }

    try {
        // Create SINGLE Supabase client for this request
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

        // Get user (this also refreshes session if needed)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            // Not authenticated - redirect to sign in
            const redirect = new URL('/auth/sign-in', req.url);
            const returnTo = pathname + (req.nextUrl.search || '');
            redirect.searchParams.set('redirect_to', returnTo);
            return NextResponse.redirect(redirect);
        }

        const env = process.env.NODE_ENV;
        const skipAdminCheck =
            process.env.SKIP_ADMIN_CHECK === 'true' && (env === 'development' || env === 'test');

        const isAdmin = skipAdminCheck ? true : await resolveIsAdmin(supabase, user);

        // Admin routes require admin role
        if (isAdminRoute && !skipAdminCheck && !isAdmin) {
            const redirect = new URL('/dashboard', req.url);
            redirect.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(redirect);
        }

        // Access gating for protected routes (non-admins only)
        if (isProtected && !isAdmin) {
            const accessStatus = await fetchAccessStatus(supabase, user.id);
            if (accessStatus !== 'active') {
                const redirect = new URL('/coming-soon', req.url);
                const returnTo = pathname + (req.nextUrl.search || '');
                redirect.searchParams.set('redirect_to', returnTo);
                return NextResponse.redirect(redirect);
            }
        }

        return res;
    } catch (err) {
        console.error('Middleware error:', err);
        incrementMetric('middleware_error');
        // On error, allow request to proceed - let page handle the error
        return res;
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/exam/:path*',
        '/result/:path*',
        '/mocks/:path*',
        '/mock/:path*',
        '/admin/:path*',
        '/coming-soon',
        '/auth/test-login',
        // API routes included only for security headers - auth skipped
        '/api/:path*',
    ],
};
