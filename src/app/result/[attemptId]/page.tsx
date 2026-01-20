import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

interface Attempt {
    id: string;
    paper_id: string;
    status: string;
    total_score: number | null;
    max_possible_score: number | null;
    accuracy: number | null;
    attempt_rate: number | null;
    correct_count: number | null;
    incorrect_count: number | null;
    unanswered_count: number | null;
    percentile: number | null;
    rank: number | null;
    section_scores: Record<string, SectionScore> | null;
    submitted_at: string | null;
    time_taken_seconds: number | null;
    user_id: string;
    papers: {
        title: string;
        total_marks: number;
        total_questions: number;
    };
}

export default async function ResultPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Load attempt with paper details
    const { data: attempt, error } = await supabase
        .from('attempts')
        .select(`
            id, paper_id, status, total_score, max_possible_score, 
            accuracy, attempt_rate, correct_count, incorrect_count, unanswered_count,
            percentile, rank, section_scores, submitted_at, time_taken_seconds, user_id,
            papers (title, total_marks, total_questions)
        `)
        .eq('id', attemptId)
        .maybeSingle() as { data: Attempt | null; error: unknown };

    const forbidden = attempt && userId && attempt.user_id && attempt.user_id !== userId;

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Error Loading Result</h1>
                <p style={{ color: 'crimson' }}>Failed to load result. Please try again later.</p>
                <Link href="/dashboard">Back to Dashboard</Link>
            </main>
        );
    }

    if (forbidden) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Access Denied</h1>
                <p style={{ color: 'crimson' }}>You do not have access to this attempt.</p>
                <Link href="/dashboard">Back to Dashboard</Link>
            </main>
        );
    }

    if (!attempt) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Result Not Found</h1>
                <p>No attempt found with this ID.</p>
                <Link href="/dashboard">Back to Dashboard</Link>
            </main>
        );
    }

    if (attempt.status !== 'completed') {
        return (
            <main style={{ padding: 24 }}>
                <h1>Exam Not Completed</h1>
                <p>This exam has not been submitted yet.</p>
                <Link href={`/exam/${attemptId}`}>Continue Exam</Link>
            </main>
        );
    }

    const formatTime = (seconds: number | null) => {
        if (!seconds) return '—';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const paper = attempt.papers;
    const sectionScores = attempt.section_scores || {};

    return (
        <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 style={{ marginBottom: 8 }}>{paper.title}</h1>
                <p style={{ color: '#666', margin: 0 }}>
                    Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '—'}
                </p>
            </div>

            {/* Score Card */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 32,
                padding: 24,
                background: '#f5f5f5',
                borderRadius: 12
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Score</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>
                        {attempt.total_score ?? 0}/{attempt.max_possible_score ?? paper.total_marks}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Percentile</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#4caf50' }}>
                        {attempt.percentile?.toFixed(2) ?? '—'}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Accuracy</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#ff9800' }}>
                        {attempt.accuracy?.toFixed(1) ?? '—'}%
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Time Taken</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#9c27b0' }}>
                        {formatTime(attempt.time_taken_seconds)}
                    </p>
                </div>
            </div>

            {/* Question Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 32,
                marginBottom: 32,
                padding: 16,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, height: 24, background: '#4caf50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</span>
                    <span>Correct: <strong>{attempt.correct_count ?? 0}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, height: 24, background: '#f44336', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}>✗</span>
                    <span>Incorrect: <strong>{attempt.incorrect_count ?? 0}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, height: 24, background: '#9e9e9e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}>–</span>
                    <span>Unanswered: <strong>{attempt.unanswered_count ?? 0}</strong></span>
                </div>
            </div>

            {/* Section-wise Breakdown */}
            <h2 style={{ marginBottom: 16 }}>Section-wise Performance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {Object.entries(sectionScores).map(([section, scores]) => (
                    <div key={section} style={{
                        padding: 16,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: 8
                    }}>
                        <h3 style={{ margin: '0 0 12px', color: '#1976d2' }}>{section}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                            <span>Score:</span><strong>{scores.score}</strong>
                            <span>Correct:</span><strong style={{ color: '#4caf50' }}>{scores.correct}</strong>
                            <span>Incorrect:</span><strong style={{ color: '#f44336' }}>{scores.incorrect}</strong>
                            <span>Unanswered:</span><strong style={{ color: '#9e9e9e' }}>{scores.unanswered}</strong>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rank Info */}
            {attempt.rank && (
                <div style={{
                    textAlign: 'center',
                    padding: 16,
                    background: '#e3f2fd',
                    borderRadius: 8,
                    marginBottom: 32
                }}>
                    <p style={{ margin: 0, fontSize: 18 }}>
                        Your Rank: <strong>#{attempt.rank}</strong>
                    </p>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <Link href="/dashboard" style={{
                    padding: '12px 24px',
                    background: '#1976d2',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 4
                }}>
                    Back to Dashboard
                </Link>
                <Link href="/mocks" style={{
                    padding: '12px 24px',
                    background: '#4caf50',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 4
                }}>
                    Take Another Mock
                </Link>
            </div>
        </main>
    );
}
