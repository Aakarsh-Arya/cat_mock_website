'use client';

/**
 * @fileoverview Import Paper Button Component  
 * @description Client-side component for importing papers via Schema v3.0 JSON
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ImportResult {
    success: boolean;
    paperId?: string;
    slug?: string;
    version?: number;
    setsCount?: number;
    questionsCount?: number;
    published?: boolean;
    skipped?: boolean;
    message?: string;
    error?: string;
    details?: string[];
}

export default function ImportPaperButton() {
    const [isImporting, setIsImporting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string[]>([]);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [publishOnImport, setPublishOnImport] = useState(false);
    const [skipIfDuplicate, setSkipIfDuplicate] = useState(true);
    const [importNotes, setImportNotes] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setError(null);
        setErrorDetails([]);
        setResult(null);

        try {
            // Read file content
            const content = await file.text();
            let data;

            try {
                data = JSON.parse(content);
            } catch {
                throw new Error('Invalid JSON file. Please check the file format.');
            }

            // Quick schema check before sending
            if (data.schema_version !== 'v3.0') {
                throw new Error(
                    `Schema version must be 'v3.0'. Got: ${data.schema_version || 'undefined'}. ` +
                    `Use the CLI importer for legacy formats.`
                );
            }

            // Send to API
            const response = await fetch('/api/admin/papers/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data,
                    publish: publishOnImport,
                    skipIfDuplicate,
                    notes: importNotes || `Imported from ${file.name}`,
                }),
            });

            const responseData = await response.json() as ImportResult;

            if (!response.ok) {
                if (responseData.details && responseData.details.length > 0) {
                    setErrorDetails(responseData.details);
                }
                throw new Error(responseData.error || responseData.message || 'Import failed');
            }

            setResult(responseData);

            // Refresh the page to show the new paper
            if (!responseData.skipped) {
                setTimeout(() => {
                    router.refresh();
                }, 1500);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setIsImporting(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const openModal = () => {
        setShowModal(true);
        setError(null);
        setErrorDetails([]);
        setResult(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setError(null);
        setErrorDetails([]);
        setResult(null);
        setImportNotes('');
    };

    return (
        <>
            <button
                onClick={openModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import JSON
            </button>

            {/* Import Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-green-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white">Import Paper (Schema v3.0)</h2>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Result Display */}
                            {result && (
                                <div className={`p-4 rounded-lg ${result.skipped ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 ${result.skipped ? 'text-yellow-500' : 'text-green-500'}`}>
                                            {result.skipped ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-medium ${result.skipped ? 'text-yellow-800' : 'text-green-800'}`}>
                                                {result.skipped ? 'Import Skipped' : 'Import Successful!'}
                                            </h3>
                                            <ul className="mt-2 text-sm text-gray-600 space-y-1">
                                                {result.slug && <li><strong>Slug:</strong> {result.slug}</li>}
                                                {result.version && <li><strong>Version:</strong> {result.version}</li>}
                                                {result.setsCount !== undefined && <li><strong>Sets:</strong> {result.setsCount}</li>}
                                                {result.questionsCount !== undefined && <li><strong>Questions:</strong> {result.questionsCount}</li>}
                                                {result.published !== undefined && (
                                                    <li><strong>Status:</strong> {result.published ? 'Published' : 'Draft'}</li>
                                                )}
                                                {result.message && <li className="text-yellow-700">{result.message}</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 text-red-500">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-red-800">Import Failed</h3>
                                            <p className="mt-1 text-sm text-red-700">{error}</p>
                                            {errorDetails.length > 0 && (
                                                <ul className="mt-2 text-xs text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                                                    {errorDetails.map((detail, idx) => (
                                                        <li key={idx}>{detail}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Import Options */}
                            {!result && (
                                <>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={publishOnImport}
                                                onChange={(e) => setPublishOnImport(e.target.checked)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-700">Publish immediately after import</span>
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={skipIfDuplicate}
                                                onChange={(e) => setSkipIfDuplicate(e.target.checked)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-700">Skip if duplicate (same JSON hash)</span>
                                        </label>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Import Notes (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={importNotes}
                                                onChange={(e) => setImportNotes(e.target.value)}
                                                placeholder="e.g., Initial import, Bug fix, etc."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".json"
                                            onChange={handleFileSelect}
                                            disabled={isImporting}
                                            className="hidden"
                                            id="import-file"
                                        />
                                        <label
                                            htmlFor="import-file"
                                            className={`cursor-pointer ${isImporting ? 'opacity-50' : ''}`}
                                        >
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-600">
                                                {isImporting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Importing...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="text-green-600 font-medium">Click to upload</span> or drag and drop
                                                    </>
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                JSON file (Schema v3.0 format)
                                            </p>
                                        </label>
                                    </div>

                                    {/* Help Text */}
                                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                        <p className="font-medium mb-1">Schema v3.0 (Sets-First) Format:</p>
                                        <pre className="text-xs overflow-x-auto">
                                            {`{
  "schema_version": "v3.0",
  "paper": { "slug": "...", "title": "..." },
  "question_sets": [{ "client_set_id": "...", ... }],
  "questions": [{ "set_ref": "...", ... }]
}`}
                                        </pre>
                                        <p className="mt-2">
                                            See <code className="bg-gray-200 px-1 rounded">schemas/paper_schema_v3.json</code> for the full schema.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {result ? 'Close' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
