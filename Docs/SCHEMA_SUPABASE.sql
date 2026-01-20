-- Supabase Database Schema for CAT Mocks
-- This schema defines the core data model for the CAT mock testing platform
-- Version: 2.0 - Production Ready

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,                    -- Profile picture URL
  target_percentile DECIMAL(5,2),     -- User's target CAT percentile (e.g., 99.5)
  target_iims TEXT[],                 -- Target IIMs array (e.g., ['IIM-A', 'IIM-B'])
  total_mocks_taken INTEGER DEFAULT 0,
  best_percentile DECIMAL(5,2),       -- Best percentile achieved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- PAPERS TABLE (exam papers)
-- ============================================================================
CREATE TABLE public.papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE,                   -- URL-friendly identifier (e.g., 'cat-2024-mock-1')
  title TEXT NOT NULL,
  description TEXT,                   -- Brief description of the paper
  year INTEGER NOT NULL,
  
  -- Question & Marking Configuration
  total_questions INTEGER NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 198,  -- CAT: 66 questions × 3 marks = 198
  
  -- Timing
  duration_minutes INTEGER NOT NULL DEFAULT 120, -- CAT 2024: 120 minutes total
  
  -- Section configuration as JSONB
  -- Format: [{"name": "VARC", "questions": 24, "time": 40, "marks": 72}, ...]
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Marking scheme (can be overridden per question)
  default_positive_marks DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  default_negative_marks DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  
  -- Publishing & Scheduling
  published BOOLEAN DEFAULT FALSE,
  available_from TIMESTAMP WITH TIME ZONE,  -- When paper becomes available
  available_until TIMESTAMP WITH TIME ZONE, -- When paper expires
  
  -- Metadata
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'cat-level')),
  is_free BOOLEAN DEFAULT TRUE,       -- For monetization later
  attempt_limit INTEGER,              -- NULL = unlimited attempts
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('VARC', 'DILR', 'QA')), -- CAT sections
  question_number INTEGER NOT NULL,
  
  -- Question content
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('MCQ', 'TITA')),
  options JSONB,                      -- For MCQ: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT NOT NULL,       -- For MCQ: "A"/"B"/"C"/"D", for TITA: exact answer
  
  -- Marking (per question override)
  positive_marks DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  negative_marks DECIMAL(3,1) NOT NULL DEFAULT 1.0, -- 0 for TITA questions
  
  -- Solution & Explanation
  solution_text TEXT,
  solution_image_url TEXT,
  video_solution_url TEXT,            -- YouTube/Vimeo link for video solutions
  
  -- Categorization
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT,                         -- e.g., 'Reading Comprehension', 'Arithmetic'
  subtopic TEXT,                      -- e.g., 'Inference', 'Percentages'
  
  -- Management
  is_active BOOLEAN DEFAULT TRUE,     -- Soft delete / hide questions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(paper_id, section, question_number)
);

-- ============================================================================
-- ATTEMPTS TABLE (user attempts at papers)
-- ============================================================================
CREATE TABLE public.attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,      -- When user clicked submit
  completed_at TIMESTAMP WITH TIME ZONE,      -- When scoring completed
  time_taken_seconds INTEGER,                  -- Actual time taken
  
  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'completed', 'abandoned')),
  current_section TEXT,
  current_question INTEGER DEFAULT 1,
  time_remaining JSONB,               -- {"VARC": 2400, "DILR": 2400, "QA": 2400}
  
  -- Scores (populated after submission)
  total_score DECIMAL(6,2),           -- Can be negative due to negative marking
  max_possible_score DECIMAL(6,2),    -- Usually 198 for CAT
  
  -- Detailed Analytics
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  unanswered_count INTEGER DEFAULT 0,
  
  accuracy DECIMAL(5,2),              -- (correct / attempted) * 100
  attempt_rate DECIMAL(5,2),          -- (attempted / total) * 100
  
  -- Section-wise scores
  section_scores JSONB,               -- {"VARC": {"score": 45, "correct": 15, "incorrect": 3, "unanswered": 6}}
  
  -- Ranking (populated by background job or trigger)
  percentile DECIMAL(5,2),            -- Percentile among all attempts on this paper
  rank INTEGER,                       -- Rank among all attempts on this paper
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- RESPONSES TABLE (user answers)
-- ============================================================================
CREATE TABLE public.responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  
  -- Answer data
  answer TEXT,                        -- User's answer (NULL = unanswered)
  is_correct BOOLEAN,                 -- Populated after submission
  marks_obtained DECIMAL(4,2),        -- +3, -1, or 0
  
  -- State tracking
  status TEXT DEFAULT 'not_visited' CHECK (status IN ('not_visited', 'visited', 'answered', 'marked', 'answered_marked')),
  is_marked_for_review BOOLEAN DEFAULT FALSE,
  
  -- Time analytics
  time_spent_seconds INTEGER DEFAULT 0,
  visit_count INTEGER DEFAULT 0,      -- How many times user visited this question
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(attempt_id, question_id)
);

