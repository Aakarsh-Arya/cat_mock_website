-- Question Contexts Migration
-- This table stores shared passages/contexts that questions can reference

-- ============================================================================
-- QUESTION_CONTEXTS TABLE
-- ============================================================================
CREATE TABLE public.question_contexts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('VARC', 'DILR', 'QA')),
  title TEXT NOT NULL,                -- Descriptive title for admin
  text TEXT NOT NULL,                 -- The actual passage/context text
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add context_id to questions table
ALTER TABLE public.questions 
ADD COLUMN context_id UUID REFERENCES public.question_contexts(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX idx_question_contexts_paper_id ON public.question_contexts(paper_id);
CREATE INDEX idx_questions_context_id ON public.questions(context_id);

-- RLS Policies
ALTER TABLE public.question_contexts ENABLE ROW LEVEL SECURITY;

-- Anyone can read contexts (needed for exam display)
CREATE POLICY "Anyone can view question contexts" ON public.question_contexts
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (for admin)
CREATE POLICY "Authenticated users can insert contexts" ON public.question_contexts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contexts" ON public.question_contexts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger to update updated_at
CREATE TRIGGER update_question_contexts_updated_at
  BEFORE UPDATE ON public.question_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
