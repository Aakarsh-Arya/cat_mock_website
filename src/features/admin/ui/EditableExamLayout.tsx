/**
 * @fileoverview Editable Exam Layout (Mirror Principle)
 * @description Exact replica of ExamLayout but with editable fields
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paper, QuestionWithAnswer, SectionName, QuestionContext, QuestionType } from '@/types/exam';
import { uploadToCloudinary } from '@/lib/cloudinary';

// =============================================================================
// TYPES
// =============================================================================

interface EditableExamLayoutProps {
    paper: Paper;
    questions: QuestionWithAnswer[];
    contexts: QuestionContext[];
    onSaveQuestion: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    onSaveContext?: (context: Partial<QuestionContext>) => Promise<void>;
    onDeleteContext?: (contextId: string) => Promise<void>;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];

// =============================================================================
// EDITABLE HEADER (Mirrors ExamHeader)
// =============================================================================

interface EditableHeaderProps {
    paper: Paper;
    currentSectionIndex: number;
    onSectionChange: (index: number) => void;
}

function EditableHeader({ paper, currentSectionIndex, onSectionChange }: EditableHeaderProps) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-exam-header-from to-exam-header-to text-white shadow-md">
            <div className="max-w-screen-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left - Back Button + Paper Info */}
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <button
                            onClick={() => router.push('/admin/papers')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Back to Papers"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-yellow-500/80 text-gray-900 text-[10px] font-bold rounded tracking-wider">
                                ✏️ EDIT
                            </span>
                            <h1 className="text-xl font-bold">{paper.title}</h1>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-blue-100">
                            <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                {paper.total_questions} Questions
                            </span>
                        </div>
                    </div>

                    {/* Center - Section Tabs (Clickable in edit mode) */}
                    <div className="hidden md:flex items-center gap-2">
                        {SECTIONS.map((section, index) => {
                            const getSectionButtonClasses = () => {
                                const base = 'px-4 py-2 rounded-md text-sm font-semibold transition-colors border cursor-pointer';
                                if (index !== currentSectionIndex) {
                                    return `${base} bg-white/10 text-blue-100 border-white/20 hover:bg-white/20`;
                                }
                                // Active section - use section color
                                switch (section) {
                                    case 'VARC': return `${base} bg-section-varc text-white border-section-varc`;
                                    case 'DILR': return `${base} bg-section-dilr text-white border-section-dilr`;
                                    case 'QA': return `${base} bg-section-qa text-white border-section-qa`;
                                    default: return `${base} bg-white text-exam-header-from border-white`;
                                }
                            };
                            return (
                                <button
                                    key={section}
                                    onClick={() => onSectionChange(index)}
                                    className={getSectionButtonClasses()}
                                >
                                    {section}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right - Exit Button */}
                    <Link
                        href="/admin/papers"
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md text-sm transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden sm:inline">Exit Editor</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

// =============================================================================
// EDITABLE MCQ OPTION (Mirrors MCQOption)
// =============================================================================

interface EditableOptionProps {
    label: string;
    value: string;
    isCorrect: boolean;
    onChange: (value: string) => void;
    onMarkCorrect: () => void;
}

function EditableOption({ label, value, isCorrect, onChange, onMarkCorrect }: EditableOptionProps) {
    return (
        <div
            className={`
                w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all
                ${isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
            `}
        >
            {/* Option Label - Click to mark correct */}
            <button
                type="button"
                onClick={onMarkCorrect}
                title={isCorrect ? 'Correct answer' : 'Click to mark as correct'}
                className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-bold transition-colors cursor-pointer
                    ${isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                    }
                `}
            >
                {label}
            </button>

            {/* Editable Option Text (WYSIWYG Mirror Style) */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter option ${label}...`}
                className="flex-1 text-left bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded outline-none text-gray-800 transition-colors"
            />

            {/* Correct Indicator */}
            {isCorrect && (
                <span className="flex-shrink-0 text-green-500 text-sm font-medium">✓ Correct</span>
            )}
        </div>
    );
}

// =============================================================================
// IMAGE UPLOAD ZONE (Where diagrams appear in exam)
// =============================================================================

interface ImageUploadZoneProps {
    imageUrl: string | null;
    onUpload: (file: File) => Promise<void>;
    onRemove: () => void;
    isUploading: boolean;
    label?: string;
}

function ImageUploadZone({ imageUrl, onUpload, onRemove, isUploading, label = 'Diagram/Image' }: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await onUpload(file);
        }
    }, [onUpload]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onUpload(file);
        }
    }, [onUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!isDragging) {
            setIsDragging(true);
        }
    }, [isDragging]);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    if (imageUrl) {
        return (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={imageUrl} alt={label} className="w-full max-h-64 object-contain" />
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove image"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">{label}</span>
                        <span className="text-xs text-gray-400">Drop image here or click to upload</span>
                    </div>
                )}
            </label>
        </div>
    );
}

