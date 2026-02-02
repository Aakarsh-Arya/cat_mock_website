/**
 * @fileoverview Exam Result Page
 * @description Displays detailed exam results with sectional analysis
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 * @blueprint Step 0.95 - Uses canonical fetchExamResults action (no duplicate logic)
 */

import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';
import { fetchExamResults } from '@/features/exam-engine/lib/actions';
import { ResultHeader } from '@/features/exam-engine/ui/ResultHeader';
import { SectionalPerformance } from '@/features/exam-engine/ui/SectionalPerformance';
import { QuestionAnalysis } from '@/features/exam-engine/ui/QuestionAnalysis';
import { BackToDashboard } from '@/components/BackToDashboard';
import { ResultReviewClient } from './ResultReviewClient';
import { buildLegacyQuestionSetsWithAnswers } from '@/utils/question-sets';
import type {
    Question,
    QuestionSetComplete,
    QuestionSetMetadata,
    QuestionSetType,
    ContentLayoutType,
    QuestionContext,
    QuestionWithAnswer,
    SectionName,
    QuestionType,
} from '@/types/exam';

interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

// Error UI component for consistent error display
function ErrorState({ title, message, linkHref, linkText, icon }: {
    title: string;
    message: string;
    linkHref: string;
    linkText: string;
    icon?: 'error' | 'warning' | 'info';
}) {
    const iconConfig = {
        error: { bg: 'bg-red-100', color: 'text-red-600', path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        warning: { bg: 'bg-yellow-100', color: 'text-yellow-600', path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        info: { bg: 'bg-gray-100', color: 'text-gray-400', path: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    };
    const cfg = iconConfig[icon || 'error'];

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className={`w-16 h-16 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <svg className={`w-8 h-8 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.path} />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                    href={linkHref}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {linkText}
                </Link>
            </div>
        </main>
    );
}

export default async function ResultPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };

    // Use canonical fetchExamResults action (Step 0.95 compliance)
    // This ensures all security checks are centralized in one place
    const result = await fetchExamResults(attemptId);

    // Handle errors from the canonical action
    if (!result.success) {
        const errorMap: Record<string, { title: string; message: string; linkHref: string; linkText: string; icon: 'error' | 'warning' | 'info' }> = {
            'Authentication required': {
                title: 'Authentication Required',
                message: 'Please sign in to view your results.',
                linkHref: '/auth/sign-in',
                linkText: 'Sign In',
                icon: 'warning',
            },
            'Attempt not found': {
                title: 'Result Not Found',
                message: 'No attempt found with this ID.',
                linkHref: '/dashboard',
                linkText: 'Back to Dashboard',
                icon: 'info',
            },
            'Unauthorized': {
                title: 'Access Denied',
                message: 'You do not have permission to view this result.',
                linkHref: '/dashboard',
                linkText: 'Back to Dashboard',
                icon: 'error',
            },
            'Attempt not yet completed': {
                title: 'Exam Not Completed',
                message: 'This exam has not been submitted yet.',
                linkHref: `/exam/${attemptId}`,
                linkText: 'Continue Exam',
                icon: 'warning',
            },
            'Failed to fetch solutions': {
                title: 'Error Loading Solutions',
                message: 'Failed to load answer key for this attempt.',
                linkHref: '/dashboard',
                linkText: 'Back to Dashboard',
                icon: 'error',
            },
        };

        const errorConfig = errorMap[result.error || ''] || {
            title: 'Error Loading Result',
            message: result.error || 'An unexpected error occurred. Please try again later.',
            linkHref: '/dashboard',
            linkText: 'Back to Dashboard',
            icon: 'error' as const,
        };

        return <ErrorState {...errorConfig} />;
    }

    const { attempt, questions, responses } = result.data!;
    const answerMap = Object.fromEntries(responses.map((r) => [r.question_id, r.answer ?? null]));
    const correctAnswerMap = Object.fromEntries(questions.map((q) => [q.id, q.correct_answer ?? '']));

    // Fetch paper details for display
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();

    let attemptSequenceLabel: string | null = null;
    if (user) {
        const { data: attemptHistory } = await supabase
            .from('attempts')
            .select('id, created_at')
            .eq('user_id', user.id)
            .eq('paper_id', attempt.paper_id)
            .order('created_at', { ascending: true });

        if (attemptHistory && attemptHistory.length > 0) {
            const index = attemptHistory.findIndex((a) => a.id === attempt.id);
            if (index >= 0) {
                attemptSequenceLabel = `Attempt ${index + 1} of ${attemptHistory.length}`;
            }
        }
    }
    const { data: paper } = await supabase
        .from('papers')
        .select('title, total_marks, total_questions')
        .eq('id', attempt.paper_id)
        .single();

    const paperTitle = paper?.title || 'Exam Result';
    const totalMarks = paper?.total_marks || attempt.max_possible_score || 198;

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

    const { data: questionSetRows, error: questionSetError } = await supabase
        .from('question_sets_with_questions')
        .select('*')
        .eq('paper_id', attempt.paper_id);

    if (questionSetError) {
        console.warn('[ResultPage] Failed to fetch question_sets_with_questions', questionSetError);
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

        const sectionOrder: Record<SectionName, number> = { VARC: 0, DILR: 1, QA: 2 };
        questionSets.sort((a, b) => {
            const sd = (sectionOrder[a.section] ?? 99) - (sectionOrder[b.section] ?? 99);
            if (sd) return sd;
            return (a.display_order ?? 9999) - (b.display_order ?? 9999);
        });
    }

    if (questionSets.length === 0) {
        const contextIds = Array.from(
            new Set(
                (questions as Array<QuestionWithAnswer & { context_id?: string | null }>[])
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
                console.warn('[ResultPage] Failed to fetch question_contexts', contextsError);
            } else {
                contexts = (contextsData ?? []) as QuestionContext[];
            }
        }

        questionSets = buildLegacyQuestionSetsWithAnswers(
            questions as QuestionWithAnswer[],
            contexts,
            attempt.paper_id
        );
    }

    // Fetch peer statistics for this paper
    type PaperStats = Record<string, { total: number; options: Record<string, number> }>;
    let paperStats: PaperStats = {};

    const { data: statsData } = await supabase
        .rpc('get_paper_stats', { p_paper_id: attempt.paper_id });

    if (statsData && typeof statsData === 'object') {
        paperStats = statsData as PaperStats;
    }

    const sectionScores = (attempt.section_scores || {}) as Record<string, SectionScore>;

    return (
        <main className="min-h-screen bg-gray-50">
            <BackToDashboard variant="fixed" />
            {/* Header with paper title and submission info */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">{paperTitle}</h1>
                    <p className="text-blue-100">
                        Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '—'}
                    </p>
                    {attemptSequenceLabel && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                            {attemptSequenceLabel}
                        </div>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Result Header - Summary card */}
                <ResultHeader
                    paperTitle={paperTitle}
                    totalScore={attempt.total_score ?? 0}
                    maxScore={attempt.max_possible_score ?? totalMarks}
                    accuracy={attempt.accuracy ?? null}
                    attemptRate={attempt.attempt_rate ?? null}
                    correctCount={attempt.correct_count ?? 0}
                    incorrectCount={attempt.incorrect_count ?? 0}
                    unansweredCount={attempt.unanswered_count ?? 0}
                    timeTakenSeconds={attempt.time_taken_seconds ?? null}
                    percentile={attempt.percentile ?? null}
                    rank={attempt.rank ?? null}
                    submittedAt={attempt.submitted_at ?? null}
                    reviewAnchorId="exam-review"
                />

                {/* Sectional Performance */}
                <SectionalPerformance
                    sectionScores={sectionScores as Record<string, {
                        score: number;
                        maxScore: number;
                        correct: number;
                        incorrect: number;
                        unanswered: number;
                        timeTakenSeconds?: number;
                    }>}
                />

                {/* Question Analysis (Client Component) */}
                {questions && questions.length > 0 && (
                    <QuestionAnalysis
                        questions={questions.map(q => ({
                            id: q.id,
                            section: q.section as 'VARC' | 'DILR' | 'QA',
                            question_number: q.question_number,
                            question_text: q.question_text,
                            question_type: q.question_type as 'MCQ' | 'TITA',
                            options: q.options as string[] | null,
                            correct_answer: q.correct_answer,
                            solution_text: q.solution_text ?? null,
                            question_image_url: q.question_image_url ?? null,
                            topic: q.topic ?? null,
                            difficulty: q.difficulty ?? null,
                        }))}
                        responses={responses}
                        peerStats={paperStats}
                        attemptSequenceLabel={attemptSequenceLabel}
                        attemptId={attempt.id}
                    />
                )}

                {questionSets.length > 0 && (
                    <ResultReviewClient
                        paperTitle={paperTitle}
                        questionSets={questionSets}
                        answerMap={answerMap}
                        correctAnswerMap={correctAnswerMap}
                    />
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/mocks"
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Take Another Mock
                    </Link>
                </div>
            </div>
        </main>
    );
}
