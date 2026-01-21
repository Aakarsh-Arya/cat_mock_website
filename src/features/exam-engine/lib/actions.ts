/**
 * @fileoverview Exam Engine Server Actions
 * @description Server-side actions for fetching, saving, and submitting exams
 * @blueprint Milestone 4 SOP-SSOT - Phase 4.1, 4.2, 4.4
 */

'use server';

import { sbSSR } from '@/lib/supabase/server';
import {
    FetchPaperRequestSchema,
    SaveResponseRequestSchema,
    UpdateTimerRequestSchema,
    SubmitExamRequestSchema,
    type FetchPaperResponse,
    type SubmitExamResponse,
} from './validation';
import type { Paper, Question, Attempt, SectionName, TimeRemaining } from '@/types/exam';
import { CAT_CONSTANTS } from '@/types/exam';

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================================================
// FETCH PAPER WITH QUESTIONS
// =============================================================================

/**
 * Fetch a paper with its questions and create/resume an attempt
 * @param paperId - UUID of the paper to fetch
 * @returns Paper, questions, and attempt data
 */
export async function fetchPaperForExam(
    paperId: string
): Promise<ActionResult<FetchPaperResponse>> {
    try {
        // Validate input
        const parsed = FetchPaperRequestSchema.safeParse({ paperId });
        if (!parsed.success) {
            return { success: false, error: 'Invalid paper ID' };
        }

        const supabase = await sbSSR();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Fetch paper
        const { data: paper, error: paperError } = await supabase
            .from('papers')
            .select('*')
            .eq('id', paperId)
            .eq('published', true)
            .single();

        if (paperError || !paper) {
            return { success: false, error: 'Paper not found' };
        }

        // Fetch questions using the secure view (excludes correct_answer).
        // Fallback to selecting explicit columns from `questions` if the view isn't deployed yet.
        let questions: Question[] = [];
        {
            const { data, error } = await supabase
                .from('questions_exam')
                .select('*')
                .eq('paper_id', paperId)
                .eq('is_active', true)
                .order('section')
                .order('question_number');

            if (!error && data) {
                questions = data as unknown as Question[];
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
                    .eq('paper_id', paperId)
                    .eq('is_active', true)
                    .order('section')
                    .order('question_number');

                if (fallbackError || !fallbackData) {
                    console.error('Failed to fetch questions (view and fallback):', error, fallbackError);
                    return { success: false, error: 'Failed to fetch questions' };
                }

                questions = fallbackData as unknown as Question[];
            }
        }

        // Check for existing in-progress attempt
        const { data: existingAttempt } = await supabase
            .from('attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('paper_id', paperId)
            .eq('status', 'in_progress')
            .single();

        let attempt: Attempt;

        if (existingAttempt) {
            // Resume existing attempt
            attempt = existingAttempt as Attempt;
        } else {
            // Create new attempt
            const initialTimeRemaining: TimeRemaining = {
                VARC: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
                DILR: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
                QA: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
            };

            const { data: newAttempt, error: attemptError } = await supabase
                .from('attempts')
                .insert({
                    user_id: user.id,
                    paper_id: paperId,
                    status: 'in_progress',
                    current_section: 'VARC',
                    current_question: 1,
                    time_remaining: initialTimeRemaining,
                })
                .select()
                .single();

            if (attemptError || !newAttempt) {
                return { success: false, error: 'Failed to create attempt' };
            }

            attempt = newAttempt as Attempt;

            // Create initial response records for all questions
            const responseInserts = questions.map((q) => ({
                attempt_id: attempt.id,
                question_id: q.id,
                answer: null,
                status: 'not_visited',
                is_marked_for_review: false,
                time_spent_seconds: 0,
                visit_count: 0,
            }));

            const { error: responsesError } = await supabase
                .from('responses')
                .insert(responseInserts);

            if (responsesError) {
                console.error('Failed to create initial responses:', responsesError);
                // Non-fatal - continue without initial responses
            }
        }

        return {
            success: true,
            data: {
                paper: paper as Paper,
                questions,
                attempt,
            },
        };
    } catch (error) {
        console.error('fetchPaperForExam error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SAVE RESPONSE
// =============================================================================

/**
 * Save a user's response to a question
 * @param data - Response data to save
 */
export async function saveResponse(data: {
    attemptId: string;
    questionId: string;
    answer: string | null;
    status: string;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
}): Promise<ActionResult<void>> {
    try {
        // Validate input
        const parsed = SaveResponseRequestSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: 'Invalid response data' };
        }

        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('user_id, status')
            .eq('id', data.attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (attempt.status !== 'in_progress') {
            return { success: false, error: 'Attempt is not in progress' };
        }

        // Upsert response
        const { error: upsertError } = await supabase
            .from('responses')
            .upsert(
                {
                    attempt_id: data.attemptId,
                    question_id: data.questionId,
                    answer: data.answer,
                    status: data.status,
                    is_marked_for_review: data.isMarkedForReview,
                    time_spent_seconds: data.timeSpentSeconds,
                },
                {
                    onConflict: 'attempt_id,question_id',
                }
            );

        if (upsertError) {
            console.error('saveResponse upsert error:', upsertError);
            return { success: false, error: 'Failed to save response' };
        }

        return { success: true };
    } catch (error) {
        console.error('saveResponse error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// UPDATE TIMER / PROGRESS
// =============================================================================

/**
 * Update attempt progress (timer, current section/question)
 * @param data - Timer and navigation data
 */
export async function updateAttemptProgress(data: {
    attemptId: string;
    timeRemaining: TimeRemaining;
    currentSection: SectionName;
    currentQuestion: number;
}): Promise<ActionResult<void>> {
    try {
        // Validate input
        const parsed = UpdateTimerRequestSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: 'Invalid timer data' };
        }

        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        const { error: updateError } = await supabase
            .from('attempts')
            .update({
                time_remaining: data.timeRemaining,
                current_section: data.currentSection,
                current_question: data.currentQuestion,
            })
            .eq('id', data.attemptId)
            .eq('user_id', user.id)
            .eq('status', 'in_progress');

        if (updateError) {
            console.error('updateAttemptProgress error:', updateError);
            return { success: false, error: 'Failed to update progress' };
        }

        return { success: true };
    } catch (error) {
        console.error('updateAttemptProgress error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SUBMIT EXAM
// =============================================================================

/**
 * Submit the exam and calculate scores using TypeScript scoring engine
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 001
 * @param attemptId - UUID of the attempt to submit
 */
export async function submitExam(
    attemptId: string
): Promise<ActionResult<SubmitExamResponse>> {
    try {
        // Validate input
        const parsed = SubmitExamRequestSchema.safeParse({ attemptId });
        if (!parsed.success) {
            return { success: false, error: 'Invalid attempt ID' };
        }

        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Fetch attempt with paper_id and started_at
        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('user_id, status, paper_id, started_at')
            .eq('id', attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (attempt.status !== 'in_progress') {
            return { success: false, error: 'Attempt already submitted' };
        }

        const submittedAt = new Date().toISOString();

        // Mark as submitted immediately to prevent double submission
        const { error: updateStatusError } = await supabase
            .from('attempts')
            .update({ status: 'submitted', submitted_at: submittedAt })
            .eq('id', attemptId);

        if (updateStatusError) {
            console.error('Failed to mark attempt as submitted:', updateStatusError);
            return { success: false, error: 'Failed to submit exam' };
        }

        // Fetch all questions WITH correct_answer (server-side only, secure)
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError || !questions) {
            console.error('Failed to fetch questions for scoring:', questionsError);
            return { success: false, error: 'Failed to fetch questions for scoring' };
        }

        // Fetch user responses
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('question_id, answer, time_spent_seconds')
            .eq('attempt_id', attemptId);

        if (responsesError) {
            console.error('Failed to fetch responses for scoring:', responsesError);
            return { success: false, error: 'Failed to fetch responses' };
        }

        // Import scoring function dynamically to avoid circular deps
        const { calculateScore, calculateTimeTaken } = await import('./scoring');

        // Calculate scores using TypeScript scoring engine
        const scoringResult = calculateScore(
            questions as Array<Question & { correct_answer: string }>,
            responses || []
        );

        // Calculate time taken
        const timeTakenSeconds = calculateTimeTaken(attempt.started_at, submittedAt);

        // Update attempt with scores
        const { error: scoreUpdateError } = await supabase
            .from('attempts')
            .update({
                status: 'completed',
                completed_at: submittedAt,
                total_score: scoringResult.total_score,
                max_possible_score: scoringResult.max_possible_score,
                correct_count: scoringResult.correct_count,
                incorrect_count: scoringResult.incorrect_count,
                unanswered_count: scoringResult.unanswered_count,
                accuracy: scoringResult.accuracy,
                attempt_rate: scoringResult.attempt_rate,
                section_scores: scoringResult.section_scores,
                time_taken_seconds: timeTakenSeconds,
            })
            .eq('id', attemptId);

        if (scoreUpdateError) {
            console.error('Failed to update attempt with scores:', scoreUpdateError);
            // Continue anyway - attempt is submitted, scores may be incomplete
        }

        // Update individual responses with is_correct and marks_obtained
        for (const questionResult of scoringResult.question_results) {
            await supabase
                .from('responses')
                .update({
                    is_correct: questionResult.is_correct,
                    marks_obtained: questionResult.marks_obtained,
                })
                .eq('attempt_id', attemptId)
                .eq('question_id', questionResult.question_id);
        }

        return {
            success: true,
            data: {
                success: true,
                total_score: scoringResult.total_score,
                max_score: scoringResult.max_possible_score,
                correct: scoringResult.correct_count,
                incorrect: scoringResult.incorrect_count,
                unanswered: scoringResult.unanswered_count,
                accuracy: scoringResult.accuracy,
                attempt_rate: scoringResult.attempt_rate,
                section_scores: scoringResult.section_scores,
            },
        };
    } catch (error) {
        console.error('submitExam error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// FETCH RESULTS
// =============================================================================

/**
 * Fetch completed attempt results with answers
 * @param attemptId - UUID of the attempt
 */
export async function fetchExamResults(attemptId: string): Promise<ActionResult<{
    attempt: Attempt;
    questions: Array<Question & { correct_answer: string }>;
    responses: Array<{
        question_id: string;
        answer: string | null;
        is_correct: boolean | null;
        marks_obtained: number | null;
    }>;
}>> {
    try {
        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Fetch attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('*')
            .eq('id', attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (attempt.status !== 'completed') {
            return { success: false, error: 'Attempt not yet completed' };
        }

        // Fetch questions WITH correct answers (only for completed attempts)
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError) {
            return { success: false, error: 'Failed to fetch questions' };
        }

        // Fetch responses
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('question_id, answer, is_correct, marks_obtained')
            .eq('attempt_id', attemptId);

        if (responsesError) {
            return { success: false, error: 'Failed to fetch responses' };
        }

        return {
            success: true,
            data: {
                attempt: attempt as Attempt,
                questions: questions as Array<Question & { correct_answer: string }>,
                responses: responses as Array<{
                    question_id: string;
                    answer: string | null;
                    is_correct: boolean | null;
                    marks_obtained: number | null;
                }>,
            },
        };
    } catch (error) {
        console.error('fetchExamResults error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
