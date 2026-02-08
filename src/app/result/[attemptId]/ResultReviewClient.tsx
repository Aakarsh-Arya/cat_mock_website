/**
 * @fileoverview Exam-style review client for results page
 * @description Uses QuestionRenderer to mirror the exam UI in read-only review mode
 */

'use client';

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import type { QuestionSetComplete, SectionName, PerformanceReason } from '@/types/exam';
import { assemblePaper } from '@/features/exam-engine/lib/assemblePaper';
import { QuestionRenderer } from '@/features/exam-engine/ui/QuestionRenderer';
import { isCompositeSet } from '@/types/exam';
import { getAnalysisStore } from '@/features/exam-engine/model/useExamStore';
import { compareAnswers } from '@/features/exam-engine/lib/scoring';

const SECTION_ORDER: SectionName[] = ['VARC', 'DILR', 'QA'];

const parseSection = (value: string | null): SectionName | undefined => {
    if (!value) return undefined;
    return SECTION_ORDER.includes(value as SectionName) ? (value as SectionName) : undefined;
};

const REASON_OPTIONS: Array<{ value: PerformanceReason; label: string }> = [
    { value: 'concept_gap', label: 'Concept gap' },
    { value: 'careless_error', label: 'Silly mistake' },
    { value: 'time_pressure', label: 'Time pressure' },
    { value: 'guess', label: 'Guess/unsure' },
];

interface ReviewNavState {
    section: SectionName;
    setIndex: number;
    questionIndex: number;
}

interface ResultReviewClientProps {
    paperTitle: string;
    questionSets: QuestionSetComplete[];
    answerMap: Record<string, string | null>;
    correctAnswerMap: Record<string, string>;
    solutionMap?: Record<string, {
        solution_text?: string | null;
        solution_image_url?: string | null;
        video_solution_url?: string | null;
    }>;
    responseMetaMap?: Record<string, {
        time_spent_seconds?: number | null;
        visit_count?: number | null;
        updated_at?: string | null;
    }>;
    responseStatusMap?: Record<string, string | null | undefined>;
    attemptId?: string | null;
}

function getSectionSets(sets: QuestionSetComplete[], section: SectionName): QuestionSetComplete[] {
    return sets.filter((set) => set.section === section).sort((a, b) => {
        const orderA = a.display_order ?? 0;
        const orderB = b.display_order ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return a.id.localeCompare(b.id);
    });
}

