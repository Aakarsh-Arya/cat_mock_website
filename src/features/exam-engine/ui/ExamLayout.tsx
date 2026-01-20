/**
 * @fileoverview Exam Layout Component
 * @description Main exam page layout with header, question area, and palette sidebar
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.1
 */

'use client';

import { useMemo, useCallback, useEffect } from 'react';
import {
    useExamStore,
    useExamTimer,
    selectCurrentSection,
} from '@/features/exam-engine';
import { ExamTimer } from './ExamTimer';
import { QuestionPalette } from './QuestionPalette';
import { MCQRenderer } from './MCQRenderer';
import { TITARenderer } from './TITARenderer';
import { NavigationButtons, ExamSubmitButton } from './NavigationButtons';
import type { Paper, Question, SectionName } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamLayoutProps {
    /** Paper data */
    paper: Paper;
    /** All questions */
    questions: Question[];
    /** Callback when saving a response */
    onSaveResponse?: (questionId: string, answer: string | null) => Promise<void>;
    /** Callback when submitting the entire exam */
    onSubmitExam?: () => Promise<void>;
    /** Callback when a section expires */
    onSectionExpire?: (sectionName: SectionName) => void;
}

// =============================================================================
// HEADER COMPONENT
// =============================================================================

interface ExamHeaderProps {
    paper: Paper;
}

function ExamHeader({ paper }: ExamHeaderProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left - Paper Info */}
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">{paper.title}</h1>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">
                                {paper.total_questions} Questions
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded">
                                {paper.total_marks} Marks
                            </span>
                        </div>
                    </div>

                    {/* Center - Section Indicator */}
                    <div className="hidden md:flex items-center gap-2">
                        {['VARC', 'DILR', 'QA'].map((section, index) => (
                            <div
                                key={section}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${index === currentSectionIndex
                                        ? 'bg-blue-600 text-white'
                                        : index < currentSectionIndex
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-400'
                                    }
                `}
                            >
                                {section}
                                {index < currentSectionIndex && (
                                    <span className="ml-1">✓</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right - Timer */}
                    <ExamTimer compact />
                </div>
            </div>
        </header>
    );
}

// =============================================================================
// QUESTION AREA
// =============================================================================

interface QuestionAreaProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
}

function QuestionArea({ question, questionNumber, totalQuestions }: QuestionAreaProps) {
    const currentSection = useExamStore(selectCurrentSection);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <span className="text-sm text-gray-500">{currentSection}</span>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Question {questionNumber} of {totalQuestions}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {question.difficulty && (
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded ${question.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : question.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {question.difficulty}
                        </span>
                    )}
                    {question.topic && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {question.topic}
                        </span>
                    )}
                </div>
            </div>

            {/* Question Content */}
            {question.question_type === 'MCQ' ? (
                <MCQRenderer question={question} />
            ) : (
                <TITARenderer question={question} />
            )}
        </div>
    );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

export function ExamLayout({
    paper,
    questions,
    onSaveResponse,
    onSubmitExam,
    onSectionExpire,
}: ExamLayoutProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const isSubmitting = useExamStore((s) => s.isSubmitting);
    const moveToNextSection = useExamStore((s) => s.moveToNextSection);
    const setSubmitting = useExamStore((s) => s.setSubmitting);

    // Initialize timer with callbacks
    const { timerData, isAutoSubmitting } = useExamTimer({
        onSectionExpire: onSectionExpire,
        onExamComplete: onSubmitExam,
    });

    // Get questions for current section
    const sectionQuestions = useMemo(() => {
        return getQuestionsForSection(questions, currentSection);
    }, [questions, currentSection]);

    // Current question
    const currentQuestion = sectionQuestions[currentQuestionIndex];

    // NOTE: Section submit removed - sections advance only via timer expiry (SOP requirement)

    // Handle exam submit
    const handleSubmitExam = useCallback(async () => {
        if (isSubmitting) return;

        setSubmitting(true);
        try {
            await onSubmitExam?.();
        } finally {
            setSubmitting(false);
        }
    }, [isSubmitting, onSubmitExam, setSubmitting]);

    // Show loading state while hydrating
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Show submitting state
    if (isSubmitting || isAutoSubmitting) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {isAutoSubmitting ? 'Auto-submitting section...' : 'Submitting exam...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No questions found for this section.</p>
                </div>
            </div>
        );
    }

    const isLastSection = currentSectionIndex === 2;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <ExamHeader paper={paper} />

            {/* Main Content */}
            <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6">
                <div className="flex gap-6">
                    {/* Question Area */}
                    <div className="flex-1 space-y-6">
                        <QuestionArea
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={sectionQuestions.length}
                        />

                        {/* Navigation Buttons */}
                        <NavigationButtons
                            question={currentQuestion}
                            questions={questions}
                            onSave={onSaveResponse}
                        />

                        {/* Exam Submit - only active in last section (QA) */}
                        {/* Sections advance via timer expiry only (SOP requirement) */}
                        <div className="flex justify-center pt-4 border-t border-gray-200">
                            <ExamSubmitButton
                                onSubmitExam={handleSubmitExam}
                                isLastSection={isLastSection}
                            />
                        </div>
                    </div>

                    {/* Sidebar - Question Palette */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-6 space-y-4">
                            {/* Timer Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <ExamTimer showProgressBar />
                            </div>

                            {/* Question Palette */}
                            <QuestionPalette questions={questions} />
                        </div>
                    </aside>
                </div>
            </main>

            {/* Mobile Bottom Bar (for timer and palette toggle) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="flex items-center justify-between max-w-screen-lg mx-auto">
                    <ExamTimer compact />
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                        onClick={() => {
                            // TODO: Toggle mobile palette drawer
                        }}
                    >
                        Question Palette
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamLayout;
