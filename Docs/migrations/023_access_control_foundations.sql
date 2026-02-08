-- ============================================================================
-- Migration 023: Access Control Foundations (Signup Mode + Waitlist)
-- ============================================================================
-- Purpose:
--   1) Central app settings for signup mode (OPEN/GATED)
--   2) Per-user access status (active/pending/rejected)
--   3) Waitlist/access requests inbox
--   4) Deterministic status assignment on signup (fail-closed)
-- ============================================================================

-- ============================================================================
-- STEP 1: ENUM TYPES
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'signup_mode') THEN
        CREATE TYPE public.signup_mode AS ENUM ('OPEN', 'GATED');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_status') THEN
        CREATE TYPE public.access_status AS ENUM ('active', 'pending', 'rejected');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_request_status') THEN
        CREATE TYPE public.access_request_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- ============================================================================
-- STEP 2: APP SETTINGS (CENTRAL BRAIN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.app_settings
DROP CONSTRAINT IF EXISTS app_settings_signup_mode_check;

ALTER TABLE public.app_settings
ADD CONSTRAINT app_settings_signup_mode_check
CHECK (
    setting_key <> 'signup_mode' OR setting_value IN ('OPEN', 'GATED')
);

-- Seed default signup mode (OPEN)
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('signup_mode', 'OPEN')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- STEP 3: USER ACCESS STATUS (PASSPORT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status public.access_status NOT NULL DEFAULT 'pending',
    reason TEXT,
    decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    decided_at TIMESTAMP WITH TIME ZONE,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_access_status ON public.user_access(status);

-- ============================================================================
-- STEP 4: WAITLIST / ACCESS REQUESTS (INBOX)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    status public.access_request_status NOT NULL DEFAULT 'pending',
    source TEXT,
    notes TEXT,
    decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    decided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS access_requests_email_unique
ON public.access_requests (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS access_requests_user_unique
ON public.access_requests (user_id)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_access_requests_status
ON public.access_requests (status);

-- ============================================================================
-- STEP 5: UPDATED_AT TRIGGERS (REUSE handle_updated_at)
-- ============================================================================

DROP TRIGGER IF EXISTS handle_updated_at_app_settings ON public.app_settings;
CREATE TRIGGER handle_updated_at_app_settings
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_user_access ON public.user_access;
CREATE TRIGGER handle_updated_at_user_access
BEFORE UPDATE ON public.user_access
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_access_requests ON public.access_requests;
CREATE TRIGGER handle_updated_at_access_requests
BEFORE UPDATE ON public.access_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- STEP 6: RLS POLICIES
-- ============================================================================

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- App settings: admins only
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
CREATE POLICY "Admins can manage app settings" ON public.app_settings
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- User access: users can view own, admins can manage
DROP POLICY IF EXISTS "Users can view own access status" ON public.user_access;
CREATE POLICY "Users can view own access status" ON public.user_access
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can self-create pending access status" ON public.user_access;
CREATE POLICY "Users can self-create pending access status" ON public.user_access
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Admins can manage access status" ON public.user_access;
CREATE POLICY "Admins can manage access status" ON public.user_access
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Access requests: users can create/view own, admins can manage
DROP POLICY IF EXISTS "Users can create own access request" ON public.access_requests;
CREATE POLICY "Users can create own access request" ON public.access_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Users can view own access request" ON public.access_requests;
CREATE POLICY "Users can view own access request" ON public.access_requests
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage access requests" ON public.access_requests;
CREATE POLICY "Admins can manage access requests" ON public.access_requests
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- STEP 7: DEFAULT ACCESS STATUS ASSIGNMENT (ON SIGNUP)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.assign_access_status_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_mode TEXT;
    v_status public.access_status;
BEGIN
    -- Default to GATED if settings are missing or invalid (fail-closed)
    SELECT CASE
        WHEN setting_value = 'OPEN' THEN 'OPEN'
        WHEN setting_value = 'GATED' THEN 'GATED'
        ELSE 'GATED'
    END
    INTO v_mode
    FROM public.app_settings
    WHERE setting_key = 'signup_mode'
    LIMIT 1;

    IF v_mode IS NULL THEN
        v_mode := 'GATED';
    END IF;

    v_status := CASE WHEN v_mode = 'OPEN'
        THEN 'active'::public.access_status
        ELSE 'pending'::public.access_status
    END;

    INSERT INTO public.user_access (user_id, status, source)
    VALUES (NEW.id, v_status, 'auto_signup')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_access_status ON auth.users;
CREATE TRIGGER on_auth_user_created_access_status
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_access_status_on_signup();

-- Backfill existing users as active (do not retroactively lock)
INSERT INTO public.user_access (user_id, status, source)
SELECT id, 'active'::public.access_status, 'backfill'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (RUN MANUALLY)
-- ============================================================================
-- SELECT * FROM public.app_settings WHERE setting_key = 'signup_mode';
-- SELECT status, COUNT(*) FROM public.user_access GROUP BY status;
-- SELECT * FROM public.access_requests ORDER BY created_at DESC LIMIT 5;
-- SELECT proname FROM pg_proc WHERE proname = 'assign_access_status_on_signup';

-- ============================================================================
-- ROLLBACK (MANUAL)
-- ============================================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created_access_status ON auth.users;
-- DROP FUNCTION IF EXISTS public.assign_access_status_on_signup();
-- DROP TABLE IF EXISTS public.access_requests;
-- DROP TABLE IF EXISTS public.user_access;
-- DROP TABLE IF EXISTS public.app_settings;
-- DROP TYPE IF EXISTS public.access_request_status;
-- DROP TYPE IF EXISTS public.access_status;
-- DROP TYPE IF EXISTS public.signup_mode;
