/**
 * @fileoverview Exam Editor Client Component
 * @description Client wrapper for the ExamEditor with server actions
 * @blueprint M6+ - Mirror Principle
 */

'use client';

import { useCallback, useState } from 'react';
import { EditableExamLayout } from '@/features/admin';
import type { Paper, QuestionWithAnswer, QuestionContext } from '@/types/exam';
import {
    updateQuestion,
    createQuestion,
    updateContext,
    createContext,
    updatePaper,
} from './actions';

interface ExamEditorClientProps {
    paper: Paper;
    initialQuestions: QuestionWithAnswer[];
    initialContexts: QuestionContext[];
}

export function ExamEditorClient({
    paper,
    initialQuestions,
    initialContexts,
}: ExamEditorClientProps) {
    const [questions, setQuestions] = useState<QuestionWithAnswer[]>(initialQuestions);
    const [contexts, setContexts] = useState<QuestionContext[]>(initialContexts);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

    // Clear notifications after delay
    const showNotification = useCallback((type: 'success' | 'error', message: string, retry?: () => void) => {
        if (type === 'success') {
            setSaveSuccess(message);
            setSaveError(null);
            setRetryAction(null);
            setTimeout(() => setSaveSuccess(null), 3000);
        } else {
            setSaveError(message);
            setSaveSuccess(null);
            setRetryAction(() => retry ?? null);
            setTimeout(() => setSaveError(null), 5000);
        }
    }, []);

    // Save question to database using server action
    const handleSaveQuestion = useCallback(async (questionData: Partial<QuestionWithAnswer>) => {
        const nowIso = new Date().toISOString();

        try {
            if (questionData.id) {
                const previousQuestion = questions.find(q => q.id === questionData.id) ?? null;
                if (previousQuestion) {
                    const optimisticQuestion = {
                        ...previousQuestion,
                        ...questionData,
                        updated_at: nowIso,
                    } as QuestionWithAnswer;

                    setQuestions(prev =>
                        prev.map(q => q.id === questionData.id ? optimisticQuestion : q)
                    );
                }

                // Update existing question via server action
                const result = await updateQuestion(questionData.id, questionData);

                if (!result.success || !result.data) {
                    console.error('Failed to update question:', result.error);
                    if (previousQuestion) {
                        setQuestions(prev => prev.map(q => q.id === previousQuestion.id ? previousQuestion : q));
                    }
                    showNotification('error', result.error || 'Failed to save', () => handleSaveQuestion(questionData));
                    return;
                }

                // Update local state
                setQuestions(prev =>
                    prev.map(q => q.id === result.data!.id ? result.data! : q)
                );
                showNotification('success', 'Question updated successfully!');
            } else {
                const tempId = `temp-${Date.now()}`;
                const optimisticQuestion: QuestionWithAnswer = {
                    id: tempId,
                    paper_id: questionData.paper_id ?? paper.id,
                    section: questionData.section ?? 'VARC',
                    question_number: questionData.question_number ?? 1,
                    question_text: questionData.question_text ?? '',
                    question_type: questionData.question_type ?? 'MCQ',
                    options: questionData.options ?? null,
                    correct_answer: questionData.correct_answer ?? 'A',
                    positive_marks: questionData.positive_marks ?? 3,
                    negative_marks: questionData.negative_marks ?? 1,
                    solution_text: questionData.solution_text ?? undefined,
                    solution_image_url: questionData.solution_image_url ?? undefined,
                    question_image_url: questionData.question_image_url ?? undefined,
                    difficulty: questionData.difficulty ?? undefined,
                    topic: questionData.topic ?? undefined,
                    subtopic: questionData.subtopic ?? undefined,
                    is_active: true,
                    created_at: nowIso,
                    updated_at: nowIso,
                };

                setQuestions(prev => [...prev, optimisticQuestion]);

                // Create new question via server action
                const result = await createQuestion({
                    ...questionData,
                    paper_id: questionData.paper_id ?? paper.id,
                });

                if (!result.success || !result.data) {
                    console.error('Failed to create question:', result.error);
                    setQuestions(prev => prev.filter(q => q.id !== tempId));
                    showNotification('error', result.error || 'Failed to create', () => handleSaveQuestion(questionData));
                    return;
                }

                // Add to local state
                setQuestions(prev => prev.map(q => q.id === tempId ? result.data! : q));
                showNotification('success', 'Question created successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving question:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleSaveQuestion(questionData));
        }
    }, [paper.id, questions, showNotification]);

    // Save context to database using server action
    const handleSaveContext = useCallback(async (contextData: Partial<QuestionContext>) => {
        const nowIso = new Date().toISOString();

        try {
            if (contextData.id) {
                const previousContext = contexts.find(c => c.id === contextData.id) ?? null;
                if (previousContext) {
                    const optimisticContext = {
                        ...previousContext,
                        ...contextData,
                        updated_at: nowIso,
                    } as QuestionContext;

                    setContexts(prev =>
                        prev.map(c => c.id === contextData.id ? optimisticContext : c)
                    );
                }

                // Update existing context via server action
                const result = await updateContext(contextData.id, contextData);

                if (!result.success || !result.data) {
                    console.error('Failed to update context:', result.error);
                    if (previousContext) {
                        setContexts(prev => prev.map(c => c.id === previousContext.id ? previousContext : c));
                    }
                    showNotification('error', result.error || 'Failed to save context', () => handleSaveContext(contextData));
                    return;
                }

                setContexts(prev =>
                    prev.map(c => c.id === result.data!.id ? result.data! : c)
                );
                showNotification('success', 'Context updated successfully!');
            } else {
                const tempId = `temp-${Date.now()}`;
                const displayOrder = contexts.filter(c => c.section === contextData.section).length;
                const optimisticContext: QuestionContext = {
                    id: tempId,
                    paper_id: contextData.paper_id ?? paper.id,
                    section: contextData.section ?? 'VARC',
                    title: contextData.title ?? undefined,
                    content: contextData.content ?? '',
                    context_type: contextData.context_type ?? 'passage',
                    image_url: contextData.image_url ?? undefined,
                    display_order: displayOrder,
                    is_active: true,
                    created_at: nowIso,
                    updated_at: nowIso,
                };

                setContexts(prev => [...prev, optimisticContext]);

                // Create new context via server action
                const result = await createContext(
                    { ...contextData, paper_id: contextData.paper_id ?? paper.id },
                    displayOrder
                );

                if (!result.success || !result.data) {
                    console.error('Failed to create context:', result.error);
                    setContexts(prev => prev.filter(c => c.id !== tempId));
                    showNotification('error', result.error || 'Failed to create context', () => handleSaveContext(contextData));
                    return;
                }

                setContexts(prev => prev.map(c => c.id === tempId ? result.data! : c));
                showNotification('success', 'Context created successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving context:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleSaveContext(contextData));
        }
    }, [contexts, paper.id, showNotification]);

    // Update paper metadata using server action
    const handleUpdatePaper = useCallback(async (paperData: Partial<Paper>) => {
        try {
            const result = await updatePaper(paper.id, paperData);

            if (!result.success) {
                console.error('Failed to update paper:', result.error);
                showNotification('error', result.error || 'Failed to update paper', () => handleUpdatePaper(paperData));
                return;
            }

            showNotification('success', 'Paper updated successfully!');
        } catch (err) {
            console.error('Unexpected error updating paper:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleUpdatePaper(paperData));
        }
    }, [paper.id, showNotification]);

    return (
        <>
            {/* Toast Notifications */}
            {(saveError || saveSuccess) && (
                <div className="fixed top-4 right-4 z-50">
                    {saveError && (
                        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{saveError}</span>
                            {retryAction && (
                                <button
                                    onClick={retryAction}
                                    className="ml-2 text-white/90 hover:text-white underline"
                                >
                                    Retry
                                </button>
                            )}
                            <button onClick={() => setSaveError(null)} className="ml-2 hover:opacity-70">×</button>
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{saveSuccess}</span>
                        </div>
                    )}
                </div>
            )}
            <EditableExamLayout
                paper={paper}
                questions={questions}
                contexts={contexts}
                onSaveQuestion={handleSaveQuestion}
                onSaveContext={handleSaveContext}
            />
        </>
    );
}
