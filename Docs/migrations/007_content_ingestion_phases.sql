-- ============================================================================
-- MIGRATION: Content Ingestion Phases (0, 1, 2)
-- ============================================================================
-- Purpose: Implement robust export/import system with versioning
-- 
-- Phase 0: Export assembler function (export_paper_json)
-- Phase 1: Schema hardening (context types, question taxonomy)
-- Phase 2: Versioned ingestion tracking (paper_ingest_runs)
-- ============================================================================

-- ============================================================================
-- PHASE 0: EXPORT ASSEMBLER FUNCTION
-- ============================================================================
-- Creates a SQL function that assembles a complete paper JSON from normalized tables
-- Returns JSON matching docs/CONTENT-SCHEMA.md format
CREATE OR REPLACE FUNCTION public.export_paper_json(p_paper_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_paper RECORD;
    v_result jsonb;
    v_contexts jsonb;
    v_questions jsonb;
BEGIN
    -- Fetch paper metadata
    SELECT * INTO v_paper
    FROM public.papers
    WHERE id = p_paper_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Paper not found', 'paper_id', p_paper_id);
    END IF;

    -- Build contexts array (from question_contexts)
    -- Ordered by section (VARC, DILR, QA) then display_order for determinism
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', qc.id,
                'section', qc.section,
                'context_type', qc.context_type,
                'title', qc.title,
                'content', qc.content,
                'image_url', qc.image_url,
                'display_order', qc.display_order
            )
            ORDER BY 
                CASE qc.section 
                    WHEN 'VARC' THEN 1 
                    WHEN 'DILR' THEN 2 
                    WHEN 'QA' THEN 3 
                END,
                qc.display_order,
                qc.id
        ),
        '[]'::jsonb
    ) INTO v_contexts
    FROM public.question_contexts qc
    WHERE qc.paper_id = p_paper_id
      AND qc.is_active = TRUE;

    -- Build questions array
    -- Ordered by section, then question_number for determinism
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', q.id,
                'section', q.section,
                'question_number', q.question_number,
                'question_text', q.question_text,
                'question_type', q.question_type,
                'question_format', COALESCE(q.question_format, q.question_type),
                'taxonomy_type', q.taxonomy_type,
                'topic_tag', q.topic_tag,
                'difficulty_rationale', q.difficulty_rationale,
                'options', q.options,
                'correct_answer', q.correct_answer,
                'positive_marks', q.positive_marks,
                'negative_marks', q.negative_marks,
                'difficulty', q.difficulty,
                'topic', q.topic,
                'subtopic', q.subtopic,
                'solution_text', q.solution_text,
                'solution_image_url', q.solution_image_url,
                'video_solution_url', q.video_solution_url,
                'context_id', COALESCE(q.context_id, q.set_id),
                'sequence_order', q.sequence_order
            )
            ORDER BY 
                CASE q.section 
                    WHEN 'VARC' THEN 1 
                    WHEN 'DILR' THEN 2 
                    WHEN 'QA' THEN 3 
                END,
                q.question_number
        ),
        '[]'::jsonb
    ) INTO v_questions
    FROM public.questions q
    WHERE q.paper_id = p_paper_id
      AND q.is_active = TRUE;

    -- Build final result
    v_result := jsonb_build_object(
        'schema_version', 'v1.0',
        'exported_at', NOW(),
        'paper', jsonb_build_object(
            'id', v_paper.id,
            'slug', v_paper.slug,
            'title', v_paper.title,
            'description', v_paper.description,
            'year', v_paper.year,
            'total_questions', v_paper.total_questions,
            'total_marks', v_paper.total_marks,
            'duration_minutes', v_paper.duration_minutes,
            'sections', v_paper.sections,
            'default_positive_marks', v_paper.default_positive_marks,
            'default_negative_marks', v_paper.default_negative_marks,
            'difficulty_level', v_paper.difficulty_level,
            'is_free', v_paper.is_free,
            'published', v_paper.published,
            'available_from', v_paper.available_from,
            'available_until', v_paper.available_until,
            'allow_pause', v_paper.allow_pause,
            'attempt_limit', v_paper.attempt_limit,
            'created_at', v_paper.created_at,
            'updated_at', v_paper.updated_at
        ),
        'contexts', v_contexts,
        'questions', v_questions
    );

    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users (admin check happens in API layer)
