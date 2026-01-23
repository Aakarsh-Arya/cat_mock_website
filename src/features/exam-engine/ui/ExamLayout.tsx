/**
 * @fileoverview TCS iON CAT Exam Layout Component
 * @description Pixel-perfect recreation of the CAT exam interface
 * @blueprint TCS iON CAT 2025 Interface Specification
 */

'use client';

import { useMemo, useCallback } from 'react';
import {
    useExamStore,
    useExamTimer,
    selectCurrentSection,
} from '@/features/exam-engine';
import { MCQRenderer } from './MCQRenderer';
import { TITARenderer } from './TITARenderer';
import { MathText } from './MathText';
import type { Paper, Question, SectionName, QuestionStatus } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamLayoutProps {
    paper: Paper;
    questions: Question[];
    onSaveResponse?: (questionId: string, answer: string | null) => Promise<void>;
    onSubmitExam?: () => Promise<void>;
    onSectionExpire?: (sectionName: SectionName) => void;
    onPauseExam?: () => Promise<void>;
}

// =============================================================================
// TCS iON HEADER (60px height, gradient background)
// =============================================================================

interface ExamHeaderProps {
    paper: Paper;
    candidateName?: string;
}

function ExamHeader({ paper, candidateName = 'Candidate' }: ExamHeaderProps) {
    const { timerData } = useExamTimer();

    return (
        <header className="sticky top-0 z-50 h-header flex items-center justify-between px-5 bg-gradient-to-r from-exam-header-from to-exam-header-to border-b-2 border-exam-header-border">
            {/* Left: Exam Title */}
            <h1 className="text-lg font-semibold text-white">
                {paper.title}
            </h1>

            {/* Right: Candidate + Timer */}
            <div className="flex items-center gap-7.5">
                {/* Candidate Name */}
                <div className="px-4 py-2 rounded text-white text-base bg-white/10">
                    {candidateName}
                </div>

                {/* Timer */}
                <div className="text-base font-bold text-timer font-mono">
                    Time Left: {timerData.displayTime}
                </div>
            </div>
        </header>
    );
}

// =============================================================================
// SECTION INDICATOR BAR (48px height)
// =============================================================================

function SectionIndicatorBar() {
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const sections = ['VARC', 'DILR', 'QA'] as const;

    // Dynamic Tailwind classes for section colors
    const getSectionClasses = (section: typeof sections[number], isActive: boolean) => {
        const baseClasses = 'flex-1 flex items-center justify-center text-base font-semibold cursor-pointer transition-colors duration-300';
        if (!isActive) {
            return `${baseClasses} bg-section-inactive text-exam-text-muted hover:bg-gray-200`;
        }
        switch (section) {
            case 'VARC': return `${baseClasses} bg-section-varc text-white`;
            case 'DILR': return `${baseClasses} bg-section-dilr text-white`;
            case 'QA': return `${baseClasses} bg-section-qa text-white`;
            default: return baseClasses;
        }
    };

    return (
        <div className="sticky top-header z-40 h-section-bar flex bg-white border-b border-gray-300">
            {sections.map((section, index) => {
                const isActive = index === currentSectionIndex;

                return (
                    <div
                        key={section}
                        className={getSectionClasses(section, isActive)}
                    >
                        {section === 'DILR' ? 'LRDI' : section === 'QA' ? 'Quant' : section}
                    </div>
                );
            })}
        </div>
    );
}

// =============================================================================
// QUESTION METADATA BAR (40px height)
// =============================================================================

interface QuestionMetadataBarProps {
    question: Question;
    questionNumber: number;
}

function QuestionMetadataBar({ question, questionNumber }: QuestionMetadataBarProps) {
    const marks = question.negative_marks > 0
        ? `+${question.positive_marks} -${question.negative_marks}`
        : `+${question.positive_marks} -0`;

    return (
        <div className="h-metadata-bar flex items-center justify-between px-5 bg-exam-bg-pane border-y border-exam-bg-border-light">
            <span className="text-sm text-exam-text-secondary">
                Type: {question.question_type} | Marks: {marks}
            </span>
            <span className="text-[15px] font-semibold text-exam-text-primary">
                Question No. {questionNumber}
            </span>
        </div>
    );
}

// =============================================================================
// QUESTION PANE (Left Column - 65%)
// =============================================================================

interface QuestionPaneProps {
    question: Question;
}

