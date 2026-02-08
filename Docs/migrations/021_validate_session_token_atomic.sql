-- ============================================================================
-- Migration 021: Validate Session Token (Atomic Init)
-- ============================================================================
-- Purpose: Fix TOCTOU race when initializing session_token for the first time.
-- This makes the "token is NULL -> set token" branch atomic.
-- ============================================================================

DROP FUNCTION IF EXISTS public.validate_session_token(UUID, UUID, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS public.validate_session_token(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION public.validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_stored_token UUID;
    v_user_id UUID;
    v_status TEXT;
    v_rows_updated INTEGER := 0;
BEGIN
    -- Get current attempt state
    SELECT session_token, user_id, status
    INTO v_stored_token, v_user_id, v_status
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Check if attempt exists
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check ownership
    IF v_user_id != p_user_id THEN
        RETURN FALSE;
    END IF;

    -- Check status (allow in_progress and paused)
    IF v_status NOT IN ('in_progress', 'paused') THEN
        RETURN FALSE;
    END IF;

    -- If no session token set yet (first request), try to set it atomically
    IF v_stored_token IS NULL THEN
        UPDATE public.attempts
        SET session_token = p_session_token,
            last_activity_at = NOW()
        WHERE id = p_attempt_id
          AND user_id = p_user_id
          AND session_token IS NULL;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

        IF v_rows_updated > 0 THEN
            RETURN TRUE;
        END IF;

        -- Another request set the token first; re-read it.
        SELECT session_token INTO v_stored_token
        FROM public.attempts
        WHERE id = p_attempt_id;
    END IF;

    -- Validate token matches
    IF v_stored_token = p_session_token THEN
        UPDATE public.attempts
        SET last_activity_at = NOW()
        WHERE id = p_attempt_id;
        RETURN TRUE;
    END IF;

    -- Token mismatch
    RETURN FALSE;
END;
$$;

-- Overloaded signature used by API routes (keeps compatibility with named args)
CREATE OR REPLACE FUNCTION public.validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID,
    p_force_resume BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN public.validate_session_token(p_attempt_id, p_session_token, p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID, BOOLEAN) TO authenticated;
