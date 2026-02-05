'use client';

/**
 * @fileoverview Dev-only floating control panel for exam testing
 * @description Provides UI buttons to accelerate exam states for rapid testing
 * 
 * CRITICAL: This component is completely removed from production builds
 * via conditional rendering in the parent component
 * 
 * Features:
 * - Skip to any section
 * - Set custom timers
 * - Expire current section
 * - Trigger final submission
 * - State inspection
 */

import { useState, useEffect, useCallback } from 'react';
import { useExamStore } from '@/features/exam-engine/model/useExamStore';
import {
    isDevModeEnabled,
    skipToSection,
    setCurrentSectionTimer,
    expireCurrentSection,
    logExamState,
    createDevKeyboardHandler,
    attachDevToolsToWindow,
    processDevActionFromUrl,
    isDevSyncPaused,
    setDevSyncPaused,
    type DevActionExecutor,
} from '@/lib/devTools';
import type { SectionName } from '@/types/exam';

interface DevToolsPanelProps {
    onTriggerSubmit?: () => void;
}

/**
 * DevToolsPanel - Floating panel for exam testing
 * 
 * Only rendered when:
 * 1. NODE_ENV === 'development'
 * 2. ?dev_mode=true URL param (optional, for explicit activation)
 */
export function DevToolsPanel({ onTriggerSubmit }: DevToolsPanelProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isSyncPaused, setIsSyncPaused] = useState(false);

    // Get store state and actions
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const sectionTimers = useExamStore((s) => s.sectionTimers);
    const responses = useExamStore((s) => s.responses);
    const attemptId = useExamStore((s) => s.attemptId);

    // Get store actions
    const expireSectionAction = useExamStore((s) => s.expireSection);
    const moveToNextSectionAction = useExamStore((s) => s.moveToNextSection);
    const updateSectionTimerAction = useExamStore((s) => s.updateSectionTimer);
    const setAutoSubmittingAction = useExamStore((s) => s.setAutoSubmitting);
    const setSectionTimerOverrideAction = useExamStore((s) => s.setSectionTimerOverride);

    // Create executor interface for dev tools
    const executor: DevActionExecutor = {
        expireSection: expireSectionAction,
        moveToNextSection: moveToNextSectionAction,
        updateSectionTimer: updateSectionTimerAction,
        setSectionTimerOverride: setSectionTimerOverrideAction,
        setAutoSubmitting: setAutoSubmittingAction,
        getCurrentSectionIndex: () => currentSectionIndex,
        getSectionTimers: () => sectionTimers,
        getResponses: () => responses,
        getAttemptId: () => attemptId,
    };

    // Don't render in production
    if (!isDevModeEnabled()) {
        return null;
    }

    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const currentSection = sections[currentSectionIndex];
    const currentTimer = sectionTimers[currentSection];

    // Process URL actions on mount
    useEffect(() => {
        processDevActionFromUrl(executor);
        attachDevToolsToWindow(executor);
        setIsSyncPaused(isDevSyncPaused());
    }, []);

    // Setup keyboard shortcuts
    useEffect(() => {
        const cleanup = createDevKeyboardHandler({
            togglePanel: () => setIsVisible((v) => !v),
            skipToNextSection: () => {
                if (currentSectionIndex < 2) {
                    skipToSection(currentSectionIndex + 1, executor);
                }
            },
            setQuickTimer: () => setCurrentSectionTimer(10, executor),
            logState: () => logExamState(executor),
        });

        return cleanup;
    }, [currentSectionIndex]);

    const handleSkipToSection = useCallback((targetIndex: number) => {
        skipToSection(targetIndex, executor);
    }, [executor]);

    const handleSetTimer = useCallback((seconds: number) => {
        setCurrentSectionTimer(seconds, executor);
    }, [executor]);

    const handleExpireSection = useCallback(() => {
        expireCurrentSection(executor);
    }, [executor]);

    const handleLogState = useCallback(() => {
        logExamState(executor);
    }, [executor]);

    const handleToggleSync = useCallback(() => {
        setIsSyncPaused((prev) => {
            const next = !prev;
            setDevSyncPaused(next);
            return next;
        });
    }, []);

    const answeredCount = Object.values(responses).filter(
        (r) => r.status === 'answered' || r.status === 'answered_marked'
    ).length;

    // Floating trigger button (always visible in dev) - positioned on LEFT to avoid overlap with BugReportFab on right
    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 left-4 z-[9999] bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2"
                title="Open Dev Tools (Ctrl+Shift+D)"
            >
                🛠️ DEV
            </button>
        );
    }

    // Minimized state - positioned on LEFT to avoid overlap with BugReportFab
    if (isMinimized) {
        return (
            <div className="fixed bottom-4 left-4 z-[9999] bg-gray-900 border border-yellow-500 rounded-lg shadow-lg p-2">
                <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-sm font-bold">🛠️ DEV</span>
                    <span className="text-white text-xs">
                        {currentSection} | {Math.floor(currentTimer.remainingSeconds)}s
                    </span>
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="text-white hover:text-yellow-500 text-xs"
                    >
                        ▲
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-white hover:text-red-500 text-xs"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    // Full panel - positioned on LEFT to avoid overlap with BugReportFab
    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-gray-900 border border-yellow-500 rounded-lg shadow-lg w-80 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-yellow-500 text-black px-3 py-2 font-bold flex justify-between items-center rounded-t-lg">
                <span>🛠️ Dev Tools</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="hover:bg-yellow-600 px-2 rounded"
                        title="Minimize"
                    >
                        ▼
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="hover:bg-red-500 hover:text-white px-2 rounded"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Current State */}
            <div className="p-3 border-b border-gray-700">
                <div className="text-gray-400 text-xs uppercase mb-2">Current State</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-300">Section:</div>
                    <div className="text-white font-mono">{currentSection} ({currentSectionIndex + 1}/3)</div>
                    <div className="text-gray-300">Timer:</div>
                    <div className="text-white font-mono">{Math.floor(currentTimer.remainingSeconds)}s</div>
                    <div className="text-gray-300">Answered:</div>
                    <div className="text-white font-mono">{answeredCount}/{Object.keys(responses).length}</div>
                </div>
            </div>

            {/* Section Controls */}
            <div className="p-3 border-b border-gray-700">
                <div className="text-gray-400 text-xs uppercase mb-2">Skip to Section</div>
                <div className="flex gap-2">
                    {sections.map((section, idx) => (
                        <button
                            key={section}
                            onClick={() => handleSkipToSection(idx)}
                            disabled={idx <= currentSectionIndex}
                            className={`flex-1 px-2 py-1 rounded text-sm font-medium transition
                                ${idx === currentSectionIndex
                                    ? 'bg-blue-600 text-white'
                                    : idx < currentSectionIndex
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                }`}
                        >
                            {section}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timer Controls */}
            <div className="p-3 border-b border-gray-700">
                <div className="text-gray-400 text-xs uppercase mb-2">Set Timer</div>
                <div className="flex gap-2 flex-wrap">
                    {[10, 30, 60, 120, 300].map((seconds) => (
                        <button
                            key={seconds}
                            onClick={() => handleSetTimer(seconds)}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition"
                        >
                            {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-gray-700">
                <div className="text-gray-400 text-xs uppercase mb-2">Quick Actions</div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleExpireSection}
                        className="px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition w-full"
                    >
                        ⏱️ Expire Current Section
                    </button>
                    {onTriggerSubmit && (
                        <button
                            onClick={onTriggerSubmit}
                            className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition w-full"
                        >
                            📤 Trigger Final Submit
                        </button>
                    )}
                    <button
                        onClick={handleToggleSync}
                        className={`px-3 py-2 rounded text-sm transition w-full ${isSyncPaused
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                            }`}
                    >
                        {isSyncPaused ? '✅ Resume Server Sync' : '⏸️ Pause Server Sync'}
                    </button>
                    <button
                        onClick={handleLogState}
                        className="px-3 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition w-full"
                    >
                        📋 Log State to Console
                    </button>
                </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="p-3">
                <div className="text-gray-400 text-xs uppercase mb-2">Keyboard Shortcuts</div>
                <div className="text-xs text-gray-500 space-y-1">
                    <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+D</kbd> Toggle panel</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+N</kbd> Skip to next section</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+T</kbd> Set timer to 10s</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+L</kbd> Log state</div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-gray-800 text-xs text-gray-500 rounded-b-lg">
                💡 Tip: Use <code className="bg-gray-700 px-1 rounded">window.__devTools</code> in console
            </div>
        </div>
    );
}

export default DevToolsPanel;
