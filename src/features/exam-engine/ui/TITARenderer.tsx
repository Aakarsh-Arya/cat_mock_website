/**
 * @fileoverview TITA Question Renderer Component
 * @description Numeric input component for Type-In-The-Answer questions
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.4
 * @note TITA questions have NO negative marking
 * 
 * PHASE 3 FIX: Fixed useEffect loop causing duplicate script execution
 */

'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useExamStore, selectResponse } from '@/features/exam-engine';
import { examDebug } from '@/lib/examDebug';
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
    /** Optional answer override for review mode */
    answerOverride?: string | null;
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
    answerOverride = null,
}: TITARendererProps) {
    const response = useExamStore(selectResponse(question.id));
    // FIX: Use setLocalAnswer to store answer locally without changing status
    // Status only changes when user clicks "Save and Next"
    const setLocalAnswer = useExamStore((s) => s.setLocalAnswer);

    // Local state for input (debounced save)
    const [localValue, setLocalValue] = useState(answerOverride ?? response?.answer ?? '');
    const [cursorIndex, setCursorIndex] = useState(() => (answerOverride ?? response?.answer ?? '').length);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // PHASE 3 FIX: Track if we're updating from store to prevent loops
    const isUpdatingFromStore = useRef(false);

    // PHASE 3 FIX: Sync local state with store on mount and when response changes externally
    // Only update if the value is different AND we're not in the middle of a local update
    useEffect(() => {
        const storeValue = response?.answer ?? '';
        const nextValue = answerOverride ?? storeValue;
        if (nextValue !== localValue && !isUpdatingFromStore.current) {
            isUpdatingFromStore.current = true;
            setLocalValue(nextValue);
            // Reset flag after state update
            requestAnimationFrame(() => {
                setCursorIndex(nextValue.length);
                isUpdatingFromStore.current = false;
            });
        }
    }, [response?.answer, answerOverride, localValue]);

    // Determine if answer is correct (for results view)
    const isCorrect = showCorrectAnswer && localValue === correctAnswer;
    const isIncorrect = showCorrectAnswer && localValue && localValue !== correctAnswer;

    // Commit value to local state + store (local only, no status change)
    const commitValue = useCallback((value: string, nextCursorIndex?: number) => {
        const oldValue = localValue;
        setLocalValue(value);
        const clampedCursor = Math.max(0, Math.min(value.length, nextCursorIndex ?? value.length));
        setCursorIndex(clampedCursor);
        if (!readOnly) {
            // Use setLocalAnswer - does NOT change status, palette stays same color
            setLocalAnswer(question.id, value || null);

            // PHASE 3: Debug logging for TITA input
            examDebug.titaInput({
                questionId: question.id,
                key: 'commit',
                oldValue,
                newValue: value,
            });
        }
    }, [question.id, readOnly, setLocalAnswer, localValue]);

    // Block physical keyboard input (TITA keypad-only)
    const blockPhysicalInput = useCallback((e: React.SyntheticEvent) => {
        e.preventDefault();
    }, []);

    // Apply keypad input with numeric validity rules
    const applyKeypadInput = useCallback((key: string) => {
        if (readOnly) return;

        const current = localValue;

        // PHASE 3: Debug logging for keypad input
        examDebug.titaInput({
            questionId: question.id,
            key,
            oldValue: current,
            newValue: '(pending)',
        });

        if (key === 'BACKSPACE') {
            if (cursorIndex <= 0) return;
            const nextValue = `${current.slice(0, cursorIndex - 1)}${current.slice(cursorIndex)}`;
            commitValue(nextValue, cursorIndex - 1);
            return;
        }

        if (key === 'CLEAR') {
            commitValue('', 0);
            return;
        }

        if (key === '-') {
            if (current.startsWith('-') || current.length > 0 || cursorIndex !== 0) return;
            commitValue('-', 1);
            return;
        }

        if (key === '.') {
            if (current.includes('.')) return;
            if (current === '') {
                commitValue('0.', 2);
            } else if (current === '-') {
                commitValue('-0.', 3);
            } else {
                const nextValue = `${current.slice(0, cursorIndex)}.${current.slice(cursorIndex)}`;
                commitValue(nextValue, cursorIndex + 1);
            }
            return;
        }

        if (/^[0-9]$/.test(key)) {
            const nextValue = `${current.slice(0, cursorIndex)}${key}${current.slice(cursorIndex)}`;
            commitValue(nextValue, cursorIndex + 1);
        }
    }, [commitValue, localValue, readOnly, cursorIndex]);

    const moveCursor = useCallback((direction: 'left' | 'right') => {
        if (readOnly) return;
        setCursorIndex((prev) => {
            const delta = direction === 'left' ? -1 : 1;
            return Math.max(0, Math.min(localValue.length, prev + delta));
        });
    }, [localValue.length, readOnly]);

    useEffect(() => {
        if (!inputRef.current) return;
        try {
            inputRef.current.setSelectionRange(cursorIndex, cursorIndex);
        } catch {
            // ignore selection errors in unsupported environments
        }
    }, [cursorIndex, localValue]);

    // Get input styles based on state
    let inputStyles = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    if (isCorrect) {
        inputStyles = 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500';
    } else if (isIncorrect) {
        inputStyles = 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500';
    }

    return (
        <div className={`space-y-6 ${className}`}>
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
                        ref={inputRef}
                        value={localValue}
                        readOnly
                        placeholder="Enter your answer"
                        className={`
                            w-full px-4 py-3 text-lg font-mono rounded-lg border-2
                            transition-colors
                            ${inputStyles}
                            ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                        `}
                        inputMode="decimal"
                        autoComplete="off"
                        aria-readonly={true}
                        aria-describedby={`tita-help-${question.id}`}
                        onKeyDown={blockPhysicalInput}
                        onKeyPress={blockPhysicalInput}
                        onBeforeInput={blockPhysicalInput}
                        onPaste={blockPhysicalInput}
                        onDrop={blockPhysicalInput}
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
                    Use the keypad below. Decimals are allowed if needed.
                </p>
            </div>

            {/* TITA Keypad (keypad-only input) */}
            <div
                className="w-[220px] rounded-md bg-[#f2f2f2] p-[5px]"
                role="group"
                aria-label="TITA keypad"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
                <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => applyKeypadInput('BACKSPACE')}
                    className="h-10 w-full rounded border border-[#bdbdbd] bg-gradient-to-b from-white to-[#eaeaea] text-sm font-bold font-sans text-gray-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D89EF]"
                    aria-label="Backspace"
                >
                    Backspace
                </button>

                <div className="mt-[5px] grid grid-cols-3 gap-[5px]">
                    {[
                        '7', '8', '9',
                        '4', '5', '6',
                        '1', '2', '3',
                        '0', '.', '-',
                    ].map((digit) => (
                        <button
                            key={digit}
                            type="button"
                            disabled={readOnly}
                            onClick={() => applyKeypadInput(digit)}
                            className="aspect-square w-full rounded border border-[#bdbdbd] bg-gradient-to-b from-white to-[#eaeaea] text-base font-bold font-sans text-gray-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D89EF]"
                            aria-label={digit === '.' ? 'Decimal point' : digit === '-' ? 'Minus sign' : `Digit ${digit}`}
                        >
                            {digit}
                        </button>
                    ))}
                </div>

                <div className="mt-[5px] grid grid-cols-2 gap-[5px]">
                    <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => moveCursor('left')}
                        className="h-10 rounded border border-[#bdbdbd] bg-gradient-to-b from-white to-[#eaeaea] text-base font-bold font-sans text-gray-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D89EF]"
                        aria-label="Move cursor left"
                    >
                        &larr;
                    </button>
                    <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => moveCursor('right')}
                        className="h-10 rounded border border-[#bdbdbd] bg-gradient-to-b from-white to-[#eaeaea] text-base font-bold font-sans text-gray-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D89EF]"
                        aria-label="Move cursor right"
                    >
                        &rarr;
                    </button>
                </div>

                <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => applyKeypadInput('CLEAR')}
                    className="mt-[5px] h-10 w-full rounded border border-[#bdbdbd] bg-gradient-to-b from-white to-[#eaeaea] text-sm font-bold font-sans text-gray-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D89EF]"
                    aria-label="Clear all"
                >
                    Clear All
                </button>
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
