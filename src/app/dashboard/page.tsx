import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

type Attempt = {
    id: string;
    paper_id: string;
    status: string;
    total_score: number | null;
    started_at: string | null;
    completed_at: string | null;
    papers: { title: string }[] | null;
};

export default async function DashboardPage() {
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
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
        .select('id, paper_id, status, total_score, started_at, completed_at, papers(title)')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

    const attempts: Attempt[] = data ?? [];

    return (
        <main style={{ padding: 24 }}>
            <h1>My Dashboard</h1>
            <p style={{ marginBottom: 16 }}>Welcome, {user.email}</p>
            {error ? (
                <p style={{ color: 'crimson' }}>Failed to load attempts. Did you run the schema setup?</p>
            ) : attempts.length === 0 ? (
                <p>No attempts yet. Visit <Link href="/mocks">Mocks</Link> to start one.</p>
            ) : (
                <ul style={{ padding: 0 }}>
                    {attempts.map((a) => (
                        <li key={a.id} style={{ listStyle: 'none', borderBottom: '1px solid #eee', padding: '8px 0' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <strong>{a.papers?.[0]?.title ?? `Paper ${a.paper_id.slice(0, 8)}…`}</strong>
                                <span>· {a.status}</span>
                                {a.total_score != null && <span>· Score: {a.total_score}</span>}
                                {a.status === 'in_progress' ? (
                                    <Link href={`/exam/${a.id}`} style={{ marginLeft: 'auto' }}>Continue</Link>
                                ) : (
                                    <Link href={`/result/${a.id}`} style={{ marginLeft: 'auto' }}>View Result</Link>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
