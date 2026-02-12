/**
 * @fileoverview Exam Engine Type Definitions
 * @description TypeScript interfaces matching the "Nuclear Fix" database schema
 * @blueprint Milestone 4 SOP-SSOT - Phase 1.1
 * @optimization Implements Base Entities, Readonly constraints, and Shared Interfaces
 */

// =============================================================================
// SHARED INTERFACES (DRY & UTILITY)
// =============================================================================

/** Base entity fields for almost all DB tables */
export interface BaseEntity {
    readonly id: string;
    readonly created_at: string;
    readonly updated_at: string;
}

/** Entities that track active/inactive state */
export interface Activable {
    readonly is_active: boolean;
}

/** Entities that track start/end/duration */
export interface TimeTracked {
    readonly started_at: string;
    readonly completed_at?: string;
    readonly time_taken_seconds?: number;
}

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

/** Short display labels for sections used in analytics UI */
export const SECTION_DISPLAY_LABELS: Record<SectionName, string> = {
    VARC: 'VARC',
    DILR: 'LRDI',
    QA: 'QA',
} as const;

/** Get short display label for a section */
export function getSectionDisplayLabel(section: SectionName): string {
    return SECTION_DISPLAY_LABELS[section] ?? section;
}

/** Section configuration from paper.sections JSONB */
export interface SectionConfig {
    readonly name: SectionName;
    readonly questions: number;  // VARC: 24, DILR: 20, QA: 22
    readonly time: number;       // Minutes (40)
    readonly marks: number;
}

/** CAT 2024 default section configuration */
export const CAT_2024_SECTIONS: readonly SectionConfig[] = [
    { name: 'VARC', questions: 24, time: 40, marks: 72 },
    { name: 'DILR', questions: 20, time: 40, marks: 60 },
    { name: 'QA', questions: 22, time: 40, marks: 66 },
] as const;

// =============================================================================
// QUESTION TYPES
// =============================================================================

export type QuestionType = 'MCQ' | 'TITA';

export interface MCQOptions {
    readonly A: string;
    readonly B: string;
    readonly C: string;
    readonly D: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// =============================================================================
// QUESTION CONTAINER ARCHITECTURE (Parent-Child Model)
// =============================================================================

export type QuestionSetType = 'VARC' | 'DILR' | 'CASELET' | 'ATOMIC';

export type ContextType =
    | 'rc_passage'
    | 'dilr_set'
    | 'caselet'
    | 'data_table'
    | 'graph'
    | 'other_shared_stimulus';

export type ContentLayoutType =
    | 'split_passage'
    | 'split_chart'
    | 'split_table'
    | 'single_focus'
    | 'image_top';

export interface QuestionSetMetadata {
    readonly difficulty?: DifficultyLevel;
    readonly topic?: string;
    readonly subtopic?: string;
    readonly tags?: readonly string[];
    readonly source?: string;
    readonly estimated_time_minutes?: number;
    /** Where to place the context image relative to text: 'before' (default), 'after', 'after_para_1', 'after_para_2', etc. */
    readonly image_position?: 'before' | 'after' | `after_para_${number}`;
}

/** Question Set Entity (Parent Container) */
export interface QuestionSet extends BaseEntity, Activable {
    readonly paper_id: string;
    readonly section: SectionName;

    // Set classification
    readonly set_type: QuestionSetType;
    readonly content_layout: ContentLayoutType;
    readonly context_type?: ContextType | null;

    // Context content
    readonly context_title?: string;
    readonly context_body?: string;
    readonly context_image_url?: string;
    readonly context_additional_images?: ReadonlyArray<{
        readonly url: string;
        readonly caption?: string;
    }>;

    // Display configuration
    readonly display_order: number;
    readonly question_count: number;

    // Metadata
    readonly metadata: QuestionSetMetadata;
    readonly is_published: boolean;

