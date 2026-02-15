'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabase/client';
import { MathText } from '@/features/exam-engine/ui/MathText';
import {
    fetchLatestReviewAttemptsByPaper,
    fetchUserBookmarks,
    toggleUserBookmark,
    type BookmarkItem,
} from '@/lib/bookmarks-client';

const SECTION_ORDER = ['VARC', 'DILR', 'QA', 'Unknown'] as const;

const SECTION_LABELS: Record<string, string> = {
    VARC: 'VARC',
    DILR: 'LRDI',
    QA: 'Quant',
    Unknown: 'Other',
};

type BookmarkQuestionDetail = {
    id: string;
    questionText: string | null;
    questionType: string | null;
    options: unknown;
    correctAnswer: string | null;
    solutionText: string | null;
    toppersApproach: string | null;
    questionImageUrl: string | null;
    contextTitle: string | null;
    contextBody: string | null;
    contextImageUrl: string | null;
};

type OptionView = { key: string; text: string };

function normalizeOptions(options: unknown): OptionView[] {
    if (Array.isArray(options)) {
        return options
            .map((entry, index) => ({
                key: String.fromCharCode(65 + index),
                text: typeof entry === 'string' ? entry : String(entry ?? ''),
            }))
            .filter((entry) => entry.text.trim() !== '');
    }

    if (options && typeof options === 'object') {
        const entries = Object.entries(options as Record<string, unknown>)
            .map(([key, value]) => ({
                key: key.toUpperCase(),
                text: typeof value === 'string' ? value : String(value ?? ''),
            }))
            .filter((entry) => entry.text.trim() !== '')
            .sort((a, b) => a.key.localeCompare(b.key));

        return entries;
    }

    return [];
}

