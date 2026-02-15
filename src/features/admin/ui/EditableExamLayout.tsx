/**
 * @fileoverview Editable Exam Layout (Mirror Principle)
 * @description Exact replica of ExamLayout but with editable fields
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

'use client';

import { useState, useCallback, useMemo, useEffect, useRef, useId, type ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
    Paper,
    QuestionWithAnswer,
    SectionName,
    QuestionContext,
    QuestionType,
    QuestionSet,
    ContentLayoutType,
} from '@/types/exam';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { PaletteShell } from '@/features/shared/ui/PaletteShell';
import { MarkdownToolbar } from './MarkdownToolbar';
import { getTopicOptions, getSubtopicOptions } from '../config/topicOptions';
import { MathText } from '@/features/exam-engine/ui/MathText';

// =============================================================================
// TYPES
// =============================================================================

interface EditableExamLayoutProps {
    paper: Paper;
    questions: QuestionWithAnswer[];
    questionSets: QuestionSet[];
    contexts: QuestionContext[];
    onSaveQuestion: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    onSaveQuestionSet: (set: Partial<QuestionSet>) => Promise<void>;
    onCreateQuestionSet: (set: Partial<QuestionSet>) => Promise<QuestionSet | null>;
    onSaveContext?: (context: Partial<QuestionContext>) => Promise<void>;
    onDeleteContext?: (contextId: string) => Promise<void>;
    onUpdatePaperTitle?: (title: string) => Promise<{ success: boolean; error?: string }>;
    onBulkRenameTaxonomy?: (input: {
        section: SectionName;
        fromTopic?: string | null;
        toTopic?: string | null;
        fromSubtopic?: string | null;
        toSubtopic?: string | null;
    }) => Promise<void>;
    initialNavigation?: EditorNavigationState | null;
    onNavigate?: (navigation: EditorNavigationUpdate) => void;
}

export interface EditorNavigationState {
    section?: SectionName;
    qid?: string | null;
    setId?: string | null;
    q?: number | null;
}

export interface EditorNavigationUpdate {
    section: SectionName;
    qid?: string | null;
    setId?: string | null;
    q: number;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];
const SECTION_TOTALS: Record<SectionName, number> = { VARC: 24, DILR: 20, QA: 22 };
const SECTION_NUMBER_OFFSETS: Record<SectionName, number> = {
    VARC: 0,
    DILR: SECTION_TOTALS.VARC,
    QA: SECTION_TOTALS.VARC + SECTION_TOTALS.DILR,
};

function handlePlainTextPaste(
    event: ClipboardEvent<HTMLTextAreaElement>,
    setValue: (next: string) => void
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

    setValue(nextValue);

    const nextCursor = start + pastedText.length;
    requestAnimationFrame(() => {
        target.focus();
        target.setSelectionRange(nextCursor, nextCursor);
    });
}

function getDisplayQuestionNumber(
    section: SectionName,
    rawQuestionNumber: number | null | undefined,
    sectionIndexFallback: number
): number {
    const sectionBase = SECTION_NUMBER_OFFSETS[section];
    const fallback = sectionBase + sectionIndexFallback + 1;
    const parsed = Number(rawQuestionNumber);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    const normalized = Math.floor(parsed);

    // Backward compatibility: legacy rows may store section-local numbering (1..section total).
    if (section !== 'VARC' && normalized <= SECTION_TOTALS[section]) {
        return sectionBase + normalized;
    }

    return normalized;
}

// =============================================================================
// EDITABLE HEADER (Mirrors ExamHeader)
// =============================================================================

interface EditableHeaderProps {
    paper: Paper;
    currentSectionIndex: number;
    onSectionChange: (index: number) => void;
    onUpdatePaperTitle?: (title: string) => Promise<{ success: boolean; error?: string }>;
    isExpanded: boolean;
    onToggleExpanded: () => void;
}

function EditableHeader({
    paper,
    currentSectionIndex,
    onSectionChange,
    onUpdatePaperTitle,
    isExpanded,
    onToggleExpanded,
}: EditableHeaderProps) {
    const router = useRouter();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(paper.title);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const editButtonRef = useRef<HTMLButtonElement | null>(null);
    const titleInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isEditingTitle) {
            setTitleDraft(paper.title);
            setTitleError(null);
            requestAnimationFrame(() => titleInputRef.current?.focus());
        }
    }, [isEditingTitle, paper.title]);

    const exitEditMode = useCallback(() => {
        setIsEditingTitle(false);
        setTitleError(null);
        requestAnimationFrame(() => editButtonRef.current?.focus());
    }, []);

    const handleSaveTitle = useCallback(async () => {
        if (isSavingTitle) return;

        const trimmed = titleDraft.trim();
        if (!trimmed) {
            setTitleError('Title cannot be empty.');
            return;
        }

        if (!onUpdatePaperTitle) {
            exitEditMode();
            return;
        }

        setIsSavingTitle(true);
        setTitleError(null);

        try {
            const result = await onUpdatePaperTitle(trimmed);
            if (!result.success) {
                setTitleError(result.error || 'Failed to update title.');
                return;
            }
            exitEditMode();
        } finally {
            setIsSavingTitle(false);
        }
    }, [exitEditMode, isSavingTitle, onUpdatePaperTitle, titleDraft]);

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-exam-header-from to-exam-header-to text-white shadow-md">
            <div className={isExpanded ? 'px-4 py-3' : 'max-w-screen-2xl mx-auto px-4 py-3'}>
                <div className="flex items-center justify-between">
                    {/* Left - Back Button + Paper Info */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin/papers')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Back to Papers"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-yellow-500/80 text-gray-900 text-[10px] font-bold rounded tracking-wider">
                                ✏️ EDIT
                            </span>

                            {!isEditingTitle ? (
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold">{paper.title}</h1>
                                    <button
                                        ref={editButtonRef}
                                        type="button"
                                        onClick={() => setIsEditingTitle(true)}
                                        className="px-2 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                                        aria-label="Edit mock test name"
                                    >
                                        Edit name
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <label className="sr-only" htmlFor="paper-title-input">
                                            Mock test name
                                        </label>
                                        <input
                                            ref={titleInputRef}
                                            id="paper-title-input"
                                            type="text"
                                            value={titleDraft}
                                            onChange={(e) => setTitleDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSaveTitle();
                                                }
                                                if (e.key === 'Escape') {
                                                    e.preventDefault();
                                                    if (!isSavingTitle) exitEditMode();
                                                }
                                            }}
                                            className="w-64 sm:w-80 px-2 py-1 rounded-md text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                                            aria-invalid={titleError ? 'true' : 'false'}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSaveTitle}
                                            disabled={isSavingTitle}
                                            className="px-3 py-1 text-xs font-semibold bg-white text-exam-header-from rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSavingTitle ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={exitEditMode}
                                            disabled={isSavingTitle}
                                            className="px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {titleError && (
                                        <span className="text-xs text-yellow-200" role="alert">
                                            {titleError}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-sm text-blue-100">
                            <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                {paper.total_questions} Questions
                            </span>
                        </div>
                    </div>

                    {/* Center - Section Tabs */}
                    <div className="hidden md:flex items-center gap-2">
                        {SECTIONS.map((section, index) => {
                            const base =
                                'px-4 py-2 rounded-md text-sm font-semibold transition-colors border cursor-pointer';
                            const inactive = `${base} bg-white/10 text-blue-100 border-white/20 hover:bg-white/20`;

                            const active = (() => {
                                switch (section) {
                                    case 'VARC':
                                        return `${base} bg-section-varc text-white border-section-varc`;
                                    case 'DILR':
                                        return `${base} bg-section-dilr text-white border-section-dilr`;
                                    case 'QA':
                                        return `${base} bg-section-qa text-white border-section-qa`;
                                    default:
                                        return `${base} bg-white text-exam-header-from border-white`;
                                }
                            })();

                            return (
                                <button
                                    key={section}
                                    onClick={() => onSectionChange(index)}
                                    className={index === currentSectionIndex ? active : inactive}
                                >
                                    {section}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right - Quick Links + Exit Button */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onToggleExpanded}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md transition-colors"
                        >
                            {isExpanded ? 'Exit Fullscreen' : 'Expand Editor'}
                        </button>
                        <Link
                            href={`/admin/papers/${paper.id}/questions`}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md transition-colors"
                        >
                            Questions
                        </Link>
                        <Link
                            href={`/admin/papers/${paper.id}/settings`}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md transition-colors"
                        >
                            Settings
                        </Link>
                        <Link
                            href="/admin/papers"
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md text-sm transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span className="hidden sm:inline">Exit Editor</span>
                        </Link>
                    </div>
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
                ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}
            `}
        >
            <button
                type="button"
                onClick={onMarkCorrect}
                title={isCorrect ? 'Correct answer' : 'Click to mark as correct'}
                className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-bold transition-colors cursor-pointer
                    ${isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'}
                `}
            >
                {label}
            </button>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter option ${label}...`}
                rows={2}
                className="flex-1 text-left bg-transparent border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1.5 outline-none text-gray-800 transition-colors resize-y min-h-[40px]"
            />

            {isCorrect && <span className="flex-shrink-0 text-green-500 text-sm font-medium">✓ Correct</span>}
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
    const inputId = useId();

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                await onUpload(file);
            }
        },
        [onUpload]
    );

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                await onUpload(file);
            }
        },
        [onUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

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
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id={inputId} />
            <label htmlFor={inputId} className="cursor-pointer">
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
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

interface EditableSetPaneProps {
    questionSet: QuestionSet | null;
    questionSets: QuestionSet[];
    section: SectionName;
    paperId: string;
    onSave: (set: Partial<QuestionSet>) => Promise<void>;
    onCreateSet: (setType: QuestionSet['set_type']) => Promise<QuestionSet | null>;
    onSelectSet: (setId: string | null) => void;
    selectedSetId: string | null;
}

function EditableSetPane({
    questionSet,
    questionSets,
    section,
    paperId,
    onSave,
    onCreateSet,
    onSelectSet,
    selectedSetId,
}: EditableSetPaneProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(questionSet?.context_title ?? '');
    const [content, setContent] = useState(questionSet?.context_body ?? '');
    const [layout, setLayout] = useState<ContentLayoutType>(
        questionSet?.content_layout ?? (section === 'QA' ? 'single_focus' : 'split_passage')
    );
    const [imageUrl, setImageUrl] = useState<string | null>(questionSet?.context_image_url ?? null);
    const [imagePosition, setImagePosition] = useState<string>(
        questionSet?.metadata?.image_position ?? 'before'
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Count paragraphs in content for image position options
    const paragraphCount = useMemo(() => {
        if (!content) return 0;
        return content.split(/\n\n+/).filter(p => p.trim()).length;
    }, [content]);

    useEffect(() => {
        setTitle(questionSet?.context_title ?? '');
        setContent(questionSet?.context_body ?? '');
        setLayout(questionSet?.content_layout ?? (section === 'QA' ? 'single_focus' : 'split_passage'));
        setImageUrl(questionSet?.context_image_url ?? null);
        setImagePosition(questionSet?.metadata?.image_position ?? 'before');
        setIsEditing(false);
    }, [questionSet?.id, section]);

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

    const sectionSets = questionSets.filter((s) => s.section === section);
    const createLabel =
        section === 'VARC' ? 'New VARC set (RC passage)' : section === 'DILR' ? 'New DILR set' : 'New ATOMIC set';

    const handleSave = async () => {
        if (!questionSet?.id) return;
        setIsSaving(true);
        try {
            await onSave({
                id: questionSet.id,
                paper_id: paperId,
                section,
                set_type: questionSet.set_type,
                content_layout: layout,
                context_title: title || undefined,
                context_body: content || undefined,
                context_image_url: imageUrl ?? undefined,
                context_additional_images: questionSet.context_additional_images ?? [],
                context_type: questionSet.context_type ?? undefined,
                metadata: {
                    ...questionSet.metadata,
                    image_position: imagePosition as 'before' | 'after' | `after_para_${number}`,
                },
                is_active: true,
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 border-r border-gray-200 h-[calc(100vh-220px)] flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Set Stimulus
                    </h3>
                    <div className="flex items-center gap-2">
                        {!isEditing && questionSet && (
                            <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:text-blue-800">
                                Edit
                            </button>
                        )}
                        {section !== 'QA' && (
                            <button
                                onClick={() => onCreateSet(section === 'VARC' ? 'VARC' : 'DILR')}
                                className="text-xs text-emerald-600 hover:text-emerald-800"
                            >
                                {createLabel}
                            </button>
                        )}
                    </div>
                </div>

                <select
                    value={selectedSetId ?? ''}
                    onChange={(e) => onSelectSet(e.target.value || null)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                >
                    <option value="">— Select Set —</option>
                    {sectionSets.map((set) => (
                        <option key={set.id} value={set.id}>
                            {set.context_title || `Set ${set.display_order}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {questionSet ? (
                    isEditing ? (
                        <div className="space-y-3">
                            <select
                                value={layout}
                                onChange={(e) => setLayout(e.target.value as ContentLayoutType)}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                            >
                                <option value="split_passage">Split Passage</option>
                                <option value="split_chart">Split Chart</option>
                                <option value="split_table">Split Table</option>
                                <option value="single_focus">Single Focus</option>
                                <option value="image_top">Image Top</option>
                            </select>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Set title (e.g., Passage 1)"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />

                            <MarkdownToolbar
                                textareaRef={contentTextareaRef}
                                value={content}
                                onChange={setContent}
                            />
                            <textarea
                                ref={contentTextareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Set stimulus / passage"
                                rows={12}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono leading-relaxed"
                            />

                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-600">Context Image (optional)</label>
                                <ImageUploadZone
                                    onUpload={handleImageUpload}
                                    imageUrl={imageUrl}
                                    onRemove={() => setImageUrl(null)}
                                    label="Drop image or click to upload"
                                    isUploading={isUploading}
                                />
                            </div>

                            {/* Image Position Selector - only show when image is uploaded */}
                            {imageUrl && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-600">
                                        Image Placement Position
                                    </label>
                                    <select
                                        value={imagePosition}
                                        onChange={(e) => setImagePosition(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                                    >
                                        <option value="before">Before text (top)</option>
                                        <option value="after">After text (bottom)</option>
                                        {paragraphCount > 0 && Array.from({ length: paragraphCount }, (_, i) => (
                                            <option key={`para-${i + 1}`} value={`after_para_${i + 1}`}>
                                                After paragraph {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400">
                                        Choose where the image appears relative to the passage text. Paragraphs are detected by double line breaks.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Set'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questionSet.context_image_url && (
                                <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                                    <img
                                        src={questionSet.context_image_url}
                                        alt={questionSet.context_title || 'Set image'}
                                        className="w-full object-contain max-h-80"
                                    />
                                </div>
                            )}
                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {questionSet.context_body || 'No set stimulus.'}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-sm">No set selected</p>
                        <p className="text-xs mt-1">Choose a set to edit stimulus</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface EditableContextPaneProps {
    context: QuestionContext | null;
    contexts: QuestionContext[];
    section: SectionName;
    paperId: string;
    onSave: (context: Partial<QuestionContext>) => Promise<void>;
    onDeleteContext?: (contextId: string) => Promise<void>;
    onSelectContext: (contextId: string | null) => void;
    selectedContextId: string | null;
}

function EditableContextPane({
    context,
    contexts,
    section,
    paperId,
    onSave,
    onDeleteContext,
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
    const [isDeleting, setIsDeleting] = useState(false);
    const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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

    const sectionContexts = contexts.filter((c) => c.section === section);

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
        <div className="bg-gray-50 border-r border-gray-200 h-[calc(100vh-220px)] flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        {section === 'VARC' ? 'Reading Passage' : 'Data Set / Context'}
                    </h3>

                    <div className="flex items-center gap-2">
                        {!isEditing && context && (
                            <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:text-blue-800">
                                Edit
                            </button>
                        )}
                        {!isEditing && context && onDeleteContext && (
                            <button
                                onClick={async () => {
                                    if (!context?.id || isDeleting) return;
                                    const confirmed = window.confirm(
                                        'Delete this context? This will hide it from selection.'
                                    );
                                    if (!confirmed) return;
                                    setIsDeleting(true);
                                    try {
                                        await onDeleteContext(context.id);
                                        onSelectContext(null);
                                        setIsEditing(false);
                                    } finally {
                                        setIsDeleting(false);
                                    }
                                }}
                                disabled={isDeleting}
                                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                    </div>
                </div>

                <select
                    value={selectedContextId ?? 'none'}
                    onChange={(e) => onSelectContext(e.target.value === 'none' ? null : e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                >
                    <option value="none">— No Context —</option>
                    <option value="new">+ Create New Context</option>
                    {sectionContexts.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.title || `Context ${c.display_order}`}
                        </option>
                    ))}
                </select>
            </div>

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

                        <MarkdownToolbar
                            textareaRef={contentTextareaRef}
                            value={content}
                            onChange={setContent}
                        />
                        <textarea
                            ref={contentTextareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                                section === 'VARC'
                                    ? 'Paste the reading passage here...'
                                    : 'Enter the data set, table description, or context...'
                            }
                            rows={12}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono leading-relaxed"
                        />

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
                                    if (selectedContextId === 'new') onSelectContext(null);
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
                        {context.image_url && (
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                                <img
                                    src={context.image_url}
                                    alt={context.title || 'Context image'}
                                    className="w-full object-contain max-h-80"
                                />
                            </div>
                        )}
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{context.content}</div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
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
    displayQuestionNumber: number;
    totalQuestions: number;
    section: SectionName;
    paperId: string;
    onSave: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    selectedSetId: string | null;
    selectedContextId: string | null;
    isSaving: boolean;
    onSolutionPreviewChange?: (preview: { textbook: string; toppers: string }) => void;
}

function EditableQuestionArea({
    question,
    questionNumber,
    displayQuestionNumber,
    totalQuestions,
    section,
    paperId,
    onSave,
    selectedSetId,
    selectedContextId,
    isSaving,
    onSolutionPreviewChange,
}: EditableQuestionAreaProps) {
    const [questionText, setQuestionText] = useState(question?.question_text ?? '');
    const [questionType, setQuestionType] = useState<QuestionType>(question?.question_type ?? 'MCQ');
    const [options, setOptions] = useState<string[]>(() =>
        Array.isArray(question?.options) ? [...question.options] : ['', '', '', '']
    );
    const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer ?? 'A');
    const [positiveMarks, setPositiveMarks] = useState(question?.positive_marks ?? 3);
    const [negativeMarks, setNegativeMarks] = useState(question?.negative_marks ?? 1);
    const [solutionText, setSolutionText] = useState(question?.solution_text ?? '');
    const [toppersApproach, setToppersApproach] = useState(question?.toppers_approach ?? '');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const questionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const solutionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const toppersTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const topicListId = useId();
    const subtopicListId = useId();
    const [isTextbookExpanded, setIsTextbookExpanded] = useState(false);
    const [isToppersExpanded, setIsToppersExpanded] = useState(false);
    const [topic, setTopic] = useState(question?.topic ?? '');
    const [subtopic, setSubtopic] = useState(question?.subtopic ?? '');

    const topicOptions = useMemo(() => getTopicOptions(section, topic), [section, topic]);
    const subtopicOptions = useMemo(() => getSubtopicOptions(section, topic, subtopic), [section, topic, subtopic]);

    useEffect(() => {
        if (!question) {
            setQuestionText('');
            setQuestionType('MCQ');
            setOptions(['', '', '', '']);
            setCorrectAnswer('A');
            setPositiveMarks(3);
            setNegativeMarks(1);
            setSolutionText('');
            setToppersApproach('');
            setImageUrl(null);
            setTopic('');
            setSubtopic('');
            setIsTextbookExpanded(false);
            setIsToppersExpanded(false);
            return;
        }

        setQuestionText(question.question_text ?? '');
        setQuestionType(question.question_type ?? 'MCQ');
        setOptions(Array.isArray(question.options) ? [...question.options] : ['', '', '', '']);
        setCorrectAnswer(question.correct_answer ?? 'A');
        setPositiveMarks(question.positive_marks ?? 3);
        setNegativeMarks(question.negative_marks ?? 1);
        setImageUrl(question.question_image_url ?? null);
        setSolutionText(question.solution_text ?? '');
        setToppersApproach(question.toppers_approach ?? '');
        setTopic(question.topic ?? '');
        setSubtopic(question.subtopic ?? '');
        setIsTextbookExpanded(false);
        setIsToppersExpanded(false);
    }, [question?.id]);

    useEffect(() => {
        const textarea = questionTextareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [questionText]);

    useEffect(() => {
        onSolutionPreviewChange?.({
            textbook: solutionText,
            toppers: toppersApproach,
        });
    }, [onSolutionPreviewChange, solutionText, toppersApproach]);

    const handleOptionChange = useCallback((index: number, value: string) => {
        setOptions((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    }, []);

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

    const handleSave = useCallback(async () => {
        const useSet = Boolean(selectedSetId);
        const questionData: Partial<QuestionWithAnswer> = {
            ...question,
            id: question?.id,
            paper_id: paperId,
            section,
            question_number: displayQuestionNumber,
            question_text: questionText,
            question_type: questionType,
            options: questionType === 'MCQ' ? options : null,
            correct_answer: correctAnswer,
            positive_marks: positiveMarks,
            negative_marks: questionType === 'TITA' ? 0 : negativeMarks,
            solution_text: solutionText || undefined,
            toppers_approach: toppersApproach || undefined,
            question_image_url: imageUrl || undefined,
            topic: topic || undefined,
            subtopic: subtopic || undefined,
            set_id: useSet ? selectedSetId ?? undefined : undefined,
            context_id: useSet ? undefined : selectedContextId && selectedContextId !== 'new' ? selectedContextId : undefined,
            is_active: true,
        };

        await onSave(questionData);
    }, [
        question,
        paperId,
        section,
        displayQuestionNumber,
        questionText,
        questionType,
        options,
        correctAnswer,
        positiveMarks,
        negativeMarks,
        solutionText,
        toppersApproach,
        imageUrl,
        topic,
        subtopic,
        selectedSetId,
        selectedContextId,
        onSave,
    ]);

    return (
        <div className="bg-white h-full overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <span className="text-sm text-gray-500">{section}</span>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Question {displayQuestionNumber} of {SECTION_TOTALS.VARC + SECTION_TOTALS.DILR + SECTION_TOTALS.QA}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Section position: {questionNumber} of {totalQuestions}</p>
                    </div>

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

                <div className="mb-6">
                    <ImageUploadZone
                        imageUrl={imageUrl}
                        onUpload={handleImageUpload}
                        onRemove={() => setImageUrl(null)}
                        isUploading={isUploading}
                        label="Question Diagram/Image"
                    />
                </div>

                <div className="mb-6">
                    <MarkdownToolbar
                        textareaRef={questionTextareaRef}
                        value={questionText}
                        onChange={setQuestionText}
                        className="mb-2"
                    />
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer (Numeric)</label>
                        <input
                            type="text"
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            placeholder="Enter the correct numeric answer..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                )}

                <details className="mt-6" open={Boolean(solutionText)}>
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                        Textbook Solution (Optional)
                    </summary>
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsTextbookExpanded((prev) => !prev)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                            {isTextbookExpanded ? 'Collapse editor' : 'Expand editor'}
                        </button>
                    </div>
                    <MarkdownToolbar
                        textareaRef={solutionTextareaRef}
                        value={solutionText}
                        onChange={setSolutionText}
                        className="mt-3"
                    />
                    <textarea
                        ref={solutionTextareaRef}
                        value={solutionText}
                        onChange={(e) => setSolutionText(e.target.value)}
                        onPaste={(event) => handlePlainTextPaste(event, setSolutionText)}
                        placeholder="Enter textbook solution..."
                        rows={isTextbookExpanded ? 16 : 4}
                        className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    />
                </details>

                <details className="mt-4" open={Boolean(toppersApproach)}>
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                        Toppers Approach (Optional)
                    </summary>
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsToppersExpanded((prev) => !prev)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                            {isToppersExpanded ? 'Collapse editor' : 'Expand editor'}
                        </button>
                    </div>
                    <MarkdownToolbar
                        textareaRef={toppersTextareaRef}
                        value={toppersApproach}
                        onChange={setToppersApproach}
                        className="mt-3"
                    />
                    <textarea
                        ref={toppersTextareaRef}
                        value={toppersApproach}
                        onChange={(e) => setToppersApproach(e.target.value)}
                        onPaste={(event) => handlePlainTextPaste(event, setToppersApproach)}
                        placeholder="Enter topper's solving strategy..."
                        rows={isToppersExpanded ? 16 : 4}
                        className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    />
                </details>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Topic
                        </label>
                        <input
                            type="text"
                            list={topicListId}
                            value={topic}
                            onChange={(e) => {
                                const nextTopic = e.target.value;
                                setTopic(nextTopic);
                                if (!getSubtopicOptions(section, nextTopic).includes(subtopic)) {
                                    setSubtopic('');
                                }
                            }}
                            placeholder="Select or type a topic"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                        <datalist id={topicListId}>
                            {topicOptions.map((option) => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                        <p className="mt-1 text-xs text-gray-500">Choose an existing topic or type a new one.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subtopic
                        </label>
                        <input
                            type="text"
                            list={subtopicListId}
                            value={subtopic}
                            onChange={(e) => setSubtopic(e.target.value)}
                            placeholder="Select or type a subtopic"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                        <datalist id={subtopicListId}>
                            {subtopicOptions.map((option) => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                        <p className="mt-1 text-xs text-gray-500">Use this to add or fix subtopic spellings.</p>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`
                        px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                        ${isSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
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
    const sectionQuestions = questions.filter((q) => q.section === section);
    const expectedCount = SECTION_TOTALS[section];

    return (
        <PaletteShell>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{section} Questions</h3>
                <span className="text-sm text-gray-500">
                    {sectionQuestions.length}/{expectedCount}
                </span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: expectedCount }, (_, i) => {
                    const q = sectionQuestions[i];
                    const hasContent = q && q.question_text?.trim();
                    const label = q
                        ? getDisplayQuestionNumber(section, q.question_number, i)
                        : SECTION_NUMBER_OFFSETS[section] + i + 1;

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
                            {label}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={onAddNew}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
            </button>

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
        </PaletteShell>
    );
}

// =============================================================================
// MAIN EDITABLE EXAM LAYOUT
// =============================================================================

export function EditableExamLayout({
    paper,
    questions,
    questionSets,
    contexts,
    onSaveQuestion,
    onSaveQuestionSet,
    onCreateQuestionSet,
    onSaveContext,
    onDeleteContext,
    onUpdatePaperTitle,
    onBulkRenameTaxonomy,
    initialNavigation,
    onNavigate,
}: EditableExamLayoutProps) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
    const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
    const [renameFromTopic, setRenameFromTopic] = useState('');
    const [renameToTopic, setRenameToTopic] = useState('');
    const [renameFromSubtopic, setRenameFromSubtopic] = useState('');
    const [renameToSubtopic, setRenameToSubtopic] = useState('');
    const [isRenamingTaxonomy, setIsRenamingTaxonomy] = useState(false);
    const [taxonomyStatus, setTaxonomyStatus] = useState<string | null>(null);
    const [taxonomyError, setTaxonomyError] = useState<string | null>(null);
    const [sidebarTextbookPreview, setSidebarTextbookPreview] = useState('');
    const [sidebarToppersPreview, setSidebarToppersPreview] = useState('');
    const renameTopicListId = useId();
    const renameSubtopicListId = useId();
    const appliedNavKeyRef = useRef<string | null>(null);

    const currentSection = SECTIONS[currentSectionIndex];

    const sectionQuestions = useMemo(
        () => questions.filter((q) => q.section === currentSection),
        [questions, currentSection]
    );
    const sectionTopics = useMemo(
        () =>
            Array.from(
                new Set(
                    sectionQuestions
                        .map((q) => (q.topic ?? '').trim())
                        .filter((value) => value.length > 0)
                )
            ).sort((a, b) => a.localeCompare(b)),
        [sectionQuestions]
    );
    const sectionSubtopics = useMemo(
        () =>
            Array.from(
                new Set(
                    sectionQuestions
                        .map((q) => (q.subtopic ?? '').trim())
                        .filter((value) => value.length > 0)
                )
            ).sort((a, b) => a.localeCompare(b)),
        [sectionQuestions]
    );
    const sectionSubtopicsForFromTopic = useMemo(() => {
        if (!renameFromTopic.trim()) {
            return sectionSubtopics;
        }
        return Array.from(
            new Set(
                sectionQuestions
                    .filter((q) => (q.topic ?? '').trim() === renameFromTopic.trim())
                    .map((q) => (q.subtopic ?? '').trim())
                    .filter((value) => value.length > 0)
            )
        ).sort((a, b) => a.localeCompare(b));
    }, [renameFromTopic, sectionQuestions, sectionSubtopics]);

    const currentQuestion = sectionQuestions[currentQuestionIndex] ?? null;
    const totalExpected = SECTION_TOTALS[currentSection];
    const currentDisplayQuestionNumber = SECTION_NUMBER_OFFSETS[currentSection] + currentQuestionIndex + 1;

    const currentSet = selectedSetId ? questionSets.find((set) => set.id === selectedSetId) ?? null : null;
    const useSetStimulus = Boolean(currentSet);

    const showContextColumn = useSetStimulus
        ? currentSet?.set_type !== 'ATOMIC'
        : currentSection === 'VARC' || currentSection === 'DILR';

    const questionColSpan = showContextColumn ? '' : 'lg:col-span-2';

    const currentContext =
        selectedContextId && selectedContextId !== 'new'
            ? contexts.find((c) => c.id === selectedContextId) ?? null
            : null;

    useEffect(() => {
        if (currentQuestion?.set_id) setSelectedSetId(currentQuestion.set_id);
        setSelectedContextId(currentQuestion?.context_id ?? null);
    }, [currentQuestion?.id, currentQuestion?.set_id, currentQuestion?.context_id]);

    useEffect(() => {
        setSidebarTextbookPreview(currentQuestion?.solution_text ?? '');
        setSidebarToppersPreview(currentQuestion?.toppers_approach ?? '');
    }, [currentQuestion?.id, currentQuestion?.solution_text, currentQuestion?.toppers_approach]);

    useEffect(() => {
        setRenameFromTopic('');
        setRenameToTopic('');
        setRenameFromSubtopic('');
        setRenameToSubtopic('');
        setTaxonomyStatus(null);
        setTaxonomyError(null);
    }, [currentSection]);

    useEffect(() => {
        if (!renameFromTopic) return;
        if (!sectionTopics.includes(renameFromTopic)) {
            setRenameFromTopic('');
        }
    }, [renameFromTopic, sectionTopics]);

    useEffect(() => {
        if (!renameFromSubtopic) return;
        if (!sectionSubtopicsForFromTopic.includes(renameFromSubtopic)) {
            setRenameFromSubtopic('');
        }
    }, [renameFromSubtopic, sectionSubtopicsForFromTopic]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isExpanded]);

    useEffect(() => {
        if (!initialNavigation) return;

        const navKey = `${initialNavigation.section ?? ''}|${initialNavigation.qid ?? ''}|${initialNavigation.setId ?? ''}|${initialNavigation.q ?? ''}`;
        if (appliedNavKeyRef.current === navKey) return;
        appliedNavKeyRef.current = navKey;

        let nextSection = initialNavigation.section;

        const questionFromId = initialNavigation.qid ? questions.find((q) => q.id === initialNavigation.qid) ?? null : null;
        const setFromId = initialNavigation.setId ? questionSets.find((set) => set.id === initialNavigation.setId) ?? null : null;

        if (questionFromId) nextSection = questionFromId.section;
        else if (setFromId) nextSection = setFromId.section;

        if (!nextSection || !SECTIONS.includes(nextSection)) nextSection = SECTIONS[0];

        const nextSectionIndex = SECTIONS.indexOf(nextSection);
        const sectionQuestionsResolved = questions.filter((q) => q.section === nextSection);

        let nextQuestionIndex = 0;

        if (questionFromId && questionFromId.section === nextSection) {
            const idx = sectionQuestionsResolved.findIndex((q) => q.id === questionFromId.id);
            if (idx >= 0) nextQuestionIndex = idx;
        }

        if (!questionFromId && initialNavigation.setId) {
            const idx = sectionQuestionsResolved.findIndex((q) => q.set_id === initialNavigation.setId);
            if (idx >= 0) nextQuestionIndex = idx;
        }

        if (!questionFromId && typeof initialNavigation.q === 'number' && Number.isFinite(initialNavigation.q)) {
            const fallbackIndex = Math.max(0, initialNavigation.q - 1);
            nextQuestionIndex = Math.min(fallbackIndex, Math.max(sectionQuestionsResolved.length - 1, 0));
        }

        setCurrentSectionIndex(nextSectionIndex);
        setCurrentQuestionIndex(nextQuestionIndex);

        if (initialNavigation.setId) setSelectedSetId(initialNavigation.setId);
        else if (questionFromId?.set_id) setSelectedSetId(questionFromId.set_id);
    }, [initialNavigation, questions, questionSets]);

    const emitNavigation = useCallback(
        (sectionIndex: number, questionIndex: number, setOverride?: string | null) => {
            if (!onNavigate) return;

            const sectionName = SECTIONS[Math.max(0, Math.min(sectionIndex, SECTIONS.length - 1))];
            const sectionQuestionsForNav = questions.filter((q) => q.section === sectionName);

            const maxIndex = Math.max(0, sectionQuestionsForNav.length - 1);
            const resolvedIndex = Math.max(0, Math.min(questionIndex, maxIndex));
            const q = sectionQuestionsForNav[resolvedIndex] ?? null;

            onNavigate({
                section: sectionName,
                qid: q?.id ?? null,
                setId: setOverride ?? q?.set_id ?? null,
                q: resolvedIndex + 1,
            });
        },
        [onNavigate, questions]
    );

    useEffect(() => {
        const maxIndex = Math.max(0, sectionQuestions.length - 1);
        if (currentQuestionIndex > maxIndex) {
            setCurrentQuestionIndex(maxIndex);
            emitNavigation(currentSectionIndex, maxIndex, selectedSetId);
        }
    }, [sectionQuestions.length, currentQuestionIndex, currentSectionIndex, emitNavigation, selectedSetId]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;

        if (sectionQuestions.length === 0 && currentQuestionIndex !== 0) {
            console.warn('[ExamEditor] Navigation state invalid (section/q/set mismatch)', {
                section: currentSection,
                questionIndex: currentQuestionIndex,
                sectionQuestionCount: sectionQuestions.length,
            });
        }

        if (currentQuestion && currentQuestion.section !== currentSection) {
            console.warn('[ExamEditor] Navigation state invalid (section/q/set mismatch)', {
                section: currentSection,
                questionId: currentQuestion.id,
                questionSection: currentQuestion.section,
            });
        }

        if (currentQuestion && selectedSetId && currentQuestion.set_id && currentQuestion.set_id !== selectedSetId) {
            console.warn('[ExamEditor] Navigation state invalid (section/q/set mismatch)', {
                section: currentSection,
                questionId: currentQuestion.id,
                questionSetId: currentQuestion.set_id,
                selectedSetId,
            });
        }
    }, [currentSection, currentQuestionIndex, currentQuestion, sectionQuestions.length, selectedSetId]);

    const handleSave = useCallback(
        async (questionData: Partial<QuestionWithAnswer>) => {
            setIsSaving(true);
            try {
                await onSaveQuestion(questionData);
            } finally {
                setIsSaving(false);
            }
        },
        [onSaveQuestion]
    );

    const handleSaveContext = useCallback(
        async (contextData: Partial<QuestionContext>) => {
            if (onSaveContext) await onSaveContext(contextData);
        },
        [onSaveContext]
    );

    const handleApplyTaxonomyRename = useCallback(async () => {
        if (!onBulkRenameTaxonomy || isRenamingTaxonomy) return;

        const fromTopic = renameFromTopic.trim();
        const toTopic = renameToTopic.trim();
        const fromSubtopic = renameFromSubtopic.trim();
        const toSubtopic = renameToSubtopic.trim();

        const shouldRenameTopic = fromTopic.length > 0 && toTopic.length > 0 && fromTopic !== toTopic;
        const shouldRenameSubtopic = fromSubtopic.length > 0 && toSubtopic.length > 0 && fromSubtopic !== toSubtopic;

        if (!shouldRenameTopic && !shouldRenameSubtopic) {
            setTaxonomyError('Enter valid source and target values for topic and/or subtopic.');
            setTaxonomyStatus(null);
            return;
        }

        setIsRenamingTaxonomy(true);
        setTaxonomyError(null);
        setTaxonomyStatus(null);

        try {
            await onBulkRenameTaxonomy({
                section: currentSection,
                fromTopic: shouldRenameTopic ? fromTopic : undefined,
                toTopic: shouldRenameTopic ? toTopic : undefined,
                fromSubtopic: shouldRenameSubtopic ? fromSubtopic : undefined,
                toSubtopic: shouldRenameSubtopic ? toSubtopic : undefined,
            });
            setTaxonomyStatus('Taxonomy values updated for this section.');
            setRenameFromTopic('');
            setRenameToTopic('');
            setRenameFromSubtopic('');
            setRenameToSubtopic('');
        } catch (error) {
            setTaxonomyError(error instanceof Error ? error.message : 'Failed to rename taxonomy values.');
        } finally {
            setIsRenamingTaxonomy(false);
        }
    }, [
        onBulkRenameTaxonomy,
        isRenamingTaxonomy,
        renameFromTopic,
        renameToTopic,
        renameFromSubtopic,
        renameToSubtopic,
        currentSection,
    ]);

    const handleCreateSet = useCallback(
        async (setType: QuestionSet['set_type']) => {
            const sectionSets = questionSets.filter((set) => set.section === currentSection);
            const nextOrder = sectionSets.reduce((max, set) => Math.max(max, set.display_order ?? 0), 0) + 1;

            const defaultLayout: Record<QuestionSet['set_type'], ContentLayoutType> = {
                VARC: 'split_passage',
                DILR: 'split_chart',
                CASELET: 'split_table',
                ATOMIC: 'single_focus',
            };

            const defaultContextTitle =
                setType === 'VARC' ? `Passage ${sectionSets.length + 1}` : `Set ${sectionSets.length + 1}`;

            const created = await onCreateQuestionSet({
                paper_id: paper.id,
                section: currentSection,
                set_type: setType,
                content_layout: defaultLayout[setType],
                context_title: setType === 'ATOMIC' ? undefined : defaultContextTitle,
                context_body: setType === 'ATOMIC' ? undefined : '',
                context_image_url: undefined,
                context_additional_images: [],
                display_order: nextOrder,
                question_count: 0,
                metadata: {},
                is_active: true,
                is_published: false,
            });

            if (created) setSelectedSetId(created.id);
            return created;
        },
        [questionSets, currentSection, onCreateQuestionSet, paper.id]
    );

    const handleAddQuestionToSet = useCallback(async () => {
        let targetSetId = selectedSetId;

        if (!targetSetId) {
            const autoSetType = currentSection === 'QA' ? 'ATOMIC' : currentSection === 'VARC' ? 'VARC' : 'DILR';
            const created = await handleCreateSet(autoSetType);
            if (!created) return;
            targetSetId = created.id;
        }

        const sectionBase = SECTION_NUMBER_OFFSETS[currentSection];
        const maxQuestionNumberInSection = sectionQuestions.reduce((max, q, index) => {
            const displayNumber = getDisplayQuestionNumber(currentSection, q.question_number, index);
            return Math.max(max, displayNumber);
        }, sectionBase);
        const nextQuestionNumber = maxQuestionNumberInSection + 1;

        const setQuestions = questions.filter((q) => q.set_id === targetSetId);
        const nextSequence = setQuestions.reduce((max, q) => Math.max(max, q.sequence_order ?? 0), 0) + 1;

        await handleSave({
            paper_id: paper.id,
            section: currentSection,
            question_number: nextQuestionNumber,
            question_text: '',
            question_type: 'MCQ',
            question_format: 'MCQ',
            options: ['', '', '', ''],
            correct_answer: 'A',
            positive_marks: 3,
            negative_marks: 1,
            set_id: targetSetId,
            sequence_order: nextSequence,
            is_active: true,
        });

        setSelectedSetId(targetSetId);
        const nextIndex = sectionQuestions.length;
        setCurrentQuestionIndex(nextIndex);
        emitNavigation(currentSectionIndex, nextIndex, targetSetId);
    }, [
        selectedSetId,
        currentSection,
        handleCreateSet,
        sectionQuestions,
        questions,
        handleSave,
        paper.id,
        emitNavigation,
        currentSectionIndex,
    ]);

    const handleSectionChange = useCallback(
        (index: number) => {
            setCurrentSectionIndex(index);
            setCurrentQuestionIndex(0);
            setSelectedSetId(null);
            emitNavigation(index, 0, null);
        },
        [emitNavigation]
    );

    const handleQuestionSelect = useCallback(
        (index: number) => {
            setCurrentQuestionIndex(index);
            emitNavigation(currentSectionIndex, index, selectedSetId);
        },
        [currentSectionIndex, emitNavigation, selectedSetId]
    );

    const handleSelectSet = useCallback(
        (setId: string | null) => {
            setSelectedSetId(setId);
            emitNavigation(currentSectionIndex, currentQuestionIndex, setId);
        },
        [currentSectionIndex, currentQuestionIndex, emitNavigation]
    );

    const handleSolutionPreviewChange = useCallback((preview: { textbook: string; toppers: string }) => {
        setSidebarTextbookPreview(preview.textbook);
        setSidebarToppersPreview(preview.toppers);
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
            <EditableHeader
                paper={paper}
                currentSectionIndex={currentSectionIndex}
                onSectionChange={handleSectionChange}
                onUpdatePaperTitle={onUpdatePaperTitle}
                isExpanded={isExpanded}
                onToggleExpanded={() => setIsExpanded((prev) => !prev)}
            />

            <main className={`flex-1 w-full ${isExpanded ? 'px-0 py-0' : 'max-w-screen-2xl mx-auto px-4 py-6'}`}>
                <div className={`grid grid-cols-1 lg:grid-cols-[48%_33%_19%] ${isExpanded ? 'gap-0 min-h-[calc(100vh-72px)]' : 'gap-6 lg:gap-0 min-h-[calc(100vh-220px)]'}`}>
                    {showContextColumn && (
                        <div className="border border-gray-200 bg-gray-50 min-h-0 lg:border-r-0">
                            {useSetStimulus ? (
                                <EditableSetPane
                                    questionSet={currentSet}
                                    questionSets={questionSets}
                                    section={currentSection}
                                    paperId={paper.id}
                                    onSave={onSaveQuestionSet}
                                    onCreateSet={handleCreateSet}
                                    onSelectSet={handleSelectSet}
                                    selectedSetId={selectedSetId}
                                />
                            ) : (
                                <EditableContextPane
                                    context={currentContext}
                                    contexts={contexts}
                                    section={currentSection}
                                    paperId={paper.id}
                                    onSave={handleSaveContext}
                                    onDeleteContext={onDeleteContext}
                                    onSelectContext={setSelectedContextId}
                                    selectedContextId={selectedContextId}
                                />
                            )}
                        </div>
                    )}

                    <div
                        className={`border border-gray-200 bg-white min-h-0 ${questionColSpan} ${showContextColumn ? 'lg:border-l-0' : ''
                            }`}
                    >
                        <EditableQuestionArea
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            displayQuestionNumber={currentDisplayQuestionNumber}
                            totalQuestions={totalExpected}
                            section={currentSection}
                            paperId={paper.id}
                            selectedSetId={selectedSetId}
                            selectedContextId={selectedContextId}
                            onSave={handleSave}
                            isSaving={isSaving}
                            onSolutionPreviewChange={handleSolutionPreviewChange}
                        />
                    </div>

                    <aside className="hidden lg:flex flex-col border border-gray-200 bg-white min-h-0 lg:border-l-0">
                        <div className="sticky top-6 space-y-4 p-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Set Actions</h3>
                                <button
                                    type="button"
                                    onClick={handleAddQuestionToSet}
                                    className="w-full px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-md hover:bg-emerald-700"
                                >
                                    Add question to this set
                                </button>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Progress</h3>
                                <div className="space-y-2">
                                    {SECTIONS.map((sec) => {
                                        const count = questions.filter((q) => q.section === sec && q.question_text?.trim()).length;
                                        const total = SECTION_TOTALS[sec];
                                        const percent = Math.round((count / total) * 100);
                                        return (
                                            <div key={sec}>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>{sec}</span>
                                                    <span>
                                                        {count}/{total}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${percent}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                                <h3 className="font-semibold text-gray-800">Live Solution Preview</h3>
                                <p className="text-xs text-gray-500">
                                    Preview updates as you type in the editor.
                                </p>
                                {!sidebarTextbookPreview.trim() && !sidebarToppersPreview.trim() ? (
                                    <p className="text-xs text-gray-400">No solution content yet for this question.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {sidebarTextbookPreview.trim() && (
                                            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                    Textbook Solution
                                                </p>
                                                <div className="max-h-56 overflow-y-auto pr-1 prose prose-sm max-w-none text-slate-700">
                                                    <MathText text={sidebarTextbookPreview} strictText />
                                                </div>
                                            </div>
                                        )}
                                        {sidebarToppersPreview.trim() && (
                                            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                                    Toppers Approach
                                                </p>
                                                <div className="max-h-56 overflow-y-auto pr-1 prose prose-sm max-w-none text-slate-700">
                                                    <MathText text={sidebarToppersPreview} strictText />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {onBulkRenameTaxonomy && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                                    <h3 className="font-semibold text-gray-800">Normalize Topics</h3>
                                    <p className="text-xs text-gray-500">
                                        Bulk rename topic/subtopic spellings for {currentSection} to keep analytics clean.
                                    </p>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Source Topic</label>
                                        <select
                                            value={renameFromTopic}
                                            onChange={(e) => setRenameFromTopic(e.target.value)}
                                            className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="">Select source topic</option>
                                            {sectionTopics.map((topicOption) => (
                                                <option key={topicOption} value={topicOption}>
                                                    {topicOption}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Target Topic</label>
                                        <input
                                            type="text"
                                            list={renameTopicListId}
                                            value={renameToTopic}
                                            onChange={(e) => setRenameToTopic(e.target.value)}
                                            placeholder="Type replacement topic"
                                            className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                        <datalist id={renameTopicListId}>
                                            {sectionTopics.map((topicOption) => (
                                                <option key={topicOption} value={topicOption} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Source Subtopic (optional)</label>
                                            <select
                                                value={renameFromSubtopic}
                                                onChange={(e) => setRenameFromSubtopic(e.target.value)}
                                                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                            >
                                                <option value="">Select source subtopic</option>
                                                {sectionSubtopicsForFromTopic.map((subtopicOption) => (
                                                    <option key={subtopicOption} value={subtopicOption}>
                                                        {subtopicOption}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Target Subtopic (optional)</label>
                                            <input
                                                type="text"
                                                list={renameSubtopicListId}
                                                value={renameToSubtopic}
                                                onChange={(e) => setRenameToSubtopic(e.target.value)}
                                                placeholder="Type replacement subtopic"
                                                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                            <datalist id={renameSubtopicListId}>
                                                {sectionSubtopics.map((subtopicOption) => (
                                                    <option key={subtopicOption} value={subtopicOption} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplyTaxonomyRename}
                                        disabled={isRenamingTaxonomy}
                                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isRenamingTaxonomy ? 'Applying...' : 'Apply Rename'}
                                    </button>
                                    {taxonomyStatus && <p className="text-xs text-emerald-700">{taxonomyStatus}</p>}
                                    {taxonomyError && <p className="text-xs text-rose-700">{taxonomyError}</p>}
                                </div>
                            )}

                            <EditablePalette
                                questions={questions}
                                section={currentSection}
                                currentIndex={currentQuestionIndex}
                                onSelect={handleQuestionSelect}
                                onAddNew={() => handleQuestionSelect(sectionQuestions.length)}
                            />
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