GRANT EXECUTE ON FUNCTION public.export_paper_json(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_paper_json(uuid) TO service_role;

COMMENT ON FUNCTION public.export_paper_json IS 'Assembles complete paper JSON from normalized tables. Returns JSON matching CONTENT-SCHEMA.md format.';

-- ============================================================================
-- PHASE 1.1: CONTEXT TYPE ENUM EXPANSION
-- ============================================================================
-- Expand context_type to include: rc_passage, dilr_set, caselet, data_table, graph, other_shared_stimulus

-- Note: We use set_type on question_sets, but add a context_type column for explicit categorization
-- First, add the context_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'question_sets' 
        AND column_name = 'context_type'
    ) THEN
        ALTER TABLE public.question_sets 
        ADD COLUMN context_type TEXT;
    END IF;
END $$;

-- Add CHECK constraint for valid context types
ALTER TABLE public.question_sets 
DROP CONSTRAINT IF EXISTS question_sets_context_type_check;

ALTER TABLE public.question_sets
ADD CONSTRAINT question_sets_context_type_check 
CHECK (context_type IS NULL OR context_type IN (
    'rc_passage',           -- VARC reading comprehension passages
    'dilr_set',             -- DILR data/logical reasoning sets
    'caselet',              -- Case-based scenarios
    'data_table',           -- Explicit data tables
    'graph',                -- Charts, graphs, diagrams
    'other_shared_stimulus' -- Catch-all for other shared content
));

-- Migrate existing set_type to context_type where NULL
UPDATE public.question_sets
SET context_type = CASE set_type
    WHEN 'VARC' THEN 'rc_passage'
    WHEN 'DILR' THEN 'dilr_set'
    WHEN 'CASELET' THEN 'caselet'
    ELSE NULL
END
WHERE context_type IS NULL AND set_type != 'ATOMIC';

COMMENT ON COLUMN public.question_sets.context_type IS 'Explicit context categorization: rc_passage, dilr_set, caselet, data_table, graph, other_shared_stimulus';

-- ============================================================================
-- PHASE 1.2: QUESTION TAXONOMY COLUMNS
-- ============================================================================
-- Add question_format (MCQ|TITA) to separate from question_type (taxonomy)
-- Add topic_tag and difficulty_rationale columns

-- Add question_format column (MCQ or TITA)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'question_format'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN question_format TEXT;
    END IF;
END $$;

-- Add CHECK constraint for question_format
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_question_format_check;

ALTER TABLE public.questions
ADD CONSTRAINT questions_question_format_check 
CHECK (question_format IS NULL OR question_format IN ('MCQ', 'TITA'));

