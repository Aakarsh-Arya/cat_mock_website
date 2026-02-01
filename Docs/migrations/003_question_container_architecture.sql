-- ============================================================================
-- MIGRATION: Question Container Architecture
-- ============================================================================
-- Purpose: Implement Parent-Child relationship for question sets
-- 
-- Architecture:
--   - question_sets (Parent): Contains context/passage for composite questions
--   - questions (Child): Individual questions linked to a set
--
-- Set Types:
--   - VARC: Reading Comprehension passages with 4-6 questions
--   - DILR: Data Interpretation / Logical Reasoning with charts/tables
--   - CASELET: Case-based questions with shared scenario
--   - ATOMIC: Single standalone question (Quant, standalone Logic)
--
-- Note: Atomic questions create a set with exactly 1 child question
--       This normalizes rendering logic across all question types
-- ============================================================================

-- ============================================================================
-- STEP 0: CLEANUP - Remove any partial objects from failed runs
-- ============================================================================
-- Use DO blocks to handle cases where objects don't exist

DO $$ 
BEGIN
    -- Drop triggers (may fail if tables don't exist)
    DROP TRIGGER IF EXISTS trg_update_question_set_count ON public.questions;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS trg_validate_question_set_publish ON public.question_sets;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop view
DROP VIEW IF EXISTS public.question_sets_with_questions;

-- Drop policies (ignore errors if table doesn't exist)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can read published question sets" ON public.question_sets;
    DROP POLICY IF EXISTS "Admins can manage question sets" ON public.question_sets;
EXCEPTION WHEN undefined_table THEN
    NULL; -- Table doesn't exist, skip
END $$;

-- Drop indexes (these are safe - IF EXISTS handles missing)
DROP INDEX IF EXISTS idx_questions_set_sequence;
DROP INDEX IF EXISTS idx_question_sets_paper_section;
DROP INDEX IF EXISTS idx_questions_set_id;
DROP INDEX IF EXISTS idx_question_sets_type;

-- Drop dependent views BEFORE altering columns they depend on
DROP VIEW IF EXISTS public.questions_exam CASCADE;
DROP VIEW IF EXISTS public.question_sets_with_questions CASCADE;

-- Remove columns from questions if they exist
ALTER TABLE public.questions DROP COLUMN IF EXISTS set_id;
ALTER TABLE public.questions DROP COLUMN IF EXISTS sequence_order;

-- Drop functions (will cascade to triggers)
DROP FUNCTION IF EXISTS update_question_set_count() CASCADE;
DROP FUNCTION IF EXISTS validate_question_set_publish() CASCADE;

-- Drop the table
DROP TABLE IF EXISTS public.question_sets CASCADE;

-- ============================================================================
-- STEP 1: Create question_sets table (Parent)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.question_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('VARC', 'DILR', 'QA')),
    
    -- Set classification
    set_type TEXT NOT NULL CHECK (set_type IN ('VARC', 'DILR', 'CASELET', 'ATOMIC')),
    
    -- Content Layout determines how to render the context
    -- Options: 'split_passage', 'split_chart', 'split_table', 'single_focus', 'image_top'
    content_layout TEXT NOT NULL DEFAULT 'single_focus',
    
    -- Context content (The passage, chart description, data table, or image)
    context_title TEXT,                      -- Optional title for the context (e.g., "Passage 1")
    context_body TEXT,                       -- Rich text / HTML / Markdown content
    context_image_url TEXT,                  -- Primary image (chart, diagram, table image)
    context_additional_images JSONB,         -- Additional images if needed [{url, caption}]
    
    -- Display configuration
    display_order INTEGER NOT NULL DEFAULT 1, -- Order within the section
    question_count INTEGER NOT NULL DEFAULT 0, -- Denormalized count of child questions
    
    -- Metadata for filtering, analytics, difficulty
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Example metadata structure:
    -- {
    --   "difficulty": "hard",
    --   "topic": "Reading Comprehension",
    --   "subtopic": "Inference",
    --   "tags": ["CAT-2024", "VARC", "RC"],
    --   "source": "CAT 2024 Slot 1",
    --   "estimated_time_minutes": 8
    -- }
    
    -- Publishing state
    is_active BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure unique ordering within section
    UNIQUE(paper_id, section, display_order)
);

-- ============================================================================
-- STEP 2: Alter questions table to add set relationship
-- ============================================================================

-- Add foreign key to question_sets
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS set_id UUID REFERENCES public.question_sets(id) ON DELETE CASCADE;

-- Add sequence order within the set (1, 2, 3... for questions in a passage)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 1;

