/**
 * @fileoverview Paper Settings Page
 * @description Admin page for paper-specific settings
 */

import 'server-only';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sbSSR } from '@/lib/supabase/server';
import { updatePaper } from '../edit/actions';

interface PageProps {
    params: Promise<{ paperId: string }>;
}

function toDateTimeLocal(value?: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
}

export default async function PaperSettingsPage({ params }: PageProps) {
    const { paperId } = await params;
    const supabase = await sbSSR();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/auth/sign-in');
    }

    const { data: { session } } = await supabase.auth.getSession();
    let role: string | null = session?.user?.app_metadata?.user_role ?? null;

    if (!role && session?.access_token) {
        try {
            const payload = JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString('utf-8')) as {
                user_role?: string;
                app_metadata?: { user_role?: string };
            };
            role = payload.user_role ?? payload.app_metadata?.user_role ?? null;
        } catch {
            role = null;
        }
    }

    let isAdmin = role === 'admin' || role === 'dev';
    if (!isAdmin) {
        const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
        isAdmin = !rpcError && Boolean(isAdminRpc);
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    const { data: paper, error: paperError } = await supabase
        .from('papers')
        .select('*')
        .eq('id', paperId)
        .single();

    if (paperError || !paper) {
        notFound();
    }

    async function updatePaperSettings(formData: FormData) {
        'use server';

        const published = formData.get('published') === 'on';
        const isFree = formData.get('is_free') === 'on';
        const attemptLimitRaw = formData.get('attempt_limit');
        const attemptLimit = attemptLimitRaw ? Number(attemptLimitRaw) : undefined;
        const normalizedAttemptLimit = Number.isFinite(attemptLimit as number) ? attemptLimit : undefined;
        const availableFrom = formData.get('available_from') as string | null;
        const availableUntil = formData.get('available_until') as string | null;

        const result = await updatePaper(paperId, {
            published,
            is_free: isFree,
            attempt_limit: normalizedAttemptLimit,
            available_from: availableFrom || undefined,
            available_until: availableUntil || undefined,
        });

        if (!result.success) {
            throw new Error(result.error || 'Failed to update paper');
        }

        revalidatePath(`/admin/papers/${paperId}/settings`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Paper Settings</h1>
                    <p className="text-sm text-gray-500">{paper.title}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/papers/${paperId}/edit`}
                        className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Live Edit
                    </Link>
                    <Link
                        href={`/admin/papers/${paperId}/questions`}
                        className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        Questions
                    </Link>
                </div>
            </div>

            <form action={updatePaperSettings} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <input id="published" name="published" type="checkbox" defaultChecked={paper.published} />
                    <label htmlFor="published" className="text-sm text-gray-700">Published</label>
                </div>

                <div className="flex items-center gap-3">
                    <input id="is_free" name="is_free" type="checkbox" defaultChecked={paper.is_free} />
                    <label htmlFor="is_free" className="text-sm text-gray-700">Free access</label>
                </div>

                <div>
                    <label htmlFor="attempt_limit" className="block text-sm text-gray-700 mb-1">Attempt limit (optional)</label>
                    <input
                        id="attempt_limit"
                        name="attempt_limit"
                        type="number"
                        min={0}
                        defaultValue={paper.attempt_limit ?? ''}
                        className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="available_from" className="block text-sm text-gray-700 mb-1">Available from</label>
                        <input
                            id="available_from"
                            name="available_from"
                            type="datetime-local"
                            defaultValue={toDateTimeLocal(paper.available_from)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="available_until" className="block text-sm text-gray-700 mb-1">Available until</label>
                        <input
                            id="available_until"
                            name="available_until"
                            type="datetime-local"
                            defaultValue={toDateTimeLocal(paper.available_until)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
