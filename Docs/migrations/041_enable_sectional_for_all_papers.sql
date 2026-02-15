-- ============================================================================
-- Migration 041: Enable Sectional Attempts for All Papers
-- ============================================================================
-- Purpose:
-- Enable sectional attempts for all published papers so users can take
-- sectional tests (VARC, DILR, QA individually).
-- ============================================================================

-- Enable sectional attempts for all published papers
UPDATE public.papers
SET 
    allow_sectional_attempts = TRUE,
    sectional_allowed_sections = ARRAY['VARC', 'DILR', 'QA']::text[],
    updated_at = NOW()
WHERE published = TRUE
  AND (allow_sectional_attempts IS NULL OR allow_sectional_attempts = FALSE);

-- Verify update
-- SELECT id, title, allow_sectional_attempts, sectional_allowed_sections
-- FROM public.papers
-- WHERE published = TRUE
-- LIMIT 10;
