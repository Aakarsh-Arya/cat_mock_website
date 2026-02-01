import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Mock Details",
};

interface Section {
    name: string;
    questions: number;
    time: number;
    marks: number;
}

interface Paper {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    year: number;
    total_questions: number;
    total_marks: number;
    duration_minutes: number;
    sections: Section[];
    published: boolean;
    difficulty_level: string | null;
    is_free: boolean;
    attempt_limit: number | null;
}

export default async function MockDetailPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { paperId } = (await params) as { paperId: string };

    const supabase = await sbSSR();

    // Get paper details - try by UUID first, then by slug
    let paper: Paper | null = null;
    let error: unknown = null;

    // Check if paperId looks like a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);

    if (isUUID) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
            .eq('id', paperId)
            .maybeSingle();
        paper = result.data as Paper | null;
        error = result.error;
    }

    // If not found by UUID or not a UUID, try by slug
    if (!paper && !error) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
            .eq('slug', paperId)
            .maybeSingle();
        paper = result.data as Paper | null;
        error = result.error;
    }

    // Get user's previous attempts on this paper
    const { data: { user } } = await supabase.auth.getUser();
    let previousAttempts: { id: string; status: string; total_score: number | null; created_at: string }[] = [];

    if (user && paper) {
        const { data: attempts } = await supabase
            .from('attempts')
            .select('id, status, total_score, created_at')
            .eq('paper_id', paper.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        previousAttempts = attempts || [];
    }

    // Check attempt limit (count attempts that are not expired)
    const activeAttemptsCount = previousAttempts.filter((a) => a.status !== 'expired').length;
    const attemptLimit = paper?.attempt_limit ?? null;
    const canAttempt = attemptLimit === null || attemptLimit <= 0 || activeAttemptsCount < attemptLimit;

    async function startExam() {
        'use server';
        const s = await sbSSR();
        const { data: { user: currentUser } } = await s.auth.getUser();

        if (!currentUser) {
            redirect(`/auth/sign-in?redirect_to=${encodeURIComponent(`/mock/${paperId}`)}`);
        }

        // Check if paperId looks like a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);

        type PaperData = { id: string; published: boolean; sections: Section[]; duration_minutes: number; attempt_limit: number | null };
        let p: PaperData | null = null;

        if (isUUID) {
            const { data } = await s
                .from('papers')
                .select('id, published, sections, duration_minutes, attempt_limit')
                .eq('id', paperId)
                .maybeSingle();
            p = data as PaperData | null;
        }

        if (!p) {
            const { data } = await s
                .from('papers')
                .select('id, published, sections, duration_minutes, attempt_limit')
                .eq('slug', paperId)
                .maybeSingle();
            p = data as PaperData | null;
        }

        if (!p || p.published !== true) {
            throw new Error('Paper not available');
        }

        const attemptLimitServer = p.attempt_limit ?? null;
        if (attemptLimitServer !== null && attemptLimitServer > 0) {
            const { count: attemptCount } = await s
                .from('attempts')
                .select('id', { count: 'exact', head: true })
                .eq('paper_id', p.id)
                .eq('user_id', currentUser.id)
                .neq('status', 'expired');

            if ((attemptCount ?? 0) >= attemptLimitServer) {
                redirect(`/mock/${paperId}?limit_reached=1`);
            }
        }

        // FIX: Check for existing in_progress attempt - reuse instead of creating new
        const { data: existingAttempt } = await s
            .from('attempts')
            .select('id')
            .eq('paper_id', p.id)
            .eq('user_id', currentUser.id)
            .eq('status', 'in_progress')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingAttempt) {
            // Resume existing attempt instead of creating new one
            redirect(`/exam/${existingAttempt.id}`);
        }

        // Initialize time remaining for each section
        const sections = p.sections as Section[] || [];
        const timeRemaining: Record<string, number> = {};
        sections.forEach((sec: Section) => {
            timeRemaining[sec.name] = sec.time * 60; // Convert to seconds
        });

        const { data: attempt, error: insertErr } = await s
            .from('attempts')
            .insert({
                paper_id: p.id,
                user_id: currentUser.id,
                status: 'in_progress',
                current_section: sections[0]?.name || null,
                current_question: 1,
                time_remaining: timeRemaining
            })
            .select('id')
            .single();

        if (insertErr || !attempt) {
            logger.error('Failed to create attempt', insertErr, { paperId: p.id, userId: currentUser.id });
            throw new Error('Failed to create attempt');
        }

        redirect(`/exam/${attempt.id}`);
    }

    if (error) {
        return (
            <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
                <h1>Error Loading Paper</h1>
                <p style={{ color: 'crimson' }}>Failed to load paper. Please try again later.</p>
                <Link href="/mocks">Back to Mocks</Link>
            </main>
        );
    }

    if (!paper) {
        return (
            <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
                <h1>Paper Not Found</h1>
                <p>The requested mock test does not exist.</p>
                <Link href="/mocks">Browse Available Mocks</Link>
            </main>
        );
    }

    const sections = paper.sections || [];

    return (
        <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            {/* Paper Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h1 style={{ margin: 0 }}>{paper.title}</h1>
                    {paper.is_free && (
                        <span style={{
                            padding: '4px 8px',
                            background: '#4caf50',
                            color: 'white',
                            borderRadius: 4,
                            fontSize: 12
                        }}>FREE</span>
                    )}
                    {paper.difficulty_level && (
                        <span style={{
                            padding: '4px 8px',
                            background: paper.difficulty_level === 'hard' ? '#f44336' : paper.difficulty_level === 'medium' ? '#ff9800' : '#4caf50',
                            color: 'white',
                            borderRadius: 4,
                            fontSize: 12
                        }}>{paper.difficulty_level.toUpperCase()}</span>
                    )}
                </div>
                {paper.description && <p style={{ color: '#666', marginTop: 8 }}>{paper.description}</p>}
            </div>

            {/* Paper Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 32,
                padding: 20,
                background: '#f5f5f5',
                borderRadius: 12
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Questions</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.total_questions}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Total Marks</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.total_marks}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Duration</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.duration_minutes} min</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Year</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.year}</p>
                </div>
            </div>

            {/* Section Breakdown */}
            <h2 style={{ marginBottom: 16 }}>Section Details</h2>
            <div style={{ marginBottom: 32 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Section</th>
                            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>Questions</th>
                            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>Time (min)</th>
                            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map((section: Section, idx: number) => (
                            <tr key={`${section.name}-${idx}`} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: 12 }}>{section.name}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{section.questions}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{section.time}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{section.marks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Marking Scheme */}
            <h2 style={{ marginBottom: 16 }}>Marking Scheme</h2>
            <div style={{
                padding: 16,
                background: '#fff3e0',
                borderRadius: 8,
                marginBottom: 32,
                fontSize: 14
            }}>
                <p style={{ margin: '0 0 8px' }}><strong>MCQ Questions:</strong> +3 for correct, -1 for incorrect, 0 for unanswered</p>
                <p style={{ margin: 0 }}><strong>TITA Questions:</strong> +3 for correct, 0 for incorrect/unanswered (No negative marking)</p>
            </div>

            {/* Previous Attempts */}
            {previousAttempts.length > 0 && (
                <>
                    <h2 style={{ marginBottom: 16 }}>Your Previous Attempts</h2>
                    <div style={{ marginBottom: 32 }}>
                        {previousAttempts.map((attempt, idx) => (
                            <div key={attempt.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 12,
                                background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                                borderRadius: 4,
                                marginBottom: 4
                            }}>
                                <span>Attempt {previousAttempts.length - idx}</span>
                                <span style={{ color: '#666' }}>{new Date(attempt.created_at).toLocaleDateString()}</span>
                                <span style={{
                                    color: attempt.status === 'completed' ? '#4caf50' : '#ff9800'
                                }}>{attempt.status}</span>
                                <span style={{ fontWeight: 'bold' }}>
                                    {attempt.total_score !== null ? `${attempt.total_score} marks` : '—'}
                                </span>
                                {attempt.status === 'completed' ? (
                                    <Link href={`/result/${attempt.id}`} style={{ color: '#1976d2' }}>View Result</Link>
                                ) : (
                                    <Link href={`/exam/${attempt.id}`} style={{ color: '#ff9800' }}>Continue</Link>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Start Exam Button */}
            <div style={{ textAlign: 'center' }}>
                {!paper.published ? (
                    <p style={{ color: '#666' }}>This paper is not yet available.</p>
                ) : !canAttempt ? (
                    <p style={{ color: '#f44336' }}>You have reached the maximum number of attempts for this paper.</p>
                ) : (
                    <form action={startExam}>
                        <button type="submit" style={{
                            padding: '16px 48px',
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 18,
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            {previousAttempts.length > 0 ? 'Start New Attempt' : 'Start Exam'}
                        </button>
                    </form>
                )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link href="/mocks" style={{ color: '#666' }}>← Back to All Mocks</Link>
            </div>
        </main>
    );
}
