-- =============================================================================
-- MIGRATION 005: Attempt State Lockdown (Phase B Step 2.25)
-- =============================================================================
-- Prevents direct PostgREST mutation of server-authoritative fields.
-- All progress updates must go through the save_attempt_state RPC.
-- EXECUTE IN SUPABASE SQL EDITOR
-- =============================================================================

-- =============================================================================
-- STEP 1: Revoke UPDATE on server-authoritative columns from authenticated
-- =============================================================================
-- These columns can only be modified via SECURITY DEFINER functions.

REVOKE UPDATE (time_remaining, current_section, current_question, 
               last_activity_at, session_token)
ON public.attempts FROM authenticated;

-- Note: status, submitted_at, completed_at are already protected by RLS policy
-- in 002_session_locking.sql that requires they remain unchanged on UPDATE.

-- =============================================================================
-- STEP 2: Create save_attempt_state RPC (SECURITY DEFINER)
-- =============================================================================
-- Server-side only function for updating attempt progress.
-- Validates ownership and prevents time inflation.

DROP FUNCTION IF EXISTS public.save_attempt_state(uuid, jsonb, text, int, timestamptz);

CREATE OR REPLACE FUNCTION public.save_attempt_state(
    p_attempt_id uuid,
    p_time_remaining jsonb,
    p_current_section text,
    p_current_question int,
    p_client_now timestamptz DEFAULT NOW()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt record;
    v_stored_time_remaining jsonb;
    v_new_varc int;
    v_new_dilr int;
    v_new_qa int;
    v_stored_varc int;
    v_stored_dilr int;
    v_stored_qa int;
    v_tolerance int := 5; -- 5 second tolerance for network latency
BEGIN
    -- Fetch current attempt state
    SELECT id, user_id, status, time_remaining, started_at, paper_id
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate attempt exists
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    -- Validate ownership
    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Validate status
    IF v_attempt.status <> 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress' USING ERRCODE = '42501';
    END IF;

    -- Extract time values
    v_stored_time_remaining := v_attempt.time_remaining;
    
    v_new_varc := COALESCE((p_time_remaining->>'VARC')::int, 0);
    v_new_dilr := COALESCE((p_time_remaining->>'DILR')::int, 0);
    v_new_qa := COALESCE((p_time_remaining->>'QA')::int, 0);
    
    v_stored_varc := COALESCE((v_stored_time_remaining->>'VARC')::int, 0);
    v_stored_dilr := COALESCE((v_stored_time_remaining->>'DILR')::int, 0);
    v_stored_qa := COALESCE((v_stored_time_remaining->>'QA')::int, 0);

    -- Validate time_remaining cannot increase beyond stored + tolerance
    IF v_new_varc > v_stored_varc + v_tolerance 
       OR v_new_dilr > v_stored_dilr + v_tolerance 
       OR v_new_qa > v_stored_qa + v_tolerance THEN
        RAISE EXCEPTION 'Invalid timer state: time cannot increase' USING ERRCODE = '42501';
    END IF;

    -- Clamp to valid bounds (0 to stored value)
    v_new_varc := GREATEST(0, LEAST(v_new_varc, v_stored_varc));
    v_new_dilr := GREATEST(0, LEAST(v_new_dilr, v_stored_dilr));
    v_new_qa := GREATEST(0, LEAST(v_new_qa, v_stored_qa));

    -- Update the attempt
    UPDATE public.attempts
    SET 
        time_remaining = jsonb_build_object(
            'VARC', v_new_varc,
            'DILR', v_new_dilr,
            'QA', v_new_qa
        ),
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    -- Return updated state
    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'time_remaining', jsonb_build_object(
            'VARC', v_new_varc,
            'DILR', v_new_dilr,
            'QA', v_new_qa
        ),
        'current_section', p_current_section,
        'current_question', p_current_question,
        'last_activity_at', NOW()
    );
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.save_attempt_state(uuid, jsonb, text, int, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_attempt_state(uuid, jsonb, text, int, timestamptz) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_attempt_state(uuid, jsonb, text, int, timestamptz) TO authenticated;

-- =============================================================================
-- STEP 3: Create pause_exam_state RPC (SECURITY DEFINER)
-- =============================================================================
-- Dedicated RPC for pausing exams with server-calculated time.

DROP FUNCTION IF EXISTS public.pause_exam_state(uuid, text, int);

CREATE OR REPLACE FUNCTION public.pause_exam_state(
    p_attempt_id uuid,
    p_current_section text,
    p_current_question int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt record;
    v_paper record;
    v_elapsed_seconds int;
    v_section_durations jsonb;
    v_varc_duration int;
    v_dilr_duration int;
    v_qa_duration int;
    v_remaining_elapsed int;
    v_calc_varc int;
    v_calc_dilr int;
    v_calc_qa int;
BEGIN
    -- Fetch attempt
    SELECT id, user_id, status, started_at, paper_id
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status <> 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress' USING ERRCODE = '42501';
    END IF;

    -- Fetch paper to check allow_pause and get section durations
    SELECT id, allow_pause, sections
    INTO v_paper
    FROM public.papers
    WHERE id = v_attempt.paper_id;

    IF v_paper.id IS NULL THEN
        RAISE EXCEPTION 'Paper not found' USING ERRCODE = 'P0002';
    END IF;

    IF NOT COALESCE(v_paper.allow_pause, false) THEN
        RAISE EXCEPTION 'Pause is not allowed for this paper' USING ERRCODE = '42501';
    END IF;

    -- Calculate elapsed time
    v_elapsed_seconds := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_attempt.started_at))::int);

    -- Get section durations (default 40 min = 2400 sec each)
    v_varc_duration := 2400;
    v_dilr_duration := 2400;
    v_qa_duration := 2400;

    IF v_paper.sections IS NOT NULL AND jsonb_array_length(v_paper.sections) > 0 THEN
        SELECT COALESCE((elem->>'time')::int * 60, 2400)
        INTO v_varc_duration
        FROM jsonb_array_elements(v_paper.sections) AS elem
        WHERE elem->>'name' = 'VARC'
        LIMIT 1;

        SELECT COALESCE((elem->>'time')::int * 60, 2400)
        INTO v_dilr_duration
        FROM jsonb_array_elements(v_paper.sections) AS elem
        WHERE elem->>'name' = 'DILR'
        LIMIT 1;

        SELECT COALESCE((elem->>'time')::int * 60, 2400)
        INTO v_qa_duration
        FROM jsonb_array_elements(v_paper.sections) AS elem
        WHERE elem->>'name' = 'QA'
        LIMIT 1;
    END IF;

    -- Calculate remaining time per section based on elapsed
    v_remaining_elapsed := v_elapsed_seconds;

    -- VARC
    IF v_remaining_elapsed >= v_varc_duration THEN
        v_calc_varc := 0;
        v_remaining_elapsed := v_remaining_elapsed - v_varc_duration;
    ELSE
        v_calc_varc := v_varc_duration - v_remaining_elapsed;
        v_remaining_elapsed := 0;
    END IF;

    -- DILR
    IF v_remaining_elapsed >= v_dilr_duration THEN
        v_calc_dilr := 0;
        v_remaining_elapsed := v_remaining_elapsed - v_dilr_duration;
    ELSE
        v_calc_dilr := v_dilr_duration - v_remaining_elapsed;
        v_remaining_elapsed := 0;
    END IF;

    -- QA
    IF v_remaining_elapsed >= v_qa_duration THEN
        v_calc_qa := 0;
    ELSE
        v_calc_qa := v_qa_duration - v_remaining_elapsed;
    END IF;

    -- Update attempt with server-calculated time
    UPDATE public.attempts
    SET 
        time_remaining = jsonb_build_object(
            'VARC', v_calc_varc,
            'DILR', v_calc_dilr,
            'QA', v_calc_qa
        ),
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'time_remaining', jsonb_build_object(
            'VARC', v_calc_varc,
            'DILR', v_calc_dilr,
            'QA', v_calc_qa
        ),
        'current_section', p_current_section,
        'current_question', p_current_question,
        'paused_at', NOW()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.pause_exam_state(uuid, text, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pause_exam_state(uuid, text, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.pause_exam_state(uuid, text, int) TO authenticated;

-- =============================================================================
-- VERIFICATION QUERIES (run as authenticated user, not service role)
-- =============================================================================

-- TEST 1: Direct UPDATE on revoked columns should fail
-- UPDATE public.attempts SET time_remaining = '{"VARC": 9999}' WHERE id = '<attempt_id>';
-- Expected: ERROR permission denied for column time_remaining

-- TEST 2: RPC should work for attempt owner
-- SELECT public.save_attempt_state('<attempt_id>', '{"VARC": 1000, "DILR": 2000, "QA": 2400}', 'VARC', 1, NOW());
-- Expected: SUCCESS with updated state

-- TEST 3: RPC should reject time inflation
-- SELECT public.save_attempt_state('<attempt_id>', '{"VARC": 9999, "DILR": 9999, "QA": 9999}', 'VARC', 1, NOW());
-- Expected: ERROR Invalid timer state: time cannot increase

-- TEST 4: pause_exam_state should work for papers with allow_pause=true
-- SELECT public.pause_exam_state('<attempt_id>', 'VARC', 1);
-- Expected: SUCCESS with server-calculated time

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
