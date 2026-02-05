-- ============================================================================
-- MIGRATION 017: Bug Report Status (Admin Workflow)
-- ============================================================================
-- Purpose: Allow admins to track bug report status (unchecked/in_progress/resolved).
-- ============================================================================

ALTER TABLE public.bug_reports
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unchecked';

-- Enable admin updates for status changes
DROP POLICY IF EXISTS "Admins can update bug reports" ON public.bug_reports;

CREATE POLICY "Admins can update bug reports" ON public.bug_reports
    FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- SELECT id, status FROM public.bug_reports LIMIT 5;
