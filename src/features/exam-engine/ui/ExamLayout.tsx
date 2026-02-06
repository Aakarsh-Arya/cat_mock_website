/**
 * @fileoverview TCS iON CAT Exam Layout Component
 * @description Pixel-perfect recreation of the CAT exam interface
 * @blueprint TCS iON CAT 2025 Interface Specification
 */

'use client';

import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useExamStore, useExamTimer, selectCurrentSection } from '@/features/exam-engine';
import { QuestionPalette } from './QuestionPalette';
import { ExamFooter } from './ExamFooter';
import { MCQRenderer } from './MCQRenderer';
import { TITARenderer } from './TITARenderer';
import { Calculator } from './Calculator';
import { MathText } from './MathText';
import type { Paper, Question, SectionName } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';

// =============================================================================
// CONSTANTS
// =============================================================================

const SECTIONS = ['VARC', 'DILR', 'QA'] as const;

// =============================================================================
// TYPES
// =============================================================================

interface ExamLayoutProps {
    paper: Paper;
    questions: Question[];
    onSaveResponse?: (questionId: string, answer: string | null) => void | Promise<void>;
    onSaveResponsesBatch?: (items: BatchSaveItem[]) => BatchSaveResult | Promise<BatchSaveResult>;
    onSubmitExam?: () => void | Promise<void>;
    onSectionExpire?: (sectionName: SectionName) => void | Promise<void>;
    onPauseExam?: () => void | Promise<void>;
    layoutMode?: 'current' | 'three-column';
    submissionProgress?: SubmissionProgress | null;
}

type BatchSaveItem = {
    questionId: string;
    answer: string | null;
    status: string;
    isMarkedForReview: boolean;
    isVisited: boolean;
    timeSpentSeconds: number;
    visitCount?: number;
};

type BatchSaveResult = { success: boolean; failedQuestionIds?: string[] } | void;

type SubmissionProgressStep = {
    label: string;
    status: 'pending' | 'active' | 'done';
};

type SubmissionProgress = {
    percent: number;
    activeLabel?: string;
    steps: SubmissionProgressStep[];
};

// =============================================================================
// TCS iON HEADER
// =============================================================================

interface ExamHeaderProps {
    paper: Paper;
    candidateName?: string;
    candidatePhotoUrl?: string;
    onSectionSelect: (section: SectionName) => void;
    onToggleCalculator: () => void;
    isCalculatorVisible: boolean;
    hasPendingSync: boolean;
    isSyncing: boolean;
    onSyncNow?: () => void;
    onPauseExam?: () => void | Promise<void>;
    allowPause: boolean;
    timeLeftDisplay: string;
}

