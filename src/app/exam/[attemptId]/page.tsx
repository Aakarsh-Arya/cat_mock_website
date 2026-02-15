/**
 * @fileoverview Exam Page (Server Component)
 * @description Fetches exam data and renders the client-side exam interface
 * @blueprint Milestone 4 SOP-SSOT - Exam Engine
 */

import { sbSSR } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ExamClient } from '@/features/exam-engine/lib/ExamClient';
import { BackToDashboard } from '@/components/BackToDashboard';
import type {
    Paper,
    Question,
    Attempt,
    SectionConfig,
    QuestionSetComplete,
    QuestionSetMetadata,
    QuestionSetType,
    ContentLayoutType,
    QuestionType,
    SectionName,
    QuestionContext,
    Response,
} from '@/types/exam';
import { buildLegacyQuestionSets } from '@/utils/question-sets';
import { assemblePaper } from '@/features/exam-engine/lib/assemblePaper';
import { logger } from '@/lib/logger';

type PageProps = {
    params: { attemptId: string } | Promise<{ attemptId: string }>;
};

type PaperRow = {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    year: number;
    total_questions: number;
    total_marks: number;
    duration_minutes: number;
    sections: SectionConfig[];
    default_positive_marks: number;
    default_negative_marks: number;
    published: boolean;
    available_from?: string | null;
    available_until?: string | null;
    difficulty_level?: Paper['difficulty_level'] | null;
    is_free: boolean;
    attempt_limit?: number | null;
    allow_pause?: boolean | null;
    created_at: string;
    updated_at: string;
};

type ResponseRow = {
    id: string;
    attempt_id: string;
    question_id: string;
    answer: string | null;
    status: Response['status'];
    is_marked_for_review?: boolean | null;
    is_visited?: boolean | null;
    time_spent_seconds?: number | null;
    visit_count?: number | null;
    created_at: string;
    updated_at: string;
};

