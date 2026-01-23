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
            const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
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
    }, [refreshSession]);

    return (
        <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
            <h1>Auth Test Utility</h1>
            <p style={{ marginBottom: 12 }}>Quickly verify Supabase auth/session locally or in deployments.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={onSignIn} disabled={loading} style={{ padding: 8 }}>
                    {loading ? 'Working…' : 'Sign in with Google'}
                </button>
                <button onClick={onSignOut} disabled={loading} style={{ padding: 8 }}>
                    Sign out
                </button>
                <button onClick={refreshSession} disabled={loading} style={{ padding: 8 }}>
                    Refresh session
                </button>
                <Link href="/dashboard" style={{ padding: 8, textDecoration: 'underline' }}>Go to dashboard</Link>
            </div>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, minHeight: 120, overflow: 'auto' }}>
                {sessionJson || 'No session'}
            </pre>
        </main>
    );
}
