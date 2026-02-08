/**
 * @fileoverview Admin Dashboard
 * @description Main admin page with overview statistics and quick actions
 */

import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { updateSignupMode } from './access-control/actions';

export default async function AdminPage() {
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

    // Fetch statistics
    const [papersResult, questionsResult, attemptsResult] = await Promise.all([
        supabase.from('papers').select('id, published', { count: 'exact' }),
        supabase.from('questions').select('id', { count: 'exact' }),
        supabase.from('attempts').select('id, status', { count: 'exact' }),
    ]);

    let signupMode = 'GATED';
    let pendingAccessRequests = 0;

    try {
        const { data: settingRow } = await supabase
            .from('app_settings')
            .select('setting_value')
            .eq('setting_key', 'signup_mode')
            .maybeSingle();
        if (settingRow?.setting_value === 'OPEN' || settingRow?.setting_value === 'GATED') {
            signupMode = settingRow.setting_value;
        }

        const { count } = await supabase
            .from('access_requests')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending');
        pendingAccessRequests = count ?? 0;
    } catch {
        // Ignore missing tables during early migrations.
    }

    const totalPapers = papersResult.count || 0;
    const publishedPapers = papersResult.data?.filter(p => p.published).length || 0;
    const totalQuestions = questionsResult.count || 0;
    const totalAttempts = attemptsResult.count || 0;
    const completedAttempts = attemptsResult.data?.filter(a => a.status === 'completed').length || 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Papers</p>
                            <p className="text-3xl font-bold text-gray-900">{totalPapers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{publishedPapers} published</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Questions</p>
                            <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Across all papers</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Attempts</p>
                            <p className="text-3xl font-bold text-gray-900">{totalAttempts}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{completedAttempts} completed</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Of all attempts</p>
                </div>
            </div>

            {/* Access Control */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Launch Controls</h2>
                        <p className="text-sm text-gray-500">Pending requests: {pendingAccessRequests}</p>
                    </div>
                    <Link
                        href="/admin/access-control"
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                        Manage access
                    </Link>
                </div>
                <form action={updateSignupMode} className="flex flex-wrap items-center gap-3">
                    <select
                        name="signup_mode"
                        defaultValue={signupMode}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="OPEN">OPEN (auto-approve)</option>
                        <option value="GATED">GATED (waitlist)</option>
                    </select>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                    >
                        Update mode
                    </button>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${signupMode === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {signupMode}
                    </span>
                </form>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/admin/papers"
                        className="flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-indigo-900">Live Edit Papers</p>
                            <p className="text-sm text-indigo-600">Edit papers in mock exam view</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/papers/new"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Create New Paper</p>
                            <p className="text-sm text-gray-500">Add a new mock test paper</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/questions/new"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Add Question</p>
                            <p className="text-sm text-gray-500">Add a question to a paper</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/access-control"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 0c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Access Control</p>
                            <p className="text-sm text-gray-500">Review waitlist & mode</p>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}
