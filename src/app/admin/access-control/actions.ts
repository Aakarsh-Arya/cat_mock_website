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

export async function updateSignupMode(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const mode = String(formData.get('signup_mode') || '').toUpperCase();
        if (mode !== 'OPEN' && mode !== 'GATED') {
            return { success: false, error: 'Invalid signup mode' };
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
            return { success: false, error: error.message || 'Failed to update signup mode' };
        }

        revalidatePath('/admin/access-control');
        revalidatePath('/admin');
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
    }
}

async function updateAccessRequest(
    requestId: string,
    userId: string | null,
    status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { userId: adminId } = await verifyAdmin();
        const adminClient = getAdminClient();

        const { error: requestError } = await adminClient
            .from('access_requests')
            .update({
                status,
                decided_by: adminId,
                decided_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (requestError) {
            return { success: false, error: requestError.message || 'Failed to update request' };
        }

        if (userId) {
            const nextStatus = status === 'approved' ? 'active' : 'rejected';
            const { error: accessError } = await adminClient
                .from('user_access')
                .upsert(
                    {
                        user_id: userId,
                        status: nextStatus,
                        decided_by: adminId,
                        decided_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id' }
                );

            if (accessError) {
                return { success: false, error: accessError.message || 'Failed to update user access' };
            }
        }

        revalidatePath('/admin/access-control');
        revalidatePath('/admin');
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
    }
}

export async function approveAccessRequest(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const requestId = String(formData.get('request_id') || '');
    const userId = formData.get('user_id') ? String(formData.get('user_id')) : null;
    if (!requestId) return { success: false, error: 'Missing request id' };
    return updateAccessRequest(requestId, userId, 'approved');
}

export async function rejectAccessRequest(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const requestId = String(formData.get('request_id') || '');
    const userId = formData.get('user_id') ? String(formData.get('user_id')) : null;
    if (!requestId) return { success: false, error: 'Missing request id' };
    return updateAccessRequest(requestId, userId, 'rejected');
}
