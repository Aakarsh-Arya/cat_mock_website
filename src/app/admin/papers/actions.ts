'use server';

import 'server-only';

/**
 * @fileoverview Admin Server Actions for Paper Management
 * @description Uses service role key to bypass RLS for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Create admin client with service role key (bypasses RLS)
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

// Create SSR client for server actions (must be async to get cookies)
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

// Verify the user is authenticated and is an admin
async function verifyAdmin(): Promise<{ userId: string; email: string }> {
    const supabase = await createActionClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            return { userId: session.user.id, email: session.user.email || '' };
        }
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

    return { userId: user.id, email: user.email || '' };
}

export async function deletePaper(paperId: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!paperId) {
            return { success: false, error: 'Paper id is required.' };
        }

        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data: attempts, error: attemptsLookupError } = await adminClient
            .from('attempts')
            .select('id')
            .eq('paper_id', paperId);

        if (attemptsLookupError) {
            return { success: false, error: attemptsLookupError.message || 'Failed to lookup attempts' };
        }

        const attemptIds = (attempts ?? []).map((attempt) => attempt.id).filter(Boolean);

        if (attemptIds.length > 0) {
            const { error: responsesError } = await adminClient
                .from('responses')
                .delete()
                .in('attempt_id', attemptIds);

            if (responsesError) {
                return { success: false, error: responsesError.message || 'Failed to delete responses' };
            }
        }

        // Delete dependent rows first (safe even with ON DELETE CASCADE)
        const { error: setsError } = await adminClient
            .from('question_sets')
            .delete()
            .eq('paper_id', paperId);

        if (setsError) {
            return { success: false, error: setsError.message || 'Failed to delete question sets' };
        }

        const { error: questionsError } = await adminClient
            .from('questions')
            .delete()
            .eq('paper_id', paperId);

        if (questionsError) {
            return { success: false, error: questionsError.message || 'Failed to delete questions' };
        }

        const { error: contextsError } = await adminClient
            .from('question_contexts')
            .delete()
            .eq('paper_id', paperId);

        if (contextsError) {
            return { success: false, error: contextsError.message || 'Failed to delete question contexts' };
        }

        const { error: attemptsError } = await adminClient
            .from('attempts')
            .delete()
            .eq('paper_id', paperId);

        if (attemptsError) {
            return { success: false, error: attemptsError.message || 'Failed to delete attempts' };
        }

        const { error } = await adminClient
            .from('papers')
            .delete()
            .eq('id', paperId);

        if (error) {
            return { success: false, error: error.message || 'Failed to delete paper' };
        }

        revalidatePath('/admin/papers');
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
    }
}
