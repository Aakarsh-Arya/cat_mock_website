import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { ensureActiveAccess } from '@/lib/access-control';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey } from '@/lib/rate-limit';
import { incrementMetric } from '@/lib/telemetry';

type PageProps = {
    searchParams?: {
        redirect_to?: string;
        requested?: string;
        error?: string;
    };
};

async function requestAccess(formData: FormData) {
    'use server';

    const supabase = await sbSSR();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const redirectTo = typeof formData.get('redirect_to') === 'string'
        ? String(formData.get('redirect_to'))
        : '/dashboard';

    if (!user) {
        redirect(`/auth/sign-in?redirect_to=${encodeURIComponent('/coming-soon')}`);
    }

    const rateKey = userRateLimitKey('access_request', user.id);
    const rateResult = checkRateLimit(rateKey, RATE_LIMITS.ACCESS_REQUEST);
    if (!rateResult.allowed) {
        redirect('/coming-soon?error=rate_limited');
    }

    const { data: existing } = await supabase
        .from('access_requests')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!existing) {
        const email = user.email ?? '';
        if (!email) {
            redirect('/coming-soon?error=missing_email');
        }

        await supabase.from('access_requests').insert({
            user_id: user.id,
            email,
            status: 'pending',
            source: 'coming_soon',
        });

        incrementMetric('access_request_submitted');
    }

    const returnParam = redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/coming-soon?requested=1${returnParam}`);
}

export default async function ComingSoonPage({ searchParams }: PageProps) {
    const supabase = await sbSSR();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/sign-in?redirect_to=${encodeURIComponent('/coming-soon')}`);
    }

    const access = await ensureActiveAccess(supabase, user.id, user);
    const redirectTo = searchParams?.redirect_to ?? '/dashboard';

    if (access.isAdmin) {
        redirect('/dashboard');
    }

    if (access.allowed) {
        redirect(redirectTo);
    }

    const { data: request } = await supabase
        .from('access_requests')
        .select('id, status, created_at, decided_at')
        .eq('user_id', user.id)
        .maybeSingle();

    const statusLabel = access.status ?? 'pending';
    const requested = searchParams?.requested === '1';
    const error = searchParams?.error ?? null;

    return (
        <main style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
            <div style={{
                padding: 24,
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                background: '#fff',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)'
            }}>
                <h1 style={{ margin: 0, marginBottom: 8 }}>You are on the waitlist</h1>
                <p style={{ margin: 0, color: '#475569' }}>
                    We are rolling out access in phases. Your account is not active yet.
                </p>

                <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Access status</p>
                    <p style={{ margin: '6px 0 0', color: '#334155' }}>
                        {statusLabel === 'rejected'
                            ? 'Rejected'
                            : statusLabel === 'pending'
                                ? 'Pending review'
                                : 'Inactive'}
                    </p>
                    {request?.status && (
                        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                            Request status: {request.status}
                        </p>
                    )}
                </div>

                {error === 'missing_email' && (
                    <p style={{ color: 'crimson', marginTop: 16 }}>
                        We could not find an email for your account. Please re-authenticate and try again.
                    </p>
                )}
                {error === 'rate_limited' && (
                    <p style={{ color: 'crimson', marginTop: 16 }}>
                        Too many access requests. Please wait a minute and try again.
                    </p>
                )}

                {requested && (
                    <p style={{ marginTop: 16, color: '#0f766e' }}>
                        Access request received. We will notify you once it is approved.
                    </p>
                )}

                {!request && (
                    <form action={requestAccess} style={{ marginTop: 20 }}>
                        <input type="hidden" name="redirect_to" value={redirectTo} />
                        <button
                            type="submit"
                            style={{
                                padding: '10px 16px',
                                background: '#0f172a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Request access
                        </button>
                    </form>
                )}

                {request && (
                    <p style={{ marginTop: 16, color: '#64748b' }}>
                        You have already submitted a request. We will reach out as soon as we can.
                    </p>
                )}

                <div style={{ marginTop: 20 }}>
                    <Link href="/auth/logout" style={{ color: '#475569' }}>
                        Sign out
                    </Link>
                </div>
            </div>
        </main>
    );
}
