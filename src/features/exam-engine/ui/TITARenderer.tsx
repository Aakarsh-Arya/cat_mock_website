/**
 * @fileoverview TITA Question Renderer Component
 * @description Numeric input component for Type-In-The-Answer questions
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.4
 * @note TITA questions have NO negative marking
 */

'use client';

import { useCallback, useState, useEffect } from 'react';
import { useExamStore, selectResponse } from '@/features/exam-engine';
import type { Question } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface TITARendererProps {
    /** The question to render */
    question: Question;
    /** Optional CSS class name */
    className?: string;
    /** Read-only mode (for review) */
    readOnly?: boolean;
    /** Show correct answer (for results) */
    showCorrectAnswer?: boolean;
    /** Correct answer (only available in results) */
    correctAnswer?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TITARenderer({
    question,
    className = '',
    readOnly = false,
    showCorrectAnswer = false,
    correctAnswer,
}: TITARendererProps) {
    const response = useExamStore(selectResponse(question.id));
    const setAnswer = useExamStore((s) => s.setAnswer);

    // Local state for input (debounced save)
    const [localValue, setLocalValue] = useState(response?.answer ?? '');

    // Sync local state with store on mount and when response changes externally
    useEffect(() => {
        setLocalValue(response?.answer ?? '');
    }, [response?.answer]);

    // Determine if answer is correct (for results view)
    const isCorrect = showCorrectAnswer && localValue === correctAnswer;
    const isIncorrect = showCorrectAnswer && localValue && localValue !== correctAnswer;

    // Handle input change with immediate update
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            // Allow only valid numeric input (with optional negative and decimal)
            // CAT TITA typically allows integers, but some may need decimals
            if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                setLocalValue(value);

                // Save to store immediately for TITA
                if (!readOnly) {
                    setAnswer(question.id, value || null);
                }
            }
        },
        [question.id, readOnly, setAnswer]
    );

    // Handle blur - ensure value is saved
    const handleBlur = useCallback(() => {
        if (!readOnly) {
            setAnswer(question.id, localValue || null);
        }
    }, [question.id, localValue, readOnly, setAnswer]);

    // Get input styles based on state
    let inputStyles = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    if (isCorrect) {
        inputStyles = 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500';
    } else if (isIncorrect) {
        inputStyles = 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500';
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Question Text */}
            <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">{question.question_text}</p>
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
                <label
                    htmlFor={`tita-${question.id}`}
                    className="block text-sm font-medium text-gray-700"
                >
                    Your Answer
                </label>

                <div className="relative max-w-xs">
                    <input
                        type="text"
                        id={`tita-${question.id}`}
                        value={localValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={readOnly}
                        placeholder="Enter your answer"
                        className={`
              w-full px-4 py-3 text-lg font-mono rounded-lg border-2
              transition-colors
              ${inputStyles}
              ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
                        inputMode="decimal"
                        autoComplete="off"
                        aria-describedby={`tita-help-${question.id}`}
                    />

                    {/* Correct/Incorrect Icon */}
                    {showCorrectAnswer && localValue && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCorrect ? (
                                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </span>
                    )}
                </div>

                {/* Help Text */}
                <p id={`tita-help-${question.id}`} className="text-sm text-gray-500">
                    Enter a numeric value. Decimals are allowed if needed.
                </p>
            </div>

            {/* Show correct answer in results */}
            {showCorrectAnswer && correctAnswer && (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <span className="text-sm font-medium text-gray-600">Correct Answer: </span>
                    <span className="text-lg font-mono font-bold text-gray-800">{correctAnswer}</span>
                </div>
            )}

            {/* Marking Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                <span>+{question.positive_marks} for correct</span>
                <span className="text-green-600 font-medium">No negative marking</span>
            </div>
        </div>
    );
}

export default TITARenderer;
