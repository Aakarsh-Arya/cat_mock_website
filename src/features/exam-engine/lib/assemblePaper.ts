import type { Question, QuestionInSet, QuestionSetComplete, SectionName } from '@/types/exam';
import { flattenQuestionSetsToQuestions } from '@/utils/question-sets';

const SECTION_ORDER: SectionName[] = ['VARC', 'DILR', 'QA'];

const sortSets = (a: QuestionSetComplete, b: QuestionSetComplete) => {
    if (a.section !== b.section) {
        return SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section);
    }
    const order = (a.display_order ?? 0) - (b.display_order ?? 0);
    if (order !== 0) return order;
    return a.id.localeCompare(b.id);
};

const sortQuestions = (a: QuestionInSet, b: QuestionInSet) => {
    const aSeq = a.sequence_order ?? 0;
    const bSeq = b.sequence_order ?? 0;
    if (aSeq !== bSeq) return aSeq - bSeq;
    const aNum = a.question_number ?? 0;
    const bNum = b.question_number ?? 0;
    if (aNum !== bNum) return aNum - bNum;
    return a.id.localeCompare(b.id);
};

export function assemblePaper(questionSets: QuestionSetComplete[]): {
    questionSets: QuestionSetComplete[];
    questions: Question[];
} {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    const orderedSets = [...questionSets].sort(sortSets);

    const dedupedSets = orderedSets.map((set) => {
        const orderedQuestions = [...(set.questions ?? [])].sort(sortQuestions);
        const uniqueQuestions = orderedQuestions.filter((q) => {
            if (seen.has(q.id)) {
                duplicates.add(q.id);
                return false;
            }
            seen.add(q.id);
            return true;
        });

        return {
            ...set,
            questions: uniqueQuestions,
            question_count: uniqueQuestions.length,
        };
    });

    if (process.env.NODE_ENV !== 'production' && duplicates.size > 0) {
        console.warn('[AssemblePaper] Duplicate question ids detected', {
            duplicateIds: Array.from(duplicates),
            totalDuplicates: duplicates.size,
        });
    }

    return {
        questionSets: dedupedSets,
        questions: flattenQuestionSetsToQuestions(dedupedSets),
    };
}
