'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import { sb } from '@/lib/supabase/client';
import { useLandingAssets } from '@/lib/useLandingAssets';
import type { LandingAsset } from '@/lib/landing-assets';
import { useFocusTrap } from '@/components/useFocusTrap';
import { AIInsightsAdCard } from '@/components/AIInsightsAdCard';

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
    { id: 'ai-insights-marketing', label: 'NexAI Insights' },
    { id: 'mentor', label: 'Mentor' },
    { id: 'features', label: 'Features' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'cat-hub', label: 'CAT Hub' },
];

const HERO_SLIDES = [
    {
        id: 'mock',
        label: 'Mock',
        title: 'Exam-like UI that trains composure.',
        subtitle: 'Section locks + timer + answer palette.',
        assetKey: 'hero_mock_ui',
        fallbackLabel: 'Mock UI preview',
        maskTop: true,
    },
    {
        id: 'mirror',
        label: 'Mirror',
        title: 'Mirror View: see time + accuracy patterns instantly.',
        subtitle: 'Attempts, revisits, speed traps, topic-wise breakdown.',
        assetKey: 'hero_mirror_view',
        fallbackLabel: 'Mirror analytics preview',
    },
    {
        id: 'coach',
        label: 'AI Coach',
        title: 'AI Coach: not just what you did - why you did it.',
        subtitle: 'Strategy flaws, strength zones, and next-step fixes.',
        insights: [
            'Your speed attempt caused 19% accuracy.',
            'Revisits = your edge (accuracy jumps when you revisit).',
            'DILR guessing is killing score - solve 1 set fully.',
        ],
    },
];

const HERO_CHIPS = [
    '4 official CAT papers live',
    'Section-locked 40-40-40 flow',
    'AI Coach (beta) + Mirror View',
];

const LIVE_STRIP_ITEMS = [
    {
        label: 'Live now',
        copy: '4 official CAT previous-year papers (full mocks)',
    },
    {
        label: 'Coming in March',
        copy: 'All official CAT papers from 2020 onwards - all slots (18 papers)',
    },
    {
        label: 'Coming in April',
        copy: 'NexCAT mock series launch',
    },
];

const FEATURE_CARDS = [
    {
        id: 'ai-coach',
        title: 'AI Coach (beta)',
        description: 'Hyper-personal strategy insights from your attempt behavior.',
        bullets: ['attempt order', 'time sinks', 'guessing patterns'],
        tag: 'Coming soon',
    },
    {
        id: 'nextcat',
        title: 'NexCAT (launch April)',
        description: 'Curated mock series built for CAT 2026 targets.',
        bullets: ['difficulty calibration', 'trap patterns', 'mentor-led review notes'],
        tag: 'Coming soon',
    },
    {
        id: 'mirror-view',
        title: 'Mirror View Analytics',
        description: 'Replay your attempt like a coach: speed, revisits, and topic breakdown.',
        bullets: ['time/question', 'revisit count', 'topic/subtopic', 'difficulty tags'],
    },
    {
        id: 'exam-ui',
        title: 'Exam-like Interface',
        description: 'Train the exact CAT flow: 40-40-40 with section locks.',
        bullets: ['answer palette', 'on-screen calculator', 'TITA practice'],
    },
];

const ROADMAP_ITEMS = [
    {
        period: 'Now (Beta)',
        copy: '4 PYQ mocks + mirror metrics',
    },
    {
        period: 'March',
        copy: '2020-2025 papers (all slots) + better review UX',
    },
    {
        period: 'April',
        copy: 'NexCAT series launch + AI Coach rollout for beta users',
    },
];

