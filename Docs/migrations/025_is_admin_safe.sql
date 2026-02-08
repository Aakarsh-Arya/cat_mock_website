-- ============================================================================
-- Migration 025: Harden is_admin() to fail closed without throwing
-- ============================================================================
-- Purpose:
--   Prevent RLS policy evaluation from erroring if user_roles table (or RBAC)
--   has not been applied in a given environment. This returns FALSE on any
--   exception, avoiding 500s and failing closed.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'dev')
    );
EXCEPTION
    WHEN undefined_table THEN
        RETURN FALSE;
    WHEN others THEN
        RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
