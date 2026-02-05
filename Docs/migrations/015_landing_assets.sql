-- ============================================================================
-- MIGRATION 015: Landing Assets (DB + Storage)
-- ============================================================================
-- Purpose: Provide a minimal landing asset layer for dynamic image swapping.
--
-- Table: public.landing_assets
-- Columns: key, storage_path, public_url, alt_text, updated_at, updated_by
-- RLS: public read, admin-only write
-- Storage: landing-assets bucket (public read), admin-only write
-- ============================================================================

-- ==========================================================================
-- STEP 1: Create landing_assets table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.landing_assets (
    key TEXT PRIMARY KEY,
    storage_path TEXT,
    public_url TEXT,
    alt_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_landing_assets_updated_at ON public.landing_assets(updated_at DESC);

COMMENT ON TABLE public.landing_assets IS 'Public landing page asset registry (image keys, URLs, alt text).';
COMMENT ON COLUMN public.landing_assets.key IS 'Unique asset key (hero_mock_ui, mentor_photo, feature_exam_ui, etc).';

-- ==========================================================================
-- STEP 2: Enable RLS
-- ==========================================================================
ALTER TABLE public.landing_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read landing assets" ON public.landing_assets;
DROP POLICY IF EXISTS "Admins can insert landing assets" ON public.landing_assets;
DROP POLICY IF EXISTS "Admins can update landing assets" ON public.landing_assets;
DROP POLICY IF EXISTS "Admins can delete landing assets" ON public.landing_assets;

-- Public read (anon + authenticated)
CREATE POLICY "Public read landing assets" ON public.landing_assets
    FOR SELECT USING (true);

-- Admin-only writes
CREATE POLICY "Admins can insert landing assets" ON public.landing_assets
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update landing assets" ON public.landing_assets
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete landing assets" ON public.landing_assets
    FOR DELETE USING (public.is_admin());

-- ==========================================================================
-- STEP 3: Storage bucket for landing assets
-- ==========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'landing-assets',
    'landing-assets',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access for landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete landing assets" ON storage.objects;

-- Public read
CREATE POLICY "Public read access for landing assets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'landing-assets');

-- Admin-only writes
CREATE POLICY "Admins can upload landing assets" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'landing-assets' AND public.is_admin());

CREATE POLICY "Admins can update landing assets" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'landing-assets' AND public.is_admin());

CREATE POLICY "Admins can delete landing assets" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'landing-assets' AND public.is_admin());

-- ==========================================================================
-- VERIFICATION QUERIES
-- ==========================================================================
-- SELECT * FROM public.landing_assets LIMIT 5;
-- SELECT * FROM storage.buckets WHERE id = 'landing-assets';
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = 'landing_assets';
