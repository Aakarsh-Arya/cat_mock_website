'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchUserBookmarks, type BookmarkItem } from '@/lib/bookmarks-client';

const SECTION_LABELS: Record<string, string> = {
    VARC: 'VARC',
    DILR: 'LRDI',
    QA: 'Quant',
    Unknown: 'Other',
};

type SubtopicSummary = {
    name: string;
    count: number;
};

type TopicSummary = {
    name: string;
    count: number;
    subtopics: SubtopicSummary[];
};

type SectionSummary = {
    name: string;
    count: number;
    topics: TopicSummary[];
};

export function DashboardBookmarks() {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [featureAvailable, setFeatureAvailable] = useState(true);

    const loadBookmarks = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await fetchUserBookmarks();
        setBookmarks(result.bookmarks);
        setFeatureAvailable(result.available);
        if (result.error && result.available) {
            setError(result.error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadBookmarks();
    }, [loadBookmarks]);

    const sections = useMemo<SectionSummary[]>(() => {
        const sectionMap = new Map<
            string,
            { count: number; topics: Map<string, { count: number; subtopics: Map<string, number> }> }
        >();

        bookmarks.forEach((bookmark) => {
            const section = bookmark.section ?? 'Unknown';
            const topic = (bookmark.topic ?? 'General').trim() || 'General';
            const subtopic = (bookmark.subtopic ?? 'General').trim() || 'General';

            if (!sectionMap.has(section)) {
                sectionMap.set(section, { count: 0, topics: new Map() });
            }
            const sectionEntry = sectionMap.get(section)!;
            sectionEntry.count += 1;

            if (!sectionEntry.topics.has(topic)) {
                sectionEntry.topics.set(topic, { count: 0, subtopics: new Map() });
            }
            const topicEntry = sectionEntry.topics.get(topic)!;
            topicEntry.count += 1;
            topicEntry.subtopics.set(subtopic, (topicEntry.subtopics.get(subtopic) ?? 0) + 1);
        });

        const sectionOrder = ['VARC', 'DILR', 'QA', 'Unknown'];
        return Array.from(sectionMap.entries())
            .sort((a, b) => sectionOrder.indexOf(a[0]) - sectionOrder.indexOf(b[0]))
            .map(([sectionName, sectionEntry]) => {
                const topics: TopicSummary[] = Array.from(sectionEntry.topics.entries())
                    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
                    .map(([topicName, topicEntry]) => ({
                        name: topicName,
                        count: topicEntry.count,
                        subtopics: Array.from(topicEntry.subtopics.entries())
                            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                            .map(([subtopicName, count]) => ({ name: subtopicName, count })),
                    }));

                return {
                    name: sectionName,
                    count: sectionEntry.count,
                    topics,
                };
            });
    }, [bookmarks]);

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">My Bookmarks</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                </div>
            </div>
        );
    }

    if (!featureAvailable) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold text-slate-900">My Bookmarks</h2>
                <p className="text-sm text-slate-600">Bookmarks are not available yet for this environment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">My Bookmarks</h2>
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">My Bookmarks</h2>
                <div className="rounded-lg bg-slate-50 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-slate-700">No bookmarks yet</p>
                    <p className="mt-1 text-xs text-slate-500">Bookmark questions during review to revisit them later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">My Bookmarks</h2>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {bookmarks.length} saved
                    </span>
                    <Link
                        href="/bookmarks"
                        className="inline-flex min-h-[36px] items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        Open Explorer
                    </Link>
                </div>
            </div>

            <div className="space-y-3">
                {sections.map((section) => (
                    <div key={section.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <Link
                                href={{
                                    pathname: '/bookmarks',
                                    query: { section: section.name },
                                }}
                                className="text-sm font-semibold text-slate-900 hover:text-blue-700"
                            >
                                {SECTION_LABELS[section.name] ?? section.name}
                            </Link>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                {section.count}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {section.topics.map((topic) => (
                                <div key={`${section.name}:${topic.name}`} className="rounded-md bg-white p-2.5">
                                    <div className="mb-1.5 flex items-center justify-between gap-2">
                                        <Link
                                            href={{
                                                pathname: '/bookmarks',
                                                query: {
                                                    section: section.name,
                                                    topic: topic.name,
                                                },
                                            }}
                                            className="text-xs font-semibold text-slate-800 hover:text-blue-700"
                                        >
                                            {topic.name}
                                        </Link>
                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                            {topic.count}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {topic.subtopics.map((subtopic) => (
                                            <Link
                                                key={`${section.name}:${topic.name}:${subtopic.name}`}
                                                href={{
                                                    pathname: '/bookmarks',
                                                    query: {
                                                        section: section.name,
                                                        topic: topic.name,
                                                        subtopic: subtopic.name,
                                                    },
                                                }}
                                                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                {subtopic.name} ({subtopic.count})
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
