import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'schemas', 'paper_schema_v3.json');
const paperSchema = JSON.parse(readFileSync(schemaPath, 'utf8'));

function buildAjv() {
    const ajv = new Ajv({
        allErrors: true,
        strict: false,
        verbose: true
    });

    addFormats(ajv);
    return ajv;
}

const ajv = buildAjv();
const validate = ajv.compile(paperSchema);

export function validatePaperSchema(data) {
    const valid = validate(data);
    return {
        valid: Boolean(valid),
        errors: valid ? undefined : validate.errors || []
    };
}
