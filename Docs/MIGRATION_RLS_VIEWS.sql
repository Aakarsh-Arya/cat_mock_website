-- ============================================================================
-- MIGRATION: Update RLS Policies + Add Secure Views
-- Run this on an EXISTING database to apply the new security changes
-- Version: 2.1 - RLS & Views Update
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP OLD POLICIES (if they exist)
-- ============================================================================

-- Drop old papers policy
DROP POLICY IF EXISTS "Authenticated users can view published papers" ON public.papers;
DROP POLICY IF EXISTS "Authenticated users can view available papers" ON public.papers;

-- Drop old questions policy
DROP POLICY IF EXISTS "Authenticated users can view active questions" ON public.questions;
DROP POLICY IF EXISTS "Users can read questions for their completed attempts" ON public.questions;

-- ============================================================================
-- STEP 2: CREATE UPDATED RLS POLICIES
-- ============================================================================

-- Papers: Now checks published + availability window
CREATE POLICY "Authenticated users can view available papers" ON public.papers
  FOR SELECT TO authenticated 
  USING (
    -- Admins can see everything
    public.is_admin()
    OR (
      -- Published papers within availability window
      published = true
      AND (available_from IS NULL OR available_from <= NOW())
      AND (available_until IS NULL OR available_until >= NOW())
    )
  );

-- Questions: Only allow reads after submission/completion (prevents in-progress leaks)
CREATE POLICY "Users can read questions for their completed attempts" ON public.questions
  FOR SELECT TO authenticated 
  USING (
    is_active = true
    AND paper_id IN (
      SELECT paper_id FROM public.attempts
      WHERE user_id = auth.uid()
        AND status IN ('submitted', 'completed')
        AND submitted_at IS NOT NULL
    )
  );

-- ============================================================================
-- STEP 3: CREATE SECURE VIEWS
-- ============================================================================

-- Drop views if they exist (for idempotent migration)
DROP VIEW IF EXISTS public.questions_exam CASCADE;
DROP VIEW IF EXISTS public.questions_with_solutions CASCADE;

-- ============================================================================
-- NOTE: questions_exam view is created in STEP 4.5 with security_invoker
-- This ensures RLS policies are enforced when querying through the view
-- ============================================================================

-- View for results/solutions: questions WITH answers (for post-submission review)
-- NOTE: This view is NOT granted to any role - use fetch_attempt_solutions RPC instead
CREATE VIEW public.questions_with_solutions AS
SELECT 
  id,
  paper_id,
  section,
  question_number,
  question_text,
  question_type,
  options,
  correct_answer,
  positive_marks,
  negative_marks,
  question_image_url,
  solution_text,
  solution_image_url,
  video_solution_url,
  context_id,
  set_id,
  sequence_order,
  difficulty,
  topic,
  subtopic
FROM public.questions
WHERE is_active = true;

-- Do NOT grant solutions view to authenticated users; results must use RPC
REVOKE ALL ON public.questions_with_solutions FROM PUBLIC;
REVOKE ALL ON public.questions_with_solutions FROM anon;
REVOKE ALL ON public.questions_with_solutions FROM authenticated;

-- ============================================================================
-- STEP 3.5: COLUMN-LEVEL LOCKDOWN (Pattern A - required)
-- Prevent direct SELECT of sensitive fields from public.questions
-- NOTE: After revokes, SELECT * on public.questions by authenticated will fail.
-- Runtime must use public.questions_exam; solutions must use RPC.
-- ============================================================================

REVOKE SELECT (correct_answer, solution_text, solution_image_url, video_solution_url)
ON public.questions FROM PUBLIC;
REVOKE SELECT (correct_answer, solution_text, solution_image_url, video_solution_url)
ON public.questions FROM anon;
REVOKE SELECT (correct_answer, solution_text, solution_image_url, video_solution_url)
ON public.questions FROM authenticated;

-- ============================================================================
-- STEP 4: question_sets_with_questions safe view (published only + no answers)
-- ============================================================================

-- Drop and recreate to ensure it excludes sensitive fields and enforces published-only
DROP VIEW IF EXISTS public.question_sets_with_questions CASCADE;

