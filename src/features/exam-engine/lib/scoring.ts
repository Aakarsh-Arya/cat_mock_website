/**
 * @fileoverview Exam Scoring Engine
 * @description Server-side scoring logic for CAT exam evaluation
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 001, 003
 * @deviation Uses TypeScript scoring instead of SQL RPC for better testability
 */

import type { Question, QuestionWithAnswer, SectionName, SectionScore, SectionScores } from '@/types/exam';
import { CAT_CONSTANTS } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

/** Response data for scoring */
export interface ResponseForScoring {
    question_id: string;
    answer: string | null;
    time_spent_seconds: number;
}

/** Individual question scoring result */
export interface QuestionScoringResult {
    question_id: string;
    section: SectionName;
    is_correct: boolean;
    marks_obtained: number;
    user_answer: string | null;
    correct_answer: string;
}

/** Complete scoring result */
export interface ScoringResult {
    total_score: number;
    max_possible_score: number;
    correct_count: number;
    incorrect_count: number;
    unanswered_count: number;
    accuracy: number;           // (correct / attempted) * 100
    attempt_rate: number;       // (attempted / total) * 100
    section_scores: SectionScores;
    question_results: QuestionScoringResult[];
}

// =============================================================================
// NORMALIZATION UTILITIES
// =============================================================================

/**
 * Normalize a string value for comparison
 * - Trims whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces to single space
 */
