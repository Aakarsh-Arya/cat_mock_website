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
    const textColor = isCorrect
        ? 'text-green-700'
        : isIncorrect && isSelected
            ? 'text-red-700'
            : 'text-gray-800';

    return (
        <label
            htmlFor={inputId}
            className={`flex items-start gap-3 py-2 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'} rounded-md`}
        >
            <input
                id={inputId}
                type="radio"
                name={name}
                value={value}
                checked={isSelected}
                onChange={() => !readOnly && onChange(value)}
                disabled={readOnly}
                aria-describedby={textId}
                className="mt-1 h-4 w-4 accent-blue-600"
            />
            <span id={textId} className={`flex-1 text-left ${textColor}`}>
                <MathText text={text} />
            </span>
            {isCorrect && <span className="text-xs font-semibold text-green-600">Correct</span>}
            {isIncorrect && isSelected && <span className="text-xs font-semibold text-red-600">Incorrect</span>}
        </label>
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
