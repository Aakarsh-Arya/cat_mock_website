#!/usr/bin/env node
/*
 * markdown_to_json_parser_v3.mjs
 *
 * Parses CPM-AUTO (Compact Paper Markup — Auto Numbering) into JSON schema v3.0.
 * Usage:
 *   node scripts/markdown_to_json_parser_v3.mjs <input.md> [output.json]
 */

import fs from 'fs';
import path from 'path';
import { validatePaperSchema } from './ajv-validator.mjs';

function toBool(value) {
    if (value === undefined || value === null) return undefined;
    const v = String(value).trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
}

function toInt(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
}

function normalizeLine(line) {
    return line
        .replace(/\\_/g, '_')
        .replace(/\\>/g, '>')
        .replace(/\\\+/g, '+')
        .replace(/\\#/g, '#')
        .trim();
}

function parsePipeKeyValues(input) {
    const result = {};
    const parts = input.split('|').map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
        const eqIndex = part.indexOf('=');
        if (eqIndex === -1) continue;
        const key = part.slice(0, eqIndex).trim();
        const value = part.slice(eqIndex + 1).trim();
        result[key] = value;
    }
    return result;
}

function parsePaperLine(line) {
    const payload = line.replace(/^@P\s*/, '').trim();
    const data = parsePipeKeyValues(payload);
    const dm = (data.dm || '').split(',').map((s) => s.trim());
    const flags = {};
    if (data.flags) {
        for (const entry of data.flags.split(';')) {
            const [k, v] = entry.split('=').map((s) => s.trim());
            if (!k) continue;
            const boolVal = toBool(v);
            flags[k] = boolVal !== undefined ? boolVal : v;
        }
    }

    const schemaVersionRaw = data.v || '3.0';
    const schema_version = schemaVersionRaw.startsWith('v') ? schemaVersionRaw : `v${schemaVersionRaw}`;

    return {
        schema_version,
        paper: {
            paper_key: data.key,
            title: data.title,
            slug: data.slug,
            description: data.desc,
            year: toInt(data.year),
            total_questions: toInt(data.tq),
            total_marks: toInt(data.tm),
            duration_minutes: toInt(data.dur),
            sections: data.secs ? data.secs.split(',').map((s) => s.trim()).filter(Boolean) : [],
            default_positive_marks: toInt(dm[0]),
            default_negative_marks: toInt(dm[1]),
            difficulty_level: data.diff,
            is_free: toBool(flags.is_free) ?? undefined,
            published: toBool(flags.published) ?? undefined,
            allow_pause: toBool(flags.allow_pause) ?? undefined,
            attempt_limit: toInt(flags.attempt_limit)
        }
    };
}

function parseSetLine(line) {
    const payload = line.replace(/^@SET\s*/, '').trim();
    const firstSplit = payload.split('|');
    const setId = firstSplit[0].trim();
    const rest = firstSplit.slice(1).join('|');
    const data = parsePipeKeyValues(rest);
    return {
        setId,
        data
    };
}

function normalizeToken(value) {
    if (value === undefined || value === null) return value;
    return String(value).replace(/\\/g, '').trim();
}

function normalizeContextType(raw) {
    const value = normalizeToken(raw);
    if (!value) return undefined;
    return value;
}

function normalizeContentLayout(raw) {
    const value = normalizeToken(raw);
    if (!value) return undefined;
    if (value === 'text_only') return 'split_passage';
    if (value === 'split_view') return 'split_table';
    return value;
}

function parseQuestionLine(line) {
    const payload = line.replace(/^@Q\s*/, '').trim();
    const data = parsePipeKeyValues(payload);
    return data;
}