function ExamHeader({
    paper,
    candidateName = 'Candidate',
    candidatePhotoUrl,
    onSectionSelect,
    onToggleCalculator,
    isCalculatorVisible,
    hasPendingSync,
    isSyncing,
    onSyncNow,
    onPauseExam,
    allowPause,
    timeLeftDisplay,
}: ExamHeaderProps) {
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);

    const initials = useMemo(
        () =>
            candidateName
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
        [candidateName]
    );

    return (
        <header className="h-16 flex items-center justify-between px-5 bg-gradient-to-r from-exam-header-from to-exam-header-to border-b-2 border-exam-header-border">
            {/* Left: Section Tabs (CAT sections are LOCKED; keep tabs for UI, disable navigation) */}
            <div className="flex items-center gap-1" role="tablist" aria-label="Exam sections">
                {SECTIONS.map((section, index) => {
                    const isActive = index === currentSectionIndex;
                    const displayName = section === 'DILR' ? 'LRDI' : section === 'QA' ? 'Quant' : section;

                    return (
                        <button
                            key={section}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`section-panel-${section}`}
                            disabled={!isActive}
                            className={`px-4 py-2 text-sm font-semibold rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b3d91] ${isActive
                                ? 'bg-[#2D89EF] text-white'
                                : 'bg-white/10 text-white/60 opacity-70 cursor-not-allowed'
                                }`}
                            onClick={() => {
                                // Prevent accidental calls into store navigation that is intentionally restricted
                                if (isActive) onSectionSelect(section);
                            }}
                        >
                            {displayName}
                        </button>
                    );
                })}
            </div>

            {/* Center: Exam Title */}
            <h1 className="text-lg font-semibold text-white">{paper.title}</h1>

            {/* Right: Profile + Timer */}
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/10">
                    {candidatePhotoUrl ? (
                        <img
                            src={candidatePhotoUrl}
                            alt=""
                            aria-hidden="true"
                            className="w-8 h-8 rounded-full object-cover border border-white/30"
                        />
                    ) : (
                        <div
                            className="w-8 h-8 rounded-full bg-[#2D89EF] flex items-center justify-center text-xs font-semibold text-white border border-white/30"
                            aria-hidden="true"
                        >
                            {initials}
                        </div>
                    )}
                    <span className="text-white text-sm">{candidateName}</span>
                </div>

                <div className="text-base font-bold text-timer font-mono">Time Left : {timeLeftDisplay}</div>

                <div className="flex items-center gap-2">
                    {onSyncNow && hasPendingSync && (
                        <button
                            type="button"
                            onClick={onSyncNow}
                            disabled={isSyncing}
                            className="px-2.5 py-1 rounded bg-white/10 text-white text-xs font-semibold hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSyncing ? 'Syncing...' : 'Sync'}
                        </button>
                    )}
                    {!hasPendingSync && isSyncing && <span className="text-xs text-white/80">Syncing...</span>}
                    {allowPause && onPauseExam && (
                        <button
                            type="button"
                            onClick={onPauseExam}
                            className="px-2.5 py-1 rounded bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
                        >
                            Pause
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onToggleCalculator}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${isCalculatorVisible ? 'bg-white text-[#0b3d91]' : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Calculator
                    </button>
                </div>
            </div>
        </header>
    );
}

// =============================================================================
// QUESTION METADATA BAR
// =============================================================================

interface QuestionMetadataBarProps {
    question: Question;
    questionNumber: number;
}

function QuestionMetadataBar({ question, questionNumber }: QuestionMetadataBarProps) {
    const marks =
        question.negative_marks > 0
            ? `+${question.positive_marks} / -${question.negative_marks}`
            : `+${question.positive_marks} / -0`;

    return (
        <div className="h-metadata-bar flex items-center justify-between px-5 bg-exam-bg-pane border-y border-exam-bg-border-light">
            <span className="text-[15px] font-semibold text-exam-text-primary">Question No. {questionNumber}</span>
            <span className="text-sm text-exam-text-secondary">
                Type : {question.question_type} | Marks : {marks}
            </span>
        </div>
    );
}

// =============================================================================
// QUESTION PANE
// =============================================================================

interface QuestionPaneProps {
    question: Question;
}

function QuestionPane({ question }: QuestionPaneProps) {
    return (
        <div className="w-full bg-exam-bg-white px-6 py-6">
            {question.question_image_url && (
                <div className="mb-5">
                    <img
                        src={question.question_image_url}
                        alt="Question diagram"
                        className="max-w-full max-h-64 w-auto h-auto object-contain rounded border border-gray-200"
                    />
                </div>
            )}

            <div className="text-[15px] leading-exam text-exam-text-body mb-5">
                <MathText text={question.question_text} />
            </div>

            {question.question_type === 'MCQ' ? <MCQRenderer question={question} /> : <TITARenderer question={question} />}
        </div>
    );
}

// =============================================================================
// CONTEXT PANE
// =============================================================================

interface ContextPaneProps {
    question: Question;
    sectionLabel: string;
}

