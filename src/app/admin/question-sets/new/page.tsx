/**
 * @fileoverview New Question Set Page
 * @description Create a new question set with passage/context and questions
 * @blueprint Question Container Architecture
 */

import { sbSSR } from '@/lib/supabase/server';
import { NewQuestionSetClient } from './NewQuestionSetClient';
import { redirect } from 'next/navigation';

export default async function NewQuestionSetPage() {
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

    // Fetch all papers for the dropdown
    const { data: papers } = await supabase
        .from('papers')
        .select('id, title, slug')
        .order('created_at', { ascending: false });

    return <NewQuestionSetClient papers={papers ?? []} />;
}
