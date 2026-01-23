This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: node_modules/**, .next/**, dist/**, build/**, .git/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.editorconfig
.gitattributes
.github/workflows/ci.yml
.gitignore
.nvmrc
data/sample-paper-template.json
docs/BLUEPRINT.md
docs/CONTENT-SCHEMA.md
docs/DECISIONS.md
docs/MIGRATION_CONTEXTS.sql
docs/MIGRATION_M5_SCORING.sql
docs/MIGRATION_M6_RBAC.sql
docs/MIGRATION_RLS_VIEWS.sql
docs/MIGRATION_STATS.sql
docs/migrations/002_session_locking.sql
docs/migrations/003_question_container_architecture.sql
docs/Milestone_Change_Log.md
docs/research/stack-evaluation.md
docs/SCHEMA_FIREBASE.md
docs/SCHEMA_SUPABASE.sql
eslint.config.mjs
export_for_gemini.bat
export_for_gemini.ps1
middleware.ts
next.config.js
next.config.ts
package.json
postcss.config.js
public/file.svg
public/globe.svg
public/next.svg
public/vercel.svg
public/window.svg
README.md
scripts/blueprint-guard.mjs
scripts/check-bundle.mjs
scripts/convert_paper_metadata_std.py
scripts/convert_paper_metadata.py
scripts/import-paper.mjs
src/app/admin/contexts/new/page.tsx
src/app/admin/contexts/page.tsx
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/papers/[paperId]/edit/actions.ts
src/app/admin/papers/[paperId]/edit/ExamEditorClient.tsx
src/app/admin/papers/[paperId]/edit/page.tsx
src/app/admin/papers/new/page.tsx
src/app/admin/papers/page.tsx
src/app/admin/question-sets/new/NewQuestionSetClient.tsx
src/app/admin/question-sets/new/page.tsx
src/app/admin/question-sets/page.tsx
src/app/admin/questions/new/page.tsx
src/app/admin/questions/page.tsx
src/app/api/admin/question-sets/route.ts
src/app/api/save/route.ts
src/app/api/submit/route.ts
src/app/auth/callback/route.ts
src/app/auth/logout/route.ts
src/app/auth/sign-in/page.tsx
src/app/auth/test-login/page.tsx
src/app/dashboard/page.tsx
src/app/exam/[attemptId]/ExamClient.tsx
src/app/exam/[attemptId]/page.tsx
src/app/favicon.ico
src/app/globals.css
src/app/layout.tsx
src/app/mock/[paperId]/page.tsx
src/app/mocks/page.tsx
src/app/page.module.css
src/app/page.tsx
src/app/result/[attemptId]/page.tsx
src/features/admin/index.ts
src/features/admin/ui/EditableExamLayout.tsx
src/features/admin/ui/EditableQuestion.tsx
src/features/admin/ui/ExamEditor.tsx
src/features/admin/ui/QuestionSetEditor.tsx
src/features/exam-engine/hooks/useExamTimer.ts
src/features/exam-engine/index.ts
src/features/exam-engine/lib/actions.ts
src/features/exam-engine/lib/index.ts
src/features/exam-engine/lib/scoring.ts
src/features/exam-engine/lib/validation.ts
src/features/exam-engine/model/useExamStore.ts
src/features/exam-engine/ui/ExamLayout.tsx
src/features/exam-engine/ui/ExamTimer.tsx
src/features/exam-engine/ui/index.ts
src/features/exam-engine/ui/MathText.tsx
src/features/exam-engine/ui/MCQRenderer.tsx
src/features/exam-engine/ui/NavigationButtons.tsx
src/features/exam-engine/ui/QuestionAnalysis.tsx
src/features/exam-engine/ui/QuestionPalette.tsx
src/features/exam-engine/ui/QuestionRenderer.tsx
src/features/exam-engine/ui/ResultHeader.tsx
src/features/exam-engine/ui/SectionalPerformance.tsx
src/features/exam-engine/ui/TITARenderer.tsx
src/lib/cloudinary.ts
src/lib/logger.ts
src/lib/rate-limit.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/types/exam.ts
src/utils/update-session.ts
tailwind.config.js
tsconfig.json
```

# Files

## File: docs/BLUEPRINT.md
````markdown
# BLUEPRINT.md — Architecture, Data Model & Routes (v0.1)

## 0) Scope (Milestone 1)
Freeze stack, pages/routes, data model, performance budgets, and CI/CD on **Netlify + Supabase**. No UI build yet.

---

## 1) Architecture (high-level)
**Client (Next.js 14, App Router, TS, Tailwind)**  
→ fetches from **Supabase** (DB/Auth/Storage).  
**Server** = Netlify’s Next.js runtime (SSR/ISR) + Netlify Functions for server actions/webhooks.  
Secrets/keys stored in **Netlify Env** (never in repo).

---

## 2) Pages & Routes (Next.js App Router)
- `/` — Landing (project overview, CTA to start mock)
- `/mocks` — List of papers (year/slot/filter)
- `/mock/[paperId]` — Paper details + “Start test”
- `/exam/[attemptId]` *(protected)* — Test runner (timer, nav)
- `/result/[attemptId]` — Post-submit analytics
- `/dashboard` *(protected)* — My attempts & progress
- `/auth/sign-in`, `/auth/callback` — Supabase OAuth/email
- `/api/submit` — server action/function to finalize attempt
- `/api/webhooks/supabase` — optional (events), future
- 404/500 error routes as defaults

Routing rules:
- Gate `/exam/*` and `/dashboard` via middleware (auth).
- Code-split per route; no heavy libs on first load.

---

## 3) Data Model (Supabase)
All tables `uuid` PK; `created_at timestamptz default now()`. **RLS ON** by default.

### `profiles`
- `user_id uuid` (FK → auth.users, PK)
- `display_name text`
- `avatar_url text`
- `role text` (enum: user, admin)

### `papers`
- `id uuid`
- `title text` (e.g., "CAT 2022 Slot 1")
- `year int2`, `slot text` (S1/S2/S3)
- `duration_min int2` (default 120)
- `sections jsonb` ([{name:"VARC", questions:24, marks:+3/-1}, ...])
- `is_published bool default true`

### `questions`
- `id uuid`
- `paper_id uuid` (FK → papers.id)
- `section text` (VARC/DILR/QA)
- `type text` (MCQ/NAT)
- `stem text` (markdown allowed)
- `options jsonb` (for MCQ: ["A","B","C","D"])
- `answer jsonb` (MCQ: "B"; NAT: "123")
- `marks int2 default 3`, `negative int2 default 1`
- `assets jsonb` (e.g., signed URLs for images)

### `attempts`
- `id uuid`
- `user_id uuid` (FK → profiles.user_id)
- `paper_id uuid` (FK)
- `status text` (in_progress/submitted)
- `started_at timestamptz`, `submitted_at timestamptz`
- `score numeric`, `accuracy numeric`, `time_spent_sec int4`

### `responses`
- `id uuid`
- `attempt_id uuid` (FK → attempts.id)
- `question_id uuid` (FK → questions.id)
- `answer jsonb`
- `is_correct bool`
- `time_spent_sec int4`

### `event_log` (future)
- `id uuid`, `user_id uuid`, `event text`, `meta jsonb`

### `user_roles` (M6+ RBAC)
- `id uuid`
- `user_id uuid` (FK → auth.users, UNIQUE)
- `role app_role` (enum: user, admin, editor)
- `granted_by uuid` (FK → auth.users, nullable)
- `granted_at timestamptz`

### `question_contexts` (M6+ Content)
- `id uuid`
- `paper_id uuid` (FK → papers.id)
- `section text` (VARC/DILR/QA)
- `context_type text` (passage, data_set, image, table)
- `title text` (optional)
- `content text` (Markdown supported)
- `image_url text` (optional)

### `admin_audit_log` (M6+ Security)
- `id uuid`
- `admin_id uuid` (FK → auth.users)
- `action text` (create, update, delete, publish)
- `entity_type text` (paper, question, context, user_role)
- `entity_id uuid`
- `changes jsonb` (before/after snapshot)

**RLS sketch**
- `profiles`: user can read/update own.
- `attempts/responses`: `user_id = auth.uid()`.
- `papers/questions`: read all `is_published = true`; admins full.
- `user_roles`: users can read own; admins can manage all.
- `admin_audit_log`: admins only.

---

## 4a) RBAC Architecture (Milestone 6+)

### Hybrid Claims Model
1. **Source of Truth**: `public.user_roles` table
2. **Performance**: Auth Hook (`custom_access_token_hook`) injects `user_role` into JWT
3. **Enforcement**:
   - Middleware: Gate `/admin/*` routes by checking JWT claims
   - RLS: Database policies check `auth.jwt() ->> 'user_role'`

### Admin Access Flow
1. User signs up → `on_auth_user_created_role` trigger assigns `role = 'user'`
2. Existing admin promotes user → INSERT/UPDATE in `user_roles`
3. User's next session → Auth Hook injects `user_role: 'admin'` into JWT
4. Middleware allows access to `/admin/*` routes
5. RLS policies allow INSERT/UPDATE/DELETE on content tables

### Migration SQL
See `docs/MIGRATION_M6_RBAC.sql` for complete implementation.

---

## 4) Netlify Setup
`netlify.toml` (root of repo):
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NEXT_TELEMETRY_DISABLE = "1"

[[plugins]]
  package = "@netlify/plugin-nextjs"
````

## File: docs/CONTENT-SCHEMA.md
````markdown
# CONTENT-SCHEMA (M0)

## Question Types
- **MCQ**: `id`, `paper_id`, `section`, `type: "MCQ"`, `text`, `options[]`, `answer_key`, optional `solution`, `difficulty`, `assets[]`.
- **TITA**: `id`, `paper_id`, `section`, `type: "TITA"`, `text`, `answer_key` (string or numeric), optional `solution`, `assets[]`.

## Formatting
- Math content uses KaTeX inline `$...$` and block `$$...$$` notation.
- Rich text stays Markdown-compatible for bold, italics, and ordered or unordered lists.

## Assets & Delivery
- Store diagrams and images in Supabase Storage with signed URLs; record paths within `assets[]`.
- Attach fallback copies under `docs/assets/*` if external sources become private.

## Versioning Notes
- Treat this schema as v0.1; update alongside blueprint anchors whenever question formats change.
````

## File: docs/DECISIONS.md
````markdown
# DECISIONS.md – Architecture & SSOT Freeze (v0.1)

## Changelog

### 2026-01-22: Mirror Principle Admin Editor (M6+)
- **Added**: `EditableExamLayout.tsx` - Admin editor that mirrors exam UI exactly
- **Added**: `ImageUploadZone` component with Supabase Storage integration
- **Added**: Back button navigation throughout admin panel
- **Added**: Toast notifications for save success/error feedback
- **Updated**: `MIGRATION_M6_RBAC.sql` - Added `question-images` Storage bucket with RLS policies
- **Changed**: "Pause" button → "Exit Mock" with red styling in exam interface
- **UI**: Editor now matches student exam view 1:1 (Mirror Principle)
- **Storage**: Images upload to `question-images` bucket (5MB limit, admin-only upload)

### 2026-01-21: M6+ RBAC Implementation
- **Added**: `MIGRATION_M6_RBAC.sql` - Complete RBAC migration script
- **Added**: `user_roles` table with `app_role` ENUM
- **Added**: `custom_access_token_hook` for JWT claims injection
- **Added**: RLS policies for admin-only write access
- **Updated**: Middleware to check JWT claims for admin routes
- **Updated**: Admin layout with RBAC enforcement + dev bypass

---

## 1. Tech Stack Choice
**Frontend:** Next.js 14 (App Router)  
**Backend/DB:** Supabase (Auth + Database + Storage)  
**UI Styling:** TailwindCSS  
**TypeScript:** Yes  
**Deployment:** Netlify (Next.js on Netlify + serverless functions) + Supabase (DB/Auth/Storage)  

**Rationale:**  
Next.js App Router allows clean SSR + static hybrid. Supabase offers integrated Auth and SQL DB for free tier. Both integrate smoothly with GitHub for CI/CD.

**Netlify note:** Use the Netlify Next.js runtime/plugin with `netlify.toml`. Env vars live in Netlify → Site settings → Environment.
---

## 2. Trade-offs
| Choice | Advantage | Limitation |
|--------|------------|-------------|
| Supabase | Quick setup, Auth, SQL | Slight vendor lock-in |
| Next.js | SEO + Performance | Learning curve for routing |

---

## 3. Next Steps
- Freeze data model & routes in `BLUEPRINT.md`
- Define performance budget & sign-off as SSOT
````

## File: docs/MIGRATION_CONTEXTS.sql
````sql
-- Question Contexts Migration
-- This table stores shared passages/contexts that questions can reference

-- ============================================================================
-- QUESTION_CONTEXTS TABLE
-- ============================================================================
CREATE TABLE public.question_contexts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('VARC', 'DILR', 'QA')),
  title TEXT NOT NULL,                -- Descriptive title for admin
  text TEXT NOT NULL,                 -- The actual passage/context text
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add context_id to questions table
ALTER TABLE public.questions 
ADD COLUMN context_id UUID REFERENCES public.question_contexts(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX idx_question_contexts_paper_id ON public.question_contexts(paper_id);
CREATE INDEX idx_questions_context_id ON public.questions(context_id);

-- RLS Policies
ALTER TABLE public.question_contexts ENABLE ROW LEVEL SECURITY;

-- Anyone can read contexts (needed for exam display)
CREATE POLICY "Anyone can view question contexts" ON public.question_contexts
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (for admin)
CREATE POLICY "Authenticated users can insert contexts" ON public.question_contexts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contexts" ON public.question_contexts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger to update updated_at
CREATE TRIGGER update_question_contexts_updated_at
  BEFORE UPDATE ON public.question_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
````

## File: docs/MIGRATION_M5_SCORING.sql
````sql
-- =============================================================================
-- MILESTONE 5: Results & Analytics Engine - Database Migration
-- =============================================================================
-- 
-- This migration adds necessary columns for the scoring engine and analytics.
-- EXECUTE IN SUPABASE SQL EDITOR
--
-- Prerequisites:
--   - Tables: attempts, responses, questions must exist
--   - You must have admin/service_role access
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: Attempts Table Enhancements
-- -----------------------------------------------------------------------------

-- Add scoring and analytics columns to attempts table
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS total_score DECIMAL(6,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_possible_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unanswered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accuracy DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attempt_rate DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS percentile DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT NULL;

-- Add submitted_at if not exists (completed exam timestamp)
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN public.attempts.total_score IS 'Final calculated score after applying marking scheme';
COMMENT ON COLUMN public.attempts.max_possible_score IS 'Maximum possible score for the paper';
COMMENT ON COLUMN public.attempts.section_scores IS 'JSONB with section-wise breakdown: {VARC: {score, correct, incorrect, unanswered}, ...}';
COMMENT ON COLUMN public.attempts.accuracy IS 'Percentage of attempted questions that were correct';
COMMENT ON COLUMN public.attempts.attempt_rate IS 'Percentage of total questions that were attempted';
COMMENT ON COLUMN public.attempts.percentile IS 'Percentile rank among all attempts on this paper';
COMMENT ON COLUMN public.attempts.rank IS 'Absolute rank among all attempts on this paper';

-- -----------------------------------------------------------------------------
-- SECTION 2: Responses Table Enhancements
-- -----------------------------------------------------------------------------

-- Add per-question scoring columns to responses table
ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS marks_obtained DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS answer TEXT DEFAULT NULL;

-- Comment on columns
COMMENT ON COLUMN public.responses.is_correct IS 'Whether the response was correct (null if unanswered)';
COMMENT ON COLUMN public.responses.marks_obtained IS 'Points awarded/deducted for this response';
COMMENT ON COLUMN public.responses.answer IS 'Unified answer field (selected_option or tita_answer)';

-- -----------------------------------------------------------------------------
-- SECTION 3: Questions Table - Ensure Required Columns
-- -----------------------------------------------------------------------------

-- Ensure questions table has all required columns for scoring
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS section VARCHAR(20) DEFAULT 'QA',
ADD COLUMN IF NOT EXISTS question_type VARCHAR(10) DEFAULT 'MCQ',
ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(3,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS correct_answer TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS solution_text TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS topic VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Medium';

-- Add check constraints (drop first if exists to avoid errors)
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_section_check;
    ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_type_check;
    
    -- Add constraints
    ALTER TABLE public.questions 
    ADD CONSTRAINT questions_section_check CHECK (section IN ('VARC', 'DILR', 'QA'));
    
    ALTER TABLE public.questions 
    ADD CONSTRAINT questions_type_check CHECK (question_type IN ('MCQ', 'TITA'));
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Constraints may already exist or table structure differs: %', SQLERRM;
END $$;

COMMENT ON COLUMN public.questions.section IS 'CAT section: VARC, DILR, or QA';
COMMENT ON COLUMN public.questions.question_type IS 'MCQ (Multiple Choice) or TITA (Type In The Answer)';
COMMENT ON COLUMN public.questions.marks IS 'Positive marks for correct answer (CAT: 3)';
COMMENT ON COLUMN public.questions.negative_marks IS 'Negative marks for incorrect MCQ (CAT: 1)';

-- -----------------------------------------------------------------------------
-- SECTION 4: Indexes for Performance
-- -----------------------------------------------------------------------------

-- Index for leaderboard queries (ranking by score)
CREATE INDEX IF NOT EXISTS idx_attempts_total_score 
ON public.attempts (total_score DESC NULLS LAST);

-- Composite index for paper-specific leaderboards
CREATE INDEX IF NOT EXISTS idx_attempts_paper_score 
ON public.attempts (paper_id, total_score DESC NULLS LAST);

-- Index for user's attempt history
CREATE INDEX IF NOT EXISTS idx_attempts_user_status 
ON public.attempts (user_id, status, submitted_at DESC);

-- Index for responses by attempt (for result page)
CREATE INDEX IF NOT EXISTS idx_responses_attempt 
ON public.responses (attempt_id);

-- Index for questions by paper (for scoring)
CREATE INDEX IF NOT EXISTS idx_questions_paper_section 
ON public.questions (paper_id, section, question_number);

-- -----------------------------------------------------------------------------
-- SECTION 5: RLS Policies for Scoring Updates
-- -----------------------------------------------------------------------------

-- Drop and recreate policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can update own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can update own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can read questions for their completed attempts" ON public.questions;

-- Allow authenticated users to update their own attempts
CREATE POLICY "Users can update own attempts"
ON public.attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own responses
CREATE POLICY "Users can update own responses"
ON public.responses FOR UPDATE
TO authenticated
USING (
  attempt_id IN (
    SELECT id FROM public.attempts WHERE user_id = auth.uid()
  )
);

-- Allow reading questions for completed attempts (for result page)
-- Note: correct_answer is needed for result display but should be protected during exam
CREATE POLICY "Users can read questions for their completed attempts"
ON public.questions FOR SELECT
TO authenticated
USING (
  paper_id IN (
    SELECT paper_id FROM public.attempts 
    WHERE user_id = auth.uid() AND status = 'completed'
  )
  OR paper_id IN (
    SELECT paper_id FROM public.attempts 
    WHERE user_id = auth.uid() AND status = 'in_progress'
  )
);

-- -----------------------------------------------------------------------------
-- SECTION 6: Verification Queries
-- -----------------------------------------------------------------------------

-- Run these after migration to verify columns exist:

-- Check attempts table columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'attempts' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check responses table columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'responses' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check questions table columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'questions' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
````

## File: docs/MIGRATION_M6_RBAC.sql
````sql
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
````

## File: docs/MIGRATION_RLS_VIEWS.sql
````sql
-- ============================================================================
-- MIGRATION: Update RLS Policies + Add Secure Views
-- Run this on an EXISTING database to apply the new security changes
-- Version: 2.1 - RLS & Views Update
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP OLD POLICIES (if they exist)
-- ============================================================================

-- Drop old papers policy
DROP POLICY IF EXISTS "Authenticated users can view published papers" ON public.papers;
DROP POLICY IF EXISTS "Authenticated users can view available papers" ON public.papers;

-- Drop old questions policy
DROP POLICY IF EXISTS "Authenticated users can view active questions" ON public.questions;

-- ============================================================================
-- STEP 2: CREATE UPDATED RLS POLICIES
-- ============================================================================

-- Papers: Now checks published + availability window
CREATE POLICY "Authenticated users can view available papers" ON public.papers
  FOR SELECT TO authenticated 
  USING (
    -- Admins can see everything
    auth.uid() IN (SELECT id FROM public.users WHERE email LIKE '%@admin%')
    OR (
      -- Published papers within availability window
      published = true
      AND (available_from IS NULL OR available_from <= NOW())
      AND (available_until IS NULL OR available_until >= NOW())
    )
  );

-- Questions: Now checks parent paper is available too
CREATE POLICY "Authenticated users can view active questions" ON public.questions
  FOR SELECT TO authenticated 
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.papers p
      WHERE p.id = paper_id
      AND p.published = true
      AND (p.available_from IS NULL OR p.available_from <= NOW())
      AND (p.available_until IS NULL OR p.available_until >= NOW())
    )
  );

-- ============================================================================
-- STEP 3: CREATE SECURE VIEWS
-- ============================================================================

-- Drop views if they exist (for idempotent migration)
DROP VIEW IF EXISTS public.questions_exam;
DROP VIEW IF EXISTS public.questions_with_solutions;

-- View for exam runtime: questions WITHOUT correct_answer, solution
-- Use this view in app code when fetching questions during an active exam
CREATE VIEW public.questions_exam AS
SELECT 
  id,
  paper_id,
  section,
  question_number,
  question_text,
  question_type,
  options,
  positive_marks,
  negative_marks,
  question_image_url,
  context_id,
  difficulty,
  topic,
  subtopic,
  is_active,
  created_at,
  updated_at
  -- EXCLUDED: correct_answer, solution_text, solution_image_url, video_solution_url
FROM public.questions
WHERE is_active = true;

-- Grant access to authenticated users
GRANT SELECT ON public.questions_exam TO authenticated;

-- View for results/solutions: questions WITH answers (for post-submission review)
CREATE VIEW public.questions_with_solutions AS
SELECT 
  id,
  paper_id,
  section,
  question_number,
  question_text,
  question_type,
  options,
  correct_answer,
  positive_marks,
  negative_marks,
  question_image_url,
  solution_text,
  solution_image_url,
  video_solution_url,
  context_id,
  difficulty,
  topic,
  subtopic
FROM public.questions
WHERE is_active = true;

-- Grant access to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.questions_with_solutions TO authenticated;

-- ============================================================================
-- STEP 4: VERIFY MIGRATION
-- ============================================================================
-- Run these queries to verify the migration worked:

-- Check policies exist:
-- SELECT policyname FROM pg_policies WHERE tablename IN ('papers', 'questions');

-- Check views exist:
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'public';

-- Test questions_exam doesn't have correct_answer:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'questions_exam';

-- ============================================================================
-- DONE! The migration is complete.
-- ============================================================================
````

## File: docs/MIGRATION_STATS.sql
````sql
-- ============================================================================
-- MIGRATION: Peer Statistics RPC Function
-- Creates a secure function to calculate option-level statistics for papers
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP EXISTING FUNCTION (if exists)
-- ============================================================================
DROP FUNCTION IF EXISTS public.get_paper_stats(UUID);

-- ============================================================================
-- STEP 2: CREATE THE STATS FUNCTION
-- ============================================================================
-- Returns aggregated response statistics for a given paper
-- Output format: { [questionId]: { total: number, options: { [optionLabel]: count } } }
-- Security: SECURITY DEFINER ensures the function runs with definer's privileges
-- Only aggregates from 'completed' attempts to ensure data integrity

CREATE OR REPLACE FUNCTION public.get_paper_stats(p_paper_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB := '{}'::JSONB;
    rec RECORD;
    question_stats JSONB;
    option_counts JSONB;
BEGIN
    -- Validate input
    IF p_paper_id IS NULL THEN
        RETURN '{}'::JSONB;
    END IF;

    -- Verify paper exists and user has access (paper must be published)
    IF NOT EXISTS (
        SELECT 1 FROM papers 
        WHERE id = p_paper_id 
        AND published = true
    ) THEN
        RETURN '{}'::JSONB;
    END IF;

    -- Aggregate responses for completed attempts only
    FOR rec IN (
        SELECT 
            r.question_id,
            r.answer,
            COUNT(*) as answer_count
        FROM responses r
        INNER JOIN attempts a ON a.id = r.attempt_id
        WHERE a.paper_id = p_paper_id
        AND a.status = 'completed'
        AND r.answer IS NOT NULL
        AND r.answer != ''
        GROUP BY r.question_id, r.answer
        ORDER BY r.question_id, r.answer
    )
    LOOP
        -- Get existing stats for this question or initialize
        question_stats := COALESCE(result->rec.question_id::TEXT, '{"total": 0, "options": {}}'::JSONB);
        option_counts := COALESCE(question_stats->'options', '{}'::JSONB);
        
        -- Update total and option count
        question_stats := jsonb_set(
            question_stats,
            '{total}',
            to_jsonb((question_stats->>'total')::INT + rec.answer_count::INT)
        );
        
        option_counts := jsonb_set(
            option_counts,
            ARRAY[rec.answer],
            to_jsonb(rec.answer_count::INT)
        );
        
        question_stats := jsonb_set(question_stats, '{options}', option_counts);
        
        -- Update result
        result := jsonb_set(result, ARRAY[rec.question_id::TEXT], question_stats);
    END LOOP;

    RETURN result;
END;
$$;

-- ============================================================================
-- STEP 3: GRANT PERMISSIONS
-- ============================================================================
-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.get_paper_stats(UUID) TO authenticated;

-- ============================================================================
-- STEP 4: CREATE INDEX FOR PERFORMANCE (if not exists)
-- ============================================================================
-- Index on responses(question_id) for faster aggregation
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);

-- Index on attempts(paper_id, status) for faster filtering
CREATE INDEX IF NOT EXISTS idx_attempts_paper_status ON public.attempts(paper_id, status);

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the function works:

-- Check function exists:
-- SELECT proname FROM pg_proc WHERE proname = 'get_paper_stats';

-- Test with a paper_id (replace with actual UUID):
-- SELECT get_paper_stats('your-paper-uuid-here');

-- ============================================================================
-- DONE! The migration is complete.
-- ============================================================================
````

## File: docs/migrations/002_session_locking.sql
````sql
-- ============================================================================
-- Migration: Session Locking for Exam Security
-- @blueprint Security Audit - P0 Fix - Multi-device/tab Prevention
-- ============================================================================
-- Purpose: Prevent users from opening exam in multiple devices/tabs
-- How it works:
--   1. When exam starts, a session_token (UUID) is generated and stored
--   2. All save/submit requests must include matching session_token
--   3. last_activity_at tracks when user was last active
--   4. Stale sessions (>5 min inactive) can be invalidated
-- ============================================================================

-- Add session locking columns to attempts table
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS session_token UUID,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create index for session token lookups
CREATE INDEX IF NOT EXISTS idx_attempts_session_token 
ON attempts(session_token) 
WHERE session_token IS NOT NULL;

-- Create index for activity tracking (useful for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_attempts_last_activity 
ON attempts(last_activity_at) 
WHERE status = 'in_progress';

-- ============================================================================
-- Helper function to validate session token
-- Returns TRUE if session is valid, FALSE otherwise
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stored_token UUID;
    v_user_id UUID;
    v_status TEXT;
BEGIN
    -- Get current attempt state
    SELECT session_token, user_id, status 
    INTO v_stored_token, v_user_id, v_status
    FROM attempts 
    WHERE id = p_attempt_id;
    
    -- Check ownership
    IF v_user_id IS NULL OR v_user_id != p_user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check status
    IF v_status != 'in_progress' THEN
        RETURN FALSE;
    END IF;
    
    -- If no session token set yet (first request), accept and set it
    IF v_stored_token IS NULL THEN
        UPDATE attempts 
        SET session_token = p_session_token, last_activity_at = NOW()
        WHERE id = p_attempt_id AND user_id = p_user_id;
        RETURN TRUE;
    END IF;
    
    -- Validate token matches
    IF v_stored_token = p_session_token THEN
        -- Update activity timestamp
        UPDATE attempts 
        SET last_activity_at = NOW()
        WHERE id = p_attempt_id;
        RETURN TRUE;
    END IF;
    
    -- Token mismatch - possible multi-device attack
    RETURN FALSE;
END;
$$;

-- ============================================================================
-- Function to initialize session for an attempt
-- Called when user starts the exam
-- ============================================================================
CREATE OR REPLACE FUNCTION initialize_exam_session(
    p_attempt_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_token UUID;
    v_current_token UUID;
BEGIN
    -- Check if session already exists
    SELECT session_token INTO v_current_token
    FROM attempts
    WHERE id = p_attempt_id AND user_id = p_user_id AND status = 'in_progress';
    
    IF v_current_token IS NOT NULL THEN
        -- Session already initialized - return existing token
        -- This allows page refresh without breaking the session
        UPDATE attempts SET last_activity_at = NOW() WHERE id = p_attempt_id;
        RETURN v_current_token;
    END IF;
    
    -- Generate new session token
    v_session_token := gen_random_uuid();
    
    -- Store session token
    UPDATE attempts 
    SET session_token = v_session_token, last_activity_at = NOW()
    WHERE id = p_attempt_id 
      AND user_id = p_user_id 
      AND status = 'in_progress';
    
    RETURN v_session_token;
END;
$$;

-- ============================================================================
-- Function to check for stale sessions (admin utility)
-- Sessions with no activity for >5 minutes are considered stale
-- ============================================================================
CREATE OR REPLACE FUNCTION get_stale_exam_sessions(
    p_inactive_minutes INTEGER DEFAULT 5
)
RETURNS TABLE(
    attempt_id UUID,
    user_id UUID,
    started_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    inactive_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id AS attempt_id,
        a.user_id,
        a.started_at,
        a.last_activity_at,
        EXTRACT(EPOCH FROM (NOW() - a.last_activity_at))::INTEGER / 60 AS inactive_minutes
    FROM attempts a
    WHERE a.status = 'in_progress'
      AND a.last_activity_at IS NOT NULL
      AND a.last_activity_at < NOW() - (p_inactive_minutes || ' minutes')::INTERVAL
    ORDER BY a.last_activity_at ASC;
END;
$$;

-- ============================================================================
-- RLS Policy Updates
-- Ensure session_token column is protected from direct client access
-- ============================================================================

-- Note: The session_token should NOT be directly readable by clients
-- It should only be validated server-side via the validate_session_token function
-- If you have RLS policies that SELECT *, consider excluding session_token

-- Example policy (adjust based on your existing RLS setup):
-- CREATE POLICY "Users cannot see session_token directly" 
-- ON attempts FOR SELECT 
-- USING (auth.uid() = user_id)
-- WITH CHECK (false);  -- Prevent updates to session_token from client

-- ============================================================================
-- Rollback script (if needed)
-- ============================================================================
-- DROP FUNCTION IF EXISTS get_stale_exam_sessions(INTEGER);
-- DROP FUNCTION IF EXISTS initialize_exam_session(UUID, UUID);
-- DROP FUNCTION IF EXISTS validate_session_token(UUID, UUID, UUID);
-- DROP INDEX IF EXISTS idx_attempts_last_activity;
-- DROP INDEX IF EXISTS idx_attempts_session_token;
-- ALTER TABLE attempts DROP COLUMN IF EXISTS last_activity_at;
-- ALTER TABLE attempts DROP COLUMN IF EXISTS session_token;
````

## File: docs/migrations/003_question_container_architecture.sql
````sql
-- ============================================================================
-- MIGRATION: Question Container Architecture
-- ============================================================================
-- Purpose: Implement Parent-Child relationship for question sets
-- 
-- Architecture:
--   - question_sets (Parent): Contains context/passage for composite questions
--   - questions (Child): Individual questions linked to a set
--
-- Set Types:
--   - VARC: Reading Comprehension passages with 4-6 questions
--   - DILR: Data Interpretation / Logical Reasoning with charts/tables
--   - CASELET: Case-based questions with shared scenario
--   - ATOMIC: Single standalone question (Quant, standalone Logic)
--
-- Note: Atomic questions create a set with exactly 1 child question
--       This normalizes rendering logic across all question types
-- ============================================================================

-- ============================================================================
-- STEP 0: CLEANUP - Remove any partial objects from failed runs
-- ============================================================================
-- Use DO blocks to handle cases where objects don't exist

DO $$ 
BEGIN
    -- Drop triggers (may fail if tables don't exist)
    DROP TRIGGER IF EXISTS trg_update_question_set_count ON public.questions;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS trg_validate_question_set_publish ON public.question_sets;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop view
DROP VIEW IF EXISTS public.question_sets_with_questions;

-- Drop policies (ignore errors if table doesn't exist)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can read published question sets" ON public.question_sets;
    DROP POLICY IF EXISTS "Admins can manage question sets" ON public.question_sets;
EXCEPTION WHEN undefined_table THEN
    NULL; -- Table doesn't exist, skip
END $$;

-- Drop indexes (these are safe - IF EXISTS handles missing)
DROP INDEX IF EXISTS idx_questions_set_sequence;
DROP INDEX IF EXISTS idx_question_sets_paper_section;
DROP INDEX IF EXISTS idx_questions_set_id;
DROP INDEX IF EXISTS idx_question_sets_type;

-- Remove columns from questions if they exist
ALTER TABLE public.questions DROP COLUMN IF EXISTS set_id;
ALTER TABLE public.questions DROP COLUMN IF EXISTS sequence_order;

-- Drop functions (will cascade to triggers)
DROP FUNCTION IF EXISTS update_question_set_count() CASCADE;
DROP FUNCTION IF EXISTS validate_question_set_publish() CASCADE;

-- Drop the table
DROP TABLE IF EXISTS public.question_sets CASCADE;

-- ============================================================================
-- STEP 1: Create question_sets table (Parent)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.question_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('VARC', 'DILR', 'QA')),
    
    -- Set classification
    set_type TEXT NOT NULL CHECK (set_type IN ('VARC', 'DILR', 'CASELET', 'ATOMIC')),
    
    -- Content Layout determines how to render the context
    -- Options: 'split_passage', 'split_chart', 'split_table', 'single_focus', 'image_top'
    content_layout TEXT NOT NULL DEFAULT 'single_focus',
    
    -- Context content (The passage, chart description, data table, or image)
    context_title TEXT,                      -- Optional title for the context (e.g., "Passage 1")
    context_body TEXT,                       -- Rich text / HTML / Markdown content
    context_image_url TEXT,                  -- Primary image (chart, diagram, table image)
    context_additional_images JSONB,         -- Additional images if needed [{url, caption}]
    
    -- Display configuration
    display_order INTEGER NOT NULL DEFAULT 1, -- Order within the section
    question_count INTEGER NOT NULL DEFAULT 0, -- Denormalized count of child questions
    
    -- Metadata for filtering, analytics, difficulty
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Example metadata structure:
    -- {
    --   "difficulty": "hard",
    --   "topic": "Reading Comprehension",
    --   "subtopic": "Inference",
    --   "tags": ["CAT-2024", "VARC", "RC"],
    --   "source": "CAT 2024 Slot 1",
    --   "estimated_time_minutes": 8
    -- }
    
    -- Publishing state
    is_active BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure unique ordering within section
    UNIQUE(paper_id, section, display_order)
);

-- ============================================================================
-- STEP 2: Alter questions table to add set relationship
-- ============================================================================

-- Add foreign key to question_sets
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS set_id UUID REFERENCES public.question_sets(id) ON DELETE CASCADE;

-- Add sequence order within the set (1, 2, 3... for questions in a passage)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 1;

-- Add constraint for unique sequence within a set
-- Note: Only applies when set_id is NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_set_sequence 
ON public.questions(set_id, sequence_order) 
WHERE set_id IS NOT NULL;

-- ============================================================================
-- STEP 3: Create helper function to update question_count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_question_set_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count on the affected set
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.question_sets 
        SET question_count = (
            SELECT COUNT(*) FROM public.questions WHERE set_id = NEW.set_id
        ),
        updated_at = NOW()
        WHERE id = NEW.set_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        UPDATE public.question_sets 
        SET question_count = (
            SELECT COUNT(*) FROM public.questions WHERE set_id = OLD.set_id
        ),
        updated_at = NOW()
        WHERE id = OLD.set_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic count updates
DROP TRIGGER IF EXISTS trg_update_question_set_count ON public.questions;
CREATE TRIGGER trg_update_question_set_count
AFTER INSERT OR UPDATE OF set_id OR DELETE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION update_question_set_count();

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

-- Index for fetching sets by paper and section
CREATE INDEX IF NOT EXISTS idx_question_sets_paper_section 
ON public.question_sets(paper_id, section, display_order);

-- Index for fetching questions by set
CREATE INDEX IF NOT EXISTS idx_questions_set_id 
ON public.questions(set_id, sequence_order);

-- Index for set_type filtering
CREATE INDEX IF NOT EXISTS idx_question_sets_type 
ON public.question_sets(set_type);

-- ============================================================================
-- STEP 5: Create view for complete question sets with questions
-- ============================================================================
CREATE OR REPLACE VIEW public.question_sets_with_questions AS
SELECT 
    qs.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', q.id,
                'question_text', q.question_text,
                'question_type', q.question_type,
                'options', q.options,
                'positive_marks', q.positive_marks,
                'negative_marks', q.negative_marks,
                'sequence_order', q.sequence_order,
                'difficulty', q.difficulty,
                'topic', q.topic,
                'is_active', q.is_active
            ) ORDER BY q.sequence_order
        ) FILTER (WHERE q.id IS NOT NULL),
        '[]'::json
    ) AS questions
FROM public.question_sets qs
LEFT JOIN public.questions q ON q.set_id = qs.id AND q.is_active = TRUE
WHERE qs.is_active = TRUE
GROUP BY qs.id;

-- ============================================================================
-- STEP 6: RLS Policies for question_sets
-- ============================================================================

-- Enable RLS
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;

-- Public can read published sets from published papers
CREATE POLICY "Anyone can read published question sets" ON public.question_sets
    FOR SELECT
    USING (
        is_active = TRUE 
        AND is_published = TRUE
        AND paper_id IN (SELECT id FROM public.papers WHERE published = TRUE)
    );

-- Admins can do everything (check admin email pattern - matches existing RLS approach)
CREATE POLICY "Admins can manage question sets" ON public.question_sets
    FOR ALL
    USING (
        auth.uid() IN (SELECT id FROM public.users WHERE email LIKE '%@admin%')
    );

-- ============================================================================
-- STEP 7: Validation function - Set cannot be published with 0 questions
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_question_set_publish()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check when publishing (is_published changing to TRUE)
    IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.is_published IS NULL) THEN
        -- Check if set has at least 1 question
        IF NEW.question_count = 0 THEN
            RAISE EXCEPTION 'Cannot publish question set with 0 questions. Set ID: %', NEW.id;
        END IF;
        
        -- For non-ATOMIC types, require context_body
        IF NEW.set_type != 'ATOMIC' AND (NEW.context_body IS NULL OR TRIM(NEW.context_body) = '') THEN
            RAISE EXCEPTION 'Cannot publish composite set without context body. Set ID: %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_question_set_publish ON public.question_sets;
CREATE TRIGGER trg_validate_question_set_publish
BEFORE UPDATE ON public.question_sets
FOR EACH ROW
EXECUTE FUNCTION validate_question_set_publish();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.question_sets IS 'Parent container for grouped questions (RC passages, DI sets, or atomic wrappers)';
COMMENT ON COLUMN public.question_sets.set_type IS 'VARC=Reading Comp, DILR=Data Interp, CASELET=Case Study, ATOMIC=Single Question';
COMMENT ON COLUMN public.question_sets.content_layout IS 'Rendering hint: split_passage, split_chart, single_focus, etc.';
COMMENT ON COLUMN public.question_sets.context_body IS 'The shared passage, chart description, or data for composite questions';
COMMENT ON COLUMN public.question_sets.metadata IS 'JSON with difficulty, topic, tags, source, estimated_time, etc.';
COMMENT ON COLUMN public.questions.set_id IS 'FK to parent question_set. NULL for legacy questions.';
COMMENT ON COLUMN public.questions.sequence_order IS 'Order of question within its set (1, 2, 3...)';
````

## File: docs/Milestone_Change_Log.md
````markdown
# M5 Architecture Log (Milestone 5 - Results & Analytics Engine)

> **Core Philosophy**: "Log the Delta -> Code the Change"
> **Created**: January 21, 2026
> **Status**: ACTIVE

This document serves as the evolutionary change log for Milestone 5. No code or database changes are made without first documenting the "Before vs. After" state here.

---

## Change 001: Server-Side Scoring Engine Implementation

### Change Title
TypeScript-based Scoring Engine (Replace RPC Dependency)

### Context (Before)
- The `submitExam` action in `actions.ts` relies on a Supabase RPC function `finalize_attempt(attempt_id)`
- This creates a logic split where business logic (marking scheme) lives in SQL while application logic lives in TypeScript
- Debugging TITA normalization in SQL is difficult
- The RPC function may not exist in the current Supabase instance

### Proposal (After)
- Create `src/features/exam-engine/lib/scoring.ts` with pure TypeScript scoring logic
- The `submitExam` action will:
  1. Fetch all questions WITH correct_answer from `questions` table (server-side only)
  2. Fetch all user responses from `responses` table
  3. Calculate scores using TypeScript `calculateScore()` function
  4. Apply TITA normalization (trim, lowercase, numeric parsing)
  5. Apply CAT marking scheme: +3 correct, -1 wrong MCQ, 0 wrong TITA, 0 unanswered
  6. Update `attempts` table with calculated scores
  7. Update `responses` table with `is_correct` and `marks_obtained`

### Rationale
- Single source of truth for scoring logic in TypeScript
- Easier unit testing and debugging
- No dependency on external RPC function deployment
- Aligns with Feature-Sliced Design principles

### Schema Impact
None - uses existing columns in `attempts` and `responses` tables

### Migration SQL
None required for this change

### Status: ✅ COMPLETED

**Implementation Details:**
- Created `src/features/exam-engine/lib/scoring.ts`
- Implemented `calculateScore()`, `normalizeString()`, `parseAsNumber()`, `compareAnswers()`, `calculateQuestionMarks()`, `calculateTimeTaken()`
- Updated `submitExam()` in `actions.ts` to use TypeScript scoring instead of RPC
- Exports added to `lib/index.ts`

---

## Change 002: Enhanced Result Page Components

### Change Title
Modular Result Dashboard with Sectional Analysis

### Context (Before)
- Result page exists at `src/app/result/[attemptId]/page.tsx`
- Basic display of scores, inline styles, no component separation
- Limited analytics presentation

### Proposal (After)
- Create modular components:
  - `ResultHeader.tsx` - Summary card with total score, accuracy metrics
  - `SectionalPerformance.tsx` - Section-wise breakdown table/grid
  - `QuestionAnalysis.tsx` - Detailed question-by-question review
- Use proper Tailwind CSS styling
- Display:
  - Total score / max score
  - Section-wise scores (VARC, DILR, QA)
  - Correct/Incorrect/Unanswered counts
  - Accuracy percentage
  - Time taken
  - Rank/Percentile (when available)

### Rationale
- Better user experience
- Modular components for maintainability
- Matches MVP Plan "Detailed Analysis Report" requirements

### Schema Impact
None

### Status: ✅ COMPLETED

**Implementation Details:**
- Created `src/features/exam-engine/ui/ResultHeader.tsx` - Summary card with score, accuracy, percentile, rank, time taken
- Created `src/features/exam-engine/ui/SectionalPerformance.tsx` - Section-wise breakdown with progress bars
- Created `src/features/exam-engine/ui/QuestionAnalysis.tsx` - Client component with filtering, expandable questions, solution display
- Updated `src/app/result/[attemptId]/page.tsx` - Uses new components, fetches questions/responses for analysis
- Exports added to `ui/index.ts`
- Full Tailwind CSS styling applied

---

## Change 003: Scoring Utility with TITA Normalization

### Change Title
TITA Answer Normalization for Accurate Scoring

### Context (Before)
- No TITA normalization logic exists
- Direct string comparison would fail for "42" vs "42 " (trailing space)
- No handling for numeric equivalence ("42" vs "42.0")

### Proposal (After)
Create normalization utility in `scoring.ts`:
```typescript
const normalize = (val: string | number | null): string => {
  if (val === null || val === undefined) return '';
  return String(val).trim().toLowerCase().replace(/\s+/g, ' ');
};
```

For TITA questions:
1. Trim whitespace
2. Convert to lowercase (for text answers)
3. Attempt numeric parsing - if both parse as numbers, compare numerically
4. Handle edge cases: multiple spaces, trailing zeros for decimals

### Rationale
- Prevents user frustration from incorrect marking due to formatting
- Matches expected CAT scoring behavior
- Robust edge case handling

### Schema Impact
None

### Status: ✅ COMPLETED

**Implementation Details:**
- Implemented in `scoring.ts` with `normalizeString()` and `parseAsNumber()` functions
- Handles whitespace, case-insensitivity, numeric equivalence
- Used in `compareAnswers()` for TITA scoring

---

## Change 004: Supabase Schema Extension for Analytics

### Change Title
Add Scoring and Analytics Columns to Attempts Table

### Context (Before)
The `attempts` table may lack some analytics columns needed for complete result storage:
- `total_score` exists but may be nullable
- `section_scores` JSONB may not exist
- Time metrics may need enhancement

### Proposal (After)
Ensure the following columns exist (add if missing):
```sql
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unanswered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accuracy DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attempt_rate DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_possible_score INTEGER DEFAULT NULL;

-- Indexing for Leaderboard performance
CREATE INDEX IF NOT EXISTS idx_attempts_total_score ON public.attempts (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_paper_id_score ON public.attempts (paper_id, total_score DESC);
```

### Rationale
- Denormalization for analytics prevents read amplification
- Computed persistence maintains historical integrity
- JSONB for flexible section-wise storage
- Indexes for future leaderboard queries

### Schema Impact
EXTERNAL - Requires Supabase SQL Editor execution

### Migration SQL
See above

### Status: EXTERNAL DEPENDENCY - DOCUMENT FOR MANUAL EXECUTION

---

## Change 005: Response Table Scoring Fields

### Change Title
Ensure Response Table Has Scoring Fields

### Context (Before)
Need to verify `responses` table has:
- `is_correct` BOOLEAN
- `marks_obtained` DECIMAL

### Proposal (After)
```sql
ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS marks_obtained DECIMAL(5,2) DEFAULT NULL;
```

### Rationale
- Per-question scoring for detailed analysis
- Enables question-by-question review in results

### Schema Impact
EXTERNAL - Requires Supabase SQL Editor execution

### Status: EXTERNAL DEPENDENCY - DOCUMENT FOR MANUAL EXECUTION

---

## Implementation Order

1. [x] Create Milestone_Change_Log.md (this document)
2. [x] Create scoring.ts utility
3. [x] Update actions.ts with TypeScript scoring logic
4. [x] Create Result page components (ResultHeader, SectionalPerformance, QuestionAnalysis)
5. [x] Update result page to use new components
6. [x] Document SQL migrations for external execution
7. [ ] Execute SQL migrations in Supabase (EXTERNAL)
8. [ ] Test full flow

---

## External Dependencies (Require Manual Action)

### Supabase Changes Required:
1. Execute schema migration SQL (Change 004, 005)
2. Verify RLS policies allow UPDATE on attempts by authenticated users
3. Verify INSERT policy on responses table

### Post-Code Deployment:
1. Run migration SQL in Supabase Dashboard -> SQL Editor
2. Verify indexes are created
3. Test with a sample exam submission

---

*Last Updated: January 21, 2026*

---

## Change 006: Security Audit P0 Fixes (Pre-Pilot Hardening)

### Change Title
Security Hardening for Pilot Launch - Rate Limiting, Timer Validation, Integrity Checks

### Context (Before)
- No rate limiting on API endpoints (frontend loop could overwhelm Supabase)
- Timer enforcement purely client-side (manipulable)
- No session locking (multi-device/tab exam abuse possible)
- No submission integrity validation (malicious question IDs possible)
- No security headers (XSS, clickjacking risks)

### Proposal (After)
1. **Rate Limiting** - In-memory per-user rate limiter:
   - `/api/save`: 60 saves per minute
   - `/api/submit`: 5 submissions per minute
   - Pilot-appropriate; upgrade to Redis/Upstash for production

2. **Server-Side Timer Validation** - `submitExam()` validates:
   - Maximum exam duration: 120 minutes (3 sections × 40 min)
   - Grace period: 2 minutes for network latency
   - Late submissions rejected with clear error

3. **Atomic Status Transitions** - Prevent race conditions:
   - Use `.eq('status', 'in_progress')` on updates to prevent double-submission

4. **Submission Integrity Checks**:
   - `saveResponse()` validates questionId belongs to attempt's paper
   - `submitExam()` filters invalid responses before scoring

5. **Security Headers** - Middleware applies:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Cache-Control: no-store` (prevent caching exam content)

6. **Session Locking** (SQL migration prepared):
   - New columns: `session_token UUID`, `last_activity_at TIMESTAMPTZ`
   - Helper functions: `initialize_exam_session()`, `validate_session_token()`
   - Prevents multi-device abuse

### Files Modified
- `src/lib/rate-limit.ts` (NEW) - In-memory rate limiting utility
- `src/features/exam-engine/lib/actions.ts` - Timer validation, integrity checks
- `src/app/api/save/route.ts` - Rate limiting, status checks
- `src/app/api/submit/route.ts` - Rate limiting, uses submitExam action
- `middleware.ts` - Security headers

### Files Created
- `docs/migrations/002_session_locking.sql` - Session locking schema migration

### Schema Impact
EXTERNAL - Requires Supabase SQL Editor execution of `002_session_locking.sql`

### Rationale
- Protect against security vulnerabilities identified in audit
- Prevent abuse of Supabase free tier rate limits
- Ensure exam integrity for pilot launch

### Status: ✅ COMPLETED (Application Code)

**External Dependencies:**
- Execute `docs/migrations/002_session_locking.sql` in Supabase Dashboard
- Implement session token validation in save/submit routes (after migration)

---

## External Dependencies Update

### Supabase Changes Required:
1. Execute schema migration SQL (Change 004, 005)
2. **NEW: Execute session locking migration (Change 006 - `002_session_locking.sql`)**
3. Verify RLS policies allow UPDATE on attempts by authenticated users
4. Verify INSERT policy on responses table

---

*Last Updated: January 22, 2026*
````

## File: docs/research/stack-evaluation.md
````markdown
# Stack Evaluation (SSOT Export)

## Primary: Next.js + Supabase (Free Tier)
- Netlify serves the Next.js App Router with SSR/ISR; Supabase provides Auth, Postgres, and Storage.
- Free tier covers 50k MAU, 500 MB database, 1 GB storage, and 5 GB egress, which supports roughly 200 concurrent exam takers.
- Row-Level Security and signed URLs secure exam data while the JS SDK avoids maintaining custom servers.

## Fallback: Firebase (Firestore + Auth + Storage)
- Daily quotas of 50k reads, 20k writes, 1 GB storage, and 10 GB egress remain sufficient if autosave is optimized.
- Strong real-time and offline support is available, but strict daily limits require monitoring under sudden spikes.

## Deferred: Cloudflare Workers + D1
- Free plan allows about 100k requests per day with global edge delivery, yet D1 is still beta and would add engineering overhead.
- Kept as a future consideration once the MVP stabilizes or if multi-region scaling is required.

## Cost Posture
- All primary services stay within ₹0/month now; a ₹500/month reserve covers Supabase Pro or Firestore Blaze upgrades if usage increases.
````

## File: docs/SCHEMA_FIREBASE.md
````markdown
# Firebase Firestore Schema (Fallback Option)

## Overview
This document outlines the Firestore database structure as a fallback to Supabase. Firestore uses a document-based NoSQL structure with collections and subcollections.

## Collections Structure

### /users/{userId}
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### /papers/{paperId}
```json
{
  "title": "CAT 2024 Paper",
  "year": 2024,
  "totalQuestions": 66,
  "durationMinutes": 180,
  "sections": [
    {"name": "VAR", "questions": 24, "timeMinutes": 40},
    {"name": "DILR", "questions": 20, "timeMinutes": 40},
    {"name": "QA", "questions": 22, "timeMinutes": 40}
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### /papers/{paperId}/questions/{questionId}
```json
{
  "section": "VAR",
  "questionNumber": 1,
  "questionText": "What is the probability...",
  "questionType": "MCQ", // or "TITA"
  "options": ["Option A", "Option B", "Option C", "Option D"], // null for TITA
  "correctAnswer": "A", // or "42" for TITA
  "solutionText": "The correct answer is A because...",
  "solutionImageUrl": "https://storage.googleapis.com/bucket/solution1.png",
  "difficulty": "medium",
  "topic": "Probability",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### /users/{userId}/attempts/{attemptId}
```json
{
  "paperId": "paper123",
  "startedAt": "2025-01-01T10:00:00Z",
  "completedAt": null,
  "status": "in_progress", // "in_progress", "completed", "abandoned"
  "currentSection": "VAR",
  "timeRemaining": {
    "VAR": 2400, // seconds
    "DILR": 2400,
    "QA": 2400
  },
  "totalScore": null,
  "sectionScores": null,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}
```

### /users/{userId}/attempts/{attemptId}/responses/{questionId}
```json
{
  "questionId": "question123",
  "answer": "A",
  "isMarkedForReview": false,
  "timeSpentSeconds": 45,
  "createdAt": "2025-01-01T10:00:45Z",
  "updatedAt": "2025-01-01T10:00:45Z"
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read papers (public)
    match /papers/{paperId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }

    // Users can read questions (public)
    match /papers/{paperId}/questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }

    // Users can manage their own attempts
    match /users/{userId}/attempts/{attemptId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can manage their own responses
    match /users/{userId}/attempts/{attemptId}/responses/{questionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Indexes Required

### Automatic Indexes
Firestore automatically creates indexes for simple queries.

### Composite Indexes Needed
- `papers/{paperId}/questions` on `section` (for section filtering)
- `users/{userId}/attempts` on `status` (for filtering active attempts)
- `users/{userId}/attempts` on `startedAt` (for attempt history)

## Migration Notes

### From Supabase to Firestore
- UUIDs become Firestore document IDs
- Foreign keys become reference paths
- JSON fields become nested objects
- RLS policies become Firestore security rules

### Data Export/Import
- Use Firestore Admin SDK for bulk operations
- Export from Supabase as JSON, transform, import to Firestore
- Handle image URLs (Supabase Storage → Firebase Storage)

## Cost Considerations

### Free Tier Limits
- 50k reads/day
- 20k writes/day
- 1GB storage
- 10GB/month egress

### Usage Estimation
- 200 users × 6 saves/min × 60 min = 72k writes/hour (exceeds free limit)
- Need to reduce autosave frequency (every 15-30 seconds instead of 10)

## Advantages over Supabase
- Better offline support
- Real-time listeners built-in
- Simpler client-side integration

## Disadvantages vs Supabase
- Fixed daily quotas (vs Supabase's flexible throughput limits)
- No built-in SQL queries
- More complex data modeling
````

## File: docs/SCHEMA_SUPABASE.sql
````sql
-- Supabase Database Schema for CAT Mocks
-- This schema defines the core data model for the CAT mock testing platform
-- Version: 2.0 - Production Ready

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,                    -- Profile picture URL
  target_percentile DECIMAL(5,2),     -- User's target CAT percentile (e.g., 99.5)
  target_iims TEXT[],                 -- Target IIMs array (e.g., ['IIM-A', 'IIM-B'])
  total_mocks_taken INTEGER DEFAULT 0,
  best_percentile DECIMAL(5,2),       -- Best percentile achieved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- PAPERS TABLE (exam papers)
-- ============================================================================
CREATE TABLE public.papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE,                   -- URL-friendly identifier (e.g., 'cat-2024-mock-1')
  title TEXT NOT NULL,
  description TEXT,                   -- Brief description of the paper
  year INTEGER NOT NULL,
  
  -- Question & Marking Configuration
  total_questions INTEGER NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 198,  -- CAT: 66 questions × 3 marks = 198
  
  -- Timing
  duration_minutes INTEGER NOT NULL DEFAULT 120, -- CAT 2024: 120 minutes total
  
  -- Section configuration as JSONB
  -- Format: [{"name": "VARC", "questions": 24, "time": 40, "marks": 72}, ...]
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Marking scheme (can be overridden per question)
  default_positive_marks DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  default_negative_marks DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  
  -- Publishing & Scheduling
  published BOOLEAN DEFAULT FALSE,
  available_from TIMESTAMP WITH TIME ZONE,  -- When paper becomes available
  available_until TIMESTAMP WITH TIME ZONE, -- When paper expires
  
  -- Metadata
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'cat-level')),
  is_free BOOLEAN DEFAULT TRUE,       -- For monetization later
  attempt_limit INTEGER,              -- NULL = unlimited attempts
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('VARC', 'DILR', 'QA')), -- CAT sections
  question_number INTEGER NOT NULL,
  
  -- Question content
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('MCQ', 'TITA')),
  options JSONB,                      -- For MCQ: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT NOT NULL,       -- For MCQ: "A"/"B"/"C"/"D", for TITA: exact answer
  
  -- Marking (per question override)
  positive_marks DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  negative_marks DECIMAL(3,1) NOT NULL DEFAULT 1.0, -- 0 for TITA questions
  
  -- Solution & Explanation
  solution_text TEXT,
  solution_image_url TEXT,
  video_solution_url TEXT,            -- YouTube/Vimeo link for video solutions
  
  -- Categorization
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT,                         -- e.g., 'Reading Comprehension', 'Arithmetic'
  subtopic TEXT,                      -- e.g., 'Inference', 'Percentages'
  
  -- Management
  is_active BOOLEAN DEFAULT TRUE,     -- Soft delete / hide questions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(paper_id, section, question_number)
);

-- ============================================================================
-- ATTEMPTS TABLE (user attempts at papers)
-- ============================================================================
CREATE TABLE public.attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,      -- When user clicked submit
  completed_at TIMESTAMP WITH TIME ZONE,      -- When scoring completed
  time_taken_seconds INTEGER,                  -- Actual time taken
  
  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'completed', 'abandoned')),
  current_section TEXT,
  current_question INTEGER DEFAULT 1,
  time_remaining JSONB,               -- {"VARC": 2400, "DILR": 2400, "QA": 2400}
  
  -- Scores (populated after submission)
  total_score DECIMAL(6,2),           -- Can be negative due to negative marking
  max_possible_score DECIMAL(6,2),    -- Usually 198 for CAT
  
  -- Detailed Analytics
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  unanswered_count INTEGER DEFAULT 0,
  
  accuracy DECIMAL(5,2),              -- (correct / attempted) * 100
  attempt_rate DECIMAL(5,2),          -- (attempted / total) * 100
  
  -- Section-wise scores
  section_scores JSONB,               -- {"VARC": {"score": 45, "correct": 15, "incorrect": 3, "unanswered": 6}}
  
  -- Ranking (populated by background job or trigger)
  percentile DECIMAL(5,2),            -- Percentile among all attempts on this paper
  rank INTEGER,                       -- Rank among all attempts on this paper
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- RESPONSES TABLE (user answers)
-- ============================================================================
CREATE TABLE public.responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  
  -- Answer data
  answer TEXT,                        -- User's answer (NULL = unanswered)
  is_correct BOOLEAN,                 -- Populated after submission
  marks_obtained DECIMAL(4,2),        -- +3, -1, or 0
  
  -- State tracking
  status TEXT DEFAULT 'not_visited' CHECK (status IN ('not_visited', 'visited', 'answered', 'marked', 'answered_marked')),
  is_marked_for_review BOOLEAN DEFAULT FALSE,
  
  -- Time analytics
  time_spent_seconds INTEGER DEFAULT 0,
  visit_count INTEGER DEFAULT 0,      -- How many times user visited this question
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(attempt_id, question_id)
);

-- ============================================================================
-- LEADERBOARD TABLE (for efficient ranking queries)
-- ============================================================================
CREATE TABLE public.leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE NOT NULL,
  
  score DECIMAL(6,2) NOT NULL,
  percentile DECIMAL(5,2),
  rank INTEGER,
  
  -- For filtering
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  UNIQUE(paper_id, user_id, attempt_id)
);

-- ============================================================================
-- ANALYTICS TABLE (for tracking user progress over time)
-- ============================================================================
CREATE TABLE public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Aggregate stats
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(6,2),
  average_percentile DECIMAL(5,2),
  best_score DECIMAL(6,2),
  best_percentile DECIMAL(5,2),
  
  -- Section-wise averages
  varc_average DECIMAL(5,2),
  dilr_average DECIMAL(5,2),
  qa_average DECIMAL(5,2),
  
  -- Weak areas (computed periodically)
  weak_topics JSONB,                  -- [{"topic": "Percentages", "accuracy": 45}, ...]
  strong_topics JSONB,
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_questions_paper_section ON public.questions(paper_id, section);
CREATE INDEX idx_questions_active ON public.questions(paper_id, is_active);
CREATE INDEX idx_attempts_user_status ON public.attempts(user_id, status);
CREATE INDEX idx_attempts_paper_score ON public.attempts(paper_id, total_score DESC);
CREATE INDEX idx_responses_attempt ON public.responses(attempt_id);
CREATE INDEX idx_leaderboard_paper_rank ON public.leaderboard(paper_id, rank);
CREATE INDEX idx_leaderboard_paper_percentile ON public.leaderboard(paper_id, percentile DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Papers policies (read-only for authenticated users, must be published AND within availability window)
CREATE POLICY "Authenticated users can view available papers" ON public.papers
  FOR SELECT TO authenticated 
  USING (
    -- Admins can see everything
    auth.uid() IN (SELECT id FROM public.users WHERE email LIKE '%@admin%')
    OR (
      -- Published papers within availability window
      published = true
      AND (available_from IS NULL OR available_from <= NOW())
      AND (available_until IS NULL OR available_until >= NOW())
    )
  );

-- Questions policies (active questions for papers that are available)
-- SECURITY NOTE: This policy allows SELECT on all columns including correct_answer.
-- Use the questions_exam view (defined below) for exam runtime to exclude correct_answer.
-- For result/solution views, use questions_with_answers view (admin or post-submission only).
CREATE POLICY "Authenticated users can view active questions" ON public.questions
  FOR SELECT TO authenticated 
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.papers p
      WHERE p.id = paper_id
      AND p.published = true
      AND (p.available_from IS NULL OR p.available_from <= NOW())
      AND (p.available_until IS NULL OR p.available_until >= NOW())
    )
  );

-- Attempts policies
CREATE POLICY "Users can view their own attempts" ON public.attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" ON public.attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" ON public.attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Responses policies
CREATE POLICY "Users can view their own responses" ON public.responses
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.attempts WHERE id = attempt_id)
  );

CREATE POLICY "Users can create their own responses" ON public.responses
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.attempts WHERE id = attempt_id)
  );

CREATE POLICY "Users can update their own responses" ON public.responses
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.attempts WHERE id = attempt_id)
  );

-- Leaderboard policies (everyone can view, system inserts)
CREATE POLICY "Authenticated users can view leaderboard" ON public.leaderboard
  FOR SELECT TO authenticated USING (true);

-- User analytics policies
CREATE POLICY "Users can view their own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SECURE VIEWS (for column-level security)
-- ============================================================================

-- View for exam runtime: questions WITHOUT correct_answer, solution
-- Use this view in app code when fetching questions during an active exam
CREATE OR REPLACE VIEW public.questions_exam AS
SELECT 
  id,
  paper_id,
  section,
  question_number,
  question_text,
  question_type,
  options,
  positive_marks,
  negative_marks,
  difficulty,
  topic,
  subtopic,
  is_active,
  created_at,
  updated_at
  -- EXCLUDED: correct_answer, solution_text, solution_image_url, video_solution_url
FROM public.questions
WHERE is_active = true;

-- Grant access to authenticated users
GRANT SELECT ON public.questions_exam TO authenticated;

-- View for results/solutions: questions WITH answers (for post-submission review)
-- This can be used after an attempt is completed
CREATE OR REPLACE VIEW public.questions_with_solutions AS
SELECT 
  q.id,
  q.paper_id,
  q.section,
  q.question_number,
  q.question_text,
  q.question_type,
  q.options,
  q.correct_answer,
  q.positive_marks,
  q.negative_marks,
  q.solution_text,
  q.solution_image_url,
  q.video_solution_url,
  q.difficulty,
  q.topic,
  q.subtopic
FROM public.questions q
WHERE q.is_active = true;

-- Grant access to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.questions_with_solutions TO authenticated;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_papers
  BEFORE UPDATE ON public.papers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_questions
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_attempts
  BEFORE UPDATE ON public.attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_responses
  BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SCORING FUNCTION (Called on exam submission)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.finalize_attempt(attempt_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_attempt RECORD;
  v_response RECORD;
  v_question RECORD;
  v_total_score DECIMAL(6,2) := 0;
  v_correct_count INTEGER := 0;
  v_incorrect_count INTEGER := 0;
  v_unanswered_count INTEGER := 0;
  v_section_scores JSONB := '{}'::jsonb;
  v_current_section TEXT;
  v_section_score DECIMAL(6,2);
  v_section_correct INTEGER;
  v_section_incorrect INTEGER;
  v_section_unanswered INTEGER;
  v_total_attempted INTEGER;
  v_total_questions INTEGER;
  v_accuracy DECIMAL(5,2);
  v_attempt_rate DECIMAL(5,2);
  v_max_score DECIMAL(6,2);
BEGIN
  -- Get the attempt
  SELECT * INTO v_attempt FROM public.attempts WHERE id = attempt_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Attempt not found');
  END IF;

  -- Get max possible score from paper
  SELECT total_marks INTO v_max_score FROM public.papers WHERE id = v_attempt.paper_id;

  -- Process each response
  FOR v_response IN 
    SELECT r.*, q.correct_answer, q.positive_marks, q.negative_marks, q.question_type, q.section
    FROM public.responses r
    JOIN public.questions q ON r.question_id = q.id
    WHERE r.attempt_id = attempt_id
  LOOP
    -- Determine if answer is correct
    IF v_response.answer IS NULL OR v_response.answer = '' THEN
      -- Unanswered
      v_unanswered_count := v_unanswered_count + 1;
      UPDATE public.responses 
      SET is_correct = NULL, marks_obtained = 0 
      WHERE id = v_response.id;
    ELSIF LOWER(TRIM(v_response.answer)) = LOWER(TRIM(v_response.correct_answer)) THEN
      -- Correct
      v_correct_count := v_correct_count + 1;
      v_total_score := v_total_score + v_response.positive_marks;
      UPDATE public.responses 
      SET is_correct = true, marks_obtained = v_response.positive_marks 
      WHERE id = v_response.id;
    ELSE
      -- Incorrect
      v_incorrect_count := v_incorrect_count + 1;
      -- TITA questions have no negative marking
      IF v_response.question_type = 'TITA' THEN
        UPDATE public.responses 
        SET is_correct = false, marks_obtained = 0 
        WHERE id = v_response.id;
      ELSE
        v_total_score := v_total_score - v_response.negative_marks;
        UPDATE public.responses 
        SET is_correct = false, marks_obtained = -v_response.negative_marks 
        WHERE id = v_response.id;
      END IF;
    END IF;
  END LOOP;

  -- Calculate section-wise scores
  FOR v_current_section IN SELECT DISTINCT section FROM public.questions WHERE paper_id = v_attempt.paper_id
  LOOP
    SELECT 
      COALESCE(SUM(CASE WHEN r.is_correct = true THEN q.positive_marks ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN r.is_correct = false AND q.question_type = 'MCQ' THEN q.negative_marks ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN r.is_correct = true THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN r.is_correct = false THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN r.is_correct IS NULL THEN 1 ELSE 0 END), 0)
    INTO v_section_score, v_section_correct, v_section_incorrect, v_section_unanswered
    FROM public.responses r
    JOIN public.questions q ON r.question_id = q.id
    WHERE r.attempt_id = attempt_id AND q.section = v_current_section;

    v_section_scores := v_section_scores || jsonb_build_object(
      v_current_section, jsonb_build_object(
        'score', v_section_score,
        'correct', v_section_correct,
        'incorrect', v_section_incorrect,
        'unanswered', v_section_unanswered
      )
    );
  END LOOP;

  -- Calculate accuracy and attempt rate
  v_total_attempted := v_correct_count + v_incorrect_count;
  v_total_questions := v_correct_count + v_incorrect_count + v_unanswered_count;
  
  IF v_total_attempted > 0 THEN
    v_accuracy := (v_correct_count::DECIMAL / v_total_attempted) * 100;
  ELSE
    v_accuracy := 0;
  END IF;
  
  IF v_total_questions > 0 THEN
    v_attempt_rate := (v_total_attempted::DECIMAL / v_total_questions) * 100;
  ELSE
    v_attempt_rate := 0;
  END IF;

  -- Update the attempt with final scores
  UPDATE public.attempts SET
    status = 'completed',
    submitted_at = COALESCE(submitted_at, NOW()),
    completed_at = NOW(),
    total_score = v_total_score,
    max_possible_score = v_max_score,
    correct_count = v_correct_count,
    incorrect_count = v_incorrect_count,
    unanswered_count = v_unanswered_count,
    accuracy = v_accuracy,
    attempt_rate = v_attempt_rate,
    section_scores = v_section_scores,
    time_taken_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
  WHERE id = attempt_id;

  -- Insert/update leaderboard entry
  INSERT INTO public.leaderboard (paper_id, user_id, attempt_id, score, submitted_at)
  VALUES (v_attempt.paper_id, v_attempt.user_id, attempt_id, v_total_score, NOW())
  ON CONFLICT (paper_id, user_id, attempt_id) 
  DO UPDATE SET score = v_total_score, submitted_at = NOW();

  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'total_score', v_total_score,
    'max_score', v_max_score,
    'correct', v_correct_count,
    'incorrect', v_incorrect_count,
    'unanswered', v_unanswered_count,
    'accuracy', v_accuracy,
    'attempt_rate', v_attempt_rate,
    'section_scores', v_section_scores
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERCENTILE CALCULATION FUNCTION (Run periodically or on-demand)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_percentiles(p_paper_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_attempts INTEGER;
  v_record RECORD;
  v_rank INTEGER := 0;
  v_prev_score DECIMAL(6,2) := NULL;
BEGIN
  -- Count total completed attempts for this paper
  SELECT COUNT(*) INTO v_total_attempts 
  FROM public.attempts 
  WHERE paper_id = p_paper_id AND status = 'completed';

  IF v_total_attempts = 0 THEN
    RETURN;
  END IF;

  -- Calculate rank and percentile for each attempt
  FOR v_record IN 
    SELECT id, total_score
    FROM public.attempts
    WHERE paper_id = p_paper_id AND status = 'completed'
    ORDER BY total_score DESC, completed_at ASC
  LOOP
    v_rank := v_rank + 1;
    
    UPDATE public.attempts SET
      rank = v_rank,
      percentile = ((v_total_attempts - v_rank)::DECIMAL / v_total_attempts) * 100
    WHERE id = v_record.id;
    
    -- Also update leaderboard
    UPDATE public.leaderboard SET
      rank = v_rank,
      percentile = ((v_total_attempts - v_rank)::DECIMAL / v_total_attempts) * 100
    WHERE attempt_id = v_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA: Sample CAT Mock Test
-- ============================================================================

-- Insert a sample CAT 2024 Mock Paper
INSERT INTO public.papers (
  slug, title, description, year, 
  total_questions, total_marks, duration_minutes, 
  sections, default_positive_marks, default_negative_marks,
  published, difficulty_level, is_free
) VALUES (
  'cat-2024-mock-1',
  'CAT 2024 Mock Test 1',
  'Full-length CAT mock test following the 2024 pattern with 66 questions across VARC, DILR, and QA sections.',
  2024,
  66, 198, 120,
  '[
    {"name": "VARC", "questions": 24, "time": 40, "marks": 72},
    {"name": "DILR", "questions": 20, "time": 40, "marks": 60},
    {"name": "QA", "questions": 22, "time": 40, "marks": 66}
  ]'::jsonb,
  3.0, 1.0,
  true, 'cat-level', true
);

-- Insert sample VARC questions
INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'VARC', 1,
  'Read the following passage and answer the question:\n\nThe rise of artificial intelligence has fundamentally altered our understanding of creativity. While machines can now compose music, write poetry, and create visual art, the question of whether this constitutes "true" creativity remains contentious.\n\nBased on the passage, the author''s primary purpose is to:',
  'MCQ',
  '["Argue that AI cannot be truly creative", "Present a debate about AI and creativity", "Prove that machines are superior to humans", "Dismiss concerns about artificial intelligence"]'::jsonb,
  'B', 3.0, 1.0, 'medium', 'Reading Comprehension', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'VARC', 2,
  'Choose the sentence that best completes the paragraph:\n\nThe company had been struggling for months. Revenue was declining, employees were leaving, and investor confidence was at an all-time low. ___________',
  'MCQ',
  '["Despite this, the CEO remained optimistic about the future.", "The weather that day was particularly pleasant.", "Similar companies in the industry were thriving.", "The stock market had been volatile for years."]'::jsonb,
  'A', 3.0, 1.0, 'easy', 'Para Completion', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

-- Insert sample DILR questions
INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'DILR', 1,
  'Study the following data and answer:\n\nFive friends A, B, C, D, and E are sitting in a row. A is to the left of B. C is to the right of D. E is not at any end. D is not adjacent to A.\n\nWho is sitting in the middle?',
  'MCQ',
  '["A", "B", "C", "E"]'::jsonb,
  'D', 3.0, 1.0, 'medium', 'Seating Arrangement', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'DILR', 2,
  'A set contains 6 elements. How many subsets of this set contain exactly 3 elements?',
  'TITA',
  NULL,
  '20', 3.0, 0.0, 'easy', 'Combinatorics', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

-- Insert sample QA questions
INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'QA', 1,
  'If the price of an item is increased by 20% and then decreased by 20%, what is the net percentage change in the price?',
  'MCQ',
  '["No change", "4% decrease", "4% increase", "2% decrease"]'::jsonb,
  'B', 3.0, 1.0, 'easy', 'Percentages', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'QA', 2,
  'Find the value of x if: log₂(x) + log₂(x-2) = 3',
  'TITA',
  NULL,
  '4', 3.0, 0.0, 'medium', 'Logarithms', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

INSERT INTO public.questions (paper_id, section, question_number, question_text, question_type, options, correct_answer, positive_marks, negative_marks, difficulty, topic, is_active)
SELECT 
  p.id, 'QA', 3,
  'A train travels from station A to station B at 60 km/h and returns at 40 km/h. What is the average speed for the entire journey?',
  'MCQ',
  '["50 km/h", "48 km/h", "45 km/h", "52 km/h"]'::jsonb,
  'B', 3.0, 1.0, 'medium', 'Time Speed Distance', true
FROM public.papers p WHERE p.slug = 'cat-2024-mock-1';

-- ============================================================================
-- MIGRATION SCRIPT (Run this to update existing database)
-- ============================================================================
-- To migrate an existing database, run these ALTER statements:
/*
-- Add missing columns to papers
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 198;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS default_positive_marks DECIMAL(3,1) DEFAULT 3.0;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS default_negative_marks DECIMAL(3,1) DEFAULT 1.0;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS available_from TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS available_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT TRUE;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS attempt_limit INTEGER;

-- Add missing columns to questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS positive_marks DECIMAL(3,1) DEFAULT 3.0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(3,1) DEFAULT 1.0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS video_solution_url TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS subtopic TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add missing columns to attempts
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS max_possible_score DECIMAL(6,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS unanswered_count INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS accuracy DECIMAL(5,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS attempt_rate DECIMAL(5,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS percentile DECIMAL(5,2);
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS rank INTEGER;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS current_question INTEGER DEFAULT 1;

-- Add missing columns to responses
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS marks_obtained DECIMAL(4,2);
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_visited';
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;

-- Add missing columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_percentile DECIMAL(5,2);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_iims TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_mocks_taken INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS best_percentile DECIMAL(5,2);

-- Update status check constraint for attempts
ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_status_check;
ALTER TABLE public.attempts ADD CONSTRAINT attempts_status_check 
  CHECK (status IN ('in_progress', 'submitted', 'completed', 'abandoned'));

-- Update section check constraint for questions
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_section_check;
ALTER TABLE public.questions ADD CONSTRAINT questions_section_check 
  CHECK (section IN ('VARC', 'DILR', 'QA'));
*/
````

## File: export_for_gemini.bat
````batch
@echo off
REM God Mode: Complete codebase export for Gemini
REM Creates clean, lossless, ready-to-paste context chunks

echo 🚀 Starting God Mode export...

REM Clean up any existing files
echo 🧹 Cleaning up old files...
del /Q repomix-output* 2>nul
del /Q gemini_*.md 2>nul

REM Generate complete codebase export in Markdown format
echo 📦 Running repomix...
npx repomix --style markdown --split-output 900kb --ignore "node_modules/**,.next/**,dist/**,build/**,.git/**"

REM Rename the split files to gemini_XX.md format
echo 📋 Renaming chunks...
move repomix-output.1.md gemini_01.md >nul 2>&1
move repomix-output.2.md gemini_02.md >nul 2>&1
move repomix-output.3.md gemini_03.md >nul 2>&1
move repomix-output.4.md gemini_04.md >nul 2>&1
move repomix-output.5.md gemini_05.md >nul 2>&1

echo ✅ God Mode complete! Files ready:
for %%f in (gemini_*.md) do echo   %%~nf%%~xf

echo.
echo 🎯 Usage: Paste gemini_01.md, gemini_02.md, etc. into Gemini
echo 💡 Each chunk is ~900KB - perfect for Gemini's context window
echo 🔄 Run again anytime: .\export_for_gemini.bat

pause
````

## File: export_for_gemini.ps1
````powershell
# God Mode: Complete codebase export for Gemini
# Creates clean, lossless, ready-to-paste context chunks

Write-Host "🚀 Starting God Mode export..." -ForegroundColor Green

# Clean up any existing files
Write-Host "🧹 Cleaning up old files..." -ForegroundColor Yellow
Remove-Item repomix-output* -ErrorAction SilentlyContinue
Remove-Item gemini_*.md -ErrorAction SilentlyContinue

# Generate complete codebase export in Markdown format
Write-Host "📦 Running repomix..." -ForegroundColor Yellow
& "npx.cmd" repomix --style markdown --split-output 900kb --ignore "node_modules/**,.next/**,dist/**,build/**,.git/**"

# Rename the split files to gemini_XX.md format
Write-Host "📋 Renaming chunks..." -ForegroundColor Yellow
$i = 1
Get-ChildItem repomix-output* -ErrorAction SilentlyContinue | Sort-Object Name | ForEach-Object {
    $newName = "gemini_{0:D2}.md" -f $i
    Rename-Item $_.FullName $newName -Force
    $i++
}

Write-Host "✅ God Mode complete! Files ready:" -ForegroundColor Green
$geminiFiles = Get-ChildItem gemini_*.md -ErrorAction SilentlyContinue | Sort-Object Name
if ($geminiFiles) {
    $geminiFiles | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB, 1)
        Write-Host ("  " + $_.Name + " (" + $sizeKB + " KB)") -ForegroundColor White
    }

    $totalSize = ($geminiFiles | Measure-Object -Property Length -Sum).Sum
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host ("  Total: " + $totalSizeMB + " MB across " + $geminiFiles.Count + " files") -ForegroundColor Gray
} else {
    Write-Host "  No gemini_*.md files found! Repomix may have failed." -ForegroundColor Red
    Write-Host "  Try running manually: npx repomix --style markdown --split-output 900kb --ignore ""node_modules/**,.next/**,dist/**,build/**,.git/**""" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Usage: Paste gemini_01.md, gemini_02.md, etc. into Gemini" -ForegroundColor Cyan
Write-Host "💡 Each chunk is ~900KB - perfect for Gemini's context window" -ForegroundColor Cyan
Write-Host "🔄 Run again anytime: .\export_for_gemini.ps1" -ForegroundColor Magenta
Get-ChildItem gemini_*.md | ForEach-Object {
    Write-Host ("  " + $_.Name + " (" + [math]::Round($_.Length / 1KB, 1) + " KB)")
}

Write-Host ""
Write-Host "🎯 Usage: Paste gemini_01.md, gemini_02.md, etc. into Gemini" -ForegroundColor Cyan
Write-Host "💡 Each chunk is ~900KB - perfect for Gemini's context window" -ForegroundColor Cyan
````

## File: scripts/convert_paper_metadata_std.py
````python
#!/usr/bin/env python3
"""
Parse a CAT paper metadata DOCX (tables) into the JSON schema expected by scripts/import-paper.mjs.
Pure-stdlib parser (no external deps).

Usage:
  python scripts/convert_paper_metadata_std.py --docx "PAPER METADATA_CAT2024_slot1.docx" --out data/cat-2024-slot1.json
  # then upload using Node importer:
  node scripts/import-paper.mjs data/cat-2024-slot1.json --publish
"""

import argparse
import json
import re
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Sequence
import xml.etree.ElementTree as ET

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def _normalize_key(key: str) -> str:
    key = re.sub(r"[^A-Za-z0-9]+", "_", key).strip("_").lower()
    return key


def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _cell_text(cell_el: ET.Element) -> str:
    texts: List[str] = []
    for t in cell_el.iter(f"{W_NS}t"):
        if t.text:
            texts.append(t.text)
    return _clean_text(" ".join(texts))


def _iter_tables(doc_root: ET.Element) -> List[ET.Element]:
    return list(doc_root.iter(f"{W_NS}tbl"))


def _table_to_rows(tbl: ET.Element) -> List[List[str]]:
    rows: List[List[str]] = []
    for tr in tbl.iter(f"{W_NS}tr"):
        cells = [ _cell_text(tc) for tc in tr.iter(f"{W_NS}tc") ]
        if cells:
            rows.append(cells)
    return rows


def parse_meta(rows: Sequence[Sequence[str]]) -> Dict[str, Any]:
    meta: Dict[str, Any] = {}
    for row in rows:
        if len(row) < 2:
            continue
        key = _normalize_key(row[0])
        if not key:
            continue
        meta[key] = row[1]
    return meta


def parse_sections(meta: Dict[str, Any]) -> List[Dict[str, Any]]:
    sections: List[Dict[str, Any]] = []
    raw = meta.get("sections") or meta.get("section_breakup") or meta.get("sectionwise_breakup")
    if not raw:
        return sections
    lines = [p for chunk in raw.split("\n") for p in chunk.split(";") if p.strip()]
    for line in lines:
        parts = [p.strip() for p in re.split(r"[|,:]", line) if p.strip()]
        if len(parts) < 2:
            continue
        name = parts[0].upper()
        def as_int(val):
            try:
                return int(float(val))
            except Exception:
                return None
        questions = as_int(parts[1])
        time_val = as_int(parts[2]) if len(parts) > 2 else None
        marks_val = as_int(parts[3]) if len(parts) > 3 else None
        sections.append({"name": name, "questions": questions, "time": time_val, "marks": marks_val})
    return sections


def detect_question_table(rows: Sequence[Sequence[str]]) -> bool:
    if not rows:
        return False
    headers = [_normalize_key(h) for h in rows[0]]
    needed = {"question", "question_text", "question_number", "qno", "sno"}
    has_needed = any(h in needed for h in headers)
    has_answer = any("answer" in h for h in headers)
    return has_needed and has_answer


def parse_questions(tables: Sequence[ET.Element]) -> List[Dict[str, Any]]:
    questions: List[Dict[str, Any]] = []
    for tbl in tables:
        rows = _table_to_rows(tbl)
        if not detect_question_table(rows):
            continue
        headers = [_normalize_key(h) for h in rows[0]]
        for data_row in rows[1:]:
            row_map = {headers[i]: data_row[i] for i in range(min(len(headers), len(data_row)))}
            q_text = row_map.get("question_text") or row_map.get("question")
            if not q_text:
                continue
            section = (row_map.get("section") or "").upper() or "VARC"
            q_type = (row_map.get("type") or row_map.get("question_type") or "MCQ").upper()
            q_num_raw = row_map.get("question_number") or row_map.get("qno") or row_map.get("sno")
            try:
                q_number = int(float(q_num_raw)) if q_num_raw else len(questions) + 1
            except Exception:
                q_number = len(questions) + 1

            option_keys = [k for k in headers if re.match(r"option[a-d]", k)]
            options = [row_map.get(k) for k in option_keys if row_map.get(k)]
            if q_type == "MCQ" and not options:
                options = [row_map.get(k) for k in ["a", "b", "c", "d"] if row_map.get(k)]

            answer = row_map.get("answer") or row_map.get("correct_answer") or ""
            difficulty = row_map.get("difficulty") or None
            topic = row_map.get("topic") or None
            subtopic = row_map.get("subtopic") or None
            solution = row_map.get("solution") or row_map.get("solution_text") or None

            questions.append({
                "section": section or "VARC",
                "question_number": q_number,
                "question_text": q_text,
                "question_type": "TITA" if q_type == "TITA" else "MCQ",
                "options": options or None,
                "correct_answer": answer,
                "positive_marks": 3.0,
                "negative_marks": 0 if q_type == "TITA" else 1.0,
                "difficulty": difficulty,
                "topic": topic,
                "subtopic": subtopic,
                "solution_text": solution,
            })
    return questions


def build_json(meta: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    slug = meta.get("slug") or meta.get("paper_slug") or "cat-2024"
    title = meta.get("title") or meta.get("paper_title") or "CAT 2024"
    description = meta.get("description") or meta.get("desc")
    year_val = meta.get("year") or meta.get("exam_year") or datetime.now().year
    total_questions = meta.get("total_questions") or len(questions)
    total_marks = meta.get("total_marks") or None
    duration = meta.get("duration_minutes") or meta.get("duration") or 120

    sections = parse_sections(meta)
    if not sections and questions:
        counts: Dict[str, int] = {}
        for q in questions:
            sec = q.get("section", "VARC")
            counts[sec] = counts.get(sec, 0) + 1
        sections = [{"name": k, "questions": v, "time": None, "marks": None} for k, v in counts.items()]

    paper = {
        "slug": slug,
        "title": title,
        "description": description,
        "year": int(float(year_val)) if year_val else datetime.now().year,
        "total_questions": int(float(total_questions)) if total_questions else len(questions),
        "total_marks": int(float(total_marks)) if total_marks else None,
        "duration_minutes": int(float(duration)) if duration else 120,
        "sections": sections,
        "default_positive_marks": 3.0,
        "default_negative_marks": 1.0,
        "difficulty_level": meta.get("difficulty_level") or "cat-level",
        "is_free": True,
        "published": False,
        "available_from": None,
        "available_until": None,
    }

    return {"paper": paper, "questions": questions}


def convert_docx(docx_path: Path) -> Dict[str, Any]:
    with zipfile.ZipFile(docx_path, "r") as zf:
        with zf.open("word/document.xml") as f:
            xml_bytes = f.read()
    root = ET.fromstring(xml_bytes)
    tables = _iter_tables(root)
    if not tables:
        raise ValueError("DOCX contains no tables to parse")
    meta_rows = _table_to_rows(tables[0])
    meta = parse_meta(meta_rows)
    questions = parse_questions(tables[1:]) if len(tables) > 1 else []
    return build_json(meta, questions)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert CAT paper DOCX to JSON (stdlib)")
    parser.add_argument("--docx", required=True, help="Path to PAPER METADATA docx")
    parser.add_argument("--out", required=True, help="Where to write the JSON")
    args = parser.parse_args()

    docx_path = Path(args.docx)
    out_path = Path(args.out)

    data = convert_docx(docx_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON written to {out_path}")


if __name__ == "__main__":
    main()
````

## File: scripts/convert_paper_metadata.py
````python
#!/usr/bin/env python3
"""
Convert a CAT paper metadata DOCX into the JSON schema used by scripts/import-paper.mjs
and optionally upload it to Supabase.

Usage:
  python scripts/convert_paper_metadata.py --docx "/path/to/PAPER METADATA_CAT2024_slot1.docx" --out data/cat-2024-slot1.json --publish

Dependencies:
  pip install python-docx supabase python-dotenv

Env vars (same as import-paper.mjs):
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from docx import Document
from supabase import create_client, Client

# -----------------------------------------------------------------------------
# Parsing helpers
# -----------------------------------------------------------------------------

def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _cell_text(cell) -> str:
    return _clean_text("\n".join(p.text for p in cell.paragraphs))


def _normalize_key(key: str) -> str:
    key = re.sub(r"[^A-Za-z0-9]+", "_", key).strip("_").lower()
    return key


def parse_paper_metadata(table) -> Dict[str, Any]:
    meta: Dict[str, Any] = {}
    for row in table.rows:
        if len(row.cells) < 2:
            continue
        key = _normalize_key(_cell_text(row.cells[0]))
        value = _cell_text(row.cells[1])
        if not key:
            continue
        meta[key] = value
    return meta


def parse_sections(meta: Dict[str, Any]) -> List[Dict[str, Any]]:
    sections: List[Dict[str, Any]] = []
    raw = meta.get("sections") or meta.get("section_breakup") or meta.get("sectionwise_breakup")
    if not raw:
        return sections

    lines = [p for chunk in raw.split("\n") for p in chunk.split(";") if p.strip()]
    for line in lines:
        parts = [p.strip() for p in re.split(r"[|,:]", line) if p.strip()]
        if len(parts) < 2:
            continue
        name = parts[0].upper()
        as_int = lambda x: int(float(x)) if x not in ("", None) else None  # noqa: E731
        try:
            questions = as_int(parts[1])
            time_val = as_int(parts[2]) if len(parts) > 2 else None
            marks_val = as_int(parts[3]) if len(parts) > 3 else None
        except ValueError:
            continue
        sections.append({
            "name": name,
            "questions": questions,
            "time": time_val,
            "marks": marks_val,
        })
    return sections


def detect_question_table(table) -> bool:
    headers = [_normalize_key(_cell_text(cell)) for cell in table.rows[0].cells]
    needed = {"question", "question_text", "question_number"}
    has_needed = any(h in needed for h in headers)
    has_answer = any("answer" in h for h in headers)
    return has_needed and has_answer


def parse_questions(tables: Sequence[Any]) -> List[Dict[str, Any]]:
    questions: List[Dict[str, Any]] = []
    for table in tables:
        if not table.rows:
            continue
        headers = [_normalize_key(_cell_text(cell)) for cell in table.rows[0].cells]
        if not detect_question_table(table):
            continue
        for row in table.rows[1:]:
            cells = row.cells
            row_map = {headers[i]: _cell_text(cells[i]) for i in range(min(len(headers), len(cells)))}
            q_text = row_map.get("question_text") or row_map.get("question")
            if not q_text:
                continue
            section = (row_map.get("section") or "").upper() or "VARC"
            q_type = (row_map.get("type") or row_map.get("question_type") or "MCQ").upper()
            q_num_raw = row_map.get("question_number") or row_map.get("qno") or row_map.get("sno")
            try:
                q_number = int(float(q_num_raw)) if q_num_raw else len(questions) + 1
            except ValueError:
                q_number = len(questions) + 1

            option_keys = [k for k in headers if re.match(r"option[a-d]", k)]
            options = [row_map.get(k) for k in option_keys if row_map.get(k)]
            if q_type == "MCQ" and not options:
                options = [row_map.get(k) for k in ["a", "b", "c", "d"] if row_map.get(k)]

            answer = row_map.get("answer") or row_map.get("correct_answer")
            difficulty = row_map.get("difficulty") or None
            topic = row_map.get("topic") or None
            subtopic = row_map.get("subtopic") or None
            solution = row_map.get("solution") or row_map.get("solution_text") or None

            q_entry = {
                "section": section or "VARC",
                "question_number": q_number,
                "question_text": q_text,
                "question_type": "TITA" if q_type == "TITA" else "MCQ",
                "options": options or None,
                "correct_answer": answer or "",
                "positive_marks": 3.0,
                "negative_marks": 0 if q_type == "TITA" else 1.0,
                "difficulty": difficulty,
                "topic": topic,
                "subtopic": subtopic,
                "solution_text": solution,
            }
            questions.append(q_entry)
    return questions


# -----------------------------------------------------------------------------
# Supabase upload
# -----------------------------------------------------------------------------

def get_supabase_client() -> Client:
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)


def upsert_paper(client: Client, paper: Dict[str, Any]) -> Dict[str, Any]:
    existing = client.table("papers").select("id").eq("slug", paper["slug"]).maybe_single().execute()
    rows = existing.data if hasattr(existing, "data") else existing.get("data")
    paper_payload = {
        "slug": paper["slug"],
        "title": paper["title"],
        "description": paper.get("description"),
        "year": int(paper.get("year") or datetime.now().year),
        "total_questions": int(paper.get("total_questions") or len(paper.get("questions", []))),
        "total_marks": paper.get("total_marks") or 198,
        "duration_minutes": paper.get("duration_minutes") or 120,
        "sections": paper.get("sections") or [],
        "default_positive_marks": float(paper.get("default_positive_marks") or 3.0),
        "default_negative_marks": float(paper.get("default_negative_marks") or 1.0),
        "difficulty_level": paper.get("difficulty_level") or "cat-level",
        "is_free": bool(paper.get("is_free", True)),
        "published": bool(paper.get("published", False)),
        "available_from": paper.get("available_from") or None,
        "available_until": paper.get("available_until") or None,
    }

    if rows:
        paper_id = rows[0]["id"]
        res = client.table("papers").update(paper_payload).eq("id", paper_id).execute()
        return {"id": paper_id, **paper_payload, "_supabase": res}
    res = client.table("papers").insert(paper_payload).execute()
    paper_id = res.data[0]["id"]
    return {"id": paper_id, **paper_payload, "_supabase": res}


def replace_questions(client: Client, paper_id: int, questions: List[Dict[str, Any]]) -> int:
    client.table("questions").delete().eq("paper_id", paper_id).execute()
    batch_size = 50
    total = 0
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i + batch_size]
        payload = []
        for q in batch:
            payload.append({
                "paper_id": paper_id,
                "section": q.get("section"),
                "question_number": int(q.get("question_number", total + 1)),
                "question_text": q.get("question_text"),
                "question_type": q.get("question_type", "MCQ"),
                "options": q.get("options"),
                "correct_answer": q.get("correct_answer"),
                "positive_marks": q.get("positive_marks", 3.0),
                "negative_marks": q.get("negative_marks", 1.0),
                "difficulty": q.get("difficulty"),
                "topic": q.get("topic"),
                "subtopic": q.get("subtopic"),
                "solution_text": q.get("solution_text"),
                "solution_image_url": q.get("solution_image_url"),
                "video_solution_url": q.get("video_solution_url"),
                "is_active": True,
            })
        client.table("questions").insert(payload).execute()
        total += len(batch)
    return total


def publish_paper(client: Client, paper_id: int) -> None:
    client.table("papers").update({"published": True}).eq("id", paper_id).execute()


# -----------------------------------------------------------------------------
# Orchestration
# -----------------------------------------------------------------------------

def build_json(meta: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    slug = meta.get("slug") or meta.get("paper_slug") or "cat-2024"
    title = meta.get("title") or meta.get("paper_title") or "CAT 2024"
    description = meta.get("description") or meta.get("desc")
    year_val = meta.get("year") or meta.get("exam_year") or datetime.now().year
    total_questions = meta.get("total_questions") or len(questions)
    total_marks = meta.get("total_marks") or None
    duration = meta.get("duration_minutes") or meta.get("duration") or 120

    sections = parse_sections(meta)
    if not sections and questions:
        counts: Dict[str, int] = {}
        for q in questions:
            sec = q.get("section", "VARC")
            counts[sec] = counts.get(sec, 0) + 1
        sections = [{"name": k, "questions": v, "time": None, "marks": None} for k, v in counts.items()]

    paper = {
        "slug": slug,
        "title": title,
        "description": description,
        "year": int(float(year_val)) if year_val else datetime.now().year,
        "total_questions": int(float(total_questions)) if total_questions else len(questions),
        "total_marks": int(float(total_marks)) if total_marks else None,
        "duration_minutes": int(float(duration)) if duration else 120,
        "sections": sections,
        "default_positive_marks": 3.0,
        "default_negative_marks": 1.0,
        "difficulty_level": meta.get("difficulty_level") or "cat-level",
        "is_free": True,
        "published": False,
        "available_from": None,
        "available_until": None,
    }

    return {"paper": paper, "questions": questions}


def convert_docx(docx_path: Path) -> Dict[str, Any]:
    doc = Document(docx_path)
    if not doc.tables:
        raise ValueError("DOCX contains no tables to parse")

    paper_meta = parse_paper_metadata(doc.tables[0])
    question_tables = doc.tables[1:] if len(doc.tables) > 1 else []
    questions = parse_questions(question_tables)
    return build_json(paper_meta, questions)


def save_json(data: Dict[str, Any], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert CAT paper DOCX to JSON and upload to Supabase")
    parser.add_argument("--docx", required=True, help="Path to PAPER METADATA docx")
    parser.add_argument("--out", default="data/cat-2024.json", help="Where to write the JSON")
    parser.add_argument("--publish", action="store_true", help="Publish paper after upload")
    parser.add_argument("--upload", action="store_true", help="Upload to Supabase")
    args = parser.parse_args()

    docx_path = Path(args.docx)
    out_path = Path(args.out)

    data = convert_docx(docx_path)
    save_json(data, out_path)
    print(f"✅ JSON written to {out_path}")

    if args.upload:
        client = get_supabase_client()
        paper = data["paper"]
        questions = data["questions"]
        supa_paper = upsert_paper(client, paper)
        count = replace_questions(client, supa_paper["id"], questions)
        if args.publish:
            publish_paper(client, supa_paper["id"])
        print(f"✅ Uploaded paper id={supa_paper['id']} with {count} questions; published={args.publish}")
    else:
        print("ℹ️ Skipped upload (run with --upload to push to Supabase)")


if __name__ == "__main__":
    main()
````

## File: src/app/admin/papers/[paperId]/edit/actions.ts
````typescript
'use server';

/**
 * @fileoverview Admin Server Actions for Paper/Question Management
 * @description Uses service role key to bypass RLS for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { QuestionWithAnswer, QuestionContext, Paper } from '@/types/exam';

// Create admin client with service role key (bypasses RLS)
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations require service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Create SSR client for server actions (must be async to get cookies)
async function createActionClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
    const cookieStore = await cookies();

    return createServerClient(url, anon, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Ignore - cookies can't be set in server actions during render
                }
            },
        },
    });
}

// Verify the user is authenticated and is an admin
async function verifyAdmin(): Promise<{ userId: string; email: string }> {
    // Use action-specific SSR client
    const supabase = await createActionClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log('[verifyAdmin] getUser result:', { user: user?.email, error: error?.message });

    if (error || !user) {
        // Try getSession as fallback
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[verifyAdmin] getSession fallback:', { session: !!session, user: session?.user?.email });

        if (session?.user) {
            return { userId: session.user.id, email: session.user.email || '' };
        }
        throw new Error('Not authenticated');
    }

    // Check admin role - skip check if SKIP_ADMIN_CHECK is set (dev mode)
    if (process.env.SKIP_ADMIN_CHECK !== 'true') {
        const isAdmin = user.email?.includes('@admin') ||
            user.app_metadata?.role === 'admin' ||
            user.user_metadata?.role === 'admin';

        if (!isAdmin) {
            throw new Error('Unauthorized: Admin access required');
        }
    }

    return { userId: user.id, email: user.email || '' };
}

export async function updateQuestion(
    questionId: string,
    questionData: Partial<QuestionWithAnswer>
): Promise<{ success: boolean; data?: QuestionWithAnswer; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('questions')
            .update({
                question_text: questionData.question_text,
                question_type: questionData.question_type,
                options: questionData.options,
                correct_answer: questionData.correct_answer,
                positive_marks: questionData.positive_marks,
                negative_marks: questionData.negative_marks,
                solution_text: questionData.solution_text,
                question_image_url: questionData.question_image_url,
                topic: questionData.topic,
                difficulty: questionData.difficulty,
                context_id: questionData.context_id,
                is_active: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', questionId)
            .select()
            .single();

        if (error) {
            console.error('Admin updateQuestion error:', error);
            return { success: false, error: error.message || 'Failed to update question' };
        }

        return { success: true, data: data as QuestionWithAnswer };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin updateQuestion exception:', message);
        return { success: false, error: message };
    }
}

export async function createQuestion(
    questionData: Partial<QuestionWithAnswer>
): Promise<{ success: boolean; data?: QuestionWithAnswer; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('questions')
            .insert({
                paper_id: questionData.paper_id,
                section: questionData.section,
                question_number: questionData.question_number,
                question_text: questionData.question_text,
                question_type: questionData.question_type,
                options: questionData.options,
                correct_answer: questionData.correct_answer,
                positive_marks: questionData.positive_marks ?? 3,
                negative_marks: questionData.negative_marks ?? 1,
                solution_text: questionData.solution_text,
                question_image_url: questionData.question_image_url,
                topic: questionData.topic,
                difficulty: questionData.difficulty,
                context_id: questionData.context_id,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Admin createQuestion error:', error);
            return { success: false, error: error.message || 'Failed to create question' };
        }

        return { success: true, data: data as QuestionWithAnswer };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin createQuestion exception:', message);
        return { success: false, error: message };
    }
}

export async function updateContext(
    contextId: string,
    contextData: Partial<QuestionContext>
): Promise<{ success: boolean; data?: QuestionContext; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('question_contexts')
            .update({
                title: contextData.title,
                content: contextData.content,
                context_type: contextData.context_type,
                image_url: contextData.image_url,
                is_active: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contextId)
            .select()
            .single();

        if (error) {
            console.error('Admin updateContext error:', error);
            return { success: false, error: error.message || 'Failed to update context' };
        }

        return { success: true, data: data as QuestionContext };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin updateContext exception:', message);
        return { success: false, error: message };
    }
}

export async function createContext(
    contextData: Partial<QuestionContext>,
    displayOrder: number
): Promise<{ success: boolean; data?: QuestionContext; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('question_contexts')
            .insert({
                paper_id: contextData.paper_id,
                section: contextData.section,
                title: contextData.title,
                content: contextData.content,
                context_type: contextData.context_type ?? 'passage',
                image_url: contextData.image_url,
                display_order: displayOrder,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Admin createContext error:', error);
            return { success: false, error: error.message || 'Failed to create context' };
        }

        return { success: true, data: data as QuestionContext };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin createContext exception:', message);
        return { success: false, error: message };
    }
}

export async function updatePaper(
    paperId: string,
    paperData: Partial<Paper>
): Promise<{ success: boolean; error?: string }> {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const { error } = await adminClient
            .from('papers')
            .update(paperData)
            .eq('id', paperId);

        if (error) {
            console.error('Admin updatePaper error:', error);
            return { success: false, error: error.message || 'Failed to update paper' };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Admin updatePaper exception:', message);
        return { success: false, error: message };
    }
}
````

## File: src/app/admin/papers/[paperId]/edit/ExamEditorClient.tsx
````typescript
/**
 * @fileoverview Exam Editor Client Component
 * @description Client wrapper for the ExamEditor with server actions
 * @blueprint M6+ - Mirror Principle
 */

'use client';

import { useCallback, useState } from 'react';
import { EditableExamLayout } from '@/features/admin';
import type { Paper, QuestionWithAnswer, QuestionContext } from '@/types/exam';
import {
    updateQuestion,
    createQuestion,
    updateContext,
    createContext,
    updatePaper,
} from './actions';

interface ExamEditorClientProps {
    paper: Paper;
    initialQuestions: QuestionWithAnswer[];
    initialContexts: QuestionContext[];
}

export function ExamEditorClient({
    paper,
    initialQuestions,
    initialContexts,
}: ExamEditorClientProps) {
    const [questions, setQuestions] = useState<QuestionWithAnswer[]>(initialQuestions);
    const [contexts, setContexts] = useState<QuestionContext[]>(initialContexts);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

    // Clear notifications after delay
    const showNotification = useCallback((type: 'success' | 'error', message: string, retry?: () => void) => {
        if (type === 'success') {
            setSaveSuccess(message);
            setSaveError(null);
            setRetryAction(null);
            setTimeout(() => setSaveSuccess(null), 3000);
        } else {
            setSaveError(message);
            setSaveSuccess(null);
            setRetryAction(() => retry ?? null);
            setTimeout(() => setSaveError(null), 5000);
        }
    }, []);

    // Save question to database using server action
    const handleSaveQuestion = useCallback(async (questionData: Partial<QuestionWithAnswer>) => {
        const nowIso = new Date().toISOString();

        try {
            if (questionData.id) {
                const previousQuestion = questions.find(q => q.id === questionData.id) ?? null;
                if (previousQuestion) {
                    const optimisticQuestion = {
                        ...previousQuestion,
                        ...questionData,
                        updated_at: nowIso,
                    } as QuestionWithAnswer;

                    setQuestions(prev =>
                        prev.map(q => q.id === questionData.id ? optimisticQuestion : q)
                    );
                }

                // Update existing question via server action
                const result = await updateQuestion(questionData.id, questionData);

                if (!result.success || !result.data) {
                    console.error('Failed to update question:', result.error);
                    if (previousQuestion) {
                        setQuestions(prev => prev.map(q => q.id === previousQuestion.id ? previousQuestion : q));
                    }
                    showNotification('error', result.error || 'Failed to save', () => handleSaveQuestion(questionData));
                    return;
                }

                // Update local state
                setQuestions(prev =>
                    prev.map(q => q.id === result.data!.id ? result.data! : q)
                );
                showNotification('success', 'Question updated successfully!');
            } else {
                const tempId = `temp-${Date.now()}`;
                const optimisticQuestion: QuestionWithAnswer = {
                    id: tempId,
                    paper_id: questionData.paper_id ?? paper.id,
                    section: questionData.section ?? 'VARC',
                    question_number: questionData.question_number ?? 1,
                    question_text: questionData.question_text ?? '',
                    question_type: questionData.question_type ?? 'MCQ',
                    options: questionData.options ?? null,
                    correct_answer: questionData.correct_answer ?? 'A',
                    positive_marks: questionData.positive_marks ?? 3,
                    negative_marks: questionData.negative_marks ?? 1,
                    solution_text: questionData.solution_text ?? undefined,
                    solution_image_url: questionData.solution_image_url ?? undefined,
                    question_image_url: questionData.question_image_url ?? undefined,
                    difficulty: questionData.difficulty ?? undefined,
                    topic: questionData.topic ?? undefined,
                    subtopic: questionData.subtopic ?? undefined,
                    is_active: true,
                    created_at: nowIso,
                    updated_at: nowIso,
                };

                setQuestions(prev => [...prev, optimisticQuestion]);

                // Create new question via server action
                const result = await createQuestion({
                    ...questionData,
                    paper_id: questionData.paper_id ?? paper.id,
                });

                if (!result.success || !result.data) {
                    console.error('Failed to create question:', result.error);
                    setQuestions(prev => prev.filter(q => q.id !== tempId));
                    showNotification('error', result.error || 'Failed to create', () => handleSaveQuestion(questionData));
                    return;
                }

                // Add to local state
                setQuestions(prev => prev.map(q => q.id === tempId ? result.data! : q));
                showNotification('success', 'Question created successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving question:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleSaveQuestion(questionData));
        }
    }, [paper.id, questions, showNotification]);

    // Save context to database using server action
    const handleSaveContext = useCallback(async (contextData: Partial<QuestionContext>) => {
        const nowIso = new Date().toISOString();

        try {
            if (contextData.id) {
                const previousContext = contexts.find(c => c.id === contextData.id) ?? null;
                if (previousContext) {
                    const optimisticContext = {
                        ...previousContext,
                        ...contextData,
                        updated_at: nowIso,
                    } as QuestionContext;

                    setContexts(prev =>
                        prev.map(c => c.id === contextData.id ? optimisticContext : c)
                    );
                }

                // Update existing context via server action
                const result = await updateContext(contextData.id, contextData);

                if (!result.success || !result.data) {
                    console.error('Failed to update context:', result.error);
                    if (previousContext) {
                        setContexts(prev => prev.map(c => c.id === previousContext.id ? previousContext : c));
                    }
                    showNotification('error', result.error || 'Failed to save context', () => handleSaveContext(contextData));
                    return;
                }

                setContexts(prev =>
                    prev.map(c => c.id === result.data!.id ? result.data! : c)
                );
                showNotification('success', 'Context updated successfully!');
            } else {
                const tempId = `temp-${Date.now()}`;
                const displayOrder = contexts.filter(c => c.section === contextData.section).length;
                const optimisticContext: QuestionContext = {
                    id: tempId,
                    paper_id: contextData.paper_id ?? paper.id,
                    section: contextData.section ?? 'VARC',
                    title: contextData.title ?? undefined,
                    content: contextData.content ?? '',
                    context_type: contextData.context_type ?? 'passage',
                    image_url: contextData.image_url ?? undefined,
                    display_order: displayOrder,
                    is_active: true,
                    created_at: nowIso,
                    updated_at: nowIso,
                };

                setContexts(prev => [...prev, optimisticContext]);

                // Create new context via server action
                const result = await createContext(
                    { ...contextData, paper_id: contextData.paper_id ?? paper.id },
                    displayOrder
                );

                if (!result.success || !result.data) {
                    console.error('Failed to create context:', result.error);
                    setContexts(prev => prev.filter(c => c.id !== tempId));
                    showNotification('error', result.error || 'Failed to create context', () => handleSaveContext(contextData));
                    return;
                }

                setContexts(prev => prev.map(c => c.id === tempId ? result.data! : c));
                showNotification('success', 'Context created successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving context:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleSaveContext(contextData));
        }
    }, [contexts, paper.id, showNotification]);

    // Update paper metadata using server action
    const handleUpdatePaper = useCallback(async (paperData: Partial<Paper>) => {
        try {
            const result = await updatePaper(paper.id, paperData);

            if (!result.success) {
                console.error('Failed to update paper:', result.error);
                showNotification('error', result.error || 'Failed to update paper', () => handleUpdatePaper(paperData));
                return;
            }

            showNotification('success', 'Paper updated successfully!');
        } catch (err) {
            console.error('Unexpected error updating paper:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            showNotification('error', message, () => handleUpdatePaper(paperData));
        }
    }, [paper.id, showNotification]);

    return (
        <>
            {/* Toast Notifications */}
            {(saveError || saveSuccess) && (
                <div className="fixed top-4 right-4 z-50">
                    {saveError && (
                        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{saveError}</span>
                            {retryAction && (
                                <button
                                    onClick={retryAction}
                                    className="ml-2 text-white/90 hover:text-white underline"
                                >
                                    Retry
                                </button>
                            )}
                            <button onClick={() => setSaveError(null)} className="ml-2 hover:opacity-70">×</button>
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{saveSuccess}</span>
                        </div>
                    )}
                </div>
            )}
            <EditableExamLayout
                paper={paper}
                questions={questions}
                contexts={contexts}
                onSaveQuestion={handleSaveQuestion}
                onSaveContext={handleSaveContext}
            />
        </>
    );
}
````

## File: src/app/admin/papers/[paperId]/edit/page.tsx
````typescript
/**
 * @fileoverview Admin Paper Editor Page
 * @description In-context exam editor with Mirror Principle - edit questions in exam layout
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

import { notFound } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { ExamEditorClient } from './ExamEditorClient';

interface PageProps {
    params: Promise<{ paperId: string }>;
}

export default async function AdminPaperEditorPage({ params }: PageProps) {
    const { paperId } = await params;
    const supabase = await sbSSR();

    // Fetch paper
    const { data: paper, error: paperError } = await supabase
        .from('papers')
        .select('*')
        .eq('id', paperId)
        .single();

    if (paperError || !paper) {
        notFound();
    }

    // Fetch all questions for this paper
    const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('question_number', { ascending: true });

    // Fetch all contexts for this paper
    const { data: contexts } = await supabase
        .from('question_contexts')
        .select('*')
        .eq('paper_id', paperId)
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

    return (
        <ExamEditorClient
            paper={paper}
            initialQuestions={questions ?? []}
            initialContexts={contexts ?? []}
        />
    );
}
````

## File: src/app/admin/question-sets/new/NewQuestionSetClient.tsx
````typescript
/**
 * @fileoverview New Question Set Client Component
 * @description Client-side form for creating question sets
 * @blueprint Question Container Architecture
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SectionName, ContentLayoutType } from '@/types/exam';

// Local type that includes ATOMIC (matches database schema)
type QuestionSetType = 'VARC' | 'DILR' | 'CASELET' | 'ATOMIC';

interface Paper {
    id: string;
    title: string;
    slug: string;
}

interface NewQuestionSetClientProps {
    papers: Paper[];
}

interface QuestionDraft {
    tempId: string;
    question_text: string;
    question_type: 'MCQ' | 'TITA';
    options: string[];
    correct_answer: string;
    positive_marks: number;
    negative_marks: number;
    difficulty?: string;
    topic?: string;
}

const SET_TYPES: { value: QuestionSetType; label: string; description: string }[] = [
    { value: 'VARC', label: 'VARC (Reading Comprehension)', description: 'Passage with 4-6 comprehension questions' },
    { value: 'DILR', label: 'DILR (Data Interpretation / Logical Reasoning)', description: 'Chart/table/data set with analytical questions' },
    { value: 'CASELET', label: 'Caselet', description: 'Case study with multiple questions' },
    { value: 'ATOMIC', label: 'Atomic (Single Question)', description: 'Standalone question without shared context' },
];

const CONTENT_LAYOUTS: { value: ContentLayoutType; label: string }[] = [
    { value: 'split_passage', label: 'Split: Passage Left, Question Right' },
    { value: 'split_chart', label: 'Split: Chart Left, Question Right' },
    { value: 'split_table', label: 'Split: Table Left, Question Right' },
    { value: 'single_focus', label: 'Single Focus (Full Width)' },
    { value: 'image_top', label: 'Image Top, Question Below' },
];

const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];

export function NewQuestionSetClient({ papers }: NewQuestionSetClientProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [selectedPaperId, setSelectedPaperId] = useState(papers[0]?.id ?? '');
    const [section, setSection] = useState<SectionName>('VARC');
    const [setType, setSetType] = useState<QuestionSetType>('VARC');
    const [contentLayout, setContentLayout] = useState<ContentLayoutType>('split_passage');
    const [contextTitle, setContextTitle] = useState('');
    const [contextBody, setContextBody] = useState('');
    const [contextImageUrl, setContextImageUrl] = useState('');

    // Questions
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);

    // Auto-suggest layout based on set type
    const handleSetTypeChange = (newType: QuestionSetType) => {
        setSetType(newType);
        if (newType === 'VARC') {
            setContentLayout('split_passage');
            setSection('VARC');
        } else if (newType === 'DILR') {
            setContentLayout('split_chart');
            setSection('DILR');
        } else if (newType === 'CASELET') {
            setContentLayout('split_passage');
        } else if (newType === 'ATOMIC') {
            setContentLayout('single_focus');
            // Add one empty question for atomic
            if (questions.length === 0) {
                addQuestion();
            }
        }
    };

    // Add a new question
    const addQuestion = useCallback(() => {
        setQuestions(prev => [...prev, {
            tempId: `temp-${Date.now()}`,
            question_text: '',
            question_type: 'MCQ',
            options: ['', '', '', ''],
            correct_answer: 'A',
            positive_marks: 3,
            negative_marks: 1,
        }]);
    }, []);

    // Update a question
    const updateQuestion = useCallback((tempId: string, updates: Partial<QuestionDraft>) => {
        setQuestions(prev => prev.map(q =>
            q.tempId === tempId ? { ...q, ...updates } : q
        ));
    }, []);

    // Remove a question
    const removeQuestion = useCallback((tempId: string) => {
        setQuestions(prev => prev.filter(q => q.tempId !== tempId));
    }, []);

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!selectedPaperId) {
            setError('Please select a paper');
            return;
        }
        if (setType !== 'ATOMIC' && !contextBody.trim()) {
            setError('Context/passage is required for this set type');
            return;
        }
        if (questions.length === 0) {
            setError('At least one question is required');
            return;
        }
        for (const q of questions) {
            if (!q.question_text.trim()) {
                setError('All questions must have text');
                return;
            }
        }

        setSaving(true);

        try {
            // Create the question set via API
            const response = await fetch('/api/admin/question-sets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paper_id: selectedPaperId,
                    section,
                    set_type: setType,
                    content_layout: contentLayout,
                    context_title: contextTitle || null,
                    context_body: contextBody || null,
                    context_image_url: contextImageUrl || null,
                    questions: questions.map((q, index) => ({
                        ...q,
                        sequence_order: index + 1,
                    })),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create question set');
            }

            // Redirect to question sets list
            router.push('/admin/question-sets');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Question Set</h1>
                    <p className="text-gray-600">Add a new RC passage, DI/LR set, or atomic question</p>
                </div>
                <Link
                    href="/admin/question-sets"
                    className="text-gray-600 hover:text-gray-900"
                >
                    ← Back to Question Sets
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Paper Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">1. Select Paper</h2>
                    <select
                        value={selectedPaperId}
                        onChange={(e) => setSelectedPaperId(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    >
                        <option value="">Select a paper...</option>
                        {papers.map(paper => (
                            <option key={paper.id} value={paper.id}>
                                {paper.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Set Type & Configuration */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">2. Set Type & Configuration</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Set Type
                            </label>
                            <select
                                value={setType}
                                onChange={(e) => handleSetTypeChange(e.target.value as QuestionSetType)}
                                className="w-full border rounded-lg px-4 py-2"
                            >
                                {SET_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {SET_TYPES.find(t => t.value === setType)?.description}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section
                            </label>
                            <select
                                value={section}
                                onChange={(e) => setSection(e.target.value as SectionName)}
                                className="w-full border rounded-lg px-4 py-2"
                            >
                                {SECTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content Layout
                        </label>
                        <select
                            value={contentLayout}
                            onChange={(e) => setContentLayout(e.target.value as ContentLayoutType)}
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            {CONTENT_LAYOUTS.map(layout => (
                                <option key={layout.value} value={layout.value}>
                                    {layout.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Context/Passage */}
                {setType !== 'ATOMIC' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">3. Context / Passage</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title (optional)
                                </label>
                                <input
                                    type="text"
                                    value={contextTitle}
                                    onChange={(e) => setContextTitle(e.target.value)}
                                    placeholder="e.g., Passage 1, Data Set A"
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content *
                                </label>
                                <textarea
                                    value={contextBody}
                                    onChange={(e) => setContextBody(e.target.value)}
                                    placeholder="Enter the passage, data description, or context here..."
                                    rows={10}
                                    className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={contextImageUrl}
                                    onChange={(e) => setContextImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            {setType === 'ATOMIC' ? '3. Question' : '4. Questions'}
                        </h2>
                        {setType !== 'ATOMIC' && (
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                            >
                                + Add Question
                            </button>
                        )}
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No questions yet.</p>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="mt-2 text-blue-600 hover:underline"
                            >
                                Add your first question
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {questions.map((q, index) => (
                                <div key={q.tempId} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Question {index + 1}</span>
                                        {(setType !== 'ATOMIC' || questions.length > 1) && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(q.tempId)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <textarea
                                            value={q.question_text}
                                            onChange={(e) => updateQuestion(q.tempId, { question_text: e.target.value })}
                                            placeholder="Enter question text..."
                                            rows={3}
                                            className="w-full border rounded px-3 py-2"
                                            required
                                        />

                                        <div className="grid grid-cols-3 gap-3">
                                            <select
                                                value={q.question_type}
                                                onChange={(e) => updateQuestion(q.tempId, {
                                                    question_type: e.target.value as 'MCQ' | 'TITA',
                                                    negative_marks: e.target.value === 'TITA' ? 0 : 1,
                                                })}
                                                className="border rounded px-3 py-2"
                                            >
                                                <option value="MCQ">MCQ</option>
                                                <option value="TITA">TITA (Numeric)</option>
                                            </select>

                                            <input
                                                type="number"
                                                value={q.positive_marks}
                                                onChange={(e) => updateQuestion(q.tempId, { positive_marks: Number(e.target.value) })}
                                                className="border rounded px-3 py-2"
                                                placeholder="+Marks"
                                                step="0.5"
                                            />

                                            <input
                                                type="number"
                                                value={q.negative_marks}
                                                onChange={(e) => updateQuestion(q.tempId, { negative_marks: Number(e.target.value) })}
                                                className="border rounded px-3 py-2"
                                                placeholder="-Marks"
                                                step="0.5"
                                                disabled={q.question_type === 'TITA'}
                                            />
                                        </div>

                                        {q.question_type === 'MCQ' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {['A', 'B', 'C', 'D'].map((label, i) => (
                                                    <div key={label} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${q.tempId}`}
                                                            checked={q.correct_answer === label}
                                                            onChange={() => updateQuestion(q.tempId, { correct_answer: label })}
                                                        />
                                                        <span className="font-medium">{label}.</span>
                                                        <input
                                                            type="text"
                                                            value={q.options[i]}
                                                            onChange={(e) => {
                                                                const newOptions = [...q.options];
                                                                newOptions[i] = e.target.value;
                                                                updateQuestion(q.tempId, { options: newOptions });
                                                            }}
                                                            placeholder={`Option ${label}`}
                                                            className="flex-1 border rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {q.question_type === 'TITA' && (
                                            <input
                                                type="text"
                                                value={q.correct_answer}
                                                onChange={(e) => updateQuestion(q.tempId, { correct_answer: e.target.value })}
                                                placeholder="Correct answer (e.g., 42, 3.14)"
                                                className="w-full border rounded px-3 py-2"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/admin/question-sets"
                        className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Creating...' : 'Create Question Set'}
                    </button>
                </div>
            </form>
        </div>
    );
}
````

## File: src/app/admin/question-sets/new/page.tsx
````typescript
/**
 * @fileoverview New Question Set Page
 * @description Create a new question set with passage/context and questions
 * @blueprint Question Container Architecture
 */

import { sbSSR } from '@/lib/supabase/server';
import { NewQuestionSetClient } from './NewQuestionSetClient';

export default async function NewQuestionSetPage() {
    const supabase = await sbSSR();

    // Fetch all papers for the dropdown
    const { data: papers } = await supabase
        .from('papers')
        .select('id, title, slug')
        .order('created_at', { ascending: false });

    return <NewQuestionSetClient papers={papers ?? []} />;
}
````

## File: src/app/admin/question-sets/page.tsx
````typescript
/**
 * @fileoverview Admin Question Sets Page
 * @description List and manage question sets (RC passages, DI sets, etc.)
 * @blueprint Question Container Architecture
 */

import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function QuestionSetsPage() {
    const supabase = await sbSSR();

    // Fetch all question sets with question counts
    const { data: questionSets, error } = await supabase
        .from('question_sets')
        .select(`
            *,
            papers!inner(title, slug)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching question sets:', error);
    }

    // Define type for question set from database
    type QuestionSetRow = NonNullable<typeof questionSets>[number];

    interface GroupedSet {
        paper: { title: string; slug: string };
        sets: QuestionSetRow[];
    }

    // Group by paper for display
    const groupedSets = (questionSets ?? []).reduce<Record<string, GroupedSet>>((acc, set) => {
        const paperId = set.paper_id;
        if (!acc[paperId]) {
            acc[paperId] = {
                paper: set.papers,
                sets: [],
            };
        }
        acc[paperId].sets.push(set);
        return acc;
    }, {});

    const getSetTypeColor = (setType: string) => {
        switch (setType) {
            case 'VARC': return 'bg-purple-100 text-purple-800';
            case 'DILR': return 'bg-orange-100 text-orange-800';
            case 'CASELET': return 'bg-blue-100 text-blue-800';
            case 'ATOMIC': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSectionColor = (section: string) => {
        switch (section) {
            case 'VARC': return 'bg-section-varc/10 text-section-varc';
            case 'DILR': return 'bg-section-dilr/10 text-section-dilr';
            case 'QA': return 'bg-section-qa/10 text-section-qa';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Question Sets</h1>
                    <p className="text-gray-600 mt-1">
                        Manage RC passages, DI/LR sets, and grouped questions
                    </p>
                </div>
                <Link
                    href="/admin/question-sets/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Question Set
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Total Sets</p>
                    <p className="text-2xl font-bold">{questionSets?.length ?? 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg shadow p-4">
                    <p className="text-sm text-purple-600">VARC Passages</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {questionSets?.filter(s => s.set_type === 'VARC').length ?? 0}
                    </p>
                </div>
                <div className="bg-orange-50 rounded-lg shadow p-4">
                    <p className="text-sm text-orange-600">DILR Sets</p>
                    <p className="text-2xl font-bold text-orange-700">
                        {questionSets?.filter(s => s.set_type === 'DILR').length ?? 0}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">Atomic Questions</p>
                    <p className="text-2xl font-bold text-gray-700">
                        {questionSets?.filter(s => s.set_type === 'ATOMIC').length ?? 0}
                    </p>
                </div>
            </div>

            {/* Question Sets List */}
            {Object.keys(groupedSets).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Sets Yet</h3>
                    <p className="text-gray-500 mb-4">
                        Create your first question set to organize RC passages, DI/LR sets, and grouped questions.
                    </p>
                    <Link
                        href="/admin/question-sets/new"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Question Set
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedSets).map(([paperId, { paper, sets }]) => (
                        <div key={paperId} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h2 className="font-semibold text-gray-900">{paper.title}</h2>
                                <p className="text-sm text-gray-500">{sets.length} question set(s)</p>
                            </div>
                            <div className="divide-y">
                                {sets.map((set) => (
                                    <div key={set.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSectionColor(set.section)}`}>
                                                        {set.section}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSetTypeColor(set.set_type)}`}>
                                                        {set.set_type}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {set.context_title || `Set #${set.display_order}`}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {set.question_count} question(s) •
                                                        Layout: {set.content_layout}
                                                        {set.is_published && (
                                                            <span className="ml-2 text-green-600">✓ Published</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/question-sets/${set.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                        {set.context_body && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {set.context_body.substring(0, 200)}...
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
````

## File: src/app/api/admin/question-sets/route.ts
````typescript
/**
 * @fileoverview Question Sets API Route
 * @description CRUD operations for question sets
 * @blueprint Question Container Architecture
 */

import { NextRequest, NextResponse } from 'next/server';
import { sbSSR } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await sbSSR();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            paper_id,
            section,
            set_type,
            content_layout,
            context_title,
            context_body,
            context_image_url,
            questions,
        } = body;

        // Validate required fields
        if (!paper_id || !section || !set_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get next display_order for this section
        const { data: existingSets } = await supabase
            .from('question_sets')
            .select('display_order')
            .eq('paper_id', paper_id)
            .eq('section', section)
            .order('display_order', { ascending: false })
            .limit(1);

        const nextDisplayOrder = (existingSets?.[0]?.display_order ?? 0) + 1;

        // Create the question set
        const { data: questionSet, error: setError } = await supabase
            .from('question_sets')
            .insert({
                paper_id,
                section,
                set_type,
                content_layout: content_layout || 'single_focus',
                context_title: context_title || null,
                context_body: context_body || null,
                context_image_url: context_image_url || null,
                display_order: nextDisplayOrder,
                is_active: true,
                is_published: false,
            })
            .select()
            .single();

        if (setError) {
            console.error('Error creating question set:', setError);
            return NextResponse.json({ error: setError.message }, { status: 500 });
        }

        // Create questions if provided
        if (questions && questions.length > 0) {
            // Get next question_number for this paper/section
            const { data: existingQuestions } = await supabase
                .from('questions')
                .select('question_number')
                .eq('paper_id', paper_id)
                .eq('section', section)
                .order('question_number', { ascending: false })
                .limit(1);

            let nextQuestionNumber = (existingQuestions?.[0]?.question_number ?? 0) + 1;

            const questionsToInsert = questions.map((q: {
                question_text: string;
                question_type: string;
                options?: string[];
                correct_answer: string;
                positive_marks?: number;
                negative_marks?: number;
                sequence_order?: number;
                difficulty?: string;
                topic?: string;
            }, index: number) => ({
                paper_id,
                section,
                set_id: questionSet.id,
                question_number: nextQuestionNumber + index,
                sequence_order: q.sequence_order || index + 1,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.question_type === 'MCQ' ? q.options : null,
                correct_answer: q.correct_answer,
                positive_marks: q.positive_marks ?? 3,
                negative_marks: q.negative_marks ?? (q.question_type === 'TITA' ? 0 : 1),
                difficulty: q.difficulty || null,
                topic: q.topic || null,
                is_active: true,
            }));

            const { error: questionsError } = await supabase
                .from('questions')
                .insert(questionsToInsert);

            if (questionsError) {
                console.error('Error creating questions:', questionsError);
                // Rollback: delete the question set
                await supabase.from('question_sets').delete().eq('id', questionSet.id);
                return NextResponse.json({ error: questionsError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, data: questionSet });
    } catch (error) {
        console.error('Question sets API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await sbSSR();

        const { searchParams } = new URL(request.url);
        const paperId = searchParams.get('paper_id');

        let query = supabase
            .from('question_sets_with_questions')
            .select('*')
            .order('display_order', { ascending: true });

        if (paperId) {
            query = query.eq('paper_id', paperId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching question sets:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Question sets API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
````

## File: src/features/admin/index.ts
````typescript
/**
 * @fileoverview Admin Feature Exports
 * @description Barrel exports for admin UI components
 * @blueprint M6+ - Mirror Principle Components
 */

export { EditableQuestion } from './ui/EditableQuestion';
export { ExamEditor } from './ui/ExamEditor';
export { EditableExamLayout } from './ui/EditableExamLayout';
export { QuestionSetEditor } from './ui/QuestionSetEditor';  // Question Container Architecture
````

## File: src/features/admin/ui/EditableExamLayout.tsx
````typescript
/**
 * @fileoverview Editable Exam Layout (Mirror Principle)
 * @description Exact replica of ExamLayout but with editable fields
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paper, QuestionWithAnswer, SectionName, QuestionContext, QuestionType } from '@/types/exam';
import { uploadToCloudinary } from '@/lib/cloudinary';

// =============================================================================
// TYPES
// =============================================================================

interface EditableExamLayoutProps {
    paper: Paper;
    questions: QuestionWithAnswer[];
    contexts: QuestionContext[];
    onSaveQuestion: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    onSaveContext?: (context: Partial<QuestionContext>) => Promise<void>;
    onDeleteContext?: (contextId: string) => Promise<void>;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
const SECTIONS: SectionName[] = ['VARC', 'DILR', 'QA'];

// =============================================================================
// EDITABLE HEADER (Mirrors ExamHeader)
// =============================================================================

interface EditableHeaderProps {
    paper: Paper;
    currentSectionIndex: number;
    onSectionChange: (index: number) => void;
}

function EditableHeader({ paper, currentSectionIndex, onSectionChange }: EditableHeaderProps) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-exam-header-from to-exam-header-to text-white shadow-md">
            <div className="max-w-screen-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left - Back Button + Paper Info */}
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <button
                            onClick={() => router.push('/admin/papers')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Back to Papers"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-yellow-500/80 text-gray-900 text-[10px] font-bold rounded tracking-wider">
                                ✏️ EDIT
                            </span>
                            <h1 className="text-xl font-bold">{paper.title}</h1>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-blue-100">
                            <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                {paper.total_questions} Questions
                            </span>
                        </div>
                    </div>

                    {/* Center - Section Tabs (Clickable in edit mode) */}
                    <div className="hidden md:flex items-center gap-2">
                        {SECTIONS.map((section, index) => {
                            const getSectionButtonClasses = () => {
                                const base = 'px-4 py-2 rounded-md text-sm font-semibold transition-colors border cursor-pointer';
                                if (index !== currentSectionIndex) {
                                    return `${base} bg-white/10 text-blue-100 border-white/20 hover:bg-white/20`;
                                }
                                // Active section - use section color
                                switch (section) {
                                    case 'VARC': return `${base} bg-section-varc text-white border-section-varc`;
                                    case 'DILR': return `${base} bg-section-dilr text-white border-section-dilr`;
                                    case 'QA': return `${base} bg-section-qa text-white border-section-qa`;
                                    default: return `${base} bg-white text-exam-header-from border-white`;
                                }
                            };
                            return (
                                <button
                                    key={section}
                                    onClick={() => onSectionChange(index)}
                                    className={getSectionButtonClasses()}
                                >
                                    {section}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right - Exit Button */}
                    <Link
                        href="/admin/papers"
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md text-sm transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden sm:inline">Exit Editor</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

// =============================================================================
// EDITABLE MCQ OPTION (Mirrors MCQOption)
// =============================================================================

interface EditableOptionProps {
    label: string;
    value: string;
    isCorrect: boolean;
    onChange: (value: string) => void;
    onMarkCorrect: () => void;
}

function EditableOption({ label, value, isCorrect, onChange, onMarkCorrect }: EditableOptionProps) {
    return (
        <div
            className={`
                w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all
                ${isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
            `}
        >
            {/* Option Label - Click to mark correct */}
            <button
                type="button"
                onClick={onMarkCorrect}
                title={isCorrect ? 'Correct answer' : 'Click to mark as correct'}
                className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-bold transition-colors cursor-pointer
                    ${isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                    }
                `}
            >
                {label}
            </button>

            {/* Editable Option Text (WYSIWYG Mirror Style) */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter option ${label}...`}
                className="flex-1 text-left bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded outline-none text-gray-800 transition-colors"
            />

            {/* Correct Indicator */}
            {isCorrect && (
                <span className="flex-shrink-0 text-green-500 text-sm font-medium">✓ Correct</span>
            )}
        </div>
    );
}

// =============================================================================
// IMAGE UPLOAD ZONE (Where diagrams appear in exam)
// =============================================================================

interface ImageUploadZoneProps {
    imageUrl: string | null;
    onUpload: (file: File) => Promise<void>;
    onRemove: () => void;
    isUploading: boolean;
    label?: string;
}

function ImageUploadZone({ imageUrl, onUpload, onRemove, isUploading, label = 'Diagram/Image' }: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await onUpload(file);
        }
    }, [onUpload]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onUpload(file);
        }
    }, [onUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!isDragging) {
            setIsDragging(true);
        }
    }, [isDragging]);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    if (imageUrl) {
        return (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={imageUrl} alt={label} className="w-full max-h-64 object-contain" />
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove image"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">{label}</span>
                        <span className="text-xs text-gray-400">Drop image here or click to upload</span>
                    </div>
                )}
            </label>
        </div>
    );
}

// =============================================================================
// EDITABLE CONTEXT PANE (Mirrors ContextPane from ExamLayout)
// =============================================================================

interface EditableContextPaneProps {
    context: QuestionContext | null;
    contexts: QuestionContext[];
    section: SectionName;
    paperId: string;
    onSave: (context: Partial<QuestionContext>) => Promise<void>;
    onSelectContext: (contextId: string | null) => void;
    selectedContextId: string | null;
}

function EditableContextPane({
    context,
    contexts,
    section,
    paperId,
    onSave,
    onSelectContext,
    selectedContextId,
}: EditableContextPaneProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(context?.title ?? '');
    const [content, setContent] = useState(context?.content ?? '');
    const [contextType, setContextType] = useState<'passage' | 'data_set' | 'image' | 'table'>(
        (context?.context_type as 'passage' | 'data_set' | 'image' | 'table') ?? 'passage'
    );
    const [imageUrl, setImageUrl] = useState<string | null>(context?.image_url ?? null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when context changes
    useEffect(() => {
        setTitle(context?.title ?? '');
        setContent(context?.content ?? '');
        setContextType((context?.context_type as 'passage' | 'data_set' | 'image' | 'table') ?? 'passage');
        setImageUrl(context?.image_url ?? null);
        setIsEditing(!context);
    }, [context?.id]);

    const handleImageUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImageUrl(url);
        } catch (error) {
            console.error('Failed to upload context image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const sectionContexts = contexts.filter(c => c.section === section);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                ...context,
                paper_id: paperId,
                section,
                title: title || undefined,
                content,
                context_type: contextType,
                image_url: imageUrl ?? undefined,
                is_active: true,
                display_order: context?.display_order ?? sectionContexts.length + 1,
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 border-r border-gray-200 h-full flex flex-col">
            {/* Sticky Header with context selector */}
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {section === 'VARC' ? 'Reading Passage' : 'Data Set / Context'}
                    </h3>
                    {!isEditing && context && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {/* Context Selector Dropdown */}
                <select
                    value={selectedContextId ?? 'none'}
                    onChange={(e) => onSelectContext(e.target.value === 'none' ? null : e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                >
                    <option value="none">— No Context —</option>
                    <option value="new">+ Create New Context</option>
                    {sectionContexts.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.title || `Context ${c.display_order}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Scrollable Content / Edit Form */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {selectedContextId === 'new' || isEditing ? (
                    <div className="space-y-3">
                        <select
                            value={contextType}
                            onChange={(e) => setContextType(e.target.value as typeof contextType)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                        >
                            <option value="passage">Passage</option>
                            <option value="data_set">Data Set</option>
                            <option value="table">Table</option>
                            <option value="image">Image Only</option>
                        </select>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Context title (e.g., Passage 1, Set A)..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={section === 'VARC'
                                ? 'Paste the reading passage here...'
                                : 'Enter the data set, table description, or context...'}
                            rows={12}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono leading-relaxed"
                        />

                        {/* Context Image Upload (for DILR diagrams, charts, tables) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-600">
                                Context Image (Diagrams, Charts, Tables)
                            </label>
                            <ImageUploadZone
                                onUpload={handleImageUpload}
                                imageUrl={imageUrl}
                                onRemove={() => setImageUrl(null)}
                                label="Drop context image or click to upload"
                                isUploading={isUploading}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    if (selectedContextId === 'new') {
                                        onSelectContext(null);
                                    }
                                }}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving || !content.trim()}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Context'}
                            </button>
                        </div>
                    </div>
                ) : context ? (
                    <div className="space-y-4">
                        {/* Context Image */}
                        {context.image_url && (
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                                <img
                                    src={context.image_url}
                                    alt={context.title || 'Context image'}
                                    className="w-full object-contain max-h-80"
                                />
                            </div>
                        )}
                        {/* Context Text */}
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {context.content}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No context selected</p>
                        <p className="text-xs mt-1">Select or create a context above</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// EDITABLE QUESTION AREA (Mirrors QuestionArea exactly)
// =============================================================================

interface EditableQuestionAreaProps {
    question: Partial<QuestionWithAnswer> | null;
    questionNumber: number;
    totalQuestions: number;
    section: SectionName;
    paperId: string;
    contexts: QuestionContext[];
    onSave: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    onSaveContext: (context: Partial<QuestionContext>) => Promise<void>;
    isSaving: boolean;
}

function EditableQuestionArea({
    question,
    questionNumber,
    totalQuestions,
    section,
    paperId,
    contexts,
    onSave,
    onSaveContext,
    isSaving,
}: EditableQuestionAreaProps) {
    // Local state for editing
    const [questionText, setQuestionText] = useState(question?.question_text ?? '');
    const [questionType, setQuestionType] = useState<QuestionType>(question?.question_type ?? 'MCQ');
    const [options, setOptions] = useState<string[]>(question?.options ?? ['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer ?? 'A');
    const [positiveMarks, setPositiveMarks] = useState(question?.positive_marks ?? 3);
    const [negativeMarks, setNegativeMarks] = useState(question?.negative_marks ?? 1);
    const [solutionText, setSolutionText] = useState(question?.solution_text ?? '');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedContextId, setSelectedContextId] = useState<string | null>(
        question?.context_id ?? null
    );
    const questionTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (!question) {
            setQuestionText('');
            setQuestionType('MCQ');
            setOptions(['', '', '', '']);
            setCorrectAnswer('A');
            setPositiveMarks(3);
            setNegativeMarks(1);
            setSelectedContextId(null);
            setSolutionText('');
            setImageUrl(null);
            setSelectedContextId(null);
            return;
        }

        setQuestionText(question.question_text ?? '');
        setQuestionType(question.question_type ?? 'MCQ');
        setOptions(question.options ?? ['', '', '', '']);
        setCorrectAnswer(question.correct_answer ?? 'A');
        setPositiveMarks(question.positive_marks ?? 3);
        setNegativeMarks(question.negative_marks ?? 1);
        setSolutionText(question.solution_text ?? '');
        setImageUrl(question.question_image_url ?? null);
        setSelectedContextId(question.context_id ?? null);
    }, [question?.id]);

    useEffect(() => {
        const textarea = questionTextareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [questionText]);

    // Handle option change
    const handleOptionChange = useCallback((index: number, value: string) => {
        setOptions(prev => {
            const newOptions = [...prev];
            newOptions[index] = value;
            return newOptions;
        });
    }, []);

    // Handle image upload to Cloudinary
    const handleImageUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImageUrl(url);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Handle save - include context_id
    const handleSave = useCallback(async () => {
        const questionData: Partial<QuestionWithAnswer> = {
            ...question,
            paper_id: paperId,
            section,
            question_number: questionNumber,
            question_text: questionText,
            question_type: questionType,
            options: questionType === 'MCQ' ? options : null,
            correct_answer: correctAnswer,
            positive_marks: positiveMarks,
            negative_marks: questionType === 'TITA' ? 0 : negativeMarks,
            solution_text: solutionText || undefined,
            question_image_url: imageUrl || undefined,
            context_id: selectedContextId && selectedContextId !== 'new' ? selectedContextId : undefined,
            is_active: true,
        };

        await onSave(questionData);
    }, [question, paperId, section, questionNumber, questionText, questionType, options, correctAnswer, positiveMarks, negativeMarks, solutionText, imageUrl, selectedContextId, onSave]);

    // Get current context object
    const currentContext = selectedContextId && selectedContextId !== 'new'
        ? contexts.find(c => c.id === selectedContextId) ?? null
        : null;

    // Determine if we show split view (VARC/DILR sections typically have contexts)
    const showSplitView = section === 'VARC' || section === 'DILR';

    // ==========================================================================
    // SPLIT VIEW: For VARC/DILR with context pane on the left
    // ==========================================================================
    if (showSplitView) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-220px)] min-h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                {/* Left Pane: Editable Context/Passage */}
                <div className="order-1 lg:order-1 h-full overflow-hidden">
                    <EditableContextPane
                        context={currentContext}
                        contexts={contexts}
                        section={section}
                        paperId={paperId}
                        onSave={onSaveContext}
                        onSelectContext={setSelectedContextId}
                        selectedContextId={selectedContextId}
                    />
                </div>

                {/* Right Pane: Question Editor */}
                <div className="order-2 lg:order-2 bg-white h-full overflow-y-auto">
                    <div className="p-6">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <span className="text-sm text-gray-500">{section}</span>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Question {questionNumber} of {totalQuestions}
                                </h2>
                            </div>
                            {/* Marks - Editable */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">+</span>
                                    <input
                                        type="number"
                                        value={positiveMarks}
                                        onChange={(e) => setPositiveMarks(Number(e.target.value))}
                                        className="w-12 px-2 py-1 text-sm border border-green-300 rounded bg-green-50 text-green-700 text-center"
                                        min={0}
                                        step={0.5}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">−</span>
                                    <input
                                        type="number"
                                        value={negativeMarks}
                                        onChange={(e) => setNegativeMarks(Number(e.target.value))}
                                        className="w-12 px-2 py-1 text-sm border border-red-300 rounded bg-red-50 text-red-700 text-center"
                                        min={0}
                                        step={0.25}
                                    />
                                </div>
                                <select
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                                >
                                    <option value="MCQ">MCQ</option>
                                    <option value="TITA">TITA</option>
                                </select>
                            </div>
                        </div>

                        {/* Image Upload Zone */}
                        <div className="mb-6">
                            <ImageUploadZone
                                imageUrl={imageUrl}
                                onUpload={handleImageUpload}
                                onRemove={() => setImageUrl(null)}
                                isUploading={isUploading}
                                label="Question Diagram/Image"
                            />
                        </div>

                        {/* Question Text */}
                        <div className="mb-6">
                            <textarea
                                ref={questionTextareaRef}
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Enter question text..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-800"
                            />
                        </div>

                        {/* Options - MCQ or TITA */}
                        {questionType === 'MCQ' ? (
                            <div className="space-y-3">
                                {OPTION_LABELS.map((label, index) => (
                                    <EditableOption
                                        key={label}
                                        label={label}
                                        value={options[index] || ''}
                                        isCorrect={correctAnswer === label}
                                        onChange={(value) => handleOptionChange(index, value)}
                                        onMarkCorrect={() => setCorrectAnswer(label)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Correct Answer (Numeric)
                                </label>
                                <input
                                    type="text"
                                    value={correctAnswer}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    placeholder="Enter the correct numeric answer..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}

                        {/* Solution */}
                        <details className="mt-6">
                            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                                Solution (Optional)
                            </summary>
                            <textarea
                                value={solutionText}
                                onChange={(e) => setSolutionText(e.target.value)}
                                placeholder="Enter solution explanation..."
                                rows={3}
                                className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </details>

                        {/* Save Button */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`
                                    px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                                    ${isSaving
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }
                                `}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Question
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================================================
    // STANDARD VIEW: Centered card for QA (no context)
    // ==========================================================================

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Question Header - Mirrors exam exactly */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <span className="text-sm text-gray-500">{section}</span>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Question {questionNumber} of {totalQuestions}
                    </h2>
                </div>

                {/* Marks - Editable */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">+</span>
                        <input
                            type="number"
                            value={positiveMarks}
                            onChange={(e) => setPositiveMarks(Number(e.target.value))}
                            className="w-12 px-2 py-1 text-sm border border-green-300 rounded bg-green-50 text-green-700 text-center"
                            min={0}
                            step={0.5}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">−</span>
                        <input
                            type="number"
                            value={negativeMarks}
                            onChange={(e) => setNegativeMarks(Number(e.target.value))}
                            className="w-12 px-2 py-1 text-sm border border-red-300 rounded bg-red-50 text-red-700 text-center"
                            min={0}
                            step={0.25}
                        />
                    </div>
                    {/* Question Type Toggle */}
                    <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    >
                        <option value="MCQ">MCQ</option>
                        <option value="TITA">TITA</option>
                    </select>
                </div>
            </div>

            {/* Image Upload Zone (Where diagram would appear) */}
            <div className="mb-6">
                <ImageUploadZone
                    imageUrl={imageUrl}
                    onUpload={handleImageUpload}
                    onRemove={() => setImageUrl(null)}
                    isUploading={isUploading}
                    label="Question Diagram/Image"
                />
            </div>

            {/* Question Text - Editable (Mirror Exam Typography) */}
            <div className="mb-6">
                <div className="prose prose-lg max-w-none">
                    <textarea
                        ref={questionTextareaRef}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Enter question text..."
                        rows={1}
                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg outline-none resize-none overflow-hidden text-gray-800 whitespace-pre-wrap transition-colors"
                    />
                </div>
            </div>

            {/* Options - MCQ or TITA */}
            {questionType === 'MCQ' ? (
                <div className="space-y-3">
                    {OPTION_LABELS.map((label, index) => (
                        <EditableOption
                            key={label}
                            label={label}
                            value={options[index] || ''}
                            isCorrect={correctAnswer === label}
                            onChange={(value) => handleOptionChange(index, value)}
                            onMarkCorrect={() => setCorrectAnswer(label)}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer (Numeric)
                    </label>
                    <input
                        type="text"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Enter the correct numeric answer..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            )}

            {/* Solution (Collapsible) */}
            <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Solution (Optional)
                </summary>
                <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Enter solution explanation..."
                    rows={3}
                    className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
            </details>

            {/* Save Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`
                        px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                        ${isSaving
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                    `}
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Question
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// EDITABLE QUESTION PALETTE (Mirrors QuestionPalette)
// =============================================================================

interface EditablePaletteProps {
    questions: QuestionWithAnswer[];
    section: SectionName;
    currentIndex: number;
    onSelect: (index: number) => void;
    onAddNew: () => void;
}

function EditablePalette({ questions, section, currentIndex, onSelect, onAddNew }: EditablePaletteProps) {
    const sectionQuestions = questions.filter(q => q.section === section);

    // Expected count per section
    const expectedCount = section === 'VARC' ? 24 : section === 'DILR' ? 20 : 22;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{section} Questions</h3>
                <span className="text-sm text-gray-500">{sectionQuestions.length}/{expectedCount}</span>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: expectedCount }, (_, i) => {
                    const q = sectionQuestions[i];
                    const hasContent = q && q.question_text?.trim();

                    return (
                        <button
                            key={i}
                            onClick={() => onSelect(i)}
                            className={`
                                w-10 h-10 rounded-lg text-sm font-medium transition-colors
                                ${currentIndex === i
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                    : hasContent
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }
                            `}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Add New Button */}
            <button
                onClick={onAddNew}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
            </button>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-100 border border-green-300" />
                    <span>Has content</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
                    <span>Empty</span>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN EDITABLE EXAM LAYOUT
// =============================================================================

export function EditableExamLayout({
    paper,
    questions,
    contexts,
    onSaveQuestion,
    onSaveContext,
}: EditableExamLayoutProps) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const currentSection = SECTIONS[currentSectionIndex];

    // Get questions for current section
    const sectionQuestions = useMemo(() =>
        questions.filter(q => q.section === currentSection),
        [questions, currentSection]
    );

    const currentQuestion = sectionQuestions[currentQuestionIndex] ?? null;
    const totalExpected = currentSection === 'VARC' ? 24 : currentSection === 'DILR' ? 20 : 22;

    // Handle save with loading state
    const handleSave = useCallback(async (questionData: Partial<QuestionWithAnswer>) => {
        setIsSaving(true);
        try {
            await onSaveQuestion(questionData);
        } finally {
            setIsSaving(false);
        }
    }, [onSaveQuestion]);

    // Handle context save
    const handleSaveContext = useCallback(async (contextData: Partial<QuestionContext>) => {
        if (onSaveContext) {
            await onSaveContext(contextData);
        }
    }, [onSaveContext]);

    // Handle section change - reset question index
    const handleSectionChange = useCallback((index: number) => {
        setCurrentSectionIndex(index);
        setCurrentQuestionIndex(0);
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
            {/* Header */}
            <EditableHeader
                paper={paper}
                currentSectionIndex={currentSectionIndex}
                onSectionChange={handleSectionChange}
            />

            {/* Main Content - Mirrors Exam Layout exactly */}
            <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6">
                <div className="flex gap-6">
                    {/* Question Area */}
                    <div className="flex-1">
                        <EditableQuestionArea
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={totalExpected}
                            section={currentSection}
                            paperId={paper.id}
                            contexts={contexts}
                            onSave={handleSave}
                            onSaveContext={handleSaveContext}
                            isSaving={isSaving}
                        />
                    </div>

                    {/* Sidebar - Question Palette */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-6 space-y-4">
                            {/* Progress Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Progress</h3>
                                <div className="space-y-2">
                                    {SECTIONS.map((sec, idx) => {
                                        const count = questions.filter(q => q.section === sec && q.question_text?.trim()).length;
                                        const total = sec === 'VARC' ? 24 : sec === 'DILR' ? 20 : 22;
                                        const percent = Math.round((count / total) * 100);
                                        return (
                                            <div key={sec}>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>{sec}</span>
                                                    <span>{count}/{total}</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Question Palette */}
                            <EditablePalette
                                questions={questions}
                                section={currentSection}
                                currentIndex={currentQuestionIndex}
                                onSelect={setCurrentQuestionIndex}
                                onAddNew={() => setCurrentQuestionIndex(sectionQuestions.length)}
                            />
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default EditableExamLayout;
````

## File: src/features/admin/ui/EditableQuestion.tsx
````typescript
/**
 * @fileoverview Editable Question Component (Mirror Principle)
 * @description In-context editor that mirrors the exam interface but with editable fields
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees, but editable
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { QuestionWithAnswer, SectionName, QuestionType } from '@/types/exam';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { MathText } from '@/features/exam-engine/ui/MathText';

// =============================================================================
// TYPES
// =============================================================================

interface EditableQuestionProps {
    /** Initial question data (null for new question) */
    question: Partial<QuestionWithAnswer> | null;
    /** Paper ID for new questions */
    paperId: string;
    /** Current section */
    section: SectionName;
    /** Question number in the section */
    questionNumber: number;
    /** Total questions in section */
    totalQuestions: number;
    /** Callback when question is saved */
    onSave: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    /** Callback when cancelled */
    onCancel?: () => void;
    /** Is saving in progress */
    isSaving?: boolean;
}

interface EditableOptionProps {
    label: string;
    value: string;
    isCorrect: boolean;
    onChange: (value: string) => void;
    onMarkCorrect: () => void;
}

// =============================================================================
// OPTION LABELS
// =============================================================================

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// =============================================================================
// EDITABLE OPTION COMPONENT
// =============================================================================

function EditableOption({
    label,
    value,
    isCorrect,
    onChange,
    onMarkCorrect,
}: EditableOptionProps) {
    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-lg border-2 transition-all
                ${isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
            `}
        >
            {/* Option Label (A, B, C, D) */}
            <button
                type="button"
                onClick={onMarkCorrect}
                title={isCorrect ? 'Correct answer' : 'Click to mark as correct'}
                className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-bold transition-colors cursor-pointer
                    ${isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                    }
                `}
            >
                {label}
            </button>

            {/* Editable Option Text */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter option ${label}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />

            {/* Correct Indicator */}
            {isCorrect && (
                <span className="flex-shrink-0 text-green-500 flex items-center gap-1 text-sm font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Correct
                </span>
            )}
        </div>
    );
}

// =============================================================================
// IMAGE DROP ZONE COMPONENT
// =============================================================================

interface ImageDropZoneProps {
    imageUrl: string | null;
    onImageUpload: (file: File) => Promise<void>;
    onImageRemove: () => void;
    isUploading?: boolean;
}

function ImageDropZone({ imageUrl, onImageUpload, onImageRemove, isUploading }: ImageDropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(f => f.type.startsWith('image/'));

        if (imageFile) {
            await onImageUpload(imageFile);
        }
    }, [onImageUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onImageUpload(file);
        }
    }, [onImageUpload]);

    if (imageUrl) {
        return (
            <div className="relative border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                <img
                    src={imageUrl}
                    alt="Question diagram"
                    className="max-w-full max-h-64 mx-auto rounded"
                />
                <button
                    type="button"
                    onClick={onImageRemove}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove image"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600">
                    {isUploading ? 'Uploading...' : 'Drag & drop an image here, or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                </p>
            </label>
        </div>
    );
}

// =============================================================================
// MAIN EDITABLE QUESTION COMPONENT
// =============================================================================

export function EditableQuestion({
    question,
    paperId,
    section,
    questionNumber,
    totalQuestions,
    onSave,
    onCancel,
    isSaving = false,
}: EditableQuestionProps) {
    // Form state
    const [questionText, setQuestionText] = useState(question?.question_text ?? '');
    const [questionType, setQuestionType] = useState<QuestionType>(question?.question_type ?? 'MCQ');
    const [options, setOptions] = useState<string[]>(question?.options ?? ['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer ?? 'A');
    const [positiveMarks, setPositiveMarks] = useState(question?.positive_marks ?? 3);
    const [negativeMarks, setNegativeMarks] = useState(question?.negative_marks ?? 1);
    const [solutionText, setSolutionText] = useState(question?.solution_text ?? '');
    const [imageUrl, setImageUrl] = useState<string | null>(question?.question_image_url ?? null);
    const [isUploading, setIsUploading] = useState(false);
    const [topic, setTopic] = useState(question?.topic ?? '');
    const [difficulty, setDifficulty] = useState(question?.difficulty ?? 'medium');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        setImageUrl(question?.question_image_url ?? null);
    }, [question?.id]);

    // Handle option text change
    const handleOptionChange = useCallback((index: number, value: string) => {
        setOptions(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    }, []);

    // Handle correct answer selection
    const handleMarkCorrect = useCallback((label: string) => {
        setCorrectAnswer(label);
    }, []);

    // Handle image upload to Cloudinary
    const handleImageUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImageUrl(url);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Handle image remove
    const handleImageRemove = useCallback(() => {
        setImageUrl(null);
    }, []);

    // Handle save
    const handleSave = useCallback(async () => {
        const questionData: Partial<QuestionWithAnswer> = {
            ...question,
            paper_id: paperId,
            section,
            question_number: questionNumber,
            question_text: questionText,
            question_type: questionType,
            options: questionType === 'MCQ' ? options : null,
            correct_answer: questionType === 'MCQ' ? correctAnswer : correctAnswer, // For TITA, this is the numeric answer
            positive_marks: positiveMarks,
            negative_marks: questionType === 'TITA' ? 0 : negativeMarks,
            solution_text: solutionText || undefined,
            question_image_url: imageUrl || undefined,
            topic: topic || undefined,
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            is_active: true,
        };

        await onSave(questionData);
    }, [
        question, paperId, section, questionNumber, questionText, questionType,
        options, correctAnswer, positiveMarks, negativeMarks, solutionText,
        topic, difficulty, imageUrl, onSave
    ]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Question Header - Mirror the exam UI */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <span className="text-sm text-gray-500">{section}</span>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Question {questionNumber} of {totalQuestions}
                    </h2>
                </div>

                {/* Question Type Toggle */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setQuestionType('MCQ')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${questionType === 'MCQ'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            MCQ
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setQuestionType('TITA');
                                setNegativeMarks(0);
                            }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${questionType === 'TITA'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            TITA
                        </button>
                    </div>

                    {/* Marks Config */}
                    <div className="flex items-center gap-2 text-sm">
                        <label className="flex items-center gap-1">
                            <span className="text-green-600">+</span>
                            <input
                                type="number"
                                value={positiveMarks}
                                onChange={(e) => setPositiveMarks(Number(e.target.value))}
                                className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                                min={0}
                            />
                        </label>
                        <label className="flex items-center gap-1">
                            <span className="text-red-600">-</span>
                            <input
                                type="number"
                                value={negativeMarks}
                                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                                className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                                min={0}
                                disabled={questionType === 'TITA'}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Image Drop Zone */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagram / Image (optional)
                </label>
                <ImageDropZone
                    imageUrl={imageUrl}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    isUploading={isUploading}
                />
            </div>

            {/* Question Text - Editable */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Question Text <span className="text-red-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPreview((prev) => !prev)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {showPreview ? 'Hide Preview' : 'Preview'}
                    </button>
                </div>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter the question text... (Supports Markdown and LaTeX with $...$)"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                />
                <p className="mt-1 text-xs text-gray-400">
                    Tip: Use $...$ for inline math, $$...$$ for block math
                </p>
                {showPreview && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                        <div className="text-sm font-medium text-gray-600">Preview</div>
                        <div className="prose prose-sm max-w-none text-gray-800">
                            <MathText text={questionText} />
                        </div>
                        {questionType === 'MCQ' && (
                            <div className="space-y-2">
                                {options.map((optionText, index) => {
                                    const label = OPTION_LABELS[index];
                                    return (
                                        <div key={label} className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                                                {label}
                                            </span>
                                            <div className="text-sm text-gray-700">
                                                <MathText text={optionText} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {solutionText && (
                            <div className="rounded-md bg-white border border-gray-200 p-3">
                                <div className="text-xs font-medium text-gray-500 mb-2">Solution Preview</div>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <MathText text={solutionText} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Options (MCQ only) or Answer Input (TITA) */}
            {questionType === 'MCQ' ? (
                <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options <span className="text-red-500">*</span>
                        <span className="font-normal text-gray-400 ml-2">(Click letter to mark correct)</span>
                    </label>
                    {options.map((optionText, index) => {
                        const label = OPTION_LABELS[index];
                        return (
                            <EditableOption
                                key={label}
                                label={label}
                                value={optionText}
                                isCorrect={correctAnswer === label}
                                onChange={(value) => handleOptionChange(index, value)}
                                onMarkCorrect={() => handleMarkCorrect(label)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Enter the exact answer (e.g., 42, 3.14)"
                        className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                        Enter the exact numeric/text answer students must type
                    </p>
                </div>
            )}

            {/* Solution */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution / Explanation
                </label>
                <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Explain the solution... (Supports Markdown and LaTeX)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                />
            </div>

            {/* Metadata Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topic
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Reading Comprehension, Percentages"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                    </label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    {question?.id ? 'Editing existing question' : 'Creating new question'}
                </div>
                <div className="flex items-center gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !questionText.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>Save Question</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditableQuestion;
````

## File: src/features/admin/ui/ExamEditor.tsx
````typescript
/**
 * @fileoverview Admin Exam Editor Layout (Mirror Principle)
 * @description Full exam layout but with editable fields - exactly what student sees
 * @blueprint M6+ - Mirror Principle - Admin sees exactly what student sees
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { EditableQuestion } from './EditableQuestion';
import type { Paper, QuestionWithAnswer, SectionName, QuestionContext } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamEditorProps {
    /** Paper data */
    paper: Paper;
    /** All questions for the paper */
    questions: QuestionWithAnswer[];
    /** All contexts for the paper */
    contexts: QuestionContext[];
    /** Callback when a question is saved */
    onSaveQuestion: (question: Partial<QuestionWithAnswer>) => Promise<void>;
    /** Callback when a context is saved */
    onSaveContext?: (context: Partial<QuestionContext>) => Promise<void>;
    /** Callback when paper is updated */
    onUpdatePaper?: (paper: Partial<Paper>) => Promise<void>;
}

interface EditableContextProps {
    context: QuestionContext | null;
    paperId: string;
    section: SectionName;
    onSave: (context: Partial<QuestionContext>) => Promise<void>;
    onCancel: () => void;
}

// =============================================================================
// EDITABLE CONTEXT (PASSAGE/DATA SET)
// =============================================================================

function EditableContext({ context, paperId, section, onSave, onCancel }: EditableContextProps) {
    const [title, setTitle] = useState(context?.title ?? '');
    const [content, setContent] = useState(context?.content ?? '');
    const [contextType, setContextType] = useState<'passage' | 'data_set' | 'image' | 'table'>(
        (context?.context_type as 'passage' | 'data_set' | 'image' | 'table') ?? 'passage'
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                ...context,
                paper_id: paperId,
                section,
                title: title || undefined,
                content,
                context_type: contextType,
                is_active: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-amber-800">
                    {section === 'VARC' ? 'Reading Passage' : 'Data Set / Diagram'}
                </h3>
                <select
                    value={contextType}
                    onChange={(e) => setContextType(e.target.value as typeof contextType)}
                    className="text-sm border border-amber-300 rounded px-2 py-1 bg-white"
                >
                    <option value="passage">Passage</option>
                    <option value="data_set">Data Set</option>
                    <option value="table">Table</option>
                    <option value="image">Image Only</option>
                </select>
            </div>

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Context title (optional)"
                className="w-full px-3 py-2 mb-3 border border-amber-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            />

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={section === 'VARC'
                    ? 'Paste the reading passage here...'
                    : 'Enter the data set, table, or description...'}
                rows={8}
                className="w-full px-3 py-2 border border-amber-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-y font-mono text-sm"
            />

            <div className="flex justify-end gap-2 mt-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-amber-700 hover:bg-amber-100 rounded transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Context'}
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// QUESTION PALETTE (ADMIN VERSION)
// =============================================================================

interface AdminQuestionPaletteProps {
    questions: QuestionWithAnswer[];
    currentIndex: number;
    section: SectionName;
    onSelect: (index: number) => void;
    onAddNew: () => void;
}

function AdminQuestionPalette({
    questions,
    currentIndex,
    section,
    onSelect,
    onAddNew
}: AdminQuestionPaletteProps) {
    const sectionQuestions = questions.filter(q => q.section === section);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{section} Questions</h3>
                <span className="text-sm text-gray-500">{sectionQuestions.length} total</span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
                {sectionQuestions.map((q, idx) => {
                    const globalIndex = questions.findIndex(gq => gq.id === q.id);
                    const hasContent = q.question_text?.trim();

                    return (
                        <button
                            key={q.id}
                            type="button"
                            onClick={() => onSelect(globalIndex)}
                            className={`
                                w-10 h-10 rounded-md text-sm font-medium transition-all
                                ${globalIndex === currentIndex
                                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                    : hasContent
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }
                            `}
                            title={hasContent ? 'Has content' : 'Empty'}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onAddNew}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Question
            </button>
        </div>
    );
}

// =============================================================================
// MAIN EXAM EDITOR
// =============================================================================

export function ExamEditor({
    paper,
    questions,
    contexts,
    onSaveQuestion,
    onSaveContext,
    onUpdatePaper,
}: ExamEditorProps) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isEditingContext, setIsEditingContext] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const currentSection = sections[currentSectionIndex];

    // Get questions for current section
    const sectionQuestions = useMemo(() =>
        questions.filter(q => q.section === currentSection),
        [questions, currentSection]
    );

    const currentQuestion = sectionQuestions[currentQuestionIndex] ?? null;

    // Get context for current question (if any)
    const currentContext = useMemo(() => {
        if (!currentQuestion?.context_id) return null;
        return contexts.find(c => c.id === currentQuestion.context_id) ?? null;
    }, [currentQuestion, contexts]);

    // Handle question save
    const handleSaveQuestion = useCallback(async (questionData: Partial<QuestionWithAnswer>) => {
        setIsSaving(true);
        try {
            await onSaveQuestion(questionData);
        } catch (err) {
            console.error('Error in handleSaveQuestion:', err);
            // Error is handled by parent, just log here
        } finally {
            setIsSaving(false);
        }
    }, [onSaveQuestion]);

    // Handle context save
    const handleSaveContext = useCallback(async (contextData: Partial<QuestionContext>) => {
        try {
            if (onSaveContext) {
                await onSaveContext(contextData);
            }
        } catch (err) {
            console.error('Error in handleSaveContext:', err);
        } finally {
            setIsEditingContext(false);
        }
    }, [onSaveContext]);

    // Get total questions expected for section
    const getSectionTotal = (section: SectionName) => {
        switch (section) {
            case 'VARC': return 24;
            case 'DILR': return 20;
            case 'QA': return 22;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header - Mirror Exam Header */}
            <header className="bg-[#0b3d91] text-white shadow-md">
                <div className="max-w-screen-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left - Paper Info */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded">
                                    EDIT MODE
                                </span>
                                <h1 className="text-xl font-bold">{paper.title}</h1>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-blue-100">
                                <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                    {paper.total_questions} Questions
                                </span>
                                <span className="px-2 py-1 bg-white/10 rounded border border-white/20">
                                    {paper.total_marks} Marks
                                </span>
                            </div>
                        </div>

                        {/* Center - Section Tabs */}
                        <div className="flex items-center gap-2">
                            {sections.map((section, index) => {
                                const sectionQs = questions.filter(q => q.section === section);
                                const filledCount = sectionQs.filter(q => q.question_text?.trim()).length;
                                const totalExpected = getSectionTotal(section);

                                return (
                                    <button
                                        key={section}
                                        type="button"
                                        onClick={() => {
                                            setCurrentSectionIndex(index);
                                            setCurrentQuestionIndex(0);
                                        }}
                                        className={`
                                            px-4 py-2 rounded-md text-sm font-semibold transition-colors border
                                            ${index === currentSectionIndex
                                                ? 'bg-white text-[#0b3d91] border-white'
                                                : 'bg-white/10 text-blue-100 border-white/20 hover:bg-white/20'
                                            }
                                        `}
                                    >
                                        {section}
                                        <span className="ml-2 text-xs opacity-75">
                                            {filledCount}/{totalExpected}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right - Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md text-sm transition-colors"
                            >
                                Preview Exam
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Two Column Layout (mirrors exam) */}
            <div className="max-w-screen-2xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Side - Context/Passage (if VARC/DILR) */}
                    {(currentSection === 'VARC' || currentSection === 'DILR') && (
                        <div className="lg:col-span-1">
                            {isEditingContext ? (
                                <EditableContext
                                    context={currentContext}
                                    paperId={paper.id}
                                    section={currentSection}
                                    onSave={handleSaveContext}
                                    onCancel={() => setIsEditingContext(false)}
                                />
                            ) : currentContext ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-amber-800">
                                            {currentContext.title || 'Reading Passage'}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingContext(true)}
                                            className="text-amber-600 hover:text-amber-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-[20]">
                                        {currentContext.content}
                                    </p>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingContext(true)}
                                    className="w-full py-8 border-2 border-dashed border-amber-300 text-amber-600 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors flex flex-col items-center gap-2"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Add Passage / Data Set</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Center - Question Editor */}
                    <div className={currentSection === 'QA' ? 'lg:col-span-3' : 'lg:col-span-2'}>
                        {currentQuestion ? (
                            <EditableQuestion
                                question={currentQuestion}
                                paperId={paper.id}
                                section={currentSection}
                                questionNumber={currentQuestionIndex + 1}
                                totalQuestions={sectionQuestions.length}
                                onSave={handleSaveQuestion}
                                isSaving={isSaving}
                            />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500 mb-4">No questions in this section yet</p>
                                <button
                                    type="button"
                                    onClick={() => {/* Add new question */ }}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                                >
                                    Add First Question
                                </button>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-4">
                            <button
                                type="button"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">
                                Question {currentQuestionIndex + 1} of {sectionQuestions.length}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(sectionQuestions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex >= sectionQuestions.length - 1}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Question Palette */}
                    <div className="lg:col-span-1">
                        <AdminQuestionPalette
                            questions={questions}
                            currentIndex={questions.findIndex(q => q.id === currentQuestion?.id)}
                            section={currentSection}
                            onSelect={(index) => {
                                const q = questions[index];
                                if (q) {
                                    const sectionIdx = sections.indexOf(q.section);
                                    if (sectionIdx !== currentSectionIndex) {
                                        setCurrentSectionIndex(sectionIdx);
                                    }
                                    const localIdx = sectionQuestions.findIndex(sq => sq.id === q.id);
                                    setCurrentQuestionIndex(localIdx >= 0 ? localIdx : 0);
                                }
                            }}
                            onAddNew={() => {/* Add new question */ }}
                        />

                        {/* Legend */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                            <h4 className="font-medium text-gray-800 mb-3">Legend</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-green-100 border border-green-300"></span>
                                    <span className="text-gray-600">Has content</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-gray-100 border border-gray-300"></span>
                                    <span className="text-gray-600">Empty / Draft</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-blue-500"></span>
                                    <span className="text-gray-600">Currently editing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExamEditor;
````

## File: src/features/admin/ui/QuestionSetEditor.tsx
````typescript
/**
 * @fileoverview Question Set Editor Component
 * @description Admin editor for creating/editing question sets (RC passages, DI sets)
 * @architecture Question Container Architecture - Set Mode Editor
 * 
 * Editor Modes:
 * - Set Mode: Create passage ONCE, then add multiple questions below
 * - Single Mode: Create atomic questions (wrapped in single-question set)
 * 
 * Validation:
 * - A Set cannot be published if it has 0 questions
 * - Composite sets require context_body
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
    QuestionSet,
    QuestionSetType,
    ContentLayoutType,
    QuestionInSetWithAnswer,
    SectionName,
    QuestionType,
    QuestionSetMetadata,
} from '@/types/exam';
import { isCompositeSet } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionSetEditorProps {
    /** Existing set to edit, or null for new set */
    questionSet?: QuestionSet | null;
    /** Paper ID for new sets */
    paperId: string;
    /** Current section */
    section: SectionName;
    /** Callback when set is saved */
    onSave: (set: Partial<QuestionSet>, questions: Partial<QuestionInSetWithAnswer>[]) => Promise<void>;
    /** Callback to cancel editing */
    onCancel: () => void;
}

type EditorMode = 'set' | 'single';

interface QuestionDraft {
    id?: string;
    sequence_order: number;
    question_text: string;
    question_type: QuestionType;
    options: string[];
    correct_answer: string;
    positive_marks: number;
    negative_marks: number;
    solution_text?: string;
    question_image_url?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SET_TYPE_OPTIONS: { value: QuestionSetType; label: string; description: string }[] = [
    { value: 'VARC', label: 'Reading Comprehension', description: 'Passage with 4-6 linked questions' },
    { value: 'DILR', label: 'Data Interpretation', description: 'Chart/table with linked questions' },
    { value: 'CASELET', label: 'Caselet', description: 'Case study with linked questions' },
    { value: 'ATOMIC', label: 'Single Question', description: 'Standalone question (Quant/Logic)' },
];

const LAYOUT_OPTIONS: { value: ContentLayoutType; label: string }[] = [
    { value: 'split_passage', label: 'Split - Passage Left' },
    { value: 'split_chart', label: 'Split - Chart Left' },
    { value: 'split_table', label: 'Split - Table Left' },
    { value: 'single_focus', label: 'Single Focus (Centered)' },
    { value: 'image_top', label: 'Image on Top' },
];

const EMPTY_QUESTION: QuestionDraft = {
    sequence_order: 1,
    question_text: '',
    question_type: 'MCQ',
    options: ['', '', '', ''],
    correct_answer: 'A',
    positive_marks: 3,
    negative_marks: 1,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestionSetEditor({
    questionSet,
    paperId,
    section,
    onSave,
    onCancel,
}: QuestionSetEditorProps) {
    // Determine initial mode based on existing set or default
    const initialMode: EditorMode = questionSet?.set_type === 'ATOMIC' ? 'single' : 'set';

    // ==========================================================================
    // STATE
    // ==========================================================================

    const [mode, setMode] = useState<EditorMode>(initialMode);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Set-level fields
    const [setType, setSetType] = useState<QuestionSetType>(questionSet?.set_type ?? 'VARC');
    const [contentLayout, setContentLayout] = useState<ContentLayoutType>(
        questionSet?.content_layout ?? 'split_passage'
    );
    const [contextTitle, setContextTitle] = useState(questionSet?.context_title ?? '');
    const [contextBody, setContextBody] = useState(questionSet?.context_body ?? '');
    const [contextImageUrl, setContextImageUrl] = useState(questionSet?.context_image_url ?? '');
    const [metadata, setMetadata] = useState<QuestionSetMetadata>(questionSet?.metadata ?? {});

    // Questions
    const [questions, setQuestions] = useState<QuestionDraft[]>(() => {
        if (questionSet?.questions && questionSet.questions.length > 0) {
            return questionSet.questions.map((q, idx) => ({
                id: q.id,
                sequence_order: q.sequence_order ?? idx + 1,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options ?? ['', '', '', ''],
                correct_answer: (q as QuestionInSetWithAnswer).correct_answer ?? 'A',
                positive_marks: q.positive_marks,
                negative_marks: q.negative_marks,
                solution_text: (q as QuestionInSetWithAnswer).solution_text,
                question_image_url: q.question_image_url,
            }));
        }
        return [{ ...EMPTY_QUESTION }];
    });

    // Active question index for editing
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    // ==========================================================================
    // MODE SWITCHING
    // ==========================================================================

    const handleModeChange = useCallback((newMode: EditorMode) => {
        setMode(newMode);
        if (newMode === 'single') {
            setSetType('ATOMIC');
            setContentLayout('single_focus');
            // Keep only first question for atomic
            setQuestions(prev => [prev[0] ?? { ...EMPTY_QUESTION }]);
        } else {
            // Default to VARC for set mode
            if (setType === 'ATOMIC') {
                setSetType('VARC');
                setContentLayout('split_passage');
            }
        }
    }, [setType]);

    // ==========================================================================
    // QUESTION MANAGEMENT
    // ==========================================================================

    const addQuestion = useCallback(() => {
        setQuestions(prev => [
            ...prev,
            {
                ...EMPTY_QUESTION,
                sequence_order: prev.length + 1,
            },
        ]);
        setActiveQuestionIndex(questions.length);
    }, [questions.length]);

    const removeQuestion = useCallback((index: number) => {
        if (questions.length <= 1) return; // Can't remove last question

        setQuestions(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Renumber sequence_order
            return updated.map((q, i) => ({ ...q, sequence_order: i + 1 }));
        });

        // Adjust active index
        if (activeQuestionIndex >= questions.length - 1) {
            setActiveQuestionIndex(Math.max(0, questions.length - 2));
        }
    }, [questions.length, activeQuestionIndex]);

    const updateQuestion = useCallback((index: number, updates: Partial<QuestionDraft>) => {
        setQuestions(prev => prev.map((q, i) =>
            i === index ? { ...q, ...updates } : q
        ));
    }, []);

    const updateQuestionOption = useCallback((questionIndex: number, optionIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== questionIndex) return q;
            const newOptions = [...q.options];
            newOptions[optionIndex] = value;
            return { ...q, options: newOptions };
        }));
    }, []);

    // ==========================================================================
    // VALIDATION
    // ==========================================================================

    const validate = useCallback((): string[] => {
        const validationErrors: string[] = [];

        // Check questions exist
        if (questions.length === 0) {
            validationErrors.push('At least one question is required');
        }

        // For composite sets, require context body
        if (isCompositeSet(setType) && !contextBody.trim()) {
            validationErrors.push('Context/passage content is required for this set type');
        }

        // Validate each question
        questions.forEach((q, idx) => {
            if (!q.question_text.trim()) {
                validationErrors.push(`Question ${idx + 1}: Question text is required`);
            }
            if (q.question_type === 'MCQ') {
                const filledOptions = q.options.filter(o => o.trim()).length;
                if (filledOptions < 2) {
                    validationErrors.push(`Question ${idx + 1}: At least 2 options are required`);
                }
            }
            if (!q.correct_answer.trim()) {
                validationErrors.push(`Question ${idx + 1}: Correct answer is required`);
            }
        });

        return validationErrors;
    }, [questions, setType, contextBody]);

    // ==========================================================================
    // SAVE HANDLER
    // ==========================================================================

    const handleSave = useCallback(async () => {
        // Validate
        const validationErrors = validate();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setIsSaving(true);

        try {
            const setData: Partial<QuestionSet> = {
                id: questionSet?.id,
                paper_id: paperId,
                section,
                set_type: setType,
                content_layout: contentLayout,
                context_title: contextTitle || undefined,
                context_body: contextBody || undefined,
                context_image_url: contextImageUrl || undefined,
                metadata,
                is_active: true,
            };

            const questionData: Partial<QuestionInSetWithAnswer>[] = questions.map((q, idx) => ({
                id: q.id,
                paper_id: paperId,
                section,
                sequence_order: idx + 1,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.question_type === 'MCQ' ? q.options.filter(o => o.trim()) : null,
                correct_answer: q.correct_answer,
                positive_marks: q.positive_marks,
                negative_marks: q.question_type === 'TITA' ? 0 : q.negative_marks,
                solution_text: q.solution_text,
                question_image_url: q.question_image_url,
                is_active: true,
            }));

            await onSave(setData, questionData);
        } catch (error) {
            console.error('Failed to save question set:', error);
            setErrors(['Failed to save. Please try again.']);
        } finally {
            setIsSaving(false);
        }
    }, [
        validate, questionSet?.id, paperId, section, setType, contentLayout,
        contextTitle, contextBody, contextImageUrl, metadata, questions, onSave
    ]);

    // ==========================================================================
    // RENDER
    // ==========================================================================

    const activeQuestion = questions[activeQuestionIndex];

    return (
        <div className="h-full flex flex-col bg-exam-bg-page">
            {/* Header with Mode Selector */}
            <div className="bg-exam-bg-white border-b border-exam-bg-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-exam-text-primary">
                            {questionSet ? 'Edit Question Set' : 'Create Question Set'}
                        </h2>

                        {/* Mode Toggle */}
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button
                                onClick={() => handleModeChange('set')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'set'
                                        ? 'bg-section-varc text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📚 Create Set (RC/DI)
                            </button>
                            <button
                                onClick={() => handleModeChange('single')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'single'
                                        ? 'bg-section-qa text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📝 Single Question
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Set'}
                        </button>
                    </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <ul className="list-disc list-inside text-sm text-red-600">
                            {errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Set Configuration */}
                <div className="w-1/3 border-r border-exam-bg-border overflow-y-auto bg-exam-bg-white">
                    <div className="p-6 space-y-6">
                        {/* Set Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Set Type
                            </label>
                            <select
                                value={setType}
                                onChange={(e) => setSetType(e.target.value as QuestionSetType)}
                                disabled={mode === 'single'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none disabled:bg-gray-100"
                            >
                                {SET_TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {SET_TYPE_OPTIONS.find(o => o.value === setType)?.description}
                            </p>
                        </div>

                        {/* Layout Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content Layout
                            </label>
                            <select
                                value={contentLayout}
                                onChange={(e) => setContentLayout(e.target.value as ContentLayoutType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                            >
                                {LAYOUT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Context Content (for composite sets) */}
                        {isCompositeSet(setType) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Context Title (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={contextTitle}
                                        onChange={(e) => setContextTitle(e.target.value)}
                                        placeholder="e.g., Passage 1, Data Set A"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Context Body <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={contextBody}
                                        onChange={(e) => setContextBody(e.target.value)}
                                        placeholder={
                                            setType === 'VARC'
                                                ? 'Paste the reading passage here...'
                                                : 'Enter the data set description, table data, or scenario...'
                                        }
                                        rows={12}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none resize-y font-mono text-sm leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Context Image URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={contextImageUrl}
                                        onChange={(e) => setContextImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                                    />
                                    {contextImageUrl && (
                                        <img
                                            src={contextImageUrl}
                                            alt="Context preview"
                                            className="mt-2 max-w-full h-32 object-contain rounded border"
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        {/* Metadata */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Metadata
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={metadata.topic ?? ''}
                                    onChange={(e) => setMetadata({ ...metadata, topic: e.target.value })}
                                    placeholder="Topic"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <select
                                    value={metadata.difficulty ?? ''}
                                    onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="">Difficulty</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Questions */}
                <div className="flex-1 flex flex-col overflow-hidden bg-exam-bg-pane">
                    {/* Question Tabs */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-exam-bg-border bg-exam-bg-white">
                        <span className="text-sm font-medium text-gray-600">Questions:</span>
                        <div className="flex gap-1 flex-wrap">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveQuestionIndex(idx)}
                                    className={`
                                        w-8 h-8 rounded text-sm font-medium transition-colors
                                        ${idx === activeQuestionIndex
                                            ? 'bg-status-current text-white'
                                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        {mode === 'set' && (
                            <button
                                onClick={addQuestion}
                                className="w-8 h-8 rounded border border-dashed border-gray-400 text-gray-400 hover:border-section-varc hover:text-section-varc transition-colors"
                                title="Add Question"
                            >
                                +
                            </button>
                        )}
                    </div>

                    {/* Active Question Editor */}
                    {activeQuestion && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <QuestionEditor
                                question={activeQuestion}
                                questionNumber={activeQuestionIndex + 1}
                                canRemove={questions.length > 1}
                                onUpdate={(updates) => updateQuestion(activeQuestionIndex, updates)}
                                onUpdateOption={(optIdx, value) => updateQuestionOption(activeQuestionIndex, optIdx, value)}
                                onRemove={() => removeQuestion(activeQuestionIndex)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// QUESTION EDITOR SUB-COMPONENT
// =============================================================================

interface QuestionEditorProps {
    question: QuestionDraft;
    questionNumber: number;
    canRemove: boolean;
    onUpdate: (updates: Partial<QuestionDraft>) => void;
    onUpdateOption: (optionIndex: number, value: string) => void;
    onRemove: () => void;
}

function QuestionEditor({
    question,
    questionNumber,
    canRemove,
    onUpdate,
    onUpdateOption,
    onRemove,
}: QuestionEditorProps) {
    const OPTION_LABELS = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-exam-bg-white rounded-lg border border-exam-bg-border p-6 space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-exam-text-primary">
                    Question {questionNumber}
                </h3>
                <div className="flex items-center gap-3">
                    {/* Question Type */}
                    <select
                        value={question.question_type}
                        onChange={(e) => onUpdate({ question_type: e.target.value as QuestionType })}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="MCQ">MCQ</option>
                        <option value="TITA">TITA (Numeric)</option>
                    </select>

                    {/* Marks */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">+</span>
                        <input
                            type="number"
                            value={question.positive_marks}
                            onChange={(e) => onUpdate({ positive_marks: Number(e.target.value) })}
                            className="w-12 px-2 py-1 border border-green-300 rounded bg-green-50 text-center"
                            min={0}
                            step={0.5}
                        />
                        <span className="text-red-600">-</span>
                        <input
                            type="number"
                            value={question.negative_marks}
                            onChange={(e) => onUpdate({ negative_marks: Number(e.target.value) })}
                            className="w-12 px-2 py-1 border border-red-300 rounded bg-red-50 text-center"
                            min={0}
                            step={0.25}
                            disabled={question.question_type === 'TITA'}
                        />
                    </div>

                    {/* Remove Button */}
                    {canRemove && (
                        <button
                            onClick={onRemove}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Question"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Question Text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={question.question_text}
                    onChange={(e) => onUpdate({ question_text: e.target.value })}
                    placeholder="Enter the question stem..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none resize-y"
                />
            </div>

            {/* Question Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Image URL (optional)
                </label>
                <input
                    type="url"
                    value={question.question_image_url ?? ''}
                    onChange={(e) => onUpdate({ question_image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                />
            </div>

            {/* Options (for MCQ) */}
            {question.question_type === 'MCQ' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        {OPTION_LABELS.map((label, idx) => (
                            <div key={label} className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => onUpdate({ correct_answer: label })}
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors
                                        ${question.correct_answer === label
                                            ? 'bg-status-answered text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }
                                    `}
                                    title={question.correct_answer === label ? 'Correct answer' : 'Click to mark as correct'}
                                >
                                    {label}
                                </button>
                                <input
                                    type="text"
                                    value={question.options[idx] ?? ''}
                                    onChange={(e) => onUpdateOption(idx, e.target.value)}
                                    placeholder={`Enter option ${label}...`}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                                />
                                {question.correct_answer === label && (
                                    <span className="text-status-answered text-sm font-medium">✓ Correct</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Correct Answer (for TITA) */}
            {question.question_type === 'TITA' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer (Numeric) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={question.correct_answer}
                        onChange={(e) => onUpdate({ correct_answer: e.target.value })}
                        placeholder="Enter the exact numeric answer..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter the exact answer. For ranges, use format: 45.5 to 46.5
                    </p>
                </div>
            )}

            {/* Solution */}
            <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Solution (Optional)
                </summary>
                <textarea
                    value={question.solution_text ?? ''}
                    onChange={(e) => onUpdate({ solution_text: e.target.value })}
                    placeholder="Enter the solution explanation..."
                    rows={4}
                    className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-section-varc outline-none resize-y"
                />
            </details>
        </div>
    );
}

export default QuestionSetEditor;
````

## File: src/features/exam-engine/ui/MathText.tsx
````typescript
/**
 * @fileoverview MathText Utility Component
 * @description Renders inline and block LaTeX using KaTeX
 */

'use client';

import { Fragment } from 'react';
import { BlockMath, InlineMath } from 'react-katex';

interface MathTextProps {
    text?: string | null;
    className?: string;
}

const MATH_PATTERN = /(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g;

function renderMath(token: string, key: number) {
    if (token.startsWith('$$') && token.endsWith('$$')) {
        const math = token.slice(2, -2).trim();
        if (!math) return <span key={key} />;
        return <BlockMath key={key} math={math} />;
    }

    if (token.startsWith('$') && token.endsWith('$')) {
        const math = token.slice(1, -1).trim();
        if (!math) return <span key={key} />;
        return <InlineMath key={key} math={math} />;
    }

    return (
        <span key={key} className="whitespace-pre-wrap">
            {token}
        </span>
    );
}

export function MathText({ text, className }: MathTextProps) {
    if (text === null || text === undefined || text === '') {
        return null;
    }

    const parts = String(text).split(MATH_PATTERN).filter(Boolean);

    return (
        <span className={className}>
            {parts.map((part, index) => renderMath(part, index))}
        </span>
    );
}

export default MathText;
````

## File: src/features/exam-engine/ui/QuestionRenderer.tsx
````typescript
/**
 * @fileoverview Question Set Renderer Component
 * @description Renders question sets with appropriate layout based on set_type
 * @architecture Question Container Architecture - Parent-Child Model
 * 
 * Layout Decision Logic:
 * - Composite Sets (VARC/DILR/CASELET): SplitPaneLayout with context on left
 * - Atomic Sets: SingleFocusLayout with centered question
 */

'use client';

import { useMemo, useCallback, useState } from 'react';
import type {
    QuestionSet,
    QuestionSetType,
    ContentLayoutType,
    QuestionInSet,
    SectionName,
} from '@/types/exam';
import { isCompositeSet, isSplitLayout } from '@/types/exam';
import { MathText } from './MathText';
import { MCQRenderer } from './MCQRenderer';
import { TITARenderer } from './TITARenderer';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionRendererProps {
    /** The question set to render */
    questionSet: QuestionSet;
    /** Currently active question index within the set (0-based) */
    activeQuestionIndex: number;
    /** Callback when user navigates to different question in set */
    onQuestionChange?: (index: number) => void;
    /** User's responses for questions in this set */
    responses?: Record<string, string | null>;
    /** Callback when user selects an answer */
    onAnswerChange?: (questionId: string, answer: string | null) => void;
    /** Whether exam is in review mode (show correct answers) */
    isReviewMode?: boolean;
}

// =============================================================================
// SPLIT PANE LAYOUT (For VARC / DILR / CASELET)
// =============================================================================

interface SplitPaneLayoutProps {
    questionSet: QuestionSet;
    activeQuestion: QuestionInSet;
    activeQuestionIndex: number;
    totalQuestions: number;
    onQuestionChange: (index: number) => void;
    response: string | null;
    onAnswerChange: (questionId: string, answer: string | null) => void;
    isReviewMode?: boolean;
}

function SplitPaneLayout({
    questionSet,
    activeQuestion,
    activeQuestionIndex,
    totalQuestions,
    onQuestionChange,
    response,
    onAnswerChange,
    isReviewMode,
}: SplitPaneLayoutProps) {
    return (
        <div className="flex h-full">
            {/* Left Pane: Context (Passage / Chart / Table) */}
            <div className="w-1/2 h-full overflow-y-auto border-r border-exam-bg-border bg-exam-bg-white">
                <div className="sticky top-0 bg-exam-bg-pane border-b border-exam-bg-border px-4 py-2 z-10">
                    <h3 className="text-sm font-semibold text-exam-header-from flex items-center gap-2">
                        <ContextIcon setType={questionSet.set_type} />
                        {questionSet.context_title || getDefaultContextTitle(questionSet.set_type)}
                    </h3>
                </div>

                <div className="p-6">
                    {/* Context Image (for charts, diagrams) */}
                    {questionSet.context_image_url && (
                        <div className="mb-4">
                            <img
                                src={questionSet.context_image_url}
                                alt={questionSet.context_title || 'Context diagram'}
                                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                            />
                        </div>
                    )}

                    {/* Context Body (passage text) */}
                    {questionSet.context_body && (
                        <div className="prose prose-sm max-w-none text-exam-text-body leading-exam">
                            <MathText text={questionSet.context_body} />
                        </div>
                    )}

                    {/* Additional Images */}
                    {questionSet.context_additional_images?.map((img, idx) => (
                        <figure key={idx} className="mt-4">
                            <img
                                src={img.url}
                                alt={img.caption || `Additional figure ${idx + 1}`}
                                className="max-w-full h-auto rounded border border-gray-200"
                            />
                            {img.caption && (
                                <figcaption className="text-xs text-gray-500 mt-1 text-center">
                                    {img.caption}
                                </figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            </div>

            {/* Right Pane: Question */}
            <div className="w-1/2 h-full overflow-y-auto bg-exam-bg-white">
                {/* Question Navigation within Set */}
                <div className="sticky top-0 bg-exam-bg-pane border-b border-exam-bg-border px-4 py-2 z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-exam-text-secondary">
                            Question {activeQuestionIndex + 1} of {totalQuestions}
                        </span>
                        <div className="flex gap-1">
                            {Array.from({ length: totalQuestions }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onQuestionChange(idx)}
                                    className={`
                                        w-7 h-7 rounded text-xs font-medium transition-colors
                                        ${idx === activeQuestionIndex
                                            ? 'bg-status-current text-white'
                                            : 'bg-white border border-status-border text-exam-text-primary hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Question Content */}
                <div className="p-6">
                    <QuestionContent
                        question={activeQuestion}
                        response={response}
                        onAnswerChange={onAnswerChange}
                        isReviewMode={isReviewMode}
                    />
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// SINGLE FOCUS LAYOUT (For ATOMIC questions)
// =============================================================================

interface SingleFocusLayoutProps {
    questionSet: QuestionSet;
    activeQuestion: QuestionInSet;
    response: string | null;
    onAnswerChange: (questionId: string, answer: string | null) => void;
    isReviewMode?: boolean;
}

function SingleFocusLayout({
    questionSet,
    activeQuestion,
    response,
    onAnswerChange,
    isReviewMode,
}: SingleFocusLayoutProps) {
    return (
        <div className="h-full overflow-y-auto bg-exam-bg-white">
            <div className="max-w-3xl mx-auto p-8">
                {/* Optional: Image at top for diagram-based questions */}
                {questionSet.context_image_url && (
                    <div className="mb-6">
                        <img
                            src={questionSet.context_image_url}
                            alt="Question diagram"
                            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm mx-auto"
                        />
                    </div>
                )}

                {/* Question Content */}
                <QuestionContent
                    question={activeQuestion}
                    response={response}
                    onAnswerChange={onAnswerChange}
                    isReviewMode={isReviewMode}
                    showImage={true}
                />
            </div>
        </div>
    );
}

// =============================================================================
// SHARED QUESTION CONTENT COMPONENT
// =============================================================================

interface QuestionContentProps {
    question: QuestionInSet;
    response: string | null;
    onAnswerChange: (questionId: string, answer: string | null) => void;
    isReviewMode?: boolean;
    showImage?: boolean;
}

function QuestionContent({
    question,
    response,
    onAnswerChange,
    isReviewMode,
    showImage = false,
}: QuestionContentProps) {
    // Create a Question object compatible with existing renderers
    const questionForRenderer = useMemo(() => ({
        id: question.id,
        paper_id: question.paper_id,
        section: question.section,
        question_number: question.question_number,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        positive_marks: question.positive_marks,
        negative_marks: question.negative_marks,
        difficulty: question.difficulty,
        topic: question.topic,
        subtopic: question.subtopic,
        question_image_url: question.question_image_url,
        is_active: question.is_active,
        created_at: '',
        updated_at: '',
    }), [question]);

    return (
        <div className="space-y-6">
            {/* Question Image (if shown in single focus mode) */}
            {showImage && question.question_image_url && (
                <div className="mb-4">
                    <img
                        src={question.question_image_url}
                        alt="Question diagram"
                        className="max-w-full h-auto rounded border border-gray-200"
                    />
                </div>
            )}

            {/* Question Text */}
            <div className="text-base leading-exam text-exam-text-body">
                <MathText text={question.question_text} />
            </div>

            {/* Marks Info */}
            <div className="text-sm text-exam-text-muted">
                Marks: +{question.positive_marks} / -{question.negative_marks}
            </div>

            {/* Answer Options */}
            <div className="mt-4">
                {question.question_type === 'MCQ' ? (
                    <MCQRenderer question={questionForRenderer} />
                ) : (
                    <TITARenderer question={questionForRenderer} />
                )}
            </div>
        </div>
    );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ContextIcon({ setType }: { setType: QuestionSetType }) {
    switch (setType) {
        case 'VARC':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
            );
        case 'DILR':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            );
        case 'CASELET':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            );
        default:
            return null;
    }
}

function getDefaultContextTitle(setType: QuestionSetType): string {
    switch (setType) {
        case 'VARC': return 'Reading Passage';
        case 'DILR': return 'Data Set';
        case 'CASELET': return 'Case Study';
        default: return 'Context';
    }
}

// =============================================================================
// MAIN RENDERER COMPONENT
// =============================================================================

/**
 * QuestionRenderer - Main component for rendering question sets
 * 
 * Decides layout based on set_type:
 * - Composite (VARC/DILR/CASELET): SplitPaneLayout
 * - Atomic: SingleFocusLayout
 */
export function QuestionRenderer({
    questionSet,
    activeQuestionIndex,
    onQuestionChange,
    responses = {},
    onAnswerChange,
    isReviewMode = false,
}: QuestionRendererProps) {
    // Get questions from the set
    const questions = questionSet.questions ?? [];

    // Validate we have questions
    if (questions.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-exam-bg-page">
                <div className="text-center">
                    <p className="text-exam-text-muted">No questions in this set.</p>
                </div>
            </div>
        );
    }

    // Get active question (clamp index to valid range)
    const safeIndex = Math.max(0, Math.min(activeQuestionIndex, questions.length - 1));
    const activeQuestion = questions[safeIndex];

    // Get current response
    const currentResponse = responses[activeQuestion.id] ?? null;

    // Handle answer changes
    const handleAnswerChange = useCallback((questionId: string, answer: string | null) => {
        onAnswerChange?.(questionId, answer);
    }, [onAnswerChange]);

    // Handle question navigation within set
    const handleQuestionChange = useCallback((index: number) => {
        onQuestionChange?.(index);
    }, [onQuestionChange]);

    // Determine layout based on set_type
    const isComposite = isCompositeSet(questionSet.set_type);

    // Render appropriate layout
    if (isComposite) {
        return (
            <SplitPaneLayout
                questionSet={questionSet}
                activeQuestion={activeQuestion}
                activeQuestionIndex={safeIndex}
                totalQuestions={questions.length}
                onQuestionChange={handleQuestionChange}
                response={currentResponse}
                onAnswerChange={handleAnswerChange}
                isReviewMode={isReviewMode}
            />
        );
    }

    // Atomic / Single Focus Layout
    return (
        <SingleFocusLayout
            questionSet={questionSet}
            activeQuestion={activeQuestion}
            response={currentResponse}
            onAnswerChange={handleAnswerChange}
            isReviewMode={isReviewMode}
        />
    );
}

export default QuestionRenderer;
````

## File: src/lib/cloudinary.ts
````typescript
export async function uploadToCloudinary(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed.');
    }

    const maxSizeBytes = 5_000_000;
    if (file.size > maxSizeBytes) {
        throw new Error('Image exceeds 5MB limit.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        let message = 'Cloudinary upload failed.';
        try {
            const errorBody = await response.json();
            message = errorBody?.error?.message || message;
        } catch {
            // ignore JSON parse errors
        }
        throw new Error(message);
    }

    const data = await response.json();
    if (!data?.secure_url) {
        throw new Error('Cloudinary upload failed: missing secure_url.');
    }

    return data.secure_url as string;
}
````

## File: src/lib/logger.ts
````typescript
/**
 * @fileoverview Application Logger Utility
 * @description Structured logging with environment-aware log levels
 * @blueprint M6+ Architecture - Logging Protocol
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Operation completed', { userId, action });
 *   logger.error('Failed to save', { error, context });
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// Set minimum log level based on environment
const getMinLogLevel = (): LogLevel => {
    const env = process.env.NODE_ENV;
    if (env === 'production') return 'warn'; // Production: only warn and error
    if (env === 'test') return 'error'; // Tests: only errors
    return 'debug'; // Development: all logs
};

const MIN_LOG_LEVEL = getMinLogLevel();

// =============================================================================
// LOGGER IMPLEMENTATION
// =============================================================================

/**
 * Formats a log message with timestamp and context
 */
function formatLogMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
        return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    return `${prefix} ${message}`;
}

/**
 * Checks if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

/**
 * Sanitizes context to remove sensitive data
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };

    // Remove sensitive fields
    const sensitiveKeys = [
        'password', 'token', 'secret', 'key', 'authorization',
        'cookie', 'session', 'auth', 'credential', 'apiKey',
    ];

    for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        }
    }

    return sanitized;
}

/**
 * Main logger object with level-specific methods
 */
export const logger = {
    /**
     * Debug level - Development only, detailed information
     */
    debug(message: string, context?: LogContext): void {
        if (shouldLog('debug')) {
            console.log(formatLogMessage('debug', message, sanitizeContext(context)));
        }
    },

    /**
     * Info level - General operational information
     */
    info(message: string, context?: LogContext): void {
        if (shouldLog('info')) {
            console.log(formatLogMessage('info', message, sanitizeContext(context)));
        }
    },

    /**
     * Warn level - Warning conditions that should be addressed
     */
    warn(message: string, error?: unknown, context?: LogContext): void {
        if (shouldLog('warn')) {
            // Handle case where second arg is context, not error
            if (error && typeof error === 'object' && !('message' in error) && !('stack' in error)) {
                console.warn(formatLogMessage('warn', message, sanitizeContext(error as LogContext)));
            } else {
                const errorDetails = error instanceof Error
                    ? { errorMessage: error.message }
                    : error ? { error } : {};

                console.warn(formatLogMessage('warn', message, {
                    ...sanitizeContext(context),
                    ...errorDetails,
                }));
            }
        }
    },

    /**
     * Error level - Error conditions that need immediate attention
     */
    error(message: string, error?: unknown, context?: LogContext): void {
        if (shouldLog('error')) {
            const errorDetails = error instanceof Error
                ? { errorMessage: error.message, stack: error.stack }
                : { error };

            console.error(formatLogMessage('error', message, {
                ...sanitizeContext(context),
                ...errorDetails,
            }));
        }
    },

    /**
     * Log with explicit level
     */
    log(level: LogLevel, message: string, context?: LogContext): void {
        switch (level) {
            case 'debug': this.debug(message, context); break;
            case 'info': this.info(message, context); break;
            case 'warn': this.warn(message, context); break;
            case 'error': this.error(message, undefined, context); break;
        }
    },
};

// =============================================================================
// SPECIALIZED LOGGERS
// =============================================================================

/**
 * Exam-specific logger with context
 */
export const examLogger = {
    attemptStart(attemptId: string, paperId: string, userId: string): void {
        logger.info('Exam attempt started', { attemptId, paperId, userId });
    },

    questionAnswered(attemptId: string, questionId: string): void {
        logger.debug('Question answered', { attemptId, questionId });
    },

    sectionExpired(attemptId: string, section: string): void {
        logger.info('Section timer expired', { attemptId, section });
    },

    examSubmitted(attemptId: string, score: number): void {
        logger.info('Exam submitted', { attemptId, score });
    },

    examPaused(attemptId: string, success?: boolean, error?: unknown): void {
        if (success === false && error) {
            logger.error('Failed to pause exam', error, { attemptId });
        } else {
            logger.info('Exam paused', { attemptId });
        }
    },

    validationError(operation: string, details: LogContext): void {
        logger.warn(`Validation error in ${operation}`, details);
    },

    securityEvent(event: string, details: LogContext): void {
        logger.warn(`Security event: ${event}`, details);
    },
};

/**
 * Admin-specific logger
 */
export const adminLogger = {
    paperCreated(paperId: string, title: string): void {
        logger.info('Paper created', { paperId, title });
    },

    questionCreated(questionId: string, paperId: string): void {
        logger.info('Question created', { questionId, paperId });
    },

    contextCreated(contextId: string, paperId: string): void {
        logger.info('Context created', { contextId, paperId });
    },

    dataModified(entity: string, action: 'create' | 'update' | 'delete' | 'fetch_error' | 'create_error', details?: LogContext): void {
        if (action.includes('error')) {
            logger.error(`${entity} operation failed`, undefined, { action, ...details });
        } else {
            logger.info(`${entity} ${action}d`, details);
        }
    },
};

export default logger;
````

## File: .editorconfig
````
# EditorConfig helps maintain consistent coding styles
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2

[*.{ts,tsx,js,jsx,css,scss,md}]
charset = utf-8
trim_trailing_whitespace = true
````

## File: .gitattributes
````
.nvmrc text eol=lf
*.sh text eol=lf
````

## File: data/sample-paper-template.json
````json
{
    "paper": {
        "slug": "cat-2024-mock-2",
        "title": "CAT 2024 Mock Test 2",
        "description": "Full-length CAT mock test following the 2024 pattern with 66 questions across VARC, DILR, and QA sections.",
        "year": 2024,
        "total_questions": 66,
        "total_marks": 198,
        "duration_minutes": 120,
        "sections": [
            {
                "name": "VARC",
                "questions": 24,
                "time": 40,
                "marks": 72
            },
            {
                "name": "DILR",
                "questions": 20,
                "time": 40,
                "marks": 60
            },
            {
                "name": "QA",
                "questions": 22,
                "time": 40,
                "marks": 66
            }
        ],
        "default_positive_marks": 3.0,
        "default_negative_marks": 1.0,
        "difficulty_level": "cat-level",
        "is_free": true,
        "published": false,
        "available_from": null,
        "available_until": null
    },
    "questions": [
        {
            "section": "VARC",
            "question_number": 1,
            "question_text": "Read the following passage and answer the question:\n\n[Your passage text here]\n\nWhat is the main argument of the passage?",
            "question_type": "MCQ",
            "options": [
                "Option A text",
                "Option B text",
                "Option C text",
                "Option D text"
            ],
            "correct_answer": "B",
            "positive_marks": 3.0,
            "negative_marks": 1.0,
            "difficulty": "medium",
            "topic": "Reading Comprehension",
            "subtopic": "Main Idea",
            "solution_text": "The correct answer is B because..."
        },
        {
            "section": "VARC",
            "question_number": 2,
            "question_text": "Choose the sentence that best completes the paragraph:\n\n[Your paragraph here] ___________",
            "question_type": "MCQ",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "correct_answer": "A",
            "positive_marks": 3.0,
            "negative_marks": 1.0,
            "difficulty": "easy",
            "topic": "Para Completion",
            "subtopic": null,
            "solution_text": null
        },
        {
            "section": "DILR",
            "question_number": 1,
            "question_text": "Study the following data and answer:\n\n[Your data/puzzle description here]\n\nWhat is the answer?",
            "question_type": "MCQ",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "correct_answer": "C",
            "positive_marks": 3.0,
            "negative_marks": 1.0,
            "difficulty": "hard",
            "topic": "Data Interpretation",
            "subtopic": "Tables",
            "solution_text": null
        },
        {
            "section": "DILR",
            "question_number": 2,
            "question_text": "How many ways can you arrange 5 people in a row?",
            "question_type": "TITA",
            "options": null,
            "correct_answer": "120",
            "positive_marks": 3.0,
            "negative_marks": 0,
            "difficulty": "easy",
            "topic": "Logical Reasoning",
            "subtopic": "Permutations",
            "solution_text": "5! = 5 × 4 × 3 × 2 × 1 = 120"
        },
        {
            "section": "QA",
            "question_number": 1,
            "question_text": "If 20% of a number is 50, what is the number?",
            "question_type": "MCQ",
            "options": [
                "200",
                "250",
                "300",
                "350"
            ],
            "correct_answer": "B",
            "positive_marks": 3.0,
            "negative_marks": 1.0,
            "difficulty": "easy",
            "topic": "Percentages",
            "subtopic": null,
            "solution_text": "Let x be the number. 20% of x = 50 → 0.2x = 50 → x = 250"
        },
        {
            "section": "QA",
            "question_number": 2,
            "question_text": "Find the value of √(144 + 25)",
            "question_type": "TITA",
            "options": null,
            "correct_answer": "13",
            "positive_marks": 3.0,
            "negative_marks": 0,
            "difficulty": "easy",
            "topic": "Numbers",
            "subtopic": "Square Roots",
            "solution_text": "√(144 + 25) = √169 = 13"
        }
    ]
}
````

## File: next.config.js
````javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any custom config here
}

module.exports = nextConfig
````

## File: next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
````

## File: postcss.config.js
````javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
````

## File: public/file.svg
````xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/next.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

## File: public/vercel.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

## File: public/window.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: scripts/import-paper.mjs
````javascript
#!/usr/bin/env node
/**
 * @fileoverview Paper/Questions Import Script
 * @description CLI tool to import papers and questions from JSON files into Supabase
 * @usage node scripts/import-paper.mjs <path-to-json-file>
 * 
 * JSON Format:
 * {
 *   "paper": {
 *     "slug": "cat-2024-mock-2",
 *     "title": "CAT 2024 Mock Test 2",
 *     "description": "Full-length mock test...",
 *     "year": 2024,
 *     "total_questions": 66,
 *     "total_marks": 198,
 *     "duration_minutes": 120,
 *     "sections": [
 *       { "name": "VARC", "questions": 24, "time": 40, "marks": 72 },
 *       { "name": "DILR", "questions": 20, "time": 40, "marks": 60 },
 *       { "name": "QA", "questions": 22, "time": 40, "marks": 66 }
 *     ],
 *     "difficulty_level": "cat-level",
 *     "is_free": true,
 *     "published": false
 *   },
 *   "questions": [
 *     {
 *       "section": "VARC",
 *       "question_number": 1,
 *       "question_text": "...",
 *       "question_type": "MCQ",
 *       "options": ["A", "B", "C", "D"],
 *       "correct_answer": "B",
 *       "positive_marks": 3.0,
 *       "negative_marks": 1.0,
 *       "difficulty": "medium",
 *       "topic": "Reading Comprehension",
 *       "subtopic": "Inference",
 *       "solution_text": "..."
 *     }
 *   ]
 * }
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY (use service role, not anon key!)');
    console.error('');
    console.error('Set them in .env.local or pass via environment:');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/import-paper.mjs paper.json');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// VALIDATION
// =============================================================================

function validatePaper(paper) {
    const required = ['slug', 'title', 'year', 'total_questions', 'sections'];
    const missing = required.filter(k => !paper[k]);
    if (missing.length > 0) {
        throw new Error(`Paper missing required fields: ${missing.join(', ')}`);
    }
    if (!Array.isArray(paper.sections) || paper.sections.length === 0) {
        throw new Error('Paper must have at least one section');
    }
    return true;
}

function validateQuestion(q, index) {
    const required = ['section', 'question_number', 'question_text', 'question_type', 'correct_answer'];
    const missing = required.filter(k => !q[k]);
    if (missing.length > 0) {
        throw new Error(`Question ${index + 1} missing required fields: ${missing.join(', ')}`);
    }
    if (!['VARC', 'DILR', 'QA'].includes(q.section)) {
        throw new Error(`Question ${index + 1} has invalid section: ${q.section}`);
    }
    if (!['MCQ', 'TITA'].includes(q.question_type)) {
        throw new Error(`Question ${index + 1} has invalid question_type: ${q.question_type}`);
    }
    if (q.question_type === 'MCQ' && (!q.options || !Array.isArray(q.options))) {
        throw new Error(`Question ${index + 1} is MCQ but missing options array`);
    }
    return true;
}

// =============================================================================
// IMPORT FUNCTIONS
// =============================================================================

async function importPaper(paperData) {
    console.log(`📄 Importing paper: ${paperData.title}`);

    // Check if paper with this slug already exists
    const { data: existing } = await supabase
        .from('papers')
        .select('id')
        .eq('slug', paperData.slug)
        .single();

    if (existing) {
        console.log(`   ⚠️  Paper with slug "${paperData.slug}" already exists (id: ${existing.id})`);
        console.log(`   Updating existing paper...`);

        const { data, error } = await supabase
            .from('papers')
            .update({
                title: paperData.title,
                description: paperData.description || null,
                year: paperData.year,
                total_questions: paperData.total_questions,
                total_marks: paperData.total_marks || 198,
                duration_minutes: paperData.duration_minutes || 120,
                sections: paperData.sections,
                default_positive_marks: paperData.default_positive_marks || 3.0,
                default_negative_marks: paperData.default_negative_marks || 1.0,
                difficulty_level: paperData.difficulty_level || 'cat-level',
                is_free: paperData.is_free ?? true,
                published: paperData.published ?? false,
                available_from: paperData.available_from || null,
                available_until: paperData.available_until || null,
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Insert new paper
    const { data, error } = await supabase
        .from('papers')
        .insert({
            slug: paperData.slug,
            title: paperData.title,
            description: paperData.description || null,
            year: paperData.year,
            total_questions: paperData.total_questions,
            total_marks: paperData.total_marks || 198,
            duration_minutes: paperData.duration_minutes || 120,
            sections: paperData.sections,
            default_positive_marks: paperData.default_positive_marks || 3.0,
            default_negative_marks: paperData.default_negative_marks || 1.0,
            difficulty_level: paperData.difficulty_level || 'cat-level',
            is_free: paperData.is_free ?? true,
            published: paperData.published ?? false,
            available_from: paperData.available_from || null,
            available_until: paperData.available_until || null,
        })
        .select()
        .single();

    if (error) throw error;
    console.log(`   ✅ Paper created with id: ${data.id}`);
    return data;
}

async function importQuestions(paperId, questions) {
    console.log(`📝 Importing ${questions.length} questions...`);

    // Delete existing questions for this paper (for clean re-import)
    const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('paper_id', paperId);

    if (deleteError) {
        console.warn(`   ⚠️  Could not delete existing questions: ${deleteError.message}`);
    }

    // Prepare questions with paper_id
    const questionsToInsert = questions.map(q => ({
        paper_id: paperId,
        section: q.section,
        question_number: q.question_number,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer,
        positive_marks: q.positive_marks ?? 3.0,
        negative_marks: q.negative_marks ?? (q.question_type === 'TITA' ? 0 : 1.0),
        difficulty: q.difficulty || null,
        topic: q.topic || null,
        subtopic: q.subtopic || null,
        solution_text: q.solution_text || null,
        solution_image_url: q.solution_image_url || null,
        video_solution_url: q.video_solution_url || null,
        is_active: true,
    }));

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
        const batch = questionsToInsert.slice(i, i + batchSize);
        const { error } = await supabase
            .from('questions')
            .insert(batch);

        if (error) throw error;
        inserted += batch.length;
        console.log(`   ✅ Inserted ${inserted}/${questions.length} questions`);
    }

    return inserted;
}

async function publishPaper(paperId, shouldPublish) {
    if (shouldPublish) {
        const { error } = await supabase
            .from('papers')
            .update({ published: true })
            .eq('id', paperId);

        if (error) throw error;
        console.log(`🚀 Paper published!`);
    } else {
        console.log(`📋 Paper saved as draft (set "published": true to publish)`);
    }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    CAT Mock Paper Import Tool                       ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/import-paper.mjs <path-to-json-file> [options]

Options:
  --publish    Publish the paper immediately after import
  --help, -h   Show this help message

Example:
  node scripts/import-paper.mjs data/cat-2024-mock-2.json --publish

JSON Format:
  See the top of this script file for the expected JSON structure.
`);
        process.exit(0);
    }

    const jsonPath = args[0];
    const shouldPublish = args.includes('--publish');

    try {
        console.log(`\n📂 Reading ${jsonPath}...`);
        const content = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(content);

        if (!data.paper) {
            throw new Error('JSON must have a "paper" object at the root');
        }
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('JSON must have a "questions" array at the root');
        }

        // Validate
        validatePaper(data.paper);
        data.questions.forEach((q, i) => validateQuestion(q, i));
        console.log(`✅ Validation passed\n`);

        // Import
        const paper = await importPaper(data.paper);
        const questionCount = await importQuestions(paper.id, data.questions);
        await publishPaper(paper.id, shouldPublish);

        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                         Import Complete!                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  Paper ID:    ${paper.id}
║  Slug:        ${paper.slug}
║  Questions:   ${questionCount}
║  Published:   ${shouldPublish ? 'Yes' : 'No (draft)'}
╚══════════════════════════════════════════════════════════════════════╝
`);

    } catch (err) {
        console.error(`\n❌ Import failed: ${err.message}`);
        process.exit(1);
    }
}

main();
````

## File: src/app/admin/contexts/new/page.tsx
````typescript
/**
 * @fileoverview New Context Form
 * @description Admin page to create a new passage/context for questions
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabase/client';
import { adminLogger } from '@/lib/logger';

interface Paper {
    id: string;
    title: string;
    slug: string;
}

export default function NewContextPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedPaperId = searchParams.get('paper');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [papers, setPapers] = useState<Paper[]>([]);

    const [formData, setFormData] = useState({
        paper_id: preselectedPaperId || '',
        title: '',
        section: 'VARC',
        text: '',
    });

    // Fetch papers on mount
    useEffect(() => {
        const fetchPapers = async () => {
            const supabase = sb();
            const { data } = await supabase
                .from('papers')
                .select('id, title, slug')
                .order('title');

            if (data) setPapers(data);
        };

        fetchPapers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = sb();

            const { data, error: insertError } = await supabase
                .from('question_contexts')
                .insert({
                    paper_id: formData.paper_id,
                    title: formData.title,
                    section: formData.section,
                    text: formData.text,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            router.push(`/admin/contexts/${data.id}`);
        } catch (err: unknown) {
            adminLogger.dataModified('question_contexts', 'create_error', { error: err });
            setError(err instanceof Error ? err.message : 'Failed to create context');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Context/Passage</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="paper_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Paper *
                        </label>
                        <select
                            id="paper_id"
                            name="paper_id"
                            value={formData.paper_id}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a paper</option>
                            {papers.map((paper) => (
                                <option key={paper.id} value={paper.id}>
                                    {paper.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                            Section *
                        </label>
                        <select
                            id="section"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="VARC">VARC</option>
                            <option value="DILR">DILR</option>
                            <option value="QA">QA</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., RC Passage 1 - Climate Change"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            A descriptive title to help identify this passage
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                            Passage Text *
                        </label>
                        <textarea
                            id="text"
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            required
                            rows={15}
                            placeholder="Enter the full passage text here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This is the shared context that will be displayed with questions that reference it
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Context'}
                    </button>
                </div>
            </form>
        </div>
    );
}
````

## File: src/app/admin/contexts/page.tsx
````typescript
/**
 * @fileoverview Contexts List Page
 * @description Admin page to view and manage question contexts/passages
 */

import { sbSSR } from '@/lib/supabase/server';
import { adminLogger } from '@/lib/logger';
import Link from 'next/link';

export default async function ContextsPage() {
    const supabase = await sbSSR();

    // Fetch contexts with their paper info
    const { data: contexts, error } = await supabase
        .from('question_contexts')
        .select(`
            *,
            papers (id, title, slug)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        adminLogger.dataModified('question_contexts', 'fetch_error', { error });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contexts & Passages</h1>
                    <p className="text-gray-500 mt-1">Shared passages that questions can reference</p>
                </div>
                <Link
                    href="/admin/contexts/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Context
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paper
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Section
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Preview
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contexts && contexts.length > 0 ? (
                            contexts.map((context) => (
                                <tr key={context.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{context.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {context.papers?.title || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${context.section === 'VARC' ? 'bg-blue-100 text-blue-800' :
                                            context.section === 'DILR' ? 'bg-purple-100 text-purple-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {context.section}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
                                            {context.text.substring(0, 150)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/contexts/${context.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No contexts found. <Link href="/admin/contexts/new" className="text-blue-600 hover:underline">Add your first context</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
````

## File: src/app/admin/layout.tsx
````typescript
/**
 * @fileoverview Admin Layout
 * @description Layout wrapper for admin pages with navigation
 * @blueprint M6+ - Hybrid RBAC enforcement via JWT claims
 */

import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

interface JWTClaims {
    user_role?: string;
    app_metadata?: {
        user_role?: string;
    };
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/sign-in');
    }

    // DEV MODE: Skip RBAC check if SKIP_ADMIN_CHECK is set (for development before DB migration)
    const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true';

    let isAdmin = skipAdminCheck; // Default to true if skip is enabled

    if (!skipAdminCheck) {
        // M6+ RBAC: Check JWT claims for admin role
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
            try {
                const decoded = jwtDecode<JWTClaims>(session.access_token);
                isAdmin = decoded?.user_role === 'admin' || decoded?.app_metadata?.user_role === 'admin';
            } catch {
                // JWT decode failed - not admin
                isAdmin = false;
            }
        }

        // Fallback: Check database if JWT claims not available (during migration period)
        if (!isAdmin) {
            const { data: userRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            isAdmin = userRole?.role === 'admin';
        }
    }

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header */}
            <header className="bg-[#0b3d91] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            {/* Back to Dashboard */}
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <Link href="/admin" className="font-bold text-xl">
                                CAT Mocks Admin
                            </Link>
                            <nav className="flex gap-6">
                                <Link
                                    href="/admin/papers"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Papers
                                </Link>
                                <Link
                                    href="/admin/question-sets"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Question Sets
                                </Link>
                                <Link
                                    href="/admin/questions"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Questions
                                </Link>
                                <Link
                                    href="/admin/contexts"
                                    className="text-gray-200 hover:text-white transition-colors"
                                >
                                    Contexts
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs bg-green-500 px-2 py-0.5 rounded">Admin</span>
                            <span className="text-sm text-gray-300">{user.email}</span>
                            <Link
                                href="/dashboard"
                                className="text-sm bg-yellow-500 text-gray-900 px-3 py-1.5 rounded hover:bg-yellow-400 transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
````

## File: src/app/admin/page.tsx
````typescript
/**
 * @fileoverview Admin Dashboard
 * @description Main admin page with overview statistics and quick actions
 */

import { sbSSR } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminPage() {
    const supabase = await sbSSR();

    // Fetch statistics
    const [papersResult, questionsResult, attemptsResult] = await Promise.all([
        supabase.from('papers').select('id, published', { count: 'exact' }),
        supabase.from('questions').select('id', { count: 'exact' }),
        supabase.from('attempts').select('id, status', { count: 'exact' }),
    ]);

    const totalPapers = papersResult.count || 0;
    const publishedPapers = papersResult.data?.filter(p => p.published).length || 0;
    const totalQuestions = questionsResult.count || 0;
    const totalAttempts = attemptsResult.count || 0;
    const completedAttempts = attemptsResult.data?.filter(a => a.status === 'completed').length || 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Papers</p>
                            <p className="text-3xl font-bold text-gray-900">{totalPapers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{publishedPapers} published</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Questions</p>
                            <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Across all papers</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Attempts</p>
                            <p className="text-3xl font-bold text-gray-900">{totalAttempts}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{completedAttempts} completed</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Of all attempts</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/admin/papers"
                        className="flex items-center gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-indigo-900">Live Edit Papers</p>
                            <p className="text-sm text-indigo-600">Edit papers in mock exam view</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/papers/new"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Create New Paper</p>
                            <p className="text-sm text-gray-500">Add a new mock test paper</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/questions/new"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Add Question</p>
                            <p className="text-sm text-gray-500">Add a question to a paper</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/contexts/new"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Add Context/Passage</p>
                            <p className="text-sm text-gray-500">Add a shared context for questions</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
````

## File: src/app/admin/papers/new/page.tsx
````typescript
/**
 * @fileoverview New Paper Form
 * @description Admin page to create a new paper
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase/client';
import { adminLogger } from '@/lib/logger';

export default function NewPaperPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        year: new Date().getFullYear(),
        duration_minutes: 120,
        total_questions: 66,
        total_marks: 198,
        default_positive_marks: 3,
        default_negative_marks: 1,
        difficulty_level: 'cat-level',
        published: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : type === 'number'
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = sb();

            // Generate slug from title if not provided
            const rawSlug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const slug = rawSlug.trim();
            const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

            if (!slugRegex.test(slug)) {
                setError('Invalid slug. Use lowercase letters, numbers, and hyphens only (no spaces).');
                setLoading(false);
                return;
            }

            if (slug.length > 64) {
                setError('Slug is too long. Maximum length is 64 characters.');
                setLoading(false);
                return;
            }

            const { data: existingSlug } = await supabase
                .from('papers')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (existingSlug) {
                setError('Slug already exists. Please choose a unique slug.');
                setLoading(false);
                return;
            }

            // Default CAT sections configuration
            const sections = [
                { name: 'VARC', questions: 24, time: 40, marks: 72 },
                { name: 'DILR', questions: 20, time: 40, marks: 60 },
                { name: 'QA', questions: 22, time: 40, marks: 66 },
            ];

            const { data, error: insertError } = await supabase
                .from('papers')
                .insert({
                    ...formData,
                    slug,
                    sections,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            router.push(`/admin/papers/${data.id}/edit`);
        } catch (err: unknown) {
            adminLogger.dataModified('papers', 'create_error', { error: err });
            setError(err instanceof Error ? err.message : 'Failed to create paper');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Paper</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., CAT 2024 Slot 1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                            Slug (URL-friendly ID)
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="e.g., cat-2024-slot-1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate from title</p>
                    </div>

                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                            Year *
                        </label>
                        <input
                            type="number"
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            min={2000}
                            max={2100}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of the paper..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                        </label>
                        <input
                            type="number"
                            id="duration_minutes"
                            name="duration_minutes"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="total_questions" className="block text-sm font-medium text-gray-700 mb-1">
                            Total Questions
                        </label>
                        <input
                            type="number"
                            id="total_questions"
                            name="total_questions"
                            value={formData.total_questions}
                            onChange={handleChange}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="total_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Total Marks
                        </label>
                        <input
                            type="number"
                            id="total_marks"
                            name="total_marks"
                            value={formData.total_marks}
                            onChange={handleChange}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty Level
                        </label>
                        <select
                            id="difficulty_level"
                            name="difficulty_level"
                            value={formData.difficulty_level}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="cat-level">CAT Level</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="default_positive_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Default Positive Marks
                        </label>
                        <input
                            type="number"
                            id="default_positive_marks"
                            name="default_positive_marks"
                            value={formData.default_positive_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="default_negative_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Default Negative Marks
                        </label>
                        <input
                            type="number"
                            id="default_negative_marks"
                            name="default_negative_marks"
                            value={formData.default_negative_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="published"
                                checked={formData.published}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                        </label>
                        <p className="mt-1 text-xs text-gray-500">Only published papers are visible to students</p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Paper'}
                    </button>
                </div>
            </form>
        </div>
    );
}
````

## File: src/app/admin/papers/page.tsx
````typescript
/**
 * @fileoverview Papers List Page
 * @description Admin page to view and manage all papers
 */

import { sbSSR } from '@/lib/supabase/server';
import { adminLogger } from '@/lib/logger';
import Link from 'next/link';

export default async function PapersPage() {
    const supabase = await sbSSR();

    const { data: papers, error } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        adminLogger.dataModified('papers', 'fetch_error', { error });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Papers</h1>
                <Link
                    href="/admin/papers/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Paper
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Questions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {papers && papers.length > 0 ? (
                            papers.map((paper) => (
                                <tr key={paper.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{paper.title}</div>
                                            <div className="text-sm text-gray-500">{paper.slug}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {paper.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {paper.total_questions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paper.published
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {paper.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(paper.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <Link
                                            href={`/admin/papers/${paper.id}/edit`}
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                                            title="Mirror Principle Editor"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Live Edit
                                        </Link>
                                        <Link
                                            href={`/admin/papers/${paper.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Settings
                                        </Link>
                                        <Link
                                            href={`/admin/papers/${paper.id}/questions`}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Questions
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No papers found. <Link href="/admin/papers/new" className="text-blue-600 hover:underline">Create your first paper</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
````

## File: src/app/admin/questions/new/page.tsx
````typescript
/**
 * @fileoverview New Question Form
 * @description Admin page to create a new question with full editing capabilities
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabase/client';
import { adminLogger } from '@/lib/logger';

interface Paper {
    id: string;
    title: string;
    slug: string;
}

interface Context {
    id: string;
    title: string;
    section: string;
    paper_id: string;
}

export default function NewQuestionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedPaperId = searchParams.get('paper');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [contexts, setContexts] = useState<Context[]>([]);

    const [formData, setFormData] = useState({
        paper_id: preselectedPaperId || '',
        section: 'VARC',
        question_number: 1,
        question_text: '',
        question_type: 'MCQ',
        options: ['', '', '', ''],
        correct_answer: '',
        positive_marks: 3,
        negative_marks: 1,
        solution_text: '',
        difficulty: 'medium',
        topic: '',
        subtopic: '',
        context_id: '',
    });

    // Fetch papers and contexts on mount
    useEffect(() => {
        const fetchData = async () => {
            const supabase = sb();

            const [papersResult, contextsResult] = await Promise.all([
                supabase.from('papers').select('id, title, slug').order('title'),
                supabase.from('question_contexts').select('id, title, section, paper_id').order('title'),
            ]);

            if (papersResult.data) setPapers(papersResult.data);
            if (contextsResult.data) setContexts(contextsResult.data);
        };

        fetchData();
    }, []);

    // Filter contexts by selected paper
    const filteredContexts = contexts.filter(
        c => c.paper_id === formData.paper_id && c.section === formData.section
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleOptionChange = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            options: prev.options.map((opt, i) => (i === index ? value : opt)),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = sb();

            // Prepare options as JSONB array
            const optionsJson = formData.question_type === 'MCQ'
                ? formData.options.filter(o => o.trim() !== '')
                : null;

            const { data, error: insertError } = await supabase
                .from('questions')
                .insert({
                    paper_id: formData.paper_id,
                    section: formData.section,
                    question_number: formData.question_number,
                    question_text: formData.question_text,
                    question_type: formData.question_type,
                    options: optionsJson,
                    correct_answer: formData.correct_answer,
                    positive_marks: formData.positive_marks,
                    negative_marks: formData.question_type === 'TITA' ? 0 : formData.negative_marks,
                    solution_text: formData.solution_text || null,
                    difficulty: formData.difficulty,
                    topic: formData.topic || null,
                    subtopic: formData.subtopic || null,
                    context_id: formData.context_id || null,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Redirect to edit page or questions list
            router.push(`/admin/questions/${data.id}`);
        } catch (err: unknown) {
            adminLogger.dataModified('questions', 'create_error', { error: err });
            setError(err instanceof Error ? err.message : 'Failed to create question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Question</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Paper & Section Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="paper_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Paper *
                        </label>
                        <select
                            id="paper_id"
                            name="paper_id"
                            value={formData.paper_id}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a paper</option>
                            {papers.map((paper) => (
                                <option key={paper.id} value={paper.id}>
                                    {paper.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                            Section *
                        </label>
                        <select
                            id="section"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="VARC">VARC</option>
                            <option value="DILR">DILR</option>
                            <option value="QA">QA</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="question_number" className="block text-sm font-medium text-gray-700 mb-1">
                            Question Number *
                        </label>
                        <input
                            type="number"
                            id="question_number"
                            name="question_number"
                            value={formData.question_number}
                            onChange={handleChange}
                            required
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Context Selection */}
                <div>
                    <label htmlFor="context_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Context/Passage (optional)
                    </label>
                    <select
                        id="context_id"
                        name="context_id"
                        value={formData.context_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">No context (standalone question)</option>
                        {filteredContexts.map((context) => (
                            <option key={context.id} value={context.id}>
                                {context.title}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                        Select a passage/context that this question is based on
                    </p>
                </div>

                {/* Question Content */}
                <div>
                    <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text *
                    </label>
                    <textarea
                        id="question_text"
                        name="question_text"
                        value={formData.question_text}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Enter the question text here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                </div>

                {/* Question Type & Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="question_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type *
                        </label>
                        <select
                            id="question_type"
                            name="question_type"
                            value={formData.question_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="MCQ">MCQ (Multiple Choice)</option>
                            <option value="TITA">TITA (Type in the Answer)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer *
                        </label>
                        {formData.question_type === 'MCQ' ? (
                            <select
                                id="correct_answer"
                                name="correct_answer"
                                value={formData.correct_answer}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select correct option</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                id="correct_answer"
                                name="correct_answer"
                                value={formData.correct_answer}
                                onChange={handleChange}
                                required
                                placeholder="Enter the exact answer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        )}
                    </div>
                </div>

                {/* MCQ Options */}
                {formData.question_type === 'MCQ' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Options
                        </label>
                        {['A', 'B', 'C', 'D'].map((label, index) => (
                            <div key={label} className="flex items-start gap-3">
                                <span className="mt-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                    {label}
                                </span>
                                <textarea
                                    value={formData.options[index]}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    rows={2}
                                    placeholder={`Option ${label}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Marks & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label htmlFor="positive_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Positive Marks
                        </label>
                        <input
                            type="number"
                            id="positive_marks"
                            name="positive_marks"
                            value={formData.positive_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="negative_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Negative Marks
                        </label>
                        <input
                            type="number"
                            id="negative_marks"
                            name="negative_marks"
                            value={formData.question_type === 'TITA' ? 0 : formData.negative_marks}
                            onChange={handleChange}
                            min={0}
                            step={0.5}
                            disabled={formData.question_type === 'TITA'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        {formData.question_type === 'TITA' && (
                            <p className="mt-1 text-xs text-gray-500">TITA questions have no negative marking</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty
                        </label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                            Topic
                        </label>
                        <input
                            type="text"
                            id="topic"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder="e.g., Reading Comprehension"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Solution */}
                <div>
                    <label htmlFor="solution_text" className="block text-sm font-medium text-gray-700 mb-1">
                        Solution/Explanation
                    </label>
                    <textarea
                        id="solution_text"
                        name="solution_text"
                        value={formData.solution_text}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Explain the solution..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Question'}
                    </button>
                </div>
            </form>
        </div>
    );
}
````

## File: src/app/admin/questions/page.tsx
````typescript
/**
 * @fileoverview Questions List Page
 * @description Admin page to view and manage all questions
 */

import { sbSSR } from '@/lib/supabase/server';
import { adminLogger } from '@/lib/logger';
import Link from 'next/link';

export default async function QuestionsPage() {
    const supabase = await sbSSR();

    // Fetch questions with their paper info
    const { data: questions, error } = await supabase
        .from('questions')
        .select(`
            *,
            papers (id, title, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        adminLogger.dataModified('questions', 'fetch_error', { error });
    }

    // TODO: Implement paper filter dropdown
    // Future: Fetch papers for filter
    // const { data: papers } = await supabase.from('papers').select('id, title').order('title');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
                <Link
                    href="/admin/questions/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Question
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Question
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paper
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Section
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {questions && questions.length > 0 ? (
                            questions.map((question) => (
                                <tr key={question.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {question.question_number}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                                            {question.question_text.substring(0, 100)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {question.papers?.title || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${question.section === 'VARC' ? 'bg-blue-100 text-blue-800' :
                                            question.section === 'DILR' ? 'bg-purple-100 text-purple-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {question.section}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${question.question_type === 'MCQ'
                                            ? 'bg-gray-100 text-gray-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {question.question_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/questions/${question.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No questions found. <Link href="/admin/questions/new" className="text-blue-600 hover:underline">Add your first question</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
````

## File: src/app/auth/logout/route.ts
````typescript
import { NextRequest, NextResponse } from 'next/server';
import { sbSSR } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const supabase = await sbSSR();

    // Sign out the user
    await supabase.auth.signOut();

    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
}

export async function GET(request: NextRequest) {
    const supabase = await sbSSR();

    // Sign out the user
    await supabase.auth.signOut();

    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
}
````

## File: src/app/page.module.css
````css
.page {
  --gray-rgb: 0, 0, 0;
  --gray-alpha-200: rgba(var(--gray-rgb), 0.08);
  --gray-alpha-100: rgba(var(--gray-rgb), 0.05);

  --button-primary-hover: #383838;
  --button-secondary-hover: #f2f2f2;

  display: grid;
  grid-template-rows: 20px 1fr 20px;
  align-items: center;
  justify-items: center;
  min-height: 100svh;
  padding: 80px;
  gap: 64px;
  font-family: var(--font-geist-sans);
}

@media (prefers-color-scheme: dark) {
  .page {
    --gray-rgb: 255, 255, 255;
    --gray-alpha-200: rgba(var(--gray-rgb), 0.145);
    --gray-alpha-100: rgba(var(--gray-rgb), 0.06);

    --button-primary-hover: #ccc;
    --button-secondary-hover: #1a1a1a;
  }
}

.main {
  display: flex;
  flex-direction: column;
  gap: 32px;
  grid-row-start: 2;
}

.main ol {
  font-family: var(--font-geist-mono);
  padding-left: 0;
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: -0.01em;
  list-style-position: inside;
}

.main li:not(:last-of-type) {
  margin-bottom: 8px;
}

.main code {
  font-family: inherit;
  background: var(--gray-alpha-100);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
}

.ctas {
  display: flex;
  gap: 16px;
}

.ctas a {
  appearance: none;
  border-radius: 128px;
  height: 48px;
  padding: 0 20px;
  border: 1px solid transparent;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
}

a.primary {
  background: var(--foreground);
  color: var(--background);
  gap: 8px;
}

a.secondary {
  border-color: var(--gray-alpha-200);
  min-width: 158px;
}

.footer {
  grid-row-start: 3;
  display: flex;
  gap: 24px;
}

.footer a {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer img {
  flex-shrink: 0;
}

/* Enable hover only on non-touch devices */
@media (hover: hover) and (pointer: fine) {
  a.primary:hover {
    background: var(--button-primary-hover);
    border-color: transparent;
  }

  a.secondary:hover {
    background: var(--button-secondary-hover);
    border-color: transparent;
  }

  .footer a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}

@media (max-width: 600px) {
  .page {
    padding: 32px;
    padding-bottom: 80px;
  }

  .main {
    align-items: center;
  }

  .main ol {
    text-align: center;
  }

  .ctas {
    flex-direction: column;
  }

  .ctas a {
    font-size: 14px;
    height: 40px;
    padding: 0 16px;
  }

  a.secondary {
    min-width: auto;
  }

  .footer {
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert();
  }
}
````

## File: src/app/page.tsx
````typescript
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
````

## File: src/features/exam-engine/hooks/useExamTimer.ts
````typescript
/**
 * @fileoverview High-Precision Exam Timer Hook
 * @description Delta-time computation timer for CAT exam sections
 * @blueprint Milestone 4 SOP-SSOT - Phase 2.1 & 2.2
 * @deviation Uses delta-time (Date.now() - startedAt) instead of setInterval decrement
 * @rationale Survives tab sleep, browser throttling, and provides accurate time even after resume
 */

import { useEffect, useRef, useCallback } from 'react';
import { useExamStore, selectCurrentSection, selectCurrentTimer } from '../index';
import type { SectionName, SectionTimerState } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

export interface UseExamTimerOptions {
    /** Callback when a section expires (for auto-submit) */
    onSectionExpire?: (sectionName: SectionName) => void;
    /** Callback when exam completes (QA section expires) */
    onExamComplete?: () => void;
    /** Update interval in milliseconds (default: 1000ms) */
    intervalMs?: number;
    /** Warning threshold in seconds (default: 300 = 5 minutes) */
    warningThresholdSeconds?: number;
    /** Critical threshold in seconds (default: 60 = 1 minute) */
    criticalThresholdSeconds?: number;
}

export interface TimerDisplayData {
    /** Minutes remaining (for display) */
    minutes: number;
    /** Seconds remaining (for display) */
    seconds: number;
    /** Total seconds remaining */
    totalSeconds: number;
    /** Formatted time string "MM:SS" */
    displayTime: string;
    /** Timer state: 'normal' | 'warning' | 'critical' | 'expired' */
    state: 'normal' | 'warning' | 'critical' | 'expired';
    /** Current section name */
    sectionName: SectionName;
    /** Is the section expired */
    isExpired: boolean;
    /** Progress percentage (0-100, decreasing) */
    progressPercent: number;
}

// =============================================================================
// DELTA-TIME CALCULATION
// =============================================================================

/**
 * Calculate remaining time using delta-time computation
 * This approach survives tab sleep and browser throttling
 * 
 * @param timer - Section timer state from store
 * @returns Remaining seconds (clamped to 0)
 */
function calculateRemainingSeconds(timer: SectionTimerState): number {
    if (timer.isExpired) return 0;
    if (timer.startedAt === 0) return timer.durationSeconds;

    const now = Date.now();
    const elapsedMs = now - timer.startedAt;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = timer.durationSeconds - elapsedSeconds;

    return Math.max(0, remaining);
}

/**
 * Format seconds to MM:SS display string
 */
function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Determine timer state based on remaining time
 */
function getTimerState(
    remainingSeconds: number,
    isExpired: boolean,
    warningThreshold: number,
    criticalThreshold: number
): 'normal' | 'warning' | 'critical' | 'expired' {
    if (isExpired || remainingSeconds <= 0) return 'expired';
    if (remainingSeconds <= criticalThreshold) return 'critical';
    if (remainingSeconds <= warningThreshold) return 'warning';
    return 'normal';
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * High-precision exam timer hook with delta-time computation
 * 
 * Features:
 * - Delta-time based (survives tab sleep/throttling)
 * - Auto-updates store with remaining time
 * - Triggers section expiry callbacks
 * - Provides formatted display data
 * - Handles section transitions automatically
 * 
 * @example
 * ```tsx
 * const { timerData, isActive, pause, resume } = useExamTimer({
 *   onSectionExpire: (section) => handleAutoSubmit(section),
 *   onExamComplete: () => submitExam(),
 * });
 * 
 * return <div className={timerData.state}>{timerData.displayTime}</div>;
 * ```
 */
export function useExamTimer(options: UseExamTimerOptions = {}) {
    const {
        onSectionExpire,
        onExamComplete,
        intervalMs = 1000,
        warningThresholdSeconds = 300, // 5 minutes
        criticalThresholdSeconds = 60, // 1 minute
    } = options;

    // Store selectors
    const currentSection = useExamStore(selectCurrentSection);
    const currentTimer = useExamStore(selectCurrentTimer);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const isSubmitting = useExamStore((s) => s.isSubmitting);
    const isAutoSubmitting = useExamStore((s) => s.isAutoSubmitting);

    // Store actions
    const updateSectionTimer = useExamStore((s) => s.updateSectionTimer);
    const expireSection = useExamStore((s) => s.expireSection);
    const moveToNextSection = useExamStore((s) => s.moveToNextSection);
    const setAutoSubmitting = useExamStore((s) => s.setAutoSubmitting);

    // Refs for stable callback identity
    const onSectionExpireRef = useRef(onSectionExpire);
    const onExamCompleteRef = useRef(onExamComplete);

    // Track if timer is active
    const isActiveRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Track last known section to detect transitions
    const lastSectionRef = useRef<SectionName>(currentSection);

    // Update refs when callbacks change
    useEffect(() => {
        onSectionExpireRef.current = onSectionExpire;
        onExamCompleteRef.current = onExamComplete;
    }, [onSectionExpire, onExamComplete]);

    /**
     * Handle section expiry with auto-transition
     */
    const handleSectionExpiry = useCallback(async (sectionName: SectionName) => {
        // Prevent duplicate handling
        if (isAutoSubmitting) return;

        setAutoSubmitting(true);

        try {
            // Mark section as expired in store
            expireSection(sectionName);

            // Call external handler if provided
            await onSectionExpireRef.current?.(sectionName);

            // Check if this is the last section (QA)
            const sectionIndex = currentSectionIndex;
            if (sectionIndex >= 2) {
                // Last section - exam complete
                await onExamCompleteRef.current?.();
            } else {
                // Move to next section
                moveToNextSection();
            }
        } finally {
            setAutoSubmitting(false);
        }
    }, [currentSectionIndex, expireSection, isAutoSubmitting, moveToNextSection, setAutoSubmitting]);

    /**
     * Core timer tick - calculate remaining time using delta
     */
    const tick = useCallback(() => {
        if (!hasHydrated || isSubmitting) return;

        const timer = useExamStore.getState().sectionTimers[currentSection];

        // Don't tick if section hasn't started or already expired
        if (timer.startedAt === 0 || timer.isExpired) return;

        // Calculate remaining using delta-time
        const remaining = calculateRemainingSeconds(timer);

        // Update store with new remaining time
        updateSectionTimer(currentSection, remaining);

        // Check for expiry
        if (remaining <= 0 && !timer.isExpired) {
            handleSectionExpiry(currentSection);
        }
    }, [currentSection, hasHydrated, isSubmitting, updateSectionTimer, handleSectionExpiry]);

    /**
     * Start/restart the timer interval
     */
    const startTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        isActiveRef.current = true;
        intervalRef.current = setInterval(tick, intervalMs);

        // Immediate tick to sync
        tick();
    }, [tick, intervalMs]);

    /**
     * Stop the timer interval
     */
    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        isActiveRef.current = false;
    }, []);

    /**
     * Pause timer (keeps state, stops ticking)
     */
    const pause = useCallback(() => {
        stopTimer();
    }, [stopTimer]);

    /**
     * Resume timer after pause
     */
    const resume = useCallback(() => {
        if (!isActiveRef.current) {
            startTimer();
        }
    }, [startTimer]);

    // Start timer when hydrated and not submitting
    useEffect(() => {
        if (hasHydrated && !isSubmitting && !isAutoSubmitting) {
            startTimer();
        }

        return () => {
            stopTimer();
        };
    }, [hasHydrated, isSubmitting, isAutoSubmitting, startTimer, stopTimer]);

    // Handle section transitions - restart timer on section change
    useEffect(() => {
        if (currentSection !== lastSectionRef.current) {
            lastSectionRef.current = currentSection;
            // New section - ensure timer is running
            if (hasHydrated && !isSubmitting) {
                tick(); // Immediate sync
            }
        }
    }, [currentSection, hasHydrated, isSubmitting, tick]);

    // Handle visibility change (tab switch, minimize)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab hidden - we could pause here but delta-time handles it
                // Just reduce interval frequency to save resources
            } else {
                // Tab visible - immediate sync via delta-time
                tick();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [tick]);

    // Calculate display data
    const timerData: TimerDisplayData = (() => {
        const remaining = calculateRemainingSeconds(currentTimer);
        const state = getTimerState(
            remaining,
            currentTimer.isExpired,
            warningThresholdSeconds,
            criticalThresholdSeconds
        );

        const progressPercent = currentTimer.durationSeconds > 0
            ? (remaining / currentTimer.durationSeconds) * 100
            : 0;

        return {
            minutes: Math.floor(remaining / 60),
            seconds: remaining % 60,
            totalSeconds: remaining,
            displayTime: formatTime(remaining),
            state,
            sectionName: currentSection,
            isExpired: currentTimer.isExpired || remaining <= 0,
            progressPercent: Math.max(0, Math.min(100, progressPercent)),
        };
    })();

    return {
        /** Current timer display data */
        timerData,
        /** Is the timer currently running */
        isActive: isActiveRef.current,
        /** Is the timer in auto-submit mode */
        isAutoSubmitting,
        /** Pause the timer (UI only, delta-time continues) */
        pause,
        /** Resume the timer */
        resume,
        /** Force an immediate tick (recalculate time) */
        sync: tick,
    };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Get timer data for a specific section (not necessarily current)
 */
export function useSectionTimer(sectionName: SectionName) {
    const timer = useExamStore((s) => s.sectionTimers[sectionName]);

    const remaining = calculateRemainingSeconds(timer);

    return {
        remaining,
        displayTime: formatTime(remaining),
        isExpired: timer.isExpired || remaining <= 0,
        isStarted: timer.startedAt > 0,
        progressPercent: timer.durationSeconds > 0
            ? (remaining / timer.durationSeconds) * 100
            : 0,
    };
}

/**
 * Get all section timers summary
 */
export function useAllSectionTimers() {
    const timers = useExamStore((s) => s.sectionTimers);

    return {
        VARC: {
            remaining: calculateRemainingSeconds(timers.VARC),
            isExpired: timers.VARC.isExpired,
        },
        DILR: {
            remaining: calculateRemainingSeconds(timers.DILR),
            isExpired: timers.DILR.isExpired,
        },
        QA: {
            remaining: calculateRemainingSeconds(timers.QA),
            isExpired: timers.QA.isExpired,
        },
        totalRemaining:
            calculateRemainingSeconds(timers.VARC) +
            calculateRemainingSeconds(timers.DILR) +
            calculateRemainingSeconds(timers.QA),
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { calculateRemainingSeconds, formatTime, getTimerState };
````

## File: src/features/exam-engine/lib/scoring.ts
````typescript
/**
 * @fileoverview Exam Scoring Engine
 * @description Server-side scoring logic for CAT exam evaluation
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 001, 003
 * @deviation Uses TypeScript scoring instead of SQL RPC for better testability
 */

import type { QuestionWithAnswer, SectionName, SectionScores } from '@/types/exam';
import { CAT_CONSTANTS } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

/** Response data for scoring */
export interface ResponseForScoring {
    question_id: string;
    answer: string | null;
    time_spent_seconds: number;
}

/** Individual question scoring result */
export interface QuestionScoringResult {
    question_id: string;
    section: SectionName;
    is_correct: boolean;
    marks_obtained: number;
    user_answer: string | null;
    correct_answer: string;
}

/** Complete scoring result */
export interface ScoringResult {
    total_score: number;
    max_possible_score: number;
    correct_count: number;
    incorrect_count: number;
    unanswered_count: number;
    accuracy: number;           // (correct / attempted) * 100
    attempt_rate: number;       // (attempted / total) * 100
    section_scores: SectionScores;
    question_results: QuestionScoringResult[];
}

// =============================================================================
// NORMALIZATION UTILITIES
// =============================================================================

/**
 * Normalize a string value for comparison
 * - Trims whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces to single space
 */
export function normalizeString(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return '';
    return String(val).trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Attempt to parse a value as a number
 * Returns null if not a valid number
 */
export function parseAsNumber(val: string | null | undefined): number | null {
    if (val === null || val === undefined || val.trim() === '') return null;

    const normalized = val.trim();
    const parsed = Number(normalized);

    // Check for valid number (not NaN, not Infinity)
    if (!Number.isFinite(parsed)) return null;

    return parsed;
}

/**
 * Compare two answers for equality
 * Handles both string and numeric comparisons
 * 
 * For TITA questions:
 * - Tries numeric comparison first (handles "42" vs "42.0")
 * - Falls back to normalized string comparison
 * 
 * For MCQ questions:
 * - Direct uppercase comparison (A, B, C, D)
 */
export function compareAnswers(
    userAnswer: string | null,
    correctAnswer: string,
    questionType: 'MCQ' | 'TITA'
): boolean {
    // Handle null/empty user answer
    if (userAnswer === null || userAnswer.trim() === '') {
        return false;
    }

    if (questionType === 'MCQ') {
        // MCQ: Direct comparison (case-insensitive)
        return normalizeString(userAnswer) === normalizeString(correctAnswer);
    }

    // TITA: Try numeric comparison first
    const userNum = parseAsNumber(userAnswer);
    const correctNum = parseAsNumber(correctAnswer);

    if (userNum !== null && correctNum !== null) {
        // Both are valid numbers - compare numerically
        // Use small epsilon for floating point comparison
        const epsilon = 1e-9;
        return Math.abs(userNum - correctNum) < epsilon;
    }

    // Fall back to normalized string comparison
    return normalizeString(userAnswer) === normalizeString(correctAnswer);
}

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate marks for a single question based on CAT marking scheme
 * 
 * CAT Marking Scheme:
 * - Correct MCQ: +3
 * - Wrong MCQ: -1
 * - Correct TITA: +3
 * - Wrong TITA: 0 (no negative marking)
 * - Unanswered: 0
 */
export function calculateQuestionMarks(
    question: QuestionWithAnswer,
    userAnswer: string | null
): { isCorrect: boolean; marksObtained: number } {
    // Check if unanswered
    if (userAnswer === null || userAnswer.trim() === '') {
        return { isCorrect: false, marksObtained: 0 };
    }

    // Check if correct
    const isCorrect = compareAnswers(userAnswer, question.correct_answer, question.question_type);

    if (isCorrect) {
        // Use question-specific marks or CAT default
        const marks = question.positive_marks ?? CAT_CONSTANTS.POSITIVE_MARKS;
        return { isCorrect: true, marksObtained: marks };
    }

    // Wrong answer
    if (question.question_type === 'MCQ') {
        // MCQ has negative marking
        const negativeMark = question.negative_marks ?? CAT_CONSTANTS.NEGATIVE_MARKS_MCQ;
        return { isCorrect: false, marksObtained: -negativeMark };
    }

    // TITA has no negative marking
    return { isCorrect: false, marksObtained: 0 };
}

/**
 * Initialize empty section scores
 */
function initializeSectionScores(): SectionScores {
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const sectionScores: Partial<SectionScores> = {};

    for (const section of sections) {
        sectionScores[section] = {
            score: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
        };
    }

    return sectionScores as SectionScores;
}

/**
 * Calculate complete exam score
 * 
 * @param questions - All questions with correct answers
 * @param responses - User's responses
 * @returns Complete scoring result with section breakdowns
 */
export function calculateScore(
    questions: QuestionWithAnswer[],
    responses: ResponseForScoring[]
): ScoringResult {
    // Create response lookup map
    const responseMap = new Map<string, ResponseForScoring>();
    for (const response of responses) {
        responseMap.set(response.question_id, response);
    }

    // Initialize counters
    let totalScore = 0;
    let maxPossibleScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const sectionScores = initializeSectionScores();
    const questionResults: QuestionScoringResult[] = [];

    // Process each question
    for (const question of questions) {
        const response = responseMap.get(question.id);
        const userAnswer = response?.answer ?? null;

        // Calculate marks for this question
        const { isCorrect, marksObtained } = calculateQuestionMarks(question, userAnswer);

        // Update totals
        totalScore += marksObtained;
        maxPossibleScore += question.positive_marks ?? CAT_CONSTANTS.POSITIVE_MARKS;

        // Update section scores
        const sectionScore = sectionScores[question.section];
        sectionScore.score += marksObtained;

        // Categorize response
        const isUnanswered = userAnswer === null || userAnswer.trim() === '';

        if (isUnanswered) {
            unansweredCount++;
            sectionScore.unanswered++;
        } else if (isCorrect) {
            correctCount++;
            sectionScore.correct++;
        } else {
            incorrectCount++;
            sectionScore.incorrect++;
        }

        // Store individual result
        questionResults.push({
            question_id: question.id,
            section: question.section,
            is_correct: isCorrect,
            marks_obtained: marksObtained,
            user_answer: userAnswer,
            correct_answer: question.correct_answer,
        });
    }

    // Calculate percentages
    const attemptedCount = correctCount + incorrectCount;
    const totalQuestions = questions.length;

    const accuracy = attemptedCount > 0
        ? Math.round((correctCount / attemptedCount) * 10000) / 100
        : 0;

    const attemptRate = totalQuestions > 0
        ? Math.round((attemptedCount / totalQuestions) * 10000) / 100
        : 0;

    return {
        total_score: totalScore,
        max_possible_score: maxPossibleScore,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unanswered_count: unansweredCount,
        accuracy,
        attempt_rate: attemptRate,
        section_scores: sectionScores,
        question_results: questionResults,
    };
}

/**
 * Calculate time taken from start to submission
 */
export function calculateTimeTaken(startedAt: string, submittedAt: string): number {
    const start = new Date(startedAt).getTime();
    const end = new Date(submittedAt).getTime();
    return Math.floor((end - start) / 1000); // seconds
}

/**
 * Calculate a simple rank based on score position
 * Returns the count of attempts with higher scores + 1
 */
export async function calculateRank(
    supabase: { from: (table: string) => { select: (cols: string, opts?: { count: 'exact'; head: boolean }) => { eq: (col: string, val: unknown) => { gt: (col: string, val: number) => Promise<{ count: number | null }> } } } },
    paperId: string,
    totalScore: number
): Promise<number> {
    const { count } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('paper_id', paperId)
        .gt('total_score', totalScore);

    return (count ?? 0) + 1;
}
````

## File: src/features/exam-engine/lib/validation.ts
````typescript
/**
 * @fileoverview Zod Validation Schemas for Exam Engine
 * @description Schema validation for API requests and responses
 * @blueprint Milestone 4 SOP-SSOT - Phase 4.3
 */

import { z } from 'zod';

// =============================================================================
// BASE SCHEMAS
// =============================================================================

/** Section name enum */
export const SectionNameSchema = z.enum(['VARC', 'DILR', 'QA']);

/** Question type enum */
export const QuestionTypeSchema = z.enum(['MCQ', 'TITA']);

/** Question status enum */
export const QuestionStatusSchema = z.enum([
    'not_visited',
    'visited',
    'answered',
    'marked',
    'answered_marked',
]);

/** Attempt status enum */
export const AttemptStatusSchema = z.enum([
    'in_progress',
    'submitted',
    'completed',
    'abandoned',
]);

/** Difficulty level enum */
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

/** Paper difficulty enum */
export const PaperDifficultySchema = z.enum(['easy', 'medium', 'hard', 'cat-level']);

// =============================================================================
// SECTION CONFIG SCHEMA
// =============================================================================

export const SectionConfigSchema = z.object({
    name: SectionNameSchema,
    questions: z.number().int().positive(),
    time: z.number().int().positive(), // minutes
    marks: z.number().int().positive(),
});

// =============================================================================
// QUESTION SCHEMA
// =============================================================================

export const QuestionSchema = z.object({
    id: z.string().uuid(),
    paper_id: z.string().uuid(),
    section: SectionNameSchema,
    question_number: z.number().int().positive(),
    question_text: z.string().min(1),
    question_type: QuestionTypeSchema,
    options: z.array(z.string()).nullable(),
    positive_marks: z.number().default(3.0),
    negative_marks: z.number().default(1.0),
    solution_text: z.string().optional().nullable(),
    solution_image_url: z.string().url().optional().nullable(),
    video_solution_url: z.string().url().optional().nullable(),
    question_image_url: z.string().url().optional().nullable(),
    difficulty: DifficultySchema.optional().nullable(),
    topic: z.string().optional().nullable(),
    subtopic: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    created_at: z.string(),
    updated_at: z.string(),
});

/** Question with correct answer (for results) */
export const QuestionWithAnswerSchema = QuestionSchema.extend({
    correct_answer: z.string(),
});

// =============================================================================
// PAPER SCHEMA
// =============================================================================

export const PaperSchema = z.object({
    id: z.string().uuid(),
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    year: z.number().int(),
    total_questions: z.number().int().positive(),
    total_marks: z.number().int().positive(),
    duration_minutes: z.number().int().positive(),
    sections: z.array(SectionConfigSchema),
    default_positive_marks: z.number().default(3.0),
    default_negative_marks: z.number().default(1.0),
    published: z.boolean(),
    available_from: z.string().optional().nullable(),
    available_until: z.string().optional().nullable(),
    difficulty_level: PaperDifficultySchema.optional().nullable(),
    is_free: z.boolean().default(true),
    attempt_limit: z.number().int().positive().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

// =============================================================================
// ATTEMPT SCHEMA
// =============================================================================

/** Time remaining per section */
export const TimeRemainingSchema = z.object({
    VARC: z.number().int().min(0),
    DILR: z.number().int().min(0),
    QA: z.number().int().min(0),
});

/** Section scores */
export const SectionScoreSchema = z.object({
    score: z.number(),
    correct: z.number().int().min(0),
    incorrect: z.number().int().min(0),
    unanswered: z.number().int().min(0),
});

export const SectionScoresSchema = z.object({
    VARC: SectionScoreSchema.optional(),
    DILR: SectionScoreSchema.optional(),
    QA: SectionScoreSchema.optional(),
});

export const AttemptSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    paper_id: z.string().uuid(),
    started_at: z.string(),
    submitted_at: z.string().optional().nullable(),
    completed_at: z.string().optional().nullable(),
    submission_id: z.string().uuid().optional().nullable(),
    time_taken_seconds: z.number().int().optional().nullable(),
    status: AttemptStatusSchema,
    current_section: SectionNameSchema.optional().nullable(),
    current_question: z.number().int().min(1).default(1),
    time_remaining: TimeRemainingSchema.optional().nullable(),
    total_score: z.number().optional().nullable(),
    max_possible_score: z.number().optional().nullable(),
    correct_count: z.number().int().default(0),
    incorrect_count: z.number().int().default(0),
    unanswered_count: z.number().int().default(0),
    accuracy: z.number().optional().nullable(),
    attempt_rate: z.number().optional().nullable(),
    section_scores: SectionScoresSchema.optional().nullable(),
    percentile: z.number().optional().nullable(),
    rank: z.number().int().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

// =============================================================================
// RESPONSE SCHEMA
// =============================================================================

export const ResponseSchema = z.object({
    id: z.string().uuid(),
    attempt_id: z.string().uuid(),
    question_id: z.string().uuid(),
    answer: z.string().nullable(),
    is_correct: z.boolean().optional().nullable(),
    marks_obtained: z.number().optional().nullable(),
    status: QuestionStatusSchema,
    is_marked_for_review: z.boolean().default(false),
    time_spent_seconds: z.number().int().min(0).default(0),
    visit_count: z.number().int().min(0).default(0),
    created_at: z.string(),
    updated_at: z.string(),
});

// =============================================================================
// API REQUEST SCHEMAS
// =============================================================================

/** Fetch paper request */
export const FetchPaperRequestSchema = z.object({
    paperId: z.string().uuid(),
});

/** Start attempt request */
export const StartAttemptRequestSchema = z.object({
    paperId: z.string().uuid(),
});

/** Save response request */
export const SaveResponseRequestSchema = z.object({
    attemptId: z.string().uuid(),
    questionId: z.string().uuid(),
    answer: z.string().nullable(),
    status: QuestionStatusSchema,
    isMarkedForReview: z.boolean(),
    timeSpentSeconds: z.number().int().min(0),
    sessionToken: z.string().nullable().optional(),
    force_resume: z.boolean().optional(),
});

/** Update section timer request */
export const UpdateTimerRequestSchema = z.object({
    attemptId: z.string().uuid(),
    timeRemaining: TimeRemainingSchema,
    currentSection: SectionNameSchema,
    currentQuestion: z.number().int().min(1),
});

/** Submit exam request */
export const SubmitExamRequestSchema = z.object({
    attemptId: z.string().uuid(),
    sessionToken: z.string().nullable().optional(),
    force_resume: z.boolean().optional(),
    submissionId: z.string().uuid().optional(),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/** Generic API response wrapper */
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        data: dataSchema.optional(),
        error: z.string().optional(),
    });

/** Fetch paper response */
export const FetchPaperResponseSchema = z.object({
    paper: PaperSchema,
    questions: z.array(QuestionSchema),
    attempt: AttemptSchema,
});

/** Submit exam response */
export const SubmitExamResponseSchema = z.object({
    success: z.boolean(),
    total_score: z.number(),
    max_score: z.number(),
    correct: z.number().int(),
    incorrect: z.number().int(),
    unanswered: z.number().int(),
    accuracy: z.number(),
    attempt_rate: z.number(),
    section_scores: SectionScoresSchema,
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SectionNameInput = z.infer<typeof SectionNameSchema>;
export type QuestionInput = z.infer<typeof QuestionSchema>;
export type QuestionWithAnswerInput = z.infer<typeof QuestionWithAnswerSchema>;
export type PaperInput = z.infer<typeof PaperSchema>;
export type AttemptInput = z.infer<typeof AttemptSchema>;
export type ResponseInput = z.infer<typeof ResponseSchema>;
export type TimeRemainingInput = z.infer<typeof TimeRemainingSchema>;
export type SaveResponseRequest = z.infer<typeof SaveResponseRequestSchema>;
export type UpdateTimerRequest = z.infer<typeof UpdateTimerRequestSchema>;
export type SubmitExamRequest = z.infer<typeof SubmitExamRequestSchema>;
export type FetchPaperResponse = z.infer<typeof FetchPaperResponseSchema>;
export type SubmitExamResponse = z.infer<typeof SubmitExamResponseSchema>;
````

## File: src/features/exam-engine/ui/MCQRenderer.tsx
````typescript
/**
 * @fileoverview MCQ Question Renderer Component
 * @description Radio button component for MCQ questions with 4 options
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.3
 */

'use client';

import { useCallback } from 'react';
import { useExamStore, selectResponse } from '@/features/exam-engine';
import type { Question } from '@/types/exam';
import { MathText } from './MathText';

// =============================================================================
// TYPES
// =============================================================================

interface MCQRendererProps {
    /** The question to render */
    question: Question;
    /** Optional CSS class name */
    className?: string;
    /** Read-only mode (for review) */
    readOnly?: boolean;
    /** Show correct answer (for results) */
    showCorrectAnswer?: boolean;
    /** Correct answer (only available in results) */
    correctAnswer?: string;
}

interface OptionProps {
    label: string;
    value: string;
    text: string;
    isSelected: boolean;
    isCorrect?: boolean;
    isIncorrect?: boolean;
    readOnly: boolean;
    onChange: (value: string) => void;
}

// =============================================================================
// OPTION LABELS
// =============================================================================

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// =============================================================================
// SINGLE OPTION COMPONENT
// =============================================================================

function MCQOption({
    label,
    value,
    text,
    isSelected,
    isCorrect,
    isIncorrect,
    readOnly,
    onChange,
}: OptionProps) {
    // Determine styling based on state
    let borderColor = 'border-gray-200';
    let bgColor = 'bg-white';
    let textColor = 'text-gray-800';
    let labelBg = 'bg-gray-100';
    let labelText = 'text-gray-600';

    if (isSelected && !isCorrect && !isIncorrect) {
        borderColor = 'border-blue-500';
        bgColor = 'bg-blue-50';
        labelBg = 'bg-blue-500';
        labelText = 'text-white';
    }

    if (isCorrect) {
        borderColor = 'border-green-500';
        bgColor = 'bg-green-50';
        labelBg = 'bg-green-500';
        labelText = 'text-white';
    }

    if (isIncorrect && isSelected) {
        borderColor = 'border-red-500';
        bgColor = 'bg-red-50';
        labelBg = 'bg-red-500';
        labelText = 'text-white';
    }

    return (
        <button
            type="button"
            onClick={() => !readOnly && onChange(value)}
            disabled={readOnly}
            className={`
        w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all
        ${borderColor} ${bgColor}
        ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-blue-300 hover:bg-gray-50'}
      `}
            aria-pressed={isSelected}
            aria-label={`Option ${label}: ${text}`}
        >
            {/* Option Label (A, B, C, D) */}
            <span
                className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          text-sm font-bold transition-colors
          ${labelBg} ${labelText}
        `}
            >
                {label}
            </span>

            {/* Option Text */}
            <span className={`flex-1 text-left ${textColor}`}>
                <MathText text={text} />
            </span>

            {/* Selected/Correct Indicator */}
            {isSelected && !isCorrect && !isIncorrect && (
                <span className="flex-shrink-0 text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            )}
            {isCorrect && (
                <span className="flex-shrink-0 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            )}
            {isIncorrect && isSelected && (
                <span className="flex-shrink-0 text-red-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            )}
        </button>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MCQRenderer({
    question,
    className = '',
    readOnly = false,
    showCorrectAnswer = false,
    correctAnswer,
}: MCQRendererProps) {
    const response = useExamStore(selectResponse(question.id));
    const setAnswer = useExamStore((s) => s.setAnswer);

    const selectedAnswer = response?.answer ?? null;

    // Handle option selection
    const handleChange = useCallback(
        (value: string) => {
            if (!readOnly) {
                setAnswer(question.id, value);
            }
        },
        [question.id, readOnly, setAnswer]
    );

    // Parse options from the question
    const options = question.options ?? [];

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Question Text */}
            <div className="prose prose-lg max-w-none">
                <MathText text={question.question_text} className="text-gray-800" />
            </div>

            {/* Options */}
            <div className="space-y-3">
                {options.map((optionText, index) => {
                    const label = OPTION_LABELS[index];
                    const isSelected = selectedAnswer === label;
                    const isCorrect = showCorrectAnswer && correctAnswer === label;
                    const isIncorrect = showCorrectAnswer && isSelected && correctAnswer !== label;

                    return (
                        <MCQOption
                            key={label}
                            label={label}
                            value={label}
                            text={optionText}
                            isSelected={isSelected}
                            isCorrect={isCorrect}
                            isIncorrect={isIncorrect}
                            readOnly={readOnly}
                            onChange={handleChange}
                        />
                    );
                })}
            </div>

            {/* Marking Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                <span>+{question.positive_marks} for correct</span>
                <span>-{question.negative_marks} for incorrect</span>
            </div>
        </div>
    );
}

export default MCQRenderer;
````

## File: src/features/exam-engine/ui/ResultHeader.tsx
````typescript
/**
 * @fileoverview Result Header Component
 * @description Summary card displaying total score, accuracy, and key metrics
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

interface ResultHeaderProps {
    paperTitle: string;
    totalScore: number;
    maxScore: number;
    accuracy: number | null;
    attemptRate: number | null;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    timeTakenSeconds: number | null;
    percentile: number | null;
    rank: number | null;
    submittedAt: string | null;
}

/**
 * Format seconds to human-readable time string
 */
function formatTime(seconds: number | null): string {
    if (!seconds) return '—';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
}

export function ResultHeader({
    paperTitle,
    totalScore,
    maxScore,
    accuracy,
    attemptRate,
    correctCount,
    incorrectCount,
    unansweredCount,
    timeTakenSeconds,
    percentile,
    rank,
    submittedAt,
}: ResultHeaderProps) {
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const scoreColor = scorePercentage >= 70
        ? 'text-green-600'
        : scorePercentage >= 40
            ? 'text-yellow-600'
            : 'text-red-600';

    return (
        <div className="mb-8">
            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {paperTitle}
                </h1>
                {submittedAt && (
                    <p className="text-gray-500 text-sm">
                        Submitted: {new Date(submittedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        })}
                    </p>
                )}
            </div>

            {/* Main Score Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {/* Score */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Score
                        </p>
                        <p className={`text-2xl md:text-4xl font-bold ${scoreColor}`}>
                            {totalScore}
                        </p>
                        <p className="text-sm text-gray-400">
                            of {maxScore}
                        </p>
                    </div>

                    {/* Percentile */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Percentile
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-purple-600">
                            {percentile?.toFixed(1) ?? '—'}
                        </p>
                        {rank && (
                            <p className="text-sm text-gray-400">
                                Rank #{rank}
                            </p>
                        )}
                    </div>

                    {/* Accuracy */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Accuracy
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-orange-500">
                            {accuracy?.toFixed(1) ?? '—'}%
                        </p>
                        <p className="text-sm text-gray-400">
                            {correctCount}/{correctCount + incorrectCount} correct
                        </p>
                    </div>

                    {/* Time Taken */}
                    <div className="text-center p-4 bg-white/70 rounded-xl">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Time Taken
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-teal-600">
                            {formatTime(timeTakenSeconds)}
                        </p>
                        <p className="text-sm text-gray-400">
                            of 120 min
                        </p>
                    </div>
                </div>
            </div>

            {/* Question Stats Bar */}
            <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                    </span>
                    <span className="text-gray-600">
                        Correct: <strong className="text-green-600">{correctCount}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✗
                    </span>
                    <span className="text-gray-600">
                        Incorrect: <strong className="text-red-600">{incorrectCount}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        –
                    </span>
                    <span className="text-gray-600">
                        Unanswered: <strong className="text-gray-500">{unansweredCount}</strong>
                    </span>
                </div>
                {attemptRate !== null && (
                    <div className="flex items-center gap-2 text-gray-600">
                        Attempt Rate: <strong>{attemptRate.toFixed(1)}%</strong>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResultHeader;
````

## File: src/features/exam-engine/ui/TITARenderer.tsx
````typescript
/**
 * @fileoverview TITA Question Renderer Component
 * @description Numeric input component for Type-In-The-Answer questions
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.4
 * @note TITA questions have NO negative marking
 */

'use client';

import { useCallback, useState, useEffect } from 'react';
import { useExamStore, selectResponse } from '@/features/exam-engine';
import type { Question } from '@/types/exam';
import { MathText } from './MathText';

// =============================================================================
// TYPES
// =============================================================================

interface TITARendererProps {
    /** The question to render */
    question: Question;
    /** Optional CSS class name */
    className?: string;
    /** Read-only mode (for review) */
    readOnly?: boolean;
    /** Show correct answer (for results) */
    showCorrectAnswer?: boolean;
    /** Correct answer (only available in results) */
    correctAnswer?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TITARenderer({
    question,
    className = '',
    readOnly = false,
    showCorrectAnswer = false,
    correctAnswer,
}: TITARendererProps) {
    const response = useExamStore(selectResponse(question.id));
    const setAnswer = useExamStore((s) => s.setAnswer);

    // Local state for input (debounced save)
    const [localValue, setLocalValue] = useState(response?.answer ?? '');

    // Sync local state with store on mount and when response changes externally
    useEffect(() => {
        setLocalValue(response?.answer ?? '');
    }, [response?.answer]);

    // Determine if answer is correct (for results view)
    const isCorrect = showCorrectAnswer && localValue === correctAnswer;
    const isIncorrect = showCorrectAnswer && localValue && localValue !== correctAnswer;

    // Handle input change with immediate update
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            // Allow only valid numeric input (with optional negative and decimal)
            // CAT TITA typically allows integers, but some may need decimals
            if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                setLocalValue(value);

                // Save to store immediately for TITA
                if (!readOnly) {
                    setAnswer(question.id, value || null);
                }
            }
        },
        [question.id, readOnly, setAnswer]
    );

    // Handle blur - ensure value is saved
    const handleBlur = useCallback(() => {
        if (!readOnly) {
            setAnswer(question.id, localValue || null);
        }
    }, [question.id, localValue, readOnly, setAnswer]);

    // Get input styles based on state
    let inputStyles = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    if (isCorrect) {
        inputStyles = 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500';
    } else if (isIncorrect) {
        inputStyles = 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500';
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Question Text */}
            <div className="prose prose-lg max-w-none">
                <MathText text={question.question_text} className="text-gray-800" />
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
                <label
                    htmlFor={`tita-${question.id}`}
                    className="block text-sm font-medium text-gray-700"
                >
                    Your Answer
                </label>

                <div className="relative max-w-xs">
                    <input
                        type="text"
                        id={`tita-${question.id}`}
                        value={localValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={readOnly}
                        placeholder="Enter your answer"
                        className={`
              w-full px-4 py-3 text-lg font-mono rounded-lg border-2
              transition-colors
              ${inputStyles}
              ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
                        inputMode="decimal"
                        autoComplete="off"
                        aria-describedby={`tita-help-${question.id}`}
                    />

                    {/* Correct/Incorrect Icon */}
                    {showCorrectAnswer && localValue && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCorrect ? (
                                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </span>
                    )}
                </div>

                {/* Help Text */}
                <p id={`tita-help-${question.id}`} className="text-sm text-gray-500">
                    Enter a numeric value. Decimals are allowed if needed.
                </p>
            </div>

            {/* Show correct answer in results */}
            {showCorrectAnswer && correctAnswer && (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <span className="text-sm font-medium text-gray-600">Correct Answer: </span>
                    <span className="text-lg font-mono font-bold text-gray-800">{correctAnswer}</span>
                </div>
            )}

            {/* Marking Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                <span>+{question.positive_marks} for correct</span>
                <span className="text-green-600 font-medium">No negative marking</span>
            </div>
        </div>
    );
}

export default TITARenderer;
````

## File: src/lib/rate-limit.ts
````typescript
/**
 * @fileoverview Rate Limiting Utility for Pilot Phase
 * @description In-memory rate limiter to protect against frontend loops and abuse
 * @blueprint Security Audit - P0 Fix - Rate Limiting
 */

// =============================================================================
// TYPES
// =============================================================================

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfterMs: number;
}

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

// =============================================================================
// IN-MEMORY STORE
// =============================================================================

/**
 * Simple in-memory rate limit store
 * Note: This resets on server restart and doesn't work across multiple instances
 * For production scale, upgrade to Redis/Upstash
 */
const requestCounts = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of requestCounts.entries()) {
            if (now > record.resetAt) {
                requestCounts.delete(key);
            }
        }
    }, CLEANUP_INTERVAL_MS);

    // Don't prevent process exit
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}

// Start cleanup on module load
startCleanup();

// =============================================================================
// RATE LIMIT CONFIGURATIONS
// =============================================================================

/**
 * Rate limit configurations for different endpoints
 * Tuned for pilot phase with ~100 concurrent users
 */
export const RATE_LIMITS = {
    // Exam save operations - generous for pilot (serverless cold starts reset state)
    SAVE_RESPONSE: {
        limit: 200,          // 200 requests (up from 60)
        windowMs: 60_000,    // per minute
    },

    // Exam submissions - slightly more generous for edge cases
    SUBMIT_EXAM: {
        limit: 10,           // 10 submissions (up from 5)
        windowMs: 60_000,    // per minute
    },

    // Authentication operations - more generous for pilot
    AUTH: {
        limit: 30,           // 30 attempts (up from 10)
        windowMs: 60_000,    // per minute
    },

    // General API endpoints - generous for pilot
    GENERAL_API: {
        limit: 300,          // 300 requests (up from 100)
        windowMs: 60_000,    // per minute
    },

    // Exam page loads (prevent rapid refreshing)
    EXAM_LOAD: {
        limit: 20,           // 20 loads
        windowMs: 60_000,    // per minute
    },

    // Progress updates (timer sync)
    PROGRESS_UPDATE: {
        limit: 30,           // 30 updates
        windowMs: 60_000,    // per minute
    },
} as const;

// =============================================================================
// CORE RATE LIMITING FUNCTION
// =============================================================================

/**
 * Check if a request is allowed under rate limits
 * 
 * @param identifier - Unique identifier (userId, IP, or combination)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 * 
 * @example
 * ```typescript
 * const result = checkRateLimit(`save:${userId}`, RATE_LIMITS.SAVE_RESPONSE);
 * if (!result.allowed) {
 *     return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    // No existing record or window expired - create new
    if (!record || now > record.resetAt) {
        requestCounts.set(identifier, {
            count: 1,
            resetAt: now + config.windowMs,
        });

        return {
            allowed: true,
            remaining: config.limit - 1,
            resetAt: now + config.windowMs,
            retryAfterMs: 0,
        };
    }

    // Check if limit exceeded
    if (record.count >= config.limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: record.resetAt,
            retryAfterMs: record.resetAt - now,
        };
    }

    // Increment count
    record.count++;

    return {
        allowed: true,
        remaining: config.limit - record.count,
        resetAt: record.resetAt,
        retryAfterMs: 0,
    };
}

// =============================================================================
// CONVENIENCE HELPERS
// =============================================================================

/**
 * Create rate limit key for user-specific limits
 */
export function userRateLimitKey(endpoint: string, userId: string): string {
    return `user:${userId}:${endpoint}`;
}

/**
 * Create rate limit key for IP-based limits
 */
export function ipRateLimitKey(endpoint: string, ip: string): string {
    return `ip:${ip}:${endpoint}`;
}

/**
 * Create rate limit key combining user and endpoint
 */
export function createRateLimitKey(
    type: 'user' | 'ip' | 'combined',
    endpoint: string,
    identifier: string,
    secondaryIdentifier?: string
): string {
    switch (type) {
        case 'user':
            return `user:${identifier}:${endpoint}`;
        case 'ip':
            return `ip:${identifier}:${endpoint}`;
        case 'combined':
            return `combined:${identifier}:${secondaryIdentifier || 'unknown'}:${endpoint}`;
        default:
            return `unknown:${identifier}:${endpoint}`;
    }
}

// =============================================================================
// RATE LIMIT RESPONSE HELPERS
// =============================================================================

/**
 * Create a rate limit exceeded response
 */
export function createRateLimitResponse(result: RateLimitResult): {
    error: string;
    retryAfterSeconds: number;
    limit: number;
    remaining: number;
} {
    return {
        error: 'Rate limit exceeded. Please slow down.',
        retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000),
        limit: 0, // Will be set by caller
        remaining: result.remaining,
    };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
    result: RateLimitResult,
    limit: number
): Record<string, string> {
    return {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
        ...(result.retryAfterMs > 0 && {
            'Retry-After': Math.ceil(result.retryAfterMs / 1000).toString(),
        }),
    };
}

// =============================================================================
// MONITORING / DEBUGGING
// =============================================================================

/**
 * Get current rate limit stats (for monitoring/debugging)
 */
export function getRateLimitStats(): {
    totalKeys: number;
    activeKeys: number;
    keysByPrefix: Record<string, number>;
} {
    const now = Date.now();
    let activeKeys = 0;
    const keysByPrefix: Record<string, number> = {};

    for (const [key, record] of requestCounts.entries()) {
        if (now <= record.resetAt) {
            activeKeys++;
        }

        const prefix = key.split(':')[0];
        keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
    }

    return {
        totalKeys: requestCounts.size,
        activeKeys,
        keysByPrefix,
    };
}

/**
 * Clear all rate limit records (for testing)
 */
export function clearRateLimits(): void {
    requestCounts.clear();
}

// =============================================================================
// SUPABASE FREE TIER LIMITS (Reference)
// =============================================================================

/**
 * Supabase Free Tier Limits for reference
 * Use these to tune rate limits appropriately
 */
export const SUPABASE_FREE_TIER = {
    // Database
    MAX_CONNECTIONS: 60,           // Pooled connections
    MAX_ROWS_RETURNED: 1000,       // Per query
    MAX_QUERY_TIME_MS: 8000,       // 8 seconds

    // API
    REQUESTS_PER_SECOND: 100,      // Approximate sustained

    // Auth
    AUTH_REQUESTS_PER_HOUR: 1000,  // Per project

    // Realtime
    MAX_REALTIME_CONNECTIONS: 200, // Concurrent

    // Storage
    MAX_FILE_SIZE_MB: 50,          // Per file
} as const;
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Question data files (keep only sample)
data/cat-2024-*.json
!data/sample-paper-template.json
````

## File: eslint.config.mjs
````javascript
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];

export default eslintConfig;
````

## File: scripts/blueprint-guard.mjs
````javascript
#!/usr/bin/env node

/**
 * Blueprint Guard Script
 * Ensures that blueprint anchors are present in code and docs are up to date
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const BLUEPRINT_FILE = 'Docs/BLUEPRINT.md';
const SRC_DIR = 'src';

// Extract anchors from blueprint
function extractAnchors(blueprintContent) {
  const anchorRegex = /## (.+?) \((\w+-\d+)\)/g;
  const anchors = new Set();
  let match;

  while ((match = anchorRegex.exec(blueprintContent)) !== null) {
    anchors.add(match[2]); // Capture the anchor ID
  }

  return anchors;
}

// Find anchor references in code
function findAnchorReferences(dir, anchors) {
  const foundAnchors = new Set();

  function scanDirectory(currentDir) {
    const items = readdirSync(currentDir);

    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(item))) {
        const content = readFileSync(fullPath, 'utf8');
        for (const anchor of anchors) {
          if (content.includes(anchor)) {
            foundAnchors.add(anchor);
          }
        }
      }
    }
  }

  scanDirectory(dir);
  return foundAnchors;
}

// Main check
try {
  const blueprintContent = readFileSync(BLUEPRINT_FILE, 'utf8');
  const blueprintAnchors = extractAnchors(blueprintContent);
  const foundAnchors = findAnchorReferences(SRC_DIR, blueprintAnchors);

  const missingAnchors = [...blueprintAnchors].filter(anchor => !foundAnchors.has(anchor));

  if (missingAnchors.length > 0) {
    console.error('❌ Blueprint Guard Failed: Missing anchor references in code:');
    missingAnchors.forEach(anchor => console.error(`  - ${anchor}`));
    process.exit(1);
  } else {
    console.log('✅ Blueprint Guard Passed: All anchors referenced in code');
  }
} catch (error) {
  console.error('❌ Blueprint Guard Error:', error.message);
  process.exit(1);
}
````

## File: src/app/auth/test-login/page.tsx
````typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { sb } from '@/lib/supabase/client';

export default function TestLoginPage() {
    const [loading, setLoading] = useState(false);
    const [sessionJson, setSessionJson] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const refreshSession = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await sb().auth.getSession();
            if (err) throw err;
            setSessionJson(JSON.stringify(data.session, null, 2));
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load session';
            setError(msg);
            setSessionJson('');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const onSignIn = useCallback(async () => {
        setLoading(true);
        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
            const callbackUrl = `${origin}/auth/callback?redirect_to=/auth/test-login`;
            await sb().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl } });
        } finally {
            setLoading(false);
        }
    }, []);

    const onSignOut = useCallback(async () => {
        setLoading(true);
        try {
            await sb().auth.signOut();
        } finally {
            setLoading(false);
        }
    }, [refreshSession]);

    return (
        <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
            <h1>Auth Test Utility</h1>
            <p style={{ marginBottom: 12 }}>Quickly verify Supabase auth/session locally or in deployments.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={onSignIn} disabled={loading} style={{ padding: 8 }}>
                    {loading ? 'Working…' : 'Sign in with Google'}
                </button>
                <button onClick={onSignOut} disabled={loading} style={{ padding: 8 }}>
                    Sign out
                </button>
                <button onClick={refreshSession} disabled={loading} style={{ padding: 8 }}>
                    Refresh session
                </button>
                <Link href="/dashboard" style={{ padding: 8, textDecoration: 'underline' }}>Go to dashboard</Link>
            </div>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, minHeight: 120, overflow: 'auto' }}>
                {sessionJson || 'No session'}
            </pre>
        </main>
    );
}
````

## File: src/app/exam/[attemptId]/ExamClient.tsx
````typescript
/**
 * @fileoverview Exam Client Component
 * @description Client-side exam interface that integrates with the exam engine
 * @blueprint Milestone 4 SOP-SSOT - Integration
 */

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useExamStore,
    ExamLayout,
} from '@/features/exam-engine';
import {
    saveResponse,
    updateAttemptProgress,
    submitExam,
    pauseExam,
} from '@/features/exam-engine/lib/actions';
import { logger, examLogger } from '@/lib/logger';
import type { Paper, Question, Attempt, SectionName, TimeRemaining } from '@/types/exam';
import { getSectionByIndex } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamClientProps {
    paper: Paper;
    questions: Question[];
    attempt: Attempt;
}

// =============================================================================
// DEBOUNCE HELPER
// =============================================================================

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        }) as T,
        [delay]
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExamClient({ paper, questions, attempt }: ExamClientProps) {
    const router = useRouter();

    // Store actions
    const initializeExam = useExamStore((s) => s.initializeExam);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const attemptId = useExamStore((s) => s.attemptId);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const sectionTimers = useExamStore((s) => s.sectionTimers);
    const responses = useExamStore((s) => s.responses);
    const sessionToken = useExamStore((s) => s.sessionToken);
    const submissionIdRef = useRef<string>(
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    );

    const [sessionConflict, setSessionConflict] = useState<
        | { type: 'save'; payload: Parameters<typeof saveResponse>[0] }
        | { type: 'submit' }
        | null
    >(null);
    const [isResolvingConflict, setIsResolvingConflict] = useState(false);

    // Track if we've already attempted initialization
    const initAttemptedRef = useRef(false);

    // Initialize exam on mount - but only once per session
    // The initializeExam function now handles the case where state is already loaded
    useEffect(() => {
        // Always call initializeExam - it will internally check if state should be preserved
        // This handles both fresh starts and page refreshes correctly
        if (!initAttemptedRef.current) {
            initAttemptedRef.current = true;
            initializeExam({
                paper,
                questions,
                attempt,
            });
        }
    }, [paper, questions, attempt, initializeExam]);

    // Debounced save to server
    const debouncedSaveProgress = useDebouncedCallback(
        async (sectionTimers: Record<SectionName, { remainingSeconds: number }>) => {
            if (!attemptId) return;

            const timeRemaining: TimeRemaining = {
                VARC: sectionTimers.VARC.remainingSeconds,
                DILR: sectionTimers.DILR.remainingSeconds,
                QA: sectionTimers.QA.remainingSeconds,
            };

            const currentSection = getSectionByIndex(currentSectionIndex);

            await updateAttemptProgress({
                attemptId,
                timeRemaining,
                currentSection,
                currentQuestion: currentQuestionIndex + 1,
            });
        },
        5000 // Save every 5 seconds
    );

    // Auto-save progress periodically
    useEffect(() => {
        if (!attemptId || !hasHydrated) return;

        const interval = setInterval(() => {
            debouncedSaveProgress(sectionTimers);
        }, 5000);

        return () => clearInterval(interval);
    }, [attemptId, hasHydrated, sectionTimers, debouncedSaveProgress]);

    // Handle individual response save
    const handleSaveResponse = useCallback(async (
        questionId: string,
        answer: string | null
    ) => {
        if (!attemptId) return;

        const response = responses[questionId];
        if (!response) return;

        const result = await saveResponse({
            attemptId,
            questionId,
            answer,
            status: response.status,
            isMarkedForReview: response.isMarkedForReview,
            timeSpentSeconds: response.timeSpentSeconds,
            sessionToken,
        });
        if (!result.success && result.error === 'SESSION_CONFLICT') {
            setSessionConflict({
                type: 'save',
                payload: {
                    attemptId,
                    questionId,
                    answer,
                    status: response.status,
                    isMarkedForReview: response.isMarkedForReview,
                    timeSpentSeconds: response.timeSpentSeconds,
                    sessionToken,
                },
            });
        }
    }, [attemptId, responses, sessionToken]);

    // Handle section expiry
    const handleSectionExpire = useCallback(async (sectionName: SectionName) => {
        examLogger.sectionExpired(attemptId || '', sectionName);

        // Save all current responses for this section before transitioning
        if (!attemptId) return;

        // Find questions in this section and save their responses
        const sectionQuestions = questions.filter(q => q.section === sectionName);

        await Promise.all(
            sectionQuestions.map(async (q) => {
                const response = responses[q.id];
                if (response && (response.answer !== null || response.status !== 'not_visited')) {
                    const result = await saveResponse({
                        attemptId: attemptId!,
                        questionId: q.id,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                        sessionToken,
                    });
                    if (!result.success && result.error === 'SESSION_CONFLICT') {
                        setSessionConflict({
                            type: 'save',
                            payload: {
                                attemptId: attemptId!,
                                questionId: q.id,
                                answer: response.answer,
                                status: response.status,
                                isMarkedForReview: response.isMarkedForReview,
                                timeSpentSeconds: response.timeSpentSeconds,
                                sessionToken,
                            },
                        });
                    }
                }
            })
        );
    }, [attemptId, questions, responses, sessionToken]);

    // Handle exam submit
    const handleSubmitExam = useCallback(async () => {
        if (!attemptId) return;

        // Save all remaining responses
        await Promise.all(
            Object.entries(responses).map(async ([questionId, response]) => {
                if (response.answer !== null || response.status !== 'not_visited') {
                    const result = await saveResponse({
                        attemptId: attemptId!,
                        questionId,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                        sessionToken,
                    });
                    if (!result.success && result.error === 'SESSION_CONFLICT') {
                        setSessionConflict({
                            type: 'save',
                            payload: {
                                attemptId: attemptId!,
                                questionId,
                                answer: response.answer,
                                status: response.status,
                                isMarkedForReview: response.isMarkedForReview,
                                timeSpentSeconds: response.timeSpentSeconds,
                                sessionToken,
                            },
                        });
                    }
                }
            })
        );

        // Submit exam
        const result = await submitExam(attemptId, { sessionToken, submissionId: submissionIdRef.current });

        if (result.success) {
            // Clear local storage
            localStorage.removeItem(`cat-exam-state-${attemptId}`);

            // Redirect to results
            router.push(`/result/${attemptId}`);
        } else {
            if (result.error === 'SESSION_CONFLICT') {
                setSessionConflict({ type: 'submit' });
                return;
            }
            logger.error('Failed to submit exam', result.error, { attemptId });
            alert('Failed to submit exam. Please try again.');
        }
    }, [attemptId, responses, router, sessionToken]);

    const handleResolveConflict = useCallback(async (resumeHere: boolean) => {
        if (!sessionConflict) return;

        if (!resumeHere) {
            setSessionConflict(null);
            return;
        }

        setIsResolvingConflict(true);
        try {
            if (sessionConflict.type === 'save') {
                const retry = await saveResponse({
                    ...sessionConflict.payload,
                    force_resume: true,
                });
                if (!retry.success && retry.error !== 'SESSION_CONFLICT') {
                    logger.error('Force resume save failed', retry.error);
                }
            }

            if (sessionConflict.type === 'submit') {
                const retry = await submitExam(attemptId!, {
                    sessionToken,
                    force_resume: true,
                    submissionId: submissionIdRef.current,
                });
                if (retry.success) {
                    localStorage.removeItem(`cat-exam-state-${attemptId}`);
                    router.push(`/result/${attemptId}`);
                } else if (retry.error !== 'SESSION_CONFLICT') {
                    logger.error('Force resume submit failed', retry.error, { attemptId });
                    alert('Failed to submit exam. Please try again.');
                }
            }
        } finally {
            setIsResolvingConflict(false);
            setSessionConflict(null);
        }
    }, [sessionConflict, attemptId, sessionToken, router]);

    // Handle pause exam
    const handlePauseExam = useCallback(async () => {
        if (!attemptId) return;

        const confirmed = window.confirm(
            'Are you sure you want to pause the exam? You can resume it later from the dashboard.'
        );

        if (!confirmed) return;

        // Save all current responses
        await Promise.all(
            Object.entries(responses).map(async ([questionId, response]) => {
                if (response.answer !== null || response.status !== 'not_visited') {
                    await saveResponse({
                        attemptId: attemptId!,
                        questionId,
                        answer: response.answer,
                        status: response.status,
                        isMarkedForReview: response.isMarkedForReview,
                        timeSpentSeconds: response.timeSpentSeconds,
                    });
                }
            })
        );

        // Build time remaining from current section timers
        const timeRemaining: TimeRemaining = {
            VARC: sectionTimers.VARC.remainingSeconds,
            DILR: sectionTimers.DILR.remainingSeconds,
            QA: sectionTimers.QA.remainingSeconds,
        };

        const currentSection = getSectionByIndex(currentSectionIndex);

        // Pause the exam
        const result = await pauseExam({
            attemptId,
            timeRemaining,
            currentSection,
            currentQuestion: currentQuestionIndex + 1,
        });

        if (result.success) {
            // Clear local storage
            localStorage.removeItem(`cat-exam-state-${attemptId}`);

            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            examLogger.examPaused(attemptId, false, result.error);
            alert('Failed to pause exam. Please try again.');
        }
    }, [attemptId, responses, sectionTimers, currentSectionIndex, currentQuestionIndex, router, sessionToken]);

    // Show loading while initializing
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ExamLayout
                paper={paper}
                questions={questions}
                onSaveResponse={handleSaveResponse}
                onSubmitExam={handleSubmitExam}
                onSectionExpire={handleSectionExpire}
                onPauseExam={handlePauseExam}
            />

            {sessionConflict && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Active session detected
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            You have an active session on another device. Do you want to terminate it and resume here?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => handleResolveConflict(false)}
                                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                disabled={isResolvingConflict}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleResolveConflict(true)}
                                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                disabled={isResolvingConflict}
                            >
                                {isResolvingConflict ? 'Resuming...' : 'Resume Here'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ExamClient;
````

## File: src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "CAT Mock Test Platform",
  description: "Practice CAT exams with adaptive testing and instant results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
````

## File: src/features/exam-engine/index.ts
````typescript
/**
 * @fileoverview Exam Engine Feature - Barrel Export
 * @description Public API for the exam engine feature module
 * @blueprint Milestone 4 - Feature-Sliced Design (FSD)
 */

// Model (Zustand Store)
export {
    useExamStore,
    createExamStore,
    selectCurrentSection,
    selectCurrentTimer,
    selectResponse,
    selectIsSectionLocked,
    selectQuestionStatus,
    selectSectionCounts,
} from './model/useExamStore';

// Hooks
export {
    useExamTimer,
    useSectionTimer,
    useAllSectionTimers,
    calculateRemainingSeconds,
    formatTime,
    getTimerState,
} from './hooks/useExamTimer';

// UI Components
export {
    ExamLayout,
    ExamTimer,
    SectionTimerSummary,
    QuestionPalette,
    MCQRenderer,
    TITARenderer,
    NavigationButtons,
    ExamSubmitButton,
} from './ui';

// Types are re-exported from the central types module
export type {
    ExamStore,
    ExamEngineState,
    ExamEngineActions,
    ResponseState,
    SectionTimerState,
} from '@/types/exam';

// Timer hook types
export type {
    UseExamTimerOptions,
    TimerDisplayData,
} from './hooks/useExamTimer';
````

## File: src/features/exam-engine/lib/index.ts
````typescript
/**
 * @fileoverview Exam Engine Library - Barrel Export
 * @description Server actions and validation schemas
 * @blueprint Milestone 4 - Feature-Sliced Design (FSD)
 */

// Server Actions
export {
    fetchPaperForExam,
    saveResponse,
    updateAttemptProgress,
    submitExam,
    fetchExamResults,
    type ActionResult,
} from './actions';

// Validation Schemas
export {
    // Base schemas
    SectionNameSchema,
    QuestionTypeSchema,
    QuestionStatusSchema,
    AttemptStatusSchema,
    DifficultySchema,
    PaperDifficultySchema,

    // Entity schemas
    SectionConfigSchema,
    QuestionSchema,
    QuestionWithAnswerSchema,
    PaperSchema,
    AttemptSchema,
    ResponseSchema,
    TimeRemainingSchema,
    SectionScoreSchema,
    SectionScoresSchema,

    // Request schemas
    FetchPaperRequestSchema,
    StartAttemptRequestSchema,
    SaveResponseRequestSchema,
    UpdateTimerRequestSchema,
    SubmitExamRequestSchema,

    // Response schemas
    ApiResponseSchema,
    FetchPaperResponseSchema,
    SubmitExamResponseSchema,

    // Types
    type SectionNameInput,
    type QuestionInput,
    type QuestionWithAnswerInput,
    type PaperInput,
    type AttemptInput,
    type ResponseInput,
    type TimeRemainingInput,
    type SaveResponseRequest,
    type UpdateTimerRequest,
    type SubmitExamRequest,
    type FetchPaperResponse,
    type SubmitExamResponse,
} from './validation';

// Scoring Engine (Milestone 5)
export {
    calculateScore,
    calculateQuestionMarks,
    calculateTimeTaken,
    compareAnswers,
    normalizeString,
    parseAsNumber,
    type ResponseForScoring,
    type QuestionScoringResult,
    type ScoringResult,
} from './scoring';
````

## File: src/features/exam-engine/model/useExamStore.ts
````typescript
/**
 * @fileoverview Exam Engine Zustand Store
 * @description Global state management for the CAT exam engine with localStorage persistence
 * @blueprint Milestone 4 SOP-SSOT - Phase 1.2
 * @architecture Uses Zustand with persist middleware for offline resilience
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from '@/lib/logger';
import type {
    ExamStore,
    ExamData,
    ResponseState,
    SectionName,
    SectionTimerState,
    QuestionStatus,
    Question,
} from '@/types/exam';
import {
    SECTION_ORDER,
    getSectionByIndex,
    calculateQuestionStatus,
    getSectionDurationSecondsMap,
} from '@/types/exam';

// =============================================================================
// INITIAL STATE
// =============================================================================

const createInitialTimerState = (sectionName: SectionName, durationSeconds: number): SectionTimerState => ({
    sectionName,
    startedAt: 0,
    durationSeconds,
    remainingSeconds: durationSeconds,
    isExpired: false,
});

const initialState: Omit<ExamStore, keyof import('@/types/exam').ExamEngineActions> = {
    // Hydration
    hasHydrated: false,

    // Exam metadata
    attemptId: null,
    paperId: null,
    sessionToken: null,  // P0 FIX: Session token for multi-device/tab prevention

    // Navigation
    currentSectionIndex: 0,
    currentQuestionIndex: 0,

    // Section locking
    lockedSections: [],

    // Responses
    responses: {},

    // Timer state per section
    sectionTimers: (() => {
        const defaults = getSectionDurationSecondsMap();
        return {
            VARC: createInitialTimerState('VARC', defaults.VARC),
            DILR: createInitialTimerState('DILR', defaults.DILR),
            QA: createInitialTimerState('QA', defaults.QA),
        };
    })(),

    // Question tracking - converted to arrays for JSON serialization
    visitedQuestions: new Set<string>(),
    markedQuestions: new Set<string>(),

    // Submission state
    isSubmitting: false,
    isAutoSubmitting: false,
};

// =============================================================================
// STORE CREATION
// =============================================================================

/**
 * Creates an exam store with optional persistence
 * @param attemptId - If provided, enables localStorage persistence keyed to this attempt
 */
export const createExamStore = (attemptId?: string) => {
    const storeName = attemptId ? `cat-exam-state-${attemptId}` : 'cat-exam-state-temp';

    return create<ExamStore>()(
        persist(
            (set, get) => ({
                ...initialState,

                // =====================================================================
                // INITIALIZATION
                // =====================================================================

                initializeExam: (data: ExamData) => {
                    const { paper, questions, attempt } = data;
                    const currentState = get();

                    // P0 FIX: Check if we're resuming the same attempt with persisted state
                    // If so, preserve the existing timer and response state
                    if (currentState.attemptId === attempt.id && currentState.hasHydrated) {
                        // Same attempt, already initialized - just update hydration flag
                        // This prevents timer reset on page refresh
                        logger.debug('Resuming existing attempt, preserving timer state', { attemptId: attempt.id });
                        return;
                    }

                    // Create initial response states for all questions
                    const responses: Record<string, ResponseState> = {};
                    questions.forEach((q) => {
                        responses[q.id] = {
                            answer: null,
                            status: 'not_visited',
                            isMarkedForReview: false,
                            timeSpentSeconds: 0,
                            visitCount: 0,
                        };
                    });

                    // Initialize section timers
                    // Use server-synced time_remaining from attempt if available (resuming)
                    // Otherwise start fresh with delta-time based calculation
                    const now = Date.now();

                    // Calculate startedAt from attempt.started_at for accurate delta-time
                    const attemptStartedAt = attempt.started_at
                        ? new Date(attempt.started_at).getTime()
                        : now;

                    const sectionDurations = getSectionDurationSecondsMap(paper.sections);
                    const sectionTimers: Record<SectionName, SectionTimerState> = {
                        VARC: {
                            sectionName: 'VARC',
                            // Use the original attempt start time for delta calculation
                            startedAt: attemptStartedAt,
                            durationSeconds: sectionDurations.VARC,
                            remainingSeconds: sectionDurations.VARC,
                            isExpired: false,
                        },
                        DILR: {
                            sectionName: 'DILR',
                            startedAt: 0, // Will be set when section starts
                            durationSeconds: sectionDurations.DILR,
                            remainingSeconds: sectionDurations.DILR,
                            isExpired: false,
                        },
                        QA: {
                            sectionName: 'QA',
                            startedAt: 0, // Will be set when section starts
                            durationSeconds: sectionDurations.QA,
                            remainingSeconds: sectionDurations.QA,
                            isExpired: false,
                        },
                    };

                    // Parse existing time_remaining from server if resuming
                    if (attempt.time_remaining) {
                        const timeRemaining = attempt.time_remaining;
                        if (timeRemaining.VARC !== undefined) {
                            sectionTimers.VARC.remainingSeconds = timeRemaining.VARC;
                            // If VARC has less than full time, calculate proper startedAt
                            if (timeRemaining.VARC < sectionDurations.VARC) {
                                const elapsedSeconds = sectionDurations.VARC - timeRemaining.VARC;
                                sectionTimers.VARC.startedAt = now - (elapsedSeconds * 1000);
                            }
                        }
                        if (timeRemaining.DILR !== undefined) {
                            sectionTimers.DILR.remainingSeconds = timeRemaining.DILR;
                        }
                        if (timeRemaining.QA !== undefined) {
                            sectionTimers.QA.remainingSeconds = timeRemaining.QA;
                        }
                    }

                    // Determine current section from attempt
                    const currentSection = attempt.current_section || 'VARC';
                    const currentSectionIndex = SECTION_ORDER[currentSection];

                    // If we're on a later section, set its startedAt to now (or calculate from remaining)
                    if (currentSectionIndex > 0 && sectionTimers[currentSection].startedAt === 0) {
                        const sectionTimer = sectionTimers[currentSection];
                        if (sectionTimer.remainingSeconds < sectionDurations[currentSection]) {
                            // Calculate startedAt based on remaining time
                            const elapsedSeconds = sectionDurations[currentSection] - sectionTimer.remainingSeconds;
                            sectionTimer.startedAt = now - (elapsedSeconds * 1000);
                        } else {
                            sectionTimer.startedAt = now;
                        }
                    }

                    // P0 FIX: Generate session token for multi-device/tab prevention
                    // Use crypto.randomUUID for secure random UUID generation
                    const sessionToken = typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    set({
                        hasHydrated: true,
                        attemptId: attempt.id,
                        paperId: paper.id,
                        sessionToken,
                        currentSectionIndex,
                        currentQuestionIndex: 0,
                        lockedSections: [],
                        responses,
                        sectionTimers,
                        visitedQuestions: new Set(),
                        markedQuestions: new Set(),
                        isSubmitting: false,
                        isAutoSubmitting: false,
                    });
                },

                setHasHydrated: (hydrated: boolean) => {
                    set({ hasHydrated: hydrated });
                },

                // =====================================================================
                // NAVIGATION
                // =====================================================================

                goToQuestion: (questionId: string, sectionIndex: number, questionIndex: number) => {
                    const state = get();

                    // Validate section access (no backward navigation between sections)
                    if (sectionIndex < state.currentSectionIndex) {
                        logger.warn('Cannot navigate to locked section', { attemptId: state.attemptId, targetSection: sectionIndex, currentSection: state.currentSectionIndex });
                        return;
                    }

                    // Mark question as visited
                    const newVisitedQuestions = new Set(state.visitedQuestions);
                    newVisitedQuestions.add(questionId);

                    // Update response status if first visit
                    const response = state.responses[questionId];
                    if (response && response.status === 'not_visited') {
                        set({
                            currentSectionIndex: sectionIndex,
                            currentQuestionIndex: questionIndex,
                            visitedQuestions: newVisitedQuestions,
                            responses: {
                                ...state.responses,
                                [questionId]: {
                                    ...response,
                                    status: 'visited',
                                    visitCount: response.visitCount + 1,
                                },
                            },
                        });
                    } else if (response) {
                        set({
                            currentSectionIndex: sectionIndex,
                            currentQuestionIndex: questionIndex,
                            visitedQuestions: newVisitedQuestions,
                            responses: {
                                ...state.responses,
                                [questionId]: {
                                    ...response,
                                    visitCount: response.visitCount + 1,
                                },
                            },
                        });
                    } else {
                        set({
                            currentSectionIndex: sectionIndex,
                            currentQuestionIndex: questionIndex,
                            visitedQuestions: newVisitedQuestions,
                        });
                    }
                },

                goToNextQuestion: () => {
                    const state = get();
                    // This will be called with question context from the UI
                    // The actual logic depends on current section's question list
                    set({
                        currentQuestionIndex: state.currentQuestionIndex + 1,
                    });
                },

                goToPreviousQuestion: () => {
                    const state = get();
                    if (state.currentQuestionIndex > 0) {
                        set({
                            currentQuestionIndex: state.currentQuestionIndex - 1,
                        });
                    }
                },

                // =====================================================================
                // ANSWER MANAGEMENT
                // =====================================================================

                setAnswer: (questionId: string, answer: string | null) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) {
                        logger.warn('Response not found for question', { questionId, attemptId: state.attemptId });
                        return;
                    }

                    const hasAnswer = answer !== null && answer !== '';
                    const newStatus = calculateQuestionStatus(
                        hasAnswer,
                        response.isMarkedForReview,
                        true // Always visited if answering
                    );

                    // Update marked questions set if needed
                    const newMarkedQuestions = new Set(state.markedQuestions);
                    if (response.isMarkedForReview) {
                        newMarkedQuestions.add(questionId);
                    }

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                answer,
                                status: newStatus,
                            },
                        },
                        markedQuestions: newMarkedQuestions,
                    });
                },

                clearAnswer: (questionId: string) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) return;

                    const newStatus = calculateQuestionStatus(
                        false, // No answer
                        response.isMarkedForReview,
                        true // Still visited
                    );

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                answer: null,
                                status: newStatus,
                            },
                        },
                    });
                },

                toggleMarkForReview: (questionId: string) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) return;

                    const newIsMarked = !response.isMarkedForReview;
                    const hasAnswer = response.answer !== null && response.answer !== '';

                    const newStatus = calculateQuestionStatus(hasAnswer, newIsMarked, true);

                    // Update marked questions set
                    const newMarkedQuestions = new Set(state.markedQuestions);
                    if (newIsMarked) {
                        newMarkedQuestions.add(questionId);
                    } else {
                        newMarkedQuestions.delete(questionId);
                    }

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                isMarkedForReview: newIsMarked,
                                status: newStatus,
                            },
                        },
                        markedQuestions: newMarkedQuestions,
                    });
                },

                // =====================================================================
                // STATUS UPDATES
                // =====================================================================

                markQuestionVisited: (questionId: string) => {
                    const state = get();
                    const newVisitedQuestions = new Set(state.visitedQuestions);
                    newVisitedQuestions.add(questionId);

                    const response = state.responses[questionId];
                    if (response && response.status === 'not_visited') {
                        set({
                            visitedQuestions: newVisitedQuestions,
                            responses: {
                                ...state.responses,
                                [questionId]: {
                                    ...response,
                                    status: 'visited',
                                    visitCount: response.visitCount + 1,
                                },
                            },
                        });
                    } else {
                        set({ visitedQuestions: newVisitedQuestions });
                    }
                },

                updateTimeSpent: (questionId: string, seconds: number) => {
                    const state = get();
                    const response = state.responses[questionId];

                    if (!response) return;

                    set({
                        responses: {
                            ...state.responses,
                            [questionId]: {
                                ...response,
                                timeSpentSeconds: response.timeSpentSeconds + seconds,
                            },
                        },
                    });
                },

                // =====================================================================
                // SECTION MANAGEMENT
                // =====================================================================

                completeSection: (sectionName: SectionName) => {
                    const state = get();

                    // Add to locked sections if not already
                    if (!state.lockedSections.includes(sectionName)) {
                        set({
                            lockedSections: [...state.lockedSections, sectionName],
                        });
                    }
                },

                moveToNextSection: () => {
                    const state = get();
                    const currentSection = getSectionByIndex(state.currentSectionIndex);

                    // Lock current section
                    const newLockedSections = state.lockedSections.includes(currentSection)
                        ? state.lockedSections
                        : [...state.lockedSections, currentSection];

                    // Move to next section if not at QA
                    if (state.currentSectionIndex < 2) {
                        const nextSectionIndex = state.currentSectionIndex + 1;
                        const nextSection = getSectionByIndex(nextSectionIndex);

                        // Start timer for next section
                        const now = Date.now();

                        set({
                            currentSectionIndex: nextSectionIndex,
                            currentQuestionIndex: 0,
                            lockedSections: newLockedSections,
                            sectionTimers: {
                                ...state.sectionTimers,
                                [nextSection]: {
                                    ...state.sectionTimers[nextSection],
                                    startedAt: now,
                                },
                            },
                        });
                    } else {
                        // At QA - just lock it
                        set({
                            lockedSections: newLockedSections,
                        });
                    }
                },

                // =====================================================================
                // TIMER
                // =====================================================================

                updateSectionTimer: (sectionName: SectionName, remainingSeconds: number) => {
                    const state = get();

                    set({
                        sectionTimers: {
                            ...state.sectionTimers,
                            [sectionName]: {
                                ...state.sectionTimers[sectionName],
                                remainingSeconds: Math.max(0, remainingSeconds),
                            },
                        },
                    });
                },

                expireSection: (sectionName: SectionName) => {
                    const state = get();

                    set({
                        sectionTimers: {
                            ...state.sectionTimers,
                            [sectionName]: {
                                ...state.sectionTimers[sectionName],
                                remainingSeconds: 0,
                                isExpired: true,
                            },
                        },
                    });
                },

                // =====================================================================
                // SUBMISSION
                // =====================================================================

                setSubmitting: (isSubmitting: boolean) => {
                    set({ isSubmitting });
                },

                setAutoSubmitting: (isAutoSubmitting: boolean) => {
                    set({ isAutoSubmitting });
                },

                // =====================================================================
                // RESET
                // =====================================================================

                resetExam: () => {
                    set({
                        ...initialState,
                        hasHydrated: true,
                    });
                },
            }),
            {
                name: storeName,
                storage: createJSONStorage(() => localStorage),
                // Only persist essential data (not hydration flags or submission states)
                partialize: (state) => ({
                    attemptId: state.attemptId,
                    paperId: state.paperId,
                    sessionToken: state.sessionToken, // P0 FIX: Persist session token
                    currentSectionIndex: state.currentSectionIndex,
                    currentQuestionIndex: state.currentQuestionIndex,
                    lockedSections: state.lockedSections,
                    responses: state.responses,
                    sectionTimers: state.sectionTimers,
                    // Convert Sets to arrays for JSON serialization
                    visitedQuestions: Array.from(state.visitedQuestions),
                    markedQuestions: Array.from(state.markedQuestions),
                }),
                // Handle rehydration
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        // Convert arrays back to Sets after rehydration
                        state.visitedQuestions = new Set(
                            Array.isArray(state.visitedQuestions)
                                ? state.visitedQuestions
                                : []
                        );
                        state.markedQuestions = new Set(
                            Array.isArray(state.markedQuestions)
                                ? state.markedQuestions
                                : []
                        );
                        state.hasHydrated = true;
                    }
                },
            }
        )
    );
};

// =============================================================================
// DEFAULT STORE INSTANCE
// =============================================================================

// Default store for initial use (will be replaced with attemptId-specific store)
export const useExamStore = createExamStore();

// =============================================================================
// SELECTORS (for optimized re-renders)
// =============================================================================

/** Select current section name */
export const selectCurrentSection = (state: ExamStore): SectionName =>
    getSectionByIndex(state.currentSectionIndex);

/** Select current section timer */
export const selectCurrentTimer = (state: ExamStore): SectionTimerState => {
    const section = getSectionByIndex(state.currentSectionIndex);
    return state.sectionTimers[section];
};

/** Select response for a specific question */
export const selectResponse = (questionId: string) =>
    (state: ExamStore): ResponseState | undefined => state.responses[questionId];

/** Select if a section is locked */
export const selectIsSectionLocked = (sectionName: SectionName) =>
    (state: ExamStore): boolean => state.lockedSections.includes(sectionName);

/** Select question status for palette */
export const selectQuestionStatus = (questionId: string) =>
    (state: ExamStore): QuestionStatus => {
        const response = state.responses[questionId];
        return response?.status ?? 'not_visited';
    };

/** Count questions by status in current section */
export const selectSectionCounts = (questions: Question[]) =>
    (state: ExamStore) => {
        const counts = {
            total: questions.length,
            notVisited: 0,
            visited: 0,
            answered: 0,
            marked: 0,
            answeredMarked: 0,
        };

        questions.forEach((q) => {
            const response = state.responses[q.id];
            if (!response) {
                counts.notVisited++;
                return;
            }

            switch (response.status) {
                case 'not_visited':
                    counts.notVisited++;
                    break;
                case 'visited':
                    counts.visited++;
                    break;
                case 'answered':
                    counts.answered++;
                    break;
                case 'marked':
                    counts.marked++;
                    break;
                case 'answered_marked':
                    counts.answeredMarked++;
                    break;
            }
        });

        return counts;
    };
````

## File: src/features/exam-engine/ui/ExamTimer.tsx
````typescript
/**
 * @fileoverview Exam Timer Display Component
 * @description Visual timer display with progress bar and state-based styling
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.1
 */

'use client';

import { useExamTimer, type TimerDisplayData } from '@/features/exam-engine';

// =============================================================================
// TIMER DISPLAY COMPONENT
// =============================================================================

interface ExamTimerProps {
    /** Optional CSS class name */
    className?: string;
    /** Show progress bar */
    showProgressBar?: boolean;
    /** Compact mode (for header) */
    compact?: boolean;
}

/**
 * Get color classes based on timer state
 */
function getTimerStyles(state: TimerDisplayData['state']) {
    // TCS iON-inspired colors
    switch (state) {
        case 'critical':
            return {
                text: 'text-[#d32f2f] animate-pulse',
                bg: 'bg-[#d32f2f]',
                border: 'border-[#c62828]',
                progressBg: 'bg-red-100',
            };
        case 'warning':
            return {
                text: 'text-[#f9a825]',
                bg: 'bg-[#f9a825]',
                border: 'border-[#f57f17]',
                progressBg: 'bg-yellow-100',
            };
        case 'expired':
            return {
                text: 'text-gray-500',
                bg: 'bg-gray-500',
                border: 'border-gray-500',
                progressBg: 'bg-gray-100',
            };
        default:
            return {
                text: 'text-[#2e7d32]',
                bg: 'bg-[#388e3c]',
                border: 'border-[#2e7d32]',
                progressBg: 'bg-green-100',
            };
    }
}

export function ExamTimer({
    className = '',
    showProgressBar = true,
    compact = false
}: ExamTimerProps) {
    const { timerData } = useExamTimer();
    const styles = getTimerStyles(timerData.state);

    if (compact) {
        // Compact mode for dark header - use white text with state-based background
        const compactBg = timerData.state === 'critical'
            ? 'bg-red-600/20'
            : timerData.state === 'warning'
                ? 'bg-yellow-500/20'
                : '';
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-sm text-white/80">{timerData.sectionName}</span>
                <span className={`font-mono text-lg font-bold text-white ${compactBg} px-1 rounded ${timerData.state === 'critical' ? 'animate-pulse' : ''}`}>
                    {timerData.displayTime}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Section Name */}
            <div className="text-sm font-semibold text-[#0b3d91] mb-1">
                {timerData.sectionName} Section
            </div>

            {/* Time Display */}
            <div className={`font-mono text-3xl font-bold ${styles.text}`}>
                {timerData.displayTime}
            </div>

            {/* Progress Bar */}
            {showProgressBar && (
                <div className={`w-full mt-2 h-2 rounded-full border ${styles.progressBg}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${styles.bg}`}
                        style={{ width: `${timerData.progressPercent}%` }}
                    />
                </div>
            )}

            {/* State Label */}
            {timerData.state === 'warning' && (
                <div className="mt-1 text-xs text-orange-500 font-medium">
                    Less than 5 minutes remaining
                </div>
            )}
            {timerData.state === 'critical' && (
                <div className="mt-1 text-xs text-red-600 font-medium animate-pulse">
                    Less than 1 minute remaining!
                </div>
            )}
            {timerData.state === 'expired' && (
                <div className="mt-1 text-xs text-gray-600 font-medium">
                    Time expired
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SECTION TIMER SUMMARY
// =============================================================================

interface SectionTimerSummaryProps {
    className?: string;
}

/**
 * Shows all three section timers in a summary view
 */
export function SectionTimerSummary({ className = '' }: SectionTimerSummaryProps) {
    const { timerData } = useExamTimer();

    return (
        <div className={`flex items-center justify-between text-sm ${className}`}>
            <div className="flex items-center gap-4">
                <span className="font-medium text-gray-600">Time Left:</span>
                <span className={`font-mono font-bold ${getTimerStyles(timerData.state).text}`}>
                    {timerData.displayTime}
                </span>
            </div>
            <div className="text-gray-500">
                Section: <span className="font-medium text-gray-700">{timerData.sectionName}</span>
            </div>
        </div>
    );
}

export default ExamTimer;
````

## File: src/features/exam-engine/ui/QuestionAnalysis.tsx
````typescript
/**
 * @fileoverview Question Analysis Component
 * @description Detailed question-by-question review with Masked Review Mode and Peer Stats
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { type SectionName, type QuestionType } from '@/types/exam';
import { MathText } from './MathText';

interface QuestionData {
    id: string;
    section: SectionName;
    question_number: number;
    question_text: string;
    question_type: QuestionType;
    options: string[] | null;
    correct_answer: string;
    solution_text?: string | null;
    question_image_url?: string | null;
    topic?: string | null;
    difficulty?: string | null;
}

interface ResponseData {
    question_id: string;
    answer: string | null;
    is_correct: boolean | null;
    marks_obtained: number | null;
}

/** Peer statistics for a paper - aggregated response counts */
interface PaperStats {
    [questionId: string]: {
        total: number;
        options: Record<string, number>;
    };
}

interface QuestionAnalysisProps {
    questions: QuestionData[];
    responses: ResponseData[];
    peerStats?: PaperStats;
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'unanswered';

/** Get response for a question */
function getResponse(questionId: string, responses: ResponseData[]): ResponseData | undefined {
    return responses.find(r => r.question_id === questionId);
}

/** Get status styling - ONLY used when answer is revealed */
function getStatusStyle(isCorrect: boolean | null, hasAnswer: boolean): {
    bgClass: string;
    borderClass: string;
    textClass: string;
    label: string;
} {
    if (!hasAnswer) {
        return {
            bgClass: 'bg-gray-100',
            borderClass: 'border-gray-300',
            textClass: 'text-gray-600',
            label: 'Unanswered',
        };
    }
    if (isCorrect) {
        return {
            bgClass: 'bg-green-50',
            borderClass: 'border-green-400',
            textClass: 'text-green-700',
            label: 'Correct',
        };
    }
    return {
        bgClass: 'bg-red-50',
        borderClass: 'border-red-400',
        textClass: 'text-red-700',
        label: 'Incorrect',
    };
}

/** Get neutral styling for masked mode (before reveal) */
function getMaskedStyle(): {
    bgClass: string;
    borderClass: string;
    textClass: string;
    label: string;
} {
    return {
        bgClass: 'bg-white',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-700',
        label: 'Review',
    };
}

/** Format option label (A, B, C, D) */
function getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
}

export function QuestionAnalysis({ questions, responses, peerStats = {} }: QuestionAnalysisProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const [visibleSolutions, setVisibleSolutions] = useState<Set<string>>(new Set());
    // Masked Review: Track which questions have had their answer/solution revealed
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
    const [activeSection, setActiveSection] = useState<SectionName | 'all'>('all');
    const [activeTopic, setActiveTopic] = useState<string>('all');

    // Filter questions (section + status)
    const baseFilteredQuestions = questions.filter(q => {
        const response = getResponse(q.id, responses);
        const hasAnswer = response?.answer !== null && response?.answer !== undefined && response?.answer?.trim() !== '';
        const isCorrect = response?.is_correct;

        // Section filter
        if (activeSection !== 'all' && q.section !== activeSection) return false;

        // Status filter
        switch (filter) {
            case 'correct':
                return hasAnswer && isCorrect === true;
            case 'incorrect':
                return hasAnswer && isCorrect === false;
            case 'unanswered':
                return !hasAnswer;
            default:
                return true;
        }
    });

    const topics = useMemo(() => {
        const counts = new Map<string, number>();
        baseFilteredQuestions.forEach((q) => {
            const topic = q.topic?.trim() || 'Uncategorized';
            counts.set(topic, (counts.get(topic) ?? 0) + 1);
        });
        return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
    }, [baseFilteredQuestions]);

    useEffect(() => {
        if (activeTopic === 'all') return;
        const exists = topics.some(t => t.name === activeTopic);
        if (!exists) {
            setActiveTopic('all');
        }
    }, [activeTopic, topics]);

    const filteredQuestions = activeTopic === 'all'
        ? baseFilteredQuestions
        : baseFilteredQuestions.filter(q => (q.topic?.trim() || 'Uncategorized') === activeTopic);

    // Toggle question expansion
    const toggleQuestion = (questionId: string) => {
        setExpandedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Reveal correct answer and solution (Masked Review Mode)
    const revealAnswer = (questionId: string) => {
        setRevealedIds(prev => {
            const newSet = new Set(prev);
            newSet.add(questionId);
            return newSet;
        });
        // Also show solution when revealing
        setVisibleSolutions(prev => {
            const newSet = new Set(prev);
            newSet.add(questionId);
            return newSet;
        });
    };

    const toggleSolution = (questionId: string) => {
        setVisibleSolutions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Calculate peer percentage for an option
    const getOptionPercentage = (questionId: string, optionLabel: string): number | null => {
        const stats = peerStats[questionId];
        if (!stats || stats.total === 0) return null;
        const count = stats.options[optionLabel] ?? 0;
        return Math.round((count / stats.total) * 100);
    };

    // Stats for filters
    const stats = {
        correct: questions.filter(q => {
            const r = getResponse(q.id, responses);
            return r?.is_correct === true;
        }).length,
        incorrect: questions.filter(q => {
            const r = getResponse(q.id, responses);
            const hasAnswer = r?.answer !== null && r?.answer !== undefined && r?.answer?.trim() !== '';
            return hasAnswer && r?.is_correct === false;
        }).length,
        unanswered: questions.filter(q => {
            const r = getResponse(q.id, responses);
            return !r?.answer || r.answer.trim() === '';
        }).length,
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Question Analysis
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Section Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(['all', 'VARC', 'DILR', 'QA'] as const).map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeSection === section
                                ? 'bg-white shadow text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {section === 'all' ? 'All' : section}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'all'
                            ? 'bg-white shadow text-gray-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All ({questions.length})
                    </button>
                    <button
                        onClick={() => setFilter('correct')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'correct'
                            ? 'bg-green-100 text-green-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ✓ Correct ({stats.correct})
                    </button>
                    <button
                        onClick={() => setFilter('incorrect')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'incorrect'
                            ? 'bg-red-100 text-red-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ✗ Wrong ({stats.incorrect})
                    </button>
                    <button
                        onClick={() => setFilter('unanswered')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'unanswered'
                            ? 'bg-gray-300 text-gray-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        – Skipped ({stats.unanswered})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question List */}
                <div className="space-y-3 lg:col-span-3">
                    {filteredQuestions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No questions match the selected filters.
                        </div>
                    ) : (
                        filteredQuestions.map((question) => {
                            const response = getResponse(question.id, responses);
                            const hasAnswer = response?.answer !== null && response?.answer !== undefined && response?.answer?.trim() !== '';
                            const isExpanded = expandedQuestions.has(question.id);
                            const isSolutionVisible = visibleSolutions.has(question.id);
                            // Masked Review Mode: Only show correct/incorrect styling after reveal
                            const isRevealed = revealedIds.has(question.id);
                            const style = isRevealed
                                ? getStatusStyle(response?.is_correct ?? null, hasAnswer)
                                : getMaskedStyle();

                            return (
                                <div
                                    key={question.id}
                                    id={`question-${question.id}`}
                                    className={`border-2 ${style.borderClass} ${style.bgClass} rounded-lg overflow-hidden transition-all`}
                                >
                                    {/* Question Header (Click to expand) */}
                                    <button
                                        onClick={() => toggleQuestion(question.id)}
                                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/50 transition-colors"
                                    >
                                        {/* Question Number */}
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border flex items-center justify-center">
                                            <span className="text-sm text-gray-500">Q{question.question_number}</span>
                                        </div>

                                        {/* Status & Section */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {isRevealed ? (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${style.textClass} bg-white`}>
                                                        {style.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded text-blue-600 bg-blue-50">
                                                        {hasAnswer ? 'Attempted' : 'Skipped'}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {question.section}
                                                </span>
                                                {question.topic && (
                                                    <span className="text-xs text-gray-400">
                                                        • {question.topic}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 truncate">
                                                {question.question_text.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                            </p>
                                        </div>

                                        {/* Marks - only show after reveal */}
                                        <div className="flex-shrink-0 text-right">
                                            {isRevealed ? (
                                                <>
                                                    <span className={`text-lg font-bold ${style.textClass}`}>
                                                        {response?.marks_obtained !== null && response?.marks_obtained !== undefined
                                                            ? (response.marks_obtained > 0 ? '+' : '') + response.marks_obtained
                                                            : '0'
                                                        }
                                                    </span>
                                                    <span className="text-xs text-gray-400 block">marks</span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">Click to review</span>
                                            )}
                                        </div>

                                        {/* Expand Icon */}
                                        <div className="flex-shrink-0">
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t bg-white p-4 space-y-4">
                                            {/* Question Image */}
                                            {question.question_image_url && (
                                                <div className="mb-4">
                                                    <img
                                                        src={question.question_image_url}
                                                        alt={`Question ${question.question_number} diagram`}
                                                        className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Full Question Text */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Question</h4>
                                                <div className="text-gray-800 prose prose-sm max-w-none">
                                                    <MathText text={question.question_text} />
                                                </div>
                                            </div>

                                            {/* Options (for MCQ) with Masked Review Mode */}
                                            {question.question_type === 'MCQ' && question.options && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Options</h4>
                                                    <div className="space-y-2">
                                                        {question.options.map((option, idx) => {
                                                            const optionLabel = getOptionLabel(idx);
                                                            const isUserAnswer = response?.answer === optionLabel;
                                                            const isCorrectAnswer = question.correct_answer === optionLabel;
                                                            const peerPercent = isRevealed ? getOptionPercentage(question.id, optionLabel) : null;

                                                            // Masked mode: only show user's answer (neutral), no correct/incorrect
                                                            let optionBgClass = 'bg-gray-50';
                                                            let optionBorderClass = '';
                                                            let badgeClass = 'bg-gray-200 text-gray-600';

                                                            if (isRevealed) {
                                                                // Revealed: show correct/incorrect highlighting
                                                                if (isCorrectAnswer) {
                                                                    optionBgClass = 'bg-green-100';
                                                                    optionBorderClass = 'border border-green-300';
                                                                    badgeClass = 'bg-green-500 text-white';
                                                                } else if (isUserAnswer) {
                                                                    optionBgClass = 'bg-red-100';
                                                                    optionBorderClass = 'border border-red-300';
                                                                    badgeClass = 'bg-red-500 text-white';
                                                                }
                                                            } else {
                                                                // Masked: only highlight user's selection neutrally
                                                                if (isUserAnswer) {
                                                                    optionBgClass = 'bg-blue-50';
                                                                    optionBorderClass = 'border border-blue-200';
                                                                    badgeClass = 'bg-blue-500 text-white';
                                                                }
                                                            }

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex items-start gap-3 p-2 rounded-lg ${optionBgClass} ${optionBorderClass}`}
                                                                >
                                                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${badgeClass}`}>
                                                                        {optionLabel}
                                                                    </span>
                                                                    <span className="flex-1 text-sm text-gray-700">
                                                                        <MathText text={option} />
                                                                    </span>

                                                                    {/* Peer Stats Overlay - only after reveal */}
                                                                    {isRevealed && peerPercent !== null && (
                                                                        <div className="flex items-center gap-2 ml-auto">
                                                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full rounded-full ${isCorrectAnswer ? 'bg-green-400' : 'bg-gray-400'}`}
                                                                                    style={{ width: `${peerPercent}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs text-gray-500 w-8">{peerPercent}%</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Labels */}
                                                                    {isRevealed && isCorrectAnswer && (
                                                                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                                                            ✓ Correct
                                                                        </span>
                                                                    )}
                                                                    {isRevealed && isUserAnswer && !isCorrectAnswer && (
                                                                        <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                                                                            Your answer
                                                                        </span>
                                                                    )}
                                                                    {!isRevealed && isUserAnswer && (
                                                                        <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
                                                                            Your answer
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* TITA Answer - Masked Review Mode */}
                                            {question.question_type === 'TITA' && (
                                                <div className="flex gap-6">
                                                    {isRevealed ? (
                                                        <>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Correct Answer</h4>
                                                                <p className="text-lg font-bold text-green-600">
                                                                    {question.correct_answer}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Your Answer</h4>
                                                                <p className={`text-lg font-bold ${response?.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {response?.answer || '(Not answered)'}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Your Answer</h4>
                                                            <p className="text-lg font-bold text-blue-600">
                                                                {response?.answer || '(Not answered)'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Check Answer Button - Masked Review Mode */}
                                            {!isRevealed && (
                                                <div className="pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => revealAnswer(question.id)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                                    >
                                                        🔍 Check Answer & Show Solution
                                                    </button>
                                                </div>
                                            )}

                                            {/* Solution - only after reveal */}
                                            {isRevealed && question.solution_text && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-gray-500">Solution</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSolution(question.id)}
                                                            className="text-blue-600 hover:underline text-sm"
                                                            aria-expanded={isSolutionVisible}
                                                        >
                                                            {isSolutionVisible ? 'Hide Solution' : 'View Solution'}
                                                        </button>
                                                    </div>
                                                    <div
                                                        className={`transition-all duration-200 ${isSolutionVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                                    >
                                                        <div className="text-gray-700 prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg">
                                                            <MathText text={question.solution_text ?? ''} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Topic Navigator */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-4 space-y-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3">Topics</h3>
                            <button
                                type="button"
                                onClick={() => setActiveTopic('all')}
                                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${activeTopic === 'all'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                All Topics ({baseFilteredQuestions.length})
                            </button>
                            <div className="mt-2 space-y-1">
                                {topics.length === 0 ? (
                                    <div className="text-xs text-gray-400">No topics available.</div>
                                ) : (
                                    topics.map((topic) => (
                                        <button
                                            key={topic.name}
                                            type="button"
                                            onClick={() => setActiveTopic(topic.name)}
                                            className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${activeTopic === topic.name
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {topic.name} ({topic.count})
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default QuestionAnalysis;
````

## File: src/features/exam-engine/ui/QuestionPalette.tsx
````typescript
/**
 * @fileoverview Question Palette Component
 * @description Grid of question buttons with status-based colors for exam navigation
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.2
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useExamStore, selectCurrentSection } from '@/features/exam-engine';
import type { Question, QuestionStatus } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionPaletteProps {
    /** All questions for the current paper */
    questions: Question[];
    /** Optional CSS class name */
    className?: string;
    /** Callback when a question is clicked */
    onQuestionClick?: (questionId: string, index: number) => void;
}

interface QuestionButtonProps {
    index: number;
    status: QuestionStatus;
    isCurrent: boolean;
    onClick: () => void;
}

// =============================================================================
// STATUS COLORS (CAT exam standard)
// =============================================================================

/**
 * Get button styles based on question status
 * Colors match standard CAT exam palette
 */
function getStatusStyles(status: QuestionStatus, isCurrent: boolean) {
    const baseStyles = 'w-10 h-10 rounded-md flex items-center justify-center text-sm font-semibold transition-all border';
    const currentRing = isCurrent ? 'ring-2 ring-offset-1 ring-[#1565c0]' : '';

    // TCS iON-inspired palette
    switch (status) {
        case 'answered':
            return {
                className: `${baseStyles} ${currentRing} bg-[#4caf50] text-white hover:bg-[#43a047] border-[#388e3c]`,
                label: 'Answered',
                icon: '✓',
            };
        case 'answered_marked':
            return {
                className: `${baseStyles} ${currentRing} bg-[#5c6bc0] text-white hover:bg-[#4652a3] border-[#3949ab]`,
                label: 'Answered & Marked for Review',
                icon: '✓?',
            };
        case 'marked':
            return {
                className: `${baseStyles} ${currentRing} bg-[#7e57c2] text-white hover:bg-[#6a46ae] border-[#5e35b1]`,
                label: 'Marked for Review',
                icon: '?',
            };
        case 'visited':
            return {
                className: `${baseStyles} ${currentRing} bg-[#e53935] text-white hover:bg-[#d32f2f] border-[#c62828]`,
                label: 'Not Answered',
                icon: '',
            };
        case 'not_visited':
        default:
            return {
                className: `${baseStyles} ${currentRing} bg-[#eceff1] text-[#37474f] hover:bg-[#e0e6e9] border-[#cfd8dc]`,
                label: 'Not Visited',
                icon: '',
            };
    }
}

// =============================================================================
// QUESTION BUTTON
// =============================================================================

function QuestionButton({ index, status, isCurrent, onClick }: QuestionButtonProps) {
    const styles = getStatusStyles(status, isCurrent);

    return (
        <button
            type="button"
            onClick={onClick}
            className={styles.className}
            title={`Question ${index + 1}: ${styles.label}`}
            aria-label={`Go to question ${index + 1}, status: ${styles.label}`}
            aria-current={isCurrent ? 'true' : undefined}
        >
            {index + 1}
        </button>
    );
}

// =============================================================================
// LEGEND
// =============================================================================

function PaletteLegend() {
    const legends = [
        { status: 'answered' as const, label: 'Answered', color: 'bg-[#4caf50]' },
        { status: 'visited' as const, label: 'Not Answered', color: 'bg-[#e53935]' },
        { status: 'not_visited' as const, label: 'Not Visited', color: 'bg-[#eceff1] border border-[#cfd8dc]' },
        { status: 'marked' as const, label: 'Marked for Review', color: 'bg-[#7e57c2]' },
        { status: 'answered_marked' as const, label: 'Answered & Marked', color: 'bg-[#5c6bc0]' },
    ];

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Legend</h4>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
                {legends.map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color}`} />
                        <span className="text-gray-600">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// SECTION COUNTS
// =============================================================================

interface SectionCountsProps {
    questions: Question[];
}

function SectionCounts({ questions }: SectionCountsProps) {
    const responses = useExamStore((s) => s.responses);

    const counts = useMemo(() => {
        const result = {
            answered: 0,
            notAnswered: 0,
            notVisited: 0,
            markedForReview: 0,
        };

        questions.forEach((q) => {
            const response = responses[q.id];
            if (!response || response.status === 'not_visited') {
                result.notVisited++;
            } else if (response.status === 'answered' || response.status === 'answered_marked') {
                result.answered++;
                if (response.status === 'answered_marked') {
                    result.markedForReview++;
                }
            } else if (response.status === 'visited') {
                result.notAnswered++;
            } else if (response.status === 'marked') {
                result.markedForReview++;
                result.notAnswered++;
            }
        });

        return result;
    }, [questions, responses]);

    return (
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#4caf50]" />
                <span className="text-gray-600">{counts.answered} Answered</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#e53935]" />
                <span className="text-gray-600">{counts.notAnswered} Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#eceff1] border border-[#cfd8dc]" />
                <span className="text-gray-600">{counts.notVisited} Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#7e57c2]" />
                <span className="text-gray-600">{counts.markedForReview} Marked</span>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestionPalette({
    questions,
    className = '',
    onQuestionClick
}: QuestionPaletteProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const responses = useExamStore((s) => s.responses);
    const goToQuestion = useExamStore((s) => s.goToQuestion);

    // Get questions for current section
    const sectionQuestions = useMemo(() => {
        return getQuestionsForSection(questions, currentSection);
    }, [questions, currentSection]);

    // Handle question click
    const handleQuestionClick = useCallback((question: Question, index: number) => {
        goToQuestion(question.id, currentSectionIndex, index);
        onQuestionClick?.(question.id, index);
    }, [goToQuestion, currentSectionIndex, onQuestionClick]);

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {currentSection}
                </h3>
                <span className="text-sm text-gray-500">
                    {sectionQuestions.length} Questions
                </span>
            </div>

            {/* Counts Summary */}
            <SectionCounts questions={sectionQuestions} />

            {/* Question Grid */}
            <div className="grid grid-cols-6 gap-2 mb-4">
                {sectionQuestions.map((question, index) => {
                    const response = responses[question.id];
                    const status: QuestionStatus = response?.status ?? 'not_visited';
                    const isCurrent = index === currentQuestionIndex;

                    return (
                        <QuestionButton
                            key={question.id}
                            index={index}
                            status={status}
                            isCurrent={isCurrent}
                            onClick={() => handleQuestionClick(question, index)}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <PaletteLegend />
        </div>
    );
}

export default QuestionPalette;
````

## File: src/features/exam-engine/ui/SectionalPerformance.tsx
````typescript
/**
 * @fileoverview Sectional Performance Component
 * @description Section-wise breakdown of exam performance (VARC, DILR, QA)
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

import { type SectionName } from '@/types/exam';

interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

interface SectionalPerformanceProps {
    sectionScores: Record<string, SectionScore>;
    sectionConfig?: {
        [key: string]: {
            maxMarks: number;
            totalQuestions: number;
        };
    };
}

/** Section display configuration */
const SECTION_DISPLAY: Record<SectionName, {
    name: string;
    fullName: string;
    color: string;
    bgColor: string;
}> = {
    VARC: {
        name: 'VARC',
        fullName: 'Verbal Ability & Reading Comprehension',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
    },
    DILR: {
        name: 'DILR',
        fullName: 'Data Interpretation & Logical Reasoning',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
    },
    QA: {
        name: 'QA',
        fullName: 'Quantitative Aptitude',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
    },
};

/** Default CAT 2024 section config */
const DEFAULT_SECTION_CONFIG: Record<SectionName, { maxMarks: number; totalQuestions: number }> = {
    VARC: { maxMarks: 72, totalQuestions: 24 },
    DILR: { maxMarks: 60, totalQuestions: 20 },
    QA: { maxMarks: 66, totalQuestions: 22 },
};

export function SectionalPerformance({ sectionScores, sectionConfig }: SectionalPerformanceProps) {
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    const config = sectionConfig || DEFAULT_SECTION_CONFIG;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Section-wise Performance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sections.map((sectionName) => {
                    const scores = sectionScores[sectionName];
                    const sectionDisplay = SECTION_DISPLAY[sectionName];
                    const sectionCfg = config[sectionName] || { maxMarks: 0, totalQuestions: 0 };

                    if (!scores) {
                        return (
                            <div
                                key={sectionName}
                                className={`${sectionDisplay.bgColor} rounded-xl p-5 border`}
                            >
                                <h3 className={`font-bold text-lg ${sectionDisplay.color} mb-1`}>
                                    {sectionDisplay.name}
                                </h3>
                                <p className="text-gray-400 text-sm">No data available</p>
                            </div>
                        );
                    }

                    const totalAttempted = scores.correct + scores.incorrect;
                    const accuracy = totalAttempted > 0
                        ? ((scores.correct / totalAttempted) * 100).toFixed(1)
                        : '0.0';
                    const scorePercentage = sectionCfg.maxMarks > 0
                        ? (scores.score / sectionCfg.maxMarks) * 100
                        : 0;

                    return (
                        <div
                            key={sectionName}
                            className={`${sectionDisplay.bgColor} rounded-xl p-5 border shadow-sm transition-shadow hover:shadow-md`}
                        >
                            {/* Section Header */}
                            <div className="mb-4">
                                <h3 className={`font-bold text-lg ${sectionDisplay.color}`}>
                                    {sectionDisplay.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {sectionDisplay.fullName}
                                </p>
                            </div>

                            {/* Score Display */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-bold ${sectionDisplay.color}`}>
                                        {scores.score}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        / {sectionCfg.maxMarks}
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${scorePercentage >= 50 ? 'bg-green-500' :
                                            scorePercentage >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.max(0, Math.min(100, scorePercentage))}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Correct</span>
                                    <span className="font-semibold text-green-600">
                                        {scores.correct}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Incorrect</span>
                                    <span className="font-semibold text-red-600">
                                        {scores.incorrect}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Skipped</span>
                                    <span className="font-semibold text-gray-500">
                                        {scores.unanswered}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Accuracy</span>
                                    <span className="font-semibold text-orange-600">
                                        {accuracy}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SectionalPerformance;
````

## File: src/types/exam.ts
````typescript
/**
 * @fileoverview Exam Engine Type Definitions
 * @description TypeScript interfaces matching the "Nuclear Fix" database schema
 * @blueprint Milestone 4 SOP-SSOT - Phase 1.1
 * @deviation Uses 'section' field in questions table, not a separate sections table
 * @deviation Uses 'name' for section names (VARC, DILR, QA), not 'title'
 */

// =============================================================================
// SECTION TYPES (CAT 2024 Format)
// =============================================================================

/** CAT exam section names - strict order: VARC → DILR → QA */
export type SectionName = 'VARC' | 'DILR' | 'QA';

/** Section order mapping for strict navigation enforcement */
export const SECTION_ORDER: Record<SectionName, number> = {
    VARC: 0,
    DILR: 1,
    QA: 2,
} as const;

/** Section configuration from paper.sections JSONB */
export interface SectionConfig {
    name: SectionName;
    questions: number;  // Number of questions in section (VARC: 24, DILR: 20, QA: 22)
    time: number;       // Time in minutes (40 for all sections)
    marks: number;      // Total marks for section
}

/** CAT 2024 default section configuration */
export const CAT_2024_SECTIONS: SectionConfig[] = [
    { name: 'VARC', questions: 24, time: 40, marks: 72 },
    { name: 'DILR', questions: 20, time: 40, marks: 60 },
    { name: 'QA', questions: 22, time: 40, marks: 66 },
] as const;

// =============================================================================
// QUESTION TYPES
// =============================================================================

/** Question types in CAT exam */
export type QuestionType = 'MCQ' | 'TITA';

/** MCQ options structure */
export interface MCQOptions {
    A: string;
    B: string;
    C: string;
    D: string;
}

/** Difficulty levels for questions */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// =============================================================================
// QUESTION CONTAINER ARCHITECTURE (Parent-Child Model)
// =============================================================================

/**
 * Question Set Types
 * - VARC: Reading Comprehension passages with 4-6 linked questions
 * - DILR: Data Interpretation / Logical Reasoning with charts/tables
 * - CASELET: Case-based questions with shared scenario
 * - ATOMIC: Single standalone question (Quant, standalone Logic)
 * 
 * Note: Atomic questions create a set with exactly 1 child question.
 * This normalizes rendering logic across all question types.
 */
export type QuestionSetType = 'VARC' | 'DILR' | 'CASELET' | 'ATOMIC';

/**
 * Content Layout Types - determines how to render the context
 * - split_passage: Left pane = scrollable text passage, Right pane = questions
 * - split_chart: Left pane = sticky chart/diagram, Right pane = questions
 * - split_table: Left pane = data table, Right pane = questions
 * - single_focus: No split, centered single question layout
 * - image_top: Image above, question below (for diagrams in Quant)
 */
export type ContentLayoutType =
    | 'split_passage'
    | 'split_chart'
    | 'split_table'
    | 'single_focus'
    | 'image_top';

/**
 * Question Set Metadata - stored as JSON in the database
 */
export interface QuestionSetMetadata {
    difficulty?: DifficultyLevel;
    topic?: string;
    subtopic?: string;
    tags?: string[];
    source?: string;              // e.g., "CAT 2024 Slot 1"
    estimated_time_minutes?: number;
}

/**
 * Question Set Entity (Parent Container)
 * Contains the context/passage for composite questions
 */
export interface QuestionSet {
    id: string;
    paper_id: string;
    section: SectionName;

    // Set classification
    set_type: QuestionSetType;
    content_layout: ContentLayoutType;

    // Context content (The passage, chart, data table)
    context_title?: string;        // e.g., "Passage 1", "Data Set A"
    context_body?: string;         // Rich text / HTML / Markdown
    context_image_url?: string;    // Primary image (chart, diagram)
    context_additional_images?: Array<{
        url: string;
        caption?: string;
    }>;

    // Display configuration
    display_order: number;
    question_count: number;        // Denormalized count of child questions

    // Metadata
    metadata: QuestionSetMetadata;

    // Publishing state
    is_active: boolean;
    is_published: boolean;

    // Child questions (populated when fetched with JOIN)
    questions?: QuestionInSet[];

    created_at: string;
    updated_at: string;
}

/**
 * Question within a Set (Child entity)
 * Extends base question with set relationship
 */
export interface QuestionInSet {
    id: string;
    set_id: string;
    paper_id: string;
    section: SectionName;

    // Position within the set
    sequence_order: number;        // 1, 2, 3... within the set
    question_number: number;       // Global number in the paper

    // Content
    question_text: string;
    question_type: QuestionType;
    options: string[] | null;

    // Marking
    positive_marks: number;
    negative_marks: number;

    // Categorization
    difficulty?: DifficultyLevel;
    topic?: string;
    subtopic?: string;

    // Media
    question_image_url?: string;

    // Management
    is_active: boolean;
}

/**
 * Question in Set with correct answer (for results/admin)
 */
export interface QuestionInSetWithAnswer extends QuestionInSet {
    correct_answer: string;
    solution_text?: string;
    solution_image_url?: string;
    video_solution_url?: string;
}

/**
 * Complete Question Set with all questions (for exam rendering)
 */
export interface QuestionSetComplete extends QuestionSet {
    questions: QuestionInSet[];
}

/**
 * Complete Question Set with answers (for admin/results)
 */
export interface QuestionSetWithAnswers extends QuestionSet {
    questions: QuestionInSetWithAnswer[];
}

/**
 * Helper type: Check if set is composite (has context)
 */
export function isCompositeSet(setType: QuestionSetType): boolean {
    return setType === 'VARC' || setType === 'DILR' || setType === 'CASELET';
}

/**
 * Helper type: Check if layout should be split pane
 */
export function isSplitLayout(layout: ContentLayoutType): boolean {
    return layout.startsWith('split_');
}

// =============================================================================
// LEGACY: Context/Passage for shared questions (deprecated, use QuestionSet)
// =============================================================================

/** @deprecated Use QuestionSet instead */
export interface QuestionContext {
    id: string;
    paper_id: string;
    section: SectionName;
    title?: string;
    content: string;
    context_type: 'passage' | 'data_set' | 'image' | 'table';
    image_url?: string;
    display_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

/** Question entity from database */
export interface Question {
    id: string;
    paper_id: string;
    section: SectionName;
    question_number: number;

    // Content
    question_text: string;
    question_type: QuestionType;
    options: string[] | null;  // For MCQ: ["Option A", "Option B", "Option C", "Option D"]
    context_id?: string;       // Reference to shared passage/context
    context?: QuestionContext; // Populated context (joined from contexts table)
    // NOTE: correct_answer is EXCLUDED during exam, only available in results

    // Marking
    positive_marks: number;  // Default: 3.0
    negative_marks: number;  // Default: 1.0 for MCQ, 0 for TITA

    // Solution (only available after exam)
    solution_text?: string;
    solution_image_url?: string;
    video_solution_url?: string;

    // Question media
    question_image_url?: string;

    // Categorization
    difficulty?: DifficultyLevel;
    topic?: string;
    subtopic?: string;

    // Management
    is_active: boolean;

    created_at: string;
    updated_at: string;
}

/** Question with correct answer (for results/admin only) */
export interface QuestionWithAnswer extends Question {
    correct_answer: string;
}

// =============================================================================
// STATISTICS TYPES
// =============================================================================

/** Peer statistics for a single question */
export interface QuestionStats {
    total: number;
    options: Record<string, number>;
}

/** Peer statistics for an entire paper (keyed by question ID) */
export type PaperStats = Record<string, QuestionStats>;

// =============================================================================
// PAPER TYPES
// =============================================================================

/** Paper difficulty levels */
export type PaperDifficulty = 'easy' | 'medium' | 'hard' | 'cat-level';

/** Paper entity from database */
export interface Paper {
    id: string;
    slug: string;
    title: string;
    description?: string;
    year: number;

    // Question & Marking Configuration
    total_questions: number;  // CAT 2024: 66
    total_marks: number;      // CAT 2024: 198

    // Timing
    duration_minutes: number;  // CAT 2024: 120 total (but 40 per section)

    // Section configuration as JSONB
    sections: SectionConfig[];

    // Marking scheme defaults
    default_positive_marks: number;  // Default: 3.0
    default_negative_marks: number;  // Default: 1.0

    // Publishing & Scheduling
    published: boolean;
    available_from?: string;
    available_until?: string;

    // Metadata
    difficulty_level?: PaperDifficulty;
    is_free: boolean;
    attempt_limit?: number;

    created_at: string;
    updated_at: string;
}

// =============================================================================
// RESPONSE/ANSWER TYPES
// =============================================================================

/** Question status in the palette - matches DB constraint */
export type QuestionStatus =
    | 'not_visited'      // Gray - Never opened
    | 'visited'          // Orange/Red - Opened but no answer
    | 'answered'         // Green - Has answer saved
    | 'marked'           // Purple - Marked for review, no answer
    | 'answered_marked'; // Purple with checkmark - Has answer AND marked for review

/** Response entity from database */
export interface Response {
    id: string;
    attempt_id: string;
    question_id: string;

    // Answer data
    answer: string | null;  // User's answer (NULL = unanswered)
    is_correct?: boolean;   // Populated after submission
    marks_obtained?: number; // +3, -1, or 0

    // State tracking
    status: QuestionStatus;
    is_marked_for_review: boolean;

    // Time analytics
    time_spent_seconds: number;
    visit_count: number;

    created_at: string;
    updated_at: string;
}

/** Response for creating/updating (without server-generated fields) */
export interface ResponseInput {
    attempt_id: string;
    question_id: string;
    answer: string | null;
    status: QuestionStatus;
    is_marked_for_review: boolean;
    time_spent_seconds: number;
    visit_count: number;
}

// =============================================================================
// ATTEMPT TYPES
// =============================================================================

/** Attempt status values - matches DB constraint */
export type AttemptStatus = 'in_progress' | 'submitted' | 'completed' | 'abandoned';

/** Section-wise score breakdown */
export interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

/** Section scores map */
export type SectionScores = Record<SectionName, SectionScore>;

/** Time remaining per section */
export type TimeRemaining = Record<SectionName, number>;

/** Attempt entity from database */
export interface Attempt {
    id: string;
    user_id: string;
    paper_id: string;

    // Timing
    started_at: string;
    submitted_at?: string;
    completed_at?: string;
    time_taken_seconds?: number;
    submission_id?: string;

    // Status
    status: AttemptStatus;
    current_section?: SectionName;
    current_question: number;
    time_remaining?: TimeRemaining;  // {"VARC": 2400, "DILR": 2400, "QA": 2400}

    // Scores (populated after submission)
    total_score?: number;
    max_possible_score?: number;

    // Detailed Analytics
    correct_count: number;
    incorrect_count: number;
    unanswered_count: number;

    accuracy?: number;       // (correct / attempted) * 100
    attempt_rate?: number;   // (attempted / total) * 100

    // Section-wise scores
    section_scores?: SectionScores;

    // Ranking
    percentile?: number;
    rank?: number;

    created_at: string;
    updated_at: string;
}

/** Attempt creation input */
export interface AttemptInput {
    user_id: string;
    paper_id: string;
    current_section: SectionName;
    time_remaining: TimeRemaining;
}

// =============================================================================
// EXAM ENGINE STATE TYPES (for Zustand store)
// =============================================================================

/** Exam data loaded from server */
export interface ExamData {
    paper: Paper;
    questions: Question[];
    attempt: Attempt;
}

/** Response state in Zustand store (indexed by question_id) */
export interface ResponseState {
    answer: string | null;
    status: QuestionStatus;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
    visitCount: number;
}

/** Timer state for a section */
export interface SectionTimerState {
    sectionName: SectionName;
    startedAt: number;         // Unix timestamp when section started
    durationSeconds: number;   // 40 * 60 = 2400
    remainingSeconds: number;  // Calculated: duration - elapsed
    isExpired: boolean;
}

/** Complete exam engine state */
export interface ExamEngineState {
    // Hydration
    hasHydrated: boolean;

    // Exam metadata
    attemptId: string | null;
    paperId: string | null;
    sessionToken: string | null;  // P0 FIX: Session token for multi-device/tab prevention

    // Navigation
    currentSectionIndex: number;  // 0=VARC, 1=DILR, 2=QA
    currentQuestionIndex: number; // Index within current section

    // Section locking (VARC→DILR→QA strict order)
    lockedSections: SectionName[];  // Sections that have been completed

    // Responses (keyed by question_id)
    responses: Record<string, ResponseState>;

    // Timer state per section
    sectionTimers: Record<SectionName, SectionTimerState>;

    // Question tracking
    visitedQuestions: Set<string>;
    markedQuestions: Set<string>;

    // Submission state
    isSubmitting: boolean;
    isAutoSubmitting: boolean;
}

/** Exam engine actions */
export interface ExamEngineActions {
    // Initialization
    initializeExam: (data: ExamData) => void;
    setHasHydrated: (hydrated: boolean) => void;

    // Navigation
    goToQuestion: (questionId: string, sectionIndex: number, questionIndex: number) => void;
    goToNextQuestion: () => void;
    goToPreviousQuestion: () => void;

    // Answer management
    setAnswer: (questionId: string, answer: string | null) => void;
    clearAnswer: (questionId: string) => void;
    toggleMarkForReview: (questionId: string) => void;

    // Status updates
    markQuestionVisited: (questionId: string) => void;
    updateTimeSpent: (questionId: string, seconds: number) => void;

    // Section management
    completeSection: (sectionName: SectionName) => void;
    moveToNextSection: () => void;

    // Timer
    updateSectionTimer: (sectionName: SectionName, remainingSeconds: number) => void;
    expireSection: (sectionName: SectionName) => void;

    // Submission
    setSubmitting: (isSubmitting: boolean) => void;
    setAutoSubmitting: (isAutoSubmitting: boolean) => void;

    // Reset
    resetExam: () => void;
}

/** Combined store type */
export type ExamStore = ExamEngineState & ExamEngineActions;

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Get questions for a specific section */
export function getQuestionsForSection(
    questions: Question[],
    section: SectionName
): Question[] {
    return questions
        .filter(q => q.section === section)
        .sort((a, b) => a.question_number - b.question_number);
}

/** Calculate question status based on response state */
export function calculateQuestionStatus(
    hasAnswer: boolean,
    isMarkedForReview: boolean,
    isVisited: boolean
): QuestionStatus {
    if (hasAnswer && isMarkedForReview) return 'answered_marked';
    if (isMarkedForReview) return 'marked';
    if (hasAnswer) return 'answered';
    if (isVisited) return 'visited';
    return 'not_visited';
}

/** Get section name by index */
export function getSectionByIndex(index: number): SectionName {
    const sections: SectionName[] = ['VARC', 'DILR', 'QA'];
    return sections[index] ?? 'VARC';
}

/** CAT 2024 constants */
export const CAT_CONSTANTS = {
    TOTAL_QUESTIONS: 66,
    TOTAL_MARKS: 198,
    TOTAL_DURATION_MINUTES: 120,
    SECTION_DURATION_MINUTES: 40,
    SECTION_DURATION_SECONDS: 40 * 60, // 2400
    POSITIVE_MARKS: 3,
    NEGATIVE_MARKS_MCQ: 1,
    NEGATIVE_MARKS_TITA: 0,
    SECTIONS: ['VARC', 'DILR', 'QA'] as const,
} as const;

// =============================================================================
// DYNAMIC TIMING HELPERS
// =============================================================================

/** Build a section duration map (seconds) from paper sections with CAT defaults as fallback. */
export function getSectionDurationSecondsMap(
    sections?: SectionConfig[] | null
): Record<SectionName, number> {
    const defaults: Record<SectionName, number> = {
        VARC: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
        DILR: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
        QA: CAT_CONSTANTS.SECTION_DURATION_SECONDS,
    };

    if (!sections || sections.length === 0) {
        return defaults;
    }

    const map = { ...defaults };
    for (const section of sections) {
        const seconds = Math.max(0, section.time) * 60;
        map[section.name] = seconds || defaults[section.name];
    }

    return map;
}

/** Calculate total exam duration in seconds from paper sections. */
export function getPaperTotalDurationSeconds(sections?: SectionConfig[] | null): number {
    if (!sections || sections.length === 0) {
        return CAT_CONSTANTS.TOTAL_DURATION_MINUTES * 60;
    }

    const totalMinutes = sections.reduce((sum, s) => sum + (s.time || 0), 0);
    return Math.max(1, totalMinutes) * 60;
}

// =============================================================================
// RBAC TYPES (Milestone 6+)
// =============================================================================

/** Application roles for RBAC */
export type AppRole = 'user' | 'admin' | 'editor';

/** User role entity from database */
export interface UserRole {
    id: string;
    user_id: string;
    role: AppRole;
    granted_by?: string;
    granted_at: string;
    created_at: string;
    updated_at: string;
}

/** JWT claims structure (injected by Auth Hook) */
export interface JWTClaims {
    user_role?: AppRole;
    app_metadata?: {
        user_role?: AppRole;
    };
    sub: string;
    email?: string;
    exp: number;
    iat: number;
}

/** Admin audit log entry */
export interface AdminAuditLog {
    id: string;
    admin_id: string;
    action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
    entity_type: 'paper' | 'question' | 'context' | 'user_role';
    entity_id: string;
    changes?: Record<string, { before: unknown; after: unknown }>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}
````

## File: tailwind.config.js
````javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/features/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            // TCS iON CAT Exam Color Palette
            colors: {
                // Header & Footer
                'exam-header': {
                    from: '#2c3e50',
                    to: '#34495e',
                    border: '#1a252f',
                },
                // Section Colors
                'section': {
                    varc: '#3498db',
                    dilr: '#2ecc71',
                    qa: '#e74c3c',
                    inactive: '#ecf0f1',
                },
                // Question Status Colors
                'status': {
                    answered: '#4caf50',
                    'answered-dark': '#388e3c',
                    marked: '#9c27b0',
                    'marked-dark': '#7b1fa2',
                    visited: '#e53935',
                    'visited-dark': '#c62828',
                    current: '#3498db',
                    'current-dark': '#2980b9',
                    'not-visited': '#ffffff',
                    border: '#bdc3c7',
                },
                // Timer & Accent
                'timer': '#f39c12',
                // Text Colors
                'exam-text': {
                    primary: '#212529',
                    secondary: '#495057',
                    muted: '#7f8c8d',
                    body: '#333333',
                },
                // Background Colors
                'exam-bg': {
                    page: '#f5f5f5',
                    pane: '#f8f9fa',
                    white: '#ffffff',
                    border: '#dee2e6',
                    'border-light': '#e9ecef',
                },
            },
            // Custom font family for exam
            fontFamily: {
                'exam': ["'Segoe UI'", 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            },
            // Fixed heights matching TCS iON
            height: {
                'header': '60px',
                'section-bar': '48px',
                'metadata-bar': '40px',
                'footer': '50px',
                'btn': '42px',
                'q-btn': '48px',
            },
            // Custom spacing
            spacing: {
                '4.5': '18px',
                '7.5': '30px',
            },
            // Line heights
            lineHeight: {
                'exam': '1.6',
            },
        },
    },
    plugins: [],
};
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
````

## File: .github/workflows/ci.yml
````yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Enable corepack
        run: corepack enable

      - name: Set up pnpm
        run: corepack prepare pnpm@latest --activate

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm exec tsc --noEmit

      - name: Build
        run: pnpm build

      - name: Blueprint guard
        run: node scripts/blueprint-guard.mjs

      - name: Check bundle size
        run: node scripts/check-bundle.mjs

      - name: Ensure no .env files are committed
        run: |
          if git ls-files | grep -E '(^|/).*\.env($|\.)' ; then
            echo "Error: .env files should not be committed. Use .env.example and environment secrets instead." >&2
            exit 1
          fi
````

## File: .nvmrc
````
20
````

## File: README.md
````markdown
# CAT Mock Website

A Next.js 15 application for CAT exam mock tests with Supabase authentication.

## Quick Start

```bash
pnpm install
pnpm dev
```

Visit `/auth/test-login` to test authentication.
````

## File: scripts/check-bundle.mjs
````javascript
#!/usr/bin/env node

/**
 * Bundle Budget Checker
 * Analyzes bundle size and enforces size limits
 */

import { execSync } from 'child_process';
const BUDGET_MB = 5; // 5 MB budget (total .next JS files; First Load JS per route is ~100-150 KB)


function getBundleSize() {
  try {
    // Run build if not already built
    console.log('Building application...');
    execSync('pnpm build', { stdio: 'inherit' });

    // Analyze bundle size (simplified - in real implementation you'd use source-map-explorer)
    const stats = execSync('find .next -name "*.js" -exec du -bc {} + | tail -1', { encoding: 'utf8' });
    const sizeBytes = parseInt(stats.split('\t')[0]);
    const sizeMB = sizeBytes / (1024 * 1024);

    return sizeMB;
  } catch (error) {
    console.error('Error analyzing bundle:', error.message);
    return null;
  }
}

function checkBundleBudget() {
  const bundleSize = getBundleSize();

  if (bundleSize === null) {
    console.error('❌ Bundle analysis failed');
    process.exit(1);
  }

  console.log(`📦 Bundle size: ${bundleSize.toFixed(2)} MB`);
  console.log(`🎯 Budget: ${BUDGET_MB} MB`);

  if (bundleSize > BUDGET_MB) {
    console.error(`❌ Bundle budget exceeded by ${(bundleSize - BUDGET_MB).toFixed(2)} MB`);
    process.exit(1);
  } else {
    console.log(`✅ Bundle budget passed (${(BUDGET_MB - bundleSize).toFixed(2)} MB remaining)`);
  }
}

// Run the check
checkBundleBudget();
````

## File: src/app/api/save/route.ts
````typescript
/**
 * @fileoverview Save Response API Route
 * @description Saves user's answer to a question during exam
 * @blueprint Security Audit - P0 Fix - Rate Limiting, Session Locking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';
import { examLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { attemptId, questionId, answer, sessionToken, force_resume } = await req.json();
        if (!attemptId || !questionId) {
            return NextResponse.json({ error: 'attemptId and questionId required' }, { status: 400 });
        }

        const res = NextResponse.next();
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
        const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
        const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    res.cookies.set({ name, value: '', ...options });
                },
            },
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // P0 FIX: Rate limiting per user
        const rateLimitKey = userRateLimitKey('save', session.user.id);
        const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.SAVE_RESPONSE);

        if (!rateLimitResult.allowed) {
            const headers = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SAVE_RESPONSE.limit);
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded. Please slow down.',
                    retryAfterSeconds: Math.ceil(rateLimitResult.retryAfterMs / 1000),
                },
                { status: 429, headers }
            );
        }

        // Ensure the attempt belongs to the user
        const { data: attempt } = await supabase
            .from('attempts')
            .select('id, user_id, status, session_token, started_at, last_activity_at, paper_id')
            .eq('id', attemptId)
            .maybeSingle();

        if (!attempt || attempt.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // P0 FIX: Don't allow saves on completed/submitted attempts
        if (attempt.status !== 'in_progress') {
            return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
        }

        // P0 FIX: Session token validation (multi-device/tab prevention)
        // If session token is provided and attempt has one, validate they match
        if (attempt.session_token && sessionToken && attempt.session_token !== sessionToken) {
            // Allow force_resume to recover from browser crash/tab close
            if (force_resume === true) {
                const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;
                const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
                const userAgent = req.headers.get('user-agent') ?? 'unknown';

                if (isStale) {
                    examLogger.securityEvent('Force resume rejected (stale)', {
                        attemptId,
                        oldToken: attempt.session_token,
                        lastActivityAt: attempt.last_activity_at,
                        ip,
                        userAgent,
                    });
                    return NextResponse.json({
                        error: 'Force resume denied. Session is too old.',
                        code: 'FORCE_RESUME_STALE',
                    }, { status: 409 });
                }

                examLogger.securityEvent('Force resume: updating session token', {
                    attemptId,
                    oldToken: attempt.session_token,
                    newToken: sessionToken,
                    ip,
                    userAgent,
                });
                await supabase
                    .from('attempts')
                    .update({ session_token: sessionToken })
                    .eq('id', attemptId);
            } else {
                examLogger.securityEvent('Save session token mismatch', { attemptId, expected: attempt.session_token });
                return NextResponse.json({
                    error: 'Session conflict detected. This exam may be open in another tab or device.',
                    code: 'SESSION_CONFLICT',
                    canForceResume: true
                }, { status: 409 });
            }
        }

        // P0 FIX: Server-side section timer validation
        // Check if too much time has elapsed since exam started (dynamic per paper)
        if (attempt.started_at) {
            const { data: paperTiming } = await supabase
                .from('papers')
                .select('sections')
                .eq('id', attempt.paper_id)
                .maybeSingle();

            const totalMinutes = (paperTiming?.sections || [])
                .reduce((sum: number, s: { time?: number }) => sum + (s.time || 0), 0);
            const maxDurationMs = Math.max(1, totalMinutes || 120) * 60 * 1000;
            const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes grace

            const startedAt = new Date(attempt.started_at).getTime();
            const elapsed = Date.now() - startedAt;

            if (elapsed > maxDurationMs + GRACE_PERIOD_MS) {
                return NextResponse.json({
                    error: 'Exam time has expired. Saves are no longer accepted.',
                    code: 'TIME_EXPIRED'
                }, { status: 400 });
            }
        }

        // Update last_activity_at for session tracking
        await supabase
            .from('attempts')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('id', attemptId);

        // Upsert response
        const { data, error } = await supabase
            .from('responses')
            .upsert({ attempt_id: attemptId, question_id: questionId, answer }, { onConflict: 'attempt_id,question_id' })
            .select('attempt_id, question_id, answer, updated_at')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add rate limit headers to successful response
        const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SAVE_RESPONSE.limit);
        return NextResponse.json({ success: true, data }, { headers: successHeaders });
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}
````

## File: src/app/auth/callback/route.ts
````typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

    const redirectTo = req.nextUrl.searchParams.get('redirect_to') || '/dashboard';
    const finalUrl = new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin);
    const response = NextResponse.redirect(finalUrl);

    const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            get(name: string) {
                return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
                response.cookies.set({ name, value: '', ...options });
            },
        },
    });

    // Exchange the auth code for a session and set cookies
    const code = req.nextUrl.searchParams.get('code');
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            logger.error('Auth callback error', error.message, { redirectTo });
            const errorUrl = new URL('/auth/sign-in', req.nextUrl.origin);
            errorUrl.searchParams.set('error', 'auth_failed');
            return NextResponse.redirect(errorUrl);
        }
    }

    return response;
}
````

## File: src/app/auth/sign-in/page.tsx
````typescript
'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { sb } from '../../../lib/supabase/client';

export default function SignInPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                        <div className="h-4 w-64 bg-gray-100 rounded mb-8" />
                        <div className="h-11 w-full bg-gray-200 rounded-lg" />
                    </div>
                </main>
            }
        >
            <SignInContent />
        </Suspense>
    );
}

function SignInContent() {
    const [loading, setLoading] = useState(false);
    const params = useSearchParams();
    const redirectTo = useMemo(() => params.get('redirect_to') || '/dashboard', [params]);

    const onSignIn = useCallback(async () => {
        setLoading(true);
        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
            const callbackUrl = `${origin}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}`;
            await sb().auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: callbackUrl },
            });
        } finally {
            setLoading(false);
        }
    }, [redirectTo]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <span className="text-2xl font-bold text-white">CAT</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome to CAT Mocks</h1>
                    <p className="text-gray-600 mt-1">Practice makes perfect</p>
                </div>

                {/* Sign In Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Sign in to continue</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Access your dashboard, take mocks, and track progress
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={onSignIn}
                        disabled={loading}
                        className="w-full h-12 inline-flex items-center justify-center gap-3 rounded-lg
                          border border-gray-300 bg-white text-gray-700 font-medium
                          hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        <span>{loading ? 'Redirecting...' : 'Continue with Google'}</span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-400">Secure authentication</span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Free access to CAT mock tests</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Track your progress and percentile</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Detailed solutions and analytics</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </main>
    );
}
````

## File: src/app/globals.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;
````

## File: src/features/exam-engine/ui/ExamLayout.tsx
````typescript
/**
 * @fileoverview TCS iON CAT Exam Layout Component
 * @description Pixel-perfect recreation of the CAT exam interface
 * @blueprint TCS iON CAT 2025 Interface Specification
 */

'use client';

import { useMemo, useCallback } from 'react';
import {
    useExamStore,
    useExamTimer,
    selectCurrentSection,
} from '@/features/exam-engine';
import { MCQRenderer } from './MCQRenderer';
import { TITARenderer } from './TITARenderer';
import { MathText } from './MathText';
import type { Paper, Question, SectionName, QuestionStatus } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface ExamLayoutProps {
    paper: Paper;
    questions: Question[];
    onSaveResponse?: (questionId: string, answer: string | null) => Promise<void>;
    onSubmitExam?: () => Promise<void>;
    onSectionExpire?: (sectionName: SectionName) => void;
    onPauseExam?: () => Promise<void>;
}

// =============================================================================
// TCS iON HEADER (60px height, gradient background)
// =============================================================================

interface ExamHeaderProps {
    paper: Paper;
    candidateName?: string;
}

function ExamHeader({ paper, candidateName = 'Candidate' }: ExamHeaderProps) {
    const { timerData } = useExamTimer();

    return (
        <header className="sticky top-0 z-50 h-header flex items-center justify-between px-5 bg-gradient-to-r from-exam-header-from to-exam-header-to border-b-2 border-exam-header-border">
            {/* Left: Exam Title */}
            <h1 className="text-lg font-semibold text-white">
                {paper.title}
            </h1>

            {/* Right: Candidate + Timer */}
            <div className="flex items-center gap-7.5">
                {/* Candidate Name */}
                <div className="px-4 py-2 rounded text-white text-base bg-white/10">
                    {candidateName}
                </div>

                {/* Timer */}
                <div className="text-base font-bold text-timer font-mono">
                    Time Left: {timerData.displayTime}
                </div>
            </div>
        </header>
    );
}

// =============================================================================
// SECTION INDICATOR BAR (48px height)
// =============================================================================

function SectionIndicatorBar() {
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const sections = ['VARC', 'DILR', 'QA'] as const;

    // Dynamic Tailwind classes for section colors
    const getSectionClasses = (section: typeof sections[number], isActive: boolean) => {
        const baseClasses = 'flex-1 flex items-center justify-center text-base font-semibold cursor-pointer transition-colors duration-300';
        if (!isActive) {
            return `${baseClasses} bg-section-inactive text-exam-text-muted hover:bg-gray-200`;
        }
        switch (section) {
            case 'VARC': return `${baseClasses} bg-section-varc text-white`;
            case 'DILR': return `${baseClasses} bg-section-dilr text-white`;
            case 'QA': return `${baseClasses} bg-section-qa text-white`;
            default: return baseClasses;
        }
    };

    return (
        <div className="sticky top-header z-40 h-section-bar flex bg-white border-b border-gray-300">
            {sections.map((section, index) => {
                const isActive = index === currentSectionIndex;

                return (
                    <div
                        key={section}
                        className={getSectionClasses(section, isActive)}
                    >
                        {section === 'DILR' ? 'LRDI' : section === 'QA' ? 'Quant' : section}
                    </div>
                );
            })}
        </div>
    );
}

// =============================================================================
// QUESTION METADATA BAR (40px height)
// =============================================================================

interface QuestionMetadataBarProps {
    question: Question;
    questionNumber: number;
}

function QuestionMetadataBar({ question, questionNumber }: QuestionMetadataBarProps) {
    const marks = question.negative_marks > 0
        ? `+${question.positive_marks} -${question.negative_marks}`
        : `+${question.positive_marks} -0`;

    return (
        <div className="h-metadata-bar flex items-center justify-between px-5 bg-exam-bg-pane border-y border-exam-bg-border-light">
            <span className="text-sm text-exam-text-secondary">
                Type: {question.question_type} | Marks: {marks}
            </span>
            <span className="text-[15px] font-semibold text-exam-text-primary">
                Question No. {questionNumber}
            </span>
        </div>
    );
}

// =============================================================================
// QUESTION PANE (Left Column - 65%)
// =============================================================================

interface QuestionPaneProps {
    question: Question;
}

function QuestionPane({ question }: QuestionPaneProps) {
    return (
        <div className="w-2/3 overflow-y-auto bg-exam-bg-white px-10 py-8 border-r border-exam-bg-border">
            {/* Context/Passage if exists */}
            {question.context && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                    {question.context.title && (
                        <h3 className="text-[15px] font-semibold text-exam-header-from mb-3">
                            {question.context.title}
                        </h3>
                    )}
                    {question.context.image_url && (
                        <div className="mb-4">
                            <img
                                src={question.context.image_url}
                                alt="Context diagram"
                                className="max-w-full h-auto rounded border border-gray-200"
                            />
                        </div>
                    )}
                    <div className="text-[15px] leading-exam text-exam-text-body whitespace-pre-wrap mb-5">
                        <MathText text={question.context.content} />
                    </div>
                </div>
            )}

            {/* Question Image */}
            {question.question_image_url && (
                <div className="mb-5">
                    <img
                        src={question.question_image_url}
                        alt="Question diagram"
                        className="max-w-full h-auto rounded border border-gray-200"
                    />
                </div>
            )}

            {/* Question Text */}
            <div className="text-[15px] leading-exam text-exam-text-body mb-5">
                <MathText text={question.question_text} />
            </div>

            {/* Answer Options */}
            {question.question_type === 'MCQ' ? (
                <MCQRenderer question={question} />
            ) : (
                <TITARenderer question={question} />
            )}
        </div>
    );
}

// =============================================================================
// NAVIGATION PANE (Right Column - 35%)
// =============================================================================

interface NavigationPaneProps {
    questions: Question[];
    sectionQuestions: Question[];
    currentQuestionIndex: number;
    onSaveResponse?: (questionId: string, answer: string | null) => Promise<void>;
}

function NavigationPane({
    questions,
    sectionQuestions,
    currentQuestionIndex,
    onSaveResponse,
}: NavigationPaneProps) {
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const responses = useExamStore((s) => s.responses);
    const goToQuestion = useExamStore((s) => s.goToQuestion);
    const toggleMarkForReview = useExamStore((s) => s.toggleMarkForReview);
    const clearAnswer = useExamStore((s) => s.clearAnswer);
    const setAnswer = useExamStore((s) => s.setAnswer);

    const currentQuestion = sectionQuestions[currentQuestionIndex];

    // Handle question grid click
    const handleQuestionClick = useCallback((question: Question, index: number) => {
        goToQuestion(question.id, currentSectionIndex, index);
    }, [goToQuestion, currentSectionIndex]);

    // Handle Mark for Review & Next
    const handleMarkForReview = useCallback(() => {
        if (!currentQuestion) return;
        toggleMarkForReview(currentQuestion.id);
        // Move to next question
        if (currentQuestionIndex < sectionQuestions.length - 1) {
            const nextQ = sectionQuestions[currentQuestionIndex + 1];
            goToQuestion(nextQ.id, currentSectionIndex, currentQuestionIndex + 1);
        }
    }, [currentQuestion, currentQuestionIndex, sectionQuestions, toggleMarkForReview, goToQuestion, currentSectionIndex]);

    // Handle Clear Response
    const handleClearResponse = useCallback(() => {
        if (!currentQuestion) return;
        clearAnswer(currentQuestion.id);
    }, [currentQuestion, clearAnswer]);

    // Handle Save & Next
    const handleSaveNext = useCallback(async () => {
        if (!currentQuestion) return;

        const response = responses[currentQuestion.id];
        if (response?.answer) {
            // Mark as answered
            setAnswer(currentQuestion.id, response.answer);
            // Persist to server
            await onSaveResponse?.(currentQuestion.id, response.answer);
        }

        // Move to next question
        if (currentQuestionIndex < sectionQuestions.length - 1) {
            const nextQ = sectionQuestions[currentQuestionIndex + 1];
            goToQuestion(nextQ.id, currentSectionIndex, currentQuestionIndex + 1);
        }
    }, [currentQuestion, currentQuestionIndex, sectionQuestions, responses, setAnswer, goToQuestion, currentSectionIndex, onSaveResponse]);

    return (
        <div className="w-1/3 flex flex-col h-full bg-exam-bg-pane p-6">
            {/* Title */}
            <h3 className="text-base font-semibold text-exam-header-from text-center mb-5">
                Choose a Question
            </h3>

            {/* Question Grid - 6 columns */}
            <div className="grid grid-cols-6 gap-2 mb-auto">
                {sectionQuestions.map((question, index) => {
                    const response = responses[question.id];
                    const status: QuestionStatus = response?.status ?? 'not_visited';
                    const isCurrent = index === currentQuestionIndex;

                    // Determine button classes based on status using Tailwind
                    const getButtonClasses = () => {
                        const baseClasses = 'w-q-btn h-q-btn flex items-center justify-center text-base font-medium cursor-pointer transition-all duration-200 hover:opacity-80 rounded';
                        if (isCurrent) {
                            return `${baseClasses} bg-status-current text-white border-2 border-status-current-dark`;
                        }
                        if (status === 'answered' || status === 'answered_marked') {
                            return `${baseClasses} bg-status-answered text-white border border-status-answered-dark`;
                        }
                        if (status === 'marked') {
                            return `${baseClasses} bg-status-marked text-white border border-status-marked-dark`;
                        }
                        if (status === 'visited') {
                            return `${baseClasses} bg-status-visited text-white border border-status-visited-dark`;
                        }
                        // Not visited - default white
                        return `${baseClasses} bg-status-not-visited text-exam-header-from border border-status-border`;
                    };

                    return (
                        <button
                            key={question.id}
                            type="button"
                            onClick={() => handleQuestionClick(question, index)}
                            className={getButtonClasses()}
                            title={`Question ${index + 1}`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-status-answered" />
                        <span className="text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-status-visited" />
                        <span className="text-gray-600">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-white border border-status-border" />
                        <span className="text-gray-600">Not Visited</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-status-marked" />
                        <span className="text-gray-600">Marked</span>
                    </div>
                </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-between gap-2 mt-8 pt-4 border-t border-gray-300">
                <button
                    type="button"
                    onClick={handleMarkForReview}
                    className="flex-1 h-btn text-sm font-semibold text-white rounded cursor-pointer transition-colors duration-200 hover:opacity-90 bg-section-varc border-none"
                >
                    Mark for Review & Next
                </button>
                <button
                    type="button"
                    onClick={handleClearResponse}
                    className="flex-1 h-btn text-sm font-semibold text-white rounded cursor-pointer transition-colors duration-200 hover:opacity-90 bg-gray-400 border-none"
                >
                    Clear Response
                </button>
                <button
                    type="button"
                    onClick={handleSaveNext}
                    className="flex-1 h-btn text-sm font-semibold text-white rounded cursor-pointer transition-colors duration-200 hover:opacity-90 bg-emerald-600 border-none"
                >
                    Save & Next
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// FOOTER (50px height)
// =============================================================================

function ExamFooter() {
    return (
        <footer className="h-footer flex items-center px-8 bg-exam-header-from border-t border-exam-header-border">
            <span className="text-sm text-section-inactive">
                © CAT 2025 - Mock Exam Platform
            </span>
        </footer>
    );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

export function ExamLayout({
    paper,
    questions,
    onSaveResponse,
    onSubmitExam,
    onSectionExpire,
    onPauseExam,
}: ExamLayoutProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const hasHydrated = useExamStore((s) => s.hasHydrated);
    const isSubmitting = useExamStore((s) => s.isSubmitting);

    // Initialize timer with callbacks
    const { isAutoSubmitting } = useExamTimer({
        onSectionExpire: onSectionExpire,
        onExamComplete: onSubmitExam,
    });

    // Get questions for current section
    const sectionQuestions = useMemo(() => {
        return getQuestionsForSection(questions, currentSection);
    }, [questions, currentSection]);

    // Current question
    const currentQuestion = sectionQuestions[currentQuestionIndex];

    // Show loading state while hydrating
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-section-varc mx-auto mb-4" />
                    <p className="text-exam-text-muted">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Show submitting state
    if (isSubmitting || isAutoSubmitting) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
                    <p className="text-exam-text-muted">
                        {isAutoSubmitting ? 'Auto-submitting section...' : 'Submitting exam...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-exam-bg-page flex items-center justify-center">
                <div className="text-center">
                    <p className="text-exam-text-muted">No questions found for this section.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col w-full font-exam text-sm leading-normal bg-exam-bg-page">
            {/* Full width container - no margins */}
            <div className="flex flex-col min-h-screen w-full overflow-hidden">
                {/* Header - 60px (sticky) */}
                <ExamHeader paper={paper} />

                {/* Section Indicator Bar - 48px (sticky) */}
                <SectionIndicatorBar />

                {/* Question Metadata Bar - 40px */}
                <QuestionMetadataBar
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                />

                {/* Main Content Area - Two Column Layout */}
                <main className="flex flex-1 h-[calc(100vh-60px-48px-40px-50px)]">
                    {/* Left Column: Question Pane (65%) */}
                    <QuestionPane question={currentQuestion} />

                    {/* Right Column: Navigation Pane (35%) */}
                    <NavigationPane
                        questions={questions}
                        sectionQuestions={sectionQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        onSaveResponse={onSaveResponse}
                    />
                </main>

                {/* Footer - 50px */}
                <ExamFooter />
            </div>
        </div>
    );
}

export default ExamLayout;
````

## File: src/features/exam-engine/ui/index.ts
````typescript
/**
 * @fileoverview Exam Engine UI Components - Barrel Export
 * @description Public API for exam engine UI components
 * @blueprint Milestone 4 - Feature-Sliced Design (FSD)
 */

// Layout
export { ExamLayout } from './ExamLayout';

// Timer
export { ExamTimer, SectionTimerSummary } from './ExamTimer';

// Question Palette
export { QuestionPalette } from './QuestionPalette';

// Question Renderers
export { MCQRenderer } from './MCQRenderer';
export { TITARenderer } from './TITARenderer';
export { QuestionRenderer } from './QuestionRenderer';  // Question Container Architecture

// Navigation
export { NavigationButtons, ExamSubmitButton } from './NavigationButtons';

// Result Components (Milestone 5)
export { ResultHeader } from './ResultHeader';
export { SectionalPerformance } from './SectionalPerformance';
export { QuestionAnalysis } from './QuestionAnalysis';
````

## File: src/features/exam-engine/ui/NavigationButtons.tsx
````typescript
/**
 * @fileoverview Navigation Buttons Component
 * @description Save & Next, Mark for Review, Clear Response, Previous buttons
 * @blueprint Milestone 4 SOP-SSOT - Phase 3.5
 */

'use client';

import { useCallback } from 'react';
import { useExamStore, selectResponse, selectCurrentSection } from '@/features/exam-engine';
import type { Question } from '@/types/exam';
import { getQuestionsForSection } from '@/types/exam';

// =============================================================================
// TYPES
// =============================================================================

interface NavigationButtonsProps {
    /** Current question */
    question: Question;
    /** All questions in the paper */
    questions: Question[];
    /** Callback when moving to next question */
    onNextQuestion?: () => void;
    /** Callback when moving to previous question */
    onPrevQuestion?: () => void;
    /** Callback for saving answer */
    onSave?: (questionId: string, answer: string | null) => Promise<void>;
    /** Optional CSS class name */
    className?: string;
}

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    variant: 'primary' | 'secondary' | 'warning' | 'danger';
    children: React.ReactNode;
    className?: string;
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

function NavButton({ onClick, disabled, variant, children, className = '' }: ButtonProps) {
    // TCS iON-inspired palette
    const variantStyles = {
        // Primary action: Save & Next (yellow with dark text)
        primary: 'bg-[#f7c600] text-[#1a1a1a] hover:bg-[#f0b800] focus:ring-[#f7c600] border border-[#d9a400] shadow-sm',

        // Secondary: Previous (cool gray)
        secondary: 'bg-[#eceff1] text-[#37474f] hover:bg-[#e0e6e9] focus:ring-[#cfd8dc] border border-[#cfd8dc] shadow-sm',

        // Warning: Mark for Review (indigo/purple)
        warning: 'bg-[#5c6bc0] text-white hover:bg-[#4652a3] focus:ring-[#5c6bc0] border border-[#4652a3] shadow-sm',

        // Danger: Clear Response (red)
        danger: 'bg-[#e53935] text-white hover:bg-[#d32f2f] focus:ring-[#e53935] border border-[#c62828] shadow-sm',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                px-4 py-2.5 rounded-md font-medium transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
        >
            {children}
        </button>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function NavigationButtons({
    question,
    questions,
    onNextQuestion,
    onPrevQuestion,
    onSave,
    className = '',
}: NavigationButtonsProps) {
    const currentSection = useExamStore(selectCurrentSection);
    const currentQuestionIndex = useExamStore((s) => s.currentQuestionIndex);
    const currentSectionIndex = useExamStore((s) => s.currentSectionIndex);
    const response = useExamStore(selectResponse(question.id));

    const goToQuestion = useExamStore((s) => s.goToQuestion);
    const clearAnswer = useExamStore((s) => s.clearAnswer);
    const toggleMarkForReview = useExamStore((s) => s.toggleMarkForReview);
    // NOTE: moveToNextSection removed - sections advance only via timer expiry (SOP requirement)

    // Get questions for current section
    const sectionQuestions = getQuestionsForSection(questions, currentSection);
    const totalQuestionsInSection = sectionQuestions.length;

    // Check if at first/last question in section
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestionsInSection - 1;
    const isLastSection = currentSectionIndex === 2; // QA is index 2

    // Current response state
    const isMarked = response?.isMarkedForReview ?? false;
    const hasAnswer = response?.answer !== null && response?.answer !== '';

    // Handle Save & Next
    const handleSaveAndNext = useCallback(async () => {
        // Save current answer if provided callback
        if (onSave && response?.answer) {
            await onSave(question.id, response.answer);
        }

        if (isLastQuestion) {
            // Last question in section - don't auto-advance to next section
            // User must explicitly submit section or wait for timer
            return;
        }

        // Move to next question
        const nextIndex = currentQuestionIndex + 1;
        const nextQuestion = sectionQuestions[nextIndex];
        if (nextQuestion) {
            goToQuestion(nextQuestion.id, currentSectionIndex, nextIndex);
            onNextQuestion?.();
        }
    }, [
        currentQuestionIndex,
        currentSectionIndex,
        goToQuestion,
        isLastQuestion,
        onNextQuestion,
        onSave,
        question.id,
        response?.answer,
        sectionQuestions,
    ]);

    // Handle Mark for Review & Next
    const handleMarkAndNext = useCallback(async () => {
        // Toggle mark
        toggleMarkForReview(question.id);

        // Save if callback provided
        if (onSave && response?.answer) {
            await onSave(question.id, response.answer);
        }

        if (isLastQuestion) {
            return;
        }

        // Move to next question
        const nextIndex = currentQuestionIndex + 1;
        const nextQuestion = sectionQuestions[nextIndex];
        if (nextQuestion) {
            goToQuestion(nextQuestion.id, currentSectionIndex, nextIndex);
            onNextQuestion?.();
        }
    }, [
        currentQuestionIndex,
        currentSectionIndex,
        goToQuestion,
        isLastQuestion,
        onNextQuestion,
        onSave,
        question.id,
        response?.answer,
        sectionQuestions,
        toggleMarkForReview,
    ]);

    // Handle Clear Response
    const handleClear = useCallback(() => {
        clearAnswer(question.id);
    }, [clearAnswer, question.id]);

    // Handle Previous
    const handlePrevious = useCallback(() => {
        if (isFirstQuestion) return;

        const prevIndex = currentQuestionIndex - 1;
        const prevQuestion = sectionQuestions[prevIndex];
        if (prevQuestion) {
            goToQuestion(prevQuestion.id, currentSectionIndex, prevIndex);
            onPrevQuestion?.();
        }
    }, [
        currentQuestionIndex,
        currentSectionIndex,
        goToQuestion,
        isFirstQuestion,
        onPrevQuestion,
        sectionQuestions,
    ]);

    // NOTE: Section submit removed - sections advance only via timer expiry (SOP requirement)

    return (
        <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
            {/* Left Side - Clear & Previous */}
            <div className="flex items-center gap-3">
                <NavButton
                    variant="danger"
                    onClick={handleClear}
                    disabled={!hasAnswer}
                >
                    Clear Response
                </NavButton>

                <NavButton
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={isFirstQuestion}
                >
                    ← Previous
                </NavButton>
            </div>

            {/* Right Side - Mark, Save, Submit Section */}
            <div className="flex items-center gap-3">
                <NavButton
                    variant="warning"
                    onClick={handleMarkAndNext}
                >
                    {isMarked ? '★ Marked' : 'Mark for Review'} & Next
                </NavButton>

                {isLastQuestion ? (
                    // Last question in section - no manual submit allowed
                    // Section advances only when timer expires (per SOP)
                    <NavButton
                        variant="secondary"
                        onClick={() => { }}
                        disabled
                    >
                        {isLastSection ? 'Last Question' : 'Wait for Timer'}
                    </NavButton>
                ) : (
                    <NavButton
                        variant="primary"
                        onClick={handleSaveAndNext}
                    >
                        Save & Next →
                    </NavButton>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// EXAM SUBMIT BUTTON (Only shown in last section - QA)
// Sections advance via timer expiry only (per SOP for full-length mocks)
// =============================================================================

interface ExamSubmitProps {
    onSubmitExam: () => void;
    isLastSection: boolean;
    className?: string;
}

export function ExamSubmitButton({
    onSubmitExam,
    isLastSection,
    className = '',
}: ExamSubmitProps) {
    // Only render submit button in last section (QA)
    if (!isLastSection) {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                <p className="text-sm text-gray-500 italic">
                    Section will auto-submit when timer expires
                </p>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <button
                type="button"
                onClick={onSubmitExam}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
            transition-colors"
            >
                Submit Exam
            </button>
        </div>
    );
}

export default NavigationButtons;
````

## File: src/lib/supabase/client.ts
````typescript
// Supabase browser client helper using @supabase/ssr
import { createBrowserClient } from '@supabase/ssr';

export function sb() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
    if (!url || !anon) {
        console.warn('Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    }
    return createBrowserClient(url || 'http://localhost:54321', anon || 'anon');
}
````

## File: src/lib/supabase/server.ts
````typescript
// Supabase server client helper using @supabase/ssr
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function sbServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
    // Generic server client without cookie persistence (use per-request client in routes for auth-sensitive flows)
    return createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            get() {
                return undefined;
            },
            set() {
                /* no-op */
            },
            remove() {
                /* no-op */
            },
        },
    });
}

export async function getServerSession() {
    const supabase = sbServer();
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
}

// Per-request SSR client that can read auth cookies in server components/route handlers
export async function sbSSR() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
    const cookieStore = await cookies();
    return createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            // Avoid setting cookies during render; reads are sufficient for most queries
            set() {
                /* no-op during render */
            },
            remove() {
                /* no-op during render */
            },
        },
    });
}
````

## File: src/utils/update-session.ts
````typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Keeps Supabase auth cookies fresh during SSR/middleware and returns a response to continue.
export async function updateSession(req: NextRequest) {
    const res = NextResponse.next({ request: { headers: req.headers } });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

    const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
        cookies: {
            get(name: string) {
                return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                res.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
                res.cookies.set({ name, value: '', ...options });
            },
        },
    });

    // Touch the auth session to ensure cookies are refreshed when needed
    await supabase.auth.getSession();

    return res;
}
````

## File: src/app/mocks/page.tsx
````typescript
import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

type Paper = {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    year: number;
    total_questions: number;
    total_marks: number;
    duration_minutes: number | null;
    difficulty_level: string | null;
    is_free: boolean;
    available_from?: string | null;
    available_until?: string | null;
};

export default async function MocksPage() {
    const supabase = await sbSSR();

    // Fetch published papers. Availability window is filtered in code for reliability.
    const { data, error } = await supabase
        .from('papers')
        .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, difficulty_level, is_free, available_from, available_until')
        .eq('published', true)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

    const now = Date.now();
    const papers: Paper[] = (data ?? []).filter((p: Paper) => {
        const fromOk = !p.available_from || Date.parse(p.available_from) <= now;
        const untilOk = !p.available_until || Date.parse(p.available_until) >= now;
        return fromOk && untilOk;
    });

    // Group papers by year
    const papersByYear = papers.reduce((acc, paper) => {
        const year = paper.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(paper);
        return acc;
    }, {} as Record<number, Paper[]>);

    const getDifficultyColor = (level: string | null) => {
        switch (level) {
            case 'easy': return '#4caf50';
            case 'medium': return '#ff9800';
            case 'hard': return '#f44336';
            case 'cat-level': return '#9c27b0';
            default: return '#666';
        }
    };

    return (
        <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{ marginBottom: 8 }}>CAT Mock Tests</h1>
            <p style={{ color: '#666', marginBottom: 32 }}>
                Practice with full-length CAT mock tests designed to simulate the actual exam experience.
            </p>

            {error ? (
                <p style={{ color: 'crimson' }}>Failed to load papers. Please try again later.</p>
            ) : papers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, background: '#f5f5f5', borderRadius: 12 }}>
                    <h2>No Mock Tests Available</h2>
                    <p style={{ color: '#666' }}>Check back soon for new mock tests!</p>
                </div>
            ) : (
                Object.entries(papersByYear)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([year, yearPapers]) => (
                        <div key={year} style={{ marginBottom: 32 }}>
                            <h2 style={{ borderBottom: '2px solid #1976d2', paddingBottom: 8, marginBottom: 16 }}>
                                CAT {year} Pattern
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                {yearPapers.map((p) => {
                                    const href = `/mock/${p.slug || p.id}`;
                                    return (
                                        <div key={p.id} style={{
                                            border: '1px solid #ddd',
                                            borderRadius: 12,
                                            padding: 20,
                                            background: '#fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            transition: 'box-shadow 0.2s',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                <h3 style={{ margin: 0, fontSize: 18 }}>{p.title}</h3>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {p.is_free && (
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            background: '#4caf50',
                                                            color: 'white',
                                                            borderRadius: 4,
                                                            fontSize: 11,
                                                            fontWeight: 'bold'
                                                        }}>FREE</span>
                                                    )}
                                                    {p.difficulty_level && (
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            background: getDifficultyColor(p.difficulty_level),
                                                            color: 'white',
                                                            borderRadius: 4,
                                                            fontSize: 11,
                                                            fontWeight: 'bold'
                                                        }}>{p.difficulty_level.toUpperCase()}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {p.description && (
                                                <p style={{ margin: '0 0 12px', color: '#666', fontSize: 14, lineHeight: 1.4 }}>
                                                    {p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description}
                                                </p>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                gap: 16,
                                                fontSize: 13,
                                                color: '#666',
                                                marginBottom: 16,
                                                paddingTop: 12,
                                                borderTop: '1px solid #eee'
                                            }}>
                                                <span>📝 {p.total_questions} Qs</span>
                                                <span>🎯 {p.total_marks} marks</span>
                                                <span>⏱️ {p.duration_minutes} min</span>
                                            </div>

                                            <Link href={href} style={{
                                                display: 'block',
                                                textAlign: 'center',
                                                padding: '10px 16px',
                                                background: '#1976d2',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: 6,
                                                fontWeight: 'bold',
                                                fontSize: 14
                                            }}>
                                                Start Mock
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
            )}
        </main>
    );
}
````

## File: middleware.ts
````typescript
/**
 * @fileoverview Next.js Middleware
 * @description Auth session management and security headers
 * @blueprint Security Audit - P0 Fix - Security Headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './src/utils/update-session';
import type { CookieOptions } from '@supabase/ssr';

/**
 * Apply security headers to response
 * @blueprint Security Audit - P0 Fix - Prevent clickjacking, XSS, MIME sniffing
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
    // Prevent MIME type sniffing
    res.headers.set('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking - only allow same origin framing
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Legacy XSS protection for older browsers
    res.headers.set('X-XSS-Protection', '1; mode=block');

    // Control referrer information sent with requests
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Prevent caching of sensitive pages (exam content)
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');

    return res;
}

export async function middleware(req: NextRequest) {
    const res = await updateSession(req);

    // Apply security headers to all matched routes
    applySecurityHeaders(res);

    try {
        const pathname = req.nextUrl.pathname;
        const isProtected = pathname.startsWith('/exam/') || pathname.startsWith('/result/') || pathname.startsWith('/dashboard');
        const isAdminRoute = pathname.startsWith('/admin');

        // All protected routes (including admin) require authentication
        if (isProtected || isAdminRoute) {
            // Recreate a server client to read the user for gating (cookies copied on res)
            const { createServerClient } = await import('@supabase/ssr');
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
            const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
            const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
                cookies: {
                    get(name: string) {
                        return req.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        res.cookies.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        res.cookies.set({ name, value: '', ...options });
                    },
                },
            });

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                const redirect = new URL('/auth/sign-in', req.url);
                const returnTo = pathname + (req.nextUrl.search || '');
                redirect.searchParams.set('redirect_to', returnTo);
                return NextResponse.redirect(redirect);
            }

            // Admin routes require admin role (check JWT claims)
            if (isAdminRoute) {
                // DEV MODE: Skip RBAC check if SKIP_ADMIN_CHECK is set
                const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true';

                if (!skipAdminCheck) {
                    const { data: { session } } = await supabase.auth.getSession();

                    // Check for admin role in JWT claims
                    // The custom_access_token_hook injects user_role at both root and app_metadata
                    const userRole = session?.access_token
                        ? JSON.parse(atob(session.access_token.split('.')[1]))?.user_role
                        : null;
                    const appMetadataRole = session?.access_token
                        ? JSON.parse(atob(session.access_token.split('.')[1]))?.app_metadata?.user_role
                        : null;

                    const isAdmin = userRole === 'admin' || appMetadataRole === 'admin';

                    if (!isAdmin) {
                        // Not an admin - redirect to dashboard with error message
                        const redirect = new URL('/dashboard', req.url);
                        redirect.searchParams.set('error', 'unauthorized');
                        return NextResponse.redirect(redirect);
                    }
                }
            }
        }

        return res;
    } catch (err) {
        console.error('Middleware error', err);
        return res;
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/exam/:path*', '/result/:path*', '/admin/:path*'],
};
````

## File: src/app/dashboard/page.tsx
````typescript
import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';

type Attempt = {
    id: string;
    paper_id: string;
    status: string;
    total_score: number | null;
    max_possible_score: number | null;
    accuracy: number | null;
    percentile: number | null;
    rank: number | null;
    correct_count: number | null;
    incorrect_count: number | null;
    started_at: string | null;
    completed_at: string | null;
    time_taken_seconds: number | null;
    papers: { title: string; total_marks: number } | null;
};

type UserProfile = {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    total_mocks_taken: number;
    best_percentile: number | null;
    target_percentile: number | null;
};

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
                <h1>My Dashboard</h1>
                <p>You need to sign in to access your dashboard.</p>
                <Link href="/auth/sign-in?redirect_to=/dashboard" style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: '#1976d2',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 6
                }}>Sign In</Link>
            </main>
        );
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, total_mocks_taken, best_percentile, target_percentile')
        .eq('id', user.id)
        .maybeSingle() as { data: UserProfile | null };

    // Get attempts with paper details
    const { data, error } = await supabase
        .from('attempts')
        .select(`
            id, paper_id, status, total_score, max_possible_score, accuracy, percentile, rank,
            correct_count, incorrect_count, started_at, completed_at, time_taken_seconds,
            papers (title, total_marks)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

    const attempts: Attempt[] = (data ?? []).map(a => ({
        ...a,
        papers: Array.isArray(a.papers) ? a.papers[0] : a.papers
    }));

    // Calculate stats
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const totalMocks = completedAttempts.length;
    const averageScore = totalMocks > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.total_score || 0), 0) / totalMocks
        : 0;
    const bestScore = totalMocks > 0
        ? Math.max(...completedAttempts.map(a => a.total_score || 0))
        : 0;
    const bestPercentile = totalMocks > 0
        ? Math.max(...completedAttempts.map(a => a.percentile || 0))
        : 0;

    const formatTime = (seconds: number | null) => {
        if (!seconds) return '—';
        const mins = Math.floor(seconds / 60);
        return `${mins}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4caf50';
            case 'in_progress': return '#ff9800';
            case 'abandoned': return '#9e9e9e';
            default: return '#666';
        }
    };

    return (
        <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            {/* Unauthorized Error Banner */}
            {params.error === 'unauthorized' && (
                <div style={{
                    padding: '12px 16px',
                    background: '#ffebee',
                    border: '1px solid #ef5350',
                    borderRadius: 8,
                    marginBottom: 24,
                    color: '#c62828',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <span>You don&apos;t have admin access. Contact the administrator to request access.</span>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ margin: 0 }}>My Dashboard</h1>
                    <p style={{ margin: '8px 0 0', color: '#666' }}>
                        Welcome back, {profile?.name || user.email}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/admin" style={{
                        padding: '12px 24px',
                        background: '#0b3d91',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontWeight: 'bold'
                    }}>Admin Panel</Link>
                    <Link href="/mocks" style={{
                        padding: '12px 24px',
                        background: '#1976d2',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontWeight: 'bold'
                    }}>Take New Mock</Link>
                    <a href="/auth/logout" style={{
                        padding: '12px 24px',
                        background: '#f5f5f5',
                        color: '#666',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontWeight: 'bold',
                        border: '1px solid #ddd'
                    }}>Logout</a>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 32
            }}>
                <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#1976d2' }}>Mocks Completed</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>{totalMocks}</p>
                </div>
                <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#4caf50' }}>Best Score</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#4caf50' }}>{bestScore.toFixed(0)}</p>
                </div>
                <div style={{ padding: 20, background: '#fff3e0', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#ff9800' }}>Average Score</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#ff9800' }}>{averageScore.toFixed(1)}</p>
                </div>
                <div style={{ padding: 20, background: '#f3e5f5', borderRadius: 12, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#9c27b0' }}>Best Percentile</p>
                    <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 'bold', color: '#9c27b0' }}>
                        {bestPercentile > 0 ? bestPercentile.toFixed(1) : '—'}
                    </p>
                </div>
            </div>

            {/* Target Progress */}
            {profile?.target_percentile && (
                <div style={{
                    padding: 20,
                    background: '#f5f5f5',
                    borderRadius: 12,
                    marginBottom: 32
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Progress to Target ({profile.target_percentile}%ile)</span>
                        <span>{bestPercentile > 0 ? `${((bestPercentile / profile.target_percentile) * 100).toFixed(0)}%` : '0%'}</span>
                    </div>
                    <div style={{ height: 8, background: '#ddd', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.min((bestPercentile / profile.target_percentile) * 100, 100)}%`,
                            background: '#4caf50',
                            borderRadius: 4
                        }}></div>
                    </div>
                </div>
            )}

            {/* Attempts List */}
            <h2 style={{ marginBottom: 16 }}>My Attempts</h2>
            {error ? (
                <p style={{ color: 'crimson' }}>Failed to load attempts. Please try again later.</p>
            ) : attempts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, background: '#f5f5f5', borderRadius: 12 }}>
                    <h3>No attempts yet</h3>
                    <p style={{ color: '#666' }}>Start your CAT preparation by taking a mock test!</p>
                    <Link href="/mocks" style={{
                        display: 'inline-block',
                        marginTop: 16,
                        padding: '12px 24px',
                        background: '#1976d2',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6
                    }}>Browse Mocks</Link>
                </div>
            ) : (
                <div style={{ border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Paper</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Status</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Score</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Accuracy</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Percentile</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Time</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Date</th>
                                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map((a) => (
                                <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: 12 }}>
                                        <strong>{a.papers?.title ?? `Paper ${a.paper_id.slice(0, 8)}…`}</strong>
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: getStatusColor(a.status),
                                            color: 'white',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 'bold'
                                        }}>{a.status.replace('_', ' ').toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>
                                        {a.total_score !== null ? `${a.total_score}/${a.max_possible_score || a.papers?.total_marks || 198}` : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {a.accuracy !== null ? `${a.accuracy.toFixed(1)}%` : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {a.percentile !== null ? a.percentile.toFixed(1) : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {formatTime(a.time_taken_seconds)}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center', color: '#666', fontSize: 13 }}>
                                        {a.started_at ? new Date(a.started_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        {a.status === 'in_progress' ? (
                                            <Link href={`/exam/${a.id}`} style={{
                                                color: '#ff9800',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}>Continue</Link>
                                        ) : a.status === 'completed' ? (
                                            <Link href={`/result/${a.id}`} style={{
                                                color: '#1976d2',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}>View Result</Link>
                                        ) : (
                                            <span style={{ color: '#999' }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
````

## File: src/features/exam-engine/lib/actions.ts
````typescript
/**
 * @fileoverview Exam Engine Server Actions
 * @description Server-side actions for fetching, saving, and submitting exams
 * @blueprint Milestone 4 SOP-SSOT - Phase 4.1, 4.2, 4.4
 * @blueprint M6+ Architecture - Structured Logging
 */

'use server';

import { sbSSR } from '@/lib/supabase/server';
import { logger, examLogger } from '@/lib/logger';
import {
    FetchPaperRequestSchema,
    SaveResponseRequestSchema,
    UpdateTimerRequestSchema,
    SubmitExamRequestSchema,
    type FetchPaperResponse,
    type SubmitExamResponse,
} from './validation';
import type { Paper, Question, Attempt, SectionName, TimeRemaining, QuestionContext } from '@/types/exam';
import { getSectionDurationSecondsMap, getPaperTotalDurationSeconds } from '@/types/exam';

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================================================
// FETCH PAPER WITH QUESTIONS
// =============================================================================

/**
 * Fetch a paper with its questions and create/resume an attempt
 * @param paperId - UUID of the paper to fetch
 * @returns Paper, questions, and attempt data
 */
export async function fetchPaperForExam(
    paperId: string
): Promise<ActionResult<FetchPaperResponse>> {
    try {
        // Validate input
        const parsed = FetchPaperRequestSchema.safeParse({ paperId });
        if (!parsed.success) {
            return { success: false, error: 'Invalid paper ID' };
        }

        const supabase = await sbSSR();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Fetch paper
        const { data: paper, error: paperError } = await supabase
            .from('papers')
            .select('*')
            .eq('id', paperId)
            .eq('published', true)
            .single();

        if (paperError || !paper) {
            return { success: false, error: 'Paper not found' };
        }

        // Fetch questions using the secure view (excludes correct_answer).
        // Fail fast if the view isn't deployed to avoid leaking correct answers.
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions_exam')
            .select('*')
            .eq('paper_id', paperId)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError || !questionsData) {
            logger.error('Failed to fetch questions from questions_exam', questionsError, { paperId });
            return { success: false, error: 'Failed to fetch questions' };
        }

        let questions: Question[] = questionsData as unknown as Question[];

        // Fetch question contexts for questions that have context_id
        const contextIds = [...new Set(
            questions
                .map(q => (q as { context_id?: string }).context_id)
                .filter((id): id is string => Boolean(id))
        )];

        if (contextIds.length > 0) {
            const { data: contexts, error: contextsError } = await supabase
                .from('question_contexts')
                .select('id, title, section, content, context_type, paper_id, display_order, is_active')
                .in('id', contextIds);

            if (!contextsError && contexts) {
                // Create a map for quick lookup
                const contextMap = new Map(
                    contexts.map(c => [c.id, c as QuestionContext])
                );

                // Attach contexts to questions
                questions = questions.map(q => {
                    const ctxId = (q as { context_id?: string }).context_id;
                    if (ctxId && contextMap.has(ctxId)) {
                        return { ...q, context: contextMap.get(ctxId) } as Question;
                    }
                    return q;
                });
            } else {
                logger.warn('Failed to fetch question contexts', contextsError, { contextIds });
            }
        }

        // Check for existing in-progress attempt
        const { data: existingAttempt } = await supabase
            .from('attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('paper_id', paperId)
            .eq('status', 'in_progress')
            .single();

        let attempt: Attempt;

        if (existingAttempt) {
            // Resume existing attempt
            attempt = existingAttempt as Attempt;
        } else {
            // Create new attempt
            const durations = getSectionDurationSecondsMap(paper.sections);
            const initialTimeRemaining: TimeRemaining = {
                VARC: durations.VARC,
                DILR: durations.DILR,
                QA: durations.QA,
            };

            const { data: newAttempt, error: attemptError } = await supabase
                .from('attempts')
                .insert({
                    user_id: user.id,
                    paper_id: paperId,
                    status: 'in_progress',
                    current_section: 'VARC',
                    current_question: 1,
                    time_remaining: initialTimeRemaining,
                })
                .select()
                .single();

            if (attemptError || !newAttempt) {
                return { success: false, error: 'Failed to create attempt' };
            }

            attempt = newAttempt as Attempt;

            // Create initial response records for all questions
            const responseInserts = questions.map((q) => ({
                attempt_id: attempt.id,
                question_id: q.id,
                answer: null,
                status: 'not_visited',
                is_marked_for_review: false,
                time_spent_seconds: 0,
                visit_count: 0,
            }));

            const { error: responsesError } = await supabase
                .from('responses')
                .insert(responseInserts);

            if (responsesError) {
                logger.warn('Failed to create initial responses', responsesError, { attemptId: attempt.id });
                // Non-fatal - continue without initial responses
            }
        }

        return {
            success: true,
            data: {
                paper: paper as Paper,
                questions,
                attempt,
            },
        };
    } catch (error) {
        logger.error('fetchPaperForExam error', error, { paperId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SAVE RESPONSE
// =============================================================================

/**
 * Save a user's response to a question
 * @param data - Response data to save
 */
export async function saveResponse(data: {
    attemptId: string;
    questionId: string;
    answer: string | null;
    status: string;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
    sessionToken?: string | null;
    force_resume?: boolean;
}): Promise<ActionResult<void>> {
    try {
        // Validate input
        const parsed = SaveResponseRequestSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: 'Invalid response data' };
        }

        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('user_id, status, paper_id, session_token, last_activity_at')
            .eq('id', data.attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (attempt.status !== 'in_progress') {
            return { success: false, error: 'Attempt is not in progress' };
        }

        // Session conflict check (multi-device/tab prevention)
        if (attempt.session_token && data.sessionToken && attempt.session_token !== data.sessionToken) {
            if (data.force_resume === true) {
                const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;

                if (isStale) {
                    examLogger.securityEvent('Force resume rejected (stale) (saveResponse)', {
                        attemptId: data.attemptId,
                        oldToken: attempt.session_token,
                        lastActivityAt: attempt.last_activity_at,
                    });
                    return { success: false, error: 'FORCE_RESUME_STALE' };
                }

                examLogger.securityEvent('Force resume (saveResponse)', { attemptId: data.attemptId, oldToken: attempt.session_token });
                await supabase
                    .from('attempts')
                    .update({ session_token: data.sessionToken })
                    .eq('id', data.attemptId);
            } else {
                examLogger.securityEvent('Session conflict (saveResponse)', { attemptId: data.attemptId });
                return { success: false, error: 'SESSION_CONFLICT' };
            }
        }

        // P0 FIX: Verify questionId belongs to the attempt's paper (integrity check)
        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select('id')
            .eq('id', data.questionId)
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .maybeSingle();

        if (questionError || !question) {
            examLogger.validationError('Invalid questionId for attempt', { attemptId: data.attemptId, questionId: data.questionId });
            return { success: false, error: 'Invalid question' };
        }

        // Upsert response
        const { error: upsertError } = await supabase
            .from('responses')
            .upsert(
                {
                    attempt_id: data.attemptId,
                    question_id: data.questionId,
                    answer: data.answer,
                    status: data.status,
                    is_marked_for_review: data.isMarkedForReview,
                    time_spent_seconds: data.timeSpentSeconds,
                },
                {
                    onConflict: 'attempt_id,question_id',
                }
            );

        if (upsertError) {
            logger.error('saveResponse upsert error', upsertError, { attemptId: data.attemptId, questionId: data.questionId });
            return { success: false, error: 'Failed to save response' };
        }

        return { success: true };
    } catch (error) {
        logger.error('saveResponse error', error, { attemptId: data.attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// UPDATE TIMER / PROGRESS
// =============================================================================

/**
 * Update attempt progress (timer, current section/question)
 * @param data - Timer and navigation data
 */
export async function updateAttemptProgress(data: {
    attemptId: string;
    timeRemaining: TimeRemaining;
    currentSection: SectionName;
    currentQuestion: number;
}): Promise<ActionResult<void>> {
    try {
        // Validate input
        const parsed = UpdateTimerRequestSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: 'Invalid timer data' };
        }

        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        const { error: updateError } = await supabase
            .from('attempts')
            .update({
                time_remaining: data.timeRemaining,
                current_section: data.currentSection,
                current_question: data.currentQuestion,
            })
            .eq('id', data.attemptId)
            .eq('user_id', user.id)
            .eq('status', 'in_progress');

        if (updateError) {
            logger.error('updateAttemptProgress error', updateError, { attemptId: data.attemptId });
            return { success: false, error: 'Failed to update progress' };
        }

        return { success: true };
    } catch (error) {
        logger.error('updateAttemptProgress error', error, { attemptId: data.attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// SUBMIT EXAM
// =============================================================================

/**
 * Submit the exam and calculate scores using TypeScript scoring engine
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 001
 * @blueprint Security Audit - P0 Fix - Server-side timer validation
 * @param attemptId - UUID of the attempt to submit
 */
export async function submitExam(
    attemptId: string,
    options?: { sessionToken?: string | null; force_resume?: boolean; submissionId?: string }
): Promise<ActionResult<SubmitExamResponse>> {
    try {
        // Validate input
        const parsed = SubmitExamRequestSchema.safeParse({
            attemptId,
            sessionToken: options?.sessionToken,
            force_resume: options?.force_resume,
            submissionId: options?.submissionId,
        });
        if (!parsed.success) {
            return { success: false, error: 'Invalid attempt ID' };
        }

        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Fetch attempt with paper_id, started_at, and session_token
        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('user_id, status, paper_id, started_at, session_token, last_activity_at, submission_id')
            .eq('id', attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // P0 FIX: Prevent double submission with strict status check
        if (attempt.status === 'completed' || attempt.status === 'submitted') {
            return { success: false, error: 'Attempt already submitted' };
        }

        if (attempt.status !== 'in_progress') {
            return { success: false, error: 'Attempt is not in progress' };
        }

        // Session conflict check (multi-device/tab prevention)
        if (attempt.session_token && options?.sessionToken && attempt.session_token !== options.sessionToken) {
            if (options.force_resume === true) {
                const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;

                if (isStale) {
                    examLogger.securityEvent('Force resume rejected (stale) (submitExam)', {
                        attemptId,
                        oldToken: attempt.session_token,
                        lastActivityAt: attempt.last_activity_at,
                    });
                    return { success: false, error: 'FORCE_RESUME_STALE' };
                }

                examLogger.securityEvent('Force resume (submitExam)', { attemptId, oldToken: attempt.session_token });
                await supabase
                    .from('attempts')
                    .update({ session_token: options.sessionToken })
                    .eq('id', attemptId);
            } else {
                examLogger.securityEvent('Session conflict (submitExam)', { attemptId });
                return { success: false, error: 'SESSION_CONFLICT' };
            }
        }

        // P0 FIX: Server-side timer validation (dynamic per paper)
        const { data: paperTiming } = await supabase
            .from('papers')
            .select('sections')
            .eq('id', attempt.paper_id)
            .maybeSingle();

        const MAX_EXAM_DURATION_SECONDS = getPaperTotalDurationSeconds(paperTiming?.sections);
        const GRACE_PERIOD_SECONDS = 120; // 2 minutes grace for network latency

        const startedAt = new Date(attempt.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);

        if (elapsedSeconds > MAX_EXAM_DURATION_SECONDS + GRACE_PERIOD_SECONDS) {
            examLogger.securityEvent('Late submission rejected', { attemptId, elapsedSeconds, maxAllowed: MAX_EXAM_DURATION_SECONDS + GRACE_PERIOD_SECONDS });

            // Still mark as completed but flag it
            await supabase
                .from('attempts')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    // Could add a 'late_submission' flag column if needed
                })
                .eq('id', attemptId);

            return { success: false, error: 'Exam time exceeded. Late submissions are not accepted.' };
        }

        const submittedAt = new Date().toISOString();
        const submissionId = options?.submissionId ?? null;

        // P0 FIX: Use atomic status transition to prevent race conditions
        let updateQuery = supabase
            .from('attempts')
            .update({ status: 'submitted', submitted_at: submittedAt, submission_id: submissionId })
            .eq('id', attemptId)
            .eq('status', 'in_progress');

        if (submissionId) {
            updateQuery = updateQuery.or(`submission_id.is.null,submission_id.eq.${submissionId}`);
        }

        const { data: updatedAttempt, error: updateStatusError } = await updateQuery
            .select('id')
            .maybeSingle();

        if (updateStatusError) {
            logger.error('Failed to mark attempt as submitted', updateStatusError, { attemptId });
            return { success: false, error: 'Failed to submit exam' };
        }

        if (!updatedAttempt) {
            // Another request already submitted this attempt
            return { success: false, error: 'Attempt already submitted by another request' };
        }

        // Fetch all questions WITH correct_answer (server-side only, secure)
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError || !questions) {
            logger.error('Failed to fetch questions for scoring', questionsError, { attemptId, paperId: attempt.paper_id });
            return { success: false, error: 'Failed to fetch questions for scoring' };
        }

        // Fetch user responses
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('question_id, answer, time_spent_seconds')
            .eq('attempt_id', attemptId);

        if (responsesError) {
            logger.error('Failed to fetch responses for scoring', responsesError, { attemptId });
            return { success: false, error: 'Failed to fetch responses' };
        }

        // P0 FIX: Submission integrity check - verify all responses belong to valid questions
        const validQuestionIds = new Set(questions.map(q => q.id));
        const invalidResponses = (responses || []).filter(r => !validQuestionIds.has(r.question_id));

        if (invalidResponses.length > 0) {
            examLogger.securityEvent('Invalid responses detected', {
                attemptId,
                invalidQuestionIds: invalidResponses.map(r => r.question_id)
            });
            // Log but don't block - filter them out for scoring
            // This could indicate a bug or tampering
        }

        // Only score valid responses
        const validResponses = (responses || []).filter(r => validQuestionIds.has(r.question_id));

        // Import scoring function dynamically to avoid circular deps
        const { calculateScore, calculateTimeTaken } = await import('./scoring');

        // Calculate scores using TypeScript scoring engine (only valid responses)
        const scoringResult = calculateScore(
            questions as Array<Question & { correct_answer: string }>,
            validResponses
        );

        // Calculate time taken
        const timeTakenSeconds = calculateTimeTaken(attempt.started_at, submittedAt);

        // Update attempt with scores
        const { error: scoreUpdateError } = await supabase
            .from('attempts')
            .update({
                status: 'completed',
                completed_at: submittedAt,
                total_score: scoringResult.total_score,
                max_possible_score: scoringResult.max_possible_score,
                correct_count: scoringResult.correct_count,
                incorrect_count: scoringResult.incorrect_count,
                unanswered_count: scoringResult.unanswered_count,
                accuracy: scoringResult.accuracy,
                attempt_rate: scoringResult.attempt_rate,
                section_scores: scoringResult.section_scores,
                time_taken_seconds: timeTakenSeconds,
            })
            .eq('id', attemptId);

        if (scoreUpdateError) {
            logger.error('Failed to update attempt with scores', scoreUpdateError, { attemptId });
            // Continue anyway - attempt is submitted, scores may be incomplete
        }

        // Update individual responses with is_correct and marks_obtained
        for (const questionResult of scoringResult.question_results) {
            await supabase
                .from('responses')
                .update({
                    is_correct: questionResult.is_correct,
                    marks_obtained: questionResult.marks_obtained,
                })
                .eq('attempt_id', attemptId)
                .eq('question_id', questionResult.question_id);
        }

        return {
            success: true,
            data: {
                success: true,
                total_score: scoringResult.total_score,
                max_score: scoringResult.max_possible_score,
                correct: scoringResult.correct_count,
                incorrect: scoringResult.incorrect_count,
                unanswered: scoringResult.unanswered_count,
                accuracy: scoringResult.accuracy,
                attempt_rate: scoringResult.attempt_rate,
                section_scores: scoringResult.section_scores,
            },
        };
    } catch (error) {
        logger.error('submitExam error', error, { attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// FETCH RESULTS
// =============================================================================

/**
 * Fetch completed attempt results with answers
 * @param attemptId - UUID of the attempt
 */
export async function fetchExamResults(attemptId: string): Promise<ActionResult<{
    attempt: Attempt;
    questions: Array<Question & { correct_answer: string }>;
    responses: Array<{
        question_id: string;
        answer: string | null;
        is_correct: boolean | null;
        marks_obtained: number | null;
    }>;
}>> {
    try {
        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Fetch attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('*')
            .eq('id', attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (attempt.status !== 'completed') {
            return { success: false, error: 'Attempt not yet completed' };
        }

        // Fetch questions WITH correct answers (only for completed attempts)
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('paper_id', attempt.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (questionsError) {
            return { success: false, error: 'Failed to fetch questions' };
        }

        // Fetch responses
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('question_id, answer, is_correct, marks_obtained')
            .eq('attempt_id', attemptId);

        if (responsesError) {
            return { success: false, error: 'Failed to fetch responses' };
        }

        return {
            success: true,
            data: {
                attempt: attempt as Attempt,
                questions: questions as Array<Question & { correct_answer: string }>,
                responses: responses as Array<{
                    question_id: string;
                    answer: string | null;
                    is_correct: boolean | null;
                    marks_obtained: number | null;
                }>,
            },
        };
    } catch (error) {
        logger.error('fetchExamResults error', error, { attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =============================================================================
// PAUSE EXAM (Save progress and allow resume later)
// =============================================================================

/**
 * Pause the exam - saves all progress and allows resuming later
 * @param attemptId - UUID of the attempt to pause
 * @param timeRemaining - Current section timers
 * @param currentSection - Current section name
 * @param currentQuestion - Current question number
 */
export async function pauseExam(data: {
    attemptId: string;
    timeRemaining: TimeRemaining;
    currentSection: SectionName;
    currentQuestion: number;
}): Promise<ActionResult<void>> {
    try {
        const supabase = await sbSSR();

        // Verify user owns this attempt
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Get attempt to verify ownership
        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('user_id, status')
            .eq('id', data.attemptId)
            .single();

        if (attemptError || !attempt) {
            return { success: false, error: 'Attempt not found' };
        }

        if (attempt.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (attempt.status !== 'in_progress') {
            return { success: false, error: 'Attempt is not in progress' };
        }

        // Update attempt with paused state (save progress)
        const { error: updateError } = await supabase
            .from('attempts')
            .update({
                time_remaining: data.timeRemaining,
                current_section: data.currentSection,
                current_question: data.currentQuestion,
                // Note: status stays 'in_progress' to allow resume
                // We just save the progress
            })
            .eq('id', data.attemptId)
            .eq('user_id', user.id);

        if (updateError) {
            logger.error('pauseExam update error', updateError, { attemptId: data.attemptId });
            return { success: false, error: 'Failed to pause exam' };
        }

        return { success: true };
    } catch (error) {
        logger.error('pauseExam error', error, { attemptId: data.attemptId });
        return { success: false, error: 'An unexpected error occurred' };
    }
}
````

## File: src/app/api/submit/route.ts
````typescript
/**
 * @fileoverview Submit Exam API Route
 * @description Submits exam attempt and triggers scoring
 * @blueprint Security Audit - P0 Fix - Rate Limiting, Integrity & Session Locking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limit';
import { submitExam } from '@/features/exam-engine/lib/actions';
import { examLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { attemptId, sessionToken, force_resume, submissionId } = await req.json();
        if (!attemptId) {
            return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
        }

        const res = NextResponse.next();
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
        const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
        const supabase = createServerClient(url || 'http://localhost:54321', anon || 'anon', {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    res.cookies.set({ name, value: '', ...options });
                },
            },
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // P0 FIX: Rate limiting for submissions (strict - 5 per minute)
        const rateLimitKey = userRateLimitKey('submit', session.user.id);
        const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.SUBMIT_EXAM);

        if (!rateLimitResult.allowed) {
            const headers = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SUBMIT_EXAM.limit);
            return NextResponse.json(
                {
                    error: 'Too many submission attempts. Please wait before trying again.',
                    retryAfterSeconds: Math.ceil(rateLimitResult.retryAfterMs / 1000),
                },
                { status: 429, headers }
            );
        }

        // P0 FIX: Pre-validate session token before calling submitExam
        // This catches multi-device/tab attacks at the API layer
        if (sessionToken) {
            const { data: attempt } = await supabase
                .from('attempts')
                .select('session_token, last_activity_at')
                .eq('id', attemptId)
                .maybeSingle();

            if (attempt?.session_token && attempt.session_token !== sessionToken) {
                if (force_resume === true) {
                    const lastActivityAt = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : null;
                    const isStale = !lastActivityAt || (Date.now() - lastActivityAt) > 5 * 60 * 1000;
                    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
                    const userAgent = req.headers.get('user-agent') ?? 'unknown';

                    if (isStale) {
                        examLogger.securityEvent('Force resume rejected (stale) (submit)', {
                            attemptId,
                            oldToken: attempt.session_token,
                            lastActivityAt: attempt.last_activity_at,
                            ip,
                            userAgent,
                        });
                        return NextResponse.json({
                            error: 'Force resume denied. Session is too old.',
                            code: 'FORCE_RESUME_STALE',
                        }, { status: 409 });
                    }

                    examLogger.securityEvent('Force resume: updating session token (submit)', {
                        attemptId,
                        oldToken: attempt.session_token,
                        ip,
                        userAgent,
                    });
                    await supabase
                        .from('attempts')
                        .update({ session_token: sessionToken })
                        .eq('id', attemptId);
                } else {
                    examLogger.securityEvent('Submit session mismatch', { attemptId });
                    return NextResponse.json({
                        error: 'Session conflict detected. This exam may be open in another tab or device.',
                        code: 'SESSION_CONFLICT',
                        canForceResume: true
                    }, { status: 409 });
                }
            }
        }

        // Use the server action which has full validation, timer checks, and scoring
        const result = await submitExam(attemptId, { sessionToken, force_resume, submissionId });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Add rate limit headers to successful response
        const successHeaders = getRateLimitHeaders(rateLimitResult, RATE_LIMITS.SUBMIT_EXAM.limit);
        return NextResponse.json({ success: true, ...result.data }, { headers: successHeaders });
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}
````

## File: src/app/exam/[attemptId]/page.tsx
````typescript
/**
 * @fileoverview Exam Page (Server Component)
 * @description Fetches exam data and renders the client-side exam interface
 * @blueprint Milestone 4 SOP-SSOT - Exam Engine
 */

import { sbSSR } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ExamClient } from './ExamClient';
import type { Paper, Question, Attempt, SectionConfig, QuestionContext } from '@/types/exam';

export default async function ExamPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/auth/sign-in?redirect_to=${encodeURIComponent(`/exam/${attemptId}`)}`);
    }

    // Get attempt with paper details
    const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select(`
            id, user_id, paper_id, status, started_at, submitted_at, completed_at,
            current_section, current_question, time_remaining,
            total_score, correct_count, incorrect_count, unanswered_count,
            section_scores, percentile, rank, created_at, updated_at,
            papers (
                id, slug, title, description, year,
                total_questions, total_marks, duration_minutes, sections,
                default_positive_marks, default_negative_marks,
                published, available_from, available_until,
                difficulty_level, is_free, attempt_limit,
                created_at, updated_at
            )
        `)
        .eq('id', attemptId)
        .single();

    if (attemptError || !attemptData) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Attempt Not Found</h1>
                    <p className="text-gray-600 mb-6">This exam attempt does not exist or you don&apos;t have access to it.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Verify user owns this attempt
    if (attemptData.user_id !== user.id) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized</h1>
                    <p className="text-gray-600 mb-6">You don&apos;t have access to this exam attempt.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Check if attempt is already completed
    if (attemptData.status === 'completed' || attemptData.status === 'submitted') {
        redirect(`/result/${attemptId}`);
    }

    // Get questions for this paper using secure view `questions_exam` (excludes correct_answer).
    // Fail fast if the view isn't deployed to avoid leaking answers.
    type QuestionRow = {
        id: string;
        paper_id: string;
        section: string;
        question_number: number;
        question_text: string;
        question_type: string;
        options: unknown;
        positive_marks: number;
        negative_marks: number;
        question_image_url?: string | null;
        context_id?: string | null;
        difficulty: string | null;
        topic: string | null;
        subtopic: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    };

    let questionsData: QuestionRow[] | null = null;

    {
        const { data, error } = await supabase
            .from('questions_exam')
            .select('*')
            .eq('paper_id', attemptData.paper_id)
            .eq('is_active', true)
            .order('section')
            .order('question_number');

        if (!error && data) {
            questionsData = data as unknown as QuestionRow[];
        } else {
            return (
                <main className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-xl px-4">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Questions</h1>
                        <p className="text-gray-600 mb-2">There was an error loading the exam questions.</p>
                        <p className="text-gray-600 mb-6">
                            Ensure the secure questions_exam view and its RLS policies are deployed.
                        </p>
                        <Link href="/dashboard" className="text-blue-600 hover:underline">
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            );
        }
    }

    if (!questionsData) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Questions</h1>
                    <p className="text-gray-600 mb-6">There was an error loading the exam questions.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Transform data to match our types
    // Note: Supabase returns single relation as object, not array
    const paperRaw = attemptData.papers as unknown;
    const paperData = paperRaw as {
        id: string;
        slug: string;
        title: string;
        description: string | null;
        year: number;
        total_questions: number;
        total_marks: number;
        duration_minutes: number;
        sections: SectionConfig[];
        default_positive_marks: number;
        default_negative_marks: number;
        published: boolean;
        available_from: string | null;
        available_until: string | null;
        difficulty_level: string | null;
        is_free: boolean;
        attempt_limit: number | null;
        created_at: string;
        updated_at: string;
    };

    const paper: Paper = {
        id: paperData.id,
        slug: paperData.slug,
        title: paperData.title,
        description: paperData.description ?? undefined,
        year: paperData.year,
        total_questions: paperData.total_questions,
        total_marks: paperData.total_marks,
        duration_minutes: paperData.duration_minutes,
        sections: paperData.sections,
        default_positive_marks: paperData.default_positive_marks,
        default_negative_marks: paperData.default_negative_marks,
        published: paperData.published,
        available_from: paperData.available_from ?? undefined,
        available_until: paperData.available_until ?? undefined,
        difficulty_level: paperData.difficulty_level as Paper['difficulty_level'],
        is_free: paperData.is_free,
        attempt_limit: paperData.attempt_limit ?? undefined,
        created_at: paperData.created_at,
        updated_at: paperData.updated_at,
    };

    const attempt: Attempt = {
        id: attemptData.id,
        user_id: attemptData.user_id,
        paper_id: attemptData.paper_id,
        started_at: attemptData.started_at,
        submitted_at: attemptData.submitted_at ?? undefined,
        completed_at: attemptData.completed_at ?? undefined,
        status: attemptData.status as Attempt['status'],
        current_section: attemptData.current_section as Attempt['current_section'],
        current_question: attemptData.current_question ?? 1,
        time_remaining: attemptData.time_remaining as Attempt['time_remaining'],
        total_score: attemptData.total_score ?? undefined,
        correct_count: attemptData.correct_count ?? 0,
        incorrect_count: attemptData.incorrect_count ?? 0,
        unanswered_count: attemptData.unanswered_count ?? 0,
        section_scores: attemptData.section_scores as Attempt['section_scores'],
        percentile: attemptData.percentile ?? undefined,
        rank: attemptData.rank ?? undefined,
        created_at: attemptData.created_at,
        updated_at: attemptData.updated_at,
    };

    // Fetch question contexts for questions that have context_id
    const contextIds = [...new Set(
        questionsData
            .map(q => q.context_id)
            .filter((id): id is string => Boolean(id))
    )];

    let contextMap = new Map<string, QuestionContext>();
    if (contextIds.length > 0) {
        const { data: contexts } = await supabase
            .from('question_contexts')
            .select('id, title, section, content, context_type, paper_id, display_order, is_active, image_url')
            .in('id', contextIds);

        if (contexts) {
            contextMap = new Map(contexts.map(c => [c.id, c as QuestionContext]));
        }
    }

    const questions: Question[] = questionsData.map((q: QuestionRow) => ({
        id: q.id,
        paper_id: q.paper_id,
        section: q.section as Question['section'],
        question_number: q.question_number,
        question_text: q.question_text,
        question_type: q.question_type as Question['question_type'],
        options: q.options as Question['options'],
        positive_marks: q.positive_marks,
        negative_marks: q.negative_marks,
        question_image_url: q.question_image_url ?? undefined,
        context_id: q.context_id ?? undefined,
        context: q.context_id ? contextMap.get(q.context_id) : undefined,
        difficulty: q.difficulty as Question['difficulty'],
        topic: q.topic ?? undefined,
        subtopic: q.subtopic ?? undefined,
        is_active: q.is_active,
        created_at: q.created_at,
        updated_at: q.updated_at,
    }));

    return <ExamClient paper={paper} questions={questions} attempt={attempt} />;
}
````

## File: src/app/result/[attemptId]/page.tsx
````typescript
/**
 * @fileoverview Exam Result Page
 * @description Displays detailed exam results with sectional analysis
 * @blueprint Milestone 5 - Milestone_Change_Log.md - Change 002
 */

import Link from 'next/link';
import { sbSSR } from '@/lib/supabase/server';
import { ResultHeader } from '@/features/exam-engine/ui/ResultHeader';
import { SectionalPerformance } from '@/features/exam-engine/ui/SectionalPerformance';
import { QuestionAnalysis } from '@/features/exam-engine/ui/QuestionAnalysis';

interface SectionScore {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
}

interface Attempt {
    id: string;
    paper_id: string;
    status: string;
    total_score: number | null;
    max_possible_score: number | null;
    accuracy: number | null;
    attempt_rate: number | null;
    correct_count: number | null;
    incorrect_count: number | null;
    unanswered_count: number | null;
    percentile: number | null;
    rank: number | null;
    section_scores: Record<string, SectionScore> | null;
    submitted_at: string | null;
    time_taken_seconds: number | null;
    user_id: string;
    papers: {
        title: string;
        total_marks: number;
        total_questions: number;
    };
}

interface Question {
    id: string;
    section: 'VARC' | 'DILR' | 'QA';
    question_number: number;
    question_text: string;
    question_type: 'MCQ' | 'TITA';
    options: string[] | null;
    correct_answer: string;
    solution_text: string | null;
    question_image_url: string | null;
    topic: string | null;
    difficulty: string | null;
}

interface Response {
    question_id: string;
    answer: string | null;
    is_correct: boolean | null;
    marks_obtained: number | null;
}

export default async function ResultPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    const supabase = await sbSSR();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Load attempt with paper details
    const { data: attempt, error } = await supabase
        .from('attempts')
        .select(`
            id, paper_id, status, total_score, max_possible_score, 
            accuracy, attempt_rate, correct_count, incorrect_count, unanswered_count,
            percentile, rank, section_scores, submitted_at, time_taken_seconds, user_id,
            papers (title, total_marks, total_questions)
        `)
        .eq('id', attemptId)
        .maybeSingle() as { data: Attempt | null; error: unknown };

    const forbidden = attempt && userId && attempt.user_id && attempt.user_id !== userId;

    // Error state
    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Result</h1>
                    <p className="text-gray-600 mb-6">Failed to load result. Please try again later.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Access denied state
    if (forbidden) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You do not have permission to view this result.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Not found state
    if (!attempt) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h1>
                    <p className="text-gray-600 mb-6">No attempt found with this ID.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    // Exam not completed state
    if (attempt.status !== 'completed') {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Completed</h1>
                    <p className="text-gray-600 mb-6">This exam has not been submitted yet.</p>
                    <Link
                        href={`/exam/${attemptId}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Continue Exam
                    </Link>
                </div>
            </main>
        );
    }

    // Fetch questions for this paper
    const { data: questions } = await supabase
        .from('questions')
        .select('id, question_number, section, question_type, question_text, options, correct_answer, solution_text, question_image_url, topic, difficulty')
        .eq('paper_id', attempt.paper_id)
        .order('question_number', { ascending: true }) as { data: Question[] | null };

    // Fetch responses for this attempt
    const { data: responses } = await supabase
        .from('responses')
        .select('question_id, answer, is_correct, marks_obtained')
        .eq('attempt_id', attemptId) as { data: Response[] | null };

    // Fetch peer statistics for this paper
    type PaperStats = Record<string, { total: number; options: Record<string, number> }>;
    let paperStats: PaperStats = {};

    const { data: statsData } = await supabase
        .rpc('get_paper_stats', { p_paper_id: attempt.paper_id });

    if (statsData && typeof statsData === 'object') {
        paperStats = statsData as PaperStats;
    }

    const paper = attempt.papers;
    const sectionScores = attempt.section_scores || {};

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header with paper title and submission info */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
                    <p className="text-blue-100">
                        Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '—'}
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Result Header - Summary card */}
                <ResultHeader
                    paperTitle={paper.title}
                    totalScore={attempt.total_score ?? 0}
                    maxScore={attempt.max_possible_score ?? paper.total_marks}
                    accuracy={attempt.accuracy}
                    attemptRate={attempt.attempt_rate}
                    correctCount={attempt.correct_count ?? 0}
                    incorrectCount={attempt.incorrect_count ?? 0}
                    unansweredCount={attempt.unanswered_count ?? 0}
                    timeTakenSeconds={attempt.time_taken_seconds}
                    percentile={attempt.percentile}
                    rank={attempt.rank}
                    submittedAt={attempt.submitted_at}
                />

                {/* Sectional Performance */}
                <SectionalPerformance
                    sectionScores={sectionScores as Record<string, {
                        score: number;
                        maxScore: number;
                        correct: number;
                        incorrect: number;
                        unanswered: number;
                        timeTakenSeconds?: number;
                    }>}
                />

                {/* Question Analysis (Client Component) */}
                {questions && questions.length > 0 && (
                    <QuestionAnalysis
                        questions={questions}
                        responses={responses || []}
                        peerStats={paperStats}
                    />
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/mocks"
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Take Another Mock
                    </Link>
                </div>
            </div>
        </main>
    );
}
````

## File: package.json
````json
{
  "name": "temp_app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "cross-env NEXT_DISABLE_TURBOPACK=1 next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.4.1",
    "@supabase/supabase-js": "^2.75.0",
    "class-variance-authority": "^0.7.1",
    "jwt-decode": "^4.0.0",
    "katex": "^0.16.25",
    "next": "16.1.3",
    "next-safe-action": "^8.0.11",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-katex": "^3.1.0",
    "zod": "^4.3.5",
    "zustand": "^5.0.10"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@next/eslint-plugin-next": "^16.1.3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@typescript-eslint/eslint-plugin": "^8.53.0",
    "@typescript-eslint/parser": "^8.53.0",
    "autoprefixer": "^10.4.21",
    "cross-env": "^7.0.3",
    "eslint": "^9",
    "eslint-config-next": "16.1.3",
    "netlify-cli": "^23.9.1",
    "postcss": "^8.5.6",
    "source-map-explorer": "^2.5.3",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  },
  "engines": {
    "node": ">=20"
  }
}
````

## File: src/app/mock/[paperId]/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { sbSSR } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Mock Details",
};

interface Section {
    name: string;
    questions: number;
    time: number;
    marks: number;
}

interface Paper {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    year: number;
    total_questions: number;
    total_marks: number;
    duration_minutes: number;
    sections: Section[];
    published: boolean;
    difficulty_level: string | null;
    is_free: boolean;
    attempt_limit: number | null;
}

export default async function MockDetailPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { paperId } = (await params) as { paperId: string };

    const supabase = await sbSSR();

    // Get paper details - try by UUID first, then by slug
    let paper: Paper | null = null;
    let error: unknown = null;

    // Check if paperId looks like a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);

    if (isUUID) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
            .eq('id', paperId)
            .maybeSingle();
        paper = result.data as Paper | null;
        error = result.error;
    }

    // If not found by UUID or not a UUID, try by slug
    if (!paper && !error) {
        const result = await supabase
            .from('papers')
            .select('id, slug, title, description, year, total_questions, total_marks, duration_minutes, sections, published, difficulty_level, is_free, attempt_limit')
            .eq('slug', paperId)
            .maybeSingle();
        paper = result.data as Paper | null;
        error = result.error;
    }

    // Get user's previous attempts on this paper
    const { data: { user } } = await supabase.auth.getUser();
    let previousAttempts: { id: string; status: string; total_score: number | null; created_at: string }[] = [];

    if (user && paper) {
        const { data: attempts } = await supabase
            .from('attempts')
            .select('id, status, total_score, created_at')
            .eq('paper_id', paper.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        previousAttempts = attempts || [];
    }

    // Check attempt limit
    const completedAttempts = previousAttempts.filter(a => a.status === 'completed').length;
    const canAttempt = paper?.attempt_limit === null || completedAttempts < (paper?.attempt_limit || 0);

    async function startExam() {
        'use server';
        const s = await sbSSR();
        const { data: { user: currentUser } } = await s.auth.getUser();

        if (!currentUser) {
            redirect(`/auth/sign-in?redirect_to=${encodeURIComponent(`/mock/${paperId}`)}`);
        }

        // Check if paperId looks like a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);

        type PaperData = { id: string; published: boolean; sections: Section[]; duration_minutes: number };
        let p: PaperData | null = null;

        if (isUUID) {
            const { data } = await s
                .from('papers')
                .select('id, published, sections, duration_minutes')
                .eq('id', paperId)
                .maybeSingle();
            p = data as PaperData | null;
        }

        if (!p) {
            const { data } = await s
                .from('papers')
                .select('id, published, sections, duration_minutes')
                .eq('slug', paperId)
                .maybeSingle();
            p = data as PaperData | null;
        }

        if (!p || p.published !== true) {
            throw new Error('Paper not available');
        }

        // FIX: Check for existing in_progress attempt - reuse instead of creating new
        const { data: existingAttempt } = await s
            .from('attempts')
            .select('id')
            .eq('paper_id', p.id)
            .eq('user_id', currentUser.id)
            .eq('status', 'in_progress')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingAttempt) {
            // Resume existing attempt instead of creating new one
            redirect(`/exam/${existingAttempt.id}`);
        }

        // Initialize time remaining for each section
        const sections = p.sections as Section[] || [];
        const timeRemaining: Record<string, number> = {};
        sections.forEach((sec: Section) => {
            timeRemaining[sec.name] = sec.time * 60; // Convert to seconds
        });

        const { data: attempt, error: insertErr } = await s
            .from('attempts')
            .insert({
                paper_id: p.id,
                user_id: currentUser.id,
                status: 'in_progress',
                current_section: sections[0]?.name || null,
                current_question: 1,
                time_remaining: timeRemaining
            })
            .select('id')
            .single();

        if (insertErr || !attempt) {
            logger.error('Failed to create attempt', insertErr, { paperId: p.id, userId: currentUser.id });
            throw new Error('Failed to create attempt');
        }

        redirect(`/exam/${attempt.id}`);
    }

    if (error) {
        return (
            <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
                <h1>Error Loading Paper</h1>
                <p style={{ color: 'crimson' }}>Failed to load paper. Please try again later.</p>
                <Link href="/mocks">Back to Mocks</Link>
            </main>
        );
    }

    if (!paper) {
        return (
            <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
                <h1>Paper Not Found</h1>
                <p>The requested mock test does not exist.</p>
                <Link href="/mocks">Browse Available Mocks</Link>
            </main>
        );
    }

    const sections = paper.sections || [];

    return (
        <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            {/* Paper Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h1 style={{ margin: 0 }}>{paper.title}</h1>
                    {paper.is_free && (
                        <span style={{
                            padding: '4px 8px',
                            background: '#4caf50',
                            color: 'white',
                            borderRadius: 4,
                            fontSize: 12
                        }}>FREE</span>
                    )}
                    {paper.difficulty_level && (
                        <span style={{
                            padding: '4px 8px',
                            background: paper.difficulty_level === 'hard' ? '#f44336' : paper.difficulty_level === 'medium' ? '#ff9800' : '#4caf50',
                            color: 'white',
                            borderRadius: 4,
                            fontSize: 12
                        }}>{paper.difficulty_level.toUpperCase()}</span>
                    )}
                </div>
                {paper.description && <p style={{ color: '#666', marginTop: 8 }}>{paper.description}</p>}
            </div>

            {/* Paper Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 32,
                padding: 20,
                background: '#f5f5f5',
                borderRadius: 12
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Questions</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.total_questions}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Total Marks</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.total_marks}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Duration</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.duration_minutes} min</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Year</p>
                    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 'bold' }}>{paper.year}</p>
                </div>
            </div>

            {/* Section Breakdown */}
            <h2 style={{ marginBottom: 16 }}>Section Details</h2>
            <div style={{ marginBottom: 32 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Section</th>
                            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>Questions</th>
                            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>Time (min)</th>
                            <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map((section: Section, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: 12 }}>{section.name}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{section.questions}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{section.time}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{section.marks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Marking Scheme */}
            <h2 style={{ marginBottom: 16 }}>Marking Scheme</h2>
            <div style={{
                padding: 16,
                background: '#fff3e0',
                borderRadius: 8,
                marginBottom: 32,
                fontSize: 14
            }}>
                <p style={{ margin: '0 0 8px' }}><strong>MCQ Questions:</strong> +3 for correct, -1 for incorrect, 0 for unanswered</p>
                <p style={{ margin: 0 }}><strong>TITA Questions:</strong> +3 for correct, 0 for incorrect/unanswered (No negative marking)</p>
            </div>

            {/* Previous Attempts */}
            {previousAttempts.length > 0 && (
                <>
                    <h2 style={{ marginBottom: 16 }}>Your Previous Attempts</h2>
                    <div style={{ marginBottom: 32 }}>
                        {previousAttempts.map((attempt, idx) => (
                            <div key={attempt.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 12,
                                background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                                borderRadius: 4,
                                marginBottom: 4
                            }}>
                                <span>Attempt {previousAttempts.length - idx}</span>
                                <span style={{ color: '#666' }}>{new Date(attempt.created_at).toLocaleDateString()}</span>
                                <span style={{
                                    color: attempt.status === 'completed' ? '#4caf50' : '#ff9800'
                                }}>{attempt.status}</span>
                                <span style={{ fontWeight: 'bold' }}>
                                    {attempt.total_score !== null ? `${attempt.total_score} marks` : '—'}
                                </span>
                                {attempt.status === 'completed' ? (
                                    <Link href={`/result/${attempt.id}`} style={{ color: '#1976d2' }}>View Result</Link>
                                ) : (
                                    <Link href={`/exam/${attempt.id}`} style={{ color: '#ff9800' }}>Continue</Link>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Start Exam Button */}
            <div style={{ textAlign: 'center' }}>
                {!paper.published ? (
                    <p style={{ color: '#666' }}>This paper is not yet available.</p>
                ) : !canAttempt ? (
                    <p style={{ color: '#f44336' }}>You have reached the maximum number of attempts for this paper.</p>
                ) : (
                    <form action={startExam}>
                        <button type="submit" style={{
                            padding: '16px 48px',
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 18,
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            {previousAttempts.length > 0 ? 'Start New Attempt' : 'Start Exam'}
                        </button>
                    </form>
                )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link href="/mocks" style={{ color: '#666' }}>← Back to All Mocks</Link>
            </div>
        </main>
    );
}
````
