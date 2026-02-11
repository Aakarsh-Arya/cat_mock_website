/**
 * @fileoverview Composite Context Packet Generator — Schema v1
 * @description Builds a complete AI-analysis-ready JSON packet in sections[]-based format.
 *   Merges static paper data (questions, contexts, correct answers, solutions)
 *   with dynamic attempt data (responses, timing, telemetry, derived metrics)
 *   and user aggregate analytics.  Validates output against schema v1 before returning.
 * @blueprint AI Analysis Export — Phases 3 + 5 (docs/AI_ANALYSIS_EXPORT.md)
 */

import 'server-only';

import { getServiceRoleClient } from '@/lib/supabase/service-role';
import type { PerformanceReason, SectionName, SectionScore } from '@/types/exam';
import { compareAnswers } from '@/features/exam-engine/lib/scoring';
import { validateAiAnalysisExport } from './validateAiAnalysisExport';

// =============================================================================
// INTERNAL DB ROW TYPES (for .select() results)
// =============================================================================

interface QuestionRow {
    id: string;
    section: string;
    question_number: number;
    question_type: string;
    question_text: string;
    options: unknown;
    correct_answer?: string | null;
    solution_text?: string | null;
    solution_image_url?: string | null;
    video_solution_url?: string | null;
    positive_marks: number;
    negative_marks: number;
    topic?: string | null;
    subtopic?: string | null;
    difficulty?: string | null;
    ideal_time_seconds?: number | null;
    set_id?: string | null;
    context_id?: string | null;
    question_image_url?: string | null;
}

interface ResponseRow {
    question_id: string;
    answer?: string | null;
    is_correct?: boolean | null;
    marks_obtained?: number | null;
    status?: string | null;
    time_spent_seconds?: number | null;
    visit_count?: number | null;
    is_visited?: boolean | null;
    is_marked_for_review?: boolean;
    answer_history?: unknown;
}

type QuestionReasonMap = Record<string, PerformanceReason>;

interface QuestionSetContextRow {
    id: string;
    context_title?: string | null;
    context_body?: string | null;
    set_type?: string | null;
    section?: string | null;
    context_image_url?: string | null;
}

interface LegacyContextRow {
    id: string;
    title?: string | null;
    content?: string | null;
    context_type?: string | null;
    section?: string | null;
    image_url?: string | null;
}

interface ContextRow {
    id: string;
    title?: string | null;
    content_text?: string | null;
    content_type?: string | null;
    section?: string | null;
    image_url?: string | null;
}

// =============================================================================
// EXPORT PAYLOAD TYPES (Schema v1)
// =============================================================================

export interface SchemaExportItem {
    question: Record<string, unknown>;
    context: Record<string, unknown> | null;
    user_result: {
        answer: string | null;
        selected_option: number | null;
        is_correct: boolean | null;
        marks_obtained: number | null;
        time_spent_seconds: number | null;
        visit_count: number | null;
        is_visited: boolean | null;
        is_marked_for_review: boolean | null;
        answer_history: unknown;
        performance_reason: PerformanceReason | null;
    };
    derived: {
        attempt_state: 'correct' | 'incorrect' | 'unanswered';
        did_switch_answer: boolean;
    };
}

export interface ReasonForPerformanceMetrics {
    incorrect: number;
    concept_gap: number;
    careless_error: number;
    time_pressure: number;
    guess_unsure: number;
    tagged_incorrect: number;
    untagged_incorrect: number;
}

export interface SchemaExportSection {
    name: SectionName;
    summary: {
        score: number | null;
        time_spent_seconds: number | null;
        attempted: number;
        correct: number;
        incorrect: number;
        unanswered: number;
    };
    items: SchemaExportItem[];
}

export interface PerformanceSectionMetrics {
    total_questions: number;
    attempted_questions: number;
    unattempted_questions: number;
    correct_questions: number;
    incorrect_questions: number;
    score: number | null;
    time_spent_seconds: number | null;
    accuracy_percent: number | null;
    attempt_rate_percent: number | null;
    average_time_per_question_seconds: number | null;
}

