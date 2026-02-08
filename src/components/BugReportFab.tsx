'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sb } from '@/lib/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useFocusTrap } from '@/components/useFocusTrap';

const MAX_FILE_SIZE_MB = 3;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

type BugReportFabProps = {
    userId: string;
    route: string;
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
};

function isValidFile(file: File): { ok: boolean; message?: string } {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return { ok: false, message: 'Only JPG, PNG, WEBP, or AVIF files are allowed.' };
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return { ok: false, message: `Max file size is ${MAX_FILE_SIZE_MB}MB.` };
    }
    return { ok: true };
}

export default function BugReportFab({ userId, route, open, onOpen, onClose }: BugReportFabProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useFocusTrap(open, modalRef, onClose);

    useEffect(() => {
        if (!open) {
            setStatus(null);
        }
    }, [open]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = useCallback((nextFile: File | null) => {
        if (!nextFile) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setFile(null);
            setPreviewUrl(null);
            return;
        }
        const validation = isValidFile(nextFile);
        if (!validation.ok) {
            setStatus(validation.message ?? 'Invalid file.');
            return;
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(nextFile);
        setPreviewUrl(URL.createObjectURL(nextFile));
    }, [previewUrl]);

    const handleSubmit = useCallback(async () => {
        if (!description.trim()) {
            setStatus('Please describe what went wrong.');
            return;
        }
        setSubmitting(true);
        setStatus(null);
        let screenshotPath: string | null = null;

        try {
            const supabase = sb();
            if (file) {
                screenshotPath = await uploadToCloudinary(file);
            }

            const meta = {
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                client_time: new Date().toISOString(),
                route,
                image_provider: screenshotPath ? 'cloudinary' : null,
            };

            const { error: insertError } = await supabase.from('bug_reports').insert({
                user_id: userId,
                route,
                description: description.trim(),
                screenshot_path: screenshotPath,
                meta,
            });

            if (insertError) {
                throw insertError;
            }

            setStatus('Thanks. Your report was sent.');
            setDescription('');
            handleFileChange(null);
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit report.';
            setStatus(message);
        } finally {
            setSubmitting(false);
        }
    }, [description, file, handleFileChange, onClose, route, userId]);

    return (
        <>
            <button
                type="button"
                onClick={onOpen}
                className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
                aria-label="Report an issue"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14l-1.5-13h-11z" />
                </svg>
            </button>

            <div
                className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!open}
            >
                <div
                    className={`absolute inset-0 bg-slate-900/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                />
                <div
                    ref={modalRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Report an issue"
                    tabIndex={-1}
                    className={`absolute right-6 top-20 w-[min(92vw,420px)] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Report an issue</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">What went wrong?</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                        >
                            Close
                        </button>
                    </div>

                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="mt-4 h-28 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="Describe the issue in a sentence or two..."
                    />

                    <div className="mt-4">
                        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Screenshot (optional)
                        </label>
                        <div className="mt-2 flex items-center gap-3">
                            <input
                                type="file"
                                accept={ACCEPTED_TYPES.join(',')}
                                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                                className="text-xs text-slate-500"
                            />
                            <span className="text-xs text-slate-400">Max {MAX_FILE_SIZE_MB}MB</span>
                        </div>
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Screenshot preview"
                                className="mt-3 h-24 w-full rounded-lg object-cover"
                            />
                        )}
                    </div>

                    {status && <p className="mt-3 text-xs text-slate-500">{status}</p>}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? 'Sending...' : 'Submit report'}
                    </button>
                </div>
            </div>
        </>
    );
}
