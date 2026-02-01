import type {
    ContentLayoutType,
    ContextType,
    Question,
    QuestionContext,
    QuestionInSet,
    QuestionInSetWithAnswer,
    QuestionSetComplete,
    QuestionSetType,
    QuestionSetWithAnswers,
    QuestionWithAnswer,
    SectionName,
} from '@/types/exam';

const DEFAULT_METADATA = {} as const;

const sectionToSetType: Record<SectionName, QuestionSetType> = {
    VARC: 'VARC',
    DILR: 'DILR',
    QA: 'ATOMIC',
};

const sectionToLayout: Record<SectionName, ContentLayoutType> = {
    VARC: 'split_passage',
    DILR: 'split_chart',
    QA: 'single_focus',
};

const sectionToSetContextType: Record<SectionName, ContextType> = {
    VARC: 'rc_passage',
    DILR: 'dilr_set',
    QA: 'other_shared_stimulus',
};

const sectionToLegacyContextType: Record<SectionName, QuestionContext['context_type']> = {
    VARC: 'passage',
    DILR: 'data_set',
    QA: 'passage',
};

export function buildLegacyQuestionSets(
    questions: Question[],
    contexts: QuestionContext[],
    paperId: string
): QuestionSetComplete[] {
    const byContext = new Map<string, Question[]>();
    questions.forEach((q) => {
        if (!q.context_id) return;
        const list = byContext.get(q.context_id) ?? [];
        list.push(q);
        byContext.set(q.context_id, list);
    });

    const sets: QuestionSetComplete[] = [];

    contexts
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .forEach((context) => {
            const contextQuestions = byContext.get(context.id) ?? [];
            if (contextQuestions.length === 0) return;

            const section = context.section;
            const setId = `legacy-context-${context.id}`;
            const sortedQuestions = contextQuestions
                .slice()
                .sort((a, b) => a.question_number - b.question_number);

            const questionsInSet: QuestionInSet[] = sortedQuestions.map((q, index) => ({
                id: q.id,
                set_id: setId,
                paper_id: q.paper_id,
                section: q.section,
                sequence_order: q.sequence_order ?? index + 1,
                question_number: q.question_number,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options,
                positive_marks: q.positive_marks,
                negative_marks: q.negative_marks,
                difficulty: q.difficulty,
                topic: q.topic,
                subtopic: q.subtopic,
                question_image_url: q.question_image_url,
                is_active: q.is_active,
            }));

            sets.push({
                id: setId,
                paper_id: paperId,
                section,
                set_type: sectionToSetType[section],
                content_layout: sectionToLayout[section],
                context_type: sectionToSetContextType[section],
                context_title: context.title,
                context_body: context.content,
                context_image_url: context.image_url,
                context_additional_images: [],
                display_order: context.display_order,
                question_count: questionsInSet.length,
                metadata: DEFAULT_METADATA,
                is_active: true,
                is_published: true,
                questions: questionsInSet,
                created_at: context.created_at ?? '',
                updated_at: context.updated_at ?? '',
            });
        });

    questions
        .filter((q) => !q.context_id)
        .forEach((q) => {
            const setId = `legacy-atomic-${q.id}`;
            const questionsInSet: QuestionInSet[] = [{
                id: q.id,
                set_id: setId,
                paper_id: q.paper_id,
                section: q.section,
                sequence_order: q.sequence_order ?? 1,
                question_number: q.question_number,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options,
                positive_marks: q.positive_marks,
                negative_marks: q.negative_marks,
                difficulty: q.difficulty,
                topic: q.topic,
                subtopic: q.subtopic,
                question_image_url: q.question_image_url,
                is_active: q.is_active,
            }];

            sets.push({
                id: setId,
                paper_id: paperId,
                section: q.section,
                set_type: 'ATOMIC',
                content_layout: 'single_focus',
                context_type: undefined,
                context_title: undefined,
                context_body: undefined,
                context_image_url: undefined,
                context_additional_images: [],
                display_order: q.question_number,
                question_count: 1,
                metadata: DEFAULT_METADATA,
                is_active: true,
                is_published: true,
                questions: questionsInSet,
                created_at: q.created_at,
                updated_at: q.updated_at,
            });
        });

    return sets;
}

