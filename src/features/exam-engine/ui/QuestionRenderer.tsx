/**
 * @fileoverview Question Set Renderer Component
 * @description Renders question sets with appropriate layout based on set_type
 * @architecture Question Container Architecture - Parent-Child Model
 * 
 * Layout Decision Logic:
 * - Composite Sets (VARC/DILR/CASELET): SplitPaneLayout with context on left
 * - Atomic Sets: SingleFocusLayout with centered question
 */

'use client';

import { useMemo, useCallback } from 'react';
import type {
    QuestionSet,
    QuestionSetType,
    QuestionInSet,
} from '@/types/exam';
import { isCompositeSet } from '@/types/exam';
import { MathText } from './MathText';
import { MCQRenderer } from './MCQRenderer';
import { TITARenderer } from './TITARenderer';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionRendererProps {
    /** The question set to render */
    questionSet: QuestionSet;
    /** Currently active question index within the set (0-based) */
    activeQuestionIndex: number;
    /** Callback when user navigates to different question in set */
    onQuestionChange?: (index: number) => void;
    /** User's responses for questions in this set */
    responses?: Record<string, string | null>;
    /** Callback when user selects an answer */
    onAnswerChange?: (questionId: string, answer: string | null) => void;
    /** Whether exam is in review mode (show correct answers) */
    isReviewMode?: boolean;
    /** Render in read-only mode (review) */
    readOnly?: boolean;
    /** Show correct answers in review mode */
    showCorrectAnswer?: boolean;
    /** Correct answers keyed by question id */
    correctAnswerMap?: Record<string, string>;
    /** Optional: show bookmark toggle for the active question */
    showBookmarkToggle?: boolean;
    /** Optional: list of bookmarked question ids */
    bookmarkedQuestionIds?: Set<string> | Record<string, boolean>;
    /** Optional: callback to toggle bookmark for a question */
    onToggleBookmark?: (questionId: string) => void;
}

// =============================================================================
// SPLIT PANE SECTIONS (For VARC / DILR / CASELET)
// =============================================================================

interface ContextPaneProps {
    questionSet: QuestionSet;
}

export function ContextPane({ questionSet }: ContextPaneProps) {
    return (
        <div className="h-full overflow-y-auto border-r border-exam-bg-border bg-exam-bg-white">
            <div className="sticky top-0 bg-exam-bg-pane border-b border-exam-bg-border px-4 py-2 z-10">
                <h3 className="text-sm font-semibold text-exam-header-from flex items-center gap-2">
                    <ContextIcon setType={questionSet.set_type} />
                    {questionSet.context_title || getDefaultContextTitle(questionSet.set_type)}
                </h3>
            </div>

            <div className="p-6">
                {/* Context Image (for charts, diagrams) */}
                {questionSet.context_image_url && (
                    <div className="mb-4">
                        <img
                            src={questionSet.context_image_url}
                            alt={questionSet.context_title || 'Context diagram'}
                            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                        />
                    </div>
                )}

                {/* Context Body (passage text) */}
                {questionSet.context_body && (
                    <div className="prose prose-sm max-w-none text-exam-text-body leading-exam">
                        <MathText text={questionSet.context_body} />
                    </div>
                )}

                {/* Additional Images */}
                {questionSet.context_additional_images?.map((img, idx) => (
                    <figure key={img.url || `img-${idx}`} className="mt-4">
                        <img
                            src={img.url}
                            alt={img.caption || `Additional figure ${idx + 1}`}
                            className="max-w-full h-auto rounded border border-gray-200"
                        />
                        {img.caption && (
                            <figcaption className="text-xs text-gray-500 mt-1 text-center">
                                {img.caption}
                            </figcaption>
                        )}
                    </figure>
                ))}
            </div>
        </div>
    );
}

interface QuestionPaneProps {
    activeQuestion: QuestionInSet;
    activeQuestionIndex: number;
    totalQuestions: number;
    onQuestionChange: (index: number) => void;
    response: string | null;
    onAnswerChange: (questionId: string, answer: string | null) => void;
    isReviewMode?: boolean;
    readOnly?: boolean;
    showCorrectAnswer?: boolean;
    responses?: Record<string, string | null>;
    correctAnswerMap?: Record<string, string>;
    showBookmarkToggle?: boolean;
    isBookmarked?: boolean;
    onToggleBookmark?: (questionId: string) => void;
}

