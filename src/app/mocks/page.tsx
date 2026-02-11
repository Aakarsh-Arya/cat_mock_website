import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

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
    available_from?: string | null;
    available_until?: string | null;
};

type PaperAttemptState = {
    kind: 'continue' | 'analysis';
    attemptId: string;
};

export default async function MocksPage() {
    const supabase = await sbSSR();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('papers')
        .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, difficulty_level, is_free, available_from, available_until')
        .eq('published', true)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

    const attemptStateByPaper = new Map<string, PaperAttemptState>();
    if (user) {
        const { data: attempts } = await supabase
            .from('attempts')
            .select('id, paper_id, created_at, status, time_remaining')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        const hasRemainingTime = (timeRemaining: unknown) => {
            if (!timeRemaining || typeof timeRemaining !== 'object') return false;
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
            const existing = attemptStateByPaper.get(attempt.paper_id);
            if (existing?.kind === 'continue') {
                return;
            }

            if (
                (attempt.status === 'in_progress' || attempt.status === 'paused') &&
                hasRemainingTime(attempt.time_remaining)
            ) {
                attemptStateByPaper.set(attempt.paper_id, {
                    kind: 'continue',
                    attemptId: attempt.id,
                });
                return;
            }

            if (!existing && (attempt.status === 'completed' || attempt.status === 'submitted')) {
                attemptStateByPaper.set(attempt.paper_id, {
                    kind: 'analysis',
                    attemptId: attempt.id,
                });
            }
        });
    }

    const now = Date.now();
    const papers: Paper[] = (data ?? []).filter((p: Paper) => {
        const fromOk = !p.available_from || Date.parse(p.available_from) <= now;
        const untilOk = !p.available_until || Date.parse(p.available_until) >= now;
        return (fromOk && untilOk) || attemptStateByPaper.has(p.id);
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
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">NEXAMS Mock Tests</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                Practice with full-length CAT mock tests designed to simulate the actual exam experience.
            </p>

            {error ? (
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
                                    {yearPapers.map((p) => {
                                        const attemptState = attemptStateByPaper.get(p.id);
                                        const href = attemptState?.kind === 'continue'
                                            ? `/exam/${attemptState.attemptId}`
                                            : attemptState?.kind === 'analysis'
                                                ? `/result/${attemptState.attemptId}`
                                                : `/mock/${p.slug || p.id}`;
                                        const ctaLabel = attemptState?.kind === 'continue'
                                            ? 'Continue Mock'
                                            : attemptState?.kind === 'analysis'
                                                ? 'View Analysis'
                                                : 'Start Mock';
                                        return (
                                            <article
                                                key={p.id}
                                                className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="mb-3 flex items-start justify-between gap-3">
                                                    <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        {p.is_free && (
                                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                                FREE
                                                            </span>
                                                        )}
                                                        {p.difficulty_level && (
                                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficultyClass[p.difficulty_level] ?? 'bg-slate-100 text-slate-700'}`}>
                                                                {p.difficulty_level.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {p.description && (
                                                    <p className="text-clamp-mobile mb-4 text-sm text-slate-600">
                                                        {p.description}
                                                    </p>
                                                )}

                                                <dl className="mb-5 grid grid-cols-3 gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                                                    <div>
                                                        <dt className="text-[11px] text-slate-500">Questions</dt>
                                                        <dd className="text-sm font-semibold text-slate-800">{p.total_questions}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-[11px] text-slate-500">Marks</dt>
                                                        <dd className="text-sm font-semibold text-slate-800">{p.total_marks}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-[11px] text-slate-500">Duration</dt>
                                                        <dd className="text-sm font-semibold text-slate-800">{p.duration_minutes ?? '-'}</dd>
                                                    </div>
                                                </dl>

                                                <Link
                                                    href={href}
                                                    className="touch-target mt-auto inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                                >
                                                    {ctaLabel}
                                                </Link>
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
