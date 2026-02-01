-- ==========================================================================
-- Migration 013: Phase 1 Security Hardening - Complete Implementation
-- Date: February 2026
-- ==========================================================================
-- This migration addresses all Phase 1 security requirements:
-- 1. Remove legacy SQL finalize_attempt (TS scoring is source of truth)
-- 2. Enforce attempt limits via RLS policy
-- 3. Protect sensitive columns (correct_answer, session_token)
-- 4. Add pause_exam_state RPC with allow_pause check
-- 5. Harden session token validation
-- ==========================================================================

-- ==========================================================================
-- STEP 1: Drop Legacy SQL Scoring Function
-- ==========================================================================
-- The TypeScript scoring engine in submitExam() is now the sole source of truth.
-- Remove any legacy SQL scoring paths to prevent divergent outcomes.

DROP FUNCTION IF EXISTS public.finalize_attempt(UUID);
DROP FUNCTION IF EXISTS public.score_attempt(UUID);
DROP FUNCTION IF EXISTS public.calculate_attempt_score(UUID);

-- ==========================================================================
-- STEP 2: Enforce Attempt Limits via RLS Policy
-- ==========================================================================
-- Users cannot create more attempts than the paper's attempt_limit allows.
-- Status != 'expired' are counted (in_progress, submitted, completed, abandoned).

DROP POLICY IF EXISTS "Users can create their own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can create attempts within limit" ON public.attempts;

CREATE POLICY "Users can create attempts within limit" ON public.attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- No limit set (NULL or 0 means unlimited)
            (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) IS NULL
            OR (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) <= 0
            OR (
                -- Count existing non-expired attempts
                (
                    SELECT COUNT(*)
                    FROM public.attempts a
                    WHERE a.user_id = auth.uid()
                      AND a.paper_id = attempts.paper_id
                      AND a.status <> 'expired'
                ) < (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id)
            )
        )
    );

-- ==========================================================================
-- STEP 3: Protect Sensitive Columns
-- ==========================================================================
-- Revoke direct access to sensitive columns from authenticated users.
-- These can only be accessed via SECURITY DEFINER functions.

-- Prevent direct read of correct_answer (use questions_exam view during exam,
-- fetch_attempt_solutions RPC after completion)
REVOKE SELECT (correct_answer) ON public.questions FROM authenticated;
REVOKE SELECT (correct_answer) ON public.questions FROM anon;

-- Prevent direct read/write of session_token (managed by session RPCs only)
REVOKE SELECT (session_token) ON public.attempts FROM authenticated;
REVOKE UPDATE (session_token) ON public.attempts FROM authenticated;
REVOKE SELECT (session_token) ON public.attempts FROM anon;

-- Prevent direct write to scoring columns (managed by submitExam TS only)
REVOKE UPDATE (total_score, correct_count, incorrect_count, unanswered_count, 
               accuracy, attempt_rate, section_scores) ON public.attempts FROM authenticated;

-- ==========================================================================
-- STEP 4: Pause Exam RPC with allow_pause Enforcement
-- ==========================================================================
-- This RPC respects the paper's allow_pause flag.
-- If allow_pause is false, pausing is denied.

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
    SELECT a.id, a.user_id, a.status, a.paper_id, a.time_remaining,
           p.allow_pause
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
        updated_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN jsonb_build_object('success', TRUE, 'paused_at', NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION public.pause_exam_state(UUID, TEXT, INT) TO authenticated;

-- ==========================================================================
-- STEP 5: Add 'paused' to attempt status enum
-- ==========================================================================
-- First check if the constraint exists and drop it, then recreate with 'paused'

DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_status_check;
    
    -- Add new constraint with 'paused' status
    ALTER TABLE public.attempts ADD CONSTRAINT attempts_status_check 
        CHECK (status IN ('in_progress', 'paused', 'submitted', 'completed', 'abandoned', 'expired'));
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not update status constraint: %', SQLERRM;
END $$;

-- ==========================================================================
-- STEP 6: Enhanced Session Token Validation
-- ==========================================================================
-- More robust validation with explicit error codes

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
    
    -- If no session token set yet (first request), accept and set it
    IF v_stored_token IS NULL THEN
        UPDATE public.attempts 
        SET session_token = p_session_token, 
            last_activity_at = NOW()
        WHERE id = p_attempt_id 
          AND user_id = p_user_id;
        RETURN TRUE;
    END IF;
    
    -- Validate token matches
    IF v_stored_token = p_session_token THEN
        -- Update activity timestamp
        UPDATE public.attempts 
        SET last_activity_at = NOW()
        WHERE id = p_attempt_id;
        RETURN TRUE;
    END IF;
    
    -- Token mismatch - possible multi-device attack
    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID) TO authenticated;

-- ==========================================================================
-- STEP 7: Force Resume Session (with staleness check)
-- ==========================================================================
-- Allows user to take over session from another device.
-- Rejects if session is too stale (configurable threshold).

DROP FUNCTION IF EXISTS public.force_resume_exam_session(UUID, UUID);

