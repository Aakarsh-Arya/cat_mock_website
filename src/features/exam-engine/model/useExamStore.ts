/**
 * @fileoverview Exam Engine Zustand Store
 * @description Global state management for the CAT exam engine with localStorage persistence
 * @blueprint Milestone 4 SOP-SSOT - Phase 1.2
 * @architecture Uses Zustand with persist middleware for offline resilience
 *
 * PHASE 1 FIX: Attempt-scoped persistence + proper resume position
 * PHASE 2 FIX: Consolidated marking logic with proper status transitions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from '@/lib/logger';
import { examDebug, cleanupOrphanedExamState, clearAllExamState } from '@/lib/examDebug';
import type {
    ExamStore,
    ExamData,
    ResponseState,
    SectionName,
    SectionTimerState,
    QuestionStatus,
    Question,
    PerformanceReason,
} from '@/types/exam';
import {
    SECTION_ORDER,
    getSectionByIndex,
    getSectionDurationSecondsMap,
    calculateQuestionStatus,
} from '@/types/exam';

type MutableSectionTimerState = {
    sectionName: SectionName;
    startedAt: number;
    durationSeconds: number;
    remainingSeconds: number;
    isExpired: boolean;
};

type MutableSectionTimers = Record<SectionName, MutableSectionTimerState>;

// =============================================================================
// SAFE STORAGE (SSR GUARD)
// =============================================================================

const noopStorage: Storage = {
    getItem: () => null,
    setItem: () => {
        /* noop */
    },
    removeItem: () => {
        /* noop */
    },
    clear: () => {
        /* noop */
    },
    key: () => null,
    length: 0,
};

// =============================================================================
// INITIAL STATE
// =============================================================================

const createInitialTimerState = (sectionName: SectionName, durationSeconds: number): MutableSectionTimerState => ({
    sectionName,
    startedAt: 0,
    durationSeconds,
    remainingSeconds: durationSeconds,
    isExpired: false,
});

const initialState: Omit<ExamStore, keyof import('@/types/exam').ExamEngineActions> = {
    // Hydration
    hasHydrated: false,
    // Initialization
    isInitialized: false,

    // Exam metadata
    attemptId: null,
    paperId: null,
    sessionToken: null, // P0 FIX: Session token for multi-device/tab prevention

    // Navigation
    currentSectionIndex: 0,
    currentQuestionIndex: 0,

    // Section locking
    lockedSections: [],

    // Responses
    responses: {},

    // Pending sync queue (local-first responses awaiting backend sync)
    pendingSyncResponses: {},
    lastSyncTimestamp: 0,

    // Timer state per section
    sectionTimers: (() => {
        const defaults = getSectionDurationSecondsMap();
        return {
            VARC: createInitialTimerState('VARC', defaults.VARC),
            DILR: createInitialTimerState('DILR', defaults.DILR),
            QA: createInitialTimerState('QA', defaults.QA),
        };
    })(),

    // Visit order per section (ordered log of question IDs, may repeat)
    sectionVisitOrder: { VARC: [], DILR: [], QA: [] },
    // Entry timestamp for per-visit time tracking
    currentQuestionEnteredAt: 0,

    // Question tracking
    visitedQuestions: new Set<string>(),
    markedQuestions: new Set<string>(),

    // Submission state
    isSubmitting: false,
    isAutoSubmitting: false,
};

// =============================================================================
// STORE CREATION
// =============================================================================

/**
 * Creates an exam store with optional persistence
 * @param attemptId - If provided, enables localStorage persistence keyed to this attempt
 */
