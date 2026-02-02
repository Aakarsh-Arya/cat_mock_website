/**
 * @fileoverview Exam-style review client for results page
 * @description Uses QuestionRenderer to mirror the exam UI in read-only review mode
 */

'use client';

import { useMemo, useCallback, useState } from 'react';
import type { QuestionSetComplete, SectionName } from '@/types/exam';
import { assemblePaper } from '@/features/exam-engine/lib/assemblePaper';
import { QuestionRenderer } from '@/features/exam-engine/ui/QuestionRenderer';

const SECTION_ORDER: SectionName[] = ['VARC', 'DILR', 'QA'];

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
}: ResultReviewClientProps) {
    const assembled = useMemo(() => assemblePaper(questionSets), [questionSets]);

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

    const currentSet = sectionSets[navState.setIndex];

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

    const handlePaletteSelect = useCallback((setIndex: number, questionIndex: number) => {
        updateNavState({ setIndex, questionIndex });
    }, [updateNavState]);

    const sectionDisplay = navState.section === 'DILR' ? 'LRDI' : navState.section === 'QA' ? 'Quant' : navState.section;

    return (
        <section id="exam-review" className="bg-exam-bg-page rounded-2xl border border-exam-bg-border-light overflow-hidden font-exam">
            <header className="h-14 flex items-center justify-between px-6 bg-gradient-to-r from-exam-header-from to-exam-header-to text-white">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        Review Mode
                    </span>
                    <h2 className="text-base font-semibold">{paperTitle}</h2>
                </div>
                <div className="text-xs text-white/80">Exam-style Review</div>
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

            <div className="flex min-h-[520px]">
                <div className="flex-1 grid grid-cols-2 overflow-hidden">
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
                        />
                    ) : (
                        <div className="col-span-2 flex items-center justify-center text-gray-500">
                            No questions in this section.
                        </div>
                    )}
                </div>

                <aside className="w-72 border-l border-exam-bg-border bg-slate-50 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Question Navigator</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {sectionSets.flatMap((set, setIdx) =>
                                set.questions.map((q, qIdx) => {
                                    const isActive = setIdx === navState.setIndex && qIdx === navState.questionIndex;
                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => handlePaletteSelect(setIdx, qIdx)}
                                            className={`w-10 h-10 rounded text-sm font-medium transition-colors ${isActive
                                                ? 'bg-blue-600 text-white ring-2 ring-offset-1 ring-blue-400'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {q.question_number}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-6 p-3 bg-white rounded border border-gray-200 text-xs text-gray-600">
                            <div className="font-semibold text-gray-700 mb-1">{sectionDisplay} Summary</div>
                            <p>{sectionSets.length} sets - {sectionCounts[navState.section]} questions</p>
                            <p className="mt-1">Click a number to jump to that question.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
