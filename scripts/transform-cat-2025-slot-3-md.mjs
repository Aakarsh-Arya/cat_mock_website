#!/usr/bin/env node
/**
 * Parse CAT 2025 Slot 3 structured markdown and emit schema v3 JSON.
 * Handles both plain text format and markdown format with escaped characters.
 * Usage: node scripts/transform-cat-2025-slot-3-md.mjs <input.md> <output.json>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const VALID_CONTEXT_TYPES = new Set([
    'rc_passage',
    'dilr_set',
    'caselet',
    'data_table',
    'graph',
    'other_shared_stimulus',
]);

/**
 * Unescape markdown-escaped characters (e.g., \_ -> _, \[ -> [)
 */
function unescapeMarkdown(text) {
    if (!text) return text;
    return text
        .replace(/\\_/g, '_')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\-/g, '-')
        .replace(/\\>/g, '>')
        .replace(/\\\*/g, '*')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\=/g, '=')
        .replace(/\\#/g, '#')
        .replace(/\\!/g, '!')
        .replace(/\\~/g, '~');
}

function stripQuotes(value) {
    const trimmed = value.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return unescapeMarkdown(trimmed.slice(1, -1));
    }
    return unescapeMarkdown(trimmed);
}

function parseNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
}

function normalizeBlockLine(line) {
    return unescapeMarkdown(line)
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .trim();
}

function isBlockStart(line) {
    const normalized = normalizeBlockLine(line);
    return normalized.startsWith('Section:') || normalized === 'SET' || normalized === 'QUESTION';
}

function isKeyLine(line) {
    // Handle escaped keys like client\_set\_id: as well as client_set_id:
    return /^[A-Za-z_\\]+:\s*/.test(line);
}

function parseMultilineValue(lines, startIndex) {
    const collected = [];
    let i = startIndex;

    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trimEnd();

        if (isBlockStart(line)) break;
        if (isKeyLine(line)) break;

        // Preserve raw line (including tables) but unescape markdown
        collected.push(unescapeMarkdown(raw.replace(/\r$/, '')));
        i += 1;
    }

    return { value: collected.join('\n').trimEnd(), nextIndex: i };
}

function parseHeader(lines) {
    const header = {};
    let i = 0;

    for (; i < lines.length; i += 1) {
        const raw = lines[i];
        const line = raw.trim();

        if (!line) continue;
        if (normalizeBlockLine(line).startsWith('Section:')) break;
        if (line === '________________________________________') continue;
        if (line.startsWith('Here is the structured')) continue;
        if (line.startsWith('•')) continue;
        // Skip markdown header lines like "# CAT 2025..."
        if (line.startsWith('#')) continue;
        // Skip markdown separators (including escaped front-matter markers)
        if (line === '---' || line === '\\---' || line === '***') continue;

        // Handle escaped keys like paper\_key: value
        const match = line.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
        if (match) {
            const key = unescapeMarkdown(match[1]);
            const value = stripQuotes(match[2]);
            header[key] = parseNumber(value);
        }
    }

    return { header, nextIndex: i };
}

function normalizeContextType(value) {
    if (!value) return undefined;
    const normalized = value.trim();
    if (!VALID_CONTEXT_TYPES.has(normalized)) {
        return undefined;
    }
    return normalized;
}

