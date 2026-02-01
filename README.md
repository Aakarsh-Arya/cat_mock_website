# CAT Mock Website

A Next.js 15 application for CAT exam mock tests with Supabase authentication.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Exam Integrity & Security (Phase 1)

### Scoring System

- **TypeScript Scoring Engine**: The sole source of truth for exam scoring is the TypeScript `calculateScore()` function in `src/features/exam-engine/lib/scoring.ts`.
- **Legacy SQL Removed**: The legacy SQL `finalize_attempt()` function has been removed to prevent divergent scoring outcomes.
- **Marking Scheme**: 
  - MCQ: +3 for correct, -1 for incorrect, 0 for unanswered
  - TITA: +3 for correct, 0 for incorrect/unanswered (no negative marking)

### Attempt Limits

- Papers can specify an `attempt_limit` (e.g., 3 attempts per user).
- Non-expired attempts (in_progress, submitted, completed, abandoned) count toward the limit.
- Enforced at both client-side (UI check) and server-side (RLS policy).
- Users attempting to exceed the limit see a friendly error message.

### Pause/Resume Rules

- Papers have an `allow_pause` flag (default: false).
- When `allow_pause = false`:
  - The pause button is hidden/disabled in the UI.
  - The `/api/pause` endpoint returns an error.
  - The `pause_exam_state` RPC rejects pause requests.
- When `allow_pause = true`:
  - Users can pause and resume from the dashboard.
  - Timer state is preserved server-side.

### Session Token Security

- Each exam session generates a unique `session_token`.
- All save/submit operations require a valid session token.
- Multi-device/tab detection: If tokens don't match, a `SESSION_CONFLICT` error is returned.
- Force Resume: Users can explicitly take over a session from another device/tab.
- Session tokens are not directly accessible by authenticated users (REVOKE SELECT/UPDATE).

### Admin API Security

- All admin routes (`/api/admin/*`) require admin verification.
- Admin verification checks:
  1. JWT claim `user_role = 'admin'`
  2. Fallback to `is_admin()` RPC (checks `user_roles` table)
- Admin routes use `getServiceRoleClient()` to bypass RLS for data operations.
- Non-admins are redirected to dashboard with an error.

### Sensitive Data Protection (RLS)

- `questions.correct_answer`: Not accessible to users until attempt is completed.
- `attempts.session_token`: Not readable or writable by authenticated users directly.
- `attempts.total_score`, etc.: Not directly writable by users (set by scoring engine).
- Secure views:
  - `questions_exam`: For exam runtime (excludes correct_answer, solutions)
  - `fetch_attempt_solutions()`: RPC for post-completion solution access

## Database Migrations

Apply migrations in order from the `docs/migrations/` directory:

```bash
# Core migrations (apply in numeric order)
002_session_locking.sql
003_question_container_architecture.sql
004_fetch_attempt_solutions.sql
005_attempt_state_lockdown.sql
006_force_resume_session.sql
...
013_phase1_security_complete.sql  # Full Phase 1 security hardening
```

**Note**: Migration `012_phase1_security_hardening.sql` is deprecated. Use `013_phase1_security_complete.sql` instead.

## Running Tests

```bash
# Run all tests
pnpm test

# Run scoring tests only
pnpm exec vitest run src/features/exam-engine/lib/__tests__/scoring.test.ts

# Run type checking
pnpm exec tsc --noEmit

# Run linting
pnpm lint
```

## Architecture

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── submit/        # Exam submission
│   │   ├── save/          # Response saving
│   │   ├── pause/         # Exam pausing
│   │   ├── session/       # Session initialization
│   │   ├── progress/      # Progress updates
│   │   └── admin/         # Admin-only endpoints
│   ├── exam/              # Exam taking pages
│   ├── result/            # Result viewing pages
│   └── mock/              # Mock selection pages
├── features/
│   └── exam-engine/       # Core exam functionality
│       ├── lib/           # Actions, scoring, validation
│       ├── model/         # Zustand store (useExamStore)
│       ├── hooks/         # React hooks (useExamTimer)
│       ├── ui/            # UI components
│       └── api/           # Client-side API wrappers
├── lib/
│   └── supabase/          # Supabase client configurations
└── types/
    └── exam.ts            # TypeScript types for exam system
```
