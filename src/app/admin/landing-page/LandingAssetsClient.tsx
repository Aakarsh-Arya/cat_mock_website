'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { getLandingAssets, replaceLandingAsset, type LandingAsset } from '@/lib/landing-assets';
import { sb } from '@/lib/supabase/client';

type ToastKind = 'success' | 'error' | 'info';

const MAX_FILE_SIZE_MB = 2;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const ASSET_CATALOG: Array<{ key: string; label: string; hint?: string }> = [
    {
        key: 'hero_mock_ui',
        label: 'Hero carousel: Mock UI',
        hint: 'Crop/blur the CAT 2025 title area or upload a lower crop.',
    },
    {
        key: 'hero_mirror_view',
        label: 'Hero carousel: Mirror View',
        hint: 'Mirror analytics screenshot.',
    },
    { key: 'mentor_photo', label: 'Mentor spotlight photo' },
    { key: 'feature_exam_ui', label: 'Feature: Exam UI' },
    { key: 'feature_analytics', label: 'Feature: Analytics' },
    { key: 'rag_demo_1', label: 'RAG demo 1' },
    { key: 'rag_demo_2', label: 'RAG demo 2' },
    { key: 'rag_demo_3', label: 'RAG demo 3' },
    { key: 'rag_demo_4', label: 'RAG demo 4' },
    { key: 'rag_demo_5', label: 'RAG demo 5' },
];

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

function isValidFile(file: File): { ok: boolean; message?: string } {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return { ok: false, message: 'Only JPG, PNG, WEBP, or AVIF files are allowed.' };
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return { ok: false, message: `Max file size is ${MAX_FILE_SIZE_MB}MB.` };
    }
    return { ok: true };
}

function buildPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
}

