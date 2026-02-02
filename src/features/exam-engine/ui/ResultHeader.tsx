/**
 * @fileoverview Result Header Component
 * @description Summary card displaying total score, accuracy, and key metrics
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

interface ResultHeaderProps {
    paperTitle: string;
    totalScore: number;
    maxScore: number;
    accuracy: number | null;
    attemptRate: number | null;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    timeTakenSeconds: number | null;
    percentile: number | null;
    rank: number | null;
    submittedAt: string | null;
    reviewAnchorId?: string;
}

/**
 * Format seconds to human-readable time string
 */
function formatTime(seconds: number | null): string {
    if (!seconds) return '—';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
}

export function ResultHeader({
    paperTitle,
    totalScore,
    maxScore,
    accuracy,
    attemptRate,
    correctCount,
    incorrectCount,
    unansweredCount,
    timeTakenSeconds,
    percentile,
    rank,
    submittedAt,
    reviewAnchorId,
}: ResultHeaderProps) {
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const scoreColor = scorePercentage >= 70
        ? 'text-green-600'
        : scorePercentage >= 40
            ? 'text-yellow-600'
            : 'text-red-600';

    return (
        <div className="mb-8">
            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {paperTitle}
                </h1>
                {submittedAt && (
                    <p className="text-gray-500 text-sm">
                        Submitted: {new Date(submittedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        })}
                    </p>
                )}
            </div>

            {reviewAnchorId && (
                <div className="mt-4 flex justify-center">
                    <a
                        href={`#${reviewAnchorId}`}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        Review in Exam UI
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            )}

            {/* Main Score Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {/* Score */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Score
                        </p>
                        <p className={`text-2xl md:text-4xl font-bold ${scoreColor}`}>
                            {totalScore}
                        </p>
                        <p className="text-sm text-gray-400">
                            of {maxScore}
                        </p>
                    </div>

                    {/* Percentile */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Percentile
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-purple-600">
                            {percentile?.toFixed(1) ?? '—'}
                        </p>
                        {rank && (
                            <p className="text-sm text-gray-400">
                                Rank #{rank}
                            </p>
                        )}
                    </div>

                    {/* Accuracy */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Accuracy
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-orange-500">
                            {accuracy?.toFixed(1) ?? '—'}%
                        </p>
                        <p className="text-sm text-gray-400">
                            {correctCount}/{correctCount + incorrectCount} correct
                        </p>
                    </div>

                    {/* Time Taken */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Time Taken
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-teal-600">
                            {formatTime(timeTakenSeconds)}
                        </p>
                        <p className="text-sm text-gray-400">
                            of 120 min
                        </p>
                    </div>
                </div>
            </div>

            {/* Question Stats Bar */}
            <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                    </span>
                    <span className="text-gray-600">
                        Correct: <strong className="text-green-600">{correctCount}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✗
                    </span>
                    <span className="text-gray-600">
                        Incorrect: <strong className="text-red-600">{incorrectCount}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        –
                    </span>
                    <span className="text-gray-600">
                        Unanswered: <strong className="text-gray-500">{unansweredCount}</strong>
                    </span>
                </div>
                {attemptRate !== null && (
                    <div className="flex items-center gap-2 text-gray-600">
                        Attempt Rate: <strong>{attemptRate.toFixed(1)}%</strong>
                    </div>
                )}
            </div>
        </div>
    );
}
