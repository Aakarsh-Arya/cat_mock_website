-- ============================================================================
-- Migration 039: Sectional Attempt Foundations
-- ============================================================================
-- Purpose:
-- 1) Add paper-level controls for sectional availability.
-- 2) Add attempt-level mode metadata (full vs sectional + selected section).
-- 3) Add constraints and indexes for consistency + query performance.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Paper-level sectional controls
-- ----------------------------------------------------------------------------

ALTER TABLE public.papers
ADD COLUMN IF NOT EXISTS allow_sectional_attempts BOOLEAN DEFAULT FALSE;

ALTER TABLE public.papers
ADD COLUMN IF NOT EXISTS sectional_allowed_sections TEXT[] DEFAULT ARRAY['VARC', 'DILR', 'QA']::text[];

UPDATE public.papers
SET allow_sectional_attempts = COALESCE(allow_sectional_attempts, FALSE)
WHERE allow_sectional_attempts IS NULL;

UPDATE public.papers
SET sectional_allowed_sections = ARRAY['VARC', 'DILR', 'QA']::text[]
WHERE sectional_allowed_sections IS NULL
   OR array_length(sectional_allowed_sections, 1) IS NULL
   OR array_length(sectional_allowed_sections, 1) = 0;

COMMENT ON COLUMN public.papers.allow_sectional_attempts IS
'Whether this paper allows sectional-only attempts from the mock detail page.';

COMMENT ON COLUMN public.papers.sectional_allowed_sections IS
'Allowed sections for sectional attempts. Values must be subset of VARC,DILR,QA.';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'papers_sectional_allowed_sections_valid'
          AND conrelid = 'public.papers'::regclass
    ) THEN
        ALTER TABLE public.papers
        ADD CONSTRAINT papers_sectional_allowed_sections_valid
        CHECK (
            array_length(sectional_allowed_sections, 1) >= 1
            AND sectional_allowed_sections <@ ARRAY['VARC', 'DILR', 'QA']::text[]
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_papers_allow_sectional_attempts
ON public.papers (allow_sectional_attempts)
WHERE allow_sectional_attempts = TRUE;

-- ----------------------------------------------------------------------------
-- 2) Attempt-level mode metadata
-- ----------------------------------------------------------------------------

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS attempt_mode TEXT DEFAULT 'full';

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS sectional_section TEXT;

UPDATE public.attempts
SET attempt_mode = COALESCE(attempt_mode, 'full')
WHERE attempt_mode IS NULL;

-- Any inconsistent historic rows are normalized to "full".
UPDATE public.attempts
SET attempt_mode = 'full',
    sectional_section = NULL
WHERE attempt_mode <> 'sectional'
  AND sectional_section IS NOT NULL;

COMMENT ON COLUMN public.attempts.attempt_mode IS
'Attempt mode: full or sectional.';

COMMENT ON COLUMN public.attempts.sectional_section IS
'Section targeted in sectional mode (VARC/DILR/QA); NULL for full mode.';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'attempts_attempt_mode_valid'
          AND conrelid = 'public.attempts'::regclass
    ) THEN
        ALTER TABLE public.attempts
        ADD CONSTRAINT attempts_attempt_mode_valid
        CHECK (attempt_mode IN ('full', 'sectional'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'attempts_sectional_section_valid'
          AND conrelid = 'public.attempts'::regclass
    ) THEN
        ALTER TABLE public.attempts
        ADD CONSTRAINT attempts_sectional_section_valid
        CHECK (
            sectional_section IS NULL
            OR sectional_section IN ('VARC', 'DILR', 'QA')
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'attempts_mode_section_consistency'
          AND conrelid = 'public.attempts'::regclass
    ) THEN
        ALTER TABLE public.attempts
        ADD CONSTRAINT attempts_mode_section_consistency
        CHECK (
            (attempt_mode = 'full' AND sectional_section IS NULL)
            OR
            (attempt_mode = 'sectional' AND sectional_section IS NOT NULL)
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attempts_user_mode_status_started
ON public.attempts (user_id, attempt_mode, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_attempts_paper_mode_section_status
ON public.attempts (paper_id, attempt_mode, sectional_section, status);

-- Prevent race-condition duplicates: at most one active attempt per user+paper.
-- First normalize any existing duplicates by abandoning older active rows.
WITH ranked_active AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, paper_id
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_one_active_per_user_paper
ON public.attempts (user_id, paper_id)
WHERE status IN ('in_progress', 'paused');

-- ----------------------------------------------------------------------------
-- 3) Verification (manual)
-- ----------------------------------------------------------------------------
-- SELECT allow_sectional_attempts, sectional_allowed_sections
-- FROM public.papers
-- LIMIT 5;
--
-- SELECT attempt_mode, sectional_section, COUNT(*)
-- FROM public.attempts
-- GROUP BY attempt_mode, sectional_section
-- ORDER BY attempt_mode, sectional_section;
