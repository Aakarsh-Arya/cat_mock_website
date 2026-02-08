import { describe, expect, it } from 'vitest';
import {
    calculateScore,
    calculateQuestionMarks,
    compareAnswers,
    normalizeString,
    parseAsNumber,
    calculateTimeTaken,
    type ResponseForScoring,
} from '../scoring';
import type { QuestionWithAnswer } from '@/types/exam';

const makeQuestion = (overrides: Partial<QuestionWithAnswer>): QuestionWithAnswer => ({
    id: overrides.id ?? 'q1',
    paper_id: overrides.paper_id ?? 'paper-1',
    section: overrides.section ?? 'VARC',
    question_number: overrides.question_number ?? 1,
    question_text: overrides.question_text ?? 'Question text',
    question_type: overrides.question_type ?? 'MCQ',
    options: overrides.options ?? ['A', 'B', 'C', 'D'],
    positive_marks: overrides.positive_marks ?? 3,
    negative_marks: overrides.negative_marks ?? 1,
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at ?? '2026-01-01T00:00:00.000Z',
    updated_at: overrides.updated_at ?? '2026-01-01T00:00:00.000Z',
    correct_answer: overrides.correct_answer ?? 'A',
    set_id: overrides.set_id ?? null,
    sequence_order: overrides.sequence_order ?? null,
    exam_order: overrides.exam_order ?? undefined,
    question_format: overrides.question_format ?? undefined,
    taxonomy_type: overrides.taxonomy_type ?? undefined,
    topic_tag: overrides.topic_tag ?? undefined,
    difficulty_rationale: overrides.difficulty_rationale ?? undefined,
    context_id: overrides.context_id ?? undefined,
    context: overrides.context ?? undefined,
    solution_text: overrides.solution_text ?? undefined,
    solution_image_url: overrides.solution_image_url ?? undefined,
    video_solution_url: overrides.video_solution_url ?? undefined,
    question_image_url: overrides.question_image_url ?? undefined,
    difficulty: overrides.difficulty ?? undefined,
    topic: overrides.topic ?? undefined,
    subtopic: overrides.subtopic ?? undefined,
});

// =============================================================================
// NORMALIZATION TESTS
// =============================================================================

describe('normalizeString', () => {
    it('handles null and undefined', () => {
        expect(normalizeString(null)).toBe('');
        expect(normalizeString(undefined)).toBe('');
    });

    it('trims whitespace', () => {
        expect(normalizeString('  hello  ')).toBe('hello');
        expect(normalizeString('\t\ntest\n\t')).toBe('test');
    });

    it('converts to lowercase', () => {
        expect(normalizeString('HELLO')).toBe('hello');
        expect(normalizeString('HeLLo WoRLd')).toBe('hello world');
    });

    it('collapses multiple spaces', () => {
        expect(normalizeString('hello   world')).toBe('hello world');
        expect(normalizeString('a  b  c')).toBe('a b c');
    });

    it('handles numbers', () => {
        expect(normalizeString(42)).toBe('42');
        expect(normalizeString(3.14)).toBe('3.14');
    });
});

describe('parseAsNumber', () => {
    it('parses valid integers', () => {
        expect(parseAsNumber('42')).toBe(42);
        expect(parseAsNumber('-17')).toBe(-17);
        expect(parseAsNumber('0')).toBe(0);
    });

    it('parses valid decimals', () => {
        expect(parseAsNumber('3.14')).toBe(3.14);
        expect(parseAsNumber('-2.5')).toBe(-2.5);
        expect(parseAsNumber('0.001')).toBe(0.001);
    });

    it('handles whitespace', () => {
        expect(parseAsNumber('  42  ')).toBe(42);
        expect(parseAsNumber('\t3.14\n')).toBe(3.14);
    });

    it('returns null for invalid input', () => {
        expect(parseAsNumber(null)).toBe(null);
        expect(parseAsNumber(undefined)).toBe(null);
        expect(parseAsNumber('')).toBe(null);
        expect(parseAsNumber('abc')).toBe(null);
        expect(parseAsNumber('12abc')).toBe(null);
    });

    it('returns null for Infinity and NaN', () => {
        expect(parseAsNumber('Infinity')).toBe(null);
        expect(parseAsNumber('-Infinity')).toBe(null);
        expect(parseAsNumber('NaN')).toBe(null);
    });
});

// =============================================================================
// ANSWER COMPARISON TESTS
// =============================================================================

