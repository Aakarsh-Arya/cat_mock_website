/**
 * @fileoverview Admin Layout
 * @description Layout wrapper for admin pages with navigation
 */

import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';

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

    // For now, allow any authenticated user to access admin
    // In production, you'd check for admin role:
    // const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    // if (profile?.role !== 'admin') redirect('/dashboard');

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header */}
            <header className="bg-[#0b3d91] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
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
