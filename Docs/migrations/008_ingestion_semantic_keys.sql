-- ==============================================================================
-- Migration 008: Semantic Keys for Content Ingestion (Upsert Support)
-- ==============================================================================
-- Purpose: Add semantic keys to enable idempotent imports via upserts
-- Author: System
-- Date: 2025-01-XX
-- Dependencies: 007_content_ingestion_phases.sql
-- 
-- This migration adds:
--   1. papers.paper_key (unique business key for papers)
--   2. question_sets.client_set_id (unique per paper)
--   3. questions.client_question_id (unique per paper)
--   4. Composite unique indexes for upsert operations
--   5. Upsert-enabled import functions
-- ==============================================================================

-- ============================================================================
-- STEP 1: Add Semantic Key Columns (Safe if they exist)
-- ============================================================================

-- papers.paper_key - Global unique identifier for papers (e.g., "cat-2024-slot-1")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'papers' AND column_name = 'paper_key'
    ) THEN
        ALTER TABLE papers ADD COLUMN paper_key TEXT;
        COMMENT ON COLUMN papers.paper_key IS 'Unique business key for the paper (e.g., cat-2024-slot-1). Used for upserts.';
    END IF;
END $$;

-- question_sets.client_set_id - Unique within a paper (e.g., "VARC_RC_1", "ATOMIC_QA_45")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'question_sets' AND column_name = 'client_set_id'
    ) THEN
        ALTER TABLE question_sets ADD COLUMN client_set_id TEXT;
        COMMENT ON COLUMN question_sets.client_set_id IS 'Client-provided unique ID within paper (e.g., VARC_RC_1). Used for v3 imports.';
    END IF;
END $$;

-- questions.client_question_id - Unique within a paper (e.g., "Q1", "Q2")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'client_question_id'
    ) THEN
        ALTER TABLE questions ADD COLUMN client_question_id TEXT;
        COMMENT ON COLUMN questions.client_question_id IS 'Client-provided unique ID within paper (e.g., Q1, Q2). Used for v3 imports.';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Create Unique Indexes for Upsert Support
-- ============================================================================

-- papers.paper_key must be globally unique
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'papers_paper_key_unique'
    ) THEN
        CREATE UNIQUE INDEX papers_paper_key_unique ON papers (paper_key) WHERE paper_key IS NOT NULL;
    END IF;
END $$;

-- question_sets.client_set_id must be unique within a paper
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'question_sets_paper_client_set_id_unique'
    ) THEN
        CREATE UNIQUE INDEX question_sets_paper_client_set_id_unique 
            ON question_sets (paper_id, client_set_id) 
            WHERE client_set_id IS NOT NULL;
    END IF;
END $$;

-- questions.client_question_id must be unique within a paper
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'questions_paper_client_question_id_unique'
    ) THEN
        -- Deferred until after backfill to avoid duplicate conflicts
        NULL;
    END IF;
END $$;


-- ============================================================================
-- STEP 3: Backfill Existing Records with Semantic Keys
-- ============================================================================

-- Backfill papers.paper_key from slug (if not already set)
UPDATE papers 
SET paper_key = slug 
WHERE paper_key IS NULL AND slug IS NOT NULL;

-- Backfill question_sets.client_set_id using set_type + ROW_NUMBER within paper
-- This ensures uniqueness even when multiple sets have same display_order
WITH numbered_sets AS (
    SELECT 
        id,
        UPPER(set_type) || '_' || LPAD(ROW_NUMBER() OVER (
            PARTITION BY paper_id 
            ORDER BY 
                CASE section WHEN 'VARC' THEN 1 WHEN 'DILR' THEN 2 WHEN 'QA' THEN 3 END,
                display_order,
                created_at,
                id
        )::TEXT, 3, '0') AS new_client_set_id
    FROM question_sets
    WHERE client_set_id IS NULL
)
UPDATE question_sets qs
SET client_set_id = ns.new_client_set_id
FROM numbered_sets ns
WHERE qs.id = ns.id;