describe('compareAnswers', () => {
    describe('MCQ questions', () => {
        it('matches case-insensitively', () => {
            expect(compareAnswers('a', 'A', 'MCQ')).toBe(true);
            expect(compareAnswers('A', 'a', 'MCQ')).toBe(true);
            expect(compareAnswers('B', 'B', 'MCQ')).toBe(true);
        });

        it('handles whitespace', () => {
            expect(compareAnswers('  A  ', 'A', 'MCQ')).toBe(true);
            expect(compareAnswers('B', '  b  ', 'MCQ')).toBe(true);
        });

        it('returns false for mismatches', () => {
            expect(compareAnswers('A', 'B', 'MCQ')).toBe(false);
            expect(compareAnswers('C', 'D', 'MCQ')).toBe(false);
        });

        it('returns false for null/empty', () => {
            expect(compareAnswers(null, 'A', 'MCQ')).toBe(false);
            expect(compareAnswers('', 'A', 'MCQ')).toBe(false);
            expect(compareAnswers('   ', 'A', 'MCQ')).toBe(false);
        });
    });

    describe('TITA questions', () => {
        it('compares numeric values correctly', () => {
            expect(compareAnswers('42', '42', 'TITA')).toBe(true);
            expect(compareAnswers('42.0', '42', 'TITA')).toBe(true);
            expect(compareAnswers('42.00', '42.0', 'TITA')).toBe(true);
        });

        it('handles decimal precision', () => {
            expect(compareAnswers('3.14', '3.14', 'TITA')).toBe(true);
            expect(compareAnswers('3.140', '3.14', 'TITA')).toBe(true);
            expect(compareAnswers('3.14', '3.15', 'TITA')).toBe(false);
        });

        it('handles negative numbers', () => {
            expect(compareAnswers('-5', '-5', 'TITA')).toBe(true);
            expect(compareAnswers('-5.0', '-5', 'TITA')).toBe(true);
        });

        it('falls back to string comparison for non-numeric', () => {
            expect(compareAnswers('hello', 'hello', 'TITA')).toBe(true);
            expect(compareAnswers('HELLO', 'hello', 'TITA')).toBe(true);
            expect(compareAnswers('hello', 'world', 'TITA')).toBe(false);
        });

        it('returns false for null/empty', () => {
            expect(compareAnswers(null, '42', 'TITA')).toBe(false);
            expect(compareAnswers('', '42', 'TITA')).toBe(false);
        });
    });
});

// =============================================================================
// QUESTION MARKS CALCULATION TESTS
// =============================================================================

describe('calculateQuestionMarks', () => {
    describe('MCQ questions', () => {
        const mcqQuestion = makeQuestion({
            question_type: 'MCQ',
            correct_answer: 'B',
            positive_marks: 3,
            negative_marks: 1
        });

        it('awards positive marks for correct answer', () => {
            expect(calculateQuestionMarks(mcqQuestion, 'B')).toEqual({
                isCorrect: true,
                marksObtained: 3
            });
        });

        it('deducts marks for wrong answer', () => {
            expect(calculateQuestionMarks(mcqQuestion, 'A')).toEqual({
                isCorrect: false,
                marksObtained: -1
            });
            expect(calculateQuestionMarks(mcqQuestion, 'C')).toEqual({
                isCorrect: false,
                marksObtained: -1
            });
        });

        it('gives zero for unanswered', () => {
            expect(calculateQuestionMarks(mcqQuestion, null)).toEqual({
                isCorrect: false,
                marksObtained: 0
            });
            expect(calculateQuestionMarks(mcqQuestion, '')).toEqual({
                isCorrect: false,
                marksObtained: 0
            });
        });

        it('uses custom marks when specified', () => {
            const customMarksQ = makeQuestion({
                question_type: 'MCQ',
                correct_answer: 'A',
                positive_marks: 5,
                negative_marks: 2
            });
            expect(calculateQuestionMarks(customMarksQ, 'A')).toEqual({
                isCorrect: true,
                marksObtained: 5
            });
            expect(calculateQuestionMarks(customMarksQ, 'B')).toEqual({
                isCorrect: false,
                marksObtained: -2
            });
        });
    });

    describe('TITA questions', () => {
        const titaQuestion = makeQuestion({
            question_type: 'TITA',
            correct_answer: '42',
            positive_marks: 3,
            negative_marks: 0,
            options: null
        });

        it('awards positive marks for correct answer', () => {
            expect(calculateQuestionMarks(titaQuestion, '42')).toEqual({
                isCorrect: true,
                marksObtained: 3
            });
            expect(calculateQuestionMarks(titaQuestion, '42.0')).toEqual({
                isCorrect: true,
                marksObtained: 3
            });
        });

        it('gives zero for wrong answer (no negative marking)', () => {
            expect(calculateQuestionMarks(titaQuestion, '41')).toEqual({
                isCorrect: false,
                marksObtained: 0
            });
            expect(calculateQuestionMarks(titaQuestion, '43')).toEqual({
                isCorrect: false,
                marksObtained: 0
            });
        });

        it('gives zero for unanswered', () => {
            expect(calculateQuestionMarks(titaQuestion, null)).toEqual({
                isCorrect: false,
                marksObtained: 0
            });
        });
    });
});

