/**
 * @fileoverview Admin AI Analysis Dashboard
 * @description Lists attempts with ai_analysis_status='requested' for admin
 *   to review and download composite context exports.
 * @route /admin/ai-analysis
 * @blueprint AI Analysis Export — Phase 3 (docs/AI_ANALYSIS_EXPORT.md)
 */

import Link from 'next/link';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import DownloadExportButton from './DownloadExportButton';
import InsightTextEditor from './InsightTextEditor';

export const dynamic = 'force-dynamic';

export default async function AIAnalysisDashboard() {
    const admin = getServiceRoleClient();

    // Fetch all attempts with analysis requested/exported/failed — most recent first
    // Use select('*') to avoid "column does not exist" errors if migration hasn't been run
    const { data: rawAttempts, error } = await admin
        .from('attempts')
        .select('*')
        .order('submitted_at', { ascending: false, nullsFirst: false });

    // Filter to only attempts with ai_analysis_status != 'none' (column may not exist yet)
    const attempts = (rawAttempts ?? []).filter(
        (a) => a.ai_analysis_status && a.ai_analysis_status !== 'none'
    );

    // Collect unique user and paper IDs for lookup
    const userIds = Array.from(new Set((attempts ?? []).map(a => a.user_id).filter(Boolean)));
    const paperIds = Array.from(new Set((attempts ?? []).map(a => a.paper_id).filter(Boolean)));

    // Batch-fetch user emails from auth.users via service role
    const userEmailMap = new Map<string, string>();
    if (userIds.length > 0) {
        // Use admin API to list users — batched approach
        for (const uid of userIds) {
            const { data: { user } } = await admin.auth.admin.getUserById(uid);
            if (user?.email) userEmailMap.set(uid, user.email);
        }
    }

    // Batch-fetch paper slugs/titles
    const paperMap = new Map<string, { slug: string; title: string }>();
    if (paperIds.length > 0) {
        const { data: papers } = await admin
            .from('papers')
            .select('id, slug, title')
            .in('id', paperIds);

        (papers ?? []).forEach(p => paperMap.set(p.id, { slug: p.slug, title: p.title }));
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
                {c.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">NexAI Insight Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage prompt requests, export analysis context, and paste finalized NexAI insight text.
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                    ← Back to Admin
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    Failed to load analysis requests: {error.message}
                </div>
            )}

            {(!attempts || attempts.length === 0) && !error && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-gray-500">No analysis requests yet.</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Users can request NexAI insight from their result page after completing a mock.
                    </p>
                </div>
            )}

            {attempts && attempts.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attempt
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mock
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentile
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Prompt
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Requested At
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NexAI Insight Text
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                            <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                                {a.id.slice(0, 8)}…
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {email ?? (
                                                    <span className="text-gray-400 font-mono text-xs">
                                                        {a.user_id.slice(0, 8)}…
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {paperInfo?.title ?? (
                                                    <span className="text-gray-400 font-mono text-xs">
                                                        {a.paper_id.slice(0, 8)}…
                                                    </span>
                                                )}
                                                {paperInfo?.slug && (
                                                    <p className="text-xs text-gray-500 mt-1">{paperInfo.slug}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                {a.total_score != null ? a.total_score : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {a.percentile != null ? `${a.percentile}%` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {statusBadge(a.ai_analysis_status)}
                                                {a.ai_analysis_error && (
                                                    <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={a.ai_analysis_error}>
                                                        {a.ai_analysis_error}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700 max-w-[280px]">
                                                {a.ai_analysis_user_prompt ? (
                                                    <details>
                                                        <summary className="cursor-pointer text-blue-600">View prompt</summary>
                                                        <p className="mt-1 whitespace-pre-wrap break-words text-gray-700">
                                                            {a.ai_analysis_user_prompt}
                                                        </p>
                                                    </details>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {a.ai_analysis_requested_at
                                                    ? new Date(a.ai_analysis_requested_at).toLocaleString()
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                <InsightTextEditor
                                                    attemptId={a.id}
                                                    initialText={a.ai_analysis_result_text}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <DownloadExportButton attemptId={a.id} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