export function normalizeString(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return '';
    return String(val).trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Attempt to parse a value as a number
 * Returns null if not a valid number
 */
export function parseAsNumber(val: string | null | undefined): number | null {
    if (val === null || val === undefined || val.trim() === '') return null;

    const normalized = val.trim();
    const parsed = Number(normalized);

    // Check for valid number (not NaN, not Infinity)
    if (!Number.isFinite(parsed)) return null;

    return parsed;
}

/**
 * Compare two answers for equality
 * Handles both string and numeric comparisons
 * 
 * For TITA questions:
 * - Tries numeric comparison first (handles "42" vs "42.0")
 * - Falls back to normalized string comparison
 * 
 * For MCQ questions:
 * - Direct uppercase comparison (A, B, C, D)
 */
export function compareAnswers(
    userAnswer: string | null,
    correctAnswer: string,
    questionType: 'MCQ' | 'TITA'
): boolean {
    // Handle null/empty user answer
    if (userAnswer === null || userAnswer.trim() === '') {
        return false;
    }

    if (questionType === 'MCQ') {
        // MCQ: Direct comparison (case-insensitive)
        return normalizeString(userAnswer) === normalizeString(correctAnswer);
    }

    // TITA: Try numeric comparison first
    const userNum = parseAsNumber(userAnswer);
    const correctNum = parseAsNumber(correctAnswer);

    if (userNum !== null && correctNum !== null) {
        // Both are valid numbers - compare numerically
        // Use small epsilon for floating point comparison
        const epsilon = 1e-9;
        return Math.abs(userNum - correctNum) < epsilon;
    }

    // Fall back to normalized string comparison
    return normalizeString(userAnswer) === normalizeString(correctAnswer);
}

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate marks for a single question based on CAT marking scheme
 * 
 * CAT Marking Scheme:
 * - Correct MCQ: +3
 * - Wrong MCQ: -1
 * - Correct TITA: +3
 * - Wrong TITA: 0 (no negative marking)
 * - Unanswered: 0
 */
export function calculateQuestionMarks(
    question: QuestionWithAnswer,
    userAnswer: string | null
): { isCorrect: boolean; marksObtained: number } {
    // Check if unanswered
    if (userAnswer === null || userAnswer.trim() === '') {
        return { isCorrect: false, marksObtained: 0 };
    }

    // Check if correct
    const isCorrect = compareAnswers(userAnswer, question.correct_answer, question.question_type);

    if (isCorrect) {
        // Use question-specific marks or CAT default
        const marks = question.positive_marks ?? CAT_CONSTANTS.POSITIVE_MARKS;
        return { isCorrect: true, marksObtained: marks };
    }

    // Wrong answer
    if (question.question_type === 'MCQ') {
        // MCQ has negative marking
        const negativeMark = question.negative_marks ?? CAT_CONSTANTS.NEGATIVE_MARKS_MCQ;
        return { isCorrect: false, marksObtained: -negativeMark };
    }

    // TITA has no negative marking
    return { isCorrect: false, marksObtained: 0 };
}

/**
 * Initialize empty section scores
 */
function initializeSectionScores(): SectionScores {
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const sectionScores: Partial<SectionScores> = {};

    for (const section of sections) {
        sectionScores[section] = {
            score: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
        };
    }

    return sectionScores as SectionScores;
}

/**
 * Calculate complete exam score
 * 
 * @param questions - All questions with correct answers
 * @param responses - User's responses
 * @returns Complete scoring result with section breakdowns
 */
export function calculateScore(
    questions: QuestionWithAnswer[],
    responses: ResponseForScoring[]
): ScoringResult {
    // Create response lookup map
    const responseMap = new Map<string, ResponseForScoring>();
    for (const response of responses) {
        responseMap.set(response.question_id, response);
    }

    // Initialize counters
    let totalScore = 0;
    let maxPossibleScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const sectionScores = initializeSectionScores();
    const questionResults: QuestionScoringResult[] = [];

    // Process each question
    for (const question of questions) {
        const response = responseMap.get(question.id);
        const userAnswer = response?.answer ?? null;

        // Calculate marks for this question
        const { isCorrect, marksObtained } = calculateQuestionMarks(question, userAnswer);

        // Update totals
        totalScore += marksObtained;
        maxPossibleScore += question.positive_marks ?? CAT_CONSTANTS.POSITIVE_MARKS;

        // Update section scores
        const sectionScore = sectionScores[question.section];
        sectionScore.score += marksObtained;

        // Categorize response
        const isUnanswered = userAnswer === null || userAnswer.trim() === '';

        if (isUnanswered) {
            unansweredCount++;
            sectionScore.unanswered++;
        } else if (isCorrect) {
            correctCount++;
            sectionScore.correct++;
        } else {
            incorrectCount++;
            sectionScore.incorrect++;
        }

        // Store individual result
        questionResults.push({
            question_id: question.id,
            section: question.section,
            is_correct: isCorrect,
            marks_obtained: marksObtained,
            user_answer: userAnswer,
            correct_answer: question.correct_answer,
        });
    }

    // Calculate percentages
    const attemptedCount = correctCount + incorrectCount;
    const totalQuestions = questions.length;

    const accuracy = attemptedCount > 0
        ? Math.round((correctCount / attemptedCount) * 10000) / 100
        : 0;

    const attemptRate = totalQuestions > 0
        ? Math.round((attemptedCount / totalQuestions) * 10000) / 100
        : 0;

    return {
        total_score: totalScore,
        max_possible_score: maxPossibleScore,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unanswered_count: unansweredCount,
        accuracy,
        attempt_rate: attemptRate,
        section_scores: sectionScores,
        question_results: questionResults,
    };
}

/**
 * Calculate time taken from start to submission
 */
export function calculateTimeTaken(startedAt: string, submittedAt: string): number {
    const start = new Date(startedAt).getTime();
    const end = new Date(submittedAt).getTime();
    return Math.floor((end - start) / 1000); // seconds
}

/**
 * Calculate a simple rank based on score position
 * Returns the count of attempts with higher scores + 1
 */
export async function calculateRank(
    supabase: { from: (table: string) => { select: (cols: string, opts?: { count: 'exact'; head: boolean }) => { eq: (col: string, val: unknown) => { gt: (col: string, val: number) => Promise<{ count: number | null }> } } } },
    paperId: string,
    totalScore: number
): Promise<number> {
    const { count } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('paper_id', paperId)
        .gt('total_score', totalScore);

    return (count ?? 0) + 1;
}