    // Child questions (populated via JOIN)
    readonly questions?: readonly QuestionInSet[];
}

/** Question within a Set (Child entity) */
export interface QuestionInSet {
    readonly id: string;
    readonly set_id: string;
    readonly paper_id: string;
    readonly section: SectionName;

    // Position
    readonly sequence_order: number;
    readonly question_number: number;

    // Content
    readonly question_text: string;
    readonly question_type: QuestionType;
    readonly options: readonly string[] | null;

    // Marking
    readonly positive_marks: number;
    readonly negative_marks: number;

    // Categorization
    readonly difficulty?: DifficultyLevel;
    readonly topic?: string;
    readonly subtopic?: string;

    // Media
    readonly question_image_url?: string;

    // Management
    readonly is_active: boolean;
}

/** Question in Set with correct answer (admin/results only) */
export interface QuestionInSetWithAnswer extends QuestionInSet {
    readonly correct_answer: string;
    readonly solution_text?: string;
    readonly solution_image_url?: string;
    readonly video_solution_url?: string;
}

export interface QuestionSetComplete extends QuestionSet {
    readonly questions: readonly QuestionInSet[];
}

export interface QuestionSetWithAnswers extends QuestionSet {
    readonly questions: readonly QuestionInSetWithAnswer[];
}

// Helpers
export function isCompositeSet(setType: QuestionSetType): boolean {
    return setType === 'VARC' || setType === 'DILR' || setType === 'CASELET';
}

export function isSplitLayout(layout: ContentLayoutType): boolean {
    return layout.startsWith('split_');
}

// =============================================================================
// LEGACY: Context/Passage (Deprecated)
// =============================================================================

/** @deprecated Use QuestionSet instead */
export interface QuestionContext extends BaseEntity, Activable {
    readonly paper_id: string;
    readonly section: SectionName;
    readonly title?: string;
    readonly content: string;
    readonly context_type: 'passage' | 'data_set' | 'image' | 'table';
    readonly image_url?: string;
    readonly display_order: number;
}

/** Question entity from database */
export interface Question extends BaseEntity, Activable {
    readonly paper_id: string;
    readonly section: SectionName;
    readonly question_number: number;

    // Relationships
    readonly set_id?: string | null;
    readonly sequence_order?: number | null;
    readonly exam_order?: number;

    // Content
    readonly question_text: string;
    readonly question_type: QuestionType;
    readonly question_format?: QuestionType;
    readonly taxonomy_type?: string;
    readonly topic_tag?: string;
    readonly difficulty_rationale?: string;
    readonly options: readonly string[] | null;
    readonly context_id?: string;
    readonly context?: QuestionContext;

    // Marking
    readonly positive_marks: number;
    readonly negative_marks: number;

    // Solution
    readonly solution_text?: string;
    readonly solution_image_url?: string;
    readonly video_solution_url?: string;
    readonly question_image_url?: string;

    // Categorization
    readonly difficulty?: DifficultyLevel;
    readonly topic?: string;
    readonly subtopic?: string;
}

export interface QuestionWithAnswer extends Question {
    readonly correct_answer: string;
}

// =============================================================================
// STATISTICS TYPES
// =============================================================================

export interface QuestionStats {
    readonly total: number;
    readonly options: Readonly<Record<string, number>>;
}

export type PaperStats = Record<string, QuestionStats>;

// =============================================================================
// PAPER TYPES
// =============================================================================

export type PaperDifficulty = 'easy' | 'medium' | 'hard' | 'cat-level';

export interface Paper extends BaseEntity {
    readonly slug: string;
    readonly title: string;
    readonly description?: string;
    readonly year: number;

    // Configuration
    readonly total_questions: number;
    readonly total_marks: number;
    readonly duration_minutes: number;
    readonly sections: readonly SectionConfig[];

    // Marking Defaults
    readonly default_positive_marks: number;
    readonly default_negative_marks: number;