-- Backfill questions.client_question_id using "Q" + question_number
WITH question_ids AS (
    SELECT
        id,
        paper_id,
        client_question_id,
        row_number() OVER (
            PARTITION BY paper_id
            ORDER BY question_number, created_at, id
        ) AS seq,
        row_number() OVER (
            PARTITION BY paper_id, COALESCE(client_question_id, '__NULL__')
            ORDER BY question_number, created_at, id
        ) AS rn,
        count(*) OVER (
            PARTITION BY paper_id, COALESCE(client_question_id, '__NULL__')
        ) AS cnt
    FROM questions
)
UPDATE questions q
SET client_question_id = CASE
    WHEN q.client_question_id IS NULL THEN 'Q' || LPAD(qi.seq::TEXT, 3, '0')
    WHEN qi.cnt > 1 THEN q.client_question_id || '_' || qi.rn::TEXT
    ELSE q.client_question_id
END
FROM question_ids qi
WHERE q.id = qi.id
  AND (q.client_question_id IS NULL OR qi.cnt > 1);

-- Now create unique index for questions after backfill
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'questions_paper_client_question_id_unique'
    ) THEN
        CREATE UNIQUE INDEX questions_paper_client_question_id_unique 
            ON questions (paper_id, client_question_id) 
            WHERE client_question_id IS NOT NULL;
    END IF;
END $$;


-- ============================================================================
-- STEP 4: Upsert Functions for v3 Importer
-- ============================================================================

