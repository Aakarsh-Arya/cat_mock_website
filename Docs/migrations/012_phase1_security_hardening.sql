-- ==========================================================================
-- Migration 012: Phase 1 Security Hardening (Initial - DEPRECATED)
-- ==========================================================================
-- NOTE: This migration has been SUPERSEDED by 013_phase1_security_complete.sql
-- which provides a more comprehensive implementation of Phase 1 security.
--
-- Use migration 013 instead for new deployments.
-- This file is kept for reference and backwards compatibility with existing
-- deployments that already ran this migration.
-- ==========================================================================

-- 1) Disable legacy SQL scoring function (use TS scoring only)
DROP FUNCTION IF EXISTS public.finalize_attempt(UUID);

-- 2) Enforce per-user attempt limits (status != 'expired')
DROP POLICY IF EXISTS "Users can create their own attempts" ON public.attempts;
CREATE POLICY "Users can create attempts within limit" ON public.attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) IS NULL
            OR (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) <= 0
            OR (
                SELECT COUNT(*)
                FROM public.attempts a
                WHERE a.user_id = auth.uid()
                  AND a.paper_id = attempts.paper_id
                  AND a.status <> 'expired'
            ) < (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id)
        )
    );

-- 3) Column-level protection for sensitive fields
REVOKE SELECT (correct_answer) ON public.questions FROM authenticated;
REVOKE SELECT (session_token) ON public.attempts FROM authenticated;
REVOKE UPDATE (session_token) ON public.attempts FROM authenticated;
