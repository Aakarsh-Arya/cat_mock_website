/**
 * @fileoverview TCS iON CAT Digital Calculator (BODMAS)
 * @description UI + logic aligned to CAT exam calculator specification
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

type CalcToken = string;

interface CalculatorProps {
    isVisible: boolean;
    onClose: () => void;
    initialPosition?: { x: number; y: number };
}

type CalculatorState = {
    expressionTokens: CalcToken[];
    currentInput: string;
    currentDisplay: string | null;
    lastExpression: string;
    isResultDisplayed: boolean;
    memoryValue: number | null;
    error: string | null;
};

const initialState: CalculatorState = {
    expressionTokens: [],
    currentInput: '',
    currentDisplay: null,
    lastExpression: '',
    isResultDisplayed: false,
    memoryValue: null,
    error: null,
};

const operatorPrecedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
};

const isOperator = (token: string) => token in operatorPrecedence;

const formatNumber = (value: number) => {
    if (!Number.isFinite(value)) return 'Error';
    const text = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(12)));
    return text;
};

const toRPN = (tokens: string[]) => {
    const output: string[] = [];
    const ops: string[] = [];

    tokens.forEach((token) => {
        if (isOperator(token)) {
            while (ops.length > 0) {
                const top = ops[ops.length - 1];
                if (isOperator(top) && operatorPrecedence[top] >= operatorPrecedence[token]) {
                    output.push(ops.pop()!);
                } else {
                    break;
                }
            }
            ops.push(token);
        } else {
            output.push(token);
        }
    });

    while (ops.length > 0) {
        output.push(ops.pop()!);
    }

    return output;
};

const evalRPN = (tokens: string[]) => {
    const stack: number[] = [];

    for (const token of tokens) {
        if (isOperator(token)) {
            const b = stack.pop();
            const a = stack.pop();
            if (a === undefined || b === undefined) return { error: 'Invalid Input' as const };
            if (token === '/' && b === 0) return { error: 'Cannot divide by zero' as const };
            switch (token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    stack.push(a / b);
                    break;
                default:
                    return { error: 'Invalid Input' as const };
            }
        } else {
            const value = Number(token);
            if (Number.isNaN(value)) return { error: 'Invalid Input' as const };
            stack.push(value);
        }
    }

    if (stack.length !== 1) return { error: 'Invalid Input' as const };
    return { value: stack[0] } as const;
};

export function Calculator({ isVisible, onClose, initialPosition }: CalculatorProps) {
    const [state, setState] = useState<CalculatorState>(initialState);
    const [position, setPosition] = useState<{ x: number; y: number }>(
        initialPosition ?? { x: 24, y: 120 }
    );
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        if (initialPosition) return;
        const width = 245;
        const height = 330;
        const margin = 16;
        const nextX = Math.max(margin, window.innerWidth - width - margin);
        const nextY = Math.max(margin, window.innerHeight - height - margin);
        setPosition({ x: nextX, y: nextY });
    }, [initialPosition]);

    useEffect(() => {
        if (!isDragging) return;

        const width = 245;
        const height = 330;
        const margin = 8;

        const handleMouseMove = (event: MouseEvent) => {
            const nextX = event.clientX - dragOffset.current.x;
            const nextY = event.clientY - dragOffset.current.y;
            const maxX = Math.max(margin, window.innerWidth - width - margin);
            const maxY = Math.max(margin, window.innerHeight - height - margin);

            setPosition({
                x: Math.min(Math.max(nextX, margin), maxX),
                y: Math.min(Math.max(nextY, margin), maxY),
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        const handleResize = () => {
            const width = 245;
            const height = 330;
            const margin = 8;
            const maxX = Math.max(margin, window.innerWidth - width - margin);
            const maxY = Math.max(margin, window.innerHeight - height - margin);
            setPosition((prev) => ({
                x: Math.min(Math.max(prev.x, margin), maxX),
                y: Math.min(Math.max(prev.y, margin), maxY),
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const expressionLine = useMemo(() => {
        if (state.isResultDisplayed && state.lastExpression) return state.lastExpression;
        const parts = [...state.expressionTokens];
        const current = state.currentDisplay ?? state.currentInput;
        if (current) parts.push(current);
        return parts.join(' ');
    }, [state.expressionTokens, state.currentDisplay, state.currentInput, state.isResultDisplayed, state.lastExpression]);

    const displayLine = useMemo(() => {
        if (state.error) return state.error;
        if (state.currentInput !== '') return state.currentInput;
        return '0';
    }, [state.currentInput, state.error]);

    const resetAll = useCallback(() => {
        setState({ ...initialState });
    }, []);

    const clearEntry = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentInput: '',
            currentDisplay: null,
            error: null,
            isResultDisplayed: false,
        }));
    }, []);

    const appendDigit = useCallback((digit: string) => {
        setState((prev) => {
            if (prev.error) return { ...initialState, currentInput: digit };
            const shouldReset = prev.isResultDisplayed && prev.expressionTokens.length === 0;
            const baseInput = shouldReset ? '' : prev.currentInput;
            const nextInput = baseInput === '0' ? digit : `${baseInput}${digit}`;
            return {
                ...prev,
                currentInput: nextInput,
                currentDisplay: null,
                isResultDisplayed: false,
                lastExpression: shouldReset ? '' : prev.lastExpression,
            };
        });
    }, []);

    const appendDot = useCallback(() => {
        setState((prev) => {
            if (prev.error) return { ...initialState, currentInput: '0.' };
            if (prev.currentInput.includes('.')) return prev;
            const shouldReset = prev.isResultDisplayed && prev.expressionTokens.length === 0;
            const baseInput = shouldReset ? '' : prev.currentInput;
            const nextInput = baseInput === '' ? '0.' : `${baseInput}.`;
            return {
                ...prev,
                currentInput: nextInput,
                currentDisplay: null,
                isResultDisplayed: false,
                lastExpression: shouldReset ? '' : prev.lastExpression,
            };
        });
    }, []);

    const handleOperator = useCallback((operator: string) => {
        setState((prev) => {
            if (prev.error) return prev;
            const tokens = [...prev.expressionTokens];
            const current = prev.currentDisplay ?? prev.currentInput;

            if (!current && tokens.length > 0 && isOperator(tokens[tokens.length - 1])) {
                tokens[tokens.length - 1] = operator;
                return { ...prev, expressionTokens: tokens };
            }

            const nextTokens = current ? [...tokens, current, operator] : [...tokens];
            return {
                ...prev,
                expressionTokens: nextTokens,
                currentInput: '',
                currentDisplay: null,
                isResultDisplayed: false,
            };
        });
    }, []);

    const evaluateExpression = useCallback(() => {
        setState((prev) => {
            if (prev.error) return prev;
            const tokens = [...prev.expressionTokens];
            const current = prev.currentDisplay ?? prev.currentInput;
            if (current) tokens.push(current);
            if (tokens.length === 0 || isOperator(tokens[tokens.length - 1])) return prev;

            const rpn = toRPN(tokens);
            const result = evalRPN(rpn);

            if ('error' in result) {
                return {
                    ...prev,
                    error: result.error ?? 'Invalid Input',
                    currentInput: '',
                    currentDisplay: null,
                };
            }

            return {
                ...prev,
                expressionTokens: [],
                lastExpression: tokens.join(' '),
                currentInput: formatNumber(result.value),
                currentDisplay: null,
                isResultDisplayed: true,
                error: null,
            };
        });
    }, []);

    const applyUnary = useCallback((type: 'sqrt' | 'inv' | 'neg' | 'percent') => {
        setState((prev) => {
            if (prev.error) return prev;
            const raw = prev.currentInput || '0';
            const value = Number(raw);
            if (Number.isNaN(value)) return { ...prev, error: 'Invalid Input' };

            let computed = value;
            let display = raw;
            if (type === 'sqrt') {
                if (value < 0) return { ...prev, error: 'Invalid Input' };
                computed = Math.sqrt(value);
                display = `√(${raw})`;
            } else if (type === 'inv') {
                if (value === 0) return { ...prev, error: 'Cannot divide by zero' };
                computed = 1 / value;
                display = `1/(${raw})`;
            } else if (type === 'neg') {
                computed = value * -1;
                display = `±(${raw})`;
            } else if (type === 'percent') {
                computed = value / 100;
                display = `${raw}%`;
            }

            return {
                ...prev,
                currentInput: formatNumber(computed),
                currentDisplay: display,
                isResultDisplayed: false,
                error: null,
            };
        });
    }, []);

    const backspace = useCallback(() => {
        setState((prev) => {
            if (prev.error) return { ...prev, error: null, currentInput: '' };
            if (prev.currentInput.length === 0) return prev;
            const next = prev.currentInput.slice(0, -1);
            return { ...prev, currentInput: next, currentDisplay: null, isResultDisplayed: false };
        });
    }, []);

    const handleMemory = useCallback((type: 'MC' | 'MR' | 'MS' | 'M+' | 'M-') => {
        setState((prev) => {
            const value = Number(prev.currentInput || '0');
            if (Number.isNaN(value)) return prev;

            switch (type) {
                case 'MC':
                    return { ...prev, memoryValue: null };
                case 'MR':
                    return {
                        ...prev,
                        currentInput: formatNumber(prev.memoryValue ?? 0),
                        currentDisplay: null,
                        isResultDisplayed: false,
                    };
                case 'MS':
                    return { ...prev, memoryValue: value };
                case 'M+':
                    return { ...prev, memoryValue: (prev.memoryValue ?? 0) + value };
                case 'M-':
                    return { ...prev, memoryValue: (prev.memoryValue ?? 0) - value };
                default:
                    return prev;
            }
        });
    }, []);

    const handleKeyBlock = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        const blockedKeys = /[0-9+\-*/.=]/;
        if (blockedKeys.test(event.key)) {
            event.preventDefault();
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="absolute z-50 select-none"
            style={{ left: position.x, top: position.y }}
            onKeyDown={handleKeyBlock}
            role="application"
            aria-label="Calculator"
        >
            <div className="w-[245px] h-[330px] bg-[#EBEBEB] border border-[#D6D6D6] shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
                {/* Header */}
                <div
                    className="h-8 bg-[#3A77B8] text-white flex items-center justify-between pl-2 pr-0 cursor-move"
                    onMouseDown={(event) => {
                        if (event.button !== 0) return;
                        dragOffset.current = {
                            x: event.clientX - position.x,
                            y: event.clientY - position.y,
                        };
                        setIsDragging(true);
                    }}
                >
                    <span className="text-[13px] font-bold">Calculator</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#E81123]"
                        aria-label="Close calculator"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Display */}
                <div className="mx-2.5 mt-2 bg-white border border-[#7F9DB9] px-2 py-1 h-[55px]">
                    <div className="text-[12px] text-[#666666] text-right truncate h-4">
                        {expressionLine}
                    </div>
                    <div className="text-[20px] font-bold text-black text-right truncate leading-6">
                        {displayLine}
                    </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-5 grid-rows-6 gap-[5px] p-2.5">
                    {[
                        { label: 'MC', type: 'memory', onClick: () => handleMemory('MC') },
                        { label: 'MR', type: 'memory', onClick: () => handleMemory('MR') },
                        { label: 'MS', type: 'memory', onClick: () => handleMemory('MS') },
                        { label: 'M+', type: 'memory', onClick: () => handleMemory('M+') },
                        { label: 'M-', type: 'memory', onClick: () => handleMemory('M-') },

                        { label: '←', type: 'function', onClick: backspace },
                        { label: 'CE', type: 'function', onClick: clearEntry },
                        { label: 'C', type: 'function', onClick: resetAll },
                        { label: '±', type: 'function', onClick: () => applyUnary('neg') },
                        { label: '√', type: 'function', onClick: () => applyUnary('sqrt') },

                        { label: '7', type: 'number', onClick: () => appendDigit('7') },
                        { label: '8', type: 'number', onClick: () => appendDigit('8') },
                        { label: '9', type: 'number', onClick: () => appendDigit('9') },
                        { label: '/', type: 'operator', onClick: () => handleOperator('/') },
                        { label: '%', type: 'operator', onClick: () => applyUnary('percent') },

                        { label: '4', type: 'number', onClick: () => appendDigit('4') },
                        { label: '5', type: 'number', onClick: () => appendDigit('5') },
                        { label: '6', type: 'number', onClick: () => appendDigit('6') },
                        { label: '*', type: 'operator', onClick: () => handleOperator('*') },
                        { label: '1/x', type: 'operator', onClick: () => applyUnary('inv') },

                        { label: '1', type: 'number', onClick: () => appendDigit('1') },
                        { label: '2', type: 'number', onClick: () => appendDigit('2') },
                        { label: '3', type: 'number', onClick: () => appendDigit('3') },
                        { label: '-', type: 'operator', onClick: () => handleOperator('-') },
                        { label: '=', type: 'equals', onClick: evaluateExpression, rowSpan: 2 },

                        { label: '0', type: 'number', onClick: () => appendDigit('0'), colSpan: 2 },
                        { label: '.', type: 'number', onClick: appendDot },
                        { label: '+', type: 'operator', onClick: () => handleOperator('+') },
                    ].map((btn, index) => {
                        const baseClasses = 'h-8 text-sm font-semibold border border-[#C0C0C0]';
                        const typeClasses =
                            btn.type === 'memory' || btn.type === 'function'
                                ? 'bg-gradient-to-b from-[#F0F0F0] to-[#DCDCDC] text-[#B00000]'
                                : btn.type === 'operator'
                                    ? 'bg-gradient-to-b from-[#F0F0F0] to-[#DCDCDC] text-[#FF0000]'
                                    : btn.type === 'equals'
                                        ? 'bg-gradient-to-b from-[#F0F0F0] to-[#DCDCDC] text-black'
                                        : 'bg-white text-black';

                        const spanClasses = `${btn.colSpan ? 'col-span-2' : ''} ${btn.rowSpan ? 'row-span-2 h-full' : ''}`;

                        return (
                            <button
                                key={`${btn.label}-${index}`}
                                type="button"
                                onClick={btn.onClick}
                                className={`${baseClasses} ${typeClasses} ${spanClasses} rounded`}
                            >
                                {btn.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
