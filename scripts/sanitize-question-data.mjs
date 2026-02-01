#!/usr/bin/env node
/**
 * sanitize-question-data.mjs
 * 
 * Sanitizes question paper JSON/JSONC files by replacing actual content
 * with placeholders while preserving the schema structure.
 * 
 * Usage: node scripts/sanitize-question-data.mjs
 * 
 * This script:
 * 1. Reads all JSON/JSONC files from /data
 * 2. Detects question paper files (by keys like paper, questions, contexts)
 * 3. Replaces sensitive text fields with placeholders
 * 4. Truncates arrays to 1 example + note
 * 5. Writes sanitized copies to .export_sanitized/data/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUTPUT_DIR = path.join(ROOT_DIR, 'data_sanitized');

// Fields that should be redacted (contain actual question/passage content)
const SENSITIVE_TEXT_FIELDS = [
    'question_text',
    'text',
    'passage',
    'passage_text',
    'solution_text',
    'explanation',
    'hint',
    'context_text',
];

// Fields that are options arrays
const OPTIONS_FIELDS = ['options'];

// Fields that are answers
const ANSWER_FIELDS = ['correct_answer', 'answer', 'correct_option'];

/**
 * Strip JSONC comments and parse as JSON
 */
function parseJsonc(content) {
    // Remove single-line comments (// ...)
    let cleaned = content.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments (/* ... */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(cleaned);
}

/**
 * Check if a file looks like a question paper JSON
 */
function isQuestionPaperFile(data) {
    if (typeof data !== 'object' || data === null) return false;

    // Check for common question paper keys
    const hasQuestions = 'questions' in data ||
        (Array.isArray(data) && data.some(item => 'question_text' in item));
    const hasPaper = 'paper' in data;
    const hasContexts = 'contexts' in data;

    return hasQuestions || hasPaper || hasContexts;
}

/**
 * Sanitize a single value based on its key
 */
function sanitizeValue(key, value) {
    const lowerKey = key.toLowerCase();

    // Check if it's a sensitive text field - redact regardless of length
    if (SENSITIVE_TEXT_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
        if (typeof value === 'string') {
            return `<${key.toUpperCase()}_OMITTED>`;
        }
    }

    // Check if it's an options field
    if (OPTIONS_FIELDS.some(field => lowerKey === field.toLowerCase())) {
        if (Array.isArray(value) && value.length > 0) {
            return ['<OPTION_A>', '<OPTION_B>', '<OPTION_C>', '<OPTION_D>'].slice(0, Math.min(value.length, 4));
        }
    }

    // Check if it's an answer field
    if (ANSWER_FIELDS.some(field => lowerKey === field.toLowerCase())) {
        return '<ANSWER_OMITTED>';
    }

    return value;
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj, depth = 0) {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        if (obj.length === 0) return obj;

        // For question/context arrays, keep only first item with a note
        const firstItemKeys = typeof obj[0] === 'object' && obj[0] !== null ? Object.keys(obj[0]) : [];
        const isQuestionOrContextArray = firstItemKeys.some(k =>
            ['question_text', 'text', 'question_number', 'id', 'title'].includes(k)
        );

        if (isQuestionOrContextArray && obj.length > 1) {
            const sanitizedFirst = sanitizeObject(obj[0], depth + 1);
            return [
                sanitizedFirst,
                { '_NOTE': `... ${obj.length - 1} more items omitted (total: ${obj.length}) ...` }
            ];
        }

        return obj.map(item => sanitizeObject(item, depth + 1));
    }

    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                result[key] = sanitizeObject(value, depth + 1);
            } else {
                result[key] = sanitizeValue(key, value);
            }
        }
        return result;
    }

    return obj;
}

/**
 * Generate a schema description for the file
 */
function generateSchemaDescription(data) {
    const schema = {
        _SCHEMA_NOTE: 'This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.',
        _ORIGINAL_STRUCTURE: describeStructure(data)
    };
    return schema;
}

/**
 * Describe the structure of data for schema documentation
 */
function describeStructure(data, depth = 0) {
    if (depth > 3) return '...';

    if (data === null) return 'null';
    if (Array.isArray(data)) {
        if (data.length === 0) return '[]';
        return `Array<${describeStructure(data[0], depth + 1)}> (${data.length} items)`;
    }
    if (typeof data === 'object') {
        const keys = Object.keys(data).slice(0, 10);
        const desc = keys.map(k => `${k}: ${typeof data[k]}`).join(', ');
        return `{ ${desc}${Object.keys(data).length > 10 ? ', ...' : ''} }`;
    }
    return typeof data;
}

/**
 * Process a single file
 */
function processFile(filePath, fileName) {
    console.log(`  Processing: ${fileName}`);

    const content = fs.readFileSync(filePath, 'utf-8');
    let data;

    try {
        // Try JSONC first (handles comments)
        data = parseJsonc(content);
    } catch (e) {
        console.log(`    Warning: Failed to parse ${fileName}: ${e.message}`);
        return null;
    }

    if (!isQuestionPaperFile(data)) {
        console.log(`    Skipping: Not a question paper file`);
        return null;
    }

    // Generate sanitized version
    const sanitized = {
        ...generateSchemaDescription(data),
        ...sanitizeObject(data)
    };

    return sanitized;
}

/**
 * Main function
 */
function main() {
    console.log('🧹 Sanitizing question paper data...\n');

    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Get all JSON/JSONC files from data directory
    const files = fs.readdirSync(DATA_DIR).filter(f =>
        f.endsWith('.json') || f.endsWith('.jsonc')
    );

    if (files.length === 0) {
        console.log('  No JSON/JSONC files found in /data');
        return { processed: [], skipped: [] };
    }

    const processed = [];
    const skipped = [];

    for (const fileName of files) {
        const filePath = path.join(DATA_DIR, fileName);
        const sanitized = processFile(filePath, fileName);

        if (sanitized) {
            // Write sanitized file
            const outputPath = path.join(OUTPUT_DIR, fileName);
            fs.writeFileSync(outputPath, JSON.stringify(sanitized, null, 2));
            processed.push(fileName);
            console.log(`    ✅ Sanitized: ${fileName}`);
        } else {
            skipped.push(fileName);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Processed: ${processed.length} files`);
    console.log(`  Skipped: ${skipped.length} files`);
    console.log(`  Output: ${OUTPUT_DIR}`);

    return { processed, skipped };
}

// Run if called directly
main();

export { main, sanitizeObject, parseJsonc, isQuestionPaperFile };
