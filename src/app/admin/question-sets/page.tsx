/**
 * @fileoverview Admin Question Sets Page
 * @description List and manage question sets (RC passages, DI sets, etc.)
 * @blueprint Question Container Architecture
 */

import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function QuestionSetsPage() {
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

    // Fetch all question sets with question counts
    const { data: questionSets, error } = await supabase
        .from('question_sets')
        .select(`
            *,
            papers!inner(title, slug)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching question sets:', error);
    }

    // Define type for question set from database
    type QuestionSetRow = NonNullable<typeof questionSets>[number];

    interface GroupedSet {
        paper: { title: string; slug: string };
        sets: QuestionSetRow[];
    }

    // Group by paper for display
    const groupedSets = (questionSets ?? []).reduce<Record<string, GroupedSet>>((acc, set) => {
        const paperId = set.paper_id;
        if (!acc[paperId]) {
            acc[paperId] = {
                paper: set.papers,
                sets: [],
            };
        }
        acc[paperId].sets.push(set);
        return acc;
    }, {});

    const getSetTypeColor = (setType: string) => {
        switch (setType) {
            case 'VARC': return 'bg-purple-100 text-purple-800';
            case 'DILR': return 'bg-orange-100 text-orange-800';
            case 'CASELET': return 'bg-blue-100 text-blue-800';
            case 'ATOMIC': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSectionColor = (section: string) => {
        switch (section) {
            case 'VARC': return 'bg-section-varc/10 text-section-varc';
            case 'DILR': return 'bg-section-dilr/10 text-section-dilr';
            case 'QA': return 'bg-section-qa/10 text-section-qa';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Question Sets</h1>
                    <p className="text-gray-600 mt-1">
                        Manage RC passages, DI/LR sets, and grouped questions
                    </p>
                </div>
                <Link
                    href="/admin/question-sets/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Question Set
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Total Sets</p>
                    <p className="text-2xl font-bold">{questionSets?.length ?? 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg shadow p-4">
                    <p className="text-sm text-purple-600">VARC Passages</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {questionSets?.filter(s => s.set_type === 'VARC').length ?? 0}
                    </p>
                </div>
                <div className="bg-orange-50 rounded-lg shadow p-4">
                    <p className="text-sm text-orange-600">DILR Sets</p>
                    <p className="text-2xl font-bold text-orange-700">
                        {questionSets?.filter(s => s.set_type === 'DILR').length ?? 0}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">Atomic Questions</p>
                    <p className="text-2xl font-bold text-gray-700">
                        {questionSets?.filter(s => s.set_type === 'ATOMIC').length ?? 0}
                    </p>
                </div>
            </div>

            {/* Question Sets List */}
            {Object.keys(groupedSets).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Sets Yet</h3>
                    <p className="text-gray-500 mb-4">
                        Create your first question set to organize RC passages, DI/LR sets, and grouped questions.
                    </p>
                    <Link
                        href="/admin/question-sets/new"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Question Set
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedSets).map(([paperId, { paper, sets }]) => (
                        <div key={paperId} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h2 className="font-semibold text-gray-900">{paper.title}</h2>
                                <p className="text-sm text-gray-500">{sets.length} question set(s)</p>
                            </div>
                            <div className="divide-y">
                                {sets.map((set) => (
                                    <div key={set.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSectionColor(set.section)}`}>
                                                        {set.section}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSetTypeColor(set.set_type)}`}>
                                                        {set.set_type}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {set.context_title || `Set #${set.display_order}`}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {set.question_count} question(s) •
                                                        Layout: {set.content_layout}
                                                        {set.is_published && (
                                                            <span className="ml-2 text-green-600">✓ Published</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/question-sets/${set.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                        {set.context_body && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {set.context_body.substring(0, 200)}...
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
