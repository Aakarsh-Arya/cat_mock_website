#!/usr/bin/env node
/**
 * @fileoverview Markdown to Schema v3.0 JSON Parser
 * @description Parses custom markdown format CAT papers to v3.0 JSON schema
 * @usage node scripts/parse-md-to-v3.mjs <input.md> [output.json]
 */

import { readFileSync, writeFileSync } from 'fs';
import { validatePaperSchema } from './ajv-validator.mjs';

// =============================================================================
// YAML FRONTMATTER PARSER
// =============================================================================

function parseYamlFrontmatter(content) {
    // Handle escaped format (with backslashes) and regular format
    let yamlMatch = content.match(/^(?:YAML\s*\n)?\\?---\s*([\s\S]*?)\\?---/);
    if (!yamlMatch) {
        throw new Error('No YAML frontmatter found');
    }

    const yamlContent = yamlMatch[1];
    const paper = {};
    const lines = yamlContent.split('\n');

    let currentKey = null;
    let inArray = false;
    let arrayItems = [];

    for (let line of lines) {
        // Clean up escaped underscores and backslashes
        line = line.replace(/\\_/g, '_').replace(/\\\*/g, '*').trim();

        if (!line || line.startsWith('#')) continue;

        // Array item
        if (line.startsWith('- ') || line.startsWith('\\- ')) {
            const item = line.replace(/^\\?-\s*/, '').trim();
            if (item.includes(':')) {
                // Object in array like "section: VARC"
                const [k, v] = item.split(':').map(s => s.trim());
                if (inArray && currentKey === 'sections') {
                    // For sections array with objects, extract section name
                    if (k === 'section') {
                        arrayItems.push(v);
                    }
                }
            } else {
                arrayItems.push(item);
            }
            continue;
        }

        // Key-value pair
        const kvMatch = line.match(/^([a-z_]+):\s*(.*)$/i);
        if (kvMatch) {
            // Save previous array if any
            if (inArray && currentKey) {
                paper[currentKey] = arrayItems;
                arrayItems = [];
                inArray = false;
            }

            currentKey = kvMatch[1].toLowerCase();
            let value = kvMatch[2].trim();

            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');

            if (!value) {
                // Check if next line starts array
                inArray = true;
                arrayItems = [];
            } else {
                // Parse value type
                if (value === 'true') paper[currentKey] = true;
                else if (value === 'false') paper[currentKey] = false;
                else if (/^\d+$/.test(value)) paper[currentKey] = parseInt(value, 10);
                else if (/^\d+\.\d+$/.test(value)) paper[currentKey] = parseFloat(value);
                else paper[currentKey] = value;
            }
        }
    }

    // Save last array if any
    if (inArray && currentKey) {
        paper[currentKey] = arrayItems;
    }

    return paper;
}

// =============================================================================
// MARKDOWN CONTENT PARSER
// =============================================================================

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\\_/g, '_')
        .replace(/\\\*/g, '*')
        .replace(/\\#/g, '#')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\-/g, '-')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .trim();
}

function parseSetBlock(block) {
    const set = {};
    const lines = block.split('\n');

    let contextBodyLines = [];
    let inContextBody = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Check for key: value pattern
        const kvMatch = line.match(/^([a-z_]+):\s*(.*)$/i);

        if (kvMatch && !inContextBody) {
            const key = cleanText(kvMatch[1]).toLowerCase();
            let value = cleanText(kvMatch[2]).trim();

            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');

            if (key === 'context_body') {
                if (value === '|' || value === '' || value === '""') {
                    inContextBody = true;
                    continue;
                } else {
                    set[key] = value;
                }
            } else if (key === 'display_order') {
                set[key] = parseInt(value, 10);
            } else if (key === 'metadata') {
                // Skip metadata for now, handle separately if needed
            } else if (key === 'source_pages') {
                // Skip
            } else {
                set[key] = value;
            }
        } else if (inContextBody) {
            // Check if this line starts a new field
            if (/^[a-z_]+:\s*/i.test(line) && !line.startsWith('  ')) {
                inContextBody = false;
                i--; // Re-process this line
            } else {
                contextBodyLines.push(cleanText(line));
            }
        }
    }

    if (contextBodyLines.length > 0) {
        set.context_body = contextBodyLines.join('\n').trim();
    }

    return set;
}

