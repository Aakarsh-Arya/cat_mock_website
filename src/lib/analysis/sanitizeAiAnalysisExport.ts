/**
 * @fileoverview Sanitizer for AI analysis export payloads
 * @description Removes heavy/noisy content while preserving schema shape and analytics fields.
 */

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullifyKnownFields(record: JsonRecord, fields: readonly string[]): JsonRecord {
    const next: JsonRecord = { ...record };
    for (const field of fields) {
        if (field in next) {
            next[field] = null;
        }
    }
    return next;
}

/**
 * Sanitizes a raw `analysis_export` object according to export-noise reduction rules:
 * - Preserve schema structure and keys
 * - Nullify heavy context text and solution/media fields
 * - Preserve question stems/options and all analytics metadata
 */
export function sanitizeAiAnalysisExport<T extends object>(analysisExport: T): T {
    const source = analysisExport as JsonRecord;
    const rawSections = source.sections;
    if (!Array.isArray(rawSections)) {
        return analysisExport;
    }

    const sections = rawSections.map((section) => {
        if (!isRecord(section)) return section;

        const rawItems = section.items;
        if (!Array.isArray(rawItems)) return section;

        const items = rawItems.map((item) => {
            if (!isRecord(item)) return item;

            const question = isRecord(item.question)
                ? nullifyKnownFields(item.question, [
                    'solution_text',
                    'question_image_url',
                    'solution_image_url',
                    'video_solution_url',
                ])
                : item.question;

            const context = isRecord(item.context)
                ? nullifyKnownFields(item.context, [
                    'content_text',
                    'image_url',
                ])
                : item.context;

            return {
                ...item,
                question,
                context,
            };
        });

        return {
            ...section,
            items,
        };
    });

    return {
        ...source,
        sections,
    } as T;
}
