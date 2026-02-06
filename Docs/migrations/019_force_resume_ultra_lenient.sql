-- ============================================================================
-- Migration 019: Force Resume Exam Session (Ultra-Lenient Threshold)
-- ============================================================================
-- Purpose: Allow force resume even after long gaps (e.g., next-day continuation).
-- This aligns with mock behavior where attempts can be resumed later.
-- ============================================================================

DROP FUNCTION IF EXISTS force_resume_exam_session(UUID, UUID);

CREATE FUNCTION force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
    v_status TEXT;
    v_last_activity TIMESTAMPTZ;
    -- Ultra-lenient: allow resume up to 7 days of inactivity.
    v_stale_threshold INTERVAL := INTERVAL '7 days';
BEGIN
    SELECT user_id, status, last_activity_at
    INTO v_user_id, v_status, v_last_activity
    FROM attempts
    WHERE id = p_attempt_id;

    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF v_status != 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress';
    END IF;

    IF v_last_activity IS NOT NULL AND v_last_activity < NOW() - v_stale_threshold THEN
        RAISE EXCEPTION 'FORCE_RESUME_STALE';
    END IF;

    UPDATE attempts
    SET session_token = p_new_session_token,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION force_resume_exam_session(UUID, UUID) TO authenticated;

-- ============================================================================
-- Rollback
-- Run 010_force_resume_lenient.sql to restore 3-hour threshold.
-- ============================================================================
