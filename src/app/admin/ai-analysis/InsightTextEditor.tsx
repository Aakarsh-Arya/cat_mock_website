'use client';

import { useState, useTransition } from 'react';
import { saveNexAIInsightText } from './actions';

interface InsightTextEditorProps {
    attemptId: string;
    initialText?: string | null;
}

export default function InsightTextEditor({ attemptId, initialText }: InsightTextEditorProps) {
    const [text, setText] = useState(initialText ?? '');
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        setMessage(null);
        startTransition(async () => {
            const formData = new FormData();
            formData.append('attempt_id', attemptId);
            formData.append('insight_text', text);

            const result = await saveNexAIInsightText(formData);
            setMessage(result.success ? 'Saved' : (result.error ?? 'Failed to save'));
        });
    };

    return (
        <div className="w-[320px] space-y-2">
            <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={5}
                placeholder="Paste finalized NexAI insight text for this attempt..."
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">{text.length} chars</span>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="inline-flex items-center rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save Insight'}
                </button>
            </div>
            {message && (
                <p className={`text-xs ${message === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
            )}
        </div>
    );
}