export const createExamStore = (attemptId?: string) => {
    const storeName = attemptId ? `cat-exam-state-${attemptId}` : 'cat-exam-state-temp';

    // PHASE 0: Clean up orphaned temp state on store creation
    if (typeof window !== 'undefined') {
        cleanupOrphanedExamState();
    }

    examDebug.log('Creating exam store', { attemptId, storeName });

    return create<ExamStore>()(
        persist(
            (set, get) => ({
                ...initialState,

                // =====================================================================
                // INITIALIZATION
                // =====================================================================

                initializeExam: (data: ExamData) => {
                    const { paper, questions, attempt, responses: serverResponses } = data;
                    let currentState = get();

                    // PHASE 2 FIX: If the persisted state belongs to a different attempt, NUKE ALL exam state.
                    // This prevents zombie states where localStorage holds an old attemptId that no longer exists.
                    if (currentState.attemptId && currentState.attemptId !== attempt.id) {
                        try {
                            clearAllExamState();
                        } catch {
                            // best-effort cleanup
                        }
                        // Reset in-memory state to avoid reusing stale attemptId/timers.
                        set({
                            ...initialState,
                            hasHydrated: false,
                            isInitialized: false,
                        });
                        currentState = get();
                    }

                    // PHASE 1 FIX: Check if we're resuming the same attempt with persisted state
                    const normalizeSectionName = (value?: string | null): SectionName => {
                        const normalized = (value ?? '').toUpperCase().trim();
                        if (normalized === 'LRDI') return 'DILR';
                        if (normalized === 'QUANT' || normalized === 'QUANTS') return 'QA';
                        if (normalized === 'VARC' || normalized === 'DILR' || normalized === 'QA') {
                            return normalized as SectionName;
                        }
                        return 'VARC';
                    };

                    if (currentState.attemptId === attempt.id && currentState.hasHydrated) {
                        const now = Date.now();
                        const sectionDurations = getSectionDurationSecondsMap(paper.sections);
                        const serverTimeRemaining = attempt.time_remaining ?? {};
                        const resumeSection = normalizeSectionName(attempt.current_section as string | null | undefined);

                        const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
                        const nextSectionTimers = { ...currentState.sectionTimers } as MutableSectionTimers;

                        for (const section of sections) {
                            const duration = sectionDurations[section];
                            const localTimer = currentState.sectionTimers[section];
                            const localRemaining =
                                typeof localTimer?.remainingSeconds === 'number' ? localTimer.remainingSeconds : duration;
                            const serverRemaining =
                                typeof (serverTimeRemaining as Partial<Record<SectionName, number>>)[section] === 'number'
                                    ? (serverTimeRemaining as Partial<Record<SectionName, number>>)[section]!
                                    : null;

                            let mergedRemaining = serverRemaining !== null
                                ? (localRemaining <= 0 && serverRemaining > 0
                                    ? serverRemaining
                                    : Math.min(localRemaining, serverRemaining))
                                : localRemaining;
                            if (serverRemaining !== null && serverRemaining <= 0 && localRemaining <= 0) {
                                // Avoid instant auto-submit on resume when server/local timers are stale.
                                mergedRemaining = duration;
                            }
                            const clampedRemaining = Math.max(0, Math.min(duration, mergedRemaining));

                            const shouldHaveStarted =
                                section === resumeSection ||
                                localTimer.startedAt > 0 ||
                                clampedRemaining < duration;

                            const nextStartedAt = shouldHaveStarted
                                ? now - (duration - clampedRemaining) * 1000
                                : 0;

                            nextSectionTimers[section] = {
                                ...localTimer,
                                durationSeconds: duration,
                                remainingSeconds: clampedRemaining,
                                startedAt: shouldHaveStarted ? nextStartedAt : 0,
                                isExpired:
                                    serverRemaining !== null
                                        ? clampedRemaining <= 0 && serverRemaining > 0
                                        : (localTimer.isExpired || clampedRemaining <= 0),
                            };
                        }

                        const serverSection = resumeSection;
                        const serverSectionIndex = SECTION_ORDER[serverSection];
                        let nextSectionIndex = currentState.currentSectionIndex;
                        let nextQuestionIndex = currentState.currentQuestionIndex;

                        if (serverSectionIndex > currentState.currentSectionIndex) {
                            nextSectionIndex = serverSectionIndex;
                            nextQuestionIndex = Math.max(0, (attempt.current_question ?? 1) - 1);
                        } else if (serverSectionIndex === currentState.currentSectionIndex && attempt.current_question) {
                            nextQuestionIndex = Math.max(currentState.currentQuestionIndex, attempt.current_question - 1);
                        }

                        const lockedSections = new Set(currentState.lockedSections);
                        for (let i = 0; i < nextSectionIndex; i++) {
                            lockedSections.add(getSectionByIndex(i));
                        }

                        // PHASE 5 FIX: Merge server responses with local state to recover any
                        // answers that were saved to DB but not in localStorage
                        const mergedResponses = { ...currentState.responses };
                        if (serverResponses && serverResponses.length > 0) {
                            serverResponses.forEach((r) => {
                                const localResponse = mergedResponses[r.question_id];
                                if (!localResponse) return;

                                const serverHasAnswer = typeof r.answer === 'string' && r.answer.trim() !== '';
                                const localHasAnswer =
                                    typeof localResponse.answer === 'string' && localResponse.answer.trim() !== '';
                                const serverIsAnswered =
                                    serverHasAnswer || r.status === 'answered' || r.status === 'answered_marked';
                                const localIsAnswered =
                                    localHasAnswer ||
                                    localResponse.status === 'answered' ||
                                    localResponse.status === 'answered_marked';

                                // Merge new tracking fields
                                const rAny = r as unknown as Record<string, unknown>;
                                const serverTimePerVisit = Array.isArray(rAny.time_per_visit)
                                    ? (rAny.time_per_visit as number[]) : [];
                                const mergedTimePerVisit = localResponse.timePerVisit.length >= serverTimePerVisit.length
                                    ? localResponse.timePerVisit : serverTimePerVisit;
                                const serverUserNote = typeof rAny.user_note === 'string'
                                    ? (rAny.user_note as string) : '';
                                const mergedUserNote = localResponse.userNote || serverUserNote;

                                if (serverIsAnswered && !localIsAnswered) {
                                    // Server has answer and local doesn't - use server data
                                    mergedResponses[r.question_id] = {
                                        answer: r.answer ?? null,
                                        status: r.status,
                                        isMarkedForReview: r.is_marked_for_review ?? false,
                                        timeSpentSeconds: Math.max(localResponse.timeSpentSeconds, r.time_spent_seconds ?? 0),
                                        visitCount: Math.max(localResponse.visitCount, r.visit_count ?? 0),
                                        timePerVisit: mergedTimePerVisit,
                                        userNote: mergedUserNote,
                                    };
                                } else if (localIsAnswered) {
                                    // Local has answer but server doesn't - keep local (might be unsaved)
                                    // Just update time spent if server has more
                                    mergedResponses[r.question_id] = {
                                        ...localResponse,
                                        timeSpentSeconds: Math.max(localResponse.timeSpentSeconds, r.time_spent_seconds ?? 0),
                                        visitCount: Math.max(localResponse.visitCount, r.visit_count ?? 0),
                                        timePerVisit: mergedTimePerVisit,
                                        userNote: mergedUserNote,
                                    };
                                } else {
                                    // Neither has answer - merge metadata
                                    mergedResponses[r.question_id] = {
                                        ...localResponse,
                                        status: localResponse.status === 'not_visited' ? r.status : localResponse.status,
                                        isMarkedForReview: localResponse.isMarkedForReview || r.is_marked_for_review,
                                        timeSpentSeconds: Math.max(localResponse.timeSpentSeconds, r.time_spent_seconds ?? 0),
                                        visitCount: Math.max(localResponse.visitCount, r.visit_count ?? 0),
                                        timePerVisit: mergedTimePerVisit,
                                        userNote: mergedUserNote,
                                    };
                                }
                            });
                        }

                        examDebug.resume({
                            attemptId: attempt.id,
                            fromSection: currentState.currentSectionIndex,
                            fromQuestion: currentState.currentQuestionIndex,
                            preservedState: true,
                        });
                        logger.debug('Resuming existing attempt, syncing server timers and merging responses', { attemptId: attempt.id });

                        set({
                            responses: mergedResponses,
                            sectionTimers: nextSectionTimers,
                            currentSectionIndex: nextSectionIndex,
                            currentQuestionIndex: nextQuestionIndex,
                            lockedSections: Array.from(lockedSections),
                            isSubmitting: false,
                            isAutoSubmitting: false,
                            isInitialized: true,
                        });
                        return;
                    }

                    // Create initial response states for all questions
                    const responses: Record<string, ResponseState> = {};
                    questions.forEach((q) => {
                        responses[q.id] = {
                            answer: null,
                            status: 'not_visited',
                            isMarkedForReview: false,
                            timeSpentSeconds: 0,
                            visitCount: 0,
                            timePerVisit: [],
                            userNote: '',
                        };
                    });

                    // Hydrate responses from server if available
                    if (serverResponses && serverResponses.length > 0) {
                        serverResponses.forEach((r) => {
                            if (!responses[r.question_id]) return;
                            responses[r.question_id] = {
                                answer: r.answer ?? null,
                                status: r.status,
                                isMarkedForReview: r.is_marked_for_review ?? false,
                                timeSpentSeconds: r.time_spent_seconds ?? 0,
                                visitCount: r.visit_count ?? 0,
                                timePerVisit: Array.isArray((r as unknown as Record<string, unknown>).time_per_visit)
                                    ? ((r as unknown as Record<string, unknown>).time_per_visit as number[])
                                    : [],
                                userNote: typeof (r as unknown as Record<string, unknown>).user_note === 'string'
                                    ? ((r as unknown as Record<string, unknown>).user_note as string)
                                    : '',
                            };
                        });
                    }

                    const now = Date.now();
                    const attemptStartedAt = attempt.started_at ? new Date(attempt.started_at).getTime() : now;
                    const rawTimeRemaining = attempt.time_remaining as Partial<Record<SectionName, number>> | null | undefined;
                    const hasTimeRemaining =
                        rawTimeRemaining &&
                        Object.values(rawTimeRemaining).some((value) => typeof value === 'number' && value > 0);
                    const isLikelyNewAttempt = !hasTimeRemaining &&
                        (attempt.current_section == null || attempt.current_section === 'VARC') &&
                        (attempt.current_question == null || attempt.current_question <= 1);
                    const baseStartTime = hasTimeRemaining ? attemptStartedAt : (isLikelyNewAttempt ? now : attemptStartedAt);

                    const sectionDurations = getSectionDurationSecondsMap(paper.sections);
                    const sectionTimers: MutableSectionTimers = {
                        VARC: {
                            sectionName: 'VARC',
                            startedAt: baseStartTime,
                            durationSeconds: sectionDurations.VARC,
                            remainingSeconds: sectionDurations.VARC,
                            isExpired: false,
                        },
                        DILR: {
                            sectionName: 'DILR',
                            startedAt: 0,
                            durationSeconds: sectionDurations.DILR,
                            remainingSeconds: sectionDurations.DILR,
                            isExpired: false,
                        },
                        QA: {
                            sectionName: 'QA',
                            startedAt: 0,
                            durationSeconds: sectionDurations.QA,
                            remainingSeconds: sectionDurations.QA,
                            isExpired: false,
                        },
                    };

                    // Parse existing time_remaining from server if resuming
                    if (hasTimeRemaining && rawTimeRemaining) {
                        const timeRemaining = rawTimeRemaining;

                        if (timeRemaining.VARC !== undefined) {
                            sectionTimers.VARC.remainingSeconds = timeRemaining.VARC;
                            if (timeRemaining.VARC < sectionDurations.VARC) {
                                const elapsedSeconds = sectionDurations.VARC - timeRemaining.VARC;
                                sectionTimers.VARC.startedAt = now - elapsedSeconds * 1000;
                            }
                        }
                        if (timeRemaining.DILR !== undefined) {
                            sectionTimers.DILR.remainingSeconds = timeRemaining.DILR;
                        }
                        if (timeRemaining.QA !== undefined) {
                            sectionTimers.QA.remainingSeconds = timeRemaining.QA;
                        }
                    }

                    const currentSection = normalizeSectionName(attempt.current_section as string | null | undefined);
                    const currentSectionIndex = SECTION_ORDER[currentSection];

                    const currentQuestionFromServer = attempt.current_question ?? 1;
                    const currentQuestionIndex = Math.max(0, currentQuestionFromServer - 1);

                    // Normalize current section start time based on remainingSeconds to avoid instant expiry.
                    const currentTimer = sectionTimers[currentSection];
                    if (currentTimer) {
                        const duration = sectionDurations[currentSection];
                        // CRITICAL FIX: If remaining is 0 or negative from server, this is a completed/expired exam
                        // Mark it as expired immediately rather than triggering auto-submit
                        const serverRemaining = currentTimer.remainingSeconds;
                        if (serverRemaining <= 0) {
                            // Timer already expired - mark it as expired but don't trigger auto-submit cascade
                            currentTimer.remainingSeconds = 0;
                            currentTimer.isExpired = true;
                            currentTimer.startedAt = now - duration * 1000;
                        } else {
                            const clampedRemaining = Math.max(1, Math.min(duration, serverRemaining));
                            currentTimer.remainingSeconds = clampedRemaining;
                            currentTimer.startedAt =
                                clampedRemaining >= duration ? now : now - (duration - clampedRemaining) * 1000;
                        }
                    }

                    // P0 FIX: Prefer any existing token (e.g., server-initialized) to avoid overwriting it.
                    const existingSessionToken =
                        typeof currentState.sessionToken === 'string' && currentState.sessionToken.trim().length > 0
                            ? currentState.sessionToken
                            : null;
                    const sessionToken =
                        existingSessionToken ??
                        (typeof crypto !== 'undefined' && crypto.randomUUID
                            ? crypto.randomUUID()
                            : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

                    const visitedQuestions = new Set<string>();
                    const markedQuestions = new Set<string>();

                    Object.entries(responses).forEach(([questionId, response]) => {
                        if (response.status !== 'not_visited') visitedQuestions.add(questionId);
                        if (response.isMarkedForReview) markedQuestions.add(questionId);
                    });

                    const lockedSections: SectionName[] = [];
                    const sectionOrder: SectionName[] = ['VARC', 'DILR', 'QA'];
                    for (let i = 0; i < currentSectionIndex; i++) lockedSections.push(sectionOrder[i]);

                    examDebug.storeInit({
                        attemptId: attempt.id,
                        storeName,
                        sessionToken,
                        currentSectionIndex,
                        currentQuestionIndex,
                    });

                    set({
                        hasHydrated: true,
                        isInitialized: true,
                        attemptId: attempt.id,
                        paperId: paper.id,
                        sessionToken,
                        currentSectionIndex,
                        currentQuestionIndex,
                        lockedSections,
                        responses,
                        sectionTimers,
                        sectionVisitOrder: { VARC: [], DILR: [], QA: [] },
                        currentQuestionEnteredAt: Date.now(),
                        visitedQuestions,
                        markedQuestions,
                        isSubmitting: false,
                        isAutoSubmitting: false,
                    });
                },

                setHasHydrated: (hydrated: boolean) => {
                    set({
                        hasHydrated: hydrated,
                        ...(hydrated ? {} : { isInitialized: false }),
                    });
                },

                setSessionToken: (sessionToken: string | null) => {
                    set({ sessionToken });
                },

                // =====================================================================
                // NAVIGATION
                // =====================================================================

                goToQuestion: (questionId: string, sectionIndex: number, questionIndex: number) => {
                    const state = get();
                    const now = Date.now();

                    if (sectionIndex !== state.currentSectionIndex) {
                        logger.warn('Section locked. Navigation restricted to current section', {
                            attemptId: state.attemptId,
                            targetSection: sectionIndex,
                            currentSection: state.currentSectionIndex,
                        });
                        return;
                    }

                    // --- Per-visit time tracking: close the previous visit ---
                    // Use section visit order to find current question
                    const sectionName = getSectionByIndex(sectionIndex);
                    const visitOrder = state.sectionVisitOrder[sectionName];
                    const prevQId = visitOrder.length > 0 ? visitOrder[visitOrder.length - 1] : null;

                    const updatedResponses = { ...state.responses };

                    // Close previous visit timing if we have a valid previous question and entry time
                    if (prevQId && state.currentQuestionEnteredAt > 0 && updatedResponses[prevQId]) {
                        const visitDuration = Math.max(0, Math.floor((now - state.currentQuestionEnteredAt) / 1000));
                        const prevResp = updatedResponses[prevQId];
                        updatedResponses[prevQId] = {
                            ...prevResp,
                            timePerVisit: [...prevResp.timePerVisit, visitDuration],
                        };
                    }

                    // --- Update visit order for new question ---
                    const newVisitOrder = {
                        ...state.sectionVisitOrder,
                        [sectionName]: [...visitOrder, questionId],
                    };

                    const newVisitedQuestions = new Set(state.visitedQuestions);
                    newVisitedQuestions.add(questionId);

                    const response = updatedResponses[questionId];
                    if (response && response.status === 'not_visited') {
                        updatedResponses[questionId] = {
                            ...response,
                            status: 'visited',
                            visitCount: response.visitCount + 1,
                        };
                    } else if (response) {
                        updatedResponses[questionId] = {
                            ...response,
                            visitCount: response.visitCount + 1,
                        };
                    }

                    set({
                        currentSectionIndex: sectionIndex,
                        currentQuestionIndex: questionIndex,
                        visitedQuestions: newVisitedQuestions,
                        responses: updatedResponses,
                        sectionVisitOrder: newVisitOrder,
                        currentQuestionEnteredAt: now,
                    });
                },

                goToNextQuestion: () => {
                    const state = get();
                    set({ currentQuestionIndex: state.currentQuestionIndex + 1 });
                },

                goToPreviousQuestion: () => {
                    const state = get();
                    if (state.currentQuestionIndex > 0) {
                        set({ currentQuestionIndex: state.currentQuestionIndex - 1 });
                    }
                },

                // =====================================================================
                // ANSWER MANAGEMENT
                // =====================================================================

                setLocalAnswer: (questionId: string, answer: string | null) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) {
                        logger.warn('Response not found for question', { questionId, attemptId: state.attemptId });
                        return;
                    }

                    examDebug.log('setLocalAnswer - storing locally only', {
                        questionId,
                        answer,
                        currentStatus: response.status,
                    });

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                answer,
                            },
                        },
                    });
                },

                saveAnswer: (questionId: string, answer: string | null) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) {
                        logger.warn('Response not found for question', { questionId, attemptId: state.attemptId });
                        return;
                    }

                    const hasAnswer = answer !== null && answer !== '';
                    let newStatus = response.status;

                    if (hasAnswer) {
                        newStatus = response.isMarkedForReview ? 'answered_marked' : 'answered';
                    } else {
                        newStatus = response.isMarkedForReview ? 'marked' : 'visited';
                    }

                    examDebug.log('saveAnswer - updating status', {
                        questionId,
                        answer,
                        oldStatus: response.status,
                        newStatus,
                        isMarkedForReview: response.isMarkedForReview,
                    });

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                answer,
                                status: newStatus,
                            },
                        },
                    });
                },

                setAnswer: (questionId: string, answer: string | null) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) {
                        logger.warn('Response not found for question', { questionId, attemptId: state.attemptId });
                        return;
                    }

                    const hasAnswer = answer !== null && answer !== '';
                    let newStatus = response.status;

                    if (hasAnswer) {
                        newStatus = response.isMarkedForReview ? 'answered_marked' : 'answered';
                    } else {
                        newStatus = response.isMarkedForReview ? 'marked' : 'visited';
                    }

                    const newMarkedQuestions = new Set(state.markedQuestions);
                    if (response.isMarkedForReview) {
                        newMarkedQuestions.add(questionId);
                    }

                    examDebug.responseStatus({
                        questionId,
                        oldStatus: response.status,
                        newStatus,
                        answer,
                        isMarkedForReview: response.isMarkedForReview,
                    });

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                answer,
                                status: newStatus,
                            },
                        },
                        markedQuestions: newMarkedQuestions,
                        pendingSyncResponses: {
                            ...state.pendingSyncResponses,
                            [questionId]: {
                                answer,
                                timestamp: Date.now(),
                            },
                        },
                    });
                },

                // ✅ FIXED: clearAnswer now ALSO unmarks the question for review.
                clearAnswer: (questionId: string) => {
                    const state = get();
                    const response = state.responses[questionId];
                    if (!response) return;

                    // Clearing implies: no answer + NOT marked + visited
                    const newStatus = calculateQuestionStatus(false, false, true);

                    // Ensure sets reflect unmarking + visited
                    const newMarkedQuestions = new Set(state.markedQuestions);
                    newMarkedQuestions.delete(questionId);

                    const newVisitedQuestions = new Set(state.visitedQuestions);
                    newVisitedQuestions.add(questionId);

                    set({
                        visitedQuestions: newVisitedQuestions,
                        markedQuestions: newMarkedQuestions,
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                answer: null,
                                isMarkedForReview: false,
                                status: newStatus,
                            },
                        },
                        pendingSyncResponses: {
                            ...state.pendingSyncResponses,
                            [questionId]: {
                                answer: null,
                                timestamp: Date.now(),
                            },
                        },
                    });
                },

                toggleMarkForReview: (questionId: string) => {
                    const state = get();
                    const response = state.responses[questionId];
                    if (!response) return;

                    const newIsMarked = !response.isMarkedForReview;
                    const hasAnswer = response.answer !== null && response.answer !== '';

                    const hadSavedAnswer = response.status === 'answered' || response.status === 'answered_marked';

                    let newStatus: QuestionStatus;
                    if (newIsMarked) {
                        newStatus = hadSavedAnswer ? 'answered_marked' : 'marked';
                    } else {
                        newStatus = hadSavedAnswer ? 'answered' : hasAnswer ? 'visited' : 'visited';
                    }

                    examDebug.markForReview({
                        questionId,
                        hadSavedAnswer,
                        newStatus,
                        isMarking: newIsMarked,
                    });

                    const newMarkedQuestions = new Set(state.markedQuestions);
                    if (newIsMarked) newMarkedQuestions.add(questionId);
                    else newMarkedQuestions.delete(questionId);

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                isMarkedForReview: newIsMarked,
                                status: newStatus,
                            },
                        },
                        markedQuestions: newMarkedQuestions,
                    });
                },

                queuePendingSync: (questionId: string, answer: string | null) => {
                    const state = get();
                    set({
                        pendingSyncResponses: {
                            ...state.pendingSyncResponses,
                            [questionId]: {
                                answer,
                                timestamp: Date.now(),
                            },
                        },
                    });
                },

                clearPendingSync: (questionIds?: string[]) => {
                    if (!questionIds || questionIds.length === 0) {
                        set({ pendingSyncResponses: {} });
                        return;
                    }

                    const state = get();
                    const nextQueue = { ...state.pendingSyncResponses };
                    for (const id of questionIds) delete nextQueue[id];
                    set({ pendingSyncResponses: nextQueue });
                },

                setLastSyncTimestamp: (timestamp: number) => {
                    set({ lastSyncTimestamp: timestamp });
                },

                setResponseStatus: (questionId: string, status: QuestionStatus, isMarkedForReview?: boolean) => {
                    const state = get();
                    const response = state.responses[questionId];
                    if (!response) return;

                    const nextIsMarked = isMarkedForReview ?? response.isMarkedForReview;
                    const newMarkedQuestions = new Set(state.markedQuestions);
                    if (nextIsMarked) newMarkedQuestions.add(questionId);
                    else newMarkedQuestions.delete(questionId);

                    examDebug.responseStatus({
                        questionId,
                        oldStatus: response.status,
                        newStatus: status,
                        answer: response.answer,
                        isMarkedForReview: nextIsMarked,
                    });

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                status,
                                isMarkedForReview: nextIsMarked,
                            },
                        },
                        markedQuestions: newMarkedQuestions,
                    });
                },

                // =====================================================================
                // STATUS UPDATES
                // =====================================================================

                markQuestionVisited: (questionId: string) => {
                    const state = get();
                    const newVisitedQuestions = new Set(state.visitedQuestions);
                    newVisitedQuestions.add(questionId);

                    const response = state.responses[questionId];
                    if (response && response.status === 'not_visited') {
                        set({
                            visitedQuestions: newVisitedQuestions,
                            responses: {
                                ...state.responses,
                                [questionId]: {
                                    ...response,
                                    status: 'visited',
                                    visitCount: response.visitCount + 1,
                                },
                            },
                        });
                    } else {
                        set({ visitedQuestions: newVisitedQuestions });
                    }
                },

                updateTimeSpent: (questionId: string, seconds: number) => {
                    const state = get();
                    const response = state.responses[questionId];
                    if (!response) return;

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                timeSpentSeconds: response.timeSpentSeconds + seconds,
                            },
                        },
                    });
                },

                setUserNote: (questionId: string, note: string) => {
                    const state = get();
                    const response = state.responses[questionId];
                    if (!response) return;

                    // Enforce 50-word limit
                    const words = note.trim().split(/\s+/).filter(Boolean);
                    const clampedNote = words.length > 50
                        ? words.slice(0, 50).join(' ')
                        : note;

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                userNote: clampedNote,
                            },
                        },
                    });
                },

                // =====================================================================
                // SECTION MANAGEMENT
                // =====================================================================

                completeSection: (sectionName: SectionName) => {
                    const state = get();
                    if (!state.lockedSections.includes(sectionName)) {
                        set({ lockedSections: [...state.lockedSections, sectionName] });
                    }
                },

                moveToNextSection: () => {
                    const state = get();
                    const currentSection = getSectionByIndex(state.currentSectionIndex);

                    const newLockedSections = state.lockedSections.includes(currentSection)
                        ? state.lockedSections
                        : [...state.lockedSections, currentSection];

                    if (state.currentSectionIndex < 2) {
                        const nextSectionIndex = state.currentSectionIndex + 1;
                        const nextSection = getSectionByIndex(nextSectionIndex);
                        const now = Date.now();

                        set({
                            currentSectionIndex: nextSectionIndex,
                            currentQuestionIndex: 0,
                            lockedSections: newLockedSections,
                            sectionTimers: {
                                ...state.sectionTimers,
                                [nextSection]: {
                                    ...state.sectionTimers[nextSection],
                                    startedAt: now,
                                },
                            },
                        });
                    } else {
                        set({ lockedSections: newLockedSections });
                    }
                },

                // =====================================================================
                // TIMER
                // =====================================================================

                updateSectionTimer: (sectionName: SectionName, remainingSeconds: number) => {
                    const state = get();
                    set({
                        sectionTimers: {
                            ...state.sectionTimers,
                            [sectionName]: {
                                ...state.sectionTimers[sectionName],
                                remainingSeconds: Math.max(0, remainingSeconds),
                            },
                        },
                    });
                },
                setSectionTimerOverride: (sectionName: SectionName, remainingSeconds: number) => {
                    const state = get();
                    const safeRemaining = Math.max(0, Math.floor(remainingSeconds));
                    const durationSeconds = Math.max(1, safeRemaining);
                    set({
                        sectionTimers: {
                            ...state.sectionTimers,
                            [sectionName]: {
                                ...state.sectionTimers[sectionName],
                                sectionName,
                                startedAt: Date.now(),
                                durationSeconds,
                                remainingSeconds: safeRemaining,
                                isExpired: safeRemaining <= 0,
                            },
                        },
                    });
                },

                expireSection: (sectionName: SectionName) => {
                    const state = get();
                    set({
                        sectionTimers: {
                            ...state.sectionTimers,
                            [sectionName]: {
                                ...state.sectionTimers[sectionName],
                                remainingSeconds: 0,
                                isExpired: true,
                            },
                        },
                    });
                },

                // =====================================================================
                // SUBMISSION
                // =====================================================================

                setSubmitting: (isSubmitting: boolean) => {
                    set({ isSubmitting });
                },

                setAutoSubmitting: (isAutoSubmitting: boolean) => {
                    set({ isAutoSubmitting });
                },

                // =====================================================================
                // RESET
                // =====================================================================

                resetExam: () => {
                    set({
                        ...initialState,
                        hasHydrated: true,
                        isInitialized: false,
                    });
                },
            }),
            {
                name: storeName,
                storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : noopStorage)),
                partialize: (state) => ({
                    attemptId: state.attemptId,
                    paperId: state.paperId,
                    sessionToken: state.sessionToken,
                    currentSectionIndex: state.currentSectionIndex,
                    currentQuestionIndex: state.currentQuestionIndex,
                    lockedSections: state.lockedSections,
                    responses: state.responses,
                    pendingSyncResponses: state.pendingSyncResponses,
                    lastSyncTimestamp: state.lastSyncTimestamp,
                    sectionTimers: state.sectionTimers,
                    sectionVisitOrder: state.sectionVisitOrder,
                    currentQuestionEnteredAt: state.currentQuestionEnteredAt,
                    visitedQuestions: Array.from(state.visitedQuestions),
                    markedQuestions: Array.from(state.markedQuestions),
                }),
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        const writableState = state as unknown as {
                            visitedQuestions: Set<string>;
                            markedQuestions: Set<string>;
                            hasHydrated: boolean;
                            isInitialized: boolean;
                            attemptId: string | null;
                            resetExam: () => void;
                        };
                        writableState.visitedQuestions = new Set(
                            Array.isArray(state.visitedQuestions) ? state.visitedQuestions : []
                        );
                        writableState.markedQuestions = new Set(
                            Array.isArray(state.markedQuestions) ? state.markedQuestions : []
                        );
                        writableState.hasHydrated = true;
                        writableState.isInitialized = false;

                        // Guard against stale persisted state for a different attempt.
                        if (typeof window !== 'undefined') {
                            const parts = window.location.pathname.split('/');
                            const currentAttemptId = parts[1] === 'exam' ? (parts[2] ?? null) : null;
                            if (
                                currentAttemptId &&
                                writableState.attemptId &&
                                writableState.attemptId !== currentAttemptId
                            ) {
                                writableState.resetExam();
                            }
                        }
                    }
                },
            }
        )
    );
};