    // Publishing
    readonly published: boolean;
    readonly available_from?: string;
    readonly available_until?: string;

    // Metadata
    readonly difficulty_level?: PaperDifficulty;
    readonly is_free: boolean;
    readonly attempt_limit?: number;
    readonly allow_pause?: boolean;
}

// =============================================================================
// RESPONSE/ANSWER TYPES
// =============================================================================

export type QuestionStatus =
    | 'not_visited'
    | 'visited'
    | 'answered'
    | 'marked'
    | 'answered_marked';

export type PerformanceReason = 'concept_gap' | 'careless_error' | 'time_pressure' | 'guess';
export type AIQuestionReasonMap = Record<string, PerformanceReason>;

/** Response entity from database */
export interface Response extends BaseEntity {
    readonly attempt_id: string;
    readonly question_id: string;

    // Answer data
    readonly answer: string | null;
    readonly is_correct?: boolean;
    readonly marks_obtained?: number;

    // State
    readonly status: QuestionStatus;
    readonly is_marked_for_review: boolean;
    readonly is_visited: boolean;

    // Analytics
    readonly time_spent_seconds: number;
    readonly visit_count: number;
}

/** Response input (no server fields) */
export interface ResponseInput {
    readonly attempt_id: string;
    readonly question_id: string;
    readonly answer: string | null;
    readonly status: QuestionStatus;
    readonly is_marked_for_review: boolean;
    readonly is_visited: boolean;
    readonly time_spent_seconds: number;
    readonly visit_count: number;
}

// =============================================================================
// ATTEMPT TYPES
// =============================================================================

export type AttemptStatus = 'in_progress' | 'paused' | 'submitted' | 'completed' | 'abandoned' | 'expired';

/** AI analysis lifecycle states (matches ai_analysis_status_type enum in DB) */
export type AIAnalysisStatus = 'none' | 'requested' | 'exported' | 'processed' | 'failed';

/** History entry for each AI insight request on an attempt */
export interface AIRequestHistoryEntry {
    readonly request_number: number;
    readonly user_prompt: string | null;
    readonly question_reasons: AIQuestionReasonMap | null;
    readonly requested_at: string;
    readonly status: AIAnalysisStatus;
}

export interface SectionScore {
    readonly score: number;
    readonly correct: number;
    readonly incorrect: number;
    readonly unanswered: number;
}

export type SectionScores = Record<SectionName, SectionScore>;
export type TimeRemaining = Record<SectionName, number>;

export interface Attempt extends BaseEntity, TimeTracked {
    readonly user_id: string;
    readonly paper_id: string;

    // Timing specifics
    readonly submitted_at?: string;
    readonly submission_id?: string;
    readonly paused_at?: string | null;
    readonly total_paused_seconds?: number | null;

    // Status
    readonly status: AttemptStatus;
    readonly current_section?: SectionName;
    readonly current_question: number;
    readonly time_remaining?: TimeRemaining;

    // Scores
    readonly total_score?: number;
    readonly max_possible_score?: number;

    // Analytics
    readonly correct_count: number;
    readonly incorrect_count: number;
    readonly unanswered_count: number;
    readonly accuracy?: number;
    readonly attempt_rate?: number;
    readonly section_scores?: SectionScores;

    // Ranking
    readonly percentile?: number;
    readonly rank?: number;

    // AI Analysis lifecycle (Migration 031)
    readonly ai_analysis_status?: AIAnalysisStatus;
    readonly ai_analysis_requested_at?: string;
    readonly ai_analysis_exported_at?: string;
    readonly ai_analysis_processed_at?: string;
    readonly ai_analysis_error?: string | null;
    readonly ai_analysis_user_prompt?: string | null;
    readonly ai_analysis_result_text?: string | null;
    readonly ai_analysis_question_reasons?: AIQuestionReasonMap | null;
    /** Number of AI insight requests made for this attempt */
    readonly ai_analysis_request_count?: number;
    /** History of all AI insight requests (array of {prompt, requested_at, status}) */
    readonly ai_analysis_request_history?: readonly AIRequestHistoryEntry[] | null;

