/**
 * @fileoverview Question Set Editor Component
 * @description Admin editor for creating/editing question sets (RC passages, DI sets)
 * @architecture Question Container Architecture - Set Mode Editor
 * 
 * Editor Modes:
 * - Set Mode: Create passage ONCE, then add multiple questions below
 * - Single Mode: Create atomic questions (wrapped in single-question set)
 * 
 * Validation:
 * - A Set cannot be published if it has 0 questions
 * - Composite sets require context_body
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
    QuestionSet,
    QuestionSetType,
    ContentLayoutType,
    QuestionInSetWithAnswer,
    SectionName,
    QuestionType,
    QuestionSetMetadata,
    ContextType,
} from '@/types/exam';
import { isCompositeSet } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionSetEditorProps {
    /** Existing set to edit, or null for new set */
    questionSet?: QuestionSet | null;
    /** Paper ID for new sets */
    paperId: string;
    /** Current section */
    section: SectionName;
    /** Callback when set is saved */
    onSave: (set: Partial<QuestionSet>, questions: Partial<QuestionInSetWithAnswer>[]) => Promise<void>;
    /** Callback to cancel editing */
    onCancel: () => void;
}

type EditorMode = 'set' | 'single';

interface QuestionDraft {
    id?: string;
    sequence_order: number;
    question_text: string;
    question_type: QuestionType;
    options: string[];
    correct_answer: string;
    positive_marks: number;
    negative_marks: number;
    solution_text?: string;
    question_image_url?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SET_TYPE_OPTIONS: { value: QuestionSetType; label: string; description: string }[] = [
    { value: 'VARC', label: 'Reading Comprehension', description: 'Passage with 4-6 linked questions' },
    { value: 'DILR', label: 'Data Interpretation', description: 'Chart/table with linked questions' },
    { value: 'CASELET', label: 'Caselet', description: 'Case study with linked questions' },
    { value: 'ATOMIC', label: 'Single Question', description: 'Standalone question (Quant/Logic)' },
];

const LAYOUT_OPTIONS: { value: ContentLayoutType; label: string }[] = [
    { value: 'split_passage', label: 'Split - Passage Left' },
    { value: 'split_chart', label: 'Split - Chart Left' },
    { value: 'split_table', label: 'Split - Table Left' },
    { value: 'single_focus', label: 'Single Focus (Centered)' },
    { value: 'image_top', label: 'Image on Top' },
];

const CONTEXT_TYPE_OPTIONS: { value: ContextType; label: string }[] = [
    { value: 'rc_passage', label: 'RC Passage' },
    { value: 'dilr_set', label: 'DILR Set' },
    { value: 'caselet', label: 'Caselet' },
    { value: 'data_table', label: 'Data Table' },
    { value: 'graph', label: 'Graph' },
    { value: 'other_shared_stimulus', label: 'Other Shared Stimulus' },
];

function inferContextType(setType: QuestionSetType): ContextType | '' {
    if (setType === 'VARC') return 'rc_passage';
    if (setType === 'DILR') return 'dilr_set';
    if (setType === 'CASELET') return 'caselet';
    return '';
}

const EMPTY_QUESTION: QuestionDraft = {
    sequence_order: 1,
    question_text: '',
    question_type: 'MCQ',
    options: ['', '', '', ''],
    correct_answer: 'A',
    positive_marks: 3,
    negative_marks: 1,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestionSetEditor({
    questionSet,
    paperId,
    section,
    onSave,
    onCancel,
}: QuestionSetEditorProps) {
    // Determine initial mode based on existing set or default
    const initialMode: EditorMode = questionSet?.set_type === 'ATOMIC' ? 'single' : 'set';

    // ==========================================================================
    // STATE
    // ==========================================================================

    const [mode, setMode] = useState<EditorMode>(initialMode);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Set-level fields
    const [setType, setSetType] = useState<QuestionSetType>(questionSet?.set_type ?? 'VARC');
    const [contentLayout, setContentLayout] = useState<ContentLayoutType>(
        questionSet?.content_layout ?? 'split_passage'
    );
    const [contextType, setContextType] = useState<ContextType | ''>(
        questionSet?.context_type ?? inferContextType(questionSet?.set_type ?? 'VARC')
    );
    const [contextTitle, setContextTitle] = useState(questionSet?.context_title ?? '');
    const [contextBody, setContextBody] = useState(questionSet?.context_body ?? '');
    const [contextImageUrl, setContextImageUrl] = useState(questionSet?.context_image_url ?? '');
    const [metadata, setMetadata] = useState<QuestionSetMetadata>(questionSet?.metadata ?? {});

    // Questions
    const [questions, setQuestions] = useState<QuestionDraft[]>(() => {
        if (questionSet?.questions && questionSet.questions.length > 0) {
            return questionSet.questions.map((q, idx) => ({
                id: q.id,
                sequence_order: q.sequence_order ?? idx + 1,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options ?? ['', '', '', ''],
                correct_answer: (q as QuestionInSetWithAnswer).correct_answer ?? 'A',
                positive_marks: q.positive_marks,
                negative_marks: q.negative_marks,
                solution_text: (q as QuestionInSetWithAnswer).solution_text,
                question_image_url: q.question_image_url,
            }));
        }
        return [{ ...EMPTY_QUESTION }];
    });

    // Active question index for editing
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    // ==========================================================================
    // MODE SWITCHING
    // ==========================================================================

    const handleModeChange = useCallback((newMode: EditorMode) => {
        setMode(newMode);
        if (newMode === 'single') {
            setSetType('ATOMIC');
            setContentLayout('single_focus');
            setContextType('');
            // Keep only first question for atomic
            setQuestions(prev => [prev[0] ?? { ...EMPTY_QUESTION }]);
        } else {
            // Default to VARC for set mode
            if (setType === 'ATOMIC') {
                setSetType('VARC');
                setContentLayout('split_passage');
                setContextType(inferContextType('VARC'));
            }
        }
    }, [setType]);

    useEffect(() => {
        if (setType === 'ATOMIC') {
            setContextType('');
            return;
        }

        if (!contextType) {
            setContextType(inferContextType(setType));
        }
    }, [setType, contextType]);

    // ==========================================================================
    // QUESTION MANAGEMENT
    // ==========================================================================

    const addQuestion = useCallback(() => {
        setQuestions(prev => [
            ...prev,
            {
                ...EMPTY_QUESTION,
                sequence_order: prev.length + 1,
            },
        ]);
        setActiveQuestionIndex(questions.length);
    }, [questions.length]);

    const removeQuestion = useCallback((index: number) => {
        if (questions.length <= 1) return; // Can't remove last question

        setQuestions(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Renumber sequence_order
            return updated.map((q, i) => ({ ...q, sequence_order: i + 1 }));
        });

        // Adjust active index
        if (activeQuestionIndex >= questions.length - 1) {
            setActiveQuestionIndex(Math.max(0, questions.length - 2));
        }
    }, [questions.length, activeQuestionIndex]);

    const updateQuestion = useCallback((index: number, updates: Partial<QuestionDraft>) => {
        setQuestions(prev => prev.map((q, i) =>
            i === index ? { ...q, ...updates } : q
        ));
    }, []);

    const updateQuestionOption = useCallback((questionIndex: number, optionIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== questionIndex) return q;
            const newOptions = [...q.options];
            newOptions[optionIndex] = value;
            return { ...q, options: newOptions };
        }));
    }, []);

    // ==========================================================================
    // VALIDATION
    // ==========================================================================

    const validate = useCallback((): string[] => {
        const validationErrors: string[] = [];

        // Check questions exist
        if (questions.length === 0) {
            validationErrors.push('At least one question is required');
        }

        // For composite sets, require context body
        if (isCompositeSet(setType) && !contextBody.trim()) {
            validationErrors.push('Context/passage content is required for this set type');
        }

        // Validate each question
        questions.forEach((q, idx) => {
            if (!q.question_text.trim()) {
                validationErrors.push(`Question ${idx + 1}: Question text is required`);
            }
            if (q.question_type === 'MCQ') {
                const filledOptions = q.options.filter(o => o.trim()).length;
                if (filledOptions < 2) {
                    validationErrors.push(`Question ${idx + 1}: At least 2 options are required`);
                }
            }
            if (!q.correct_answer.trim()) {
                validationErrors.push(`Question ${idx + 1}: Correct answer is required`);
            }
        });

        return validationErrors;
    }, [questions, setType, contextBody]);

    // ==========================================================================
    // SAVE HANDLER
    // ==========================================================================

    const handleSave = useCallback(async () => {
        // Validate
        const validationErrors = validate();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setIsSaving(true);

        try {
            const setData: Partial<QuestionSet> = {
                id: questionSet?.id,
                paper_id: paperId,
                section,
                set_type: setType,
                content_layout: contentLayout,
                context_type: contextType || undefined,
                context_title: contextTitle || undefined,
                context_body: contextBody || undefined,
                context_image_url: contextImageUrl || undefined,
                metadata,
                is_active: true,
            };

            const questionData: Partial<QuestionInSetWithAnswer>[] = questions.map((q, idx) => ({
                id: q.id,
                paper_id: paperId,
                section,
                sequence_order: idx + 1,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.question_type === 'MCQ' ? q.options.filter(o => o.trim()) : null,
                correct_answer: q.correct_answer,
                positive_marks: q.positive_marks,
                negative_marks: q.question_type === 'TITA' ? 0 : q.negative_marks,
                solution_text: q.solution_text,
                question_image_url: q.question_image_url,
                is_active: true,
            }));

            await onSave(setData, questionData);
        } catch (error) {
            console.error('Failed to save question set:', error);
            setErrors(['Failed to save. Please try again.']);
        } finally {
            setIsSaving(false);
        }
    }, [
        validate, questionSet?.id, paperId, section, setType, contentLayout,
        contextType, contextTitle, contextBody, contextImageUrl, metadata, questions, onSave
    ]);

    // ==========================================================================
    // RENDER
    // ==========================================================================

    const activeQuestion = questions[activeQuestionIndex];

    return (
        <div className="h-full flex flex-col bg-exam-bg-page">
            {/* Header with Mode Selector */}
            <div className="bg-exam-bg-white border-b border-exam-bg-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-exam-text-primary">
                            {questionSet ? 'Edit Question Set' : 'Create Question Set'}
                        </h2>

                        {/* Mode Toggle */}
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button
                                onClick={() => handleModeChange('set')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'set'
                                    ? 'bg-section-varc text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📚 Create Set (RC/DI)
                            </button>
                            <button
                                onClick={() => handleModeChange('single')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'single'
                                    ? 'bg-section-qa text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📝 Single Question
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Set'}
                        </button>
                    </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <ul className="list-disc list-inside text-sm text-red-600">
                            {errors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Set Configuration */}
                <div className="w-1/3 border-r border-exam-bg-border overflow-y-auto bg-exam-bg-white">
                    <div className="p-6 space-y-6">
                        {/* Set Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Set Type
                            </label>
                            <select
                                value={setType}
                                onChange={(e) => setSetType(e.target.value as QuestionSetType)}
                                disabled={mode === 'single'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none disabled:bg-gray-100"
                            >
                                {SET_TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {SET_TYPE_OPTIONS.find(o => o.value === setType)?.description}
                            </p>
                        </div>

                        {/* Layout Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content Layout
                            </label>
                            <select
                                value={contentLayout}
                                onChange={(e) => setContentLayout(e.target.value as ContentLayoutType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                            >
                                {LAYOUT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Context Content (for composite sets) */}
                        {isCompositeSet(setType) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Context Type
                                    </label>
                                    <select
                                        value={contextType}
                                        onChange={(e) => setContextType(e.target.value as ContextType)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                                    >
                                        {CONTEXT_TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Context Title (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={contextTitle}
                                        onChange={(e) => setContextTitle(e.target.value)}
                                        placeholder="e.g., Passage 1, Data Set A"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Context Body <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={contextBody}
                                        onChange={(e) => setContextBody(e.target.value)}
                                        placeholder={
                                            setType === 'VARC'
                                                ? 'Paste the reading passage here...'
                                                : 'Enter the data set description, table data, or scenario...'
                                        }
                                        rows={12}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none resize-y font-mono text-sm leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Context Image URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={contextImageUrl}
                                        onChange={(e) => setContextImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                                    />
                                    {contextImageUrl && (
                                        <img
                                            src={contextImageUrl}
                                            alt="Context preview"
                                            className="mt-2 max-w-full h-32 object-contain rounded border"
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        {/* Metadata */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Metadata
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={metadata.topic ?? ''}
                                    onChange={(e) => setMetadata({ ...metadata, topic: e.target.value })}
                                    placeholder="Topic"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <select
                                    value={metadata.difficulty ?? ''}
                                    onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="">Difficulty</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Questions */}
                <div className="flex-1 flex flex-col overflow-hidden bg-exam-bg-pane">
                    {/* Question Tabs */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-exam-bg-border bg-exam-bg-white">
                        <span className="text-sm font-medium text-gray-600">Questions:</span>
                        <div className="flex gap-1 flex-wrap">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveQuestionIndex(idx)}
                                    className={`
                                        w-8 h-8 rounded text-sm font-medium transition-colors
                                        ${idx === activeQuestionIndex
                                            ? 'bg-status-current text-white'
                                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        {mode === 'set' && (
                            <button
                                onClick={addQuestion}
                                className="w-8 h-8 rounded border border-dashed border-gray-400 text-gray-400 hover:border-section-varc hover:text-section-varc transition-colors"
                                title="Add Question"
                            >
                                +
                            </button>
                        )}
                    </div>

                    {/* Active Question Editor */}
                    {activeQuestion && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <QuestionEditor
                                question={activeQuestion}
                                questionNumber={activeQuestionIndex + 1}
                                canRemove={questions.length > 1}
                                onUpdate={(updates) => updateQuestion(activeQuestionIndex, updates)}
                                onUpdateOption={(optIdx, value) => updateQuestionOption(activeQuestionIndex, optIdx, value)}
                                onRemove={() => removeQuestion(activeQuestionIndex)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// QUESTION EDITOR SUB-COMPONENT
// =============================================================================

interface QuestionEditorProps {
    question: QuestionDraft;
    questionNumber: number;
    canRemove: boolean;
    onUpdate: (updates: Partial<QuestionDraft>) => void;
    onUpdateOption: (optionIndex: number, value: string) => void;
    onRemove: () => void;
}

function QuestionEditor({
    question,
    questionNumber,
    canRemove,
    onUpdate,
    onUpdateOption,
    onRemove,
}: QuestionEditorProps) {
    const OPTION_LABELS = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-exam-bg-white rounded-lg border border-exam-bg-border p-6 space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-exam-text-primary">
                    Question {questionNumber}
                </h3>
                <div className="flex items-center gap-3">
                    {/* Question Type */}
                    <select
                        value={question.question_type}
                        onChange={(e) => onUpdate({ question_type: e.target.value as QuestionType })}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="MCQ">MCQ</option>
                        <option value="TITA">TITA (Numeric)</option>
                    </select>

                    {/* Marks */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">+</span>
                        <input
                            type="number"
                            value={question.positive_marks}
                            onChange={(e) => onUpdate({ positive_marks: Number(e.target.value) })}
                            className="w-12 px-2 py-1 border border-green-300 rounded bg-green-50 text-center"
                            min={0}
                            step={0.5}
                        />
                        <span className="text-red-600">-</span>
                        <input
                            type="number"
                            value={question.negative_marks}
                            onChange={(e) => onUpdate({ negative_marks: Number(e.target.value) })}
                            className="w-12 px-2 py-1 border border-red-300 rounded bg-red-50 text-center"
                            min={0}
                            step={0.25}
                            disabled={question.question_type === 'TITA'}
                        />
                    </div>

                    {/* Remove Button */}
                    {canRemove && (
                        <button
                            onClick={onRemove}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Question"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Question Text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={question.question_text}
                    onChange={(e) => onUpdate({ question_text: e.target.value })}
                    placeholder="Enter the question stem..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none resize-y"
                />
            </div>

            {/* Question Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Image URL (optional)
                </label>
                <input
                    type="url"
                    value={question.question_image_url ?? ''}
                    onChange={(e) => onUpdate({ question_image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                />
            </div>

            {/* Options (for MCQ) */}
            {question.question_type === 'MCQ' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        {OPTION_LABELS.map((label, idx) => (
                            <div key={label} className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => onUpdate({ correct_answer: label })}
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors
                                        ${question.correct_answer === label
                                            ? 'bg-status-answered text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }
                                    `}
                                    title={question.correct_answer === label ? 'Correct answer' : 'Click to mark as correct'}
                                >
                                    {label}
                                </button>
                                <input
                                    type="text"
                                    value={question.options[idx] ?? ''}
                                    onChange={(e) => onUpdateOption(idx, e.target.value)}
                                    placeholder={`Enter option ${label}...`}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                                />
                                {question.correct_answer === label && (
                                    <span className="text-status-answered text-sm font-medium">✓ Correct</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Correct Answer (for TITA) */}
            {question.question_type === 'TITA' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer (Numeric) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={question.correct_answer}
                        onChange={(e) => onUpdate({ correct_answer: e.target.value })}
                        placeholder="Enter the exact numeric answer..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter the exact answer. For ranges, use format: 45.5 to 46.5
                    </p>
                </div>
            )}

            {/* Solution */}
            <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Solution (Optional)
                </summary>
                <textarea
                    value={question.solution_text ?? ''}
                    onChange={(e) => onUpdate({ solution_text: e.target.value })}
                    placeholder="Enter the solution explanation..."
                    rows={4}
                    className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none resize-y"
                />
            </details>
        </div>
    );
}
