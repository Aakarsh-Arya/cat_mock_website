-- ==========================================================================
-- Migration 014: Soften Submit RLS (Allow scoring update)
-- Date: February 2026
-- ==========================================================================
-- Purpose:
-- 1) Allow authenticated users to transition submitted -> completed
-- 2) Allow authenticated users to update scoring columns
--
-- NOTE: This is a security relaxation. Apply only if you accept the risk.

-- --------------------------------------------------------------------------
-- STEP 1: Allow submitted -> completed transition
-- --------------------------------------------------------------------------
-- Replace the restrictive policy with a relaxed version that permits:
--  - in_progress -> submitted
--  - submitted -> completed

DROP POLICY IF EXISTS "Users can update their own in-progress attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can update their own attempts (relaxed)" ON public.attempts;

CREATE POLICY "Users can update their own attempts (relaxed)" ON public.attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Allow normal progress updates (no status change)
            (
                status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
                AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow transition from in_progress to submitted
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'in_progress'
                AND status = 'submitted'
                AND submitted_at IS NOT NULL
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow transition from submitted to completed
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'submitted'
                AND status = 'completed'
                AND completed_at IS NOT NULL
            )
        )
    );

-- --------------------------------------------------------------------------
-- STEP 2: Re-grant scoring column updates to authenticated users
-- --------------------------------------------------------------------------
-- WARNING: This enables clients to write scores directly.
-- If you can, prefer using service-role updates instead.

GRANT UPDATE (total_score, correct_count, incorrect_count, unanswered_count,
              accuracy, attempt_rate, section_scores, max_possible_score, time_taken_seconds)
ON public.attempts TO authenticated;
