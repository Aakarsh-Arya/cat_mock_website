/**
 * @fileoverview Exam Engine Server Actions
 * @description Server-side actions for fetching, saving, and submitting exams
 * @blueprint Milestone 4 SOP-SSOT - Phase 4.1, 4.2, 4.4
 * @blueprint M6+ Architecture - Structured Logging
 */

'use server';

import { sbSSR } from '@/lib/supabase/server';
import { logger, examLogger } from '@/lib/logger';
import {
    FetchPaperRequestSchema,
    SaveResponseRequestSchema,
    UpdateTimerRequestSchema,
    SubmitExamRequestSchema,
    type FetchPaperResponse,
    type SubmitExamResponse,
} from './validation';
import type { Paper, Question, Attempt, SectionName, TimeRemaining, QuestionContext } from '@/types/exam';
import { getSectionDurationSecondsMap, getPaperTotalDurationSeconds } from '@/types/exam';

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
        // Fail fast if the view isn't deployed to avoid leaking correct answers.
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions_exam')
            .select('*')
            .eq('paper_id', paperId)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError || !questionsData) {
            logger.error('Failed to fetch questions from questions_exam', questionsError, { paperId });
            return { success: false, error: 'Failed to fetch questions' };
        }

        let questions: Question[] = questionsData as unknown as Question[];

        // Fetch question contexts for questions that have context_id
        const contextIds = [...new Set(
            questions
                .map(q => (q as { context_id?: string }).context_id)
                .filter((id): id is string => Boolean(id))
        )];

        if (contextIds.length > 0) {
            const { data: contexts, error: contextsError } = await supabase
                .from('question_contexts')
                .select('id, title, section, content, context_type, paper_id, display_order, is_active')
                .in('id', contextIds);

            if (!contextsError && contexts) {
                // Create a map for quick lookup
                const contextMap = new Map(
                    contexts.map(c => [c.id, c as QuestionContext])
                );

                // Attach contexts to questions
                questions = questions.map(q => {
                    const ctxId = (q as { context_id?: string }).context_id;
                    if (ctxId && contextMap.has(ctxId)) {
                        return { ...q, context: contextMap.get(ctxId) } as Question;
                    }
                    return q;
                });
            } else {
                logger.warn('Failed to fetch question contexts', contextsError, { contextIds });
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
            const durations = getSectionDurationSecondsMap(paper.sections);
            const initialTimeRemaining: TimeRemaining = {
                VARC: durations.VARC,
                DILR: durations.DILR,
                QA: durations.QA,
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
                logger.warn('Failed to create initial responses', responsesError, { attemptId: attempt.id });
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
        logger.error('fetchPaperForExam error', error, { paperId });
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
    sessionToken?: string | null;
    force_resume?: boolean;
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
            .select('user_id, status, paper_id, session_token, last_activity_at')
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

        // Session conflict check (multi-device/tab prevention)
        if (attempt.session_token && data.sessionToken && attempt.session_token !== data.sessionToken) {
            if (data.force_resume === true) {
                const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;

                if (isStale) {
                    examLogger.securityEvent('Force resume rejected (stale) (saveResponse)', {
                        attemptId: data.attemptId,
                        oldToken: attempt.session_token,
                        lastActivityAt: attempt.last_activity_at,
                    });
                    return { success: false, error: 'FORCE_RESUME_STALE' };
                }

                examLogger.securityEvent('Force resume (saveResponse)', { attemptId: data.attemptId, oldToken: attempt.session_token });
                await supabase
                    .from('attempts')
                    .update({ session_token: data.sessionToken })
                    .eq('id', data.attemptId);
            } else {
                examLogger.securityEvent('Session conflict (saveResponse)', { attemptId: data.attemptId });
                return { success: false, error: 'SESSION_CONFLICT' };
            }
        }

        // P0 FIX: Verify questionId belongs to the attempt's paper (integrity check)
        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select('id')
            .eq('id', data.questionId)
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .maybeSingle();

        if (questionError || !question) {
            examLogger.validationError('Invalid questionId for attempt', { attemptId: data.attemptId, questionId: data.questionId });
            return { success: false, error: 'Invalid question' };
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
            logger.error('saveResponse upsert error', upsertError, { attemptId: data.attemptId, questionId: data.questionId });
            return { success: false, error: 'Failed to save response' };
        }

        return { success: true };
    } catch (error) {
        logger.error('saveResponse error', error, { attemptId: data.attemptId });
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
            logger.error('updateAttemptProgress error', updateError, { attemptId: data.attemptId });
            return { success: false, error: 'Failed to update progress' };
        }

        return { success: true };
    } catch (error) {
        logger.error('updateAttemptProgress error', error, { attemptId: data.attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SUBMIT EXAM
// =============================================================================

/**
 * Submit the exam and calculate scores using TypeScript scoring engine
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 001
 * @blueprint Security Audit - P0 Fix - Server-side timer validation
 * @param attemptId - UUID of the attempt to submit
 */
export async function submitExam(
    attemptId: string,
    options?: { sessionToken?: string | null; force_resume?: boolean; submissionId?: string }
): Promise<ActionResult<SubmitExamResponse>> {
    try {
        // Validate input
        const parsed = SubmitExamRequestSchema.safeParse({
            attemptId,
            sessionToken: options?.sessionToken,
            force_resume: options?.force_resume,
            submissionId: options?.submissionId,
        });
        if (!parsed.success) {
            return { success: false, error: 'Invalid attempt ID' };
        }

        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Fetch attempt with paper_id, started_at, and session_token
        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('user_id, status, paper_id, started_at, session_token, last_activity_at, submission_id')
            .eq('id', attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // P0 FIX: Prevent double submission with strict status check
        if (attempt.status === 'completed' || attempt.status === 'submitted') {
            return { success: false, error: 'Attempt already submitted' };
        }

        if (attempt.status !== 'in_progress') {
            return { success: false, error: 'Attempt is not in progress' };
        }

        // Session conflict check (multi-device/tab prevention)
        if (attempt.session_token && options?.sessionToken && attempt.session_token !== options.sessionToken) {
            if (options.force_resume === true) {
                const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;

                if (isStale) {
                    examLogger.securityEvent('Force resume rejected (stale) (submitExam)', {
                        attemptId,
                        oldToken: attempt.session_token,
                        lastActivityAt: attempt.last_activity_at,
                    });
                    return { success: false, error: 'FORCE_RESUME_STALE' };
                }

                examLogger.securityEvent('Force resume (submitExam)', { attemptId, oldToken: attempt.session_token });
                await supabase
                    .from('attempts')
                    .update({ session_token: options.sessionToken })
                    .eq('id', attemptId);
            } else {
                examLogger.securityEvent('Session conflict (submitExam)', { attemptId });
                return { success: false, error: 'SESSION_CONFLICT' };
            }
        }

        // P0 FIX: Server-side timer validation (dynamic per paper)
        const { data: paperTiming } = await supabase
            .from('papers')
            .select('sections')
            .eq('id', attempt.paper_id)
            .maybeSingle();

        const MAX_EXAM_DURATION_SECONDS = getPaperTotalDurationSeconds(paperTiming?.sections);
        const GRACE_PERIOD_SECONDS = 120; // 2 minutes grace for network latency

        const startedAt = new Date(attempt.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);

        if (elapsedSeconds > MAX_EXAM_DURATION_SECONDS + GRACE_PERIOD_SECONDS) {
            examLogger.securityEvent('Late submission rejected', { attemptId, elapsedSeconds, maxAllowed: MAX_EXAM_DURATION_SECONDS + GRACE_PERIOD_SECONDS });

            // Still mark as completed but flag it
            await supabase
                .from('attempts')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    // Could add a 'late_submission' flag column if needed
                })
                .eq('id', attemptId);

            return { success: false, error: 'Exam time exceeded. Late submissions are not accepted.' };
        }

        const submittedAt = new Date().toISOString();
        const submissionId = options?.submissionId ?? null;

        // P0 FIX: Use atomic status transition to prevent race conditions
        let updateQuery = supabase
            .from('attempts')
            .update({ status: 'submitted', submitted_at: submittedAt, submission_id: submissionId })
            .eq('id', attemptId)
            .eq('status', 'in_progress');

        if (submissionId) {
            updateQuery = updateQuery.or(`submission_id.is.null,submission_id.eq.${submissionId}`);
        }

        const { data: updatedAttempt, error: updateStatusError } = await updateQuery
            .select('id')
            .maybeSingle();

        if (updateStatusError) {
            logger.error('Failed to mark attempt as submitted', updateStatusError, { attemptId });
            return { success: false, error: 'Failed to submit exam' };
        }

        if (!updatedAttempt) {
            // Another request already submitted this attempt
            return { success: false, error: 'Attempt already submitted by another request' };
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
            logger.error('Failed to fetch questions for scoring', questionsError, { attemptId, paperId: attempt.paper_id });
            return { success: false, error: 'Failed to fetch questions for scoring' };
        }

        // Fetch user responses
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('question_id, answer, time_spent_seconds')
            .eq('attempt_id', attemptId);

        if (responsesError) {
            logger.error('Failed to fetch responses for scoring', responsesError, { attemptId });
            return { success: false, error: 'Failed to fetch responses' };
        }

        // P0 FIX: Submission integrity check - verify all responses belong to valid questions
        const validQuestionIds = new Set(questions.map(q => q.id));
        const invalidResponses = (responses || []).filter(r => !validQuestionIds.has(r.question_id));

        if (invalidResponses.length > 0) {
            examLogger.securityEvent('Invalid responses detected', {
                attemptId,
                invalidQuestionIds: invalidResponses.map(r => r.question_id)
            });
            // Log but don't block - filter them out for scoring
            // This could indicate a bug or tampering
        }

        // Only score valid responses
        const validResponses = (responses || []).filter(r => validQuestionIds.has(r.question_id));

        // Import scoring function dynamically to avoid circular deps
        const { calculateScore, calculateTimeTaken } = await import('./scoring');

        // Calculate scores using TypeScript scoring engine (only valid responses)
        const scoringResult = calculateScore(
            questions as Array<Question & { correct_answer: string }>,
            validResponses
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
            logger.error('Failed to update attempt with scores', scoreUpdateError, { attemptId });
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
        logger.error('submitExam error', error, { attemptId });
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
        logger.error('fetchExamResults error', error, { attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// PAUSE EXAM (Save progress and allow resume later)
// =============================================================================

/**
 * Pause the exam - saves all progress and allows resuming later
 * @param attemptId - UUID of the attempt to pause
 * @param timeRemaining - Current section timers
 * @param currentSection - Current section name
 * @param currentQuestion - Current question number
 */
export async function pauseExam(data: {
    attemptId: string;
    timeRemaining: TimeRemaining;
    currentSection: SectionName;
    currentQuestion: number;
}): Promise<ActionResult<void>> {
    try {
        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Get attempt to verify ownership
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

        // Update attempt with paused state (save progress)
        const { error: updateError } = await supabase
            .from('attempts')
            .update({
                time_remaining: data.timeRemaining,
                current_section: data.currentSection,
                current_question: data.currentQuestion,
                // Note: status stays 'in_progress' to allow resume
                // We just save the progress
            })
            .eq('id', data.attemptId)
            .eq('user_id', user.id);

        if (updateError) {
            logger.error('pauseExam update error', updateError, { attemptId: data.attemptId });
            return { success: false, error: 'Failed to pause exam' };
        }

        return { success: true };
    } catch (error) {
        logger.error('pauseExam error', error, { attemptId: data.attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}
