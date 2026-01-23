/**
 * @fileoverview High-Precision Exam Timer Hook
 * @description Delta-time computation timer for CAT exam sections
 * @blueprint Milestone 4 SOP-SSOT - Phase 2.1 & 2.2
 * @deviation Uses delta-time (Date.now() - startedAt) instead of setInterval decrement
 * @rationale Survives tab sleep, browser throttling, and provides accurate time even after resume
 */

import { useEffect, useRef, useCallback } from 'react';
import { useExamStore, selectCurrentSection, selectCurrentTimer } from '../index';
import type { SectionName, SectionTimerState } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

export interface UseExamTimerOptions {
    /** Callback when a section expires (for auto-submit) */
    onSectionExpire?: (sectionName: SectionName) => void;
    /** Callback when exam completes (QA section expires) */
    onExamComplete?: () => void;
    /** Update interval in milliseconds (default: 1000ms) */
    intervalMs?: number;
    /** Warning threshold in seconds (default: 300 = 5 minutes) */
    warningThresholdSeconds?: number;
    /** Critical threshold in seconds (default: 60 = 1 minute) */
    criticalThresholdSeconds?: number;
}

export interface TimerDisplayData {
    /** Minutes remaining (for display) */
    minutes: number;
    /** Seconds remaining (for display) */
    seconds: number;
    /** Total seconds remaining */
    totalSeconds: number;
    /** Formatted time string "MM:SS" */
    displayTime: string;
    /** Timer state: 'normal' | 'warning' | 'critical' | 'expired' */
    state: 'normal' | 'warning' | 'critical' | 'expired';
    /** Current section name */
    sectionName: SectionName;
    /** Is the section expired */
    isExpired: boolean;
    /** Progress percentage (0-100, decreasing) */
    progressPercent: number;
}

// =============================================================================
// DELTA-TIME CALCULATION
// =============================================================================

/**
 * Calculate remaining time using delta-time computation
 * This approach survives tab sleep and browser throttling
 * 
 * @param timer - Section timer state from store
 * @returns Remaining seconds (clamped to 0)
 */
function calculateRemainingSeconds(timer: SectionTimerState): number {
    if (timer.isExpired) return 0;
    if (timer.startedAt === 0) return timer.durationSeconds;

    const now = Date.now();
    const elapsedMs = now - timer.startedAt;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = timer.durationSeconds - elapsedSeconds;

    return Math.max(0, remaining);
}

/**
 * Format seconds to MM:SS display string
 */
function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Determine timer state based on remaining time
 */
