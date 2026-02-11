/**
 * @fileoverview Exam Client Component
 * @description Client-side exam interface that integrates with the exam engine
 * @blueprint Milestone 4 SOP-SSOT - Integration
 *
 * PHASE 4 FIX: Robust submission with better error handling
 * PHASE 5: Cleanup - localStorage key hygiene
 *
 * PATCH (2026-01-30): Session-token hardening
 * - Ensure every save/submit uses a server-issued session token
 * - Avoid retry requiring a second token refresh (use same token + force_resume)
 * - Graceful fallback if token refresh fails mid-submit
 */

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore, ExamLayout } from '@/features/exam-engine';
import {
    saveResponse,
    updateAttemptProgress,
    submitExam,
    pauseExam,
    initializeExamSession,
} from '@/features/exam-engine/api/client';
import { logger, examLogger } from '@/lib/logger';
import { examDebug, cleanupOrphanedExamState, clearAllExamState } from '@/lib/examDebug';
import { DevToolsPanel } from '@/features/exam-engine/ui/DevToolsPanel';
import { isDevSyncPaused } from '@/lib/devTools';
import { sb } from '@/lib/supabase/client';
import type { Paper, Question, Attempt, SectionName, TimeRemaining, Response, SectionTimerState } from '@/types/exam';
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

// =============================================================================
// HELPERS
// =============================================================================

const AUTO_SAVE_INTERVAL_MS = 60000;
const PROGRESS_DEBOUNCE_MS = 1000;
const MAX_BEACON_BYTES = 60 * 1024;
const EXAM_LAYOUT_MODE = (process.env.NEXT_PUBLIC_EXAM_LAYOUT_MODE ?? 'current') as 'current' | 'three-column';

type SectionTimersSnapshot = Partial<Record<SectionName, Pick<SectionTimerState, 'remainingSeconds'>>>;

function getPersistedAnswer(_status: string, answer: string | null) {
    // FIX: Never erase a valid answer just because status hasn't caught up.
    // Old logic gated on status === 'answered'|'answered_marked', which drops
    // answers when the status is still 'visited' due to a race condition.
    return answer !== null && answer.trim() !== '' ? answer : null;
}

function buildTimeRemainingSafe(timers: SectionTimersSnapshot | null | undefined): TimeRemaining | null {
    const varc = timers?.VARC?.remainingSeconds;
    const dilr = timers?.DILR?.remainingSeconds;
    const qa = timers?.QA?.remainingSeconds;

    if (typeof varc !== 'number' || typeof dilr !== 'number' || typeof qa !== 'number') return null;

    return { VARC: varc, DILR: dilr, QA: qa };
}

// Most Supabase-style tokens are UUIDs; if yours is TEXT, this still works (we just refresh more often).
function isProbablyUUID(v: unknown): v is string {
    if (typeof v !== 'string') return false;
    const s = v.trim();
    if (!s) return false;
    const uuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuid.test(s);
}

function isNonEmptyString(v: unknown): v is string {
    return typeof v === 'string' && v.trim().length > 0;
}

// =============================================================================
// DEBOUNCE HELPER
// =============================================================================