// =============================================================================
// FULL SCORING TESTS
// =============================================================================

describe('calculateScore', () => {
    it('calculates total score, accuracy, and attempt rate', () => {
        const questions: QuestionWithAnswer[] = [
            makeQuestion({ id: 'q1', section: 'VARC', question_number: 1, question_type: 'MCQ', correct_answer: 'A' }),
            makeQuestion({ id: 'q2', section: 'DILR', question_number: 2, question_type: 'MCQ', correct_answer: 'B' }),
            makeQuestion({ id: 'q3', section: 'QA', question_number: 3, question_type: 'TITA', correct_answer: '42', negative_marks: 0, options: null }),
        ];

        const responses: ResponseForScoring[] = [
            { question_id: 'q1', answer: 'A', time_spent_seconds: 30 },
            { question_id: 'q2', answer: 'C', time_spent_seconds: 45 },
            { question_id: 'q3', answer: null, time_spent_seconds: 0 },
        ];

        const result = calculateScore(questions, responses);

        expect(result.total_score).toBe(2); // 3 - 1 + 0
        expect(result.max_possible_score).toBe(9);
        expect(result.correct_count).toBe(1);
        expect(result.incorrect_count).toBe(1);
        expect(result.unanswered_count).toBe(1);
        expect(result.accuracy).toBe(50); // 1/2 = 50%
        expect(result.attempt_rate).toBe(66.67); // 2/3 ≈ 66.67%
        expect(result.section_scores.VARC.score).toBe(3);
        expect(result.section_scores.DILR.score).toBe(-1);
        expect(result.section_scores.QA.score).toBe(0);
    });

    it('handles all correct answers', () => {
        const questions: QuestionWithAnswer[] = [
            makeQuestion({ id: 'q1', section: 'VARC', correct_answer: 'A' }),
            makeQuestion({ id: 'q2', section: 'VARC', correct_answer: 'B' }),
            makeQuestion({ id: 'q3', section: 'VARC', correct_answer: 'C' }),
        ];

        const responses: ResponseForScoring[] = [
            { question_id: 'q1', answer: 'A', time_spent_seconds: 30 },
            { question_id: 'q2', answer: 'B', time_spent_seconds: 30 },
            { question_id: 'q3', answer: 'C', time_spent_seconds: 30 },
        ];

        const result = calculateScore(questions, responses);

        expect(result.total_score).toBe(9);
        expect(result.correct_count).toBe(3);
        expect(result.incorrect_count).toBe(0);
        expect(result.accuracy).toBe(100);
        expect(result.attempt_rate).toBe(100);
    });

    it('handles all wrong answers', () => {
        const questions: QuestionWithAnswer[] = [
            makeQuestion({ id: 'q1', section: 'VARC', correct_answer: 'A' }),
            makeQuestion({ id: 'q2', section: 'VARC', correct_answer: 'B' }),
        ];

        const responses: ResponseForScoring[] = [
            { question_id: 'q1', answer: 'D', time_spent_seconds: 30 },
            { question_id: 'q2', answer: 'D', time_spent_seconds: 30 },
        ];

        const result = calculateScore(questions, responses);

        expect(result.total_score).toBe(-2); // -1 - 1
        expect(result.correct_count).toBe(0);
        expect(result.incorrect_count).toBe(2);
        expect(result.accuracy).toBe(0);
        expect(result.attempt_rate).toBe(100);
    });

    it('handles all unanswered', () => {
        const questions: QuestionWithAnswer[] = [
            makeQuestion({ id: 'q1', section: 'QA', correct_answer: 'A' }),
            makeQuestion({ id: 'q2', section: 'QA', correct_answer: 'B' }),
        ];

        const responses: ResponseForScoring[] = [
            { question_id: 'q1', answer: null, time_spent_seconds: 0 },
            { question_id: 'q2', answer: null, time_spent_seconds: 0 },
        ];

        const result = calculateScore(questions, responses);

        expect(result.total_score).toBe(0);
        expect(result.unanswered_count).toBe(2);
        expect(result.accuracy).toBe(0);
        expect(result.attempt_rate).toBe(0);
    });

    it('handles missing responses gracefully', () => {
        const questions: QuestionWithAnswer[] = [
            makeQuestion({ id: 'q1', section: 'VARC', correct_answer: 'A' }),
            makeQuestion({ id: 'q2', section: 'VARC', correct_answer: 'B' }),
        ];

        // Only one response provided
        const responses: ResponseForScoring[] = [
            { question_id: 'q1', answer: 'A', time_spent_seconds: 30 },
        ];

        const result = calculateScore(questions, responses);

        expect(result.total_score).toBe(3);
        expect(result.correct_count).toBe(1);
        expect(result.unanswered_count).toBe(1);
    });

    it('calculates section-wise scores correctly', () => {
        const questions: QuestionWithAnswer[] = [
            makeQuestion({ id: 'q1', section: 'VARC', correct_answer: 'A' }),
            makeQuestion({ id: 'q2', section: 'VARC', correct_answer: 'B' }),
            makeQuestion({ id: 'q3', section: 'DILR', correct_answer: 'A' }),
            makeQuestion({ id: 'q4', section: 'DILR', correct_answer: 'B' }),
            makeQuestion({ id: 'q5', section: 'QA', correct_answer: 'A' }),
            makeQuestion({ id: 'q6', section: 'QA', correct_answer: 'B' }),
        ];

        const responses: ResponseForScoring[] = [
            { question_id: 'q1', answer: 'A', time_spent_seconds: 30 }, // VARC +3
            { question_id: 'q2', answer: 'C', time_spent_seconds: 30 }, // VARC -1
            { question_id: 'q3', answer: 'A', time_spent_seconds: 30 }, // DILR +3
            { question_id: 'q4', answer: 'B', time_spent_seconds: 30 }, // DILR +3
            { question_id: 'q5', answer: null, time_spent_seconds: 0 }, // QA 0
            { question_id: 'q6', answer: 'C', time_spent_seconds: 30 }, // QA -1
        ];

        const result = calculateScore(questions, responses);

        expect(result.section_scores.VARC.score).toBe(2);
        expect(result.section_scores.VARC.correct).toBe(1);
        expect(result.section_scores.VARC.incorrect).toBe(1);
        expect(result.section_scores.VARC.unanswered).toBe(0);

        expect(result.section_scores.DILR.score).toBe(6);
        expect(result.section_scores.DILR.correct).toBe(2);
        expect(result.section_scores.DILR.incorrect).toBe(0);

        expect(result.section_scores.QA.score).toBe(-1);
        expect(result.section_scores.QA.unanswered).toBe(1);
        expect(result.section_scores.QA.incorrect).toBe(1);

        expect(result.total_score).toBe(7); // 2 + 6 - 1
    });

    it('includes question-level results', () => {
        const questions: QuestionWithAnswer[] = [
            makeQuestion({ id: 'q1', section: 'VARC', correct_answer: 'A' }),
        ];

        const responses: ResponseForScoring[] = [
            { question_id: 'q1', answer: 'A', time_spent_seconds: 30 },
        ];

        const result = calculateScore(questions, responses);

        expect(result.question_results).toHaveLength(1);
        expect(result.question_results[0]).toEqual({
            question_id: 'q1',
            section: 'VARC',
            is_correct: true,
            marks_obtained: 3,
            user_answer: 'A',
            correct_answer: 'A',
        });
    });
});

// =============================================================================
// TIME CALCULATION TESTS
// =============================================================================

describe('calculateTimeTaken', () => {
    it('calculates time in seconds', () => {
        const start = '2026-01-01T10:00:00.000Z';
        const end = '2026-01-01T12:00:00.000Z'; // 2 hours later
        expect(calculateTimeTaken(start, end)).toBe(7200);
    });

    it('handles minutes and seconds', () => {
        const start = '2026-01-01T10:00:00.000Z';
        const end = '2026-01-01T10:30:45.000Z'; // 30 minutes 45 seconds
        expect(calculateTimeTaken(start, end)).toBe(1845);
    });

    it('subtracts paused time', () => {
        const start = '2026-01-01T10:00:00.000Z';
        const end = '2026-01-01T12:00:00.000Z'; // 2 hours later
        expect(calculateTimeTaken(start, end, 900)).toBe(6300); // minus 15 minutes
    });

    it('guards against negative results', () => {
        const start = '2026-01-01T10:00:00.000Z';
        const end = '2026-01-01T10:05:00.000Z'; // 5 minutes later
        expect(calculateTimeTaken(start, end, 600)).toBe(0);
    });
});
