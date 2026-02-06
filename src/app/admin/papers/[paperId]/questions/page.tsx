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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
                    <p className="text-sm text-gray-500">{paper.title}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/papers/${paperId}/edit`}
                        className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Live Edit
                    </Link>
                    <Link
                        href={`/admin/papers/${paperId}/settings`}
                        className="px-3 py-2 text-sm rounded-md bg-slate-700 text-white hover:bg-slate-800"
                    >
                        Settings
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {questions && questions.length > 0 ? (
                            questions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-700">{q.question_number}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700">{q.section}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700">{q.question_type}</td>
                                    <td className="px-6 py-3 text-sm text-gray-500">{q.topic || '—'}</td>
                                    <td className="px-6 py-3 text-sm">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${q.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No questions found for this paper.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
