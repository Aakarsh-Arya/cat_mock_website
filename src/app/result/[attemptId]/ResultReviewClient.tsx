/**
 * @fileoverview Exam-style review client for results page
 * @description Uses QuestionRenderer to mirror the exam UI in read-only review mode
 */

'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
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

interface ReviewNavState {
    section: SectionName;
    setIndex: number;
    questionIndex: number;
}

function resolveInitialReviewNav(storageKey: string, availableSections: SectionName[]): ReviewNavState {
    const fallbackSection = availableSections[0] ?? 'VARC';
    const isAvailableSection = (value: SectionName | undefined): value is SectionName =>
        Boolean(value) && availableSections.includes(value as SectionName);

    if (typeof window === 'undefined') {
        return { section: fallbackSection, setIndex: 0, questionIndex: 0 };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlSection = parseSection(urlParams.get('section'));
    const urlSetIndex = Number(urlParams.get('set'));
    const urlQIndex = Number(urlParams.get('q'));

    if (isAvailableSection(urlSection)) {
        return {
            section: urlSection,
            setIndex: Number.isFinite(urlSetIndex) && urlSetIndex >= 0 ? urlSetIndex : 0,
            questionIndex: Number.isFinite(urlQIndex) && urlQIndex >= 0 ? urlQIndex : 0,
        };
    }

    const storedRaw = window.localStorage.getItem(storageKey);
    if (storedRaw) {
        try {
            const stored = JSON.parse(storedRaw) as ReviewNavState;
            if (stored.section && isAvailableSection(stored.section)) {
                return {
                    section: stored.section,
                    setIndex: Number.isFinite(stored.setIndex) && stored.setIndex >= 0 ? stored.setIndex : 0,
                    questionIndex: Number.isFinite(stored.questionIndex) && stored.questionIndex >= 0 ? stored.questionIndex : 0,
                };
            }
        } catch {
            window.localStorage.removeItem(storageKey);
        }
    }

    return { section: fallbackSection, setIndex: 0, questionIndex: 0 };
}

interface ResultReviewClientProps {
    paperTitle: string;
    questionSets: QuestionSetComplete[];
    answerMap: Record<string, string | null>;
    correctAnswerMap: Record<string, string>;
    solutionMap?: Record<string, {
        solution_text?: string | null;
        toppers_approach?: string | null;
        solution_image_url?: string | null;
        video_solution_url?: string | null;
    }>;
    responseMetaMap?: Record<string, {
        time_spent_seconds?: number | null;
        visit_count?: number | null;
        updated_at?: string | null;
    }>;
    responseStatusMap?: Record<string, string | null | undefined>;
    responseNoteMap?: Record<string, string | null | undefined>;
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
    responseNoteMap = {},
    attemptId,
}: ResultReviewClientProps) {
    const assembled = useMemo(() => assemblePaper(questionSets), [questionSets]);
    const availableSections = useMemo<SectionName[]>(() => {
        const present = new Set<SectionName>(assembled.questionSets.map((set) => set.section));
        const ordered = SECTION_ORDER.filter((section) => present.has(section));
        return ordered.length > 0 ? ordered : ['VARC'];
    }, [assembled.questionSets]);
    const [isExpanded, setIsExpanded] = useState(false);
    const storageKey = `attempt:${attemptId ?? 'unknown'}:reviewNav`;
    const [isNavHydrated, setIsNavHydrated] = useState(false);

    const analysisStore = getAnalysisStore(attemptId ?? 'result-review');
    const analysisReasons = analysisStore((s) => s.reasons);
    const setAnalysisReason = analysisStore((s) => s.setReason);

    const [navState, setNavState] = useState<ReviewNavState>(() => resolveInitialReviewNav(storageKey, availableSections));
    const [noteByQuestion, setNoteByQuestion] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            Object.entries(responseNoteMap).map(([questionId, note]) => [
                questionId,
                clampNoteWords(typeof note === 'string' ? note : ''),
            ])
        )
    );
    const [savingNoteQuestionId, setSavingNoteQuestionId] = useState<string | null>(null);
    const [noteSaveError, setNoteSaveError] = useState<string | null>(null);
    const [lastSavedNoteQuestionId, setLastSavedNoteQuestionId] = useState<string | null>(null);
    const [expandedNoteByQuestion, setExpandedNoteByQuestion] = useState<Record<string, boolean>>({});
    const [noteLimitReachedByQuestion, setNoteLimitReachedByQuestion] = useState<Record<string, boolean>>({});

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
        if (!availableSections.includes(section)) return;
        updateNavState({ section, setIndex: 0, questionIndex: 0 });
    }, [availableSections, updateNavState]);

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

    const formatVisitCount = (visitCount?: number | null) => {
        if (visitCount == null || !Number.isFinite(visitCount)) return '--';
        return String(Math.max(0, Math.floor(visitCount)));
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
    const currentQuestionId = currentQuestion?.id ?? null;
    const currentNote = currentQuestionId ? (noteByQuestion[currentQuestionId] ?? '') : '';
    const currentNoteWordCount = getWordCount(currentNote);
    const isCurrentNoteExpanded = currentQuestionId ? Boolean(expandedNoteByQuestion[currentQuestionId]) : false;
    const currentNoteLimitReached = currentQuestionId ? Boolean(noteLimitReachedByQuestion[currentQuestionId]) : false;

    const handleCurrentNoteChange = useCallback((nextValue: string) => {
        if (!currentQuestionId) return;
        setNoteSaveError(null);
        setLastSavedNoteQuestionId(null);
        setNoteLimitReachedByQuestion((prev) => ({ ...prev, [currentQuestionId]: hasExceededWordLimit(nextValue) }));
        const clamped = clampNoteWords(nextValue);
        setNoteByQuestion((prev) => ({ ...prev, [currentQuestionId]: clamped }));
    }, [currentQuestionId]);

    const toggleCurrentNoteExpansion = useCallback(() => {
        if (!currentQuestionId) return;
        setExpandedNoteByQuestion((prev) => ({
            ...prev,
            [currentQuestionId]: !prev[currentQuestionId],
        }));
    }, [currentQuestionId]);

    const handleSaveCurrentNote = useCallback(async () => {
        if (!attemptId || !currentQuestionId) return;
        setSavingNoteQuestionId(currentQuestionId);
        setNoteSaveError(null);
        setLastSavedNoteQuestionId(null);
        const sanitizedNote = clampNoteWords(noteByQuestion[currentQuestionId] ?? '');
        try {
            const response = await fetch('/api/result-note', {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attemptId,
                    questionId: currentQuestionId,
                    userNote: sanitizedNote,
                }),
            });

            const payload = (await response.json().catch(() => null)) as
                | { data?: { userNote?: unknown }; error?: unknown }
                | null;
            if (!response.ok) {
                setNoteSaveError(typeof payload?.error === 'string' ? payload.error : 'Failed to save note');
                return;
            }

            const savedNote = clampNoteWords(typeof payload?.data?.userNote === 'string' ? payload.data.userNote : '');
            setNoteByQuestion((prev) => ({ ...prev, [currentQuestionId]: savedNote }));
            setNoteLimitReachedByQuestion((prev) => ({ ...prev, [currentQuestionId]: false }));
            setLastSavedNoteQuestionId(currentQuestionId);
        } catch {
            setNoteSaveError('Failed to save note');
        } finally {
            setSavingNoteQuestionId(null);
        }
    }, [attemptId, currentQuestionId, noteByQuestion]);

    useEffect(() => {
        setNoteByQuestion(
            Object.fromEntries(
                Object.entries(responseNoteMap).map(([questionId, note]) => [
                    questionId,
                    clampNoteWords(typeof note === 'string' ? note : ''),
                ])
            )
        );
        setNoteLimitReachedByQuestion({});
    }, [responseNoteMap]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const resolveNavigation = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlSection = parseSection(urlParams.get('section'));
            const urlSetIndex = urlParams.get('set') ? Number(urlParams.get('set')) : undefined;
            const urlQIndex = urlParams.get('q') ? Number(urlParams.get('q')) : undefined;
            const urlQid = urlParams.get('qid');
            const fallbackSection = availableSections[0] ?? 'VARC';

            if (urlQid) {
                const pos = questionPositionMapGlobal.get(urlQid);
                if (pos) {
                    setNavState({
                        section: pos.section,
                        setIndex: pos.setIndex,
                        questionIndex: pos.questionIndex,
                    });
                    setIsNavHydrated(true);
                    return;
                }
            }

            if (urlSection !== undefined && availableSections.includes(urlSection)) {
                setNavState({
                    section: urlSection,
                    setIndex: Number.isFinite(urlSetIndex) && urlSetIndex! >= 0 ? urlSetIndex! : 0,
                    questionIndex: Number.isFinite(urlQIndex) && urlQIndex! >= 0 ? urlQIndex! : 0,
                });
                setIsNavHydrated(true);
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
                            setIsNavHydrated(true);
                            return;
                        }
                    }

                    if (stored.section && availableSections.includes(stored.section)) {
                        setNavState({
                            section: stored.section,
                            setIndex: Number.isFinite(stored.setIndex) && stored.setIndex >= 0 ? stored.setIndex : 0,
                            questionIndex: Number.isFinite(stored.questionIndex) && stored.questionIndex >= 0 ? stored.questionIndex : 0,
                        });
                        setIsNavHydrated(true);
                        return;
                    }
                } catch {
                    window.localStorage.removeItem(storageKey);
                }
            }

            setNavState({ section: fallbackSection, setIndex: 0, questionIndex: 0 });
            setIsNavHydrated(true);
        };

        resolveNavigation();

        const handlePopState = () => resolveNavigation();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [availableSections, questionPositionMapGlobal, storageKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!isNavHydrated) return;

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
    }, [isNavHydrated, navState, storageKey, currentSet]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia('(min-width: 1024px)').matches) {
            setIsExpanded(true);
        }
    }, []);

    useEffect(() => {
        const fallbackSection = availableSections[0] ?? 'VARC';
        if (!availableSections.includes(navState.section)) {
            setNavState({ section: fallbackSection, setIndex: 0, questionIndex: 0 });
        }
    }, [availableSections, navState.section]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
        if (isExpanded && isDesktop) {
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
            className={`bg-exam-bg-page border border-exam-bg-border-light overflow-hidden font-exam flex flex-col min-h-[560px] ${isExpanded ? 'fixed inset-0 z-[80] h-[100dvh] rounded-none shadow-2xl' : 'h-auto rounded-2xl md:h-[calc(100vh-220px)]'}`}
        >
            <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-exam-header-from to-exam-header-to px-3 py-2 text-white sm:px-4">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        Review Mode
                    </span>
                    <h2 className="truncate text-sm font-semibold sm:text-base">{paperTitle}</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80">
                    <span className="hidden sm:inline">Exam-style Review</span>
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className="touch-target hidden rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/10 sm:inline-flex sm:items-center"
                    >
                        {isExpanded ? 'Exit Fullscreen' : 'Expand'}
                    </button>
                </div>
            </header>

            <div className="mobile-table-scroll border-b border-exam-bg-border bg-white">
                <div className="flex min-w-max">
                    {availableSections.map((section) => {
                        const isActive = navState.section === section;
                        const label = section === 'DILR' ? 'LRDI' : section === 'QA' ? 'Quant' : section;
                        return (
                            <button
                                key={section}
                                type="button"
                                onClick={() => handleSectionChange(section)}
                                className={`touch-target whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors sm:px-6 ${isActive
                                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                            >
                                {label} ({sectionCounts[section]})
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className={`h-full grid ${hasContextPane ? 'grid-cols-1 lg:grid-cols-[48%_33%_19%]' : 'grid-cols-1 lg:grid-cols-[81%_19%]'}`}>
                    <div className={`min-h-0 overflow-hidden ${hasContextPane ? 'col-span-1 lg:col-span-2 lg:grid lg:grid-cols-2' : 'col-span-1'}`}>
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

                    <aside className="min-h-0 overflow-y-auto border-t border-exam-bg-border bg-slate-50 lg:border-l lg:border-t-0">
                        <div className="p-3 sm:p-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Attempt Order</h3>
                            <div className="grid grid-cols-6 gap-2 sm:grid-cols-7 lg:grid-cols-5">
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
                                            className={`touch-target h-11 w-11 rounded text-sm font-medium transition-colors ${isActive
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

                            <div className="mt-5 rounded border border-gray-200 bg-white p-3 text-xs text-gray-600 space-y-2">
                                <div className="font-semibold text-gray-700">Question Metadata</div>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <div>
                                        <span className="text-gray-400 block">Time Spent</span>
                                        <span className="font-semibold text-gray-800">{formatDuration(currentResponseMeta?.time_spent_seconds)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Visit Count</span>
                                        <span className="font-semibold text-gray-800">{formatVisitCount(currentResponseMeta?.visit_count)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Status</span>
                                        <span className="font-semibold text-gray-800">{currentStatus}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Topic</span>
                                        <span className="font-semibold text-gray-800">{currentQuestion?.topic ?? '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Subtopic</span>
                                        <span className="font-semibold text-gray-800">{currentQuestion?.subtopic ?? '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Difficulty</span>
                                        <span className="font-semibold text-gray-800">{currentQuestion?.difficulty ?? '-'}</span>
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
                                                        className={`touch-target rounded-full border px-2.5 py-1 text-[11px] transition-colors ${isActive
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
                                {currentQuestion && (
                                    <div className="mt-2 rounded-md border border-blue-100 bg-blue-50/70 p-2">
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-blue-700">
                                            <span>Add Notes</span>
                                            <div className="flex items-center gap-2">
                                                {currentNoteWordCount > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={toggleCurrentNoteExpansion}
                                                        className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                                                        aria-expanded={isCurrentNoteExpanded}
                                                    >
                                                        {isCurrentNoteExpanded ? 'Collapse note' : 'Expand note'}
                                                    </button>
                                                )}
                                                <span className="text-[10px] text-blue-600">{currentNoteWordCount}/{MAX_NOTE_WORDS} words</span>
                                            </div>
                                        </div>
                                        <textarea
                                            value={currentNote}
                                            onChange={(event) => handleCurrentNoteChange(event.target.value)}
                                            placeholder="Add your personal note for this question..."
                                            rows={isCurrentNoteExpanded ? 8 : 4}
                                            className={`mt-2 w-full rounded-md border border-blue-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-400 ${isCurrentNoteExpanded ? 'min-h-40' : 'min-h-20'}`}
                                        />
                                        {currentNoteLimitReached && (
                                            <p className="mt-1 text-[11px] text-amber-700">
                                                50-word limit reached. Extra words were removed.
                                            </p>
                                        )}
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={handleSaveCurrentNote}
                                                disabled={savingNoteQuestionId === currentQuestion.id}
                                                className={`touch-target rounded-md px-3 py-1.5 text-[11px] font-semibold text-white ${savingNoteQuestionId === currentQuestion.id
                                                    ? 'bg-blue-300'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                    }`}
                                            >
                                                {savingNoteQuestionId === currentQuestion.id ? 'Saving...' : 'Save Note'}
                                            </button>
                                            {lastSavedNoteQuestionId === currentQuestion.id && !noteSaveError && (
                                                <span className="text-[11px] text-emerald-600">Saved</span>
                                            )}
                                        </div>
                                        {noteSaveError && (
                                            <p className="mt-1 text-[11px] text-rose-600">{noteSaveError}</p>
                                        )}
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
