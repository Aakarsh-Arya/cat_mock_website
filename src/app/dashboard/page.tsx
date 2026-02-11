import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

type Attempt = {
    id: string;
    paper_id: string;
    status: string;
    total_score: number | null;
    max_possible_score: number | null;
    accuracy: number | null;
    percentile: number | null;
    rank: number | null;
    correct_count: number | null;
    incorrect_count: number | null;
    started_at: string | null;
    completed_at: string | null;
    time_taken_seconds: number | null;
    papers: { title: string; total_marks: number } | null;
};

type UserProfile = {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    total_mocks_taken: number;
    best_percentile: number | null;
    target_percentile: number | null;
};

function formatTime(seconds: number | null): string {
    if (seconds == null) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedSecs = secs.toString().padStart(2, '0');
    return `${mins}m ${paddedSecs}s`;
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'completed':
            return 'bg-emerald-600 text-white';
        case 'in_progress':
            return 'bg-amber-500 text-white';
        case 'paused':
            return 'bg-orange-600 text-white';
        case 'abandoned':
            return 'bg-slate-500 text-white';
        default:
            return 'bg-slate-400 text-white';
    }
}

function getActionConfig(attempt: Attempt): { href: string | null; label: string | null; className: string } {
    if (attempt.status === 'in_progress' || attempt.status === 'paused') {
        return {
            href: `/exam/${attempt.id}`,
            label: 'Continue',
            className: 'text-amber-700 hover:text-amber-800',
        };
    }

    if (attempt.status === 'completed') {
        return {
            href: `/result/${attempt.id}`,
            label: 'View Result',
            className: 'text-blue-700 hover:text-blue-800',
        };
    }

    return {
        href: null,
        label: null,
        className: 'text-slate-400',
    };
}

function attemptDisplayTitle(a: Attempt): string {
    return a.papers?.title ?? `Paper ${a.paper_id.slice(0, 8)}...`;
}

