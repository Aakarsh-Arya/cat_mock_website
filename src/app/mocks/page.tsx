import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';
import { AttemptStateAutoRefresh } from '@/components/AttemptStateAutoRefresh';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

type SectionName = 'VARC' | 'DILR' | 'QA';
type AttemptMode = 'full' | 'sectional';

type Paper = {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    year: number;
    total_questions: number;
    total_marks: number;
    duration_minutes: number | null;
    difficulty_level: string | null;
    is_free: boolean;
    attempt_limit: number | null;
    available_from?: string | null;
    available_until?: string | null;
    allow_sectional_attempts?: boolean | null;
    sectional_allowed_sections?: SectionName[] | null;
};

type SectionAttemptView = {
    continueAttemptId: string | null;
    analysisAttemptId: string | null;
    completedCount: number;
};

type PaperAttemptView = {
    fullContinueAttemptId: string | null;
    fullAnalysisAttemptId: string | null;
    completedFullCount: number;
    sectional: Record<SectionName, SectionAttemptView>;
    hasAnyAttempt: boolean;
};

const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];

function emptySectionAttemptView(): SectionAttemptView {
    return {
        continueAttemptId: null,
        analysisAttemptId: null,
        completedCount: 0,
    };
}

function emptyPaperAttemptView(): PaperAttemptView {
    return {
        fullContinueAttemptId: null,
        fullAnalysisAttemptId: null,
        completedFullCount: 0,
        sectional: {
            VARC: emptySectionAttemptView(),
            DILR: emptySectionAttemptView(),
            QA: emptySectionAttemptView(),
        },
        hasAnyAttempt: false,
    };
}

function normalizeAllowedSections(raw: unknown): SectionName[] {
    if (!Array.isArray(raw)) return [...SECTIONS];
    const normalized = raw
        .map((entry) => (typeof entry === 'string' ? entry.toUpperCase().trim() : ''))
        .filter((entry): entry is SectionName => entry === 'VARC' || entry === 'DILR' || entry === 'QA');
    return normalized.length > 0 ? normalized : [...SECTIONS];
}

function sectionLabel(section: SectionName): string {
    return section === 'DILR' ? 'LRDI' : section;
}

