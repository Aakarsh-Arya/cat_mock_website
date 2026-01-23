-- ============================================================================
-- MILESTONE 6: RBAC (Role-Based Access Control) Migration
-- ============================================================================
-- This script implements the Hybrid Claims Model for admin access control.
-- 
-- Architecture:
-- 1. Source of Truth: public.user_roles table
-- 2. Performance: Supabase Auth Hook injects custom claims into JWT
-- 3. Enforcement: Middleware + RLS policies check JWT claims
--
-- Run this in Supabase SQL Editor in order.
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Role ENUM and user_roles table
-- ============================================================================

-- Create role enum type (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'editor');
    END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role public.app_role NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Add comment for documentation
COMMENT ON TABLE public.user_roles IS 'Stores user roles for RBAC. Source of truth for access control.';
COMMENT ON COLUMN public.user_roles.granted_by IS 'The admin who granted this role (NULL for system grants)';

-- ============================================================================
-- STEP 2: Enable RLS on user_roles table
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Policy: Users can view their own role
CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can view all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can insert new roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update roles (except their own admin role)
CREATE POLICY "Admins can update roles" ON public.user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        AND user_id != auth.uid() -- Cannot modify own role
    );

-- Policy: Admins can delete roles (except their own)
CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        AND user_id != auth.uid()
    );

-- ============================================================================
-- STEP 3: Auth Hook Function for Custom JWT Claims
-- ============================================================================
-- This function is called during token generation and injects the user's role
-- into the JWT access_token as a custom claim.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    claims JSONB;
    user_role public.app_role;
BEGIN
    -- Get the user's role from user_roles table
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_id = (event->>'user_id')::UUID;
    
    -- Default to 'user' if no role found
    IF user_role IS NULL THEN
        user_role := 'user';
    END IF;

    -- Get existing claims
    claims := event->'claims';
    
    -- Check if 'app_metadata' exists; if not, initialize it
    IF claims->'app_metadata' IS NULL THEN
        claims := jsonb_set(claims, '{app_metadata}', '{}');
    END IF;
    
    -- Set the user_role in app_metadata
    claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role::TEXT));
    
    -- Also set at root level for easier access
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::TEXT));
    
    -- Return the modified event
    RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant execute permission to supabase_auth_admin (required for Auth Hooks)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;

-- ============================================================================
-- STEP 4: Auto-assign 'user' role on signup
-- ============================================================================
-- This trigger automatically creates a user_roles entry when a new user signs up.

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create trigger (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_role();

-- ============================================================================
-- STEP 5: Update RLS policies for admin operations on content tables
-- ============================================================================

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Admins can insert papers" ON public.papers;
DROP POLICY IF EXISTS "Admins can update papers" ON public.papers;
DROP POLICY IF EXISTS "Admins can delete papers" ON public.papers;
DROP POLICY IF EXISTS "Admins can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can view all questions" ON public.questions;

-- Papers: Admins can manage all papers
CREATE POLICY "Admins can insert papers" ON public.papers
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

CREATE POLICY "Admins can update papers" ON public.papers
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

CREATE POLICY "Admins can delete papers" ON public.papers
    FOR DELETE USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

-- Questions: Admins can manage all questions
CREATE POLICY "Admins can insert questions" ON public.questions
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

CREATE POLICY "Admins can update questions" ON public.questions
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

CREATE POLICY "Admins can delete questions" ON public.questions
    FOR DELETE USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

-- Admins can view ALL questions (including inactive ones)
CREATE POLICY "Admins can view all questions" ON public.questions
    FOR SELECT USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

-- ============================================================================
-- STEP 6: Question Contexts table (if not exists)
-- ============================================================================
-- For VARC passages, DILR data sets shared across multiple questions

CREATE TABLE IF NOT EXISTS public.question_contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('VARC', 'DILR', 'QA')),
    context_type TEXT NOT NULL CHECK (context_type IN ('passage', 'data_set', 'image', 'table')),
    title TEXT, -- Optional title/label for the context
    content TEXT NOT NULL, -- The actual passage/data content (supports Markdown)
    image_url TEXT, -- Optional image for DI sets
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add context_id to questions table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'context_id'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN context_id UUID REFERENCES public.question_contexts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for context lookups
CREATE INDEX IF NOT EXISTS idx_questions_context ON public.questions(context_id);
CREATE INDEX IF NOT EXISTS idx_question_contexts_paper ON public.question_contexts(paper_id, section);

