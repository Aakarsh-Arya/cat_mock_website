import { sbSSR } from '@/lib/supabase/server';

export default async function ExamPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Exam Attempt</h1>
                <p>Please sign in to access this attempt.</p>
            </main>
        );
    }

    const { data: attempt } = await supabase
        .from('attempts')
        .select('id, paper_id, status, started_at')
        .eq('id', attemptId)
        .maybeSingle();

    let questionsCount: number | null = null;
    if (attempt?.paper_id) {
        const { count } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true);
        questionsCount = count ?? null;
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Exam Attempt: {attemptId}</h1>
            <p>Status: {attempt?.status ?? '—'}</p>
            {questionsCount != null && <p>Total questions: {questionsCount}</p>}
            <p>TODO: Render timer, question card, and palette.</p>
            <p>Answers will be buffered locally and synced periodically.</p>
        </main>
    );
}
