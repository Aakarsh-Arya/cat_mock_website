-- =============================================================================
-- MILESTONE 6: Results Gating RPC (Step 0.95)
-- =============================================================================
-- Adds a SECURITY DEFINER RPC to safely return solution fields for completed attempts
-- EXECUTE IN SUPABASE SQL EDITOR
-- =============================================================================

-- Drop existing function to allow updates
DROP FUNCTION IF EXISTS public.fetch_attempt_solutions(uuid);

CREATE FUNCTION public.fetch_attempt_solutions(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt record;
BEGIN
    SELECT id, user_id, status, submitted_at, paper_id
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status NOT IN ('submitted', 'completed') OR v_attempt.submitted_at IS NULL THEN
        RAISE EXCEPTION 'Attempt not submitted' USING ERRCODE = '42501';
    END IF;

    RETURN (
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'question_id', q.id,
                    'correct_answer', q.correct_answer,
                    'solution_text', q.solution_text,
                    'solution_image_url', q.solution_image_url,
                    'video_solution_url', q.video_solution_url
                )
                ORDER BY q.section, q.question_number
            ),
            '[]'::jsonb
        )
        FROM public.questions q
        WHERE q.paper_id = v_attempt.paper_id
          AND q.is_active = true
    );
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_attempt_solutions(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_attempt_solutions(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.fetch_attempt_solutions(uuid) TO authenticated;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
