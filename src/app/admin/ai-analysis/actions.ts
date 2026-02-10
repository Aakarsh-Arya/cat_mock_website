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

export async function saveNexAIInsightText(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        await verifyAdmin();

        const attemptId = String(formData.get('attempt_id') || '').trim();
        const insightTextRaw = String(formData.get('insight_text') || '');
        const insightText = insightTextRaw.trim();

        if (!attemptId) {
            return { success: false, error: 'Attempt ID is required.' };
        }

        if (insightText.length > 100000) {
            return { success: false, error: 'Insight text is too long (max 100000 characters).' };
        }

        const admin = getAdminClient();
        const updatePayload: Record<string, unknown> = {
            ai_analysis_result_text: insightText || null,
            ai_analysis_status: insightText ? 'processed' : 'requested',
            ai_analysis_processed_at: insightText ? new Date().toISOString() : null,
            ai_analysis_error: null,
        };

        const { error } = await admin
            .from('attempts')
            .update(updatePayload)
            .eq('id', attemptId);

        if (error) {
            return { success: false, error: error.message || 'Failed to save insight text.' };
        }

        revalidatePath('/admin/ai-analysis');
        revalidatePath(`/result/${attemptId}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unexpected error while saving insight text.',
        };
    }
}

