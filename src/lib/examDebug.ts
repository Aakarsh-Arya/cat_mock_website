/**
 * @fileoverview Exam Debug Utilities
 * @description Dev-only debug logging for exam engine, guarded by EXAM_DEBUG flag
 * @usage Enable by setting NEXT_PUBLIC_EXAM_DEBUG=true in .env.local
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const EXAM_DEBUG_ENABLED =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_EXAM_DEBUG === 'true';

const DEBUG_PREFIX = '[EXAM_DEBUG]';

// =============================================================================
// DEBUG LOGGER
// =============================================================================

/**
 * Exam-specific debug logger that only outputs when EXAM_DEBUG is enabled
 */
export const examDebug = {
    /**
     * Check if debug mode is enabled
     */
    isEnabled(): boolean {
        return EXAM_DEBUG_ENABLED;
    },

    /**
     * Log store initialization details
     */
    storeInit(data: {
        attemptId: string | null;
        storeName: string;
        sessionToken: string | null;
        currentSectionIndex: number;
        currentQuestionIndex: number;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} Store initialized`,
            '\n  attemptId:', data.attemptId,
            '\n  storeName:', data.storeName,
            '\n  sessionToken:', data.sessionToken ? `${data.sessionToken.slice(0, 8)}...` : null,
            '\n  section:', data.currentSectionIndex,
            '\n  question:', data.currentQuestionIndex
        );
    },

    /**
     * Log navigation changes
     */
    navigation(data: {
        sectionIndex: number;
        questionIndex: number;
        questionId: string;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} Navigation`,
            '\n  section:', data.sectionIndex,
            '\n  question:', data.questionIndex,
            '\n  questionId:', data.questionId
        );
    },

    /**
     * Log response status changes
     */
    responseStatus(data: {
        questionId: string;
        oldStatus: string;
        newStatus: string;
        answer: string | null;
        isMarkedForReview: boolean;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} Response status change`,
            '\n  questionId:', data.questionId,
            '\n  status:', data.oldStatus, '→', data.newStatus,
            '\n  hasAnswer:', data.answer !== null && data.answer !== '',
            '\n  isMarked:', data.isMarkedForReview
        );
    },

    /**
     * Log TITA keypad input
     */
    titaInput(data: {
        questionId: string;
        key: string;
        oldValue: string;
        newValue: string;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} TITA input`,
            '\n  questionId:', data.questionId,
            '\n  key:', data.key,
            '\n  value:', data.oldValue, '→', data.newValue
        );
    },

    /**
     * Log mark for review action
     */
    markForReview(data: {
        questionId: string;
        hadSavedAnswer: boolean;
        newStatus: string;
        isMarking: boolean;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} Mark for Review`,
            '\n  questionId:', data.questionId,
            '\n  hadSavedAnswer:', data.hadSavedAnswer,
            '\n  newStatus:', data.newStatus,
            '\n  isMarking:', data.isMarking
        );
    },

    /**
     * Log submission attempt
     */
    submitAttempt(data: {
        attemptId: string;
        sessionToken: string | null;
        submissionId: string;
        responsesCount: number;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} Submit attempt`,
            '\n  attemptId:', data.attemptId,
            '\n  sessionToken:', data.sessionToken ? `${data.sessionToken.slice(0, 8)}...` : null,
            '\n  submissionId:', data.submissionId,
            '\n  responses:', data.responsesCount
        );
    },

    /**
     * Log submission result
     */
    submitResult(data: {
        success: boolean;
        error?: string;
        attemptId: string;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        const level = data.success ? 'log' : 'error';
        console[level](
            `${DEBUG_PREFIX} Submit result`,
            '\n  success:', data.success,
            '\n  error:', data.error ?? 'none',
            '\n  attemptId:', data.attemptId
        );
    },

    /**
     * Log session token operations
     */
    sessionToken(data: {
        operation: 'set' | 'validate' | 'mismatch';
        token: string | null;
        attemptId: string | null;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} Session token ${data.operation}`,
            '\n  token:', data.token ? `${data.token.slice(0, 8)}...` : null,
            '\n  attemptId:', data.attemptId
        );
    },

    /**
     * Log localStorage key being used
     */
    localStorage(data: {
        operation: 'read' | 'write' | 'clear';
        key: string;
        attemptId: string | null;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} localStorage ${data.operation}`,
            '\n  key:', data.key,
            '\n  attemptId:', data.attemptId
        );
    },

    /**
     * Log resume detection
     */
    resume(data: {
        attemptId: string;
        fromSection: number;
        fromQuestion: number;
        preservedState: boolean;
    }): void {
        if (!EXAM_DEBUG_ENABLED) return;
        console.log(
            `${DEBUG_PREFIX} Resume detection`,
            '\n  attemptId:', data.attemptId,
            '\n  section:', data.fromSection,
            '\n  question:', data.fromQuestion,
            '\n  preservedState:', data.preservedState
        );
    },

    /**
     * Generic debug log
     */
    log(message: string, data?: Record<string, unknown>): void {
        if (!EXAM_DEBUG_ENABLED) return;
        if (data) {
            console.log(`${DEBUG_PREFIX} ${message}`, data);
        } else {
            console.log(`${DEBUG_PREFIX} ${message}`);
        }
    },

    /**
     * Warning log (always shows in debug mode)
     */
    warn(message: string, data?: Record<string, unknown>): void {
        if (!EXAM_DEBUG_ENABLED) return;
        if (data) {
            console.warn(`${DEBUG_PREFIX} ⚠️ ${message}`, data);
        } else {
            console.warn(`${DEBUG_PREFIX} ⚠️ ${message}`);
        }
    },
};

