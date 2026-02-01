-- =============================================================================
-- MILESTONE 5: Results & Analytics Engine - Database Migration
-- =============================================================================
-- 
-- This migration adds necessary columns for the scoring engine and analytics.
-- EXECUTE IN SUPABASE SQL EDITOR
--
-- Prerequisites:
--   - Tables: attempts, responses, questions must exist
--   - You must have admin/service_role access
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: Attempts Table Enhancements
-- -----------------------------------------------------------------------------

-- Add scoring and analytics columns to attempts table
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS total_score DECIMAL(6,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_possible_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unanswered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accuracy DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attempt_rate DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS percentile DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT NULL;

-- Add submitted_at if not exists (completed exam timestamp)
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN public.attempts.total_score IS 'Final calculated score after applying marking scheme';
COMMENT ON COLUMN public.attempts.max_possible_score IS 'Maximum possible score for the paper';
COMMENT ON COLUMN public.attempts.section_scores IS 'JSONB with section-wise breakdown: {VARC: {score, correct, incorrect, unanswered}, ...}';
COMMENT ON COLUMN public.attempts.accuracy IS 'Percentage of attempted questions that were correct';
COMMENT ON COLUMN public.attempts.attempt_rate IS 'Percentage of total questions that were attempted';
COMMENT ON COLUMN public.attempts.percentile IS 'Percentile rank among all attempts on this paper';
COMMENT ON COLUMN public.attempts.rank IS 'Absolute rank among all attempts on this paper';

-- -----------------------------------------------------------------------------
-- SECTION 2: Responses Table Enhancements
-- -----------------------------------------------------------------------------

-- Add per-question scoring columns to responses table
ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS marks_obtained DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS answer TEXT DEFAULT NULL;

-- Comment on columns
COMMENT ON COLUMN public.responses.is_correct IS 'Whether the response was correct (null if unanswered)';
COMMENT ON COLUMN public.responses.marks_obtained IS 'Points awarded/deducted for this response';
COMMENT ON COLUMN public.responses.answer IS 'Unified answer field (selected_option or tita_answer)';

-- -----------------------------------------------------------------------------
-- SECTION 3: Questions Table - Ensure Required Columns
-- -----------------------------------------------------------------------------

-- Ensure questions table has all required columns for scoring
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS section VARCHAR(20) DEFAULT 'QA',
ADD COLUMN IF NOT EXISTS question_type VARCHAR(10) DEFAULT 'MCQ',
ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(3,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS correct_answer TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS solution_text TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS topic VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Medium';

-- Add check constraints (drop first if exists to avoid errors)
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_section_check;
    ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_type_check;
    
    -- Add constraints
    ALTER TABLE public.questions 
    ADD CONSTRAINT questions_section_check CHECK (section IN ('VARC', 'DILR', 'QA'));
    
    ALTER TABLE public.questions 
    ADD CONSTRAINT questions_type_check CHECK (question_type IN ('MCQ', 'TITA'));
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Constraints may already exist or table structure differs: %', SQLERRM;
END $$;

COMMENT ON COLUMN public.questions.section IS 'CAT section: VARC, DILR, or QA';
COMMENT ON COLUMN public.questions.question_type IS 'MCQ (Multiple Choice) or TITA (Type In The Answer)';
COMMENT ON COLUMN public.questions.marks IS 'Positive marks for correct answer (CAT: 3)';
COMMENT ON COLUMN public.questions.negative_marks IS 'Negative marks for incorrect MCQ (CAT: 1)';

-- -----------------------------------------------------------------------------
-- SECTION 4: Indexes for Performance
-- -----------------------------------------------------------------------------

-- Index for leaderboard queries (ranking by score)
CREATE INDEX IF NOT EXISTS idx_attempts_total_score 
ON public.attempts (total_score DESC NULLS LAST);

-- Composite index for paper-specific leaderboards
CREATE INDEX IF NOT EXISTS idx_attempts_paper_score 
ON public.attempts (paper_id, total_score DESC NULLS LAST);

-- Index for user's attempt history
CREATE INDEX IF NOT EXISTS idx_attempts_user_status 
ON public.attempts (user_id, status, submitted_at DESC);

-- Index for responses by attempt (for result page)
CREATE INDEX IF NOT EXISTS idx_responses_attempt 
ON public.responses (attempt_id);

-- Index for questions by paper (for scoring)
CREATE INDEX IF NOT EXISTS idx_questions_paper_section 
ON public.questions (paper_id, section, question_number);

-- -----------------------------------------------------------------------------
-- SECTION 5: RLS Policies for Scoring Updates
-- -----------------------------------------------------------------------------

-- Drop and recreate policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can update own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can update own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can read questions for their completed attempts" ON public.questions;

-- Allow authenticated users to update their own attempts
CREATE POLICY "Users can update own attempts"
ON public.attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
  AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
  AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
);

-- Allow authenticated users to update their own responses
CREATE POLICY "Users can update own responses"
ON public.responses FOR UPDATE
TO authenticated
USING (
  attempt_id IN (
    SELECT id FROM public.attempts WHERE user_id = auth.uid()
  )
);

-- Allow reading questions for completed attempts (for result page)
-- Note: correct_answer is needed for result display but should be protected during exam
CREATE POLICY "Users can read questions for their completed attempts"
ON public.questions FOR SELECT
TO authenticated
USING (
  paper_id IN (
    SELECT paper_id FROM public.attempts 
    WHERE user_id = auth.uid()
      AND status IN ('submitted', 'completed')
      AND submitted_at IS NOT NULL
  )
);

-- -----------------------------------------------------------------------------
-- SECTION 5.5: Legacy scoring cleanup (optional, after verification)
-- -----------------------------------------------------------------------------
-- If TypeScript scoring is the single source of truth, retire legacy DB scoring.
-- Checklist before dropping:
-- 1) Confirm no API route, trigger, or cron calls public.finalize_attempt
-- 2) Confirm results page uses fetch_attempt_solutions RPC + questions_exam
-- 3) Confirm scoring happens only in TypeScript submit path
--
-- DROP FUNCTION IF EXISTS public.finalize_attempt(UUID);

-- -----------------------------------------------------------------------------
-- SECTION 6: Verification Queries
-- -----------------------------------------------------------------------------

-- Run these after migration to verify columns exist:

-- Check attempts table columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'attempts' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check responses table columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'responses' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check questions table columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'questions' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- -----------------------------------------------------------------------------
-- VERIFICATION SQL (RLS safety check)
-- -----------------------------------------------------------------------------
-- 1) Should return rows for a submitted/completed attempt:
-- SELECT q.id
-- FROM public.questions q
-- WHERE q.paper_id IN (
--   SELECT paper_id FROM public.attempts
--   WHERE user_id = auth.uid()
--     AND status IN ('submitted','completed')
--     AND submitted_at IS NOT NULL
-- );

-- 2) Should return 0 rows for an in_progress attempt:
-- SELECT q.id
-- FROM public.questions q
-- WHERE q.paper_id IN (
--   SELECT paper_id FROM public.attempts
--   WHERE user_id = auth.uid()
--     AND status = 'in_progress'
-- );

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
