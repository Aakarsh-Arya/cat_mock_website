-- ============================================================================
-- Migration 031: Add AI Analysis Lifecycle Columns to Attempts
-- ============================================================================
-- Purpose:
--   Add a small state machine for AI analysis requests so the
--   request → export → process lifecycle is robust and auditable.
--   Also snapshot the paper version at attempt time to prevent
--   post-attempt paper edits from corrupting AI analysis reports.
--
-- Depends on: 030_add_telemetry_columns.sql (telemetry_log, answer_history)
-- Safe to re-run: All statements are idempotent (IF NOT EXISTS / DO $$ guards)
-- RLS impact: NONE — no policies added, modified, or removed.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Create enum type for AI analysis status
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_analysis_status_type') THEN
        CREATE TYPE public.ai_analysis_status_type AS ENUM (
            'none',        -- default: no analysis requested
            'requested',   -- user/admin clicked "Request AI Analysis"
            'exported',    -- composite context JSON was downloaded
            'processed',   -- AI model finished processing (future use)
            'failed'       -- export or processing encountered an error
        );
    END IF;
END
$$;

COMMENT ON TYPE public.ai_analysis_status_type IS
    'Lifecycle states for AI analysis: none → requested → exported → processed | failed';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Add AI analysis lifecycle columns to attempts
-- ─────────────────────────────────────────────────────────────────────────────

-- 2a) Status column (enum with safe default)
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_status public.ai_analysis_status_type
    NOT NULL DEFAULT 'none';

-- 2b) Timestamp: when analysis was first requested
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_requested_at TIMESTAMPTZ;

-- 2c) Timestamp: when composite context was exported/downloaded
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_exported_at TIMESTAMPTZ;

-- 2d) Error message if export or processing failed
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_error TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Snapshot paper version at attempt time
-- ─────────────────────────────────────────────────────────────────────────────
-- Stores papers.latest_ingest_run_id at the moment the attempt is created.
-- This ensures AI analysis always references the exact paper version the
-- student saw, even if the paper is re-ingested later.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'attempts'
          AND column_name  = 'paper_ingest_run_id'
    ) THEN
        ALTER TABLE public.attempts
        ADD COLUMN paper_ingest_run_id UUID;

        -- FK to paper_ingest_runs (no CASCADE — orphan is acceptable, we keep the UUID)
        ALTER TABLE public.attempts
        ADD CONSTRAINT fk_attempts_paper_ingest_run
            FOREIGN KEY (paper_ingest_run_id)
            REFERENCES public.paper_ingest_runs(id)
            ON DELETE SET NULL;
    END IF;
END
$$;

COMMENT ON COLUMN public.attempts.paper_ingest_run_id IS
    'Snapshot of papers.latest_ingest_run_id at attempt creation time. '
    'Ensures AI analysis references the exact paper version the student saw.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Backfill existing rows
-- ─────────────────────────────────────────────────────────────────────────────
-- ai_analysis_status defaults to 'none' via column default, so existing rows
-- are already correct. paper_ingest_run_id is nullable, so no backfill needed.
-- Explicit backfill for safety (no-op if default already applied):
UPDATE public.attempts
SET ai_analysis_status = 'none'
WHERE ai_analysis_status IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Indexes for admin dashboard queries
-- ─────────────────────────────────────────────────────────────────────────────
-- Fast filter: "show me all attempts that have been requested for analysis"
-- + sorted by most recent submission first.
CREATE INDEX IF NOT EXISTS idx_attempts_ai_analysis_status_submitted
    ON public.attempts (ai_analysis_status, submitted_at DESC);

-- Fast lookup: "find all attempts for a specific paper ingest run"
CREATE INDEX IF NOT EXISTS idx_attempts_paper_ingest_run_id
    ON public.attempts (paper_ingest_run_id)
    WHERE paper_ingest_run_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) Column comments for documentation
-- ─────────────────────────────────────────────────────────────────────────────
COMMENT ON COLUMN public.attempts.ai_analysis_status IS
    'AI analysis lifecycle state: none → requested → exported → processed | failed';

COMMENT ON COLUMN public.attempts.ai_analysis_requested_at IS
    'Timestamp when AI analysis was first requested for this attempt';

COMMENT ON COLUMN public.attempts.ai_analysis_exported_at IS
    'Timestamp when composite context JSON was exported/downloaded';

COMMENT ON COLUMN public.attempts.ai_analysis_error IS
    'Error message if AI analysis export or processing failed (nullable)';

-- ============================================================================
-- Verification Queries (run manually to confirm)
-- ============================================================================
-- Count attempts by AI analysis status:
--   SELECT ai_analysis_status, COUNT(*) FROM public.attempts GROUP BY 1;
--
-- Show recent requested attempts:
--   SELECT id, user_id, paper_id, ai_analysis_status, ai_analysis_requested_at
--   FROM public.attempts
--   WHERE ai_analysis_status != 'none'
--   ORDER BY ai_analysis_requested_at DESC NULLS LAST
--   LIMIT 20;
--
-- Verify columns exist:
--   SELECT column_name, data_type, column_default, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND table_name = 'attempts'
--     AND column_name LIKE 'ai_analysis%'
--   ORDER BY ordinal_position;
--
-- Verify paper_ingest_run_id:
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND table_name = 'attempts'
--     AND column_name = 'paper_ingest_run_id';
--
-- Verify indexes:
--   SELECT indexname, indexdef
--   FROM pg_indexes
--   WHERE tablename = 'attempts'
--     AND indexname LIKE '%ai_analysis%' OR indexname LIKE '%paper_ingest_run%';
-- ============================================================================
