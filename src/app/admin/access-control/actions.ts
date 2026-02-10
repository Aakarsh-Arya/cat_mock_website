'use server';

import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations require service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

async function createActionClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
    const cookieStore = await cookies();

    return createServerClient(url, anon, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Ignore - cookies can't be set in server actions during render
                }
            },
        },
    });
}

async function verifyAdmin(): Promise<{ userId: string }> {
    const supabase = await createActionClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('Not authenticated');
    }

    const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true' && process.env.NODE_ENV !== 'production';
    if (!skipAdminCheck) {
        const { data: { session } } = await supabase.auth.getSession();
        let role: string | null = session?.user?.app_metadata?.user_role ?? null;

        if (!role && session?.access_token) {
            try {
                const payload = JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString('utf-8')) as {
                    user_role?: string;
                    app_metadata?: { user_role?: string };
                };
                role = payload.user_role ?? payload.app_metadata?.user_role ?? null;
            } catch {
                role = null;
            }
        }

        if (role !== 'admin' && role !== 'dev') {
            const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
            if (rpcError || !isAdmin) {
                throw new Error('Unauthorized: Admin access required');
            }
        }
    }

    return { userId: user.id };
}

export async function updateSignupMode(formData: FormData): Promise<void> {
    try {
        const mode = String(formData.get('signup_mode') || '').toUpperCase();
        if (mode !== 'OPEN' && mode !== 'GATED') {
            console.warn('Invalid signup mode', mode);
            return;
        }

        const { userId } = await verifyAdmin();
        const adminClient = getAdminClient();

        const { error } = await adminClient
            .from('app_settings')
            .upsert(
                {
                    setting_key: 'signup_mode',
                    setting_value: mode,
                    updated_by: userId,
                },
                { onConflict: 'setting_key' }
            );

        if (error) {
            console.error('Failed to update signup mode', error.message);
            return;
        }

        revalidatePath('/admin/access-control');
        revalidatePath('/admin');
    } catch (err) {
        console.error('Failed to update signup mode', err);
    }
}

async function updateAccessRequest(
    requestId: string,
    userId: string | null,
    status: 'approved' | 'rejected'
): Promise<void> {
    try {
        const { userId: adminId } = await verifyAdmin();
        const adminClient = getAdminClient();

        const { data: requestRow, error: requestFetchError } = await adminClient
            .from('access_requests')
            .select('user_id, email')
            .eq('id', requestId)
            .maybeSingle();

        if (requestFetchError) {
            console.error('Failed to load access request details', requestFetchError.message);
        }

        const { error: requestError } = await adminClient
            .from('access_requests')
            .update({
                status,
                decided_by: adminId,
                decided_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (requestError) {
            console.error('Failed to update access request', requestError.message);
            return;
        }

        let resolvedUserId = userId ?? requestRow?.user_id ?? null;
        const requestEmail = requestRow?.email ?? null;

        if (!resolvedUserId && requestEmail) {
            // listUsers doesn't support email filter directly; iterate page 1
            const { data: listData, error: userError } =
                await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

            if (userError) {
                console.error('Failed to resolve user by email', userError.message);
            } else {
                const matched = listData?.users?.find(
                    (u) => u.email?.toLowerCase() === requestEmail.toLowerCase()
                );
                if (matched?.id) {
                    resolvedUserId = matched.id;
                }
            }
        }

        if (resolvedUserId && requestRow?.user_id !== resolvedUserId) {
            const { error: attachError } = await adminClient
                .from('access_requests')
                .update({ user_id: resolvedUserId })
                .eq('id', requestId);

            if (attachError) {
                console.error('Failed to attach user to access request', attachError.message);
            }
        }

        if (resolvedUserId) {
            const nextStatus = status === 'approved' ? 'active' : 'rejected';
            const { error: accessError } = await adminClient
                .from('user_access')
                .upsert(
                    {
                        user_id: resolvedUserId,
                        status: nextStatus,
                        decided_by: adminId,
                        decided_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id' }
                );

            if (accessError) {
                console.error('Failed to update user access', accessError.message);
                return;
            }
        } else {
            console.warn('Access request has no linked user_id; user_access not updated.');
        }

        revalidatePath('/admin/access-control');
        revalidatePath('/admin');
    } catch (err) {
        console.error('Failed to update access request', err);
    }
}

export async function approveAccessRequest(formData: FormData): Promise<void> {
    const requestId = String(formData.get('request_id') || '');
    const userId = formData.get('user_id') ? String(formData.get('user_id')) : null;
    if (!requestId) {
        console.warn('Missing request id for approval');
        return;
    }
    await updateAccessRequest(requestId, userId, 'approved');
}

export async function rejectAccessRequest(formData: FormData): Promise<void> {
    const requestId = String(formData.get('request_id') || '');
    const userId = formData.get('user_id') ? String(formData.get('user_id')) : null;
    if (!requestId) {
        console.warn('Missing request id for rejection');
        return;
    }
    await updateAccessRequest(requestId, userId, 'rejected');
}