function getTimerState(
    remainingSeconds: number,
    isExpired: boolean,
    warningThreshold: number,
    criticalThreshold: number
): 'normal' | 'warning' | 'critical' | 'expired' {
    if (isExpired || remainingSeconds <= 0) return 'expired';
    if (remainingSeconds <= criticalThreshold) return 'critical';
    if (remainingSeconds <= warningThreshold) return 'warning';
    return 'normal';
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * High-precision exam timer hook with delta-time computation
 * 
 * Features:
 * - Delta-time based (survives tab sleep/throttling)
 * - Auto-updates store with remaining time
 * - Triggers section expiry callbacks
 * - Provides formatted display data
 * - Handles section transitions automatically
 * 
 * @example
 * ```tsx
 * const { timerData, isActive, pause, resume } = useExamTimer({
 *   onSectionExpire: (section) => handleAutoSubmit(section),
 *   onExamComplete: () => submitExam(),
 * });
 * 
 * return <div className={timerData.state}>{timerData.displayTime}</div>;
 * ```
 */
export function useExamTimer(options: UseExamTimerOptions = {}) {
    const {
        onSectionExpire,
        onExamComplete,
        intervalMs = 1000,
        warningThresholdSeconds = 300, // 5 minutes
        criticalThresholdSeconds = 60, // 1 minute
    } = options;

    // Store selectors
    const currentSection = useExamStore(selectCurrentSection);
    const currentTimer = useExamStore(selectCurrentTimer);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const isSubmitting = useExamStore((s) => s.isSubmitting);
    const isAutoSubmitting = useExamStore((s) => s.isAutoSubmitting);

    // Store actions
    const updateSectionTimer = useExamStore((s) => s.updateSectionTimer);
    const expireSection = useExamStore((s) => s.expireSection);
    const moveToNextSection = useExamStore((s) => s.moveToNextSection);
    const setAutoSubmitting = useExamStore((s) => s.setAutoSubmitting);

    // Refs for stable callback identity
    const onSectionExpireRef = useRef(onSectionExpire);
    const onExamCompleteRef = useRef(onExamComplete);

    // Track if timer is active
    const isActiveRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Track last known section to detect transitions
    const lastSectionRef = useRef<SectionName>(currentSection);

    // Update refs when callbacks change
    useEffect(() => {
        onSectionExpireRef.current = onSectionExpire;
        onExamCompleteRef.current = onExamComplete;
    }, [onSectionExpire, onExamComplete]);

    /**
     * Handle section expiry with auto-transition
     */
    const handleSectionExpiry = useCallback(async (sectionName: SectionName) => {
        // Prevent duplicate handling
        if (isAutoSubmitting) return;

        setAutoSubmitting(true);

        try {
            // Mark section as expired in store
            expireSection(sectionName);

            // Call external handler if provided
            await onSectionExpireRef.current?.(sectionName);

            // Check if this is the last section (QA)
            const sectionIndex = currentSectionIndex;
            if (sectionIndex >= 2) {
                // Last section - exam complete
                await onExamCompleteRef.current?.();
            } else {
                // Move to next section
                moveToNextSection();
            }
        } finally {
            setAutoSubmitting(false);
        }
    }, [currentSectionIndex, expireSection, isAutoSubmitting, moveToNextSection, setAutoSubmitting]);

    /**
     * Core timer tick - calculate remaining time using delta
     */
    const tick = useCallback(() => {
        if (!hasHydrated || isSubmitting) return;

        const timer = useExamStore.getState().sectionTimers[currentSection];

        // Don't tick if section hasn't started or already expired
        if (timer.startedAt === 0 || timer.isExpired) return;

        // Calculate remaining using delta-time
        const remaining = calculateRemainingSeconds(timer);

        // Update store with new remaining time
        updateSectionTimer(currentSection, remaining);

        // Check for expiry
        if (remaining <= 0 && !timer.isExpired) {
            handleSectionExpiry(currentSection);
        }
    }, [currentSection, hasHydrated, isSubmitting, updateSectionTimer, handleSectionExpiry]);

    /**
     * Start/restart the timer interval
     */
    const startTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        isActiveRef.current = true;
        intervalRef.current = setInterval(tick, intervalMs);

        // Immediate tick to sync
        tick();
    }, [tick, intervalMs]);

    /**
     * Stop the timer interval
     */
    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        isActiveRef.current = false;
    }, []);

    /**
     * Pause timer (keeps state, stops ticking)
     */
    const pause = useCallback(() => {
        stopTimer();
    }, [stopTimer]);

    /**
     * Resume timer after pause
     */
    const resume = useCallback(() => {
        if (!isActiveRef.current) {
            startTimer();
        }
    }, [startTimer]);

    // Start timer when hydrated and not submitting
    useEffect(() => {
        if (hasHydrated && !isSubmitting && !isAutoSubmitting) {
            startTimer();
        }

        return () => {
            stopTimer();
        };
    }, [hasHydrated, isSubmitting, isAutoSubmitting, startTimer, stopTimer]);

    // Handle section transitions - restart timer on section change
    useEffect(() => {
        if (currentSection !== lastSectionRef.current) {
            lastSectionRef.current = currentSection;
            // New section - ensure timer is running
            if (hasHydrated && !isSubmitting) {
                tick(); // Immediate sync
            }
        }
    }, [currentSection, hasHydrated, isSubmitting, tick]);

    // Handle visibility change (tab switch, minimize)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab hidden - we could pause here but delta-time handles it
                // Just reduce interval frequency to save resources
            } else {
                // Tab visible - immediate sync via delta-time
                tick();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [tick]);

    // Calculate display data
    const timerData: TimerDisplayData = (() => {
        const remaining = calculateRemainingSeconds(currentTimer);
        const state = getTimerState(
            remaining,
            currentTimer.isExpired,
            warningThresholdSeconds,
            criticalThresholdSeconds
        );

        const progressPercent = currentTimer.durationSeconds > 0
            ? (remaining / currentTimer.durationSeconds) * 100
            : 0;

        return {
            minutes: Math.floor(remaining / 60),
            seconds: remaining % 60,
            totalSeconds: remaining,
            displayTime: formatTime(remaining),
            state,
            sectionName: currentSection,
            isExpired: currentTimer.isExpired || remaining <= 0,
            progressPercent: Math.max(0, Math.min(100, progressPercent)),
        };
    })();

    return {
        /** Current timer display data */
        timerData,
        /** Is the timer currently running */
        isActive: isActiveRef.current,
        /** Is the timer in auto-submit mode */
        isAutoSubmitting,
        /** Pause the timer (UI only, delta-time continues) */
        pause,
        /** Resume the timer */
        resume,
        /** Force an immediate tick (recalculate time) */
        sync: tick,
    };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Get timer data for a specific section (not necessarily current)
 */
export function useSectionTimer(sectionName: SectionName) {
    const timer = useExamStore((s) => s.sectionTimers[sectionName]);

    const remaining = calculateRemainingSeconds(timer);

    return {
        remaining,
        displayTime: formatTime(remaining),
        isExpired: timer.isExpired || remaining <= 0,
        isStarted: timer.startedAt > 0,
        progressPercent: timer.durationSeconds > 0
            ? (remaining / timer.durationSeconds) * 100
            : 0,
    };
}

/**
 * Get all section timers summary
 */
export function useAllSectionTimers() {
    const timers = useExamStore((s) => s.sectionTimers);

    return {
        VARC: {
            remaining: calculateRemainingSeconds(timers.VARC),
            isExpired: timers.VARC.isExpired,
        },
        DILR: {
            remaining: calculateRemainingSeconds(timers.DILR),
            isExpired: timers.DILR.isExpired,
        },
        QA: {
            remaining: calculateRemainingSeconds(timers.QA),
            isExpired: timers.QA.isExpired,
        },
        totalRemaining:
            calculateRemainingSeconds(timers.VARC) +
            calculateRemainingSeconds(timers.DILR) +
            calculateRemainingSeconds(timers.QA),
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { calculateRemainingSeconds, formatTime, getTimerState };
