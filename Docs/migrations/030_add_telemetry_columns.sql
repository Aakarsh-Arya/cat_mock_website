-- ============================================================================
-- Migration 030: Add Telemetry & Granular Difficulty Columns
-- ============================================================================
-- Purpose:
--   Add lightweight JSONB columns for behavioral telemetry without new tables,
--   plus granular timing fields for question difficulty logic.
-- ============================================================================

-- 1) Store behavioral replay data per attempt
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS telemetry_log JSONB DEFAULT '[]'::jsonb;

-- 2) Track answer switching / timeline events per response
ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS answer_history JSONB DEFAULT '[]'::jsonb;

-- 3) Add granular timing to questions
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS ideal_time_seconds INTEGER DEFAULT 180;

-- Optional: finer difficulty ranking (if needed later)
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS difficulty_index INTEGER;

-- ============================================================================
-- Verification
-- ============================================================================
-- \d public.attempts
-- \d public.responses
-- \d public.questions