-- Add taxonomy_type column (the semantic question type like rc_inference, para_summary, etc.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'taxonomy_type'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN taxonomy_type TEXT;
    END IF;
END $$;

-- Add topic_tag column (finer-grained categorization)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'topic_tag'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN topic_tag TEXT;
    END IF;
END $$;

-- Add difficulty_rationale column (explanation for difficulty rating)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'difficulty_rationale'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN difficulty_rationale TEXT;
    END IF;
END $$;

-- Migrate existing question_type to question_format
UPDATE public.questions
SET question_format = question_type
WHERE question_format IS NULL AND question_type IN ('MCQ', 'TITA');

COMMENT ON COLUMN public.questions.question_format IS 'Answer format: MCQ or TITA (replaces old question_type semantics)';
COMMENT ON COLUMN public.questions.taxonomy_type IS 'Question taxonomy: rc_inference, para_summary, di_table_analysis, geometry_triangles, etc.';
COMMENT ON COLUMN public.questions.topic_tag IS 'Fine-grained topic tag for categorization and analytics';
COMMENT ON COLUMN public.questions.difficulty_rationale IS 'Optional explanation for the difficulty rating';

-- ============================================================================
-- PHASE 1.3: PARA SUMMARY CONSTRAINT
-- ============================================================================
-- Enforce: If taxonomy_type = 'para_summary' then set_id (context reference) must be NULL
-- Para summary questions should have their content in question_text, not as a shared context

CREATE OR REPLACE FUNCTION public.validate_para_summary_no_context()
RETURNS TRIGGER AS $$
BEGIN
    -- If taxonomy_type is para_summary, context (set_id) must be NULL
    -- Exception: ATOMIC sets are fine (they're just wrappers)
    IF NEW.taxonomy_type = 'para_summary' AND NEW.set_id IS NOT NULL THEN
        -- Check if the set is ATOMIC (wrapper) - that's allowed
        PERFORM 1 FROM public.question_sets 
        WHERE id = NEW.set_id AND set_type = 'ATOMIC';
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Para Summary questions must not reference a shared context. The paragraph belongs in question_text, not context_body. Question ID: %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_para_summary ON public.questions;
CREATE TRIGGER trg_validate_para_summary
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.validate_para_summary_no_context();

COMMENT ON FUNCTION public.validate_para_summary_no_context IS 'Enforces rule: Para Summary questions must have paragraph in question_text, not as shared context';

-- ============================================================================
-- PHASE 2.1: PAPER INGEST RUNS TABLE (Versioning)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paper_ingest_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
    
    -- Version tracking
    schema_version TEXT NOT NULL DEFAULT 'v1.0',
    version_number INTEGER NOT NULL DEFAULT 1,
    
    -- Source tracking
    raw_source_text TEXT,                    -- Original raw input (optional, for debugging)
    raw_source_hash TEXT,                    -- SHA256 hash of raw_source_text
    
    -- Canonical JSON snapshot
    canonical_paper_json JSONB NOT NULL,     -- The exact JSON that was imported
    canonical_json_hash TEXT NOT NULL,       -- SHA256 hash for deduplication
    
    -- Audit
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Notes
    import_notes TEXT,                       -- Optional notes about this import
    
    -- Ensure unique version numbers per paper
    UNIQUE(paper_id, version_number)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'schema_version'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN schema_version TEXT NOT NULL DEFAULT 'v1.0';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'version_number'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'raw_source_text'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN raw_source_text TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'raw_source_hash'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN raw_source_hash TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'canonical_paper_json'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN canonical_paper_json JSONB;
        ALTER TABLE public.paper_ingest_runs ALTER COLUMN canonical_paper_json SET NOT NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'canonical_json_hash'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN canonical_json_hash TEXT;
        ALTER TABLE public.paper_ingest_runs ALTER COLUMN canonical_json_hash SET NOT NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'import_notes'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN import_notes TEXT;
    END IF;
END $$;

DO $$
DECLARE
    v_table oid;
    v_paper_id_attnum int;
    v_version_num_attnum int;
BEGIN
    SELECT c.oid INTO v_table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'paper_ingest_runs';

    SELECT attnum INTO v_paper_id_attnum
    FROM pg_attribute WHERE attrelid = v_table AND attname = 'paper_id';

    SELECT attnum INTO v_version_num_attnum
    FROM pg_attribute WHERE attrelid = v_table AND attname = 'version_number';

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        WHERE c.conrelid = v_table
          AND c.contype = 'u'
          AND c.conkey = ARRAY[v_paper_id_attnum::smallint, v_version_num_attnum::smallint]
    ) THEN
        ALTER TABLE public.paper_ingest_runs
        ADD CONSTRAINT paper_ingest_runs_paper_version_unique UNIQUE (paper_id, version_number);
    END IF;
END $$;

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_paper_ingest_runs_paper_id ON public.paper_ingest_runs(paper_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_paper_ingest_runs_hash ON public.paper_ingest_runs(canonical_json_hash);

-- Add latest_ingest_run_id to papers table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'papers' 
        AND column_name = 'latest_ingest_run_id'
    ) THEN
        ALTER TABLE public.papers 
        ADD COLUMN latest_ingest_run_id UUID REFERENCES public.paper_ingest_runs(id);
    END IF;
END $$;

COMMENT ON TABLE public.paper_ingest_runs IS 'Stores versioned snapshots of imported paper JSON for audit and re-export';
COMMENT ON COLUMN public.paper_ingest_runs.canonical_paper_json IS 'Exact JSON as imported - used for export to recreate original';
COMMENT ON COLUMN public.paper_ingest_runs.canonical_json_hash IS 'SHA256 hash for detecting duplicate imports';
COMMENT ON COLUMN public.papers.latest_ingest_run_id IS 'Pointer to the most recent ingest run for quick export';

-- RLS for paper_ingest_runs
ALTER TABLE public.paper_ingest_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'paper_ingest_runs'
          AND policyname = 'Admins can manage ingest runs'
    ) THEN
        ALTER POLICY "Admins can manage ingest runs" ON public.paper_ingest_runs
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
    ELSE
        CREATE POLICY "Admins can manage ingest runs" ON public.paper_ingest_runs
            FOR ALL
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
    END IF;
