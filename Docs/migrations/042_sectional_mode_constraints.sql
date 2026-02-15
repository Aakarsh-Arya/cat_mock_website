-- ============================================================================
-- Migration 042: Sectional Mode Constraints + Active Attempt Isolation
-- ============================================================================
-- Purpose:
-- 1) Allow concurrent active attempts across different buckets:
--    - Full mock
--    - Sectional VARC
--    - Sectional DILR
--    - Sectional QA
-- 2) Keep each bucket idempotent (one active attempt per user+paper+bucket).
-- 3) Make attempt-limit enforcement mode-aware:
--    full attempts counted against full, sectionals counted per section.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Normalize any accidental duplicate active rows inside the SAME bucket
-- ----------------------------------------------------------------------------
WITH ranked_active AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY
                user_id,
                paper_id,
                COALESCE(attempt_mode, 'full'),
                COALESCE(sectional_section, '__FULL__')
            ORDER BY created_at DESC, id DESC
        ) AS rn
    FROM public.attempts
    WHERE status IN ('in_progress', 'paused')
)
UPDATE public.attempts a
SET
    status = 'abandoned',
    completed_at = COALESCE(a.completed_at, NOW()),
    updated_at = NOW()
FROM ranked_active r
WHERE a.id = r.id
  AND r.rn > 1;

-- ----------------------------------------------------------------------------
-- 2) Replace old coarse uniqueness with mode+section uniqueness
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_attempts_one_active_per_user_paper;

CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_one_active_per_user_paper_mode_section
ON public.attempts (
    user_id,
    paper_id,
    COALESCE(attempt_mode, 'full'),
    COALESCE(sectional_section, '__FULL__')
)
WHERE status IN ('in_progress', 'paused');

-- ----------------------------------------------------------------------------
-- 3) Rebuild insert policy with mode-aware attempt-limit checks
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can create attempts within limit" ON public.attempts;

CREATE POLICY "Users can create attempts within limit" ON public.attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Sectional attempts must be enabled at paper level and section must be allowed.
            COALESCE(attempt_mode, 'full') = 'full'
            OR EXISTS (
                SELECT 1
                FROM public.papers p
                WHERE p.id = attempts.paper_id
                  AND COALESCE(p.allow_sectional_attempts, FALSE) = TRUE
                  AND (
                        p.sectional_allowed_sections IS NULL
                        OR attempts.sectional_section = ANY (p.sectional_allowed_sections)
                  )
            )
        )
        AND (
            -- No attempt limit configured.
            (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) IS NULL
            OR (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) <= 0
            OR (
                -- Attempt limit is mode-aware:
                -- full => count full only; sectional => count same sectional section only.
                (
                    SELECT COUNT(*)
                    FROM public.attempts a
                    WHERE a.user_id = auth.uid()
                      AND a.paper_id = attempts.paper_id
                      AND a.status IN ('completed', 'submitted')
                      AND (
                            (
                                COALESCE(attempts.attempt_mode, 'full') = 'full'
                                AND COALESCE(a.attempt_mode, 'full') = 'full'
                            )
                            OR (
                                COALESCE(attempts.attempt_mode, 'full') = 'sectional'
                                AND COALESCE(a.attempt_mode, 'full') = 'sectional'
                                AND COALESCE(a.sectional_section, '') = COALESCE(attempts.sectional_section, '')
                            )
                      )
                ) < (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id)
            )
        )
    );

-- ----------------------------------------------------------------------------
-- 4) Verification (manual)
-- ----------------------------------------------------------------------------
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'attempts'
--   AND indexname LIKE 'idx_attempts_one_active_per_user_paper%';
--
-- SELECT attempt_mode, sectional_section, status, COUNT(*)
-- FROM public.attempts
-- WHERE status IN ('in_progress', 'paused')
-- GROUP BY attempt_mode, sectional_section, status
-- ORDER BY attempt_mode, sectional_section, status;
