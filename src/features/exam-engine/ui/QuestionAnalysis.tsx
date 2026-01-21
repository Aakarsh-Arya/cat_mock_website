/**
 * @fileoverview Question Analysis Component
 * @description Detailed question-by-question review with solutions
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

'use client';

import { useState } from 'react';
import { type SectionName, type QuestionType } from '@/types/exam';

interface QuestionData {
    id: string;
    section: SectionName;
    question_number: number;
    question_text: string;
    question_type: QuestionType;
    options: string[] | null;
    correct_answer: string;
    solution_text?: string | null;
    topic?: string | null;
    difficulty?: string | null;
}

interface ResponseData {
    question_id: string;
    answer: string | null;
    is_correct: boolean | null;
    marks_obtained: number | null;
}

interface QuestionAnalysisProps {
    questions: QuestionData[];
    responses: ResponseData[];
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'unanswered';

/** Get response for a question */
function getResponse(questionId: string, responses: ResponseData[]): ResponseData | undefined {
    return responses.find(r => r.question_id === questionId);
}

/** Get status styling */
function getStatusStyle(isCorrect: boolean | null, hasAnswer: boolean): {
    bgClass: string;
    borderClass: string;
    textClass: string;
    label: string;
} {
    if (!hasAnswer) {
        return {
            bgClass: 'bg-gray-100',
            borderClass: 'border-gray-300',
            textClass: 'text-gray-600',
            label: 'Unanswered',
        };
    }
    if (isCorrect) {
        return {
            bgClass: 'bg-green-50',
            borderClass: 'border-green-400',
            textClass: 'text-green-700',
            label: 'Correct',
        };
    }
    return {
        bgClass: 'bg-red-50',
        borderClass: 'border-red-400',
        textClass: 'text-red-700',
        label: 'Incorrect',
    };
}

/** Format option label (A, B, C, D) */
function getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
}

