-- ============================================================================
-- MIGRATION 016: Bug Reports (DB + Storage)
-- ============================================================================
-- Purpose: Allow authenticated users to submit bug reports with optional screenshots.
--
-- Table: public.bug_reports
-- Columns: id, user_id, route, description, screenshot_path, meta, created_at
-- RLS: authenticated insert, admin read
-- Storage: bug-screenshots bucket (private), authenticated upload, admin read/delete
-- ============================================================================

-- ==========================================================================
-- STEP 1: Create bug_reports table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    route TEXT,
    description TEXT NOT NULL,
    screenshot_path TEXT,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);

COMMENT ON TABLE public.bug_reports IS 'User-submitted bug reports with optional screenshots.';

-- ==========================================================================
-- STEP 2: Enable RLS
-- ==========================================================================
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Admins can read bug reports" ON public.bug_reports;

CREATE POLICY "Users can insert bug reports" ON public.bug_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read bug reports" ON public.bug_reports
    FOR SELECT USING (public.is_admin());

-- ==========================================================================
-- STEP 3: Storage bucket for screenshots
-- ==========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'bug-screenshots',
    'bug-screenshots',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated upload bug screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins read bug screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete bug screenshots" ON storage.objects;

CREATE POLICY "Authenticated upload bug screenshots" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Admins read bug screenshots" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'bug-screenshots' AND public.is_admin());

CREATE POLICY "Admins delete bug screenshots" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'bug-screenshots' AND public.is_admin());

-- ==========================================================================
-- VERIFICATION QUERIES
-- ==========================================================================
-- SELECT * FROM public.bug_reports LIMIT 5;
-- SELECT * FROM storage.buckets WHERE id = 'bug-screenshots';
