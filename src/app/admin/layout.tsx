/**
 * @fileoverview Admin Layout
 * @description Layout wrapper for admin pages with navigation
 * @blueprint M6+ - Hybrid RBAC enforcement via JWT claims
 */

import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

interface JWTClaims {
    user_role?: string;
    app_metadata?: {
        user_role?: string;
    };
}

const ADMIN_NAV = [
    { href: '/admin/papers', label: 'Papers' },
    { href: '/admin/landing-page', label: 'Landing Page' },
    { href: '/admin/question-sets', label: 'Question Sets' },
    { href: '/admin/questions', label: 'Questions' },
    { href: '/admin/bug-reports', label: 'Bug Reports' },
    { href: '/admin/access-control', label: 'Access Control' },
    { href: '/admin/ai-analysis', label: 'NexAI Insights' },
] as const;

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/sign-in');
    }

    // DEV MODE: Skip RBAC check only in non-production environments
    const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true' && process.env.NODE_ENV !== 'production';

    let isAdmin = skipAdminCheck; // Default to true if skip is enabled

    if (!skipAdminCheck) {
        // M6+ RBAC: Check JWT claims for admin role
        const { data: { session } } = await supabase.auth.getSession();
        let role: string | null = session?.user?.app_metadata?.user_role ?? null;

        if (!role && session?.access_token) {
            try {
                const decoded = jwtDecode<JWTClaims>(session.access_token);
                role = decoded?.user_role ?? decoded?.app_metadata?.user_role ?? null;
            } catch {
                // JWT decode failed - no role
                role = null;
            }
        }

        isAdmin = role === 'admin' || role === 'dev';

        // Fallback: Check database function if claims not available
        if (!isAdmin) {
            const { data: isAdminRpc } = await supabase.rpc('is_admin');
            isAdmin = Boolean(isAdminRpc);
        }
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-[#0b3d91] text-white shadow-md">
                <div className="page-shell py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <Link
                                href="/dashboard"
                                className="touch-target inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10"
                                title="Back to Dashboard"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <Link href="/admin" className="truncate text-lg font-bold sm:text-xl">
                                NEXAMS Admin
                            </Link>
                        </div>

                        <div className="hidden items-center gap-4 lg:flex">
                            <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-semibold">Admin</span>
                            <span className="max-w-[240px] truncate text-sm text-gray-200">{user.email}</span>
                            <Link
                                href="/dashboard"
                                className="touch-target inline-flex items-center rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
                            >
                                Back to Dashboard
                            </Link>
                        </div>

                        <details className="relative lg:hidden">
                            <summary className="touch-target inline-flex h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-white/20 px-3 text-sm font-semibold text-white hover:bg-white/10 [&::-webkit-details-marker]:hidden">
                                Menu
                            </summary>
                            <div className="absolute right-0 z-20 mt-2 w-[min(88vw,20rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-xl">
                                <div className="mb-2 border-b border-slate-100 pb-2">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Signed in as</p>
                                    <p className="truncate text-sm font-semibold text-slate-900">{user.email}</p>
                                </div>
                                <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                                    {ADMIN_NAV.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="touch-target flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="touch-target mt-3 inline-flex w-full items-center justify-center rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-yellow-300"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </details>
                    </div>

                    <nav className="mt-3 hidden flex-wrap gap-2 lg:flex">
                        {ADMIN_NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="touch-target inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-200 transition-colors hover:bg-white/15 hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="page-shell py-6 sm:py-8">
                {children}
            </main>
        </div>
    );
}
