/**
 * @fileoverview MCQ Question Renderer Component
 * @description Radio button component for MCQ questions with 4 options
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.3
 */

'use client';

import { useCallback } from 'react';
import { useExamStore, selectResponse } from '@/features/exam-engine';
import type { Question } from '@/types/exam';
import { MathText } from './MathText';

// =============================================================================
// TYPES
// =============================================================================

interface MCQRendererProps {
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
    /** Optional answer override for review mode */
    answerOverride?: string | null;
}

interface OptionProps {
    label: string;
    value: string;
    text: string;
    isSelected: boolean;
    isCorrect?: boolean;
    isIncorrect?: boolean;
    readOnly: boolean;
    name: string;
    inputId: string;
    textId: string;
    onChange: (value: string) => void;
}

// =============================================================================
// OPTION LABELS
// =============================================================================

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// =============================================================================
// SINGLE OPTION COMPONENT
// =============================================================================

function MCQOption({
    label,
    value,
    text,
    isSelected,
    isCorrect,
    isIncorrect,
    readOnly,
    name,
    inputId,
    textId,
    onChange,
}: OptionProps) {
    // Determine styling based on state
    let borderColor = 'border-gray-200';
    let bgColor = 'bg-white';
    let textColor = 'text-gray-800';
    let labelBg = 'bg-gray-100';
    let labelText = 'text-gray-600';

    if (isSelected && !isCorrect && !isIncorrect) {
        borderColor = 'border-blue-500';
        bgColor = 'bg-blue-50';
        labelBg = 'bg-blue-500';
        labelText = 'text-white';
    }

    if (isCorrect) {
        borderColor = 'border-green-500';
        bgColor = 'bg-green-50';
        labelBg = 'bg-green-500';
        labelText = 'text-white';
    }

    if (isIncorrect && isSelected) {
        borderColor = 'border-red-500';
        bgColor = 'bg-red-50';
        labelBg = 'bg-red-500';
        labelText = 'text-white';
    }

    return (
        <div>
            <input
                id={inputId}
                type="radio"
                name={name}
                value={value}
                checked={isSelected}
                onChange={() => !readOnly && onChange(value)}
                disabled={readOnly}
                aria-describedby={textId}
                className="sr-only peer"
            />
            <label
                htmlFor={inputId}
                className={`
        w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all
        ${borderColor} ${bgColor}
        ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-blue-300 hover:bg-gray-50'}
        peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2
      `}
            >
                {/* Option Label (A, B, C, D) */}
                <span
                    className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          text-sm font-bold transition-colors
          ${labelBg} ${labelText}
        `}
                >
                    {label}
                </span>

                {/* Option Text */}
                <span id={textId} className={`flex-1 text-left ${textColor}`}>
                    <MathText text={text} />
                </span>

                {/* Selected/Correct Indicator */}
                {isSelected && !isCorrect && !isIncorrect && (
                    <span className="flex-shrink-0 text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                )}
                {isCorrect && (
                    <span className="flex-shrink-0 text-green-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                )}
                {isIncorrect && isSelected && (
                    <span className="flex-shrink-0 text-red-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                )}
            </label>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MCQRenderer({
    question,
    className = '',
    readOnly = false,
    showCorrectAnswer = false,
    correctAnswer,
    answerOverride = null,
}: MCQRendererProps) {
    const response = useExamStore(selectResponse(question.id));
    // FIX: Use setLocalAnswer to store answer locally without changing status
    // Status only changes when user clicks "Save and Next"
    const setLocalAnswer = useExamStore((s) => s.setLocalAnswer);

    const selectedAnswer = answerOverride ?? response?.answer ?? null;

    // Handle option selection - stores locally, does NOT turn palette green
    const handleChange = useCallback(
        (value: string) => {
            if (!readOnly) {
                setLocalAnswer(question.id, value);
            }
        },
        [question.id, readOnly, setLocalAnswer]
    );

    // Parse options from the question
    const options = question.options ?? [];

    return (
        <div className={`space-y-4 ${className}`}>
            <fieldset className="space-y-3">
                <legend className="sr-only">Multiple choice options</legend>
                {options.map((optionText, index) => {
                    const label = OPTION_LABELS[index] ?? String(index + 1);
                    const isSelected = selectedAnswer === label;
                    const isCorrect = showCorrectAnswer && correctAnswer === label;
                    const isIncorrect = showCorrectAnswer && isSelected && correctAnswer !== label;
                    const name = `mcq-${question.id}`;
                    const inputId = `mcq-${question.id}-${label}`;
                    const textId = `mcq-${question.id}-${label}-text`;

                    return (
                        <MCQOption
                            key={`${question.id}-${index}`}
                            label={label}
                            value={label}
                            text={optionText}
                            isSelected={isSelected}
                            isCorrect={isCorrect}
                            isIncorrect={isIncorrect}
                            readOnly={readOnly}
                            name={name}
                            inputId={inputId}
                            textId={textId}
                            onChange={handleChange}
                        />
                    );
                })}
            </fieldset>

            {/* Marking Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                <span>+{question.positive_marks} for correct</span>
                <span>-{question.negative_marks} for incorrect</span>
            </div>
        </div>
    );
}
