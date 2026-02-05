/**
 * @fileoverview Dev-only testing utilities for exam engine
 * @description Provides fast-feedback mechanisms for testing exam flows
 * 
 * CRITICAL: All functions are gated behind process.env.NODE_ENV === 'development'
 * and will no-op in production. This file enables rapid iteration on:
 * - Section transitions
 * - Timer manipulation
 * - State inspection
 * - Final submission testing
 * 
 * @usage URL params: ?dev_mode=true&dev_action=skip_to_section_3
 * @usage Keyboard: Ctrl+Shift+D to toggle DevToolsPanel
 */

import type { SectionName } from '@/types/exam';

// =============================================================================
// DEV MODE DETECTION
// =============================================================================

/**
 * Check if dev mode is enabled via environment
 * CRITICAL: This is the primary gate for all dev features
 */
export const isDevModeEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    return process.env.NODE_ENV === 'development';
};

/**
 * Check if dev tools are enabled via URL param
 * Requires both: (1) NODE_ENV=development AND (2) ?dev_mode=true
 */
export const isDevToolsEnabled = (): boolean => {
    if (!isDevModeEnabled()) return false;
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    return params.get('dev_mode') === 'true';
};

/**
 * Get dev action from URL if specified
 * Example: ?dev_mode=true&dev_action=skip_to_qa
 */
export const getDevAction = (): string | null => {
    if (!isDevToolsEnabled()) return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('dev_action');
};

// =============================================================================
// DEV SYNC CONTROL (CLIENT-SIDE ONLY)
// =============================================================================

const DEV_SYNC_PAUSE_KEY = 'exam-dev-sync-paused';

/**
 * Returns true if server sync is paused (dev-only).
 * Uses sessionStorage to avoid persistence across browser restarts.
 */
export const isDevSyncPaused = (): boolean => {
    if (!isDevModeEnabled()) return false;
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(DEV_SYNC_PAUSE_KEY) === 'true';
};

/**
 * Pause/resume server sync in dev mode.
 */
export const setDevSyncPaused = (paused: boolean): void => {
    if (!isDevModeEnabled()) return;
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(DEV_SYNC_PAUSE_KEY, paused ? 'true' : 'false');
};

// =============================================================================
// DEV ACTION TYPES
// =============================================================================

export type DevAction =
    | 'skip_to_dilr'
    | 'skip_to_qa'
    | 'expire_current_section'
    | 'set_timer_10s'
    | 'set_timer_30s'
    | 'set_timer_60s'
    | 'trigger_auto_submit'
    | 'log_state';

// =============================================================================
// DEV ACTIONS
// =============================================================================

/**
 * Execute a dev action using store actions
 * IMPORTANT: These use REAL store transitions, not direct state mutation
 */
export interface DevActionExecutor {
    expireSection: (sectionName: SectionName) => void;
    moveToNextSection: () => void;
    updateSectionTimer: (sectionName: SectionName, remainingSeconds: number) => void;
    setSectionTimerOverride?: (sectionName: SectionName, remainingSeconds: number) => void;
    setAutoSubmitting: (isAutoSubmitting: boolean) => void;
    getCurrentSectionIndex: () => number;
    getSectionTimers: () => Record<SectionName, { remainingSeconds: number }>;
    getResponses: () => Record<string, unknown>;
    getAttemptId: () => string | null;
}

/**
 * Skip to a specific section by expiring all previous sections
 * Uses REAL section transitions to maintain state consistency
 */
export const skipToSection = (
    targetSectionIndex: number,
    executor: DevActionExecutor
): void => {
    if (!isDevModeEnabled()) {
        console.warn('[DevTools] Blocked: Not in development mode');
        return;
    }

    const currentIndex = executor.getCurrentSectionIndex();
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];

    console.log(`[DevTools] Skipping from section ${currentIndex} to ${targetSectionIndex}`);

    // Expire and transition through each section until we reach target
    for (let i = currentIndex; i < targetSectionIndex; i++) {
        const sectionToExpire = sections[i];
        console.log(`[DevTools] Expiring section: ${sectionToExpire}`);
        executor.expireSection(sectionToExpire);
        executor.moveToNextSection();
    }

    console.log(`[DevTools] ✓ Now at section ${targetSectionIndex} (${sections[targetSectionIndex]})`);
};

/**
 * Set remaining time for current section
 * Uses updateSectionTimer store action
 */
export const setCurrentSectionTimer = (
    seconds: number,
    executor: DevActionExecutor
): void => {
    if (!isDevModeEnabled()) {
        console.warn('[DevTools] Blocked: Not in development mode');
        return;
    }

    const currentIndex = executor.getCurrentSectionIndex();
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const currentSection = sections[currentIndex];

    console.log(`[DevTools] Setting ${currentSection} timer to ${seconds}s`);
    const setter = executor.setSectionTimerOverride ?? executor.updateSectionTimer;
    setter(currentSection, seconds);
};

/**
 * Expire the current section immediately
 */
