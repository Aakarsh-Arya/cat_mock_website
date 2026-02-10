-- ============================================================================
-- Migration 034: NexAI Analysis Columns — Consolidated
-- ============================================================================
-- Purpose:
--   Add all AI analysis lifecycle columns to the attempts table in one shot.
--   This consolidates migrations 031 + 033 into a single idempotent script.
--
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query → paste → Run)
--
-- Safe to re-run: All statements use IF NOT EXISTS / DO $$ guards.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Add columns (using TEXT for status instead of enum to avoid enum creation)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_requested_at TIMESTAMPTZ;

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_exported_at TIMESTAMPTZ;

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_processed_at TIMESTAMPTZ;

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_error TEXT;

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_user_prompt TEXT;

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_result_text TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Grant authenticated users permission to UPDATE the new columns
-- ─────────────────────────────────────────────────────────────────────────────

GRANT UPDATE (
    ai_analysis_status,
    ai_analysis_requested_at,
    ai_analysis_user_prompt
) ON public.attempts TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Index for admin dashboard queries
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_attempts_ai_analysis_status_submitted
    ON public.attempts (ai_analysis_status, submitted_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Column comments
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON COLUMN public.attempts.ai_analysis_status IS
    'AI analysis lifecycle state: none → requested → exported → processed | failed';
COMMENT ON COLUMN public.attempts.ai_analysis_requested_at IS
    'Timestamp when AI analysis was first requested for this attempt';
COMMENT ON COLUMN public.attempts.ai_analysis_exported_at IS
    'Timestamp when composite context JSON was exported/downloaded';
COMMENT ON COLUMN public.attempts.ai_analysis_processed_at IS
    'Timestamp when ai_analysis_result_text was last saved and status moved to processed';
COMMENT ON COLUMN public.attempts.ai_analysis_error IS
    'Error message if AI analysis export or processing failed (nullable)';
COMMENT ON COLUMN public.attempts.ai_analysis_user_prompt IS
    'Optional user customization prompt submitted at NexAI insight request time';
COMMENT ON COLUMN public.attempts.ai_analysis_result_text IS
    'Final NexAI insight text pasted by admin for this attempt';

-- ============================================================================
-- Verification (run after to confirm)
-- ============================================================================
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'attempts'
--   AND column_name LIKE 'ai_analysis%'
-- ORDER BY ordinal_position;
-- ============================================================================