function parseQuestionBlock(block, currentSetId) {
    const question = {};
    const lines = block.split('\n');

    let questionTextLines = [];
    let _optionsLines = [];
    let solutionLines = [];
    let inQuestionText = false;
    let inOptions = false;
    let inSolution = false;
    let currentOptions = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const cleanLine = cleanText(line);

        // Check for option lines first (they may look like key: value)
        // Pattern: "  A: text" or "A: text" or "  A: "text""
        const optionMatch = cleanLine.match(/^\s*([A-D]):\s*(.+)$/i);
        if (optionMatch && inOptions) {
            let optText = optionMatch[2].replace(/^["']|["']$/g, '').trim();
            currentOptions.push({
                id: optionMatch[1].toUpperCase(),
                text: optText
            });
            continue;
        }

        // Check for key: value pattern
        const kvMatch = cleanLine.match(/^([a-z_]+):\s*(.*)$/i);

        if (kvMatch) {
            const key = kvMatch[1].toLowerCase();
            let value = kvMatch[2].trim();

            // End any multi-line sections
            if (inQuestionText && key !== 'question_text') {
                question.question_text = questionTextLines.join('\n').trim();
                questionTextLines = [];
                inQuestionText = false;
            }
            if (inOptions && key !== 'options' && !['a', 'b', 'c', 'd'].includes(key)) {
                inOptions = false;
            }
            if (inSolution && key !== 'solution_text') {
                question.solution_text = solutionLines.join('\n').trim();
                solutionLines = [];
                inSolution = false;
            }

            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');

            switch (key) {
                case 'client_question_id':
                    question.client_question_id = value;
                    break;
                case 'question_number':
                    question.question_number = parseInt(value, 10);
                    break;
                case 'sequence_order':
                    question.sequence_order = parseInt(value, 10);
                    break;
                case 'question_type':
                    question.question_type = value.toUpperCase();
                    break;
                case 'question_text':
                    if (value === '|' || value === '') {
                        inQuestionText = true;
                    } else {
                        question.question_text = value;
                    }
                    break;
                case 'options':
                    inOptions = true;
                    break;
                case 'a':
                case 'b':
                case 'c':
                case 'd':
                    // Option in key: value format
                    currentOptions.push({
                        id: key.toUpperCase(),
                        text: value
                    });
                    break;
                case 'correct_answer':
                    question.correct_answer = value.replace(/^["']|["']$/g, '');
                    break;
                case 'topic':
                    question.topic = value;
                    break;
                case 'subtopic':
                    question.subtopic = value;
                    break;
                case 'difficulty':
                    // Normalize difficulty values
                    let diff = value.toLowerCase();
                    if (diff === 'difficult') diff = 'hard';
                    question.difficulty = diff;
                    break;
                case 'solution_text':
                    if (value === '|' || value === '') {
                        inSolution = true;
                    } else {
                        question.solution_text = value;
                    }
                    break;
                case 'scoring':
                case 'negative_marks':
                case 'positive_marks':
                    if (key === 'negative_marks' && value === '0') {
                        question.negative_marks = 0;
                    }
                    break;
                case 'difficulty_rationale':
                    question.difficulty_rationale = value;
                    break;
            }
        } else if (inQuestionText) {
            questionTextLines.push(cleanLine);
        } else if (inOptions) {
            // Parse option lines like "A: "text"" or "A: text" with leading whitespace
            const optMatch = cleanLine.match(/^\s*([A-D]):\s*(.+)$/i);
            if (optMatch) {
                let optText = optMatch[2].replace(/^["']|["']$/g, '').trim();
                currentOptions.push({
                    id: optMatch[1].toUpperCase(),
                    text: optText
                });
            }
        } else if (inSolution) {
            solutionLines.push(cleanLine);
        }
    }

    // Finalize multi-line fields
    if (inQuestionText && questionTextLines.length > 0) {
        question.question_text = questionTextLines.join('\n').trim();
    }
    if (inSolution && solutionLines.length > 0) {
        question.solution_text = solutionLines.join('\n').trim();
    }
    if (currentOptions.length > 0) {
        question.options = currentOptions;
    }

    // Set the set_ref
    question.set_ref = currentSetId;

    return question;
}

function parseMarkdownContent(content, _paperMeta) {
    const question_sets = [];
    const questions = [];

    // Remove YAML frontmatter
    content = content.replace(/^(?:YAML\s*\n)?\\?---[\s\S]*?\\?---/, '');

    // Clean the content
    content = cleanText(content);

    // Split by section headers
    const _sectionPattern = /^#\s*\*{0,2}Section:\s*(\w+)\*{0,2}/gim;
    const _setPattern = /^#{1,2}\s*\*{0,2}SET\*{0,2}/gim;
    const _questionPattern = /^#{2,3}\s*\*{0,2}QUESTION\*{0,2}/gim;

    let currentSection = null;
    let currentSetId = null;
    let setDisplayOrder = 0;

    // Split content into blocks
    const blocks = content.split(/(?=^#{1,3}\s)/m);

    for (const block of blocks) {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) continue;

        // Check for section header
        const sectionMatch = trimmedBlock.match(/^#\s*\*{0,2}Section:\s*(\w+)/i);
        if (sectionMatch) {
            currentSection = sectionMatch[1].toUpperCase();
            // Normalize LRDI to DILR
            if (currentSection === 'LRDI') currentSection = 'DILR';
            continue;
        }

        // Check for SET block
        if (/^#{1,2}\s*\*{0,2}SET\*{0,2}/i.test(trimmedBlock)) {
            setDisplayOrder++;
            const setData = parseSetBlock(trimmedBlock);

            // Normalize section
            if (setData.section === 'LRDI') setData.section = 'DILR';

            // Use parsed section or current section
            if (!setData.section && currentSection) {
                setData.section = currentSection;
            }

            // Ensure display_order
            if (!setData.display_order) {
                setData.display_order = setDisplayOrder;
            }

            // Normalize client_set_id
            if (setData.client_set_id) {
                setData.client_set_id = setData.client_set_id.toUpperCase().replace(/-/g, '_');
            }

            // Set defaults
            if (!setData.set_type) setData.set_type = 'ATOMIC';
            if (!setData.content_layout) setData.content_layout = 'single_focus';
            if (setData.context_body === '' || setData.context_body === '""') {
                delete setData.context_body;
            }

            currentSetId = setData.client_set_id;
            question_sets.push(setData);
            continue;
        }

        // Check for QUESTION block
        if (/^#{2,3}\s*\*{0,2}QUESTION\*{0,2}/i.test(trimmedBlock)) {
            if (!currentSetId) {
                console.warn('Warning: Question without a SET, skipping');
                continue;
            }

            const questionData = parseQuestionBlock(trimmedBlock, currentSetId);

            // Add section from current set
            const currentSet = question_sets.find(s => s.client_set_id === currentSetId);
            if (currentSet) {
                questionData.section = currentSet.section;
            }

            // Normalize client_question_id
            if (questionData.client_question_id) {
                questionData.client_question_id = questionData.client_question_id.replace(/-/g, '_');
            }

            questions.push(questionData);
        }
    }

    return { question_sets, questions };
}

// =============================================================================
// POST-PROCESSING & VALIDATION
// =============================================================================

function postProcess(paper, question_sets, questions) {
    // Normalize paper fields
    // Ensure sections is a simple array of strings
    if (paper.sections && !Array.isArray(paper.sections)) {
        paper.sections = [paper.sections];
    }

    // If sections were parsed incorrectly, extract them from question_sets
    const sectionsFromSets = [...new Set(question_sets.map(s => s.section).filter(Boolean))];
    if (!paper.sections || paper.sections.length === 0 || paper.sections.length < sectionsFromSets.length) {
        // Normalize LRDI to DILR
        paper.sections = sectionsFromSets.map(s => s === 'LRDI' ? 'DILR' : s);
    } else {
        paper.sections = paper.sections.map(s => {
            if (typeof s === 'object') return s.section || s;
            return s;
        }).filter(Boolean);

        // Normalize LRDI to DILR
        paper.sections = paper.sections.map(s => s === 'LRDI' ? 'DILR' : s);
    }

    // Ensure standard CAT sections order
    const sectionOrder = ['VARC', 'DILR', 'QA'];
    paper.sections = sectionOrder.filter(s => paper.sections.includes(s));

    // Ensure required paper fields
    if (!paper.schema_version) paper.schema_version = 'v3.0';
    if (!paper.duration_minutes) paper.duration_minutes = 120;
    if (paper.default_positive_marks === undefined) paper.default_positive_marks = 3;
    if (paper.default_negative_marks === undefined) paper.default_negative_marks = 1;

    // Clean paper fields
    delete paper.schema_version; // Will be top-level
    delete paper.version_number;
    delete paper.source_pdf;
    delete paper.import_notes;
    delete paper.availability;
    delete paper.ingestion;
    delete paper.display_order; // Remove unwanted field from sections parsing
    delete paper.question_count; // Remove unwanted field from sections parsing

    // Fix question sets
    for (const set of question_sets) {
        // Ensure VARC/DILR/CASELET sets have context_body
        if (['VARC', 'DILR', 'CASELET'].includes(set.set_type)) {
            if (!set.context_body || set.context_body.trim() === '') {
                // Downgrade to ATOMIC if no context
                set.set_type = 'ATOMIC';
            }
        }

        // Clean up
        delete set.metadata;
        delete set.context_type;
        if (set.context_body === '' || set.context_body === 'none') {
            delete set.context_body;
        }
    }

    // Fix questions
    let questionNum = 0;
    for (const q of questions) {
        questionNum++;

        // Ensure question_number
        if (!q.question_number) {
            q.question_number = questionNum;
        }

        // Ensure sequence_order
        if (!q.sequence_order) {
            q.sequence_order = 1;
        }

        // Ensure client_question_id
        if (!q.client_question_id) {
            q.client_question_id = `Q${q.question_number}`;
        }

        // Clean question text
        if (q.question_text) {
            q.question_text = q.question_text.trim();
        }

        // Ensure MCQ has options
        if (q.question_type === 'MCQ' && (!q.options || q.options.length === 0)) {
            console.warn(`Warning: MCQ question ${q.client_question_id} has no options`);
        }

        // Clean empty solution text
        if (q.solution_text === '' || q.solution_text === '""') {
            delete q.solution_text;
        }

        // Ensure correct_answer format
        if (q.correct_answer) {
            q.correct_answer = String(q.correct_answer).replace(/^["']|["']$/g, '');
        }
    }

    // Update total_questions
    paper.total_questions = questions.length;

    return { paper, question_sets, questions };
}

function validateOutput(data) {
    const errors = [];

    // Check schema version
    if (data.schema_version !== 'v3.0') {
        errors.push(`schema_version must be 'v3.0'`);
    }

    // Check paper
    if (!data.paper.slug) errors.push('paper.slug is required');
    if (!data.paper.title) errors.push('paper.title is required');

    // Check sets
    const setIds = new Set();
    for (const set of data.question_sets) {
        if (!set.client_set_id) {
            errors.push('question_set missing client_set_id');
        } else if (setIds.has(set.client_set_id)) {
            errors.push(`Duplicate client_set_id: ${set.client_set_id}`);
        } else {
            setIds.add(set.client_set_id);
        }

        if (!set.section) errors.push(`Set ${set.client_set_id} missing section`);
        if (!set.set_type) errors.push(`Set ${set.client_set_id} missing set_type`);
        if (set.display_order === undefined) errors.push(`Set ${set.client_set_id} missing display_order`);
    }

    // Check questions
    const questionIds = new Set();
    for (const q of data.questions) {
        if (!q.client_question_id) {
            errors.push('question missing client_question_id');
        } else if (questionIds.has(q.client_question_id)) {
            errors.push(`Duplicate client_question_id: ${q.client_question_id}`);
        } else {
            questionIds.add(q.client_question_id);
        }

        if (!q.set_ref) {
            errors.push(`Question ${q.client_question_id} missing set_ref`);
        } else if (!setIds.has(q.set_ref)) {
            errors.push(`Question ${q.client_question_id} references non-existent set: ${q.set_ref}`);
        }

        if (!q.question_text) errors.push(`Question ${q.client_question_id} missing question_text`);
        if (!q.question_type) errors.push(`Question ${q.client_question_id} missing question_type`);

        if (q.question_type === 'MCQ' && (!q.options || q.options.length < 2)) {
            errors.push(`MCQ question ${q.client_question_id} needs at least 2 options`);
        }
    }

    return errors;
}

function formatAjvErrors(errors = []) {
    return errors.map((err) => {
        const path = err.instancePath || '(root)';
        const message = err.message || err.keyword || 'schema validation error';
        return `${path} ${message}`.trim();
    });
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node scripts/parse-md-to-v3.mjs <input.md> [output.json]

Parses custom markdown format CAT papers to v3.0 JSON schema.

Arguments:
  input.md      Path to the markdown file to parse
  output.json   Optional output path (default: same name with .json extension)

Options:
  --help, -h    Show this help message
`);
        process.exit(0);
    }

    const inputPath = args[0];
    const outputPath = args[1] || inputPath.replace(/\.md$/i, '.json');

    console.log(`📖 Reading: ${inputPath}`);
    const content = readFileSync(inputPath, 'utf-8');

    console.log('📋 Parsing YAML frontmatter...');
    const paperMeta = parseYamlFrontmatter(content);

    console.log('📝 Parsing markdown content...');
    const { question_sets, questions } = parseMarkdownContent(content, paperMeta);

    console.log(`   Found ${question_sets.length} question sets`);
    console.log(`   Found ${questions.length} questions`);

    console.log('🔧 Post-processing...');
    const processed = postProcess(paperMeta, question_sets, questions);

    const output = {
        schema_version: 'v3.0',
        paper: processed.paper,
        question_sets: processed.question_sets,
        questions: processed.questions
    };

    console.log('✅ Validating output (custom + AJV)...');
    const errors = validateOutput(output);
    const ajvResult = validatePaperSchema(output);
    const ajvErrors = ajvResult.valid ? [] : formatAjvErrors(ajvResult.errors);
    const allErrors = [...errors, ...ajvErrors];

    if (errors.length > 0) {
        console.error('❌ Custom validation errors:');
        errors.forEach(e => console.error(`   - ${e}`));
        console.error('');
    }

    if (ajvErrors.length > 0) {
        console.error('❌ AJV schema validation errors:');
        ajvErrors.forEach(e => console.error(`   - ${e}`));
        console.error('');
    }

    if (allErrors.length > 0) {
        console.log('⚠️  Writing output anyway for debugging...');
    } else {
        console.log('✅ Validation passed!');
    }

    console.log(`💾 Writing: ${outputPath}`);
    writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    // Summary
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Paper: ${output.paper.title}`);
    console.log(`   Slug: ${output.paper.slug}`);
    console.log(`   Year: ${output.paper.year}`);
    console.log(`   Questions: ${output.questions.length}`);
    console.log(`   Question Sets: ${output.question_sets.length}`);
    console.log(`   Sections: ${output.paper.sections?.join(', ') || 'N/A'}`);

    // Question type breakdown
    const mcqCount = output.questions.filter(q => q.question_type === 'MCQ').length;
    const titaCount = output.questions.filter(q => q.question_type === 'TITA').length;
    console.log(`   MCQ: ${mcqCount}, TITA: ${titaCount}`);

    if (allErrors.length > 0) {
        process.exit(1);
    }
}

main();
