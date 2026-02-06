#!/usr/bin/env node
/**
 * @fileoverview Paper Import Script v3 (Sets-First)
 * @description CLI tool to import papers using Schema v3.0 (question_sets → questions)
 * @usage node scripts/import-paper-v3.mjs <path-to-json-file> [options]
 * 
 * Schema v3.0 Structure:
 *   - paper: Paper metadata
 *   - question_sets[]: Parent containers (inserted FIRST)
 *   - questions[]: Children that reference sets via set_ref
 * 
 * Options:
 *   --publish             Publish the paper immediately after import
 *   --dry-run             Validate and show what would be done, but don't write
 *   --upsert              Use upsert mode (requires semantic keys in DB)
 *   --notes <text>        Import notes (optional)
 *   --skip-if-duplicate   Skip import if JSON hash already exists
 *   --help, -h            Show help message
 */

import { readFileSync } from 'fs';
import { createHash, randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY (use service role, not anon key!)');
    console.error('');
    console.error('Set them in .env.local or pass via environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// SCHEMA V3 VALIDATION (Phase 3)
// =============================================================================

const VALID_SECTIONS = ['VARC', 'DILR', 'QA'];
const VALID_SET_TYPES = ['VARC', 'DILR', 'CASELET', 'ATOMIC'];
const VALID_QUESTION_TYPES = ['MCQ', 'TITA'];
const VALID_CONTEXT_TYPES = [
    'rc_passage', 'dilr_set', 'caselet', 'data_table', 'graph', 'other_shared_stimulus'
];
const VALID_CONTENT_LAYOUTS = [
    'split_passage', 'split_chart', 'split_table', 'single_focus', 'image_top'
];
const COMPOSITE_SET_TYPES = ['VARC', 'DILR', 'CASELET'];

class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

function validateSchemaVersion(data) {
    if (data.schema_version !== 'v3.0') {
        throw new ValidationError(
            `Schema version must be 'v3.0' for sets-first import. Got: ${data.schema_version || 'undefined'}`,
            ['Use schema_version: "v3.0" for the sets-first importer']
        );
    }
}

function validatePaper(paper) {
    const errors = [];
    const required = ['slug', 'title'];

    for (const field of required) {
        if (!paper[field]) {
            errors.push(`paper.${field} is required`);
        }
    }

    if (paper.slug && !/^[a-z0-9-]+$/.test(paper.slug)) {
        errors.push(`paper.slug must be lowercase alphanumeric with hyphens: ${paper.slug}`);
    }

    if (paper.sections && !Array.isArray(paper.sections)) {
        errors.push('paper.sections must be an array');
    }

    if (errors.length > 0) {
        throw new ValidationError('Paper validation failed', errors);
    }

    return true;
}

function validateQuestionSets(sets) {
    const errors = [];
    const clientSetIds = new Set();

    if (!Array.isArray(sets)) {
        throw new ValidationError('question_sets must be an array');
    }

    sets.forEach((set, index) => {
        const prefix = `question_sets[${index}]`;

        // Required fields
        if (!set.client_set_id) {
            errors.push(`${prefix}.client_set_id is required`);
        } else if (!/^[A-Z0-9_]+$/.test(set.client_set_id)) {
            errors.push(`${prefix}.client_set_id must be uppercase alphanumeric with underscores: ${set.client_set_id}`);
        } else if (clientSetIds.has(set.client_set_id)) {
            errors.push(`${prefix}.client_set_id is duplicate: ${set.client_set_id}`);
        } else {
            clientSetIds.add(set.client_set_id);
        }

        if (!set.section) {
            errors.push(`${prefix}.section is required`);
        } else if (!VALID_SECTIONS.includes(set.section)) {
            errors.push(`${prefix}.section must be one of ${VALID_SECTIONS.join(', ')}: ${set.section}`);
        }

        if (!set.set_type) {
            errors.push(`${prefix}.set_type is required`);
        } else if (!VALID_SET_TYPES.includes(set.set_type)) {
            errors.push(`${prefix}.set_type must be one of ${VALID_SET_TYPES.join(', ')}: ${set.set_type}`);
        }

        if (set.display_order === undefined || set.display_order === null) {
            errors.push(`${prefix}.display_order is required`);
        }

        // Composite sets require context_body
        if (COMPOSITE_SET_TYPES.includes(set.set_type)) {
            if (!set.context_body || set.context_body.trim() === '') {
                errors.push(`${prefix}.context_body is required for ${set.set_type} sets`);
            }
        }

        // Validate context_type if provided
        if (set.context_type && !VALID_CONTEXT_TYPES.includes(set.context_type)) {
            errors.push(`${prefix}.context_type must be one of ${VALID_CONTEXT_TYPES.join(', ')}: ${set.context_type}`);
        }

        // Validate content_layout if provided
        if (set.content_layout && !VALID_CONTENT_LAYOUTS.includes(set.content_layout)) {
            errors.push(`${prefix}.content_layout must be one of ${VALID_CONTENT_LAYOUTS.join(', ')}: ${set.content_layout}`);
        }
    });

    if (errors.length > 0) {
        throw new ValidationError('Question sets validation failed', errors);
    }

    return clientSetIds;
}

function validateQuestions(questions, validSetRefs) {
    const errors = [];
    const clientQuestionIds = new Set();

    if (!Array.isArray(questions)) {
        throw new ValidationError('questions must be an array');
    }

    questions.forEach((q, index) => {
        const prefix = `questions[${index}]`;

        // Required fields
        if (!q.client_question_id) {
            errors.push(`${prefix}.client_question_id is required`);
        } else if (clientQuestionIds.has(q.client_question_id)) {
            errors.push(`${prefix}.client_question_id is duplicate: ${q.client_question_id}`);
        } else {
            clientQuestionIds.add(q.client_question_id);
        }

        if (!q.set_ref) {
            errors.push(`${prefix}.set_ref is required`);
        } else if (!validSetRefs.has(q.set_ref)) {
            errors.push(`${prefix}.set_ref references non-existent set: ${q.set_ref}`);
        }

        if (!q.sequence_order && q.sequence_order !== 0) {
            errors.push(`${prefix}.sequence_order is required`);
        }

        if (!q.question_number && q.question_number !== 0) {
            errors.push(`${prefix}.question_number is required`);
        }

        if (!q.question_text) {
            errors.push(`${prefix}.question_text is required`);
        }

        if (!q.question_type) {

            if (q.question_format && !VALID_QUESTION_TYPES.includes(q.question_format)) {
                errors.push(`${prefix}.question_format must be one of ${VALID_QUESTION_TYPES.join(', ')}: ${q.question_format}`);
            }

            if (q.correct_answer !== undefined && q.correct_answer !== null) {
                if (q.question_type === 'MCQ') {
                    const isString = typeof q.correct_answer === 'string';
                    const isStringArray = Array.isArray(q.correct_answer) && q.correct_answer.every(a => typeof a === 'string');
                    if (!isString && !isStringArray) {
                        errors.push(`${prefix}.correct_answer must be a string or string[] for MCQ questions`);
                    }
                }
                if (q.question_type === 'TITA') {
                    const isString = typeof q.correct_answer === 'string';
                    const isNumber = typeof q.correct_answer === 'number';
                    if (!isString && !isNumber) {
                        errors.push(`${prefix}.correct_answer must be a string or number for TITA questions`);
                    }
                }
            }
            errors.push(`${prefix}.question_type is required`);
        } else if (!VALID_QUESTION_TYPES.includes(q.question_type)) {
            errors.push(`${prefix}.question_type must be one of ${VALID_QUESTION_TYPES.join(', ')}: ${q.question_type}`);
        }

        // MCQ requires options
        if (q.question_type === 'MCQ') {
            if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                errors.push(`${prefix}.options is required for MCQ questions`);
            } else {
                // Accept either string array ["A text", "B text"] or object array [{id, text}]
                const firstOpt = q.options[0];
                const isObjectFormat = typeof firstOpt === 'object' && firstOpt !== null;

                if (isObjectFormat) {
                    q.options.forEach((opt, optIdx) => {
                        if (!opt.id) {
                            errors.push(`${prefix}.options[${optIdx}].id is required`);
                        }
                        if (!opt.text && opt.text !== '') {
                            errors.push(`${prefix}.options[${optIdx}].text is required`);
                        }
                    });
                }
                // String format is valid as-is
            }
        }

        // Section validation
        if (q.section && !VALID_SECTIONS.includes(q.section)) {
            errors.push(`${prefix}.section must be one of ${VALID_SECTIONS.join(', ')}: ${q.section}`);
        }
    });

    if (errors.length > 0) {
        throw new ValidationError('Questions validation failed', errors);
    }

    return true;
}

function validateV3Data(data) {
    console.log('🔍 Validating Schema v3.0 payload...\n');

    // Check schema version
    validateSchemaVersion(data);

    // Check required root keys
    if (!data.paper) {
        throw new ValidationError('Missing required root key: paper');
    }
    if (!data.question_sets) {
        throw new ValidationError('Missing required root key: question_sets');
    }
    if (!data.questions) {
        throw new ValidationError('Missing required root key: questions');
    }

    // Validate paper
    validatePaper(data.paper);
    console.log('   ✅ paper validated');

    // Validate question_sets and collect valid client_set_ids
    const validSetRefs = validateQuestionSets(data.question_sets);
    console.log(`   ✅ question_sets validated (${data.question_sets.length} sets)`);

    // Validate questions against valid set refs
    validateQuestions(data.questions, validSetRefs);
    console.log(`   ✅ questions validated (${data.questions.length} questions)`);

    console.log('\n✅ All validation passed\n');
    return true;
}

// =============================================================================
// HASH FUNCTIONS
// =============================================================================

function computeJsonHash(data) {
    const jsonStr = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(jsonStr).digest('hex');
}

// =============================================================================
// IMPORT FUNCTIONS (Phase 2 - Sets-First)
// =============================================================================

async function importPaperV3(paperData, options = {}) {
    const { upsert = false, dryRun = false } = options;

    console.log(`📄 ${dryRun ? '[DRY RUN] ' : ''}Importing paper: ${paperData.title}`);

    if (dryRun) {
        console.log(`   Would create/update paper with slug: ${paperData.slug}`);
        return { id: 'dry-run-id', slug: paperData.slug };
    }

    // Check if paper exists
    const { data: existing } = await supabase
        .from('papers')
        .select('id')
        .eq('slug', paperData.slug)
        .single();

    const paperPayload = {
        slug: paperData.slug,
        title: paperData.title,
        description: paperData.description || null,
        year: paperData.year || new Date().getFullYear(),
        total_questions: paperData.total_questions || 0,
        total_marks: paperData.total_marks || 198,
        duration_minutes: paperData.duration_minutes || 120,
        sections: paperData.sections || ['VARC', 'DILR', 'QA'],
        default_positive_marks: paperData.default_positive_marks || 3.0,
        default_negative_marks: paperData.default_negative_marks || 1.0,
        difficulty_level: paperData.difficulty_level || 'medium',
        is_free: paperData.is_free ?? false,
        published: paperData.published ?? false,
        allow_pause: paperData.allow_pause ?? true,
        attempt_limit: paperData.attempt_limit ?? 0,
    };

    // Add paper_key if using upsert mode
    if (upsert && paperData.paper_key) {
        paperPayload.paper_key = paperData.paper_key;
    }

    if (existing) {
        console.log(`   ⚠️  Paper exists (id: ${existing.id}), updating...`);

        const { data, error } = await supabase
            .from('papers')
            .update(paperPayload)
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    const { data, error } = await supabase
        .from('papers')
        .insert(paperPayload)
        .select()
        .single();

    if (error) throw error;
    console.log(`   ✅ Paper created with id: ${data.id}`);
    return data;
}

async function importQuestionSetsV3(paperId, sets, options = {}) {
    const { upsert = false, dryRun = false } = options;

    console.log(`\n📋 ${dryRun ? '[DRY RUN] ' : ''}Importing ${sets.length} question_sets (SETS-FIRST)...`);

    // Build client_set_id → UUID map
    const setIdMap = {};

    if (dryRun) {
        sets.forEach(set => {
            setIdMap[set.client_set_id] = `dry-run-uuid-${set.client_set_id}`;
            console.log(`   Would create set: ${set.client_set_id} (${set.set_type})`);
        });
        return { count: sets.length, setIdMap };
    }

    // Delete existing sets (unless upsert mode)
    if (!upsert) {
        const { error: deleteError } = await supabase
            .from('question_sets')
            .delete()
            .eq('paper_id', paperId);

        if (deleteError) {
            console.warn(`   ⚠️  Could not delete existing question_sets: ${deleteError.message}`);
        }
    }

    // Prepare sets for insertion
    const setsToInsert = sets.map(set => {
        const newId = randomUUID();
        setIdMap[set.client_set_id] = newId;

        // Infer context_type from set_type if not provided
        let contextType = set.context_type;
        if (!contextType && set.set_type !== 'ATOMIC') {
            contextType = {
                'VARC': 'rc_passage',
                'DILR': 'dilr_set',
                'CASELET': 'caselet'
            }[set.set_type] || 'other_shared_stimulus';
        }

        // Infer content_layout
        let contentLayout = set.content_layout || 'single_focus';
        if (!set.content_layout) {
            if (set.context_image_url) {
                contentLayout = 'image_top';
            } else if (set.set_type === 'VARC') {
                contentLayout = 'split_passage';
            } else if (set.set_type === 'DILR') {
                contentLayout = 'split_chart';
            } else if (set.set_type === 'CASELET') {
                contentLayout = 'split_table';
            } else {
                contentLayout = 'single_focus';
            }
        }

        return {
            id: newId,
            paper_id: paperId,
            section: set.section,
            set_type: set.set_type,
            context_type: contextType,
            content_layout: contentLayout,
            context_title: set.context_title || null,
            context_body: set.context_body || null,
            context_image_url: set.context_image_url || null,
            context_additional_images: set.context_additional_images || null,
            display_order: set.display_order,
            is_active: set.is_active ?? true,
            is_published: true, // Sets must be published to be visible through question_sets_with_questions view
            metadata: set.metadata || {},
            client_set_id: set.client_set_id, // Store for upsert support
        };
    });

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < setsToInsert.length; i += batchSize) {
        const batch = setsToInsert.slice(i, i + batchSize);
        const { error } = await supabase
            .from('question_sets')
            .insert(batch);

        if (error) throw error;
        inserted += batch.length;
    }

    console.log(`   ✅ Created ${inserted} question_sets`);
    console.log(`   📍 Set ID map built: ${Object.keys(setIdMap).length} entries`);

    return { count: inserted, setIdMap };
}

async function importQuestionsV3(paperId, questions, setIdMap, options = {}) {
    const { upsert = false, dryRun = false } = options;

    console.log(`\n📝 ${dryRun ? '[DRY RUN] ' : ''}Importing ${questions.length} questions (using set_ref → set_id mapping)...`);

    if (dryRun) {
        questions.forEach(q => {
            const setId = setIdMap[q.set_ref];
            console.log(`   Q${q.question_number}: ${q.client_question_id} → set ${q.set_ref} (${setId ? '✅' : '❌'})`);
        });
        return questions.length;
    }

    // Delete existing questions (unless upsert mode)
    if (!upsert) {
        const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('paper_id', paperId);

        if (deleteError) {
            console.warn(`   ⚠️  Could not delete existing questions: ${deleteError.message}`);
        }
    }

    // Prepare questions for insertion
    const questionsToInsert = questions.map(q => {
        const setId = setIdMap[q.set_ref];
        if (!setId) {
            throw new Error(`Question ${q.client_question_id} references unknown set: ${q.set_ref}`);
        }

        // Convert options from {id, text} format to string[] format
        // The MCQRenderer expects options as string array: ["Option A text", "Option B text", ...]
        let normalizedOptions = null;
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            const firstOpt = q.options[0];
            if (typeof firstOpt === 'object' && firstOpt !== null && 'text' in firstOpt) {
                // Convert {id, text}[] to string[]
                // Sort by id (A, B, C, D) to ensure correct order
                const sorted = [...q.options].sort((a, b) => a.id.localeCompare(b.id));
                normalizedOptions = sorted.map(opt => opt.text);
            } else {
                // Already string[] format
                normalizedOptions = q.options;
            }
        }

        return {
            id: randomUUID(),
            paper_id: paperId,
            section: q.section,
            question_number: q.question_number,
            question_text: q.question_text,
            question_type: q.question_type,
            question_format: q.question_format || q.question_type,
            taxonomy_type: q.taxonomy_type || null,
            topic_tag: q.topic_tag || null,
            difficulty_rationale: q.difficulty_rationale || null,
            options: normalizedOptions,
            correct_answer: q.correct_answer,
            positive_marks: q.positive_marks ?? 3.0,
            negative_marks: q.negative_marks ?? (q.question_type === 'TITA' ? 0 : 1.0),
            difficulty: q.difficulty || null,
            topic: q.topic || null,
            subtopic: q.subtopic || null,
            solution_text: q.solution_text || null,
            solution_image_url: q.solution_image_url || null,
            video_solution_url: q.video_solution_url || null,
            set_id: setId,
            sequence_order: q.sequence_order,
            is_active: true,
            client_question_id: q.client_question_id, // Store for upsert support
        };
    });

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
        const batch = questionsToInsert.slice(i, i + batchSize);
        const { error } = await supabase
            .from('questions')
            .insert(batch);

        if (error) throw error;
        inserted += batch.length;
        console.log(`   ✅ Inserted ${inserted}/${questions.length} questions`);
    }

    return inserted;
}

