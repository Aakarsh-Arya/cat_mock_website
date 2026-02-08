/**
 * @fileoverview Exam Editor Client Component
 * @description Client wrapper for the ExamEditor with server actions
 * @blueprint M6+ - Mirror Principle
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { EditableExamLayout } from '@/features/admin';
import type { EditorNavigationState } from '@/features/admin/ui/EditableExamLayout';
import type { Paper, QuestionWithAnswer, QuestionContext, QuestionSet, SectionName } from '@/types/exam';
import {
    updateQuestion,
    createQuestion,
    updateContext,
    createContext,
    deleteContext,
    updatePaper,
    updateQuestionSet,
    createQuestionSet,
} from './actions';

interface ExamEditorClientProps {
    paper: Paper;
    initialQuestions: QuestionWithAnswer[];
    initialQuestionSets: QuestionSet[];
    initialContexts: QuestionContext[];
}

type QuestionOrderBySection = Record<SectionName, string[]>;

const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];

const createEmptyQuestionOrder = (): QuestionOrderBySection => ({
    VARC: [],
    DILR: [],
    QA: [],
});

const parseSection = (value: string | null): SectionName | undefined => {
    if (!value) return undefined;
    return SECTIONS.includes(value as SectionName) ? (value as SectionName) : undefined;
};

const parseNavigation = (params: URLSearchParams): EditorNavigationState => {
    const section = parseSection(params.get('section'));
    const qid = params.get('qid') ?? undefined;
    const setId = params.get('setId') ?? undefined;
    const qParam = params.get('q');
    const q = qParam ? Number(qParam) : undefined;
    return {
        section,
        qid: qid || undefined,
        setId: setId || undefined,
        q: typeof q === 'number' && Number.isFinite(q) && q > 0 ? q : undefined,
    };
};

const normalizeQuestions = (items: QuestionWithAnswer[]) => {
    const questionsById: Record<string, QuestionWithAnswer> = {};
    const questionOrderBySection: QuestionOrderBySection = createEmptyQuestionOrder();

    items.forEach((q) => {
        questionsById[q.id] = q;
    });

    SECTIONS.forEach((section) => {
        questionOrderBySection[section] = items
            .filter((q) => q.section === section)
            .sort((a, b) => {
                const aNum = a.question_number ?? 0;
                const bNum = b.question_number ?? 0;
                if (aNum !== bNum) return aNum - bNum;
                const aSeq = a.sequence_order ?? 0;
                const bSeq = b.sequence_order ?? 0;
                if (aSeq !== bSeq) return aSeq - bSeq;
                return a.id.localeCompare(b.id);
            })
            .map((q) => q.id);
    });

    return { questionsById, questionOrderBySection };
};

const normalizeById = <T extends { id: string }>(items: T[]) => {
    return items.reduce<Record<string, T>>((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});
};

const sortQuestionIdsForSection = (
    questionsById: Record<string, QuestionWithAnswer>,
    section: SectionName
) => {
    return Object.values(questionsById)
        .filter((q) => q.section === section)
        .sort((a, b) => {
            const aNum = a.question_number ?? 0;
            const bNum = b.question_number ?? 0;
            if (aNum !== bNum) return aNum - bNum;
            const aSeq = a.sequence_order ?? 0;
            const bSeq = b.sequence_order ?? 0;
            if (aSeq !== bSeq) return aSeq - bSeq;
            return a.id.localeCompare(b.id);
        })
        .map((q) => q.id);
};

export function ExamEditorClient({
    paper,
    initialQuestions,
    initialQuestionSets,
    initialContexts,
}: ExamEditorClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [paperState, setPaperState] = useState<Paper>(paper);
    const [{ questionsById, questionOrderBySection }, setQuestionState] = useState(() => normalizeQuestions(initialQuestions));
    const [questionSetsById, setQuestionSetsById] = useState<Record<string, QuestionSet>>(() => normalizeById(initialQuestionSets));
    const [contextsById, setContextsById] = useState<Record<string, QuestionContext>>(() => normalizeById(initialContexts));
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
    const [externalNavigation, setExternalNavigation] = useState<EditorNavigationState | null>(null);

    const STORAGE_KEY = `paper:${paper.id}:editorNav`;

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const resolveNavigation = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const fromUrl = parseNavigation(urlParams);
            const hasUrl = Boolean(fromUrl.section || fromUrl.qid || fromUrl.setId || fromUrl.q);

            if (hasUrl) {
                setExternalNavigation(fromUrl);
                return;
            }

            const storedRaw = window.localStorage.getItem(STORAGE_KEY);
            if (storedRaw) {
                try {
                    const stored = JSON.parse(storedRaw) as EditorNavigationState;
                    setExternalNavigation({
                        section: parseSection(stored.section ?? null),
                        qid: stored.qid ?? undefined,
                        setId: stored.setId ?? undefined,
                        q: typeof stored.q === 'number' && Number.isFinite(stored.q) && stored.q > 0 ? stored.q : undefined,
                    });
                    return;
                } catch {
                    window.localStorage.removeItem(STORAGE_KEY);
                }
            }

            setExternalNavigation({ section: 'VARC', q: 1 });
        };

        resolveNavigation();

        const handlePopState = () => resolveNavigation();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [STORAGE_KEY]);

    const questions = useMemo(() => {
        return SECTIONS.flatMap((section) =>
            (questionOrderBySection[section] || [])
                .map((id) => questionsById[id])
                .filter(Boolean)
        );
    }, [questionOrderBySection, questionsById]);

    // Dev-only: Detect duplicate question IDs in assembled list
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;

        const seen = new Set<string>();
        const duplicates = new Set<string>();
        questions.forEach((q) => {
            if (seen.has(q.id)) {
                duplicates.add(q.id);
            } else {
                seen.add(q.id);
            }
        });

        if (duplicates.size > 0) {
            console.warn('[ExamEditor] Detected duplicate question ids in assembled question list', {
                duplicateIds: Array.from(duplicates),
                totalQuestions: questions.length,
            });
        }
    }, [questions]);

    const questionSets = useMemo(() => {
        return Object.values(questionSetsById)
            .sort((a, b) => {
                if (a.section !== b.section) {
                    return SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section);
                }
                const order = (a.display_order ?? 0) - (b.display_order ?? 0);
                if (order !== 0) return order;
                return a.id.localeCompare(b.id);
            });
    }, [questionSetsById]);

    const contexts = useMemo(() => {
        return Object.values(contextsById)
            .sort((a, b) => {
                if (a.section !== b.section) {
                    return SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section);
                }
                const order = (a.display_order ?? 0) - (b.display_order ?? 0);
                if (order !== 0) return order;
                return a.id.localeCompare(b.id);
            });
    }, [contextsById]);

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
        if (!questionData.id) {
            const existingQuestion = Object.values(questionsById).find((q) => {
                if (!questionData.section || questionData.question_number === undefined) {
                    return false;
                }

                if (q.section !== questionData.section) {
                    return false;
                }

                if (q.question_number !== questionData.question_number) {
                    return false;
                }

                if (questionData.set_id && q.set_id !== questionData.set_id) {
                    return false;
                }

                return true;
            });

            if (existingQuestion && process.env.NODE_ENV !== 'production') {
                console.warn('[ExamEditor] Attempted to create when update expected (question id missing).', {
                    attemptedPayload: questionData,
                    existingQuestionId: existingQuestion.id,
                });
                showNotification('error', 'Refused to create: missing question id for an existing question.');
                return;
            }
        }

        const nowIso = new Date().toISOString();

        try {
            if (questionData.id) {
                const previousQuestion = questionsById[questionData.id] ?? null;
                if (previousQuestion) {
                    const optimisticQuestion = {
                        ...previousQuestion,
                        ...questionData,
                        updated_at: nowIso,
                    } as QuestionWithAnswer;

                    setQuestionState((prev) => {
                        const nextById = { ...prev.questionsById, [optimisticQuestion.id]: optimisticQuestion };
                        const nextOrder = { ...prev.questionOrderBySection };
                        nextOrder[optimisticQuestion.section] = sortQuestionIdsForSection(nextById, optimisticQuestion.section);
                        return { questionsById: nextById, questionOrderBySection: nextOrder };
                    });
                }

                // Update existing question via server action
                const result = await updateQuestion(questionData.id, questionData);

                if (!result.success || !result.data) {
                    console.error('Failed to update question:', result.error);
                    if (previousQuestion) {
                        setQuestionState((prev) => {
                            const nextById = { ...prev.questionsById, [previousQuestion.id]: previousQuestion };
                            const nextOrder = { ...prev.questionOrderBySection };
                            nextOrder[previousQuestion.section] = sortQuestionIdsForSection(nextById, previousQuestion.section);
                            return { questionsById: nextById, questionOrderBySection: nextOrder };
                        });
                    }
                    showNotification('error', result.error || 'Failed to save', () => handleSaveQuestion(questionData));
                    return;
                }

                // Update local state
                setQuestionState((prev) => {
                    const updated = result.data!;
                    const nextById = { ...prev.questionsById, [updated.id]: updated };
                    const nextOrder = { ...prev.questionOrderBySection };
                    nextOrder[updated.section] = sortQuestionIdsForSection(nextById, updated.section);
                    return { questionsById: nextById, questionOrderBySection: nextOrder };
                });
                showNotification('success', 'Question updated successfully!');
            } else {
                const tempId = `temp-${Date.now()}`;
                const optimisticQuestion: QuestionWithAnswer = {
                    id: tempId,
                    paper_id: questionData.paper_id ?? paperState.id,
                    section: questionData.section ?? 'VARC',
                    question_number: questionData.question_number ?? 1,
                    set_id: questionData.set_id ?? null,
                    sequence_order: questionData.sequence_order ?? null,
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

                setQuestionState((prev) => {
                    const nextById = { ...prev.questionsById, [tempId]: optimisticQuestion };
                    const nextOrder = { ...prev.questionOrderBySection };
                    nextOrder[optimisticQuestion.section] = sortQuestionIdsForSection(nextById, optimisticQuestion.section);
                    return { questionsById: nextById, questionOrderBySection: nextOrder };
                });

                // Create new question via server action
                const result = await createQuestion({
                    ...questionData,
                    paper_id: questionData.paper_id ?? paperState.id,
                });

                if (!result.success || !result.data) {
                    console.error('Failed to create question:', result.error);
                    setQuestionState((prev) => {
                        const remaining = { ...prev.questionsById };
                        delete remaining[tempId];
                        const nextOrder = { ...prev.questionOrderBySection };
                        Object.keys(nextOrder).forEach((sectionKey) => {
                            const section = sectionKey as SectionName;
                            nextOrder[section] = sortQuestionIdsForSection(remaining, section);
                        });
                        return { questionsById: remaining, questionOrderBySection: nextOrder };
                    });
                    showNotification('error', result.error || 'Failed to create', () => handleSaveQuestion(questionData));
                    return;
                }

                // Add to local state
                setQuestionState((prev) => {
                    const created = result.data!;
                    const remaining = { ...prev.questionsById };
                    delete remaining[tempId];
                    const nextById = { ...remaining, [created.id]: created };
                    const nextOrder = { ...prev.questionOrderBySection };
                    nextOrder[created.section] = sortQuestionIdsForSection(nextById, created.section);
                    return { questionsById: nextById, questionOrderBySection: nextOrder };
                });
                showNotification('success', 'Question created successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving question:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleSaveQuestion(questionData));
        }
    }, [paperState.id, questionsById, showNotification]);

    // Save context to database using server action
    const handleSaveContext = useCallback(async (contextData: Partial<QuestionContext>) => {
        const nowIso = new Date().toISOString();

        try {
            if (contextData.id) {
                const previousContext = contextsById[contextData.id] ?? null;
                if (previousContext) {
                    const optimisticContext = {
                        ...previousContext,
                        ...contextData,
                        updated_at: nowIso,
                    } as QuestionContext;

                    setContextsById((prev) => ({ ...prev, [optimisticContext.id]: optimisticContext }));
                }

                // Update existing context via server action
                const result = await updateContext(contextData.id, contextData);

                if (!result.success || !result.data) {
                    console.error('Failed to update context:', result.error);
                    if (previousContext) {
                        setContextsById((prev) => ({ ...prev, [previousContext.id]: previousContext }));
                    }
                    showNotification('error', result.error || 'Failed to save context', () => handleSaveContext(contextData));
                    return;
                }

                setContextsById((prev) => ({ ...prev, [result.data!.id]: result.data! }));
                showNotification('success', 'Context updated successfully!');
            } else {
                const tempId = `temp-${Date.now()}`;
                const displayOrder = Object.values(contextsById).filter(c => c.section === contextData.section).length;
                const optimisticContext: QuestionContext = {
                    id: tempId,
                    paper_id: contextData.paper_id ?? paperState.id,
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

                setContextsById((prev) => ({ ...prev, [tempId]: optimisticContext }));

                // Create new context via server action
                const result = await createContext(
                    { ...contextData, paper_id: contextData.paper_id ?? paperState.id },
                    displayOrder
                );

                if (!result.success || !result.data) {
                    console.error('Failed to create context:', result.error);
                    setContextsById((prev) => {
                        const remaining = { ...prev };
                        delete remaining[tempId];
                        return remaining;
                    });
                    showNotification('error', result.error || 'Failed to create context', () => handleSaveContext(contextData));
                    return;
                }

                setContextsById((prev) => {
                    const remaining = { ...prev };
                    delete remaining[tempId];
                    return { ...remaining, [result.data!.id]: result.data! };
                });
                showNotification('success', 'Context created successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving context:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleSaveContext(contextData));
        }
    }, [contextsById, paperState.id, showNotification]);

    const handleSaveQuestionSet = useCallback(async (setData: Partial<QuestionSet>) => {
        try {
            if (!setData.id) {
                showNotification('error', 'Missing question set id.');
                return;
            }

            const previousSet = questionSetsById[setData.id] ?? null;
            if (previousSet) {
                const optimisticSet = {
                    ...previousSet,
                    ...setData,
                    updated_at: new Date().toISOString(),
                } as QuestionSet;
                setQuestionSetsById((prev) => ({ ...prev, [optimisticSet.id]: optimisticSet }));
            }

            const result = await updateQuestionSet(setData.id, setData);

            if (!result.success || !result.data) {
                if (previousSet) {
                    setQuestionSetsById((prev) => ({ ...prev, [previousSet.id]: previousSet }));
                }
                showNotification('error', result.error || 'Failed to update question set');
                return;
            }

            setQuestionSetsById((prev) => ({ ...prev, [result.data!.id]: result.data! }));
            showNotification('success', 'Question set updated successfully!');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message);
        }
    }, [questionSetsById, showNotification]);

    const handleCreateQuestionSet = useCallback(async (setData: Partial<QuestionSet>) => {
        try {
            const result = await createQuestionSet(setData);
            if (!result.success || !result.data) {
                showNotification('error', result.error || 'Failed to create question set');
                return null;
            }
            setQuestionSetsById((prev) => ({ ...prev, [result.data!.id]: result.data! }));
            showNotification('success', 'Question set created successfully!');
            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message);
            return null;
        }
    }, [showNotification]);

    const handleDeleteContext = useCallback(async (contextId: string) => {
        try {
            const result = await deleteContext(contextId);
            if (!result.success) {
                showNotification('error', result.error || 'Failed to delete context');
                return;
            }
            setContextsById((prev) => {
                const remaining = { ...prev };
                delete remaining[contextId];
                return remaining;
            });
            showNotification('success', 'Context deleted successfully!');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message);
        }
    }, [showNotification]);

    // Update paper metadata using server action
    const handleUpdatePaper = useCallback(async (paperData: Partial<Paper>) => {
        try {
            const result = await updatePaper(paperState.id, paperData);

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
    }, [paperState.id, showNotification]);

    const handleUpdatePaperTitle = useCallback(async (title: string) => {
        const trimmed = title.trim();
        try {
            const result = await updatePaper(paperState.id, { title: trimmed });

            if (!result.success) {
                console.error('Failed to update paper title:', result.error);
                showNotification('error', result.error || 'Failed to update title', () => handleUpdatePaperTitle(title));
                return { success: false, error: result.error || 'Failed to update title' };
            }

            setPaperState(prev => ({ ...prev, title: trimmed }));
            showNotification('success', 'Paper title updated successfully!');
            return { success: true };
        } catch (err) {
            console.error('Unexpected error updating paper title:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleUpdatePaperTitle(title));
            return { success: false, error: message };
        }
    }, [paperState.id, showNotification]);

    const handleNavigate = useCallback((navigation: { section: SectionName; qid?: string | null; setId?: string | null; q: number }) => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const nextQ = String(navigation.q);
        const nextQid = navigation.qid ?? '';
        const nextSetId = navigation.setId ?? '';

        const isSame =
            params.get('section') === navigation.section &&
            (params.get('qid') ?? '') === nextQid &&
            (params.get('setId') ?? '') === nextSetId &&
            (params.get('q') ?? '') === nextQ;

        params.set('section', navigation.section);
        if (navigation.qid) {
            params.set('qid', navigation.qid);
        } else {
            params.delete('qid');
        }
        if (navigation.setId) {
            params.set('setId', navigation.setId);
        } else {
            params.delete('setId');
        }
        params.set('q', nextQ);

        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                section: navigation.section,
                qid: navigation.qid ?? undefined,
                setId: navigation.setId ?? undefined,
                q: navigation.q,
            })
        );

        if (!isSame) {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [pathname, router, STORAGE_KEY]);

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
                paper={paperState}
                questions={questions}
                questionSets={questionSets}
                contexts={contexts}
                onSaveQuestion={handleSaveQuestion}
                onSaveQuestionSet={handleSaveQuestionSet}
                onCreateQuestionSet={handleCreateQuestionSet}
                onSaveContext={handleSaveContext}
                onDeleteContext={handleDeleteContext}
                onUpdatePaperTitle={handleUpdatePaperTitle}
                initialNavigation={externalNavigation}
                onNavigate={handleNavigate}
            />
        </>
    );
}
