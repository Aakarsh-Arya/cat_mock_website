import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { sbSSR } from '@/lib/supabase/server';
import { ensureActiveAccess } from '@/lib/access-control';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey } from '@/lib/rate-limit';
import { incrementMetric } from '@/lib/telemetry';

/**
 * Service-role client for access request cleanup.
 * Only used when RLS blocks the user from updating orphaned rows.
 */
function getServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

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
    const sessionUser = user ?? (await supabase.auth.getSession()).data.session?.user ?? null;

    const redirectTo = typeof formData.get('redirect_to') === 'string'
        ? String(formData.get('redirect_to'))
        : '/dashboard';

    if (!sessionUser) {
        redirect(`/auth/sign-in?redirect_to=${encodeURIComponent('/coming-soon')}`);
    }

    const rateKey = userRateLimitKey('access_request', sessionUser.id);
    const rateResult = checkRateLimit(rateKey, RATE_LIMITS.ACCESS_REQUEST);
    if (!rateResult.allowed) {
        redirect('/coming-soon?error=rate_limited');
    }

    const email = (sessionUser.email ?? '').trim().toLowerCase();
    if (!email) {
        redirect('/coming-soon?error=missing_email');
    }

    // ── Step 1: Check if this exact user already has a request ──────────
    const { data: existingByUser } = await supabase
        .from('access_requests')
        .select('id, status, user_id, email')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

    if (existingByUser) {
        // User already has a row – reset to pending if needed
        if (existingByUser.status !== 'pending') {
            const { error: updateError } = await supabase
                .from('access_requests')
                .update({
                    status: 'pending',
                    decided_by: null,
                    decided_at: null,
                    source: 'coming_soon',
                })
                .eq('id', existingByUser.id);

            if (updateError) {
                console.error('[RequestAccess] update own row failed', updateError.message);
                redirect('/coming-soon?error=request_failed');
            }
            incrementMetric('access_request_submitted');
        }
        // Already pending – no-op, just redirect to success
        const returnParam = redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : '';
        redirect(`/coming-soon?requested=1${returnParam}`);
    }

    // ── Step 2: Check for zombie row by email (orphaned from deleted user) ──
    // Use service-role client because RLS blocks users from reading/updating
    // rows where user_id IS NULL or belongs to a different auth user.
    const serviceClient = getServiceClient();

    if (serviceClient) {
        const { data: zombieRow } = await serviceClient
            .from('access_requests')
            .select('id, user_id')
            .ilike('email', email)
            .maybeSingle();

        if (zombieRow) {
            // Zombie found – reclaim it: update user_id + reset to pending
            const { error: reclaimError } = await serviceClient
                .from('access_requests')
                .update({
                    user_id: sessionUser.id,
                    email,
                    status: 'pending',
                    decided_by: null,
                    decided_at: null,
                    source: 'coming_soon',
                })
                .eq('id', zombieRow.id);

            if (reclaimError) {
                console.error('[RequestAccess] reclaim zombie row failed', reclaimError.message);
                redirect('/coming-soon?error=request_failed');
            }

            // Also reset user_access to pending for this user
            await serviceClient
                .from('user_access')
                .upsert(
                    { user_id: sessionUser.id, status: 'pending', source: 'reclaimed' },
                    { onConflict: 'user_id' }
                );

            incrementMetric('access_request_submitted');
            const returnParam = redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : '';
            redirect(`/coming-soon?requested=1${returnParam}`);
        }
    }

    // ── Step 3: No existing row – fresh insert ─────────────────────────
    const { error: insertError } = await supabase.from('access_requests').insert({
        user_id: sessionUser.id,
        email,
        status: 'pending',
        source: 'coming_soon',
    });

    if (insertError) {
        console.error('[RequestAccess] insert failed', insertError.message);

        // Last resort: email unique collision without service client
        // Try upsert via service client if available
        if (serviceClient && insertError.message?.includes('unique')) {
            const { error: upsertErr } = await serviceClient
                .from('access_requests')
                .upsert(
                    {
                        user_id: sessionUser.id,
                        email,
                        status: 'pending',
                        decided_by: null,
                        decided_at: null,
                        source: 'coming_soon',
                    },
                    { onConflict: 'user_id' }
                );
            if (upsertErr) {
                console.error('[RequestAccess] upsert fallback failed', upsertErr.message);
                redirect('/coming-soon?error=request_failed');
            }
        } else {
            redirect('/coming-soon?error=request_failed');
        }
    }

    incrementMetric('access_request_submitted');

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

                {error === 'request_failed' && (
                    <p style={{ color: 'crimson', marginTop: 16 }}>
                        We could not submit your request. Please try again.
                    </p>
                )}

                {requested && (
                    <p style={{ marginTop: 16, color: '#0f766e' }}>
                        Access request received. We will notify you once it is approved.
                    </p>
                )}

                {request?.status === 'rejected' && (
                    <p style={{ marginTop: 16, color: '#b45309' }}>
                        Your previous request was declined. You can request access again.
                    </p>
                )}

                {(!request || request.status === 'rejected') && (
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

                {request && request.status !== 'rejected' && (
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
