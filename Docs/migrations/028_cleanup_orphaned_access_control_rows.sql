-- ============================================================================
-- Migration 028: Cleanup Orphaned Access Control Rows
-- ============================================================================
-- Purpose:
--   Remove access_requests / user_access / user_roles rows that no longer
--   reference an existing auth.users record ("ghost" rows).
-- ============================================================================

-- Access requests tied to deleted auth users or left with NULL user_id
DELETE FROM public.access_requests
WHERE user_id IS NULL
   OR user_id NOT IN (SELECT id FROM auth.users);

-- User access rows for deleted auth users
DELETE FROM public.user_access
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- User roles for deleted auth users (if RBAC is enabled)
DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ============================================================================
-- Verification
-- ============================================================================
-- SELECT COUNT(*) FROM public.access_requests WHERE user_id IS NULL;
-- SELECT COUNT(*) FROM public.access_requests WHERE user_id NOT IN (SELECT id FROM auth.users);
-- SELECT COUNT(*) FROM public.user_access WHERE user_id NOT IN (SELECT id FROM auth.users);
-- SELECT COUNT(*) FROM public.user_roles WHERE user_id NOT IN (SELECT id FROM auth.users);
