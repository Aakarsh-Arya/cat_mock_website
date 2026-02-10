/**
 * @fileoverview Admin Access Control
 * @description Manage signup mode and waitlist access requests
 */

import { sbSSR } from '@/lib/supabase/server';
import { approveAccessRequest, rejectAccessRequest, updateSignupMode } from './actions';

type AccessRequest = {
    id: string;
    user_id: string | null;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    source?: string | null;
    created_at: string;
    decided_at?: string | null;
};

export default async function AccessControlPage() {
    const supabase = await sbSSR();

    const { data: settingRow, error: settingError } = await supabase
        .from('app_settings')
        .select('setting_value, updated_at, updated_by')
        .eq('setting_key', 'signup_mode')
        .maybeSingle();

    const signupMode = settingRow?.setting_value ?? 'GATED';
    const signupUpdatedAt = settingRow?.updated_at ?? null;

    if (settingError) {
        // Keep page working even if the table hasn't been migrated yet.
        console.warn('Failed to load signup_mode setting', settingError.message);
    }

    const { data: requestRows } = await supabase
        .from('access_requests')
        .select('id, user_id, email, status, source, created_at, decided_at')
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

    const requests = (requestRows ?? []) as AccessRequest[];
    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Access Control</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Control signup mode and review waitlist requests.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Signup Mode</h2>
                    <form action={updateSignupMode} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Current mode</label>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${signupMode === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {signupMode}
                                </span>
                                {signupUpdatedAt && (
                                    <span className="text-xs text-gray-400">
                                        Updated {new Date(signupUpdatedAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="signup_mode" className="text-sm font-medium text-gray-700">
                                Set mode
                            </label>
                            <select
                                id="signup_mode"
                                name="signup_mode"
                                defaultValue={signupMode}
                                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="OPEN">OPEN (auto-approve)</option>
                                <option value="GATED">GATED (waitlist)</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Update mode
                        </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-4">
                        OPEN makes new signups active. GATED sends new users to the waitlist.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Access Requests</h2>
                            <p className="text-sm text-gray-500">{pendingCount} pending</p>
                        </div>
                    </div>

                    {requests.length === 0 ? (
                        <div className="text-sm text-gray-500">No access requests yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500">
                                        <th className="py-2 pr-4">Email</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Requested</th>
                                        <th className="py-2 pr-4">Source</th>
                                        <th className="py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {requests.map((request) => (
                                        <tr key={request.id} className="text-gray-700">
                                            <td className="py-3 pr-4">{request.email}</td>
                                            <td className="py-3 pr-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${request.status === 'approved' ? 'bg-green-100 text-green-700' : request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 pr-4">{request.source ?? '—'}</td>
                                            <td className="py-3">
                                                {request.status === 'pending' ? (
                                                    <div className="flex items-center gap-2">
                                                        <form action={approveAccessRequest}>
                                                            <input type="hidden" name="request_id" value={request.id} />
                                                            <input type="hidden" name="user_id" value={request.user_id ?? ''} />
                                                            <button
                                                                type="submit"
                                                                className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                                                            >
                                                                Approve
                                                            </button>
                                                        </form>
                                                        <form action={rejectAccessRequest}>
                                                            <input type="hidden" name="request_id" value={request.id} />
                                                            <input type="hidden" name="user_id" value={request.user_id ?? ''} />
                                                            <button
                                                                type="submit"
                                                                className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </form>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        {request.decided_at ? new Date(request.decided_at).toLocaleDateString() : '—'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
