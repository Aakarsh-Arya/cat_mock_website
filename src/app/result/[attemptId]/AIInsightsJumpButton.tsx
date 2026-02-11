'use client';

import { useCallback } from 'react';

interface AIInsightsJumpButtonProps {
    targetHash?: string;
    className?: string;
}

export function AIInsightsJumpButton({
    targetHash = '#nexai-insights-view',
    className = '',
}: AIInsightsJumpButtonProps) {
    const handleClick = useCallback(() => {
        if (window.location.hash === targetHash) return;
        window.location.hash = targetHash;
    }, [targetHash]);

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 ${className}`}
        >
            NexAI Insights
        </button>
    );
}
