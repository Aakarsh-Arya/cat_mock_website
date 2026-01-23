/**
 * @fileoverview New Question Set Client Component
 * @description Client-side form for creating question sets
 * @blueprint Question Container Architecture
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SectionName, ContentLayoutType } from '@/types/exam';

// Local type that includes ATOMIC (matches database schema)
type QuestionSetType = 'VARC' | 'DILR' | 'CASELET' | 'ATOMIC';

interface Paper {
    id: string;
    title: string;
    slug: string;
}

interface NewQuestionSetClientProps {
    papers: Paper[];
}

interface QuestionDraft {
    tempId: string;
    question_text: string;
    question_type: 'MCQ' | 'TITA';
    options: string[];
    correct_answer: string;
    positive_marks: number;
    negative_marks: number;
    difficulty?: string;
    topic?: string;
}

const SET_TYPES: { value: QuestionSetType; label: string; description: string }[] = [
    { value: 'VARC', label: 'VARC (Reading Comprehension)', description: 'Passage with 4-6 comprehension questions' },
    { value: 'DILR', label: 'DILR (Data Interpretation / Logical Reasoning)', description: 'Chart/table/data set with analytical questions' },
    { value: 'CASELET', label: 'Caselet', description: 'Case study with multiple questions' },
    { value: 'ATOMIC', label: 'Atomic (Single Question)', description: 'Standalone question without shared context' },
];

const CONTENT_LAYOUTS: { value: ContentLayoutType; label: string }[] = [
    { value: 'split_passage', label: 'Split: Passage Left, Question Right' },
    { value: 'split_chart', label: 'Split: Chart Left, Question Right' },
    { value: 'split_table', label: 'Split: Table Left, Question Right' },
    { value: 'single_focus', label: 'Single Focus (Full Width)' },
    { value: 'image_top', label: 'Image Top, Question Below' },
];

const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];

export function NewQuestionSetClient({ papers }: NewQuestionSetClientProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [selectedPaperId, setSelectedPaperId] = useState(papers[0]?.id ?? '');
    const [section, setSection] = useState<SectionName>('VARC');
    const [setType, setSetType] = useState<QuestionSetType>('VARC');
    const [contentLayout, setContentLayout] = useState<ContentLayoutType>('split_passage');
    const [contextTitle, setContextTitle] = useState('');
    const [contextBody, setContextBody] = useState('');
    const [contextImageUrl, setContextImageUrl] = useState('');

    // Questions
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);

    // Auto-suggest layout based on set type
    const handleSetTypeChange = (newType: QuestionSetType) => {
        setSetType(newType);
        if (newType === 'VARC') {
            setContentLayout('split_passage');
            setSection('VARC');
        } else if (newType === 'DILR') {
            setContentLayout('split_chart');
            setSection('DILR');
        } else if (newType === 'CASELET') {
            setContentLayout('split_passage');
        } else if (newType === 'ATOMIC') {
            setContentLayout('single_focus');
            // Add one empty question for atomic
            if (questions.length === 0) {
                addQuestion();
            }
        }
    };

    // Add a new question
    const addQuestion = useCallback(() => {
        setQuestions(prev => [...prev, {
            tempId: `temp-${Date.now()}`,
            question_text: '',
            question_type: 'MCQ',
            options: ['', '', '', ''],
            correct_answer: 'A',
            positive_marks: 3,
            negative_marks: 1,
        }]);
    }, []);

    // Update a question
    const updateQuestion = useCallback((tempId: string, updates: Partial<QuestionDraft>) => {
        setQuestions(prev => prev.map(q =>
            q.tempId === tempId ? { ...q, ...updates } : q
        ));
    }, []);

    // Remove a question
    const removeQuestion = useCallback((tempId: string) => {
        setQuestions(prev => prev.filter(q => q.tempId !== tempId));
    }, []);

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!selectedPaperId) {
            setError('Please select a paper');
            return;
        }
        if (setType !== 'ATOMIC' && !contextBody.trim()) {
            setError('Context/passage is required for this set type');
            return;
        }
        if (questions.length === 0) {
            setError('At least one question is required');
            return;
        }
        for (const q of questions) {
            if (!q.question_text.trim()) {
                setError('All questions must have text');
                return;
            }
        }

        setSaving(true);

        try {
            // Create the question set via API
            const response = await fetch('/api/admin/question-sets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paper_id: selectedPaperId,
                    section,
                    set_type: setType,
                    content_layout: contentLayout,
                    context_title: contextTitle || null,
                    context_body: contextBody || null,
                    context_image_url: contextImageUrl || null,
                    questions: questions.map((q, index) => ({
                        ...q,
                        sequence_order: index + 1,
                    })),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create question set');
            }

            // Redirect to question sets list
            router.push('/admin/question-sets');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Question Set</h1>
                    <p className="text-gray-600">Add a new RC passage, DI/LR set, or atomic question</p>
                </div>
                <Link
                    href="/admin/question-sets"
                    className="text-gray-600 hover:text-gray-900"
                >
                    ← Back to Question Sets
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Paper Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">1. Select Paper</h2>
                    <select
                        value={selectedPaperId}
                        onChange={(e) => setSelectedPaperId(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    >
                        <option value="">Select a paper...</option>
                        {papers.map(paper => (
                            <option key={paper.id} value={paper.id}>
                                {paper.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Set Type & Configuration */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">2. Set Type & Configuration</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Set Type
                            </label>
                            <select
                                value={setType}
                                onChange={(e) => handleSetTypeChange(e.target.value as QuestionSetType)}
                                className="w-full border rounded-lg px-4 py-2"
                            >
                                {SET_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {SET_TYPES.find(t => t.value === setType)?.description}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section
                            </label>
                            <select
                                value={section}
                                onChange={(e) => setSection(e.target.value as SectionName)}
                                className="w-full border rounded-lg px-4 py-2"
                            >
                                {SECTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content Layout
                        </label>
                        <select
                            value={contentLayout}
                            onChange={(e) => setContentLayout(e.target.value as ContentLayoutType)}
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            {CONTENT_LAYOUTS.map(layout => (
                                <option key={layout.value} value={layout.value}>
                                    {layout.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Context/Passage */}
                {setType !== 'ATOMIC' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">3. Context / Passage</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title (optional)
                                </label>
                                <input
                                    type="text"
                                    value={contextTitle}
                                    onChange={(e) => setContextTitle(e.target.value)}
                                    placeholder="e.g., Passage 1, Data Set A"
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content *
                                </label>
                                <textarea
                                    value={contextBody}
                                    onChange={(e) => setContextBody(e.target.value)}
                                    placeholder="Enter the passage, data description, or context here..."
                                    rows={10}
                                    className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={contextImageUrl}
                                    onChange={(e) => setContextImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            {setType === 'ATOMIC' ? '3. Question' : '4. Questions'}
                        </h2>
                        {setType !== 'ATOMIC' && (
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                            >
                                + Add Question
                            </button>
                        )}
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No questions yet.</p>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="mt-2 text-blue-600 hover:underline"
                            >
                                Add your first question
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {questions.map((q, index) => (
                                <div key={q.tempId} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Question {index + 1}</span>
                                        {(setType !== 'ATOMIC' || questions.length > 1) && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(q.tempId)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <textarea
                                            value={q.question_text}
                                            onChange={(e) => updateQuestion(q.tempId, { question_text: e.target.value })}
                                            placeholder="Enter question text..."
                                            rows={3}
                                            className="w-full border rounded px-3 py-2"
                                            required
                                        />

                                        <div className="grid grid-cols-3 gap-3">
                                            <select
                                                value={q.question_type}
                                                onChange={(e) => updateQuestion(q.tempId, {
                                                    question_type: e.target.value as 'MCQ' | 'TITA',
                                                    negative_marks: e.target.value === 'TITA' ? 0 : 1,
                                                })}
                                                className="border rounded px-3 py-2"
                                            >
                                                <option value="MCQ">MCQ</option>
                                                <option value="TITA">TITA (Numeric)</option>
                                            </select>

                                            <input
                                                type="number"
                                                value={q.positive_marks}
                                                onChange={(e) => updateQuestion(q.tempId, { positive_marks: Number(e.target.value) })}
                                                className="border rounded px-3 py-2"
                                                placeholder="+Marks"
                                                step="0.5"
                                            />

                                            <input
                                                type="number"
                                                value={q.negative_marks}
                                                onChange={(e) => updateQuestion(q.tempId, { negative_marks: Number(e.target.value) })}
                                                className="border rounded px-3 py-2"
                                                placeholder="-Marks"
                                                step="0.5"
                                                disabled={q.question_type === 'TITA'}
                                            />
                                        </div>

                                        {q.question_type === 'MCQ' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {['A', 'B', 'C', 'D'].map((label, i) => (
                                                    <div key={label} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${q.tempId}`}
                                                            checked={q.correct_answer === label}
                                                            onChange={() => updateQuestion(q.tempId, { correct_answer: label })}
                                                        />
                                                        <span className="font-medium">{label}.</span>
                                                        <input
                                                            type="text"
                                                            value={q.options[i]}
                                                            onChange={(e) => {
                                                                const newOptions = [...q.options];
                                                                newOptions[i] = e.target.value;
                                                                updateQuestion(q.tempId, { options: newOptions });
                                                            }}
                                                            placeholder={`Option ${label}`}
                                                            className="flex-1 border rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {q.question_type === 'TITA' && (
                                            <input
                                                type="text"
                                                value={q.correct_answer}
                                                onChange={(e) => updateQuestion(q.tempId, { correct_answer: e.target.value })}
                                                placeholder="Correct answer (e.g., 42, 3.14)"
                                                className="w-full border rounded px-3 py-2"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/admin/question-sets"
                        className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Creating...' : 'Create Question Set'}
                    </button>
                </div>
            </form>
        </div>
    );
}