const CAT_HUB_ITEMS = [
    {
        title: '1. The "Syllabus Completion" Trap',
        body: 'Dropdown Content: Treating CAT as a knowledge test is fatal. Theory is 20%; application is 80%. CAT does not test if you know a formula, but if you can spot a hidden Algebra concept inside a Geometry problem.\nAI Insight: Use Mirror View to see if you are over-investing time in "easy" theory questions while failing tricky applications.',
    },
    {
        title: '2. Emotional "Sunk Cost" in DILR',
        body: 'Dropdown Content: The Ego Trap: Spending 8+ minutes on a set and refusing to leave because you have already "invested" time. Breakthroughs usually happen in the first 5 minutes; if not, walk away.\nPro Move: Detach emotionally. Skipping the wrong set is as valuable as solving the right one.',
    },
    {
        title: '3. Rote-Rule Dependency in VARC',
        body: 'Dropdown Content: Mechanical reading kills your rhythm. Relying solely on elimination techniques makes you slow. High percentilers build a reading ear through volume, allowing them to feel when an option is "off-tone".\nStrategy: Stop hunting for keywords; start following the author\'s argument.',
    },
    {
        title: '4. Ignoring the "Fatigue Tax"',
        body: 'Dropdown Content: Quant is the final section. Your brain\'s RAM is exhausted by then. Solving questions in chronological order (1, 2, 3...) is a recipe for failure.\nThe Fix: Use the Round Robin method. If the AI Coach detects you are missing easy Arithmetic late in the mock, your energy management is flawed.',
    },
    {
        title: '5. The "Fixed Attempt" Fallacy',
        body: 'Dropdown Content: Entering the hall with a target number (e.g., "I must do 15") leads to panic and blind guessing when a paper is tough. In difficult years, accuracy beats volume every time.\nThe Reality: 8-9 correct answers in a brutal section can still land a 99 percentile. Learn to read the paper\'s difficulty, not just chase a number.',
    },
];

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
                        className="min-h-[44px] rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
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
                    className="mt-auto inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                >
                    Start a free mock
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
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Free during beta</p>
                        <h3 className={`${headingFont.className} mt-2 text-xl font-semibold text-slate-900`}>
                            Start a free mock
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Early access open for CAT 2026 (beta).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-[44px] rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>
                <button
                    type="button"
                    onClick={onSignIn}
                    disabled={loading}
                    className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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

interface LandingPageClientProps {
    nexaiDemoMarkdown: string;
}

