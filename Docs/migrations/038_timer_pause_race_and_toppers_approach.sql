-- =============================================================================
-- Migration 038: Timer Pause Race Hardening + Toppers Approach
-- =============================================================================
-- Purpose:
-- 1) Add questions.toppers_approach for dual-solution support.
-- 2) Include toppers_approach in fetch_attempt_solutions RPC.
-- 3) Harden save_attempt_state so paused attempts are immutable from late writes.
--
-- Why this is needed:
-- During back/pause flows, in-flight progress requests can arrive after status='paused'.
-- If save_attempt_state accepts paused writes, time_remaining can be reduced after pause.
-- This migration makes paused writes a no-op, preventing timer loss on resume.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Add toppers_approach column
-- -----------------------------------------------------------------------------
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS toppers_approach TEXT;

COMMENT ON COLUMN public.questions.toppers_approach IS
'Alternative strategy-focused explanation shown as "Toppers Approach" in analytics/review.';

-- -----------------------------------------------------------------------------
-- 2) Update results RPC to return toppers_approach
-- -----------------------------------------------------------------------------
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
                    'toppers_approach', q.toppers_approach,
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

-- -----------------------------------------------------------------------------
-- 3) Harden save_attempt_state against paused-write timer loss
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.save_attempt_state(UUID, JSONB, TEXT, INT, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION public.save_attempt_state(
    p_attempt_id UUID,
    p_time_remaining JSONB,
    p_current_section TEXT,
    p_current_question INT,
    p_client_now TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt record;
    v_stored_time_remaining JSONB;
    v_new_varc INT;
    v_new_dilr INT;
    v_new_qa INT;
    v_stored_varc INT;
    v_stored_dilr INT;
    v_stored_qa INT;
    v_tolerance INT := 5;
BEGIN
    SELECT id, user_id, status, time_remaining, current_section, current_question
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Critical hardening: once paused, do not mutate timer/progress from late writes.
    IF v_attempt.status = 'paused' THEN
        RETURN jsonb_build_object(
            'attempt_id', p_attempt_id,
            'time_remaining', COALESCE(v_attempt.time_remaining, '{}'::jsonb),
            'current_section', COALESCE(v_attempt.current_section, p_current_section),
            'current_question', COALESCE(v_attempt.current_question, p_current_question),
            'last_activity_at', NOW(),
            'ignored', TRUE,
            'reason', 'attempt_paused'
        );
    END IF;

    IF v_attempt.status <> 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress' USING ERRCODE = '42501';
    END IF;

    v_stored_time_remaining := v_attempt.time_remaining;

    v_new_varc := COALESCE((p_time_remaining->>'VARC')::INT, 0);
    v_new_dilr := COALESCE((p_time_remaining->>'DILR')::INT, 0);
    v_new_qa   := COALESCE((p_time_remaining->>'QA')::INT, 0);

    v_stored_varc := COALESCE((v_stored_time_remaining->>'VARC')::INT, 0);
    v_stored_dilr := COALESCE((v_stored_time_remaining->>'DILR')::INT, 0);
    v_stored_qa   := COALESCE((v_stored_time_remaining->>'QA')::INT, 0);

    IF v_new_varc > v_stored_varc + v_tolerance
       OR v_new_dilr > v_stored_dilr + v_tolerance
       OR v_new_qa > v_stored_qa + v_tolerance THEN
        RAISE EXCEPTION 'Invalid timer state: time cannot increase' USING ERRCODE = '42501';
    END IF;

    v_new_varc := GREATEST(0, LEAST(v_new_varc, v_stored_varc));
    v_new_dilr := GREATEST(0, LEAST(v_new_dilr, v_stored_dilr));
    v_new_qa   := GREATEST(0, LEAST(v_new_qa, v_stored_qa));

    UPDATE public.attempts
    SET
        time_remaining = jsonb_build_object(
            'VARC', v_new_varc,
            'DILR', v_new_dilr,
            'QA',   v_new_qa
        ),
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'time_remaining', jsonb_build_object('VARC', v_new_varc, 'DILR', v_new_dilr, 'QA', v_new_qa),
        'current_section', p_current_section,
        'current_question', p_current_question,
        'last_activity_at', NOW()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.save_attempt_state(UUID, JSONB, TEXT, INT, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_attempt_state(UUID, JSONB, TEXT, INT, TIMESTAMPTZ) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_attempt_state(UUID, JSONB, TEXT, INT, TIMESTAMPTZ) TO authenticated;

-- =============================================================================
-- Verification (run manually)
-- =============================================================================
-- 1) SELECT toppers_approach FROM public.questions LIMIT 1;
-- 2) SELECT public.fetch_attempt_solutions('<submitted-attempt-id>');
-- 3) Pause an in_progress attempt, then call save_attempt_state => should return ignored=true.
-- =============================================================================