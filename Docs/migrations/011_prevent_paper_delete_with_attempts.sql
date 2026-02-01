-- ==============================================================================
-- Migration 011: Prevent paper deletion when attempts exist
-- ==============================================================================
-- Purpose: Replace attempts.paper_id FK to use RESTRICT/NO ACTION instead of CASCADE
-- Author: System
-- Date: 2026-01-31
-- Dependencies: 010_force_resume_lenient.sql
-- ==============================================================================

-- Drop existing FK constraint from attempts.paper_id to papers.id (if any)
DO $$
DECLARE
    v_constraint text;
BEGIN
    SELECT c.conname
    INTO v_constraint
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_class r ON c.confrelid = r.oid
    WHERE t.relname = 'attempts'
      AND r.relname = 'papers'
      AND c.contype = 'f'
    LIMIT 1;

    IF v_constraint IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.attempts DROP CONSTRAINT %I', v_constraint);
    END IF;
END $$;

-- Recreate FK with RESTRICT to prevent accidental cascading deletes
ALTER TABLE public.attempts
    ADD CONSTRAINT attempts_paper_id_fkey
    FOREIGN KEY (paper_id)
    REFERENCES public.papers(id)
    ON DELETE RESTRICT;

-- ==============================================================================
-- Verification
-- ==============================================================================
-- SELECT conname, confdeltype FROM pg_constraint
-- WHERE conrelid = 'public.attempts'::regclass AND contype = 'f';
