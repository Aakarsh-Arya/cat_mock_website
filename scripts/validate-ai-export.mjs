#!/usr/bin/env node
/**
 * @fileoverview Validate AI Analysis Export JSON files against schema v1
 * @description CLI tool for local/CI validation of exported composite context packets.
 *
 * Usage:
 *   node scripts/validate-ai-export.mjs <path-to-json> [path-to-json ...]
 *   node scripts/validate-ai-export.mjs data/exports/*.json
 *
 * Exit codes:
 *   0 — all files valid
 *   1 — one or more files invalid or missing
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'schemas', 'ai_analysis_export.schema.v1.json');

// ── Load schema ──────────────────────────────────────────────────────────────
let schema;
try {
    schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
} catch (err) {
    console.error(`❌ Could not load schema at ${schemaPath}:`, err.message);
    process.exit(1);
}

// ── Build Ajv ────────────────────────────────────────────────────────────────
const ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);
const validate = ajv.compile(schema);

// ── Process files ────────────────────────────────────────────────────────────
const files = process.argv.slice(2);

if (files.length === 0) {
    console.log('Usage: node scripts/validate-ai-export.mjs <file.json> [file2.json ...]');
    console.log('');
    console.log('Validates AI Analysis Export JSON files against schema v1.');
    process.exit(0);
}

let hasErrors = false;

for (const filePath of files) {
    const absPath = resolve(filePath);

    let data;
    try {
        data = JSON.parse(readFileSync(absPath, 'utf8'));
    } catch (err) {
        console.error(`❌ ${filePath}: Could not read/parse — ${err.message}`);
        hasErrors = true;
        continue;
    }

    const valid = validate(data);

    if (valid) {
        const sectionCount = data.sections?.length ?? '?';
        const itemCount = (data.sections ?? []).reduce((sum, s) => sum + (s.items?.length ?? 0), 0);
        console.log(`✅ ${filePath} — valid (${sectionCount} sections, ${itemCount} items)`);
    } else {
        hasErrors = true;
        console.error(`❌ ${filePath} — INVALID`);
        for (const err of validate.errors ?? []) {
            console.error(`   ${err.instancePath || '/'}: ${err.message}`);
            if (err.params) {
                console.error(`     params: ${JSON.stringify(err.params)}`);
            }
        }
    }
}

console.log('');
if (hasErrors) {
    console.error('⚠️  Some files failed validation.');
    process.exit(1);
} else {
    console.log('🎉 All files valid.');
    process.exit(0);
}