export default async function ExamPage({ params }: PageProps) {
    const { attemptId } = await params;

    if (!attemptId || typeof attemptId !== 'string') {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Attempt</h1>
                    <p className="text-gray-600 mb-6">The attempt id is missing or invalid.</p>
                    <BackToDashboard />
                </div>
            </main>
        );
    }

    const supabase = await sbSSR();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect(`/auth/sign-in?redirect_to=${encodeURIComponent(`/exam/${attemptId}`)}`);
    }

    const attemptSelect = `
            id, user_id, paper_id, status, started_at, submitted_at, completed_at,
            attempt_mode, sectional_section, current_section, current_question, time_remaining,
            total_score, correct_count, incorrect_count, unanswered_count,
            section_scores, percentile, rank, created_at, updated_at,
            papers (
                id, slug, title, description, year,
                total_questions, total_marks, duration_minutes, sections,
                default_positive_marks, default_negative_marks,
                published, available_from, available_until,
                difficulty_level, is_free, attempt_limit, allow_pause,
                created_at, updated_at
            )
        `;
    const initialAttemptResult = await supabase
        .from('attempts')
        .select(attemptSelect)
        .eq('id', attemptId)
        .single();

    let attemptData: ({
        id: string;
        user_id: string;
        paper_id: string;
        status: string;
        started_at: string;
        submitted_at: string | null;
        completed_at: string | null;
        attempt_mode?: string | null;
        sectional_section?: string | null;
        current_section: string;
        current_question: number | null;
        time_remaining: unknown;
        total_score: number | null;
        correct_count: number | null;
        incorrect_count: number | null;
        unanswered_count: number | null;
        section_scores: unknown;
        percentile: number | null;
        rank: number | null;
        created_at: string;
        updated_at: string;
        papers: unknown;
    } | null) = initialAttemptResult.data as unknown as {
        id: string;
        user_id: string;
        paper_id: string;
        status: string;
        started_at: string;
        submitted_at: string | null;
        completed_at: string | null;
        attempt_mode?: string | null;
        sectional_section?: string | null;
        current_section: string;
        current_question: number | null;
        time_remaining: unknown;
        total_score: number | null;
        correct_count: number | null;
        incorrect_count: number | null;
        unanswered_count: number | null;
        section_scores: unknown;
        percentile: number | null;
        rank: number | null;
        created_at: string;
        updated_at: string;
        papers: unknown;
    } | null;
    let attemptError = initialAttemptResult.error;

    if (initialAttemptResult.error?.code === '42703') {
        const fallbackSelect = `
            id, user_id, paper_id, status, started_at, submitted_at, completed_at,
            current_section, current_question, time_remaining,
            total_score, correct_count, incorrect_count, unanswered_count,
            section_scores, percentile, rank, created_at, updated_at,
            papers (
                id, slug, title, description, year,
                total_questions, total_marks, duration_minutes, sections,
                default_positive_marks, default_negative_marks,
                published, available_from, available_until,
                difficulty_level, is_free, attempt_limit, allow_pause,
                created_at, updated_at
            )
        `;
        const fallback = await supabase
            .from('attempts')
            .select(fallbackSelect)
            .eq('id', attemptId)
            .single();
        attemptData = fallback.data
            ? { ...fallback.data, attempt_mode: 'full', sectional_section: null }
            : null;
        attemptError = fallback.error;
    }

    if (attemptError || !attemptData) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Attempt Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This exam attempt does not exist or you don&apos;t have access to it.
                    </p>
                    <BackToDashboard />
                </div>
            </main>
        );
    }

    // Verify user owns this attempt
    if (attemptData.user_id !== user.id) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized</h1>
                    <p className="text-gray-600 mb-6">You don&apos;t have access to this exam attempt.</p>
                    <BackToDashboard />
                </div>
            </main>
        );
    }

    // Check if attempt is already completed
    if (attemptData.status === 'completed' || attemptData.status === 'submitted') {
        redirect(`/result/${attemptId}`);
    }

    // CRITICAL FIX: Allow both in_progress and paused attempts to continue
    // Paused exams should be resumable without showing "Attempt Not Available" error
    if (attemptData.status !== 'in_progress' && attemptData.status !== 'paused') {
        // Handle abandoned status with a clearer message
        const isAbandoned = attemptData.status === 'abandoned';
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        {isAbandoned ? 'Exam Session Ended' : 'Attempt Not Available'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {isAbandoned
                            ? 'This exam session has ended. If you believe this is an error, please contact support.'
                            : 'This exam attempt is not in progress and cannot be resumed.'}
                    </p>
                    <BackToDashboard />
                </div>
            </main>
        );
    }

    // Supabase can return a single relation as object OR array depending on relationship config.
    const paperRaw = attemptData.papers as unknown;
    const paperData =
        Array.isArray(paperRaw) && paperRaw.length > 0
            ? (paperRaw[0] as PaperRow | null)
            : (paperRaw as PaperRow | null);

    if (!paperData?.id) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Paper Not Found</h1>
                    <p className="text-gray-600 mb-6">This attempt is missing its paper data.</p>
                    <BackToDashboard />
                </div>
            </main>
        );
    }

    const paper: Paper = {
        id: paperData.id,
        slug: paperData.slug,
        title: paperData.title,
        description: paperData.description ?? undefined,
        year: paperData.year,
        total_questions: paperData.total_questions,
        total_marks: paperData.total_marks,
        duration_minutes: paperData.duration_minutes,
        sections: paperData.sections as SectionConfig[],
        default_positive_marks: paperData.default_positive_marks,
        default_negative_marks: paperData.default_negative_marks,
        published: paperData.published,
        available_from: paperData.available_from ?? undefined,
        available_until: paperData.available_until ?? undefined,
        difficulty_level: paperData.difficulty_level as Paper['difficulty_level'],
        is_free: paperData.is_free,
        attempt_limit: paperData.attempt_limit ?? undefined,
        allow_pause: paperData.allow_pause ?? true,
        created_at: paperData.created_at,
        updated_at: paperData.updated_at,
    };

    const attemptMode = (attemptData.attempt_mode as Attempt['attempt_mode']) ?? 'full';
    const sectionalAttemptSection = (attemptData.sectional_section as Attempt['sectional_section']) ?? null;
    const sectionalFilterSection: SectionName | null =
        attemptMode === 'sectional' &&
        (sectionalAttemptSection === 'VARC' || sectionalAttemptSection === 'DILR' || sectionalAttemptSection === 'QA')
            ? sectionalAttemptSection
            : null;

    const attempt: Attempt = {
        id: attemptData.id,
        user_id: attemptData.user_id,
        paper_id: attemptData.paper_id,
        started_at: attemptData.started_at,
        submitted_at: attemptData.submitted_at ?? undefined,
        completed_at: attemptData.completed_at ?? undefined,
        status: attemptData.status as Attempt['status'],
        attempt_mode: attemptMode,
        sectional_section: sectionalAttemptSection,
        current_section: (sectionalFilterSection ?? attemptData.current_section) as Attempt['current_section'],
        current_question: attemptData.current_question ?? 1,
        time_remaining: attemptData.time_remaining as Attempt['time_remaining'],
        total_score: attemptData.total_score ?? undefined,
        correct_count: attemptData.correct_count ?? 0,
        incorrect_count: attemptData.incorrect_count ?? 0,
        unanswered_count: attemptData.unanswered_count ?? 0,
        section_scores: attemptData.section_scores as Attempt['section_scores'],
        percentile: attemptData.percentile ?? undefined,
        rank: attemptData.rank ?? undefined,
        created_at: attemptData.created_at,
        updated_at: attemptData.updated_at,
    };

    type QuestionSetViewRow = {
        id: string;
        paper_id: string;
        section: string;
        set_type: string;
        content_layout: string;
        context_title?: string | null;
        context_body?: string | null;
        context_image_url?: string | null;
        context_additional_images?: unknown;
        display_order: number;
        question_count: number;
        metadata?: QuestionSetMetadata | null;
        is_active: boolean;
        is_published: boolean;
        created_at: string;
        updated_at: string;
        questions: Array<{
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
        }>;
    };

    // Prefer set-aware view when available
    let questionSetsQuery = supabase
        .from('question_sets_with_questions')
        .select('*')
        .eq('paper_id', attemptData.paper_id);
    if (sectionalFilterSection) {
        questionSetsQuery = questionSetsQuery.eq('section', sectionalFilterSection);
    }
    const { data: questionSetRows, error: questionSetError } = await questionSetsQuery;

    if (questionSetError) {
        logger?.warn?.('Failed to fetch question_sets_with_questions', questionSetError, {
            paperId: attemptData.paper_id,
            attemptId,
        });
    }

    let questionSets: QuestionSetComplete[] = [];

    if (questionSetRows && questionSetRows.length > 0) {
        questionSets = (questionSetRows as QuestionSetViewRow[]).map((row) => ({
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
            metadata: (row.metadata ?? {}) as QuestionSetMetadata,
            is_active: row.is_active,
            is_published: row.is_published,
            created_at: row.created_at,
            updated_at: row.updated_at,
            questions: (row.questions ?? []).map((q, index) => ({
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

        // IMPORTANT: Supabase .order('section') sorts alphabetically (DILR, QA, VARC),
        // which is not the exam flow order. Force deterministic section ordering in JS.
        const sectionOrder: Record<SectionName, number> = { VARC: 0, DILR: 1, QA: 2 };
        questionSets.sort((a, b) => {
            const sd = (sectionOrder[a.section] ?? 99) - (sectionOrder[b.section] ?? 99);
            if (sd) return sd;
            return (a.display_order ?? 9999) - (b.display_order ?? 9999);
        });
    }

    // Fallback to legacy assembly if set view not available / empty
    if (questionSets.length === 0) {
        let questionsQuery = supabase
            .from('questions_exam')
            .select('*')
            .eq('paper_id', attemptData.paper_id)
            .eq('is_active', true)
            .order('question_number');
        if (sectionalFilterSection) {
            questionsQuery = questionsQuery.eq('section', sectionalFilterSection);
        }
        const { data: questionsData, error: questionsError } = await questionsQuery;

        if (questionsError || !questionsData) {
            return (
                <main className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-xl px-4">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Questions</h1>
                        <p className="text-gray-600 mb-2">There was an error loading the exam questions.</p>
                        <p className="text-gray-600 mb-6">
                            Ensure the secure questions_exam view and its RLS policies are deployed.
                        </p>
                        <BackToDashboard />
                    </div>
                </main>
            );
        }

        // Force correct section ordering (VARC → DILR → QA)
        const sectionOrder: Record<SectionName, number> = { VARC: 0, DILR: 1, QA: 2 };
        const orderedQuestions = [...(questionsData as Question[])].sort((a, b) => {
            const sd = (sectionOrder[a.section] ?? 99) - (sectionOrder[b.section] ?? 99);
            if (sd) return sd;
            return (a.question_number ?? 0) - (b.question_number ?? 0);
        });

        const contextIds = Array.from(
            new Set(
                orderedQuestions
                    .map((q) => q.context_id)
                    .filter((id): id is string => Boolean(id))
            )
        );

        let contexts: QuestionContext[] = [];
        if (contextIds.length > 0) {
            const { data: contextsData, error: contextsError } = await supabase
                .from('question_contexts')
                .select(
                    'id, title, section, content, context_type, paper_id, display_order, is_active, image_url, created_at, updated_at'
                )
                .in('id', contextIds);

            if (contextsError) {
                logger?.warn?.('Failed to fetch question_contexts', contextsError, {
                    paperId: attemptData.paper_id,
                    attemptId,
                });
            } else {
                contexts = (contextsData ?? []) as QuestionContext[];
            }
        }

        questionSets = buildLegacyQuestionSets(orderedQuestions, contexts, attemptData.paper_id);
    }

    const { questions: assembledQuestions } = assemblePaper(questionSets);
    // Hide topic/subtopic metadata + context titles during active exam attempts.
    const questions = assembledQuestions.map((question) => ({
        ...question,
        topic: undefined,
        subtopic: undefined,
        context: question.context
            ? {
                ...question.context,
                title: undefined,
            }
            : undefined,
    }));

    const { data: responseRows, error: responsesError } = await supabase
        .from('responses')
        .select(
            'id, attempt_id, question_id, answer, status, is_marked_for_review, is_visited, time_spent_seconds, visit_count, created_at, updated_at'
        )
        .eq('attempt_id', attemptId);

    if (responsesError) {
        logger?.warn?.('Failed to fetch responses for exam page', responsesError, { attemptId });
    }

    const responses: Response[] = (responseRows as ResponseRow[] ?? []).map((r) => ({
        id: r.id,
        attempt_id: r.attempt_id,
        question_id: r.question_id,
        answer: r.answer,
        status: r.status,
        is_marked_for_review: r.is_marked_for_review ?? false,
        is_visited: r.is_visited ?? false,
        time_spent_seconds: r.time_spent_seconds ?? 0,
        visit_count: r.visit_count ?? 0,
        created_at: r.created_at,
        updated_at: r.updated_at,
    }));

    return (
        <>
            <BackToDashboard variant="fixed" />
            <ExamClient key={attempt.id} paper={paper} questions={questions} attempt={attempt} responses={responses} />
        </>
    );
}
