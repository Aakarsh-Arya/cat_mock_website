-- =============================================================================
-- Migration 037: New tracking columns + multi AI insight requests
-- =============================================================================
-- Adds:
--   responses: time_per_visit (JSONB), user_note (TEXT)
--   attempts:  visit_order (JSONB), ai_analysis_request_count (INT),
--              ai_analysis_request_history (JSONB)
-- =============================================================================

-- --------------------------------------------------------------------------
-- 1. Responses table: per-visit timing and user notes
-- --------------------------------------------------------------------------
ALTER TABLE public.responses
    ADD COLUMN IF NOT EXISTS time_per_visit JSONB DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS user_note TEXT DEFAULT '';

COMMENT ON COLUMN public.responses.time_per_visit IS 'Array of seconds spent on each individual visit to this question';
COMMENT ON COLUMN public.responses.user_note IS 'User personal note for this question (max 50 words, client-enforced)';

-- --------------------------------------------------------------------------
-- 2. Attempts table: visit order per section
-- --------------------------------------------------------------------------
ALTER TABLE public.attempts
    ADD COLUMN IF NOT EXISTS visit_order JSONB DEFAULT '{"VARC":[],"DILR":[],"QA":[]}'::JSONB;

COMMENT ON COLUMN public.attempts.visit_order IS 'Per-section ordered log of question IDs visited (may repeat)';

-- --------------------------------------------------------------------------
-- 3. Attempts table: multi AI insight request tracking
-- --------------------------------------------------------------------------
ALTER TABLE public.attempts
    ADD COLUMN IF NOT EXISTS ai_analysis_request_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ai_analysis_request_history JSONB DEFAULT '[]'::JSONB;

COMMENT ON COLUMN public.attempts.ai_analysis_request_count IS 'Total number of AI insight requests made by the user';
COMMENT ON COLUMN public.attempts.ai_analysis_request_history IS 'History log of all AI insight requests [{request_number, user_prompt, question_reasons, requested_at, status}]';

-- --------------------------------------------------------------------------
-- 4. Index for admin queries counting AI requests
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_attempts_ai_request_count
    ON public.attempts (ai_analysis_request_count)
    WHERE ai_analysis_request_count > 0;
