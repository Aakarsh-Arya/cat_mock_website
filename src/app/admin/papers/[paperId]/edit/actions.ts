'use server';

/**
 * @fileoverview Admin Server Actions for Paper/Question Management
 * @description Uses service role key to bypass RLS for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { QuestionWithAnswer, QuestionContext, Paper } from '@/types/exam';

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
    // Use action-specific SSR client
    const supabase = await createActionClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log('[verifyAdmin] getUser result:', { user: user?.email, error: error?.message });

    if (error || !user) {
        // Try getSession as fallback
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[verifyAdmin] getSession fallback:', { session: !!session, user: session?.user?.email });

        if (session?.user) {
            return { userId: session.user.id, email: session.user.email || '' };
        }
        throw new Error('Not authenticated');
    }

    // Check admin role - skip check if SKIP_ADMIN_CHECK is set (dev mode)
    if (process.env.SKIP_ADMIN_CHECK !== 'true') {
        const isAdmin = user.email?.includes('@admin') ||
            user.app_metadata?.role === 'admin' ||
            user.user_metadata?.role === 'admin';

        if (!isAdmin) {
            throw new Error('Unauthorized: Admin access required');
        }
    }

    return { userId: user.id, email: user.email || '' };
}

export async function updateQuestion(
    questionId: string,
    questionData: Partial<QuestionWithAnswer>
): Promise<{ success: boolean; data?: QuestionWithAnswer; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('questions')
            .update({
                question_text: questionData.question_text,
                question_type: questionData.question_type,
                options: questionData.options,
                correct_answer: questionData.correct_answer,
                positive_marks: questionData.positive_marks,
                negative_marks: questionData.negative_marks,
                solution_text: questionData.solution_text,
                question_image_url: questionData.question_image_url,
                topic: questionData.topic,
                difficulty: questionData.difficulty,
                context_id: questionData.context_id,
                is_active: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', questionId)
            .select()
            .single();

        if (error) {
            console.error('Admin updateQuestion error:', error);
            return { success: false, error: error.message || 'Failed to update question' };
        }

        return { success: true, data: data as QuestionWithAnswer };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin updateQuestion exception:', message);
        return { success: false, error: message };
    }
}

export async function createQuestion(
    questionData: Partial<QuestionWithAnswer>
): Promise<{ success: boolean; data?: QuestionWithAnswer; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('questions')
            .insert({
                paper_id: questionData.paper_id,
                section: questionData.section,
                question_number: questionData.question_number,
                question_text: questionData.question_text,
                question_type: questionData.question_type,
                options: questionData.options,
                correct_answer: questionData.correct_answer,
                positive_marks: questionData.positive_marks ?? 3,
                negative_marks: questionData.negative_marks ?? 1,
                solution_text: questionData.solution_text,
                question_image_url: questionData.question_image_url,
                topic: questionData.topic,
                difficulty: questionData.difficulty,
                context_id: questionData.context_id,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Admin createQuestion error:', error);
            return { success: false, error: error.message || 'Failed to create question' };
        }

        return { success: true, data: data as QuestionWithAnswer };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin createQuestion exception:', message);
        return { success: false, error: message };
    }
}

export async function updateContext(
    contextId: string,
    contextData: Partial<QuestionContext>
): Promise<{ success: boolean; data?: QuestionContext; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('question_contexts')
            .update({
                title: contextData.title,
                content: contextData.content,
                context_type: contextData.context_type,
                image_url: contextData.image_url,
                is_active: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contextId)
            .select()
            .single();

        if (error) {
            console.error('Admin updateContext error:', error);
            return { success: false, error: error.message || 'Failed to update context' };
        }

        return { success: true, data: data as QuestionContext };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin updateContext exception:', message);
        return { success: false, error: message };
    }
}

export async function createContext(
    contextData: Partial<QuestionContext>,
    displayOrder: number
): Promise<{ success: boolean; data?: QuestionContext; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('question_contexts')
            .insert({
                paper_id: contextData.paper_id,
                section: contextData.section,
                title: contextData.title,
                content: contextData.content,
                context_type: contextData.context_type ?? 'passage',
                image_url: contextData.image_url,
                display_order: displayOrder,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Admin createContext error:', error);
            return { success: false, error: error.message || 'Failed to create context' };
        }

        return { success: true, data: data as QuestionContext };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin createContext exception:', message);
        return { success: false, error: message };
    }
}

export async function updatePaper(
    paperId: string,
    paperData: Partial<Paper>
): Promise<{ success: boolean; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { error } = await adminClient
            .from('papers')
            .update(paperData)
            .eq('id', paperId);

        if (error) {
            console.error('Admin updatePaper error:', error);
            return { success: false, error: error.message || 'Failed to update paper' };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin updatePaper exception:', message);
        return { success: false, error: message };
    }
}
