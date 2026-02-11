'use client';

/**
 * @fileoverview Paper Actions Component
 * @description Client-side actions for paper management including edit, settings, questions, export, and delete
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deletePaper } from './actions';

interface PaperActionsProps {
    paperId: string;
}

export default function PaperActions({ paperId }: PaperActionsProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const router = useRouter();

    const handleExport = async (format: 'v1' | 'v3' = 'v1') => {
        setIsExporting(true);
        setExportError(null);
        setShowExportMenu(false);

        try {
            const url = format === 'v3'
                ? `/api/admin/papers/${paperId}/export?format=v3`
                : `/api/admin/papers/${paperId}/export?assembled=true`;

            const response = await fetch(url);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Export failed');
            }

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `paper_${paperId}.json`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
                if (match) {
                    filename = match[1];
                }
            }

            // Download the file
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            setExportError(error instanceof Error ? error.message : 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {exportError && (
                <span className="text-xs text-red-600" title={exportError}>
                    Export failed
                </span>
            )}

            {/* Edit Button */}
            <Link
                href={`/admin/papers/${paperId}/edit`}
                className="touch-target inline-flex items-center rounded px-2 py-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900 hover:underline"
                title="Edit paper content"
            >
                Edit
            </Link>

            {/* Preview Button */}
            <Link
                href={`/admin/papers/${paperId}/preview`}
                className="touch-target inline-flex items-center rounded px-2 py-1 text-purple-600 hover:bg-purple-50 hover:text-purple-900 hover:underline"
                title="Preview as student"
            >
                Preview
            </Link>

            {/* Settings Button */}
            <Link
                href={`/admin/papers/${paperId}/settings`}
                className="touch-target inline-flex items-center rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:underline"
                title="Paper settings"
            >
                Settings
            </Link>

            {/* Questions Button */}
            <Link
                href={`/admin/papers/${paperId}/questions`}
                className="touch-target inline-flex items-center rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:underline"
                title="View questions"
            >
                Questions
            </Link>

            {/* Export Button with Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={isExporting}
                    className="touch-target inline-flex items-center rounded px-2 py-1 text-green-600 hover:bg-green-50 hover:text-green-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    title="Download paper JSON"
                >
                    {isExporting ? 'Exporting...' : 'Export'}
                </button>
                {showExportMenu && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                            onClick={() => handleExport('v1')}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                        >
                            Export v1 (Legacy)
                        </button>
                        <button
                            onClick={() => handleExport('v3')}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg border-t"
                        >
                            Export v3 (Sets-First)
                        </button>
                    </div>
                )}
            </div>

            {deleteError && (
                <span className="text-xs text-red-600" title={deleteError}>
                    Delete failed
                </span>
            )}

            {/* Delete Button - styled as dangerous action */}
            <button
                onClick={async () => {
                    if (isDeleting) return;
                    setDeleteError(null);
                    if (!confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
                        return;
                    }
                    setIsDeleting(true);
                    const result = await deletePaper(paperId);
                    if (!result.success) {
                        setDeleteError(result.error || 'Delete failed');
                    } else {
                        router.refresh();
                    }
                    setIsDeleting(false);
                }}
                className="touch-target inline-flex items-center rounded px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                title="Delete paper"
                disabled={isDeleting}
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    );
}
