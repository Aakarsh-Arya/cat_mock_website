'use client';

/**
 * @fileoverview Download button for AI Analysis export
 * @description Uses fetch() to call the export API with proper cookie auth,
 *   then triggers a programmatic download of the JSON file.
 */

import { useState } from 'react';

interface DownloadExportButtonProps {
    attemptId: string;
}

export default function DownloadExportButton({ attemptId }: DownloadExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDownload() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/ai-analysis/${attemptId}/export`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({ error: res.statusText }));
                setError(body.error || `Export failed (${res.status})`);
                return;
            }

            // Extract filename from Content-Disposition header or use fallback
            const disposition = res.headers.get('Content-Disposition');
            let filename = `analysis_${attemptId.slice(0, 8)}.json`;
            if (disposition) {
                const match = disposition.match(/filename="?([^";\n]+)"?/);
                if (match?.[1]) filename = match[1];
            }

            // Create blob and trigger download
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Download failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={handleDownload}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Exporting…
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Export
                    </>
                )}
            </button>
            {error && (
                <p className="text-xs text-red-500 max-w-[200px] text-right">{error}</p>
            )}
        </div>
    );
}
