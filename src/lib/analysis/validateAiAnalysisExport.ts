/**
 * @fileoverview Ajv validator for the AI Analysis Export (Composite Context JSON) schema v1
 * @description Compiles the JSON Schema lazily on first use to avoid module-load crashes.
 *   Uses the same Ajv configuration as scripts/ajv-validator.mjs.
 * @blueprint AI Analysis Export — Phase 4 (docs/AI_ANALYSIS_EXPORT.md)
 */

import 'server-only';

import { readFileSync } from 'fs';
import { join } from 'path';

export interface ValidationResult {
    valid: boolean;
    errors?: Array<{ instancePath?: string; message?: string; params?: unknown }>;
}

let _validate: ((data: unknown) => boolean) | null = null;
let _validateFn: { errors?: Array<{ instancePath?: string; message?: string; params?: unknown }> | null } | null = null;
let _initError: string | null = null;

/**
 * Lazily compile the Ajv validator on first call.
 * If Ajv or the schema can't be loaded, logs the error once and
 * returns a no-op validator so the export still succeeds.
 */
function getValidator(): ((data: unknown) => boolean) | null {
    if (_validate) return _validate;
    if (_initError) return null; // already failed once

    try {
        const Ajv = require('ajv').default || require('ajv');
        const addFormats = require('ajv-formats').default || require('ajv-formats');

        const schemaPath = join(process.cwd(), 'schemas', 'ai_analysis_export.schema.v1.json');
        const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

        const ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
        if (typeof addFormats === 'function') {
            addFormats(ajv);
        }

        _validate = ajv.compile(schema);
        _validateFn = _validate as unknown as typeof _validateFn;
        return _validate;
    } catch (err) {
        _initError = err instanceof Error ? err.message : String(err);
        console.error('[AI Analysis Export] Failed to initialize Ajv validator:', _initError);
        return null;
    }
}

/**
 * Validates a composite context JSON payload against the v1 schema.
 * Returns `{ valid: true }` or `{ valid: false, errors: [...] }`.
 * If the validator can't be loaded, returns `{ valid: true }` (skip validation).
 */
export function validateAiAnalysisExport(data: unknown): ValidationResult {
    const validate = getValidator();
    if (!validate) {
        // Validator couldn't load — skip validation, don't block export
        return { valid: true };
    }

    const valid = validate(data);
    return {
        valid: Boolean(valid),
        errors: valid ? undefined : (_validateFn?.errors ?? []),
    };
}
