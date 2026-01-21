/**
 * @fileoverview Exam Engine Type Definitions
 * @description TypeScript interfaces matching the "Nuclear Fix" database schema
 * @blueprint Milestone 4 SOP-SSOT - Phase 1.1
 * @deviation Uses 'section' field in questions table, not a separate sections table
 * @deviation Uses 'name' for section names (VARC, DILR, QA), not 'title'
 */

// =============================================================================
// SECTION TYPES (CAT 2024 Format)
// =============================================================================

/** CAT exam section names - strict order: VARC → DILR → QA */
export type SectionName = 'VARC' | 'DILR' | 'QA';

/** Section order mapping for strict navigation enforcement */
export const SECTION_ORDER: Record<SectionName, number> = {
    VARC: 0,
    DILR: 1,
    QA: 2,
} as const;

/** Section configuration from paper.sections JSONB */
export interface SectionConfig {
    name: SectionName;
    questions: number;  // Number of questions in section (VARC: 24, DILR: 20, QA: 22)
    time: number;       // Time in minutes (40 for all sections)
    marks: number;      // Total marks for section
}

/** CAT 2024 default section configuration */
export const CAT_2024_SECTIONS: SectionConfig[] = [
    { name: 'VARC', questions: 24, time: 40, marks: 72 },
    { name: 'DILR', questions: 20, time: 40, marks: 60 },
    { name: 'QA', questions: 22, time: 40, marks: 66 },
] as const;

// =============================================================================
// QUESTION TYPES
// =============================================================================

/** Question types in CAT exam */
export type QuestionType = 'MCQ' | 'TITA';

/** MCQ options structure */
export interface MCQOptions {
    A: string;
    B: string;
    C: string;
    D: string;
}

/** Difficulty levels for questions */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/** Context/Passage for shared questions */
export interface QuestionContext {
    id: string;
    title: string;
    section: SectionName;
    text: string;
}

/** Question entity from database */
export interface Question {
    id: string;
    paper_id: string;
    section: SectionName;
    question_number: number;

    // Content
    question_text: string;
    question_type: QuestionType;
    options: string[] | null;  // For MCQ: ["Option A", "Option B", "Option C", "Option D"]
    context_id?: string;       // Reference to shared passage/context
    context?: QuestionContext; // Populated context (joined from contexts table)
    // NOTE: correct_answer is EXCLUDED during exam, only available in results

    // Marking
    positive_marks: number;  // Default: 3.0
    negative_marks: number;  // Default: 1.0 for MCQ, 0 for TITA

    // Solution (only available after exam)
    solution_text?: string;
    solution_image_url?: string;
    video_solution_url?: string;

    // Categorization
    difficulty?: DifficultyLevel;
    topic?: string;
    subtopic?: string;

    // Management
    is_active: boolean;

    created_at: string;
    updated_at: string;
}

/** Question with correct answer (for results/admin only) */
export interface QuestionWithAnswer extends Question {
    correct_answer: string;
}

// =============================================================================
// PAPER TYPES
// =============================================================================

/** Paper difficulty levels */
export type PaperDifficulty = 'easy' | 'medium' | 'hard' | 'cat-level';

/** Paper entity from database */
export interface Paper {
    id: string;
    slug: string;
    title: string;
    description?: string;
    year: number;

    // Question & Marking Configuration
    total_questions: number;  // CAT 2024: 66
    total_marks: number;      // CAT 2024: 198

    // Timing
    duration_minutes: number;  // CAT 2024: 120 total (but 40 per section)

    // Section configuration as JSONB
    sections: SectionConfig[];

    // Marking scheme defaults
    default_positive_marks: number;  // Default: 3.0
    default_negative_marks: number;  // Default: 1.0

    // Publishing & Scheduling
    published: boolean;
    available_from?: string;
    available_until?: string;

    // Metadata
    difficulty_level?: PaperDifficulty;
    is_free: boolean;
    attempt_limit?: number;

    created_at: string;
    updated_at: string;
}

// =============================================================================
// RESPONSE/ANSWER TYPES
// =============================================================================

/** Question status in the palette - matches DB constraint */
export type QuestionStatus =
    | 'not_visited'      // Gray - Never opened
    | 'visited'          // Orange/Red - Opened but no answer
    | 'answered'         // Green - Has answer saved
    | 'marked'           // Purple - Marked for review, no answer
    | 'answered_marked'; // Purple with checkmark - Has answer AND marked for review

/** Response entity from database */
export interface Response {
    id: string;
    attempt_id: string;
    question_id: string;

    // Answer data
    answer: string | null;  // User's answer (NULL = unanswered)
    is_correct?: boolean;   // Populated after submission
    marks_obtained?: number; // +3, -1, or 0

    // State tracking
    status: QuestionStatus;
    is_marked_for_review: boolean;

    // Time analytics
    time_spent_seconds: number;
    visit_count: number;

    created_at: string;
    updated_at: string;
}

/** Response for creating/updating (without server-generated fields) */
export interface ResponseInput {
    attempt_id: string;
    question_id: string;
    answer: string | null;
    status: QuestionStatus;
    is_marked_for_review: boolean;
    time_spent_seconds: number;
    visit_count: number;
}

// =============================================================================
// ATTEMPT TYPES
// =============================================================================

/** Attempt status values - matches DB constraint */
export type AttemptStatus = 'in_progress' | 'submitted' | 'completed' | 'abandoned';

/** Section-wise score breakdown */
export interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

