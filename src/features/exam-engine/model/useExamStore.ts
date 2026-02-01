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
import { examDebug, cleanupOrphanedExamState } from '@/lib/examDebug';
import type {
    ExamStore,
    ExamData,
    ResponseState,
    SectionName,
    SectionTimerState,
    QuestionStatus,
    Question,
} from '@/types/exam';
import {
    SECTION_ORDER,
    getSectionByIndex,
    getSectionDurationSecondsMap,
    calculateQuestionStatus,
} from '@/types/exam';

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

const createInitialTimerState = (sectionName: SectionName, durationSeconds: number): SectionTimerState => ({
    sectionName,
    startedAt: 0,
    durationSeconds,
    remainingSeconds: durationSeconds,
    isExpired: false,
});

const initialState: Omit<ExamStore, keyof import('@/types/exam').ExamEngineActions> = {
    // Hydration
    hasHydrated: false,

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
    if (typeof window !== 'undefined' && attemptId) {
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
                    const currentState = get();

                    // PHASE 1 FIX: Check if we're resuming the same attempt with persisted state
                    if (currentState.attemptId === attempt.id && currentState.hasHydrated) {
                        examDebug.resume({
                            attemptId: attempt.id,
                            fromSection: currentState.currentSectionIndex,
                            fromQuestion: currentState.currentQuestionIndex,
                            preservedState: true,
                        });
                        logger.debug('Resuming existing attempt, preserving timer state', { attemptId: attempt.id });
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
                            };
                        });
                    }

                    const now = Date.now();
                    const attemptStartedAt = attempt.started_at ? new Date(attempt.started_at).getTime() : now;

                    const sectionDurations = getSectionDurationSecondsMap(paper.sections);
                    const sectionTimers: Record<SectionName, SectionTimerState> = {
                        VARC: {
                            sectionName: 'VARC',
                            startedAt: attemptStartedAt,
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
                    if (attempt.time_remaining) {
                        const timeRemaining = attempt.time_remaining;

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

                    const currentSection = attempt.current_section || 'VARC';
                    const currentSectionIndex = SECTION_ORDER[currentSection];

                    const currentQuestionFromServer = attempt.current_question ?? 1;
                    const currentQuestionIndex = Math.max(0, currentQuestionFromServer - 1);

                    if (currentSectionIndex > 0 && sectionTimers[currentSection].startedAt === 0) {
                        const sectionTimer = sectionTimers[currentSection];
                        if (sectionTimer.remainingSeconds < sectionDurations[currentSection]) {
                            const elapsedSeconds = sectionDurations[currentSection] - sectionTimer.remainingSeconds;
                            sectionTimer.startedAt = now - elapsedSeconds * 1000;
                        } else {
                            sectionTimer.startedAt = now;
                        }
                    }

                    // P0 FIX: Generate session token (client-local; server token may overwrite later)
                    const sessionToken =
                        typeof crypto !== 'undefined' && crypto.randomUUID
                            ? crypto.randomUUID()
                            : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
                        attemptId: attempt.id,
                        paperId: paper.id,
                        sessionToken,
                        currentSectionIndex,
                        currentQuestionIndex,
                        lockedSections,
                        responses,
                        sectionTimers,
                        visitedQuestions,
                        markedQuestions,
                        isSubmitting: false,
                        isAutoSubmitting: false,
                    });
                },

                setHasHydrated: (hydrated: boolean) => {
                    set({ hasHydrated: hydrated });
                },

                setSessionToken: (sessionToken: string | null) => {
                    set({ sessionToken });
                },

                // =====================================================================
                // NAVIGATION
                // =====================================================================

                goToQuestion: (questionId: string, sectionIndex: number, questionIndex: number) => {
                    const state = get();

                    if (sectionIndex !== state.currentSectionIndex) {
                        logger.warn('Section locked. Navigation restricted to current section', {
                            attemptId: state.attemptId,
                            targetSection: sectionIndex,
                            currentSection: state.currentSectionIndex,
                        });
                        return;
                    }

                    const newVisitedQuestions = new Set(state.visitedQuestions);
                    newVisitedQuestions.add(questionId);

                    const response = state.responses[questionId];
                    if (response && response.status === 'not_visited') {
                        set({
                            currentSectionIndex: sectionIndex,
                            currentQuestionIndex: questionIndex,
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
                    } else if (response) {
                        set({
                            currentSectionIndex: sectionIndex,
                            currentQuestionIndex: questionIndex,
                            visitedQuestions: newVisitedQuestions,
                            responses: {
                                ...state.responses,
                                [questionId]: {
                                    ...response,
                                    visitCount: response.visitCount + 1,
                                },
                            },
                        });
                    } else {
                        set({
                            currentSectionIndex: sectionIndex,
                            currentQuestionIndex: questionIndex,
                            visitedQuestions: newVisitedQuestions,
                        });
                    }
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
                    visitedQuestions: Array.from(state.visitedQuestions),
                    markedQuestions: Array.from(state.markedQuestions),
                }),
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        state.visitedQuestions = new Set(Array.isArray(state.visitedQuestions) ? state.visitedQuestions : []);
                        state.markedQuestions = new Set(Array.isArray(state.markedQuestions) ? state.markedQuestions : []);
                        state.hasHydrated = true;
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
