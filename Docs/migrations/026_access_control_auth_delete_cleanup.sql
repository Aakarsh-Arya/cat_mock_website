-- ============================================================================
-- Migration 026: Cleanup Access Control Rows on Auth User Deletion
-- ============================================================================
-- Purpose:
--   Remove access control rows when an auth user is deleted to prevent
--   zombie access requests and stale access status records.
-- ============================================================================

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

    -- Remove access control rows tied to the deleted user.
    DELETE FROM public.user_access WHERE user_id = OLD.id;
    DELETE FROM public.access_requests WHERE user_id = OLD.id;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted_cleanup ON auth.users;
CREATE TRIGGER on_auth_user_deleted_cleanup
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_delete();

-- ============================================================================
-- Verification
-- ==========================================================================
-- 1) Delete a user from auth.users in Supabase.
-- 2) Confirm access control rows are removed:
--    SELECT * FROM public.user_access WHERE user_id = '<deleted_user_id>';
--    SELECT * FROM public.access_requests WHERE user_id = '<deleted_user_id>';
