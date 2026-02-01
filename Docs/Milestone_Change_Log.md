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
- Legacy `finalize_attempt(UUID)` SQL path disabled (see Phase 1 hardening migration)
- Unit tests added for scoring logic

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
