-- ============================================================================
-- Migration: Force Resume Exam Session V2 (Lenient Stale Threshold)
-- @blueprint Security Audit - Phase 3 Fix - Lenient force-resume for real exams
-- ============================================================================
-- Purpose: Allow force resume even after long connectivity gaps during exams.
-- The 5-minute stale threshold was too aggressive for CAT-style 2-hour exams.
-- Now uses 180 minutes (3 hours) as the threshold - covers full exam + buffer.
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
    -- Phase 3: Increased from 5 minutes to 180 minutes (3 hours)
    -- This accommodates full exam duration + connectivity hiccups
    v_stale_threshold INTERVAL := INTERVAL '180 minutes';
BEGIN
    SELECT user_id, status, last_activity_at
    INTO v_user_id, v_status, v_last_activity
    FROM attempts
    WHERE id = p_attempt_id;

    -- Ownership check
    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Status check
    IF v_status != 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress';
    END IF;

    -- Phase 3: Only reject if truly stale (>3 hours of inactivity)
    -- This prevents "FORCE_RESUME_STALE" during normal exam flow
    IF v_last_activity IS NOT NULL AND v_last_activity < NOW() - v_stale_threshold THEN
        RAISE EXCEPTION 'FORCE_RESUME_STALE';
    END IF;

    -- Rotate session token and update activity
    UPDATE attempts
    SET session_token = p_new_session_token,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN TRUE;
END;
$$;

-- Ensure authenticated users can execute
GRANT EXECUTE ON FUNCTION force_resume_exam_session(UUID, UUID) TO authenticated;

-- ============================================================================
-- Rollback (if needed)
-- Run the original 006_force_resume_session.sql to restore 5-minute threshold
-- ============================================================================