export interface PerformanceMetrics {
    self_reported_reason: string | null;
    total_questions: number;
    attempted_questions: number;
    unattempted_questions: number;
    correct_questions: number;
    incorrect_questions: number;
    accuracy_percent: number | null;
    attempt_rate_percent: number | null;
    net_score: number | null;
    max_possible_score: number | null;
    score_percentage: number | null;
    time_taken_seconds: number | null;
    average_time_per_question_seconds: number | null;
    average_time_per_attempted_question_seconds: number | null;
    average_ideal_time_per_question_seconds: number | null;
    ideal_vs_actual_time_ratio: number | null;
    rapid_guess_count: number;
    rapid_guess_rate_percent: number | null;
    review_marked_count: number;
    revisit_count: number;
    switched_answer_count: number;
    positive_marks_earned: number | null;
    negative_marks_lost: number | null;
    marks_per_minute: number | null;
    reason_for_performance: ReasonForPerformanceMetrics;
    section_metrics: Record<SectionName, PerformanceSectionMetrics>;
}

export interface CompositeContextPacket {
    schema_meta: {
        name: 'nexams.ai_analysis_export';
        version: '1.0.0';
        paper_schema_version: string;
    };
    generated_at: string;
    meta: {
        attempt_id: string;
        user_id: string;
        paper_id: string;
        paper_key: string;
        exam_name: string;
        source: 'admin_export';
        created_from_ingest_run_id: string | null;
        notes: string | null;
        ai_customization_prompt: string | null;
        performance_reason: string | null;
    };
    paper: Record<string, unknown>;
    attempt: {
        status: string;
        started_at: string;
        submitted_at: string | null;
        scores: {
            total_score: number | null;
            max_possible_score: number | null;
            percentile: number | null;
            rank: number | null;
            section_scores: Record<string, SectionScore> | object;
        };
        counts: {
            correct: number;
            incorrect: number;
            unanswered: number;
        };
        timing: {
            time_taken_seconds: number | null;
            total_paused_seconds: number | null;
            pause_count: number | null;
            last_activity_at: string | null;
        };
        telemetry: {
            telemetry_log: unknown;
        };
        performance_metrics: PerformanceMetrics;
    };
    user_progress: {
        average_score: number | null;
        average_percentile: number | null;
        best_score: number | null;
        best_percentile: number | null;
        total_mocks_taken: number | null;
        varc_average: number | null;
        dilr_average: number | null;
        qa_average: number | null;
        weak_topics: unknown;
        strong_topics: unknown;
        target_percentile: number | null;
        target_iims: unknown;
    } | null;
    sections: SchemaExportSection[];
    raw?: Record<string, unknown> | null;
}

// =============================================================================
// DERIVED METRICS HELPERS
// =============================================================================

/** Determine attempt_state from response data */
function deriveAttemptState(
    question: QuestionRow,
    response: ResponseRow | undefined,
): 'correct' | 'incorrect' | 'unanswered' {
    const answer = response?.answer;
    const normalizedAnswer = typeof answer === 'string' ? answer.trim() : '';
    if (!response || answer == null || normalizedAnswer === '') {
        return 'unanswered';
    }

    if (response.is_correct === true) return 'correct';
    if (response.is_correct === false) return 'incorrect';

    const normalizedCorrect = typeof question.correct_answer === 'string'
        ? question.correct_answer.trim()
        : '';
    if (normalizedCorrect) {
        const qType = String(question.question_type).toUpperCase() === 'TITA' ? 'TITA' : 'MCQ';
        return compareAnswers(normalizedAnswer, normalizedCorrect, qType) ? 'correct' : 'incorrect';
    }

    if (typeof response.marks_obtained === 'number' && Number.isFinite(response.marks_obtained)) {
        return response.marks_obtained > 0 ? 'correct' : 'incorrect';
    }

    // Answer exists but grading metadata is missing; treat as attempted so analytics do not undercount.
    return 'incorrect';
}

