/**
 * @fileoverview Editable Question Component (Mirror Principle)
 * @description In-context editor that mirrors the exam interface but with editable fields
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees, but editable
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { QuestionWithAnswer, SectionName, QuestionType } from '@/types/exam';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { MathText } from '@/features/exam-engine/ui/MathText';

// =============================================================================
// TYPES
// =============================================================================

interface EditableQuestionProps {
    /** Initial question data (null for new question) */
    question: Partial<QuestionWithAnswer> | null;
    /** Paper ID for new questions */
    paperId: string;
    /** Current section */
    section: SectionName;
    /** Question number in the section */
    questionNumber: number;
    /** Total questions in section */
    totalQuestions: number;
    /** Callback when question is saved */
    onSave: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    /** Callback when cancelled */
    onCancel?: () => void;
    /** Is saving in progress */
    isSaving?: boolean;
}

interface EditableOptionProps {
    label: string;
    value: string;
    isCorrect: boolean;
    onChange: (value: string) => void;
    onMarkCorrect: () => void;
}

// =============================================================================
// OPTION LABELS
// =============================================================================

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// =============================================================================
// EDITABLE OPTION COMPONENT
// =============================================================================

function EditableOption({
    label,
    value,
    isCorrect,
    onChange,
    onMarkCorrect,
}: EditableOptionProps) {
    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-lg border-2 transition-all
                ${isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
            `}
        >
            {/* Option Label (A, B, C, D) */}
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

            {/* Editable Option Text */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter option ${label}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />

            {/* Correct Indicator */}
            {isCorrect && (
                <span className="flex-shrink-0 text-green-500 flex items-center gap-1 text-sm font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Correct
                </span>
            )}
        </div>
    );
}

// =============================================================================
// IMAGE DROP ZONE COMPONENT
// =============================================================================

interface ImageDropZoneProps {
    imageUrl: string | null;
    onImageUpload: (file: File) => Promise<void>;
    onImageRemove: () => void;
    isUploading?: boolean;
}

function ImageDropZone({ imageUrl, onImageUpload, onImageRemove, isUploading }: ImageDropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(f => f.type.startsWith('image/'));

        if (imageFile) {
            await onImageUpload(imageFile);
        }
    }, [onImageUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onImageUpload(file);
        }
    }, [onImageUpload]);

    if (imageUrl) {
        return (
            <div className="relative border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                <img
                    src={imageUrl}
                    alt="Question diagram"
                    className="max-w-full max-h-64 mx-auto rounded"
                />
                <button
                    type="button"
                    onClick={onImageRemove}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600">
                    {isUploading ? 'Uploading...' : 'Drag & drop an image here, or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                </p>
            </label>
        </div>
    );
}

// =============================================================================
// MAIN EDITABLE QUESTION COMPONENT
// =============================================================================

export function EditableQuestion({
    question,
    paperId,
    section,
    questionNumber,
    totalQuestions,
    onSave,
    onCancel,
    isSaving = false,
}: EditableQuestionProps) {
    // Form state
    const [questionText, setQuestionText] = useState(question?.question_text ?? '');
    const [questionType, setQuestionType] = useState<QuestionType>(question?.question_type ?? 'MCQ');
    const [options, setOptions] = useState<string[]>(question?.options ?? ['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer ?? 'A');
    const [positiveMarks, setPositiveMarks] = useState(question?.positive_marks ?? 3);
    const [negativeMarks, setNegativeMarks] = useState(question?.negative_marks ?? 1);
    const [solutionText, setSolutionText] = useState(question?.solution_text ?? '');
    const [imageUrl, setImageUrl] = useState<string | null>(question?.question_image_url ?? null);
    const [isUploading, setIsUploading] = useState(false);
    const [topic, setTopic] = useState(question?.topic ?? '');
    const [difficulty, setDifficulty] = useState(question?.difficulty ?? 'medium');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        setImageUrl(question?.question_image_url ?? null);
    }, [question?.id]);

    // Handle option text change
    const handleOptionChange = useCallback((index: number, value: string) => {
        setOptions(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    }, []);

    // Handle correct answer selection
    const handleMarkCorrect = useCallback((label: string) => {
        setCorrectAnswer(label);
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

    // Handle image remove
    const handleImageRemove = useCallback(() => {
        setImageUrl(null);
    }, []);

    // Handle save
    const handleSave = useCallback(async () => {
        const questionData: Partial<QuestionWithAnswer> = {
            ...question,
            paper_id: paperId,
            section,
            question_number: questionNumber,
            question_text: questionText,
            question_type: questionType,
            options: questionType === 'MCQ' ? options : null,
            correct_answer: questionType === 'MCQ' ? correctAnswer : correctAnswer, // For TITA, this is the numeric answer
            positive_marks: positiveMarks,
            negative_marks: questionType === 'TITA' ? 0 : negativeMarks,
            solution_text: solutionText || undefined,
            question_image_url: imageUrl || undefined,
            topic: topic || undefined,
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            is_active: true,
        };

        await onSave(questionData);
    }, [
        question, paperId, section, questionNumber, questionText, questionType,
        options, correctAnswer, positiveMarks, negativeMarks, solutionText,
        topic, difficulty, imageUrl, onSave
    ]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Question Header - Mirror the exam UI */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <span className="text-sm text-gray-500">{section}</span>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Question {questionNumber} of {totalQuestions}
                    </h2>
                </div>

                {/* Question Type Toggle */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setQuestionType('MCQ')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${questionType === 'MCQ'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            MCQ
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setQuestionType('TITA');
                                setNegativeMarks(0);
                            }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${questionType === 'TITA'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            TITA
                        </button>
                    </div>

                    {/* Marks Config */}
                    <div className="flex items-center gap-2 text-sm">
                        <label className="flex items-center gap-1">
                            <span className="text-green-600">+</span>
                            <input
                                type="number"
                                value={positiveMarks}
                                onChange={(e) => setPositiveMarks(Number(e.target.value))}
                                className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                                min={0}
                            />
                        </label>
                        <label className="flex items-center gap-1">
                            <span className="text-red-600">-</span>
                            <input
                                type="number"
                                value={negativeMarks}
                                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                                className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                                min={0}
                                disabled={questionType === 'TITA'}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Image Drop Zone */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagram / Image (optional)
                </label>
                <ImageDropZone
                    imageUrl={imageUrl}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    isUploading={isUploading}
                />
            </div>

            {/* Question Text - Editable */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Question Text <span className="text-red-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPreview((prev) => !prev)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {showPreview ? 'Hide Preview' : 'Preview'}
                    </button>
                </div>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter the question text... (Supports Markdown and LaTeX with $...$)"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                />
                <p className="mt-1 text-xs text-gray-400">
                    Tip: Use $...$ for inline math, $$...$$ for block math
                </p>
                {showPreview && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                        <div className="text-sm font-medium text-gray-600">Preview</div>
                        <div className="prose prose-sm max-w-none text-gray-800">
                            <MathText text={questionText} />
                        </div>
                        {questionType === 'MCQ' && (
                            <div className="space-y-2">
                                {options.map((optionText, index) => {
                                    const label = OPTION_LABELS[index];
                                    return (
                                        <div key={label} className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                                                {label}
                                            </span>
                                            <div className="text-sm text-gray-700">
                                                <MathText text={optionText} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {solutionText && (
                            <div className="rounded-md bg-white border border-gray-200 p-3">
                                <div className="text-xs font-medium text-gray-500 mb-2">Solution Preview</div>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <MathText text={solutionText} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Options (MCQ only) or Answer Input (TITA) */}
            {questionType === 'MCQ' ? (
                <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options <span className="text-red-500">*</span>
                        <span className="font-normal text-gray-400 ml-2">(Click letter to mark correct)</span>
                    </label>
                    {options.map((optionText, index) => {
                        const label = OPTION_LABELS[index];
                        return (
                            <EditableOption
                                key={label}
                                label={label}
                                value={optionText}
                                isCorrect={correctAnswer === label}
                                onChange={(value) => handleOptionChange(index, value)}
                                onMarkCorrect={() => handleMarkCorrect(label)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Enter the exact answer (e.g., 42, 3.14)"
                        className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                        Enter the exact numeric/text answer students must type
                    </p>
                </div>
            )}

            {/* Solution */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution / Explanation
                </label>
                <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Explain the solution... (Supports Markdown and LaTeX)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                />
            </div>

            {/* Metadata Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topic
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Reading Comprehension, Percentages"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                    </label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    {question?.id ? 'Editing existing question' : 'Creating new question'}
                </div>
                <div className="flex items-center gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !questionText.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>Save Question</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditableQuestion;
