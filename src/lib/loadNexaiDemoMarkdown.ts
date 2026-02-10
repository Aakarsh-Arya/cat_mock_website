import 'server-only';

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { NEXAI_INSIGHTS_DEMO_MARKDOWN } from '@/content/nexaiInsightsDemo';

function normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, '\n');
}

async function readIfExists(filePath: string): Promise<string | null> {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const normalized = normalizeLineEndings(content).trim();
        return normalized.length > 0 ? normalized : null;
    } catch {
        return null;
    }
}

async function resolveDownloadsMarkdownPath(): Promise<string> {
    const downloadsDir = path.join(os.homedir(), 'Downloads');
    try {
        const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
        const candidates = entries
            .filter((entry) => entry.isFile() && /^NexAI insights.*\.md$/i.test(entry.name))
            .map((entry) => path.join(downloadsDir, entry.name));

        if (candidates.length === 0) {
            return path.join(downloadsDir, 'NexAI insights.md');
        }

        const candidateStats = await Promise.all(
            candidates.map(async (candidatePath) => ({
                path: candidatePath,
                stat: await fs.stat(candidatePath),
            }))
        );
        candidateStats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
        return candidateStats[0].path;
    } catch {
        return path.join(downloadsDir, 'NexAI insights.md');
    }
}

export async function loadNexaiDemoMarkdown(): Promise<string> {
    const envPath = process.env.NEXAI_INSIGHTS_MARKDOWN_PATH;
    const defaultDownloadsPath = await resolveDownloadsMarkdownPath();
    const repoFallbackPath = path.join(process.cwd(), 'src', 'content', 'nexaiInsightsDemo.md');

    const candidates = [envPath, defaultDownloadsPath, repoFallbackPath].filter(
        (candidate): candidate is string => Boolean(candidate)
    );

    for (const candidate of candidates) {
        const text = await readIfExists(candidate);
        if (text) return text;
    }

    return NEXAI_INSIGHTS_DEMO_MARKDOWN;
}
