-- ============================================================================
-- MIGRATION: Peer Statistics RPC Function
-- Creates a secure function to calculate option-level statistics for papers
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP EXISTING FUNCTION (if exists)
-- ============================================================================
DROP FUNCTION IF EXISTS public.get_paper_stats(UUID);

-- ============================================================================
-- STEP 2: CREATE THE STATS FUNCTION
-- ============================================================================
-- Returns aggregated response statistics for a given paper
-- Output format: { [questionId]: { total: number, options: { [optionLabel]: count } } }
-- Security: SECURITY DEFINER ensures the function runs with definer's privileges
-- Only aggregates from 'completed' attempts to ensure data integrity

CREATE OR REPLACE FUNCTION public.get_paper_stats(p_paper_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    result JSONB := '{}'::JSONB;
    rec RECORD;
    question_stats JSONB;
    option_counts JSONB;
BEGIN
    -- Validate input
    IF p_paper_id IS NULL THEN
        RETURN '{}'::JSONB;
    END IF;

    -- Verify paper exists and user has access (paper must be published)
    IF NOT EXISTS (
        SELECT 1 FROM papers 
        WHERE id = p_paper_id 
        AND published = true
    ) THEN
        RETURN '{}'::JSONB;
    END IF;

    -- Aggregate responses for completed attempts only
    FOR rec IN (
        SELECT 
            r.question_id,
            r.answer,
            COUNT(*) as answer_count
        FROM responses r
        INNER JOIN attempts a ON a.id = r.attempt_id
        WHERE a.paper_id = p_paper_id
        AND a.status = 'completed'
        AND r.answer IS NOT NULL
        AND r.answer != ''
        GROUP BY r.question_id, r.answer
        ORDER BY r.question_id, r.answer
    )
    LOOP
        -- Get existing stats for this question or initialize
        question_stats := COALESCE(result->rec.question_id::TEXT, '{"total": 0, "options": {}}'::JSONB);
        option_counts := COALESCE(question_stats->'options', '{}'::JSONB);
        
        -- Update total and option count
        question_stats := jsonb_set(
            question_stats,
            '{total}',
            to_jsonb((question_stats->>'total')::INT + rec.answer_count::INT)
        );
        
        option_counts := jsonb_set(
            option_counts,
            ARRAY[rec.answer],
            to_jsonb(rec.answer_count::INT)
        );
        
        question_stats := jsonb_set(question_stats, '{options}', option_counts);
        
        -- Update result
        result := jsonb_set(result, ARRAY[rec.question_id::TEXT], question_stats);
    END LOOP;

    RETURN result;
END;
$$;

-- ============================================================================
-- STEP 3: GRANT PERMISSIONS
-- ============================================================================
-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.get_paper_stats(UUID) TO authenticated;

-- ============================================================================
-- STEP 4: CREATE INDEX FOR PERFORMANCE (if not exists)
-- ============================================================================
-- Index on responses(question_id) for faster aggregation
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);

-- Index on attempts(paper_id, status) for faster filtering
CREATE INDEX IF NOT EXISTS idx_attempts_paper_status ON public.attempts(paper_id, status);

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the function works:

-- Check function exists:
-- SELECT proname FROM pg_proc WHERE proname = 'get_paper_stats';

-- Test with a paper_id (replace with actual UUID):
-- SELECT get_paper_stats('your-paper-uuid-here');

-- ============================================================================
-- DONE! The migration is complete.
-- ============================================================================
