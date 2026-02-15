'use server';

import 'server-only';

/**
 * @fileoverview Admin Server Actions for Paper/Question Management
 * @description Uses service role key to bypass RLS for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { QuestionWithAnswer, QuestionContext, Paper, QuestionSet, SectionName } from '@/types/exam';

function normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
        return null;
    }
    return value === '' ? null : value;
}

function normalizeToppersApproach(
    solutionText: string | null | undefined,
    toppersApproach: string | null | undefined
): string | null {
    const normalizedSolution = normalizeOptionalText(solutionText);
    const normalizedToppers = normalizeOptionalText(toppersApproach);

    if (!normalizedToppers) {
        return null;
    }

    // Guard against duplicated content when the same text is pasted in both fields.
    if (normalizedSolution && normalizedSolution === normalizedToppers) {
        return null;
    }

    return normalizedToppers;
}

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

    if (error || !user) {
        // Try getSession as fallback
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            return { userId: session.user.id, email: session.user.email || '' };
        }
        throw new Error('Not authenticated');
    }

    // Check admin role - SKIP_ADMIN_CHECK only allowed in non-production (dev mode)
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

export async function updateQuestion(
    questionId: string,
    questionData: Partial<QuestionWithAnswer>
): Promise<{ success: boolean; data?: QuestionWithAnswer; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();
        const resolvedQuestionFormat = questionData.question_format ?? questionData.question_type;
        const normalizedSolutionText = normalizeOptionalText(questionData.solution_text ?? null);
        const normalizedToppersApproach = normalizeToppersApproach(
            questionData.solution_text ?? null,
            questionData.toppers_approach ?? null
        );
        const updatePayload = {
            question_number: questionData.question_number,
            question_text: questionData.question_text,
            question_type: questionData.question_type ?? resolvedQuestionFormat,
            question_format: resolvedQuestionFormat,
            taxonomy_type: questionData.taxonomy_type ?? null,
            topic_tag: questionData.topic_tag ?? null,
            difficulty_rationale: questionData.difficulty_rationale ?? null,
            options: questionData.options,
            correct_answer: questionData.correct_answer,
            positive_marks: questionData.positive_marks,
            negative_marks: questionData.negative_marks,
            solution_text: normalizedSolutionText,
            toppers_approach: normalizedToppersApproach,
            question_image_url: questionData.question_image_url ?? null,
            topic: questionData.topic ?? null,
            subtopic: questionData.subtopic ?? null,
            difficulty: questionData.difficulty ?? null,
            set_id: questionData.set_id ?? null,
            sequence_order: questionData.sequence_order ?? null,
            context_id: questionData.context_id ?? null,
            is_active: true,
            updated_at: new Date().toISOString(),
        };

        let { data, error } = await adminClient
            .from('questions')
            .update(updatePayload)
            .eq('id', questionId)
            .select()
            .single();

        // Migration compatibility: retry without new column when not yet applied.
        if (error?.code === '42703') {
            const fallbackPayload = { ...updatePayload } as Record<string, unknown>;
            delete fallbackPayload.toppers_approach;
            const fallback = await adminClient
                .from('questions')
                .update(fallbackPayload)
                .eq('id', questionId)
                .select()
                .single();
            data = fallback.data;
            error = fallback.error;
        }

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
        const resolvedQuestionFormat = questionData.question_format ?? questionData.question_type;
        const normalizedSolutionText = normalizeOptionalText(questionData.solution_text ?? null);
        const normalizedToppersApproach = normalizeToppersApproach(
            questionData.solution_text ?? null,
            questionData.toppers_approach ?? null
        );
        const insertPayload = {
            paper_id: questionData.paper_id,
            section: questionData.section,
            question_number: questionData.question_number,
            question_text: questionData.question_text,
            question_type: questionData.question_type ?? resolvedQuestionFormat,
            question_format: resolvedQuestionFormat,
            taxonomy_type: questionData.taxonomy_type ?? null,
            topic_tag: questionData.topic_tag ?? null,
            difficulty_rationale: questionData.difficulty_rationale ?? null,
            options: questionData.options,
            correct_answer: questionData.correct_answer,
            positive_marks: questionData.positive_marks ?? 3,
            negative_marks: questionData.negative_marks ?? 1,
            solution_text: normalizedSolutionText,
            toppers_approach: normalizedToppersApproach,
            question_image_url: questionData.question_image_url ?? null,
            topic: questionData.topic ?? null,
            subtopic: questionData.subtopic ?? null,
            difficulty: questionData.difficulty ?? null,
            set_id: questionData.set_id ?? null,
            sequence_order: questionData.sequence_order ?? null,
            context_id: questionData.context_id ?? null,
            is_active: true,
        };

        let { data, error } = await adminClient
            .from('questions')
            .insert(insertPayload)
            .select()
            .single();

        // Migration compatibility: retry without new column when not yet applied.
        if (error?.code === '42703') {
            const fallbackPayload = { ...insertPayload } as Record<string, unknown>;
            delete fallbackPayload.toppers_approach;
            const fallback = await adminClient
                .from('questions')
                .insert(fallbackPayload)
                .select()
                .single();
            data = fallback.data;
            error = fallback.error;
        }

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

export async function updateQuestionSet(
    questionSetId: string,
    setData: Partial<QuestionSet>
): Promise<{ success: boolean; data?: QuestionSet; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('question_sets')
            .update({
                context_title: setData.context_title,
                context_body: setData.context_body,
                context_image_url: setData.context_image_url,
                context_additional_images: setData.context_additional_images,
                content_layout: setData.content_layout,
                context_type: setData.context_type,
                updated_at: new Date().toISOString(),
            })
            .eq('id', questionSetId)
            .select()
            .single();

        if (error) {
            console.error('Admin updateQuestionSet error:', error);
            return { success: false, error: error.message || 'Failed to update question set' };
        }

        return { success: true, data: data as QuestionSet };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin updateQuestionSet exception:', message);
        return { success: false, error: message };
    }
}

export async function createQuestionSet(
    setData: Partial<QuestionSet>
): Promise<{ success: boolean; data?: QuestionSet; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('question_sets')
            .insert({
                paper_id: setData.paper_id,
                section: setData.section,
                set_type: setData.set_type,
                content_layout: setData.content_layout,
                context_type: setData.context_type ?? null,
                context_title: setData.context_title ?? null,
                context_body: setData.context_body ?? null,
                context_image_url: setData.context_image_url ?? null,
                context_additional_images: setData.context_additional_images ?? null,
                display_order: setData.display_order ?? 0,
                question_count: setData.question_count ?? 0,
                metadata: setData.metadata ?? {},
                is_active: true,
                is_published: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Admin createQuestionSet error:', error);
            return { success: false, error: error.message || 'Failed to create question set' };
        }

        return { success: true, data: data as QuestionSet };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin createQuestionSet exception:', message);
        return { success: false, error: message };
    }
}

export async function deleteContext(
    contextId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { error } = await adminClient
            .from('question_contexts')
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contextId);

        if (error) {
            console.error('Admin deleteContext error:', error);
            return { success: false, error: error.message || 'Failed to delete context' };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin deleteContext exception:', message);
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

        let { error } = await adminClient
            .from('papers')
            .update(paperData)
            .eq('id', paperId);

        if (error?.code === '42703') {
            const fallbackPayload = { ...paperData } as Record<string, unknown>;
            delete fallbackPayload.allow_sectional_attempts;
            delete fallbackPayload.sectional_allowed_sections;
            const retry = await adminClient
                .from('papers')
                .update(fallbackPayload)
                .eq('id', paperId);
            error = retry.error;
        }

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

export async function bulkRenameQuestionTaxonomy(input: {
    paperId: string;
    section?: SectionName | null;
    fromTopic?: string | null;
    toTopic?: string | null;
    fromSubtopic?: string | null;
    toSubtopic?: string | null;
}): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const paperId = input.paperId?.trim();
        if (!paperId) {
            return { success: false, error: 'Paper id is required.' };
        }

        const fromTopic = input.fromTopic?.trim() ?? '';
        const toTopic = input.toTopic?.trim() ?? '';
        const fromSubtopic = input.fromSubtopic?.trim() ?? '';
        const toSubtopic = input.toSubtopic?.trim() ?? '';

        const shouldRenameTopic = fromTopic.length > 0 && toTopic.length > 0 && fromTopic !== toTopic;
        const shouldRenameSubtopic = fromSubtopic.length > 0 && toSubtopic.length > 0 && fromSubtopic !== toSubtopic;

        if (!shouldRenameTopic && !shouldRenameSubtopic) {
            return {
                success: false,
                error: 'Provide valid source and target values for topic and/or subtopic.',
            };
        }

        const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };
        if (shouldRenameTopic) {
            updatePayload.topic = toTopic;
        }
        if (shouldRenameSubtopic) {
            updatePayload.subtopic = toSubtopic;
        }

        let query = adminClient
            .from('questions')
            .update(updatePayload)
            .eq('paper_id', paperId)
            .eq('is_active', true);

        if (input.section) {
            query = query.eq('section', input.section);
        }
        if (shouldRenameTopic) {
            query = query.eq('topic', fromTopic);
        }
        if (shouldRenameSubtopic) {
            query = query.eq('subtopic', fromSubtopic);
        }

        const { data, error } = await query.select('id');
        if (error) {
            return { success: false, error: error.message || 'Failed to rename taxonomy values' };
        }

        return { success: true, updatedCount: Array.isArray(data) ? data.length : 0 };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
    }
}
