-- ============================================================================
-- Migration 033: NexAI Prompt + Result Text Columns
-- ============================================================================
-- Purpose:
--   1) Store user customization prompt when requesting NexAI insight.
--   2) Store admin-provided finalized NexAI insight text per attempt.
--   3) Track when an insight is marked processed.
--
-- Notes:
--   - Idempotent via IF NOT EXISTS.
--   - No RLS policy widening required.
-- ============================================================================

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_user_prompt TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_result_text TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_processed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.attempts.ai_analysis_user_prompt IS
    'Optional user customization prompt submitted at NexAI insight request time.';

COMMENT ON COLUMN public.attempts.ai_analysis_result_text IS
    'Final NexAI insight text pasted by admin for this attempt.';

COMMENT ON COLUMN public.attempts.ai_analysis_processed_at IS
    'Timestamp when ai_analysis_result_text was last saved and status moved to processed.';

