/**
 * @fileoverview Admin Paper Preview Client
 * @description Client component for previewing exam as a student would see it
 */

'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Paper, QuestionSetComplete, SectionName, Question } from '@/types/exam';
import { QuestionRenderer } from '@/features/exam-engine/ui/QuestionRenderer';
import { assemblePaper } from '@/features/exam-engine/lib/assemblePaper';

interface PreviewClientProps {
    paper: Paper;
    questionSets: QuestionSetComplete[];
}

// Get questions for a section
function getQuestionsForSection(sets: QuestionSetComplete[], section: SectionName): QuestionSetComplete[] {
    return sets.filter(s => s.section === section).sort((a, b) => a.display_order - b.display_order);
}

// Section order
const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];

const parseSection = (value: string | null): SectionName | undefined => {
    if (!value) return undefined;
    return SECTIONS.includes(value as SectionName) ? (value as SectionName) : undefined;
};

interface PreviewNavState {
    section: SectionName;
    setIndex: number;
    questionIndex: number;
}

const DEFAULT_NAV_STATE: PreviewNavState = {
    section: 'VARC',
    setIndex: 0,
    questionIndex: 0,
};

export function PreviewClient({ paper, questionSets }: PreviewClientProps) {
    const STORAGE_KEY = `paper:${paper.id}:previewNav`;

    const [navState, setNavState] = useState<PreviewNavState>(DEFAULT_NAV_STATE);
    const hasInitializedRef = useRef(false);

    const { section: currentSection, setIndex: currentSetIndex, questionIndex: currentQuestionIndex } = navState;

    const updateNavState = useCallback((updates: Partial<PreviewNavState>) => {
        setNavState(prev => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const resolveNavigation = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlSection = parseSection(urlParams.get('section'));
            const urlSetIndex = urlParams.get('set') ? Number(urlParams.get('set')) : undefined;
            const urlQIndex = urlParams.get('q') ? Number(urlParams.get('q')) : undefined;

            if (urlSection !== undefined) {
                setNavState({
                    section: urlSection,
                    setIndex: Number.isFinite(urlSetIndex) && urlSetIndex! >= 0 ? urlSetIndex! : 0,
                    questionIndex: Number.isFinite(urlQIndex) && urlQIndex! >= 0 ? urlQIndex! : 0,
                });
                hasInitializedRef.current = true;
                return;
            }

            const storedRaw = window.localStorage.getItem(STORAGE_KEY);
            if (storedRaw) {
                try {
                    const stored = JSON.parse(storedRaw) as PreviewNavState;
                    if (stored.section && SECTIONS.includes(stored.section)) {
                        setNavState({
                            section: stored.section,
                            setIndex: Number.isFinite(stored.setIndex) && stored.setIndex >= 0 ? stored.setIndex : 0,
                            questionIndex: Number.isFinite(stored.questionIndex) && stored.questionIndex >= 0 ? stored.questionIndex : 0,
                        });
                        hasInitializedRef.current = true;
                        return;
                    }
                } catch {
                    window.localStorage.removeItem(STORAGE_KEY);
                }
            }

            setNavState(DEFAULT_NAV_STATE);
            hasInitializedRef.current = true;
        };

        resolveNavigation();

        const handlePopState = () => resolveNavigation();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [STORAGE_KEY]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!hasInitializedRef.current) return;

        // Save to localStorage
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(navState));

        // Update URL only if needed to avoid router churn
        const url = new URL(window.location.href);
        const desiredSection = navState.section;
        const desiredSet = String(navState.setIndex);
        const desiredQ = String(navState.questionIndex);

        if (
            url.searchParams.get('section') !== desiredSection ||
            url.searchParams.get('set') !== desiredSet ||
            url.searchParams.get('q') !== desiredQ
        ) {
            url.searchParams.set('section', desiredSection);
            url.searchParams.set('set', desiredSet);
            url.searchParams.set('q', desiredQ);
            window.history.replaceState({}, '', url.toString());
        }
    }, [STORAGE_KEY, navState]);

    const assembled = useMemo(() => assemblePaper(questionSets), [questionSets]);
    const assembledSets = assembled.questionSets;

    // Get sets for current section
    const sectionSets = useMemo(
        () => getQuestionsForSection(assembledSets, currentSection),
        [assembledSets, currentSection]
    );

    // Current set
    const currentSet = sectionSets[currentSetIndex];

    // All questions for counting
    const allQuestions = assembled.questions;

    // Section counts
    const sectionCounts = useMemo(() => {
        const counts: Record<SectionName, number> = { VARC: 0, DILR: 0, QA: 0 };
        assembledSets.forEach(set => {
            counts[set.section] += set.questions.length;
        });
        return counts;
    }, [assembledSets]);

    // Handle section change
    const handleSectionChange = useCallback((section: SectionName) => {
        updateNavState({ section, setIndex: 0, questionIndex: 0 });
    }, [updateNavState]);

    // Handle navigation within section
    const handleNextQuestion = useCallback(() => {
        if (!currentSet) return;

        if (currentQuestionIndex < currentSet.questions.length - 1) {
            // Next question in same set
            updateNavState({ questionIndex: currentQuestionIndex + 1 });
        } else if (currentSetIndex < sectionSets.length - 1) {
            // Next set
            updateNavState({ setIndex: currentSetIndex + 1, questionIndex: 0 });
        }
    }, [currentSet, currentQuestionIndex, currentSetIndex, sectionSets.length, updateNavState]);

    const handlePrevQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            // Previous question in same set
            updateNavState({ questionIndex: currentQuestionIndex - 1 });
        } else if (currentSetIndex > 0) {
            // Previous set
            const prevSet = sectionSets[currentSetIndex - 1];
            updateNavState({ setIndex: currentSetIndex - 1, questionIndex: prevSet.questions.length - 1 });
        }
    }, [currentQuestionIndex, currentSetIndex, sectionSets, updateNavState]);

    // Calculate global question number
    const globalQuestionNumber = useMemo(() => {
        let count = 0;
        for (let i = 0; i < currentSetIndex; i++) {
            count += sectionSets[i].questions.length;
        }
        return count + currentQuestionIndex + 1;
    }, [currentSetIndex, currentQuestionIndex, sectionSets]);

    const totalSectionQuestions = sectionCounts[currentSection];

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        const seen = new Set<string>();
        const duplicates = new Set<string>();
        allQuestions.forEach((q: Question) => {
            if (seen.has(q.id)) {
                duplicates.add(q.id);
            } else {
                seen.add(q.id);
            }
        });

        if (duplicates.size > 0) {
            console.warn('[Preview] Detected duplicate question ids in assembled question list', {
                duplicateIds: Array.from(duplicates),
                totalQuestions: allQuestions.length,
            });
        }
    }, [allQuestions]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        if (!currentSet && (currentSetIndex !== 0 || currentQuestionIndex !== 0)) {
            console.warn('[Preview] Navigation state invalid (section/q/set mismatch)', {
                section: currentSection,
                setIndex: currentSetIndex,
                questionIndex: currentQuestionIndex,
                sectionSetCount: sectionSets.length,
            });
            return;
        }

        if (currentSet && currentQuestionIndex >= currentSet.questions.length) {
            console.warn('[Preview] Navigation state invalid (section/q/set mismatch)', {
                section: currentSection,
                setIndex: currentSetIndex,
                questionIndex: currentQuestionIndex,
                questionsInSet: currentSet.questions.length,
            });
        }
    }, [currentSection, currentSet, currentSetIndex, currentQuestionIndex, sectionSets.length]);

    return (
        <div className="min-h-screen bg-exam-bg-page flex flex-col">
            {/* Preview Header Banner */}
            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center font-semibold flex items-center justify-center gap-4">
                <span>🔍 ADMIN PREVIEW MODE - This is how students will see the exam</span>
                <Link
                    href={`/admin/papers/${paper.id}/edit`}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                    Back to Editor
                </Link>
                <Link
                    href="/admin/papers"
                    className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 transition-colors"
                >
                    All Papers
                </Link>
            </div>

            {/* Exam Header */}
            <header className="h-12 bg-gradient-to-r from-exam-header-from to-exam-header-to flex items-center justify-between px-4 text-white shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-semibold">{paper.title}</h1>
                    <span className="text-xs opacity-80">
                        (Preview - {allQuestions.length} questions)
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="opacity-80">Duration: {paper.duration_minutes} mins</span>
                    <span className="opacity-80">|</span>
                    <span className="opacity-80">Total Marks: {paper.total_marks}</span>
                </div>
            </header>

            {/* Section Tabs */}
            <div className="bg-white border-b border-exam-bg-border flex">
                {SECTIONS.map((section) => (
                    <button
                        key={section}
                        onClick={() => handleSectionChange(section)}
                        className={`
                            px-6 py-3 text-sm font-medium transition-colors border-b-2
                            ${currentSection === section
                                ? 'border-blue-600 text-blue-600 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }
                        `}
                    >
                        {section} ({sectionCounts[section]})
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 grid grid-cols-2 overflow-hidden">
                    {currentSet ? (
                        <QuestionRenderer
                            questionSet={currentSet}
                            activeQuestionIndex={currentQuestionIndex}
                            onQuestionChange={(qIdx) => updateNavState({ questionIndex: qIdx })}
                            responses={{}}
                            onAnswerChange={() => { }}
                            isReviewMode={true}
                        />
                    ) : (
                        <div className="col-span-2 flex items-center justify-center text-gray-500">
                            No questions in this section
                        </div>
                    )}
                </div>

                {/* Question Navigator Sidebar */}
                <aside className="w-72 border-l border-exam-bg-border bg-slate-50 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Question Navigator</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {sectionSets.flatMap((set, setIdx) =>
                                set.questions.map((q, qIdx) => {
                                    const isActive = setIdx === currentSetIndex && qIdx === currentQuestionIndex;
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                updateNavState({ setIndex: setIdx, questionIndex: qIdx });
                                            }}
                                            className={`
                                                w-10 h-10 rounded text-sm font-medium transition-colors
                                                ${isActive
                                                    ? 'bg-blue-600 text-white ring-2 ring-offset-1 ring-blue-400'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }
                                            `}
                                        >
                                            {q.question_number}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Set Info */}
                        {currentSet && (
                            <div className="mt-6 p-3 bg-white rounded border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Set</h4>
                                <p className="text-sm text-gray-700">
                                    Type: <span className="font-medium">{currentSet.set_type}</span>
                                </p>
                                <p className="text-sm text-gray-700">
                                    Questions: <span className="font-medium">{currentSet.questions.length}</span>
                                </p>
                                {currentSet.context_title && (
                                    <p className="text-sm text-gray-700 truncate">
                                        Title: <span className="font-medium">{currentSet.context_title}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Footer Navigation */}
            <footer className="h-16 bg-white border-t border-exam-bg-border flex items-center justify-between px-6">
                <button
                    onClick={handlePrevQuestion}
                    disabled={currentSetIndex === 0 && currentQuestionIndex === 0}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    ← Previous
                </button>

                <div className="text-sm text-gray-600">
                    Question {globalQuestionNumber} of {totalSectionQuestions} in {currentSection}
                </div>

                <button
                    onClick={handleNextQuestion}
                    disabled={
                        currentSetIndex === sectionSets.length - 1 &&
                        currentSet && currentQuestionIndex === currentSet.questions.length - 1
                    }
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next →
                </button>
            </footer>
        </div>
    );
}
