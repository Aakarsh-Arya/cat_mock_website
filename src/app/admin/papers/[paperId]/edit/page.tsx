/**
 * @fileoverview Admin Paper Editor Page
 * @description In-context exam editor with Mirror Principle - edit questions in exam layout
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

import 'server-only';

import { notFound, redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { ExamEditorClient } from './ExamEditorClient';

interface PageProps {
    params: Promise<{ paperId: string }>;
}

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin editor requires service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export default async function AdminPaperEditorPage({ params }: PageProps) {
    const { paperId } = await params;
    const supabase = await sbSSR();

    // Server-side admin verification (CRITICAL: page uses service-role client)
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

    // Fetch paper
    const { data: paper, error: paperError } = await supabase
        .from('papers')
        .select('*')
        .eq('id', paperId)
        .single();

    if (paperError || !paper) {
        notFound();
    }

    // Fetch all questions for this paper (service role for privileged columns)
    const adminClient = getAdminClient();
    const { data: questions } = await adminClient
        .from('questions')
        .select('*')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('question_number', { ascending: true });

    // Fetch question sets with questions (sets-first view)
    const { data: questionSetsView } = await adminClient
        .from('question_sets_with_questions')
        .select('*')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

    let questionSets = questionSetsView ?? [];

    if (!questionSets || questionSets.length === 0) {
        const { data: questionSetsTable } = await adminClient
            .from('question_sets')
            .select('*')
            .eq('paper_id', paperId)
            .order('section', { ascending: true })
            .order('display_order', { ascending: true });
        questionSets = questionSetsTable ?? [];
    }

    // Fetch all contexts for this paper
    const { data: contexts } = await supabase
        .from('question_contexts')
        .select('*')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

    return (
        <ExamEditorClient
            paper={paper}
            initialQuestions={questions ?? []}
            initialQuestionSets={questionSets ?? []}
            initialContexts={contexts ?? []}
        />
    );
}