-- ============================================================================
-- LEADERBOARD TABLE (for efficient ranking queries)
-- ============================================================================
CREATE TABLE public.leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE NOT NULL,
  
  score DECIMAL(6,2) NOT NULL,
  percentile DECIMAL(5,2),
  rank INTEGER,
  
  -- For filtering
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  UNIQUE(paper_id, user_id, attempt_id)
);

-- ============================================================================
-- ANALYTICS TABLE (for tracking user progress over time)
-- ============================================================================
CREATE TABLE public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Aggregate stats
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(6,2),
  average_percentile DECIMAL(5,2),
  best_score DECIMAL(6,2),
  best_percentile DECIMAL(5,2),
  
  -- Section-wise averages
  varc_average DECIMAL(5,2),
  dilr_average DECIMAL(5,2),
  qa_average DECIMAL(5,2),
  
  -- Weak areas (computed periodically)
  weak_topics JSONB,                  -- [{"topic": "Percentages", "accuracy": 45}, ...]
  strong_topics JSONB,
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_questions_paper_section ON public.questions(paper_id, section);
CREATE INDEX idx_questions_active ON public.questions(paper_id, is_active);
CREATE INDEX idx_attempts_user_status ON public.attempts(user_id, status);
CREATE INDEX idx_attempts_paper_score ON public.attempts(paper_id, total_score DESC);
CREATE INDEX idx_responses_attempt ON public.responses(attempt_id);
CREATE INDEX idx_leaderboard_paper_rank ON public.leaderboard(paper_id, rank);
CREATE INDEX idx_leaderboard_paper_percentile ON public.leaderboard(paper_id, percentile DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Papers policies (read-only for authenticated users, must be published AND within availability window)
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

-- Questions policies (active questions for papers that are available)
-- SECURITY NOTE: This policy allows SELECT on all columns including correct_answer.
-- Use the questions_exam view (defined below) for exam runtime to exclude correct_answer.
-- For result/solution views, use questions_with_answers view (admin or post-submission only).
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

-- Attempts policies
CREATE POLICY "Users can view their own attempts" ON public.attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" ON public.attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" ON public.attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Responses policies
CREATE POLICY "Users can view their own responses" ON public.responses
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.attempts WHERE id = attempt_id)
  );

CREATE POLICY "Users can create their own responses" ON public.responses
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.attempts WHERE id = attempt_id)
  );

CREATE POLICY "Users can update their own responses" ON public.responses
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.attempts WHERE id = attempt_id)
  );

-- Leaderboard policies (everyone can view, system inserts)
CREATE POLICY "Authenticated users can view leaderboard" ON public.leaderboard
  FOR SELECT TO authenticated USING (true);

-- User analytics policies
CREATE POLICY "Users can view their own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SECURE VIEWS (for column-level security)
-- ============================================================================

-- View for exam runtime: questions WITHOUT correct_answer, solution
-- Use this view in app code when fetching questions during an active exam
CREATE OR REPLACE VIEW public.questions_exam AS
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
-- This can be used after an attempt is completed
CREATE OR REPLACE VIEW public.questions_with_solutions AS
SELECT 
  q.id,
  q.paper_id,
  q.section,
  q.question_number,
  q.question_text,
  q.question_type,
  q.options,
  q.correct_answer,
  q.positive_marks,
  q.negative_marks,
  q.solution_text,
  q.solution_image_url,
  q.video_solution_url,
  q.difficulty,
  q.topic,
  q.subtopic