    // Paper version snapshot (set at attempt creation, Migration 031)
    readonly paper_ingest_run_id?: string | null;
}

export interface AttemptInput {
    readonly user_id: string;
    readonly paper_id: string;
    readonly current_section: SectionName;
    readonly time_remaining: TimeRemaining;
}

// =============================================================================
// EXAM ENGINE STATE TYPES (Zustand)
// =============================================================================

export interface ExamData {
    readonly paper: Paper;
    readonly questions: readonly Question[];
    readonly attempt: Attempt;
    readonly responses?: readonly Response[];
}

export interface ResponseState {
    readonly answer: string | null;
    readonly status: QuestionStatus;
    readonly isMarkedForReview: boolean;
    readonly timeSpentSeconds: number;
    readonly visitCount: number;
    /** Time spent on each individual visit (array of seconds per visit) */
    readonly timePerVisit: readonly number[];
    /** User's personal note for this question (max 50 words) */
    readonly userNote: string;
}

export interface SectionTimerState {
    readonly sectionName: SectionName;
    readonly startedAt: number;
    readonly durationSeconds: number;
    readonly remainingSeconds: number;
    readonly isExpired: boolean;
}

export interface ExamEngineState {
    // System State
    readonly hasHydrated: boolean;
    readonly isInitialized: boolean;
    readonly attemptId: string | null;
    readonly paperId: string | null;
    readonly sessionToken: string | null;

    // Navigation
    readonly currentSectionIndex: number;
    readonly currentQuestionIndex: number;
    readonly lockedSections: readonly SectionName[];

    // Data
    readonly responses: Record<string, ResponseState>;
    readonly pendingSyncResponses: Record<string, { answer: string | null; timestamp: number }>;
    readonly lastSyncTimestamp: number;
    readonly sectionTimers: Record<SectionName, SectionTimerState>;

    /** Per-section ordered log of question IDs visited (may repeat) */
    readonly sectionVisitOrder: Record<SectionName, readonly string[]>;
    /** Timestamp when the current question was entered (for per-visit time tracking) */
    readonly currentQuestionEnteredAt: number;

    // Sets
    readonly visitedQuestions: ReadonlySet<string>;
    readonly markedQuestions: ReadonlySet<string>;

    // Submission
    readonly isSubmitting: boolean;
    readonly isAutoSubmitting: boolean;
}

export interface ExamEngineActions {
    // Initialization
    initializeExam: (data: ExamData) => void;
    setHasHydrated: (hydrated: boolean) => void;
    setSessionToken: (token: string | null) => void;

    // Navigation
    goToQuestion: (qId: string, sIdx: number, qIdx: number) => void;
    goToNextQuestion: () => void;
    goToPreviousQuestion: () => void;

    // Answers
    setLocalAnswer: (qId: string, answer: string | null) => void;
    saveAnswer: (qId: string, answer: string | null) => void;
    /** @deprecated Use setLocalAnswer or saveAnswer instead */
    setAnswer: (qId: string, answer: string | null) => void;
    clearAnswer: (qId: string) => void;
    setResponseStatus: (qId: string, status: QuestionStatus, isMarked?: boolean) => void;
    toggleMarkForReview: (qId: string) => void;

    // Sync
    queuePendingSync: (qId: string, answer: string | null) => void;
    clearPendingSync: (qIds?: string[]) => void;
    setLastSyncTimestamp: (ts: number) => void;

    // Status
    markQuestionVisited: (qId: string) => void;
    updateTimeSpent: (qId: string, seconds: number) => void;
    /** Set user note for a question (max 50 words) */
    setUserNote: (qId: string, note: string) => void;

