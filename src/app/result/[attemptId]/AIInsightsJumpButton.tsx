'use client';

import { useCallback } from 'react';

interface AIInsightsJumpButtonProps {
    targetHash?: string;
}

export function AIInsightsJumpButton({
    targetHash = '#nexai-insights-view',
}: AIInsightsJumpButtonProps) {
    const handleClick = useCallback(() => {
        if (window.location.hash === targetHash) return;
        window.location.hash = targetHash;
    }, [targetHash]);

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
            NexAI Insights
        </button>
    );
}
