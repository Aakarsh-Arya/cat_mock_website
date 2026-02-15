import type { Metadata } from "next";
import { sbSSR } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { type SectionName, type SectionConfig } from '@/types/exam';
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
    allow_sectional_attempts?: boolean | null;
    sectional_allowed_sections?: SectionName[] | null;
}

type AttemptMode = 'full' | 'sectional';

function normalizeSectionalAllowedSections(
    raw: unknown,
    fallbackSections: readonly SectionConfig[]
): SectionName[] {
    const availableSections = new Set<SectionName>(
        fallbackSections
            .map((section) => section?.name)
            .filter((name): name is SectionName => name === 'VARC' || name === 'DILR' || name === 'QA')
    );

    if (availableSections.size === 0) {
        availableSections.add('VARC');
        availableSections.add('DILR');
        availableSections.add('QA');
    }

    if (!Array.isArray(raw)) {
        return Array.from(availableSections);
    }

    const normalized = raw
        .map((entry) => (typeof entry === 'string' ? entry.toUpperCase().trim() : ''))
        .filter((entry): entry is SectionName => entry === 'VARC' || entry === 'DILR' || entry === 'QA')
        .filter((entry) => availableSections.has(entry));

    return normalized.length > 0 ? normalized : Array.from(availableSections);
}