// =============================================================================
// EDITABLE CONTEXT PANE (Mirrors ContextPane from ExamLayout)
// =============================================================================

interface EditableContextPaneProps {
    context: QuestionContext | null;
    contexts: QuestionContext[];
    section: SectionName;
    paperId: string;
    onSave: (context: Partial<QuestionContext>) => Promise<void>;
    onSelectContext: (contextId: string | null) => void;
    selectedContextId: string | null;
}

function EditableContextPane({
    context,
    contexts,
    section,
    paperId,
    onSave,
    onSelectContext,
    selectedContextId,
}: EditableContextPaneProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(context?.title ?? '');
    const [content, setContent] = useState(context?.content ?? '');
    const [contextType, setContextType] = useState<'passage' | 'data_set' | 'image' | 'table'>(
        (context?.context_type as 'passage' | 'data_set' | 'image' | 'table') ?? 'passage'
    );
    const [imageUrl, setImageUrl] = useState<string | null>(context?.image_url ?? null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when context changes
    useEffect(() => {
        setTitle(context?.title ?? '');
        setContent(context?.content ?? '');
        setContextType((context?.context_type as 'passage' | 'data_set' | 'image' | 'table') ?? 'passage');
        setImageUrl(context?.image_url ?? null);
        setIsEditing(!context);
    }, [context?.id]);

    const handleImageUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImageUrl(url);
        } catch (error) {
            console.error('Failed to upload context image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const sectionContexts = contexts.filter(c => c.section === section);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                ...context,
                paper_id: paperId,
                section,
                title: title || undefined,
                content,
                context_type: contextType,
                image_url: imageUrl ?? undefined,
                is_active: true,
                display_order: context?.display_order ?? sectionContexts.length + 1,
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 border-r border-gray-200 h-full flex flex-col">
            {/* Sticky Header with context selector */}
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {section === 'VARC' ? 'Reading Passage' : 'Data Set / Context'}
                    </h3>
                    {!isEditing && context && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {/* Context Selector Dropdown */}
                <select
                    value={selectedContextId ?? 'none'}
                    onChange={(e) => onSelectContext(e.target.value === 'none' ? null : e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                >
                    <option value="none">— No Context —</option>
                    <option value="new">+ Create New Context</option>
                    {sectionContexts.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.title || `Context ${c.display_order}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Scrollable Content / Edit Form */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {selectedContextId === 'new' || isEditing ? (
                    <div className="space-y-3">
                        <select
                            value={contextType}
                            onChange={(e) => setContextType(e.target.value as typeof contextType)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                        >
                            <option value="passage">Passage</option>
                            <option value="data_set">Data Set</option>
                            <option value="table">Table</option>
                            <option value="image">Image Only</option>
                        </select>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Context title (e.g., Passage 1, Set A)..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={section === 'VARC'
                                ? 'Paste the reading passage here...'
                                : 'Enter the data set, table description, or context...'}
                            rows={12}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono leading-relaxed"
                        />

                        {/* Context Image Upload (for DILR diagrams, charts, tables) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-600">
                                Context Image (Diagrams, Charts, Tables)
                            </label>
                            <ImageUploadZone
                                onUpload={handleImageUpload}
                                imageUrl={imageUrl}
                                onRemove={() => setImageUrl(null)}
                                label="Drop context image or click to upload"
                                isUploading={isUploading}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    if (selectedContextId === 'new') {
                                        onSelectContext(null);
                                    }
                                }}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving || !content.trim()}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Context'}
                            </button>
                        </div>
                    </div>
                ) : context ? (
                    <div className="space-y-4">
                        {/* Context Image */}
                        {context.image_url && (
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                                <img
                                    src={context.image_url}
                                    alt={context.title || 'Context image'}
                                    className="w-full object-contain max-h-80"
                                />
                            </div>
                        )}
                        {/* Context Text */}
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {context.content}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No context selected</p>
                        <p className="text-xs mt-1">Select or create a context above</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// EDITABLE QUESTION AREA (Mirrors QuestionArea exactly)
// =============================================================================

interface EditableQuestionAreaProps {
    question: Partial<QuestionWithAnswer> | null;
    questionNumber: number;
    totalQuestions: number;
    section: SectionName;
    paperId: string;
    contexts: QuestionContext[];
    onSave: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    onSaveContext: (context: Partial<QuestionContext>) => Promise<void>;
    isSaving: boolean;
}

function EditableQuestionArea({
    question,
    questionNumber,
    totalQuestions,
    section,
    paperId,
    contexts,
    onSave,
    onSaveContext,
    isSaving,
}: EditableQuestionAreaProps) {
    // Local state for editing
    const [questionText, setQuestionText] = useState(question?.question_text ?? '');
    const [questionType, setQuestionType] = useState<QuestionType>(question?.question_type ?? 'MCQ');
    const [options, setOptions] = useState<string[]>(question?.options ?? ['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer ?? 'A');
    const [positiveMarks, setPositiveMarks] = useState(question?.positive_marks ?? 3);
    const [negativeMarks, setNegativeMarks] = useState(question?.negative_marks ?? 1);
    const [solutionText, setSolutionText] = useState(question?.solution_text ?? '');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedContextId, setSelectedContextId] = useState<string | null>(
        question?.context_id ?? null
    );
    const questionTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (!question) {
            setQuestionText('');
            setQuestionType('MCQ');
            setOptions(['', '', '', '']);
            setCorrectAnswer('A');
            setPositiveMarks(3);
            setNegativeMarks(1);
            setSelectedContextId(null);
            setSolutionText('');
            setImageUrl(null);
            setSelectedContextId(null);
            return;
        }

        setQuestionText(question.question_text ?? '');
        setQuestionType(question.question_type ?? 'MCQ');
        setOptions(question.options ?? ['', '', '', '']);
        setCorrectAnswer(question.correct_answer ?? 'A');
        setPositiveMarks(question.positive_marks ?? 3);
        setNegativeMarks(question.negative_marks ?? 1);
        setSolutionText(question.solution_text ?? '');
        setImageUrl(question.question_image_url ?? null);
        setSelectedContextId(question.context_id ?? null);
    }, [question?.id]);

    useEffect(() => {
        const textarea = questionTextareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [questionText]);

    // Handle option change
    const handleOptionChange = useCallback((index: number, value: string) => {
        setOptions(prev => {
            const newOptions = [...prev];
            newOptions[index] = value;
            return newOptions;
        });
    }, []);

    // Handle image upload to Cloudinary
    const handleImageUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImageUrl(url);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Handle save - include context_id
    const handleSave = useCallback(async () => {
        const questionData: Partial<QuestionWithAnswer> = {
            ...question,
            paper_id: paperId,
            section,
            question_number: questionNumber,
            question_text: questionText,
            question_type: questionType,
            options: questionType === 'MCQ' ? options : null,
            correct_answer: correctAnswer,
            positive_marks: positiveMarks,
            negative_marks: questionType === 'TITA' ? 0 : negativeMarks,
            solution_text: solutionText || undefined,
            question_image_url: imageUrl || undefined,
            context_id: selectedContextId && selectedContextId !== 'new' ? selectedContextId : undefined,
            is_active: true,
        };

        await onSave(questionData);
    }, [question, paperId, section, questionNumber, questionText, questionType, options, correctAnswer, positiveMarks, negativeMarks, solutionText, imageUrl, selectedContextId, onSave]);

    // Get current context object
    const currentContext = selectedContextId && selectedContextId !== 'new'
        ? contexts.find(c => c.id === selectedContextId) ?? null
        : null;

    // Determine if we show split view (VARC/DILR sections typically have contexts)
    const showSplitView = section === 'VARC' || section === 'DILR';

    // ==========================================================================
    // SPLIT VIEW: For VARC/DILR with context pane on the left
    // ==========================================================================
    if (showSplitView) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-220px)] min-h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                {/* Left Pane: Editable Context/Passage */}
                <div className="order-1 lg:order-1 h-full overflow-hidden">
                    <EditableContextPane
                        context={currentContext}
                        contexts={contexts}
                        section={section}
                        paperId={paperId}
                        onSave={onSaveContext}
                        onSelectContext={setSelectedContextId}
                        selectedContextId={selectedContextId}
                    />
                </div>

                {/* Right Pane: Question Editor */}
                <div className="order-2 lg:order-2 bg-white h-full overflow-y-auto">
                    <div className="p-6">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <span className="text-sm text-gray-500">{section}</span>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Question {questionNumber} of {totalQuestions}
                                </h2>
                            </div>
                            {/* Marks - Editable */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">+</span>
                                    <input
                                        type="number"
                                        value={positiveMarks}
                                        onChange={(e) => setPositiveMarks(Number(e.target.value))}
                                        className="w-12 px-2 py-1 text-sm border border-green-300 rounded bg-green-50 text-green-700 text-center"
                                        min={0}
                                        step={0.5}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">−</span>
                                    <input
                                        type="number"
                                        value={negativeMarks}
                                        onChange={(e) => setNegativeMarks(Number(e.target.value))}
                                        className="w-12 px-2 py-1 text-sm border border-red-300 rounded bg-red-50 text-red-700 text-center"
                                        min={0}
                                        step={0.25}
                                    />
                                </div>
                                <select
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                                >
                                    <option value="MCQ">MCQ</option>
                                    <option value="TITA">TITA</option>
                                </select>
                            </div>
                        </div>

                        {/* Image Upload Zone */}
                        <div className="mb-6">
                            <ImageUploadZone
                                imageUrl={imageUrl}
                                onUpload={handleImageUpload}
                                onRemove={() => setImageUrl(null)}
                                isUploading={isUploading}
                                label="Question Diagram/Image"
                            />
                        </div>

                        {/* Question Text */}
                        <div className="mb-6">
                            <textarea
                                ref={questionTextareaRef}
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Enter question text..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-800"
                            />
                        </div>

                        {/* Options - MCQ or TITA */}
                        {questionType === 'MCQ' ? (
                            <div className="space-y-3">
                                {OPTION_LABELS.map((label, index) => (
                                    <EditableOption
                                        key={label}
                                        label={label}
                                        value={options[index] || ''}
                                        isCorrect={correctAnswer === label}
                                        onChange={(value) => handleOptionChange(index, value)}
                                        onMarkCorrect={() => setCorrectAnswer(label)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Correct Answer (Numeric)
                                </label>
                                <input
                                    type="text"
                                    value={correctAnswer}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    placeholder="Enter the correct numeric answer..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}

                        {/* Solution */}
                        <details className="mt-6">
                            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                                Solution (Optional)
                            </summary>
                            <textarea
                                value={solutionText}
                                onChange={(e) => setSolutionText(e.target.value)}
                                placeholder="Enter solution explanation..."
                                rows={3}
                                className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </details>

                        {/* Save Button */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`
                                    px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                                    ${isSaving
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }
                                `}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Question
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================================================
    // STANDARD VIEW: Centered card for QA (no context)
    // ==========================================================================

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Question Header - Mirrors exam exactly */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <span className="text-sm text-gray-500">{section}</span>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Question {questionNumber} of {totalQuestions}
                    </h2>
                </div>

                {/* Marks - Editable */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">+</span>
                        <input
                            type="number"
                            value={positiveMarks}
                            onChange={(e) => setPositiveMarks(Number(e.target.value))}
                            className="w-12 px-2 py-1 text-sm border border-green-300 rounded bg-green-50 text-green-700 text-center"
                            min={0}
                            step={0.5}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">−</span>
                        <input
                            type="number"
                            value={negativeMarks}
                            onChange={(e) => setNegativeMarks(Number(e.target.value))}
                            className="w-12 px-2 py-1 text-sm border border-red-300 rounded bg-red-50 text-red-700 text-center"
                            min={0}
                            step={0.25}
                        />
                    </div>
                    {/* Question Type Toggle */}
                    <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    >
                        <option value="MCQ">MCQ</option>
                        <option value="TITA">TITA</option>
                    </select>
                </div>
            </div>

            {/* Image Upload Zone (Where diagram would appear) */}
            <div className="mb-6">
                <ImageUploadZone
                    imageUrl={imageUrl}
                    onUpload={handleImageUpload}
                    onRemove={() => setImageUrl(null)}
                    isUploading={isUploading}
                    label="Question Diagram/Image"
                />
            </div>

            {/* Question Text - Editable (Mirror Exam Typography) */}
            <div className="mb-6">
                <div className="prose prose-lg max-w-none">
                    <textarea
                        ref={questionTextareaRef}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Enter question text..."
                        rows={1}
                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg outline-none resize-none overflow-hidden text-gray-800 whitespace-pre-wrap transition-colors"
                    />
                </div>
            </div>

            {/* Options - MCQ or TITA */}
            {questionType === 'MCQ' ? (
                <div className="space-y-3">
                    {OPTION_LABELS.map((label, index) => (
                        <EditableOption
                            key={label}
                            label={label}
                            value={options[index] || ''}
                            isCorrect={correctAnswer === label}
                            onChange={(value) => handleOptionChange(index, value)}
                            onMarkCorrect={() => setCorrectAnswer(label)}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer (Numeric)
                    </label>
                    <input
                        type="text"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Enter the correct numeric answer..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            )}

            {/* Solution (Collapsible) */}
            <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Solution (Optional)
                </summary>
                <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Enter solution explanation..."
                    rows={3}
                    className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
            </details>

            {/* Save Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`
                        px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                        ${isSaving
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                    `}
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Question
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// EDITABLE QUESTION PALETTE (Mirrors QuestionPalette)
// =============================================================================

interface EditablePaletteProps {
    questions: QuestionWithAnswer[];
    section: SectionName;
    currentIndex: number;
    onSelect: (index: number) => void;
    onAddNew: () => void;
}

function EditablePalette({ questions, section, currentIndex, onSelect, onAddNew }: EditablePaletteProps) {
    const sectionQuestions = questions.filter(q => q.section === section);

    // Expected count per section
    const expectedCount = section === 'VARC' ? 24 : section === 'DILR' ? 20 : 22;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{section} Questions</h3>
                <span className="text-sm text-gray-500">{sectionQuestions.length}/{expectedCount}</span>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: expectedCount }, (_, i) => {
                    const q = sectionQuestions[i];
                    const hasContent = q && q.question_text?.trim();

                    return (
                        <button
                            key={i}
                            onClick={() => onSelect(i)}
                            className={`
                                w-10 h-10 rounded-lg text-sm font-medium transition-colors
                                ${currentIndex === i
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                    : hasContent
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }
                            `}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Add New Button */}
            <button
                onClick={onAddNew}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
            </button>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-100 border border-green-300" />
                    <span>Has content</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
                    <span>Empty</span>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN EDITABLE EXAM LAYOUT
// =============================================================================

export function EditableExamLayout({
    paper,
    questions,
    contexts,
    onSaveQuestion,
    onSaveContext,
}: EditableExamLayoutProps) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const currentSection = SECTIONS[currentSectionIndex];

    // Get questions for current section
    const sectionQuestions = useMemo(() =>
        questions.filter(q => q.section === currentSection),
        [questions, currentSection]
    );

    const currentQuestion = sectionQuestions[currentQuestionIndex] ?? null;
    const totalExpected = currentSection === 'VARC' ? 24 : currentSection === 'DILR' ? 20 : 22;

    // Handle save with loading state
    const handleSave = useCallback(async (questionData: Partial<QuestionWithAnswer>) => {
        setIsSaving(true);
        try {
            await onSaveQuestion(questionData);
        } finally {
            setIsSaving(false);
        }
    }, [onSaveQuestion]);

    // Handle context save
    const handleSaveContext = useCallback(async (contextData: Partial<QuestionContext>) => {
        if (onSaveContext) {
            await onSaveContext(contextData);
        }
    }, [onSaveContext]);

    // Handle section change - reset question index
    const handleSectionChange = useCallback((index: number) => {
        setCurrentSectionIndex(index);
        setCurrentQuestionIndex(0);
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
            {/* Header */}
            <EditableHeader
                paper={paper}
                currentSectionIndex={currentSectionIndex}
                onSectionChange={handleSectionChange}
            />

            {/* Main Content - Mirrors Exam Layout exactly */}
            <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6">
                <div className="flex gap-6">
                    {/* Question Area */}
                    <div className="flex-1">
                        <EditableQuestionArea
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={totalExpected}
                            section={currentSection}
                            paperId={paper.id}
                            contexts={contexts}
                            onSave={handleSave}
                            onSaveContext={handleSaveContext}
                            isSaving={isSaving}
                        />
                    </div>

                    {/* Sidebar - Question Palette */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-6 space-y-4">
                            {/* Progress Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Progress</h3>
                                <div className="space-y-2">
                                    {SECTIONS.map((sec, idx) => {
                                        const count = questions.filter(q => q.section === sec && q.question_text?.trim()).length;
                                        const total = sec === 'VARC' ? 24 : sec === 'DILR' ? 20 : 22;
                                        const percent = Math.round((count / total) * 100);
                                        return (
                                            <div key={sec}>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>{sec}</span>
                                                    <span>{count}/{total}</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Question Palette */}
                            <EditablePalette
                                questions={questions}
                                section={currentSection}
                                currentIndex={currentQuestionIndex}
                                onSelect={setCurrentQuestionIndex}
                                onAddNew={() => setCurrentQuestionIndex(sectionQuestions.length)}
                            />
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default EditableExamLayout;
