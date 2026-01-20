/**
 * @fileoverview Exam Timer Display Component
 * @description Visual timer display with progress bar and state-based styling
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.1
 */

'use client';

import { useExamTimer, type TimerDisplayData } from '@/features/exam-engine';

// =============================================================================
// TIMER DISPLAY COMPONENT
// =============================================================================

interface ExamTimerProps {
    /** Optional CSS class name */
    className?: string;
    /** Show progress bar */
    showProgressBar?: boolean;
    /** Compact mode (for header) */
    compact?: boolean;
}

/**
 * Get color classes based on timer state
 */
function getTimerStyles(state: TimerDisplayData['state']) {
    switch (state) {
        case 'critical':
            return {
                text: 'text-red-600 animate-pulse',
                bg: 'bg-red-500',
                border: 'border-red-500',
                progressBg: 'bg-red-100',
            };
        case 'warning':
            return {
                text: 'text-orange-500',
                bg: 'bg-orange-500',
                border: 'border-orange-500',
                progressBg: 'bg-orange-100',
            };
        case 'expired':
            return {
                text: 'text-gray-500',
                bg: 'bg-gray-500',
                border: 'border-gray-500',
                progressBg: 'bg-gray-100',
            };
        default:
            return {
                text: 'text-green-600',
                bg: 'bg-green-500',
                border: 'border-green-500',
                progressBg: 'bg-green-100',
            };
    }
}

export function ExamTimer({
    className = '',
    showProgressBar = true,
    compact = false
}: ExamTimerProps) {
    const { timerData } = useExamTimer();
    const styles = getTimerStyles(timerData.state);

    if (compact) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-sm text-gray-500">{timerData.sectionName}</span>
                <span className={`font-mono text-lg font-bold ${styles.text}`}>
                    {timerData.displayTime}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Section Name */}
            <div className="text-sm font-medium text-gray-600 mb-1">
                {timerData.sectionName} Section
            </div>

            {/* Time Display */}
            <div className={`font-mono text-3xl font-bold ${styles.text}`}>
                {timerData.displayTime}
            </div>

            {/* Progress Bar */}
            {showProgressBar && (
                <div className={`w-full mt-2 h-2 rounded-full ${styles.progressBg}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${styles.bg}`}
                        style={{ width: `${timerData.progressPercent}%` }}
                    />
                </div>
            )}

            {/* State Label */}
            {timerData.state === 'warning' && (
                <div className="mt-1 text-xs text-orange-500 font-medium">
                    Less than 5 minutes remaining
                </div>
            )}
            {timerData.state === 'critical' && (
                <div className="mt-1 text-xs text-red-600 font-medium animate-pulse">
                    Less than 1 minute remaining!
                </div>
            )}
            {timerData.state === 'expired' && (
                <div className="mt-1 text-xs text-gray-600 font-medium">
                    Time expired
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SECTION TIMER SUMMARY
// =============================================================================

interface SectionTimerSummaryProps {
    className?: string;
}

/**
 * Shows all three section timers in a summary view
 */
export function SectionTimerSummary({ className = '' }: SectionTimerSummaryProps) {
    const { timerData } = useExamTimer();

    return (
        <div className={`flex items-center justify-between text-sm ${className}`}>
            <div className="flex items-center gap-4">
                <span className="font-medium text-gray-600">Time Left:</span>
                <span className={`font-mono font-bold ${getTimerStyles(timerData.state).text}`}>
                    {timerData.displayTime}
                </span>
            </div>
            <div className="text-gray-500">
                Section: <span className="font-medium text-gray-700">{timerData.sectionName}</span>
            </div>
        </div>
    );
}

export default ExamTimer;