-- Enable RLS on question_contexts
ALTER TABLE public.question_contexts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Authenticated users can view active contexts" ON public.question_contexts;
DROP POLICY IF EXISTS "Admins can view all contexts" ON public.question_contexts;
DROP POLICY IF EXISTS "Admins can insert contexts" ON public.question_contexts;
DROP POLICY IF EXISTS "Admins can update contexts" ON public.question_contexts;
DROP POLICY IF EXISTS "Admins can delete contexts" ON public.question_contexts;

-- RLS policies for question_contexts
CREATE POLICY "Authenticated users can view active contexts" ON public.question_contexts
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can view all contexts" ON public.question_contexts
    FOR SELECT USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

CREATE POLICY "Admins can insert contexts" ON public.question_contexts
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

CREATE POLICY "Admins can update contexts" ON public.question_contexts
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

CREATE POLICY "Admins can delete contexts" ON public.question_contexts
    FOR DELETE USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

-- ============================================================================
-- STEP 7: Admin Audit Log table
-- ============================================================================
-- Track all admin actions for security and compliance

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish', etc.
    entity_type TEXT NOT NULL, -- 'paper', 'question', 'context', 'user_role'
    entity_id UUID NOT NULL,
    changes JSONB, -- Before/after snapshot for updates
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_log;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
    FOR SELECT USING (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

-- System/admin can insert logs
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_log
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    );

-- ============================================================================
-- STEP 8: Helper function to check admin status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (SELECT role::TEXT FROM public.user_roles WHERE user_id = auth.uid()),
        'user'
    );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;

-- ============================================================================
-- STEP 9: Bootstrap First Admin (MANUAL STEP)
-- ============================================================================
-- IMPORTANT: Run this ONCE after the first admin user signs up.
-- Replace 'your-user-id-here' with the actual UUID from auth.users
-- 
-- You can find your user ID by running:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
--
-- Then run:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('your-user-id-here', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ============================================================================
-- STEP 10: Activate the Auth Hook in Supabase Dashboard
-- ============================================================================
-- IMPORTANT: After running this migration, you must enable the Auth Hook
-- in the Supabase Dashboard:
-- 
-- 1. Go to Authentication > Hooks
-- 2. Enable "Customize Access Token (JWT) Hook"
-- 3. Select the function: public.custom_access_token_hook
-- 4. Save
--
-- This will inject the user_role claim into every JWT token.

-- ============================================================================
-- STEP 8: Create Storage Bucket for Question Images
-- ============================================================================
-- This bucket stores diagrams and images for questions.
-- Admins can upload, authenticated users can view.

-- Create the storage bucket (run this separately in Storage or via SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'question-images',
    'question-images',
    true,  -- Public bucket for easy image serving
    5242880,  -- 5MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Public read access for question images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload question images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update question images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete question images" ON storage.objects;

-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Public read access for question images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'question-images');

-- Policy: Only admins can upload images
CREATE POLICY "Admins can upload question images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'question-images' 
        AND public.is_admin()
    );

-- Policy: Only admins can update images
CREATE POLICY "Admins can update question images" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'question-images' 
        AND public.is_admin()
    );

-- Policy: Only admins can delete images
CREATE POLICY "Admins can delete question images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'question-images' 
        AND public.is_admin()
    );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration was successful:

-- Check if user_roles table exists
-- SELECT * FROM public.user_roles LIMIT 5;

-- Check if hook function exists
-- SELECT proname FROM pg_proc WHERE proname = 'custom_access_token_hook';

-- Check RLS policies
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
/*
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role;
DROP FUNCTION IF EXISTS public.custom_access_token_hook;
DROP FUNCTION IF EXISTS public.is_admin;
DROP FUNCTION IF EXISTS public.get_user_role;
DROP TABLE IF EXISTS public.admin_audit_log;
DROP TABLE IF EXISTS public.user_roles;
DROP TYPE IF EXISTS public.app_role;
*/
