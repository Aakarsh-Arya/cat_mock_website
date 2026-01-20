/**
 * @fileoverview Exam Client Component
 * @description Client-side exam interface that integrates with the exam engine
 * @blueprint Milestone 4 SOP-SSOT - Integration
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    useExamStore,
    ExamLayout,
} from '@/features/exam-engine';
import {
    saveResponse,
    updateAttemptProgress,
    submitExam,
} from '@/features/exam-engine/lib/actions';
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

    // Initialize exam on mount
    useEffect(() => {
        if (!hasHydrated || attemptId !== attempt.id) {
            initializeExam({
                paper,
                questions,
                attempt,
            });
        }
    }, [paper, questions, attempt, initializeExam, hasHydrated, attemptId]);

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

        await saveResponse({
            attemptId,
            questionId,
            answer,
            status: response.status,
            isMarkedForReview: response.isMarkedForReview,
            timeSpentSeconds: response.timeSpentSeconds,
        });
    }, [attemptId, responses]);

    // Handle section expiry
    const handleSectionExpire = useCallback(async (sectionName: SectionName) => {
        console.log(`Section ${sectionName} expired`);

        // Save all current responses for this section before transitioning
        if (!attemptId) return;

        // Find questions in this section and save their responses
        const sectionQuestions = questions.filter(q => q.section === sectionName);

        await Promise.all(
            sectionQuestions.map(async (q) => {
                const response = responses[q.id];
                if (response && (response.answer !== null || response.status !== 'not_visited')) {
                    await saveResponse({
                        attemptId: attemptId!,
                        questionId: q.id,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                    });
                }
            })
        );
    }, [attemptId, questions, responses]);

    // Handle exam submit
    const handleSubmitExam = useCallback(async () => {
        if (!attemptId) return;

        // Save all remaining responses
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

        // Submit exam
        const result = await submitExam(attemptId);

        if (result.success) {
            // Clear local storage
            localStorage.removeItem(`cat-exam-state-${attemptId}`);

            // Redirect to results
            router.push(`/result/${attemptId}`);
        } else {
            console.error('Failed to submit exam:', result.error);
            alert('Failed to submit exam. Please try again.');
        }
    }, [attemptId, responses, router]);

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
        <ExamLayout
            paper={paper}
            questions={questions}
            onSaveResponse={handleSaveResponse}
            onSubmitExam={handleSubmitExam}
            onSectionExpire={handleSectionExpire}
        />
    );
}

export default ExamClient;
