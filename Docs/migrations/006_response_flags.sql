-- =============================================================================
-- MIGRATION 006: Response Flags (Mark for Review + Visited)
-- =============================================================================
-- Adds is_marked_for_review and is_visited flags to responses for TCS ION palette
-- EXECUTE IN SUPABASE SQL EDITOR
-- =============================================================================

ALTER TABLE public.responses 
ADD COLUMN IF NOT EXISTS is_marked_for_review BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_visited BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