export function QuestionAnalysis({ questions, responses }: QuestionAnalysisProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const [activeSection, setActiveSection] = useState<SectionName | 'all'>('all');

    // Filter questions
    const filteredQuestions = questions.filter(q => {
        const response = getResponse(q.id, responses);
        const hasAnswer = response?.answer !== null && response?.answer !== undefined && response?.answer?.trim() !== '';
        const isCorrect = response?.is_correct;

        // Section filter
        if (activeSection !== 'all' && q.section !== activeSection) return false;

        // Status filter
        switch (filter) {
            case 'correct':
                return hasAnswer && isCorrect === true;
            case 'incorrect':
                return hasAnswer && isCorrect === false;
            case 'unanswered':
                return !hasAnswer;
            default:
                return true;
        }
    });

    // Toggle question expansion
    const toggleQuestion = (questionId: string) => {
        setExpandedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Stats for filters
    const stats = {
        correct: questions.filter(q => {
            const r = getResponse(q.id, responses);
            return r?.is_correct === true;
        }).length,
        incorrect: questions.filter(q => {
            const r = getResponse(q.id, responses);
            const hasAnswer = r?.answer !== null && r?.answer !== undefined && r?.answer?.trim() !== '';
            return hasAnswer && r?.is_correct === false;
        }).length,
        unanswered: questions.filter(q => {
            const r = getResponse(q.id, responses);
            return !r?.answer || r.answer.trim() === '';
        }).length,
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Question Analysis
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Section Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(['all', 'VARC', 'DILR', 'QA'] as const).map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeSection === section
                                    ? 'bg-white shadow text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {section === 'all' ? 'All' : section}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'all'
                                ? 'bg-white shadow text-gray-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All ({questions.length})
                    </button>
                    <button
                        onClick={() => setFilter('correct')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'correct'
                                ? 'bg-green-100 text-green-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ✓ Correct ({stats.correct})
                    </button>
                    <button
                        onClick={() => setFilter('incorrect')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'incorrect'
                                ? 'bg-red-100 text-red-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ✗ Wrong ({stats.incorrect})
                    </button>
                    <button
                        onClick={() => setFilter('unanswered')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'unanswered'
                                ? 'bg-gray-300 text-gray-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        – Skipped ({stats.unanswered})
                    </button>
                </div>
            </div>

            {/* Question List */}
            <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No questions match the selected filters.
                    </div>
                ) : (
                    filteredQuestions.map((question) => {
                        const response = getResponse(question.id, responses);
                        const hasAnswer = response?.answer !== null && response?.answer !== undefined && response?.answer?.trim() !== '';
                        const isExpanded = expandedQuestions.has(question.id);
                        const style = getStatusStyle(response?.is_correct ?? null, hasAnswer);

                        return (
                            <div
                                key={question.id}
                                className={`border-2 ${style.borderClass} ${style.bgClass} rounded-lg overflow-hidden transition-all`}
                            >
                                {/* Question Header (Click to expand) */}
                                <button
                                    onClick={() => toggleQuestion(question.id)}
                                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/50 transition-colors"
                                >
                                    {/* Question Number */}
                                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border flex items-center justify-center">
                                        <span className="text-sm text-gray-500">Q{question.question_number}</span>
                                    </div>

                                    {/* Status & Section */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${style.textClass} bg-white`}>
                                                {style.label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {question.section}
                                            </span>
                                            {question.topic && (
                                                <span className="text-xs text-gray-400">
                                                    • {question.topic}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 truncate">
                                            {question.question_text.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                        </p>
                                    </div>

                                    {/* Marks */}
                                    <div className="flex-shrink-0 text-right">
                                        <span className={`text-lg font-bold ${style.textClass}`}>
                                            {response?.marks_obtained !== null && response?.marks_obtained !== undefined
                                                ? (response.marks_obtained > 0 ? '+' : '') + response.marks_obtained
                                                : '0'
                                            }
                                        </span>
                                        <span className="text-xs text-gray-400 block">marks</span>
                                    </div>

                                    {/* Expand Icon */}
                                    <div className="flex-shrink-0">
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t bg-white p-4 space-y-4">
                                        {/* Full Question Text */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Question</h4>
                                            <div
                                                className="text-gray-800 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: question.question_text }}
                                            />
                                        </div>

                                        {/* Options (for MCQ) */}
                                        {question.question_type === 'MCQ' && question.options && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Options</h4>
                                                <div className="space-y-2">
                                                    {question.options.map((option, idx) => {
                                                        const optionLabel = getOptionLabel(idx);
                                                        const isUserAnswer = response?.answer === optionLabel;
                                                        const isCorrectAnswer = question.correct_answer === optionLabel;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-start gap-3 p-2 rounded-lg ${isCorrectAnswer
                                                                        ? 'bg-green-100 border border-green-300'
                                                                        : isUserAnswer
                                                                            ? 'bg-red-100 border border-red-300'
                                                                            : 'bg-gray-50'
                                                                    }`}
                                                            >
                                                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectAnswer
                                                                        ? 'bg-green-500 text-white'
                                                                        : isUserAnswer
                                                                            ? 'bg-red-500 text-white'
                                                                            : 'bg-gray-200 text-gray-600'
                                                                    }`}>
                                                                    {optionLabel}
                                                                </span>
                                                                <span className="text-sm text-gray-700">{option}</span>
                                                                {isCorrectAnswer && (
                                                                    <span className="ml-auto text-xs text-green-600 font-medium">
                                                                        ✓ Correct
                                                                    </span>
                                                                )}
                                                                {isUserAnswer && !isCorrectAnswer && (
                                                                    <span className="ml-auto text-xs text-red-600 font-medium">
                                                                        Your answer
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* TITA Answer */}
                                        {question.question_type === 'TITA' && (
                                            <div className="flex gap-6">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Correct Answer</h4>
                                                    <p className="text-lg font-bold text-green-600">
                                                        {question.correct_answer}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Your Answer</h4>
                                                    <p className={`text-lg font-bold ${response?.is_correct ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {response?.answer || '(Not answered)'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Solution */}
                                        {question.solution_text && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Solution</h4>
                                                <div
                                                    className="text-gray-700 prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg"
                                                    dangerouslySetInnerHTML={{ __html: question.solution_text }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default QuestionAnalysis;
