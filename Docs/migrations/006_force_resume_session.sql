-- ============================================================================
-- Migration: Force Resume Exam Session (SECURITY DEFINER)
-- @blueprint Security Audit - P0 Fix - Session Locking Compatibility
-- ============================================================================
-- Purpose: Allow server-authoritative session token rotation for force-resume
-- ============================================================================

CREATE OR REPLACE FUNCTION force_resume_exam_session(
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
    v_stale_threshold INTERVAL := INTERVAL '5 minutes';
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

    IF v_last_activity IS NULL OR v_last_activity < NOW() - v_stale_threshold THEN
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
-- Rollback (if needed)
-- DROP FUNCTION IF EXISTS force_resume_exam_session(UUID, UUID);
-- ============================================================================
