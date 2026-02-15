'use client';

import { sb } from '@/lib/supabase/client';

export interface BookmarkItem {
    bookmarkId: string;
    questionId: string;
    paperId: string | null;
    section: 'VARC' | 'DILR' | 'QA' | null;
    topic: string | null;
    subtopic: string | null;
    createdAt: string;
    questionText: string | null;
    questionNumber: number | null;
    paperTitle: string | null;
    paperSlug: string | null;
}

export interface FetchBookmarksResult {
    bookmarks: BookmarkItem[];
    available: boolean;
    error?: string;
}

export interface ToggleBookmarkResult {
    success: boolean;
    isBookmarked: boolean;
    error?: string;
}

type JoinedBookmarkRow = {
    id: string;
    question_id: string;
    paper_id: string | null;
    section: string | null;
    topic: string | null;
    subtopic: string | null;
    created_at: string;
    questions?: { question_text?: string | null; question_number?: number | null } | Array<{ question_text?: string | null; question_number?: number | null }> | null;
    papers?: { title?: string | null; slug?: string | null } | Array<{ title?: string | null; slug?: string | null }> | null;
};

const SECTION_VALUES = new Set(['VARC', 'DILR', 'QA']);

function asSingle<T>(value: T | T[] | null | undefined): T | null {
    if (!value) return null;
    return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeSection(value: string | null | undefined): 'VARC' | 'DILR' | 'QA' | null {
    if (!value) return null;
    const upper = value.toUpperCase().trim();
    return SECTION_VALUES.has(upper) ? (upper as 'VARC' | 'DILR' | 'QA') : null;
}

function rowToBookmark(row: JoinedBookmarkRow): BookmarkItem {
    const question = asSingle(row.questions);
    const paper = asSingle(row.papers);
    return {
        bookmarkId: row.id,
        questionId: row.question_id,
        paperId: row.paper_id,
        section: normalizeSection(row.section),
        topic: row.topic ?? null,
        subtopic: row.subtopic ?? null,
        createdAt: row.created_at,
        questionText: question?.question_text ?? null,
        questionNumber: question?.question_number ?? null,
        paperTitle: paper?.title ?? null,
        paperSlug: paper?.slug ?? null,
    };
}

function flattenGroupedPayload(payload: unknown): BookmarkItem[] {
    if (!payload || typeof payload !== 'object') return [];
    const root = payload as {
        by_section?: Record<string, { by_topic?: Record<string, { questions?: Array<Record<string, unknown>> }> }>;
    };
    const bySection = root.by_section ?? {};
    const items: BookmarkItem[] = [];

    for (const [sectionKey, sectionData] of Object.entries(bySection)) {
        const byTopic = sectionData?.by_topic ?? {};
        for (const [topicKey, topicData] of Object.entries(byTopic)) {
            const questions = Array.isArray(topicData?.questions) ? topicData.questions : [];
            for (const q of questions) {
                const bookmarkId = typeof q.bookmark_id === 'string' ? q.bookmark_id : '';
                const questionId = typeof q.question_id === 'string' ? q.question_id : '';
                if (!bookmarkId || !questionId) continue;
                items.push({
                    bookmarkId,
                    questionId,
                    paperId: typeof q.paper_id === 'string' ? q.paper_id : null,
                    section: normalizeSection(sectionKey === 'Unknown' ? null : sectionKey),
                    topic: topicKey === 'General' ? null : topicKey,
                    subtopic: typeof q.subtopic === 'string' ? q.subtopic : null,
                    createdAt: typeof q.created_at === 'string' ? q.created_at : new Date().toISOString(),
                    questionText: typeof q.question_text === 'string' ? q.question_text : null,
                    questionNumber: null,
                    paperTitle: typeof q.paper_title === 'string' ? q.paper_title : null,
                    paperSlug: null,
                });
            }
        }
    }

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchUserBookmarks(): Promise<FetchBookmarksResult> {
    const supabase = sb();

    const direct = await supabase
        .from('user_bookmarks')
        .select(`
            id,
            question_id,
            paper_id,
            section,
            topic,
            subtopic,
            created_at,
            questions:question_id(question_text, question_number),
            papers:paper_id(title, slug)
        `)
        .order('created_at', { ascending: false });

    if (!direct.error) {
        return {
            bookmarks: ((direct.data ?? []) as JoinedBookmarkRow[]).map(rowToBookmark),
            available: true,
        };
    }

    if (direct.error.code === '42P01') {
        return { bookmarks: [], available: false, error: 'Bookmarks feature is not available yet.' };
    }

    const grouped = await supabase.rpc('get_user_bookmarks_grouped');
    if (!grouped.error) {
        return {
            bookmarks: flattenGroupedPayload(grouped.data),
            available: true,
        };
    }

    if (grouped.error.code === '42883') {
        return { bookmarks: [], available: false, error: 'Bookmarks feature is not available yet.' };
    }

    return {
        bookmarks: [],
        available: false,
        error: grouped.error.message || direct.error.message || 'Failed to load bookmarks',
    };
}

export async function fetchBookmarkedQuestionIds(): Promise<Set<string>> {
    const result = await fetchUserBookmarks();
    return new Set(result.bookmarks.map((item) => item.questionId));
}

export async function toggleUserBookmark(questionId: string): Promise<ToggleBookmarkResult> {
    const supabase = sb();
    const rpcResult = await supabase.rpc('toggle_user_bookmark', { p_question_id: questionId });

    if (!rpcResult.error) {
        const action = (rpcResult.data as { action?: unknown } | null)?.action;
        const isBookmarked = action === 'added' ? true : action === 'removed' ? false : true;
        return { success: true, isBookmarked };
    }

    if (rpcResult.error.code !== '42883') {
        return { success: false, isBookmarked: false, error: rpcResult.error.message || 'Failed to toggle bookmark' };
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, isBookmarked: false, error: 'Not authenticated' };
    }

    const existing = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('question_id', questionId)
        .maybeSingle();

    if (existing.error && existing.error.code !== 'PGRST116') {
        if (existing.error.code === '42P01') {
            return { success: false, isBookmarked: false, error: 'Bookmarks feature is not available yet.' };
        }
        return { success: false, isBookmarked: false, error: existing.error.message || 'Failed to toggle bookmark' };
    }

    if (existing.data?.id) {
        const deleted = await supabase.from('user_bookmarks').delete().eq('id', existing.data.id);
        if (deleted.error) {
            return { success: false, isBookmarked: true, error: deleted.error.message || 'Failed to remove bookmark' };
        }
        return { success: true, isBookmarked: false };
    }

    const inserted = await supabase.from('user_bookmarks').insert({
        user_id: user.id,
        question_id: questionId,
    });

    if (inserted.error) {
        if (inserted.error.code === '42P01') {
            return { success: false, isBookmarked: false, error: 'Bookmarks feature is not available yet.' };
        }
        if (inserted.error.code === '23505') {
            return { success: true, isBookmarked: true };
        }
        return { success: false, isBookmarked: false, error: inserted.error.message || 'Failed to add bookmark' };
    }

    return { success: true, isBookmarked: true };
}

export async function fetchLatestReviewAttemptsByPaper(): Promise<Record<string, string>> {
    const supabase = sb();
    const { data, error } = await supabase
        .from('attempts')
        .select('id, paper_id, status, submitted_at, completed_at, started_at')
        .in('status', ['submitted', 'completed'])
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('completed_at', { ascending: false, nullsFirst: false })
        .order('started_at', { ascending: false, nullsFirst: false });

    if (error || !data) return {};

    const byPaper: Record<string, string> = {};
    for (const row of data) {
        const paperId = typeof row.paper_id === 'string' ? row.paper_id : null;
        const attemptId = typeof row.id === 'string' ? row.id : null;
        if (!paperId || !attemptId) continue;
        if (!byPaper[paperId]) {
            byPaper[paperId] = attemptId;
        }
    }
    return byPaper;
}