function useDebouncedCallback<Args extends unknown[], R>(
    callback: (...args: Args) => R,
    delay: number
): ((...args: Args) => void) & { cancel: () => void } {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const debounced = useCallback(
        (...args: Args) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    ) as ((...args: Args) => void) & { cancel: () => void };

    debounced.cancel = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    };

    return debounced;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExamClient({ paper, questions, attempt, responses: serverResponses }: ExamClientProps) {
    const router = useRouter();

    // Store actions / state
    const initializeExam = useExamStore((s) => s.initializeExam);
    const setSessionToken = useExamStore((s) => s.setSessionToken);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const isInitialized = useExamStore((s) => s.isInitialized);
    const attemptId = useExamStore((s) => s.attemptId);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const sectionTimers = useExamStore((s) => s.sectionTimers);
    const responses = useExamStore((s) => s.responses);
    const isSubmitting = useExamStore((s) => s.isSubmitting);
    const isAutoSubmitting = useExamStore((s) => s.isAutoSubmitting);
    const sessionToken = useExamStore((s) => s.sessionToken);
    const setSubmitting = useExamStore((s) => s.setSubmitting);
    const setAutoSubmitting = useExamStore((s) => s.setAutoSubmitting);

    // Refs to avoid effect re-binding / stale values in event listeners & intervals
    const attemptIdRef = useRef<typeof attemptId>(attemptId);
    const currentSectionIndexRef = useRef(currentSectionIndex);
    const currentQuestionIndexRef = useRef(currentQuestionIndex);
    const sectionTimersRef = useRef(sectionTimers);
    const responsesRef = useRef(responses);
    const isSubmittingRef = useRef(isSubmitting);
    const isAutoSubmittingRef = useRef(isAutoSubmitting);
    const sessionTokenRef = useRef(sessionToken);

    // Keep refs fresh every render
    attemptIdRef.current = attemptId;
    currentSectionIndexRef.current = currentSectionIndex;
    currentQuestionIndexRef.current = currentQuestionIndex;
    sectionTimersRef.current = sectionTimers;
    responsesRef.current = responses;
    isSubmittingRef.current = isSubmitting;
    isAutoSubmittingRef.current = isAutoSubmitting;
    sessionTokenRef.current = sessionToken;

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
    const [showAuthExpiredModal, setShowAuthExpiredModal] = useState(false);

    // Track if we've already attempted initialization
    const initAttemptedRef = useRef(false);
    const sessionInitRef = useRef(false);
    const flushInProgressRef = useRef(false);

    // Single-flight session initialization to prevent token spam
    const sessionTokenPromiseRef = useRef<Promise<string | null> | null>(null);

    const ensureSessionToken = useCallback(
        async (opts?: { force?: boolean; reason?: string }): Promise<string | null> => {
            const force = opts?.force === true;
            const reason = opts?.reason ?? 'unknown';

            const current = sessionTokenRef.current;

            // If we already have a server-looking token and not forcing, reuse it.
            // (If your tokens are TEXT not UUID, still OK: force refresh on submit handles correctness.)
            if (!force && isNonEmptyString(current) && isProbablyUUID(current)) {
                return current;
            }

            // De-dupe concurrent refreshes
            if (sessionTokenPromiseRef.current) return sessionTokenPromiseRef.current;

            const aId = attemptIdRef.current ?? attempt.id;

            sessionTokenPromiseRef.current = (async () => {
                try {
                    const result = await initializeExamSession(aId);
                    if (result.success && isNonEmptyString(result.data?.sessionToken)) {
                        const token = result.data!.sessionToken;
                        setSessionToken(token);
                        return token;
                    }

                    // Refresh failed: fall back to whatever we have (better than null)
                    if (isNonEmptyString(current)) {
                        logger.warn('ensureSessionToken: refresh failed; using existing token', {
                            attemptId: aId,
                            reason,
                        });
                        return current;
                    }

                    logger.warn('ensureSessionToken: no token available', { attemptId: aId, reason });
                    return null;
                } catch (e) {
                    // Same fallback behavior on exception
                    if (isNonEmptyString(current)) {
                        logger.warn('ensureSessionToken: exception; using existing token', e, {
                            attemptId: aId,
                            reason,
                        });
                        return current;
                    }
                    logger.warn('ensureSessionToken: exception; no token available', e, { attemptId: aId, reason });
                    return null;
                } finally {
                    sessionTokenPromiseRef.current = null;
                }
            })();

            return sessionTokenPromiseRef.current;
        },
        [attempt.id, setSessionToken]
    );

    /**
     * Force get a fresh session token from server.
     * Always calls API; falls back to existing token if refresh fails.
     */
    const forceRefreshSessionToken = useCallback(async (): Promise<string | null> => {
        return ensureSessionToken({ force: true, reason: 'forceRefreshSessionToken' });
    }, [ensureSessionToken]);

    // Initialize exam on mount - but only once per session
    useEffect(() => {
        cleanupOrphanedExamState(attempt.id);

        if (!initAttemptedRef.current) {
            initAttemptedRef.current = true;
            examDebug.log('Initializing exam', { attemptId: attempt.id, paperId: paper.id });
            initializeExam({
                paper,
                questions,
                attempt,
                responses: serverResponses,
            });
        }
    }, [paper, questions, attempt, serverResponses, initializeExam]);

    // Initialize session token server-side (RPC) once per mount
    useEffect(() => {
        if (sessionInitRef.current) return;
        sessionInitRef.current = true;

        void ensureSessionToken({ force: true, reason: 'initial-mount' });
    }, [ensureSessionToken]);

    const flushNow = useCallback(async () => {
        const aId = attemptIdRef.current ?? attempt.id;
        if (!aId) return;
        if (!isInitialized) return;
        if (isDevSyncPaused()) return;
        if (isSubmittingRef.current || isAutoSubmittingRef.current) return;
        if (flushInProgressRef.current) return;

        const timers = sectionTimersRef.current;
        const timeRemaining = buildTimeRemainingSafe(timers);
        if (!timeRemaining) return;

        flushInProgressRef.current = true;

        try {
            await updateAttemptProgress({
                attemptId: aId,
                timeRemaining,
                currentSection: getSectionByIndex(currentSectionIndexRef.current),
                currentQuestion: currentQuestionIndexRef.current + 1,
            });
        } catch (error) {
            logger.warn('Flush progress failed', error);
        }

        try {
            const token = await ensureSessionToken({ reason: 'flushNow' });
            if (!token) return;

            const snapshot = responsesRef.current;

            await Promise.all(
                Object.entries(snapshot).map(async ([questionId, response]) => {
                    if (response.answer === null && response.status === 'not_visited') return;

                    const persistedAnswer = getPersistedAnswer(response.status, response.answer);

                    await saveResponse({
                        attemptId: aId,
                        questionId,
                        answer: persistedAnswer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        isVisited: response.status !== 'not_visited',
                        timeSpentSeconds: response.timeSpentSeconds,
                        sessionToken: token,
                    });
                })
            );
        } catch (error) {
            logger.warn('Flush responses failed', error);
        } finally {
            flushInProgressRef.current = false;
        }
    }, [attempt.id, ensureSessionToken, isInitialized]);

    // Debounced save to server (wrap in try/catch to avoid unhandled rejections)
    const debouncedSaveProgress = useDebouncedCallback(
        async (timers: Record<SectionName, SectionTimerState>) => {
            const aId = attemptIdRef.current ?? attempt.id;
            if (!aId) return;
            if (isDevSyncPaused()) return;
            if (isSubmittingRef.current || isAutoSubmittingRef.current) return;

            const timeRemaining: TimeRemaining = {
                VARC: timers.VARC.remainingSeconds,
                DILR: timers.DILR.remainingSeconds,
                QA: timers.QA.remainingSeconds,
            };

            try {
                await updateAttemptProgress({
                    attemptId: aId,
                    timeRemaining,
                    currentSection: getSectionByIndex(currentSectionIndexRef.current),
                    currentQuestion: currentQuestionIndexRef.current + 1,
                });
            } catch (e) {
                logger.warn('Auto-save progress failed', e, { attemptId: aId });
            }
        },
        PROGRESS_DEBOUNCE_MS
    );

    // Auto-save progress periodically (do NOT re-create interval on every timer tick)
    useEffect(() => {
        if (!attemptId || !isInitialized) return;
        if (isSubmittingRef.current || isAutoSubmittingRef.current) return;

        const interval = setInterval(() => {
            debouncedSaveProgress(sectionTimersRef.current);
        }, AUTO_SAVE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [attemptId, isInitialized, debouncedSaveProgress]);

    // Save on exit / visibility changes (bind once; handlers read refs)
    // Use sendBeacon for pagehide/visibility to ensure data is persisted even during unload
    useEffect(() => {
        const sendBeaconBatchSave = () => {
            if (!isInitialized) return;
            const aId = attemptIdRef.current ?? attempt.id;
            if (!aId || isSubmittingRef.current || isAutoSubmittingRef.current) return;

            const snapshot = responsesRef.current;
            const token = sessionTokenRef.current;

            // Build batch of responses to save
            const responses = Object.entries(snapshot)
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

            if (responses.length === 0) return;

            const basePayload = {
                attemptId: aId,
                sessionToken: token,
                force_resume: true,
            };

            const fullPayload = JSON.stringify({ ...basePayload, responses });
            const fullBlob = new Blob([fullPayload], { type: 'application/json' });

            if (fullBlob.size <= MAX_BEACON_BYTES) {
                const sent = navigator.sendBeacon('/api/save-batch', fullBlob);
                if (sent) {
                    logger.info('sendBeacon batch save successful', { attemptId: aId, count: responses.length });
                } else {
                    logger.warn('sendBeacon batch save failed, attempting async flush', { attemptId: aId });
                    void flushNow();
                }
                return;
            }

            const chunks: typeof responses[] = [];
            let currentChunk: typeof responses = [];

            for (const item of responses) {
                currentChunk.push(item);
                const chunkPayload = JSON.stringify({ ...basePayload, responses: currentChunk });
                const chunkSize = new Blob([chunkPayload], { type: 'application/json' }).size;

                if (chunkSize > MAX_BEACON_BYTES) {
                    currentChunk.pop();
                    if (currentChunk.length === 0) {
                        logger.warn('sendBeacon payload too large, falling back to flush', { attemptId: aId });
                        void flushNow();
                        return;
                    }
                    chunks.push(currentChunk);
                    currentChunk = [item];
                }
            }

            if (currentChunk.length) {
                chunks.push(currentChunk);
            }

            for (const chunk of chunks) {
                const chunkPayload = JSON.stringify({ ...basePayload, responses: chunk });
                const sent = navigator.sendBeacon(
                    '/api/save-batch',
                    new Blob([chunkPayload], { type: 'application/json' })
                );
                if (!sent) {
                    logger.warn('sendBeacon chunk failed, attempting async flush', { attemptId: aId });
                    void flushNow();
                    return;
                }
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sendBeaconBatchSave();
            }
        };

        const handlePageHide = () => {
            sendBeaconBatchSave();
        };

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            const aId = attemptIdRef.current ?? attempt.id;
            if (!aId || !isInitialized) return;

            // CRITICAL FIX: Always try to save responses via beacon, even during submission
            // This ensures data is not lost if user reloads during auto-submit
            sendBeaconBatchSave();

            // Only show the "are you sure" prompt if NOT currently submitting
            if (isSubmittingRef.current || isAutoSubmittingRef.current) {
                // During submission, don't prompt but still save
                return;
            }

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
    }, [attempt.id, flushNow, isInitialized]);

    // Handle individual response save
    const handleSaveResponse = useCallback(
        async (questionId: string, answer: string | null) => {
            const aId = attemptIdRef.current ?? attempt.id;
            if (!aId) return;
            if (isDevSyncPaused()) return;
            if (isSubmittingRef.current || isAutoSubmittingRef.current) return;

            const snapshot = responsesRef.current;
            const response = snapshot[questionId];
            if (!response) return;

            const token = await ensureSessionToken({ reason: 'handleSaveResponse' });
            if (!token) return;

            const persistedAnswer = getPersistedAnswer(response.status, answer);

            const payload = {
                attemptId: aId,
                questionId,
                answer: persistedAnswer,
                status: response.status,
                isMarkedForReview: response.isMarkedForReview,
                isVisited: response.status !== 'not_visited',
                timeSpentSeconds: response.timeSpentSeconds,
                sessionToken: token,
            };

            try {
                const result = await saveResponse(payload);
                if (!result.success && result.error === 'SESSION_CONFLICT') {
                    setSessionConflict({ type: 'save', payload });
                }
            } catch (e) {
                logger.warn('Save response failed', e, { attemptId: aId, questionId });
            }
        },
        [attempt.id, ensureSessionToken]
    );

    // Handle section expiry
    const handleSectionExpire = useCallback(
        async (sectionName: SectionName) => {
            const aId = attemptIdRef.current ?? attempt.id;
            examLogger.sectionExpired(aId || '', sectionName);
            if (!aId) return;
            if (isDevSyncPaused()) return;

            setAutoSubmitting(true);
            debouncedSaveProgress.cancel();

            try {
                const token = await ensureSessionToken({ reason: 'handleSectionExpire' });
                if (!token) return;

                const sectionQuestions = questions.filter((q) => q.section === sectionName);
                const snapshot = responsesRef.current;

                await Promise.all(
                    sectionQuestions.map(async (q) => {
                        const response = snapshot[q.id];
                        if (!response || (response.answer === null && response.status === 'not_visited')) return;

                        const persistedAnswer = getPersistedAnswer(response.status, response.answer);

                        const payload = {
                            attemptId: aId,
                            questionId: q.id,
                            answer: persistedAnswer,
                            status: response.status,
                            isMarkedForReview: response.isMarkedForReview,
                            isVisited: response.status !== 'not_visited',
                            timeSpentSeconds: response.timeSpentSeconds,
                            sessionToken: token,
                        };

                        try {
                            const result = await saveResponse(payload);
                            if (!result.success && result.error === 'SESSION_CONFLICT') {
                                setSessionConflict({ type: 'save', payload });
                            }
                        } catch (e) {
                            logger.warn('Failed to save response on section expire', e, {
                                attemptId: aId,
                                questionId: q.id,
                            });
                        }
                    })
                );
            } finally {
                setAutoSubmitting(false);
            }
        },
        [attempt.id, ensureSessionToken, questions, setAutoSubmitting, debouncedSaveProgress]
    );

    // RACE CONDITION FIX: Mutex lock to prevent concurrent submits
    const submitLockRef = useRef<boolean>(false);

    // Helper: Aggressive cleanup of ALL exam localStorage keys
    const clearAllExamStates = useCallback(() => {
        clearAllExamState();
    }, []);

    // Handle exam submit
    const handleSubmitExam = useCallback(async () => {
        const aId = attemptIdRef.current ?? attempt.id;
        if (!aId) return;

        // CRITICAL: Atomic check-and-set IMMEDIATELY to prevent race conditions
        // This handles both timer auto-submit and manual submit racing
        if (submitLockRef.current) {
            logger.warn('Submit already in progress, ignoring duplicate call', { attemptId: aId });
            return;
        }
        submitLockRef.current = true;

        // Also check ref (belt and suspenders). Allow auto-submit to proceed.
        if (isSubmittingRef.current) {
            logger.warn('Submit blocked by isSubmitting flag', {
                attemptId: aId,
                isSubmitting: isSubmittingRef.current,
                isAutoSubmitting: isAutoSubmittingRef.current,
            });
            submitLockRef.current = false;
            return;
        }

        // Set submitting state IMMEDIATELY after lock to inform ExamLayout
        setSubmitting(true);

        debouncedSaveProgress.cancel();
        setUiError(null);

        const { data, error } = await sb().auth.getSession();
        if (error || !data?.session) {
            submitLockRef.current = false;
            setSubmitting(false);
            setShowAuthExpiredModal(true);
            setUiError('Your session has expired. Please sign in again to submit your exam.');
            return;
        }

        try {

            // Get a fresh token (best effort); if refresh fails, fallback to existing token.
            const activeSessionToken = await forceRefreshSessionToken();
            if (!activeSessionToken) {
                setUiError('Unable to establish session. Please check your connection and try again.');
                return;
            }

            const snapshot = responsesRef.current;

            examDebug.submitAttempt({
                attemptId: aId,
                sessionToken: activeSessionToken,
                submissionId: submissionIdRef.current,
                responsesCount: Object.keys(snapshot).length,
            });

            const saveResults: Array<{ questionId: string; success: boolean; error?: string }> = [];

            // Best-effort save before submit (do not block submit if some saves fail)
            try {
                await Promise.all(
                    Object.entries(snapshot).map(async ([questionId, response]) => {
                        if (response.answer === null && response.status === 'not_visited') return;

                        const persistedAnswer = getPersistedAnswer(response.status, response.answer);

                        const payload = {
                            attemptId: aId,
                            questionId,
                            answer: persistedAnswer,
                            status: response.status,
                            isMarkedForReview: response.isMarkedForReview,
                            isVisited: response.status !== 'not_visited',
                            timeSpentSeconds: response.timeSpentSeconds,
                            sessionToken: activeSessionToken,
                        };

                        try {
                            const r = await saveResponse(payload);
                            saveResults.push({ questionId, success: r.success, error: r.error });

                            if (!r.success && r.error === 'SESSION_CONFLICT') {
                                setSessionConflict({ type: 'save', payload });
                            }
                        } catch (err) {
                            logger.warn('Failed to save response during submit', err, { questionId, attemptId: aId });
                            saveResults.push({ questionId, success: false, error: 'SAVE_EXCEPTION' });
                        }
                    })
                );
            } catch (err) {
                logger.warn('Some responses failed to save during submit', err, { attemptId: aId });
            }

            const failedSaves = saveResults.filter((r) => !r.success);
            if (failedSaves.length > 0) {
                examDebug.warn('Some saves failed during submit', { failedSaves });
            }

            const clearLocalExamState = () => {
                // PHASE 2 FIX: Aggressive cleanup - remove ALL cat-exam-state-* keys
                // to prevent zombie states from different/stale attempts
                clearAllExamStates();
            };

            // CRITICAL FIX: Always use force_resume to prevent session conflicts
            // The server now automatically handles session recovery
            const result = await submitExam({
                attemptId: aId,
                sessionToken: activeSessionToken,
                submissionId: submissionIdRef.current,
                force_resume: true, // Always force_resume to prevent stuck submissions
            });

            examDebug.submitResult({
                success: result.success,
                error: result.error,
                attemptId: aId,
            });

            if (result.success) {
                clearLocalExamState();
                router.replace(`/result/${aId}`);
                return;
            }

            const invalidStatus =
                result.error === 'Attempt is not in progress' ||
                result.error === 'INVALID_ATTEMPT_STATUS' ||
                result.error?.toLowerCase().includes('already submitted');
            if (invalidStatus) {
                try {
                    const res = await fetch('/api/attempt-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ attemptId: aId }),
                    });
                    const payload = await res.json().catch(() => ({}));
                    const statusCheck = payload?.data?.status as string | undefined;

                    if (statusCheck === 'submitted' || statusCheck === 'completed') {
                        clearLocalExamState();
                        router.replace(`/result/${aId}`);
                        return;
                    }
                } catch (checkError) {
                    logger.warn('Failed to check attempt status after invalid status', checkError);
                }
            }

            if (result.error === 'Unauthorized' || result.error === 'Authentication required') {
                setShowAuthExpiredModal(true);
                setUiError('Your session has expired. Please sign in again to submit your exam.');
                return;
            }

            if (result.error === 'ATTEMPT_NOT_FOUND' || result.error?.toLowerCase().includes('attempt not found')) {
                // PHASE 2 FIX: Use aggressive cleanup on ATTEMPT_NOT_FOUND
                clearAllExamStates();
                setUiError('This exam attempt was removed. Please restart from the dashboard.');
                router.push('/dashboard');
                return;
            }

            // Session conflict -> let user decide
            if (result.error === 'SESSION_CONFLICT') {
                setSessionConflict({ type: 'submit' });
                return;
            }

            // If validation failed, retry IMMEDIATELY using the SAME token + force_resume.
            // This avoids needing a second token refresh that can fail and leave you stuck.
            const looksLikeSessionValidationFailure =
                result.error === 'Failed to validate session' ||
                result.error === 'INVALID_SESSION_TOKEN' ||
                result.error === 'Missing session token' ||
                (typeof result.error === 'string' && result.error.toLowerCase().includes('session'));

            if (looksLikeSessionValidationFailure) {
                const retry = await submitExam({
                    attemptId: aId,
                    sessionToken: activeSessionToken,
                    submissionId: submissionIdRef.current,
                    force_resume: true,
                });

                if (retry.success) {
                    clearLocalExamState();
                    router.replace(`/result/${aId}`);
                    return;
                }

                if (retry.error === 'SESSION_CONFLICT') {
                    setSessionConflict({ type: 'submit' });
                    return;
                }

                // If server reports stale force-resume token, refresh once and retry force-resume.
                if (retry.error === 'FORCE_RESUME_STALE') {
                    const refreshed = await forceRefreshSessionToken();
                    if (refreshed) {
                        const retry2 = await submitExam({
                            attemptId: aId,
                            sessionToken: refreshed,
                            submissionId: submissionIdRef.current,
                            force_resume: true,
                        });

                        if (retry2.success) {
                            clearLocalExamState();
                            router.replace(`/result/${aId}`);
                            return;
                        }

                        if (retry2.error === 'SESSION_CONFLICT') {
                            setSessionConflict({ type: 'submit' });
                            return;
                        }

                        logger.error('Submit retry (stale->refresh) failed', retry2.error, { attemptId: aId });
                        setUiError('Failed to submit exam. Please try again.');
                        return;
                    }
                }

                logger.error('Submit retry (force_resume) failed', retry.error, { attemptId: aId });
                setUiError('Failed to submit exam. Please try again.');
                return;
            }

            // Non-session-related errors
            logger.error('Failed to submit exam', result.error, { attemptId: aId });

            const finalError = result.error;

            const errorMessage =
                finalError === 'INVALID_ATTEMPT_STATUS' ||
                    finalError?.toLowerCase().includes('already submitted')
                    ? 'Exam has already been submitted or is in an invalid state.'
                    : finalError === 'Attempt not found' || finalError?.toLowerCase().includes('attempt not found')
                        ? 'This exam attempt no longer exists. Please restart the exam.'
                        : finalError === 'INVALID_SESSION_TOKEN' || finalError?.toLowerCase().includes('session')
                            ? 'Session expired. Please try submitting again.'
                            : `Failed to submit exam. Please try again. (${finalError || 'Unknown error'})`;

            setUiError(errorMessage);
        } finally {
            setSubmitting(false);
            submitLockRef.current = false; // Release the mutex lock
        }
    }, [attempt.id, forceRefreshSessionToken, router, setSubmitting, debouncedSaveProgress, clearAllExamStates]);

    const handleResolveConflict = useCallback(
        async (resumeHere: boolean) => {
            if (!sessionConflict) return;

            if (!resumeHere) {
                setSessionConflict(null);
                return;
            }

            setIsResolvingConflict(true);
            try {
                const aId = attemptIdRef.current ?? attempt.id;
                if (!aId) return;

                // Always refresh token before force-resume actions to avoid stale/empty token
                const refreshedToken = await forceRefreshSessionToken();

                if (sessionConflict.type === 'save') {
                    const retry = await saveResponse({
                        ...sessionConflict.payload,
                        sessionToken: refreshedToken ?? sessionConflict.payload.sessionToken,
                        force_resume: true,
                    });

                    if (!retry.success && retry.error !== 'SESSION_CONFLICT') {
                        logger.error('Force resume save failed', retry.error, { attemptId: aId });
                    }
                }

                if (sessionConflict.type === 'submit') {
                    if (!refreshedToken) {
                        setUiError('Unable to establish session. Please try again.');
                        return;
                    }

                    const retry = await submitExam({
                        attemptId: aId,
                        sessionToken: refreshedToken,
                        force_resume: true,
                        submissionId: submissionIdRef.current,
                    });

                    if (retry.success) {
                        clearAllExamStates();
                        router.replace(`/result/${aId}`);
                    } else if (retry.error === 'ATTEMPT_NOT_FOUND' || retry.error?.toLowerCase().includes('attempt not found')) {
                        clearAllExamStates();
                        setUiError('This exam attempt was removed. Please restart from the dashboard.');
                        router.push('/dashboard');
                    } else if (retry.error !== 'SESSION_CONFLICT') {
                        logger.error('Force resume submit failed', retry.error, { attemptId: aId });
                        setUiError('Failed to submit exam. Please try again.');
                    }
                }
            } finally {
                setIsResolvingConflict(false);
                setSessionConflict(null);
            }
        },
        [attempt.id, sessionConflict, forceRefreshSessionToken, router]
    );

    // Handle pause exam
    const handlePauseExam = useCallback(async () => {
        const aId = attemptIdRef.current ?? attempt.id;
        if (!aId) return;

        if (paper.allow_pause === false) {
            setUiError('Pausing is not allowed for this exam.');
            return;
        }

        setUiError(null);

        const confirmed = window.confirm(
            'Are you sure you want to pause the exam? You can resume it later from the dashboard.'
        );
        if (!confirmed) return;

        const token = await ensureSessionToken({ reason: 'handlePauseExam' });
        const snapshot = responsesRef.current;

        // Best-effort save before pausing (do not fail pause if some saves fail)
        if (token) {
            await Promise.all(
                Object.entries(snapshot).map(async ([questionId, response]) => {
                    if (response.answer === null && response.status === 'not_visited') return;

                    const persistedAnswer = getPersistedAnswer(response.status, response.answer);

                    try {
                        await saveResponse({
                            attemptId: aId,
                            questionId,
                            answer: persistedAnswer,
                            status: response.status,
                            isMarkedForReview: response.isMarkedForReview,
                            isVisited: response.status !== 'not_visited',
                            timeSpentSeconds: response.timeSpentSeconds,
                            sessionToken: token,
                        });
                    } catch (e) {
                        logger.warn('Failed to save response during pause', e, { attemptId: aId, questionId });
                    }
                })
            );
        }

        const timeRemaining = buildTimeRemainingSafe(sectionTimersRef.current);
        if (!timeRemaining) {
            setUiError('Failed to pause exam. Please try again.');
            return;
        }

        try {
            const result = await pauseExam({
                attemptId: aId,
                timeRemaining,
                currentSection: getSectionByIndex(currentSectionIndexRef.current),
                currentQuestion: currentQuestionIndexRef.current + 1,
                sessionToken: token ?? undefined,
            });

            if (result.success) {
                clearAllExamStates();
                router.push('/dashboard');
            } else {
                examLogger.examPaused(aId, false, result.error);
                setUiError('Failed to pause exam. Please try again.');
            }
        } catch (e) {
            examLogger.examPaused(aId, false, 'PAUSE_EXCEPTION');
            logger.warn('Pause exam failed', e, { attemptId: aId });
            setUiError('Failed to pause exam. Please try again.');
        }
    }, [attempt.id, ensureSessionToken, router, paper.allow_pause]);

    // Show loading while initializing
    if (!hasHydrated || !isInitialized) {
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

            {showAuthExpiredModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Session expired</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your login session has expired. Please sign in again to submit your exam safely.
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAuthExpiredModal(false)}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const redirectTo =
                                        typeof window !== 'undefined'
                                            ? `${window.location.pathname}${window.location.search}`
                                            : `/exam/${attemptIdRef.current ?? attempt.id}`;
                                    router.push(`/auth/sign-in?redirect_to=${encodeURIComponent(redirectTo)}`);
                                }}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ExamLayout
                paper={paper}
                questions={questions}
                onSaveResponse={handleSaveResponse}
                onSubmitExam={handleSubmitExam}
                onSectionExpire={handleSectionExpire}
                onPauseExam={handlePauseExam}
                layoutMode={EXAM_LAYOUT_MODE}
            />

            {sessionConflict && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Active session detected</h3>
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
