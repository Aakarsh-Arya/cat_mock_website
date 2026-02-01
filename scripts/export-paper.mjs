#!/usr/bin/env node
/**
 * @fileoverview Paper Export Script
 * @description CLI tool to export papers from Supabase to JSON files
 * @usage node scripts/export-paper.mjs <paper_id> [options]
 * 
 * Options:
 *   --out <path>        Output file path (default: ./exports/paper_<id>.json)
 *   --version <n>       Export specific version number
 *   --run <uuid>        Export specific ingest run ID
 *   --assembled         Force assembly from current DB state (ignore snapshots)
 *   --list-versions     List all versions for this paper
 *   --help, -h          Show help message
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Set them in .env.local or pass via environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// HELP
// =============================================================================

function showHelp() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    CAT Paper Export Tool                             ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/export-paper.mjs <paper_id> [options]

Options:
  --out <path>        Output file path (default: ./exports/<slug>.json)
  --version <n>       Export specific version number
  --run <uuid>        Export specific ingest run ID
  --assembled         Force assembly from current DB state (ignore snapshots)
  --list-versions     List all available versions for this paper
  --list             List all papers
  --help, -h          Show this help message

Examples:
  # Export latest version of a paper
  node scripts/export-paper.mjs abc-123-def

  # Export to specific file
  node scripts/export-paper.mjs abc-123-def --out ./my-paper.json

  # Export specific version
  node scripts/export-paper.mjs abc-123-def --version 2

  # List all versions
  node scripts/export-paper.mjs abc-123-def --list-versions

  # List all papers
  node scripts/export-paper.mjs --list

Environment Variables:
  Load from .env.local:
  Get-Content .env.local | ForEach-Object { if ($_ -match '^(\\w+)=(.*)$') { $name=$matches[1]; $value=$matches[2]; Set-Item -Path Env:$name -Value $value } }
`);
}

// =============================================================================
// LIST PAPERS
// =============================================================================

async function listPapers() {
    console.log('\n📋 Listing all papers...\n');

    const { data: papers, error } = await supabase
        .from('papers')
        .select('id, slug, title, published, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }

    if (!papers || papers.length === 0) {
        console.log('No papers found.');
        return;
    }

    console.log('ID                                    | Slug                      | Title                           | Published');
    console.log('─'.repeat(120));

    for (const paper of papers) {
        const slug = (paper.slug || '-').padEnd(25);
        const title = (paper.title || '-').substring(0, 30).padEnd(30);
        const published = paper.published ? '✓' : '✗';
        console.log(`${paper.id} | ${slug} | ${title} | ${published}`);
    }

    console.log(`\nTotal: ${papers.length} papers`);
}

// =============================================================================
// LIST VERSIONS
// =============================================================================

async function listVersions(paperId) {
    console.log(`\n📋 Listing versions for paper: ${paperId}\n`);

    // First get paper info
    const { data: paper, error: paperError } = await supabase
        .from('papers')
        .select('id, slug, title, latest_ingest_run_id')
        .eq('id', paperId)
        .single();

    if (paperError || !paper) {
        console.error(`❌ Paper not found: ${paperId}`);
        process.exit(1);
    }

    console.log(`Paper: ${paper.title} (${paper.slug})`);
    console.log(`Latest Ingest Run: ${paper.latest_ingest_run_id || 'None'}\n`);

    // Get all versions
    const { data: versions, error } = await supabase
        .from('paper_ingest_runs')
        .select('id, version_number, schema_version, created_at, import_notes')
        .eq('paper_id', paperId)
        .order('version_number', { ascending: false });

    if (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }

    if (!versions || versions.length === 0) {
        console.log('No versioned imports found. Use --assembled to export current DB state.');
        return;
    }

    console.log('Version | Ingest Run ID                        | Schema  | Created At           | Notes');
    console.log('─'.repeat(110));

    for (const v of versions) {
        const isLatest = v.id === paper.latest_ingest_run_id ? ' *' : '  ';
        const notes = (v.import_notes || '').substring(0, 30);
        const created = new Date(v.created_at).toISOString().substring(0, 19);
        console.log(`${String(v.version_number).padStart(4)}${isLatest} | ${v.id} | ${v.schema_version.padEnd(7)} | ${created} | ${notes}`);
    }

    console.log(`\n* = Latest version`);
    console.log(`Total: ${versions.length} versions`);
}

// =============================================================================
// EXPORT PAPER
// =============================================================================

async function exportPaper(paperId, options) {
    const { outPath, version, runId, assembled } = options;

    console.log(`\n📦 Exporting paper: ${paperId}`);

    let exportData;
    let filename;

    if (assembled) {
        console.log('   Mode: Assembled from current database state');
        const { data, error } = await supabase.rpc('export_paper_json', {
            p_paper_id: paperId
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;
        filename = `paper_${paperId}_assembled.json`;
    } else if (runId) {
        console.log(`   Mode: Specific ingest run (${runId})`);
        const { data, error } = await supabase.rpc('export_paper_json_versioned', {
            p_paper_id: paperId,
            p_ingest_run_id: runId
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;
        filename = `paper_${paperId}_run_${runId}.json`;
    } else if (version) {
        console.log(`   Mode: Specific version (v${version})`);

        // Get run ID for this version
        const { data: runData, error: runError } = await supabase
            .from('paper_ingest_runs')
            .select('id')
            .eq('paper_id', paperId)
            .eq('version_number', parseInt(version, 10))
            .single();

        if (runError || !runData) {
            console.error(`❌ Version ${version} not found for paper ${paperId}`);
            process.exit(1);
        }

        const { data, error } = await supabase.rpc('export_paper_json_versioned', {
            p_paper_id: paperId,
            p_ingest_run_id: runData.id
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;
        filename = `paper_${paperId}_v${version}.json`;
    } else {
        console.log('   Mode: Latest version (canonical snapshot preferred)');
        const { data, error } = await supabase.rpc('export_paper_json_versioned', {
            p_paper_id: paperId,
            p_ingest_run_id: null
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;

        // Get paper slug for filename
        const { data: paperData } = await supabase
            .from('papers')
            .select('slug')
            .eq('id', paperId)
            .single();

        const slug = paperData?.slug || paperId;
        filename = `${slug}.json`;
    }

    // Check for errors in response
    if (exportData && typeof exportData === 'object' && 'error' in exportData) {
        console.error(`❌ Export error: ${exportData.error}`);
        process.exit(1);
    }

    // Determine output path
    const finalPath = outPath || resolve(process.cwd(), 'exports', filename);

    // Ensure directory exists
    const dir = dirname(finalPath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    // Write file
    const jsonString = JSON.stringify(exportData, null, 2);
    writeFileSync(finalPath, jsonString, 'utf-8');

    // Summary
    const stats = {
        contexts: Array.isArray(exportData?.contexts) ? exportData.contexts.length : 0,
        questions: Array.isArray(exportData?.questions) ? exportData.questions.length : 0,
        fileSize: (Buffer.byteLength(jsonString) / 1024).toFixed(2)
    };

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                         Export Complete!                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  Paper:       ${exportData?.paper?.title || paperId}
║  Slug:        ${exportData?.paper?.slug || '-'}
║  Contexts:    ${stats.contexts}
║  Questions:   ${stats.questions}
║  File Size:   ${stats.fileSize} KB
║  Output:      ${finalPath}
╚══════════════════════════════════════════════════════════════════════╝
`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    const flags = {
        help: args.includes('--help') || args.includes('-h'),
        list: args.includes('--list'),
        listVersions: args.includes('--list-versions'),
        assembled: args.includes('--assembled'),
        outPath: null,
        version: null,
        runId: null,
        paperId: null
    };

    // Parse --out
    const outIdx = args.indexOf('--out');
    if (outIdx !== -1 && args[outIdx + 1]) {
        flags.outPath = args[outIdx + 1];
    }

    // Parse --version
    const versionIdx = args.indexOf('--version');
    if (versionIdx !== -1 && args[versionIdx + 1]) {
        flags.version = args[versionIdx + 1];
    }

    // Parse --run
    const runIdx = args.indexOf('--run');
    if (runIdx !== -1 && args[runIdx + 1]) {
        flags.runId = args[runIdx + 1];
    }

    // Get paper ID (first non-flag argument)
    for (const arg of args) {
        if (!arg.startsWith('--') && !arg.startsWith('-')) {
            // Check if it's not the value for a flag
            const prevIdx = args.indexOf(arg) - 1;
            if (prevIdx >= 0 && ['--out', '--version', '--run'].includes(args[prevIdx])) {
                continue;
            }
            flags.paperId = arg;
            break;
        }
    }

    // Handle commands
    if (flags.help || (args.length === 0)) {
        showHelp();
        process.exit(0);
    }

    if (flags.list) {
        await listPapers();
        process.exit(0);
    }

    if (!flags.paperId) {
        console.error('❌ Paper ID required. Use --help for usage.');
        process.exit(1);
    }

    if (flags.listVersions) {
        await listVersions(flags.paperId);
        process.exit(0);
    }

    // Export paper
    await exportPaper(flags.paperId, {
        outPath: flags.outPath,
        version: flags.version,
        runId: flags.runId,
        assembled: flags.assembled
    });
}

main().catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}`);
    process.exit(1);
});