function QuestionPane({ question }: QuestionPaneProps) {
    return (
        <div className="w-2/3 overflow-y-auto bg-exam-bg-white px-10 py-8 border-r border-exam-bg-border">
            {/* Context/Passage if exists */}
            {question.context && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                    {question.context.title && (
                        <h3 className="text-[15px] font-semibold text-exam-header-from mb-3">
                            {question.context.title}
                        </h3>
                    )}
                    {question.context.image_url && (
                        <div className="mb-4">
                            <img
                                src={question.context.image_url}
                                alt="Context diagram"
                                className="max-w-full h-auto rounded border border-gray-200"
                            />
                        </div>
                    )}
                    <div className="text-[15px] leading-exam text-exam-text-body whitespace-pre-wrap mb-5">
                        <MathText text={question.context.content} />
                    </div>
                </div>
            )}

            {/* Question Image */}
            {question.question_image_url && (
                <div className="mb-5">
                    <img
                        src={question.question_image_url}
                        alt="Question diagram"
                        className="max-w-full h-auto rounded border border-gray-200"
                    />
                </div>
            )}

            {/* Question Text */}
            <div className="text-[15px] leading-exam text-exam-text-body mb-5">
                <MathText text={question.question_text} />
            </div>

            {/* Answer Options */}
            {question.question_type === 'MCQ' ? (
                <MCQRenderer question={question} />
            ) : (
                <TITARenderer question={question} />
            )}
        </div>
    );
}

// =============================================================================
// NAVIGATION PANE (Right Column - 35%)
// =============================================================================

interface NavigationPaneProps {
    questions: Question[];
    sectionQuestions: Question[];
    currentQuestionIndex: number;
    onSaveResponse?: (questionId: string, answer: string | null) => Promise<void>;
}