export function QuestionPane({
    activeQuestion,
    activeQuestionIndex,
    totalQuestions,
    onQuestionChange,
    response,
    onAnswerChange,
    isReviewMode,
    readOnly,
    showCorrectAnswer,
    responses,
    correctAnswerMap,
    showBookmarkToggle,
    isBookmarked,
    onToggleBookmark,
}: QuestionPaneProps) {
    return (
        <div className="h-full overflow-y-auto bg-exam-bg-white">
            {/* Question Navigation within Set */}
            <div className="sticky top-0 bg-exam-bg-pane border-b border-exam-bg-border px-4 py-2 z-10">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-exam-text-secondary">
                        Question {activeQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <div className="flex gap-1">
                        {Array.from({ length: totalQuestions }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => onQuestionChange(idx)}
                                className={`
                                    w-7 h-7 rounded text-xs font-medium transition-colors
                                    ${idx === activeQuestionIndex
                                        ? 'bg-status-current text-white'
                                        : 'bg-white border border-status-border text-exam-text-primary hover:bg-gray-100'
                                    }
                                `}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
                <QuestionContent
                    question={activeQuestion}
                    response={response}
                    onAnswerChange={onAnswerChange}
                    isReviewMode={isReviewMode}
                    readOnly={readOnly}
                    showCorrectAnswer={showCorrectAnswer}
                    responses={responses}
                    correctAnswerMap={correctAnswerMap}
                    showBookmarkToggle={showBookmarkToggle}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={onToggleBookmark}
                />
            </div>
        </div>
    );
}

interface SplitPaneLayoutProps {
    questionSet: QuestionSet;
    activeQuestion: QuestionInSet;
    activeQuestionIndex: number;
    totalQuestions: number;
    onQuestionChange: (index: number) => void;
    response: string | null;
    onAnswerChange: (questionId: string, answer: string | null) => void;
    isReviewMode?: boolean;
    readOnly?: boolean;
    showCorrectAnswer?: boolean;
    responses?: Record<string, string | null>;
    correctAnswerMap?: Record<string, string>;
    showBookmarkToggle?: boolean;
    isBookmarked?: boolean;
    onToggleBookmark?: (questionId: string) => void;
}

function SplitPaneLayout({
    questionSet,
    activeQuestion,
    activeQuestionIndex,
    totalQuestions,
    onQuestionChange,
    response,
    onAnswerChange,
    isReviewMode,
    readOnly,
    showCorrectAnswer,
    responses,
    correctAnswerMap,
    showBookmarkToggle,
    isBookmarked,
    onToggleBookmark,
}: SplitPaneLayoutProps) {
    return (
        <div className="contents">
            <ContextPane questionSet={questionSet} />
            <QuestionPane
                activeQuestion={activeQuestion}
                activeQuestionIndex={activeQuestionIndex}
                totalQuestions={totalQuestions}
                onQuestionChange={onQuestionChange}
                response={response}
                onAnswerChange={onAnswerChange}
                isReviewMode={isReviewMode}
                readOnly={readOnly}
                showCorrectAnswer={showCorrectAnswer}
                responses={responses}
                correctAnswerMap={correctAnswerMap}
                showBookmarkToggle={showBookmarkToggle}
                isBookmarked={isBookmarked}
                onToggleBookmark={onToggleBookmark}
            />
        </div>
    );
}

// =============================================================================
// SINGLE FOCUS LAYOUT (For ATOMIC questions)
// =============================================================================

interface SingleFocusLayoutProps {
    questionSet: QuestionSet;
    activeQuestion: QuestionInSet;
    response: string | null;
    onAnswerChange: (questionId: string, answer: string | null) => void;
    isReviewMode?: boolean;
    /** P4.1: When true, render context body inline above question (for single-question text-only sets) */
    showInlineContext?: boolean;
    readOnly?: boolean;
    showCorrectAnswer?: boolean;
    responses?: Record<string, string | null>;
    correctAnswerMap?: Record<string, string>;
    showBookmarkToggle?: boolean;
    isBookmarked?: boolean;
    onToggleBookmark?: (questionId: string) => void;
}

function SingleFocusLayout({
    questionSet,
    activeQuestion,
    response,
    onAnswerChange,
    isReviewMode,
    showInlineContext = false,
    readOnly,
    showCorrectAnswer,
    responses,
    correctAnswerMap,
    showBookmarkToggle,
    isBookmarked,
    onToggleBookmark,
}: SingleFocusLayoutProps) {
    return (
        <div className="h-full overflow-y-auto bg-exam-bg-white">
            <div className="max-w-3xl mx-auto p-8">
                {/* P4.1: Inline context for single-question text-only sets */}
                {showInlineContext && questionSet.context_body && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        {questionSet.context_title && (
                            <h3 className="text-[15px] font-semibold text-exam-header-from mb-3 flex items-center gap-2">
                                <ContextIcon setType={questionSet.set_type} />
                                {questionSet.context_title}
                            </h3>
                        )}
                        <div className="prose prose-sm max-w-none text-exam-text-body leading-exam">
                            <MathText text={questionSet.context_body} />
                        </div>
                    </div>
                )}

                {/* Optional: Image at top for diagram-based questions */}
                {questionSet.context_image_url && (
                    <div className="mb-6">
                        <img
                            src={questionSet.context_image_url}
                            alt="Question diagram"
                            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm mx-auto"
                        />
                    </div>
                )}

                {/* Question Content */}
                <QuestionContent
                    question={activeQuestion}
                    response={response}
                    onAnswerChange={onAnswerChange}
                    isReviewMode={isReviewMode}
                    showImage={true}
                    readOnly={readOnly}
                    showCorrectAnswer={showCorrectAnswer}
                    responses={responses}
                    correctAnswerMap={correctAnswerMap}
                    showBookmarkToggle={showBookmarkToggle}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={onToggleBookmark}
                />
            </div>
        </div>
    );
}

// =============================================================================
// SHARED QUESTION CONTENT COMPONENT
// =============================================================================

interface QuestionContentProps {
    question: QuestionInSet;
    response: string | null;
    onAnswerChange: (questionId: string, answer: string | null) => void;
    isReviewMode?: boolean;
    showImage?: boolean;
    readOnly?: boolean;
    showCorrectAnswer?: boolean;
    responses?: Record<string, string | null>;
    correctAnswerMap?: Record<string, string>;
    showBookmarkToggle?: boolean;
    isBookmarked?: boolean;
    onToggleBookmark?: (questionId: string) => void;
}

function QuestionContent({
    question,
    response: _response,
    onAnswerChange: _onAnswerChange,
    isReviewMode: _isReviewMode,
    showImage = false,
    readOnly = false,
    showCorrectAnswer = false,
    responses,
    correctAnswerMap,
    showBookmarkToggle,
    isBookmarked = false,
    onToggleBookmark,
}: QuestionContentProps) {
    // Create a Question object compatible with existing renderers
    const questionForRenderer = useMemo(() => ({
        id: question.id,
        paper_id: question.paper_id,
        section: question.section,
        question_number: question.question_number,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        positive_marks: question.positive_marks,
        negative_marks: question.negative_marks,
        difficulty: question.difficulty,
        topic: question.topic,
        subtopic: question.subtopic,
        question_image_url: question.question_image_url,
        is_active: question.is_active,
        created_at: '',
        updated_at: '',
    }), [question]);

    const answerOverride = responses?.[question.id] ?? null;
    const correctAnswer = correctAnswerMap?.[question.id];

    return (
        <div className="space-y-6">
            {showBookmarkToggle && onToggleBookmark && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => onToggleBookmark(question.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${isBookmarked
                            ? 'border-amber-300 bg-amber-50 text-amber-600'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        aria-pressed={isBookmarked}
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill={isBookmarked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 4a2 2 0 012-2h10a2 2 0 012 2v18l-7-4-7 4V4z"
                            />
                        </svg>
                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                </div>
            )}
            {/* Question Image (if shown in single focus mode) */}
            {showImage && question.question_image_url && (
                <div className="mb-4">
                    <img
                        src={question.question_image_url}
                        alt="Question diagram"
                        className="max-w-full max-h-64 w-auto h-auto object-contain rounded border border-gray-200"
                    />
                </div>
            )}

            {/* Question Text */}
            <div className="text-base leading-exam text-exam-text-body">
                <MathText text={question.question_text} />
            </div>

            {/* Marks Info */}
            <div className="text-sm text-exam-text-muted">
                Marks: +{question.positive_marks} / -{question.negative_marks}
            </div>

            {/* Answer Options */}
            <div className="mt-4">
                {question.question_type === 'MCQ' ? (
                    <MCQRenderer
                        question={questionForRenderer}
                        readOnly={readOnly}
                        showCorrectAnswer={showCorrectAnswer}
                        correctAnswer={correctAnswer}
                        answerOverride={answerOverride}
                    />
                ) : (
                    <TITARenderer
                        question={questionForRenderer}
                        readOnly={readOnly}
                        showCorrectAnswer={showCorrectAnswer}
                        correctAnswer={correctAnswer}
                        answerOverride={answerOverride}
                    />
                )}
            </div>
        </div>
    );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ContextIcon({ setType }: { setType: QuestionSetType }) {
    switch (setType) {
        case 'VARC':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
            );
        case 'DILR':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            );
        case 'CASELET':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            );
        default:
            return null;
    }
}

function getDefaultContextTitle(setType: QuestionSetType): string {
    switch (setType) {
        case 'VARC': return 'Reading Passage';
        case 'DILR': return 'Data Set';
        case 'CASELET': return 'Case Study';
        default: return 'Context';
    }
}

// =============================================================================
// MAIN RENDERER COMPONENT
// =============================================================================

/**
 * QuestionRenderer - Main component for rendering question sets
 * 
 * Decides layout based on set_type:
 * - Composite (VARC/DILR/CASELET): SplitPaneLayout
 * - Atomic: SingleFocusLayout
 */
export function QuestionRenderer({
    questionSet,
    activeQuestionIndex,
    onQuestionChange,
    responses = {},
    onAnswerChange,
    isReviewMode = false,
    readOnly = false,
    showCorrectAnswer = false,
    correctAnswerMap,
    showBookmarkToggle = false,
    bookmarkedQuestionIds,
    onToggleBookmark,
}: QuestionRendererProps) {
    // Get questions from the set
    const questions = questionSet.questions ?? [];

    // Validate we have questions
    if (questions.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-exam-bg-page">
                <div className="text-center">
                    <p className="text-exam-text-muted">No questions in this set.</p>
                </div>
            </div>
        );
    }

    // Get active question (clamp index to valid range)
    const safeIndex = Math.max(0, Math.min(activeQuestionIndex, questions.length - 1));
    const activeQuestion = questions[safeIndex];

    // Get current response
    const currentResponse = responses[activeQuestion.id] ?? null;

    const isBookmarked = useMemo(() => {
        if (!bookmarkedQuestionIds) return false;
        if (bookmarkedQuestionIds instanceof Set) {
            return bookmarkedQuestionIds.has(activeQuestion.id);
        }
        return Boolean(bookmarkedQuestionIds[activeQuestion.id]);
    }, [bookmarkedQuestionIds, activeQuestion.id]);

    // Handle answer changes
    const handleAnswerChange = useCallback((questionId: string, answer: string | null) => {
        onAnswerChange?.(questionId, answer);
    }, [onAnswerChange]);

    // Handle question navigation within set
    const handleQuestionChange = useCallback((index: number) => {
        onQuestionChange?.(index);
    }, [onQuestionChange]);

    // Determine layout based on set_type
    const isComposite = isCompositeSet(questionSet.set_type);

    // P4.1: Edge-case layout rule - single question + text-only context = full-width
    // If set has only 1 question AND context has no media (no image_url, no additional_images),
    // default to full-width (SingleFocusLayout) instead of split-pane
    const hasContextMedia = Boolean(
        questionSet.context_image_url ||
        (questionSet.context_additional_images && questionSet.context_additional_images.length > 0)
    );
    const isSingleQuestionSet = questions.length === 1;
    const useFullWidthForEdgeCase = isComposite && isSingleQuestionSet && !hasContextMedia;

    // Render appropriate layout
    if (isComposite && !useFullWidthForEdgeCase) {
        return (
            <SplitPaneLayout
                questionSet={questionSet}
                activeQuestion={activeQuestion}
                activeQuestionIndex={safeIndex}
                totalQuestions={questions.length}
                onQuestionChange={handleQuestionChange}
                response={currentResponse}
                onAnswerChange={handleAnswerChange}
                isReviewMode={isReviewMode}
                readOnly={readOnly}
                showCorrectAnswer={showCorrectAnswer}
                responses={responses}
                correctAnswerMap={correctAnswerMap}
                showBookmarkToggle={showBookmarkToggle}
                isBookmarked={isBookmarked}
                onToggleBookmark={onToggleBookmark}
            />
        );
    }

    // Atomic / Single Focus Layout (including edge-case single-question text-only sets)
    // For edge-case: inline the context above the question
    return (
        <SingleFocusLayout
            questionSet={questionSet}
            activeQuestion={activeQuestion}
            response={currentResponse}
            onAnswerChange={handleAnswerChange}
            isReviewMode={isReviewMode}
            showInlineContext={useFullWidthForEdgeCase && Boolean(questionSet.context_body)}
            readOnly={readOnly}
            showCorrectAnswer={showCorrectAnswer}
            responses={responses}
            correctAnswerMap={correctAnswerMap}
            showBookmarkToggle={showBookmarkToggle}
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
        />
    );
}