/** Section scores map */
export type SectionScores = Record<SectionName, SectionScore>;

/** Time remaining per section */
export type TimeRemaining = Record<SectionName, number>;

/** Attempt entity from database */
export interface Attempt {
    id: string;
    user_id: string;
    paper_id: string;

    // Timing
    started_at: string;
    submitted_at?: string;
    completed_at?: string;
    time_taken_seconds?: number;

    // Status
    status: AttemptStatus;
    current_section?: SectionName;
    current_question: number;
    time_remaining?: TimeRemaining;  // {"VARC": 2400, "DILR": 2400, "QA": 2400}

    // Scores (populated after submission)
    total_score?: number;
    max_possible_score?: number;

    // Detailed Analytics
    correct_count: number;
    incorrect_count: number;
    unanswered_count: number;

    accuracy?: number;       // (correct / attempted) * 100
    attempt_rate?: number;   // (attempted / total) * 100

    // Section-wise scores
    section_scores?: SectionScores;

    // Ranking
    percentile?: number;
    rank?: number;

    created_at: string;
    updated_at: string;
}

/** Attempt creation input */
export interface AttemptInput {
    user_id: string;
    paper_id: string;
    current_section: SectionName;
    time_remaining: TimeRemaining;
}

// =============================================================================
// EXAM ENGINE STATE TYPES (for Zustand store)
// =============================================================================

/** Exam data loaded from server */
export interface ExamData {
    paper: Paper;
    questions: Question[];
    attempt: Attempt;
}

/** Response state in Zustand store (indexed by question_id) */
export interface ResponseState {
    answer: string | null;
    status: QuestionStatus;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
    visitCount: number;
}

/** Timer state for a section */
export interface SectionTimerState {
    sectionName: SectionName;
    startedAt: number;         // Unix timestamp when section started
    durationSeconds: number;   // 40 * 60 = 2400
    remainingSeconds: number;  // Calculated: duration - elapsed
    isExpired: boolean;
}

/** Complete exam engine state */
export interface ExamEngineState {
    // Hydration
    hasHydrated: boolean;

    // Exam metadata
    attemptId: string | null;
    paperId: string | null;
    sessionToken: string | null;  // P0 FIX: Session token for multi-device/tab prevention

    // Navigation
    currentSectionIndex: number;  // 0=VARC, 1=DILR, 2=QA
    currentQuestionIndex: number; // Index within current section

    // Section locking (VARC→DILR→QA strict order)
    lockedSections: SectionName[];  // Sections that have been completed

    // Responses (keyed by question_id)
    responses: Record<string, ResponseState>;

    // Timer state per section
    sectionTimers: Record<SectionName, SectionTimerState>;

    // Question tracking
    visitedQuestions: Set<string>;
    markedQuestions: Set<string>;

    // Submission state
    isSubmitting: boolean;
    isAutoSubmitting: boolean;
}

/** Exam engine actions */
export interface ExamEngineActions {
    // Initialization
    initializeExam: (data: ExamData) => void;
    setHasHydrated: (hydrated: boolean) => void;

    // Navigation
    goToQuestion: (questionId: string, sectionIndex: number, questionIndex: number) => void;
    goToNextQuestion: () => void;
    goToPreviousQuestion: () => void;

    // Answer management
    setAnswer: (questionId: string, answer: string | null) => void;
    clearAnswer: (questionId: string) => void;
    toggleMarkForReview: (questionId: string) => void;

    // Status updates
    markQuestionVisited: (questionId: string) => void;
    updateTimeSpent: (questionId: string, seconds: number) => void;

    // Section management
    completeSection: (sectionName: SectionName) => void;
    moveToNextSection: () => void;

    // Timer
    updateSectionTimer: (sectionName: SectionName, remainingSeconds: number) => void;
    expireSection: (sectionName: SectionName) => void;

    // Submission
    setSubmitting: (isSubmitting: boolean) => void;
    setAutoSubmitting: (isAutoSubmitting: boolean) => void;

    // Reset
    resetExam: () => void;
}

/** Combined store type */
export type ExamStore = ExamEngineState & ExamEngineActions;

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Get questions for a specific section */
export function getQuestionsForSection(
    questions: Question[],
    section: SectionName
): Question[] {
    return questions
        .filter(q => q.section === section)
        .sort((a, b) => a.question_number - b.question_number);
}

/** Calculate question status based on response state */
export function calculateQuestionStatus(
    hasAnswer: boolean,
    isMarkedForReview: boolean,
    isVisited: boolean
): QuestionStatus {
    if (hasAnswer && isMarkedForReview) return 'answered_marked';
    if (isMarkedForReview) return 'marked';
    if (hasAnswer) return 'answered';
    if (isVisited) return 'visited';
    return 'not_visited';
}

/** Get section name by index */
export function getSectionByIndex(index: number): SectionName {
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    return sections[index] ?? 'VARC';
}

/** CAT 2024 constants */
export const CAT_CONSTANTS = {
    TOTAL_QUESTIONS: 66,
    TOTAL_MARKS: 198,
    TOTAL_DURATION_MINUTES: 120,
    SECTION_DURATION_MINUTES: 40,
    SECTION_DURATION_SECONDS: 40 * 60, // 2400
    POSITIVE_MARKS: 3,
    NEGATIVE_MARKS_MCQ: 1,
    NEGATIVE_MARKS_TITA: 0,
    SECTIONS: ['VARC', 'DILR', 'QA'] as const,
} as const;