function parseSetsAndQuestions(lines, startIndex, defaults) {
    const questionSets = [];
    const questions = [];

    let currentSection = null;
    let currentSet = null;
    let i = startIndex;

    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trim();

        if (!line) {
            i += 1;
            continue;
        }

        // Handle both "Section: VARC" and "**Section: VARC**"
        if (normalizeBlockLine(line).startsWith('Section:')) {
            const sectionText = normalizeBlockLine(line).replace('Section:', '').trim();
            currentSection = sectionText;
            i += 1;
            continue;
        }

        if (normalizeBlockLine(line) === 'SET') {
            currentSet = { section: currentSection };
            i += 1;

            while (i < lines.length) {
                const row = lines[i].trim();
                if (!row) {
                    i += 1;
                    continue;
                }
                if (isBlockStart(row)) break;

                if (row.startsWith('metadata:') || row.startsWith('metadata\\_:')) {
                    i += 1;
                    while (i < lines.length) {
                        const metaLine = lines[i].trim();
                        if (!metaLine) {
                            i += 1;
                            continue;
                        }
                        if (isBlockStart(metaLine)) break;
                        const metaMatch = metaLine.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
                        if (!metaMatch) break;
                        i += 1;
                    }
                    continue;
                }

                // Handle escaped keys like client\_set\_id:
                const match = row.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
                if (!match) {
                    i += 1;
                    continue;
                }

                const key = unescapeMarkdown(match[1]);
                const value = match[2];

                if (value === '|') {
                    const { value: blockValue, nextIndex } = parseMultilineValue(lines, i + 1);
                    currentSet[key] = blockValue;
                    i = nextIndex;
                    continue;
                }

                currentSet[key] = stripQuotes(value);
                i += 1;
            }

            if (currentSet) {
                if (!currentSet.section && currentSection) currentSet.section = currentSection;
                if (currentSet.display_order !== undefined) {
                    currentSet.display_order = Number(currentSet.display_order);
                }
                if (currentSet.context_type) {
                    const normalized = normalizeContextType(String(currentSet.context_type));
                    if (!normalized) {
                        delete currentSet.context_type;
                    } else {
                        currentSet.context_type = normalized;
                    }
                }

                questionSets.push(currentSet);
            }
            continue;
        }

        if (normalizeBlockLine(line) === 'QUESTION') {
            const question = { set_ref: currentSet?.client_set_id, section: currentSection };
            i += 1;

            while (i < lines.length) {
                const row = lines[i].trim();
                if (!row) {
                    i += 1;
                    continue;
                }
                if (isBlockStart(row)) break;

                // Handle escaped keys like client\_question\_id:
                const match = row.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
                if (!match) {
                    i += 1;
                    continue;
                }

                const key = unescapeMarkdown(match[1]);
                const value = match[2];

                if (key === 'options') {
                    if (value.trim() === 'null') {
                        question.options = null;
                        i += 1;
                        continue;
                    }

                    const opts = [];
                    i += 1;
                    while (i < lines.length) {
                        const optLine = lines[i].trim();
                        if (!optLine) {
                            i += 1;
                            continue;
                        }

                        const optMatch = optLine.match(/^([A-D]):\s*(.*)$/);
                        if (optMatch) {
                            // Store as plain text string (DB expects string array, not {id, text} objects)
                            opts.push(stripQuotes(optMatch[2]));
                            i += 1;
                            continue;
                        }

                        if (isBlockStart(optLine) || isKeyLine(optLine)) break;
                        i += 1;
                    }
                    question.options = opts.length ? opts : null;
                    continue;
                }

                if (value === '|') {
                    const { value: blockValue, nextIndex } = parseMultilineValue(lines, i + 1);
                    question[key] = blockValue;
                    i = nextIndex;
                    continue;
                }

                question[key] = stripQuotes(value);
                i += 1;
            }

            if (!question.section && currentSection) question.section = currentSection;
            if (question.question_number !== undefined) question.question_number = Number(question.question_number);
            if (question.sequence_order !== undefined) question.sequence_order = Number(question.sequence_order);

            const defaultPositive = Number(defaults.default_positive_marks ?? 3);
            const defaultNegative = Number(defaults.default_negative_marks ?? 1);

            question.positive_marks = Number.isFinite(defaultPositive) ? defaultPositive : 3;
            question.negative_marks = question.question_type === 'TITA' ? 0 : (Number.isFinite(defaultNegative) ? defaultNegative : 1);

            if (question.difficulty) {
                const normalized = String(question.difficulty).trim().toLowerCase();
                if (normalized === 'difficult') {
                    question.difficulty = 'hard';
                } else if (['easy', 'medium', 'hard'].includes(normalized)) {
                    question.difficulty = normalized;
                } else {
                    delete question.difficulty;
                }
            }

            questions.push(question);
            continue;
        }

        i += 1;
    }

    const setMap = new Map(questionSets.map(set => [set.client_set_id, set]));
    for (const question of questions) {
        if (question.section === 'VARC' && typeof question.subtopic === 'string') {
            const subtopic = question.subtopic.toLowerCase();
            if (subtopic.includes('para jumble')) {
                const set = setMap.get(question.set_ref);
                if (set) {
                    set.context_body = '';
                    set.context_title = '';
                    delete set.context_type;
                }
            }
        }
    }

    return { questionSets, questions };
}

function buildPaper(header, defaults) {
    return {
        paper_key: header.paper_key ?? 'CAT_2025_SLOT3',
        title: header.title ?? 'CAT 2025 Slot 3',
        slug: header.slug ?? 'cat-2025-slot-3',
        description: header.import_notes ?? header.source_pdf ?? 'CAT 2025 Slot 3 Question Paper',
        year: Number(header.year ?? 2025),
        total_questions: Number(header.total_questions ?? 68),
        total_marks: Number(header.total_marks ?? 198),
        duration_minutes: Number(header.duration_minutes ?? 120),
        sections: ['VARC', 'DILR', 'QA'],
        default_positive_marks: Number(defaults.default_positive_marks ?? 3),
        default_negative_marks: Number(defaults.default_negative_marks ?? 1),
        difficulty_level: 'cat-level',
        is_free: true,
        published: false,
        allow_pause: true,
        attempt_limit: 0,
    };
}

function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3] ?? 'data/CAT-2025-Slot-3-v3.json';

    if (!inputPath) {
        console.error('Usage: node scripts/transform-cat-2025-slot-3-md.mjs <input.txt> <output.json>');
        process.exit(1);
    }

    const resolvedInput = resolve(process.cwd(), inputPath);
    if (!existsSync(resolvedInput)) {
        console.error(`❌ File not found: ${resolvedInput}`);
        process.exit(1);
    }

    const resolvedOutput = resolve(process.cwd(), outputPath);

    const raw = readFileSync(resolvedInput, 'utf-8').replace(/\r\n/g, '\n');
    const lines = raw.split('\n');

    const { header, nextIndex } = parseHeader(lines);
    const defaults = {
        default_positive_marks: header.default_positive_marks ?? 3,
        default_negative_marks: header.default_negative_marks ?? 1,
    };

    const { questionSets, questions } = parseSetsAndQuestions(lines, nextIndex, defaults);

    const output = {
        schema_version: 'v3.0',
        paper: buildPaper(header, defaults),
        question_sets: questionSets,
        questions,
    };

    writeFileSync(resolvedOutput, JSON.stringify(output, null, 2));
    console.log(`✅ Parsed ${questionSets.length} sets and ${questions.length} questions.`);
    console.log(`📄 Output: ${resolvedOutput}`);
}

main();