function attemptDisplayScore(a: Attempt): string {
    if (a.total_score === null) return '-';
    return `${a.total_score}/${a.max_possible_score || a.papers?.total_marks || 198}`;
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const supabase = await sbSSR();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
                <p className="mt-2 text-slate-600">You need to sign in to access your dashboard.</p>
                <Link
                    href="/auth/sign-in?redirect_to=/dashboard"
                    className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                    Sign In
                </Link>
            </main>
        );
    }

    const { data: profile } = (await supabase
        .from('users')
        .select('id, name, email, avatar_url, total_mocks_taken, best_percentile, target_percentile')
        .eq('id', user.id)
        .maybeSingle()) as { data: UserProfile | null };

    const { data, error } = await supabase
        .from('attempts')
        .select(`
            id, paper_id, status, total_score, max_possible_score, accuracy, percentile, rank,
            correct_count, incorrect_count, started_at, completed_at, time_taken_seconds,
            papers (title, total_marks)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

    const attempts: Attempt[] = (data ?? []).map((a) => ({
        ...a,
        papers: Array.isArray(a.papers) ? a.papers[0] : a.papers,
    }));

    const completedAttempts = attempts.filter((a) => a.status === 'completed');
    const totalMocks = completedAttempts.length;
    const averageScore =
        totalMocks > 0 ? completedAttempts.reduce((sum, a) => sum + (a.total_score || 0), 0) / totalMocks : 0;
    const bestScore = totalMocks > 0 ? Math.max(...completedAttempts.map((a) => a.total_score || 0)) : 0;
    const bestPercentile =
        totalMocks > 0 ? Math.max(...completedAttempts.map((a) => a.percentile || 0)) : 0;

    return (
        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {params.error === 'unauthorized' && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                    <span className="text-lg">!</span>
                    <span>You don&apos;t have admin access. Contact the administrator to request access.</span>
                </div>
            )}

            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Dashboard</h1>
                    <p className="mt-2 text-sm text-slate-600 sm:text-base">Welcome back, {profile?.name || user.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Link
                        href="/admin"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-950"
                    >
                        Admin
                    </Link>
                    <Link
                        href="/mocks"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        New Mock
                    </Link>
                    <a
                        href="/auth/logout"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Logout
                    </a>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-blue-50 px-4 py-5 text-center">
                    <p className="text-sm text-blue-700">Mocks Completed</p>
                    <p className="mt-2 text-3xl font-bold text-blue-700">{totalMocks}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-5 text-center">
                    <p className="text-sm text-emerald-700">Best Score</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">{bestScore.toFixed(0)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 px-4 py-5 text-center">
                    <p className="text-sm text-amber-700">Average Score</p>
                    <p className="mt-2 text-3xl font-bold text-amber-700">{averageScore.toFixed(1)}</p>
                </div>
                <div className="rounded-xl bg-fuchsia-50 px-4 py-5 text-center">
                    <p className="text-sm text-fuchsia-700">Best Percentile</p>
                    <p className="mt-2 text-3xl font-bold text-fuchsia-700">
                        {bestPercentile > 0 ? bestPercentile.toFixed(1) : '-'}
                    </p>
                </div>
            </div>

            {profile?.target_percentile && (
                <div className="mb-8 rounded-xl bg-slate-100 p-4 sm:p-5">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm sm:text-base">
                        <span>Progress to Target ({profile.target_percentile}%ile)</span>
                        <span>
                            {bestPercentile > 0
                                ? `${((bestPercentile / profile.target_percentile) * 100).toFixed(0)}%`
                                : '0%'}
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-slate-300">
                        <div
                            className="h-full rounded bg-emerald-600"
                            style={{
                                width: `${Math.min((bestPercentile / profile.target_percentile) * 100, 100)}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            <h2 className="mb-4 text-xl font-semibold text-slate-900">My Attempts</h2>

            {error ? (
                <p className="text-red-700">Failed to load attempts. Please try again later.</p>
            ) : attempts.length === 0 ? (
                <div className="rounded-xl bg-slate-100 px-6 py-10 text-center">
                    <h3 className="text-lg font-semibold text-slate-900">No attempts yet</h3>
                    <p className="mt-2 text-slate-600">Start your CAT preparation by taking a mock test.</p>
                    <Link
                        href="/mocks"
                        className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Browse Mocks
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-3 md:hidden">
                        {attempts.map((a) => {
                            const action = getActionConfig(a);
                            return (
                                <article key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-semibold text-slate-900">{attemptDisplayTitle(a)}</h3>
                                        <span
                                            className={`rounded px-2 py-1 text-[11px] font-bold ${getStatusBadgeClass(a.status)}`}
                                        >
                                            {a.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                        <div>
                                            <dt className="text-slate-500">Score</dt>
                                            <dd className="font-semibold text-slate-900">{attemptDisplayScore(a)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Accuracy</dt>
                                            <dd className="font-semibold text-slate-900">
                                                {a.accuracy !== null ? `${a.accuracy.toFixed(1)}%` : '-'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Percentile</dt>
                                            <dd className="font-semibold text-slate-900">
                                                {a.percentile !== null ? a.percentile.toFixed(1) : '-'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Time</dt>
                                            <dd className="font-semibold text-slate-900">{formatTime(a.time_taken_seconds)}</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-slate-500">Date</dt>
                                            <dd className="font-semibold text-slate-900">
                                                {a.started_at ? new Date(a.started_at).toLocaleDateString() : '-'}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4">
                                        {action.href && action.label ? (
                                            <Link
                                                href={action.href}
                                                className={`inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold ${action.className}`}
                                            >
                                                {action.label}
                                            </Link>
                                        ) : (
                                            <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-400">
                                                -
                                            </span>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
                        <table className="min-w-[860px] w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-left text-sm text-slate-700">
                                    <th className="border-b border-slate-200 px-3 py-3 font-semibold">Paper</th>
                                    <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold">Status</th>
                                    <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold">Score</th>
                                    <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold">Accuracy</th>
                                    <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold">Percentile</th>
                                    <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold">Time Taken</th>
                                    <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold">Date</th>
                                    <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((a) => {
                                    const action = getActionConfig(a);
                                    return (
                                        <tr key={a.id} className="border-b border-slate-100 text-sm">
                                            <td className="px-3 py-3">
                                                <strong>{attemptDisplayTitle(a)}</strong>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span
                                                    className={`rounded px-2 py-1 text-[11px] font-bold ${getStatusBadgeClass(a.status)}`}
                                                >
                                                    {a.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center font-semibold">{attemptDisplayScore(a)}</td>
                                            <td className="px-3 py-3 text-center">
                                                {a.accuracy !== null ? `${a.accuracy.toFixed(1)}%` : '-'}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {a.percentile !== null ? a.percentile.toFixed(1) : '-'}
                                            </td>
                                            <td className="px-3 py-3 text-center">{formatTime(a.time_taken_seconds)}</td>
                                            <td className="px-3 py-3 text-center text-slate-600">
                                                {a.started_at ? new Date(a.started_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {action.href && action.label ? (
                                                    <Link href={action.href} className={`font-semibold ${action.className}`}>
                                                        {action.label}
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