CREATE VIEW public.question_sets_with_questions
WITH (security_invoker = true)
AS
SELECT 
    qs.id,
    qs.paper_id,
    qs.section,
    qs.set_type,
    qs.content_layout,
    qs.context_title,
    qs.context_body,
    qs.context_image_url,
    qs.context_additional_images,
    qs.display_order,
    qs.question_count,
    qs.metadata,
    qs.is_active,
    qs.is_published,
    qs.created_at,
    qs.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', q.id,
                'question_text', q.question_text,
                'question_type', q.question_type,
                'options', q.options,
                'positive_marks', q.positive_marks,
                'negative_marks', q.negative_marks,
                'question_number', q.question_number,
                'sequence_order', q.sequence_order,
                'question_image_url', q.question_image_url,
                'difficulty', q.difficulty,
                'topic', q.topic,
                'subtopic', q.subtopic,
                'is_active', q.is_active
                -- EXCLUDED: correct_answer, solution_text, solution_image_url, video_solution_url
            ) ORDER BY q.sequence_order
        ) FILTER (WHERE q.id IS NOT NULL),
        '[]'::json
    ) AS questions
FROM public.question_sets qs
LEFT JOIN public.questions q ON q.set_id = qs.id AND q.is_active = TRUE
WHERE qs.is_active = TRUE
  AND qs.is_published = TRUE
  AND qs.paper_id IN (SELECT id FROM public.papers WHERE published = TRUE)
GROUP BY qs.id;

-- Grant SELECT to authenticated only
REVOKE ALL ON public.question_sets_with_questions FROM PUBLIC;
REVOKE ALL ON public.question_sets_with_questions FROM anon;
GRANT SELECT ON public.question_sets_with_questions TO authenticated;

-- ============================================================================
-- STEP 4.5: Recreate questions_exam with security_invoker (Postgres 15+)
-- ============================================================================

DROP VIEW IF EXISTS public.questions_exam CASCADE;

CREATE VIEW public.questions_exam
WITH (security_invoker = true)
AS
SELECT 
  id,
  paper_id,
  section,
  question_number,
  question_text,
  question_type,
  options,
  positive_marks,
  negative_marks,
  question_image_url,
  context_id,
  set_id,
  sequence_order,
  difficulty,
  topic,
  subtopic,
  is_active,
  created_at,
  updated_at
  -- EXCLUDED: correct_answer, solution_text, solution_image_url, video_solution_url
FROM public.questions
WHERE is_active = true;

-- Grant SELECT to authenticated only
REVOKE ALL ON public.questions_exam FROM PUBLIC;
REVOKE ALL ON public.questions_exam FROM anon;
GRANT SELECT ON public.questions_exam TO authenticated;

-- ============================================================================
-- STEP 5: VERIFY MIGRATION
-- ============================================================================
-- Run these queries to verify the migration worked:

-- Check policies exist:
-- SELECT policyname FROM pg_policies WHERE tablename IN ('papers', 'questions');

-- Check views exist:
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'public';

-- Test questions_exam doesn't have correct_answer:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'questions_exam';

-- -----------------------------------------------------------------------------
-- VERIFICATION SQL (Answer Leak Prevention) — RUN IN SUPABASE SQL EDITOR
-- -----------------------------------------------------------------------------

-- TEST 1: Direct SELECT on sensitive columns MUST FAIL (column privilege denied)
-- As authenticated user (not service role):
-- SELECT correct_answer FROM public.questions LIMIT 1;
-- Expected: ERROR permission denied for column correct_answer

-- TEST 2: SELECT * on public.questions MUST FAIL
-- As authenticated user:
-- SELECT * FROM public.questions LIMIT 1;
-- Expected: ERROR permission denied (due to column revokes)

-- TEST 3: Safe view questions_exam works for in-progress attempts
-- As authenticated user with an in_progress attempt:
-- SELECT id, question_text, options FROM public.questions_exam WHERE paper_id = '<your_paper_id>' LIMIT 1;
-- Expected: SUCCESS, returns question without correct_answer

-- TEST 4: Safe view question_sets_with_questions works for published sets
-- As authenticated user:
-- SELECT id, context_title, questions FROM public.question_sets_with_questions WHERE paper_id = '<your_paper_id>' LIMIT 1;
-- Expected: SUCCESS, returns set with questions (no correct_answer in nested JSON)

-- TEST 5: RPC fetch_attempt_solutions works for completed attempts
-- As authenticated user with a submitted attempt:
-- SELECT public.fetch_attempt_solutions('<your_attempt_id>');
-- Expected: SUCCESS, returns JSON with correct_answer, solution_text, etc.

-- TEST 6: RPC fetch_attempt_solutions FAILS for in_progress attempts
-- As authenticated user with an in_progress attempt:
-- SELECT public.fetch_attempt_solutions('<your_in_progress_attempt_id>');
-- Expected: ERROR Attempt not submitted

-- ============================================================================
-- DONE! The migration is complete.
-- Run in Supabase SQL Editor as EXTERNAL WORK.
-- ============================================================================