export default async function MockDetailPage({
    params,
    searchParams,
}: {
    params: Promise<Record<string, unknown>>;
    searchParams?:
    | Promise<{ error?: string; limit_reached?: string }>
    | { error?: string; limit_reached?: string };
}) {
    const { paperId } = (await params) as { paperId: string };
    const resolvedSearchParams = searchParams ? await searchParams : undefined;

    const supabase = await sbSSR();

    // Get paper details - try by UUID first, then by slug
    let paper: Paper | null = null;
    let paperError: unknown = null;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);

    if (isUUID) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit, allow_sectional_attempts, sectional_allowed_sections')
            .eq('id', paperId)
            .maybeSingle();
        if (result.error?.code === '42703') {
            const fallback = await supabase
                .from('papers')
                .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
                .eq('id', paperId)
                .maybeSingle();
            paper = fallback.data
                ? {
                    ...fallback.data,
                    allow_sectional_attempts: false,
                    sectional_allowed_sections: ['VARC', 'DILR', 'QA'],
                }
                : null;
            paperError = fallback.error;
        } else {
            paper = result.data as Paper | null;
            paperError = result.error;
        }
    }

    if (!paper && !paperError) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit, allow_sectional_attempts, sectional_allowed_sections')
            .eq('slug', paperId)
            .maybeSingle();
        if (result.error?.code === '42703') {
            const fallback = await supabase
                .from('papers')
                .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
                .eq('slug', paperId)
                .maybeSingle();
            paper = fallback.data
                ? {
                    ...fallback.data,
                    allow_sectional_attempts: false,
                    sectional_allowed_sections: ['VARC', 'DILR', 'QA'],
                }
                : null;
            paperError = fallback.error;
        } else {
            paper = result.data as Paper | null;
            paperError = result.error;
        }
    }

    const { data: { user } } = await supabase.auth.getUser();
    let previousAttempts: {
        id: string;
        status: string;
        total_score: number | null;
        created_at: string;
        time_remaining?: Record<string, unknown> | null;
        attempt_mode?: AttemptMode | null;
        sectional_section?: SectionName | null;
    }[] = [];

    if (user && paper) {
        const attemptsResult = await supabase
            .from('attempts')
            .select('id, status, total_score, created_at, time_remaining, attempt_mode, sectional_section')
            .eq('paper_id', paper.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (attemptsResult.error?.code === '42703') {
            const fallback = await supabase
                .from('attempts')
                .select('id, status, total_score, created_at, time_remaining')
                .eq('paper_id', paper.id)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            previousAttempts = (fallback.data ?? []).map((attempt) => ({
                ...attempt,
                attempt_mode: 'full' as AttemptMode,
                sectional_section: null,
            }));
        } else {
            previousAttempts = (attemptsResult.data ?? []).map((attempt) => ({
                ...attempt,
                attempt_mode: (attempt.attempt_mode as AttemptMode | null | undefined) ?? 'full',
                sectional_section: (attempt.sectional_section as SectionName | null | undefined) ?? null,
            }));
        }
    }

    const attemptLimitStatuses = new Set(['completed', 'submitted']);
    const activeStatuses = new Set(['in_progress', 'paused']);
    const attemptLimit = paper?.attempt_limit ?? null;

    const activeFullAttempt = previousAttempts.find(
        (attempt) =>
            activeStatuses.has(attempt.status) &&
            ((attempt.attempt_mode ?? 'full') === 'full')
    ) ?? null;
    const latestFullAnalysisAttempt = previousAttempts.find(
        (attempt) =>
            attemptLimitStatuses.has(attempt.status) &&
            ((attempt.attempt_mode ?? 'full') === 'full')
    ) ?? null;

    const completedFullCount = previousAttempts.filter(
        (attempt) =>
            attemptLimitStatuses.has(attempt.status) &&
            ((attempt.attempt_mode ?? 'full') === 'full')
    ).length;
    const canStartFull = attemptLimit === null || attemptLimit <= 0 || completedFullCount < attemptLimit;

    if (paperError) {
        logger.error('Failed to load paper in mock detail page', paperError, { paperId });
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

    const queryError = resolvedSearchParams?.error ?? null;
    const limitReached = resolvedSearchParams?.limit_reached === '1';
    const difficultyClass = paper.difficulty_level === 'hard'
        ? 'bg-rose-100 text-rose-700'
        : paper.difficulty_level === 'medium'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700';
    const allowedSectionalSections = normalizeSectionalAllowedSections(
        paper.sectional_allowed_sections,
        paper.sections
    );
    const canStartSectional = Boolean(paper.allow_sectional_attempts) && allowedSectionalSections.length > 0;
    const startActionPath = `/mock/${paperId}/start`;
    const sectionLabel = (section: SectionName) => (section === 'DILR' ? 'LRDI' : section);

    const activeSectionalAttemptBySection = new Map<SectionName, (typeof previousAttempts)[number]>();
    const latestSectionalAnalysisBySection = new Map<SectionName, (typeof previousAttempts)[number]>();

    previousAttempts.forEach((attempt) => {
        if ((attempt.attempt_mode ?? 'full') !== 'sectional') return;
        const section = attempt.sectional_section;
        if (section !== 'VARC' && section !== 'DILR' && section !== 'QA') return;

        if (activeStatuses.has(attempt.status) && !activeSectionalAttemptBySection.has(section)) {
            activeSectionalAttemptBySection.set(section, attempt);
            return;
        }

        if (attemptLimitStatuses.has(attempt.status) && !latestSectionalAnalysisBySection.has(section)) {
            latestSectionalAnalysisBySection.set(section, attempt);
        }
    });

    const canStartSectionalBySection = new Map<SectionName, boolean>();
    allowedSectionalSections.forEach((section) => {
        const completedForSection = previousAttempts.filter(
            (attempt) =>
                attemptLimitStatuses.has(attempt.status) &&
                (attempt.attempt_mode ?? 'full') === 'sectional' &&
                attempt.sectional_section === section
        ).length;
        canStartSectionalBySection.set(
            section,
            attemptLimit === null || attemptLimit <= 0 || completedForSection < attemptLimit
        );
    });

    const showSectionalControl = canStartSectional || allowedSectionalSections.some((section) => {
        const active = activeSectionalAttemptBySection.get(section);
        const analysis = latestSectionalAnalysisBySection.get(section);
        return Boolean(active || analysis);
    });

    return (
        <main className="page-shell py-6 sm:py-8">
            <AttemptStateAutoRefresh pollIntervalMs={10000} />
            {queryError === 'rate_limited' && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Too many start attempts. Please wait a minute and try again.
                </div>
            )}
            {queryError === 'paper_unavailable' && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    This mock is currently unavailable. Please select another mock.
                </div>
            )}
            {queryError === 'start_failed' && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Could not start the mock right now. Please try again in a moment.
                </div>
            )}
            {queryError === 'sectional_not_allowed' && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Sectional attempts are not enabled for this mock.
                </div>
            )}
            {queryError === 'invalid_sectional' && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    The selected sectional option is invalid for this mock.
                </div>
            )}
            {queryError === 'active_attempt_conflict' && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Another active attempt is blocking this start. Complete migration `042_sectional_mode_constraints.sql` and try again.
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
                    {typeof paper.difficulty_level === 'string' && paper.difficulty_level.trim() !== '' && (
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
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                        {attempt.attempt_mode === 'sectional'
                                            ? `Sectional${attempt.sectional_section ? ` ${attempt.sectional_section}` : ''}`
                                            : 'Full Mock'}
                                    </span>
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
                ) : (
                    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-4">
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-left">
                            <p className="text-sm font-semibold text-blue-900">Full Mock</p>
                            <p className="mt-1 text-xs text-blue-700">
                                Full-length test with all sections and complete exam flow.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {activeFullAttempt ? (
                                    <Link
                                        href={`/exam/${activeFullAttempt.id}`}
                                        className="touch-target inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                                    >
                                        Continue Full Mock
                                    </Link>
                                ) : canStartFull ? (
                                    <form method="post" action={startActionPath}>
                                        <input type="hidden" name="mode" value="full" />
                                        <button
                                            type="submit"
                                            className="touch-target inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            {previousAttempts.some((attempt) => (attempt.attempt_mode ?? 'full') === 'full')
                                                ? 'Start Full Mock (New Attempt)'
                                                : 'Start Full Mock'}
                                        </button>
                                    </form>
                                ) : (
                                    <span className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                                        Full mock attempt limit reached
                                    </span>
                                )}

                                {latestFullAnalysisAttempt && (
                                    <Link
                                        href={`/result/${latestFullAnalysisAttempt.id}`}
                                        className="touch-target inline-flex items-center justify-center rounded-lg border border-blue-300 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                                    >
                                        View Full Analysis
                                    </Link>
                                )}
                            </div>
                        </div>

                        {showSectionalControl && (
                            <details className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-left">
                                <summary className="cursor-pointer text-sm font-semibold text-blue-900">
                                    {canStartSectional ? 'Start Sectional' : 'Sectional Attempts'}
                                </summary>
                                <p className="mt-2 text-xs text-blue-700">
                                    Choose a section. Each sectional has separate progress, timer, and analysis.
                                </p>
                                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {allowedSectionalSections.map((section) => {
                                        const activeSectionAttempt = activeSectionalAttemptBySection.get(section) ?? null;
                                        const sectionalAnalysisAttempt = latestSectionalAnalysisBySection.get(section) ?? null;
                                        const canStartThisSection = Boolean(canStartSectionalBySection.get(section)) && canStartSectional;

                                        if (activeSectionAttempt) {
                                            return (
                                                <Link
                                                    key={section}
                                                    href={`/exam/${activeSectionAttempt.id}`}
                                                    className="touch-target inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                                                >
                                                    Continue {sectionLabel(section)}
                                                </Link>
                                            );
                                        }

                                        if (sectionalAnalysisAttempt) {
                                            return (
                                                <Link
                                                    key={section}
                                                    href={`/result/${sectionalAnalysisAttempt.id}`}
                                                    className="touch-target inline-flex items-center justify-center rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                                                >
                                                    View {sectionLabel(section)} Analysis
                                                </Link>
                                            );
                                        }

                                        if (!canStartThisSection) {
                                            return (
                                                <span
                                                    key={section}
                                                    className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700"
                                                >
                                                    {sectionLabel(section)} limit reached
                                                </span>
                                            );
                                        }

                                        return (
                                            <form key={section} method="post" action={startActionPath}>
                                                <input type="hidden" name="mode" value="sectional" />
                                                <input type="hidden" name="section" value={section} />
                                                <button
                                                    type="submit"
                                                    className="touch-target inline-flex w-full items-center justify-center rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                                                >
                                                    Start {sectionLabel(section)}
                                                </button>
                                            </form>
                                        );
                                    })}
                                </div>
                            </details>
                        )}
                    </div>
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
