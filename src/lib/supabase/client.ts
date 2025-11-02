// Supabase browser client helper using @supabase/ssr
import { createBrowserClient } from '@supabase/ssr';

export function sb() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined;
    if (!url || !anon) {
        // eslint-disable-next-line no-console
        console.warn('Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
    }
    return createBrowserClient(url || 'http://localhost:54321', anon || 'anon');
}
