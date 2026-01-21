/**
 * @fileoverview New Paper Form
 * @description Admin page to create a new paper
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase/client';

export default function NewPaperPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        year: new Date().getFullYear(),
        duration_minutes: 120,
        total_questions: 66,
        total_marks: 198,
        default_positive_marks: 3,
        default_negative_marks: 1,
        difficulty_level: 'cat-level',
        published: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : type === 'number'
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = sb();

            // Generate slug from title if not provided
            const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            // Default CAT sections configuration
            const sections = [
                { name: 'VARC', questions: 24, time: 40, marks: 72 },
                { name: 'DILR', questions: 20, time: 40, marks: 60 },
                { name: 'QA', questions: 22, time: 40, marks: 66 },
            ];

            const { data, error: insertError } = await supabase
                .from('papers')
                .insert({
                    ...formData,
                    slug,
                    sections,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            router.push(`/admin/papers/${data.id}`);
        } catch (err: unknown) {
            console.error('Error creating paper:', err);
            setError(err instanceof Error ? err.message : 'Failed to create paper');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Paper</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            placeholder="e.g., CAT 2024 Slot 1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                            Slug (URL-friendly ID)
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="e.g., cat-2024-slot-1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate from title</p>
                    </div>

                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                            Year *
                        </label>
                        <input
                            type="number"
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            min={2000}
                            max={2100}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of the paper..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                        </label>
                        <input
                            type="number"
                            id="duration_minutes"
                            name="duration_minutes"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="total_questions" className="block text-sm font-medium text-gray-700 mb-1">
                            Total Questions
                        </label>
                        <input
                            type="number"
                            id="total_questions"
                            name="total_questions"
                            value={formData.total_questions}
                            onChange={handleChange}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="total_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Total Marks
                        </label>
                        <input
                            type="number"
                            id="total_marks"
                            name="total_marks"
                            value={formData.total_marks}
                            onChange={handleChange}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty Level
                        </label>
                        <select
                            id="difficulty_level"
                            name="difficulty_level"
                            value={formData.difficulty_level}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="cat-level">CAT Level</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="default_positive_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Default Positive Marks
                        </label>
                        <input
                            type="number"
                            id="default_positive_marks"
                            name="default_positive_marks"
                            value={formData.default_positive_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="default_negative_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Default Negative Marks
                        </label>
                        <input
                            type="number"
                            id="default_negative_marks"
                            name="default_negative_marks"
                            value={formData.default_negative_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="published"
                                checked={formData.published}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                        </label>
                        <p className="mt-1 text-xs text-gray-500">Only published papers are visible to students</p>
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
                        {loading ? 'Creating...' : 'Create Paper'}
                    </button>
                </div>
            </form>
        </div>
    );
}
