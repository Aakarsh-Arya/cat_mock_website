/**
 * @fileoverview Exam Page (Server Component)
 * @description Fetches exam data and renders the client-side exam interface
 * @blueprint Milestone 4 SOP-SSOT - Exam Engine
 */

import { sbSSR } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ExamClient } from './ExamClient';
import type { Paper, Question, Attempt, SectionConfig } from '@/types/exam';

export default async function ExamPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/auth/sign-in?redirect_to=${encodeURIComponent(`/exam/${attemptId}`)}`);
    }

    // Get attempt with paper details
    const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select(`
            id, user_id, paper_id, status, started_at, submitted_at, completed_at,
            current_section, current_question, time_remaining,
            total_score, correct_count, incorrect_count, unanswered_count,
            section_scores, percentile, rank, created_at, updated_at,
            papers (
                id, slug, title, description, year,
                total_questions, total_marks, duration_minutes, sections,
                default_positive_marks, default_negative_marks,
                published, available_from, available_until,
                difficulty_level, is_free, attempt_limit,
                created_at, updated_at
            )
        `)
        .eq('id', attemptId)
        .single();

    if (attemptError || !attemptData) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Attempt Not Found</h1>
                    <p className="text-gray-600 mb-6">This exam attempt does not exist or you don&apos;t have access to it.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
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
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Check if attempt is already completed
    if (attemptData.status === 'completed' || attemptData.status === 'submitted') {
        redirect(`/result/${attemptId}`);
    }

    // Get questions for this paper.
    // Prefer secure view `questions_exam` (excludes correct_answer). Fallback to `questions` if view isn't deployed yet.
    type QuestionRow = {
        id: string;
        paper_id: string;
        section: string;
        question_number: number;
        question_text: string;
        question_type: string;
        options: unknown;
        positive_marks: number;
        negative_marks: number;
        difficulty: string | null;
        topic: string | null;
        subtopic: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    };

    let questionsData: QuestionRow[] | null = null;

    {
        const { data, error } = await supabase
            .from('questions_exam')
            .select('*')
            .eq('paper_id', attemptData.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (!error && data) {
            questionsData = data as unknown as QuestionRow[];
        } else {
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('questions')
                .select(
                    [
                        'id',
                        'paper_id',
                        'section',
                        'question_number',
                        'question_text',
                        'question_type',
                        'options',
                        'positive_marks',
                        'negative_marks',
                        'difficulty',
                        'topic',
                        'subtopic',
                        'is_active',
                        'created_at',
                        'updated_at',
                    ].join(',')
                )
                .eq('paper_id', attemptData.paper_id)
                .eq('is_active', true)
                .order('section')
                .order('question_number');

            if (fallbackError || !fallbackData) {
                return (
                    <main className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center max-w-xl px-4">
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Questions</h1>
                            <p className="text-gray-600 mb-2">There was an error loading the exam questions.</p>
                            <p className="text-gray-600 mb-6">
                                If you just updated the schema, ensure the database migration for views/RLS has been applied.
                            </p>
                            <Link href="/dashboard" className="text-blue-600 hover:underline">
                                Back to Dashboard
                            </Link>
                        </div>
                    </main>
                );
            }

            questionsData = fallbackData as unknown as QuestionRow[];
        }
    }

    if (!questionsData) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Questions</h1>
                    <p className="text-gray-600 mb-6">There was an error loading the exam questions.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Transform data to match our types
    // Note: Supabase returns single relation as object, not array
    const paperRaw = attemptData.papers as unknown;
    const paperData = paperRaw as {
        id: string;
        slug: string;
        title: string;
        description: string | null;
        year: number;
        total_questions: number;
        total_marks: number;
        duration_minutes: number;
        sections: SectionConfig[];
        default_positive_marks: number;
        default_negative_marks: number;
        published: boolean;
        available_from: string | null;
        available_until: string | null;
        difficulty_level: string | null;
        is_free: boolean;
        attempt_limit: number | null;
        created_at: string;
        updated_at: string;
    };

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

    const attempt: Attempt = {
        id: attemptData.id,
        user_id: attemptData.user_id,
        paper_id: attemptData.paper_id,
        started_at: attemptData.started_at,
        submitted_at: attemptData.submitted_at ?? undefined,
        completed_at: attemptData.completed_at ?? undefined,
        status: attemptData.status as Attempt['status'],
        current_section: attemptData.current_section as Attempt['current_section'],
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

    const questions: Question[] = questionsData.map((q: QuestionRow) => ({
        id: q.id,
        paper_id: q.paper_id,
        section: q.section as Question['section'],
        question_number: q.question_number,
        question_text: q.question_text,
        question_type: q.question_type as Question['question_type'],
        options: q.options as Question['options'],
        positive_marks: q.positive_marks,
        negative_marks: q.negative_marks,
        difficulty: q.difficulty as Question['difficulty'],
        topic: q.topic ?? undefined,
        subtopic: q.subtopic ?? undefined,
        is_active: q.is_active,
        created_at: q.created_at,
        updated_at: q.updated_at,
    }));

    return <ExamClient paper={paper} questions={questions} attempt={attempt} />;
}
