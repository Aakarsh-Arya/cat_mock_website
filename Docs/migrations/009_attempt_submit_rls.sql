-- ============================================================================
-- Migration: Allow submit transition for attempts
-- @blueprint Security Audit - RLS submit transition
-- ============================================================================
-- Purpose: Allow authenticated users to mark their own attempts as submitted
--          while keeping completed_at and other protected fields locked down.

DROP POLICY IF EXISTS "Users can update their own attempts" ON public.attempts;

CREATE POLICY "Users can update their own attempts" ON public.attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Default: no status/submitted/completed changes
            (
                status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
                AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow in_progress -> submitted transition for the owner
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'in_progress'
                AND status = 'submitted'
                AND submitted_at IS NOT NULL
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
        )
    );