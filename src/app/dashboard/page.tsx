import Link from 'next/link';
import { BackToDashboard } from '@/components/BackToDashboard';
import { sbSSR } from '@/lib/supabase/server';

type Attempt = {
    id: string;
    paper_id: string;
    status: string;
    total_score: number | null;
    max_possible_score: number | null;
    accuracy: number | null;
    percentile: number | null;
    rank: number | null;
    correct_count: number | null;
    incorrect_count: number | null;
    started_at: string | null;
    completed_at: string | null;
    time_taken_seconds: number | null;
    papers: { title: string; total_marks: number } | null;
};

type UserProfile = {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    total_mocks_taken: number;
    best_percentile: number | null;
    target_percentile: number | null;
};

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
                <h1>My Dashboard</h1>
                <p>You need to sign in to access your dashboard.</p>
                <Link href="/auth/sign-in?redirect_to=/dashboard" style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: '#1976d2',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 6
                }}>Sign In</Link>
            </main>
        );
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, total_mocks_taken, best_percentile, target_percentile')
        .eq('id', user.id)
        .maybeSingle() as { data: UserProfile | null };

    // Get attempts with paper details
    const { data, error } = await supabase
        .from('attempts')
        .select(`
            id, paper_id, status, total_score, max_possible_score, accuracy, percentile, rank,
            correct_count, incorrect_count, started_at, completed_at, time_taken_seconds,
            papers (title, total_marks)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

    const attempts: Attempt[] = (data ?? []).map(a => ({
        ...a,
        papers: Array.isArray(a.papers) ? a.papers[0] : a.papers
    }));

    // Calculate stats
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const totalMocks = completedAttempts.length;
    const averageScore = totalMocks > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.total_score || 0), 0) / totalMocks
        : 0;
    const bestScore = totalMocks > 0
        ? Math.max(...completedAttempts.map(a => a.total_score || 0))
        : 0;
    const bestPercentile = totalMocks > 0
        ? Math.max(...completedAttempts.map(a => a.percentile || 0))
        : 0;

    const formatTime = (seconds: number | null) => {
        if (!seconds && seconds !== 0) return '—';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const paddedSecs = secs.toString().padStart(2, '0');
        return `${mins}m ${paddedSecs}s`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4caf50';
            case 'in_progress': return '#ff9800';
            case 'abandoned': return '#9e9e9e';
            default: return '#666';
        }
    };

    return (
        <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
                <BackToDashboard />
            </div>
            {/* Unauthorized Error Banner */}
            {params.error === 'unauthorized' && (
                <div style={{
                    padding: '12px 16px',
                    background: '#ffebee',
                    border: '1px solid #ef5350',
                    borderRadius: 8,
                    marginBottom: 24,
                    color: '#c62828',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <span>You don&apos;t have admin access. Contact the administrator to request access.</span>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ margin: 0 }}>My Dashboard</h1>
                    <p style={{ margin: '8px 0 0', color: '#666' }}>
                        Welcome back, {profile?.name || user.email}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/admin" style={{
                        padding: '12px 24px',
                        background: '#0b3d91',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontWeight: 'bold'
                    }}>Admin Panel</Link>
                    <Link href="/mocks" style={{
                        padding: '12px 24px',
                        background: '#1976d2',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontWeight: 'bold'
                    }}>Take New Mock</Link>
                    <a href="/auth/logout" style={{
                        padding: '12px 24px',
                        background: '#f5f5f5',
                        color: '#666',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontWeight: 'bold',
                        border: '1px solid #ddd'
                    }}>Logout</a>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 32
            }}>
                <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#1976d2' }}>Mocks Completed</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>{totalMocks}</p>
                </div>
                <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#4caf50' }}>Best Score</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#4caf50' }}>{bestScore.toFixed(0)}</p>
                </div>
                <div style={{ padding: 20, background: '#fff3e0', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#ff9800' }}>Average Score</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#ff9800' }}>{averageScore.toFixed(1)}</p>
                </div>
                <div style={{ padding: 20, background: '#f3e5f5', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#9c27b0' }}>Best Percentile</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#9c27b0' }}>
                        {bestPercentile > 0 ? bestPercentile.toFixed(1) : '—'}
                    </p>
                </div>
            </div>

            {/* Target Progress */}
            {profile?.target_percentile && (
                <div style={{
                    padding: 20,
                    background: '#f5f5f5',
                    borderRadius: 12,
                    marginBottom: 32
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Progress to Target ({profile.target_percentile}%ile)</span>
                        <span>{bestPercentile > 0 ? `${((bestPercentile / profile.target_percentile) * 100).toFixed(0)}%` : '0%'}</span>
                    </div>
                    <div style={{ height: 8, background: '#ddd', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.min((bestPercentile / profile.target_percentile) * 100, 100)}%`,
                            background: '#4caf50',
                            borderRadius: 4
                        }}></div>
                    </div>
                </div>
            )}

            {/* Attempts List */}
            <h2 style={{ marginBottom: 16 }}>My Attempts</h2>
            {error ? (
                <p style={{ color: 'crimson' }}>Failed to load attempts. Please try again later.</p>
            ) : attempts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, background: '#f5f5f5', borderRadius: 12 }}>
                    <h3>No attempts yet</h3>
                    <p style={{ color: '#666' }}>Start your CAT preparation by taking a mock test!</p>
                    <Link href="/mocks" style={{
                        display: 'inline-block',
                        marginTop: 16,
                        padding: '12px 24px',
                        background: '#1976d2',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6
                    }}>Browse Mocks</Link>
                </div>
            ) : (
                <div style={{ border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Paper</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Status</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Score</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Accuracy</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Percentile</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                                    <div title="Duration (not submission timestamp)">Time Taken</div>
                                    <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>Duration</div>
                                </th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Date</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map((a) => (
                                <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: 12 }}>
                                        <strong>{a.papers?.title ?? `Paper ${a.paper_id.slice(0, 8)}…`}</strong>
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: getStatusColor(a.status),
                                            color: 'white',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 'bold'
                                        }}>{a.status.replace('_', ' ').toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>
                                        {a.total_score !== null ? `${a.total_score}/${a.max_possible_score || a.papers?.total_marks || 198}` : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {a.accuracy !== null ? `${a.accuracy.toFixed(1)}%` : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {a.percentile !== null ? a.percentile.toFixed(1) : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {formatTime(a.time_taken_seconds)}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center', color: '#666', fontSize: 13 }}>
                                        {a.started_at ? new Date(a.started_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {a.status === 'in_progress' ? (
                                            <Link href={`/exam/${a.id}`} style={{
                                                color: '#ff9800',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}>Continue</Link>
                                        ) : a.status === 'completed' ? (
                                            <Link href={`/result/${a.id}`} style={{
                                                color: '#1976d2',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}>View Result</Link>
                                        ) : (
                                            <span style={{ color: '#999' }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
