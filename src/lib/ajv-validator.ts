import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import paperSchema from '../../schemas/paper_schema_v3.json';

const ajv = new Ajv({
    allErrors: true,
    strict: false,
    verbose: true
});

addFormats(ajv);

const validate = ajv.compile(paperSchema);

export function validatePaperSchema(data: unknown) {
    const valid = validate(data);
    return {
        valid: Boolean(valid),
        errors: valid ? undefined : validate.errors || []
    };
}
