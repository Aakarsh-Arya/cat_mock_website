/**
 * @fileoverview Question Palette Component
 * @description Grid of question buttons with status-based colors for exam navigation
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.2
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useExamStore, selectCurrentSection } from '@/features/exam-engine';
import type { Question, QuestionStatus } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';
import { PaletteShell } from '@/features/shared/ui/PaletteShell';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionPaletteProps {
    /** All questions for the current paper */
    questions: Question[];
    /** Candidate display name */
    candidateName?: string;
    /** Candidate photo URL */
    candidatePhotoUrl?: string;
    /** Optional CSS class name */
    className?: string;
    /** Callback when a question is clicked */
    onQuestionClick?: (questionId: string, index: number) => void;
}

interface QuestionButtonProps {
    index: number;
    status: QuestionStatus;
    isCurrent: boolean;
    onClick: () => void;
    disabled?: boolean;
    isLocked?: boolean;
}

// =============================================================================
// STATUS COLORS (CAT exam standard)
// =============================================================================

// TCS iON Style "Irregular Hexagons" (Pentagons)
// Answered (Green): Pointed Top, Flat Bottom, Vertical Sides (Side parallel to X-axis at bottom)
const HEXAGON_UP = 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)';

// Not Answered (Red): Flat Top, Vertical Sides, Pointed Bottom (Side parallel to X-axis at top)
const HEXAGON_DOWN = 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)';

/**
 * Get button styles based on question status
 * Colors + shapes match required CAT palette spec
 * 
 * PHASE 2 FIX: 5 distinct status categories:
 * 1. Answered (green hexagon-up)
 * 2. Not Answered/Visited (red hexagon-down)
 * 3. Not Visited (gray square)
 * 4. Marked for Review (purple circle - no answer)
 * 5. Attempted & Marked (purple circle with green checkmark - answered_marked)
 */
function getStatusStyles(status: QuestionStatus, isCurrent: boolean) {
    const baseStyles =
        'w-10 h-10 flex items-center justify-center text-sm font-semibold transition-all border ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D89EF]';
    const currentRing = isCurrent ? 'ring-4 ring-offset-1 ring-[#D35400]' : '';

    switch (status) {
        case 'answered':
            return {
                className: `${baseStyles} ${currentRing} bg-[#4caf50] text-white hover:bg-[#43a047] border-[#388e3c]`,
                label: 'Answered',
                shapeClass: 'rounded-none',
                clipPath: HEXAGON_UP,
            };
        case 'answered_marked':
            // PHASE 2 FIX: Distinct styling for "Attempted & Marked"
            // Purple circle with green checkmark badge to show both states
            return {
                className: `${baseStyles} ${currentRing} bg-[#7e57c2] text-white hover:bg-[#6a46ae] border-[#5e35b1]`,
                label: 'Attempted & Marked for Review',
                shapeClass: 'rounded-full',
                clipPath: undefined,
            };
        case 'marked':
            return {
                className: `${baseStyles} ${currentRing} bg-[#7e57c2] text-white hover:bg-[#6a46ae] border-[#5e35b1]`,
                label: 'Marked for Review (Not Answered)',
                shapeClass: 'rounded-full',
                clipPath: undefined,
            };
        case 'visited':
            return {
                className: `${baseStyles} ${currentRing} bg-[#e53935] text-white hover:bg-[#d32f2f] border-[#c62828]`,
                label: 'Not Answered',
                shapeClass: 'rounded-none',
                clipPath: HEXAGON_DOWN,
            };
        case 'not_visited':
        default:
            return {
                className: `${baseStyles} ${currentRing} bg-[#eceff1] text-[#37474f] hover:bg-[#e0e6e9] border-[#cfd8dc]`,
                label: 'Not Visited',
                shapeClass: 'rounded-none',
                clipPath: undefined,
            };
    }
}

// =============================================================================
// QUESTION BUTTON
// =============================================================================

