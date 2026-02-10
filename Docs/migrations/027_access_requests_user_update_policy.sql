-- ============================================================================
-- Migration 027: Allow Users to Re-Submit Access Requests
-- ============================================================================
-- Purpose:
--   Enable authenticated users to update their own access_requests row
--   to reset status to pending after deletion/re-registration.
-- ============================================================================

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own access request" ON public.access_requests;
CREATE POLICY "Users can update own access request" ON public.access_requests
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR (user_id IS NULL AND lower(email) = lower(auth.jwt() ->> 'email'))
    )
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'pending'
    );

-- ============================================================================
-- Verification
-- ============================================================================
-- 1) Sign in as a user with a previously approved request (deleted & re-created).
-- 2) Submit request access.
-- 3) Confirm row updates:
--    SELECT * FROM public.access_requests WHERE user_id = auth.uid();
