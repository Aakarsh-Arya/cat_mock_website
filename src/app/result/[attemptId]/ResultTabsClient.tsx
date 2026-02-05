/**
 * @fileoverview Result tabs for review vs analytics
 * @description Client-only tab switcher that preserves scroll positions
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type TabId = 'review' | 'analytics';

interface ResultTabsClientProps {
    analytics: ReactNode;
    review?: ReactNode;
}

const TAB_CONFIG: Record<TabId, { label: string; hash: string }> = {
    review: { label: 'Mirror View / Solutions', hash: '#exam-review' },
    analytics: { label: 'Analytics View', hash: '#analytics-view' },
};

export function ResultTabsClient({ analytics, review }: ResultTabsClientProps) {
    const hasReview = Boolean(review);
    const initialTab: TabId = hasReview ? 'review' : 'analytics';
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const scrollPositions = useRef<Record<TabId, number>>({ review: 0, analytics: 0 });

    const orderedTabs = useMemo<TabId[]>(() => (hasReview ? ['review', 'analytics'] : ['analytics']), [hasReview]);

    const syncFromHash = useCallback(() => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash;
        if (hash === TAB_CONFIG.analytics.hash) {
            setActiveTab('analytics');
            return;
        }
        if (hash === TAB_CONFIG.review.hash && hasReview) {
            setActiveTab('review');
        }
    }, [hasReview]);

    useEffect(() => {
        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);
        return () => window.removeEventListener('hashchange', syncFromHash);
    }, [syncFromHash]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const targetHash = TAB_CONFIG[activeTab].hash;
        if (window.location.hash !== targetHash) {
            window.history.replaceState(null, '', targetHash);
        }
        requestAnimationFrame(() => {
            const stored = scrollPositions.current[activeTab] ?? 0;
            window.scrollTo({ top: stored });
        });
    }, [activeTab]);

    const handleTabChange = (tab: TabId) => {
        if (tab === activeTab) return;
        if (typeof window !== 'undefined') {
            scrollPositions.current[activeTab] = window.scrollY;
        }
        setActiveTab(tab);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 rounded-full bg-white p-2 shadow-sm border">
                {orderedTabs.map((tab) => {
                    const isActive = tab === activeTab;
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${isActive
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {TAB_CONFIG[tab].label}
                        </button>
                    );
                })}
            </div>

            <section
                id="exam-review"
                aria-hidden={activeTab !== 'review'}
                className={activeTab === 'review' ? 'block' : 'hidden'}
            >
                {review ?? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
                        Review mode is not available for this attempt.
                    </div>
                )}
            </section>

            <section
                id="analytics-view"
                aria-hidden={activeTab !== 'analytics'}
                className={activeTab === 'analytics' ? 'block' : 'hidden'}
            >
                {analytics}
            </section>
        </div>
    );
}
