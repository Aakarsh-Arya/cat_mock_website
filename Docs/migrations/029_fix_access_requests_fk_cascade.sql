-- ============================================================================
-- Migration 029: Fix access_requests FK + Cleanup Trigger
-- ============================================================================
-- Root Cause:
--   access_requests.user_id has ON DELETE SET NULL. When a user is deleted
--   from auth.users, the FK nullifies user_id BEFORE our AFTER DELETE trigger
--   fires. The trigger then cannot find the row to delete, leaving a "zombie"
--   row that blocks re-registration via the email unique index.
--
-- Fix:
--   1) Change FK to ON DELETE CASCADE so rows are auto-deleted with the user
--   2) Replace the cleanup trigger with BEFORE DELETE so it runs before cascades
--   3) Purge existing orphaned rows (user_id IS NULL)
-- ============================================================================

-- ============================================================================
-- STEP 1: Purge existing orphaned rows first
-- ============================================================================

DELETE FROM public.access_requests
WHERE user_id IS NULL
   OR user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.user_access
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ============================================================================
-- STEP 2: Change FK from ON DELETE SET NULL to ON DELETE CASCADE
-- ============================================================================

-- Drop the existing FK constraint on user_id
ALTER TABLE public.access_requests
    DROP CONSTRAINT IF EXISTS access_requests_user_id_fkey;

-- Re-add with CASCADE
ALTER TABLE public.access_requests
    ADD CONSTRAINT access_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- ============================================================================
-- STEP 3: Fix the cleanup trigger to use BEFORE DELETE
-- ============================================================================
-- This ensures our cleanup code runs BEFORE FK cascades null/delete the rows.

CREATE OR REPLACE FUNCTION public.handle_auth_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    -- Delete responses explicitly in case FK cascade is missing.
    DELETE FROM public.responses
    WHERE attempt_id IN (SELECT id FROM public.attempts WHERE user_id = OLD.id);

    -- Delete attempts for the auth user.
    DELETE FROM public.attempts WHERE user_id = OLD.id;

    -- Access control cleanup (belt-and-suspenders with CASCADE)
    DELETE FROM public.access_requests WHERE user_id = OLD.id;
    DELETE FROM public.user_access WHERE user_id = OLD.id;

    RETURN OLD;
END;
$$;

-- Switch from AFTER to BEFORE so it runs before FK cascades
DROP TRIGGER IF EXISTS on_auth_user_deleted_cleanup ON auth.users;
CREATE TRIGGER on_auth_user_deleted_cleanup
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_delete();

-- ============================================================================
-- STEP 4: Fix RLS - allow users to update orphaned rows matched by email
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own access request" ON public.access_requests;
CREATE POLICY "Users can update own access request" ON public.access_requests
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR (user_id IS NULL AND lower(email) = lower(auth.jwt() ->> 'email'))
    )
    WITH CHECK (
        status = 'pending'
    );

-- Also allow users to delete their own rejected request and re-insert
DROP POLICY IF EXISTS "Users can delete own rejected request" ON public.access_requests;
CREATE POLICY "Users can delete own rejected request" ON public.access_requests
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Verification
-- ============================================================================
-- SELECT COUNT(*) FROM public.access_requests WHERE user_id IS NULL;
-- \d public.access_requests  -- Verify FK is ON DELETE CASCADE
-- SELECT tgname, tgtype FROM pg_trigger WHERE tgname = 'on_auth_user_deleted_cleanup';
