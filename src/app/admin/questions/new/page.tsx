/**
 * @fileoverview New Question Form
 * @description Admin page to create a new question with full editing capabilities
 */

'use client';

import { useState, useEffect, type ClipboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabase/client';
import { adminLogger } from '@/lib/logger';

interface Paper {
    id: string;
    title: string;
    slug: string;
}

interface Context {
    id: string;
    title: string;
    section: string;
    paper_id: string;
}

function handlePlainTextPaste(
    event: ClipboardEvent<HTMLTextAreaElement>,
    onChange: (next: string) => void
) {
    event.preventDefault();
    const plainText = event.clipboardData.getData('text/plain');
    const htmlText = event.clipboardData.getData('text/html');
    let pastedText = plainText;

    const plainHasLineBreaks = /[\r\n]/.test(plainText);
    const htmlHasStructuredBreaks = /<(br|p|div|li|h[1-6]|tr|blockquote|pre)\b/i.test(htmlText);

    if (!plainHasLineBreaks && htmlHasStructuredBreaks && typeof DOMParser !== 'undefined') {
        try {
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');
            doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
            doc.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,h6,tr,blockquote,pre').forEach((node) => {
                node.append('\n');
            });
            pastedText = (doc.body.textContent ?? plainText).replace(/\r\n?/g, '\n');
        } catch {
            pastedText = plainText;
        }
    }

    const target = event.currentTarget;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    const nextValue = `${target.value.slice(0, start)}${pastedText}${target.value.slice(end)}`;

    onChange(nextValue);

    const nextCursor = start + pastedText.length;
    requestAnimationFrame(() => {
        target.focus();
        target.setSelectionRange(nextCursor, nextCursor);
    });
}

export default function NewQuestionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedPaperId = searchParams.get('paper');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [contexts, setContexts] = useState<Context[]>([]);

    const [formData, setFormData] = useState({
        paper_id: preselectedPaperId || '',
        section: 'VARC',
        question_number: 1,
        question_text: '',
        question_type: 'MCQ',
        options: ['', '', '', ''],
        correct_answer: '',
        positive_marks: 3,
        negative_marks: 1,
        solution_text: '',
        difficulty: 'medium',
        topic: '',
        subtopic: '',
        context_id: '',
    });

    // Fetch papers and contexts on mount
    useEffect(() => {
        const fetchData = async () => {
            const supabase = sb();

            const [papersResult, contextsResult] = await Promise.all([
                supabase.from('papers').select('id, title, slug').order('title'),
                supabase.from('question_contexts').select('id, title, section, paper_id').order('title'),
            ]);

            if (papersResult.data) setPapers(papersResult.data as Paper[]);
            if (contextsResult.data) setContexts(contextsResult.data as Context[]);
        };

        fetchData();
    }, []);

    // Filter contexts by selected paper
    const filteredContexts = contexts.filter(
        c => c.paper_id === formData.paper_id && c.section === formData.section
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleOptionChange = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            options: prev.options.map((opt, i) => (i === index ? value : opt)),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = sb();

            // Prepare options as JSONB array
            const optionsJson = formData.question_type === 'MCQ'
                ? formData.options.filter(o => o.trim() !== '')
                : null;

            const { data, error: insertError } = await supabase
                .from('questions')
                .insert({
                    paper_id: formData.paper_id,
                    section: formData.section,
                    question_number: formData.question_number,
                    question_text: formData.question_text,
                    question_type: formData.question_type,
                    options: optionsJson,
                    correct_answer: formData.correct_answer,
                    positive_marks: formData.positive_marks,
                    negative_marks: formData.question_type === 'TITA' ? 0 : formData.negative_marks,
                    solution_text: formData.solution_text || null,
                    difficulty: formData.difficulty,
                    topic: formData.topic || null,
                    subtopic: formData.subtopic || null,
                    context_id: formData.context_id || null,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Redirect to edit page or questions list
            router.push(`/admin/questions/${data.id}`);
        } catch (err: unknown) {
            adminLogger.dataModified('questions', 'create_error', { error: err });
            setError(err instanceof Error ? err.message : 'Failed to create question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Question</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Paper & Section Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    <div>
                        <label htmlFor="question_number" className="block text-sm font-medium text-gray-700 mb-1">
                            Question Number *
                        </label>
                        <input
                            type="number"
                            id="question_number"
                            name="question_number"
                            value={formData.question_number}
                            onChange={handleChange}
                            required
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Context Selection */}
                <div>
                    <label htmlFor="context_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Context/Passage (optional)
                    </label>
                    <select
                        id="context_id"
                        name="context_id"
                        value={formData.context_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">No context (standalone question)</option>
                        {filteredContexts.map((context) => (
                            <option key={context.id} value={context.id}>
                                {context.title}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                        Select a passage/context that this question is based on
                    </p>
                </div>

                {/* Question Content */}
                <div>
                    <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text *
                    </label>
                    <textarea
                        id="question_text"
                        name="question_text"
                        value={formData.question_text}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Enter the question text here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                </div>

                {/* Question Type & Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="question_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type *
                        </label>
                        <select
                            id="question_type"
                            name="question_type"
                            value={formData.question_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="MCQ">MCQ (Multiple Choice)</option>
                            <option value="TITA">TITA (Type in the Answer)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer *
                        </label>
                        {formData.question_type === 'MCQ' ? (
                            <select
                                id="correct_answer"
                                name="correct_answer"
                                value={formData.correct_answer}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select correct option</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                id="correct_answer"
                                name="correct_answer"
                                value={formData.correct_answer}
                                onChange={handleChange}
                                required
                                placeholder="Enter the exact answer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        )}
                    </div>
                </div>

                {/* MCQ Options */}
                {formData.question_type === 'MCQ' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Options
                        </label>
                        {['A', 'B', 'C', 'D'].map((label, index) => (
                            <div key={label} className="flex items-start gap-3">
                                <span className="mt-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                    {label}
                                </span>
                                <textarea
                                    value={formData.options[index]}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    rows={2}
                                    placeholder={`Option ${label}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Marks & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label htmlFor="positive_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Positive Marks
                        </label>
                        <input
                            type="number"
                            id="positive_marks"
                            name="positive_marks"
                            value={formData.positive_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="negative_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Negative Marks
                        </label>
                        <input
                            type="number"
                            id="negative_marks"
                            name="negative_marks"
                            value={formData.question_type === 'TITA' ? 0 : formData.negative_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            disabled={formData.question_type === 'TITA'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        {formData.question_type === 'TITA' && (
                            <p className="mt-1 text-xs text-gray-500">TITA questions have no negative marking</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty
                        </label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                            Topic
                        </label>
                        <input
                            type="text"
                            id="topic"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder="e.g., Reading Comprehension"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Solution */}
                <div>
                    <label htmlFor="solution_text" className="block text-sm font-medium text-gray-700 mb-1">
                        Solution/Explanation
                    </label>
                    <textarea
                        id="solution_text"
                        name="solution_text"
                        value={formData.solution_text}
                        onChange={handleChange}
                        onPaste={(event) =>
                            handlePlainTextPaste(event, (nextValue) =>
                                setFormData((prev) => ({ ...prev, solution_text: nextValue }))
                            )
                        }
                        rows={4}
                        placeholder="Explain the solution..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                        {loading ? 'Creating...' : 'Create Question'}
                    </button>
                </div>
            </form>
        </div>
    );
}