END $$;

-- ============================================================================
-- PHASE 2.2: Helper function to get next version number
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_next_paper_version(p_paper_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
    FROM public.paper_ingest_runs
    WHERE paper_id = p_paper_id;
    
    RETURN v_next_version;
END;
$$;

-- ============================================================================
-- PHASE 2.3: Function to check if import would be duplicate
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_import_duplicate(p_paper_id uuid, p_json_hash text)
RETURNS TABLE(is_duplicate boolean, existing_run_id uuid, existing_version integer)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as is_duplicate,
        pir.id as existing_run_id,
        pir.version_number as existing_version
    FROM public.paper_ingest_runs pir
    WHERE pir.paper_id = p_paper_id
      AND pir.canonical_json_hash = p_json_hash
    ORDER BY pir.version_number DESC
    LIMIT 1;
    
    -- If no rows returned, return is_duplicate = FALSE
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::uuid, NULL::integer;
    END IF;
END;
$$;

-- ============================================================================
-- PHASE 2.4: Updated export function that prefers canonical snapshot
-- ============================================================================
CREATE OR REPLACE FUNCTION public.export_paper_json_versioned(
    p_paper_id uuid,
    p_ingest_run_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_canonical_json jsonb;
    v_run_id uuid;
BEGIN
    -- If specific run_id provided, use that
    IF p_ingest_run_id IS NOT NULL THEN
        SELECT canonical_paper_json INTO v_canonical_json
        FROM public.paper_ingest_runs
        WHERE id = p_ingest_run_id AND paper_id = p_paper_id;
        
        IF FOUND THEN
            RETURN v_canonical_json || jsonb_build_object('_ingest_run_id', p_ingest_run_id);
        END IF;
    END IF;
    
    -- Try to get latest ingest run
    SELECT pir.id, pir.canonical_paper_json INTO v_run_id, v_canonical_json
    FROM public.papers p
    LEFT JOIN public.paper_ingest_runs pir ON p.latest_ingest_run_id = pir.id
    WHERE p.id = p_paper_id;
    
    IF v_canonical_json IS NOT NULL THEN
        RETURN v_canonical_json || jsonb_build_object('_ingest_run_id', v_run_id);
    END IF;
    
    -- Fallback: assemble from current database state
    RETURN public.export_paper_json(p_paper_id) || jsonb_build_object(
        '_assembled_from_db', TRUE,
        '_note', 'No canonical snapshot found, assembled from current database state'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.export_paper_json_versioned(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_paper_json_versioned(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.export_paper_json_versioned IS 'Export paper JSON, preferring canonical snapshot from ingest run if available';

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- Phase 0 Complete:
--   ✓ export_paper_json(paper_id) - assembles paper from normalized tables
--   ✓ Deterministic ordering (section, then display_order/question_number)
--
-- Phase 1 Complete:
--   ✓ context_type column on question_sets with expanded enum
--   ✓ question_format (MCQ|TITA) separate from taxonomy_type
--   ✓ topic_tag and difficulty_rationale columns
--   ✓ Trigger to prevent para_summary questions from having shared context
--
-- Phase 2 Complete:
--   ✓ paper_ingest_runs table for version tracking
--   ✓ canonical_paper_json storage with hash deduplication
--   ✓ export_paper_json_versioned() prefers canonical snapshot
--   ✓ Helper functions for version management
--
-- ============================================================================
