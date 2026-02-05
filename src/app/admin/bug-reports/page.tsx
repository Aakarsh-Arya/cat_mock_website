/**
 * @fileoverview Bug Reports Admin Page
 * @description Admin-only view of user-submitted bug reports
 */

import { sbSSR } from '@/lib/supabase/server';
import { createClient, type PostgrestSingleResponse } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import BugReportStatusSelect from './BugReportStatusSelect';

type BugReportRow = {
    id: string;
    user_id: string | null;
    route: string | null;
    description: string;
    screenshot_path: string | null;
    meta: Record<string, unknown> | null;
    status?: string | null;
    created_at: string;
};

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin pages require service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export default async function BugReportsPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
    const supabase = await sbSSR();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/auth/sign-in');
    }

    const { data: { session } } = await supabase.auth.getSession();
    let role: string | null = session?.user?.app_metadata?.user_role ?? null;

    if (!role && session?.access_token) {
        try {
            const payload = JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString('utf-8')) as {
                user_role?: string;
                app_metadata?: { user_role?: string };
            };
            role = payload.user_role ?? payload.app_metadata?.user_role ?? null;
        } catch {
            role = null;
        }
    }

    let isAdmin = role === 'admin';
    if (!isAdmin) {
        const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
        isAdmin = !rpcError && Boolean(isAdminRpc);
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    const adminClient = getAdminClient();

    let hasStatusColumn = true;
    const statusFilterRaw = typeof searchParams?.status === 'string' ? searchParams?.status : Array.isArray(searchParams?.status) ? searchParams?.status[0] : undefined;
    const statusFilter = statusFilterRaw && ['unchecked', 'in_progress', 'resolved'].includes(statusFilterRaw) ? statusFilterRaw : 'all';
    const sortModeRaw = typeof searchParams?.sort === 'string' ? searchParams?.sort : Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : undefined;
    const sortMode = sortModeRaw === 'status' ? 'status' : 'created';
    let reportsResponse: PostgrestSingleResponse<BugReportRow[]> = await adminClient
        .from('bug_reports')
        .select('id, user_id, route, description, screenshot_path, meta, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

    if (
        reportsResponse.error?.code === '42703' ||
        reportsResponse.error?.message?.toLowerCase().includes('status') ||
        reportsResponse.error?.details?.toLowerCase().includes('status')
    ) {
        hasStatusColumn = false;
        reportsResponse = (await adminClient
            .from('bug_reports')
            .select('id, user_id, route, description, screenshot_path, meta, created_at')
            .order('created_at', { ascending: false })
            .limit(100)) as PostgrestSingleResponse<BugReportRow[]>;
    }

    if (reportsResponse.error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load bug reports: {reportsResponse.error.message}
            </div>
        );
    }

    let safeReports = (reportsResponse.data ?? []) as BugReportRow[];
    if (hasStatusColumn && statusFilter !== 'all') {
        safeReports = safeReports.filter((report) => report.status === statusFilter);
    }
    if (hasStatusColumn && sortMode === 'status') {
        const statusOrder: Record<string, number> = { unchecked: 0, in_progress: 1, resolved: 2 };
        safeReports = [...safeReports].sort((a, b) => {
            const aRank = statusOrder[a.status ?? ''] ?? 99;
            const bRank = statusOrder[b.status ?? ''] ?? 99;
            if (aRank !== bRank) return aRank - bRank;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }
    const uniqueUserIds = Array.from(new Set(safeReports.map((report) => report.user_id).filter(Boolean))) as string[];
    const userEmailMap: Record<string, string> = {};

    await Promise.all(
        uniqueUserIds.map(async (userId) => {
            try {
                const { data } = await adminClient.auth.admin.getUserById(userId);
                userEmailMap[userId] = data?.user?.email ?? userId;
            } catch {
                userEmailMap[userId] = userId;
            }
        })
    );

    const signedUrlMap: Record<string, string> = {};
    safeReports.forEach((report) => {
        if (report.screenshot_path && report.screenshot_path.startsWith('http')) {
            signedUrlMap[report.id] = report.screenshot_path;
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bug Reports</h1>
                <p className="text-sm text-gray-500">Most recent user-reported issues (latest 100).</p>
            </div>
            {hasStatusColumn && (
                <form className="flex flex-wrap items-center gap-3 text-sm" method="GET">
                    <label className="text-gray-600">
                        Status
                        <select
                            name="status"
                            defaultValue={statusFilter}
                            className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                        >
                            <option value="all">All</option>
                            <option value="unchecked">Unchecked</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </label>
                    <label className="text-gray-600">
                        Sort
                        <select
                            name="sort"
                            defaultValue={sortMode}
                            className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                        >
                            <option value="created">Newest first</option>
                            <option value="status">By status</option>
                        </select>
                    </label>
                    <button
                        type="submit"
                        className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        Apply
                    </button>
                </form>
            )}
            {!hasStatusColumn && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Bug report statuses are disabled because the <code>status</code> column is missing.
                    Run <code>docs/migrations/017_bug_report_status.sql</code> to enable it.
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reported By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Route
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            {hasStatusColumn && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Screenshot
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {safeReports.length > 0 ? (
                            safeReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <div className="font-medium text-gray-900">
                                            {report.user_id ? (userEmailMap[report.user_id] ?? report.user_id) : 'Unknown'}
                                        </div>
                                        {report.user_id && userEmailMap[report.user_id] !== report.user_id && (
                                            <div className="text-xs text-gray-500">{report.user_id}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {report.route || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <details className="max-w-xl">
                                            <summary className="cursor-pointer text-xs text-blue-600">View full description</summary>
                                            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                                                {report.description}
                                            </p>
                                        </details>
                                        {report.meta && (
                                            <details className="mt-2 text-xs text-gray-500">
                                                <summary className="cursor-pointer">View metadata</summary>
                                                <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(report.meta, null, 2)}</pre>
                                            </details>
                                        )}
                                    </td>
                                    {hasStatusColumn && (
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <BugReportStatusSelect reportId={report.id} status={report.status} />
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-sm">
                                        {signedUrlMap[report.id] ? (
                                            <a
                                                className="text-blue-600 hover:text-blue-900 hover:underline"
                                                href={signedUrlMap[report.id]}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(report.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={hasStatusColumn ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                                    No bug reports yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