function ContextPane({ question, sectionLabel }: ContextPaneProps) {
    const context = question.context;

    return (
        <div className="w-full h-full bg-exam-bg-white px-6 py-6 overflow-y-auto">
            <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                    {sectionLabel}
                </span>
            </div>

            {context ? (
                <div>
                    {context.title && <h3 className="text-[15px] font-semibold text-exam-header-from mb-3">{context.title}</h3>}
                    {context.image_url && (
                        <div className="mb-4">
                            <img
                                src={context.image_url}
                                alt="Context diagram"
                                className="max-w-full max-h-64 w-auto h-auto object-contain rounded border border-gray-200"
                            />
                        </div>
                    )}
                    <div className="text-[15px] leading-exam text-exam-text-body whitespace-pre-wrap mb-5">
                        <MathText text={context.content} />
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500">No passage for this question.</div>
            )}
        </div>
    );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

export function ExamLayout({
    paper,
    questions,
    onSaveResponse,
    onSaveResponsesBatch,
    onSubmitExam,
    onSectionExpire,
    onPauseExam,
    layoutMode = 'current',
    submissionProgress,
}: ExamLayoutProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const responses = useExamStore((s) => s.responses);

    const goToQuestion = useExamStore((s) => s.goToQuestion);
    const toggleMarkForReview = useExamStore((s) => s.toggleMarkForReview);
    const clearAnswer = useExamStore((s) => s.clearAnswer);
    const saveAnswer = useExamStore((s) => s.saveAnswer);
    const setResponseStatus = useExamStore((s) => s.setResponseStatus);
    const updateTimeSpent = useExamStore((s) => s.updateTimeSpent);

    const queuePendingSync = useExamStore((s) => s.queuePendingSync);
    const pendingSyncResponses = useExamStore((s) => s.pendingSyncResponses);
    const clearPendingSync = useExamStore((s) => s.clearPendingSync);
    const setLastSyncTimestamp = useExamStore((s) => s.setLastSyncTimestamp);

    const isInitialized = useExamStore((s) => s.isInitialized);
    const isSubmitting = useExamStore((s) => s.isSubmitting);

    // Persist sidebar visibility to localStorage (prevents “lost sidebar” after refresh)
    const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('exam-sidebar-visible');
            return saved !== null ? saved === 'true' : true;
        }
        return true;
    });
    const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('exam-sidebar-visible', String(isSidebarVisible));
        }
    }, [isSidebarVisible]);

    const hasPendingSync = useMemo(() => Object.keys(pendingSyncResponses).length > 0, [pendingSyncResponses]);

    const syncInFlight = useRef(false);
    const pendingSyncRef = useRef(pendingSyncResponses);

    // Keep ref in sync for unload handler / async flows
    useEffect(() => {
        pendingSyncRef.current = pendingSyncResponses;
    }, [pendingSyncResponses]);

    const runWithTimeout = useCallback(
        async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error(`${label} timed out after ${ms}ms`));
                }, ms);
            });

            try {
                return await Promise.race([promise, timeoutPromise]);
            } finally {
                if (timeoutId) clearTimeout(timeoutId);
            }
        },
        []
    );

    // Sync Logic
    const syncPendingResponses = useCallback(async () => {
        if (!onSaveResponse && !onSaveResponsesBatch) return;
        if (syncInFlight.current) return;

        const entries = Object.entries(pendingSyncRef.current);
        if (entries.length === 0) return;

        const batchItems = onSaveResponsesBatch
            ? (entries
                .map(([questionId, payload]) => {
                    const response = responses[questionId];
                    if (!response) return null;
                    const answer = payload?.answer === '' ? null : (payload?.answer ?? null);
                    return {
                        questionId,
                        answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        isVisited: response.status !== 'not_visited',
                        timeSpentSeconds: response.timeSpentSeconds,
                        visitCount: response.visitCount,
                    };
                })
                .filter(Boolean) as BatchSaveItem[])
            : null;

        if (onSaveResponsesBatch && (!batchItems || batchItems.length === 0)) return;

        syncInFlight.current = true;
        setIsSyncing(true);

        const succeeded: string[] = [];
        try {
            if (onSaveResponsesBatch && batchItems) {
                try {
                    const result = await onSaveResponsesBatch(batchItems);
                    let failedIds: Set<string> | null = null;
                    if (result && typeof result === 'object' && 'success' in result && result.success === false) {
                        const ids = Array.isArray(result.failedQuestionIds) ? result.failedQuestionIds : [];
                        failedIds = new Set(ids.length > 0 ? ids : batchItems.map((item) => item.questionId));
                    }

                    for (const item of batchItems) {
                        if (!failedIds || !failedIds.has(item.questionId)) {
                            succeeded.push(item.questionId);
                        }
                    }
                } catch {
                    // keep all pending; next sync attempt will retry
                }
            } else if (onSaveResponse) {
                for (const [questionId, payload] of entries) {
                    // Normalize empty-string to null (backend usually expects null for "no answer")
                    const answer = payload?.answer === '' ? null : (payload?.answer ?? null);

                    try {
                        await onSaveResponse(questionId, answer);
                        succeeded.push(questionId);
                    } catch {
                        // keep it pending; next sync attempt will retry
                    }
                }
            }

            if (succeeded.length > 0) {
                clearPendingSync(succeeded);
                setLastSyncTimestamp(Date.now());
            }
        } finally {
            syncInFlight.current = false;
            setIsSyncing(false);
        }
    }, [onSaveResponse, onSaveResponsesBatch, responses, clearPendingSync, setLastSyncTimestamp]);

    // Ref to coordinate auto-submit vs manual submit
    const autoSubmitInProgressRef = useRef(false);
    // Track sync-in-progress for submit coordination
    const submitSyncCompletedRef = useRef(false);
    // CRITICAL: Track if auto-submit has COMPLETED successfully - prevents re-entry forever
    const autoSubmitCompletedRef = useRef(false);

    const handleAutoSubmitExam = useCallback(async () => {
        // CRITICAL: If auto-submit has already completed, never process again
        if (autoSubmitCompletedRef.current) {
            console.log('[ExamLayout] Auto-submit skipped: already completed');
            return;
        }

        // RACE CONDITION FIX: Only block if MANUAL submit is in progress
        // DO NOT check isAutoSubmittingFromStore here - that flag is set by the timer
        // BEFORE calling this function, so checking it would block the auto-submit itself!
        if (isSubmitting) {
            console.log('[ExamLayout] Auto-submit skipped: manual submit in progress');
            return;
        }

        // Prevent duplicate auto-submit calls via ref (synchronous check)
        if (autoSubmitInProgressRef.current) {
            console.log('[ExamLayout] Auto-submit skipped: already in progress (ref)');
            return;
        }
        autoSubmitInProgressRef.current = true;
        console.log('[ExamLayout] Auto-submit STARTING');

        try {
            // Only sync if not already synced by another submit path
            if (!submitSyncCompletedRef.current && !syncInFlight.current) {
                try {
                    await runWithTimeout(syncPendingResponses(), 8000, 'syncPendingResponses');
                    submitSyncCompletedRef.current = true;
                } catch {
                    // best-effort; still submit
                }
            }
        } catch {
            // best-effort
        }
        try {
            await runWithTimeout(onSubmitExam?.() ?? Promise.resolve(), 20000, 'onSubmitExam');
            // Mark as completed ONLY after successful submission
            autoSubmitCompletedRef.current = true;
            console.log('[ExamLayout] Auto-submit COMPLETED SUCCESSFULLY');
        } finally {
            autoSubmitInProgressRef.current = false;
            submitSyncCompletedRef.current = false;
            console.log('[ExamLayout] Auto-submit FINISHED');
        }
    }, [syncPendingResponses, onSubmitExam, isSubmitting, runWithTimeout]);

    const handleSectionExpire = useCallback(
        async (sectionName: SectionName) => {
            try {
                await runWithTimeout(syncPendingResponses(), 8000, 'syncPendingResponses');
            } catch {
                // best-effort
            }
            try {
                await runWithTimeout(
                    onSectionExpire?.(sectionName) ?? Promise.resolve(),
                    8000,
                    'onSectionExpire'
                );
            } catch {
                // best-effort
            }
        },
        [syncPendingResponses, onSectionExpire, runWithTimeout]
    );

    // IMPORTANT: only call useExamTimer ONCE in this layout to avoid duplicate intervals/expiry triggers.
    const { isAutoSubmitting, timerData } = useExamTimer({
        onSectionExpire: handleSectionExpire,
        onExamComplete: handleAutoSubmitExam,
    });

    const handleManualSubmitExam = useCallback(async () => {
        // Also check the autoSubmitInProgressRef for extra safety
        if (isSyncing || isSubmitting || isAutoSubmitting || autoSubmitInProgressRef.current) {
            console.log('[ExamLayout] Manual submit blocked', { isSyncing, isSubmitting, isAutoSubmitting, autoSubmitInProgress: autoSubmitInProgressRef.current });
            return;
        }

        const confirmed = window.confirm('Are you sure you want to submit the exam? This action cannot be undone.');
        if (!confirmed) return;

        try {
            // Only sync if not already synced
            if (!submitSyncCompletedRef.current && !syncInFlight.current) {
                await runWithTimeout(syncPendingResponses(), 8000, 'syncPendingResponses');
                submitSyncCompletedRef.current = true;
            }
        } catch {
            // best-effort; still submit
        }
        try {
            await runWithTimeout(onSubmitExam?.() ?? Promise.resolve(), 20000, 'onSubmitExam');
        } finally {
            submitSyncCompletedRef.current = false;
        }
    }, [isSyncing, isSubmitting, isAutoSubmitting, syncPendingResponses, onSubmitExam, runWithTimeout]);

    const sectionQuestions = useMemo(() => getQuestionsForSection(questions, currentSection), [questions, currentSection]);
    const currentQuestion = sectionQuestions[currentQuestionIndex];

    // Track per-question time spent while the exam is active
    useEffect(() => {
        if (!isInitialized || isSubmitting || isAutoSubmitting) return;
        if (!currentQuestion?.id) return;

        let lastTick = Date.now();
        const interval = setInterval(() => {
            const now = Date.now();
            if (document.hidden) {
                lastTick = now;
                return;
            }
            const deltaSeconds = Math.floor((now - lastTick) / 1000);
            if (deltaSeconds > 0) {
                updateTimeSpent(currentQuestion.id, deltaSeconds);
                lastTick = now;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentQuestion?.id, isInitialized, isSubmitting, isAutoSubmitting, updateTimeSpent]);

    // Tabs are disabled, but keep handler in case you later allow same-section jumps.
    const handleSectionSelect = useCallback(
        (section: SectionName) => {
            const sectionIndex = SECTIONS.indexOf(section);
            const sectionQs = getQuestionsForSection(questions, section);
            const firstQuestion = sectionQs[0];

            if (firstQuestion) {
                goToQuestion(firstQuestion.id, sectionIndex, 0);
            }
        },
        [questions, goToQuestion]
    );

    const handleSaveNext = useCallback(() => {
        if (!currentQuestion) return;
        if (isSyncing || isSubmitting || isAutoSubmitting) return;

        const response = responses[currentQuestion.id];

        if (response) {
            const hasAnswer = response.answer !== null && response.answer !== undefined && response.answer !== '';
            const answer = hasAnswer ? response.answer : null;

            if (hasAnswer) {
                saveAnswer(currentQuestion.id, response.answer);
            } else {
                setResponseStatus(currentQuestion.id, 'visited', false);
            }

            // Always queue the latest answer on Save & Next (prevents “saved locally but never synced”)
            queuePendingSync(currentQuestion.id, answer);
        }

        if (currentQuestionIndex < sectionQuestions.length - 1) {
            const nextQ = sectionQuestions[currentQuestionIndex + 1];
            goToQuestion(nextQ.id, currentSectionIndex, currentQuestionIndex + 1);
        }
    }, [
        currentQuestion,
        responses,
        saveAnswer,
        setResponseStatus,
        queuePendingSync,
        currentQuestionIndex,
        sectionQuestions,
        goToQuestion,
        currentSectionIndex,
        isSyncing,
        isSubmitting,
        isAutoSubmitting,
    ]);

    const handleClearResponse = useCallback(() => {
        if (!currentQuestion) return;
        if (isSyncing || isSubmitting || isAutoSubmitting) return;
        clearAnswer(currentQuestion.id);
        // clearAnswer action already queues pending sync in the store
    }, [currentQuestion, clearAnswer, isSyncing, isSubmitting, isAutoSubmitting]);

    const handleMarkForReview = useCallback(() => {
        if (!currentQuestion) return;
        if (isSyncing || isSubmitting || isAutoSubmitting) return;

        const response = responses[currentQuestion.id];
        const hasLocalAnswer = response?.answer !== null && response?.answer !== '' && response?.answer !== undefined;

        if (hasLocalAnswer) {
            toggleMarkForReview(currentQuestion.id);
            saveAnswer(currentQuestion.id, response!.answer);
            queuePendingSync(currentQuestion.id, response!.answer ?? null);
        } else {
            toggleMarkForReview(currentQuestion.id);
            setResponseStatus(currentQuestion.id, 'marked', true);
            queuePendingSync(currentQuestion.id, null);
        }

        if (currentQuestionIndex < sectionQuestions.length - 1) {
            const nextQ = sectionQuestions[currentQuestionIndex + 1];
            goToQuestion(nextQ.id, currentSectionIndex, currentQuestionIndex + 1);
        }
    }, [
        currentQuestion,
        responses,
        toggleMarkForReview,
        saveAnswer,
        setResponseStatus,
        queuePendingSync,
        currentQuestionIndex,
        sectionQuestions,
        goToQuestion,
        currentSectionIndex,
        isSyncing,
        isSubmitting,
        isAutoSubmitting,
    ]);

    // Try to sync before unload if anything is pending (best-effort)
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (Object.keys(pendingSyncRef.current).length === 0) return;
            void syncPendingResponses();
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [syncPendingResponses]);

    // Calculator hotkey: Ctrl+Shift+C
    // Sidebar toggle hotkey: Ctrl+B
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
                event.preventDefault();
                setIsCalculatorVisible((prev) => !prev);
            }
            if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'b') {
                event.preventDefault();
                setIsSidebarVisible((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Loading State
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-section-varc mx-auto mb-4" />
                    <p className="text-exam-text-muted">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Submitting State
    if (isSubmitting || isAutoSubmitting) {
        const title = isAutoSubmitting ? 'Time is up - submitting your attempt' : 'Submitting your attempt';
        const subtitle = isAutoSubmitting
            ? 'Locking your answers and finalizing your score.'
            : 'Locking answers, validating session, and building analytics.';
        const progressPercent = submissionProgress?.percent ?? 66;
        const progressSteps = submissionProgress?.steps ?? [
            { label: 'Validating session', status: 'active' as const },
            { label: 'Saving responses', status: 'pending' as const },
            { label: 'Submitting exam', status: 'pending' as const },
            { label: 'Preparing analysis', status: 'pending' as const },
        ];
        const activeLabel = submissionProgress?.activeLabel ?? 'Preparing analysis';

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white">
                <div className="relative w-full max-w-xl px-6">
                    <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_55%)] blur-2xl" />
                    <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-8 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                                <div className="absolute inset-1 rounded-xl border border-white/20 animate-pulse" />
                                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">{title}</p>
                                <p className="text-sm text-white/70">{subtitle}</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-white/60">
                                {progressSteps.map((step) => (
                                    <span
                                        key={step.label}
                                        className={step.status === 'active' ? 'text-white' : step.status === 'done' ? 'text-emerald-200' : ''}
                                    >
                                        {step.label}
                                    </span>
                                ))}
                            </div>
                            <div className="text-xs text-white/70">Current step: {activeLabel}</div>
                            <p className="text-xs text-white/50">
                                Please keep this tab open. This usually takes a few seconds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <p className="text-exam-text-muted">No questions found for this section.</p>
                </div>
            </div>
        );
    }

    const isLastSection = currentSectionIndex === 2;

    const hasContext = Boolean(
        currentQuestion.context &&
        (currentQuestion.context.title || currentQuestion.context.content || currentQuestion.context.image_url)
    );

    const sectionLabel = currentSection === 'DILR' ? 'LRDI' : currentSection === 'QA' ? 'Quant' : currentSection;

    const getGridCols = () => {
        if (layoutMode === 'three-column') {
            if (isSidebarVisible) return 'grid-cols-[48%_33%_19%]';
            return hasContext ? 'grid-cols-[48%_52%]' : 'grid-cols-1';
        }
        if (!hasContext) {
            return isSidebarVisible ? 'grid-cols-[81%_19%]' : 'grid-cols-1';
        }
        return isSidebarVisible ? 'grid-cols-[48%_33%_19%]' : 'grid-cols-[48%_52%]';
    };

    const questionPaneColSpan = layoutMode === 'three-column' && !hasContext && isSidebarVisible ? 'col-span-2' : '';

    return (
        <div className="relative h-screen w-screen overflow-hidden flex flex-col min-h-0 min-w-0 font-exam text-sm leading-normal bg-exam-bg-page">
            <ExamHeader
                paper={paper}
                onSectionSelect={handleSectionSelect}
                onToggleCalculator={() => setIsCalculatorVisible((prev) => !prev)}
                isCalculatorVisible={isCalculatorVisible}
                hasPendingSync={hasPendingSync}
                isSyncing={isSyncing}
                onSyncNow={onSaveResponse || onSaveResponsesBatch ? () => void syncPendingResponses() : undefined}
                onPauseExam={onPauseExam}
                allowPause={paper.allow_pause !== false}
                timeLeftDisplay={timerData?.displayTime ?? '00:00:00'}
            />

            {!isSidebarVisible && (
                <button
                    type="button"
                    onClick={() => setIsSidebarVisible(true)}
                    className="absolute z-30 top-24 right-2 px-3 py-2 rounded-full bg-slate-900 text-white text-xs shadow-lg hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D89EF]"
                    aria-label="Open navigation"
                >
                    Open Navigation
                </button>
            )}

            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className={`flex-1 grid overflow-hidden min-h-0 min-w-0 ${getGridCols()}`}>
                    {hasContext && (
                        <div className="border-r border-exam-bg-border-light min-h-0">
                            <ContextPane question={currentQuestion} sectionLabel={sectionLabel} />
                        </div>
                    )}

                    <div className={`relative flex flex-col bg-exam-bg-white min-h-0 min-w-0 ${questionPaneColSpan}`}>
                        <QuestionMetadataBar question={currentQuestion} questionNumber={currentQuestionIndex + 1} />

                        <div className="flex-1 overflow-y-auto min-h-0">
                            <QuestionPane question={currentQuestion} />
                        </div>

                        {/* Sidebar toggle kept INSIDE pane (no negative right), so it never gets clipped by overflow-hidden parents */}
                        <button
                            type="button"
                            onClick={() => setIsSidebarVisible((prev) => !prev)}
                            className="absolute z-20 top-1/2 right-0 -translate-y-1/2 w-6 h-12 rounded-r bg-slate-200 border border-slate-300 shadow-sm flex items-center justify-center text-xs text-slate-600 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D89EF]"
                            aria-label={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
                        >
                            {isSidebarVisible ? '›' : '‹'}
                        </button>
                    </div>

                    {isSidebarVisible && (
                        <aside className="border-l border-exam-bg-border-light flex flex-col bg-slate-50 overflow-y-auto min-h-0 min-w-0">
                            <QuestionPalette
                                questions={questions}
                                className="h-full rounded-none shadow-none border-0 bg-transparent sticky top-0"
                            />
                        </aside>
                    )}
                </div>

                <ExamFooter
                    onSaveNext={handleSaveNext}
                    onClear={handleClearResponse}
                    onMarkReview={handleMarkForReview}
                    onSubmit={handleManualSubmitExam}
                    isLastSection={isLastSection}
                    isSaving={isSyncing}
                    isSubmitting={isSubmitting}
                    isAutoSubmitting={isAutoSubmitting}
                    isSidebarVisible={isSidebarVisible}
                />
            </div>

            <Calculator isVisible={isCalculatorVisible} onClose={() => setIsCalculatorVisible(false)} />
        </div>
    );
}