export default function LandingAssetsClient() {
    const [assets, setAssets] = useState<Record<string, LandingAsset>>({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
    const [altText, setAltText] = useState<Record<string, string>>({});
    const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
    const previewUrlsRef = useRef<Record<string, string>>({});

    const showToast = useCallback((kind: ToastKind, message: string) => {
        setToast({ kind, message });
        window.setTimeout(() => setToast(null), 3000);
    }, []);

    const loadAssets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getLandingAssets();
            setAssets(data);
            setAltText((prev) => {
                const next = { ...prev };
                ASSET_CATALOG.forEach((asset) => {
                    next[asset.key] = data[asset.key]?.alt_text ?? next[asset.key] ?? '';
                });
                return next;
            });
        } catch (error) {
            console.error('Failed to load landing assets', error);
            showToast('error', 'Failed to load assets.');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    useEffect(() => {
        previewUrlsRef.current = previewUrls;
    }, [previewUrls]);

    useEffect(() => {
        return () => {
            Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const handleFileSelected = useCallback((key: string, file: File) => {
        const validation = isValidFile(file);
        if (!validation.ok) {
            showToast('error', validation.message ?? 'Invalid file.');
            return;
        }
        setSelectedFiles((prev) => ({ ...prev, [key]: file }));
        setPreviewUrls((prev) => {
            if (prev[key]) {
                URL.revokeObjectURL(prev[key]);
            }
            return { ...prev, [key]: buildPreviewUrl(file) };
        });
    }, [showToast]);

    const handleDrop = useCallback((key: string, event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFileSelected(key, file);
        }
    }, [handleFileSelected]);

    const handleSave = useCallback(async (key: string) => {
        const file = selectedFiles[key];
        if (!file) return;
        setSavingKeys((prev) => ({ ...prev, [key]: true }));

        try {
            const updated = await replaceLandingAsset(key, file, altText[key] ?? '', sb());
            setAssets((prev) => ({ ...prev, [key]: updated }));
            setSelectedFiles((prev) => ({ ...prev, [key]: null }));
            setPreviewUrls((prev) => {
                const next = { ...prev };
                if (next[key]) {
                    URL.revokeObjectURL(next[key]);
                }
                delete next[key];
                return next;
            });

            const supabase = sb();
            const { data: userData } = await supabase.auth.getUser();
            const adminId = userData?.user?.id ?? null;
            if (adminId) {
                const entityId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? crypto.randomUUID()
                    : adminId;
                const auditClient = supabase as unknown as {
                    from: (table: string) => {
                        insert: (values: Record<string, unknown>) => Promise<{ error: { message?: string } | null }>;
                    };
                };
                const { error: auditError } = await auditClient.from('admin_audit_log').insert({
                    admin_id: adminId,
                    action: 'update',
                    entity_type: 'landing_asset',
                    entity_id: entityId,
                    changes: {
                        key,
                        public_url: updated.public_url,
                        storage_path: updated.storage_path,
                        alt_text: updated.alt_text,
                    },
                });
                if (auditError) {
                    console.warn('Failed to insert admin audit log', auditError.message);
                }
            }

            showToast('success', `Updated ${key}.`);
        } catch (error) {
            console.error('Failed to replace landing asset', error);
            showToast('error', `Failed to update ${key}.`);
        } finally {
            setSavingKeys((prev) => ({ ...prev, [key]: false }));
        }
    }, [altText, selectedFiles, showToast]);

    const cards = useMemo(() => ASSET_CATALOG, []);

    return (
        <div className="space-y-6">
            {toast && (
                <div
                    className={`rounded-lg px-4 py-3 text-sm font-medium shadow-sm ${toast.kind === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : toast.kind === 'error'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                >
                    {toast.message}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {loading
                    ? cards.map((asset) => (
                        <div key={asset.key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="h-40 w-full animate-pulse rounded-lg bg-gray-100" />
                            <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                            <div className="mt-3 h-10 w-full animate-pulse rounded bg-gray-100" />
                        </div>
                    ))
                    : cards.map((asset) => {
                        const current = assets[asset.key];
                        const preview = previewUrls[asset.key] || current?.public_url || '';
                        const file = selectedFiles[asset.key];
                        const isSaving = savingKeys[asset.key];
                        return (
                            <div key={asset.key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{asset.key}</p>
                                    <h3 className="text-lg font-semibold text-gray-900">{asset.label}</h3>
                                    {asset.hint && (
                                        <p className="mt-1 text-xs text-gray-500">{asset.hint}</p>
                                    )}
                                </div>

                                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-2">
                                    {preview ? (
                                        <div className="relative h-44 w-full">
                                            <Image
                                                src={preview}
                                                alt={current?.alt_text || asset.label}
                                                fill
                                                unoptimized
                                                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                                                className="rounded-md object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-44 items-center justify-center text-xs text-gray-400">
                                            No image uploaded yet
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Alt text</label>
                                    <input
                                        type="text"
                                        value={altText[asset.key] ?? ''}
                                        onChange={(event) =>
                                            setAltText((prev) => ({ ...prev, [asset.key]: event.target.value }))
                                        }
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="Describe the image"
                                    />
                                </div>

                                <div
                                    className="rounded-lg border-2 border-dashed border-gray-200 bg-white px-4 py-5 text-center text-sm text-gray-500 transition hover:border-blue-300"
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => handleDrop(asset.key, event)}
                                >
                                    <input
                                        id={`asset-file-${asset.key}`}
                                        type="file"
                                        accept={ACCEPTED_TYPES.join(',')}
                                        className="hidden"
                                        onChange={(event) => {
                                            const nextFile = event.target.files?.[0];
                                            if (nextFile) {
                                                handleFileSelected(asset.key, nextFile);
                                            }
                                        }}
                                    />
                                    <label htmlFor={`asset-file-${asset.key}`} className="cursor-pointer">
                                        <span className="font-semibold text-blue-600">Drag & drop</span> or click to replace
                                    </label>
                                    <div className="mt-2 text-xs text-gray-400">
                                        JPG / PNG / WEBP • Max {MAX_FILE_SIZE_MB}MB
                                    </div>
                                    {file && (
                                        <div className="mt-3 text-xs text-gray-500">
                                            Selected: {file.name} ({formatBytes(file.size)})
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    disabled={!file || isSaving}
                                    onClick={() => handleSave(asset.key)}
                                    className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${file && !isSaving
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
