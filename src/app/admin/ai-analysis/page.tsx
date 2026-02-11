/**
 * @fileoverview Admin AI Analysis Dashboard
 * @description Lists attempts with ai_analysis_status != 'none' for admin review.
 * @route /admin/ai-analysis
 */

import Link from 'next/link';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import DownloadExportButton from './DownloadExportButton';
import InsightTextEditor from './InsightTextEditor';

export const dynamic = 'force-dynamic';

export default async function AIAnalysisDashboard() {
    const admin = getServiceRoleClient();

    const { data: rawAttempts, error } = await admin
        .from('attempts')
        .select('*')
        .order('submitted_at', { ascending: false, nullsFirst: false });

    const attempts = (rawAttempts ?? []).filter(
        (a) => a.ai_analysis_status && a.ai_analysis_status !== 'none'
    );

    const userIds = Array.from(new Set((attempts ?? []).map((a) => a.user_id).filter(Boolean)));
    const paperIds = Array.from(new Set((attempts ?? []).map((a) => a.paper_id).filter(Boolean)));

    const userEmailMap = new Map<string, string>();
    if (userIds.length > 0) {
        for (const uid of userIds) {
            const { data: { user } } = await admin.auth.admin.getUserById(uid);
            if (user?.email) userEmailMap.set(uid, user.email);
        }
    }

    const paperMap = new Map<string, { slug: string; title: string }>();
    if (paperIds.length > 0) {
        const { data: papers } = await admin
            .from('papers')
            .select('id, slug, title')
            .in('id', paperIds);
        (papers ?? []).forEach((p) => paperMap.set(p.id, { slug: p.slug, title: p.title }));
    }

    const statusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            requested: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Requested' },
            exported: { bg: 'bg-green-100', text: 'text-green-800', label: 'Exported' },
            processed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processed' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
        };
        const c = config[status] ?? { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
                {c.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">NexAI Insight Requests</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage prompt requests, export analysis context, and paste finalized NexAI insight text.
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="touch-target inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                >
                    Back to Admin
                </Link>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Failed to load analysis requests: {error.message}
                </div>
            )}

            {(!attempts || attempts.length === 0) && !error && (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                    <svg className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-gray-500">No analysis requests yet.</p>
                    <p className="mt-1 text-sm text-gray-400">
                        Users can request NexAI insight from their result page after completing a mock.
                    </p>
                </div>
            )}

            {attempts && attempts.length > 0 && (
                <>
                    <div className="space-y-3 md:hidden">
                        {attempts.map((a) => {
                            const paperInfo = paperMap.get(a.paper_id);
                            const email = userEmailMap.get(a.user_id);
                            return (
                                <article key={a.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">Attempt {a.id.slice(0, 8)}...</p>
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {paperInfo?.title ?? `Paper ${a.paper_id.slice(0, 8)}...`}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-gray-500">
                                                {email ?? (a.user_id ? a.user_id.slice(0, 8) : 'Unknown')}
                                            </p>
                                        </div>
                                        {statusBadge(a.ai_analysis_status)}
                                    </div>

                                    <dl className="mobile-kv mt-3">
                                        <div>
                                            <dt>Score</dt>
                                            <dd>{a.total_score != null ? a.total_score : '-'}</dd>
                                        </div>
                                        <div>
                                            <dt>Percentile</dt>
                                            <dd>{a.percentile != null ? `${a.percentile}%` : '-'}</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt>Requested At</dt>
                                            <dd>{a.ai_analysis_requested_at ? new Date(a.ai_analysis_requested_at).toLocaleString() : '-'}</dd>
                                        </div>
                                    </dl>

                                    {a.ai_analysis_user_prompt && (
                                        <details className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                                            <summary className="cursor-pointer font-medium text-blue-600">View prompt</summary>
                                            <p className="mt-2 whitespace-pre-wrap text-gray-700">{a.ai_analysis_user_prompt}</p>
                                        </details>
                                    )}

                                    {a.ai_analysis_error && (
                                        <p className="mt-2 text-xs text-red-500">{a.ai_analysis_error}</p>
                                    )}

                                    <div className="mt-3 rounded-md border border-gray-200 p-3">
                                        <InsightTextEditor attemptId={a.id} initialText={a.ai_analysis_result_text} />
                                    </div>
                                    <div className="mt-3">
                                        <DownloadExportButton attemptId={a.id} />
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
                        <div className="mobile-table-scroll">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Attempt
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Mock
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Score
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Percentile
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            User Prompt
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Requested At
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            NexAI Insight Text
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {attempts.map((a) => {
                                        const paperInfo = paperMap.get(a.paper_id);
                                        const email = userEmailMap.get(a.user_id);
                                        return (
                                            <tr key={a.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                                    {a.id.slice(0, 8)}...
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {email ?? (
                                                        <span className="font-mono text-xs text-gray-400">
                                                            {a.user_id ? `${a.user_id.slice(0, 8)}...` : 'Unknown'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {paperInfo?.title ?? (
                                                        <span className="font-mono text-xs text-gray-400">
                                                            {a.paper_id ? `${a.paper_id.slice(0, 8)}...` : 'Unknown'}
                                                        </span>
                                                    )}
                                                    {paperInfo?.slug && (
                                                        <p className="mt-1 text-xs text-gray-500">{paperInfo.slug}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {a.total_score != null ? a.total_score : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {a.percentile != null ? `${a.percentile}%` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {statusBadge(a.ai_analysis_status)}
                                                    {a.ai_analysis_error && (
                                                        <p className="mt-1 max-w-[200px] truncate text-xs text-red-500" title={a.ai_analysis_error}>
                                                            {a.ai_analysis_error}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="max-w-[280px] px-4 py-3 text-xs text-gray-700">
                                                    {a.ai_analysis_user_prompt ? (
                                                        <details>
                                                            <summary className="cursor-pointer text-blue-600">View prompt</summary>
                                                            <p className="mt-1 whitespace-pre-wrap break-words text-gray-700">
                                                                {a.ai_analysis_user_prompt}
                                                            </p>
                                                        </details>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {a.ai_analysis_requested_at
                                                        ? new Date(a.ai_analysis_requested_at).toLocaleString()
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    <InsightTextEditor attemptId={a.id} initialText={a.ai_analysis_result_text} />
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm">
                                                    <DownloadExportButton attemptId={a.id} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
