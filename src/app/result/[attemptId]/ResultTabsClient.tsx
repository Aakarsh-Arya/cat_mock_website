/**
 * @fileoverview Result tabs for review vs analytics
 * @description Client-only tab switcher that preserves scroll positions
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type TabId = 'review' | 'analytics' | 'nexai';

interface ResultTabsClientProps {
    analytics: ReactNode;
    review?: ReactNode;
    nexai?: ReactNode;
    hasReview?: boolean;
    hasNexAI?: boolean;
}

const TAB_CONFIG: Record<TabId, { label: string; hash: string }> = {
    review: { label: 'Mirror View / Solutions', hash: '#exam-review' },
    analytics: { label: 'Analytics View', hash: '#analytics-view' },
    nexai: { label: 'NexAI Insights', hash: '#nexai-insights-view' },
};

export function ResultTabsClient({
    analytics,
    review,
    nexai,
    hasReview: hasReviewProp,
    hasNexAI: hasNexAIProp,
}: ResultTabsClientProps) {
    const hasReview = hasReviewProp ?? Boolean(review);
    const hasNexAI = hasNexAIProp ?? Boolean(nexai);
    const initialTab: TabId = hasReview ? 'review' : 'analytics';
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [isMounted, setIsMounted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const scrollPositions = useRef<Record<TabId, number>>({ review: 0, analytics: 0, nexai: 0 });

    const orderedTabs = useMemo<TabId[]>(() => {
        const tabs: TabId[] = [];
        if (hasReview) tabs.push('review');
        tabs.push('analytics');
        if (hasNexAI) tabs.push('nexai');
        return tabs;
    }, [hasNexAI, hasReview]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const syncFromHash = useCallback(() => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash;
        if (hash === TAB_CONFIG.nexai.hash && hasNexAI) {
            setActiveTab('nexai');
            return;
        }
        if (hash === TAB_CONFIG.analytics.hash) {
            setActiveTab('analytics');
            return;
        }
        if (hash === TAB_CONFIG.review.hash && hasReview) {
            setActiveTab('review');
        }
    }, [hasNexAI, hasReview]);

    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;

        const storageKey = `result-active-tab:${window.location.pathname}`;
        const hash = window.location.hash;

        if (hash === TAB_CONFIG.nexai.hash && hasNexAI) {
            setActiveTab('nexai');
        } else if (hash === TAB_CONFIG.analytics.hash) {
            setActiveTab('analytics');
        } else if (hash === TAB_CONFIG.review.hash && hasReview) {
            setActiveTab('review');
        } else {
            const stored = window.sessionStorage.getItem(storageKey) as TabId | null;
            if (stored && (stored !== 'review' || hasReview) && (stored !== 'nexai' || hasNexAI)) {
                setActiveTab(stored);
            } else {
                setActiveTab(initialTab);
            }
        }

        setIsReady(true);

        window.addEventListener('hashchange', syncFromHash);
        return () => window.removeEventListener('hashchange', syncFromHash);
    }, [hasNexAI, hasReview, initialTab, isMounted, syncFromHash]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!isReady) return;
        const storageKey = `result-active-tab:${window.location.pathname}`;
        window.sessionStorage.setItem(storageKey, activeTab);
        const targetHash = TAB_CONFIG[activeTab].hash;
        if (window.location.hash !== targetHash) {
            window.history.replaceState(null, '', targetHash);
        }
        requestAnimationFrame(() => {
            const stored = scrollPositions.current[activeTab] ?? 0;
            window.scrollTo({ top: stored });
        });
    }, [activeTab, isReady]);

    const handleTabChange = (tab: TabId) => {
        if (tab === activeTab) return;
        if (typeof window !== 'undefined') {
            scrollPositions.current[activeTab] = window.scrollY;
        }
        setActiveTab(tab);
    };

    if (!isMounted) {
        return (
            <div className="space-y-6">
                <div className="h-12 rounded-xl border border-slate-200 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" aria-hidden />
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
                    Loading result views...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mobile-table-scroll rounded-xl border border-slate-200 bg-white p-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
                <div className="flex min-w-max items-center gap-2">
                {orderedTabs.map((tab) => {
                    const isActive = tab === activeTab;
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => handleTabChange(tab)}
                            className={`touch-target whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive
                                ? 'bg-[#2563EB] text-white shadow-inner'
                                : 'text-slate-500 hover:text-[#2563EB]'
                                }`}
                        >
                            {TAB_CONFIG[tab].label}
                        </button>
                    );
                })}
                </div>
            </div>

            <section
                id="exam-review"
                aria-hidden={activeTab !== 'review'}
                className={activeTab === 'review' ? 'block' : 'hidden'}
            >
                {activeTab === 'review' ? (
                    review ?? (
                        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
                            Review mode is not available for this attempt.
                        </div>
                    )
                ) : null}
            </section>

            <section
                id="analytics-view"
                aria-hidden={activeTab !== 'analytics'}
                className={activeTab === 'analytics' ? 'block' : 'hidden'}
            >
                {analytics}
            </section>

            <section
                id="nexai-insights-view"
                aria-hidden={activeTab !== 'nexai'}
                className={activeTab === 'nexai' ? 'block' : 'hidden'}
            >
                {nexai ?? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
                        NexAI insights are not available for this attempt yet.
                    </div>
                )}
            </section>
        </div>
    );
}