function QuestionButton({ index, status, isCurrent, onClick, disabled = false, isLocked = false }: QuestionButtonProps) {
    const styles = getStatusStyles(status, isCurrent);
    const isMarkedForReview = status === 'answered_marked' || status === 'marked';
    const isAttemptedAndMarked = status === 'answered_marked';
    const statusLabel =
        status === 'answered' || status === 'answered_marked'
            ? 'Answered'
            : status === 'visited'
                ? 'Not Answered'
                : status === 'marked'
                    ? 'Not Answered'
                    : 'Not Visited';
    const markedLabel = isMarkedForReview ? ', Marked for review' : '';
    const lockedLabel = isLocked ? ', Locked' : '';
    const ariaLabel = `Question ${index + 1}, ${statusLabel}${markedLabel}${isCurrent ? ', current' : ''}${lockedLabel}`;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${styles.className} ${styles.shapeClass} relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={styles.clipPath ? { clipPath: styles.clipPath } : undefined}
            title={`Question ${index + 1}: ${styles.label}`}
            aria-label={ariaLabel}
            aria-current={isCurrent ? 'true' : undefined}
            aria-disabled={disabled ? 'true' : undefined}
            disabled={disabled}
        >
            {index + 1}
            {isAttemptedAndMarked && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#2E7D32] rounded-full border border-white flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            )}
            {isLocked && (
                <span className="absolute -top-1 -right-1 rounded bg-gray-800 text-white text-[9px] px-1 py-0.5">Locked</span>
            )}
        </button>
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
            marked: 0,           // Marked but NOT answered
            answeredMarked: 0,   // PHASE 2 FIX: Separate count for answered & marked
        };

        questions.forEach((q) => {
            const response = responses[q.id];
            if (!response || response.status === 'not_visited') {
                result.notVisited++;
            } else if (response.status === 'answered') {
                result.answered++;
            } else if (response.status === 'answered_marked') {
                // PHASE 2 FIX: Count answered_marked separately
                result.answeredMarked++;
            } else if (response.status === 'visited') {
                result.notAnswered++;
            } else if (response.status === 'marked') {
                result.marked++;
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
                <span className="w-3 h-3 rounded-full bg-[#7e57c2]" />
                <span className="text-gray-600">{counts.marked} Marked</span>
            </div>
            {/* PHASE 2 FIX: Show Attempted & Marked count */}
            <div className="flex items-center gap-2 col-span-2">
                <span className="w-3 h-3 rounded-full bg-[#7e57c2] relative">
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#4caf50] rounded-full" />
                </span>
                <span className="text-gray-600">{counts.answeredMarked} Attempted & Marked</span>
            </div>
        </div>
    );
}

// =============================================================================
// CANDIDATE PROFILE
// =============================================================================

function CandidateProfile({ name, photoUrl }: { name: string; photoUrl?: string }) {
    return (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {photoUrl ? (
                    <img src={photoUrl} alt="Candidate" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs text-gray-500">Photo</span>
                )}
            </div>
            <div>
                <div className="text-sm font-semibold text-gray-800">{name}</div>
                <div className="text-xs text-gray-500">Candidate</div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestionPalette({
    questions,
    candidateName = 'Candidate',
    candidatePhotoUrl,
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
        if (question.section !== currentSection) {
            return;
        }
        goToQuestion(question.id, currentSectionIndex, index);
        onQuestionClick?.(question.id, index);
    }, [goToQuestion, currentSectionIndex, currentSection, onQuestionClick]);

    return (
        <PaletteShell className={className}>
            <CandidateProfile name={candidateName} photoUrl={candidatePhotoUrl} />

            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 mt-4">
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
                    const isLocked = question.section !== currentSection;

                    return (
                        <QuestionButton
                            key={question.id}
                            index={index}
                            status={status}
                            isCurrent={isCurrent}
                            disabled={isLocked}
                            isLocked={isLocked}
                            onClick={() => handleQuestionClick(question, index)}
                        />
                    );
                })}
            </div>

        </PaletteShell>
    );
}