// =============================================================================
// DEFAULT STORE INSTANCE
// =============================================================================

export const useExamStore = createExamStore();

// =============================================================================
// SELECTORS (for optimized re-renders)
// =============================================================================

export const selectCurrentSection = (state: ExamStore): SectionName => getSectionByIndex(state.currentSectionIndex);

export const selectCurrentTimer = (state: ExamStore): SectionTimerState => {
    const section = getSectionByIndex(state.currentSectionIndex);
    return state.sectionTimers[section];
};

export const selectResponse = (questionId: string) => (state: ExamStore): ResponseState | undefined => state.responses[questionId];

export const selectIsSectionLocked = (sectionName: SectionName) => (state: ExamStore): boolean =>
    state.lockedSections.includes(sectionName);

export const selectQuestionStatus = (questionId: string) => (state: ExamStore): QuestionStatus => {
    const response = state.responses[questionId];
    return response?.status ?? 'not_visited';
};

export const selectSectionCounts = (questions: Question[]) => (state: ExamStore) => {
    const counts = {
        total: questions.length,
        notVisited: 0,
        visited: 0,
        answered: 0,
        marked: 0,
        answeredMarked: 0,
    };

    questions.forEach((q) => {
        const response = state.responses[q.id];
        if (!response) {
            counts.notVisited++;
            return;
        }

        switch (response.status) {
            case 'not_visited':
                counts.notVisited++;
                break;
            case 'visited':
                counts.visited++;
                break;
            case 'answered':
                counts.answered++;
                break;
            case 'marked':
                counts.marked++;
                break;
            case 'answered_marked':
                counts.answeredMarked++;
                break;
        }
    });

    return counts;
};

