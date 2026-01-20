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

-- ============================================================================
-- STEP 2: CREATE UPDATED RLS POLICIES
-- ============================================================================

-- Papers: Now checks published + availability window
CREATE POLICY "Authenticated users can view available papers" ON public.papers
  FOR SELECT TO authenticated 
  USING (
    -- Admins can see everything
    auth.uid() IN (SELECT id FROM public.users WHERE email LIKE '%@admin%')
    OR (
      -- Published papers within availability window
      published = true
      AND (available_from IS NULL OR available_from <= NOW())
      AND (available_until IS NULL OR available_until >= NOW())
    )
  );

-- Questions: Now checks parent paper is available too
CREATE POLICY "Authenticated users can view active questions" ON public.questions
  FOR SELECT TO authenticated 
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.papers p
      WHERE p.id = paper_id
      AND p.published = true
      AND (p.available_from IS NULL OR p.available_from <= NOW())
      AND (p.available_until IS NULL OR p.available_until >= NOW())
    )
  );

-- ============================================================================
-- STEP 3: CREATE SECURE VIEWS
-- ============================================================================

-- Drop views if they exist (for idempotent migration)
DROP VIEW IF EXISTS public.questions_exam;
DROP VIEW IF EXISTS public.questions_with_solutions;

-- View for exam runtime: questions WITHOUT correct_answer, solution
-- Use this view in app code when fetching questions during an active exam
CREATE VIEW public.questions_exam AS
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
  difficulty,
  topic,
  subtopic,
  is_active,
  created_at,
  updated_at
  -- EXCLUDED: correct_answer, solution_text, solution_image_url, video_solution_url
FROM public.questions
WHERE is_active = true;

-- Grant access to authenticated users
GRANT SELECT ON public.questions_exam TO authenticated;

-- View for results/solutions: questions WITH answers (for post-submission review)
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
  solution_text,
  solution_image_url,
  video_solution_url,
  difficulty,
  topic,
  subtopic
FROM public.questions
WHERE is_active = true;

-- Grant access to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.questions_with_solutions TO authenticated;

-- ============================================================================
-- STEP 4: VERIFY MIGRATION
-- ============================================================================
-- Run these queries to verify the migration worked:

-- Check policies exist:
-- SELECT policyname FROM pg_policies WHERE tablename IN ('papers', 'questions');

-- Check views exist:
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'public';

-- Test questions_exam doesn't have correct_answer:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'questions_exam';

-- ============================================================================
-- DONE! The migration is complete.
-- ============================================================================
