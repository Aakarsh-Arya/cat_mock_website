/**
 * @fileoverview Paper Questions Page
 * @description Admin page listing questions for a paper
 */

import 'server-only';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { sbSSR } from '@/lib/supabase/server';
import QuestionRowActions from '@/app/admin/questions/QuestionRowActions';

interface PageProps {
    params: Promise<{ paperId: string }>;
}

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations require service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export default async function PaperQuestionsPage({ params }: PageProps) {
    const { paperId } = await params;
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

    const { data: paper, error: paperError } = await supabase
        .from('papers')
        .select('id, title')
        .eq('id', paperId)
        .single();

    if (paperError || !paper) {
        notFound();
    }

    const adminClient = getAdminClient();
    const { data: questions } = await adminClient
        .from('questions')
        .select('id, section, question_number, question_type, topic, is_active')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('question_number', { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
                    <p className="text-sm text-gray-500">{paper.title}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Link
                        href={`/admin/papers/${paperId}/edit`}
                        className="touch-target inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                    >
                        Live Edit
                    </Link>
                    <Link
                        href={`/admin/papers/${paperId}/settings`}
                        className="touch-target inline-flex items-center justify-center rounded-md bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Settings
                    </Link>
                </div>
            </div>

            {questions && questions.length > 0 ? (
                <>
                    <div className="space-y-3 md:hidden">
                        {questions.map((q) => (
                            <article key={q.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Question #{q.question_number}</p>
                                        <p className="mt-1 text-sm font-semibold text-gray-900">{q.section} - {q.question_type}</p>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${q.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {q.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">Topic: {q.topic || '-'}</p>
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    <QuestionRowActions
                                        questionId={q.id}
                                        isActive={q.is_active}
                                        editHref={`/admin/papers/${paperId}/edit?qid=${q.id}`}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Section</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Topic</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm text-gray-700">{q.question_number}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{q.section}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{q.question_type}</td>
                                        <td className="px-6 py-3 text-sm text-gray-500">{q.topic || '-'}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${q.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {q.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-sm font-medium">
                                            <QuestionRowActions
                                                questionId={q.id}
                                                isActive={q.is_active}
                                                editHref={`/admin/papers/${paperId}/edit?qid=${q.id}`}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center text-gray-500">
                    No questions found for this paper.
                </div>
            )}
        </div>
    );
}