    // Section
    completeSection: (name: SectionName) => void;
    moveToNextSection: () => void;

    // Timer
    updateSectionTimer: (name: SectionName, remaining: number) => void;
    setSectionTimerOverride: (name: SectionName, remaining: number) => void;
    expireSection: (name: SectionName) => void;

    // Submission
    setSubmitting: (isSubmitting: boolean) => void;
    setAutoSubmitting: (isAutoSubmitting: boolean) => void;

    // Reset
    resetExam: () => void;
}

export type ExamStore = ExamEngineState & ExamEngineActions;

// =============================================================================
// UTILITY TYPES & HELPERS
// =============================================================================

/** Get questions for a section (Optimized with slice to prevent mutation) */
export function getQuestionsForSection(
    questions: readonly Question[],
    section: SectionName
): Question[] {
    return questions
        .filter(q => q.section === section)
        .slice() // Create copy before sorting
        .sort((a, b) => a.question_number - b.question_number);
}

export function calculateQuestionStatus(
    hasAnswer: boolean,
    isMarkedForReview: boolean,
    isVisited: boolean
): QuestionStatus {
    if (hasAnswer) return isMarkedForReview ? 'answered_marked' : 'answered';
    if (isMarkedForReview) return 'marked';
    return isVisited ? 'visited' : 'not_visited';
}

export function getSectionByIndex(index: number): SectionName {
    const sections: readonly SectionName[] = ['VARC', 'DILR', 'QA'];
    return sections[index] ?? 'VARC';
}

export const CAT_CONSTANTS = {
    TOTAL_QUESTIONS: 66,
    TOTAL_MARKS: 198,
    TOTAL_DURATION_MINUTES: 120,
    SECTION_DURATION_MINUTES: 40,
    SECTION_DURATION_SECONDS: 2400,
    POSITIVE_MARKS: 3,
    NEGATIVE_MARKS_MCQ: 1,
    NEGATIVE_MARKS_TITA: 0,
    SECTIONS: ['VARC', 'DILR', 'QA'] as const,
} as const;

// =============================================================================
// DYNAMIC TIMING HELPERS
// =============================================================================

export function getSectionDurationSecondsMap(
    sections?: readonly SectionConfig[] | null
): Record<SectionName, number> {
    const defaults: Record<SectionName, number> = {
        VARC: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
        DILR: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
        QA: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
    };

    if (!sections?.length) return defaults;

    // Apply overrides without mutating defaults
    return sections.reduce((acc, section) => {
        if (section.time > 0) {
            acc[section.name] = section.time * 60;
        }
        return acc;
    }, { ...defaults });
}

export function getPaperTotalDurationSeconds(sections?: readonly SectionConfig[] | null): number {
    if (!sections?.length) return CAT_CONSTANTS.TOTAL_DURATION_MINUTES * 60;

    const totalMinutes = sections.reduce((sum, s) => sum + (s.time || 0), 0);
    return Math.max(1, totalMinutes) * 60;
}

// =============================================================================
// RBAC TYPES (Milestone 6+)
// =============================================================================

export type AppRole = 'user' | 'admin' | 'editor' | 'dev';

export interface UserRole extends BaseEntity {
    readonly user_id: string;
    readonly role: AppRole;
    readonly granted_by?: string;
    readonly granted_at: string;
}

export interface JWTClaims {
    readonly user_role?: AppRole;
    readonly app_metadata?: {
        readonly user_role?: AppRole;
    };
    readonly sub: string;
    readonly email?: string;
    readonly exp: number;
    readonly iat: number;
}

export interface AdminAuditLog extends BaseEntity {
    readonly admin_id: string;
    readonly action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
    readonly entity_type: 'paper' | 'question' | 'context' | 'user_role';
    readonly entity_id: string;
    readonly changes?: Record<string, { before: unknown; after: unknown }>;
    readonly ip_address?: string;
    readonly user_agent?: string;
}
