-- =============================================================================
-- Migration 036: pause_exam_state now saves time_remaining
-- =============================================================================
-- Root cause: sendBestEffortPause (beacon) can win a race with
-- updateAttemptProgress, causing time_remaining to never be updated before
-- the status flips to 'paused'.  On resume, the stale time_remaining is read,
-- and the delta-time timer may start at 0, triggering an instant auto-submit.
--
-- Fix: pause_exam_state now accepts an optional p_time_remaining JSONB
-- parameter and saves it atomically alongside the status transition.
-- Anti-inflation clamping is applied just like save_attempt_state.
--
-- ALSO: save_attempt_state now allows status = 'paused' so that the
-- persistSnapshotBeforePause call doesn't fail if the beacon pause
-- already fired.
-- =============================================================================

-- --------------------------------------------------------------------------
-- 1. Drop old signature and create updated pause_exam_state
-- --------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.pause_exam_state(UUID, TEXT, INT);
DROP FUNCTION IF EXISTS public.pause_exam_state(UUID, TEXT, INT, JSONB);

CREATE OR REPLACE FUNCTION public.pause_exam_state(
    p_attempt_id UUID,
    p_current_section TEXT,
    p_current_question INT,
    p_time_remaining JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_allow_pause BOOLEAN;
    v_stored_time_remaining JSONB;
    v_final_tr JSONB;
    v_new_varc INT;
    v_new_dilr INT;
    v_new_qa INT;
    v_stored_varc INT;
    v_stored_dilr INT;
    v_stored_qa INT;
    v_tolerance INT := 5;
BEGIN
    -- Fetch attempt with paper info
    SELECT a.id, a.user_id, a.status, a.paper_id, a.time_remaining, p.allow_pause
    INTO v_attempt
    FROM public.attempts a
    JOIN public.papers p ON p.id = a.paper_id
    WHERE a.id = p_attempt_id;

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

    -- Check if pausing is allowed for this paper
    v_allow_pause := COALESCE(v_attempt.allow_pause, FALSE);
    IF NOT v_allow_pause THEN
        RAISE EXCEPTION 'Pausing is not allowed for this exam' USING ERRCODE = '42501';
    END IF;

    -- Determine final time_remaining: use client hint if provided (with clamping)
    v_stored_time_remaining := v_attempt.time_remaining;

    IF p_time_remaining IS NOT NULL THEN
        v_new_varc   := COALESCE((p_time_remaining->>'VARC')::INT, 0);
        v_new_dilr   := COALESCE((p_time_remaining->>'DILR')::INT, 0);
        v_new_qa     := COALESCE((p_time_remaining->>'QA')::INT, 0);

        v_stored_varc := COALESCE((v_stored_time_remaining->>'VARC')::INT, 0);
        v_stored_dilr := COALESCE((v_stored_time_remaining->>'DILR')::INT, 0);
        v_stored_qa   := COALESCE((v_stored_time_remaining->>'QA')::INT, 0);

        -- Anti-inflation: clamp to stored + tolerance
        IF v_new_varc > v_stored_varc + v_tolerance
           OR v_new_dilr > v_stored_dilr + v_tolerance
           OR v_new_qa > v_stored_qa + v_tolerance THEN
            -- Reject inflation silently: keep stored values
            v_final_tr := v_stored_time_remaining;
        ELSE
            v_final_tr := jsonb_build_object(
                'VARC', GREATEST(0, LEAST(v_new_varc, v_stored_varc)),
                'DILR', GREATEST(0, LEAST(v_new_dilr, v_stored_dilr)),
                'QA',   GREATEST(0, LEAST(v_new_qa,   v_stored_qa))
            );
        END IF;
    ELSE
        v_final_tr := v_stored_time_remaining;
    END IF;

    -- Update attempt to paused state
    UPDATE public.attempts
    SET
        status = 'paused',
        time_remaining = v_final_tr,
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW(),
        updated_at = NOW(),
        paused_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN jsonb_build_object('success', TRUE, 'paused_at', NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION public.pause_exam_state(UUID, TEXT, INT, JSONB) TO authenticated;

-- --------------------------------------------------------------------------
-- 2. Update save_attempt_state to allow status = 'paused'
-- --------------------------------------------------------------------------
-- This prevents the race condition where sendBestEffortPause beacon
-- lands first, flipping status to 'paused', and then
-- persistSnapshotBeforePause's save_attempt_state call fails because
-- it only allowed 'in_progress'.

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
    v_attempt RECORD;
    v_stored_time_remaining JSONB;
    v_new_varc INT;
    v_new_dilr INT;
    v_new_qa INT;
    v_stored_varc INT;
    v_stored_dilr INT;
    v_stored_qa INT;
    v_tolerance INT := 5;
BEGIN
    SELECT id, user_id, status, time_remaining, started_at, paper_id
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Allow both in_progress AND paused (to survive beacon pause race)
    IF v_attempt.status NOT IN ('in_progress', 'paused') THEN
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
    v_new_qa   := GREATEST(0, LEAST(v_new_qa,   v_stored_qa));

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
