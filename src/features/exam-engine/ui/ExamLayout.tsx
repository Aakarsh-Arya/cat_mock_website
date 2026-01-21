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
    /** Callback when pausing the exam */
    onPauseExam?: () => Promise<void>;
}

// =============================================================================
// HEADER COMPONENT
// =============================================================================

interface ExamHeaderProps {
    paper: Paper;
    onPauseExam?: () => Promise<void>;
}

function ExamHeader({ paper, onPauseExam }: ExamHeaderProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);

    // TCS iON-inspired header styling
    return (
        <header className="bg-[#0b3d91] text-white shadow-md">
            <div className="max-w-screen-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left - Paper Info */}
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold">{paper.title}</h1>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-blue-100">
                            <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                {paper.total_questions} Questions
                            </span>
                            <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
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
                  px-4 py-2 rounded-md text-sm font-semibold transition-colors border
                  ${index === currentSectionIndex
                                        ? 'bg-white text-[#0b3d91] border-white'
                                        : index < currentSectionIndex
                                            ? 'bg-[#43a047] text-white border-[#2e7d32]'
                                            : 'bg-white/10 text-blue-100 border-white/20'
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

                    {/* Right - Timer and Pause */}
                    <div className="flex items-center gap-3">
                        <ExamTimer compact className="bg-white/10 px-3 py-2 rounded-md border border-white/20" />
                        {onPauseExam && (
                            <button
                                type="button"
                                onClick={onPauseExam}
                                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md text-sm transition-colors flex items-center gap-1"
                                title="Save progress and continue later"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Pause</span>
                            </button>
                        )}
                    </div>
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
            {/* Question Header - Clean UI without difficulty/topic tags */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <span className="text-sm text-gray-500">{currentSection}</span>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Question {questionNumber} of {totalQuestions}
                    </h2>
                </div>

                {/* Marks indicator */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">
                        +{question.positive_marks}
                    </span>
                    {question.negative_marks > 0 && (
                        <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
                            -{question.negative_marks}
                        </span>
                    )}
                </div>
            </div>

            {/* Context/Passage Display */}
            {question.context && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-gray-50">
                        {question.context.title || 'Passage'}
                    </h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {question.context.text}
                    </div>
                </div>
            )}

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
    onPauseExam,
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
        <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
            {/* Header */}
            <ExamHeader paper={paper} onPauseExam={onPauseExam} />

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
