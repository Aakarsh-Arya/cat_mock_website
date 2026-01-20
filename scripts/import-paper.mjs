#!/usr/bin/env node
/**
 * @fileoverview Paper/Questions Import Script
 * @description CLI tool to import papers and questions from JSON files into Supabase
 * @usage node scripts/import-paper.mjs <path-to-json-file>
 * 
 * JSON Format:
 * {
 *   "paper": {
 *     "slug": "cat-2024-mock-2",
 *     "title": "CAT 2024 Mock Test 2",
 *     "description": "Full-length mock test...",
 *     "year": 2024,
 *     "total_questions": 66,
 *     "total_marks": 198,
 *     "duration_minutes": 120,
 *     "sections": [
 *       { "name": "VARC", "questions": 24, "time": 40, "marks": 72 },
 *       { "name": "DILR", "questions": 20, "time": 40, "marks": 60 },
 *       { "name": "QA", "questions": 22, "time": 40, "marks": 66 }
 *     ],
 *     "difficulty_level": "cat-level",
 *     "is_free": true,
 *     "published": false
 *   },
 *   "questions": [
 *     {
 *       "section": "VARC",
 *       "question_number": 1,
 *       "question_text": "...",
 *       "question_type": "MCQ",
 *       "options": ["A", "B", "C", "D"],
 *       "correct_answer": "B",
 *       "positive_marks": 3.0,
 *       "negative_marks": 1.0,
 *       "difficulty": "medium",
 *       "topic": "Reading Comprehension",
 *       "subtopic": "Inference",
 *       "solution_text": "..."
 *     }
 *   ]
 * }
 */

import { readFileSync } from 'fs';
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
    console.error('Set them in .env.local or pass via environment:');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/import-paper.mjs paper.json');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// VALIDATION
// =============================================================================

function validatePaper(paper) {
    const required = ['slug', 'title', 'year', 'total_questions', 'sections'];
    const missing = required.filter(k => !paper[k]);
    if (missing.length > 0) {
        throw new Error(`Paper missing required fields: ${missing.join(', ')}`);
    }
    if (!Array.isArray(paper.sections) || paper.sections.length === 0) {
        throw new Error('Paper must have at least one section');
    }
    return true;
}

function validateQuestion(q, index) {
    const required = ['section', 'question_number', 'question_text', 'question_type', 'correct_answer'];
    const missing = required.filter(k => !q[k]);
    if (missing.length > 0) {
        throw new Error(`Question ${index + 1} missing required fields: ${missing.join(', ')}`);
    }
    if (!['VARC', 'DILR', 'QA'].includes(q.section)) {
        throw new Error(`Question ${index + 1} has invalid section: ${q.section}`);
    }
    if (!['MCQ', 'TITA'].includes(q.question_type)) {
        throw new Error(`Question ${index + 1} has invalid question_type: ${q.question_type}`);
    }
    if (q.question_type === 'MCQ' && (!q.options || !Array.isArray(q.options))) {
        throw new Error(`Question ${index + 1} is MCQ but missing options array`);
    }
    return true;
}

// =============================================================================
// IMPORT FUNCTIONS
// =============================================================================

