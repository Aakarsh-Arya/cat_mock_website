import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { BookmarksExplorer } from '@/components/BookmarksExplorer';

export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
    const supabase = await sbSSR();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/sign-in?redirect_to=/bookmarks');
    }

    return (
        <main className="page-shell py-6 sm:py-8">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Bookmarks Explorer</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Navigate your bookmarked questions by section, topic, and subtopic.
                    </p>
                </div>
                <Link
                    href="/dashboard"
                    className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                    Back to Dashboard
                </Link>
            </div>

            <BookmarksExplorer />
        </main>
    );
}

