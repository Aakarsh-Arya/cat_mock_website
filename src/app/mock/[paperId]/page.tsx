import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';

export const metadata: Metadata = {
    title: "Mock Details",
};

export default async function MockDetailPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { paperId } = (await params) as { paperId: string };

    const supabase = await sbSSR();
    const { data: paper, error } = await supabase
        .from('papers')
        .select('id, slug, title, description, duration_minutes, published')
        .or(`id.eq.${paperId},slug.eq.${paperId}`)
        .maybeSingle();

    async function startExam() {
        'use server';
        const s = await sbSSR();
        const { data: sessionData } = await s.auth.getSession();
        const userId = sessionData.session?.user?.id;
        if (!userId) {
            redirect(`/auth/sign-in?redirect_to=${encodeURIComponent(`/mock/${paperId}`)}`);
        }
        const { data: p } = await s
            .from('papers')
            .select('id, published')
            .or(`id.eq.${paperId},slug.eq.${paperId}`)
            .maybeSingle();
        if (!p || p.published !== true) {
            throw new Error('Paper not available');
        }
        const { data: attempt, error: insertErr } = await s
            .from('attempts')
            .insert({ paper_id: p.id, status: 'in_progress' })
            .select('id')
            .single();
        if (insertErr || !attempt) {
            throw new Error('Failed to create attempt');
        }
        redirect(`/exam/${attempt.id}`);
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>{paper?.title ?? 'Mock'}</h1>
            {error && <p style={{ color: 'crimson' }}>Failed to load paper. Did you run the schema setup?</p>}
            {paper?.description && <p>{paper.description}</p>}
            {paper?.duration_minutes != null && <p>Duration: {paper.duration_minutes} minutes</p>}
            <form action={startExam}>
                <button type="submit" style={{ padding: 8 }} disabled={!paper?.published}>Start exam</button>
            </form>
        </main>
    );
}
