-- Supabase Database Schema for CAT Mocks
-- This schema defines the core data model for the CAT mock testing platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Papers table (exam papers)
CREATE TABLE public.papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 180, -- 3 hours for CAT
  sections JSONB, -- Array of section objects with name, questions count, time
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Questions table
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL, -- 'VAR', 'DILR', 'QA', 'LR'
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('MCQ', 'TITA')),
  options JSONB, -- For MCQ: array of option texts
  correct_answer TEXT, -- For MCQ: option index, for TITA: correct text
  solution_text TEXT,
  solution_image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(paper_id, section, question_number)
);

-- Attempts table (user attempts at papers)
CREATE TABLE public.attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_section TEXT,
  time_remaining JSONB, -- Time remaining per section
  total_score DECIMAL(5,2),
  section_scores JSONB, -- Scores per section
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(user_id, paper_id) -- One attempt per user per paper
);

-- Responses table (user answers)
CREATE TABLE public.responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  answer TEXT, -- User's answer
  is_marked_for_review BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(attempt_id, question_id)
);

-- Indexes for performance
CREATE INDEX idx_questions_paper_section ON public.questions(paper_id, section);
CREATE INDEX idx_attempts_user_status ON public.attempts(user_id, status);
CREATE INDEX idx_responses_attempt ON public.responses(attempt_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Papers policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view papers" ON public.papers
  FOR SELECT TO authenticated USING (true);

-- Questions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view questions" ON public.questions
  FOR SELECT TO authenticated USING (true);

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

-- Functions for triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
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
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();