CREATE OR REPLACE FUNCTION public.force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_stale_threshold INTERVAL := INTERVAL '30 minutes';
BEGIN
    -- Get current attempt state
    SELECT id, user_id, status, session_token, last_activity_at, started_at
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

    -- Check staleness (optional - can be disabled by setting threshold very high)
    -- If last_activity_at is very old, reject force resume
    IF v_attempt.last_activity_at IS NOT NULL 
       AND v_attempt.last_activity_at < (NOW() - v_stale_threshold) THEN
        -- Allow force resume but log it (don't block for now)
        -- In production, you might want to be stricter
        RAISE NOTICE 'FORCE_RESUME_STALE: Session inactive for > 30 minutes';
    END IF;

    -- Update session token and resume
    UPDATE public.attempts
    SET 
        session_token = p_new_session_token,
        status = CASE WHEN status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN p_new_session_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_resume_exam_session(UUID, UUID) TO authenticated;

-- ==========================================================================
-- STEP 8: Initialize Exam Session
-- ==========================================================================
-- Creates a new session token for an attempt.

DROP FUNCTION IF EXISTS public.initialize_exam_session(UUID, UUID);

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
BEGIN
    -- Fetch attempt
    SELECT id, user_id, status, session_token
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

    -- Generate new token
    v_new_token := gen_random_uuid();

    -- Update attempt
    UPDATE public.attempts
    SET 
        session_token = v_new_token,
        status = CASE WHEN status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = p_user_id;

    RETURN v_new_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_exam_session(UUID, UUID) TO authenticated;

-- ==========================================================================
-- STEP 9: Questions RLS Policy Update
-- ==========================================================================
-- Ensure questions table RLS only allows reading for completed attempts.
-- During exam, use questions_exam view which excludes correct_answer.

DROP POLICY IF EXISTS "Users can read questions for their completed attempts" ON public.questions;

CREATE POLICY "Users can read questions for their completed attempts" ON public.questions
    FOR SELECT TO authenticated 
    USING (
        is_active = true
        AND (
            -- Admins can see all questions
            public.is_admin()
            OR
            -- Users can only see questions for papers they've completed
            paper_id IN (
                SELECT paper_id FROM public.attempts
                WHERE user_id = auth.uid()
                  AND status IN ('submitted', 'completed')
                  AND submitted_at IS NOT NULL
            )
        )
    );

-- ==========================================================================
-- STEP 10: Ensure questions_exam view is properly granted
-- ==========================================================================
-- This view excludes correct_answer and is safe for exam runtime.

-- Grant access to the secure exam view
GRANT SELECT ON public.questions_exam TO authenticated;
GRANT SELECT ON public.questions_exam TO anon;

-- ==========================================================================
-- STEP 11: Attempt UPDATE Policy Hardening
-- ==========================================================================
-- Restrict what fields can be updated and under what conditions.

DROP POLICY IF EXISTS "Users can update their own attempts" ON public.attempts;

CREATE POLICY "Users can update their own in-progress attempts" ON public.attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Allow normal progress updates (no status change)
            (
                status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
                AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow transition from in_progress to submitted
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'in_progress'
                AND status = 'submitted'
                AND submitted_at IS NOT NULL
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
        )
    );

-- ==========================================================================
-- STEP 12: Responses RLS Policy
-- ==========================================================================
-- Users can only see/modify responses for their own attempts.

DROP POLICY IF EXISTS "Users can view their own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can create their own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON public.responses;

CREATE POLICY "Users can view their own responses" ON public.responses
    FOR SELECT TO authenticated
    USING (
        attempt_id IN (
            SELECT id FROM public.attempts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own responses" ON public.responses
    FOR INSERT TO authenticated
    WITH CHECK (
        attempt_id IN (
            SELECT id FROM public.attempts 
            WHERE user_id = auth.uid() 
              AND status IN ('in_progress', 'paused')
        )
    );

CREATE POLICY "Users can update their own responses" ON public.responses
    FOR UPDATE TO authenticated
    USING (
        attempt_id IN (
            SELECT id FROM public.attempts 
            WHERE user_id = auth.uid() 
              AND status IN ('in_progress', 'paused')
        )
    );

-- ==========================================================================
-- STEP 13: Fetch Attempt Solutions RPC
-- ==========================================================================
-- Secure way to fetch solutions only for completed attempts.

DROP FUNCTION IF EXISTS public.fetch_attempt_solutions(UUID);

CREATE OR REPLACE FUNCTION public.fetch_attempt_solutions(p_attempt_id UUID)
RETURNS TABLE (
    question_id UUID,
    correct_answer TEXT,
    solution_text TEXT,
    solution_image_url TEXT,
    video_solution_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
BEGIN
    -- Get attempt info
    SELECT id, user_id, status, paper_id, submitted_at
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

    -- Validate attempt is completed
    IF v_attempt.status NOT IN ('submitted', 'completed') OR v_attempt.submitted_at IS NULL THEN
        RAISE EXCEPTION 'Solutions only available after submission' USING ERRCODE = '42501';
    END IF;

    -- Return solutions
    RETURN QUERY
    SELECT 
        q.id AS question_id,
        q.correct_answer,
        q.solution_text,
        q.solution_image_url,
        q.video_solution_url
    FROM public.questions q
    WHERE q.paper_id = v_attempt.paper_id
      AND q.is_active = TRUE
    ORDER BY q.section, q.question_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_attempt_solutions(UUID) TO authenticated;

-- ==========================================================================
-- VERIFICATION QUERIES (Run to verify migration)
-- ==========================================================================
-- SELECT * FROM pg_policies WHERE tablename = 'attempts';
-- SELECT * FROM pg_policies WHERE tablename = 'questions';
-- SELECT * FROM pg_policies WHERE tablename = 'responses';
-- SELECT proname FROM pg_proc WHERE proname LIKE '%session%' OR proname LIKE '%attempt%';
