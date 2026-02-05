'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import { sb } from '@/lib/supabase/client';
import { useLandingAssets } from '@/lib/useLandingAssets';
import type { LandingAsset } from '@/lib/landing-assets';
import { useFocusTrap } from '@/components/useFocusTrap';

const headingFont = Space_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

const NAV_LINKS = [
    { id: 'mentor', label: 'Mentor' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'features', label: 'Features' },
    { id: 'cat-hub', label: 'CAT Hub' },
];

const FEATURE_TABS = [
    {
        id: 'mock',
        label: 'Mock Mode',
        description: 'Locked section flow with exam-grade timers and calm focus prompts.',
        accent: 'bg-emerald-500/10 text-emerald-700',
    },
    {
        id: 'review',
        label: 'Mirror View',
        description: 'Replay your attempt to see when you moved, paused, and changed answers.',
        accent: 'bg-orange-500/10 text-orange-700',
    },
    {
        id: 'analytics',
        label: 'Analytics',
        description: 'Spot speed traps with time-per-question and accuracy overlays.',
        accent: 'bg-sky-500/10 text-sky-700',
    },
];

const ROADMAP_ITEMS = [
    {
        step: 'Q1',
        title: 'Launch early access for CAT 2025',
        copy: 'Invite-only access with curated mocks and guided onboarding.',
    },
    {
        step: 'Q2',
        title: 'Add adaptive difficulty signals',
        copy: 'Question difficulty tagging and smart review queues.',
    },
    {
        step: 'Q3',
        title: 'Mentor-led sprint cohorts',
        copy: 'Weekly mentor reviews, cohort leaderboards, and feedback loops.',
    },
];

const HUB_SECTIONS = [
    {
        id: 'hub-myths',
        label: 'Myths',
        items: [
            { title: 'Myth: Speed beats accuracy', body: 'CAT rewards balance. Fix accuracy first, then lift speed.' },
            { title: 'Myth: One mock per day', body: 'Quality review beats quantity. Aim for 2-3 per week.' },
        ],
    },
    {
        id: 'hub-cheat-sheet',
        label: 'Cheat Sheet',
        items: [
            { title: 'VARC rhythm', body: 'RC focus blocks + 2-3 VA sets; keep passage notes light.' },
            { title: 'DILR checkpoints', body: 'Select 2 sets fast, solve 1 fully, then attempt a second.' },
            { title: 'QA anchors', body: 'Start with sure-shot questions to build momentum.' },
        ],
    },
    {
        id: 'hub-roadmap',
        label: 'Roadmap',
        items: [
            { title: 'Weeks 1-4', body: 'Build basics and solve section-wise sets.' },
            { title: 'Weeks 5-8', body: 'Add full mocks + review notes each attempt.' },
            { title: 'Weeks 9-12', body: 'Tighten timing and revisit weak topics.' },
        ],
    },
];

const FEATURE_ROWS = [
    {
        title: 'Exam-first mock engine',
        body: 'Section locks, timers, and answer palettes mirror the real test day flow.',
        key: 'feature_exam_ui',
        chip: 'Mock UI',
    },
    {
        title: 'Precision analytics',
        body: 'Time spent, accuracy, and revisit patterns in one single view.',
        key: 'feature_analytics',
        chip: 'Analytics',
    },
    {
        title: 'Rapid topic reinforcement',
        body: 'Jump into targeted sets based on where you lost time or accuracy.',
        key: 'rag_demo_1',
        chip: 'Sprint Mode',
    },
];

// TODO(landing): move mentor quote into landing assets/config once admin copy editor lands.
const MENTOR_QUOTE = 'Accuracy compounds. Build your base, then push speed.';
const MENTOR_BUBBLE_KEY = 'landing_mentor_bubble_shown';

function useCanHover(): boolean {
    const [canHover, setCanHover] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const media = window.matchMedia('(hover: hover) and (pointer: fine)');
        const update = () => setCanHover(media.matches);
        update();

        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', update);
            return () => media.removeEventListener('change', update);
        }

        if (typeof media.addListener === 'function') {
            media.addListener(update);
            return () => media.removeListener(update);
        }

        return undefined;
    }, []);

    return canHover;
}

type AssetImageProps = {
    assetKey: string;
    assets: Record<string, LandingAsset>;
    isLoading: boolean;
    fallbackLabel: string;
    containerClassName?: string;
    imageClassName?: string;
};