async function importPaper(paperData) {
    console.log(`📄 Importing paper: ${paperData.title}`);

    // Check if paper with this slug already exists
    const { data: existing } = await supabase
        .from('papers')
        .select('id')
        .eq('slug', paperData.slug)
        .single();

    if (existing) {
        console.log(`   ⚠️  Paper with slug "${paperData.slug}" already exists (id: ${existing.id})`);
        console.log(`   Updating existing paper...`);

        const { data, error } = await supabase
            .from('papers')
            .update({
                title: paperData.title,
                description: paperData.description || null,
                year: paperData.year,
                total_questions: paperData.total_questions,
                total_marks: paperData.total_marks || 198,
                duration_minutes: paperData.duration_minutes || 120,
                sections: paperData.sections,
                default_positive_marks: paperData.default_positive_marks || 3.0,
                default_negative_marks: paperData.default_negative_marks || 1.0,
                difficulty_level: paperData.difficulty_level || 'cat-level',
                is_free: paperData.is_free ?? true,
                published: paperData.published ?? false,
                available_from: paperData.available_from || null,
                available_until: paperData.available_until || null,
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Insert new paper
    const { data, error } = await supabase
        .from('papers')
        .insert({
            slug: paperData.slug,
            title: paperData.title,
            description: paperData.description || null,
            year: paperData.year,
            total_questions: paperData.total_questions,
            total_marks: paperData.total_marks || 198,
            duration_minutes: paperData.duration_minutes || 120,
            sections: paperData.sections,
            default_positive_marks: paperData.default_positive_marks || 3.0,
            default_negative_marks: paperData.default_negative_marks || 1.0,
            difficulty_level: paperData.difficulty_level || 'cat-level',
            is_free: paperData.is_free ?? true,
            published: paperData.published ?? false,
            available_from: paperData.available_from || null,
            available_until: paperData.available_until || null,
        })
        .select()
        .single();

    if (error) throw error;
    console.log(`   ✅ Paper created with id: ${data.id}`);
    return data;
}

async function importQuestions(paperId, questions) {
    console.log(`📝 Importing ${questions.length} questions...`);

    // Delete existing questions for this paper (for clean re-import)
    const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('paper_id', paperId);

    if (deleteError) {
        console.warn(`   ⚠️  Could not delete existing questions: ${deleteError.message}`);
    }

    // Prepare questions with paper_id
    const questionsToInsert = questions.map(q => ({
        paper_id: paperId,
        section: q.section,
        question_number: q.question_number,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer,
        positive_marks: q.positive_marks ?? 3.0,
        negative_marks: q.negative_marks ?? (q.question_type === 'TITA' ? 0 : 1.0),
        difficulty: q.difficulty || null,
        topic: q.topic || null,
        subtopic: q.subtopic || null,
        solution_text: q.solution_text || null,
        solution_image_url: q.solution_image_url || null,
        video_solution_url: q.video_solution_url || null,
        is_active: true,
    }));

    // Insert in batches of 50
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

async function publishPaper(paperId, shouldPublish) {
    if (shouldPublish) {
        const { error } = await supabase
            .from('papers')
            .update({ published: true })
            .eq('id', paperId);

        if (error) throw error;
        console.log(`🚀 Paper published!`);
    } else {
        console.log(`📋 Paper saved as draft (set "published": true to publish)`);
    }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    CAT Mock Paper Import Tool                       ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/import-paper.mjs <path-to-json-file> [options]

Options:
  --publish    Publish the paper immediately after import
  --help, -h   Show this help message

Example:
  node scripts/import-paper.mjs data/cat-2024-mock-2.json --publish

JSON Format:
  See the top of this script file for the expected JSON structure.
`);
        process.exit(0);
    }

    const jsonPath = args[0];
    const shouldPublish = args.includes('--publish');

    try {
        console.log(`\n📂 Reading ${jsonPath}...`);
        const content = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(content);

        if (!data.paper) {
            throw new Error('JSON must have a "paper" object at the root');
        }
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('JSON must have a "questions" array at the root');
        }

        // Validate
        validatePaper(data.paper);
        data.questions.forEach((q, i) => validateQuestion(q, i));
        console.log(`✅ Validation passed\n`);

        // Import
        const paper = await importPaper(data.paper);
        const questionCount = await importQuestions(paper.id, data.questions);
        await publishPaper(paper.id, shouldPublish);

        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                         Import Complete!                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  Paper ID:    ${paper.id}
║  Slug:        ${paper.slug}
║  Questions:   ${questionCount}
║  Published:   ${shouldPublish ? 'Yes' : 'No (draft)'}
╚══════════════════════════════════════════════════════════════════════╝
`);

    } catch (err) {
        console.error(`\n❌ Import failed: ${err.message}`);
        process.exit(1);
    }
}

main();
