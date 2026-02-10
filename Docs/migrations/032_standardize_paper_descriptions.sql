-- ============================================================================
-- Migration 032: Standardize Paper Descriptions
-- ============================================================================
-- Purpose:
--   Set a consistent, user-facing description across all papers.
--
-- Template:
--   Full-length simulation of <title>. Experience the actual exam interface
--   with detailed solutions and advanced performance analytics.
--
-- Note:
--   If your table is named `exams` with `exam_title`, replace:
--     public.papers -> public.exams
--     title         -> exam_title
-- ============================================================================

UPDATE public.papers
SET
    description = 'Full-length simulation of '
        || COALESCE(NULLIF(BTRIM(title), ''), 'this mock test')
        || '. Experience the actual exam interface with detailed solutions and advanced performance analytics.',
    updated_at = NOW();

