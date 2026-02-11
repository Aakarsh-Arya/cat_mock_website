/**
 * @fileoverview NexAI Insight Request Panel
 * @description Client component for requesting NexAI insight with optional user customization prompt.
 */

'use client';

import { useCallback, useState, useTransition } from 'react';
import { requestAIAnalysis } from '@/features/exam-engine/lib/actions';
import { getAnalysisStore } from '@/features/exam-engine/model/useExamStore';
import type { AIAnalysisStatus, PerformanceReason } from '@/types/exam';

interface AIAnalysisButtonProps {
    attemptId: string;
    initialStatus: AIAnalysisStatus;
    initialPrompt?: string | null;
}

const STATUS_CONFIG: Record<AIAnalysisStatus, {
    label: string;
    className: string;
    disabled: boolean;
    icon: 'sparkle' | 'clock' | 'check' | 'download' | 'error';
}> = {
    none: {
        label: 'Request NexAI Insight for Your Attempt',
        className: 'bg-cyan-600 text-white hover:bg-cyan-700',
        disabled: false,
        icon: 'sparkle',
    },
    requested: {
        label: 'NexAI Insight Requested',
        className: 'bg-cyan-100 text-cyan-800 cursor-default',
        disabled: true,
        icon: 'clock',
    },
    exported: {
        label: 'NexAI Insight In Progress',
        className: 'bg-green-100 text-green-700 cursor-default',
        disabled: true,
        icon: 'download',
    },
    processed: {
        label: 'NexAI Insight Ready',
        className: 'bg-green-100 text-green-700 cursor-default',
        disabled: true,
        icon: 'check',
    },
    failed: {
        label: 'NexAI Processing Failed - Retry',
        className: 'bg-red-600 text-white hover:bg-red-700',
        disabled: false,
        icon: 'error',
    },
};

function StatusIcon({ icon }: { icon: string }) {
    switch (icon) {
        case 'sparkle':
            return (
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            );
        case 'clock':
            return (
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'check':
            return (
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'download':
            return (
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            );
        case 'error':
            return (
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        default:
            return null;
    }
}

export function AIAnalysisButton({ attemptId, initialStatus, initialPrompt }: AIAnalysisButtonProps) {
    const [status, setStatus] = useState<AIAnalysisStatus>(initialStatus || 'none');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState(initialPrompt ?? '');
    const [isPending, startTransition] = useTransition();

    const config = STATUS_CONFIG[status];
    const canEditPrompt = status === 'none' || status === 'failed';

    const snapshotQuestionReasons = useCallback((): Record<string, PerformanceReason> => {
        const store = getAnalysisStore(attemptId);
        const reasons = store.getState().reasons ?? {};
        const allowed = new Set<PerformanceReason>(['concept_gap', 'careless_error', 'time_pressure', 'guess']);
        const snapshot: Record<string, PerformanceReason> = {};

        for (const [questionId, reason] of Object.entries(reasons)) {
            if (!questionId || typeof questionId !== 'string') continue;
            if (!reason || !allowed.has(reason)) continue;
            snapshot[questionId] = reason;
        }

        return snapshot;
    }, [attemptId]);

    const handleRequest = useCallback(() => {
        if (config.disabled && status !== 'failed') return;

        setErrorMessage(null);

        const prevStatus = status;
        const trimmedPrompt = prompt.trim();
        const questionReasons = snapshotQuestionReasons();
        setStatus('requested');

        startTransition(async () => {
            const result = await requestAIAnalysis(attemptId, trimmedPrompt, questionReasons);

            if (result.success) {
                setStatus((result.data?.status as AIAnalysisStatus) || 'requested');
            } else {
                setStatus(prevStatus);
                setErrorMessage(result.error ?? 'Failed to request NexAI insight');
            }
        });
    }, [attemptId, config.disabled, prompt, startTransition, status]);

    return (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-900">NexAI Insight Request</h3>

            <label htmlFor="nexai-request-prompt" className="block text-sm font-medium text-slate-700">
                Any specific things you want the insight to include.
            </label>
            <textarea
                id="nexai-request-prompt"
                value={prompt}
                disabled={!canEditPrompt || isPending}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="Example: I rushed QA due to panic in the last section and random-guessed 4 questions."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
            />
            <p className="text-xs text-slate-500">
                💡 Please fill the reason for performance in the <strong className="text-slate-700">Mirror View</strong> to get more precise NexAI insights.
            </p>

            <button
                type="button"
                onClick={handleRequest}
                disabled={config.disabled || isPending}
                className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${config.className} ${isPending ? 'cursor-wait opacity-60' : ''}`}
            >
                {isPending ? (
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <StatusIcon icon={config.icon} />
                )}
                {isPending ? 'Submitting Request...' : config.label}
            </button>

            {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
            )}
        </div>
    );
}