// =============================================================================
// ANALYSIS STORE (Reason Tags + Bookmarks)
// =============================================================================

interface AnalysisStoreState {
    attemptId: string;
    reasons: Record<string, PerformanceReason | null>;
    bookmarks: Record<string, boolean>;
}

interface AnalysisStoreActions {
    setReason: (questionId: string, reason: PerformanceReason | null) => void;
    toggleBookmark: (questionId: string) => void;
    setBookmark: (questionId: string, value: boolean) => void;
    setBookmarks: (questionIds: string[]) => void;
    clearReason: (questionId: string) => void;
    resetAnalysis: () => void;
}

const analysisStoreCache = new Map<string, ReturnType<typeof createAnalysisStore>>();

const createAnalysisStore = (attemptId: string) => {
    const storageKey = `cat-exam-analysis-${attemptId}`;

    return create<AnalysisStoreState & AnalysisStoreActions>()(
        persist(
            (set) => ({
                attemptId,
                reasons: {},
                bookmarks: {},
                setReason: (questionId, reason) => {
                    set((state) => ({
                        reasons: {
                            ...state.reasons,
                            [questionId]: reason,
                        },
                    }));
                },
                toggleBookmark: (questionId) => {
                    set((state) => {
                        const next = { ...state.bookmarks };
                        if (next[questionId]) {
                            delete next[questionId];
                        } else {
                            next[questionId] = true;
                        }
                        return { bookmarks: next };
                    });
                },
                setBookmark: (questionId, value) => {
                    set((state) => {
                        const next = { ...state.bookmarks };
                        if (value) {
                            next[questionId] = true;
                        } else {
                            delete next[questionId];
                        }
                        return { bookmarks: next };
                    });
                },
                setBookmarks: (questionIds) => {
                    const next: Record<string, boolean> = {};
                    questionIds.forEach((questionId) => {
                        if (typeof questionId === 'string' && questionId.trim().length > 0) {
                            next[questionId] = true;
                        }
                    });
                    set({ bookmarks: next });
                },
                clearReason: (questionId) => {
                    set((state) => {
                        if (!(questionId in state.reasons)) {
                            return state;
                        }
                        const next = { ...state.reasons };
                        delete next[questionId];
                        return { reasons: next };
                    });
                },
                resetAnalysis: () => {
                    set({ reasons: {}, bookmarks: {} });
                },
            }),
            {
                name: storageKey,
                storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : noopStorage)),
            }
        )
    );
};

export const getAnalysisStore = (attemptId?: string | null) => {
    const key = attemptId || 'temp';
    const existing = analysisStoreCache.get(key);
    if (existing) {
        return existing;
    }
    const created = createAnalysisStore(key);
    analysisStoreCache.set(key, created);
    return created;
};
