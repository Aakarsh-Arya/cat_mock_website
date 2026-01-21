-- ============================================================================
-- Migration: Session Locking for Exam Security
-- @blueprint Security Audit - P0 Fix - Multi-device/tab Prevention
-- ============================================================================
-- Purpose: Prevent users from opening exam in multiple devices/tabs
-- How it works:
--   1. When exam starts, a session_token (UUID) is generated and stored
--   2. All save/submit requests must include matching session_token
--   3. last_activity_at tracks when user was last active
--   4. Stale sessions (>5 min inactive) can be invalidated
-- ============================================================================

-- Add session locking columns to attempts table
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS session_token UUID,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create index for session token lookups
CREATE INDEX IF NOT EXISTS idx_attempts_session_token 
ON attempts(session_token) 
WHERE session_token IS NOT NULL;

-- Create index for activity tracking (useful for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_attempts_last_activity 
ON attempts(last_activity_at) 
WHERE status = 'in_progress';

-- ============================================================================
-- Helper function to validate session token
-- Returns TRUE if session is valid, FALSE otherwise
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stored_token UUID;
    v_user_id UUID;
    v_status TEXT;
BEGIN
    -- Get current attempt state
    SELECT session_token, user_id, status 
    INTO v_stored_token, v_user_id, v_status
    FROM attempts 
    WHERE id = p_attempt_id;
    
    -- Check ownership
    IF v_user_id IS NULL OR v_user_id != p_user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check status
    IF v_status != 'in_progress' THEN
        RETURN FALSE;
    END IF;
    
    -- If no session token set yet (first request), accept and set it
    IF v_stored_token IS NULL THEN
        UPDATE attempts 
        SET session_token = p_session_token, last_activity_at = NOW()
        WHERE id = p_attempt_id AND user_id = p_user_id;
        RETURN TRUE;
    END IF;
    
    -- Validate token matches
    IF v_stored_token = p_session_token THEN
        -- Update activity timestamp
        UPDATE attempts 
        SET last_activity_at = NOW()
        WHERE id = p_attempt_id;
        RETURN TRUE;
    END IF;
    
    -- Token mismatch - possible multi-device attack
    RETURN FALSE;
END;
$$;

-- ============================================================================
-- Function to initialize session for an attempt
-- Called when user starts the exam
-- ============================================================================
CREATE OR REPLACE FUNCTION initialize_exam_session(
    p_attempt_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_token UUID;
    v_current_token UUID;
BEGIN
    -- Check if session already exists
    SELECT session_token INTO v_current_token
    FROM attempts
    WHERE id = p_attempt_id AND user_id = p_user_id AND status = 'in_progress';
    
    IF v_current_token IS NOT NULL THEN
        -- Session already initialized - return existing token
        -- This allows page refresh without breaking the session
        UPDATE attempts SET last_activity_at = NOW() WHERE id = p_attempt_id;
        RETURN v_current_token;
    END IF;
    
    -- Generate new session token
    v_session_token := gen_random_uuid();
    
    -- Store session token
    UPDATE attempts 
    SET session_token = v_session_token, last_activity_at = NOW()
    WHERE id = p_attempt_id 
      AND user_id = p_user_id 
      AND status = 'in_progress';
    
    RETURN v_session_token;
END;
$$;

-- ============================================================================
-- Function to check for stale sessions (admin utility)
-- Sessions with no activity for >5 minutes are considered stale
-- ============================================================================
CREATE OR REPLACE FUNCTION get_stale_exam_sessions(
    p_inactive_minutes INTEGER DEFAULT 5
)
RETURNS TABLE(
    attempt_id UUID,
    user_id UUID,
    started_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    inactive_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id AS attempt_id,
        a.user_id,
        a.started_at,
        a.last_activity_at,
        EXTRACT(EPOCH FROM (NOW() - a.last_activity_at))::INTEGER / 60 AS inactive_minutes
    FROM attempts a
    WHERE a.status = 'in_progress'
      AND a.last_activity_at IS NOT NULL
      AND a.last_activity_at < NOW() - (p_inactive_minutes || ' minutes')::INTERVAL
    ORDER BY a.last_activity_at ASC;
END;
$$;

-- ============================================================================
-- RLS Policy Updates
-- Ensure session_token column is protected from direct client access
-- ============================================================================

-- Note: The session_token should NOT be directly readable by clients
-- It should only be validated server-side via the validate_session_token function
-- If you have RLS policies that SELECT *, consider excluding session_token

-- Example policy (adjust based on your existing RLS setup):
-- CREATE POLICY "Users cannot see session_token directly" 
-- ON attempts FOR SELECT 
-- USING (auth.uid() = user_id)
-- WITH CHECK (false);  -- Prevent updates to session_token from client

-- ============================================================================
-- Rollback script (if needed)
-- ============================================================================
-- DROP FUNCTION IF EXISTS get_stale_exam_sessions(INTEGER);
-- DROP FUNCTION IF EXISTS initialize_exam_session(UUID, UUID);
-- DROP FUNCTION IF EXISTS validate_session_token(UUID, UUID, UUID);
-- DROP INDEX IF EXISTS idx_attempts_last_activity;
-- DROP INDEX IF EXISTS idx_attempts_session_token;
-- ALTER TABLE attempts DROP COLUMN IF EXISTS last_activity_at;
-- ALTER TABLE attempts DROP COLUMN IF EXISTS session_token;