function NavigationPane({
    questions,
    sectionQuestions,
    currentQuestionIndex,
    onSaveResponse,
}: NavigationPaneProps) {
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const responses = useExamStore((s) => s.responses);
    const goToQuestion = useExamStore((s) => s.goToQuestion);
    const toggleMarkForReview = useExamStore((s) => s.toggleMarkForReview);
    const clearAnswer = useExamStore((s) => s.clearAnswer);
    const setAnswer = useExamStore((s) => s.setAnswer);

    const currentQuestion = sectionQuestions[currentQuestionIndex];

    // Handle question grid click
    const handleQuestionClick = useCallback((question: Question, index: number) => {
        goToQuestion(question.id, currentSectionIndex, index);
    }, [goToQuestion, currentSectionIndex]);

    // Handle Mark for Review & Next
    const handleMarkForReview = useCallback(() => {
        if (!currentQuestion) return;
        toggleMarkForReview(currentQuestion.id);
        // Move to next question
        if (currentQuestionIndex < sectionQuestions.length - 1) {
            const nextQ = sectionQuestions[currentQuestionIndex + 1];
            goToQuestion(nextQ.id, currentSectionIndex, currentQuestionIndex + 1);
        }
    }, [currentQuestion, currentQuestionIndex, sectionQuestions, toggleMarkForReview, goToQuestion, currentSectionIndex]);

    // Handle Clear Response
    const handleClearResponse = useCallback(() => {
        if (!currentQuestion) return;
        clearAnswer(currentQuestion.id);
    }, [currentQuestion, clearAnswer]);

    // Handle Save & Next
    const handleSaveNext = useCallback(async () => {
        if (!currentQuestion) return;

        const response = responses[currentQuestion.id];
        if (response?.answer) {
            // Mark as answered
            setAnswer(currentQuestion.id, response.answer);
            // Persist to server
            await onSaveResponse?.(currentQuestion.id, response.answer);
        }

        // Move to next question
        if (currentQuestionIndex < sectionQuestions.length - 1) {
            const nextQ = sectionQuestions[currentQuestionIndex + 1];
            goToQuestion(nextQ.id, currentSectionIndex, currentQuestionIndex + 1);
        }
    }, [currentQuestion, currentQuestionIndex, sectionQuestions, responses, setAnswer, goToQuestion, currentSectionIndex, onSaveResponse]);

    return (
        <div className="w-1/3 flex flex-col h-full bg-exam-bg-pane p-6">
            {/* Title */}
            <h3 className="text-base font-semibold text-exam-header-from text-center mb-5">
                Choose a Question
            </h3>

            {/* Question Grid - 6 columns */}
            <div className="grid grid-cols-6 gap-2 mb-auto">
                {sectionQuestions.map((question, index) => {
                    const response = responses[question.id];
                    const status: QuestionStatus = response?.status ?? 'not_visited';
                    const isCurrent = index === currentQuestionIndex;

                    // Determine button classes based on status using Tailwind
                    const getButtonClasses = () => {
                        const baseClasses = 'w-q-btn h-q-btn flex items-center justify-center text-base font-medium cursor-pointer transition-all duration-200 hover:opacity-80 rounded';
                        if (isCurrent) {
                            return `${baseClasses} bg-status-current text-white border-2 border-status-current-dark`;
                        }
                        if (status === 'answered' || status === 'answered_marked') {
                            return `${baseClasses} bg-status-answered text-white border border-status-answered-dark`;
                        }
                        if (status === 'marked') {
                            return `${baseClasses} bg-status-marked text-white border border-status-marked-dark`;
                        }
                        if (status === 'visited') {
                            return `${baseClasses} bg-status-visited text-white border border-status-visited-dark`;
                        }
                        // Not visited - default white
                        return `${baseClasses} bg-status-not-visited text-exam-header-from border border-status-border`;
                    };

                    return (
                        <button
                            key={question.id}
                            type="button"
                            onClick={() => handleQuestionClick(question, index)}
                            className={getButtonClasses()}
                            title={`Question ${index + 1}`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-status-answered" />
                        <span className="text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-status-visited" />
                        <span className="text-gray-600">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-white border border-status-border" />
                        <span className="text-gray-600">Not Visited</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-status-marked" />
                        <span className="text-gray-600">Marked</span>
                    </div>
                </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-between gap-2 mt-8 pt-4 border-t border-gray-300">
                <button
                    type="button"
                    onClick={handleMarkForReview}
                    className="flex-1 h-btn text-sm font-semibold text-white rounded cursor-pointer transition-colors duration-200 hover:opacity-90 bg-section-varc border-none"
                >
                    Mark for Review & Next
                </button>
                <button
                    type="button"
                    onClick={handleClearResponse}
                    className="flex-1 h-btn text-sm font-semibold text-white rounded cursor-pointer transition-colors duration-200 hover:opacity-90 bg-gray-400 border-none"
                >
                    Clear Response
                </button>
                <button
                    type="button"
                    onClick={handleSaveNext}
                    className="flex-1 h-btn text-sm font-semibold text-white rounded cursor-pointer transition-colors duration-200 hover:opacity-90 bg-emerald-600 border-none"
                >
                    Save & Next
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// FOOTER (50px height)
// =============================================================================

function ExamFooter() {
    return (
        <footer className="h-footer flex items-center px-8 bg-exam-header-from border-t border-exam-header-border">
            <span className="text-sm text-section-inactive">
                © CAT 2025 - Mock Exam Platform
            </span>
        </footer>
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
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const isSubmitting = useExamStore((s) => s.isSubmitting);

    // Initialize timer with callbacks
    const { isAutoSubmitting } = useExamTimer({
        onSectionExpire: onSectionExpire,
        onExamComplete: onSubmitExam,
    });

    // Get questions for current section
    const sectionQuestions = useMemo(() => {
        return getQuestionsForSection(questions, currentSection);
    }, [questions, currentSection]);

    // Current question
    const currentQuestion = sectionQuestions[currentQuestionIndex];

    // Show loading state while hydrating
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-section-varc mx-auto mb-4" />
                    <p className="text-exam-text-muted">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Show submitting state
    if (isSubmitting || isAutoSubmitting) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
                    <p className="text-exam-text-muted">
                        {isAutoSubmitting ? 'Auto-submitting section...' : 'Submitting exam...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <p className="text-exam-text-muted">No questions found for this section.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col w-full font-exam text-sm leading-normal bg-exam-bg-page">
            {/* Full width container - no margins */}
            <div className="flex flex-col min-h-screen w-full overflow-hidden">
                {/* Header - 60px (sticky) */}
                <ExamHeader paper={paper} />

                {/* Section Indicator Bar - 48px (sticky) */}
                <SectionIndicatorBar />

                {/* Question Metadata Bar - 40px */}
                <QuestionMetadataBar
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                />

                {/* Main Content Area - Two Column Layout */}
                <main className="flex flex-1 h-[calc(100vh-60px-48px-40px-50px)]">
                    {/* Left Column: Question Pane (65%) */}
                    <QuestionPane question={currentQuestion} />

                    {/* Right Column: Navigation Pane (35%) */}
                    <NavigationPane
                        questions={questions}
                        sectionQuestions={sectionQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        onSaveResponse={onSaveResponse}
                    />
                </main>

                {/* Footer - 50px */}
                <ExamFooter />
            </div>
        </div>
    );
}

export default ExamLayout;
