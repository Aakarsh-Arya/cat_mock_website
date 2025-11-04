import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

type Paper = {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    duration_minutes: number | null;
};

export default async function MocksPage() {
    const supabase = await sbSSR();
    const { data, error } = await supabase
        .from('papers')
        .select('id, slug, title, description, duration_minutes')
        .eq('published', true)
        .order('created_at', { ascending: false });

    const papers: Paper[] = data ?? [];

    return (
        <main style={{ padding: 24 }}>
            <h1>Mocks</h1>
            {error ? (
                <p style={{ color: 'crimson' }}>Failed to load papers. Did you run the schema setup?</p>
            ) : papers.length === 0 ? (
                <p>No published papers yet.</p>
            ) : (
                <ul style={{ display: 'grid', gap: 12, padding: 0 }}>
                    {papers.map((p) => {
                        const href = `/mock/${p.slug || p.id}`;
                        return (
                            <li key={p.id} style={{ listStyle: 'none', border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                                <h3 style={{ margin: '4px 0' }}>{p.title}</h3>
                                {p.description ? <p style={{ margin: '4px 0' }}>{p.description}</p> : null}
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {p.duration_minutes != null && <span>⏱️ {p.duration_minutes} min</span>}
                                    <Link href={href} style={{ marginLeft: 'auto', textDecoration: 'underline' }}>View</Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
