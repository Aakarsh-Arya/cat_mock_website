-- ============================================================================
-- Migration 040: User Bookmarks
-- ============================================================================
-- Purpose:
-- 1) Create user_bookmarks table for persistent question bookmarks.
-- 2) Enable users to save/retrieve bookmarked questions across sessions.
-- 3) Support topic/subtopic grouping for dashboard display.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Create user_bookmarks table
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES public.papers(id) ON DELETE SET NULL,
    section TEXT,
    topic TEXT,
    subtopic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

COMMENT ON TABLE public.user_bookmarks IS
'User-saved bookmarks for questions. Enables persistent bookmarking across sessions.';

COMMENT ON COLUMN public.user_bookmarks.user_id IS 'User who bookmarked the question.';
COMMENT ON COLUMN public.user_bookmarks.question_id IS 'The bookmarked question.';
COMMENT ON COLUMN public.user_bookmarks.paper_id IS 'Paper containing the question (for reference).';
COMMENT ON COLUMN public.user_bookmarks.section IS 'Denormalized section (VARC/DILR/QA) for faster filtering.';
COMMENT ON COLUMN public.user_bookmarks.topic IS 'Denormalized topic for faster grouping.';
COMMENT ON COLUMN public.user_bookmarks.subtopic IS 'Denormalized subtopic for faster grouping.';

-- ----------------------------------------------------------------------------
-- 2) Indexes for efficient querying
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id 
ON public.user_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_section
ON public.user_bookmarks(user_id, section);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_topic
ON public.user_bookmarks(user_id, topic);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_subtopic
ON public.user_bookmarks(user_id, subtopic);

-- ----------------------------------------------------------------------------
-- 3) RLS Policies
-- ----------------------------------------------------------------------------

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_bookmarks_select_own ON public.user_bookmarks;
DROP POLICY IF EXISTS user_bookmarks_insert_own ON public.user_bookmarks;
DROP POLICY IF EXISTS user_bookmarks_delete_own ON public.user_bookmarks;

-- Users can only see their own bookmarks
CREATE POLICY user_bookmarks_select_own ON public.user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own bookmarks
CREATE POLICY user_bookmarks_insert_own ON public.user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY user_bookmarks_delete_own ON public.user_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4) Function to toggle bookmark
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.toggle_user_bookmark(
    p_question_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_existing_id UUID;
    v_question RECORD;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Check if bookmark exists
    SELECT id INTO v_existing_id
    FROM public.user_bookmarks
    WHERE user_id = v_user_id AND question_id = p_question_id;
    
    IF v_existing_id IS NOT NULL THEN
        -- Remove bookmark
        DELETE FROM public.user_bookmarks WHERE id = v_existing_id;
        RETURN jsonb_build_object('success', true, 'action', 'removed', 'bookmark_id', v_existing_id);
    ELSE
        -- Add bookmark - fetch question metadata
        SELECT id, paper_id, section, topic, subtopic 
        INTO v_question
        FROM public.questions
        WHERE id = p_question_id;
        
        IF v_question IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error', 'Question not found');
        END IF;
        
        INSERT INTO public.user_bookmarks (user_id, question_id, paper_id, section, topic, subtopic)
        VALUES (v_user_id, p_question_id, v_question.paper_id, v_question.section, v_question.topic, v_question.subtopic)
        RETURNING id INTO v_existing_id;
        
        RETURN jsonb_build_object('success', true, 'action', 'added', 'bookmark_id', v_existing_id);
    END IF;
END;
$$;

COMMENT ON FUNCTION public.toggle_user_bookmark IS
'Toggle bookmark for a question. Adds if not bookmarked, removes if already bookmarked.';

-- ----------------------------------------------------------------------------
-- 5) Function to get user bookmarks grouped by topic/subtopic
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_bookmarks_grouped()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    SELECT jsonb_build_object(
        'success', true,
        'total_count', COUNT(*),
        'by_section', (
            SELECT jsonb_object_agg(
                COALESCE(section, 'Unknown'),
                section_data
            )
            FROM (
                SELECT 
                    section,
                    jsonb_build_object(
                        'count', COUNT(*),
                        'by_topic', (
                            SELECT jsonb_object_agg(
                                COALESCE(t.topic, 'General'),
                                t.topic_data
                            )
                            FROM (
                                SELECT 
                                    b2.topic,
                                    jsonb_build_object(
                                        'count', COUNT(*),
                                        'questions', jsonb_agg(
                                            jsonb_build_object(
                                                'bookmark_id', b2.id,
                                                'question_id', b2.question_id,
                                                'paper_id', b2.paper_id,
                                                'subtopic', b2.subtopic,
                                                'created_at', b2.created_at,
                                                'question_text', LEFT(q.question_text, 200),
                                                'paper_title', p.title
                                            )
                                        )
                                    ) AS topic_data
                                FROM public.user_bookmarks b2
                                LEFT JOIN public.questions q ON q.id = b2.question_id
                                LEFT JOIN public.papers p ON p.id = b2.paper_id
                                WHERE b2.user_id = v_user_id 
                                  AND COALESCE(b2.section, 'Unknown') = COALESCE(b.section, 'Unknown')
                                GROUP BY b2.topic
                            ) t
                        )
                    ) AS section_data
                FROM public.user_bookmarks b
                WHERE b.user_id = v_user_id
                GROUP BY b.section
            ) s
        )
    ) INTO v_result
    FROM public.user_bookmarks
    WHERE user_id = v_user_id;
    
    RETURN COALESCE(v_result, jsonb_build_object('success', true, 'total_count', 0, 'by_section', '{}'::jsonb));
END;
$$;

COMMENT ON FUNCTION public.get_user_bookmarks_grouped IS
'Get all user bookmarks grouped by section, topic, and subtopic.';

-- ----------------------------------------------------------------------------
-- 6) Grant permissions
-- ----------------------------------------------------------------------------

GRANT SELECT, INSERT, DELETE ON public.user_bookmarks TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_user_bookmark TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_bookmarks_grouped TO authenticated;

-- ----------------------------------------------------------------------------
-- 7) Verification
-- ----------------------------------------------------------------------------
-- SELECT * FROM public.user_bookmarks LIMIT 5;
-- SELECT public.get_user_bookmarks_grouped();
