/**
 * @fileoverview Admin Paper Editor Page
 * @description In-context exam editor with Mirror Principle - edit questions in exam layout
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

import { notFound } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { ExamEditorClient } from './ExamEditorClient';

interface PageProps {
    params: Promise<{ paperId: string }>;
}

export default async function AdminPaperEditorPage({ params }: PageProps) {
    const { paperId } = await params;
    const supabase = await sbSSR();

    // Fetch paper
    const { data: paper, error: paperError } = await supabase
        .from('papers')
        .select('*')
        .eq('id', paperId)
        .single();

    if (paperError || !paper) {
        notFound();
    }

    // Fetch all questions for this paper
    const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('question_number', { ascending: true });

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
            initialContexts={contexts ?? []}
        />
    );
}
