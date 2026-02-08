/**
 * @fileoverview Question Analysis Component
 * @description Detailed question-by-question review with Masked Review Mode and Peer Stats
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { type SectionName, type QuestionType, type PerformanceReason } from '@/types/exam';
import { getAnalysisStore } from '@/features/exam-engine/model/useExamStore';
import { compareAnswers } from '@/features/exam-engine/lib/scoring';
import { MathText } from './MathText';

interface QuestionData {
    id: string;
    section: SectionName;
    question_number: number;
    question_text: string;
    question_type: QuestionType;
    options: string[] | null;
    correct_answer: string;
    solution_text?: string | null;
    question_image_url?: string | null;
    topic?: string | null;
    subtopic?: string | null;
    context_title?: string | null;
    context_body?: string | null;
    context_image_url?: string | null;
    difficulty?: string | null;
}

interface ResponseData {
    question_id: string;
    answer: string | null;
    status?: string | null;
    is_correct: boolean | null;
    marks_obtained: number | null;
    time_spent_seconds?: number | null;
    visit_count?: number | null;
    updated_at?: string | null;
}

/** Peer statistics for a paper - aggregated response counts */
interface PaperStats {
    [questionId: string]: {
        total: number;
        options: Record<string, number>;
    };
}

interface QuestionAnalysisProps {
    questions: QuestionData[];
    responses: ResponseData[];
    peerStats?: PaperStats;
    attemptSequenceLabel?: string | null;
    attemptId?: string | null;
    showDetailedList?: boolean;
    showHeader?: boolean;
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'unanswered';
/** Get response for a question */
function getResponse(questionId: string, responses: ResponseData[]): ResponseData | undefined {
    return responses.find(r => r.question_id === questionId);
}

function resolveIsCorrect(question: QuestionData, response?: ResponseData): boolean | null {
    if (!response) return null;
    if (typeof response.is_correct === 'boolean') return response.is_correct;
    const answer = response.answer;
    if (answer === null || answer.trim() === '') return null;
    const correct = question.correct_answer;
    if (!correct || correct.trim() === '') return null;
    return compareAnswers(answer, correct, question.question_type);
}

/** Get status styling - ONLY used when answer is revealed */
function getStatusStyle(isCorrect: boolean | null, hasAnswer: boolean): {
    bgClass: string;
    borderClass: string;
    textClass: string;
    label: string;
} {
    if (!hasAnswer) {
        return {
            bgClass: 'bg-gray-100',
            borderClass: 'border-gray-300',
            textClass: 'text-gray-600',
            label: 'Unanswered',
        };
    }
    if (isCorrect) {
        return {
            bgClass: 'bg-green-50',
            borderClass: 'border-green-400',
            textClass: 'text-green-700',
            label: 'Correct',
        };
    }
    return {
        bgClass: 'bg-red-50',
        borderClass: 'border-red-400',
        textClass: 'text-red-700',
        label: 'Incorrect',
    };
}

/** Get neutral styling for masked mode (before reveal) */
function getMaskedStyle(): {
    bgClass: string;
    borderClass: string;
    textClass: string;
    label: string;
} {
    return {
        bgClass: 'bg-white',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-700',
        label: 'Review',
    };
}

/** Format option label (A, B, C, D) */
function getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
}