FROM public.questions q
WHERE q.is_active = true;

-- Grant access to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.questions_with_solutions TO authenticated;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_papers
  BEFORE UPDATE ON public.papers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_questions
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_attempts
  BEFORE UPDATE ON public.attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_responses
  BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SCORING FUNCTION (Called on exam submission)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.finalize_attempt(attempt_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_attempt RECORD;
  v_response RECORD;
  v_question RECORD;
  v_total_score DECIMAL(6,2) := 0;
  v_correct_count INTEGER := 0;
  v_incorrect_count INTEGER := 0;
  v_unanswered_count INTEGER := 0;
  v_section_scores JSONB := '{}'::jsonb;
  v_current_section TEXT;
  v_section_score DECIMAL(6,2);
  v_section_correct INTEGER;
  v_section_incorrect INTEGER;
  v_section_unanswered INTEGER;
  v_total_attempted INTEGER;
  v_total_questions INTEGER;
  v_accuracy DECIMAL(5,2);
  v_attempt_rate DECIMAL(5,2);
  v_max_score DECIMAL(6,2);
BEGIN
  -- Get the attempt
  SELECT * INTO v_attempt FROM public.attempts WHERE id = attempt_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Attempt not found');
  END IF;

  -- Get max possible score from paper
  SELECT total_marks INTO v_max_score FROM public.papers WHERE id = v_attempt.paper_id;

  -- Process each response
  FOR v_response IN 
    SELECT r.*, q.correct_answer, q.positive_marks, q.negative_marks, q.question_type, q.section
    FROM public.responses r
    JOIN public.questions q ON r.question_id = q.id
    WHERE r.attempt_id = attempt_id
  LOOP
    -- Determine if answer is correct
    IF v_response.answer IS NULL OR v_response.answer = '' THEN
      -- Unanswered
      v_unanswered_count := v_unanswered_count + 1;
      UPDATE public.responses 
      SET is_correct = NULL, marks_obtained = 0 
      WHERE id = v_response.id;
    ELSIF LOWER(TRIM(v_response.answer)) = LOWER(TRIM(v_response.correct_answer)) THEN
      -- Correct
      v_correct_count := v_correct_count + 1;
      v_total_score := v_total_score + v_response.positive_marks;
      UPDATE public.responses 
      SET is_correct = true, marks_obtained = v_response.positive_marks 
      WHERE id = v_response.id;
    ELSE
      -- Incorrect
      v_incorrect_count := v_incorrect_count + 1;
      -- TITA questions have no negative marking
      IF v_response.question_type = 'TITA' THEN
        UPDATE public.responses 
        SET is_correct = false, marks_obtained = 0 
        WHERE id = v_response.id;
      ELSE
        v_total_score := v_total_score - v_response.negative_marks;
        UPDATE public.responses 
        SET is_correct = false, marks_obtained = -v_response.negative_marks 
        WHERE id = v_response.id;
      END IF;
    END IF;
  END LOOP;

  -- Calculate section-wise scores
  FOR v_current_section IN SELECT DISTINCT section FROM public.questions WHERE paper_id = v_attempt.paper_id
  LOOP
    SELECT 
      COALESCE(SUM(CASE WHEN r.is_correct = true THEN q.positive_marks ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN r.is_correct = false AND q.question_type = 'MCQ' THEN q.negative_marks ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN r.is_correct = true THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN r.is_correct = false THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN r.is_correct IS NULL THEN 1 ELSE 0 END), 0)
    INTO v_section_score, v_section_correct, v_section_incorrect, v_section_unanswered
    FROM public.responses r
    JOIN public.questions q ON r.question_id = q.id
    WHERE r.attempt_id = attempt_id AND q.section = v_current_section;

    v_section_scores := v_section_scores || jsonb_build_object(
      v_current_section, jsonb_build_object(
        'score', v_section_score,
        'correct', v_section_correct,
        'incorrect', v_section_incorrect,
        'unanswered', v_section_unanswered
      )
    );
  END LOOP;

  -- Calculate accuracy and attempt rate
  v_total_attempted := v_correct_count + v_incorrect_count;
  v_total_questions := v_correct_count + v_incorrect_count + v_unanswered_count;
  
  IF v_total_attempted > 0 THEN
    v_accuracy := (v_correct_count::DECIMAL / v_total_attempted) * 100;
  ELSE
    v_accuracy := 0;
  END IF;
  
  IF v_total_questions > 0 THEN
    v_attempt_rate := (v_total_attempted::DECIMAL / v_total_questions) * 100;
  ELSE
    v_attempt_rate := 0;
  END IF;

  -- Update the attempt with final scores
  UPDATE public.attempts SET
    status = 'completed',
    submitted_at = COALESCE(submitted_at, NOW()),
    completed_at = NOW(),
    total_score = v_total_score,
    max_possible_score = v_max_score,
    correct_count = v_correct_count,
    incorrect_count = v_incorrect_count,
    unanswered_count = v_unanswered_count,
    accuracy = v_accuracy,
    attempt_rate = v_attempt_rate,
    section_scores = v_section_scores,
    time_taken_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
  WHERE id = attempt_id;

  -- Insert/update leaderboard entry
  INSERT INTO public.leaderboard (paper_id, user_id, attempt_id, score, submitted_at)
  VALUES (v_attempt.paper_id, v_attempt.user_id, attempt_id, v_total_score, NOW())
  ON CONFLICT (paper_id, user_id, attempt_id) 
  DO UPDATE SET score = v_total_score, submitted_at = NOW();

  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'total_score', v_total_score,
    'max_score', v_max_score,
    'correct', v_correct_count,
    'incorrect', v_incorrect_count,
    'unanswered', v_unanswered_count,
    'accuracy', v_accuracy,
    'attempt_rate', v_attempt_rate,
    'section_scores', v_section_scores
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERCENTILE CALCULATION FUNCTION (Run periodically or on-demand)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_percentiles(p_paper_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_attempts INTEGER;
  v_record RECORD;
  v_rank INTEGER := 0;
  v_prev_score DECIMAL(6,2) := NULL;
BEGIN
  -- Count total completed attempts for this paper
  SELECT COUNT(*) INTO v_total_attempts 
  FROM public.attempts 
  WHERE paper_id = p_paper_id AND status = 'completed';

  IF v_total_attempts = 0 THEN
    RETURN;
  END IF;

  -- Calculate rank and percentile for each attempt
  FOR v_record IN 
    SELECT id, total_score
    FROM public.attempts
    WHERE paper_id = p_paper_id AND status = 'completed'
    ORDER BY total_score DESC, completed_at ASC
  LOOP
    v_rank := v_rank + 1;
    
    UPDATE public.attempts SET
      rank = v_rank,
      percentile = ((v_total_attempts - v_rank)::DECIMAL / v_total_attempts) * 100
    WHERE id = v_record.id;
    
    -- Also update leaderboard
    UPDATE public.leaderboard SET
      rank = v_rank,
      percentile = ((v_total_attempts - v_rank)::DECIMAL / v_total_attempts) * 100
    WHERE attempt_id = v_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA: Sample CAT Mock Test
-- ============================================================================

-- Insert a sample CAT 2024 Mock Paper
INSERT INTO public.papers (
  slug, title, description, year, 
  total_questions, total_marks, duration_minutes, 
  sections, default_positive_marks, default_negative_marks,
  published, difficulty_level, is_free
) VALUES (
  'cat-2024-mock-1',
  'CAT 2024 Mock Test 1',
  'Full-length CAT mock test following the 2024 pattern with 66 questions across VARC, DILR, and QA sections.',
  2024,
  66, 198, 120,
  '[
    {"name": "VARC", "questions": 24, "time": 40, "marks": 72},
    {"name": "DILR", "questions": 20, "time": 40, "marks": 60},
    {"name": "QA", "questions": 22, "time": 40, "marks": 66}
  ]'::jsonb,
  3.0, 1.0,
  true, 'cat-level', true
);

-- Insert sample VARC questions
INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'VARC', 1,
  'Read the following passage and answer the question:\n\nThe rise of artificial intelligence has fundamentally altered our understanding of creativity. While machines can now compose music, write poetry, and create visual art, the question of whether this constitutes "true" creativity remains contentious.\n\nBased on the passage, the author''s primary purpose is to:',
  'MCQ',
  '["Argue that AI cannot be truly creative", "Present a debate about AI and creativity", "Prove that machines are superior to humans", "Dismiss concerns about artificial intelligence"]'::jsonb,
  'B', 3.0, 1.0, 'medium', 'Reading Comprehension', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'VARC', 2,
  'Choose the sentence that best completes the paragraph:\n\nThe company had been struggling for months. Revenue was declining, employees were leaving, and investor confidence was at an all-time low. ___________',
  'MCQ',
  '["Despite this, the CEO remained optimistic about the future.", "The weather that day was particularly pleasant.", "Similar companies in the industry were thriving.", "The stock market had been volatile for years."]'::jsonb,
  'A', 3.0, 1.0, 'easy', 'Para Completion', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

-- Insert sample DILR questions
INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'DILR', 1,
  'Study the following data and answer:\n\nFive friends A, B, C, D, and E are sitting in a row. A is to the left of B. C is to the right of D. E is not at any end. D is not adjacent to A.\n\nWho is sitting in the middle?',
  'MCQ',
  '["A", "B", "C", "E"]'::jsonb,
  'D', 3.0, 1.0, 'medium', 'Seating Arrangement', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'DILR', 2,
  'A set contains 6 elements. How many subsets of this set contain exactly 3 elements?',
  'TITA',
  NULL,
  '20', 3.0, 0.0, 'easy', 'Combinatorics', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

-- Insert sample QA questions
INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'QA', 1,
  'If the price of an item is increased by 20% and then decreased by 20%, what is the net percentage change in the price?',
  'MCQ',
  '["No change", "4% decrease", "4% increase", "2% decrease"]'::jsonb,
  'B', 3.0, 1.0, 'easy', 'Percentages', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'QA', 2,
  'Find the value of x if: log₂(x) + log₂(x-2) = 3',
  'TITA',
  NULL,
  '4', 3.0, 0.0, 'medium', 'Logarithms', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'QA', 3,
  'A train travels from station A to station B at 60 km/h and returns at 40 km/h. What is the average speed for the entire journey?',
  'MCQ',
  '["50 km/h", "48 km/h", "45 km/h", "52 km/h"]'::jsonb,
  'B', 3.0, 1.0, 'medium', 'Time Speed Distance', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

-- ============================================================================
-- MIGRATION SCRIPT (Run this to update existing database)
-- ============================================================================
-- To migrate an existing database, run these ALTER statements:
/*
-- Add missing columns to papers
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 198;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS default_positive_marks DECIMAL(3,1) DEFAULT 3.0;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS default_negative_marks DECIMAL(3,1) DEFAULT 1.0;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS available_from TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS available_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT TRUE;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS attempt_limit INTEGER;

-- Add missing columns to questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS positive_marks DECIMAL(3,1) DEFAULT 3.0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(3,1) DEFAULT 1.0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS video_solution_url TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS subtopic TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add missing columns to attempts
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS max_possible_score DECIMAL(6,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS unanswered_count INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS accuracy DECIMAL(5,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS attempt_rate DECIMAL(5,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS percentile DECIMAL(5,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS rank INTEGER;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS current_question INTEGER DEFAULT 1;

-- Add missing columns to responses
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS marks_obtained DECIMAL(4,2);
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_visited';
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;

-- Add missing columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_percentile DECIMAL(5,2);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_iims TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_mocks_taken INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS best_percentile DECIMAL(5,2);

-- Update status check constraint for attempts
ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_status_check;
ALTER TABLE public.attempts ADD CONSTRAINT attempts_status_check 
  CHECK (status IN ('in_progress', 'submitted', 'completed', 'abandoned'));

-- Update section check constraint for questions
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_section_check;
ALTER TABLE public.questions ADD CONSTRAINT questions_section_check 
  CHECK (section IN ('VARC', 'DILR', 'QA'));
*/