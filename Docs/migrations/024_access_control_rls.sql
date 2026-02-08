-- ============================================================================
-- Migration 024: Access Control RLS Gate for Attempts/Responses
-- ============================================================================
-- Purpose: Prevent non-active users from creating attempts or writing responses.
-- Dependencies: 023_access_control_foundations.sql (user_access table + enums)
-- ============================================================================

-- --------------------------------------------------------------------------
-- STEP 1: Attempts INSERT policy (require active access or admin)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can create attempts within limit" ON public.attempts;

CREATE POLICY "Users can create attempts within limit" ON public.attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1
                FROM public.user_access ua
                WHERE ua.user_id = auth.uid()
                  AND ua.status = 'active'
            )
        )
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

-- --------------------------------------------------------------------------
-- STEP 2: Responses INSERT/UPDATE policies (require active access or admin)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can create their own responses" ON public.responses;
CREATE POLICY "Users can create their own responses" ON public.responses
    FOR INSERT TO authenticated
    WITH CHECK (
        attempt_id IN (
            SELECT id
            FROM public.attempts
            WHERE user_id = auth.uid()
              AND status IN ('in_progress', 'paused')
        )
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1
                FROM public.user_access ua
                WHERE ua.user_id = auth.uid()
                  AND ua.status = 'active'
            )
        )
    );

DROP POLICY IF EXISTS "Users can update their own responses" ON public.responses;
CREATE POLICY "Users can update their own responses" ON public.responses
    FOR UPDATE TO authenticated
    USING (
        attempt_id IN (
            SELECT id
            FROM public.attempts
            WHERE user_id = auth.uid()
              AND status IN ('in_progress', 'paused')
        )
    )
    WITH CHECK (
        attempt_id IN (
            SELECT id
            FROM public.attempts
            WHERE user_id = auth.uid()
              AND status IN ('in_progress', 'paused')
        )
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1
                FROM public.user_access ua
                WHERE ua.user_id = auth.uid()
                  AND ua.status = 'active'
            )
        )
    );

-- ============================================================================
-- VERIFICATION (RUN MANUALLY)
-- ============================================================================
-- As pending user:
--   INSERT INTO attempts (...) should fail.
--   INSERT/UPDATE responses should fail.
-- As active user:
--   INSERT INTO attempts (...) should succeed (within attempt limit).
