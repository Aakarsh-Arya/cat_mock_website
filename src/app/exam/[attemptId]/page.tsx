import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';

interface Question {
    id: string;
    section: string;
    question_number: number;
    question_text: string;
    question_type: 'MCQ' | 'TITA';
    options: string[] | null;
    positive_marks: number;
    negative_marks: number;
    difficulty: string | null;
}

interface Paper {
    id: string;
    title: string;
    duration_minutes: number;
    sections: { name: string; questions: number; time: number }[];
    total_marks: number;
}

interface Attempt {
    id: string;
    paper_id: string;
    status: string;
    started_at: string;
    current_section: string | null;
    current_question: number;
    time_remaining: Record<string, number> | null;
    papers: Paper;
}

export default async function ExamPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Exam Attempt</h1>
                <p>Please sign in to access this attempt.</p>
                <Link href={`/auth/sign-in?redirect_to=${encodeURIComponent(`/exam/${attemptId}`)}`}>
                    Sign In
                </Link>
            </main>
        );
    }

    // Get attempt with paper details
    const { data: attempt } = await supabase
        .from('attempts')
        .select(`
            id, paper_id, status, started_at, current_section, current_question, time_remaining,
            papers (id, title, duration_minutes, sections, total_marks)
        `)
        .eq('id', attemptId)
        .maybeSingle() as { data: Attempt | null };

    if (!attempt) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Attempt Not Found</h1>
                <p>This exam attempt does not exist or you don&apos;t have access to it.</p>
                <Link href="/dashboard">Back to Dashboard</Link>
            </main>
        );
    }

    // Check if attempt is already completed
    if (attempt.status === 'completed' || attempt.status === 'submitted') {
        return (
            <main style={{ padding: 24 }}>
                <h1>Exam Already Submitted</h1>
                <p>This exam has already been submitted.</p>
                <Link href={`/result/${attemptId}`}>View Results</Link>
            </main>
        );
    }

    // Get questions for this paper
    const { data: questions } = await supabase
        .from('questions')
        .select('id, section, question_number, question_text, question_type, options, positive_marks, negative_marks, difficulty')
        .eq('paper_id', attempt.paper_id)
        .eq('is_active', true)
        .order('section')
        .order('question_number') as { data: Question[] | null };

    // Get existing responses
    const { data: responses } = await supabase
        .from('responses')
        .select('question_id, answer, status, is_marked_for_review, time_spent_seconds')
        .eq('attempt_id', attemptId);

    const responseMap = new Map(responses?.map(r => [r.question_id, r]) || []);

    // Group questions by section
    const questionsBySection = questions?.reduce((acc, q) => {
        if (!acc[q.section]) acc[q.section] = [];
        acc[q.section].push(q);
        return acc;
    }, {} as Record<string, Question[]>) || {};

    const paper = attempt.papers;
    const sections = paper.sections || [];

    return (
        <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '2px solid #333', paddingBottom: 16 }}>
                <h1 style={{ margin: 0 }}>{paper.title}</h1>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Total Marks: {paper.total_marks}</p>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Duration: {paper.duration_minutes} minutes</p>
                </div>
            </div>

            {/* Section Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {sections.map((section: { name: string; questions: number; time: number }) => (
                    <div key={section.name} style={{
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}>
                        <strong>{section.name}</strong>
                        <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                            ({section.questions} Q, {section.time} min)
                        </span>
                    </div>
                ))}
            </div>

            {/* Question Palette */}
            <div style={{ display: 'flex', gap: 24 }}>
                {/* Left: Question Display */}
                <div style={{ flex: 1 }}>
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 24, minHeight: 400 }}>
                        <p style={{ color: '#666', textAlign: 'center' }}>
                            TODO: Implement interactive question display with timer
                        </p>
                        <p style={{ color: '#666', textAlign: 'center' }}>
                            Questions loaded: {questions?.length || 0}
                        </p>
                    </div>
                </div>

                {/* Right: Question Palette */}
                <div style={{ width: 280 }}>
                    <h3 style={{ marginTop: 0 }}>Question Palette</h3>
                    {Object.entries(questionsBySection).map(([section, qs]) => (
                        <div key={section} style={{ marginBottom: 16 }}>
                            <h4 style={{ marginBottom: 8 }}>{section}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                                {qs.map((q) => {
                                    const response = responseMap.get(q.id);
                                    let bgColor = '#e0e0e0'; // Not visited
                                    if (response?.answer) bgColor = '#4caf50'; // Answered
                                    if (response?.is_marked_for_review) bgColor = '#ff9800'; // Marked
                                    if (response?.status === 'visited' && !response?.answer) bgColor = '#f44336'; // Visited but not answered

                                    return (
                                        <div key={q.id} style={{
                                            width: 36,
                                            height: 36,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: bgColor,
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            color: bgColor === '#e0e0e0' ? '#333' : '#fff'
                                        }}>
                                            {q.question_number}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Legend */}
                    <div style={{ marginTop: 16, padding: 12, background: '#f9f9f9', borderRadius: 4, fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ width: 16, height: 16, background: '#e0e0e0', borderRadius: 2 }}></span>
                            Not Visited
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ width: 16, height: 16, background: '#4caf50', borderRadius: 2 }}></span>
                            Answered
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ width: 16, height: 16, background: '#ff9800', borderRadius: 2 }}></span>
                            Marked for Review
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 16, height: 16, background: '#f44336', borderRadius: 2 }}></span>
                            Not Answered
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <form action={`/api/submit`} method="POST">
                    <input type="hidden" name="attemptId" value={attemptId} />
                    <button type="submit" style={{
                        padding: '12px 48px',
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 16,
                        cursor: 'pointer'
                    }}>
                        Submit Exam
                    </button>
                </form>
            </div>
        </main>
    );
}