export function BookmarksExplorer() {
    const searchParams = useSearchParams();
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [attemptByPaper, setAttemptByPaper] = useState<Record<string, string>>({});
    const [detailsByQuestion, setDetailsByQuestion] = useState<Record<string, BookmarkQuestionDetail>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [featureAvailable, setFeatureAvailable] = useState(true);
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [topicFilter, setTopicFilter] = useState<string>('all');
    const [subtopicFilter, setSubtopicFilter] = useState<string>('all');
    const [searchText, setSearchText] = useState('');
    const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const sectionParam = searchParams.get('section');
        const topicParam = searchParams.get('topic');
        const subtopicParam = searchParams.get('subtopic');

        if (sectionParam) {
            setSectionFilter(sectionParam);
        } else {
            setSectionFilter('all');
        }
        if (topicParam) {
            setTopicFilter(topicParam);
        } else {
            setTopicFilter('all');
        }
        if (subtopicParam) {
            setSubtopicFilter(subtopicParam);
        } else {
            setSubtopicFilter('all');
        }
    }, [searchParams]);

    const loadQuestionDetails = useCallback(async (questionIds: string[]) => {
        if (questionIds.length === 0) {
            setDetailsByQuestion({});
            return;
        }

        const supabase = sb();
        const { data: questionRows, error: questionError } = await supabase
            .from('questions')
            .select('id, question_text, question_type, options, correct_answer, solution_text, toppers_approach, question_image_url, set_id, context_id')
            .in('id', questionIds);

        if (questionError || !questionRows) {
            setDetailsByQuestion({});
            return;
        }

        const setIds = Array.from(
            new Set(
                questionRows
                    .map((row) => (typeof row.set_id === 'string' ? row.set_id : null))
                    .filter((value): value is string => Boolean(value))
            )
        );
        const contextIds = Array.from(
            new Set(
                questionRows
                    .map((row) => (typeof row.context_id === 'string' ? row.context_id : null))
                    .filter((value): value is string => Boolean(value))
            )
        );

        const [setResult, contextResult] = await Promise.all([
            setIds.length > 0
                ? supabase
                    .from('question_sets')
                    .select('id, context_title, context_body, context_image_url')
                    .in('id', setIds)
                : Promise.resolve({ data: [], error: null }),
            contextIds.length > 0
                ? supabase
                    .from('contexts')
                    .select('id, title, content, image_url')
                    .in('id', contextIds)
                : Promise.resolve({ data: [], error: null }),
        ]);

        const setMap = new Map(
            (setResult.data ?? []).map((row) => [
                row.id,
                {
                    contextTitle: typeof row.context_title === 'string' ? row.context_title : null,
                    contextBody: typeof row.context_body === 'string' ? row.context_body : null,
                    contextImageUrl: typeof row.context_image_url === 'string' ? row.context_image_url : null,
                },
            ])
        );
        const contextMap = new Map(
            (contextResult.data ?? []).map((row) => [
                row.id,
                {
                    contextTitle: typeof row.title === 'string' ? row.title : null,
                    contextBody: typeof row.content === 'string' ? row.content : null,
                    contextImageUrl: typeof row.image_url === 'string' ? row.image_url : null,
                },
            ])
        );

        const next: Record<string, BookmarkQuestionDetail> = {};
        questionRows.forEach((row) => {
            const rowId = typeof row.id === 'string' ? row.id : null;
            if (!rowId) return;
            const setContext = typeof row.set_id === 'string' ? setMap.get(row.set_id) : null;
            const legacyContext = typeof row.context_id === 'string' ? contextMap.get(row.context_id) : null;
            const context = setContext ?? legacyContext;

            next[rowId] = {
                id: rowId,
                questionText: typeof row.question_text === 'string' ? row.question_text : null,
                questionType: typeof row.question_type === 'string' ? row.question_type : null,
                options: row.options,
                correctAnswer: typeof row.correct_answer === 'string' ? row.correct_answer : null,
                solutionText: typeof row.solution_text === 'string' ? row.solution_text : null,
                toppersApproach: typeof row.toppers_approach === 'string' ? row.toppers_approach : null,
                questionImageUrl: typeof row.question_image_url === 'string' ? row.question_image_url : null,
                contextTitle: context?.contextTitle ?? null,
                contextBody: context?.contextBody ?? null,
                contextImageUrl: context?.contextImageUrl ?? null,
            };
        });

        setDetailsByQuestion(next);
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [bookmarksResult, attemptsMap] = await Promise.all([
            fetchUserBookmarks(),
            fetchLatestReviewAttemptsByPaper(),
        ]);

        setBookmarks(bookmarksResult.bookmarks);
        setFeatureAvailable(bookmarksResult.available);
        if (bookmarksResult.error && bookmarksResult.available) {
            setError(bookmarksResult.error);
        }
        setAttemptByPaper(attemptsMap);
        await loadQuestionDetails(bookmarksResult.bookmarks.map((bookmark) => bookmark.questionId));
        setLoading(false);
    }, [loadQuestionDetails]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    const topicsForCurrentSection = useMemo(() => {
        const list = bookmarks
            .filter((bookmark) => sectionFilter === 'all' || (bookmark.section ?? 'Unknown') === sectionFilter)
            .map((bookmark) => bookmark.topic?.trim() || 'General');
        return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    }, [bookmarks, sectionFilter]);

    useEffect(() => {
        if (topicFilter === 'all') return;
        if (!topicsForCurrentSection.includes(topicFilter)) {
            setTopicFilter('all');
        }
    }, [topicFilter, topicsForCurrentSection]);

    const subtopicsForCurrentTopic = useMemo(() => {
        const list = bookmarks
            .filter((bookmark) => sectionFilter === 'all' || (bookmark.section ?? 'Unknown') === sectionFilter)
            .filter((bookmark) => topicFilter === 'all' || (bookmark.topic?.trim() || 'General') === topicFilter)
            .map((bookmark) => bookmark.subtopic?.trim() || 'General');
        return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    }, [bookmarks, sectionFilter, topicFilter]);

    useEffect(() => {
        if (subtopicFilter === 'all') return;
        if (!subtopicsForCurrentTopic.includes(subtopicFilter)) {
            setSubtopicFilter('all');
        }
    }, [subtopicFilter, subtopicsForCurrentTopic]);

    const filteredBookmarks = useMemo(() => {
        const needle = searchText.trim().toLowerCase();
        return bookmarks.filter((bookmark) => {
            const section = bookmark.section ?? 'Unknown';
            const topic = bookmark.topic?.trim() || 'General';
            const subtopic = bookmark.subtopic?.trim() || 'General';
            const text = (bookmark.questionText ?? '').toLowerCase();
            const paper = (bookmark.paperTitle ?? '').toLowerCase();

            if (sectionFilter !== 'all' && section !== sectionFilter) return false;
            if (topicFilter !== 'all' && topic !== topicFilter) return false;
            if (subtopicFilter !== 'all' && subtopic !== subtopicFilter) return false;
            if (!needle) return true;

            return (
                text.includes(needle) ||
                paper.includes(needle) ||
                topic.toLowerCase().includes(needle) ||
                subtopic.toLowerCase().includes(needle)
            );
        });
    }, [bookmarks, searchText, sectionFilter, topicFilter, subtopicFilter]);

    const grouped = useMemo(() => {
        const bySection: Record<string, Record<string, Record<string, BookmarkItem[]>>> = {};
        filteredBookmarks.forEach((bookmark) => {
            const section = bookmark.section ?? 'Unknown';
            const topic = bookmark.topic?.trim() || 'General';
            const subtopic = bookmark.subtopic?.trim() || 'General';
            if (!bySection[section]) bySection[section] = {};
            if (!bySection[section][topic]) bySection[section][topic] = {};
            if (!bySection[section][topic][subtopic]) bySection[section][topic][subtopic] = [];
            bySection[section][topic][subtopic].push(bookmark);
        });
        return bySection;
    }, [filteredBookmarks]);

    const handleRemoveBookmark = useCallback(async (questionId: string) => {
        const result = await toggleUserBookmark(questionId);
        if (!result.success) {
            setError(result.error ?? 'Failed to remove bookmark');
            return;
        }
        await loadAll();
    }, [loadAll]);

    const toggleQuestionExpanded = useCallback((questionId: string) => {
        setExpandedQuestionIds((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    }, []);

    const getOpenHref = useCallback((bookmark: BookmarkItem) => {
        if (bookmark.paperId && attemptByPaper[bookmark.paperId]) {
            const sectionQuery = bookmark.section ? `&section=${bookmark.section}` : '';
            return `/result/${attemptByPaper[bookmark.paperId]}?qid=${bookmark.questionId}${sectionQuery}`;
        }
        if (bookmark.paperSlug) return `/mock/${bookmark.paperSlug}`;
        if (bookmark.paperId) return `/mock/${bookmark.paperId}`;
        return '/mocks';
    }, [attemptByPaper]);

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-center py-10">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                </div>
            </div>
        );
    }

    if (!featureAvailable) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-600">Bookmarks are not available in this environment yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <select
                        value={sectionFilter}
                        onChange={(event) => setSectionFilter(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">All Sections</option>
                        {SECTION_ORDER.map((section) => (
                            <option key={section} value={section}>
                                {SECTION_LABELS[section]}
                            </option>
                        ))}
                    </select>

                    <select
                        value={topicFilter}
                        onChange={(event) => setTopicFilter(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">All Topics</option>
                        {topicsForCurrentSection.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>

                    <select
                        value={subtopicFilter}
                        onChange={(event) => setSubtopicFilter(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">All Subtopics</option>
                        {subtopicsForCurrentTopic.map((subtopic) => (
                            <option key={subtopic} value={subtopic}>
                                {subtopic}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder="Search question text..."
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {filteredBookmarks.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-700">No bookmarks match these filters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {SECTION_ORDER.filter((section) => Boolean(grouped[section])).map((section) => {
                        const topics = grouped[section];
                        const sectionCount = Object.values(topics).reduce(
                            (sum, subtopicMap) => sum + Object.values(subtopicMap).reduce((s, list) => s + list.length, 0),
                            0
                        );
                        return (
                            <section key={section} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900">{SECTION_LABELS[section]}</h2>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                        {sectionCount}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(topics)
                                        .sort((a, b) => a[0].localeCompare(b[0]))
                                        .map(([topic, subtopicMap]) => (
                                            <div key={`${section}:${topic}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                <h3 className="mb-2 text-sm font-semibold text-slate-800">{topic}</h3>
                                                <div className="space-y-2">
                                                    {Object.entries(subtopicMap)
                                                        .sort((a, b) => a[0].localeCompare(b[0]))
                                                        .map(([subtopic, items]) => (
                                                            <div key={`${section}:${topic}:${subtopic}`} className="rounded-md bg-white p-2.5">
                                                                <p className="mb-2 text-xs font-semibold text-slate-600">{subtopic}</p>
                                                                <ul className="space-y-2">
                                                                    {items.map((bookmark) => {
                                                                        const detail = detailsByQuestion[bookmark.questionId];
                                                                        const isExpanded = expandedQuestionIds.has(bookmark.questionId);
                                                                        const options = normalizeOptions(detail?.options);
                                                                        const normalizedCorrect = (detail?.correctAnswer ?? '').trim().toUpperCase();

                                                                        return (
                                                                            <li key={bookmark.bookmarkId} className="rounded-md border border-slate-200 bg-white">
                                                                                <div className="flex items-start justify-between gap-3 p-2.5">
                                                                                    <div className="min-w-0">
                                                                                        <p className="text-xs text-slate-700 line-clamp-2">
                                                                                            {bookmark.questionText || `Question ${bookmark.questionNumber ?? ''}`}
                                                                                        </p>
                                                                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                                                                            {bookmark.paperTitle || 'Paper'} • Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => toggleQuestionExpanded(bookmark.questionId)}
                                                                                            className="inline-flex min-h-[32px] items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                                                                                        >
                                                                                            {isExpanded ? 'Hide' : 'View full'}
                                                                                        </button>
                                                                                        <Link
                                                                                            href={getOpenHref(bookmark)}
                                                                                            className="inline-flex min-h-[32px] items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                                                                                        >
                                                                                            Open Mirror
                                                                                        </Link>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => void handleRemoveBookmark(bookmark.questionId)}
                                                                                            className="inline-flex min-h-[32px] items-center justify-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                                                                                        >
                                                                                            Remove
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                {isExpanded && (
                                                                                    <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-3">
                                                                                        {(detail?.contextBody || detail?.contextImageUrl) && (
                                                                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Context</p>
                                                                                                {detail?.contextTitle && (
                                                                                                    <p className="mb-2 text-sm font-semibold text-slate-900">{detail.contextTitle}</p>
                                                                                                )}
                                                                                                {detail?.contextBody && (
                                                                                                    <MathText text={detail.contextBody} className="text-sm leading-relaxed text-slate-700" />
                                                                                                )}
                                                                                                {detail?.contextImageUrl && (
                                                                                                    <img
                                                                                                        src={detail.contextImageUrl}
                                                                                                        alt="Question context"
                                                                                                        className="mt-3 max-h-80 w-full rounded-md border border-slate-200 object-contain"
                                                                                                    />
                                                                                                )}
                                                                                            </div>
                                                                                        )}

                                                                                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Question</p>
                                                                                            <MathText
                                                                                                text={detail?.questionText ?? bookmark.questionText ?? 'Question content unavailable'}
                                                                                                className="text-sm leading-relaxed text-slate-800"
                                                                                            />
                                                                                            {detail?.questionImageUrl && (
                                                                                                <img
                                                                                                    src={detail.questionImageUrl}
                                                                                                    alt="Question"
                                                                                                    className="mt-3 max-h-80 w-full rounded-md border border-slate-200 object-contain"
                                                                                                />
                                                                                            )}
                                                                                        </div>

                                                                                        {options.length > 0 && (
                                                                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Options</p>
                                                                                                <ul className="space-y-2">
                                                                                                    {options.map((option) => {
                                                                                                        const isCorrect =
                                                                                                            normalizedCorrect !== '' &&
                                                                                                            (option.key.toUpperCase() === normalizedCorrect || option.text.trim().toUpperCase() === normalizedCorrect);
                                                                                                        return (
                                                                                                            <li
                                                                                                                key={`${bookmark.questionId}:${option.key}`}
                                                                                                                className={`rounded-md border px-3 py-2 text-sm ${isCorrect
                                                                                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                                                                                                    : 'border-slate-200 bg-slate-50 text-slate-700'
                                                                                                                    }`}
                                                                                                            >
                                                                                                                <span className="mr-2 font-semibold">{option.key}.</span>
                                                                                                                <MathText text={option.text} className="inline text-sm" />
                                                                                                            </li>
                                                                                                        );
                                                                                                    })}
                                                                                                </ul>
                                                                                            </div>
                                                                                        )}

                                                                                        {(detail?.solutionText || detail?.toppersApproach) ? (
                                                                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Solutions</p>
                                                                                                {detail?.solutionText && (
                                                                                                    <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-2.5">
                                                                                                        <p className="mb-1 text-xs font-semibold text-blue-700">Textbook Solution</p>
                                                                                                        <MathText text={detail.solutionText} className="text-sm text-slate-800" />
                                                                                                    </div>
                                                                                                )}
                                                                                                {detail?.toppersApproach && (
                                                                                                    <div className="rounded-md border border-purple-200 bg-purple-50 p-2.5">
                                                                                                        <p className="mb-1 text-xs font-semibold text-purple-700">Toppers Approach</p>
                                                                                                        <MathText text={detail.toppersApproach} className="text-sm text-slate-800" />
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                                                                                                Solution is not available for this question yet.
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
