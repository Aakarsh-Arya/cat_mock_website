/**
 * @fileoverview Questions List Page
 * @description Admin page to view and manage all questions
 */

import { sbSSR } from '@/lib/supabase/server';
import { adminLogger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import QuestionRowActions from './QuestionRowActions';

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

export default async function QuestionsPage() {
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

    let isAdmin = role === 'admin' || role === 'dev';

    if (!isAdmin) {
        const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
        isAdmin = !rpcError && Boolean(isAdminRpc);
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    const adminClient = getAdminClient();

    // Fetch questions with their paper info
    const { data: questions, error } = await adminClient
        .from('questions')
        .select(`
            *,
            papers (id, title, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        adminLogger.dataModified('questions', 'fetch_error', { error });
    }

    // TODO: Implement paper filter dropdown
    // Future: Fetch papers for filter
    // const { data: papers } = await supabase.from('papers').select('id, title').order('title');

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
                <Link
                    href="/admin/questions/new"
                    className="touch-target inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Question
                </Link>
            </div>

            {questions && questions.length > 0 ? (
                <>
                    <div className="space-y-3 md:hidden">
                        {questions.map((question) => (
                            <article key={question.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Question #{question.question_number}</p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {question.question_text.substring(0, 120)}...
                                        </p>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${question.question_type === 'MCQ'
                                        ? 'bg-gray-100 text-gray-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {question.question_type}
                                    </span>
                                </div>

                                <dl className="mobile-kv">
                                    <div className="col-span-2">
                                        <dt>Paper</dt>
                                        <dd>{question.papers?.title || 'Unknown'}</dd>
                                    </div>
                                    <div>
                                        <dt>Section</dt>
                                        <dd>{question.section}</dd>
                                    </div>
                                    <div>
                                        <dt>Status</dt>
                                        <dd>{question.is_active ? 'Active' : 'Inactive'}</dd>
                                    </div>
                                </dl>

                                <div className="mt-4 border-t border-gray-100 pt-3">
                                    <QuestionRowActions
                                        questionId={question.id}
                                        isActive={question.is_active}
                                        editHref={`/admin/papers/${question.paper_id}/edit`}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Question
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Paper
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Section
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {questions.map((question) => (
                                    <tr key={question.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {question.question_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="line-clamp-2 max-w-md text-sm text-gray-900">
                                                {question.question_text.substring(0, 100)}...
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {question.papers?.title || 'Unknown'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${question.section === 'VARC' ? 'bg-blue-100 text-blue-800' :
                                                question.section === 'DILR' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {question.section}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${question.question_type === 'MCQ'
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {question.question_type}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <QuestionRowActions
                                                questionId={question.id}
                                                isActive={question.is_active}
                                                editHref={`/admin/papers/${question.paper_id}/edit`}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
                    No questions found.{' '}
                    <Link href="/admin/questions/new" className="text-blue-600 hover:underline">
                        Add your first question
                    </Link>
                </div>
            )}
        </div>
    );
}
