import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

type Attempt = {
    id: string;
    paper_id: string;
    status: string;
    score: number | null;
    accuracy: number | null;
    submitted_at: string | null;
};

export default async function DashboardPage() {
    const supabase = await sbSSR();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return (
            <main style={{ padding: 24 }}>
                <h1>My Dashboard</h1>
                <p>You need to sign in.</p>
                <p><Link href="/auth/sign-in?redirect_to=/dashboard">Go to sign-in</Link></p>
            </main>
        );
    }

    const { data, error } = await supabase
        .from('attempts')
        .select('id, paper_id, status, score, accuracy, submitted_at')
        .order('started_at', { ascending: false });

    const attempts: Attempt[] = data ?? [];

    return (
        <main style={{ padding: 24 }}>
            <h1>My Dashboard</h1>
            {error ? (
                <p style={{ color: 'crimson' }}>Failed to load attempts. Did you run the schema setup?</p>
            ) : attempts.length === 0 ? (
                <p>No attempts yet. Visit <Link href="/mocks">Mocks</Link> to start one.</p>
            ) : (
                <ul style={{ padding: 0 }}>
                    {attempts.map((a) => (
                        <li key={a.id} style={{ listStyle: 'none', borderBottom: '1px solid #eee', padding: '8px 0' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span>Attempt {a.id.slice(0, 8)}…</span>
                                <span>· {a.status}</span>
                                {a.score != null && <span>· Score {a.score}</span>}
                                {a.accuracy != null && <span>· Acc {a.accuracy}</span>}
                                <Link href={`/result/${a.id}`} style={{ marginLeft: 'auto' }}>View</Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
