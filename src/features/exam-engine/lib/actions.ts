'use server';

/**
 * @fileoverview Exam Engine Server Actions
 * @description Server-side actions for fetching, saving, and submitting exams
 * @blueprint Milestone 4 SOP-SSOT - Phase 4.1, 4.2, 4.4
 * @blueprint M6+ Architecture - Structured Logging
 */

import 'server-only';

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

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================================================
// FETCH PAPER WITH QUESTIONS
// =============================================================================

export async function fetchPaperForExam(paperId: string): Promise<ActionResult<FetchPaperResponse>> {
    try {
        const parsed = FetchPaperRequestSchema.safeParse({ paperId });
        if (!parsed.success) return { success: false, error: 'Invalid paper ID' };

        const supabase = await sbSSR();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Authentication required' };

        const { data: paper, error: paperError } = await supabase
            .from('papers')
            .select('*')
            .eq('id', paperId)
            .eq('published', true)
            .single();

        if (paperError || !paper) return { success: false, error: 'Paper not found' };

        // Secure view (excludes correct_answer). Fail fast if view isn't deployed.
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

        let questions = questionsData as unknown as Question[];

        // Phase D: set-aware ordering
        const setIds = Array.from(
            new Set(
                questions
                    .map((q) => (q as { set_id?: string | null }).set_id)
                    .filter((id): id is string => Boolean(id))
            )
        );

        const setById = new Map<string, { display_order: number }>();
        if (setIds.length) {
            const { data: sets, error: setsError } = await supabase
                .from('question_sets')
                .select('id, display_order')
                .in('id', setIds);

            if (!setsError && sets) {
                for (const s of sets) setById.set(s.id, { display_order: s.display_order ?? 9999 });
            }
        }

        // Attach contexts (if any)
        const contextIds = Array.from(
            new Set(
                questions
                    .map((q) => (q as { context_id?: string | null }).context_id)
                    .filter((id): id is string => Boolean(id))
            )
        );

        if (contextIds.length) {
            const { data: contexts, error: contextsError } = await supabase
                .from('question_contexts')
                .select('id, title, section, content, context_type, paper_id, display_order, is_active')
                .in('id', contextIds);

            if (!contextsError && contexts) {
                const contextMap = new Map(contexts.map((c) => [c.id, c as QuestionContext]));
                questions = questions.map((q) => {
                    const ctxId = (q as { context_id?: string | null }).context_id;
                    const ctx = ctxId ? contextMap.get(ctxId) : undefined;
                    return ctx ? ({ ...q, context: ctx } as Question) : q;
                });
            } else {
                logger.warn('Failed to fetch question contexts', contextsError, { contextIds });
            }
        }

        // Deterministic ordering: section → set.display_order → sequence_order/question_number
        const sectionOrder: Record<SectionName, number> = { VARC: 0, DILR: 1, QA: 2 };
        questions.sort((a, b) => {
            const sectionDiff = (sectionOrder[a.section] ?? 99) - (sectionOrder[b.section] ?? 99);
            if (sectionDiff) return sectionDiff;

            const aSetOrder = a.set_id ? (setById.get(a.set_id)?.display_order ?? 9999) : 9999;
            const bSetOrder = b.set_id ? (setById.get(b.set_id)?.display_order ?? 9999) : 9999;
            const setDiff = aSetOrder - bSetOrder;
            if (setDiff) return setDiff;

            const aSeq = a.sequence_order ?? a.question_number;
            const bSeq = b.sequence_order ?? b.question_number;
            return aSeq - bSeq;
        });

        // Compute exam_order per section for stable palette navigation
        let curSection: SectionName | null = null;
        let examOrderInSection = 0;
        questions = questions.map((q) => {
            if (q.section !== curSection) {
                curSection = q.section;
                examOrderInSection = 0;
            }
            examOrderInSection += 1;
            return { ...q, exam_order: examOrderInSection };
        });

        // Resume existing in-progress attempt (if any)
        // BUG FIX: .single() would throw when 0 rows; use maybeSingle() to safely detect absence.
        const { data: existingAttempt, error: existingAttemptError } = await supabase
            .from('attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('paper_id', paperId)
            .eq('status', 'in_progress')
            .maybeSingle();

        if (existingAttemptError) {
            logger.warn('Failed to check existing attempt', existingAttemptError, { paperId, userId: user.id });
        }

        let attempt: Attempt;

        if (existingAttempt) {
            attempt = existingAttempt as Attempt;
        } else {
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

            if (attemptError || !newAttempt) return { success: false, error: 'Failed to create attempt' };

            attempt = newAttempt as Attempt;

            const responseInserts = questions.map((q) => ({
                attempt_id: attempt.id,
                question_id: q.id,
                answer: null,
                status: 'not_visited',
                is_marked_for_review: false,
                is_visited: false,
                time_spent_seconds: 0,
                visit_count: 0,
            }));

            const { error: responsesError } = await supabase.from('responses').insert(responseInserts);
            if (responsesError) {
                logger.warn('Failed to create initial responses', responsesError, { attemptId: attempt.id });
            }
        }

        return { success: true, data: { paper: paper as Paper, questions, attempt } };
    } catch (error) {
        logger.error('fetchPaperForExam error', error, { paperId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SESSION INITIALIZATION
// =============================================================================

export async function initializeExamSession(attemptId: string): Promise<ActionResult<{ sessionToken: string }>> {
    try {
        if (!attemptId) return { success: false, error: 'Invalid attempt ID' };

        const supabase = await sbSSR();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Authentication required' };

        const { data: token, error: rpcError } = await supabase.rpc('initialize_exam_session', {
            p_attempt_id: attemptId,
            p_user_id: user.id,
        });

        if (rpcError || !token) {
            logger.error('initializeExamSession RPC error', rpcError, { attemptId });
            return { success: false, error: 'Failed to initialize session' };
        }

        return { success: true, data: { sessionToken: token as string } };
    } catch (error) {
        logger.error('initializeExamSession error', error, { attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SAVE RESPONSE
// =============================================================================

export async function saveResponse(data: {
    attemptId: string;
    questionId: string;
    answer: string | null;
    status: string;
    isMarkedForReview: boolean;
    isVisited?: boolean;
    timeSpentSeconds: number;
    visitCount?: number;
    sessionToken?: string | null;
    force_resume?: boolean;
}): Promise<ActionResult<void>> {
    try {
        const parsed = SaveResponseRequestSchema.safeParse(data);
        if (!parsed.success) return { success: false, error: 'Invalid response data' };

        const supabase = await sbSSR();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Authentication required' };

        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('user_id, status, paper_id')
            .eq('id', data.attemptId)
            .single();

        if (attemptError || !attempt) return { success: false, error: 'Attempt not found' };
        if (attempt.user_id !== user.id) return { success: false, error: 'Unauthorized' };
        if (attempt.status !== 'in_progress') return { success: false, error: 'Attempt is not in progress' };
        if (!data.sessionToken) return { success: false, error: 'Missing session token' };

        const { data: isValidSession, error: validateError } = await supabase.rpc('validate_session_token', {
            p_attempt_id: data.attemptId,
            p_session_token: data.sessionToken,
            p_user_id: user.id,
            // Disambiguate overloaded RPC (uuid vs text signature)
            p_force_resume: false,
        });

        if (validateError) {
            logger.error('saveResponse validate_session_token error', validateError, { attemptId: data.attemptId });
            return { success: false, error: 'Failed to validate session' };
        }

        if (!isValidSession) {
            if (data.force_resume === true) {
                examLogger.securityEvent('Force resume (saveResponse)', { attemptId: data.attemptId });

                const { error: forceResumeError } = await supabase.rpc('force_resume_exam_session', {
                    p_attempt_id: data.attemptId,
                    p_new_session_token: data.sessionToken,
                });

                if (forceResumeError) {
                    if (
                        forceResumeError.message?.includes('FORCE_RESUME_STALE') ||
                        forceResumeError.message?.includes('stale')
                    ) {
                        return { success: false, error: 'FORCE_RESUME_STALE' };
                    }
                    logger.error('saveResponse force_resume_exam_session error', forceResumeError, {
                        attemptId: data.attemptId,
                    });
                    return { success: false, error: 'Failed to force resume session' };
                }
            } else {
                examLogger.securityEvent('Session conflict (saveResponse)', { attemptId: data.attemptId });
                return { success: false, error: 'SESSION_CONFLICT' };
            }
        }

        // Integrity check: questionId must belong to attempt's paper (safe view)
        const { data: question, error: questionError } = await supabase
            .from('questions_exam')
            .select('id, paper_id')
            .eq('id', data.questionId)
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .maybeSingle();

        if (questionError || !question) {
            examLogger.validationError('Invalid questionId for attempt', {
                attemptId: data.attemptId,
                userId: user.id,
                questionId: data.questionId,
                paperId: attempt.paper_id,
            });
            return { success: false, error: 'Invalid question' };
        }

        const inferredVisited =
            data.isVisited ?? (data.status !== 'not_visited' || (data.answer !== null && data.answer !== ''));

        const { error: upsertError } = await supabase.from('responses').upsert(
            {
                attempt_id: data.attemptId,
                question_id: data.questionId,
                answer: data.answer,
                status: data.status,
                is_marked_for_review: data.isMarkedForReview,
                is_visited: inferredVisited,
                time_spent_seconds: data.timeSpentSeconds,
                visit_count: typeof data.visitCount === 'number' ? data.visitCount : undefined,
            },
            { onConflict: 'attempt_id,question_id' }
        );

        if (upsertError) {
            logger.error('saveResponse upsert error', upsertError, {
                attemptId: data.attemptId,
                questionId: data.questionId,
            });
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

export async function updateAttemptProgress(data: {
    attemptId: string;
    timeRemaining: TimeRemaining;
    currentSection: SectionName;
    currentQuestion: number;
}): Promise<ActionResult<void>> {
    try {
        const parsed = UpdateTimerRequestSchema.safeParse(data);
        if (!parsed.success) return { success: false, error: 'Invalid timer data' };

        const supabase = await sbSSR();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Authentication required' };

        const { error: rpcError } = await supabase.rpc('save_attempt_state', {
            p_attempt_id: data.attemptId,
            p_time_remaining: data.timeRemaining,
            p_current_section: data.currentSection,
            p_current_question: data.currentQuestion,
            p_client_now: new Date().toISOString(),
        });

        if (!rpcError) return { success: true };

        const msg = rpcError.message || 'Failed to update progress';

        if (msg.includes('Unauthorized')) return { success: false, error: 'Unauthorized' };
        if (msg.includes('not in progress')) return { success: false, error: 'Attempt is not in progress' };
        if (msg.includes('not found')) return { success: false, error: 'Attempt not found' };

        if (msg.includes('time cannot increase')) {
            examLogger.securityEvent('Progress update rejected: time inflation attempt', {
                attemptId: data.attemptId,
                userId: user.id,
            });
            return { success: false, error: 'Invalid timer state' };
        }

        logger.error('updateAttemptProgress RPC error', rpcError, { attemptId: data.attemptId });
        return { success: false, error: 'Failed to update progress' };
    } catch (error) {
        logger.error('updateAttemptProgress error', error, { attemptId: data.attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SUBMIT EXAM
// =============================================================================

// Overloads to support BOTH calling conventions safely:
// 1) submitExam(attemptId, options?)
// 2) submitExam({ attemptId, sessionToken, force_resume, submissionId })
export async function submitExam(
    attemptId: string,
    options?: { sessionToken?: string | null; force_resume?: boolean; submissionId?: string }
): Promise<ActionResult<SubmitExamResponse>>;
export async function submitExam(data: {
    attemptId: string;
    sessionToken?: string | null;
    force_resume?: boolean;
    submissionId?: string;
}): Promise<ActionResult<SubmitExamResponse>>;
export async function submitExam(
    arg1:
        | string
        | {
            attemptId: string;
            sessionToken?: string | null;
            force_resume?: boolean;
            submissionId?: string;
        },
    arg2?: { sessionToken?: string | null; force_resume?: boolean; submissionId?: string }
): Promise<ActionResult<SubmitExamResponse>> {
    // Normalize inputs - use let so we can promote fallback attempt ID if needed
    let normalizedAttemptId = typeof arg1 === 'string' ? arg1 : arg1.attemptId;
    const options =
        typeof arg1 === 'string'
            ? arg2
            : {
                sessionToken: arg1.sessionToken,
                force_resume: arg1.force_resume,
                submissionId: arg1.submissionId,
            };

    try {
        const parsed = SubmitExamRequestSchema.safeParse({
            attemptId: normalizedAttemptId,
            sessionToken: options?.sessionToken,
            force_resume: options?.force_resume,
            submissionId: options?.submissionId,
        });
        if (!parsed.success) return { success: false, error: 'Invalid attempt ID' };

        const supabase = await sbSSR();
        const { getServiceRoleClient } = await import('@/lib/supabase/service-role');
        const adminClient = getServiceRoleClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Authentication required' };

        // CRITICAL: Select 'id' so we can promote fallback attempt ID
        let { data: attempt, error: attemptError } = await adminClient
            .from('attempts')
            .select('id, user_id, status, paper_id, started_at')
            .eq('id', normalizedAttemptId)
            .maybeSingle();

        if (attemptError?.code === '42703') {
            const retry = await adminClient
                .from('attempts')
                .select('id, user_id, status, paper_id, started_at')
                .eq('id', normalizedAttemptId)
                .maybeSingle();
            attempt = retry.data ?? attempt;
            attemptError = retry.error ?? null;
        }

        if (attemptError || !attempt) {
            const reason = attemptError ? `error:${attemptError.code ?? 'unknown'}` : 'no_rows';
            logger.error('submitExam attempt lookup failed', attemptError, {
                attemptId: normalizedAttemptId,
                userId: user.id,
                reason,
            });

            const { data: recentAttempts, error: recentError } = await adminClient
                .from('attempts')
                .select('id, status, user_id, paper_id, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);
            logger.error('submitExam recent attempts for user', recentError, {
                attemptId: normalizedAttemptId,
                userId: user.id,
                recentAttempts,
            });
            return { success: false, error: 'Attempt not found' };
        }
        if (attempt.user_id !== user.id) return { success: false, error: 'Unauthorized' };

        // Phase 5: Treat already-submitted as success (idempotent)
        // PHASE 3 FIX: Return data matching successful first submission shape for proper UI redirect
        if (attempt.status === 'completed' || attempt.status === 'submitted') {
            logger.info('submitExam: attempt already submitted, returning success (idempotent)', {
                attemptId: normalizedAttemptId,
                status: attempt.status,
            });
            return {
                success: true,
                data: {
                    success: true,
                    already_submitted: true,
                    attemptId: normalizedAttemptId,
                } as unknown as SubmitExamResponse,
            };
        }
        if (attempt.status !== 'in_progress') return { success: false, error: 'Attempt is not in progress' };
        if (!options?.sessionToken) return { success: false, error: 'Missing session token' };

        const { data: isValidSession, error: validateError } = await supabase.rpc('validate_session_token', {
            p_attempt_id: normalizedAttemptId,
            p_session_token: options.sessionToken,
            p_user_id: user.id,
            // Disambiguate overloaded RPC (uuid vs text signature)
            p_force_resume: false,
        });

        const tryForceResume = async () => {
            examLogger.securityEvent('Force resume (submitExam)', { attemptId: normalizedAttemptId });
            return supabase.rpc('force_resume_exam_session', {
                p_attempt_id: normalizedAttemptId,
                p_new_session_token: options.sessionToken,
            });
        };

        if (validateError) {
            logger.error('submitExam validate_session_token error', validateError, { attemptId: normalizedAttemptId });

            if (options.force_resume === true) {
                examLogger.securityEvent('Force resume on RPC error (submitExam)', { attemptId: normalizedAttemptId });

                const { error: forceResumeError } = await tryForceResume();
                if (forceResumeError) {
                    if (
                        forceResumeError.message?.includes('FORCE_RESUME_STALE') ||
                        forceResumeError.message?.includes('stale')
                    ) {
                        return { success: false, error: 'FORCE_RESUME_STALE' };
                    }
                    logger.error('submitExam force_resume_exam_session error (after RPC error)', forceResumeError, {
                        attemptId: normalizedAttemptId,
                    });
                    return { success: false, error: 'SESSION_CONFLICT' };
                }
            } else {
                return { success: false, error: 'SESSION_CONFLICT' };
            }
        } else if (!isValidSession) {
            if (options.force_resume === true) {
                const { error: forceResumeError } = await tryForceResume();
                if (forceResumeError) {
                    if (
                        forceResumeError.message?.includes('FORCE_RESUME_STALE') ||
                        forceResumeError.message?.includes('stale')
                    ) {
                        return { success: false, error: 'FORCE_RESUME_STALE' };
                    }
                    logger.error('submitExam force_resume_exam_session error', forceResumeError, {
                        attemptId: normalizedAttemptId,
                    });
                    return { success: false, error: 'Failed to force resume session' };
                }
            } else {
                examLogger.securityEvent('Session conflict (submitExam)', { attemptId: normalizedAttemptId });
                return { success: false, error: 'SESSION_CONFLICT' };
            }
        }

        // Server-side timer validation (dynamic per paper)
        const { data: paperTiming, error: paperTimingError } = await supabase
            .from('papers')
            .select('sections')
            .eq('id', attempt.paper_id)
            .maybeSingle();

        if (paperTimingError) {
            logger.warn('Failed to fetch paper timing for submitExam', paperTimingError, {
                attemptId: normalizedAttemptId,
                paperId: attempt.paper_id,
            });
        }

        const MAX_EXAM_DURATION_SECONDS = getPaperTotalDurationSeconds(paperTiming?.sections);
        const GRACE_PERIOD_SECONDS = 120;

        // Guard: if timing cannot be computed, skip late-submit rejection rather than breaking valid submits.
        if (typeof MAX_EXAM_DURATION_SECONDS === 'number' && MAX_EXAM_DURATION_SECONDS > 0) {
            const startedAtMs = new Date(attempt.started_at).getTime();
            const elapsedSeconds = Math.floor((Date.now() - startedAtMs) / 1000);

            if (elapsedSeconds > MAX_EXAM_DURATION_SECONDS + GRACE_PERIOD_SECONDS) {
                examLogger.securityEvent('Late submission rejected', {
                    attemptId: normalizedAttemptId,
                    elapsedSeconds,
                    maxAllowed: MAX_EXAM_DURATION_SECONDS + GRACE_PERIOD_SECONDS,
                });

                await adminClient
                    .from('attempts')
                    .update({
                        status: 'completed',
                        submitted_at: new Date().toISOString(),
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', normalizedAttemptId);

                return { success: false, error: 'Exam time exceeded. Late submissions are not accepted.' };
            }
        }

        const submittedAt = new Date().toISOString();
        const submissionId = options?.submissionId ?? null;

        // Atomic status transition (prevents races/double submit)
        const primaryUpdatePayload: Record<string, unknown> = {
            status: 'submitted',
            submitted_at: submittedAt,
        };
        if (submissionId) {
            primaryUpdatePayload.submission_id = submissionId;
        }

        let updateQuery = adminClient
            .from('attempts')
            .update(primaryUpdatePayload)
            .eq('id', normalizedAttemptId)
            .eq('status', 'in_progress');

        // Best-effort: if submission_id exists in this DB, attempt idempotent update.
        if (submissionId) {
            try {
                updateQuery = updateQuery.or(`submission_id.is.null,submission_id.eq.${submissionId}`);
            } catch {
                // ignore if column doesn't exist
            }
        }

        let { data: updatedAttempt, error: updateStatusError } = await updateQuery.select('id').maybeSingle();

        if (updateStatusError?.code === '42703') {
            // Retry without submission_id (handles missing column)
            const retry = await adminClient
                .from('attempts')
                .update({ status: 'submitted', submitted_at: submittedAt })
                .eq('id', normalizedAttemptId)
                .eq('status', 'in_progress')
                .select('id')
                .maybeSingle();
            updatedAttempt = retry.data ?? updatedAttempt;
            updateStatusError = retry.error ?? null;
        }

        if (updateStatusError?.code === '42703') {
            // Retry without submitted_at (handles older schemas)
            const retry = await adminClient
                .from('attempts')
                .update({ status: 'submitted' })
                .eq('id', normalizedAttemptId)
                .eq('status', 'in_progress')
                .select('id')
                .maybeSingle();
            updatedAttempt = retry.data ?? updatedAttempt;
            updateStatusError = retry.error ?? null;
        }

        if (updateStatusError) {
            logger.error('Failed to mark attempt as submitted', updateStatusError, { attemptId: normalizedAttemptId });
            const detail = updateStatusError.message || updateStatusError.code || 'unknown';
            return {
                success: false,
                error:
                    process.env.NODE_ENV !== 'production'
                        ? `Failed to submit exam: ${detail}`
                        : 'Failed to submit exam',
            };
        }

        if (!updatedAttempt) {
            return { success: false, error: 'Attempt already submitted by another request' };
        }

        // Fetch all questions WITH correct_answer (server-side only)
        const { data: questions, error: questionsError } = await adminClient
            .from('questions')
            .select('*')
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError || !questions) {
            logger.error('Failed to fetch questions for scoring', questionsError, {
                attemptId: normalizedAttemptId,
                paperId: attempt.paper_id,
            });
            return { success: false, error: 'Failed to fetch questions for scoring' };
        }

        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('question_id, answer, time_spent_seconds')
            .eq('attempt_id', normalizedAttemptId);

        if (responsesError) {
            logger.error('Failed to fetch responses for scoring', responsesError, { attemptId: normalizedAttemptId });
            return { success: false, error: 'Failed to fetch responses' };
        }

        // Submission integrity check (log-only)
        const validQuestionIds = new Set(questions.map((q) => q.id));
        const invalidResponses = (responses || []).filter((r) => !validQuestionIds.has(r.question_id));

        if (invalidResponses.length) {
            examLogger.securityEvent('Invalid responses detected', {
                attemptId: normalizedAttemptId,
                invalidQuestionIds: invalidResponses.map((r) => r.question_id),
            });
        }

        const validResponses = (responses || []).filter((r) => validQuestionIds.has(r.question_id));

        const { calculateScore, calculateTimeTaken } = await import('./scoring');

        const scoringResult = calculateScore(questions as Array<Question & { correct_answer: string }>, validResponses);

        const timeTakenSeconds = calculateTimeTaken(attempt.started_at, submittedAt);

        const { error: scoreUpdateError } = await adminClient
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
            .eq('id', normalizedAttemptId);

        if (scoreUpdateError) {
            logger.error('Failed to update attempt with scores', scoreUpdateError, { attemptId: normalizedAttemptId });
        }

        // Update individual responses with is_correct and marks_obtained (same sequential behavior)
        for (const qr of scoringResult.question_results) {
            await supabase
                .from('responses')
                .update({ is_correct: qr.is_correct, marks_obtained: qr.marks_obtained })
                .eq('attempt_id', normalizedAttemptId)
                .eq('question_id', qr.question_id);
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
        logger.error('submitExam error', error, { attemptId: normalizedAttemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// FETCH RESULTS
// =============================================================================

export async function fetchExamResults(
    attemptId: string
): Promise<
    ActionResult<{
        attempt: Attempt;
        questions: Array<Question & { correct_answer: string }>;
        responses: Array<{
            question_id: string;
            answer: string | null;
            status?: string | null;
            is_correct: boolean | null;
            marks_obtained: number | null;
            time_spent_seconds?: number | null;
            visit_count?: number | null;
            updated_at?: string | null;
        }>;
    }>
> {
    try {
        const supabase = await sbSSR();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Authentication required' };

        const { data: attempt, error: attemptError } = await supabase.from('attempts').select('*').eq('id', attemptId).single();

        if (attemptError || !attempt) return { success: false, error: 'Attempt not found' };
        if (attempt.user_id !== user.id) return { success: false, error: 'Unauthorized' };

        if (attempt.status !== 'completed' && attempt.status !== 'submitted') {
            return { success: false, error: 'Attempt not yet completed' };
        }

        const { data: questions, error: questionsError } = await supabase
            .from('questions_exam')
            .select('*')
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError) return { success: false, error: 'Failed to fetch questions' };

        const { data: solutionsData, error: solutionsError } = await supabase.rpc('fetch_attempt_solutions', {
            p_attempt_id: attemptId,
        });

        if (solutionsError) return { success: false, error: 'Failed to fetch solutions' };

        const solutions = Array.isArray(solutionsData) ? solutionsData : solutionsData ? [solutionsData] : [];

        const solutionMap = new Map(
            solutions.map(
                (s: {
                    question_id: string;
                    correct_answer: string;
                    solution_text: string | null;
                    solution_image_url: string | null;
                    video_solution_url: string | null;
                }) => [s.question_id, s]
            )
        );

        const mergedQuestions = (questions || []).map((q) => {
            const solution = solutionMap.get(q.id);
            return {
                ...q,
                correct_answer: solution?.correct_answer ?? '',
                solution_text: solution?.solution_text ?? null,
                solution_image_url: solution?.solution_image_url ?? null,
                video_solution_url: solution?.video_solution_url ?? null,
            } as Question & {
                correct_answer: string;
                solution_text: string | null;
                solution_image_url: string | null;
                video_solution_url: string | null;
            };
        });

        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('question_id, answer, status, is_correct, marks_obtained, time_spent_seconds, visit_count, updated_at')
            .eq('attempt_id', attemptId);

        if (responsesError) return { success: false, error: 'Failed to fetch responses' };

        return {
            success: true,
            data: {
                attempt: attempt as Attempt,
                questions: mergedQuestions as Array<Question & { correct_answer: string }>,
                responses: responses as Array<{
                    question_id: string;
                    answer: string | null;
                    status?: string | null;
                    is_correct: boolean | null;
                    marks_obtained: number | null;
                    time_spent_seconds?: number | null;
                    visit_count?: number | null;
                    updated_at?: string | null;
                }>,
            },
        };
    } catch (error) {
        logger.error('fetchExamResults error', error, { attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// PAUSE EXAM
// =============================================================================

export async function pauseExam(data: {
    attemptId: string;
    timeRemaining: TimeRemaining;
    currentSection: SectionName;
    currentQuestion: number;
}): Promise<ActionResult<void>> {
    try {
        const supabase = await sbSSR();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Authentication required' };

        // Client hint timeRemaining is intentionally unused; RPC is server-authoritative.
        const { error: rpcError } = await supabase.rpc('pause_exam_state', {
            p_attempt_id: data.attemptId,
            p_current_section: data.currentSection,
            p_current_question: data.currentQuestion,
        });

        if (!rpcError) return { success: true };

        const msg = rpcError.message || 'Failed to pause exam';

        if (msg.includes('Unauthorized')) return { success: false, error: 'Unauthorized' };
        if (msg.includes('not in progress')) return { success: false, error: 'Attempt is not in progress' };
        if (msg.includes('not allowed')) return { success: false, error: 'Pause is not allowed for this paper' };
        if (msg.includes('not found')) return { success: false, error: 'Attempt not found' };

        logger.error('pauseExam RPC error', rpcError, { attemptId: data.attemptId });
        return { success: false, error: 'Failed to pause exam' };
    } catch (error) {
        logger.error('pauseExam error', error, { attemptId: data.attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}