function AssetImage({
    assetKey,
    assets,
    isLoading,
    fallbackLabel,
    containerClassName,
    imageClassName,
}: AssetImageProps) {
    const [failed, setFailed] = useState(false);
    const warnedRef = useRef(false);
    const asset = assets[assetKey];
    const source = asset?.public_url ?? '';

    useEffect(() => {
        if (!isLoading && !source && !warnedRef.current) {
            console.warn(`[landing-assets] missing asset for ${assetKey}`);
            warnedRef.current = true;
        }
    }, [assetKey, isLoading, source]);

    if (isLoading) {
        return (
            <div
                className={`animate-pulse rounded-3xl bg-slate-200/70 ${containerClassName ?? ''}`}
                aria-hidden="true"
            />
        );
    }

    if (!source || failed) {
        return (
            <div
                className={`relative flex items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 ${containerClassName ?? ''
                    }`}
                role="img"
                aria-label={`${fallbackLabel} placeholder`}
            >
                <div className="px-6 text-center text-sm font-semibold text-slate-500">
                    {fallbackLabel}
                </div>
            </div>
        );
    }

    return (
        <img
            src={source}
            alt={asset?.alt_text ?? fallbackLabel}
            className={imageClassName ?? containerClassName}
            onError={() => setFailed(true)}
        />
    );
}

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    onAuth: () => void;
};

function MobileDrawer({ open, onClose, onAuth }: DrawerProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    useFocusTrap(open, panelRef, onClose);

    return (
        <div
            className={`fixed inset-0 z-40 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
            aria-hidden={!open}
        >
            <div
                className={`absolute inset-0 bg-slate-900/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                ref={panelRef}
                className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col gap-6 bg-white px-6 py-8 shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                tabIndex={-1}
            >
                <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-600">Menu</div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>
                <nav className="flex flex-col gap-4 text-base font-semibold text-slate-700">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.id}
                            href={`#${link.id}`}
                            className="rounded-xl px-3 py-2 transition hover:bg-slate-100"
                            onClick={onClose}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        onAuth();
                    }}
                    className="mt-auto inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                >
                    Claim Early Access
                </button>
            </div>
        </div>
    );
}

type AuthModalProps = {
    open: boolean;
    onClose: () => void;
    onSignIn: () => void;
    loading: boolean;
};

function AuthModal({ open, onClose, onSignIn, loading }: AuthModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    useFocusTrap(open, panelRef, onClose);

    return (
        <div
            className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
            aria-hidden={!open}
        >
            <div
                className={`absolute inset-0 bg-slate-900/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Sign in"
                tabIndex={-1}
                className={`absolute left-1/2 top-1/2 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Claim Early Access</p>
                        <h3 className={`${headingFont.className} mt-2 text-xl font-semibold text-slate-900`}>
                            Claim Early Access
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            First 100 users get ₹999 worth of mentor-grade mock review notes.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>
                <button
                    type="button"
                    onClick={onSignIn}
                    disabled={loading}
                    className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                    )}
                    {loading ? 'Redirecting...' : 'Continue with Google'}
                </button>
                <p className="mt-4 text-xs text-slate-400">
                    Google-only sign-in. No password required.
                </p>
            </div>
        </div>
    );
}

