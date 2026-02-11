'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { sb } from '@/lib/supabase/client';

export default function TestLoginPage() {
    const [loading, setLoading] = useState(false);
    const [sessionJson, setSessionJson] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const refreshSession = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await sb().auth.getSession();
            if (err) throw err;
            setSessionJson(JSON.stringify(data.session, null, 2));
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load session';
            setError(msg);
            setSessionJson('');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const onSignIn = useCallback(async () => {
        setLoading(true);
        try {
            const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
            const origin = configuredSiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
            const callbackUrl = `${origin}/auth/callback?redirect_to=/auth/test-login`;
            await sb().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl } });
        } finally {
            setLoading(false);
        }
    }, []);

    const onSignOut = useCallback(async () => {
        setLoading(true);
        try {
            await sb().auth.signOut();
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <main className="page-shell py-6 sm:py-8">
            <h1 className="text-2xl font-bold text-slate-900">Auth Test Utility</h1>
            <p className="mt-2 text-sm text-slate-600">
                Quickly verify Supabase auth/session locally or in deployments.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                    onClick={onSignIn}
                    disabled={loading}
                    className="touch-target rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? 'Working...' : 'Sign in with Google'}
                </button>
                <button
                    onClick={onSignOut}
                    disabled={loading}
                    className="touch-target rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                    Sign out
                </button>
                <button
                    onClick={refreshSession}
                    disabled={loading}
                    className="touch-target rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                    Refresh session
                </button>
                <Link
                    href="/dashboard"
                    className="touch-target inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Go to dashboard
                </Link>
            </div>

            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

            <pre className="mt-4 max-h-[60vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                {sessionJson || 'No session'}
            </pre>
        </main>
    );
}
