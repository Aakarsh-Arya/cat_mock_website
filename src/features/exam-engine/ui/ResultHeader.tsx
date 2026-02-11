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

function formatTime(seconds: number | null): string {
    if (!seconds) return '--';
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
    const totalQuestions = correctCount + incorrectCount + unansweredCount;
    const correctPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const incorrectPercent = totalQuestions > 0 ? (incorrectCount / totalQuestions) * 100 : 0;
    const unansweredPercent = totalQuestions > 0 ? (unansweredCount / totalQuestions) * 100 : 0;

    const submittedLabel = submittedAt
        ? new Date(submittedAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
        : null;

    return (
        <div className="mb-8 space-y-4 sm:space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[#0F172A] sm:text-2xl">Performance Snapshot</h2>
                    <p className="text-sm text-[#64748B]">{paperTitle}</p>
                    {submittedLabel && (
                        <p className="text-xs text-[#64748B]">Submitted {submittedLabel}</p>
                    )}
                </div>
                {reviewAnchorId && (
                    <a
                        href={`#${reviewAnchorId}`}
                        className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] sm:w-auto"
                    >
                        Review in Mirror View
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                    </a>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] sm:p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l-3-3m3 3l3-3m6-7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Score</p>
                    <p className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{totalScore}</p>
                    <p className="text-sm text-[#64748B]">of {maxScore}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] sm:p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#6366F1]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5H5v14h14v-8M15 3h6v6M10 14L21 3" />
                        </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Percentile</p>
                    <p className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{percentile?.toFixed(1) ?? '--'}%</p>
                    <p className="text-sm text-[#64748B]">{rank ? `Rank #${rank}` : 'Rank unavailable'}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] sm:p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#10B981]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Accuracy</p>
                    <p className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{accuracy?.toFixed(1) ?? '--'}%</p>
                    <p className="text-sm text-[#64748B]">{correctCount}/{correctCount + incorrectCount} correct</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] sm:p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#F59E0B]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Time Taken</p>
                    <p className="text-2xl font-bold text-[#F59E0B] sm:text-3xl">{formatTime(timeTakenSeconds)}</p>
                    <p className="text-sm text-[#64748B]">of 120 min</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] sm:p-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div className="flex h-full w-full">
                        <div className="bg-[#10B981]" style={{ width: `${correctPercent}%` }} />
                        <div className="bg-[#EF4444]" style={{ width: `${incorrectPercent}%` }} />
                        <div className="bg-[#94A3B8]" style={{ width: `${unansweredPercent}%` }} />
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#64748B]">Correct</p>
                        <p className="text-lg font-semibold text-[#10B981]">{correctCount}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#64748B]">Incorrect</p>
                        <p className="text-lg font-semibold text-[#EF4444]">{incorrectCount}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#64748B]">Skipped</p>
                        <p className="text-lg font-semibold text-[#64748B]">{unansweredCount}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#64748B]">Attempt Rate</p>
                        <p className="text-lg font-semibold text-[#0F172A]">{attemptRate?.toFixed(1) ?? '--'}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
