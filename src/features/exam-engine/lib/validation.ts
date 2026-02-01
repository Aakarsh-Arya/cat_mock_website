/**
 * @fileoverview Zod Validation Schemas for Exam Engine
 * @description Schema validation for API requests and responses
 * @blueprint Milestone 4 SOP-SSOT - Phase 4.3
 */

import { z } from 'zod';

// =============================================================================
// BASE SCHEMAS
// =============================================================================

/** Section name enum */
export const SectionNameSchema = z.enum(['VARC', 'DILR', 'QA']);

/** Question type enum */
export const QuestionTypeSchema = z.enum(['MCQ', 'TITA']);

/** Question status enum */
export const QuestionStatusSchema = z.enum([
    'not_visited',
    'visited',
    'answered',
    'marked',
    'answered_marked',
]);

/** Attempt status enum */
export const AttemptStatusSchema = z.enum([
    'in_progress',
    'submitted',
    'completed',
    'abandoned',
]);

/** Difficulty level enum */
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

/** Paper difficulty enum */
export const PaperDifficultySchema = z.enum(['easy', 'medium', 'hard', 'cat-level']);

// =============================================================================
// SECTION CONFIG SCHEMA
// =============================================================================

export const SectionConfigSchema = z.object({
    name: SectionNameSchema,
    questions: z.number().int().positive(),
    time: z.number().int().positive(), // minutes
    marks: z.number().int().positive(),
});

// =============================================================================
// QUESTION SCHEMA
// =============================================================================

export const QuestionSchema = z.object({
    id: z.string().uuid(),
    paper_id: z.string().uuid(),
    section: SectionNameSchema,
    question_number: z.number().int().positive(),
    question_text: z.string().min(1),
    question_type: QuestionTypeSchema,
    options: z.array(z.string()).nullable(),
    positive_marks: z.number().default(3.0),
    negative_marks: z.number().default(1.0),
    solution_text: z.string().optional().nullable(),
    solution_image_url: z.string().url().optional().nullable(),
    video_solution_url: z.string().url().optional().nullable(),
    question_image_url: z.string().url().optional().nullable(),
    difficulty: DifficultySchema.optional().nullable(),
    topic: z.string().optional().nullable(),
    subtopic: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    created_at: z.string(),
    updated_at: z.string(),
});

/** Question with correct answer (for results) */
export const QuestionWithAnswerSchema = QuestionSchema.extend({
    correct_answer: z.string(),
});

// =============================================================================
// PAPER SCHEMA
// =============================================================================