-- Upsert a question_set by (paper_id, client_set_id)
CREATE OR REPLACE FUNCTION upsert_question_set(
    p_paper_id UUID,
    p_client_set_id TEXT,
    p_section TEXT,
    p_set_type TEXT,
    p_context_type TEXT DEFAULT NULL,
    p_content_layout TEXT DEFAULT 'text_only',
    p_context_title TEXT DEFAULT NULL,
    p_context_body TEXT DEFAULT NULL,
    p_context_image_url TEXT DEFAULT NULL,
    p_context_additional_images JSONB DEFAULT NULL,
    p_display_order INT DEFAULT 0,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_set_id UUID;
BEGIN
    -- Try update first
    UPDATE question_sets SET
        section = p_section,
        set_type = p_set_type,
        context_type = p_context_type,
        content_layout = p_content_layout,
        context_title = p_context_title,
        context_body = p_context_body,
        context_image_url = p_context_image_url,
        context_additional_images = p_context_additional_images,
        display_order = p_display_order,
        is_active = p_is_active,
        metadata = p_metadata,
        updated_at = NOW()
    WHERE paper_id = p_paper_id AND client_set_id = p_client_set_id
    RETURNING id INTO v_set_id;
    
    -- If no update, insert
    IF v_set_id IS NULL THEN
        INSERT INTO question_sets (
            id, paper_id, client_set_id, section, set_type, context_type,
            content_layout, context_title, context_body, context_image_url,
            context_additional_images, display_order, is_active, metadata
        ) VALUES (
            gen_random_uuid(), p_paper_id, p_client_set_id, p_section, p_set_type, p_context_type,
            p_content_layout, p_context_title, p_context_body, p_context_image_url,
            p_context_additional_images, p_display_order, p_is_active, p_metadata
        )
        RETURNING id INTO v_set_id;
    END IF;
    
    RETURN v_set_id;
END;
$$;

-- Upsert a question by (paper_id, client_question_id)
CREATE OR REPLACE FUNCTION upsert_question(
    p_paper_id UUID,
    p_client_question_id TEXT,
    p_set_id UUID,
    p_section TEXT,
    p_question_number INT,
    p_sequence_order INT,
    p_question_text TEXT,
    p_question_type TEXT,
    p_question_format TEXT DEFAULT NULL,
    p_taxonomy_type TEXT DEFAULT NULL,
    p_topic_tag TEXT DEFAULT NULL,
    p_difficulty_rationale TEXT DEFAULT NULL,
    p_options JSONB DEFAULT NULL,
    p_correct_answer TEXT DEFAULT NULL,
    p_positive_marks NUMERIC DEFAULT 3.0,
    p_negative_marks NUMERIC DEFAULT 1.0,
    p_difficulty TEXT DEFAULT NULL,
    p_topic TEXT DEFAULT NULL,
    p_subtopic TEXT DEFAULT NULL,
    p_solution_text TEXT DEFAULT NULL,
    p_solution_image_url TEXT DEFAULT NULL,
    p_video_solution_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_question_id UUID;
BEGIN
    -- Try update first
    UPDATE questions SET
        set_id = p_set_id,
        section = p_section,
        question_number = p_question_number,
        sequence_order = p_sequence_order,
        question_text = p_question_text,
        question_type = p_question_type,
        question_format = COALESCE(p_question_format, p_question_type),
        taxonomy_type = p_taxonomy_type,
        topic_tag = p_topic_tag,
        difficulty_rationale = p_difficulty_rationale,
        options = p_options,
        correct_answer = p_correct_answer,
        positive_marks = p_positive_marks,
        negative_marks = p_negative_marks,
        difficulty = p_difficulty,
        topic = p_topic,
        subtopic = p_subtopic,
        solution_text = p_solution_text,
        solution_image_url = p_solution_image_url,
        video_solution_url = p_video_solution_url,
        updated_at = NOW()
    WHERE paper_id = p_paper_id AND client_question_id = p_client_question_id
    RETURNING id INTO v_question_id;
    
    -- If no update, insert
    IF v_question_id IS NULL THEN
        INSERT INTO questions (
            id, paper_id, client_question_id, set_id, section, question_number,
            sequence_order, question_text, question_type, question_format,
            taxonomy_type, topic_tag, difficulty_rationale, options, correct_answer,
            positive_marks, negative_marks, difficulty, topic, subtopic,
            solution_text, solution_image_url, video_solution_url
        ) VALUES (
            gen_random_uuid(), p_paper_id, p_client_question_id, p_set_id, p_section, p_question_number,
            p_sequence_order, p_question_text, p_question_type, COALESCE(p_question_format, p_question_type),
            p_taxonomy_type, p_topic_tag, p_difficulty_rationale, p_options, p_correct_answer,
            p_positive_marks, p_negative_marks, p_difficulty, p_topic, p_subtopic,
            p_solution_text, p_solution_image_url, p_video_solution_url
        )
        RETURNING id INTO v_question_id;
    END IF;
    
    RETURN v_question_id;
END;
$$;


-- ============================================================================
-- STEP 5: Lookup Functions for Semantic Keys
-- ============================================================================

-- Get question_set.id by (paper_id, client_set_id)
CREATE OR REPLACE FUNCTION get_set_id_by_client_id(
    p_paper_id UUID,
    p_client_set_id TEXT
) RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT id FROM question_sets 
    WHERE paper_id = p_paper_id AND client_set_id = p_client_set_id;
$$;

-- Get question.id by (paper_id, client_question_id)
CREATE OR REPLACE FUNCTION get_question_id_by_client_id(
    p_paper_id UUID,
    p_client_question_id TEXT
) RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT id FROM questions 
    WHERE paper_id = p_paper_id AND client_question_id = p_client_question_id;
$$;


-- ============================================================================
-- STEP 6: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION upsert_question_set TO service_role;
GRANT EXECUTE ON FUNCTION upsert_question TO service_role;
GRANT EXECUTE ON FUNCTION get_set_id_by_client_id TO service_role;
GRANT EXECUTE ON FUNCTION get_question_id_by_client_id TO service_role;


-- ============================================================================
-- STEP 7: V3 Export Function (Sets-First Format)
-- ============================================================================
-- Export function that outputs Schema v3.0 format for content creation context

CREATE OR REPLACE FUNCTION public.export_paper_json_v3(p_paper_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_paper RECORD;
    v_result jsonb;
    v_question_sets jsonb;
    v_questions jsonb;
BEGIN
    -- Fetch paper metadata
    SELECT * INTO v_paper
    FROM public.papers
    WHERE id = p_paper_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Paper not found', 'paper_id', p_paper_id);
    END IF;

    -- Build question_sets array (sets-first)
    -- Ordered by section (VARC, DILR, QA) then display_order for determinism
    WITH sets AS (
        SELECT
            qs.*,
            COALESCE(
                qs.client_set_id,
                UPPER(qs.set_type) || '_' || LPAD(ROW_NUMBER() OVER (
                    PARTITION BY qs.paper_id
                    ORDER BY 
                        CASE qs.section WHEN 'VARC' THEN 1 WHEN 'DILR' THEN 2 WHEN 'QA' THEN 3 END,
                        qs.display_order,
                        qs.id
                )::TEXT, 3, '0')
            ) AS computed_client_set_id
        FROM public.question_sets qs
        WHERE qs.paper_id = p_paper_id
          AND qs.is_active = TRUE
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'client_set_id', sets.computed_client_set_id,
                'section', sets.section,
                'set_type', sets.set_type,
                'context_type', sets.context_type,
                'content_layout', COALESCE(sets.content_layout, 'text_only'),
                'context_title', sets.context_title,
                'context_body', sets.context_body,
                'context_image_url', sets.context_image_url,
                'context_additional_images', sets.context_additional_images,
                'display_order', sets.display_order,
                'is_active', sets.is_active,
                'metadata', COALESCE(sets.metadata, '{}'::jsonb)
            )
            ORDER BY 
                CASE sets.section 
                    WHEN 'VARC' THEN 1 
                    WHEN 'DILR' THEN 2 
                    WHEN 'QA' THEN 3 
                END,
                sets.display_order,
                sets.id
        ),
        '[]'::jsonb
    ) INTO v_question_sets
    FROM sets;

    -- Build questions array with set_ref linking
    -- Ordered by section, then question_number for determinism
    WITH sets AS (
        SELECT
            qs.id,
            COALESCE(
                qs.client_set_id,
                UPPER(qs.set_type) || '_' || LPAD(ROW_NUMBER() OVER (
                    PARTITION BY qs.paper_id
                    ORDER BY 
                        CASE qs.section WHEN 'VARC' THEN 1 WHEN 'DILR' THEN 2 WHEN 'QA' THEN 3 END,
                        qs.display_order,
                        qs.id
                )::TEXT, 3, '0')
            ) AS computed_client_set_id
        FROM public.question_sets qs
        WHERE qs.paper_id = p_paper_id
          AND qs.is_active = TRUE
    ), qrows AS (
        SELECT
            q.*,
            sets.computed_client_set_id AS computed_set_ref
        FROM public.questions q
        LEFT JOIN sets ON sets.id = q.set_id
        WHERE q.paper_id = p_paper_id
          AND q.is_active = TRUE
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'client_question_id', COALESCE(q.client_question_id, 'Q' || q.question_number::TEXT),
                'set_ref', COALESCE(q.computed_set_ref, 'ATOMIC_' || LPAD(q.question_number::TEXT, 3, '0')),
                'section', q.section,
                'question_number', q.question_number,
                'sequence_order', COALESCE(q.sequence_order, 1),
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
                'video_solution_url', q.video_solution_url
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
    FROM qrows q;

    -- Build final result in Schema v3.0 format
    v_result := jsonb_build_object(
        'schema_version', 'v3.0',
        'exported_at', NOW(),
        'paper', jsonb_build_object(
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
            'allow_pause', v_paper.allow_pause,
            'attempt_limit', v_paper.attempt_limit,
            'paper_key', COALESCE(v_paper.paper_key, v_paper.slug)
        ),
        'question_sets', v_question_sets,
        'questions', v_questions
    );

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.export_paper_json_v3(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_paper_json_v3(uuid) TO service_role;

COMMENT ON FUNCTION public.export_paper_json_v3 IS 'Exports paper in Schema v3.0 sets-first format. Use for content creation context.';


-- ============================================================================
-- ROLLBACK SCRIPT (Run manually if needed)
-- ============================================================================
/*
-- Drop functions
DROP FUNCTION IF EXISTS export_paper_json_v3;
DROP FUNCTION IF EXISTS upsert_question_set;
DROP FUNCTION IF EXISTS upsert_question;
DROP FUNCTION IF EXISTS get_set_id_by_client_id;
DROP FUNCTION IF EXISTS get_question_id_by_client_id;

-- Drop indexes
DROP INDEX IF EXISTS papers_paper_key_unique;
DROP INDEX IF EXISTS question_sets_paper_client_set_id_unique;
DROP INDEX IF EXISTS questions_paper_client_question_id_unique;

-- Drop columns (CAREFUL - data loss!)
ALTER TABLE papers DROP COLUMN IF EXISTS paper_key;
ALTER TABLE question_sets DROP COLUMN IF EXISTS client_set_id;
ALTER TABLE questions DROP COLUMN IF EXISTS client_question_id;
*/