export default function LandingPageClient() {
    const { assets, isLoading } = useLandingAssets();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(FEATURE_TABS[0].id);
    const [authLoading, setAuthLoading] = useState(false);
    const [mentorBubbleVisible, setMentorBubbleVisible] = useState(false);
    const [mentorBubbleEligible, setMentorBubbleEligible] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const canHover = useCanHover();
    const heroRef = useRef<HTMLElement | null>(null);
    const hubSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const activeFeature = useMemo(
        () => FEATURE_TABS.find((tab) => tab.id === activeTab) ?? FEATURE_TABS[0],
        [activeTab]
    );

    useEffect(() => {
        if (isMenuOpen || isAuthOpen) {
            document.body.style.overflow = 'hidden';
            return;
        }
        document.body.style.overflow = '';
    }, [isMenuOpen, isAuthOpen]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleScroll = () => {
            const threshold = heroRef.current?.offsetHeight ?? 320;
            setShowBackToTop(window.scrollY > threshold);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const alreadyShown = window.localStorage.getItem(MENTOR_BUBBLE_KEY) === 'true';
        setMentorBubbleEligible(!alreadyShown);
        if (!canHover || alreadyShown) return;
        const timer = window.setTimeout(() => {
            setMentorBubbleVisible(true);
            setMentorBubbleEligible(false);
            window.localStorage.setItem(MENTOR_BUBBLE_KEY, 'true');
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [canHover]);

    const revealMentorBubble = useCallback(() => {
        setMentorBubbleVisible(true);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(MENTOR_BUBBLE_KEY, 'true');
        }
        setMentorBubbleEligible(false);
    }, []);

    const scrollToHubSection = useCallback((id: string) => {
        const target = hubSectionRefs.current[id];
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const scrollToTop = useCallback(() => {
        if (typeof window === 'undefined') return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSignIn = useCallback(async () => {
        setAuthLoading(true);
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('first_login_banner_eligible', 'true');
            }
            const origin = typeof window !== 'undefined'
                ? window.location.origin
                : process.env.NEXT_PUBLIC_SITE_URL || '';
            const callbackUrl = `${origin}/auth/callback?redirect_to=${encodeURIComponent('/dashboard')}`;
            await sb().auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: callbackUrl },
            });
        } finally {
            setAuthLoading(false);
        }
    }, []);

    return (
        <div className={`${bodyFont.className} min-h-screen bg-slate-50 text-slate-900`}>
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
                <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 left-16 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />

                <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                                CAT
                            </div>
                            <div>
                                <div className={`${headingFont.className} text-sm font-semibold text-slate-900`}>
                                    CAT Mock Arena
                                </div>
                                <div className="text-xs text-slate-500">Prep like its exam day</div>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    className="transition hover:text-slate-900"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAuthOpen(true)}
                                className="group relative inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] sm:px-5 sm:text-sm"
                            >
                                <span className="absolute inset-0 -z-10 rounded-full bg-emerald-300/30 opacity-0 blur-xl transition group-hover:opacity-100 motion-safe:group-hover:animate-[landing-glow_2.8s_ease-in-out_infinite]" />
                                Claim Early Access
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 lg:hidden"
                                aria-label="Open menu"
                            >
                                <span>Menu</span>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                <main>
                    <section
                        id="hero"
                        ref={heroRef}
                        className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:pt-24"
                    >
                        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Early access open for CAT 2025
                                </div>
                                <h1
                                    className={`${headingFont.className} text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl motion-safe:animate-[landing-fade-up_0.7s_ease-out]`}
                                >
                                    The Gen Z pro prep stack for CAT mocks.
                                </h1>
                                <p
                                    className="text-lg text-slate-600 motion-safe:animate-[landing-fade-up_0.7s_ease-out]"
                                    style={{ animationDelay: '80ms' }}
                                >
                                    Timed mocks, mirror view analytics, and mentor-led insights in one calm workspace.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAuthOpen(true)}
                                        className="group relative inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                                    >
                                        <span className="absolute inset-0 -z-10 rounded-full bg-emerald-300/30 opacity-0 blur-xl transition group-hover:opacity-100 motion-safe:group-hover:animate-[landing-glow_2.8s_ease-in-out_infinite]" />
                                        Claim Early Access
                                    </button>
                                    <a
                                        href="#roadmap"
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                                    >
                                        View roadmap
                                    </a>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span>Section-locked flow</span>
                                    <span>Adaptive review cues</span>
                                    <span>Focused analytics</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Value nudge: early access invites go out weekly. No spam, only prep.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-4 rounded-[32px] border border-emerald-100 bg-white/40" />
                                <AssetImage
                                    assetKey="hero_mock_ui"
                                    assets={assets}
                                    isLoading={isLoading}
                                    fallbackLabel="Hero mock preview"
                                    containerClassName="relative z-10 h-[320px] w-full rounded-[28px] border border-slate-200 bg-white shadow-lg"
                                    imageClassName="relative z-10 h-[320px] w-full rounded-[28px] border border-slate-200 object-cover shadow-lg"
                                />
                                <div className="absolute -bottom-6 left-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-lg">
                                    Calm UI, high-stakes insights
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="mentor" className="border-y border-slate-200 bg-white">
                        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="space-y-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Mentor spotlight</p>
                                <h2 className={`${headingFont.className} text-3xl font-semibold text-slate-900`}>
                                    Learn directly from Saurabh Khandelwal
                                </h2>
                                <p className="text-slate-600">
                                    Weekly mentor notes, exam strategies, and calm performance resets for peak accuracy.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        { label: 'CAT 99+ percentile coaching', value: 'Mentor-led cohorts' },
                                        { label: 'Live sprint reviews', value: 'Actionable feedback' },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="group relative">
                                <AssetImage
                                    assetKey="mentor_photo"
                                    assets={assets}
                                    isLoading={isLoading}
                                    fallbackLabel="Mentor spotlight"
                                    containerClassName="h-[360px] w-full rounded-[32px] border border-slate-200 bg-slate-50"
                                    imageClassName="h-[360px] w-full rounded-[32px] border border-slate-200 object-cover grayscale transition duration-500 group-hover:grayscale-0"
                                />
                                <div
                                    className={`absolute left-6 top-6 max-w-xs rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg transition-all duration-300 ${mentorBubbleVisible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
                                        }`}
                                    aria-hidden={!mentorBubbleVisible}
                                >
                                    "{MENTOR_QUOTE}"
                                    <span className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 rounded-sm bg-white shadow" />
                                </div>
                                {!canHover && !mentorBubbleVisible && mentorBubbleEligible && (
                                    <button
                                        type="button"
                                        onClick={revealMentorBubble}
                                        className="absolute bottom-6 left-6 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow transition hover:bg-slate-50"
                                    >
                                        Tap for insight
                                    </button>
                                )}
                                <div className="absolute bottom-6 right-6 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow">
                                    Mentor spotlight
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="roadmap" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Roadmap</p>
                                <h2 className={`${headingFont.className} text-3xl font-semibold text-slate-900`}>
                                    Built for a year of focused CAT prep
                                </h2>
                                <p className="text-slate-600">
                                    Each drop adds new signal and depth without disrupting your flow.
                                </p>
                            </div>
                            <ol className="relative space-y-8 border-l border-slate-200 pl-6">
                                {ROADMAP_ITEMS.map((item) => (
                                    <li key={item.step} className="relative">
                                        <span className="absolute -left-[30px] top-1 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
                                            {item.step}
                                        </span>
                                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                                        <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <section id="features" className="border-y border-slate-200 bg-white">
                        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Feature showcase</p>
                                    <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-slate-900`}>
                                        Your mock workflow, in one clean dashboard
                                    </h2>
                                    <p className="mt-3 text-slate-600">
                                        Switch between mock attempts, review, and analytics without losing context.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {FEATURE_TABS.map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${activeTab === tab.id
                                                    ? 'border-slate-900 bg-slate-900 text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${activeFeature.accent}`}>
                                            {activeFeature.label}
                                        </div>
                                        <p className="mt-3 text-sm text-slate-600">{activeFeature.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                        {['VARC', 'DILR', 'QA'].map((label, index) => (
                                            <span
                                                key={label}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${index === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-12">
                                {FEATURE_ROWS.map((feature, index) => (
                                    <div
                                        key={feature.title}
                                        className={`flex flex-col gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                            }`}
                                    >
                                        <div className="flex-1 space-y-4">
                                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                                {feature.chip}
                                            </div>
                                            <h3 className={`${headingFont.className} text-2xl font-semibold text-slate-900`}>
                                                {feature.title}
                                            </h3>
                                            <p className="text-slate-600">{feature.body}</p>
                                        </div>
                                        <div className="flex-1">
                                            <AssetImage
                                                assetKey={feature.key}
                                                assets={assets}
                                                isLoading={isLoading}
                                                fallbackLabel={feature.title}
                                                containerClassName="h-[260px] w-full rounded-3xl border border-slate-200 bg-white"
                                                imageClassName="h-[260px] w-full rounded-3xl border border-slate-200 object-cover"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="cat-hub" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">CAT info hub</p>
                                <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-slate-900`}>
                                    MBA exam notes, CAT focus
                                </h2>
                                <p className="mt-3 text-slate-600">
                                    Quick reads that keep the CAT essentials close without feeling like a textbook.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {HUB_SECTIONS.map((section) => (
                                        <button
                                            key={section.id}
                                            type="button"
                                            onClick={() => scrollToHubSection(section.id)}
                                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                                        >
                                            {section.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                {HUB_SECTIONS.map((section) => (
                                    <div
                                        key={section.id}
                                        id={section.id}
                                        ref={(node) => {
                                            hubSectionRefs.current[section.id] = node;
                                        }}
                                        className="scroll-mt-24 space-y-3"
                                    >
                                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            {section.label}
                                        </div>
                                        {section.items.map((item) => (
                                            <details
                                                key={item.title}
                                                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                                            >
                                                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                                                    {item.title}
                                                    <span className="text-slate-400 transition group-open:rotate-45">+</span>
                                                </summary>
                                                <p className="mt-3 text-sm text-slate-600">{item.body}</p>
                                            </details>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <div className={`${headingFont.className} text-lg font-semibold text-slate-900`}>
                                CAT Mock Arena
                            </div>
                            <p className="mt-3 max-w-md text-sm text-slate-600">
                                A clean, focused CAT mock experience with real exam constraints and mentor-grade insights.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsAuthOpen(true)}
                                className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                            >
                                Claim Early Access
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 text-sm text-slate-600">
                            <a className="hover:text-slate-900" href="#features">Features</a>
                            <a className="hover:text-slate-900" href="#mentor">Mentor</a>
                            <a className="hover:text-slate-900" href="#roadmap">Roadmap</a>
                            <button
                                type="button"
                                onClick={() => setIsAuthOpen(true)}
                                className="text-left hover:text-slate-900"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </footer>
            </div>

            {showBackToTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
                    </svg>
                    Back to top
                </button>
            )}

            <MobileDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} onAuth={() => setIsAuthOpen(true)} />
            <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSignIn={handleSignIn} loading={authLoading} />
        </div>
    );
}
