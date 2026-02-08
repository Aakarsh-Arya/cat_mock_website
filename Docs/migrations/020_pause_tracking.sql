-- ============================================================================
-- Migration 020: Pause Tracking for Accurate Time Taken
-- ============================================================================
-- Purpose: Track total paused duration so scoring/analytics exclude pause time.
-- Adds:
--   - attempts.paused_at
--   - attempts.total_paused_seconds
-- Updates:
--   - pause_exam_state
--   - initialize_exam_session
--   - force_resume_exam_session
-- ============================================================================

ALTER TABLE public.attempts
    ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS total_paused_seconds INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.attempts.paused_at IS 'Timestamp when the attempt was last paused.';
COMMENT ON COLUMN public.attempts.total_paused_seconds IS 'Accumulated paused duration (seconds).';

-- Backfill paused_at for currently paused attempts (best-effort)
UPDATE public.attempts
SET paused_at = COALESCE(paused_at, last_activity_at, updated_at, NOW())
WHERE status = 'paused' AND paused_at IS NULL;

-- --------------------------------------------------------------------------
-- Pause RPC: set paused_at and keep total_paused_seconds unchanged
-- --------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.pause_exam_state(UUID, TEXT, INT);

CREATE OR REPLACE FUNCTION public.pause_exam_state(
    p_attempt_id UUID,
    p_current_section TEXT,
    p_current_question INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_allow_pause BOOLEAN;
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

    -- Update attempt to paused state
    UPDATE public.attempts
    SET
        status = 'paused',
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

GRANT EXECUTE ON FUNCTION public.pause_exam_state(UUID, TEXT, INT) TO authenticated;

-- --------------------------------------------------------------------------
-- Initialize session: resume paused attempts and add pause duration
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.initialize_exam_session(
    p_attempt_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_new_token UUID;
    v_paused_delta INTEGER := 0;
BEGIN
    -- Fetch attempt
    SELECT id, user_id, status, session_token, paused_at, total_paused_seconds
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status NOT IN ('in_progress', 'paused') THEN
        RAISE EXCEPTION 'Attempt is not active' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status = 'paused' AND v_attempt.paused_at IS NOT NULL THEN
        v_paused_delta := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_attempt.paused_at))::INT);
    END IF;

    -- Generate new token
    v_new_token := gen_random_uuid();

    -- Update attempt
    UPDATE public.attempts
    SET
        session_token = v_new_token,
        status = CASE WHEN v_attempt.status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW(),
        paused_at = CASE WHEN v_attempt.status = 'paused' THEN NULL ELSE paused_at END,
        total_paused_seconds = COALESCE(total_paused_seconds, 0) + v_paused_delta
    WHERE id = p_attempt_id
      AND user_id = p_user_id;

    RETURN v_new_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_exam_session(UUID, UUID) TO authenticated;

-- --------------------------------------------------------------------------
-- Force resume: resume paused attempts and add pause duration
-- --------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.force_resume_exam_session(UUID, UUID);

CREATE OR REPLACE FUNCTION public.force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_paused_delta INTEGER := 0;
    v_stale_threshold INTERVAL := INTERVAL '7 days';
BEGIN
    -- Get current attempt state
    SELECT id, user_id, status, session_token, last_activity_at, paused_at, total_paused_seconds
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

    -- Validate status (allow in_progress and paused)
    IF v_attempt.status NOT IN ('in_progress', 'paused') THEN
        RAISE EXCEPTION 'Attempt is not resumable (status: %)', v_attempt.status
            USING ERRCODE = '42501';
    END IF;

    -- Check staleness (allow long gaps for mocks)
    IF v_attempt.last_activity_at IS NOT NULL
       AND v_attempt.last_activity_at < (NOW() - v_stale_threshold) THEN
        RAISE EXCEPTION 'FORCE_RESUME_STALE';
    END IF;

    IF v_attempt.status = 'paused' AND v_attempt.paused_at IS NOT NULL THEN
        v_paused_delta := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_attempt.paused_at))::INT);
    END IF;

    -- Update session token and resume
    UPDATE public.attempts
    SET
        session_token = p_new_session_token,
        status = CASE WHEN v_attempt.status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW(),
        paused_at = CASE WHEN v_attempt.status = 'paused' THEN NULL ELSE paused_at END,
        total_paused_seconds = COALESCE(total_paused_seconds, 0) + v_paused_delta
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_resume_exam_session(UUID, UUID) TO authenticated;
