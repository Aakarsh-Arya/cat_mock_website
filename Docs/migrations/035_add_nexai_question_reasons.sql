-- ============================================================================
-- Migration 035: Persist NexAI Per-Question Performance Reasons
-- ============================================================================
-- Purpose:
--   Store the "Reason for Performance" tags selected in Mirror View so they can
--   be included in the NexAI export packet at request time.
--
-- Column:
--   attempts.ai_analysis_question_reasons JSONB
--   Shape: { "<question_id>": "concept_gap" | "careless_error" | "time_pressure" | "guess" }
-- ============================================================================

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_question_reasons JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.attempts.ai_analysis_question_reasons IS
    'Snapshot of per-question performance reasons captured when NexAI insight is requested.';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'attempts_ai_analysis_question_reasons_is_object'
    ) THEN
        ALTER TABLE public.attempts
        ADD CONSTRAINT attempts_ai_analysis_question_reasons_is_object
        CHECK (jsonb_typeof(ai_analysis_question_reasons) = 'object');
    END IF;
END $$;

-- Optional verification:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'attempts'
--   AND column_name = 'ai_analysis_question_reasons';
