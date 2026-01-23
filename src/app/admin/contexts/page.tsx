/**
 * @fileoverview Contexts List Page
 * @description Admin page to view and manage question contexts/passages
 */

import { sbSSR } from '@/lib/supabase/server';
import { adminLogger } from '@/lib/logger';
import Link from 'next/link';

export default async function ContextsPage() {
    const supabase = await sbSSR();

    // Fetch contexts with their paper info
    const { data: contexts, error } = await supabase
        .from('question_contexts')
        .select(`
            *,
            papers (id, title, slug)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        adminLogger.dataModified('question_contexts', 'fetch_error', { error });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contexts & Passages</h1>
                    <p className="text-gray-500 mt-1">Shared passages that questions can reference</p>
                </div>
                <Link
                    href="/admin/contexts/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Context
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paper
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Section
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Preview
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contexts && contexts.length > 0 ? (
                            contexts.map((context) => (
                                <tr key={context.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{context.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {context.papers?.title || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${context.section === 'VARC' ? 'bg-blue-100 text-blue-800' :
                                            context.section === 'DILR' ? 'bg-purple-100 text-purple-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {context.section}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
                                            {context.text.substring(0, 150)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/contexts/${context.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No contexts found. <Link href="/admin/contexts/new" className="text-blue-600 hover:underline">Add your first context</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