export function buildLegacyQuestionSetsWithAnswers(
    questions: QuestionWithAnswer[],
    contexts: QuestionContext[],
    paperId: string
): QuestionSetWithAnswers[] {
    const byContext = new Map<string, QuestionWithAnswer[]>();
    questions.forEach((q) => {
        if (!q.context_id) return;
        const list = byContext.get(q.context_id) ?? [];
        list.push(q);
        byContext.set(q.context_id, list);
    });

    const sets: QuestionSetWithAnswers[] = [];

    contexts
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .forEach((context) => {
            const contextQuestions = byContext.get(context.id) ?? [];
            if (contextQuestions.length === 0) return;

            const section = context.section;
            const setId = `legacy-context-${context.id}`;
            const sortedQuestions = contextQuestions
                .slice()
                .sort((a, b) => a.question_number - b.question_number);

            const questionsInSet: QuestionInSetWithAnswer[] = sortedQuestions.map((q, index) => ({
                id: q.id,
                set_id: setId,
                paper_id: q.paper_id,
                section: q.section,
                sequence_order: q.sequence_order ?? index + 1,
                question_number: q.question_number,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options,
                positive_marks: q.positive_marks,
                negative_marks: q.negative_marks,
                difficulty: q.difficulty,
                topic: q.topic,
                subtopic: q.subtopic,
                question_image_url: q.question_image_url,
                is_active: q.is_active,
                correct_answer: q.correct_answer,
                solution_text: q.solution_text,
                solution_image_url: q.solution_image_url,
                video_solution_url: q.video_solution_url,
            }));

            sets.push({
                id: setId,
                paper_id: paperId,
                section,
                set_type: sectionToSetType[section],
                content_layout: sectionToLayout[section],
                context_type: sectionToSetContextType[section],
                context_title: context.title,
                context_body: context.content,
                context_image_url: context.image_url,
                context_additional_images: [],
                display_order: context.display_order,
                question_count: questionsInSet.length,
                metadata: DEFAULT_METADATA,
                is_active: true,
                is_published: true,
                questions: questionsInSet,
                created_at: context.created_at ?? '',
                updated_at: context.updated_at ?? '',
            });
        });

    questions
        .filter((q) => !q.context_id)
        .forEach((q) => {
            const setId = `legacy-atomic-${q.id}`;
            const questionsInSet: QuestionInSetWithAnswer[] = [{
                id: q.id,
                set_id: setId,
                paper_id: q.paper_id,
                section: q.section,
                sequence_order: q.sequence_order ?? 1,
                question_number: q.question_number,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options,
                positive_marks: q.positive_marks,
                negative_marks: q.negative_marks,
                difficulty: q.difficulty,
                topic: q.topic,
                subtopic: q.subtopic,
                question_image_url: q.question_image_url,
                is_active: q.is_active,
                correct_answer: q.correct_answer,
                solution_text: q.solution_text,
                solution_image_url: q.solution_image_url,
                video_solution_url: q.video_solution_url,
            }];

            sets.push({
                id: setId,
                paper_id: paperId,
                section: q.section,
                set_type: 'ATOMIC',
                content_layout: 'single_focus',
                context_type: undefined,
                context_title: undefined,
                context_body: undefined,
                context_image_url: undefined,
                context_additional_images: [],
                display_order: q.question_number,
                question_count: 1,
                metadata: DEFAULT_METADATA,
                is_active: true,
                is_published: true,
                questions: questionsInSet,
                created_at: q.created_at,
                updated_at: q.updated_at,
            });
        });

    return sets;
}

export function flattenQuestionSetsToQuestions(questionSets: QuestionSetComplete[]): Question[] {
    const flattened = questionSets.flatMap((set) =>
        (set.questions ?? []).map((q) => ({
            id: q.id,
            paper_id: set.paper_id,
            section: set.section,
            question_number: q.question_number,
            set_id: set.id,
            sequence_order: q.sequence_order,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            positive_marks: q.positive_marks,
            negative_marks: q.negative_marks,
            question_image_url: q.question_image_url,
            context: set.set_type === 'ATOMIC'
                ? undefined
                : {
                    id: set.id,
                    paper_id: set.paper_id,
                    section: set.section,
                    title: set.context_title,
                    content: set.context_body ?? '',
                    context_type: sectionToLegacyContextType[set.section],
                    image_url: set.context_image_url,
                    display_order: set.display_order,
                    is_active: set.is_active,
                    created_at: set.created_at,
                    updated_at: set.updated_at,
                },
            difficulty: q.difficulty,
            topic: q.topic,
            subtopic: q.subtopic,
            is_active: q.is_active,
            created_at: set.created_at,
            updated_at: set.updated_at,
        }))
    );

    if (process.env.NODE_ENV !== 'production') {
        const seen = new Set<string>();
        const duplicates = new Set<string>();

        flattened.forEach((question) => {
            if (seen.has(question.id)) {
                duplicates.add(question.id);
            } else {
                seen.add(question.id);
            }
        });

        if (duplicates.size > 0) {
            console.warn('[ExamEngine] Detected duplicate question ids in assembled question list', {
                duplicateIds: Array.from(duplicates),
                totalQuestions: flattened.length,
            });
        }
    }

    return flattened;
}
