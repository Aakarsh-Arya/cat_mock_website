#!/usr/bin/env node
/**
 * Sync NexAI demo markdown from a source file into repo content files.
 *
 * Default source: ~/Downloads/NexAI insights.md
 * Optional source override: --source <absolute-or-relative-path>
 *
 * Outputs:
 * - src/content/nexaiInsightsDemo.md
 * - src/content/nexaiInsightsDemo.ts
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function parseArgs(argv) {
    const args = { source: null };
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (token === '--source') {
            args.source = argv[i + 1] ?? null;
            i += 1;
        }
    }
    return args;
}

function toAbsolute(p) {
    if (!p) return null;
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

function normalizeMarkdown(md) {
    return md.replace(/\r\n/g, '\n');
}

async function findLatestDownloadsSource() {
    const downloadsDir = path.join(os.homedir(), 'Downloads');
    const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
    const candidates = entries
        .filter((entry) => entry.isFile() && /^NexAI insights.*\.md$/i.test(entry.name))
        .map((entry) => path.join(downloadsDir, entry.name));

    if (candidates.length === 0) {
        return path.join(downloadsDir, 'NexAI insights.md');
    }

    const candidatesWithStats = await Promise.all(
        candidates.map(async (candidatePath) => ({
            path: candidatePath,
            stat: await fs.stat(candidatePath),
        }))
    );

    candidatesWithStats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
    return candidatesWithStats[0].path;
}

function toTsModule(markdownText) {
    return `export const NEXAI_INSIGHTS_DEMO_MARKDOWN = ${JSON.stringify(markdownText)};\n`;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const defaultSource = await findLatestDownloadsSource();
    const sourcePath = toAbsolute(args.source) ?? defaultSource;

    const mdTargetPath = path.join(process.cwd(), 'src', 'content', 'nexaiInsightsDemo.md');
    const tsTargetPath = path.join(process.cwd(), 'src', 'content', 'nexaiInsightsDemo.ts');

    const sourceRaw = await fs.readFile(sourcePath, 'utf8');
    const normalized = normalizeMarkdown(sourceRaw);
    if (!normalized.trim()) {
        throw new Error(`Source markdown is empty: ${sourcePath}`);
    }

    await fs.writeFile(mdTargetPath, normalized, 'utf8');
    await fs.writeFile(tsTargetPath, toTsModule(normalized), 'utf8');

    console.log('Synced NexAI demo markdown');
    console.log(`Source: ${sourcePath}`);
    console.log(`Wrote:  ${mdTargetPath}`);
    console.log(`Wrote:  ${tsTargetPath}`);
}

main().catch((error) => {
    console.error('Failed to sync NexAI markdown:', error instanceof Error ? error.message : String(error));
    process.exit(1);
});
