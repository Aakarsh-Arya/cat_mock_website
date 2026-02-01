import 'server-only';

import { createClient } from '@supabase/supabase-js';

export function getServiceRoleClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for privileged server reads.');
    }

    console.log("BACKEND DB URL:", process.env.DATABASE_URL);
    console.log("DB URL USED BY BACKEND:", url);

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
