'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { sb } from '../../../lib/supabase/client';

export default function SignInPage() {
    const [loading, setLoading] = useState(false);
    const params = useSearchParams();
    const redirectTo = useMemo(() => params.get('redirect_to') || '/dashboard', [params]);

    const onSignIn = useCallback(async () => {
        setLoading(true);
        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
            const callbackUrl = `${origin}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}`;
            await sb().auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: callbackUrl },
            });
        } finally {
            setLoading(false);
        }
    }, [redirectTo]);

    return (
        <main style={{ padding: 24 }}>
            <h1>Sign in</h1>
            <p>Continue with Google to access your dashboard and exams.</p>
            <button onClick={onSignIn} disabled={loading} style={{ padding: 8 }}>
                {loading ? 'Redirecting…' : 'Sign in with Google'}
            </button>
        </main>
    );
}
