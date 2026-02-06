/**
 * @fileoverview Admin Paper Preview Page
 * @description Preview the exam as a student would see it (read-only mode)
 * @blueprint Admin can test paper view without creating an attempt
 */

import 'server-only';

import { notFound, redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { PreviewClient } from './PreviewClient';
import type { Paper, QuestionSetComplete, SectionName, QuestionSetType, ContentLayoutType, Question, QuestionType } from '@/types/exam';
import { assemblePaper } from '@/features/exam-engine/lib/assemblePaper';

interface PageProps {
    params: Promise<{ paperId: string }>;
}

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin preview requires service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export default async function AdminPaperPreviewPage({ params }: PageProps) {
    const { paperId } = await params;
    const supabase = await sbSSR();

    // Server-side admin verification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/auth/sign-in');
    }

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

    let isAdmin = role === 'admin' || role === 'dev';

    if (!isAdmin) {
        const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
        isAdmin = !rpcError && Boolean(isAdminRpc);
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    // Fetch paper
    const adminClient = getAdminClient();
    const { data: paperData, error: paperError } = await adminClient
        .from('papers')
        .select('*')
        .eq('id', paperId)
        .single();

    if (paperError || !paperData) {
        notFound();
    }

    // Fetch question sets with questions
    const { data: questionSetsView } = await adminClient
        .from('question_sets_with_questions')
        .select('*')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

    // Transform to QuestionSetComplete
    const rawQuestionSets: QuestionSetComplete[] = (questionSetsView ?? []).map((row) => ({
        id: row.id,
        paper_id: row.paper_id,
        section: row.section as SectionName,
        set_type: row.set_type as QuestionSetType,
        content_layout: row.content_layout as ContentLayoutType,
        context_title: row.context_title ?? undefined,
        context_body: row.context_body ?? undefined,
        context_image_url: row.context_image_url ?? undefined,
        context_additional_images: Array.isArray(row.context_additional_images)
            ? (row.context_additional_images as QuestionSetComplete['context_additional_images'])
            : [],
        display_order: row.display_order,
        question_count: row.question_count,
        metadata: row.metadata ?? {},
        is_active: row.is_active,
        is_published: row.is_published,
        created_at: row.created_at,
        updated_at: row.updated_at,
        questions: (row.questions ?? []).map((q: {
            id: string;
            question_text: string;
            question_type: string;
            options: unknown;
            positive_marks: number;
            negative_marks: number;
            question_number: number;
            sequence_order: number | null;
            question_image_url?: string | null;
            difficulty?: string | null;
            topic?: string | null;
            subtopic?: string | null;
            is_active: boolean;
        }, index: number) => ({
            id: q.id,
            set_id: row.id,
            paper_id: row.paper_id,
            section: row.section as SectionName,
            sequence_order: q.sequence_order ?? index + 1,
            question_number: q.question_number,
            question_text: q.question_text,
            question_type: q.question_type as QuestionType,
            options: q.options as Question['options'],
            positive_marks: q.positive_marks,
            negative_marks: q.negative_marks,
            question_image_url: q.question_image_url ?? undefined,
            difficulty: q.difficulty as Question['difficulty'],
            topic: q.topic ?? undefined,
            subtopic: q.subtopic ?? undefined,
            is_active: q.is_active,
        })),
    }));

    const { questionSets } = assemblePaper(rawQuestionSets);

    if (process.env.NODE_ENV !== 'production') {
        const seen = new Set<string>();
        const duplicates = new Set<string>();
        const mismatches: Array<{ setId: string; questionId: string }> = [];

        questionSets.forEach((set) => {
            set.questions.forEach((q) => {
                if (seen.has(q.id)) {
                    duplicates.add(q.id);
                } else {
                    seen.add(q.id);
                }

                if (q.section !== set.section || q.set_id !== set.id) {
                    mismatches.push({ setId: set.id, questionId: q.id });
                }
            });
        });

        if (duplicates.size > 0) {
            console.warn('[PreviewPage] Detected duplicate question ids in assembled question list', {
                duplicateIds: Array.from(duplicates),
            });
        }

        if (mismatches.length > 0) {
            console.warn('[PreviewPage] Navigation state invalid (section/q/set mismatch)', {
                mismatchCount: mismatches.length,
                sample: mismatches.slice(0, 5),
            });
        }
    }

    // Transform paper data
    const paper: Paper = {
        id: paperData.id,
        slug: paperData.slug,
        title: paperData.title,
        description: paperData.description ?? undefined,
        year: paperData.year,
        total_questions: paperData.total_questions,
        total_marks: paperData.total_marks,
        duration_minutes: paperData.duration_minutes,
        sections: paperData.sections,
        default_positive_marks: paperData.default_positive_marks,
        default_negative_marks: paperData.default_negative_marks,
        published: paperData.published,
        available_from: paperData.available_from ?? undefined,
        available_until: paperData.available_until ?? undefined,
        difficulty_level: paperData.difficulty_level as Paper['difficulty_level'],
        is_free: paperData.is_free,
        attempt_limit: paperData.attempt_limit ?? undefined,
        created_at: paperData.created_at,
        updated_at: paperData.updated_at,
    };

    return (
        <PreviewClient
            paper={paper}
            questionSets={questionSets}
        />
    );
}
