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
    onSectionExpire?: (sectionName: SectionName) => void | Promise<void>;
    onExamComplete?: () => void | Promise<void>;
    intervalMs?: number;
    warningThresholdSeconds?: number;
    criticalThresholdSeconds?: number;
}

export interface TimerDisplayData {
    minutes: number;
    seconds: number;
    totalSeconds: number;
    /** Formatted time string "HH:MM:SS" */
    displayTime: string;
    state: 'normal' | 'warning' | 'critical' | 'expired';
    sectionName: SectionName;
    isExpired: boolean;
    progressPercent: number;
}

// =============================================================================
// DELTA-TIME CALCULATION
// =============================================================================

function calculateRemainingSeconds(timer: SectionTimerState): number {
    if (timer.isExpired) return 0;
    if (timer.startedAt === 0) return timer.durationSeconds;

    // Guard against clock skew (e.g., system time changes)
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timer.startedAt) / 1000));
    return Math.max(0, timer.durationSeconds - elapsedSeconds);
}

/** Format seconds to "HH:MM:SS" */
function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
}

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

export function useExamTimer(options: UseExamTimerOptions = {}) {
    const {
        onSectionExpire,
        onExamComplete,
        intervalMs = 1000,
        warningThresholdSeconds = 300,
        criticalThresholdSeconds = 60,
    } = options;

    const currentSection = useExamStore(selectCurrentSection);
    const currentTimer = useExamStore(selectCurrentTimer);
    const isInitialized = useExamStore((s) => s.isInitialized);
    const isSubmitting = useExamStore((s) => s.isSubmitting);
    const isAutoSubmitting = useExamStore((s) => s.isAutoSubmitting);

    const updateSectionTimer = useExamStore((s) => s.updateSectionTimer);
    const expireSection = useExamStore((s) => s.expireSection);
    const moveToNextSection = useExamStore((s) => s.moveToNextSection);
    const setAutoSubmitting = useExamStore((s) => s.setAutoSubmitting);

    const onSectionExpireRef = useRef(onSectionExpire);
    const onExamCompleteRef = useRef(onExamComplete);
    const currentSectionRef = useRef(currentSection);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isActiveRef = useRef(false);

    // Manual pause should survive re-renders/effects
    const isManuallyPausedRef = useRef(false);

    // Prevent double-trigger of expiry (interval ticks + visibility effect + delayed ticks)
    const expiryInProgressRef = useRef(false);

    // CRITICAL: Track sections that have COMPLETED expiry processing
    // Once a section is in this set, it should NEVER be processed again
    // This prevents the loop caused by refs resetting in finally blocks
    const expiredSectionsProcessedRef = useRef<Set<SectionName>>(new Set());

    useEffect(() => {
        onSectionExpireRef.current = onSectionExpire;
        onExamCompleteRef.current = onExamComplete;
    }, [onSectionExpire, onExamComplete]);

    // Keep currentSectionRef in sync to avoid stale closures in tick
    useEffect(() => {
        currentSectionRef.current = currentSection;
    }, [currentSection]);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        isActiveRef.current = false;
    }, []);

    const handleSectionExpiry = useCallback(
        async (sectionName: SectionName) => {
            // CRITICAL: Check if this section was ALREADY processed - permanent gate
            if (expiredSectionsProcessedRef.current.has(sectionName)) {
                console.log('[useExamTimer] Section already processed, skipping', { sectionName });
                return;
            }

            // Atomic check-and-set to prevent race conditions
            // Check both local ref AND store state before proceeding
            const storeState = useExamStore.getState();
            if (expiryInProgressRef.current) {
                console.log('[useExamTimer] Section expiry blocked: already in progress', { sectionName });
                return;
            }
            if (storeState.isAutoSubmitting || storeState.isSubmitting) {
                console.log('[useExamTimer] Section expiry blocked: submit in progress', { sectionName });
                return;
            }

            // Set flag immediately to block any concurrent calls
            expiryInProgressRef.current = true;
            // CRITICAL: Mark section as processed IMMEDIATELY (before any async work)
            // This is the permanent gate that prevents re-processing
            expiredSectionsProcessedRef.current.add(sectionName);

            // Stop ticks immediately (don’t wait for state re-render)
            stopTimer();

            // CRITICAL: Mark section as expired FIRST (before setAutoSubmitting)
            // This ensures tick() won't re-trigger even if state updates are delayed
            expireSection(sectionName);

            setAutoSubmitting(true);
            try {
                console.log('[useExamTimer] Section expiry processing', { sectionName });

                // Persist section responses / server-side save (if provided)
                await onSectionExpireRef.current?.(sectionName);

                // Determine completion based on sectionName (most reliable)
                if (sectionName === 'QA') {
                    console.log('[useExamTimer] QA expired - calling onExamComplete');
                    await onExamCompleteRef.current?.();
                    console.log('[useExamTimer] onExamComplete returned');
                } else {
                    moveToNextSection();
                }
            } finally {
                console.log('[useExamTimer] Section expiry cleanup - setting isAutoSubmitting=false');
                setAutoSubmitting(false);
                // CRITICAL: Only reset expiryInProgressRef, NOT expiredSectionsProcessedRef
                // The section remains in expiredSectionsProcessedRef FOREVER to prevent re-processing
                expiryInProgressRef.current = false;

                // If not submitting and not manually paused, resume ticking for the next section
                const st = useExamStore.getState();
                if (!isManuallyPausedRef.current && st.isInitialized && !st.isSubmitting && !st.isAutoSubmitting) {
                    // start will happen via effect too, but doing nothing here keeps it simple
                }
            }
        },
        [expireSection, moveToNextSection, setAutoSubmitting, stopTimer]
    );

    const tick = useCallback(() => {
        const st = useExamStore.getState();
        if (!st.isInitialized || st.isSubmitting || st.isAutoSubmitting) return;
        if (isManuallyPausedRef.current) return;
        if (expiryInProgressRef.current) return;

        // Use ref to get current section (avoids stale closure)
        const section = currentSectionRef.current;

        // CRITICAL: Skip if this section was already processed
        if (expiredSectionsProcessedRef.current.has(section)) return;

        const timer = st.sectionTimers[section];
        if (!timer) return;

        // If not started or already expired, nothing to do
        if (timer.startedAt === 0 || timer.isExpired) return;

        const remaining = calculateRemainingSeconds(timer);

        // Avoid redundant state updates if store already has this remainingSeconds
        const currentRemainingSeconds =
            (timer as unknown as { remainingSeconds?: number }).remainingSeconds ??
            (timer as unknown as { remaining_seconds?: number }).remaining_seconds;

        if (typeof currentRemainingSeconds !== 'number' || currentRemainingSeconds !== remaining) {
            updateSectionTimer(section, remaining);
        }

        if (remaining <= 0 && !timer.isExpired) {
            void handleSectionExpiry(section);
        }
    }, [updateSectionTimer, handleSectionExpiry]);

    const startTimer = useCallback(() => {
        stopTimer();

        if (intervalMs <= 0) {
            // Fallback: no interval, but still do one sync tick.
            isActiveRef.current = true;
            tick();
            return;
        }

        isActiveRef.current = true;
        intervalRef.current = setInterval(tick, intervalMs);
        tick();
    }, [intervalMs, stopTimer, tick]);

    const pause = useCallback(() => {
        isManuallyPausedRef.current = true;
        stopTimer();
    }, [stopTimer]);

    const resume = useCallback(() => {
        isManuallyPausedRef.current = false;
        const st = useExamStore.getState();
        if (st.isInitialized && !st.isSubmitting && !st.isAutoSubmitting) {
            startTimer();
        }
    }, [startTimer]);

    // Start/stop lifecycle
    useEffect(() => {
        const st = useExamStore.getState();
        const shouldRun = st.isInitialized && !st.isSubmitting && !st.isAutoSubmitting && !isManuallyPausedRef.current;

        if (shouldRun) startTimer();
        else stopTimer();

        return () => stopTimer();
    }, [isInitialized, isSubmitting, isAutoSubmitting, startTimer, stopTimer]);

    // Ensure expiry is handled even if interval ticks are delayed (tab sleep / throttling)
    useEffect(() => {
        if (!isInitialized || isSubmitting || isAutoSubmitting) return;
        if (isManuallyPausedRef.current) return;
        if (expiryInProgressRef.current) return;
        // CRITICAL: Skip if this section was already processed
        if (expiredSectionsProcessedRef.current.has(currentSection)) return;

        // CRITICAL FIX: If timer is already marked expired from initialization, don't trigger expiry
        // This prevents auto-submit when opening an already-expired exam
        if (currentTimer.isExpired) return;
        if (currentTimer.startedAt === 0) return;

        const remaining = calculateRemainingSeconds(currentTimer);
        if (remaining <= 0) {
            void handleSectionExpiry(currentSection);
        }
    }, [currentSection, currentTimer, handleSectionExpiry, isInitialized, isSubmitting, isAutoSubmitting]);

    // Recovery: if the current timer transitions to expired DURING the exam (not from init), force expiry handling.
    // CRITICAL FIX: Added a ref to track if we saw the timer as non-expired first
    const sawTimerRunningRef = useRef<Set<SectionName>>(new Set());

    useEffect(() => {
        // Track if we've seen this timer running (not expired)
        if (!currentTimer.isExpired && currentTimer.startedAt > 0) {
            sawTimerRunningRef.current.add(currentSection);
        }
    }, [currentSection, currentTimer.isExpired, currentTimer.startedAt]);

    useEffect(() => {
        if (!isInitialized || isSubmitting || isAutoSubmitting) return;
        if (isManuallyPausedRef.current) return;
        if (expiryInProgressRef.current) return;
        // CRITICAL: Skip if this section was already processed
        if (expiredSectionsProcessedRef.current.has(currentSection)) return;
        if (!currentTimer.isExpired) return;

        // CRITICAL FIX: Only trigger expiry if we SAW the timer running
        // This prevents auto-submit when opening an already-expired exam
        if (!sawTimerRunningRef.current.has(currentSection)) {
            console.log('[useExamTimer] Skipping expiry - timer was never seen running', { currentSection });
            return;
        }

        void handleSectionExpiry(currentSection);
    }, [currentSection, currentTimer.isExpired, handleSectionExpiry, isInitialized, isSubmitting, isAutoSubmitting]);

    // Auto-pause timer on tab hidden / app background / screen lock;
    // resume + sync on focus return.
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Pause the interval immediately so no ticks fire in the background.
                // This prevents "time jumps" when the browser throttles intervals.
                stopTimer();
            } else {
                // Tab/app came back: recalculate remaining time (delta-time is
                // authoritative) and restart the tick interval.
                if (!isManuallyPausedRef.current) {
                    const st = useExamStore.getState();
                    if (st.isInitialized && !st.isSubmitting && !st.isAutoSubmitting) {
                        startTimer(); // starts interval + runs immediate tick()
                    }
                }
            }
        };

        // Handle offline: stop timer to avoid phantom counting while disconnected
        const handleOffline = () => stopTimer();

        // Handle online: resume timer
        const handleOnline = () => {
            if (!isManuallyPausedRef.current) {
                const st = useExamStore.getState();
                if (st.isInitialized && !st.isSubmitting && !st.isAutoSubmitting) {
                    startTimer();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [tick, stopTimer, startTimer]);

    const timerData: TimerDisplayData = (() => {
        const remaining = calculateRemainingSeconds(currentTimer);
        const state = getTimerState(remaining, currentTimer.isExpired, warningThresholdSeconds, criticalThresholdSeconds);

        const progressPercent =
            currentTimer.durationSeconds > 0 ? (remaining / currentTimer.durationSeconds) * 100 : 0;

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
        timerData,
        isActive: isActiveRef.current,
        isAutoSubmitting,
        pause,
        resume,
        sync: tick,
    };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export function useSectionTimer(sectionName: SectionName) {
    const timer = useExamStore((s) => s.sectionTimers[sectionName]);
    const remaining = calculateRemainingSeconds(timer);

    return {
        remaining,
        displayTime: formatTime(remaining),
        isExpired: timer.isExpired || remaining <= 0,
        isStarted: timer.startedAt > 0,
        progressPercent: timer.durationSeconds > 0 ? (remaining / timer.durationSeconds) * 100 : 0,
    };
}

export function useAllSectionTimers() {
    const timers = useExamStore((s) => s.sectionTimers);

    return {
        VARC: { remaining: calculateRemainingSeconds(timers.VARC), isExpired: timers.VARC.isExpired },
        DILR: { remaining: calculateRemainingSeconds(timers.DILR), isExpired: timers.DILR.isExpired },
        QA: { remaining: calculateRemainingSeconds(timers.QA), isExpired: timers.QA.isExpired },
        totalRemaining:
            calculateRemainingSeconds(timers.VARC) +
            calculateRemainingSeconds(timers.DILR) +
            calculateRemainingSeconds(timers.QA),
    };
}

export { calculateRemainingSeconds, formatTime, getTimerState };