export function ResultReviewClient({
    paperTitle,
    questionSets,
    answerMap,
    correctAnswerMap,
    solutionMap,
    responseMetaMap = {},
    responseStatusMap = {},
    attemptId,
}: ResultReviewClientProps) {
    const assembled = useMemo(() => assemblePaper(questionSets), [questionSets]);
    // Default to expanded/fullscreen for better editing experience
    const [isExpanded, setIsExpanded] = useState(true);
    const hasInitializedRef = useRef(false);
    const storageKey = `attempt:${attemptId ?? 'unknown'}:reviewNav`;

    const analysisStore = getAnalysisStore(attemptId ?? 'result-review');
    const analysisReasons = analysisStore((s) => s.reasons);
    const bookmarkedQuestions = analysisStore((s) => s.bookmarks);
    const setAnalysisReason = analysisStore((s) => s.setReason);
    const toggleBookmark = analysisStore((s) => s.toggleBookmark);

    const [navState, setNavState] = useState<ReviewNavState>({
        section: 'VARC',
        setIndex: 0,
        questionIndex: 0,
    });

    const updateNavState = useCallback((updates: Partial<ReviewNavState>) => {
        setNavState((prev) => ({ ...prev, ...updates }));
    }, []);

    const sectionSets = useMemo(
        () => getSectionSets(assembled.questionSets, navState.section),
        [assembled.questionSets, navState.section]
    );

    const questionPositionMapGlobal = useMemo(() => {
        const map = new Map<string, { section: SectionName; setIndex: number; questionIndex: number }>();
        SECTION_ORDER.forEach((section) => {
            const sets = getSectionSets(assembled.questionSets, section);
            sets.forEach((set, setIdx) => {
                set.questions.forEach((q, qIdx) => {
                    map.set(q.id, { section, setIndex: setIdx, questionIndex: qIdx });
                });
            });
        });
        return map;
    }, [assembled.questionSets]);

    const currentSet = sectionSets[navState.setIndex];

    const hasContextPane = useMemo(() => {
        if (!currentSet) return false;
        const isComposite = isCompositeSet(currentSet.set_type);
        if (!isComposite) return false;
        const hasMedia = Boolean(
            currentSet.context_image_url ||
            (currentSet.context_additional_images && currentSet.context_additional_images.length > 0)
        );
        const isSingleQuestionSet = currentSet.questions.length === 1;
        return !(isSingleQuestionSet && !hasMedia);
    }, [currentSet]);

    const sectionCounts = useMemo(() => {
        const counts: Record<SectionName, number> = { VARC: 0, DILR: 0, QA: 0 };
        assembled.questionSets.forEach((set) => {
            counts[set.section] += set.questions.length;
        });
        return counts;
    }, [assembled.questionSets]);

    const handleSectionChange = useCallback((section: SectionName) => {
        updateNavState({ section, setIndex: 0, questionIndex: 0 });
    }, [updateNavState]);

    const handleQuestionChange = useCallback((index: number) => {
        updateNavState({ questionIndex: index });
    }, [updateNavState]);

    const sectionDisplay = navState.section === 'DILR' ? 'LRDI' : navState.section === 'QA' ? 'Quant' : navState.section;

    const formatDuration = (seconds?: number | null) => {
        const totalSeconds = Math.max(0, Math.floor(seconds ?? 0));
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const questionPositionMap = useMemo(() => {
        const map = new Map<string, { setIndex: number; questionIndex: number }>();
        sectionSets.forEach((set, setIdx) => {
            set.questions.forEach((q, qIdx) => {
                map.set(q.id, { setIndex: setIdx, questionIndex: qIdx });
            });
        });
        return map;
    }, [sectionSets]);

    const handlePaletteSelect = useCallback((questionId: string) => {
        const pos = questionPositionMap.get(questionId);
        if (!pos) return;
        updateNavState({ setIndex: pos.setIndex, questionIndex: pos.questionIndex });
    }, [questionPositionMap, updateNavState]);

    const questionById = useMemo(() => {
        const map = new Map<string, (typeof sectionSets)[number]['questions'][number]>();
        sectionSets.forEach((set) => {
            set.questions.forEach((q) => {
                map.set(q.id, q);
            });
        });
        return map;
    }, [sectionSets]);

    const attemptOrderIds = useMemo(() => {
        const questionsInSection = sectionSets.flatMap((set) => set.questions);
        const withTimestamp = questionsInSection
            .filter((q) => responseMetaMap[q.id]?.updated_at)
            .sort((a, b) => {
                const aTime = new Date(responseMetaMap[a.id]?.updated_at as string).getTime();
                const bTime = new Date(responseMetaMap[b.id]?.updated_at as string).getTime();
                if (aTime !== bTime) return aTime - bTime;
                return a.question_number - b.question_number;
            });
        const withoutTimestamp = questionsInSection
            .filter((q) => !responseMetaMap[q.id]?.updated_at)
            .sort((a, b) => a.question_number - b.question_number);
        return withTimestamp.length > 0 ? [...withTimestamp, ...withoutTimestamp].map((q) => q.id) : withoutTimestamp.map((q) => q.id);
    }, [sectionSets, responseMetaMap]);

    const currentQuestion = currentSet?.questions?.[navState.questionIndex];
    const currentResponseMeta = currentQuestion ? responseMetaMap[currentQuestion.id] : undefined;
    const currentAnswer = currentQuestion ? answerMap[currentQuestion.id] : null;
    const currentCorrect = currentQuestion ? correctAnswerMap[currentQuestion.id] : null;
    const currentStatusRaw = currentQuestion ? responseStatusMap[currentQuestion.id] ?? null : null;
    const currentAnsweredStatus = currentStatusRaw === 'answered' || currentStatusRaw === 'answered_marked';
    const hasCurrentAnswer = currentAnsweredStatus || (currentAnswer !== null && currentAnswer !== undefined && String(currentAnswer).trim() !== '');
    const hasCurrentKey = currentCorrect !== null && currentCorrect !== undefined && String(currentCorrect).trim() !== '';
    const currentHasComparableAnswer =
        currentAnswer !== null && currentAnswer !== undefined && String(currentAnswer).trim() !== '';
    const currentIsCorrect =
        currentQuestion && hasCurrentKey && currentHasComparableAnswer
            ? compareAnswers(currentAnswer, String(currentCorrect), currentQuestion.question_type)
            : null;
    const currentStatus = !hasCurrentAnswer
        ? 'Not Attempted'
        : currentIsCorrect === null
            ? 'Attempted'
            : currentIsCorrect
                ? 'Correct'
                : 'Incorrect';
    const currentIsIncorrect = currentIsCorrect === false;
    const currentIsSkipped = !hasCurrentAnswer;
    const selectedReason = currentQuestion ? analysisReasons[currentQuestion.id] ?? null : null;
    const isBookmarked = currentQuestion ? Boolean(bookmarkedQuestions[currentQuestion.id]) : false;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const resolveNavigation = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlSection = parseSection(urlParams.get('section'));
            const urlSetIndex = urlParams.get('set') ? Number(urlParams.get('set')) : undefined;
            const urlQIndex = urlParams.get('q') ? Number(urlParams.get('q')) : undefined;
            const urlQid = urlParams.get('qid');

            if (urlQid) {
                const pos = questionPositionMapGlobal.get(urlQid);
                if (pos) {
                    setNavState({
                        section: pos.section,
                        setIndex: pos.setIndex,
                        questionIndex: pos.questionIndex,
                    });
                    hasInitializedRef.current = true;
                    return;
                }
            }

            if (urlSection !== undefined) {
                setNavState({
                    section: urlSection,
                    setIndex: Number.isFinite(urlSetIndex) && urlSetIndex! >= 0 ? urlSetIndex! : 0,
                    questionIndex: Number.isFinite(urlQIndex) && urlQIndex! >= 0 ? urlQIndex! : 0,
                });
                hasInitializedRef.current = true;
                return;
            }

            const storedRaw = window.localStorage.getItem(storageKey);
            if (storedRaw) {
                try {
                    const stored = JSON.parse(storedRaw) as ReviewNavState & { qid?: string | null };
                    if (stored.qid) {
                        const pos = questionPositionMapGlobal.get(stored.qid);
                        if (pos) {
                            setNavState({
                                section: pos.section,
                                setIndex: pos.setIndex,
                                questionIndex: pos.questionIndex,
                            });
                            hasInitializedRef.current = true;
                            return;
                        }
                    }

                    if (stored.section && SECTION_ORDER.includes(stored.section)) {
                        setNavState({
                            section: stored.section,
                            setIndex: Number.isFinite(stored.setIndex) && stored.setIndex >= 0 ? stored.setIndex : 0,
                            questionIndex: Number.isFinite(stored.questionIndex) && stored.questionIndex >= 0 ? stored.questionIndex : 0,
                        });
                        hasInitializedRef.current = true;
                        return;
                    }
                } catch {
                    window.localStorage.removeItem(storageKey);
                }
            }

            setNavState({ section: 'VARC', setIndex: 0, questionIndex: 0 });
            hasInitializedRef.current = true;
        };

        resolveNavigation();

        const handlePopState = () => resolveNavigation();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [questionPositionMapGlobal, storageKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!hasInitializedRef.current) return;

        const qid = currentSet?.questions?.[navState.questionIndex]?.id ?? null;

        window.localStorage.setItem(
            storageKey,
            JSON.stringify({ ...navState, qid })
        );

        const url = new URL(window.location.href);
        url.searchParams.set('section', navState.section);
        url.searchParams.set('set', String(navState.setIndex));
        url.searchParams.set('q', String(navState.questionIndex));
        if (qid) url.searchParams.set('qid', qid);
        else url.searchParams.delete('qid');

        window.history.replaceState({}, '', url.toString());
    }, [navState, storageKey, currentSet]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isExpanded]);

    return (
        <section
            id="exam-review"
            className={`bg-exam-bg-page border border-exam-bg-border-light overflow-hidden font-exam flex flex-col min-h-[620px] ${isExpanded ? 'fixed inset-0 z-[80] rounded-none h-screen shadow-2xl' : 'rounded-2xl h-[calc(100vh-220px)]'}`}
        >
            <header className="h-14 flex items-center justify-between px-6 bg-gradient-to-r from-exam-header-from to-exam-header-to text-white">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        Review Mode
                    </span>
                    <h2 className="text-base font-semibold">{paperTitle}</h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/80">
                    <span>Exam-style Review</span>
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className="rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/10"
                    >
                        {isExpanded ? 'Exit Fullscreen' : 'Expand'}
                    </button>
                </div>
            </header>

            <div className="bg-white border-b border-exam-bg-border flex">
                {SECTION_ORDER.map((section) => {
                    const isActive = navState.section === section;
                    const label = section === 'DILR' ? 'LRDI' : section === 'QA' ? 'Quant' : section;
                    return (
                        <button
                            key={section}
                            type="button"
                            onClick={() => handleSectionChange(section)}
                            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${isActive
                                ? 'border-blue-600 text-blue-600 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            {label} ({sectionCounts[section]})
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-hidden">
                <div className={`h-full grid ${hasContextPane ? 'grid-cols-[48%_33%_19%]' : 'grid-cols-[81%_19%]'}`}>
                    <div className={`min-h-0 overflow-hidden ${hasContextPane ? 'col-span-2 grid grid-cols-2' : 'col-span-1'}`}>
                        {currentSet ? (
                            <QuestionRenderer
                                questionSet={currentSet}
                                activeQuestionIndex={navState.questionIndex}
                                onQuestionChange={handleQuestionChange}
                                responses={answerMap}
                                isReviewMode={true}
                                readOnly={true}
                                showCorrectAnswer={true}
                                correctAnswerMap={correctAnswerMap}
                                solutionMap={solutionMap}
                            />
                        ) : (
                            <div className="col-span-2 flex items-center justify-center text-gray-500">
                                No questions in this section.
                            </div>
                        )}
                    </div>

                    <aside className="border-l border-exam-bg-border bg-slate-50 overflow-y-auto min-h-0">
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Attempt Order</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {attemptOrderIds.map((questionId, index) => {
                                    const q = questionById.get(questionId);
                                    if (!q) return null;
                                    const isActive = currentQuestion?.id === q.id;
                                    const answer = answerMap[q.id];
                                    const rawStatus = responseStatusMap[q.id] ?? null;
                                    const isAnsweredStatus = rawStatus === 'answered' || rawStatus === 'answered_marked';
                                    const hasAnswer = isAnsweredStatus || (answer !== null && answer !== undefined && String(answer).trim() !== '');
                                    const hasComparableAnswer =
                                        answer !== null && answer !== undefined && String(answer).trim() !== '';
                                    const correctAnswer = correctAnswerMap[q.id] ?? '';
                                    const hasCorrect = typeof correctAnswer === 'string' && correctAnswer.trim() !== '';
                                    const isCorrect =
                                        hasAnswer && hasComparableAnswer && hasCorrect
                                            ? compareAnswers(answer, correctAnswer, q.question_type)
                                            : null;
                                    const statusClass = !hasAnswer
                                        ? 'bg-gray-200 text-gray-700'
                                        : isCorrect === null
                                            ? 'bg-blue-500 text-white'
                                            : isCorrect
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-rose-500 text-white';
                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => handlePaletteSelect(q.id)}
                                            className={`w-10 h-10 rounded text-sm font-medium transition-colors ${isActive
                                                ? `${statusClass} ring-2 ring-offset-1 ring-blue-400`
                                                : `${statusClass} hover:opacity-90`
                                                }`}
                                            title={`Attempt #${index + 1} - ${!hasAnswer
                                                ? 'Not attempted'
                                                : isCorrect === null
                                                    ? 'Attempted'
                                                    : isCorrect
                                                        ? 'Correct'
                                                        : 'Incorrect'
                                                }`}
                                        >
                                            {q.question_number}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-3 bg-white rounded border border-gray-200 text-xs text-gray-600 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-gray-700">Question Metadata</div>
                                    {currentQuestion && (
                                        <button
                                            type="button"
                                            onClick={() => toggleBookmark(currentQuestion.id)}
                                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${isBookmarked
                                                ? 'border-amber-300 bg-amber-50 text-amber-600'
                                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            aria-pressed={isBookmarked}
                                        >
                                            <svg
                                                className="h-3.5 w-3.5"
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
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-400 block">Time Spent</span>
                                        <span className="font-semibold text-gray-800">{formatDuration(currentResponseMeta?.time_spent_seconds)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Status</span>
                                        <span className="font-semibold text-gray-800">{currentStatus}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Topic</span>
                                        <span className="font-semibold text-gray-800">{currentQuestion?.topic ?? '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Subtopic</span>
                                        <span className="font-semibold text-gray-800">{currentQuestion?.subtopic ?? '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Difficulty</span>
                                        <span className="font-semibold text-gray-800">{currentQuestion?.difficulty ?? '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Section</span>
                                        <span className="font-semibold text-gray-800">{sectionDisplay}</span>
                                    </div>
                                </div>
                                {currentQuestion && (currentIsIncorrect || currentIsSkipped) && (
                                    <div className="mt-2 rounded-md border border-amber-100 bg-amber-50/70 p-2">
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700">
                                            <span>Reason for Performance</span>
                                            <span className="uppercase text-[10px] text-amber-600">
                                                {currentIsSkipped ? 'Skipped' : 'Incorrect'}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {REASON_OPTIONS.map((option) => {
                                                const isActive = selectedReason === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => {
                                                            if (!currentQuestion) return;
                                                            setAnalysisReason(currentQuestion.id, isActive ? null : option.value);
                                                        }}
                                                        className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${isActive
                                                            ? 'bg-amber-500 text-white border-amber-500'
                                                            : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-100'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <p className="text-[11px] text-gray-400">Order reflects your attempt sequence.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
