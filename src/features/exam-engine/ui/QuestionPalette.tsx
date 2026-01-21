/**
 * @fileoverview Question Palette Component
 * @description Grid of question buttons with status-based colors for exam navigation
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.2
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useExamStore, selectCurrentSection } from '@/features/exam-engine';
import type { Question, QuestionStatus, SectionName } from '@/types/exam';
import { getQuestionsForSection, SECTION_ORDER } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionPaletteProps {
    /** All questions for the current paper */
    questions: Question[];
    /** Optional CSS class name */
    className?: string;
    /** Callback when a question is clicked */
    onQuestionClick?: (questionId: string, index: number) => void;
}

interface QuestionButtonProps {
    question: Question;
    index: number;
    status: QuestionStatus;
    isCurrent: boolean;
    onClick: () => void;
}

// =============================================================================
// STATUS COLORS (CAT exam standard)
// =============================================================================

/**
 * Get button styles based on question status
 * Colors match standard CAT exam palette
 */
function getStatusStyles(status: QuestionStatus, isCurrent: boolean) {
    const baseStyles = 'w-10 h-10 rounded-md flex items-center justify-center text-sm font-semibold transition-all border';
    const currentRing = isCurrent ? 'ring-2 ring-offset-1 ring-[#1565c0]' : '';

    // TCS iON-inspired palette
    switch (status) {
        case 'answered':
            return {
                className: `${baseStyles} ${currentRing} bg-[#4caf50] text-white hover:bg-[#43a047] border-[#388e3c]`,
                label: 'Answered',
                icon: '✓',
            };
        case 'answered_marked':
            return {
                className: `${baseStyles} ${currentRing} bg-[#5c6bc0] text-white hover:bg-[#4652a3] border-[#3949ab]`,
                label: 'Answered & Marked for Review',
                icon: '✓?',
            };
        case 'marked':
            return {
                className: `${baseStyles} ${currentRing} bg-[#7e57c2] text-white hover:bg-[#6a46ae] border-[#5e35b1]`,
                label: 'Marked for Review',
                icon: '?',
            };
        case 'visited':
            return {
                className: `${baseStyles} ${currentRing} bg-[#e53935] text-white hover:bg-[#d32f2f] border-[#c62828]`,
                label: 'Not Answered',
                icon: '',
            };
        case 'not_visited':
        default:
            return {
                className: `${baseStyles} ${currentRing} bg-[#eceff1] text-[#37474f] hover:bg-[#e0e6e9] border-[#cfd8dc]`,
                label: 'Not Visited',
                icon: '',
            };
    }
}

// =============================================================================
// QUESTION BUTTON
// =============================================================================

function QuestionButton({ question, index, status, isCurrent, onClick }: QuestionButtonProps) {
    const styles = getStatusStyles(status, isCurrent);

    return (
        <button
            type="button"
            onClick={onClick}
            className={styles.className}
            title={`Question ${index + 1}: ${styles.label}`}
            aria-label={`Go to question ${index + 1}, status: ${styles.label}`}
            aria-current={isCurrent ? 'true' : undefined}
        >
            {index + 1}
        </button>
    );
}

// =============================================================================
// LEGEND
// =============================================================================

function PaletteLegend() {
    const legends = [
        { status: 'answered' as const, label: 'Answered', color: 'bg-[#4caf50]' },
        { status: 'visited' as const, label: 'Not Answered', color: 'bg-[#e53935]' },
        { status: 'not_visited' as const, label: 'Not Visited', color: 'bg-[#eceff1] border border-[#cfd8dc]' },
        { status: 'marked' as const, label: 'Marked for Review', color: 'bg-[#7e57c2]' },
        { status: 'answered_marked' as const, label: 'Answered & Marked', color: 'bg-[#5c6bc0]' },
    ];

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Legend</h4>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
                {legends.map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color}`} />
                        <span className="text-gray-600">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// SECTION COUNTS
// =============================================================================

interface SectionCountsProps {
    questions: Question[];
}

function SectionCounts({ questions }: SectionCountsProps) {
    const responses = useExamStore((s) => s.responses);

    const counts = useMemo(() => {
        const result = {
            answered: 0,
            notAnswered: 0,
            notVisited: 0,
            markedForReview: 0,
        };

        questions.forEach((q) => {
            const response = responses[q.id];
            if (!response || response.status === 'not_visited') {
                result.notVisited++;
            } else if (response.status === 'answered' || response.status === 'answered_marked') {
                result.answered++;
                if (response.status === 'answered_marked') {
                    result.markedForReview++;
                }
            } else if (response.status === 'visited') {
                result.notAnswered++;
            } else if (response.status === 'marked') {
                result.markedForReview++;
                result.notAnswered++;
            }
        });

        return result;
    }, [questions, responses]);

    return (
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#4caf50]" />
                <span className="text-gray-600">{counts.answered} Answered</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#e53935]" />
                <span className="text-gray-600">{counts.notAnswered} Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#eceff1] border border-[#cfd8dc]" />
                <span className="text-gray-600">{counts.notVisited} Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#7e57c2]" />
                <span className="text-gray-600">{counts.markedForReview} Marked</span>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestionPalette({
    questions,
    className = '',
    onQuestionClick
}: QuestionPaletteProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const responses = useExamStore((s) => s.responses);
    const goToQuestion = useExamStore((s) => s.goToQuestion);

    // Get questions for current section
    const sectionQuestions = useMemo(() => {
        return getQuestionsForSection(questions, currentSection);
    }, [questions, currentSection]);

    // Handle question click
    const handleQuestionClick = useCallback((question: Question, index: number) => {
        goToQuestion(question.id, currentSectionIndex, index);
        onQuestionClick?.(question.id, index);
    }, [goToQuestion, currentSectionIndex, onQuestionClick]);

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {currentSection}
                </h3>
                <span className="text-sm text-gray-500">
                    {sectionQuestions.length} Questions
                </span>
            </div>

            {/* Counts Summary */}
            <SectionCounts questions={sectionQuestions} />

            {/* Question Grid */}
            <div className="grid grid-cols-6 gap-2 mb-4">
                {sectionQuestions.map((question, index) => {
                    const response = responses[question.id];
                    const status: QuestionStatus = response?.status ?? 'not_visited';
                    const isCurrent = index === currentQuestionIndex;

                    return (
                        <QuestionButton
                            key={question.id}
                            question={question}
                            index={index}
                            status={status}
                            isCurrent={isCurrent}
                            onClick={() => handleQuestionClick(question, index)}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <PaletteLegend />
        </div>
    );
}

export default QuestionPalette;
