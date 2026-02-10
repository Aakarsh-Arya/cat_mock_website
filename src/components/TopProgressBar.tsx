'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type ProgressState = {
    active: boolean;
    startedAt: number | null;
};

function isSamePageNavigation(url: URL): boolean {
    return (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash !== window.location.hash
    );
}

function isInternalNavigation(url: URL): boolean {
    return url.origin === window.location.origin;
}

export default function TopProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const progressRef = useRef(0);
    const animationRef = useRef<number | null>(null);
    const stateRef = useRef<ProgressState>({ active: false, startedAt: null });
    const pendingStartRef = useRef(false);
    const mountedRef = useRef(true);

    const stopAnimation = () => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    const tick = () => {
        if (!stateRef.current.active) return;

        let next = progressRef.current;
        const speed = next < 0.3 ? 0.025 : next < 0.8 ? 0.006 : next < 0.95 ? 0.003 : 0;
        next = Math.min(next + speed, 0.95);

        progressRef.current = next;
        setProgress(next);

        animationRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
        if (stateRef.current.active) return;

        stateRef.current = { active: true, startedAt: Date.now() };
        setVisible(true);

        if (reduceMotion) {
            progressRef.current = 0.9;
            setProgress(0.9);
            return;
        }

        progressRef.current = 0;
        setProgress(0);
        stopAnimation();
        animationRef.current = requestAnimationFrame(tick);
    };

    const scheduleStart = () => {
        if (stateRef.current.active || pendingStartRef.current) return;
        pendingStartRef.current = true;

        const run = () => {
            pendingStartRef.current = false;
            if (!mountedRef.current) return;
            start();
        };

        if (typeof queueMicrotask === 'function') {
            queueMicrotask(run);
        } else {
            window.setTimeout(run, 0);
        }
    };

    const complete = () => {
        if (!stateRef.current.active) return;

        stateRef.current.active = false;
        stopAnimation();

        progressRef.current = 1;
        setProgress(1);

        const minVisibleMs = 150;
        const elapsed = stateRef.current.startedAt ? Date.now() - stateRef.current.startedAt : 0;
        const remaining = Math.max(minVisibleMs - elapsed, 0);

        window.setTimeout(() => {
            setVisible(false);
            window.setTimeout(() => {
                progressRef.current = 0;
                setProgress(0);
                stateRef.current.startedAt = null;
            }, 200);
        }, remaining);
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduceMotion(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (event.defaultPrevented) return;
            if (event.button !== 0) return;
            if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;

            const target = event.target as HTMLElement | null;
            const anchor = target?.closest('a');
            if (!anchor) return;

            if (anchor.hasAttribute('download')) return;
            if (anchor.getAttribute('target') && anchor.getAttribute('target') !== '_self') return;
            if (anchor.dataset.noProgress === 'true') return;

            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#')) return;

            try {
                const url = new URL(href, window.location.href);
                if (!isInternalNavigation(url)) return;
                if (isSamePageNavigation(url)) return;
            } catch {
                return;
            }

            scheduleStart();
        };

        const handlePopState = () => {
            scheduleStart();
        };

        const patchHistory = () => {
            const originalPushState = history.pushState.bind(history);
            const originalReplaceState = history.replaceState.bind(history);

            const notify = (url?: string | URL | null) => {
                if (!url) return;
                try {
                    const nextUrl = new URL(String(url), window.location.href);
                    if (isSamePageNavigation(nextUrl)) return;
                    scheduleStart();
                } catch {
                    return;
                }
            };

            history.pushState = ((data, unused, url) => {
                notify(url ?? null);
                return originalPushState(data, unused, url);
            }) as typeof history.pushState;

            history.replaceState = ((data, unused, url) => {
                notify(url ?? null);
                return originalReplaceState(data, unused, url);
            }) as typeof history.replaceState;

            return () => {
                history.pushState = originalPushState;
                history.replaceState = originalReplaceState;
            };
        };

        document.addEventListener('click', handleClick, true);
        window.addEventListener('popstate', handlePopState);
        const restoreHistory = patchHistory();

        return () => {
            document.removeEventListener('click', handleClick, true);
            window.removeEventListener('popstate', handlePopState);
            restoreHistory();
        };
    }, [reduceMotion]);

    useEffect(() => {
        complete();
    }, [pathname, searchParams?.toString()]);

    return (
        <div
            className="top-progress-bar"
            style={{
                transform: `scaleX(${progress})`,
                opacity: visible ? 1 : 0,
            }}
            aria-hidden="true"
        />
    );
}
