import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { getSectionDurationSecondsMap, type SectionName, type SectionConfig } from '@/types/exam';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import { ensureActiveAccess } from '@/lib/access-control';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey } from '@/lib/rate-limit';
import { incrementMetric } from '@/lib/telemetry';
import { AttemptStateAutoRefresh } from '@/components/AttemptStateAutoRefresh';

export const metadata: Metadata = {
    title: "Mock Details",
};

interface Paper {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    year: number;
    total_questions: number;
    total_marks: number;
    duration_minutes: number;
    sections: SectionConfig[];
    published: boolean;
    difficulty_level: string | null;
    is_free: boolean;
    attempt_limit: number | null;
}

export default async function MockDetailPage({
    params,
    searchParams,
}: {
    params: Promise<Record<string, unknown>>;
    searchParams?: { error?: string; limit_reached?: string };
}) {
    const { paperId } = (await params) as { paperId: string };

    const supabase = await sbSSR();

    // Get paper details - try by UUID first, then by slug
    let paper: Paper | null = null;
    let paperError: unknown = null;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);

    if (isUUID) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
            .eq('id', paperId)
            .maybeSingle();
        paper = result.data as Paper | null;
        paperError = result.error;
    }

    if (!paper && !paperError) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
            .eq('slug', paperId)
            .maybeSingle();
        paper = result.data as Paper | null;
        paperError = result.error;
    }

    const { data: { user } } = await supabase.auth.getUser();
    let previousAttempts: {
        id: string;
        status: string;
        total_score: number | null;
        created_at: string;
        time_remaining?: Record<string, unknown> | null;
    }[] = [];

    if (user && paper) {
        const { data: attempts } = await supabase
            .from('attempts')
            .select('id, status, total_score, created_at, time_remaining')
            .eq('paper_id', paper.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        previousAttempts = attempts || [];
    }

    const attemptLimitStatuses = new Set(['completed', 'submitted']);
    const activeAttemptsCount = previousAttempts.filter((a) => attemptLimitStatuses.has(a.status)).length;
    const attemptLimit = paper?.attempt_limit ?? null;
    const canAttempt = attemptLimit === null || attemptLimit <= 0 || activeAttemptsCount < attemptLimit;
    const activeAttempt = previousAttempts.find(
        (a) => a.status === 'in_progress' || a.status === 'paused'
    ) ?? null;

    async function startExam() {
        'use server';
        const s = await sbSSR();
        const { data: { user: currentUser } } = await s.auth.getUser();

        if (!currentUser) {
            redirect(`/auth/sign-in?redirect_to=${encodeURIComponent(`/mock/${paperId}`)}`);
        }

        const access = await ensureActiveAccess(s, currentUser.id, currentUser);
        if (!access.allowed) {
            redirect(`/coming-soon?redirect_to=${encodeURIComponent(`/mock/${paperId}`)}`);
        }

        const rateKey = userRateLimitKey('start_mock', currentUser.id);
        const rateResult = checkRateLimit(rateKey, RATE_LIMITS.START_MOCK);
        if (!rateResult.allowed) {
            redirect(`/mock/${paperId}?error=rate_limited`);
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);

        type PaperData = { id: string; published: boolean; sections: SectionConfig[]; duration_minutes: number; attempt_limit: number | null };
        let p: PaperData | null = null;

        if (isUUID) {
            const { data } = await s
                .from('papers')
                .select('id, published, sections, duration_minutes, attempt_limit')
                .eq('id', paperId)
                .maybeSingle();
            p = data as PaperData | null;
        }

        if (!p) {
            const { data } = await s
                .from('papers')
                .select('id, published, sections, duration_minutes, attempt_limit')
                .eq('slug', paperId)
                .maybeSingle();
            p = data as PaperData | null;
        }

        if (!p || p.published !== true) {
            throw new Error('Paper not available');
        }

        const sections = (p.sections as SectionConfig[]) || [];
        const sectionDurations = getSectionDurationSecondsMap(sections);

        try {
            const adminClient = getServiceRoleClient();
            const { data: existingAttempt } = await adminClient
                .from('attempts')
                .select('id, status')
                .eq('paper_id', p.id)
                .eq('user_id', currentUser.id)
                .in('status', ['in_progress', 'paused'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (existingAttempt) {
                await adminClient
                    .from('attempts')
                    .update({
                        status: 'abandoned',
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', existingAttempt.id)
                    .eq('user_id', currentUser.id)
                    .in('status', ['in_progress', 'paused']);
            }
        } catch (error) {
            logger.warn('Failed to abandon existing attempt for new mock', error, {
                paperId: p.id,
                userId: currentUser.id,
            });
        }

        const attemptLimitServer = p.attempt_limit ?? null;
        if (attemptLimitServer !== null && attemptLimitServer > 0) {
            const { count: attemptCount } = await s
                .from('attempts')
                .select('id', { count: 'exact', head: true })
                .eq('paper_id', p.id)
                .eq('user_id', currentUser.id)
                .in('status', ['completed', 'submitted']);

            if ((attemptCount ?? 0) >= attemptLimitServer) {
                redirect(`/mock/${paperId}?limit_reached=1`);
            }
        }

        const timeRemaining: Record<SectionName, number> = {
            VARC: sectionDurations.VARC,
            DILR: sectionDurations.DILR,
            QA: sectionDurations.QA,
        };

        const { data: attempt, error: insertErr } = await s
            .from('attempts')
            .insert({
                paper_id: p.id,
                user_id: currentUser.id,
                status: 'in_progress',
                current_section: 'VARC',
                current_question: 1,
                time_remaining: timeRemaining
            })
            .select('id')
            .single();

        if (insertErr || !attempt) {
            logger.error('Failed to create attempt', insertErr, { paperId: p.id, userId: currentUser.id });
            throw new Error('Failed to create attempt');
        }

        incrementMetric('attempt_created');
        redirect(`/exam/${attempt.id}`);
    }

    if (paperError) {
        return (
            <main className="page-shell py-6 sm:py-8">
                <h1 className="text-2xl font-bold text-slate-900">Error Loading Paper</h1>
                <p className="mt-2 text-red-700">Failed to load paper. Please try again later.</p>
                <Link href="/mocks" className="touch-target mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                    Back to Mocks
                </Link>
            </main>
        );
    }

    if (!paper) {
        return (
            <main className="page-shell py-6 sm:py-8">
                <h1 className="text-2xl font-bold text-slate-900">Paper Not Found</h1>
                <p className="mt-2 text-slate-600">The requested mock test does not exist.</p>
                <Link href="/mocks" className="touch-target mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                    Browse Available Mocks
                </Link>
            </main>
        );
    }

    const queryError = searchParams?.error ?? null;
    const limitReached = searchParams?.limit_reached === '1';
    const difficultyClass = paper.difficulty_level === 'hard'
        ? 'bg-rose-100 text-rose-700'
        : paper.difficulty_level === 'medium'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700';

    return (
        <main className="page-shell py-6 sm:py-8">
            <AttemptStateAutoRefresh pollIntervalMs={10000} />
            {queryError === 'rate_limited' && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Too many start attempts. Please wait a minute and try again.
                </div>
            )}
            {limitReached && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    You have reached the maximum number of attempts for this paper.
                </div>
            )}

            <div className="mb-8">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{paper.title}</h1>
                    {paper.is_free && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">FREE</span>
                    )}
                    {paper.difficulty_level && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficultyClass}`}>
                            {paper.difficulty_level.toUpperCase()}
                        </span>
                    )}
                </div>
                {paper.description && <p className="mt-2 text-slate-600">{paper.description}</p>}
            </div>

            <div className="mb-8 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4 sm:gap-4 sm:p-5">
                <div className="text-center">
                    <p className="text-xs text-slate-500 sm:text-sm">Questions</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{paper.total_questions}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 sm:text-sm">Total Marks</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{paper.total_marks}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 sm:text-sm">Duration</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{paper.duration_minutes} min</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 sm:text-sm">Year</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{paper.year}</p>
                </div>
            </div>

            <h2 className="mb-3 text-xl font-semibold text-slate-900">Marking Scheme</h2>
            <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="mb-2"><strong>MCQ Questions:</strong> +3 for correct, -1 for incorrect, 0 for unanswered</p>
                <p><strong>TITA Questions:</strong> +3 for correct, 0 for incorrect/unanswered (No negative marking)</p>
            </div>

            {previousAttempts.length > 0 && (
                <>
                    <h2 className="mb-4 text-xl font-semibold text-slate-900">Your Previous Attempts</h2>
                    <div className="mb-8 space-y-3">
                        {previousAttempts.map((attempt, idx) => (
                            <div key={attempt.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-slate-900">Attempt {previousAttempts.length - idx}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${(attempt.status === 'completed' || attempt.status === 'submitted') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {attempt.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                    <span>{new Date(attempt.created_at).toLocaleDateString()}</span>
                                    <span className="font-semibold text-slate-900">
                                        {attempt.total_score !== null ? `${attempt.total_score} marks` : '-'}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    {attempt.status === 'completed' || attempt.status === 'submitted' ? (
                                        <Link href={`/result/${attempt.id}`} className="touch-target inline-flex items-center text-blue-600 hover:text-blue-800">
                                            View Result
                                        </Link>
                                    ) : attempt.status === 'in_progress' || attempt.status === 'paused' ? (
                                        <Link href={`/exam/${attempt.id}`} className="touch-target inline-flex items-center text-amber-700 hover:text-amber-800">
                                            Continue
                                        </Link>
                                    ) : (
                                        <span className="text-sm text-slate-400">-</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="text-center">
                {!paper.published ? (
                    <p className="text-slate-600">This paper is not yet available.</p>
                ) : activeAttempt ? (
                    <Link
                        href={`/exam/${activeAttempt.id}`}
                        className="touch-target inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-base font-semibold text-white hover:bg-amber-600 sm:w-auto sm:px-10"
                    >
                        Continue Mock
                    </Link>
                ) : !canAttempt ? (
                    <p className="text-red-700">You have reached the maximum number of attempts for this paper.</p>
                ) : (
                    <form action={startExam}>
                        <button
                            type="submit"
                            className="touch-target inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto sm:px-10"
                        >
                            {previousAttempts.length > 0 ? 'Start New Attempt' : 'Start Exam'}
                        </button>
                    </form>
                )}
            </div>

            <div className="mt-6 text-center">
                <Link href="/mocks" className="touch-target inline-flex items-center text-slate-600 hover:text-slate-900">
                    Back to All Mocks
                </Link>
            </div>
        </main>
    );
}