-- Add constraint for unique sequence within a set
-- Note: Only applies when set_id is NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_set_sequence 
ON public.questions(set_id, sequence_order) 
WHERE set_id IS NOT NULL;

-- ============================================================================
-- STEP 3: Create helper function to update question_count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_question_set_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count on the affected set
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.question_sets 
        SET question_count = (
            SELECT COUNT(*) FROM public.questions WHERE set_id = NEW.set_id
        ),
        updated_at = NOW()
        WHERE id = NEW.set_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        UPDATE public.question_sets 
        SET question_count = (
            SELECT COUNT(*) FROM public.questions WHERE set_id = OLD.set_id
        ),
        updated_at = NOW()
        WHERE id = OLD.set_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic count updates
DROP TRIGGER IF EXISTS trg_update_question_set_count ON public.questions;
CREATE TRIGGER trg_update_question_set_count
AFTER INSERT OR UPDATE OF set_id OR DELETE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION update_question_set_count();

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

-- Index for fetching sets by paper and section
CREATE INDEX IF NOT EXISTS idx_question_sets_paper_section 
ON public.question_sets(paper_id, section, display_order);

-- Index for fetching questions by set
CREATE INDEX IF NOT EXISTS idx_questions_set_id 
ON public.questions(set_id, sequence_order);

-- Index for set_type filtering
CREATE INDEX IF NOT EXISTS idx_question_sets_type 
ON public.question_sets(set_type);

-- ============================================================================
-- STEP 5: Create view for complete question sets with questions
-- NOTE: This is a LEGACY view definition. The canonical hardened view is in
-- docs/MIGRATION_RLS_VIEWS.sql (Phase C) which adds:
--   - security_invoker = true
--   - is_published = TRUE filter
--   - published papers filter
--   - excludes sensitive columns (correct_answer, solution_*)
-- Run Phase C migration AFTER this one to overwrite with secure version.
-- ============================================================================
DROP VIEW IF EXISTS public.question_sets_with_questions CASCADE;

-- Placeholder: Phase C will create the canonical secure view
-- CREATE VIEW public.question_sets_with_questions ... (see MIGRATION_RLS_VIEWS.sql)

-- ============================================================================
-- STEP 6: RLS Policies for question_sets
-- ============================================================================

-- Enable RLS
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read published question sets" ON public.question_sets;
DROP POLICY IF EXISTS "Admins can manage question sets" ON public.question_sets;

-- Public can read published sets from published papers
CREATE POLICY "Anyone can read published question sets" ON public.question_sets
    FOR SELECT
    USING (
        is_active = TRUE 
        AND is_published = TRUE
        AND paper_id IN (SELECT id FROM public.papers WHERE published = TRUE)
    );

-- Admins can do everything
CREATE POLICY "Admins can manage question sets" ON public.question_sets
    FOR ALL
    USING (
        public.is_admin()
    );

-- ============================================================================
-- STEP 7: Validation function - Set cannot be published with 0 questions
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_question_set_publish()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check when publishing (is_published changing to TRUE)
    IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.is_published IS NULL) THEN
        -- Check if set has at least 1 question
        IF NEW.question_count = 0 THEN
            RAISE EXCEPTION 'Cannot publish question set with 0 questions. Set ID: %', NEW.id;
        END IF;
        
        -- For non-ATOMIC types, require context_body
        IF NEW.set_type != 'ATOMIC' AND (NEW.context_body IS NULL OR TRIM(NEW.context_body) = '') THEN
            RAISE EXCEPTION 'Cannot publish composite set without context body. Set ID: %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_question_set_publish ON public.question_sets;
CREATE TRIGGER trg_validate_question_set_publish
BEFORE UPDATE ON public.question_sets
FOR EACH ROW
EXECUTE FUNCTION validate_question_set_publish();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.question_sets IS 'Parent container for grouped questions (RC passages, DI sets, or atomic wrappers)';
COMMENT ON COLUMN public.question_sets.set_type IS 'VARC=Reading Comp, DILR=Data Interp, CASELET=Case Study, ATOMIC=Single Question';
COMMENT ON COLUMN public.question_sets.content_layout IS 'Rendering hint: split_passage, split_chart, single_focus, etc.';
COMMENT ON COLUMN public.question_sets.context_body IS 'The shared passage, chart description, or data for composite questions';
COMMENT ON COLUMN public.question_sets.metadata IS 'JSON with difficulty, topic, tags, source, estimated_time, etc.';
COMMENT ON COLUMN public.questions.set_id IS 'FK to parent question_set. NULL for legacy questions.';
COMMENT ON COLUMN public.questions.sequence_order IS 'Order of question within its set (1, 2, 3...)';
