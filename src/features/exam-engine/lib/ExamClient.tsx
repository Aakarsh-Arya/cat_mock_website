/**
 * @fileoverview Exam Client Component
 * @description Client-side exam interface that integrates with the exam engine
 * @blueprint Milestone 4 SOP-SSOT - Integration
 * 
 * PHASE 4 FIX: Robust submission with better error handling
 * PHASE 5: Cleanup - localStorage key hygiene
 */

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useExamStore,
    ExamLayout,
} from '@/features/exam-engine';
import {
    saveResponse,
    saveResponsesBatch,
    updateAttemptProgress,
    submitExam,
    pauseExam,
    initializeExamSession,
} from '@/features/exam-engine/api/client';
import { logger, examLogger } from '@/lib/logger';
import { examDebug, cleanupOrphanedExamState } from '@/lib/examDebug';
import { DevToolsPanel } from '@/features/exam-engine/ui/DevToolsPanel';
import { isDevSyncPaused } from '@/lib/devTools';
import type { Paper, Question, Attempt, SectionName, TimeRemaining, Response } from '@/types/exam';
import { getSectionByIndex } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamClientProps {
    paper: Paper;
    questions: Question[];
    attempt: Attempt;
    responses?: Response[];
}

type BatchSaveItem = {
    questionId: string;
    answer: string | null;
    status: string;
    isMarkedForReview: boolean;
    isVisited: boolean;
    timeSpentSeconds: number;
    visitCount?: number;
};

type BatchSaveResult = { success: boolean; failedQuestionIds?: string[] };

type SubmissionStage = 'idle' | 'validating' | 'saving' | 'submitting' | 'finalizing';

type SubmissionProgress = {
    percent: number;
    activeLabel?: string;
    steps: Array<{ label: string; status: 'pending' | 'active' | 'done' }>;
};

const SUBMISSION_STEP_LABELS: Record<Exclude<SubmissionStage, 'idle'>, string> = {
    validating: 'Validating session',
    saving: 'Saving responses',
    submitting: 'Submitting exam',
    finalizing: 'Preparing analysis',
};

const SUBMISSION_STAGE_ORDER: Array<Exclude<SubmissionStage, 'idle'>> = [
    'validating',
    'saving',
    'submitting',
    'finalizing',
];

// =============================================================================
// DEBOUNCE HELPER
// =============================================================================

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        }) as T,
        [delay]
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const AUTO_SAVE_INTERVAL_MS = 60000;
const PROGRESS_DEBOUNCE_MS = 1000;
const EXAM_LAYOUT_MODE = (process.env.NEXT_PUBLIC_EXAM_LAYOUT_MODE ?? 'current') as
    | 'current'
    | 'three-column';