/** Check if user changed their answer at least once */
function deriveDidSwitchAnswer(response: ResponseRow | undefined): boolean {
    if (!response) return false;
    const history = response.answer_history;
    if (!Array.isArray(history)) return false;
    return history.length > 1;
}

function roundMetric(value: number | null): number | null {
    if (value == null || !Number.isFinite(value)) return null;
    return Math.round(value * 100) / 100;
}

function percent(numerator: number, denominator: number): number | null {
    if (denominator <= 0) return null;
    return roundMetric((numerator / denominator) * 100);
}

function hasNonEmptyText(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.trim() !== '';
}

function toContextObject(ctx: ContextRow | undefined): Record<string, unknown> | null {
    if (!ctx) return null;

    const hasStimulus = hasNonEmptyText(ctx.title)
        || hasNonEmptyText(ctx.content_text)
        || hasNonEmptyText(ctx.image_url);
    if (!hasStimulus) return null;

    return {
        id: ctx.id,
        title: ctx.title ?? null,
        content_text: ctx.content_text ?? null,
        content_type: ctx.content_type ?? null,
        section: ctx.section ?? null,
        image_url: ctx.image_url ?? null,
    };
}

function resolveQuestionContextObject(
    question: QuestionRow,
    contextsMap: Map<string, ContextRow>,
): Record<string, unknown> | null {
    const setContext = question.set_id ? toContextObject(contextsMap.get(question.set_id)) : null;
    if (setContext) return setContext;
    return question.context_id ? toContextObject(contextsMap.get(question.context_id)) : null;
}

function sanitizeQuestionReasons(raw: unknown): QuestionReasonMap {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

    const allowed = new Set<PerformanceReason>([
        'concept_gap',
        'careless_error',
        'time_pressure',
        'guess',
    ]);

    const result: QuestionReasonMap = {};
    for (const [questionIdRaw, reasonRaw] of Object.entries(raw as Record<string, unknown>)) {
        const questionId = questionIdRaw.trim();
        if (!questionId || questionId.length > 128) continue;
        if (typeof reasonRaw !== 'string') continue;
        if (!allowed.has(reasonRaw as PerformanceReason)) continue;
        result[questionId] = reasonRaw as PerformanceReason;
    }

    return result;
}

// =============================================================================
// GENERATOR
// =============================================================================