export const PaperSchema = z.object({
    id: z.string().uuid(),
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    year: z.number().int(),
    total_questions: z.number().int().positive(),
    total_marks: z.number().int().positive(),
    duration_minutes: z.number().int().positive(),
    sections: z.array(SectionConfigSchema),
    default_positive_marks: z.number().default(3.0),
    default_negative_marks: z.number().default(1.0),
    published: z.boolean(),
    available_from: z.string().optional().nullable(),
    available_until: z.string().optional().nullable(),
    difficulty_level: PaperDifficultySchema.optional().nullable(),
    is_free: z.boolean().default(true),
    attempt_limit: z.number().int().positive().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

// =============================================================================
// ATTEMPT SCHEMA
// =============================================================================

/** Time remaining per section */
export const TimeRemainingSchema = z.object({
    VARC: z.number().int().min(0),
    DILR: z.number().int().min(0),
    QA: z.number().int().min(0),
});

/** Section scores */
export const SectionScoreSchema = z.object({
    score: z.number(),
    correct: z.number().int().min(0),
    incorrect: z.number().int().min(0),
    unanswered: z.number().int().min(0),
});

export const SectionScoresSchema = z.object({
    VARC: SectionScoreSchema.optional(),
    DILR: SectionScoreSchema.optional(),
    QA: SectionScoreSchema.optional(),
});

export const AttemptSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    paper_id: z.string().uuid(),
    started_at: z.string(),
    submitted_at: z.string().optional().nullable(),
    completed_at: z.string().optional().nullable(),
    submission_id: z.string().uuid().optional().nullable(),
    time_taken_seconds: z.number().int().optional().nullable(),
    status: AttemptStatusSchema,
    current_section: SectionNameSchema.optional().nullable(),
    current_question: z.number().int().min(1).default(1),
    time_remaining: TimeRemainingSchema.optional().nullable(),
    total_score: z.number().optional().nullable(),
    max_possible_score: z.number().optional().nullable(),
    correct_count: z.number().int().default(0),
    incorrect_count: z.number().int().default(0),
    unanswered_count: z.number().int().default(0),
    accuracy: z.number().optional().nullable(),
    attempt_rate: z.number().optional().nullable(),
    section_scores: SectionScoresSchema.optional().nullable(),
    percentile: z.number().optional().nullable(),
    rank: z.number().int().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

// =============================================================================
// RESPONSE SCHEMA
// =============================================================================

export const ResponseSchema = z.object({
    id: z.string().uuid(),
    attempt_id: z.string().uuid(),
    question_id: z.string().uuid(),
    answer: z.string().nullable(),
    is_correct: z.boolean().optional().nullable(),
    marks_obtained: z.number().optional().nullable(),
    status: QuestionStatusSchema,
    is_marked_for_review: z.boolean().default(false),
    is_visited: z.boolean().default(false),
    time_spent_seconds: z.number().int().min(0).default(0),
    visit_count: z.number().int().min(0).default(0),
    created_at: z.string(),
    updated_at: z.string(),
});

// =============================================================================
// API REQUEST SCHEMAS
// =============================================================================

/** Fetch paper request */
export const FetchPaperRequestSchema = z.object({
    paperId: z.string().uuid(),
});

/** Start attempt request */
export const StartAttemptRequestSchema = z.object({
    paperId: z.string().uuid(),
});

/** Save response request */
export const SaveResponseRequestSchema = z.object({
    attemptId: z.string().uuid(),
    questionId: z.string().uuid(),
    answer: z.string().nullable(),
    status: QuestionStatusSchema,
    isMarkedForReview: z.boolean(),
    isVisited: z.boolean().optional(),
    timeSpentSeconds: z.number().int().min(0),
    sessionToken: z.string().nullable().optional(),
    force_resume: z.boolean().optional(),
});

/** Update section timer request */
export const UpdateTimerRequestSchema = z.object({
    attemptId: z.string().uuid(),
    timeRemaining: TimeRemainingSchema,
    currentSection: SectionNameSchema,
    currentQuestion: z.number().int().min(1),
});

/** Submit exam request */
export const SubmitExamRequestSchema = z.object({
    attemptId: z.string().uuid(),
    sessionToken: z.string().nullable().optional(),
    force_resume: z.boolean().optional(),
    submissionId: z.string().uuid().optional(),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/** Generic API response wrapper */
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        data: dataSchema.optional(),
        error: z.string().optional(),
    });

/** Fetch paper response */
export const FetchPaperResponseSchema = z.object({
    paper: PaperSchema,
    questions: z.array(QuestionSchema),
    attempt: AttemptSchema,
});

/** Submit exam response */
export const SubmitExamResponseSchema = z.object({
    success: z.boolean(),
    total_score: z.number(),
    max_score: z.number(),
    correct: z.number().int(),
    incorrect: z.number().int(),
    unanswered: z.number().int(),
    accuracy: z.number(),
    attempt_rate: z.number(),
    section_scores: SectionScoresSchema,
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SectionNameInput = z.infer<typeof SectionNameSchema>;
export type QuestionInput = z.infer<typeof QuestionSchema>;
export type QuestionWithAnswerInput = z.infer<typeof QuestionWithAnswerSchema>;
export type PaperInput = z.infer<typeof PaperSchema>;
export type AttemptInput = z.infer<typeof AttemptSchema>;
export type ResponseInput = z.infer<typeof ResponseSchema>;
export type TimeRemainingInput = z.infer<typeof TimeRemainingSchema>;
export type SaveResponseRequest = z.infer<typeof SaveResponseRequestSchema>;
export type UpdateTimerRequest = z.infer<typeof UpdateTimerRequestSchema>;
export type SubmitExamRequest = z.infer<typeof SubmitExamRequestSchema>;
export type FetchPaperResponse = z.infer<typeof FetchPaperResponseSchema>;
export type SubmitExamResponse = z.infer<typeof SubmitExamResponseSchema>;
