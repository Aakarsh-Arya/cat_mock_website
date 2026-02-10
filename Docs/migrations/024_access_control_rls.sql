-- ============================================================================
-- Migration 024: Access Control RLS Gate for Attempts/Responses
-- ============================================================================
-- Purpose: Prevent non-active users from creating attempts or writing responses.
-- Dependencies: 023_access_control_foundations.sql (user_access table + enums)
-- ============================================================================

-- --------------------------------------------------------------------------
-- STEP 1: Attempts INSERT policy (require active access or admin)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can create attempts within limit" ON public.attempts;

CREATE POLICY "Users can create attempts within limit" ON public.attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1
                FROM public.user_access ua
                WHERE ua.user_id = auth.uid()
                  AND ua.status = 'active'
            )
        )
        AND (
            (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) IS NULL
            OR (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) <= 0
            OR (
                SELECT COUNT(*)
                FROM public.attempts a
                WHERE a.user_id = auth.uid()
                  AND a.paper_id = attempts.paper_id
                  AND a.status <> 'expired'
            ) < (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id)
        )
    );

-- --------------------------------------------------------------------------
-- STEP 2: Responses INSERT/UPDATE policies (require active access or admin)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can create their own responses" ON public.responses;
CREATE POLICY "Users can create their own responses" ON public.responses
    FOR INSERT TO authenticated
    WITH CHECK (
        attempt_id IN (
            SELECT id
            FROM public.attempts
            WHERE user_id = auth.uid()
              AND status IN ('in_progress', 'paused')
        )
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1
                FROM public.user_access ua
                WHERE ua.user_id = auth.uid()
                  AND ua.status = 'active'
            )
        )
    );

DROP POLICY IF EXISTS "Users can update their own responses" ON public.responses;
CREATE POLICY "Users can update their own responses" ON public.responses
    FOR UPDATE TO authenticated
    USING (
        attempt_id IN (
            SELECT id
            FROM public.attempts
            WHERE user_id = auth.uid()
              AND status IN ('in_progress', 'paused')
        )
    )
    WITH CHECK (
        attempt_id IN (
            SELECT id
            FROM public.attempts
            WHERE user_id = auth.uid()
              AND status IN ('in_progress', 'paused')
        )
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1
                FROM public.user_access ua
                WHERE ua.user_id = auth.uid()
                  AND ua.status = 'active'
            )
        )
    );

-- ============================================================================
-- VERIFICATION (RUN MANUALLY)
-- ============================================================================
-- As pending user:
--   INSERT INTO attempts (...) should fail.
--   INSERT/UPDATE responses should fail.
-- As active user:
--   INSERT INTO attempts (...) should succeed (within attempt limit).

Now I see the issue. The code is using window.location.origin which is correct on the client side. The problem is that Supabase needs the redirect URL whitelisted, and after Google auth completes, Supabase redirects back - but if the URL isn't in the whitelist OR the cookies aren't being set properly, it fails.

Let me check the Supabase client configuration:

Read client.ts, lines 1 to 50

The code looks correct. The issue is external configuration in Supabase and Google Cloud Console.

Here's the exact problem and fix:

When a user signs in via nexams.online, Google OAuth redirects to Supabase, then Supabase redirects back to nexams.online/auth/callback. But if nexams.online isn't properly configured in:

Supabase Auth URL Configuration
Google Cloud Console OAuth Credentials
...then the auth fails silently and the user bounces back to landing.

Fix Step 1: Supabase Dashboard
Go to Supabase → Authentication → URL Configuration:

Site URL: https://nexams.online
Redirect URLs (add ALL of these):
Fix Step 2: Google Cloud Console
Go to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs (the one with ID 649504644405-120c3fib9ddt41us9vs0a6fv2h84bi7e):

In Authorized redirect URIs, add:

This is Supabase's callback URL that Google redirects to. Without this, Google blocks the auth.

Fix Step 3: Netlify Environment Variable
In Netlify → Site settings → Build & deploy → Environment variables:

Then trigger a redeploy.

Fix Step 4: Test
Open incognito browser
Go to https://nexams.online
Click "Sign in with Google"
You should land on /dashboard
The #1 most likely cause is the Google Cloud Console redirect URI is missing. That 649504644405-... client ID must have Supabase's callback URL whitelisted.

Cla