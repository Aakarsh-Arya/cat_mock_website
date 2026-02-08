import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import { checkRateLimit, RATE_LIMITS, ipRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';
import { incrementMetric } from '@/lib/telemetry';

export async function GET(req: NextRequest) {
    incrementMetric('auth_callback');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown';
    const rateKey = ipRateLimitKey('auth_callback', ip);
    const rateResult = checkRateLimit(rateKey, RATE_LIMITS.AUTH);
    if (!rateResult.allowed) {
        incrementMetric('auth_callback_rate_limited');
        const errorUrl = new URL('/auth/sign-in', req.nextUrl.origin);
        errorUrl.searchParams.set('error', 'rate_limited');
        const response = NextResponse.redirect(errorUrl);
        const headers = getRateLimitHeaders(rateResult, RATE_LIMITS.AUTH.limit);
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        return response;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

    const redirectTo = req.nextUrl.searchParams.get('redirect_to') || '/dashboard';
    const requestOrigin = req.nextUrl.origin;
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    // Avoid cross-domain redirect (and cookie loss) if env is stale for this host.
    let baseUrl = requestOrigin;
    if (configuredSiteUrl) {
        try {
            const configuredOrigin = new URL(configuredSiteUrl).origin;
            if (configuredOrigin === requestOrigin) {
                baseUrl = configuredSiteUrl;
            }
        } catch {
            // Ignore invalid NEXT_PUBLIC_SITE_URL values.
        }
    }
    const finalUrl = new URL(redirectTo, baseUrl);
    const response = NextResponse.redirect(finalUrl);

    const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            getAll() {
                return req.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set({ name, value, ...options });
                });
            },
        },
    });

    // Exchange the auth code for a session and set cookies
    const code = req.nextUrl.searchParams.get('code');
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            incrementMetric('auth_callback_error');
            logger.error('Auth callback error', error.message, { redirectTo });
            const errorUrl = new URL('/auth/sign-in', req.nextUrl.origin);
            errorUrl.searchParams.set('error', 'auth_failed');
            return NextResponse.redirect(errorUrl);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user?.created_at) {
            const createdAtMs = Date.parse(user.created_at);
            if (Number.isFinite(createdAtMs) && Date.now() - createdAtMs < 5 * 60 * 1000) {
                incrementMetric('signup_detected');
            }
        }
    }

    return response;
}