export const expireCurrentSection = (executor: DevActionExecutor): void => {
    if (!isDevModeEnabled()) {
        console.warn('[DevTools] Blocked: Not in development mode');
        return;
    }

    const currentIndex = executor.getCurrentSectionIndex();
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const currentSection = sections[currentIndex];

    console.log(`[DevTools] Expiring current section: ${currentSection}`);
    executor.expireSection(currentSection);
};

/**
 * Log current exam state to console for debugging
 */
export const logExamState = (executor: DevActionExecutor): void => {
    if (!isDevModeEnabled()) return;

    const state = {
        attemptId: executor.getAttemptId(),
        currentSectionIndex: executor.getCurrentSectionIndex(),
        sectionTimers: executor.getSectionTimers(),
        responsesCount: Object.keys(executor.getResponses()).length,
    };

    console.group('[DevTools] Current Exam State');
    console.log('Attempt ID:', state.attemptId);
    console.log('Current Section:', ['VARC', 'DILR', 'QA'][state.currentSectionIndex]);
    console.log('Section Timers:', state.sectionTimers);
    console.log('Total Responses:', state.responsesCount);
    console.groupEnd();
};

/**
 * Process dev action from URL parameter
 * Called on exam initialization if dev_action param is present
 */
export const processDevActionFromUrl = (executor: DevActionExecutor): void => {
    if (!isDevToolsEnabled()) return;

    const action = getDevAction();
    if (!action) return;

    console.log(`[DevTools] Processing URL action: ${action}`);

    switch (action) {
        case 'skip_to_dilr':
            skipToSection(1, executor);
            break;
        case 'skip_to_qa':
            skipToSection(2, executor);
            break;
        case 'expire_current_section':
            expireCurrentSection(executor);
            break;
        case 'set_timer_10s':
            setCurrentSectionTimer(10, executor);
            break;
        case 'set_timer_30s':
            setCurrentSectionTimer(30, executor);
            break;
        case 'set_timer_60s':
            setCurrentSectionTimer(60, executor);
            break;
        case 'log_state':
            logExamState(executor);
            break;
        default:
            console.warn(`[DevTools] Unknown action: ${action}`);
    }
};

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

export interface DevKeyboardHandler {
    togglePanel: () => void;
    skipToNextSection: () => void;
    setQuickTimer: () => void;
    logState: () => void;
}

/**
 * Dev keyboard shortcut definitions
 */
export const DEV_SHORTCUTS = {
    TOGGLE_PANEL: { key: 'D', ctrl: true, shift: true }, // Ctrl+Shift+D
    SKIP_SECTION: { key: 'N', ctrl: true, shift: true }, // Ctrl+Shift+N
    QUICK_TIMER: { key: 'T', ctrl: true, shift: true },  // Ctrl+Shift+T (10s)
    LOG_STATE: { key: 'L', ctrl: true, shift: true },    // Ctrl+Shift+L
} as const;

/**
 * Check if a keyboard event matches a shortcut
 */
export const matchesShortcut = (
    event: KeyboardEvent,
    shortcut: { key: string; ctrl: boolean; shift: boolean }
): boolean => {
    return (
        event.key.toUpperCase() === shortcut.key &&
        event.ctrlKey === shortcut.ctrl &&
        event.shiftKey === shortcut.shift
    );
};

/**
 * Create keyboard handler for dev shortcuts
 * Returns cleanup function
 */
export const createDevKeyboardHandler = (handlers: DevKeyboardHandler): (() => void) => {
    if (!isDevModeEnabled()) return () => { };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (matchesShortcut(event, DEV_SHORTCUTS.TOGGLE_PANEL)) {
            event.preventDefault();
            handlers.togglePanel();
        } else if (matchesShortcut(event, DEV_SHORTCUTS.SKIP_SECTION)) {
            event.preventDefault();
            handlers.skipToNextSection();
        } else if (matchesShortcut(event, DEV_SHORTCUTS.QUICK_TIMER)) {
            event.preventDefault();
            handlers.setQuickTimer();
        } else if (matchesShortcut(event, DEV_SHORTCUTS.LOG_STATE)) {
            event.preventDefault();
            handlers.logState();
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
};

// =============================================================================
// DEV CONSOLE HELPERS (for manual testing in browser console)
// =============================================================================

/**
 * Attach dev helpers to window for console access
 * Usage: window.__devTools.skipToQA()
 */
export const attachDevToolsToWindow = (executor: DevActionExecutor): void => {
    if (!isDevModeEnabled()) return;
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__devTools = {
        skipToDILR: () => skipToSection(1, executor),
        skipToQA: () => skipToSection(2, executor),
        expireSection: () => expireCurrentSection(executor),
        setTimer: (seconds: number) => setCurrentSectionTimer(seconds, executor),
        logState: () => logExamState(executor),
        help: () => {
            console.log(`
[DevTools] Available commands:
  __devTools.skipToDILR()      - Skip to DILR section
  __devTools.skipToQA()        - Skip to QA section  
  __devTools.expireSection()   - Expire current section
  __devTools.setTimer(30)      - Set current section timer to 30s
  __devTools.logState()        - Log current exam state
  __devTools.help()            - Show this help
            `);
        },
    };

    console.log('[DevTools] 🛠️ Dev tools attached to window.__devTools');
    console.log('[DevTools] Type __devTools.help() for available commands');
};