function parseMarkdownToV3(markdownText) {
    const lines = markdownText.split(/\r?\n/);

    let schema_version = 'v3.0';
    let paper = null;
    const question_sets = [];
    const questions = [];

    let currentSection = null;
    let currentSet = null;
    let sectionSetOrder = {};
    let setQuestionOrder = 0;
    let globalQuestionNumber = 0;

    let inContext = false;
    let contextBuffer = [];

    let inQuestion = false;
    let questionData = null;
    let questionTextLines = [];
    let solutionLines = [];
    let options = [];
    let inSolution = false;

    function finalizeContext() {
        if (currentSet && contextBuffer.length) {
            currentSet.context_body = contextBuffer.join('\n').trim();
        }
        contextBuffer = [];
        inContext = false;
    }

    function finalizeQuestion() {
        if (!questionData) return;
        const question_text = questionTextLines.join('\n').trim();
        const solution_text = solutionLines.join('\n').trim();
        const question = {
            ...questionData,
            question_text
        };
        if (options.length) {
            question.options = options;
        }
        if (solution_text) {
            question.solution_text = solution_text;
        }
        questions.push(question);

        inQuestion = false;
        inSolution = false;
        questionData = null;
        questionTextLines = [];
        solutionLines = [];
        options = [];
    }

    for (const rawLine of lines) {
        const line = normalizeLine(rawLine);
        if (!line || line.startsWith('#')) {
            continue;
        }

        if (line === '@END_CTX') {
            finalizeContext();
            continue;
        }

        if (line === '@END_Q') {
            finalizeQuestion();
            continue;
        }

        if (line === '@END_SET') {
            currentSet = null;
            setQuestionOrder = 0;
            continue;
        }

        if (line === '@END_S') {
            currentSection = null;
            continue;
        }

        if (line === '@CTX') {
            inContext = true;
            continue;
        }

        if (line.startsWith('@P ')) {
            const paperPayload = parsePaperLine(line);
            schema_version = paperPayload.schema_version;
            paper = paperPayload.paper;
            continue;
        }

        if (line.startsWith('@S ')) {
            currentSection = line.replace(/^@S\s*/, '').trim();
            if (!sectionSetOrder[currentSection]) {
                sectionSetOrder[currentSection] = 0;
            }
            continue;
        }

        if (line.startsWith('@SET ')) {
            finalizeContext();
            const { setId, data } = parseSetLine(line);
            const order = (sectionSetOrder[currentSection] || 0) + 1;
            sectionSetOrder[currentSection] = order;
            const normalizedSetId = normalizeToken(setId);
            const normalizedContextType = normalizeContextType(data.ctx);
            const normalizedContentLayout = normalizeContentLayout(data.layout);
            const normalizedSetType = normalizeToken(data.type);
            currentSet = {
                client_set_id: normalizedSetId,
                section: currentSection,
                set_type: normalizedSetType,
                display_order: order,
                context_type: normalizedContextType,
                context_title: data.title,
                content_layout: normalizedContentLayout
            };

            // Only include context_image_url if it has a valid value (schema requires URI format)
            if (data.image_url) {
                currentSet.context_image_url = data.image_url;
            }

            if (normalizedSetType === 'ATOMIC') {
                delete currentSet.context_type;
                delete currentSet.content_layout;
            }

            question_sets.push(currentSet);
            setQuestionOrder = 0;
            continue;
        }

        if (line.startsWith('@Q ')) {
            finalizeQuestion();
            const data = parseQuestionLine(line);
            setQuestionOrder += 1;
            globalQuestionNumber += 1;
            const dm = (data.m || '').split(',').map((s) => s.trim());
            const sanitizedKey = paper?.paper_key ? paper.paper_key.replace(/[^A-Za-z0-9_]/g, '_') : null;
            const client_question_id = data.id || (sanitizedKey ? `${sanitizedKey}_Q${globalQuestionNumber}` : `Q${globalQuestionNumber}`);
            questionData = {
                client_question_id,
                set_ref: currentSet?.client_set_id,
                sequence_order: setQuestionOrder,
                section: currentSection,
                question_number: globalQuestionNumber,
                question_type: data.type,
                taxonomy_type: data.tax,
                topic: data.topic,
                subtopic: data.sub,
                difficulty: data.diff,
                correct_answer: data.ans,
                positive_marks: toInt(dm[0]) ?? paper?.default_positive_marks,
                negative_marks: toInt(dm[1]) ?? paper?.default_negative_marks
            };
            inQuestion = true;
            inSolution = false;
            continue;
        }

        if (inContext) {
            contextBuffer.push(rawLine.replace(/\r?\n?$/, ''));
            continue;
        }

        if (inQuestion) {
            if (line.startsWith('?')) {
                questionTextLines.push(line.replace(/^\?\s?/, ''));
                continue;
            }
            if (/^[A-Z]\./.test(line)) {
                const optionId = line[0];
                const optionText = line.slice(2).trim();
                options.push({ id: optionId, text: optionText });
                continue;
            }
            if (line.startsWith('>')) {
                inSolution = true;
                solutionLines.push(line.replace(/^>\s?/, ''));
                continue;
            }
            if (inSolution) {
                solutionLines.push(line);
                continue;
            }
            if (questionTextLines.length) {
                questionTextLines.push(line);
            }
        }
    }

    finalizeContext();
    finalizeQuestion();

    return {
        schema_version,
        paper,
        question_sets,
        questions
    };
}

function formatAjvErrors(errors = []) {
    return errors.map((err) => {
        const path = err.instancePath || '(root)';
        const message = err.message || err.keyword || 'schema validation error';
        return `${path} ${message}`.trim();
    });
}

function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3];

    if (!inputPath) {
        console.error('Usage: node scripts/markdown_to_json_parser_v3.mjs <input.md> [output.json]');
        process.exit(1);
    }

    const markdownText = fs.readFileSync(inputPath, 'utf8');
    const result = parseMarkdownToV3(markdownText);
    const ajvResult = validatePaperSchema(result);
    const ajvErrors = ajvResult.valid ? [] : formatAjvErrors(ajvResult.errors);

    if (ajvErrors.length > 0) {
        console.error('❌ AJV schema validation errors:');
        ajvErrors.forEach((e) => console.error(`   - ${e}`));
        console.error('');
        console.log('⚠️  Writing output anyway for debugging...');
    }

    const output = JSON.stringify(result, null, 2);

    if (outputPath) {
        fs.writeFileSync(outputPath, output, 'utf8');
    } else {
        const derivedPath = path.join(process.cwd(), 'paper_v3.json');
        fs.writeFileSync(derivedPath, output, 'utf8');
        console.log(`Wrote ${derivedPath}`);
    }

    if (ajvErrors.length > 0) {
        process.exit(1);
    }
}

if (process.argv[1] && process.argv[1].includes('markdown_to_json_parser_v3.mjs')) {
    main();
}

export { parseMarkdownToV3 };
