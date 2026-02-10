#!/usr/bin/env node
/**
 * @fileoverview One-off maintenance script to standardize paper descriptions.
 * @description Updates every row in `papers` to a single template:
 *   "Full-length simulation of <title>. Experience the actual exam interface
 *    with detailed solutions and advanced performance analytics."
 *
 * Usage:
 *   node scripts/maintenance/update-paper-descriptions.mjs [--dry-run]
 *
 * Environment:
 *   Requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and
 *   SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(ROOT_DIR, '.env.local') });
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

function buildDescription(title) {
    const safeTitle = typeof title === 'string' ? title.trim() : '';
    const subject = safeTitle.length > 0 ? safeTitle : 'this mock test';
    return `Full-length simulation of ${subject}. Experience the actual exam interface with detailed solutions and advanced performance analytics.`;
}

async function main() {
    const isDryRun = process.argv.includes('--dry-run');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('='.repeat(70));
    console.log('Standardize Paper Descriptions');
    console.log('='.repeat(70));
    if (isDryRun) {
        console.log('Mode: DRY RUN (no DB writes)');
    }
    console.log('');

    if (!supabaseUrl) {
        console.error('Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is missing.');
        process.exit(1);
    }
    if (!supabaseServiceKey) {
        console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: papers, error: fetchError } = await supabase
        .from('papers')
        .select('id, title, description')
        .order('created_at', { ascending: false });

    if (fetchError) {
        console.error('Failed to fetch papers:', fetchError.message);
        process.exit(1);
    }

    if (!papers || papers.length === 0) {
        console.log('No papers found.');
        process.exit(0);
    }

    const updates = papers.map((paper) => ({
        id: paper.id,
        title: paper.title,
        oldDescription: paper.description,
        newDescription: buildDescription(paper.title),
    }));

    const changed = updates.filter((row) => row.oldDescription !== row.newDescription);

    console.log(`Total papers: ${updates.length}`);
    console.log(`Would change: ${changed.length}`);
    console.log('');

    const previewLimit = 8;
    changed.slice(0, previewLimit).forEach((row, index) => {
        console.log(`${index + 1}. ${row.title}`);
        console.log(`   NEW: ${row.newDescription}`);
    });
    if (changed.length > previewLimit) {
        console.log(`...and ${changed.length - previewLimit} more`);
    }
    console.log('');

    if (isDryRun) {
        console.log('Dry run complete. No changes were written.');
        process.exit(0);
    }

    let successCount = 0;
    let failureCount = 0;

    for (const row of updates) {
        const { error } = await supabase
            .from('papers')
            .update({
                description: row.newDescription,
                updated_at: new Date().toISOString(),
            })
            .eq('id', row.id);

        if (error) {
            failureCount += 1;
            console.error(`Failed: ${row.title} (${row.id}) -> ${error.message}`);
            continue;
        }

        successCount += 1;
    }

    console.log('');
    console.log('='.repeat(70));
    console.log(`Updated rows: ${successCount}`);
    console.log(`Failures: ${failureCount}`);
    console.log('='.repeat(70));

    if (failureCount > 0) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});