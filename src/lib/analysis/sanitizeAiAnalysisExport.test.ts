import { describe, expect, it } from 'vitest';
import { sanitizeAiAnalysisExport } from './sanitizeAiAnalysisExport';

describe('sanitizeAiAnalysisExport', () => {
    it('nullifies passage/solution/media fields and preserves analytics + stems', () => {
        const raw = {
            schema_meta: { name: 'nexams.ai_analysis_export', version: '1.0.0', paper_schema_version: '3.0.0' },
            generated_at: '2026-02-12T00:00:00.000Z',
            meta: { attempt_id: 'a1', user_id: 'u1', paper_id: 'p1' },
            paper: { id: 'p1', title: 'Mock' },
            attempt: {
                status: 'submitted',
                started_at: '2026-02-12T00:00:00.000Z',
                submitted_at: '2026-02-12T00:10:00.000Z',
                scores: { total_score: 10, max_possible_score: 100, percentile: 90, rank: 10, section_scores: {} },
                counts: { correct: 1, incorrect: 0, unanswered: 0 },
                timing: { time_taken_seconds: 600 },
                telemetry: { telemetry_log: null },
                performance_metrics: {
                    self_reported_reason: null,
                    total_questions: 1,
                    attempted_questions: 1,
                    unattempted_questions: 0,
                    correct_questions: 1,
                    incorrect_questions: 0,
                    accuracy_percent: 100,
                    attempt_rate_percent: 100,
                    net_score: 10,
                    max_possible_score: 100,
                    score_percentage: 10,
                    time_taken_seconds: 600,
                    average_time_per_question_seconds: 600,
                    average_time_per_attempted_question_seconds: 600,
                    average_ideal_time_per_question_seconds: 90,
                    ideal_vs_actual_time_ratio: 6.67,
                    rapid_guess_count: 0,
                    rapid_guess_rate_percent: 0,
                    review_marked_count: 0,
                    revisit_count: 0,
                    switched_answer_count: 0,
                    positive_marks_earned: 10,
                    negative_marks_lost: 0,
                    marks_per_minute: 1,
                    reason_for_performance: {
                        incorrect: 0,
                        concept_gap: 0,
                        careless_error: 0,
                        time_pressure: 0,
                        guess_unsure: 0,
                        tagged_incorrect: 0,
                        untagged_incorrect: 0,
                    },
                    section_metrics: {
                        VARC: {
                            total_questions: 1,
                            attempted_questions: 1,
                            unattempted_questions: 0,
                            correct_questions: 1,
                            incorrect_questions: 0,
                            score: 10,
                            time_spent_seconds: 600,
                            accuracy_percent: 100,
                            attempt_rate_percent: 100,
                            average_time_per_question_seconds: 600,
                        },
                        DILR: {
                            total_questions: 0,
                            attempted_questions: 0,
                            unattempted_questions: 0,
                            correct_questions: 0,
                            incorrect_questions: 0,
                            score: 0,
                            time_spent_seconds: 0,
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
                            score: 0,
                            time_spent_seconds: 0,
                            accuracy_percent: null,
                            attempt_rate_percent: null,
                            average_time_per_question_seconds: null,
                        },
                    },
                },
            },
            sections: [
                {
                    name: 'VARC',
                    summary: {
                        score: 10,
                        time_spent_seconds: 600,
                        attempted: 1,
                        correct: 1,
                        incorrect: 0,
                        unanswered: 0,
                    },
                    items: [
                        {
                            question: {
                                question_uuid: 'q1',
                                question_number: 1,
                                question_text: 'Question stem stays',
                                options: ['A', 'B', 'C', 'D'],
                                topic: 'Reading Comprehension',
                                subtopic: 'Inference',
                                difficulty_level: 'medium',
                                time_spent_seconds: 600,
                                score: 10,
                                question_image_url: 'https://cdn/q.png',
                                solution_text: 'Detailed explanation',
                                solution_image_url: 'https://cdn/s.png',
                                video_solution_url: 'https://cdn/s.mp4',
                            },
                            context: {
                                id: 'ctx-1',
                                title: 'Passage 1',
                                content_type: 'RC',
                                content_text: 'Very long passage content',
                                image_url: 'https://cdn/ctx.png',
                            },
                            user_result: {
                                answer: 'A',
                                selected_option: 1,
                                is_correct: true,
                                marks_obtained: 10,
                                time_spent_seconds: 600,
                                visit_count: 1,
                                is_visited: true,
                                is_marked_for_review: false,
                                answer_history: ['A'],
                                performance_reason: null,
                            },
                            derived: {
                                attempt_state: 'correct',
                                did_switch_answer: false,
                            },
                        },
                    ],
                },
            ],
        } as Record<string, unknown>;

        const originalQuestion = (raw.sections as Array<Record<string, unknown>>)[0]
            .items as Array<Record<string, unknown>>;
        const originalQuestionText = (originalQuestion[0].question as Record<string, unknown>).question_text;

        const sanitized = sanitizeAiAnalysisExport(raw);

        const item = (((sanitized.sections as Array<Record<string, unknown>>)[0]
            .items as Array<Record<string, unknown>>)[0]);
        const question = item.question as Record<string, unknown>;
        const context = item.context as Record<string, unknown>;

        expect(context.content_text).toBeNull();
        expect(context.image_url).toBeNull();
        expect(context.id).toBe('ctx-1');
        expect(context.title).toBe('Passage 1');
        expect(context.content_type).toBe('RC');

        expect(question.solution_text).toBeNull();
        expect(question.question_image_url).toBeNull();
        expect(question.solution_image_url).toBeNull();
        expect(question.video_solution_url).toBeNull();

        expect(question.question_text).toBe('Question stem stays');
        expect(question.options).toEqual(['A', 'B', 'C', 'D']);
        expect(question.difficulty_level).toBe('medium');
        expect(question.topic).toBe('Reading Comprehension');
        expect(question.subtopic).toBe('Inference');
        expect(question.time_spent_seconds).toBe(600);
        expect(question.score).toBe(10);

        expect((sanitized.attempt as Record<string, unknown>).performance_metrics).toEqual(
            (raw.attempt as Record<string, unknown>).performance_metrics
        );

        const rawItem = (((raw.sections as Array<Record<string, unknown>>)[0]
            .items as Array<Record<string, unknown>>)[0]);
        const rawQuestion = rawItem.question as Record<string, unknown>;
        const rawContext = rawItem.context as Record<string, unknown>;

        // Ensure function is non-mutating.
        expect(rawQuestion.solution_text).toBe('Detailed explanation');
        expect(rawContext.content_text).toBe('Very long passage content');
        expect(rawQuestion.question_text).toBe(originalQuestionText);
    });

    it('keeps key structure intact for targeted objects', () => {
        const raw = {
            sections: [
                {
                    items: [
                        {
                            question: {
                                question_text: 'Q',
                                options: ['A'],
                                solution_text: 'S',
                                question_image_url: 'QI',
                                solution_image_url: 'SI',
                                video_solution_url: 'VI',
                            },
                            context: {
                                id: 'c1',
                                title: 'T',
                                content_type: 'RC',
                                content_text: 'P',
                                image_url: 'CI',
                            },
                        },
                    ],
                },
            ],
        } as Record<string, unknown>;

        const beforeItem = (((raw.sections as Array<Record<string, unknown>>)[0]
            .items as Array<Record<string, unknown>>)[0]);
        const beforeQuestionKeys = Object.keys(beforeItem.question as Record<string, unknown>).sort();
        const beforeContextKeys = Object.keys(beforeItem.context as Record<string, unknown>).sort();

        const sanitized = sanitizeAiAnalysisExport(raw);
        const item = (((sanitized.sections as Array<Record<string, unknown>>)[0]
            .items as Array<Record<string, unknown>>)[0]);
        const afterQuestionKeys = Object.keys(item.question as Record<string, unknown>).sort();
        const afterContextKeys = Object.keys(item.context as Record<string, unknown>).sort();

        expect(afterQuestionKeys).toEqual(beforeQuestionKeys);
        expect(afterContextKeys).toEqual(beforeContextKeys);
    });
});

