/**
 * @fileoverview Exam Result Page
 * @description Displays detailed exam results with sectional analysis
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';
import { ResultHeader } from '@/features/exam-engine/ui/ResultHeader';
import { SectionalPerformance } from '@/features/exam-engine/ui/SectionalPerformance';
import { QuestionAnalysis } from '@/features/exam-engine/ui/QuestionAnalysis';

interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

interface Attempt {
    id: string;
    paper_id: string;
    status: string;
    total_score: number | null;
    max_possible_score: number | null;
    accuracy: number | null;
    attempt_rate: number | null;
    correct_count: number | null;
    incorrect_count: number | null;
    unanswered_count: number | null;
    percentile: number | null;
    rank: number | null;
    section_scores: Record<string, SectionScore> | null;
    submitted_at: string | null;
    time_taken_seconds: number | null;
    user_id: string;
    papers: {
        title: string;
        total_marks: number;
        total_questions: number;
    };
}

interface Question {
    id: string;
    section: 'VARC' | 'DILR' | 'QA';
    question_number: number;
    question_text: string;
    question_type: 'MCQ' | 'TITA';
    options: string[] | null;
    correct_answer: string;
    solution_text: string | null;
    topic: string | null;
    difficulty: string | null;
}

interface Response {
    question_id: string;
    answer: string | null;
    is_correct: boolean | null;
    marks_obtained: number | null;
}

export default async function ResultPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Load attempt with paper details
    const { data: attempt, error } = await supabase
        .from('attempts')
        .select(`
            id, paper_id, status, total_score, max_possible_score, 
            accuracy, attempt_rate, correct_count, incorrect_count, unanswered_count,
            percentile, rank, section_scores, submitted_at, time_taken_seconds, user_id,
            papers (title, total_marks, total_questions)
        `)
        .eq('id', attemptId)
        .maybeSingle() as { data: Attempt | null; error: unknown };

    const forbidden = attempt && userId && attempt.user_id && attempt.user_id !== userId;

    // Error state
    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Result</h1>
                    <p className="text-gray-600 mb-6">Failed to load result. Please try again later.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Access denied state
    if (forbidden) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You do not have permission to view this result.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Not found state
    if (!attempt) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h1>
                    <p className="text-gray-600 mb-6">No attempt found with this ID.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Exam not completed state
    if (attempt.status !== 'completed') {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Completed</h1>
                    <p className="text-gray-600 mb-6">This exam has not been submitted yet.</p>
                    <Link
                        href={`/exam/${attemptId}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Continue Exam
                    </Link>
                </div>
            </main>
        );
    }

    // Fetch questions for this paper
    const { data: questions } = await supabase
        .from('questions')
        .select('id, question_number, section, question_type, question_text, options, correct_answer, solution_text, topic, difficulty')
        .eq('paper_id', attempt.paper_id)
        .order('question_number', { ascending: true }) as { data: Question[] | null };

    // Fetch responses for this attempt
    const { data: responses } = await supabase
        .from('responses')
        .select('question_id, answer, is_correct, marks_obtained')
        .eq('attempt_id', attemptId) as { data: Response[] | null };

    const paper = attempt.papers;
    const sectionScores = attempt.section_scores || {};

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header with paper title and submission info */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
                    <p className="text-blue-100">
                        Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '—'}
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Result Header - Summary card */}
                <ResultHeader
                    paperTitle={paper.title}
                    totalScore={attempt.total_score ?? 0}
                    maxScore={attempt.max_possible_score ?? paper.total_marks}
                    accuracy={attempt.accuracy}
                    attemptRate={attempt.attempt_rate}
                    correctCount={attempt.correct_count ?? 0}
                    incorrectCount={attempt.incorrect_count ?? 0}
                    unansweredCount={attempt.unanswered_count ?? 0}
                    timeTakenSeconds={attempt.time_taken_seconds}
                    percentile={attempt.percentile}
                    rank={attempt.rank}
                    submittedAt={attempt.submitted_at}
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
                        questions={questions}
                        responses={responses || []}
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