export async function generateCompositeContextPacket(
    attemptId: string
): Promise<{ data: CompositeContextPacket | null; error: string | null; validationWarnings?: string[] }> {
    const admin = getServiceRoleClient();

    // ── 1) Fetch attempt ─────────────────────────────────────────────────────
    const { data: attempt, error: attemptError } = await admin
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

    if (attemptError || !attempt) {
        return { data: null, error: attemptError?.message ?? 'Attempt not found' };
    }

    // ── 2) Fetch paper ───────────────────────────────────────────────────────
    const { data: paper, error: paperError } = await admin
        .from('papers')
        .select('*')
        .eq('id', attempt.paper_id)
        .single();

    if (paperError || !paper) {
        return { data: null, error: paperError?.message ?? 'Paper not found' };
    }

    // ── 3) Fetch questions with answers (service role bypasses questions_exam) ─
    const { data: questions, error: questionsError } = await admin
        .from('questions')
        .select('id, section, question_number, question_type, question_text, options, correct_answer, solution_text, solution_image_url, video_solution_url, positive_marks, negative_marks, topic, subtopic, difficulty, ideal_time_seconds, set_id, context_id, question_image_url')
        .eq('paper_id', attempt.paper_id)
        .eq('is_active', true)
        .order('section')
        .order('question_number');

    if (questionsError) {
        return { data: null, error: questionsError.message };
    }
    const questionRows = (questions ?? []) as QuestionRow[];

    // ── 4) Fetch responses ───────────────────────────────────────────────────
    const { data: responses, error: responsesError } = await admin
        .from('responses')
        .select('question_id, answer, is_correct, marks_obtained, status, time_spent_seconds, visit_count, is_visited, is_marked_for_review, answer_history')
        .eq('attempt_id', attemptId);

    if (responsesError) {
        return { data: null, error: responsesError.message };
    }

    // ── 5) Fetch contexts for RC / DILR passages ─────────────────────────────
    const setIds = Array.from(
        new Set(
            questionRows
                .map((q: QuestionRow) => q.set_id)
                .filter((id): id is string => Boolean(id))
        )
    );
    const legacyContextIds = Array.from(
        new Set(
            questionRows
                .map((q: QuestionRow) => q.context_id)
                .filter((id): id is string => Boolean(id))
        )
    );

    const contextsMap = new Map<string, ContextRow>();
    if (setIds.length > 0) {
        const { data: setRows, error: setRowsError } = await admin
            .from('question_sets')
            .select('id, context_title, context_body, set_type, section, context_image_url')
            .in('id', setIds);

        if (setRowsError) {
            console.warn('[AI Analysis Export] Failed to fetch question_sets for context mapping:', setRowsError);
        } else {
            for (const row of (setRows ?? []) as QuestionSetContextRow[]) {
                contextsMap.set(row.id, {
                    id: row.id,
                    title: row.context_title ?? null,
                    content_text: row.context_body ?? null,
                    content_type: row.set_type ?? null,
                    section: row.section ?? null,
                    image_url: row.context_image_url ?? null,
                });
            }
        }
    }

    // Legacy fallback for older papers that still rely on question_contexts.
    if (legacyContextIds.length > 0) {
        const { data: ctxRows, error: ctxRowsError } = await admin
            .from('question_contexts')
            .select('id, title, content, context_type, section, image_url')
            .in('id', legacyContextIds);

        if (ctxRowsError) {
            console.warn('[AI Analysis Export] Failed to fetch question_contexts fallback:', ctxRowsError);
        } else {
            for (const row of (ctxRows ?? []) as LegacyContextRow[]) {
                if (contextsMap.has(row.id)) continue;
                contextsMap.set(row.id, {
                    id: row.id,
                    title: row.title ?? null,
                    content_text: row.content ?? null,
                    content_type: row.context_type ?? null,
                    section: row.section ?? null,
                    image_url: row.image_url ?? null,
                });
            }
        }
    }

    // ── 6) Fetch user aggregate analytics ────────────────────────────────────
    let userProgress: CompositeContextPacket['user_progress'] = null;
    {
        const { data: analytics } = await admin
            .from('user_analytics')
            .select('total_attempts, average_score, average_percentile, best_score, best_percentile, varc_average, dilr_average, qa_average, weak_topics, strong_topics')
            .eq('user_id', attempt.user_id)
            .maybeSingle();

        if (analytics) {
            userProgress = {
                average_score: analytics.average_score != null ? Number(analytics.average_score) : null,
                average_percentile: analytics.average_percentile != null ? Number(analytics.average_percentile) : null,
                best_score: analytics.best_score != null ? Number(analytics.best_score) : null,
                best_percentile: analytics.best_percentile != null ? Number(analytics.best_percentile) : null,
                total_mocks_taken: analytics.total_attempts ?? null,
                varc_average: analytics.varc_average != null ? Number(analytics.varc_average) : null,
                dilr_average: analytics.dilr_average != null ? Number(analytics.dilr_average) : null,
                qa_average: analytics.qa_average != null ? Number(analytics.qa_average) : null,
                weak_topics: analytics.weak_topics ?? null,
                strong_topics: analytics.strong_topics ?? null,
                target_percentile: null,
                target_iims: null,
            };
        }
    }

    // ── 7) Build response lookup ─────────────────────────────────────────────
    const responseMap = new Map<string, ResponseRow>();
    for (const r of (responses ?? []) as ResponseRow[]) {
        responseMap.set(r.question_id, r);
    }
    const questionReasonMap = sanitizeQuestionReasons(
        (attempt as { ai_analysis_question_reasons?: unknown }).ai_analysis_question_reasons
    );

    // ── 8) Group questions by section & build sections[] ─────────────────────
    const sectionOrder: SectionName[] = ['VARC', 'DILR', 'QA'];
    const sectionQuestions = new Map<SectionName, QuestionRow[]>();
    for (const s of sectionOrder) {
        sectionQuestions.set(s, []);
    }
    for (const q of questionRows) {
        const sec = q.section as SectionName;
        if (sectionQuestions.has(sec)) {
            sectionQuestions.get(sec)!.push(q);
        } else {
            // Unknown section — append to last section or create new
            if (!sectionQuestions.has(sec)) {
                sectionQuestions.set(sec, []);
            }
            sectionQuestions.get(sec)!.push(q);
        }
    }

    // Pre-parsed section_scores from attempt row
    const sectionScores: Record<string, SectionScore> = attempt.section_scores ?? {};

    const sections: SchemaExportSection[] = [];

    for (const sectionName of sectionOrder) {
        const sQuestions = sectionQuestions.get(sectionName) ?? [];
        if (sQuestions.length === 0 && !sectionScores[sectionName]) continue;

        // Sort by question_number within section
        sQuestions.sort((a, b) => a.question_number - b.question_number);

        // Compute section summary from individual items
        let sectionCorrect = 0;
        let sectionIncorrect = 0;
        let sectionUnanswered = 0;
        let sectionTimeSpent = 0;

        const items: SchemaExportItem[] = sQuestions.map((q) => {
            const resp = responseMap.get(q.id);
            const attemptState = deriveAttemptState(q, resp);
            const didSwitch = deriveDidSwitchAnswer(resp);
            const inferredIsCorrect = attemptState === 'correct'
                ? true
                : attemptState === 'incorrect'
                    ? false
                    : null;

            // Count for summary
            if (attemptState === 'correct') sectionCorrect++;
            else if (attemptState === 'incorrect') sectionIncorrect++;
            else sectionUnanswered++;

            const timeSpent = resp?.time_spent_seconds ?? 0;
            sectionTimeSpent += typeof timeSpent === 'number' ? timeSpent : 0;

            // Prefer set-based context mapping; fallback to legacy context_id when needed.
            const contextObj = resolveQuestionContextObject(q, contextsMap);

            return {
                question: {
                    question_uuid: q.id,
                    client_question_id: `${q.section}-${q.question_number}`,
                    question_number: q.question_number,
                    question_type: q.question_type,
                    question_text: q.question_text,
                    options: q.options ?? null,
                    correct_answer: q.correct_answer ?? null,
                    solution_text: q.solution_text ?? null,
                    solution_image_url: q.solution_image_url ?? null,
                    video_solution_url: q.video_solution_url ?? null,
                    marks: q.positive_marks,
                    negative_marks: q.negative_marks,
                    topic: q.topic ?? null,
                    subtopic: q.subtopic ?? null,
                    difficulty_level: q.difficulty ?? null,
                    ideal_time_seconds: q.ideal_time_seconds ?? null,
                    set_id: q.set_id ?? null,
                    context_id: q.context_id ?? q.set_id ?? null,
                    question_image_url: q.question_image_url ?? null,
                },
                context: contextObj,
                user_result: {
                    answer: resp?.answer ?? null,
                    selected_option: null,
                    is_correct: resp?.is_correct ?? inferredIsCorrect,
                    marks_obtained: resp?.marks_obtained != null ? Number(resp.marks_obtained) : null,
                    time_spent_seconds: resp?.time_spent_seconds != null ? Number(resp.time_spent_seconds) : null,
                    visit_count: resp?.visit_count != null ? Number(resp.visit_count) : null,
                    is_visited: resp?.is_visited ?? null,
                    is_marked_for_review: resp?.is_marked_for_review ?? null,
                    answer_history: Array.isArray(resp?.answer_history) ? resp.answer_history : null,
                    performance_reason: questionReasonMap[q.id] ?? null,
                },
                derived: {
                    attempt_state: attemptState,
                    did_switch_answer: didSwitch,
                },
            };
        });

        // Use DB section_scores if available, fall back to computed counts
        const dbSectionScore = sectionScores[sectionName];
        const sectionScore = dbSectionScore?.score ?? null;

        sections.push({
            name: sectionName,
            summary: {
                score: sectionScore,
                time_spent_seconds: sectionTimeSpent > 0 ? sectionTimeSpent : null,
                attempted: sectionCorrect + sectionIncorrect,
                correct: sectionCorrect,
                incorrect: sectionIncorrect,
                unanswered: sectionUnanswered,
            },
            items,
        });
    }

    // ── 9) Build composite packet (schema v1) ────────────────────────────────
    const responseRows = (responses ?? []) as ResponseRow[];
    const sectionSummaryByName = new Map(sections.map((section) => [section.name, section.summary]));

    const totalQuestions = questionRows.length;
    const totalCorrect = sections.reduce((sum, section) => sum + section.summary.correct, 0);
    const totalIncorrect = sections.reduce((sum, section) => sum + section.summary.incorrect, 0);
    const totalUnanswered = sections.reduce((sum, section) => sum + section.summary.unanswered, 0);
    const totalAttempted = totalCorrect + totalIncorrect;

    const computedTimeFromSections = sections.reduce(
        (sum, section) => sum + (section.summary.time_spent_seconds ?? 0),
        0
    );
    const timeTakenSeconds = attempt.time_taken_seconds ?? (computedTimeFromSections > 0 ? computedTimeFromSections : null);

    const marksList = responseRows
        .map((r) => (typeof r.marks_obtained === 'number' ? r.marks_obtained : null))
        .filter((v): v is number => v != null && Number.isFinite(v));
    const positiveMarksEarned = marksList.length > 0
        ? roundMetric(marksList.filter((v) => v > 0).reduce((sum, v) => sum + v, 0))
        : null;
    const negativeMarksLost = marksList.length > 0
        ? roundMetric(Math.abs(marksList.filter((v) => v < 0).reduce((sum, v) => sum + v, 0)))
        : null;

    const netScore = attempt.total_score != null
        ? Number(attempt.total_score)
        : roundMetric((positiveMarksEarned ?? 0) - (negativeMarksLost ?? 0));
    const maxPossibleScore = attempt.max_possible_score ?? paper.total_marks ?? null;

    const idealTimes = questionRows
        .map((q) => (typeof q.ideal_time_seconds === 'number' ? q.ideal_time_seconds : null))
        .filter((v): v is number => v != null && Number.isFinite(v) && v > 0);
    const idealTotalTimeSeconds = idealTimes.reduce((sum, v) => sum + v, 0);

    let rapidGuessCount = 0;
    for (const q of questionRows) {
        const response = responseMap.get(q.id);
        const state = deriveAttemptState(q, response);
        if (state === 'unanswered') continue;

        const spent = response?.time_spent_seconds;
        if (typeof spent !== 'number' || !Number.isFinite(spent) || spent < 0) continue;

        const ideal = q.ideal_time_seconds;
        const rapid = typeof ideal === 'number' && ideal > 0
            ? spent < ideal * 0.1
            : spent <= 5;
        if (rapid) rapidGuessCount += 1;
    }

    const reviewMarkedCount = responseRows.filter((r) => r.is_marked_for_review === true).length;
    const revisitCount = responseRows.filter((r) => (r.visit_count ?? 0) > 1).length;
    const switchedAnswerCount = responseRows.filter((r) => deriveDidSwitchAnswer(r)).length;

    const sectionMetrics: Record<SectionName, PerformanceSectionMetrics> = {
        VARC: {
            total_questions: 0,
            attempted_questions: 0,
            unattempted_questions: 0,
            correct_questions: 0,
            incorrect_questions: 0,
            score: null,
            time_spent_seconds: null,
            accuracy_percent: null,
            attempt_rate_percent: null,
            average_time_per_question_seconds: null,
        },
        DILR: {
            total_questions: 0,
            attempted_questions: 0,
            unattempted_questions: 0,
            correct_questions: 0,
            incorrect_questions: 0,
            score: null,
            time_spent_seconds: null,
            accuracy_percent: null,
            attempt_rate_percent: null,
            average_time_per_question_seconds: null,
        },
        QA: {
            total_questions: 0,
            attempted_questions: 0,
            unattempted_questions: 0,
            correct_questions: 0,
            incorrect_questions: 0,
            score: null,
            time_spent_seconds: null,
            accuracy_percent: null,
            attempt_rate_percent: null,
            average_time_per_question_seconds: null,
        },
    };

    for (const sectionName of sectionOrder) {
        const qRows = sectionQuestions.get(sectionName) ?? [];
        const summary = sectionSummaryByName.get(sectionName);
        const total = qRows.length;
        const attempted = summary?.attempted ?? 0;
        const correct = summary?.correct ?? 0;
        const incorrect = summary?.incorrect ?? 0;
        const unattempted = summary?.unanswered ?? Math.max(total - attempted, 0);
        const sectionTime = summary?.time_spent_seconds ?? null;

        sectionMetrics[sectionName] = {
            total_questions: total,
            attempted_questions: attempted,
            unattempted_questions: unattempted,
            correct_questions: correct,
            incorrect_questions: incorrect,
            score: summary?.score ?? sectionScores[sectionName]?.score ?? null,
            time_spent_seconds: sectionTime,
            accuracy_percent: percent(correct, attempted),
            attempt_rate_percent: percent(attempted, total),
            average_time_per_question_seconds: sectionTime != null && total > 0
                ? roundMetric(sectionTime / total)
                : null,
        };
    }

    const reasonCounts: ReasonForPerformanceMetrics = {
        incorrect: totalIncorrect,
        concept_gap: 0,
        careless_error: 0,
        time_pressure: 0,
        guess_unsure: 0,
        tagged_incorrect: 0,
        untagged_incorrect: 0,
    };

    for (const section of sections) {
        for (const item of section.items) {
            if (item.derived.attempt_state !== 'incorrect') continue;
            const reason = item.user_result.performance_reason;
            if (!reason) continue;
            reasonCounts.tagged_incorrect += 1;
            if (reason === 'concept_gap') reasonCounts.concept_gap += 1;
            else if (reason === 'careless_error') reasonCounts.careless_error += 1;
            else if (reason === 'time_pressure') reasonCounts.time_pressure += 1;
            else if (reason === 'guess') reasonCounts.guess_unsure += 1;
        }
    }
    reasonCounts.untagged_incorrect = Math.max(reasonCounts.incorrect - reasonCounts.tagged_incorrect, 0);

    const performanceMetrics: PerformanceMetrics = {
        self_reported_reason: attempt.ai_analysis_user_prompt ?? null,
        total_questions: totalQuestions,
        attempted_questions: totalAttempted,
        unattempted_questions: totalUnanswered,
        correct_questions: totalCorrect,
        incorrect_questions: totalIncorrect,
        accuracy_percent: percent(totalCorrect, totalAttempted),
        attempt_rate_percent: percent(totalAttempted, totalQuestions),
        net_score: netScore != null ? roundMetric(netScore) : null,
        max_possible_score: maxPossibleScore != null ? Number(maxPossibleScore) : null,
        score_percentage: netScore != null && maxPossibleScore != null
            ? percent(netScore, Number(maxPossibleScore))
            : null,
        time_taken_seconds: timeTakenSeconds,
        average_time_per_question_seconds: timeTakenSeconds != null && totalQuestions > 0
            ? roundMetric(timeTakenSeconds / totalQuestions)
            : null,
        average_time_per_attempted_question_seconds: timeTakenSeconds != null && totalAttempted > 0
            ? roundMetric(timeTakenSeconds / totalAttempted)
            : null,
        average_ideal_time_per_question_seconds: idealTimes.length > 0
            ? roundMetric(idealTotalTimeSeconds / idealTimes.length)
            : null,
        ideal_vs_actual_time_ratio: timeTakenSeconds != null && idealTotalTimeSeconds > 0
            ? roundMetric(timeTakenSeconds / idealTotalTimeSeconds)
            : null,
        rapid_guess_count: rapidGuessCount,
        rapid_guess_rate_percent: percent(rapidGuessCount, totalAttempted),
        review_marked_count: reviewMarkedCount,
        revisit_count: revisitCount,
        switched_answer_count: switchedAnswerCount,
        positive_marks_earned: positiveMarksEarned,
        negative_marks_lost: negativeMarksLost,
        marks_per_minute: timeTakenSeconds != null && timeTakenSeconds > 0 && netScore != null
            ? roundMetric(netScore / (timeTakenSeconds / 60))
            : null,
        reason_for_performance: reasonCounts,
        section_metrics: sectionMetrics,
    };

    const snapshotRunId: string | null = attempt.paper_ingest_run_id ?? paper.latest_ingest_run_id ?? null;

    const packet: CompositeContextPacket = {
        schema_meta: {
            name: 'nexams.ai_analysis_export',
            version: '1.0.0',
            paper_schema_version: '3.0.0',
        },
        generated_at: new Date().toISOString(),
        meta: {
            attempt_id: attempt.id,
            user_id: attempt.user_id,
            paper_id: attempt.paper_id,
            paper_key: paper.slug ?? paper.id,
            exam_name: paper.title ?? 'Untitled',
            source: 'admin_export',
            created_from_ingest_run_id: snapshotRunId,
            notes: !attempt.paper_ingest_run_id
                ? 'This attempt was created before paper version snapshotting. Question content may have changed since the attempt was taken.'
                : null,
            ai_customization_prompt: attempt.ai_analysis_user_prompt ?? null,
            performance_reason: attempt.ai_analysis_user_prompt ?? null,
        },
        paper: {
            id: paper.id,
            slug: paper.slug,
            title: paper.title,
            year: paper.year,
            description: paper.description ?? null,
            sections: paper.sections ?? [],
            total_questions: paper.total_questions,
            total_marks: paper.total_marks,
            duration_minutes: paper.duration_minutes,
            difficulty_level: paper.difficulty_level ?? null,
            published: paper.published,
        },
        attempt: {
            status: attempt.status,
            started_at: attempt.started_at ?? attempt.created_at,
            submitted_at: attempt.submitted_at ?? null,
            scores: {
                total_score: attempt.total_score ?? null,
                max_possible_score: attempt.max_possible_score ?? null,
                percentile: attempt.percentile ?? null,
                rank: attempt.rank ?? null,
                section_scores: attempt.section_scores ?? {},
            },
            counts: {
                correct: attempt.correct_count ?? 0,
                incorrect: attempt.incorrect_count ?? 0,
                unanswered: attempt.unanswered_count ?? 0,
            },
            timing: {
                time_taken_seconds: attempt.time_taken_seconds ?? null,
                total_paused_seconds: attempt.total_paused_seconds ?? null,
                pause_count: null,
                last_activity_at: attempt.last_activity_at ?? null,
            },
            telemetry: {
                telemetry_log: attempt.telemetry_log ?? null,
            },
            performance_metrics: performanceMetrics,
        },
        user_progress: userProgress,
        sections,
    };

    // ── 10) Validate against schema v1 (non-fatal) ──────────────────────────
    const validationWarnings: string[] = [];
    try {
        const { valid, errors } = validateAiAnalysisExport(packet);
        if (!valid && errors) {
            const summaries = errors.slice(0, 10).map(
                (e) => `${e.instancePath || '/'}: ${e.message}`
            );
            console.warn('[AI Analysis Export] Schema validation warnings:', summaries);
            validationWarnings.push(...summaries);
        }
    } catch (validationErr) {
        console.warn('[AI Analysis Export] Schema validator threw:', validationErr);
        validationWarnings.push(
            `Validator error: ${validationErr instanceof Error ? validationErr.message : String(validationErr)}`
        );
    }

    return { data: packet, error: null, validationWarnings };
}