export function ExamClient({ paper, questions, attempt, responses: serverResponses }: ExamClientProps) {
    const router = useRouter();

    // Store actions
    const initializeExam = useExamStore((s) => s.initializeExam);
    const setSessionToken = useExamStore((s) => s.setSessionToken);
    const setSubmitting = useExamStore((s) => s.setSubmitting);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const attemptId = attempt.id;
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const sectionTimers = useExamStore((s) => s.sectionTimers);
    const responses = useExamStore((s) => s.responses);
    const isSubmitting = useExamStore((s) => s.isSubmitting);
    const isAutoSubmitting = useExamStore((s) => s.isAutoSubmitting);
    const sessionToken = useExamStore((s) => s.sessionToken);
    const submissionIdRef = useRef<string>(
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    );

    const [sessionConflict, setSessionConflict] = useState<
        | { type: 'save'; payload: Parameters<typeof saveResponse>[0] }
        | { type: 'submit' }
        | null
    >(null);
    const [isResolvingConflict, setIsResolvingConflict] = useState(false);
    const [uiError, setUiError] = useState<string | null>(null);
    const [submissionProgress, setSubmissionProgress] = useState<SubmissionProgress | null>(null);

    const updateSubmissionProgress = useCallback((stage: Exclude<SubmissionStage, 'idle'>, percent: number) => {
        const stageIndex = SUBMISSION_STAGE_ORDER.indexOf(stage);
        const steps = SUBMISSION_STAGE_ORDER.map((step, index) => ({
            label: SUBMISSION_STEP_LABELS[step],
            status: index < stageIndex ? 'done' : index === stageIndex ? 'active' : 'pending',
        })) as SubmissionProgress['steps'];

        setSubmissionProgress({
            percent,
            activeLabel: SUBMISSION_STEP_LABELS[stage],
            steps,
        });
    }, []);

    // Initialize exam on mount - but only once per session
    // The initializeExam function now handles the case where state is already loaded
    useEffect(() => {
        // PHASE 5: Clean up orphaned temp state
        cleanupOrphanedExamState();

        // Always call initializeExam. It will preserve state for the same attempt,
        // and reset if a different attempt is detected (e.g., stale persisted data).
        examDebug.log('Initializing exam', { attemptId: attempt.id, paperId: paper.id });
        initializeExam({
            paper,
            questions,
            attempt,
            responses: serverResponses,
        });
    }, [paper, questions, attempt, serverResponses, initializeExam, hasHydrated]);

    useEffect(() => {
        if (!isSubmitting && !isAutoSubmitting) {
            setSubmissionProgress(null);
        }
    }, [isSubmitting, isAutoSubmitting]);

    // Initialize session token server-side (RPC) once per mount
    useEffect(() => {
        const initializeSession = async () => {
            const result = await initializeExamSession(attempt.id);
            if (result.success && result.data?.sessionToken) {
                setSessionToken(result.data.sessionToken);
            }
        };

        void initializeSession();
    }, [attempt.id, setSessionToken]);

    const flushInProgressRef = useRef(false);
    // Prevent race conditions when saving the same question multiple times
    const savingQuestionsRef = useRef<Set<string>>(new Set());
    const getPersistedAnswer = useCallback((status: string, answer: string | null) => {
        return status === 'answered' || status === 'answered_marked' ? answer : null;
    }, []);

    const flushNow = useCallback(async () => {
        if (!attemptId) return;
        if (isDevSyncPaused()) return;
        if (flushInProgressRef.current) return;
        flushInProgressRef.current = true;

        try {
            const timeRemaining: TimeRemaining = {
                VARC: sectionTimers.VARC.remainingSeconds,
                DILR: sectionTimers.DILR.remainingSeconds,
                QA: sectionTimers.QA.remainingSeconds,
            };

            const currentSection = getSectionByIndex(currentSectionIndex);

            await updateAttemptProgress({
                attemptId,
                timeRemaining,
                currentSection,
                currentQuestion: currentQuestionIndex + 1,
            });
        } catch (error) {
            logger.warn('Flush progress failed', error);
        }

        try {
            if (sessionToken) {
                const batch = Object.entries(responses)
                    .filter(([, response]) => response.answer !== null || response.status !== 'not_visited')
                    .map(([questionId, response]) => ({
                        questionId,
                        answer: getPersistedAnswer(response.status, response.answer),
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        isVisited: response.status !== 'not_visited',
                        timeSpentSeconds: response.timeSpentSeconds,
                        visitCount: response.visitCount,
                    }));

                if (batch.length > 0) {
                    const batchResult = await saveResponsesBatch({
                        attemptId,
                        sessionToken,
                        responses: batch,
                    });
                    if (!batchResult.success) {
                        logger.warn('Flush responses failed', batchResult.error, { attemptId });
                    }
                }
            }
        } catch (error) {
            logger.warn('Flush responses failed', error);
        } finally {
            flushInProgressRef.current = false;
        }
    }, [attemptId, sectionTimers, currentSectionIndex, currentQuestionIndex, responses, sessionToken, getPersistedAnswer]);

    // Debounced save to server
    const debouncedSaveProgress = useDebouncedCallback(
        async (sectionTimers: Record<SectionName, { remainingSeconds: number }>) => {
            if (!attemptId) return;
            if (isDevSyncPaused()) return;

            const timeRemaining: TimeRemaining = {
                VARC: sectionTimers.VARC.remainingSeconds,
                DILR: sectionTimers.DILR.remainingSeconds,
                QA: sectionTimers.QA.remainingSeconds,
            };

            const currentSection = getSectionByIndex(currentSectionIndex);

            await updateAttemptProgress({
                attemptId,
                timeRemaining,
                currentSection,
                currentQuestion: currentQuestionIndex + 1,
            });
        },
        PROGRESS_DEBOUNCE_MS
    );

    // Auto-save progress periodically
    useEffect(() => {
        if (!attemptId || !hasHydrated) return;

        const interval = setInterval(() => {
            debouncedSaveProgress(sectionTimers);
        }, AUTO_SAVE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [attemptId, hasHydrated, sectionTimers, debouncedSaveProgress]);

    // Save on exit / visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                void flushNow();
            }
        };

        const handlePageHide = () => {
            void flushNow();
        };

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!attemptId || isSubmitting || isAutoSubmitting) return;
            event.preventDefault();
            event.returnValue = '';
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [attemptId, isSubmitting, isAutoSubmitting, flushNow]);

    // Handle individual response save
    const handleSaveResponse = useCallback(async (
        questionId: string,
        answer: string | null
    ) => {
        if (!attemptId) return;
        if (isDevSyncPaused()) return;

        // Prevent concurrent saves for the same question
        if (savingQuestionsRef.current.has(questionId)) {
            return;
        }
        savingQuestionsRef.current.add(questionId);

        try {
            const response = responses[questionId];
            if (!response) return;

            const persistedAnswer = getPersistedAnswer(response.status, answer);
            const result = await saveResponse({
                attemptId,
                questionId,
                answer: persistedAnswer,
                status: response.status,
                isMarkedForReview: response.isMarkedForReview,
                isVisited: response.status !== 'not_visited',
                timeSpentSeconds: response.timeSpentSeconds,
                visitCount: response.visitCount,
                sessionToken,
            });
            if (!result.success && result.error === 'SESSION_CONFLICT') {
                setSessionConflict({
                    type: 'save',
                    payload: {
                        attemptId,
                        questionId,
                        answer: persistedAnswer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        isVisited: response.status !== 'not_visited',
                        timeSpentSeconds: response.timeSpentSeconds,
                        visitCount: response.visitCount,
                        sessionToken,
                    },
                });
            }
        } finally {
            savingQuestionsRef.current.delete(questionId);
        }
    }, [attemptId, responses, sessionToken, getPersistedAnswer]);

    const handleSaveResponsesBatch = useCallback(async (items: BatchSaveItem[]): Promise<BatchSaveResult> => {
        if (!attemptId) return { success: false };
        if (isDevSyncPaused()) return { success: false };
        if (!sessionToken) return { success: false };

        const result = await saveResponsesBatch({
            attemptId,
            sessionToken,
            responses: items,
        });

        if (!result.success) {
            if (result.error === 'SESSION_CONFLICT') {
                logger.warn('Session conflict during batch save', { attemptId });
            }
            return { success: false };
        }

        return { success: true };
    }, [attemptId, sessionToken]);

    // Handle section expiry
    const handleSectionExpire = useCallback(async (sectionName: SectionName) => {
        examLogger.sectionExpired(attemptId || '', sectionName);

        // Save all current responses for this section before transitioning
        if (!attemptId) return;
        if (isDevSyncPaused()) return;

        // Find questions in this section and save their responses
        const sectionQuestions = questions.filter(q => q.section === sectionName);

        if (sessionToken) {
            const batch = sectionQuestions
                .map((q) => {
                    const response = responses[q.id];
                    if (!response || (response.answer === null && response.status === 'not_visited')) {
                        return null;
                    }
                    return {
                        questionId: q.id,
                        answer: getPersistedAnswer(response.status, response.answer),
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        isVisited: response.status !== 'not_visited',
                        timeSpentSeconds: response.timeSpentSeconds,
                        visitCount: response.visitCount,
                    };
                })
                .filter(Boolean) as Array<{
                    questionId: string;
                    answer: string | null;
                    status: string;
                    isMarkedForReview: boolean;
                    isVisited: boolean;
                    timeSpentSeconds: number;
                    visitCount?: number;
                }>;

            if (batch.length > 0) {
                const batchResult = await saveResponsesBatch({
                    attemptId: attemptId!,
                    sessionToken,
                    responses: batch,
                });
                if (!batchResult.success) {
                    logger.warn('Section save batch failed', batchResult.error, { attemptId });
                }
            }
        }
    }, [attemptId, questions, responses, sessionToken, getPersistedAnswer]);

    /**
     * Force get a fresh session token from server.
     * Always calls API, regardless of existing token.
     */
    const forceRefreshSessionToken = useCallback(async (): Promise<string | null> => {
        if (!attemptId) return null;

        const result = await initializeExamSession(attemptId);

        // Handle explicit error cases
        if (result.error) {
            logger.warn('Failed to refresh session token', { attemptId, error: result.error });
            return null;
        }

        if (result.success && result.data?.sessionToken) {
            setSessionToken(result.data.sessionToken);
            return result.data.sessionToken;
        }

        logger.warn('Failed to refresh session token - no token returned', { attemptId });
        return null;
    }, [attemptId, setSessionToken]);

    // RACE CONDITION FIX: Mutex lock to prevent concurrent submits
    const submitLockRef = useRef<boolean>(false);

    // Handle exam submit
    const handleSubmitExam = useCallback(async () => {
        if (!attemptId) return;

        // CRITICAL: Atomic check-and-set to prevent race conditions
        if (submitLockRef.current) {
            logger.warn('Submit already in progress, ignoring duplicate call', { attemptId });
            return;
        }
        submitLockRef.current = true;

        // Also check isSubmitting/isAutoSubmitting flags
        if (isSubmitting || isAutoSubmitting) {
            logger.warn('Submit blocked by isSubmitting/isAutoSubmitting flag', { attemptId, isSubmitting, isAutoSubmitting });
            submitLockRef.current = false;
            return;
        }

        setSubmitting(true);
        setUiError(null);
        updateSubmissionProgress('validating', 15);

        try {
            // CRITICAL: Always get a fresh session token before submit
            // This ensures we have a valid token even if the old one expired
            let activeSessionToken = await forceRefreshSessionToken();
            if (!activeSessionToken) {
                setUiError('Unable to establish session. Please check your connection and try again.');
                return;
            }

            // PHASE 4: Debug logging for submit attempt
            examDebug.submitAttempt({
                attemptId,
                sessionToken: activeSessionToken,
                submissionId: submissionIdRef.current,
                responsesCount: Object.keys(responses).length,
            });

            // PHASE 4 FIX: Batch-save remaining responses before submit (best-effort)
            try {
                updateSubmissionProgress('saving', 45);
                const batch = Object.entries(responses)
                    .filter(([, response]) => response.answer !== null || response.status !== 'not_visited')
                    .map(([questionId, response]) => ({
                        questionId,
                        answer: getPersistedAnswer(response.status, response.answer),
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        isVisited: response.status !== 'not_visited',
                        timeSpentSeconds: response.timeSpentSeconds,
                        visitCount: response.visitCount,
                    }));

                if (batch.length > 0) {
                    const batchResult = await saveResponsesBatch({
                        attemptId: attemptId!,
                        sessionToken: activeSessionToken,
                        responses: batch,
                    });
                    if (!batchResult.success) {
                        examDebug.warn('Some saves failed during submit', { error: batchResult.error });
                    }
                }
            } catch (err) {
                logger.warn('Some responses failed to save during submit', err);
            }

            updateSubmissionProgress('submitting', 75);
            // Submit exam - proceed regardless of save failures
            const result = await submitExam({
                attemptId,
                sessionToken: activeSessionToken,
                submissionId: submissionIdRef.current,
            });

            // PHASE 4: Debug logging for submit result
            examDebug.submitResult({
                success: result.success,
                error: result.error,
                attemptId,
            });

            if (result.success) {
                updateSubmissionProgress('finalizing', 100);
                // PHASE 5: Clear localStorage - both the specific key and temp key
                localStorage.removeItem(`cat-exam-state-${attemptId}`);
                cleanupOrphanedExamState();

                // Redirect to results
                router.push(`/result/${attemptId}`);
                return;
            }

            if (result.error === 'ATTEMPT_NOT_FOUND' || result.error?.toLowerCase().includes('attempt not found')) {
                localStorage.removeItem(`cat-exam-state-${attemptId}`);
                cleanupOrphanedExamState();
                setUiError('This exam attempt was removed. Please restart from the dashboard.');
                router.push('/dashboard');
                return;
            }

            // Handle retry scenarios
            const shouldRetry =
                result.error === 'Failed to validate session' ||
                result.error === 'INVALID_SESSION_TOKEN' ||
                result.error === 'Missing session token' ||
                result.error?.includes('session') ||
                result.error?.includes('VALIDATION_RPC_ERROR');

            if (shouldRetry) {
                logger.warn('Session validation failed, attempting retry with force_resume', { attemptId, error: result.error });

                // Get a completely fresh token
                updateSubmissionProgress('validating', 20);
                const refreshed = await forceRefreshSessionToken();
                if (refreshed) {
                    // CRITICAL: Use force_resume on retry to bypass validation issues
                    updateSubmissionProgress('submitting', 80);
                    const retry = await submitExam({
                        attemptId,
                        sessionToken: refreshed,
                        submissionId: submissionIdRef.current,
                        force_resume: true,  // Force resume on retry
                    });

                    if (retry.success) {
                        updateSubmissionProgress('finalizing', 100);
                        localStorage.removeItem(`cat-exam-state-${attemptId}`);
                        cleanupOrphanedExamState();
                        router.push(`/result/${attemptId}`);
                        return;
                    }

                    // If retry also fails with session conflict, show dialog
                    if (retry.error === 'SESSION_CONFLICT') {
                        setSessionConflict({ type: 'submit' });
                        return;
                    }

                    logger.error('Submit retry failed', retry.error, { attemptId });
                }
            }

            if (result.error === 'SESSION_CONFLICT') {
                setSessionConflict({ type: 'submit' });
                return;
            }

            logger.error('Failed to submit exam', result.error, { attemptId });

            // PHASE 4 FIX: Show more specific error message
            const errorMessage = result.error === 'INVALID_ATTEMPT_STATUS'
                ? 'Exam has already been submitted or is in an invalid state.'
                : result.error === 'ATTEMPT_NOT_FOUND' || result.error?.toLowerCase().includes('attempt not found')
                    ? 'This exam attempt was removed. Please restart from the dashboard.'
                    : result.error === 'INVALID_SESSION_TOKEN' || result.error?.includes('session')
                        ? 'Session expired. Please try submitting again.'
                        : `Failed to submit exam. Please try again. (${result.error || 'Unknown error'})`;
            setUiError(errorMessage);
        } finally {
            submitLockRef.current = false;
            setSubmitting(false);
        }
    }, [attemptId, responses, router, setUiError, getPersistedAnswer, forceRefreshSessionToken, isSubmitting, isAutoSubmitting, setSubmitting]);

    const handleResolveConflict = useCallback(async (resumeHere: boolean) => {
        if (!sessionConflict) return;

        if (!resumeHere) {
            setSessionConflict(null);
            return;
        }

        setIsResolvingConflict(true);
        try {
            // CRITICAL: Get a fresh session token before retrying
            const freshToken = await forceRefreshSessionToken();
            if (!freshToken) {
                setUiError('Unable to establish session. Please check your connection.');
                return;
            }

            if (sessionConflict.type === 'save') {
                const retry = await saveResponse({
                    ...sessionConflict.payload,
                    sessionToken: freshToken,
                    force_resume: true,
                });
                if (!retry.success && retry.error !== 'SESSION_CONFLICT') {
                    logger.error('Force resume save failed', retry.error);
                    setUiError('Failed to save response. Your progress may not be saved.');
                }
            }

            if (sessionConflict.type === 'submit') {
                const retry = await submitExam({
                    attemptId: attemptId!,
                    sessionToken: freshToken,
                    force_resume: true,
                    submissionId: submissionIdRef.current,
                });
                if (retry.success) {
                    localStorage.removeItem(`cat-exam-state-${attemptId}`);
                    cleanupOrphanedExamState();
                    router.push(`/result/${attemptId}`);
                } else if (retry.error === 'ATTEMPT_NOT_FOUND' || retry.error?.toLowerCase().includes('attempt not found')) {
                    localStorage.removeItem(`cat-exam-state-${attemptId}`);
                    cleanupOrphanedExamState();
                    setUiError('This exam attempt was removed. Please restart from the dashboard.');
                    router.push('/dashboard');
                } else if (retry.error !== 'SESSION_CONFLICT') {
                    logger.error('Force resume submit failed', retry.error, { attemptId });
                    setUiError('Failed to submit exam. Please try again.');
                }
            }
        } finally {
            setIsResolvingConflict(false);
            setSessionConflict(null);
        }
    }, [sessionConflict, attemptId, router, forceRefreshSessionToken, setUiError]);

    // Handle pause exam
    const handlePauseExam = useCallback(async () => {
        if (!attemptId) return;
        setUiError(null);

        const confirmed = window.confirm(
            'Are you sure you want to pause the exam? You can resume it later from the dashboard.'
        );

        if (!confirmed) return;

        // Get fresh session token before pausing
        const activeSessionToken = sessionToken || await forceRefreshSessionToken();

        // Save all current responses with session token
        await Promise.all(
            Object.entries(responses).map(async ([questionId, response]) => {
                if (response.answer !== null || response.status !== 'not_visited') {
                    await saveResponse({
                        attemptId: attemptId!,
                        questionId,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                        visitCount: response.visitCount,
                        sessionToken: activeSessionToken,
                    });
                }
            })
        );

        // Build time remaining from current section timers
        const timeRemaining: TimeRemaining = {
            VARC: sectionTimers.VARC.remainingSeconds,
            DILR: sectionTimers.DILR.remainingSeconds,
            QA: sectionTimers.QA.remainingSeconds,
        };

        const currentSection = getSectionByIndex(currentSectionIndex);

        // Pause the exam with session token
        const result = await pauseExam({
            attemptId,
            timeRemaining,
            currentSection,
            currentQuestion: currentQuestionIndex + 1,
            sessionToken: activeSessionToken,
        });

        if (result.success) {
            // Clear local storage
            localStorage.removeItem(`cat-exam-state-${attemptId}`);

            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            examLogger.examPaused(attemptId, false, result.error);
            // Show more helpful error message for pause-not-allowed
            const errorMessage = result.error?.includes('not allowed')
                ? 'Pausing is not allowed for this exam.'
                : 'Failed to pause exam. Please try again.';
            setUiError(errorMessage);
        }
    }, [attemptId, responses, sectionTimers, currentSectionIndex, currentQuestionIndex, router, sessionToken, forceRefreshSessionToken, setUiError]);

    // Show loading while initializing
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {uiError && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-sm" role="alert">
                    {uiError}
                </div>
            )}
            <ExamLayout
                paper={paper}
                questions={questions}
                onSaveResponse={handleSaveResponse}
                onSaveResponsesBatch={handleSaveResponsesBatch}
                onSubmitExam={handleSubmitExam}
                onSectionExpire={handleSectionExpire}
                onPauseExam={handlePauseExam}
                layoutMode={EXAM_LAYOUT_MODE}
                submissionProgress={submissionProgress}
            />

            {sessionConflict && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Active session detected
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            You have an active session on another device. Do you want to terminate it and resume here?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => handleResolveConflict(false)}
                                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                disabled={isResolvingConflict}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleResolveConflict(true)}
                                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                disabled={isResolvingConflict}
                            >
                                {isResolvingConflict ? 'Resuming...' : 'Resume Here'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dev-only testing panel - completely removed in production */}
            {process.env.NODE_ENV === 'development' && (
                <DevToolsPanel onTriggerSubmit={handleSubmitExam} />
            )}
        </>
    );
}
