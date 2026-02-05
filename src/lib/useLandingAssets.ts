'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLandingAssets, type LandingAsset } from '@/lib/landing-assets';

type LandingAssetsState = {
    assets: Record<string, LandingAsset>;
    isLoading: boolean;
    error: string | null;
};

export function useLandingAssets(): LandingAssetsState {
    const [assets, setAssets] = useState<Record<string, LandingAsset>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAssets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getLandingAssets();
            setAssets(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load landing assets';
            console.warn('[landing-assets] load failed', message);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    return { assets, isLoading, error };
}
