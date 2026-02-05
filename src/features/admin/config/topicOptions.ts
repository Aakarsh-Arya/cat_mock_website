import type { SectionName } from '@/types/exam';

export const SECTION_TOPIC_OPTIONS: Record<SectionName, string[]> = {
    VARC: [
        'Reading Comprehension',
        'Para Jumbles',
        'Para Summary',
        'Sentence Completion',
        'Critical Reasoning',
        'Vocabulary',
        'Other',
    ],
    DILR: [
        'Tables',
        'Bar Graphs',
        'Line Graphs',
        'Venn Diagrams',
        'Games & Tournaments',
        'Arrangements',
        'Caselets',
        'Routes/Networks',
        'Other',
    ],
    QA: [
        'Arithmetic',
        'Algebra',
        'Geometry',
        'Number System',
        'Modern Math',
        'Other',
    ],
};

export const SECTION_SUBTOPIC_OPTIONS: Record<SectionName, Record<string, string[]>> = {
    VARC: {
        'Reading Comprehension': ['Inference', 'Main Idea', 'Tone', 'Fact-Based', 'Application', 'Other'],
        'Para Jumbles': ['Ordering', 'Odd Sentence Out', 'Other'],
        'Para Summary': ['Central Idea', 'Inference', 'Other'],
        'Sentence Completion': ['Fill in the Blanks', 'Other'],
        'Critical Reasoning': ['Assumption', 'Strengthen/Weaken', 'Conclusion', 'Other'],
        Vocabulary: ['Word Usage', 'Analogies', 'Other'],
        Other: ['Other'],
    },
    DILR: {
        Tables: ['Data Tables', 'Other'],
        'Bar Graphs': ['Single Bar', 'Multiple Bar', 'Other'],
        'Line Graphs': ['Single Line', 'Multiple Line', 'Other'],
        'Venn Diagrams': ['2-Set', '3-Set', 'Other'],
        'Games & Tournaments': ['Round Robin', 'Knockout', 'Other'],
        Arrangements: ['Seating', 'Ordering', 'Scheduling', 'Other'],
        Caselets: ['Logic Puzzles', 'Other'],
        'Routes/Networks': ['Paths', 'Graphs', 'Other'],
        Other: ['Other'],
    },
    QA: {
        Arithmetic: ['Percentages', 'Ratios', 'Profit & Loss', 'Time & Work', 'Time & Distance', 'Mixtures', 'Other'],
        Algebra: ['Linear Equations', 'Quadratic', 'Functions', 'Inequalities', 'Other'],
        Geometry: ['Triangles', 'Circles', 'Polygons', 'Coordinate Geometry', 'Other'],
        'Number System': ['Factors', 'Remainders', 'LCM/HCF', 'Base Systems', 'Other'],
        'Modern Math': ['Permutation & Combination', 'Probability', 'Set Theory', 'Logarithms', 'Other'],
        Other: ['Other'],
    },
};

function ensureOption(options: string[], value?: string | null): string[] {
    if (!value || value.trim() === '') return options;
    return options.includes(value) ? options : [value, ...options];
}

export function getTopicOptions(section: SectionName, current?: string | null): string[] {
    const options = SECTION_TOPIC_OPTIONS[section] ?? [];
    return ensureOption(options, current);
}

export function getSubtopicOptions(section: SectionName, topic?: string | null, current?: string | null): string[] {
    const byTopic = SECTION_SUBTOPIC_OPTIONS[section] ?? {};
    const base = (topic && byTopic[topic]) ? byTopic[topic] : ['Other'];
    return ensureOption(base, current);
}