export default function LandingPageClient({ nexaiDemoMarkdown }: LandingPageClientProps) {
    const { assets, isLoading } = useLandingAssets();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [carouselPaused, setCarouselPaused] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const canHover = useCanHover();
    const heroRef = useRef<HTMLElement | null>(null);
    const carouselRef = useRef<HTMLDivElement | null>(null);

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

    const scrollToSlide = useCallback(
        (index: number, behavior: ScrollBehavior = 'smooth') => {
            const node = carouselRef.current;
            if (!node) return;
            const width = node.clientWidth;
            if (!width) return;
            node.scrollTo({ left: width * index, behavior });
        },
        []
    );

    const handleSelectSlide = useCallback(
        (index: number) => {
            setActiveSlide(index);
            scrollToSlide(index);
        },
        [scrollToSlide]
    );

    const handleCarouselScroll = useCallback(() => {
        const node = carouselRef.current;
        if (!node) return;
        const width = node.clientWidth;
        if (!width) return;
        const nextIndex = Math.round(node.scrollLeft / width);
        if (nextIndex !== activeSlide) {
            setActiveSlide(nextIndex);
        }
    }, [activeSlide]);

    useEffect(() => {
        if (!canHover || carouselPaused) return;
        const timer = window.setInterval(() => {
            setActiveSlide((prev) => {
                const next = (prev + 1) % HERO_SLIDES.length;
                scrollToSlide(next);
                return next;
            });
        }, 4800);
        return () => window.clearInterval(timer);
    }, [canHover, carouselPaused, scrollToSlide]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => {
            scrollToSlide(activeSlide, 'auto');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeSlide, scrollToSlide]);

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
            const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
            const origin = configuredSiteUrl || (typeof window !== 'undefined'
                ? window.location.origin
                : '');
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
        <div className={`${bodyFont.className} min-h-screen overflow-x-hidden bg-slate-50 text-slate-900`}>
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
                <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 left-16 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />

                <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                                CAT
                            </div>
                            <div>
                                <div className={`${headingFont.className} text-sm font-semibold text-slate-900`}>
                                    NEXAMS
                                </div>
                                <div className="text-xs text-slate-500">Prep like it's exam day</div>
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
                                className="group relative inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] sm:px-5 sm:text-sm"
                            >
                                <span className="absolute inset-0 -z-10 rounded-full bg-emerald-300/30 opacity-0 blur-xl transition group-hover:opacity-100 motion-safe:group-hover:animate-[landing-glow_2.8s_ease-in-out_infinite]" />
                                Start a free mock
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(true)}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 lg:hidden"
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
                        className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:pt-24"
                    >
                        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Free during beta &bull; CAT 2026
                                    </span>
                                    <p className="text-xs text-slate-500">Early access open for CAT 2026 (beta).</p>
                                </div>
                                <h1
                                    className={`${headingFont.className} text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl motion-safe:animate-[landing-fade-up_0.7s_ease-out]`}
                                >
                                    Practice like it's your D-Day. Get hyper-customized analytics.
                                </h1>
                                <p
                                    className="text-sm text-slate-600 sm:text-base lg:text-lg motion-safe:animate-[landing-fade-up_0.7s_ease-out]"
                                    style={{ animationDelay: '80ms' }}
                                >
                                    AI coaching guided by top percentilers - built from your attempt behavior (time, order, revisits, accuracy).
                                </p>
                                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                                    {HERO_CHIPS.map((chip) => (
                                        <span
                                            key={chip}
                                            className="rounded-full border border-slate-200 bg-white px-3 py-1"
                                        >
                                            {chip}
                                        </span>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAuthOpen(true)}
                                        className="group relative inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
                                    >
                                        <span className="absolute inset-0 -z-10 rounded-full bg-emerald-300/30 opacity-0 blur-xl transition group-hover:opacity-100 motion-safe:group-hover:animate-[landing-glow_2.8s_ease-in-out_infinite]" />
                                        Start a free mock
                                    </button>
                                    <p className="text-xs font-semibold text-slate-500">Continue with Google</p>
                                    <p className="text-[11px] text-slate-400">
                                        Mocks are best experienced on desktop (like CAT).
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-[32px] border border-slate-200 bg-white/70 p-4 shadow-lg">
                                    <div
                                        ref={carouselRef}
                                        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth lg:overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                        onScroll={handleCarouselScroll}
                                        onMouseEnter={() => setCarouselPaused(true)}
                                        onMouseLeave={() => setCarouselPaused(false)}
                                    >
                                        {HERO_SLIDES.map((slide) => (
                                            <div key={slide.id} className="min-w-full snap-center px-1">
                                                <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                                                    <div className="relative h-[210px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-[240px]">
                                                        {slide.assetKey ? (
                                                            <AssetImage
                                                                assetKey={slide.assetKey}
                                                                assets={assets}
                                                                isLoading={isLoading}
                                                                fallbackLabel={slide.fallbackLabel ?? 'Carousel preview'}
                                                                containerClassName="h-full w-full"
                                                                imageClassName="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full flex-col justify-between p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                                        Coach Report
                                                                    </span>
                                                                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                                        Beta
                                                                    </span>
                                                                </div>
                                                                <div className="mt-4 grid gap-3">
                                                                    {slide.insights?.map((insight) => (
                                                                        <div
                                                                            key={insight}
                                                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                                                                        >
                                                                            {insight}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {slide.maskTop && (
                                                            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-white/80 backdrop-blur-sm" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{slide.title}</p>
                                                        <p className="mt-1 text-xs text-slate-500">{slide.subtitle}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        {HERO_SLIDES.map((slide, index) => (
                                            <button
                                                key={slide.id}
                                                type="button"
                                                onClick={() => handleSelectSlide(index)}
                                                className="rounded-full p-1"
                                                aria-label={`Go to ${slide.label} slide`}
                                            >
                                                <span
                                                    className={`block h-2.5 w-2.5 rounded-full transition ${index === activeSlide
                                                        ? 'bg-slate-900'
                                                        : 'bg-slate-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid w-full grid-cols-3 text-center text-[11px] font-semibold text-slate-500">
                                        {HERO_SLIDES.map((slide, index) => (
                                            <span
                                                key={slide.id}
                                                className={index === activeSlide ? 'text-slate-900' : ''}
                                            >
                                                {slide.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-slate-200 bg-white">
                        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {LIVE_STRIP_ITEMS.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900">{item.copy}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="ai-insights-marketing" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Demo NexAI insights</p>
                            <details className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                                    <span>Open NexAI insights demo</span>
                                    <span className="text-slate-400 transition group-open:rotate-45">+</span>
                                </summary>
                                <div className="mt-4">
                                    <AIInsightsAdCard heading="NexAI Insights" markdown={nexaiDemoMarkdown} />
                                </div>
                            </details>
                        </div>
                    </section>

                    <section id="mentor" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    Curated & verified by
                                </p>
                                <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-slate-900`}>
                                    Saurabh Khandelwal
                                </h2>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {['CAT 99.84', 'MBA, IIM Udaipur'].map((chip) => (
                                        <span
                                            key={chip}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                                        >
                                            {chip}
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-4 text-sm text-slate-600">
                                    Mocks and review standards aligned to what top mentors look for: selection, pacing, and execution.
                                </p>
                            </div>
                            <div className="relative">
                                <AssetImage
                                    assetKey="mentor_photo"
                                    assets={assets}
                                    isLoading={isLoading}
                                    fallbackLabel="Mentor spotlight"
                                    containerClassName="h-[220px] w-full rounded-[28px] border border-slate-200 bg-slate-50 sm:h-[280px]"
                                    imageClassName="h-[220px] w-full rounded-[28px] border border-slate-200 object-cover sm:h-[280px]"
                                />
                            </div>
                        </div>
                    </section>

                    <section id="features" className="border-y border-slate-200 bg-white">
                        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Features</p>
                                <h2 className={`${headingFont.className} text-3xl font-semibold text-slate-900`}>
                                    Built for focused CAT 2026 practice
                                </h2>
                                <p className="text-slate-600">
                                    AI coaching, mentor-curated mocks, and mirror analytics designed for real test-day flow.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-6 md:grid-cols-2">
                                {FEATURE_CARDS.map((feature) => (
                                    <div
                                        key={feature.id}
                                        className="relative rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
                                    >
                                        {feature.tag && (
                                            <span className="absolute right-4 top-4 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                                                {feature.tag}
                                            </span>
                                        )}
                                        <h3 className={`${headingFont.className} text-xl font-semibold text-slate-900`}>
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                                        <ul className="mt-4 space-y-2 text-xs text-slate-600">
                                            {feature.bullets.map((bullet) => (
                                                <li key={bullet} className="flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    <span>{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="roadmap" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Roadmap</p>
                                <h2 className={`${headingFont.className} text-3xl font-semibold text-slate-900`}>
                                    Month-by-month rollout for CAT 2026 prep
                                </h2>
                                <p className="text-slate-600">
                                    What is live now and what lands next for beta users.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute left-0 right-0 top-6 hidden h-px bg-slate-200 lg:block" />
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {ROADMAP_ITEMS.map((item) => (
                                        <div
                                            key={item.period}
                                            className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                                        >
                                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                                {item.period}
                                            </span>
                                            <p className="mt-4 text-sm font-semibold text-slate-900">{item.copy}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="cat-hub" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">CAT Hub</p>
                                <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-slate-900`}>
                                    CAT Hub: 5 Mistakes That Kill Percentiles
                                </h2>
                                <p className="mt-3 text-slate-600">
                                    Five patterns that quietly destroy accuracy and decision speed across VARC, DILR, and QA.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {CAT_HUB_ITEMS.map((item) => (
                                    <details
                                        key={item.title}
                                        className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                                    >
                                        <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                                            {item.title}
                                            <span className="text-slate-400 transition group-open:rotate-45">+</span>
                                        </summary>
                                        <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{item.body}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <div className={`${headingFont.className} text-lg font-semibold text-slate-900`}>
                                NEXAMS
                            </div>
                            <p className="mt-3 max-w-md text-sm text-slate-600">
                                A clean, focused CAT mock experience with real exam constraints and mentor-grade insights.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsAuthOpen(true)}
                                className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
                            >
                                Start a free mock
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
                    className="fixed bottom-6 left-6 z-40 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
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
