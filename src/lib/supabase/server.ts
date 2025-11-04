// Supabase server client helper using @supabase/ssr
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function sbServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
    // Generic server client without cookie persistence (use per-request client in routes for auth-sensitive flows)
    return createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            get() {
                return undefined;
            },
            set() {
                /* no-op */
            },
            remove() {
                /* no-op */
            },
        },
    });
}

export async function getServerSession() {
    const supabase = sbServer();
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
}

// Per-request SSR client that can read auth cookies in server components/route handlers
export async function sbSSR() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
    const cookieStore = await cookies();
    return createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            // Avoid setting cookies during render; reads are sufficient for most queries
            set() {
                /* no-op during render */
            },
            remove() {
                /* no-op during render */
            },
        },
    });
}
