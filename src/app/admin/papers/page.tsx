/**
 * @fileoverview Papers List Page
 * @description Admin page to view and manage all papers
 */

import { sbSSR } from '@/lib/supabase/server';
import { adminLogger } from '@/lib/logger';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PaperActions from './PaperActions';
import ImportPaperButton from './ImportPaperButton';

export default async function PapersPage() {
    const supabase = await sbSSR();

    // Server-side admin verification
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

    let isAdmin = role === 'admin' || role === 'dev';

    if (!isAdmin) {
        const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
        isAdmin = !rpcError && Boolean(isAdminRpc);
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    const { data: papers, error } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        adminLogger.dataModified('papers', 'fetch_error', { error });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Papers</h1>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <ImportPaperButton />
                    <Link
                        href="/admin/papers/new"
                        className="touch-target inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Paper
                    </Link>
                </div>
            </div>

            {papers && papers.length > 0 ? (
                <>
                    <div className="space-y-3 md:hidden">
                        {papers.map((paper) => (
                            <article key={paper.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-semibold text-gray-900">{paper.title}</h2>
                                        <p className="mt-1 truncate text-xs text-gray-500">{paper.slug}</p>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${paper.published
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {paper.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                <dl className="mobile-kv mt-3">
                                    <div>
                                        <dt>Year</dt>
                                        <dd>{paper.year}</dd>
                                    </div>
                                    <div>
                                        <dt>Questions</dt>
                                        <dd>{paper.total_questions}</dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt>Created</dt>
                                        <dd>{new Date(paper.created_at).toLocaleDateString()}</dd>
                                    </div>
                                </dl>

                                <div className="mt-4 border-t border-gray-100 pt-3 text-sm">
                                    <PaperActions paperId={paper.id} />
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Year
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Questions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {papers.map((paper) => (
                                    <tr key={paper.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{paper.title}</div>
                                                <div className="text-sm text-gray-500">{paper.slug}</div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {paper.year}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {paper.total_questions}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${paper.published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {paper.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {new Date(paper.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <PaperActions paperId={paper.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
                    No papers found.{' '}
                    <Link href="/admin/papers/new" className="text-blue-600 hover:underline">
                        Create your first paper
                    </Link>
                </div>
            )}
        </div>
    );
}
