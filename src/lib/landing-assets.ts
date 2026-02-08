import type { BrowserSupabaseClient } from '@/lib/supabase/client';
import { sb } from '@/lib/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary';

type AppSupabaseClient = BrowserSupabaseClient;

export type LandingAsset = {
    key: string;
    storage_path: string | null;
    public_url: string | null;
    alt_text: string | null;
    updated_at: string | null;
    updated_by: string | null;
};

export async function getLandingAssets(client?: AppSupabaseClient): Promise<Record<string, LandingAsset>> {
    const supabase = client ?? sb();
    const { data, error } = await supabase
        .from('landing_assets')
        .select('key, storage_path, public_url, alt_text, updated_at, updated_by');

    if (error) {
        throw error;
    }

    const map: Record<string, LandingAsset> = {};
    const rows = (data ?? []) as LandingAsset[];
    rows.forEach((row) => {
        map[row.key] = row;
    });
    return map;
}

export async function replaceLandingAsset(
    key: string,
    file: File,
    altText: string,
    client?: AppSupabaseClient
): Promise<LandingAsset> {
    const supabase = client ?? sb();

    const publicUrl = await uploadToCloudinary(file);

    const { data: userData } = await supabase.auth.getUser();
    const updatedBy = userData?.user?.id ?? null;

    const { data: upserted, error: upsertError } = await supabase
        .from('landing_assets')
        .upsert(
            {
                key,
                storage_path: null,
                public_url: publicUrl,
                alt_text: altText,
                updated_at: new Date().toISOString(),
                updated_by: updatedBy,
            },
            { onConflict: 'key' }
        )
        .select('key, storage_path, public_url, alt_text, updated_at, updated_by')
        .single();

    if (upsertError) {
        throw upsertError;
    }

    return upserted as LandingAsset;
}