export default async function MocksPage() {
    const attemptStateByPaper = new Map<string, PaperAttemptView>();
    let papersData: Paper[] = [];
    let fetchErrorMessage: string | null = null;

    try {
        const supabase = await sbSSR();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const papersResult = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, difficulty_level, is_free, attempt_limit, available_from, available_until, allow_sectional_attempts, sectional_allowed_sections')
            .eq('published', true)
            .order('year', { ascending: false })
            .order('created_at', { ascending: false });

        if (papersResult.error?.code === '42703') {
            const fallback = await supabase
                .from('papers')
                .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, difficulty_level, is_free, attempt_limit, available_from, available_until')
                .eq('published', true)
                .order('year', { ascending: false })
                .order('created_at', { ascending: false });
            papersData = (fallback.data ?? []).map((paper) => ({
                ...paper,
                allow_sectional_attempts: false,
                sectional_allowed_sections: [...SECTIONS],
            })) as Paper[];
            fetchErrorMessage = fallback.error?.message ?? null;
        } else {
            papersData = (papersResult.data ?? []) as Paper[];
            fetchErrorMessage = papersResult.error?.message ?? null;
        }

        if (user) {
            const attemptsResult = await supabase
                .from('attempts')
                .select('id, paper_id, created_at, status, time_remaining, attempt_mode, sectional_section')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            let attempts: Array<{
                id: string;
                paper_id: string;
                created_at: string;
                status: string;
                time_remaining?: Record<string, unknown> | null;
                attempt_mode?: AttemptMode | null;
                sectional_section?: SectionName | null;
            }> = [];

            if (attemptsResult.error?.code === '42703') {
                const fallback = await supabase
                    .from('attempts')
                    .select('id, paper_id, created_at, status, time_remaining')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                attempts = (fallback.data ?? []).map((attempt) => ({
                    ...attempt,
                    attempt_mode: 'full',
                    sectional_section: null,
                }));
            } else {
                attempts = (attemptsResult.data ?? []).map((attempt) => ({
                    ...attempt,
                    attempt_mode: (attempt.attempt_mode as AttemptMode | null | undefined) ?? 'full',
                    sectional_section: (attempt.sectional_section as SectionName | null | undefined) ?? null,
                }));
            }

            const hasRemainingTime = (timeRemaining: unknown) => {
                if (!timeRemaining || typeof timeRemaining !== 'object' || Array.isArray(timeRemaining)) {
                    return false;
                }
                return Object.values(timeRemaining as Record<string, unknown>).some((value) => {
                    const num =
                        typeof value === 'number'
                            ? value
                            : typeof value === 'string'
                                ? Number(value)
                                : NaN;
                    return Number.isFinite(num) && num > 0;
                });
            };

            (attempts ?? []).forEach((attempt) => {
                if (!attempt.paper_id) return;
                const state = attemptStateByPaper.get(attempt.paper_id) ?? emptyPaperAttemptView();
                state.hasAnyAttempt = true;

                const mode: AttemptMode = attempt.attempt_mode === 'sectional' ? 'sectional' : 'full';
                const section: SectionName | null =
                    attempt.sectional_section === 'VARC' || attempt.sectional_section === 'DILR' || attempt.sectional_section === 'QA'
                        ? attempt.sectional_section
                        : null;
                const isActive = (attempt.status === 'in_progress' || attempt.status === 'paused') && hasRemainingTime(attempt.time_remaining);
                const isCompleted = attempt.status === 'completed' || attempt.status === 'submitted';

                if (mode === 'full') {
                    if (isActive && !state.fullContinueAttemptId) {
                        state.fullContinueAttemptId = attempt.id;
                    }
                    if (isCompleted) {
                        state.completedFullCount += 1;
                        if (!state.fullAnalysisAttemptId) {
                            state.fullAnalysisAttemptId = attempt.id;
                        }
                    }
                } else if (section) {
                    const sectionState = state.sectional[section];
                    if (isActive && !sectionState.continueAttemptId) {
                        sectionState.continueAttemptId = attempt.id;
                    }
                    if (isCompleted) {
                        sectionState.completedCount += 1;
                        if (!sectionState.analysisAttemptId) {
                            sectionState.analysisAttemptId = attempt.id;
                        }
                    }
                }

                attemptStateByPaper.set(attempt.paper_id, state);
            });
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('Dynamic server usage')) {
            throw error;
        }
        fetchErrorMessage = 'Unexpected server error while loading mocks';
        logger.error('Failed to load mocks page', error);
    }

    const now = Date.now();
    const papers: Paper[] = papersData.filter((paper) => {
        const fromOk = !paper.available_from || Date.parse(paper.available_from) <= now;
        const untilOk = !paper.available_until || Date.parse(paper.available_until) >= now;
        const hasAttemptState = Boolean(attemptStateByPaper.get(paper.id)?.hasAnyAttempt);
        return (fromOk && untilOk) || hasAttemptState;
    });

    const papersByYear = papers.reduce((acc, paper) => {
        const year = paper.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(paper);
        return acc;
    }, {} as Record<number, Paper[]>);

    const difficultyClass: Record<string, string> = {
        easy: 'bg-emerald-100 text-emerald-700',
        medium: 'bg-amber-100 text-amber-700',
        hard: 'bg-rose-100 text-rose-700',
        'cat-level': 'bg-violet-100 text-violet-700',
    };

    return (
        <main className="page-shell py-6 sm:py-8">
            <AttemptStateAutoRefresh pollIntervalMs={10000} />
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">NEXAMS Mock Tests</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                Practice with full-length CAT mock tests designed to simulate the actual exam experience.
            </p>

            {fetchErrorMessage ? (
                <p className="mt-6 text-red-700">Failed to load papers. Please try again later.</p>
            ) : papers.length === 0 ? (
                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <h2 className="text-xl font-semibold text-slate-900">No Mock Tests Available</h2>
                    <p className="mt-2 text-slate-600">Check back soon for new mock tests.</p>
                </div>
            ) : (
                <div className="mt-8 space-y-8">
                    {Object.entries(papersByYear)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([year, yearPapers]) => (
                            <section key={year} className="space-y-4">
                                <div className="border-b border-blue-200 pb-2">
                                    <h2 className="text-xl font-semibold text-slate-900">CAT {year} Pattern</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {yearPapers.map((paper) => {
                                        const attemptState = attemptStateByPaper.get(paper.id) ?? emptyPaperAttemptView();
                                        const paperKey = paper.slug || paper.id;
                                        const startActionPath = `/mock/${paperKey}/start`;
                                        const attemptLimit = paper.attempt_limit ?? null;
                                        const canStartFull = attemptLimit === null || attemptLimit <= 0 || attemptState.completedFullCount < attemptLimit;
                                        const allowedSectionals = normalizeAllowedSections(paper.sectional_allowed_sections);
                                        const canStartSectional = Boolean(paper.allow_sectional_attempts) && allowedSectionals.length > 0;
                                        const sectionalMenuSections = canStartSectional
                                            ? allowedSectionals
                                            : allowedSectionals.filter((section) => {
                                                const sectionState = attemptState.sectional[section];
                                                return Boolean(sectionState.continueAttemptId || sectionState.analysisAttemptId);
                                            });
                                        const showSectionalControl = sectionalMenuSections.length > 0;

                                        return (
                                            <article
                                                key={paper.id}
                                                className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="mb-3 flex items-start justify-between gap-3">
                                                    <h3 className="text-lg font-semibold text-slate-900">{paper.title}</h3>
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        {paper.is_free && (
                                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                                FREE
                                                            </span>
                                                        )}
                                                        {paper.allow_sectional_attempts && (
                                                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                                                                SECTIONAL
                                                            </span>
                                                        )}
                                                        {typeof paper.difficulty_level === 'string' && paper.difficulty_level.trim() !== '' && (
                                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficultyClass[paper.difficulty_level] ?? 'bg-slate-100 text-slate-700'}`}>
                                                                {paper.difficulty_level.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {paper.description && (
                                                    <p className="text-clamp-mobile mb-4 text-sm text-slate-600">
                                                        {paper.description}
                                                    </p>
                                                )}

                                                <dl className="mb-5 grid grid-cols-3 gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                                                    <div>
                                                        <dt className="text-[11px] text-slate-500">Questions</dt>
                                                        <dd className="text-sm font-semibold text-slate-800">{paper.total_questions}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-[11px] text-slate-500">Marks</dt>
                                                        <dd className="text-sm font-semibold text-slate-800">{paper.total_marks}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-[11px] text-slate-500">Duration</dt>
                                                        <dd className="text-sm font-semibold text-slate-800">{paper.duration_minutes ?? '-'}</dd>
                                                    </div>
                                                </dl>

                                                <div className="mt-auto space-y-2">
                                                    <div className="rounded-md border border-blue-100 bg-blue-50 p-2">
                                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                                                            Full Mock
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {attemptState.fullContinueAttemptId ? (
                                                                <Link
                                                                    href={`/exam/${attemptState.fullContinueAttemptId}`}
                                                                    className="touch-target inline-flex items-center justify-center rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                                                                >
                                                                    Continue Full Mock
                                                                </Link>
                                                            ) : canStartFull ? (
                                                                <form method="post" action={startActionPath}>
                                                                    <input type="hidden" name="mode" value="full" />
                                                                    <button
                                                                        type="submit"
                                                                        className="touch-target inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                                                    >
                                                                        {attemptState.completedFullCount > 0 ? 'Start Full (New)' : 'Start Full'}
                                                                    </button>
                                                                </form>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                                                                    Full limit reached
                                                                </span>
                                                            )}

                                                            {attemptState.fullAnalysisAttemptId && (
                                                                <Link
                                                                    href={`/result/${attemptState.fullAnalysisAttemptId}`}
                                                                    className="touch-target inline-flex items-center justify-center rounded-md border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                                >
                                                                    View Full Analysis
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {showSectionalControl && (
                                                        <details className="rounded-md border border-blue-100 bg-blue-50 p-2">
                                                            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                                                                {canStartSectional ? 'Start Sectional' : 'Sectional Attempts'}
                                                            </summary>
                                                            <div className="mt-2 grid grid-cols-1 gap-2">
                                                                {sectionalMenuSections.map((section) => {
                                                                    const sectionState = attemptState.sectional[section];
                                                                    const canStartThisSection =
                                                                        canStartSectional &&
                                                                        (attemptLimit === null || attemptLimit <= 0 || sectionState.completedCount < attemptLimit);

                                                                    if (sectionState.continueAttemptId) {
                                                                        return (
                                                                            <Link
                                                                                key={section}
                                                                                href={`/exam/${sectionState.continueAttemptId}`}
                                                                                className="touch-target inline-flex items-center justify-center rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                                                                            >
                                                                                Continue {sectionLabel(section)}
                                                                            </Link>
                                                                        );
                                                                    }

                                                                    if (sectionState.analysisAttemptId) {
                                                                        return (
                                                                            <Link
                                                                                key={section}
                                                                                href={`/result/${sectionState.analysisAttemptId}`}
                                                                                className="touch-target inline-flex items-center justify-center rounded-md border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                                            >
                                                                                View {sectionLabel(section)} Analysis
                                                                            </Link>
                                                                        );
                                                                    }

                                                                    if (!canStartThisSection) {
                                                                        return (
                                                                            <span
                                                                                key={section}
                                                                                className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700"
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
                                                                                className="touch-target inline-flex w-full items-center justify-center rounded-md border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
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
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                </div>
            )}
        </main>
    );
}