async function createIngestRun(paperId, canonicalJson, options = {}) {
    const { notes = null, skipIfDuplicate = false, dryRun = false } = options;

    if (dryRun) {
        console.log(`\n📦 [DRY RUN] Would create ingest run record`);
        return { dryRun: true };
    }

    console.log(`\n📦 Creating ingest run record...`);

    const canonicalHash = computeJsonHash(canonicalJson);

    if (skipIfDuplicate) {
        const { data: existing } = await supabase
            .from('paper_ingest_runs')
            .select('id, version_number')
            .eq('paper_id', paperId)
            .eq('canonical_json_hash', canonicalHash)
            .single();

        if (existing) {
            console.log(`   ⚠️  Duplicate detected - same JSON already imported as version ${existing.version_number}`);
            return { skipped: true, existing };
        }
    }

    // Get next version number
    const { data: maxVersion } = await supabase
        .from('paper_ingest_runs')
        .select('version_number')
        .eq('paper_id', paperId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

    const nextVersion = (maxVersion?.version_number || 0) + 1;

    const { data: ingestRun, error } = await supabase
        .from('paper_ingest_runs')
        .insert({
            paper_id: paperId,
            schema_version: 'v3.0',
            version_number: nextVersion,
            canonical_paper_json: canonicalJson,
            canonical_json_hash: canonicalHash,
            import_notes: notes || 'Imported via v3 sets-first importer',
        })
        .select()
        .single();

    if (error) throw error;

    // Update paper's latest_ingest_run_id
    await supabase
        .from('papers')
        .update({ latest_ingest_run_id: ingestRun.id })
        .eq('id', paperId);

    console.log(`   ✅ Created ingest run v${nextVersion} (${ingestRun.id})`);
    return { ingestRun, version: nextVersion };
}

async function publishPaper(paperId, shouldPublish, dryRun = false) {
    if (!shouldPublish) {
        console.log(`\n📋 Paper saved as draft (use --publish to publish)`);
        return;
    }

    if (dryRun) {
        console.log(`\n🚀 [DRY RUN] Would publish paper`);
        return;
    }

    const { error: paperError } = await supabase
        .from('papers')
        .update({ published: true })
        .eq('id', paperId);

    if (paperError) throw paperError;

    const { error: setsError } = await supabase
        .from('question_sets')
        .update({ is_published: true })
        .eq('paper_id', paperId);

    if (setsError) {
        console.warn(`   ⚠️  Could not publish question_sets: ${setsError.message}`);
    }

    console.log(`\n🚀 Paper published!`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║            CAT Paper Import Tool v3 (Sets-First)                     ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/import-paper-v3.mjs <path-to-json-file> [options]

Options:
  --publish             Publish the paper immediately after import
  --dry-run             Validate and show what would be done, but don't write
  --upsert              Use upsert mode (requires semantic keys in DB)
  --notes <text>        Import notes (optional)
  --skip-if-duplicate   Skip import if JSON hash already exists
  --help, -h            Show this help message

Schema v3.0 (Sets-First) Structure:
  {
    "schema_version": "v3.0",
    "paper": { ... },
    "question_sets": [
      { "client_set_id": "VARC_RC_1", "section": "VARC", "set_type": "VARC", ... }
    ],
    "questions": [
      { "client_question_id": "Q1", "set_ref": "VARC_RC_1", ... }
    ]
  }

Import Flow:
  1. Validate schema version = v3.0
  2. Validate paper metadata
  3. Validate question_sets (all client_set_id unique)
  4. Validate questions (all set_ref exist in question_sets)
  5. Insert paper
  6. Insert question_sets FIRST (build client_set_id → UUID map)
  7. Insert questions using set_ref → set_id mapping
  8. Create ingest run for versioning

Examples:
  # Dry run to validate
  node scripts/import-paper-v3.mjs data/paper-v3.json --dry-run

  # Import and publish
  node scripts/import-paper-v3.mjs data/paper-v3.json --publish

  # Import with notes
  node scripts/import-paper-v3.mjs data/paper-v3.json --notes "Initial v3 import"

Reference:
  - Schema: schemas/paper_schema_v3.json
  - Template: data_sanitized/paper_schema_v3.template.json
  - Docs: docs/CONTENT-SCHEMA.md
`);
        process.exit(0);
    }

    // Parse arguments
    const jsonPath = args.find(a => !a.startsWith('--'));
    const shouldPublish = args.includes('--publish');
    const dryRun = args.includes('--dry-run');
    const upsert = args.includes('--upsert');
    const skipIfDuplicate = args.includes('--skip-if-duplicate');

    let notes = null;
    const notesIdx = args.indexOf('--notes');
    if (notesIdx !== -1 && args[notesIdx + 1]) {
        notes = args[notesIdx + 1];
    }

    if (!jsonPath) {
        console.error('❌ Please provide a path to the JSON file');
        process.exit(1);
    }

    try {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║            CAT Paper Import Tool v3 (Sets-First)                     ║
╚══════════════════════════════════════════════════════════════════════╝
`);

        if (dryRun) {
            console.log('🔍 DRY RUN MODE - No changes will be made\n');
        }

        // Read and parse JSON
        console.log(`📂 Reading ${jsonPath}...`);
        const content = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(content);

        // Validate v3 schema
        validateV3Data(data);

        // Import paper
        const paper = await importPaperV3(data.paper, { upsert, dryRun });

        // Import question_sets FIRST
        const { count: setCount, setIdMap } = await importQuestionSetsV3(
            paper.id,
            data.question_sets,
            { upsert, dryRun }
        );

        // Import questions using set_ref → set_id mapping
        const questionCount = await importQuestionsV3(
            paper.id,
            data.questions,
            setIdMap,
            { upsert, dryRun }
        );

        // Create ingest run
        const ingestResult = await createIngestRun(paper.id, data, {
            notes,
            skipIfDuplicate,
            dryRun
        });

        if (ingestResult.skipped) {
            console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                     Import Skipped (Duplicate)                       ║
╠══════════════════════════════════════════════════════════════════════╣
║  Paper ID:    ${paper.id}
║  Slug:        ${paper.slug}
║  Existing:    Version ${ingestResult.existing.version_number}
╚══════════════════════════════════════════════════════════════════════╝
`);
            return;
        }

        // Publish if requested
        await publishPaper(paper.id, shouldPublish, dryRun);

        // Summary
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    Import Complete! ${dryRun ? '(DRY RUN)' : ''}                          
╠══════════════════════════════════════════════════════════════════════╣
║  Paper ID:    ${paper.id}
║  Slug:        ${data.paper.slug}
║  Version:     ${ingestResult.version || 'N/A (dry run)'}
║  Sets:        ${setCount}
║  Questions:   ${questionCount}
║  Published:   ${shouldPublish ? 'Yes' : 'No (draft)'}
╚══════════════════════════════════════════════════════════════════════╝
`);

    } catch (err) {
        if (err instanceof ValidationError) {
            console.error(`\n❌ Validation failed: ${err.message}`);
            if (err.errors && err.errors.length > 0) {
                console.error('\nErrors:');
                err.errors.forEach(e => console.error(`   • ${e}`));
            }
        } else {
            console.error(`\n❌ Import failed: ${err.message}`);
        }
        process.exit(1);
    }
}

main();
