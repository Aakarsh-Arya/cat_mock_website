'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ATTEMPT_STATE_EVENT = 'nexams:attempt-state-updated';

interface AttemptStateAutoRefreshProps {
    pollIntervalMs?: number;
}

export function AttemptStateAutoRefresh({ pollIntervalMs = 0 }: AttemptStateAutoRefreshProps) {
    const router = useRouter();
    const lastRefreshRef = useRef(0);

    const triggerRefresh = useCallback(() => {
        const now = Date.now();
        // Guard against bursty refresh triggers from focus/pageshow/storage.
        if (now - lastRefreshRef.current < 700) return;
        lastRefreshRef.current = now;
        router.refresh();
    }, [router]);

    useEffect(() => {
        const onCustomEvent = () => triggerRefresh();
        const onPageShow = () => triggerRefresh();
        const onFocus = () => triggerRefresh();
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') triggerRefresh();
        };
        const onStorage = (event: StorageEvent) => {
            if (event.key === ATTEMPT_STATE_EVENT) {
                triggerRefresh();
            }
        };

        window.addEventListener(ATTEMPT_STATE_EVENT, onCustomEvent);
        window.addEventListener('pageshow', onPageShow);
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener(ATTEMPT_STATE_EVENT, onCustomEvent);
            window.removeEventListener('pageshow', onPageShow);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('storage', onStorage);
        };
    }, [triggerRefresh]);

    useEffect(() => {
        if (!pollIntervalMs || pollIntervalMs < 1000) return;

        const interval = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                triggerRefresh();
            }
        }, pollIntervalMs);

        return () => window.clearInterval(interval);
    }, [pollIntervalMs, triggerRefresh]);

    return null;
}

