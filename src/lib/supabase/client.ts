// Supabase browser client helper using @supabase/ssr
import { createBrowserClient } from '@supabase/ssr';

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;
let warnedMissingEnv = false;

function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
    return fetch(input, init).catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[supabase] fetch failed', error);
        }
        const body = JSON.stringify({ message: 'Network error' });
        return new Response(body, {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    });
}

export function sb() {
    if (cachedClient) {
        return cachedClient;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as
        | string
        | undefined;
    const configured = Boolean(url && anon);

    if (!configured && !warnedMissingEnv) {
        console.warn(
            'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).'
        );
        warnedMissingEnv = true;
    }

    cachedClient = createBrowserClient(url || 'http://localhost:54321', anon || 'anon', {
        global: { fetch: safeFetch },
        auth: {
            autoRefreshToken: configured,
            persistSession: configured,
            detectSessionInUrl: configured,
        },
    });

    return cachedClient;
}
