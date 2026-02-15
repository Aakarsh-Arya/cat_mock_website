/**
 * @fileoverview Sectional Performance Component
 * @description Section-wise breakdown of exam performance (VARC, DILR, QA)
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

import { type SectionName, getSectionDisplayLabel } from '@/types/exam';

interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

interface SectionalPerformanceProps {
    sectionScores: Record<string, SectionScore>;
    sections?: SectionName[];
    sectionConfig?: {
        [key: string]: {
            maxMarks: number;
            totalQuestions: number;
        };
    };
}

const SECTION_DISPLAY: Record<SectionName, {
    fullName: string;
    accent: string;
}> = {
    VARC: {
        fullName: 'Verbal Ability and Reading Comprehension',
        accent: '#6366F1',
    },
    DILR: {
        fullName: 'Data Interpretation and Logical Reasoning',
        accent: '#D946EF',
    },
    QA: {
        fullName: 'Quantitative Aptitude',
        accent: '#10B981',
    },
};

const DEFAULT_SECTION_CONFIG: Record<SectionName, { maxMarks: number; totalQuestions: number }> = {
    VARC: { maxMarks: 72, totalQuestions: 24 },
    DILR: { maxMarks: 60, totalQuestions: 20 },
    QA: { maxMarks: 66, totalQuestions: 22 },
};

export function SectionalPerformance({ sectionScores, sections, sectionConfig }: SectionalPerformanceProps) {
    const sectionOrder: SectionName[] =
        Array.isArray(sections) && sections.length > 0
            ? sections
            : ['VARC', 'DILR', 'QA'];
    const config = sectionConfig || DEFAULT_SECTION_CONFIG;

    return (
        <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-[#0F172A]">
                Section-wise Performance
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {sectionOrder.map((sectionName) => {
                    const scores = sectionScores[sectionName];
                    const sectionDisplay = SECTION_DISPLAY[sectionName];
                    const sectionCfg = config[sectionName] || { maxMarks: 0, totalQuestions: 0 };
                    const sectionLabel = getSectionDisplayLabel(sectionName);

                    if (!scores) {
                        return (
                            <div
                                key={sectionName}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]"
                                style={{ borderTopWidth: 4, borderTopColor: sectionDisplay.accent }}
                            >
                                <h3 className="mb-1 text-lg font-bold text-[#0F172A]">{sectionLabel}</h3>
                                <p className="text-xs text-[#64748B]">{sectionDisplay.fullName}</p>
                                <p className="mt-4 text-sm text-[#64748B]">No data available</p>
                            </div>
                        );
                    }

                    const totalAttempted = scores.correct + scores.incorrect;
                    const accuracy = totalAttempted > 0
                        ? ((scores.correct / totalAttempted) * 100).toFixed(1)
                        : '0.0';
                    const scorePercentage = sectionCfg.maxMarks > 0
                        ? (scores.score / sectionCfg.maxMarks) * 100
                        : 0;

                    return (
                        <div
                            key={sectionName}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]"
                            style={{ borderTopWidth: 4, borderTopColor: sectionDisplay.accent }}
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-[#0F172A]">
                                    {sectionLabel}
                                </h3>
                                <p className="text-xs text-[#64748B]">
                                    {sectionDisplay.fullName}
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-[#0F172A]">
                                        {scores.score}
                                    </span>
                                    <span className="text-sm text-[#64748B]">
                                        / {sectionCfg.maxMarks}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.max(0, Math.min(100, scorePercentage))}%`,
                                            backgroundColor: sectionDisplay.accent,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <p className="text-xs text-[#64748B]">Correct</p>
                                    <p className="font-semibold text-[#10B981]">{scores.correct}</p>
                                </div>
                                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <p className="text-xs text-[#64748B]">Incorrect</p>
                                    <p className="font-semibold text-[#EF4444]">{scores.incorrect}</p>
                                </div>
                                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <p className="text-xs text-[#64748B]">Skipped</p>
                                    <p className="font-semibold text-[#64748B]">{scores.unanswered}</p>
                                </div>
                                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                    <p className="text-xs text-[#64748B]">Accuracy</p>
                                    <p className="font-semibold text-[#0F172A]">{accuracy}%</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
