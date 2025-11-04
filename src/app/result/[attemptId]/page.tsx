import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

export default async function ResultPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Load attempt for current user
    const { data: attempt, error } = await supabase
        .from('attempts')
        .select('id, paper_id, status, score, accuracy, submitted_at')
        .eq('id', attemptId)
        .maybeSingle();

    const forbidden = attempt && userId && (attempt as any).user_id && (attempt as any).user_id !== userId;

    return (
        <main style={{ padding: 24 }}>
            <h1>Result</h1>
            {error && <p style={{ color: 'crimson' }}>Failed to load result. Did you run the schema setup?</p>}
            {forbidden && <p style={{ color: 'crimson' }}>You do not have access to this attempt.</p>}
            {attempt ? (
                <div>
                    <p><strong>Attempt:</strong> {attempt.id}</p>
                    <p><strong>Status:</strong> {attempt.status}</p>
                    <p><strong>Score:</strong> {attempt.score ?? '—'}</p>
                    <p><strong>Accuracy:</strong> {attempt.accuracy ?? '—'}</p>
                    <p><strong>Submitted:</strong> {attempt.submitted_at ?? '—'}</p>
                </div>
            ) : (
                <p>No attempt found.</p>
            )}
            <p style={{ marginTop: 16 }}>
                <Link href="/dashboard">Back to dashboard</Link>
            </p>
        </main>
    );
}
