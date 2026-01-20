/**
 * @fileoverview Navigation Buttons Component
 * @description Save & Next, Mark for Review, Clear Response, Previous buttons
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.5
 */

'use client';

import { useCallback } from 'react';
import { useExamStore, selectResponse, selectCurrentSection } from '@/features/exam-engine';
import type { Question, SectionName } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface NavigationButtonsProps {
    /** Current question */
    question: Question;
    /** All questions in the paper */
    questions: Question[];
    /** Callback when moving to next question */
    onNextQuestion?: () => void;
    /** Callback when moving to previous question */
    onPrevQuestion?: () => void;
    /** Callback for saving answer */
    onSave?: (questionId: string, answer: string | null) => Promise<void>;
    /** Optional CSS class name */
    className?: string;
}

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    variant: 'primary' | 'secondary' | 'warning' | 'danger';
    children: React.ReactNode;
    className?: string;
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

function NavButton({ onClick, disabled, variant, children, className = '' }: ButtonProps) {
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
        warning: 'bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500',
        danger: 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
        px-4 py-2.5 rounded-lg font-medium transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
        >
            {children}
        </button>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function NavigationButtons({
    question,
    questions,
    onNextQuestion,
    onPrevQuestion,
    onSave,
    className = '',
}: NavigationButtonsProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const response = useExamStore(selectResponse(question.id));

    const goToQuestion = useExamStore((s) => s.goToQuestion);
    const clearAnswer = useExamStore((s) => s.clearAnswer);
    const toggleMarkForReview = useExamStore((s) => s.toggleMarkForReview);
    const moveToNextSection = useExamStore((s) => s.moveToNextSection);

    // Get questions for current section
    const sectionQuestions = getQuestionsForSection(questions, currentSection);
    const totalQuestionsInSection = sectionQuestions.length;

    // Check if at first/last question in section
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestionsInSection - 1;
    const isLastSection = currentSectionIndex === 2; // QA is index 2

    // Current response state
    const isMarked = response?.isMarkedForReview ?? false;
    const hasAnswer = response?.answer !== null && response?.answer !== '';

    // Handle Save & Next
    const handleSaveAndNext = useCallback(async () => {
        // Save current answer if provided callback
        if (onSave && response?.answer) {
            await onSave(question.id, response.answer);
        }

        if (isLastQuestion) {
            // Last question in section - don't auto-advance to next section
            // User must explicitly submit section or wait for timer
            return;
        }

        // Move to next question
        const nextIndex = currentQuestionIndex + 1;
        const nextQuestion = sectionQuestions[nextIndex];
        if (nextQuestion) {
            goToQuestion(nextQuestion.id, currentSectionIndex, nextIndex);
            onNextQuestion?.();
        }
    }, [
        currentQuestionIndex,
        currentSectionIndex,
        goToQuestion,
        isLastQuestion,
        onNextQuestion,
        onSave,
        question.id,
        response?.answer,
        sectionQuestions,
    ]);

    // Handle Mark for Review & Next
    const handleMarkAndNext = useCallback(async () => {
        // Toggle mark
        toggleMarkForReview(question.id);

        // Save if callback provided
        if (onSave && response?.answer) {
            await onSave(question.id, response.answer);
        }

        if (isLastQuestion) {
            return;
        }

        // Move to next question
        const nextIndex = currentQuestionIndex + 1;
        const nextQuestion = sectionQuestions[nextIndex];
        if (nextQuestion) {
            goToQuestion(nextQuestion.id, currentSectionIndex, nextIndex);
            onNextQuestion?.();
        }
    }, [
        currentQuestionIndex,
        currentSectionIndex,
        goToQuestion,
        isLastQuestion,
        onNextQuestion,
        onSave,
        question.id,
        response?.answer,
        sectionQuestions,
        toggleMarkForReview,
    ]);

    // Handle Clear Response
    const handleClear = useCallback(() => {
        clearAnswer(question.id);
    }, [clearAnswer, question.id]);

    // Handle Previous
    const handlePrevious = useCallback(() => {
        if (isFirstQuestion) return;

        const prevIndex = currentQuestionIndex - 1;
        const prevQuestion = sectionQuestions[prevIndex];
        if (prevQuestion) {
            goToQuestion(prevQuestion.id, currentSectionIndex, prevIndex);
            onPrevQuestion?.();
        }
    }, [
        currentQuestionIndex,
        currentSectionIndex,
        goToQuestion,
        isFirstQuestion,
        onPrevQuestion,
        sectionQuestions,
    ]);

    // Handle Submit Section
    const handleSubmitSection = useCallback(() => {
        if (!isLastSection) {
            moveToNextSection();
        }
    }, [isLastSection, moveToNextSection]);

    return (
        <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
            {/* Left Side - Clear & Previous */}
            <div className="flex items-center gap-3">
                <NavButton
                    variant="danger"
                    onClick={handleClear}
                    disabled={!hasAnswer}
                >
                    Clear Response
                </NavButton>

                <NavButton
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={isFirstQuestion}
                >
                    ← Previous
                </NavButton>
            </div>

            {/* Right Side - Mark, Save, Submit Section */}
            <div className="flex items-center gap-3">
                <NavButton
                    variant="warning"
                    onClick={handleMarkAndNext}
                >
                    {isMarked ? '★ Marked' : 'Mark for Review'} & Next
                </NavButton>

                {isLastQuestion ? (
                    // Last question in section - no manual submit allowed
                    // Section advances only when timer expires (per SOP)
                    <NavButton
                        variant="secondary"
                        onClick={() => { }}
                        disabled
                    >
                        {isLastSection ? 'Last Question' : 'Wait for Timer'}
                    </NavButton>
                ) : (
                    <NavButton
                        variant="primary"
                        onClick={handleSaveAndNext}
                    >
                        Save & Next →
                    </NavButton>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// EXAM SUBMIT BUTTON (Only shown in last section - QA)
// Sections advance via timer expiry only (per SOP for full-length mocks)
// =============================================================================

interface ExamSubmitProps {
    onSubmitExam: () => void;
    isLastSection: boolean;
    className?: string;
}

export function ExamSubmitButton({
    onSubmitExam,
    isLastSection,
    className = '',
}: ExamSubmitProps) {
    // Only render submit button in last section (QA)
    if (!isLastSection) {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                <p className="text-sm text-gray-500 italic">
                    Section will auto-submit when timer expires
                </p>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <button
                type="button"
                onClick={onSubmitExam}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
            transition-colors"
            >
                Submit Exam
            </button>
        </div>
    );
}

export default NavigationButtons;
