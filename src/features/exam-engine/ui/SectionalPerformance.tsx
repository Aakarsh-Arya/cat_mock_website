/**
 * @fileoverview Sectional Performance Component
 * @description Section-wise breakdown of exam performance (VARC, DILR, QA)
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

import { type SectionName } from '@/types/exam';

interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

interface SectionalPerformanceProps {
    sectionScores: Record<string, SectionScore>;
    sectionConfig?: {
        [key: string]: {
            maxMarks: number;
            totalQuestions: number;
        };
    };
}

/** Section display configuration */
const SECTION_DISPLAY: Record<SectionName, {
    name: string;
    fullName: string;
    color: string;
    bgColor: string;
}> = {
    VARC: {
        name: 'VARC',
        fullName: 'Verbal Ability & Reading Comprehension',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
    },
    DILR: {
        name: 'DILR',
        fullName: 'Data Interpretation & Logical Reasoning',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
    },
    QA: {
        name: 'QA',
        fullName: 'Quantitative Aptitude',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
    },
};

/** Default CAT 2024 section config */
const DEFAULT_SECTION_CONFIG: Record<SectionName, { maxMarks: number; totalQuestions: number }> = {
    VARC: { maxMarks: 72, totalQuestions: 24 },
    DILR: { maxMarks: 60, totalQuestions: 20 },
    QA: { maxMarks: 66, totalQuestions: 22 },
};

export function SectionalPerformance({ sectionScores, sectionConfig }: SectionalPerformanceProps) {
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const config = sectionConfig || DEFAULT_SECTION_CONFIG;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Section-wise Performance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sections.map((sectionName) => {
                    const scores = sectionScores[sectionName];
                    const sectionDisplay = SECTION_DISPLAY[sectionName];
                    const sectionCfg = config[sectionName] || { maxMarks: 0, totalQuestions: 0 };

                    if (!scores) {
                        return (
                            <div
                                key={sectionName}
                                className={`${sectionDisplay.bgColor} rounded-xl p-5 border`}
                            >
                                <h3 className={`font-bold text-lg ${sectionDisplay.color} mb-1`}>
                                    {sectionDisplay.name}
                                </h3>
                                <p className="text-gray-400 text-sm">No data available</p>
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
                            className={`${sectionDisplay.bgColor} rounded-xl p-5 border shadow-sm transition-shadow hover:shadow-md`}
                        >
                            {/* Section Header */}
                            <div className="mb-4">
                                <h3 className={`font-bold text-lg ${sectionDisplay.color}`}>
                                    {sectionDisplay.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {sectionDisplay.fullName}
                                </p>
                            </div>

                            {/* Score Display */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-bold ${sectionDisplay.color}`}>
                                        {scores.score}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        / {sectionCfg.maxMarks}
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${scorePercentage >= 50 ? 'bg-green-500' :
                                                scorePercentage >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.max(0, Math.min(100, scorePercentage))}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Correct</span>
                                    <span className="font-semibold text-green-600">
                                        {scores.correct}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Incorrect</span>
                                    <span className="font-semibold text-red-600">
                                        {scores.incorrect}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Skipped</span>
                                    <span className="font-semibold text-gray-500">
                                        {scores.unanswered}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Accuracy</span>
                                    <span className="font-semibold text-orange-600">
                                        {accuracy}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SectionalPerformance;
