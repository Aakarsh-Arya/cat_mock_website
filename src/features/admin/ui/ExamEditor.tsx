/**
 * @fileoverview Admin Exam Editor Layout (Mirror Principle)
 * @description Full exam layout but with editable fields - exactly what student sees
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { EditableQuestion } from './EditableQuestion';
import type { Paper, QuestionWithAnswer, SectionName, QuestionContext } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamEditorProps {
    /** Paper data */
    paper: Paper;
    /** All questions for the paper */
    questions: QuestionWithAnswer[];
    /** All contexts for the paper */
    contexts: QuestionContext[];
    /** Callback when a question is saved */
    onSaveQuestion: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    /** Callback when a context is saved */
    onSaveContext?: (context: Partial<QuestionContext>) => Promise<void>;
    /** Callback when paper is updated */
    onUpdatePaper?: (paper: Partial<Paper>) => Promise<void>;
}

interface EditableContextProps {
    context: QuestionContext | null;
    paperId: string;
    section: SectionName;
    onSave: (context: Partial<QuestionContext>) => Promise<void>;
    onCancel: () => void;
}

// =============================================================================
// EDITABLE CONTEXT (PASSAGE/DATA SET)
// =============================================================================

function EditableContext({ context, paperId, section, onSave, onCancel }: EditableContextProps) {
    const [title, setTitle] = useState(context?.title ?? '');
    const [content, setContent] = useState(context?.content ?? '');
    const [contextType, setContextType] = useState<'passage' | 'data_set' | 'image' | 'table'>(
        (context?.context_type as 'passage' | 'data_set' | 'image' | 'table') ?? 'passage'
    );
    const [isSaving, setIsSaving] = useState(false);

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
                is_active: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-amber-800">
                    {section === 'VARC' ? 'Reading Passage' : 'Data Set / Diagram'}
                </h3>
                <select
                    value={contextType}
                    onChange={(e) => setContextType(e.target.value as typeof contextType)}
                    className="text-sm border border-amber-300 rounded px-2 py-1 bg-white"
                >
                    <option value="passage">Passage</option>
                    <option value="data_set">Data Set</option>
                    <option value="table">Table</option>
                    <option value="image">Image Only</option>
                </select>
            </div>

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Context title (optional)"
                className="w-full px-3 py-2 mb-3 border border-amber-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            />

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={section === 'VARC'
                    ? 'Paste the reading passage here...'
                    : 'Enter the data set, table, or description...'}
                rows={8}
                className="w-full px-3 py-2 border border-amber-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-y font-mono text-sm"
            />

            <div className="flex justify-end gap-2 mt-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-amber-700 hover:bg-amber-100 rounded transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Context'}
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// QUESTION PALETTE (ADMIN VERSION)
// =============================================================================

interface AdminQuestionPaletteProps {
    questions: QuestionWithAnswer[];
    currentIndex: number;
    section: SectionName;
    onSelect: (index: number) => void;
    onAddNew: () => void;
}

function AdminQuestionPalette({
    questions,
    currentIndex,
    section,
    onSelect,
    onAddNew
}: AdminQuestionPaletteProps) {
    const sectionQuestions = questions.filter(q => q.section === section);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{section} Questions</h3>
                <span className="text-sm text-gray-500">{sectionQuestions.length} total</span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
                {sectionQuestions.map((q, idx) => {
                    const globalIndex = questions.findIndex(gq => gq.id === q.id);
                    const hasContent = q.question_text?.trim();

                    return (
                        <button
                            key={q.id}
                            type="button"
                            onClick={() => onSelect(globalIndex)}
                            className={`
                                w-10 h-10 rounded-md text-sm font-medium transition-all
                                ${globalIndex === currentIndex
                                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                    : hasContent
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }
                            `}
                            title={hasContent ? 'Has content' : 'Empty'}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onAddNew}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Question
            </button>
        </div>
    );
}

// =============================================================================
// MAIN EXAM EDITOR
// =============================================================================

export function ExamEditor({
    paper,
    questions,
    contexts,
    onSaveQuestion,
    onSaveContext,
    onUpdatePaper,
}: ExamEditorProps) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isEditingContext, setIsEditingContext] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const currentSection = sections[currentSectionIndex];

    // Get questions for current section
    const sectionQuestions = useMemo(() =>
        questions.filter(q => q.section === currentSection),
        [questions, currentSection]
    );

    const currentQuestion = sectionQuestions[currentQuestionIndex] ?? null;

    // Get context for current question (if any)
    const currentContext = useMemo(() => {
        if (!currentQuestion?.context_id) return null;
        return contexts.find(c => c.id === currentQuestion.context_id) ?? null;
    }, [currentQuestion, contexts]);

    // Handle question save
    const handleSaveQuestion = useCallback(async (questionData: Partial<QuestionWithAnswer>) => {
        setIsSaving(true);
        try {
            await onSaveQuestion(questionData);
        } catch (err) {
            console.error('Error in handleSaveQuestion:', err);
            // Error is handled by parent, just log here
        } finally {
            setIsSaving(false);
        }
    }, [onSaveQuestion]);

    // Handle context save
    const handleSaveContext = useCallback(async (contextData: Partial<QuestionContext>) => {
        try {
            if (onSaveContext) {
                await onSaveContext(contextData);
            }
        } catch (err) {
            console.error('Error in handleSaveContext:', err);
        } finally {
            setIsEditingContext(false);
        }
    }, [onSaveContext]);

    // Get total questions expected for section
    const getSectionTotal = (section: SectionName) => {
        switch (section) {
            case 'VARC': return 24;
            case 'DILR': return 20;
            case 'QA': return 22;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header - Mirror Exam Header */}
            <header className="bg-[#0b3d91] text-white shadow-md">
                <div className="max-w-screen-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left - Paper Info */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded">
                                    EDIT MODE
                                </span>
                                <h1 className="text-xl font-bold">{paper.title}</h1>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-blue-100">
                                <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                    {paper.total_questions} Questions
                                </span>
                                <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                    {paper.total_marks} Marks
                                </span>
                            </div>
                        </div>

                        {/* Center - Section Tabs */}
                        <div className="flex items-center gap-2">
                            {sections.map((section, index) => {
                                const sectionQs = questions.filter(q => q.section === section);
                                const filledCount = sectionQs.filter(q => q.question_text?.trim()).length;
                                const totalExpected = getSectionTotal(section);

                                return (
                                    <button
                                        key={section}
                                        type="button"
                                        onClick={() => {
                                            setCurrentSectionIndex(index);
                                            setCurrentQuestionIndex(0);
                                        }}
                                        className={`
                                            px-4 py-2 rounded-md text-sm font-semibold transition-colors border
                                            ${index === currentSectionIndex
                                                ? 'bg-white text-[#0b3d91] border-white'
                                                : 'bg-white/10 text-blue-100 border-white/20 hover:bg-white/20'
                                            }
                                        `}
                                    >
                                        {section}
                                        <span className="ml-2 text-xs opacity-75">
                                            {filledCount}/{totalExpected}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right - Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md text-sm transition-colors"
                            >
                                Preview Exam
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Two Column Layout (mirrors exam) */}
            <div className="max-w-screen-2xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Side - Context/Passage (if VARC/DILR) */}
                    {(currentSection === 'VARC' || currentSection === 'DILR') && (
                        <div className="lg:col-span-1">
                            {isEditingContext ? (
                                <EditableContext
                                    context={currentContext}
                                    paperId={paper.id}
                                    section={currentSection}
                                    onSave={handleSaveContext}
                                    onCancel={() => setIsEditingContext(false)}
                                />
                            ) : currentContext ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-amber-800">
                                            {currentContext.title || 'Reading Passage'}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingContext(true)}
                                            className="text-amber-600 hover:text-amber-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-[20]">
                                        {currentContext.content}
                                    </p>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingContext(true)}
                                    className="w-full py-8 border-2 border-dashed border-amber-300 text-amber-600 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors flex flex-col items-center gap-2"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Add Passage / Data Set</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Center - Question Editor */}
                    <div className={currentSection === 'QA' ? 'lg:col-span-3' : 'lg:col-span-2'}>
                        {currentQuestion ? (
                            <EditableQuestion
                                question={currentQuestion}
                                paperId={paper.id}
                                section={currentSection}
                                questionNumber={currentQuestionIndex + 1}
                                totalQuestions={sectionQuestions.length}
                                onSave={handleSaveQuestion}
                                isSaving={isSaving}
                            />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500 mb-4">No questions in this section yet</p>
                                <button
                                    type="button"
                                    onClick={() => {/* Add new question */ }}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                                >
                                    Add First Question
                                </button>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-4">
                            <button
                                type="button"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">
                                Question {currentQuestionIndex + 1} of {sectionQuestions.length}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(sectionQuestions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex >= sectionQuestions.length - 1}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Question Palette */}
                    <div className="lg:col-span-1">
                        <AdminQuestionPalette
                            questions={questions}
                            currentIndex={questions.findIndex(q => q.id === currentQuestion?.id)}
                            section={currentSection}
                            onSelect={(index) => {
                                const q = questions[index];
                                if (q) {
                                    const sectionIdx = sections.indexOf(q.section);
                                    if (sectionIdx !== currentSectionIndex) {
                                        setCurrentSectionIndex(sectionIdx);
                                    }
                                    const localIdx = sectionQuestions.findIndex(sq => sq.id === q.id);
                                    setCurrentQuestionIndex(localIdx >= 0 ? localIdx : 0);
                                }
                            }}
                            onAddNew={() => {/* Add new question */ }}
                        />

                        {/* Legend */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                            <h4 className="font-medium text-gray-800 mb-3">Legend</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-green-100 border border-green-300"></span>
                                    <span className="text-gray-600">Has content</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-gray-100 border border-gray-300"></span>
                                    <span className="text-gray-600">Empty / Draft</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-blue-500"></span>
                                    <span className="text-gray-600">Currently editing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExamEditor;
