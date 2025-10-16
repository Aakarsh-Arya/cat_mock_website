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

**RLS sketch**
- `profiles`: user can read/update own.
- `attempts/responses`: `user_id = auth.uid()`.
- `papers/questions`: read all `is_published = true`; admins full.

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
