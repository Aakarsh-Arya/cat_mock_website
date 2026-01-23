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

    // DEV MODE: Skip RBAC check if SKIP_ADMIN_CHECK is set (for development before DB migration)
    const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true';

    let isAdmin = skipAdminCheck; // Default to true if skip is enabled

    if (!skipAdminCheck) {
        // M6+ RBAC: Check JWT claims for admin role
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
            try {
                const decoded = jwtDecode<JWTClaims>(session.access_token);
                isAdmin = decoded?.user_role === 'admin' || decoded?.app_metadata?.user_role === 'admin';
            } catch {
                // JWT decode failed - not admin
                isAdmin = false;
            }
        }

        // Fallback: Check database if JWT claims not available (during migration period)
        if (!isAdmin) {
            const { data: userRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            isAdmin = userRole?.role === 'admin';
        }
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header */}
            <header className="bg-[#0b3d91] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            {/* Back to Dashboard */}
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <Link href="/admin" className="font-bold text-xl">
                                CAT Mocks Admin
                            </Link>
                            <nav className="flex gap-6">
                                <Link
                                    href="/admin/papers"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Papers
                                </Link>
                                <Link
                                    href="/admin/question-sets"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Question Sets
                                </Link>
                                <Link
                                    href="/admin/questions"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Questions
                                </Link>
                                <Link
                                    href="/admin/contexts"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Contexts
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs bg-green-500 px-2 py-0.5 rounded">Admin</span>
                            <span className="text-sm text-gray-300">{user.email}</span>
                            <Link
                                href="/dashboard"
                                className="text-sm bg-yellow-500 text-gray-900 px-3 py-1.5 rounded hover:bg-yellow-400 transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