// =============================================================================
// CLEANUP UTILITIES
// =============================================================================

/**
 * Clean up orphaned temp state from localStorage
 * Call this on app startup to prevent ghost bugs
 */
export function cleanupOrphanedExamState(currentAttemptId?: string | null): void {
    if (typeof window === 'undefined') return;

    const tempKey = 'cat-exam-state-temp';
    const tempState = localStorage.getItem(tempKey);
    if (!tempState) return;

    let storedAttemptId: string | null = null;
    try {
        const parsed = JSON.parse(tempState) as { state?: { attemptId?: string | null }; attemptId?: string | null };
        storedAttemptId = parsed?.state?.attemptId ?? parsed?.attemptId ?? null;
    } catch {
        storedAttemptId = null;
    }

    let activeAttemptId: string | null = currentAttemptId ?? null;
    if (!activeAttemptId) {
        const parts = window.location.pathname.split('/');
        activeAttemptId = parts[1] === 'exam' ? (parts[2] ?? null) : null;
    }

    if (activeAttemptId) {
        // Keep temp state if it matches the active attempt or is missing (avoid data loss on refresh).
        if (!storedAttemptId || storedAttemptId === activeAttemptId) return;
        examDebug.warn('Found temp state for different attempt, removing', {
            key: tempKey,
            storedAttemptId,
            activeAttemptId,
        });
        localStorage.removeItem(tempKey);
        return;
    }

    examDebug.warn('Found orphaned temp state, removing', { key: tempKey });
    localStorage.removeItem(tempKey);
}

/**
 * Get all exam-related localStorage keys
 */
export function getExamStorageKeys(): string[] {
    if (typeof window === 'undefined') return [];

    return Object.keys(localStorage).filter(key =>
        key.startsWith('cat-exam-state')
    );
}

/**
 * Clear all exam state from localStorage (for debugging)
 */
export function clearAllExamState(): void {
    if (typeof window === 'undefined') return;

    const keys = getExamStorageKeys();
    keys.forEach(key => {
        examDebug.localStorage({ operation: 'clear', key, attemptId: null });
        localStorage.removeItem(key);
    });

    examDebug.log(`Cleared ${keys.length} exam state keys`);
}
