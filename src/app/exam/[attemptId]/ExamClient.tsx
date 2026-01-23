/**
 * @fileoverview Exam Client Component
 * @description Client-side exam interface that integrates with the exam engine
 * @blueprint Milestone 4 SOP-SSOT - Integration
 */

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useExamStore,
    ExamLayout,
} from '@/features/exam-engine';
import {
    saveResponse,
    updateAttemptProgress,
    submitExam,
    pauseExam,
} from '@/features/exam-engine/lib/actions';
import { logger, examLogger } from '@/lib/logger';
import type { Paper, Question, Attempt, SectionName, TimeRemaining } from '@/types/exam';
import { getSectionByIndex } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamClientProps {
    paper: Paper;
    questions: Question[];
    attempt: Attempt;
}

// =============================================================================
// DEBOUNCE HELPER
// =============================================================================

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        }) as T,
        [delay]
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExamClient({ paper, questions, attempt }: ExamClientProps) {
    const router = useRouter();

    // Store actions
    const initializeExam = useExamStore((s) => s.initializeExam);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const attemptId = useExamStore((s) => s.attemptId);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const sectionTimers = useExamStore((s) => s.sectionTimers);
    const responses = useExamStore((s) => s.responses);
    const sessionToken = useExamStore((s) => s.sessionToken);
    const submissionIdRef = useRef<string>(
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    );

    const [sessionConflict, setSessionConflict] = useState<
        | { type: 'save'; payload: Parameters<typeof saveResponse>[0] }
        | { type: 'submit' }
        | null
    >(null);
    const [isResolvingConflict, setIsResolvingConflict] = useState(false);

    // Track if we've already attempted initialization
    const initAttemptedRef = useRef(false);

    // Initialize exam on mount - but only once per session
    // The initializeExam function now handles the case where state is already loaded
    useEffect(() => {
        // Always call initializeExam - it will internally check if state should be preserved
        // This handles both fresh starts and page refreshes correctly
        if (!initAttemptedRef.current) {
            initAttemptedRef.current = true;
            initializeExam({
                paper,
                questions,
                attempt,
            });
        }
    }, [paper, questions, attempt, initializeExam]);

    // Debounced save to server
    const debouncedSaveProgress = useDebouncedCallback(
        async (sectionTimers: Record<SectionName, { remainingSeconds: number }>) => {
            if (!attemptId) return;

            const timeRemaining: TimeRemaining = {
                VARC: sectionTimers.VARC.remainingSeconds,
                DILR: sectionTimers.DILR.remainingSeconds,
                QA: sectionTimers.QA.remainingSeconds,
            };

            const currentSection = getSectionByIndex(currentSectionIndex);

            await updateAttemptProgress({
                attemptId,
                timeRemaining,
                currentSection,
                currentQuestion: currentQuestionIndex + 1,
            });
        },
        5000 // Save every 5 seconds
    );

    // Auto-save progress periodically
    useEffect(() => {
        if (!attemptId || !hasHydrated) return;

        const interval = setInterval(() => {
            debouncedSaveProgress(sectionTimers);
        }, 5000);

        return () => clearInterval(interval);
    }, [attemptId, hasHydrated, sectionTimers, debouncedSaveProgress]);

    // Handle individual response save
    const handleSaveResponse = useCallback(async (
        questionId: string,
        answer: string | null
    ) => {
        if (!attemptId) return;

        const response = responses[questionId];
        if (!response) return;

        const result = await saveResponse({
            attemptId,
            questionId,
            answer,
            status: response.status,
            isMarkedForReview: response.isMarkedForReview,
            timeSpentSeconds: response.timeSpentSeconds,
            sessionToken,
        });
        if (!result.success && result.error === 'SESSION_CONFLICT') {
            setSessionConflict({
                type: 'save',
                payload: {
                    attemptId,
                    questionId,
                    answer,
                    status: response.status,
                    isMarkedForReview: response.isMarkedForReview,
                    timeSpentSeconds: response.timeSpentSeconds,
                    sessionToken,
                },
            });
        }
    }, [attemptId, responses, sessionToken]);

    // Handle section expiry
    const handleSectionExpire = useCallback(async (sectionName: SectionName) => {
        examLogger.sectionExpired(attemptId || '', sectionName);

        // Save all current responses for this section before transitioning
        if (!attemptId) return;

        // Find questions in this section and save their responses
        const sectionQuestions = questions.filter(q => q.section === sectionName);

        await Promise.all(
            sectionQuestions.map(async (q) => {
                const response = responses[q.id];
                if (response && (response.answer !== null || response.status !== 'not_visited')) {
                    const result = await saveResponse({
                        attemptId: attemptId!,
                        questionId: q.id,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                        sessionToken,
                    });
                    if (!result.success && result.error === 'SESSION_CONFLICT') {
                        setSessionConflict({
                            type: 'save',
                            payload: {
                                attemptId: attemptId!,
                                questionId: q.id,
                                answer: response.answer,
                                status: response.status,
                                isMarkedForReview: response.isMarkedForReview,
                                timeSpentSeconds: response.timeSpentSeconds,
                                sessionToken,
                            },
                        });
                    }
                }
            })
        );
    }, [attemptId, questions, responses, sessionToken]);

    // Handle exam submit
    const handleSubmitExam = useCallback(async () => {
        if (!attemptId) return;

        // Save all remaining responses
        await Promise.all(
            Object.entries(responses).map(async ([questionId, response]) => {
                if (response.answer !== null || response.status !== 'not_visited') {
                    const result = await saveResponse({
                        attemptId: attemptId!,
                        questionId,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                        sessionToken,
                    });
                    if (!result.success && result.error === 'SESSION_CONFLICT') {
                        setSessionConflict({
                            type: 'save',
                            payload: {
                                attemptId: attemptId!,
                                questionId,
                                answer: response.answer,
                                status: response.status,
                                isMarkedForReview: response.isMarkedForReview,
                                timeSpentSeconds: response.timeSpentSeconds,
                                sessionToken,
                            },
                        });
                    }
                }
            })
        );

        // Submit exam
        const result = await submitExam(attemptId, { sessionToken, submissionId: submissionIdRef.current });

        if (result.success) {
            // Clear local storage
            localStorage.removeItem(`cat-exam-state-${attemptId}`);

            // Redirect to results
            router.push(`/result/${attemptId}`);
        } else {
            if (result.error === 'SESSION_CONFLICT') {
                setSessionConflict({ type: 'submit' });
                return;
            }
            logger.error('Failed to submit exam', result.error, { attemptId });
            alert('Failed to submit exam. Please try again.');
        }
    }, [attemptId, responses, router, sessionToken]);

    const handleResolveConflict = useCallback(async (resumeHere: boolean) => {
        if (!sessionConflict) return;

        if (!resumeHere) {
            setSessionConflict(null);
            return;
        }

        setIsResolvingConflict(true);
        try {
            if (sessionConflict.type === 'save') {
                const retry = await saveResponse({
                    ...sessionConflict.payload,
                    force_resume: true,
                });
                if (!retry.success && retry.error !== 'SESSION_CONFLICT') {
                    logger.error('Force resume save failed', retry.error);
                }
            }

            if (sessionConflict.type === 'submit') {
                const retry = await submitExam(attemptId!, {
                    sessionToken,
                    force_resume: true,
                    submissionId: submissionIdRef.current,
                });
                if (retry.success) {
                    localStorage.removeItem(`cat-exam-state-${attemptId}`);
                    router.push(`/result/${attemptId}`);
                } else if (retry.error !== 'SESSION_CONFLICT') {
                    logger.error('Force resume submit failed', retry.error, { attemptId });
                    alert('Failed to submit exam. Please try again.');
                }
            }
        } finally {
            setIsResolvingConflict(false);
            setSessionConflict(null);
        }
    }, [sessionConflict, attemptId, sessionToken, router]);

    // Handle pause exam
    const handlePauseExam = useCallback(async () => {
        if (!attemptId) return;

        const confirmed = window.confirm(
            'Are you sure you want to pause the exam? You can resume it later from the dashboard.'
        );

        if (!confirmed) return;

        // Save all current responses
        await Promise.all(
            Object.entries(responses).map(async ([questionId, response]) => {
                if (response.answer !== null || response.status !== 'not_visited') {
                    await saveResponse({
                        attemptId: attemptId!,
                        questionId,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                    });
                }
            })
        );

        // Build time remaining from current section timers
        const timeRemaining: TimeRemaining = {
            VARC: sectionTimers.VARC.remainingSeconds,
            DILR: sectionTimers.DILR.remainingSeconds,
            QA: sectionTimers.QA.remainingSeconds,
        };

        const currentSection = getSectionByIndex(currentSectionIndex);

        // Pause the exam
        const result = await pauseExam({
            attemptId,
            timeRemaining,
            currentSection,
            currentQuestion: currentQuestionIndex + 1,
        });

        if (result.success) {
            // Clear local storage
            localStorage.removeItem(`cat-exam-state-${attemptId}`);

            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            examLogger.examPaused(attemptId, false, result.error);
            alert('Failed to pause exam. Please try again.');
        }
    }, [attemptId, responses, sectionTimers, currentSectionIndex, currentQuestionIndex, router, sessionToken]);

    // Show loading while initializing
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ExamLayout
                paper={paper}
                questions={questions}
                onSaveResponse={handleSaveResponse}
                onSubmitExam={handleSubmitExam}
                onSectionExpire={handleSectionExpire}
                onPauseExam={handlePauseExam}
            />

            {sessionConflict && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Active session detected
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            You have an active session on another device. Do you want to terminate it and resume here?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => handleResolveConflict(false)}
                                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                disabled={isResolvingConflict}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleResolveConflict(true)}
                                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                disabled={isResolvingConflict}
                            >
                                {isResolvingConflict ? 'Resuming...' : 'Resume Here'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ExamClient;
