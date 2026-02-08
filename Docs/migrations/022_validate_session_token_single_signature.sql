-- ============================================================================
-- Migration 022: Validate Session Token (Single Signature)
-- ============================================================================
-- Purpose: Remove overloaded signatures to avoid PostgREST ambiguity.
-- Keeps the atomic init logic from migration 021.
-- ============================================================================

DROP FUNCTION IF EXISTS public.validate_session_token(UUID, UUID, UUID, BOOLEAN);

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
        SELECT session_token INTO v_stored_tokenSELECT
        u.id AS user_id,
        u.email,
        p.id AS paper_id,
        p.slug AS paper_slug,
        p.title AS paper_title,
        a.id AS attempt_id,
        a.status AS attempt_status,
        a.started_at,
        a.submitted_at,
        a.completed_at,
        a.time_taken_seconds,
        q.id AS question_id,
        q.section,
        q.question_number,
        q.question_type,
        q.question_text,
        q.options,
        r.answer AS user_answer,
        r.is_correct,
        r.marks_obtained,
        r.status AS response_status,
        r.is_marked_for_review,
        r.time_spent_seconds,
        r.visit_count,
        r.created_at AS response_created_at,
        r.updated_at AS response_updated_at
        FROM public.users u
        JOIN public.attempts a ON a.user_id = u.id
        JOIN public.papers p ON p.id = a.paper_id
        JOIN public.responses r ON r.attempt_id = a.id
        JOIN public.questions q ON q.id = r.question_id
        ORDER BY u.email, p.title, a.started_at, q.section, q.question_number;
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

GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID) TO authenticated;
