'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { sb } from '@/lib/supabase/client';
import BugReportFab from '@/components/BugReportFab';

const ELIGIBLE_KEY = 'first_login_banner_eligible';
const DISMISSED_KEY = 'early_access_banner_dismissed';
const SESSION_COUNT_KEY = 'early_access_session_count';
const SESSION_SEEN_KEY = 'early_access_session_seen';

export default function AuthenticatedOverlays() {
    const pathname = usePathname();
    const [userId, setUserId] = useState<string | null>(null);
    const [bannerVisible, setBannerVisible] = useState(false);
    const [bugOpen, setBugOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        sb()
            .auth.getUser()
            .then(({ data }) => {
                if (!isMounted) return;
                setUserId(data.user?.id ?? null);
            })
            .catch((error) => {
                if (!isMounted) return;
                console.warn('Failed to fetch user for overlays', error);
                setUserId(null);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!userId || typeof window === 'undefined') return;
        const eligible = window.localStorage.getItem(ELIGIBLE_KEY) === 'true';
        const dismissed = window.localStorage.getItem(DISMISSED_KEY) === 'true';

        if (!eligible || dismissed) {
            setBannerVisible(false);
            return;
        }

        const alreadyCounted = window.sessionStorage.getItem(SESSION_SEEN_KEY) === 'true';
        let sessionCount = Number(window.localStorage.getItem(SESSION_COUNT_KEY) || '0');

        if (!alreadyCounted) {
            sessionCount += 1;
            window.localStorage.setItem(SESSION_COUNT_KEY, sessionCount.toString());
            window.sessionStorage.setItem(SESSION_SEEN_KEY, 'true');
        }

        if (sessionCount <= 3) {
            setBannerVisible(true);
        } else {
            setBannerVisible(false);
            window.localStorage.setItem(ELIGIBLE_KEY, 'false');
        }
    }, [pathname, userId]);

    const dismissBanner = useCallback(() => {
        setBannerVisible(false);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(DISMISSED_KEY, 'true');
            window.localStorage.setItem(ELIGIBLE_KEY, 'false');
        }
    }, []);

    if (!userId) {
        return null;
    }

    return (
        <>
            {bannerVisible && (
                <div className="fixed left-1/2 top-4 z-40 w-[min(92vw,720px)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-slate-700">
                            <span className="font-semibold text-emerald-700">Early Access</span>{' '}
                            Thanks for joining early access. Your feedback shapes every drop.
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setBugOpen(true)}
                                className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-slate-50"
                            >
                                Report an issue
                            </button>
                            <button
                                type="button"
                                onClick={dismissBanner}
                                className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 transition hover:bg-slate-50"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BugReportFab
                userId={userId}
                route={pathname}
                open={bugOpen}
                onOpen={() => setBugOpen(true)}
                onClose={() => setBugOpen(false)}
            />
        </>
    );
}
