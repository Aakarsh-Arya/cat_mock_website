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
import { fetchBookmarkedQuestionIds, toggleUserBookmark } from '@/lib/bookmarks-client';

interface QuestionData {
    id: string;
    section: SectionName;
    question_number: number;
    question_text: string;
    question_type: QuestionType;
    options: string[] | null;
    correct_answer: string;
    solution_text?: string | null;
    toppers_approach?: string | null;
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
    user_note?: string | null;
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
    responseNoteMap?: Record<string, string | null | undefined>;
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

function normalizeSolutionText(value: string | null | undefined): string {
    return (value ?? '').replace(/\r\n?/g, '\n').trim();
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
            bgClass: 'bg-slate-50',
            borderClass: 'border-slate-200',
            textClass: 'text-slate-500',
            label: 'Unanswered',
        };
    }
    if (isCorrect) {
        return {
            bgClass: 'bg-emerald-50',
            borderClass: 'border-emerald-300',
            textClass: 'text-emerald-700',
            label: 'Correct',
        };
    }
    return {
        bgClass: 'bg-red-50',
        borderClass: 'border-red-300',
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
        borderClass: 'border-slate-200',
        textClass: 'text-slate-700',
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

const MAX_NOTE_WORDS = 50;

function getNoteWords(note: string): string[] {
    return note.match(/\S+/g) ?? [];
}

function clampNoteWords(note: string): string {
    const chunks = note.match(/\S+\s*/g);
    if (!chunks || chunks.length === 0) return '';
    if (chunks.length <= MAX_NOTE_WORDS) return note;
    return chunks.slice(0, MAX_NOTE_WORDS).join('').trimEnd();
}

function getWordCount(note: string): number {
    return getNoteWords(note).length;
}

function hasExceededWordLimit(note: string): boolean {
    return getWordCount(note) > MAX_NOTE_WORDS;
}

export function QuestionAnalysis({
    questions,
    responses,
    peerStats = {},
    attemptSequenceLabel,
    attemptId,
    showDetailedList = true,
    showHeader = true,
    responseNoteMap = {},
}: QuestionAnalysisProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const [visibleSolutions, setVisibleSolutions] = useState<Set<string>>(new Set());
    // Masked Review: Track which questions have had their answer/solution revealed
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
    const [activeSection, setActiveSection] = useState<SectionName | 'all'>('all');
    const [activeTopic, setActiveTopic] = useState<string>('all');
    const [noteByQuestion, setNoteByQuestion] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            responses.map((response) => [
                response.question_id,
                clampNoteWords(typeof response.user_note === 'string' ? response.user_note : ''),
            ])
        )
    );
    const [savingNoteByQuestion, setSavingNoteByQuestion] = useState<Record<string, boolean>>({});
    const [noteErrorByQuestion, setNoteErrorByQuestion] = useState<Record<string, string | null>>({});
    const [savedNoteByQuestion, setSavedNoteByQuestion] = useState<Record<string, boolean>>({});
    const [expandedNoteByQuestion, setExpandedNoteByQuestion] = useState<Record<string, boolean>>({});
    const [noteLimitReachedByQuestion, setNoteLimitReachedByQuestion] = useState<Record<string, boolean>>({});
    const analysisStore = getAnalysisStore(attemptId ?? 'temp');
    const analysisReasons = analysisStore((s) => s.reasons);
    const bookmarkedQuestions = analysisStore((s) => s.bookmarks);
    const setAnalysisReason = analysisStore((s) => s.setReason);
    const setBookmarks = analysisStore((s) => s.setBookmarks);
    const setBookmark = analysisStore((s) => s.setBookmark);

    useEffect(() => {
        let isCancelled = false;
        const scopedQuestionIds = new Set(questions.map((question) => question.id));
        const loadBookmarks = async () => {
            const ids = await fetchBookmarkedQuestionIds();
            if (isCancelled) return;
            const scoped = Array.from(ids).filter((id) => scopedQuestionIds.has(id));
            setBookmarks(scoped);
        };
        void loadBookmarks();
        return () => {
            isCancelled = true;
        };
    }, [questions, setBookmarks]);

    // Wrapper that syncs bookmark to database for persistence
    const toggleBookmark = useCallback(async (questionId: string) => {
        const currentlyBookmarked = Boolean(analysisStore.getState().bookmarks[questionId]);
        setBookmark(questionId, !currentlyBookmarked);

        const result = await toggleUserBookmark(questionId);
        if (!result.success) {
            setBookmark(questionId, currentlyBookmarked);
            return;
        }

        if (result.isBookmarked !== !currentlyBookmarked) {
            setBookmark(questionId, result.isBookmarked);
        }
    }, [analysisStore, setBookmark]);

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

    useEffect(() => {
        const merged = new Map<string, string>();
        responses.forEach((response) => {
            merged.set(response.question_id, clampNoteWords(typeof response.user_note === 'string' ? response.user_note : ''));
        });
        Object.entries(responseNoteMap).forEach(([questionId, note]) => {
            if (typeof note === 'string') {
                merged.set(questionId, clampNoteWords(note));
            }
        });
        setNoteByQuestion(Object.fromEntries(merged.entries()));
        setNoteLimitReachedByQuestion({});
    }, [responses, responseNoteMap]);

    const updateQuestionNote = useCallback((questionId: string, nextValue: string) => {
        setSavedNoteByQuestion((prev) => ({ ...prev, [questionId]: false }));
        setNoteErrorByQuestion((prev) => ({ ...prev, [questionId]: null }));
        setNoteLimitReachedByQuestion((prev) => ({ ...prev, [questionId]: hasExceededWordLimit(nextValue) }));
        setNoteByQuestion((prev) => ({ ...prev, [questionId]: clampNoteWords(nextValue) }));
    }, []);

    const toggleNoteExpansion = useCallback((questionId: string) => {
        setExpandedNoteByQuestion((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }));
    }, []);

    const saveQuestionNote = useCallback(async (questionId: string) => {
        if (!attemptId) return;
        const note = clampNoteWords(noteByQuestion[questionId] ?? '');
        setSavingNoteByQuestion((prev) => ({ ...prev, [questionId]: true }));
        setNoteErrorByQuestion((prev) => ({ ...prev, [questionId]: null }));
        setSavedNoteByQuestion((prev) => ({ ...prev, [questionId]: false }));
        try {
            const response = await fetch('/api/result-note', {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attemptId,
                    questionId,
                    userNote: note,
                }),
            });

            const payload = (await response.json().catch(() => null)) as
                | { data?: { userNote?: unknown }; error?: unknown }
                | null;
            if (!response.ok) {
                setNoteErrorByQuestion((prev) => ({
                    ...prev,
                    [questionId]: typeof payload?.error === 'string' ? payload.error : 'Failed to save note',
                }));
                return;
            }

            const savedNote = clampNoteWords(typeof payload?.data?.userNote === 'string' ? payload.data.userNote : '');
            setNoteByQuestion((prev) => ({ ...prev, [questionId]: savedNote }));
            setNoteLimitReachedByQuestion((prev) => ({ ...prev, [questionId]: false }));
            setSavedNoteByQuestion((prev) => ({ ...prev, [questionId]: true }));
        } catch {
            setNoteErrorByQuestion((prev) => ({ ...prev, [questionId]: 'Failed to save note' }));
        } finally {
            setSavingNoteByQuestion((prev) => ({ ...prev, [questionId]: false }));
        }
    }, [attemptId, noteByQuestion]);

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
                    <h2 className="text-xl font-semibold text-[#0F172A]">Question Analysis</h2>
                    {attemptSequenceLabel && (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                            {attemptSequenceLabel}
                        </span>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
                <div className="flex flex-wrap gap-3">
                    {/* Section Filter */}
                    <div className="mobile-table-scroll rounded-lg bg-slate-100 p-1">
                        <div className="flex min-w-max gap-1">
                            {(['all', 'VARC', 'DILR', 'QA'] as const).map((section) => (
                                <button
                                    key={section}
                                    onClick={() => setActiveSection(section)}
                                    className={`touch-target whitespace-nowrap px-3 py-1.5 text-sm rounded-md transition-colors ${activeSection === section
                                        ? 'bg-white shadow-sm text-[#2563EB] font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {section === 'all' ? 'All' : section}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="mobile-table-scroll rounded-lg bg-slate-100 p-1">
                        <div className="flex min-w-max gap-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`touch-target whitespace-nowrap px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'all'
                                    ? 'bg-white shadow-sm text-slate-800 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                All ({questions.length})
                            </button>
                            <button
                                onClick={() => setFilter('correct')}
                                className={`touch-target whitespace-nowrap px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'correct'
                                    ? 'bg-emerald-100 text-emerald-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Correct ({stats.correct})
                            </button>
                            <button
                                onClick={() => setFilter('incorrect')}
                                className={`touch-target whitespace-nowrap px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'incorrect'
                                    ? 'bg-red-100 text-red-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Incorrect ({stats.incorrect})
                            </button>
                            <button
                                onClick={() => setFilter('unanswered')}
                                className={`touch-target whitespace-nowrap px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'unanswered'
                                    ? 'bg-slate-300 text-slate-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Skipped ({stats.unanswered})
                            </button>
                        </div>
                    </div>
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
                                const questionNote = noteByQuestion[question.id] ?? '';
                                const noteWordCount = getWordCount(questionNote);
                                const isSavingNote = Boolean(savingNoteByQuestion[question.id]);
                                const noteError = noteErrorByQuestion[question.id] ?? null;
                                const noteSaved = Boolean(savedNoteByQuestion[question.id]);
                                const isNoteExpanded = Boolean(expandedNoteByQuestion[question.id]);
                                const noteLimitReached = Boolean(noteLimitReachedByQuestion[question.id]);
                                const isIncorrect = hasAnswer && isCorrect === false;
                                const isSkipped = !hasAnswer;
                                const showReasonPicker = isIncorrect || isSkipped;
                                const hasContext = Boolean(
                                    question.context_title?.trim()
                                    || question.context_body?.trim()
                                    || question.context_image_url
                                );

                                return (
                                    <div
                                        key={question.id}
                                        id={`question-${question.id}`}
                                        className={`border ${style.borderClass} ${style.bgClass} rounded-xl overflow-hidden transition-all shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]`}
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
                                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                                        >
                                            {/* Question Number */}
                                            <div className="flex-shrink-0 h-12 w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center">
                                                <span className="text-sm text-slate-500">Q{question.question_number}</span>
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
                                                    <span className="text-xs text-slate-500">
                                                        {question.section}
                                                    </span>
                                                    {question.topic && (
                                                        <span className="text-xs text-slate-400">
                                                            - {question.topic}
                                                        </span>
                                                    )}
                                                    {hasContext && (
                                                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                                            Context
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-700">
                                                    <MathText
                                                        text={question.question_text}
                                                        className="line-clamp-2 [&_p]:line-clamp-2 [&_p]:whitespace-pre-wrap"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Time: {response?.time_spent_seconds ? formatDuration(response.time_spent_seconds) : '—'}
                                                    {' '}| Visits: {response?.visit_count ?? '—'}
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
                                                        <span className="text-xs text-slate-400 block">marks</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Click to review</span>
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
                                                    : 'border-slate-200 text-slate-400 hover:bg-slate-50'
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
                                                    className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                                            <div className="space-y-4 border-t border-slate-200 bg-white p-4">
                                                {/* Shared Context */}
                                                {hasContext && (
                                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                        <h4 className="mb-2 text-sm font-medium text-slate-600">
                                                            {question.context_title?.trim() || 'Shared Context'}
                                                        </h4>
                                                        {question.context_image_url && (
                                                            <img
                                                                src={question.context_image_url}
                                                                alt={question.context_title?.trim()
                                                                    ? `${question.context_title} diagram`
                                                                    : `Context for question ${question.question_number}`}
                                                                className="mb-3 max-h-96 max-w-full rounded-lg border border-slate-200 object-contain"
                                                            />
                                                        )}
                                                        {question.context_body?.trim() && (
                                                            <div className="prose prose-sm max-w-none text-slate-700">
                                                                <MathText text={question.context_body} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Question Image */}
                                                {question.question_image_url && (
                                                    <div className="mb-4">
                                                        <img
                                                            src={question.question_image_url}
                                                            alt={`Question ${question.question_number} diagram`}
                                                            className="max-h-96 max-w-full rounded-lg border border-slate-200 object-contain"
                                                        />
                                                    </div>
                                                )}

                                                {/* Full Question Text */}
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium text-slate-500">Question</h4>
                                                    <div className="prose prose-sm max-w-none text-slate-800">
                                                        <MathText text={question.question_text} />
                                                    </div>
                                                </div>

                                                {/* Response Analytics */}
                                                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                                    <div>
                                                        <span className="block text-xs text-slate-500">Time Spent</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {formatDuration(response?.time_spent_seconds)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-slate-500">Visits</span>
                                                        <span className="font-semibold text-slate-800">
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

                                                <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-blue-700">Add Notes</span>
                                                        <div className="flex items-center gap-2">
                                                            {noteWordCount > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleNoteExpansion(question.id)}
                                                                    className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                                                                    aria-expanded={isNoteExpanded}
                                                                >
                                                                    {isNoteExpanded ? 'Collapse note' : 'Expand note'}
                                                                </button>
                                                            )}
                                                            <span className="text-[10px] text-blue-600">{noteWordCount}/{MAX_NOTE_WORDS} words</span>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        value={questionNote}
                                                        onChange={(event) => updateQuestionNote(question.id, event.target.value)}
                                                        placeholder="Add your personal note for this question..."
                                                        rows={isNoteExpanded ? 8 : 4}
                                                        className={`mt-2 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-400 ${isNoteExpanded ? 'min-h-40' : 'min-h-20'}`}
                                                    />
                                                    {noteLimitReached && (
                                                        <p className="mt-1 text-[11px] text-amber-700">
                                                            50-word limit reached. Extra words were removed.
                                                        </p>
                                                    )}
                                                    <div className="mt-2 flex items-center justify-between gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => saveQuestionNote(question.id)}
                                                            disabled={isSavingNote}
                                                            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white ${isSavingNote
                                                                ? 'bg-blue-300'
                                                                : 'bg-blue-600 hover:bg-blue-700'
                                                                }`}
                                                        >
                                                            {isSavingNote ? 'Saving...' : 'Save Note'}
                                                        </button>
                                                        {noteSaved && !noteError && (
                                                            <span className="text-[11px] text-emerald-600">Saved</span>
                                                        )}
                                                    </div>
                                                    {noteError && (
                                                        <p className="mt-1 text-[11px] text-rose-600">{noteError}</p>
                                                    )}
                                                </div>

                                                {/* Options (for MCQ) with Masked Review Mode */}
                                                {question.question_type === 'MCQ' && question.options && (
                                                    <div>
                                                        <h4 className="mb-2 text-sm font-medium text-slate-500">Options</h4>
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
                                                                        <span className="flex-1 text-sm text-slate-700">
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
                                                                                <span className="text-xs text-slate-500 w-8">{peerPercent}%</span>
                                                                            </div>
                                                                        )}

                                                                        {/* Labels */}
                                                                        {isRevealed && isCorrectAnswer && (
                                                                            <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                                                                Correct
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
                                                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Correct Answer</h4>
                                                                    <MathText
                                                                        text={question.correct_answer}
                                                                        className="text-lg font-bold text-green-600 [&_p]:my-0"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Your Answer</h4>
                                                                    <MathText
                                                                        text={response?.answer || '(Not answered)'}
                                                                        className={`text-lg font-bold ${isCorrect === true ? 'text-green-600' : isCorrect === false ? 'text-red-600' : 'text-gray-500'} [&_p]:my-0`}
                                                                    />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div>
                                                                <h4 className="text-sm font-medium text-slate-500 mb-1">Your Answer</h4>
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
                                                            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                                                        >
                                                            Check Answer and Show Solutions
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Solutions - only after reveal */}
                                                {(() => {
                                                    const normalizedTextbookSolution = normalizeSolutionText(question.solution_text);
                                                    const normalizedToppersApproach = normalizeSolutionText(question.toppers_approach);
                                                    const hasDistinctToppersApproach =
                                                        normalizedToppersApproach.length > 0 &&
                                                        normalizedToppersApproach !== normalizedTextbookSolution;

                                                    if (!isRevealed || (!question.solution_text && !hasDistinctToppersApproach)) {
                                                        return null;
                                                    }

                                                    return (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-sm font-medium text-slate-500">Solutions</h4>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSolution(question.id)}
                                                                    className="text-sm text-[#2563EB] hover:underline"
                                                                    aria-expanded={isSolutionVisible}
                                                                >
                                                                    {isSolutionVisible ? 'Hide Solutions' : 'View Solutions'}
                                                                </button>
                                                            </div>
                                                            <div
                                                                className={`transition-all duration-200 ${isSolutionVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                                            >
                                                                <div className="space-y-3">
                                                                    {question.solution_text && (
                                                                        <div className="rounded-lg bg-blue-50 p-4">
                                                                            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                                                Textbook Solution
                                                                            </h5>
                                                                            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                                                                                <MathText text={question.solution_text} />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {hasDistinctToppersApproach && (
                                                                        <div className="rounded-lg bg-amber-50 p-4">
                                                                            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                                                                Toppers Approach
                                                                            </h5>
                                                                            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                                                                                <MathText text={question.toppers_approach} />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Topic Navigator */}
                    <aside className="lg:col-span-1">
                        <div className="space-y-3 lg:sticky lg:top-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
                                <h3 className="text-sm font-semibold text-slate-800 mb-3">Topics</h3>
                                <button
                                    type="button"
                                    onClick={() => setActiveTopic('all')}
                                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${activeTopic === 'all'
                                        ? 'bg-[#EFF6FF] text-[#2563EB]'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    All Topics ({baseFilteredQuestions.length})
                                </button>
                                <div className="mt-2 space-y-1">
                                    {topics.length === 0 ? (
                                        <div className="text-xs text-slate-400">No topics available.</div>
                                    ) : (
                                        topics.map((topic) => (
                                            <button
                                                key={topic.name}
                                                type="button"
                                                onClick={() => setActiveTopic(topic.name)}
                                                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${activeTopic === topic.name
                                                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                                                    : 'text-slate-600 hover:bg-slate-50'
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
