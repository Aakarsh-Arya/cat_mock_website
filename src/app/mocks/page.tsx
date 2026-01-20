import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

type Paper = {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    year: number;
    total_questions: number;
    total_marks: number;
    duration_minutes: number | null;
    difficulty_level: string | null;
    is_free: boolean;
};

export default async function MocksPage() {
    const supabase = await sbSSR();
    const { data, error } = await supabase
        .from('papers')
        .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, difficulty_level, is_free')
        .eq('published', true)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

    const papers: Paper[] = data ?? [];

    // Group papers by year
    const papersByYear = papers.reduce((acc, paper) => {
        const year = paper.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(paper);
        return acc;
    }, {} as Record<number, Paper[]>);

    const getDifficultyColor = (level: string | null) => {
        switch (level) {
            case 'easy': return '#4caf50';
            case 'medium': return '#ff9800';
            case 'hard': return '#f44336';
            case 'cat-level': return '#9c27b0';
            default: return '#666';
        }
    };

    return (
        <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{ marginBottom: 8 }}>CAT Mock Tests</h1>
            <p style={{ color: '#666', marginBottom: 32 }}>
                Practice with full-length CAT mock tests designed to simulate the actual exam experience.
            </p>

            {error ? (
                <p style={{ color: 'crimson' }}>Failed to load papers. Please try again later.</p>
            ) : papers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, background: '#f5f5f5', borderRadius: 12 }}>
                    <h2>No Mock Tests Available</h2>
                    <p style={{ color: '#666' }}>Check back soon for new mock tests!</p>
                </div>
            ) : (
                Object.entries(papersByYear)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([year, yearPapers]) => (
                        <div key={year} style={{ marginBottom: 32 }}>
                            <h2 style={{ borderBottom: '2px solid #1976d2', paddingBottom: 8, marginBottom: 16 }}>
                                CAT {year} Pattern
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                {yearPapers.map((p) => {
                                    const href = `/mock/${p.slug || p.id}`;
                                    return (
                                        <div key={p.id} style={{
                                            border: '1px solid #ddd',
                                            borderRadius: 12,
                                            padding: 20,
                                            background: '#fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            transition: 'box-shadow 0.2s',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                <h3 style={{ margin: 0, fontSize: 18 }}>{p.title}</h3>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {p.is_free && (
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            background: '#4caf50',
                                                            color: 'white',
                                                            borderRadius: 4,
                                                            fontSize: 11,
                                                            fontWeight: 'bold'
                                                        }}>FREE</span>
                                                    )}
                                                    {p.difficulty_level && (
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            background: getDifficultyColor(p.difficulty_level),
                                                            color: 'white',
                                                            borderRadius: 4,
                                                            fontSize: 11,
                                                            fontWeight: 'bold'
                                                        }}>{p.difficulty_level.toUpperCase()}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {p.description && (
                                                <p style={{ margin: '0 0 12px', color: '#666', fontSize: 14, lineHeight: 1.4 }}>
                                                    {p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description}
                                                </p>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                gap: 16,
                                                fontSize: 13,
                                                color: '#666',
                                                marginBottom: 16,
                                                paddingTop: 12,
                                                borderTop: '1px solid #eee'
                                            }}>
                                                <span>📝 {p.total_questions} Qs</span>
                                                <span>🎯 {p.total_marks} marks</span>
                                                <span>⏱️ {p.duration_minutes} min</span>
                                            </div>

                                            <Link href={href} style={{
                                                display: 'block',
                                                textAlign: 'center',
                                                padding: '10px 16px',
                                                background: '#1976d2',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: 6,
                                                fontWeight: 'bold',
                                                fontSize: 14
                                            }}>
                                                Start Mock
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
            )}
        </main>
    );
}
