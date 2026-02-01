#!/usr/bin/env node
/**
 * @fileoverview Backfill Paper Versions Script
 * @description Creates initial ingest run records for existing papers
 * @usage node scripts/backfill-paper-versions.mjs [options]
 * 
 * This script:
 * 1. Finds all papers without a latest_ingest_run_id
 * 2. Calls export_paper_json() to assemble current state
 * 3. Creates a paper_ingest_runs record as version 1
 * 4. Updates papers.latest_ingest_run_id
 * 
 * Options:
 *   --dry-run    Show what would be done without making changes
 *   --paper-id   Backfill only a specific paper
 *   --help, -h   Show help message
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// HASH FUNCTION
// =============================================================================

function computeJsonHash(data) {
    const jsonStr = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(jsonStr).digest('hex');
}

// =============================================================================
// BACKFILL FUNCTIONS
// =============================================================================

async function getPapersNeedingBackfill(specificPaperId = null) {
    let query = supabase
        .from('papers')
        .select('id, slug, title, latest_ingest_run_id');

    if (specificPaperId) {
        query = query.eq('id', specificPaperId);
    } else {
        query = query.is('latest_ingest_run_id', null);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch papers: ${error.message}`);
    }

    return data || [];
}

async function backfillPaper(paper, dryRun = false) {
    console.log(`\n📄 Processing: ${paper.title} (${paper.slug})`);
    console.log(`   Paper ID: ${paper.id}`);

    // Export current state using SQL function
    const { data: exportedJson, error: exportError } = await supabase.rpc('export_paper_json', {
        p_paper_id: paper.id
    });

    if (exportError) {
        console.error(`   ❌ Export failed: ${exportError.message}`);
        return { success: false, error: exportError.message };
    }

    if (exportedJson?.error) {
        console.error(`   ❌ Export returned error: ${exportedJson.error}`);
        return { success: false, error: exportedJson.error };
    }

    // Calculate hash
    const canonicalHash = computeJsonHash(exportedJson);
    console.log(`   Hash: ${canonicalHash.substring(0, 16)}...`);

    // Check if already has ingest runs
    const { data: existingRuns } = await supabase
        .from('paper_ingest_runs')
        .select('id, version_number')
        .eq('paper_id', paper.id)
        .order('version_number', { ascending: false })
        .limit(1);

    if (existingRuns && existingRuns.length > 0) {
        console.log(`   ⚠️  Paper already has ${existingRuns.length} ingest run(s)`);

        if (!paper.latest_ingest_run_id) {
            // Just need to update the pointer
            if (!dryRun) {
                await supabase
                    .from('papers')
                    .update({ latest_ingest_run_id: existingRuns[0].id })
                    .eq('id', paper.id);
                console.log(`   ✅ Updated latest_ingest_run_id pointer`);
            } else {
                console.log(`   [DRY RUN] Would update latest_ingest_run_id to ${existingRuns[0].id}`);
            }
        }
        return { success: true, skipped: true };
    }

    // Count contexts and questions
    const contextCount = Array.isArray(exportedJson?.contexts) ? exportedJson.contexts.length : 0;
    const questionCount = Array.isArray(exportedJson?.questions) ? exportedJson.questions.length : 0;
    console.log(`   Contexts: ${contextCount}, Questions: ${questionCount}`);

    if (dryRun) {
        console.log(`   [DRY RUN] Would create ingest run v1`);
        return { success: true, dryRun: true };
    }

    // Create ingest run
    const { data: ingestRun, error: insertError } = await supabase
        .from('paper_ingest_runs')
        .insert({
            paper_id: paper.id,
            schema_version: 'v1.0',
            version_number: 1,
            canonical_paper_json: exportedJson,
            canonical_json_hash: canonicalHash,
            import_notes: 'Backfill from existing database state'
        })
        .select()
        .single();

    if (insertError) {
        console.error(`   ❌ Insert failed: ${insertError.message}`);
        return { success: false, error: insertError.message };
    }

    // Update paper's latest_ingest_run_id
    const { error: updateError } = await supabase
        .from('papers')
        .update({ latest_ingest_run_id: ingestRun.id })
        .eq('id', paper.id);

    if (updateError) {
        console.error(`   ❌ Update failed: ${updateError.message}`);
        return { success: false, error: updateError.message };
    }

    console.log(`   ✅ Created ingest run v1 (${ingestRun.id})`);
    return { success: true, ingestRunId: ingestRun.id };
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║              Paper Versions Backfill Tool                            ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/backfill-paper-versions.mjs [options]

Options:
  --dry-run          Show what would be done without making changes
  --paper-id <id>    Backfill only a specific paper
  --all              Include papers that already have ingest runs
  --help, -h         Show this help message

Examples:
  # Preview what would be backfilled
  node scripts/backfill-paper-versions.mjs --dry-run

  # Backfill all papers without ingest runs
  node scripts/backfill-paper-versions.mjs

  # Backfill a specific paper
  node scripts/backfill-paper-versions.mjs --paper-id abc-123-def

What this does:
  1. Finds papers without latest_ingest_run_id
  2. Exports current state using export_paper_json()
  3. Creates paper_ingest_runs record as version 1
  4. Updates papers.latest_ingest_run_id
`);
        process.exit(0);
    }

    const dryRun = args.includes('--dry-run');
    const paperIdIdx = args.indexOf('--paper-id');
    const specificPaperId = paperIdIdx !== -1 ? args[paperIdIdx + 1] : null;

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║              Paper Versions Backfill Tool                            ║
╚══════════════════════════════════════════════════════════════════════╝
`);

    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    try {
        // Get papers needing backfill
        const papers = await getPapersNeedingBackfill(specificPaperId);

        if (papers.length === 0) {
            console.log('✅ No papers need backfilling');
            console.log('   All papers already have ingest run records.');
            return;
        }

        console.log(`📋 Found ${papers.length} paper(s) to backfill:\n`);

        for (const paper of papers) {
            console.log(`   - ${paper.slug} (${paper.id.substring(0, 8)}...)`);
        }

        // Process each paper
        const results = {
            success: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };

        for (const paper of papers) {
            const result = await backfillPaper(paper, dryRun);

            if (result.success) {
                if (result.skipped || result.dryRun) {
                    results.skipped++;
                } else {
                    results.success++;
                }
            } else {
                results.failed++;
                results.errors.push({ paper: paper.slug, error: result.error });
            }
        }

        // Summary
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                         Backfill Summary                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  Total Papers:     ${papers.length.toString().padStart(4)}
║  Successfully:     ${results.success.toString().padStart(4)}
║  Skipped:          ${results.skipped.toString().padStart(4)}
║  Failed:           ${results.failed.toString().padStart(4)}
╚══════════════════════════════════════════════════════════════════════╝
`);

        if (results.errors.length > 0) {
            console.log('Errors:');
            for (const err of results.errors) {
                console.log(`  - ${err.paper}: ${err.error}`);
            }
        }

        if (dryRun) {
            console.log('\n💡 Run without --dry-run to apply changes.');
        }

    } catch (err) {
        console.error(`\n❌ Fatal error: ${err.message}`);
        process.exit(1);
    }
}

main();
