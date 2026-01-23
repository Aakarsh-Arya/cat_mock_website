/**
 * @fileoverview Exam Engine Zustand Store
 * @description Global state management for the CAT exam engine with localStorage persistence
 * @blueprint Milestone 4 SOP-SSOT - Phase 1.2
 * @architecture Uses Zustand with persist middleware for offline resilience
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from '@/lib/logger';
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
    calculateQuestionStatus,
    getSectionDurationSecondsMap,
} from '@/types/exam';

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
    sessionToken: null,  // P0 FIX: Session token for multi-device/tab prevention

    // Navigation
    currentSectionIndex: 0,
    currentQuestionIndex: 0,

    // Section locking
    lockedSections: [],

    // Responses
    responses: {},

    // Timer state per section
    sectionTimers: (() => {
        const defaults = getSectionDurationSecondsMap();
        return {
            VARC: createInitialTimerState('VARC', defaults.VARC),
            DILR: createInitialTimerState('DILR', defaults.DILR),
            QA: createInitialTimerState('QA', defaults.QA),
        };
    })(),

    // Question tracking - converted to arrays for JSON serialization
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

    return create<ExamStore>()(
        persist(
            (set, get) => ({
                ...initialState,

                // =====================================================================
                // INITIALIZATION
                // =====================================================================

                initializeExam: (data: ExamData) => {
                    const { paper, questions, attempt } = data;
                    const currentState = get();

                    // P0 FIX: Check if we're resuming the same attempt with persisted state
                    // If so, preserve the existing timer and response state
                    if (currentState.attemptId === attempt.id && currentState.hasHydrated) {
                        // Same attempt, already initialized - just update hydration flag
                        // This prevents timer reset on page refresh
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

                    // Initialize section timers
                    // Use server-synced time_remaining from attempt if available (resuming)
                    // Otherwise start fresh with delta-time based calculation
                    const now = Date.now();

                    // Calculate startedAt from attempt.started_at for accurate delta-time
                    const attemptStartedAt = attempt.started_at
                        ? new Date(attempt.started_at).getTime()
                        : now;

                    const sectionDurations = getSectionDurationSecondsMap(paper.sections);
                    const sectionTimers: Record<SectionName, SectionTimerState> = {
                        VARC: {
                            sectionName: 'VARC',
                            // Use the original attempt start time for delta calculation
                            startedAt: attemptStartedAt,
                            durationSeconds: sectionDurations.VARC,
                            remainingSeconds: sectionDurations.VARC,
                            isExpired: false,
                        },
                        DILR: {
                            sectionName: 'DILR',
                            startedAt: 0, // Will be set when section starts
                            durationSeconds: sectionDurations.DILR,
                            remainingSeconds: sectionDurations.DILR,
                            isExpired: false,
                        },
                        QA: {
                            sectionName: 'QA',
                            startedAt: 0, // Will be set when section starts
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
                            // If VARC has less than full time, calculate proper startedAt
                            if (timeRemaining.VARC < sectionDurations.VARC) {
                                const elapsedSeconds = sectionDurations.VARC - timeRemaining.VARC;
                                sectionTimers.VARC.startedAt = now - (elapsedSeconds * 1000);
                            }
                        }
                        if (timeRemaining.DILR !== undefined) {
                            sectionTimers.DILR.remainingSeconds = timeRemaining.DILR;
                        }
                        if (timeRemaining.QA !== undefined) {
                            sectionTimers.QA.remainingSeconds = timeRemaining.QA;
                        }
                    }

                    // Determine current section from attempt
                    const currentSection = attempt.current_section || 'VARC';
                    const currentSectionIndex = SECTION_ORDER[currentSection];

                    // If we're on a later section, set its startedAt to now (or calculate from remaining)
                    if (currentSectionIndex > 0 && sectionTimers[currentSection].startedAt === 0) {
                        const sectionTimer = sectionTimers[currentSection];
                        if (sectionTimer.remainingSeconds < sectionDurations[currentSection]) {
                            // Calculate startedAt based on remaining time
                            const elapsedSeconds = sectionDurations[currentSection] - sectionTimer.remainingSeconds;
                            sectionTimer.startedAt = now - (elapsedSeconds * 1000);
                        } else {
                            sectionTimer.startedAt = now;
                        }
                    }

                    // P0 FIX: Generate session token for multi-device/tab prevention
                    // Use crypto.randomUUID for secure random UUID generation
                    const sessionToken = typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    set({
                        hasHydrated: true,
                        attemptId: attempt.id,
                        paperId: paper.id,
                        sessionToken,
                        currentSectionIndex,
                        currentQuestionIndex: 0,
                        lockedSections: [],
                        responses,
                        sectionTimers,
                        visitedQuestions: new Set(),
                        markedQuestions: new Set(),
                        isSubmitting: false,
                        isAutoSubmitting: false,
                    });
                },

                setHasHydrated: (hydrated: boolean) => {
                    set({ hasHydrated: hydrated });
                },

                // =====================================================================
                // NAVIGATION
                // =====================================================================

                goToQuestion: (questionId: string, sectionIndex: number, questionIndex: number) => {
                    const state = get();

                    // Validate section access (no backward navigation between sections)
                    if (sectionIndex < state.currentSectionIndex) {
                        logger.warn('Cannot navigate to locked section', { attemptId: state.attemptId, targetSection: sectionIndex, currentSection: state.currentSectionIndex });
                        return;
                    }

                    // Mark question as visited
                    const newVisitedQuestions = new Set(state.visitedQuestions);
                    newVisitedQuestions.add(questionId);

                    // Update response status if first visit
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
                    // This will be called with question context from the UI
                    // The actual logic depends on current section's question list
                    set({
                        currentQuestionIndex: state.currentQuestionIndex + 1,
                    });
                },

                goToPreviousQuestion: () => {
                    const state = get();
                    if (state.currentQuestionIndex > 0) {
                        set({
                            currentQuestionIndex: state.currentQuestionIndex - 1,
                        });
                    }
                },

                // =====================================================================
                // ANSWER MANAGEMENT
                // =====================================================================

                setAnswer: (questionId: string, answer: string | null) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) {
                        logger.warn('Response not found for question', { questionId, attemptId: state.attemptId });
                        return;
                    }

                    const hasAnswer = answer !== null && answer !== '';
                    const newStatus = calculateQuestionStatus(
                        hasAnswer,
                        response.isMarkedForReview,
                        true // Always visited if answering
                    );

                    // Update marked questions set if needed
                    const newMarkedQuestions = new Set(state.markedQuestions);
                    if (response.isMarkedForReview) {
                        newMarkedQuestions.add(questionId);
                    }

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
                    });
                },

                clearAnswer: (questionId: string) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) return;

                    const newStatus = calculateQuestionStatus(
                        false, // No answer
                        response.isMarkedForReview,
                        true // Still visited
                    );

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                answer: null,
                                status: newStatus,
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

                    const newStatus = calculateQuestionStatus(hasAnswer, newIsMarked, true);

                    // Update marked questions set
                    const newMarkedQuestions = new Set(state.markedQuestions);
                    if (newIsMarked) {
                        newMarkedQuestions.add(questionId);
                    } else {
                        newMarkedQuestions.delete(questionId);
                    }

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

                    // Add to locked sections if not already
                    if (!state.lockedSections.includes(sectionName)) {
                        set({
                            lockedSections: [...state.lockedSections, sectionName],
                        });
                    }
                },

                moveToNextSection: () => {
                    const state = get();
                    const currentSection = getSectionByIndex(state.currentSectionIndex);

                    // Lock current section
                    const newLockedSections = state.lockedSections.includes(currentSection)
                        ? state.lockedSections
                        : [...state.lockedSections, currentSection];

                    // Move to next section if not at QA
                    if (state.currentSectionIndex < 2) {
                        const nextSectionIndex = state.currentSectionIndex + 1;
                        const nextSection = getSectionByIndex(nextSectionIndex);

                        // Start timer for next section
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
                        // At QA - just lock it
                        set({
                            lockedSections: newLockedSections,
                        });
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
                storage: createJSONStorage(() => localStorage),
                // Only persist essential data (not hydration flags or submission states)
                partialize: (state) => ({
                    attemptId: state.attemptId,
                    paperId: state.paperId,
                    sessionToken: state.sessionToken, // P0 FIX: Persist session token
                    currentSectionIndex: state.currentSectionIndex,
                    currentQuestionIndex: state.currentQuestionIndex,
                    lockedSections: state.lockedSections,
                    responses: state.responses,
                    sectionTimers: state.sectionTimers,
                    // Convert Sets to arrays for JSON serialization
                    visitedQuestions: Array.from(state.visitedQuestions),
                    markedQuestions: Array.from(state.markedQuestions),
                }),
                // Handle rehydration
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        // Convert arrays back to Sets after rehydration
                        state.visitedQuestions = new Set(
                            Array.isArray(state.visitedQuestions)
                                ? state.visitedQuestions
                                : []
                        );
                        state.markedQuestions = new Set(
                            Array.isArray(state.markedQuestions)
                                ? state.markedQuestions
                                : []
                        );
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

// Default store for initial use (will be replaced with attemptId-specific store)
export const useExamStore = createExamStore();

// =============================================================================
// SELECTORS (for optimized re-renders)
// =============================================================================

/** Select current section name */
export const selectCurrentSection = (state: ExamStore): SectionName =>
    getSectionByIndex(state.currentSectionIndex);

/** Select current section timer */
export const selectCurrentTimer = (state: ExamStore): SectionTimerState => {
    const section = getSectionByIndex(state.currentSectionIndex);
    return state.sectionTimers[section];
};

/** Select response for a specific question */
export const selectResponse = (questionId: string) =>
    (state: ExamStore): ResponseState | undefined => state.responses[questionId];

/** Select if a section is locked */
export const selectIsSectionLocked = (sectionName: SectionName) =>
    (state: ExamStore): boolean => state.lockedSections.includes(sectionName);

/** Select question status for palette */
export const selectQuestionStatus = (questionId: string) =>
    (state: ExamStore): QuestionStatus => {
        const response = state.responses[questionId];
        return response?.status ?? 'not_visited';
    };

/** Count questions by status in current section */
export const selectSectionCounts = (questions: Question[]) =>
    (state: ExamStore) => {
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
