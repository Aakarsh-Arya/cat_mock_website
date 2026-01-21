/**
 * @fileoverview New Context Form
 * @description Admin page to create a new passage/context for questions
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabase/client';

interface Paper {
    id: string;
    title: string;
    slug: string;
}

export default function NewContextPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedPaperId = searchParams.get('paper');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [papers, setPapers] = useState<Paper[]>([]);

    const [formData, setFormData] = useState({
        paper_id: preselectedPaperId || '',
        title: '',
        section: 'VARC',
        text: '',
    });

    // Fetch papers on mount
    useEffect(() => {
        const fetchPapers = async () => {
            const supabase = sb();
            const { data } = await supabase
                .from('papers')
                .select('id, title, slug')
                .order('title');

            if (data) setPapers(data);
        };

        fetchPapers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = sb();

            const { data, error: insertError } = await supabase
                .from('question_contexts')
                .insert({
                    paper_id: formData.paper_id,
                    title: formData.title,
                    section: formData.section,
                    text: formData.text,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            router.push(`/admin/contexts/${data.id}`);
        } catch (err: unknown) {
            console.error('Error creating context:', err);
            setError(err instanceof Error ? err.message : 'Failed to create context');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Context/Passage</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="paper_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Paper *
                        </label>
                        <select
                            id="paper_id"
                            name="paper_id"
                            value={formData.paper_id}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a paper</option>
                            {papers.map((paper) => (
                                <option key={paper.id} value={paper.id}>
                                    {paper.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                            Section *
                        </label>
                        <select
                            id="section"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="VARC">VARC</option>
                            <option value="DILR">DILR</option>
                            <option value="QA">QA</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., RC Passage 1 - Climate Change"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            A descriptive title to help identify this passage
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                            Passage Text *
                        </label>
                        <textarea
                            id="text"
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            required
                            rows={15}
                            placeholder="Enter the full passage text here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This is the shared context that will be displayed with questions that reference it
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Context'}
                    </button>
                </div>
            </form>
        </div>
    );
}
