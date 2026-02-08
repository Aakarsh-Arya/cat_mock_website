/**
 * @fileoverview Exam Engine Library - Barrel Export
 * @description Server actions and validation schemas
 * @blueprint Milestone 4 - Feature-Sliced Design (FSD)
 */

// Server Actions
export {
    fetchPaperForExam,
    saveResponse,
    updateAttemptProgress,
    submitExam,
    fetchExamResults,
    type ActionResult,
} from './actions';

// Validation Schemas
export {
    // Base schemas
    SectionNameSchema,
    QuestionTypeSchema,
    QuestionStatusSchema,
    AttemptStatusSchema,
    DifficultySchema,
    PaperDifficultySchema,

    // Entity schemas
    SectionConfigSchema,
    QuestionSchema,
    QuestionWithAnswerSchema,
    PaperSchema,
    AttemptSchema,
    ResponseSchema,
    TimeRemainingSchema,
    SectionScoreSchema,
    SectionScoresSchema,

    // Request schemas
    FetchPaperRequestSchema,
    SaveResponseRequestSchema,
    UpdateTimerRequestSchema,
    SubmitExamRequestSchema,

    // Response schemas
    ApiResponseSchema,
    FetchPaperResponseSchema,
    SubmitExamResponseSchema,

    // Types
    type SectionNameInput,
    type QuestionInput,
    type QuestionWithAnswerInput,
    type PaperInput,
    type AttemptInput,
    type ResponseInput,
    type TimeRemainingInput,
    type SaveResponseRequest,
    type UpdateTimerRequest,
    type SubmitExamRequest,
    type FetchPaperResponse,
    type SubmitExamResponse,
} from './validation';

// Scoring Engine (Milestone 5)
export {
    calculateScore,
    calculateQuestionMarks,
    calculateTimeTaken,
    compareAnswers,
    normalizeString,
    parseAsNumber,
    type ResponseForScoring,
    type QuestionScoringResult,
    type ScoringResult,
} from './scoring';