function formatDuration(seconds?: number | null): string {
    const totalSeconds = Math.max(0, Math.floor(seconds ?? 0));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const REASON_OPTIONS: Array<{ value: PerformanceReason; label: string }> = [
    { value: 'concept_gap', label: 'Concept gap' },
    { value: 'careless_error', label: 'Silly mistake' },
    { value: 'time_pressure', label: 'Time pressure' },
    { value: 'guess', label: 'Guess/unsure' },
];

export function QuestionAnalysis({
    questions,
    responses,
    peerStats = {},
    attemptSequenceLabel,
    attemptId,
    showDetailedList = true,
    showHeader = true,
}: QuestionAnalysisProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const [visibleSolutions, setVisibleSolutions] = useState<Set<string>>(new Set());
    // Masked Review: Track which questions have had their answer/solution revealed
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
    const [activeSection, setActiveSection] = useState<SectionName | 'all'>('all');
    const [activeTopic, setActiveTopic] = useState<string>('all');
    const analysisStore = getAnalysisStore(attemptId ?? 'temp');
    const analysisReasons = analysisStore((s) => s.reasons);
    const bookmarkedQuestions = analysisStore((s) => s.bookmarks);
    const setAnalysisReason = analysisStore((s) => s.setReason);
    const toggleBookmark = analysisStore((s) => s.toggleBookmark);

    const isAnswered = useCallback((response?: ResponseData) => {
        if (!response) return false;
        const status = response.status;
        if (status === 'answered' || status === 'answered_marked') return true;
        const answer = response.answer;
        return answer !== null && answer !== undefined && answer.trim() !== '';
    }, []);

    // Filter questions (section + status)
    const baseFilteredQuestions = questions.filter(q => {
        const response = getResponse(q.id, responses);
        const hasAnswer = isAnswered(response);
        const isCorrect = resolveIsCorrect(q, response);

        // Section filter
        if (activeSection !== 'all' && q.section !== activeSection) return false;

        // Status filter
        switch (filter) {
            case 'correct':
                return hasAnswer && isCorrect === true;
            case 'incorrect':
                return hasAnswer && isCorrect === false;
            case 'unanswered':
                return !hasAnswer;
            default:
                return true;
        }
    });

    const topics = useMemo(() => {
        const counts = new Map<string, number>();
        baseFilteredQuestions.forEach((q) => {
            const topic = q.topic?.trim() || 'Uncategorized';
            counts.set(topic, (counts.get(topic) ?? 0) + 1);
        });
        return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
    }, [baseFilteredQuestions]);

    useEffect(() => {
        if (activeTopic === 'all') return;
        const exists = topics.some(t => t.name === activeTopic);
        if (!exists) {
            setActiveTopic('all');
        }
    }, [activeTopic, topics]);

    const filteredQuestions = activeTopic === 'all'
        ? baseFilteredQuestions
        : baseFilteredQuestions.filter(q => (q.topic?.trim() || 'Uncategorized') === activeTopic);

    // Toggle question expansion
    const toggleQuestion = (questionId: string) => {
        setExpandedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Reveal correct answer and solution (Masked Review Mode)
    const revealAnswer = (questionId: string) => {
        setRevealedIds(prev => {
            const newSet = new Set(prev);
            newSet.add(questionId);
            return newSet;
        });
        // Also show solution when revealing
        setVisibleSolutions(prev => {
            const newSet = new Set(prev);
            newSet.add(questionId);
            return newSet;
        });
    };

    const toggleSolution = (questionId: string) => {
        setVisibleSolutions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Calculate peer percentage for an option
    const getOptionPercentage = (questionId: string, optionLabel: string): number | null => {
        const stats = peerStats[questionId];
        if (!stats || stats.total === 0) return null;
        const count = stats.options[optionLabel] ?? 0;
        return Math.round((count / stats.total) * 100);
    };

    // Stats for filters
    const stats = {
        correct: questions.filter(q => {
            const r = getResponse(q.id, responses);
            return isAnswered(r) && resolveIsCorrect(q, r) === true;
        }).length,
        incorrect: questions.filter(q => {
            const r = getResponse(q.id, responses);
            return isAnswered(r) && resolveIsCorrect(q, r) === false;
        }).length,
        unanswered: questions.filter(q => {
            const r = getResponse(q.id, responses);
            return !isAnswered(r);
        }).length,
    };

    return (
        <div className="mb-8">
            {showHeader && (
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Question Analysis</h2>
                    {attemptSequenceLabel && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                            {attemptSequenceLabel}
                        </span>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Section Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(['all', 'VARC', 'DILR', 'QA'] as const).map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeSection === section
                                ? 'bg-white shadow text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {section === 'all' ? 'All' : section}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'all'
                            ? 'bg-white shadow text-gray-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All ({questions.length})
                    </button>
                    <button
                        onClick={() => setFilter('correct')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'correct'
                            ? 'bg-green-100 text-green-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ✓ Correct ({stats.correct})
                    </button>
                    <button
                        onClick={() => setFilter('incorrect')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'incorrect'
                            ? 'bg-red-100 text-red-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ✗ Wrong ({stats.incorrect})
                    </button>
                    <button
                        onClick={() => setFilter('unanswered')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'unanswered'
                            ? 'bg-gray-300 text-gray-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        – Skipped ({stats.unanswered})
                    </button>
                </div>
            </div>

            {showDetailedList && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question List */}
                    <div className="space-y-3 lg:col-span-3">
                        {filteredQuestions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No questions match the selected filters.
                            </div>
                        ) : (
                            filteredQuestions.map((question) => {
                                const response = getResponse(question.id, responses);
                                const hasAnswer = isAnswered(response);
                                const isCorrect = resolveIsCorrect(question, response);
                                const isExpanded = expandedQuestions.has(question.id);
                                const isSolutionVisible = visibleSolutions.has(question.id);
                                // Masked Review Mode: Only show correct/incorrect styling after reveal
                                const isRevealed = revealedIds.has(question.id);
                                const style = isRevealed
                                    ? getStatusStyle(isCorrect, hasAnswer)
                                    : getMaskedStyle();
                                const isBookmarked = Boolean(bookmarkedQuestions[question.id]);
                                const selectedReason = analysisReasons[question.id] ?? null;
                                const isIncorrect = hasAnswer && isCorrect === false;
                                const isSkipped = !hasAnswer;
                                const showReasonPicker = isIncorrect || isSkipped;

                                return (
                                    <div
                                        key={question.id}
                                        id={`question-${question.id}`}
                                        className={`border-2 ${style.borderClass} ${style.bgClass} rounded-lg overflow-hidden transition-all`}
                                    >
                                        {/* Question Header (Click to expand) */}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => toggleQuestion(question.id)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    toggleQuestion(question.id);
                                                }
                                            }}
                                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/50 transition-colors cursor-pointer"
                                        >
                                            {/* Question Number */}
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border flex items-center justify-center">
                                                <span className="text-sm text-gray-500">Q{question.question_number}</span>
                                            </div>

                                            {/* Status & Section */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {isRevealed ? (
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${style.textClass} bg-white`}>
                                                            {style.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium px-2 py-0.5 rounded text-blue-600 bg-blue-50">
                                                            {hasAnswer ? 'Attempted' : 'Skipped'}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {question.section}
                                                    </span>
                                                    {question.topic && (
                                                        <span className="text-xs text-gray-400">
                                                            • {question.topic}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <MathText
                                                        text={question.question_text}
                                                        className="line-clamp-2 [&_p]:line-clamp-2 [&_p]:whitespace-pre-wrap"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Time: {response?.time_spent_seconds ? formatDuration(response.time_spent_seconds) : '—'}
                                                    {' '}• Visits: {response?.visit_count ?? '—'}
                                                </p>
                                            </div>

                                            {/* Marks - only show after reveal */}
                                            <div className="flex-shrink-0 text-right">
                                                {isRevealed ? (
                                                    <>
                                                        <span className={`text-lg font-bold ${style.textClass}`}>
                                                            {response?.marks_obtained !== null && response?.marks_obtained !== undefined
                                                                ? (response.marks_obtained > 0 ? '+' : '') + response.marks_obtained
                                                                : '0'
                                                            }
                                                        </span>
                                                        <span className="text-xs text-gray-400 block">marks</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Click to review</span>
                                                )}
                                            </div>

                                            {/* Bookmark Toggle */}
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    toggleBookmark(question.id);
                                                }}
                                                className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${isBookmarked
                                                    ? 'border-amber-300 bg-amber-50 text-amber-600'
                                                    : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                                                    }`}
                                                aria-pressed={isBookmarked}
                                                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
                                            >
                                                <svg
                                                    className="w-5 h-5"
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
                                            </button>

                                            {/* Expand Icon */}
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                        <div className="border-t bg-white p-4 space-y-4">
                                            {/* Question Image */}
                                            {question.question_image_url && (
                                                <div className="mb-4">
                                                    <img
                                                        src={question.question_image_url}
                                                        alt={`Question ${question.question_number} diagram`}
                                                        className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Full Question Text */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Question</h4>
                                                <div className="text-gray-800 prose prose-sm max-w-none">
                                                    <MathText text={question.question_text} />
                                                </div>
                                            </div>

                                            {/* Response Analytics */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                                                <div>
                                                    <span className="text-xs text-gray-500 block">Time Spent</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {formatDuration(response?.time_spent_seconds)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 block">Visits</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {response?.visit_count ?? 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {showReasonPicker && (
                                                <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-amber-700">Reason for Performance</span>
                                                        <span className="text-[10px] uppercase tracking-wide text-amber-600">
                                                            {isSkipped ? 'Skipped' : 'Incorrect'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {REASON_OPTIONS.map((option) => {
                                                            const isActive = selectedReason === option.value;
                                                            return (
                                                                <button
                                                                    key={option.value}
                                                                    type="button"
                                                                    onClick={() => setAnalysisReason(question.id, isActive ? null : option.value)}
                                                                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${isActive
                                                                        ? 'bg-amber-500 text-white border-amber-500'
                                                                        : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-100'
                                                                        }`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="mt-2 text-[10px] text-amber-600">
                                                        Tap again to clear a selection.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Options (for MCQ) with Masked Review Mode */}
                                            {question.question_type === 'MCQ' && question.options && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Options</h4>
                                                    <div className="space-y-2">
                                                        {question.options.map((option, idx) => {
                                                            const optionLabel = getOptionLabel(idx);
                                                            const isUserAnswer = response?.answer === optionLabel;
                                                            const isCorrectAnswer = question.correct_answer === optionLabel;
                                                            const peerPercent = isRevealed ? getOptionPercentage(question.id, optionLabel) : null;

                                                            // Masked mode: only show user's answer (neutral), no correct/incorrect
                                                            let optionBgClass = 'bg-gray-50';
                                                            let optionBorderClass = '';
                                                            let badgeClass = 'bg-gray-200 text-gray-600';

                                                            if (isRevealed) {
                                                                // Revealed: show correct/incorrect highlighting
                                                                if (isCorrectAnswer) {
                                                                    optionBgClass = 'bg-green-100';
                                                                    optionBorderClass = 'border border-green-300';
                                                                    badgeClass = 'bg-green-500 text-white';
                                                                } else if (isUserAnswer) {
                                                                    optionBgClass = 'bg-red-100';
                                                                    optionBorderClass = 'border border-red-300';
                                                                    badgeClass = 'bg-red-500 text-white';
                                                                }
                                                            } else {
                                                                // Masked: only highlight user's selection neutrally
                                                                if (isUserAnswer) {
                                                                    optionBgClass = 'bg-blue-50';
                                                                    optionBorderClass = 'border border-blue-200';
                                                                    badgeClass = 'bg-blue-500 text-white';
                                                                }
                                                            }

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex items-start gap-3 p-2 rounded-lg ${optionBgClass} ${optionBorderClass}`}
                                                                >
                                                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${badgeClass}`}>
                                                                        {optionLabel}
                                                                    </span>
                                                                    <span className="flex-1 text-sm text-gray-700">
                                                                        <MathText text={option} />
                                                                    </span>

                                                                    {/* Peer Stats Overlay - only after reveal */}
                                                                    {isRevealed && peerPercent !== null && (
                                                                        <div className="flex items-center gap-2 ml-auto">
                                                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full rounded-full ${isCorrectAnswer ? 'bg-green-400' : 'bg-gray-400'}`}
                                                                                    style={{ width: `${peerPercent}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs text-gray-500 w-8">{peerPercent}%</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Labels */}
                                                                    {isRevealed && isCorrectAnswer && (
                                                                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                                                            ✓ Correct
                                                                        </span>
                                                                    )}
                                                                    {isRevealed && isUserAnswer && !isCorrectAnswer && (
                                                                        <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                                                                            Your answer
                                                                        </span>
                                                                    )}
                                                                    {!isRevealed && isUserAnswer && (
                                                                        <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
                                                                            Your answer
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* TITA Answer - Masked Review Mode */}
                                            {question.question_type === 'TITA' && (
                                                <div className="flex gap-6">
                                                    {isRevealed ? (
                                                        <>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Correct Answer</h4>
                                                                <MathText
                                                                    text={question.correct_answer}
                                                                    className="text-lg font-bold text-green-600 [&_p]:my-0"
                                                                />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Your Answer</h4>
                                                                <MathText
                                                                    text={response?.answer || '(Not answered)'}
                                                                    className={`text-lg font-bold ${isCorrect === true ? 'text-green-600' : isCorrect === false ? 'text-red-600' : 'text-gray-500'} [&_p]:my-0`}
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Your Answer</h4>
                                                            <MathText
                                                                text={response?.answer || '(Not answered)'}
                                                                className="text-lg font-bold text-blue-600 [&_p]:my-0"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Check Answer Button - Masked Review Mode */}
                                            {!isRevealed && (
                                                <div className="pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => revealAnswer(question.id)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                                    >
                                                        🔍 Check Answer & Show Solution
                                                    </button>
                                                </div>
                                            )}

                                            {/* Solution - only after reveal */}
                                            {isRevealed && question.solution_text && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-gray-500">Solution</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSolution(question.id)}
                                                            className="text-blue-600 hover:underline text-sm"
                                                            aria-expanded={isSolutionVisible}
                                                        >
                                                            {isSolutionVisible ? 'Hide Solution' : 'View Solution'}
                                                        </button>
                                                    </div>
                                                    <div
                                                        className={`transition-all duration-200 ${isSolutionVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                                    >
                                                        <div className="text-gray-700 prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg">
                                                            <MathText text={question.solution_text ?? ''} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Topic Navigator */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-4 space-y-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3">Topics</h3>
                            <button
                                type="button"
                                onClick={() => setActiveTopic('all')}
                                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${activeTopic === 'all'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                All Topics ({baseFilteredQuestions.length})
                            </button>
                            <div className="mt-2 space-y-1">
                                {topics.length === 0 ? (
                                    <div className="text-xs text-gray-400">No topics available.</div>
                                ) : (
                                    topics.map((topic) => (
                                        <button
                                            key={topic.name}
                                            type="button"
                                            onClick={() => setActiveTopic(topic.name)}
                                            className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${activeTopic === topic.name
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {topic.name} ({topic.count})
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            )}

        </div>
    );
}
