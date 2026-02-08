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
- Files matching these patterns are excluded: .env.local, .env.*.local
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
.repomixignore
cat_2025_slot_1.json
cat_2025_slot_1.md
data_sanitized/Cat_2023_slot_1.json
data_sanitized/CAT-2023-Slot-2-v3.json
data_sanitized/cat-2024-mock-1-full.json
data_sanitized/CAT-2024-Slot-1-parsed.json
data_sanitized/cat-2024-slot-1-varc.jsonc
data_sanitized/cat-2024-slot-1.json
data_sanitized/CAT-2024-Slot-2-parsed.json
data_sanitized/CAT-2024-Slot-3-parsed.json
data_sanitized/cat-2024-slot1.json
data_sanitized/CAT-2025-Slot-1-parsed.json
data_sanitized/CAT-2025-Slot-1.json
data_sanitized/CAT-2025-Slot-2-parsed.json
data_sanitized/CAT-2025-Slot-3-v3.json
data_sanitized/paper_schema_v3.template.json
data_sanitized/sample-paper-template.json
docs/archive/SCHEMA_FIREBASE.md
docs/AUDIT_QUERY_PATHS.md
docs/BLUEPRINT.md
docs/BUG_REPRO_CHECKLIST.md
docs/bug-repro.md
docs/CONTENT-SCHEMA.md
docs/DECISIONS.md
docs/landing-page.md
docs/MIGRATION_CONTEXTS.sql
docs/MIGRATION_M5_SCORING.sql
docs/MIGRATION_M6_RBAC.sql
docs/MIGRATION_RLS_VIEWS.sql
docs/MIGRATION_STATS.sql
docs/migrations/002_session_locking.sql
docs/migrations/003_question_container_architecture.sql
docs/migrations/004_fetch_attempt_solutions.sql
docs/migrations/005_attempt_state_lockdown.sql
docs/migrations/006_force_resume_session.sql
docs/migrations/006_response_flags.sql
docs/migrations/007_content_ingestion_phases.sql
docs/migrations/008_ingestion_semantic_keys.sql
docs/migrations/009_attempt_submit_rls.sql
docs/migrations/010_force_resume_lenient.sql
docs/migrations/011_prevent_paper_delete_with_attempts.sql
docs/migrations/012_phase1_security_hardening.sql
docs/migrations/013_phase1_security_complete.sql
docs/migrations/014_soften_submit_rls.sql
docs/migrations/015_landing_assets.sql
docs/migrations/016_bug_reports.sql
docs/migrations/017_bug_report_status.sql
docs/migrations/018_purge_attempts_on_auth_delete.sql
docs/migrations/019_force_resume_ultra_lenient.sql
docs/migrations/020_pause_tracking.sql
docs/migrations/021_validate_session_token_atomic.sql
docs/migrations/022_validate_session_token_single_signature.sql
docs/migrations/023_access_control_foundations.sql
docs/migrations/024_access_control_rls.sql
docs/Milestone_Change_Log.md
docs/PHASE_0_LAYOUT_GUARDRAILS.md
docs/README.md
docs/REFACTOR_PLAN_5_PROMPTS.md
docs/research/convert_paper_metadata.py
docs/research/stack-evaluation.md
docs/ROOT_CAUSE_ANALYSIS_SUBMIT_ERROR.md
docs/SCHEMA_SUPABASE.sql
eslint.config.mjs
knip.json
middleware.ts
next-env.d.ts
next.config.ts
package.json
paper_v3.json
postcss.config.js
public/file.svg
public/globe.svg
public/next.svg
public/vercel.svg
public/window.svg
README.md
schemas/paper_schema_v3.json
scripts/ajv-validator.mjs
scripts/backfill-paper-versions.mjs
scripts/blueprint-guard.mjs
scripts/check-bundle.mjs
scripts/export-paper.mjs
scripts/export-vs-codebase-v2.mjs
scripts/export-vs-codebase.mjs
scripts/import-paper-v3.mjs
scripts/markdown_to_json_parser_v3.mjs
scripts/parse-md-to-v3.mjs
scripts/sanitize-question-data.mjs
scripts/transform-cat-2025-slot-3-md.mjs
src/app/admin/access-control/actions.ts
src/app/admin/access-control/page.tsx
src/app/admin/bug-reports/actions.ts
src/app/admin/bug-reports/BugReportStatusSelect.tsx
src/app/admin/bug-reports/page.tsx
src/app/admin/contexts/new/page.tsx
src/app/admin/contexts/page.tsx
src/app/admin/landing-page/LandingAssetsClient.tsx
src/app/admin/landing-page/page.tsx
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/papers/[paperId]/edit/actions.ts
src/app/admin/papers/[paperId]/edit/ExamEditorClient.tsx
src/app/admin/papers/[paperId]/edit/page.tsx
src/app/admin/papers/[paperId]/preview/page.tsx
src/app/admin/papers/[paperId]/preview/PreviewClient.tsx
src/app/admin/papers/[paperId]/questions/page.tsx
src/app/admin/papers/[paperId]/settings/page.tsx
src/app/admin/papers/actions.ts
src/app/admin/papers/ImportPaperButton.tsx
src/app/admin/papers/new/page.tsx
src/app/admin/papers/page.tsx
src/app/admin/papers/PaperActions.tsx
src/app/admin/question-sets/new/NewQuestionSetClient.tsx
src/app/admin/question-sets/new/page.tsx
src/app/admin/question-sets/page.tsx
src/app/admin/questions/actions.ts
src/app/admin/questions/new/page.tsx
src/app/admin/questions/page.tsx
src/app/admin/questions/QuestionRowActions.tsx
src/app/api/_utils/validation.ts
src/app/api/admin/papers/[paperId]/export/route.ts
src/app/api/admin/papers/import/route.ts
src/app/api/admin/question-sets/route.ts
src/app/api/attempt-status/route.ts
src/app/api/pause/route.ts
src/app/api/progress/route.ts
src/app/api/save-batch/route.ts
src/app/api/save/route.ts
src/app/api/session/route.ts
src/app/api/submit/route.ts
src/app/auth/callback/route.ts
src/app/auth/logout/route.ts
src/app/auth/sign-in/page.tsx
src/app/auth/test-login/page.tsx
src/app/coming-soon/page.tsx
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
src/app/result/[attemptId]/ResultReviewClient.tsx
src/app/result/[attemptId]/ResultTabsClient.tsx
src/components/AuthenticatedOverlays.tsx
src/components/BackToDashboard.tsx
src/components/BugReportFab.tsx
src/components/landing/LandingPageClient.tsx
src/components/useFocusTrap.ts
src/features/admin/config/topicOptions.ts
src/features/admin/index.ts
src/features/admin/ui/EditableExamLayout.tsx
src/features/admin/ui/EditableQuestion.tsx
src/features/admin/ui/MarkdownToolbar.tsx
src/features/admin/ui/QuestionSetEditor.tsx
src/features/exam-engine/api/client.ts
src/features/exam-engine/hooks/useExamTimer.ts
src/features/exam-engine/index.ts
src/features/exam-engine/lib/__tests__/scoring.test.ts
src/features/exam-engine/lib/actions.ts
src/features/exam-engine/lib/assemblePaper.ts
src/features/exam-engine/lib/ExamClient.tsx
src/features/exam-engine/lib/index.ts
src/features/exam-engine/lib/scoring.ts
src/features/exam-engine/lib/validation.ts
src/features/exam-engine/model/useExamStore.ts
src/features/exam-engine/ui/Calculator.tsx
src/features/exam-engine/ui/DevToolsPanel.tsx
src/features/exam-engine/ui/ExamFooter.tsx
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
src/features/shared/ui/PaletteShell.tsx
src/lib/access-control.ts
src/lib/ajv-validator.ts
src/lib/cloudinary.ts
src/lib/devTools.ts
src/lib/examDebug.ts
src/lib/landing-assets.ts
src/lib/logger.ts
src/lib/rate-limit.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/service-role.ts
src/lib/telemetry.ts
src/lib/useLandingAssets.ts
src/types/exam.ts
src/types/react-katex.d.ts
src/utils/question-sets.ts
src/utils/update-session.ts
tailwind.config.js
test.json
test.md
tsconfig.json
tsconfig.tsbuildinfo
vitest.config.ts
vs-codebase-export.bat
vs-codebase-export.ps1
```

# Files

## File: docs/archive/SCHEMA_FIREBASE.md
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

## File: docs/AUDIT_QUERY_PATHS.md
````markdown
# Query Path Audit — Supabase Read Inventory

> Generated: 2026-01-24  
> Purpose: Complete inventory of all Supabase queries touching questions/answers/solutions  
> Classification: exam-runtime | results-only | admin-only | scoring-only

---

## Summary

| Classification | Safe? | Notes |
|----------------|-------|-------|
| exam-runtime | ✅ | Must only read `questions_exam` or `question_sets_with_questions` |
| results-only | ✅ | Must use `fetch_attempt_solutions` RPC (gated) |
| admin-only | ✅ | Uses service-role client (`getAdminClient()` / `getServiceRoleClient()`) |
| scoring-only | ✅ | Uses service-role client server-side only |

---

## Detailed Callsite Inventory

### 1. Exam Runtime (MUST be safe views only)

| File | Function/Component | Server/Client | Table/View/RPC | Columns | Classification | Boundary risk | Status |
|------|-------------------|---------------|----------------|---------|----------------|---------------|--------|
| `src/features/exam-engine/lib/actions.ts` | `fetchPaperForExam()` | Server (`'use server'`) | `questions_exam` | `*` (safe view) | exam-runtime | None | ✅ SAFE |
| `src/features/exam-engine/lib/actions.ts` | `fetchPaperForExam()` | Server (`'use server'`) | `question_sets` | `id, display_order` | exam-runtime | None | ✅ SAFE (non-sensitive cols) |
| `src/features/exam-engine/lib/actions.ts` | `saveResponse()` | Server (`'use server'`) | `questions_exam` | `id, paper_id` | exam-runtime | None | ✅ SAFE |
| `src/app/exam/[attemptId]/page.tsx` | Server Component | Server | `questions_exam` | `*` (safe view) | exam-runtime | None | ✅ SAFE |
| `src/app/exam/[attemptId]/ExamClient.tsx` | `ExamClient` | Client | imports `@/features/exam-engine/lib/actions` | N/A | exam-runtime | client imports server-actions module that also defines service-role helper | ⚠️ REVIEW (client ↔ server boundary) |

### 2. Results (MUST use gated RPC only)

| File | Function/Component | Server/Client | Table/View/RPC | Columns | Classification | Boundary risk | Status |
|------|-------------------|---------------|----------------|---------|----------------|---------------|--------|
| `src/features/exam-engine/lib/actions.ts` | `fetchExamResults()` | Server (`'use server'`) | `questions_exam` + `fetch_attempt_solutions` RPC | safe view + RPC solutions | results-only | None | ✅ SAFE |
| `src/app/result/[attemptId]/page.tsx` | Server Component | Server | calls `fetchExamResults()` | via action | results-only | None | ✅ SAFE |

### 3. Scoring (service-role only)

| File | Function/Component | Server/Client | Table/View/RPC | Columns | Classification | Boundary risk | Status |
|------|-------------------|---------------|----------------|---------|----------------|---------------|--------|
| `src/features/exam-engine/lib/actions.ts` | `submitExam()` | Server (`'use server'`) | `questions` via service-role client | `*` (includes `correct_answer`) | scoring-only | None | ✅ SAFE (service-role) |

### 4. Admin (service-role only)

| File | Function/Component | Server/Client | Table/View/RPC | Columns | Classification | Boundary risk | Status |
|------|-------------------|---------------|----------------|---------|----------------|---------------|--------|
| `src/app/admin/papers/[paperId]/edit/page.tsx` | Server Component | Server | `questions` via `getAdminClient()` | `*` (includes `correct_answer`) | admin-only | None | ✅ SAFE (service-role) |
| `src/app/admin/papers/[paperId]/edit/actions.ts` | `saveQuestion()`, `deleteQuestion()`, etc. | Server (`'use server'`) | `questions` via `getAdminClient()` | `*` | admin-only | None | ✅ SAFE (service-role) |
| `src/app/admin/questions/new/page.tsx` | Server Component | Server | `questions` (insert only) | insert columns | admin-only | None | ✅ SAFE |
| `src/app/admin/questions/page.tsx` | Server Component | Server | `questions` via service-role (SUPABASE_SERVICE_ROLE_KEY) | `*` (includes `correct_answer`) | admin-only | None | ✅ SAFE (service-role) |
| `src/app/admin/page.tsx` | Server Component | Server | `questions` | `id` (count only) | admin-only | None | ✅ SAFE (count only) |
| `src/app/api/admin/question-sets/route.ts` | API Route | Server | `questions`, `question_sets`, `question_sets_with_questions` | various | admin-only | None | ⚠️ REVIEW (uses user-session for some) |

### 5. Question Sets Views

| File | Function/Component | Server/Client | Table/View/RPC | Columns | Classification | Boundary risk | Status |
|------|-------------------|---------------|----------------|---------|----------------|---------------|--------|
| `src/app/api/admin/question-sets/route.ts` | GET | Server | `question_sets_with_questions` | `*` | admin-only | None | ✅ SAFE (view excludes solutions) |

### 6. Mutation Surfaces (API Routes)

| File | Function/Component | Server/Client | Table/View/RPC | Columns | Classification | Boundary risk | Status |
|------|-------------------|---------------|----------------|---------|----------------|---------------|--------|
| `src/app/api/save/route.ts` | POST | Server | `responses` + `validate_session_token` RPC | `attempt_id, question_id, answer` | mutation-surface | None | ✅ SAFE (uses RPC; reads attempts.session_token) |

---

## Sensitive Column References

The following columns are sensitive and must NEVER appear in exam-runtime reads:

- `correct_answer`
- `solution_text`
- `solution_image_url`
- `video_solution_url`

### Files referencing sensitive columns (expected admin/results/scoring contexts):

| File | Context | Status |
|------|---------|--------|
| `src/features/exam-engine/lib/actions.ts` | `submitExam()` scoring (service-role) | ✅ OK |
| `src/features/exam-engine/lib/actions.ts` | `fetchExamResults()` via RPC | ✅ OK |
| `src/app/result/[attemptId]/page.tsx` | Results display | ✅ OK |
| `src/features/admin/ui/EditableExamLayout.tsx` | Admin editor | ✅ OK |
| `src/features/admin/ui/EditableQuestion.tsx` | Admin editor | ✅ OK |
| `src/app/admin/questions/new/page.tsx` | Admin create | ✅ OK |
| `src/app/admin/question-sets/new/NewQuestionSetClient.tsx` | Admin create | ✅ OK |
| `src/features/exam-engine/ui/QuestionAnalysis.tsx` | Results analysis | ✅ OK |
| `src/types/exam.ts` | Type definitions | ✅ OK |

---

## `.select('*')` Usage Audit

| File | Table/View | Classification | Status |
|------|------------|----------------|--------|
| `src/features/exam-engine/lib/actions.ts:81` | `papers` | exam-runtime | ✅ OK (no sensitive cols) |
| `src/features/exam-engine/lib/actions.ts:94` | `questions_exam` | exam-runtime | ✅ OK (safe view) |
| `src/features/exam-engine/lib/actions.ts:142` | `attempts` | exam-runtime | ✅ OK (no sensitive cols) |
| `src/features/exam-engine/lib/actions.ts:567` | `questions` | scoring-only | ✅ OK (service-role) |
| `src/features/exam-engine/lib/actions.ts:702` | `attempts` | results-only | ✅ OK (no sensitive cols) |
| `src/features/exam-engine/lib/actions.ts:722` | `questions_exam` | results-only | ✅ OK (safe view) |
| `src/app/exam/[attemptId]/page.tsx:103` | `questions_exam` | exam-runtime | ✅ OK (safe view) |
| `src/app/api/admin/question-sets/route.ts:142` | `question_sets_with_questions` | admin-only | ✅ OK (safe view) |
| `src/app/admin/papers/page.tsx:15` | `papers` | admin-only | ✅ OK (no sensitive cols) |

---

## Verification Checklist

- [x] All exam-runtime reads use `questions_exam` (safe view)
- [x] All results reads use `fetch_attempt_solutions` RPC
- [x] All scoring reads use service-role client
- [x] All admin reads use service-role client OR safe views
- [x] No client components import service-role helpers
- [x] No `.from('questions')` in exam-runtime paths (except via service-role)

---

## Remediation Notes

1. **`src/app/admin/questions/page.tsx`**: Uses user-session client to read questions. Since column-level revokes are in place, this will fail for `correct_answer`/`solution_*`. Either:
   - Change to use service-role via server action, OR
   - Explicitly select only safe columns

2. **`src/app/api/admin/question-sets/route.ts`**: Some operations use user-session. Admin API routes should use service-role for any writes/reads needing privileged columns.

---

*End of Audit*
````

## File: docs/BUG_REPRO_CHECKLIST.md
````markdown
# Bug Reproduction Checklist

> **Phase 0 Safety Rails**: Use this checklist to verify fixes before and after each change.

---

## Issue 1: Mock Test Session Logic (Resume vs Restart)

### Description
When a user clicks "Take Free Mock" button, if a mock is already in progress, the session restarts from the beginning instead of continuing where they left off.

### Reproduction Steps
1. Start a mock test and answer a few questions (e.g., Q1-Q5)
2. Navigate to Q10 in VARC section
3. Close the browser tab (do NOT submit)
4. Click "Take Free Mock" button again for the same paper
5. **Expected**: Resume at Q10 in VARC section
6. **Actual (Bug)**: Starts from Q1, section 0

### Verification Checklist
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Check for `cat-exam-state-{attemptId}` key (NOT `cat-exam-state-temp`)
- [ ] Verify `currentSectionIndex` and `currentQuestionIndex` are preserved
- [ ] Enable `NEXT_PUBLIC_EXAM_DEBUG=true` and check console for resume logs

---

## Issue 2: TITA Double-Fire / Duplicate Script Execution

### Description
TITA (Type In The Answer) questions have a script/event that fires twice, causing duplicate behavior.

### Reproduction Steps
1. Navigate to a TITA question (non-MCQ)
2. Open browser DevTools → Console
3. Click a digit on the keypad (e.g., "5")
4. **Expected**: Single digit appears, single store update
5. **Actual (Bug)**: Console shows duplicate logs, or digit appears twice

### Potential Causes (Investigate)
- [ ] MathText component re-mounting/double-executing useEffect
- [ ] React StrictMode double-invoking effects
- [ ] Keypad onClick firing multiple times
- [ ] useEffect sync loop in TITARenderer

### Verification Checklist
- [ ] Check console for "EXAM_DEBUG: TITA keypad input" logs
- [ ] Verify single log per keypress
- [ ] Check React DevTools for component re-mounts

---

## Issue 3: Mark for Review & Next Behavior

### Description
"Mark for Review & Next" button behaves as if user selected an option even when they haven't. Need 5th status category: "Attempted & Marked".

### Current Status Categories
1. ✅ Answered (green, hexagon-up)
2. ✅ Not Answered/Visited (red, hexagon-down)
3. ✅ Not Visited (gray, square)
4. ✅ Marked for Review (purple, circle)
5. ❌ **Attempted & Marked** (purple circle with checkmark - maps to `answered_marked`)

### Reproduction Steps
1. Navigate to Q1 (fresh, not visited before)
2. Do NOT select any option
3. Click "Mark for Review & Next"
4. **Expected**: Q1 status = `marked`, answer = null
5. **Actual (Bug)**: Q1 status may incorrectly show as `answered_marked`

### Test Matrix
| Starting State | Action | Expected Status | Expected Answer |
|----------------|--------|-----------------|-----------------|
| not_visited | Mark & Next | marked | null |
| visited (no answer) | Mark & Next | marked | null |
| answered | Mark & Next | answered_marked | preserved |
| marked | Unmark | visited | null |
| answered_marked | Unmark | answered | preserved |

### Verification Checklist
- [ ] Check palette color matches expected status
- [ ] Verify answer persistence via DevTools/Network tab
- [ ] Enable debug logging and check status transitions

---

## Issue 4: Quant Section Submission Failure

### Description
Students cannot submit the exam in the Quant (QA) section. After clicking "Submit", an "OK" warning appears, then "Failed to submit, try again" error.

### Reproduction Steps
1. Complete all sections (VARC, DILR, QA)
2. Navigate to last question in QA section
3. Click "Submit Exam"
4. Confirm in any warning dialog
5. **Expected**: Redirects to results page
6. **Actual (Bug)**: Error message "Failed to submit exam. Please try again."

### Potential Causes (Investigate)
- [ ] Session token mismatch (regenerated on resume)
- [ ] API validation error (check Network tab for response)
- [ ] Promise.all save failures blocking submit
- [ ] Backend section validation rules

### Verification Checklist
- [ ] Open DevTools → Network tab
- [ ] Check `/api/exam/submit` response for error details
- [ ] Verify sessionToken in request matches stored token
- [ ] Check for SESSION_CONFLICT error code
- [ ] Enable debug logging and check submission flow

---

## Debug Mode Instructions

### Enabling Debug Logging
Set in `.env.local`:
```bash
NEXT_PUBLIC_EXAM_DEBUG=true
```

### Debug Log Outputs
With debug mode enabled, check console for:
- `[EXAM_DEBUG] Store initialized` - attemptId, storeName, sessionToken
- `[EXAM_DEBUG] Navigation` - sectionIndex, questionIndex
- `[EXAM_DEBUG] Response status change` - questionId, oldStatus, newStatus
- `[EXAM_DEBUG] TITA input` - key pressed, new value
- `[EXAM_DEBUG] Submit attempt` - attemptId, sessionToken, submissionId

### LocalStorage Keys to Monitor
- `cat-exam-state-{attemptId}` - Correct per-attempt state
- `cat-exam-state-temp` - ⚠️ Should NOT exist for real attempts

---

## Quick Verification Commands

```bash
# Check localStorage in browser console
localStorage.getItem('cat-exam-state-temp')  // Should be null for real attempts
Object.keys(localStorage).filter(k => k.startsWith('cat-exam-state'))

# Force clear all exam state (for testing)
Object.keys(localStorage).filter(k => k.startsWith('cat-exam-state')).forEach(k => localStorage.removeItem(k))
```
````

## File: docs/bug-repro.md
````markdown
# Bug Repro Steps (Phase 0)

Keep these steps up to date so regressions are easy to spot.

## Editor refresh bug

Scenario: “Edit Q → refresh → jumps to VARC Q1”.

Steps:
1. Open the admin editor for any paper.
2. Navigate to a non-VARC section (e.g., DILR) and open a question that is not Q1.
3. Make a small edit (e.g., add a space and remove it).
4. Refresh the page.

Expected:
- Editor stays on the same section and question.

Observed bug:
- Editor jumps back to VARC, Q1.

## Freeze bug

Scenario: “Do X → UI freezes (Editor + Preview)”.

Steps:
1. Open the admin editor for any paper.
2. Rapidly change sections and questions (palette clicks + section tab changes).
3. Keep typing in the editor for 10–20 seconds.

Expected:
- UI remains responsive; no long stalls.

Observed bug:
- Editor and preview freeze or become unresponsive.

## Duplication bug

Scenario: “Edit Q text (delete + rewrite) → Preview/Mock shows old + new”.

Steps:
1. Open the admin editor for any paper.
2. Select a question with text in the stem.
3. Delete the entire question text and retype a new sentence.
4. Open Admin Preview or Mock view for the same paper.

Expected:
- Preview/Mock shows only the new text.

Observed bug:
- Preview/Mock shows both the old and new text.
````

## File: docs/CONTENT-SCHEMA.md
````markdown
# CONTENT-SCHEMA

## Schema v3.0 (Sets-First)

Schema v3.0 mirrors the actual DB architecture: `question_sets` are the parent containers, and `questions` are children that reference sets via `set_ref`.

### Root Structure

```json
{
  "schema_version": "v3.0",
  "paper": { ... },
  "question_sets": [ ... ],
  "questions": [ ... ]
}
```

### Key Concepts

1. **Sets are inserted FIRST** — the importer creates all `question_sets` before any questions
2. **Questions link via `set_ref`** — each question's `set_ref` must match a `client_set_id` in `question_sets[]`
3. **Deterministic linking** — no text matching or UUID guessing; explicit client IDs

### `question_sets[]` Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `client_set_id` | string | Stable ID (e.g., `VARC_RC_1`, `DILR_SET_3`). Pattern: `^[A-Z0-9_]+$` |
| `section` | enum | `VARC`, `DILR`, or `QA` |
| `set_type` | enum | `VARC`, `DILR`, `CASELET`, or `ATOMIC` |
| `display_order` | integer | Order within section (for deterministic export) |
| `context_body` | string | **Required** for `VARC`/`DILR`/`CASELET`. The passage/data content. |

Optional: `context_title`, `context_image_url`, `context_type`, `content_layout`, `metadata`

### `questions[]` Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `client_question_id` | string | Stable ID (e.g., `Q1`, `VARC_RC1_Q3`). Unique within paper. |
| `set_ref` | string | Must match a `client_set_id` in `question_sets[]` |
| `sequence_order` | integer | Order within the set (1-based) |
| `question_number` | integer | Global question number in paper |
| `question_text` | string | The question content |
| `question_type` | enum | `MCQ` or `TITA` |

MCQ questions must also include `options[]` array.

### Example (minimal)

```json
{
  "schema_version": "v3.0",
  "paper": {
    "title": "CAT 2024 Mock",
    "slug": "cat-2024-mock"
  },
  "question_sets": [
    {
      "client_set_id": "VARC_RC_1",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 1,
      "context_body": "Reading passage text here..."
    },
    {
      "client_set_id": "QA_ATOMIC_1",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 1
    }
  ],
  "questions": [
    {
      "client_question_id": "Q1",
      "set_ref": "VARC_RC_1",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 1,
      "question_text": "What is the main idea?",
      "question_type": "MCQ",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" }
      ],
      "correct_answer": "A"
    },
    {
      "client_question_id": "Q2",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 2,
      "question_text": "Find the value of x if $x^2 = 16$",
      "question_type": "TITA",
      "correct_answer": "4"
    }
  ]
}
```

### Full Schema Reference

See: `schemas/paper_schema_v3.json`

See: `data_sanitized/paper_schema_v3.template.json` (full example)

### How to Import v3

**CLI Import (Recommended for bulk imports):**
```bash
# Dry run to validate without writing
node scripts/import-paper-v3.mjs path/to/paper.json --dry-run

# Import as draft
node scripts/import-paper-v3.mjs path/to/paper.json

# Import and publish immediately
node scripts/import-paper-v3.mjs path/to/paper.json --publish

# Skip if identical JSON already imported
node scripts/import-paper-v3.mjs path/to/paper.json --skip-if-duplicate

# With notes
node scripts/import-paper-v3.mjs path/to/paper.json --notes "Initial import"

# Upsert mode (requires migration 008 semantic keys)
node scripts/import-paper-v3.mjs path/to/paper.json --upsert
```

**Admin UI Import:**
1. Navigate to `/admin/papers`
2. Click the green "Import JSON" button
3. Select options (publish, skip duplicates, notes)
4. Upload your Schema v3.0 JSON file
5. Review the import result

**API Import:**
```bash
curl -X POST /api/admin/papers/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "data": { /* Schema v3.0 payload */ },
    "publish": false,
    "skipIfDuplicate": true,
    "notes": "API import"
  }'
```

### Semantic Keys (Migration 008)

For idempotent imports (upsert mode), apply migration 008:

| Table | Column | Description |
|-------|--------|-------------|
| `papers` | `paper_key` | Global unique key (defaults to slug) |
| `question_sets` | `client_set_id` | Unique within paper |
| `questions` | `client_question_id` | Unique within paper |

With semantic keys, re-importing the same paper updates existing records instead of duplicating.

---

## Common Fields

### Formatting
- Math content uses KaTeX inline `$...$` and block `$$...$$` notation.
- Rich text stays Markdown-compatible for bold, italics, and ordered or unordered lists.

### Assets & Delivery
- Store diagrams and images in Supabase Storage with signed URLs; record paths within `assets[]`.
- Attach fallback copies under `docs/assets/*` if external sources become private.

### Taxonomy Types (Optional)

Common values for `taxonomy_type`:

**VARC:**
- `rc_main_idea`, `rc_inference`, `rc_tone`, `rc_vocab_in_context`
- `para_jumble`, `para_summary`, `odd_sentence`

**DILR:**
- `di_table_analysis`, `di_chart`, `di_caselets`
- `lr_arrangement`, `lr_puzzles`, `lr_syllogism`

**QA:**
- `arithmetic_percentages`, `arithmetic_profit_loss`, `arithmetic_time_work`
- `algebra_equations`, `algebra_inequalities`
- `geometry_triangles`, `geometry_circles`
- `number_theory_divisibility`, `modern_math_permutations`
````

## File: docs/DECISIONS.md
````markdown
# DECISIONS.md – Architecture & SSOT Freeze (v0.1)

## Changelog

### 2026-01-24: Phase A/B Security Verification (Runtime Reads + RBAC Hook)
- **Verified**: Runtime read paths only use safe view `questions_exam` for exam fetches and result rendering.
	- Evidence: `fetchPaperForExam()` and `fetchExamResults()` in [src/features/exam-engine/lib/actions.ts](src/features/exam-engine/lib/actions.ts)
	- Evidence: Exam page uses `questions_exam` in [src/app/exam/[attemptId]/page.tsx](src/app/exam/[attemptId]/page.tsx)
- **Verified**: Results are gated via `fetch_attempt_solutions` RPC and only consumed through `fetchExamResults()`.
	- Evidence: RPC definition in [docs/migrations/004_fetch_attempt_solutions.sql](docs/migrations/004_fetch_attempt_solutions.sql)
	- Evidence: Results page in [src/app/result/[attemptId]/page.tsx](src/app/result/[attemptId]/page.tsx)
- **Verified**: RBAC hook enablement checklist documented and current.
	- Evidence: RBAC hook verification steps in [docs/BLUEPRINT.md](docs/BLUEPRINT.md)
	- Evidence: Auth hook function + grants in [docs/MIGRATION_M6_RBAC.sql](docs/MIGRATION_M6_RBAC.sql)

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

## File: docs/landing-page.md
````markdown
# Landing v2 integration note (Phase 0)

## Current landing entry + structure
- Route entry: `src/app/page.tsx`
  - Static, Tailwind-classed sections only (hero + features + how-it-works + testimonials + FAQ + footer).
  - No dynamic image loading; everything is hardcoded in JSX.
- App shell: `src/app/layout.tsx`
  - Global styles via Tailwind (`src/app/globals.css`).
  - KaTeX CSS is globally included.
- Styling system: Tailwind utility classes (no component library). A `src/app/page.module.css` exists but is not used in `src/app/page.tsx`.

## Auth modal location (current)
- There is **no auth modal** today.
- Sign-in is a dedicated page: `src/app/auth/sign-in/page.tsx` (Google OAuth only).
- Test login page: `src/app/auth/test-login/page.tsx`.

## Admin content ingestion (current)
- Admin RBAC + routing: `src/app/admin/layout.tsx` (JWT claims + RPC fallback, with DEV skip).
- Paper ingestion UI: `src/app/admin/papers/ImportPaperButton.tsx`.
- Paper ingestion API: `src/app/api/admin/papers/import/route.ts`.
- Admin editor UIs (context/questions) with image upload:
  - `src/features/admin/ui/EditableExamLayout.tsx`
  - `src/features/admin/ui/EditableQuestion.tsx`
- Image upload helper: `src/lib/cloudinary.ts` (Cloudinary unsigned upload).

## What we can safely extend (no refactor)
- Add landing assets DB layer + admin UI in **new** routes (e.g., `src/app/admin/landing-assets/*`) using existing admin RBAC in `src/app/admin/layout.tsx`.
- Reuse the image upload pattern from `src/lib/cloudinary.ts` or add a Supabase Storage variant in parallel (no changes to existing exam editor flows).
- Update `src/app/page.tsx` to consume a new `getLandingAssets()` data source (server-side or client hydration) while keeping current sections intact.
- Add a new “Auth modal” component that wraps the existing Google OAuth call from `src/app/auth/sign-in/page.tsx`.

## What we should NOT refactor right now
- Do not restructure the Next.js route layout (keep landing at `src/app/page.tsx`).
- Do not change existing admin RBAC logic (keep `src/app/admin/layout.tsx`).
- Do not rewrite the exam admin upload/ingest pipeline.

## Minimal extension plan (Phase 1 readiness)
- Add a new `landing_assets` table + storage prefix and a typed client util.
- Add admin UI for replacing landing assets using the existing admin surface + auth.
- Wire landing sections in `src/app/page.tsx` to the new assets map.

Acceptance checklist
- Landing v2 work can proceed by **adding** components/utilities without touching existing exam/admin flow.
- File paths above are the safe entry points for the PRD requirements.

## Phase 2 update log
- Added admin panel: `src/app/admin/landing-page/page.tsx`
- Client UI for drag/drop asset replacement: `src/app/admin/landing-page/LandingAssetsClient.tsx`
- Navigation entry: `src/app/admin/layout.tsx` (Landing Page link)

## Phase 3/4 update log
- Landing UI refactor: src/components/landing/LandingPageClient.tsx (hero, mentor, roadmap, feature showcase, CAT hub, footer).
- Landing route now wraps the client component: src/app/page.tsx.
- Dynamic images wired via useLandingAssets with skeleton placeholders and safe fallbacks.
- Mobile drawer and auth modal (Google-only) with focus trap and ESC close.
- Added landing-specific keyframes for subtle motion in src/app/globals.css.

## Phase 5 update log
- Updated AuthModal copy to "Claim Early Access" with Google-only primary CTA and INR value nudge.
- Added localStorage flag `first_login_banner_eligible` before OAuth redirect.

## Phase 6 update log
- Mentor spotlight bubble now delayed (3s) with localStorage guard and mobile tap reveal.
- Added hover capability detection helper and quote placeholder TODO.

## Phase 7/8 update log
- Added authenticated overlays with early access banner gating (first 3 sessions) and bug report FAB.
- Bug report modal submits to bug_reports with optional screenshot uploads to bug-screenshots.
- Added shared focus trap hook in src/components/useFocusTrap.ts.

## Phase 9 update log
- Added CAT info hub mini-nav with scroll-to-section buttons and accordion panels.
- Added back-to-top button that appears after the hero section.
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
WITH CHECK (
  auth.uid() = user_id
  AND status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
  AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
  AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
);

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
    WHERE user_id = auth.uid()
      AND status IN ('submitted', 'completed')
      AND submitted_at IS NOT NULL
  )
);

-- -----------------------------------------------------------------------------
-- SECTION 5.5: Legacy scoring cleanup (optional, after verification)
-- -----------------------------------------------------------------------------
-- If TypeScript scoring is the single source of truth, retire legacy DB scoring.
-- Checklist before dropping:
-- 1) Confirm no API route, trigger, or cron calls public.finalize_attempt
-- 2) Confirm results page uses fetch_attempt_solutions RPC + questions_exam
-- 3) Confirm scoring happens only in TypeScript submit path
--
-- DROP FUNCTION IF EXISTS public.finalize_attempt(UUID);

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

-- -----------------------------------------------------------------------------
-- VERIFICATION SQL (RLS safety check)
-- -----------------------------------------------------------------------------
-- 1) Should return rows for a submitted/completed attempt:
-- SELECT q.id
-- FROM public.questions q
-- WHERE q.paper_id IN (
--   SELECT paper_id FROM public.attempts
--   WHERE user_id = auth.uid()
--     AND status IN ('submitted','completed')
--     AND submitted_at IS NOT NULL
-- );

-- 2) Should return 0 rows for an in_progress attempt:
-- SELECT q.id
-- FROM public.questions q
-- WHERE q.paper_id IN (
--   SELECT paper_id FROM public.attempts
--   WHERE user_id = auth.uid()
--     AND status = 'in_progress'
-- );

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
        CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'editor', 'dev');
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
            WHERE user_id = auth.uid() AND role IN ('admin', 'dev')
        )
    );

-- Policy: Admins can insert new roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'dev')
        )
    );

-- Policy: Admins can update roles (except their own admin role)
CREATE POLICY "Admins can update roles" ON public.user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'dev')
        )
        AND user_id != auth.uid() -- Cannot modify own role
    );

-- Policy: Admins can delete roles (except their own)
CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'dev')
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
SET search_path = public, pg_catalog
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
SET search_path = public, pg_catalog
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
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

CREATE POLICY "Admins can update papers" ON public.papers
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

CREATE POLICY "Admins can delete papers" ON public.papers
    FOR DELETE USING (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

-- Questions: Admins can manage all questions
CREATE POLICY "Admins can insert questions" ON public.questions
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

CREATE POLICY "Admins can update questions" ON public.questions
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

CREATE POLICY "Admins can delete questions" ON public.questions
    FOR DELETE USING (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

-- Admins can view ALL questions (including inactive ones)
CREATE POLICY "Admins can view all questions" ON public.questions
    FOR SELECT USING (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
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
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

CREATE POLICY "Admins can insert contexts" ON public.question_contexts
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

CREATE POLICY "Admins can update contexts" ON public.question_contexts
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

CREATE POLICY "Admins can delete contexts" ON public.question_contexts
    FOR DELETE USING (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
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
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

-- System/admin can insert logs
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_log
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role') IN ('admin', 'dev')
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'dev')
    );

-- ============================================================================
-- STEP 8: Helper function to check admin status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'dev')
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
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
DROP POLICY IF EXISTS "Users can read questions for their completed attempts" ON public.questions;

-- ============================================================================
-- STEP 2: CREATE UPDATED RLS POLICIES
-- ============================================================================

-- Papers: Now checks published + availability window
CREATE POLICY "Authenticated users can view available papers" ON public.papers
  FOR SELECT TO authenticated 
  USING (
    -- Admins can see everything
    public.is_admin()
    OR (
      -- Published papers within availability window
      published = true
      AND (available_from IS NULL OR available_from <= NOW())
      AND (available_until IS NULL OR available_until >= NOW())
    )
  );

-- Questions: Only allow reads after submission/completion (prevents in-progress leaks)
CREATE POLICY "Users can read questions for their completed attempts" ON public.questions
  FOR SELECT TO authenticated 
  USING (
    is_active = true
    AND paper_id IN (
      SELECT paper_id FROM public.attempts
      WHERE user_id = auth.uid()
        AND status IN ('submitted', 'completed')
        AND submitted_at IS NOT NULL
    )
  );

-- ============================================================================
-- STEP 3: CREATE SECURE VIEWS
-- ============================================================================

-- Drop views if they exist (for idempotent migration)
DROP VIEW IF EXISTS public.questions_exam CASCADE;
DROP VIEW IF EXISTS public.questions_with_solutions CASCADE;

-- ============================================================================
-- NOTE: questions_exam view is created in STEP 4.5 with security_invoker
-- This ensures RLS policies are enforced when querying through the view
-- ============================================================================

-- View for results/solutions: questions WITH answers (for post-submission review)
-- NOTE: This view is NOT granted to any role - use fetch_attempt_solutions RPC instead
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
  set_id,
  sequence_order,
  difficulty,
  topic,
  subtopic
FROM public.questions
WHERE is_active = true;

-- Do NOT grant solutions view to authenticated users; results must use RPC
REVOKE ALL ON public.questions_with_solutions FROM PUBLIC;
REVOKE ALL ON public.questions_with_solutions FROM anon;
REVOKE ALL ON public.questions_with_solutions FROM authenticated;

-- ============================================================================
-- STEP 3.5: COLUMN-LEVEL LOCKDOWN (Pattern A - required)
-- Prevent direct SELECT of sensitive fields from public.questions
-- NOTE: After revokes, SELECT * on public.questions by authenticated will fail.
-- Runtime must use public.questions_exam; solutions must use RPC.
-- ============================================================================

REVOKE SELECT (correct_answer, solution_text, solution_image_url, video_solution_url)
ON public.questions FROM PUBLIC;
REVOKE SELECT (correct_answer, solution_text, solution_image_url, video_solution_url)
ON public.questions FROM anon;
REVOKE SELECT (correct_answer, solution_text, solution_image_url, video_solution_url)
ON public.questions FROM authenticated;

-- ============================================================================
-- STEP 4: question_sets_with_questions safe view (published only + no answers)
-- ============================================================================

-- Drop and recreate to ensure it excludes sensitive fields and enforces published-only
DROP VIEW IF EXISTS public.question_sets_with_questions CASCADE;

CREATE VIEW public.question_sets_with_questions
WITH (security_invoker = true)
AS
SELECT 
    qs.id,
    qs.paper_id,
    qs.section,
    qs.set_type,
    qs.content_layout,
    qs.context_title,
    qs.context_body,
    qs.context_image_url,
    qs.context_additional_images,
    qs.display_order,
    qs.question_count,
    qs.metadata,
    qs.is_active,
    qs.is_published,
    qs.created_at,
    qs.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', q.id,
                'question_text', q.question_text,
                'question_type', q.question_type,
                'options', q.options,
                'positive_marks', q.positive_marks,
                'negative_marks', q.negative_marks,
                'question_number', q.question_number,
                'sequence_order', q.sequence_order,
                'question_image_url', q.question_image_url,
                'difficulty', q.difficulty,
                'topic', q.topic,
                'subtopic', q.subtopic,
                'is_active', q.is_active
                -- EXCLUDED: correct_answer, solution_text, solution_image_url, video_solution_url
            ) ORDER BY q.sequence_order
        ) FILTER (WHERE q.id IS NOT NULL),
        '[]'::json
    ) AS questions
FROM public.question_sets qs
LEFT JOIN public.questions q ON q.set_id = qs.id AND q.is_active = TRUE
WHERE qs.is_active = TRUE
  AND qs.is_published = TRUE
  AND qs.paper_id IN (SELECT id FROM public.papers WHERE published = TRUE)
GROUP BY qs.id;

-- Grant SELECT to authenticated only
REVOKE ALL ON public.question_sets_with_questions FROM PUBLIC;
REVOKE ALL ON public.question_sets_with_questions FROM anon;
GRANT SELECT ON public.question_sets_with_questions TO authenticated;

-- ============================================================================
-- STEP 4.5: Recreate questions_exam with security_invoker (Postgres 15+)
-- ============================================================================

DROP VIEW IF EXISTS public.questions_exam CASCADE;

CREATE VIEW public.questions_exam
WITH (security_invoker = true)
AS
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
  set_id,
  sequence_order,
  difficulty,
  topic,
  subtopic,
  is_active,
  created_at,
  updated_at
  -- EXCLUDED: correct_answer, solution_text, solution_image_url, video_solution_url
FROM public.questions
WHERE is_active = true;

-- Grant SELECT to authenticated only
REVOKE ALL ON public.questions_exam FROM PUBLIC;
REVOKE ALL ON public.questions_exam FROM anon;
GRANT SELECT ON public.questions_exam TO authenticated;

-- ============================================================================
-- STEP 5: VERIFY MIGRATION
-- ============================================================================
-- Run these queries to verify the migration worked:

-- Check policies exist:
-- SELECT policyname FROM pg_policies WHERE tablename IN ('papers', 'questions');

-- Check views exist:
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'public';

-- Test questions_exam doesn't have correct_answer:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'questions_exam';

-- -----------------------------------------------------------------------------
-- VERIFICATION SQL (Answer Leak Prevention) — RUN IN SUPABASE SQL EDITOR
-- -----------------------------------------------------------------------------

-- TEST 1: Direct SELECT on sensitive columns MUST FAIL (column privilege denied)
-- As authenticated user (not service role):
-- SELECT correct_answer FROM public.questions LIMIT 1;
-- Expected: ERROR permission denied for column correct_answer

-- TEST 2: SELECT * on public.questions MUST FAIL
-- As authenticated user:
-- SELECT * FROM public.questions LIMIT 1;
-- Expected: ERROR permission denied (due to column revokes)

-- TEST 3: Safe view questions_exam works for in-progress attempts
-- As authenticated user with an in_progress attempt:
-- SELECT id, question_text, options FROM public.questions_exam WHERE paper_id = '<your_paper_id>' LIMIT 1;
-- Expected: SUCCESS, returns question without correct_answer

-- TEST 4: Safe view question_sets_with_questions works for published sets
-- As authenticated user:
-- SELECT id, context_title, questions FROM public.question_sets_with_questions WHERE paper_id = '<your_paper_id>' LIMIT 1;
-- Expected: SUCCESS, returns set with questions (no correct_answer in nested JSON)

-- TEST 5: RPC fetch_attempt_solutions works for completed attempts
-- As authenticated user with a submitted attempt:
-- SELECT public.fetch_attempt_solutions('<your_attempt_id>');
-- Expected: SUCCESS, returns JSON with correct_answer, solution_text, etc.

-- TEST 6: RPC fetch_attempt_solutions FAILS for in_progress attempts
-- As authenticated user with an in_progress attempt:
-- SELECT public.fetch_attempt_solutions('<your_in_progress_attempt_id>');
-- Expected: ERROR Attempt not submitted

-- ============================================================================
-- DONE! The migration is complete.
-- Run in Supabase SQL Editor as EXTERNAL WORK.
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
SET search_path = public, pg_catalog
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

-- Add pause control flag to papers
ALTER TABLE public.papers
ADD COLUMN IF NOT EXISTS allow_pause BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.papers.allow_pause IS 'Whether attempts on this paper can be paused/resumed';

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
SET search_path = public, pg_catalog
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
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_session_token UUID;
    v_current_token UUID;
    v_rows_updated INTEGER;
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

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    IF v_rows_updated = 0 THEN
        RAISE EXCEPTION 'Attempt not found or not in progress';
    END IF;

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
SET search_path = public, pg_catalog
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

-- Lock down attempt status transitions via PostgREST
-- Users can update progress fields only; status/submitted_at/completed_at must remain unchanged
DROP POLICY IF EXISTS "Users can update own attempts" ON public.attempts;
CREATE POLICY "Users can update own attempts" ON public.attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
        AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
        AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
    );

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

-- Drop dependent views BEFORE altering columns they depend on
DROP VIEW IF EXISTS public.questions_exam CASCADE;
DROP VIEW IF EXISTS public.question_sets_with_questions CASCADE;

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
-- NOTE: This is a LEGACY view definition. The canonical hardened view is in
-- docs/MIGRATION_RLS_VIEWS.sql (Phase C) which adds:
--   - security_invoker = true
--   - is_published = TRUE filter
--   - published papers filter
--   - excludes sensitive columns (correct_answer, solution_*)
-- Run Phase C migration AFTER this one to overwrite with secure version.
-- ============================================================================
DROP VIEW IF EXISTS public.question_sets_with_questions CASCADE;

-- Placeholder: Phase C will create the canonical secure view
-- CREATE VIEW public.question_sets_with_questions ... (see MIGRATION_RLS_VIEWS.sql)

-- ============================================================================
-- STEP 6: RLS Policies for question_sets
-- ============================================================================

-- Enable RLS
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read published question sets" ON public.question_sets;
DROP POLICY IF EXISTS "Admins can manage question sets" ON public.question_sets;

-- Public can read published sets from published papers
CREATE POLICY "Anyone can read published question sets" ON public.question_sets
    FOR SELECT
    USING (
        is_active = TRUE 
        AND is_published = TRUE
        AND paper_id IN (SELECT id FROM public.papers WHERE published = TRUE)
    );

-- Admins can do everything
CREATE POLICY "Admins can manage question sets" ON public.question_sets
    FOR ALL
    USING (
        public.is_admin()
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

## File: docs/migrations/004_fetch_attempt_solutions.sql
````sql
-- =============================================================================
-- MILESTONE 6: Results Gating RPC (Step 0.95)
-- =============================================================================
-- Adds a SECURITY DEFINER RPC to safely return solution fields for completed attempts
-- EXECUTE IN SUPABASE SQL EDITOR
-- =============================================================================

-- Drop existing function to allow updates
DROP FUNCTION IF EXISTS public.fetch_attempt_solutions(uuid);

CREATE FUNCTION public.fetch_attempt_solutions(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt record;
BEGIN
    SELECT id, user_id, status, submitted_at, paper_id
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status NOT IN ('submitted', 'completed') OR v_attempt.submitted_at IS NULL THEN
        RAISE EXCEPTION 'Attempt not submitted' USING ERRCODE = '42501';
    END IF;

    RETURN (
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'question_id', q.id,
                    'correct_answer', q.correct_answer,
                    'solution_text', q.solution_text,
                    'solution_image_url', q.solution_image_url,
                    'video_solution_url', q.video_solution_url
                )
                ORDER BY q.section, q.question_number
            ),
            '[]'::jsonb
        )
        FROM public.questions q
        WHERE q.paper_id = v_attempt.paper_id
          AND q.is_active = true
    );
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_attempt_solutions(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_attempt_solutions(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.fetch_attempt_solutions(uuid) TO authenticated;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
````

## File: docs/migrations/005_attempt_state_lockdown.sql
````sql
-- =============================================================================
-- MIGRATION 005: Attempt State Lockdown (Phase B Step 2.25)
-- =============================================================================
-- Prevents direct PostgREST mutation of server-authoritative fields.
-- All progress updates must go through the save_attempt_state RPC.
-- EXECUTE IN SUPABASE SQL EDITOR
-- =============================================================================

-- =============================================================================
-- STEP 1: Revoke UPDATE on server-authoritative columns from authenticated
-- =============================================================================
-- These columns can only be modified via SECURITY DEFINER functions.

REVOKE UPDATE (time_remaining, current_section, current_question, 
               last_activity_at, session_token)
ON public.attempts FROM authenticated;

-- Note: status, submitted_at, completed_at are already protected by RLS policy
-- in 002_session_locking.sql that requires they remain unchanged on UPDATE.

-- =============================================================================
-- STEP 2: Create save_attempt_state RPC (SECURITY DEFINER)
-- =============================================================================
-- Server-side only function for updating attempt progress.
-- Validates ownership and prevents time inflation.

DROP FUNCTION IF EXISTS public.save_attempt_state(uuid, jsonb, text, int, timestamptz);

CREATE OR REPLACE FUNCTION public.save_attempt_state(
    p_attempt_id uuid,
    p_time_remaining jsonb,
    p_current_section text,
    p_current_question int,
    p_client_now timestamptz DEFAULT NOW()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt record;
    v_stored_time_remaining jsonb;
    v_new_varc int;
    v_new_dilr int;
    v_new_qa int;
    v_stored_varc int;
    v_stored_dilr int;
    v_stored_qa int;
    v_tolerance int := 5; -- 5 second tolerance for network latency
BEGIN
    -- Fetch current attempt state
    SELECT id, user_id, status, time_remaining, started_at, paper_id
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate attempt exists
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    -- Validate ownership
    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Validate status
    IF v_attempt.status <> 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress' USING ERRCODE = '42501';
    END IF;

    -- Extract time values
    v_stored_time_remaining := v_attempt.time_remaining;
    
    v_new_varc := COALESCE((p_time_remaining->>'VARC')::int, 0);
    v_new_dilr := COALESCE((p_time_remaining->>'DILR')::int, 0);
    v_new_qa := COALESCE((p_time_remaining->>'QA')::int, 0);
    
    v_stored_varc := COALESCE((v_stored_time_remaining->>'VARC')::int, 0);
    v_stored_dilr := COALESCE((v_stored_time_remaining->>'DILR')::int, 0);
    v_stored_qa := COALESCE((v_stored_time_remaining->>'QA')::int, 0);

    -- Validate time_remaining cannot increase beyond stored + tolerance
    IF v_new_varc > v_stored_varc + v_tolerance 
       OR v_new_dilr > v_stored_dilr + v_tolerance 
       OR v_new_qa > v_stored_qa + v_tolerance THEN
        RAISE EXCEPTION 'Invalid timer state: time cannot increase' USING ERRCODE = '42501';
    END IF;

    -- Clamp to valid bounds (0 to stored value)
    v_new_varc := GREATEST(0, LEAST(v_new_varc, v_stored_varc));
    v_new_dilr := GREATEST(0, LEAST(v_new_dilr, v_stored_dilr));
    v_new_qa := GREATEST(0, LEAST(v_new_qa, v_stored_qa));

    -- Update the attempt
    UPDATE public.attempts
    SET 
        time_remaining = jsonb_build_object(
            'VARC', v_new_varc,
            'DILR', v_new_dilr,
            'QA', v_new_qa
        ),
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    -- Return updated state
    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'time_remaining', jsonb_build_object(
            'VARC', v_new_varc,
            'DILR', v_new_dilr,
            'QA', v_new_qa
        ),
        'current_section', p_current_section,
        'current_question', p_current_question,
        'last_activity_at', NOW()
    );
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.save_attempt_state(uuid, jsonb, text, int, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_attempt_state(uuid, jsonb, text, int, timestamptz) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_attempt_state(uuid, jsonb, text, int, timestamptz) TO authenticated;

-- =============================================================================
-- STEP 3: Create pause_exam_state RPC (SECURITY DEFINER)
-- =============================================================================
-- Dedicated RPC for pausing exams with server-calculated time.

DROP FUNCTION IF EXISTS public.pause_exam_state(uuid, text, int);

CREATE OR REPLACE FUNCTION public.pause_exam_state(
    p_attempt_id uuid,
    p_current_section text,
    p_current_question int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt record;
    v_paper record;
    v_elapsed_seconds int;
    v_section_durations jsonb;
    v_varc_duration int;
    v_dilr_duration int;
    v_qa_duration int;
    v_remaining_elapsed int;
    v_calc_varc int;
    v_calc_dilr int;
    v_calc_qa int;
BEGIN
    -- Fetch attempt
    SELECT id, user_id, status, started_at, paper_id
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status <> 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress' USING ERRCODE = '42501';
    END IF;

    -- Fetch paper to check allow_pause and get section durations
    SELECT id, allow_pause, sections
    INTO v_paper
    FROM public.papers
    WHERE id = v_attempt.paper_id;

    IF v_paper.id IS NULL THEN
        RAISE EXCEPTION 'Paper not found' USING ERRCODE = 'P0002';
    END IF;

    IF NOT COALESCE(v_paper.allow_pause, false) THEN
        RAISE EXCEPTION 'Pause is not allowed for this paper' USING ERRCODE = '42501';
    END IF;

    -- Calculate elapsed time
    v_elapsed_seconds := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_attempt.started_at))::int);

    -- Get section durations (default 40 min = 2400 sec each)
    v_varc_duration := 2400;
    v_dilr_duration := 2400;
    v_qa_duration := 2400;

    IF v_paper.sections IS NOT NULL AND jsonb_array_length(v_paper.sections) > 0 THEN
        SELECT COALESCE((elem->>'time')::int * 60, 2400)
        INTO v_varc_duration
        FROM jsonb_array_elements(v_paper.sections) AS elem
        WHERE elem->>'name' = 'VARC'
        LIMIT 1;

        SELECT COALESCE((elem->>'time')::int * 60, 2400)
        INTO v_dilr_duration
        FROM jsonb_array_elements(v_paper.sections) AS elem
        WHERE elem->>'name' = 'DILR'
        LIMIT 1;

        SELECT COALESCE((elem->>'time')::int * 60, 2400)
        INTO v_qa_duration
        FROM jsonb_array_elements(v_paper.sections) AS elem
        WHERE elem->>'name' = 'QA'
        LIMIT 1;
    END IF;

    -- Calculate remaining time per section based on elapsed
    v_remaining_elapsed := v_elapsed_seconds;

    -- VARC
    IF v_remaining_elapsed >= v_varc_duration THEN
        v_calc_varc := 0;
        v_remaining_elapsed := v_remaining_elapsed - v_varc_duration;
    ELSE
        v_calc_varc := v_varc_duration - v_remaining_elapsed;
        v_remaining_elapsed := 0;
    END IF;

    -- DILR
    IF v_remaining_elapsed >= v_dilr_duration THEN
        v_calc_dilr := 0;
        v_remaining_elapsed := v_remaining_elapsed - v_dilr_duration;
    ELSE
        v_calc_dilr := v_dilr_duration - v_remaining_elapsed;
        v_remaining_elapsed := 0;
    END IF;

    -- QA
    IF v_remaining_elapsed >= v_qa_duration THEN
        v_calc_qa := 0;
    ELSE
        v_calc_qa := v_qa_duration - v_remaining_elapsed;
    END IF;

    -- Update attempt with server-calculated time
    UPDATE public.attempts
    SET 
        time_remaining = jsonb_build_object(
            'VARC', v_calc_varc,
            'DILR', v_calc_dilr,
            'QA', v_calc_qa
        ),
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'time_remaining', jsonb_build_object(
            'VARC', v_calc_varc,
            'DILR', v_calc_dilr,
            'QA', v_calc_qa
        ),
        'current_section', p_current_section,
        'current_question', p_current_question,
        'paused_at', NOW()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.pause_exam_state(uuid, text, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pause_exam_state(uuid, text, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.pause_exam_state(uuid, text, int) TO authenticated;

-- =============================================================================
-- VERIFICATION QUERIES (run as authenticated user, not service role)
-- =============================================================================

-- TEST 1: Direct UPDATE on revoked columns should fail
-- UPDATE public.attempts SET time_remaining = '{"VARC": 9999}' WHERE id = '<attempt_id>';
-- Expected: ERROR permission denied for column time_remaining

-- TEST 2: RPC should work for attempt owner
-- SELECT public.save_attempt_state('<attempt_id>', '{"VARC": 1000, "DILR": 2000, "QA": 2400}', 'VARC', 1, NOW());
-- Expected: SUCCESS with updated state

-- TEST 3: RPC should reject time inflation
-- SELECT public.save_attempt_state('<attempt_id>', '{"VARC": 9999, "DILR": 9999, "QA": 9999}', 'VARC', 1, NOW());
-- Expected: ERROR Invalid timer state: time cannot increase

-- TEST 4: pause_exam_state should work for papers with allow_pause=true
-- SELECT public.pause_exam_state('<attempt_id>', 'VARC', 1);
-- Expected: SUCCESS with server-calculated time

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
````

## File: docs/migrations/006_force_resume_session.sql
````sql
-- ============================================================================
-- Migration: Force Resume Exam Session (SECURITY DEFINER)
-- @blueprint Security Audit - P0 Fix - Session Locking Compatibility
-- ============================================================================
-- Purpose: Allow server-authoritative session token rotation for force-resume
-- ============================================================================

CREATE OR REPLACE FUNCTION force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
    v_status TEXT;
    v_last_activity TIMESTAMPTZ;
    v_stale_threshold INTERVAL := INTERVAL '5 minutes';
BEGIN
    SELECT user_id, status, last_activity_at
    INTO v_user_id, v_status, v_last_activity
    FROM attempts
    WHERE id = p_attempt_id;

    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF v_status != 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress';
    END IF;

    IF v_last_activity IS NULL OR v_last_activity < NOW() - v_stale_threshold THEN
        RAISE EXCEPTION 'FORCE_RESUME_STALE';
    END IF;

    UPDATE attempts
    SET session_token = p_new_session_token,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION force_resume_exam_session(UUID, UUID) TO authenticated;

-- ============================================================================
-- Rollback (if needed)
-- DROP FUNCTION IF EXISTS force_resume_exam_session(UUID, UUID);
-- ============================================================================
````

## File: docs/migrations/006_response_flags.sql
````sql
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
````

## File: docs/migrations/007_content_ingestion_phases.sql
````sql
-- ============================================================================
-- MIGRATION: Content Ingestion Phases (0, 1, 2)
-- ============================================================================
-- Purpose: Implement robust export/import system with versioning
-- 
-- Phase 0: Export assembler function (export_paper_json)
-- Phase 1: Schema hardening (context types, question taxonomy)
-- Phase 2: Versioned ingestion tracking (paper_ingest_runs)
-- ============================================================================

-- ============================================================================
-- PHASE 0: EXPORT ASSEMBLER FUNCTION
-- ============================================================================
-- Creates a SQL function that assembles a complete paper JSON from normalized tables
-- Returns JSON matching docs/CONTENT-SCHEMA.md format
CREATE OR REPLACE FUNCTION public.export_paper_json(p_paper_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_paper RECORD;
    v_result jsonb;
    v_contexts jsonb;
    v_questions jsonb;
BEGIN
    -- Fetch paper metadata
    SELECT * INTO v_paper
    FROM public.papers
    WHERE id = p_paper_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Paper not found', 'paper_id', p_paper_id);
    END IF;

    -- Build contexts array (from question_contexts)
    -- Ordered by section (VARC, DILR, QA) then display_order for determinism
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', qc.id,
                'section', qc.section,
                'context_type', qc.context_type,
                'title', qc.title,
                'content', qc.content,
                'image_url', qc.image_url,
                'display_order', qc.display_order
            )
            ORDER BY 
                CASE qc.section 
                    WHEN 'VARC' THEN 1 
                    WHEN 'DILR' THEN 2 
                    WHEN 'QA' THEN 3 
                END,
                qc.display_order,
                qc.id
        ),
        '[]'::jsonb
    ) INTO v_contexts
    FROM public.question_contexts qc
    WHERE qc.paper_id = p_paper_id
      AND qc.is_active = TRUE;

    -- Build questions array
    -- Ordered by section, then question_number for determinism
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', q.id,
                'section', q.section,
                'question_number', q.question_number,
                'question_text', q.question_text,
                'question_type', q.question_type,
                'question_format', COALESCE(q.question_format, q.question_type),
                'taxonomy_type', q.taxonomy_type,
                'topic_tag', q.topic_tag,
                'difficulty_rationale', q.difficulty_rationale,
                'options', q.options,
                'correct_answer', q.correct_answer,
                'positive_marks', q.positive_marks,
                'negative_marks', q.negative_marks,
                'difficulty', q.difficulty,
                'topic', q.topic,
                'subtopic', q.subtopic,
                'solution_text', q.solution_text,
                'solution_image_url', q.solution_image_url,
                'video_solution_url', q.video_solution_url,
                'context_id', COALESCE(q.context_id, q.set_id),
                'sequence_order', q.sequence_order
            )
            ORDER BY 
                CASE q.section 
                    WHEN 'VARC' THEN 1 
                    WHEN 'DILR' THEN 2 
                    WHEN 'QA' THEN 3 
                END,
                q.question_number
        ),
        '[]'::jsonb
    ) INTO v_questions
    FROM public.questions q
    WHERE q.paper_id = p_paper_id
      AND q.is_active = TRUE;

    -- Build final result
    v_result := jsonb_build_object(
        'schema_version', 'v1.0',
        'exported_at', NOW(),
        'paper', jsonb_build_object(
            'id', v_paper.id,
            'slug', v_paper.slug,
            'title', v_paper.title,
            'description', v_paper.description,
            'year', v_paper.year,
            'total_questions', v_paper.total_questions,
            'total_marks', v_paper.total_marks,
            'duration_minutes', v_paper.duration_minutes,
            'sections', v_paper.sections,
            'default_positive_marks', v_paper.default_positive_marks,
            'default_negative_marks', v_paper.default_negative_marks,
            'difficulty_level', v_paper.difficulty_level,
            'is_free', v_paper.is_free,
            'published', v_paper.published,
            'available_from', v_paper.available_from,
            'available_until', v_paper.available_until,
            'allow_pause', v_paper.allow_pause,
            'attempt_limit', v_paper.attempt_limit,
            'created_at', v_paper.created_at,
            'updated_at', v_paper.updated_at
        ),
        'contexts', v_contexts,
        'questions', v_questions
    );

    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users (admin check happens in API layer)
GRANT EXECUTE ON FUNCTION public.export_paper_json(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_paper_json(uuid) TO service_role;

COMMENT ON FUNCTION public.export_paper_json IS 'Assembles complete paper JSON from normalized tables. Returns JSON matching CONTENT-SCHEMA.md format.';

-- ============================================================================
-- PHASE 1.1: CONTEXT TYPE ENUM EXPANSION
-- ============================================================================
-- Expand context_type to include: rc_passage, dilr_set, caselet, data_table, graph, other_shared_stimulus

-- Note: We use set_type on question_sets, but add a context_type column for explicit categorization
-- First, add the context_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'question_sets' 
        AND column_name = 'context_type'
    ) THEN
        ALTER TABLE public.question_sets 
        ADD COLUMN context_type TEXT;
    END IF;
END $$;

-- Add CHECK constraint for valid context types
ALTER TABLE public.question_sets 
DROP CONSTRAINT IF EXISTS question_sets_context_type_check;

ALTER TABLE public.question_sets
ADD CONSTRAINT question_sets_context_type_check 
CHECK (context_type IS NULL OR context_type IN (
    'rc_passage',           -- VARC reading comprehension passages
    'dilr_set',             -- DILR data/logical reasoning sets
    'caselet',              -- Case-based scenarios
    'data_table',           -- Explicit data tables
    'graph',                -- Charts, graphs, diagrams
    'other_shared_stimulus' -- Catch-all for other shared content
));

-- Migrate existing set_type to context_type where NULL
UPDATE public.question_sets
SET context_type = CASE set_type
    WHEN 'VARC' THEN 'rc_passage'
    WHEN 'DILR' THEN 'dilr_set'
    WHEN 'CASELET' THEN 'caselet'
    ELSE NULL
END
WHERE context_type IS NULL AND set_type != 'ATOMIC';

COMMENT ON COLUMN public.question_sets.context_type IS 'Explicit context categorization: rc_passage, dilr_set, caselet, data_table, graph, other_shared_stimulus';

-- ============================================================================
-- PHASE 1.2: QUESTION TAXONOMY COLUMNS
-- ============================================================================
-- Add question_format (MCQ|TITA) to separate from question_type (taxonomy)
-- Add topic_tag and difficulty_rationale columns

-- Add question_format column (MCQ or TITA)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'question_format'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN question_format TEXT;
    END IF;
END $$;

-- Add CHECK constraint for question_format
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_question_format_check;

ALTER TABLE public.questions
ADD CONSTRAINT questions_question_format_check 
CHECK (question_format IS NULL OR question_format IN ('MCQ', 'TITA'));

-- Add taxonomy_type column (the semantic question type like rc_inference, para_summary, etc.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'taxonomy_type'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN taxonomy_type TEXT;
    END IF;
END $$;

-- Add topic_tag column (finer-grained categorization)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'topic_tag'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN topic_tag TEXT;
    END IF;
END $$;

-- Add difficulty_rationale column (explanation for difficulty rating)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'difficulty_rationale'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN difficulty_rationale TEXT;
    END IF;
END $$;

-- Migrate existing question_type to question_format
UPDATE public.questions
SET question_format = question_type
WHERE question_format IS NULL AND question_type IN ('MCQ', 'TITA');

COMMENT ON COLUMN public.questions.question_format IS 'Answer format: MCQ or TITA (replaces old question_type semantics)';
COMMENT ON COLUMN public.questions.taxonomy_type IS 'Question taxonomy: rc_inference, para_summary, di_table_analysis, geometry_triangles, etc.';
COMMENT ON COLUMN public.questions.topic_tag IS 'Fine-grained topic tag for categorization and analytics';
COMMENT ON COLUMN public.questions.difficulty_rationale IS 'Optional explanation for the difficulty rating';

-- ============================================================================
-- PHASE 1.3: PARA SUMMARY CONSTRAINT
-- ============================================================================
-- Enforce: If taxonomy_type = 'para_summary' then set_id (context reference) must be NULL
-- Para summary questions should have their content in question_text, not as a shared context

CREATE OR REPLACE FUNCTION public.validate_para_summary_no_context()
RETURNS TRIGGER AS $$
BEGIN
    -- If taxonomy_type is para_summary, context (set_id) must be NULL
    -- Exception: ATOMIC sets are fine (they're just wrappers)
    IF NEW.taxonomy_type = 'para_summary' AND NEW.set_id IS NOT NULL THEN
        -- Check if the set is ATOMIC (wrapper) - that's allowed
        PERFORM 1 FROM public.question_sets 
        WHERE id = NEW.set_id AND set_type = 'ATOMIC';
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Para Summary questions must not reference a shared context. The paragraph belongs in question_text, not context_body. Question ID: %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_para_summary ON public.questions;
CREATE TRIGGER trg_validate_para_summary
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.validate_para_summary_no_context();

COMMENT ON FUNCTION public.validate_para_summary_no_context IS 'Enforces rule: Para Summary questions must have paragraph in question_text, not as shared context';

-- ============================================================================
-- PHASE 2.1: PAPER INGEST RUNS TABLE (Versioning)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paper_ingest_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
    
    -- Version tracking
    schema_version TEXT NOT NULL DEFAULT 'v1.0',
    version_number INTEGER NOT NULL DEFAULT 1,
    
    -- Source tracking
    raw_source_text TEXT,                    -- Original raw input (optional, for debugging)
    raw_source_hash TEXT,                    -- SHA256 hash of raw_source_text
    
    -- Canonical JSON snapshot
    canonical_paper_json JSONB NOT NULL,     -- The exact JSON that was imported
    canonical_json_hash TEXT NOT NULL,       -- SHA256 hash for deduplication
    
    -- Audit
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Notes
    import_notes TEXT,                       -- Optional notes about this import
    
    -- Ensure unique version numbers per paper
    UNIQUE(paper_id, version_number)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'schema_version'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN schema_version TEXT NOT NULL DEFAULT 'v1.0';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'version_number'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'raw_source_text'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN raw_source_text TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'raw_source_hash'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN raw_source_hash TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'canonical_paper_json'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN canonical_paper_json JSONB;
        ALTER TABLE public.paper_ingest_runs ALTER COLUMN canonical_paper_json SET NOT NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'canonical_json_hash'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN canonical_json_hash TEXT;
        ALTER TABLE public.paper_ingest_runs ALTER COLUMN canonical_json_hash SET NOT NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'paper_ingest_runs'
          AND column_name = 'import_notes'
    ) THEN
        ALTER TABLE public.paper_ingest_runs ADD COLUMN import_notes TEXT;
    END IF;
END $$;

DO $$
DECLARE
    v_table oid;
    v_paper_id_attnum int;
    v_version_num_attnum int;
BEGIN
    SELECT c.oid INTO v_table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'paper_ingest_runs';

    SELECT attnum INTO v_paper_id_attnum
    FROM pg_attribute WHERE attrelid = v_table AND attname = 'paper_id';

    SELECT attnum INTO v_version_num_attnum
    FROM pg_attribute WHERE attrelid = v_table AND attname = 'version_number';

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        WHERE c.conrelid = v_table
          AND c.contype = 'u'
          AND c.conkey = ARRAY[v_paper_id_attnum::smallint, v_version_num_attnum::smallint]
    ) THEN
        ALTER TABLE public.paper_ingest_runs
        ADD CONSTRAINT paper_ingest_runs_paper_version_unique UNIQUE (paper_id, version_number);
    END IF;
END $$;

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_paper_ingest_runs_paper_id ON public.paper_ingest_runs(paper_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_paper_ingest_runs_hash ON public.paper_ingest_runs(canonical_json_hash);

-- Add latest_ingest_run_id to papers table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'papers' 
        AND column_name = 'latest_ingest_run_id'
    ) THEN
        ALTER TABLE public.papers 
        ADD COLUMN latest_ingest_run_id UUID REFERENCES public.paper_ingest_runs(id);
    END IF;
END $$;

COMMENT ON TABLE public.paper_ingest_runs IS 'Stores versioned snapshots of imported paper JSON for audit and re-export';
COMMENT ON COLUMN public.paper_ingest_runs.canonical_paper_json IS 'Exact JSON as imported - used for export to recreate original';
COMMENT ON COLUMN public.paper_ingest_runs.canonical_json_hash IS 'SHA256 hash for detecting duplicate imports';
COMMENT ON COLUMN public.papers.latest_ingest_run_id IS 'Pointer to the most recent ingest run for quick export';

-- RLS for paper_ingest_runs
ALTER TABLE public.paper_ingest_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'paper_ingest_runs'
          AND policyname = 'Admins can manage ingest runs'
    ) THEN
        ALTER POLICY "Admins can manage ingest runs" ON public.paper_ingest_runs
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
    ELSE
        CREATE POLICY "Admins can manage ingest runs" ON public.paper_ingest_runs
            FOR ALL
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
    END IF;
END $$;

-- ============================================================================
-- PHASE 2.2: Helper function to get next version number
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_next_paper_version(p_paper_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
    FROM public.paper_ingest_runs
    WHERE paper_id = p_paper_id;
    
    RETURN v_next_version;
END;
$$;

-- ============================================================================
-- PHASE 2.3: Function to check if import would be duplicate
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_import_duplicate(p_paper_id uuid, p_json_hash text)
RETURNS TABLE(is_duplicate boolean, existing_run_id uuid, existing_version integer)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as is_duplicate,
        pir.id as existing_run_id,
        pir.version_number as existing_version
    FROM public.paper_ingest_runs pir
    WHERE pir.paper_id = p_paper_id
      AND pir.canonical_json_hash = p_json_hash
    ORDER BY pir.version_number DESC
    LIMIT 1;
    
    -- If no rows returned, return is_duplicate = FALSE
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::uuid, NULL::integer;
    END IF;
END;
$$;

-- ============================================================================
-- PHASE 2.4: Updated export function that prefers canonical snapshot
-- ============================================================================
CREATE OR REPLACE FUNCTION public.export_paper_json_versioned(
    p_paper_id uuid,
    p_ingest_run_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_canonical_json jsonb;
    v_run_id uuid;
BEGIN
    -- If specific run_id provided, use that
    IF p_ingest_run_id IS NOT NULL THEN
        SELECT canonical_paper_json INTO v_canonical_json
        FROM public.paper_ingest_runs
        WHERE id = p_ingest_run_id AND paper_id = p_paper_id;
        
        IF FOUND THEN
            RETURN v_canonical_json || jsonb_build_object('_ingest_run_id', p_ingest_run_id);
        END IF;
    END IF;
    
    -- Try to get latest ingest run
    SELECT pir.id, pir.canonical_paper_json INTO v_run_id, v_canonical_json
    FROM public.papers p
    LEFT JOIN public.paper_ingest_runs pir ON p.latest_ingest_run_id = pir.id
    WHERE p.id = p_paper_id;
    
    IF v_canonical_json IS NOT NULL THEN
        RETURN v_canonical_json || jsonb_build_object('_ingest_run_id', v_run_id);
    END IF;
    
    -- Fallback: assemble from current database state
    RETURN public.export_paper_json(p_paper_id) || jsonb_build_object(
        '_assembled_from_db', TRUE,
        '_note', 'No canonical snapshot found, assembled from current database state'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.export_paper_json_versioned(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_paper_json_versioned(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.export_paper_json_versioned IS 'Export paper JSON, preferring canonical snapshot from ingest run if available';

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- Phase 0 Complete:
--   ✓ export_paper_json(paper_id) - assembles paper from normalized tables
--   ✓ Deterministic ordering (section, then display_order/question_number)
--
-- Phase 1 Complete:
--   ✓ context_type column on question_sets with expanded enum
--   ✓ question_format (MCQ|TITA) separate from taxonomy_type
--   ✓ topic_tag and difficulty_rationale columns
--   ✓ Trigger to prevent para_summary questions from having shared context
--
-- Phase 2 Complete:
--   ✓ paper_ingest_runs table for version tracking
--   ✓ canonical_paper_json storage with hash deduplication
--   ✓ export_paper_json_versioned() prefers canonical snapshot
--   ✓ Helper functions for version management
--
-- ============================================================================
````

## File: docs/migrations/008_ingestion_semantic_keys.sql
````sql
-- ==============================================================================
-- Migration 008: Semantic Keys for Content Ingestion (Upsert Support)
-- ==============================================================================
-- Purpose: Add semantic keys to enable idempotent imports via upserts
-- Author: System
-- Date: 2025-01-XX
-- Dependencies: 007_content_ingestion_phases.sql
-- 
-- This migration adds:
--   1. papers.paper_key (unique business key for papers)
--   2. question_sets.client_set_id (unique per paper)
--   3. questions.client_question_id (unique per paper)
--   4. Composite unique indexes for upsert operations
--   5. Upsert-enabled import functions
-- ==============================================================================

-- ============================================================================
-- STEP 1: Add Semantic Key Columns (Safe if they exist)
-- ============================================================================

-- papers.paper_key - Global unique identifier for papers (e.g., "cat-2024-slot-1")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'papers' AND column_name = 'paper_key'
    ) THEN
        ALTER TABLE papers ADD COLUMN paper_key TEXT;
        COMMENT ON COLUMN papers.paper_key IS 'Unique business key for the paper (e.g., cat-2024-slot-1). Used for upserts.';
    END IF;
END $$;

-- question_sets.client_set_id - Unique within a paper (e.g., "VARC_RC_1", "ATOMIC_QA_45")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'question_sets' AND column_name = 'client_set_id'
    ) THEN
        ALTER TABLE question_sets ADD COLUMN client_set_id TEXT;
        COMMENT ON COLUMN question_sets.client_set_id IS 'Client-provided unique ID within paper (e.g., VARC_RC_1). Used for v3 imports.';
    END IF;
END $$;

-- questions.client_question_id - Unique within a paper (e.g., "Q1", "Q2")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'client_question_id'
    ) THEN
        ALTER TABLE questions ADD COLUMN client_question_id TEXT;
        COMMENT ON COLUMN questions.client_question_id IS 'Client-provided unique ID within paper (e.g., Q1, Q2). Used for v3 imports.';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Create Unique Indexes for Upsert Support
-- ============================================================================

-- papers.paper_key must be globally unique
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'papers_paper_key_unique'
    ) THEN
        CREATE UNIQUE INDEX papers_paper_key_unique ON papers (paper_key) WHERE paper_key IS NOT NULL;
    END IF;
END $$;

-- question_sets.client_set_id must be unique within a paper
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'question_sets_paper_client_set_id_unique'
    ) THEN
        CREATE UNIQUE INDEX question_sets_paper_client_set_id_unique 
            ON question_sets (paper_id, client_set_id) 
            WHERE client_set_id IS NOT NULL;
    END IF;
END $$;

-- questions.client_question_id must be unique within a paper
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'questions_paper_client_question_id_unique'
    ) THEN
        -- Deferred until after backfill to avoid duplicate conflicts
        NULL;
    END IF;
END $$;


-- ============================================================================
-- STEP 3: Backfill Existing Records with Semantic Keys
-- ============================================================================

-- Backfill papers.paper_key from slug (if not already set)
UPDATE papers 
SET paper_key = slug 
WHERE paper_key IS NULL AND slug IS NOT NULL;

-- Backfill question_sets.client_set_id using set_type + ROW_NUMBER within paper
-- This ensures uniqueness even when multiple sets have same display_order
WITH numbered_sets AS (
    SELECT 
        id,
        UPPER(set_type) || '_' || LPAD(ROW_NUMBER() OVER (
            PARTITION BY paper_id 
            ORDER BY 
                CASE section WHEN 'VARC' THEN 1 WHEN 'DILR' THEN 2 WHEN 'QA' THEN 3 END,
                display_order,
                created_at,
                id
        )::TEXT, 3, '0') AS new_client_set_id
    FROM question_sets
    WHERE client_set_id IS NULL
)
UPDATE question_sets qs
SET client_set_id = ns.new_client_set_id
FROM numbered_sets ns
WHERE qs.id = ns.id;

-- Backfill questions.client_question_id using "Q" + question_number
WITH question_ids AS (
    SELECT
        id,
        paper_id,
        client_question_id,
        row_number() OVER (
            PARTITION BY paper_id
            ORDER BY question_number, created_at, id
        ) AS seq,
        row_number() OVER (
            PARTITION BY paper_id, COALESCE(client_question_id, '__NULL__')
            ORDER BY question_number, created_at, id
        ) AS rn,
        count(*) OVER (
            PARTITION BY paper_id, COALESCE(client_question_id, '__NULL__')
        ) AS cnt
    FROM questions
)
UPDATE questions q
SET client_question_id = CASE
    WHEN q.client_question_id IS NULL THEN 'Q' || LPAD(qi.seq::TEXT, 3, '0')
    WHEN qi.cnt > 1 THEN q.client_question_id || '_' || qi.rn::TEXT
    ELSE q.client_question_id
END
FROM question_ids qi
WHERE q.id = qi.id
  AND (q.client_question_id IS NULL OR qi.cnt > 1);

-- Now create unique index for questions after backfill
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'questions_paper_client_question_id_unique'
    ) THEN
        CREATE UNIQUE INDEX questions_paper_client_question_id_unique 
            ON questions (paper_id, client_question_id) 
            WHERE client_question_id IS NOT NULL;
    END IF;
END $$;


-- ============================================================================
-- STEP 4: Upsert Functions for v3 Importer
-- ============================================================================

-- Upsert a question_set by (paper_id, client_set_id)
CREATE OR REPLACE FUNCTION upsert_question_set(
    p_paper_id UUID,
    p_client_set_id TEXT,
    p_section TEXT,
    p_set_type TEXT,
    p_context_type TEXT DEFAULT NULL,
    p_content_layout TEXT DEFAULT 'text_only',
    p_context_title TEXT DEFAULT NULL,
    p_context_body TEXT DEFAULT NULL,
    p_context_image_url TEXT DEFAULT NULL,
    p_context_additional_images JSONB DEFAULT NULL,
    p_display_order INT DEFAULT 0,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_set_id UUID;
BEGIN
    -- Try update first
    UPDATE question_sets SET
        section = p_section,
        set_type = p_set_type,
        context_type = p_context_type,
        content_layout = p_content_layout,
        context_title = p_context_title,
        context_body = p_context_body,
        context_image_url = p_context_image_url,
        context_additional_images = p_context_additional_images,
        display_order = p_display_order,
        is_active = p_is_active,
        metadata = p_metadata,
        updated_at = NOW()
    WHERE paper_id = p_paper_id AND client_set_id = p_client_set_id
    RETURNING id INTO v_set_id;
    
    -- If no update, insert
    IF v_set_id IS NULL THEN
        INSERT INTO question_sets (
            id, paper_id, client_set_id, section, set_type, context_type,
            content_layout, context_title, context_body, context_image_url,
            context_additional_images, display_order, is_active, metadata
        ) VALUES (
            gen_random_uuid(), p_paper_id, p_client_set_id, p_section, p_set_type, p_context_type,
            p_content_layout, p_context_title, p_context_body, p_context_image_url,
            p_context_additional_images, p_display_order, p_is_active, p_metadata
        )
        RETURNING id INTO v_set_id;
    END IF;
    
    RETURN v_set_id;
END;
$$;

-- Upsert a question by (paper_id, client_question_id)
CREATE OR REPLACE FUNCTION upsert_question(
    p_paper_id UUID,
    p_client_question_id TEXT,
    p_set_id UUID,
    p_section TEXT,
    p_question_number INT,
    p_sequence_order INT,
    p_question_text TEXT,
    p_question_type TEXT,
    p_question_format TEXT DEFAULT NULL,
    p_taxonomy_type TEXT DEFAULT NULL,
    p_topic_tag TEXT DEFAULT NULL,
    p_difficulty_rationale TEXT DEFAULT NULL,
    p_options JSONB DEFAULT NULL,
    p_correct_answer TEXT DEFAULT NULL,
    p_positive_marks NUMERIC DEFAULT 3.0,
    p_negative_marks NUMERIC DEFAULT 1.0,
    p_difficulty TEXT DEFAULT NULL,
    p_topic TEXT DEFAULT NULL,
    p_subtopic TEXT DEFAULT NULL,
    p_solution_text TEXT DEFAULT NULL,
    p_solution_image_url TEXT DEFAULT NULL,
    p_video_solution_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_question_id UUID;
BEGIN
    -- Try update first
    UPDATE questions SET
        set_id = p_set_id,
        section = p_section,
        question_number = p_question_number,
        sequence_order = p_sequence_order,
        question_text = p_question_text,
        question_type = p_question_type,
        question_format = COALESCE(p_question_format, p_question_type),
        taxonomy_type = p_taxonomy_type,
        topic_tag = p_topic_tag,
        difficulty_rationale = p_difficulty_rationale,
        options = p_options,
        correct_answer = p_correct_answer,
        positive_marks = p_positive_marks,
        negative_marks = p_negative_marks,
        difficulty = p_difficulty,
        topic = p_topic,
        subtopic = p_subtopic,
        solution_text = p_solution_text,
        solution_image_url = p_solution_image_url,
        video_solution_url = p_video_solution_url,
        updated_at = NOW()
    WHERE paper_id = p_paper_id AND client_question_id = p_client_question_id
    RETURNING id INTO v_question_id;
    
    -- If no update, insert
    IF v_question_id IS NULL THEN
        INSERT INTO questions (
            id, paper_id, client_question_id, set_id, section, question_number,
            sequence_order, question_text, question_type, question_format,
            taxonomy_type, topic_tag, difficulty_rationale, options, correct_answer,
            positive_marks, negative_marks, difficulty, topic, subtopic,
            solution_text, solution_image_url, video_solution_url
        ) VALUES (
            gen_random_uuid(), p_paper_id, p_client_question_id, p_set_id, p_section, p_question_number,
            p_sequence_order, p_question_text, p_question_type, COALESCE(p_question_format, p_question_type),
            p_taxonomy_type, p_topic_tag, p_difficulty_rationale, p_options, p_correct_answer,
            p_positive_marks, p_negative_marks, p_difficulty, p_topic, p_subtopic,
            p_solution_text, p_solution_image_url, p_video_solution_url
        )
        RETURNING id INTO v_question_id;
    END IF;
    
    RETURN v_question_id;
END;
$$;


-- ============================================================================
-- STEP 5: Lookup Functions for Semantic Keys
-- ============================================================================

-- Get question_set.id by (paper_id, client_set_id)
CREATE OR REPLACE FUNCTION get_set_id_by_client_id(
    p_paper_id UUID,
    p_client_set_id TEXT
) RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT id FROM question_sets 
    WHERE paper_id = p_paper_id AND client_set_id = p_client_set_id;
$$;

-- Get question.id by (paper_id, client_question_id)
CREATE OR REPLACE FUNCTION get_question_id_by_client_id(
    p_paper_id UUID,
    p_client_question_id TEXT
) RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT id FROM questions 
    WHERE paper_id = p_paper_id AND client_question_id = p_client_question_id;
$$;


-- ============================================================================
-- STEP 6: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION upsert_question_set TO service_role;
GRANT EXECUTE ON FUNCTION upsert_question TO service_role;
GRANT EXECUTE ON FUNCTION get_set_id_by_client_id TO service_role;
GRANT EXECUTE ON FUNCTION get_question_id_by_client_id TO service_role;


-- ============================================================================
-- STEP 7: V3 Export Function (Sets-First Format)
-- ============================================================================
-- Export function that outputs Schema v3.0 format for content creation context

CREATE OR REPLACE FUNCTION public.export_paper_json_v3(p_paper_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_paper RECORD;
    v_result jsonb;
    v_question_sets jsonb;
    v_questions jsonb;
BEGIN
    -- Fetch paper metadata
    SELECT * INTO v_paper
    FROM public.papers
    WHERE id = p_paper_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Paper not found', 'paper_id', p_paper_id);
    END IF;

    -- Build question_sets array (sets-first)
    -- Ordered by section (VARC, DILR, QA) then display_order for determinism
    WITH sets AS (
        SELECT
            qs.*,
            COALESCE(
                qs.client_set_id,
                UPPER(qs.set_type) || '_' || LPAD(ROW_NUMBER() OVER (
                    PARTITION BY qs.paper_id
                    ORDER BY 
                        CASE qs.section WHEN 'VARC' THEN 1 WHEN 'DILR' THEN 2 WHEN 'QA' THEN 3 END,
                        qs.display_order,
                        qs.id
                )::TEXT, 3, '0')
            ) AS computed_client_set_id
        FROM public.question_sets qs
        WHERE qs.paper_id = p_paper_id
          AND qs.is_active = TRUE
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'client_set_id', sets.computed_client_set_id,
                'section', sets.section,
                'set_type', sets.set_type,
                'context_type', sets.context_type,
                'content_layout', COALESCE(sets.content_layout, 'text_only'),
                'context_title', sets.context_title,
                'context_body', sets.context_body,
                'context_image_url', sets.context_image_url,
                'context_additional_images', sets.context_additional_images,
                'display_order', sets.display_order,
                'is_active', sets.is_active,
                'metadata', COALESCE(sets.metadata, '{}'::jsonb)
            )
            ORDER BY 
                CASE sets.section 
                    WHEN 'VARC' THEN 1 
                    WHEN 'DILR' THEN 2 
                    WHEN 'QA' THEN 3 
                END,
                sets.display_order,
                sets.id
        ),
        '[]'::jsonb
    ) INTO v_question_sets
    FROM sets;

    -- Build questions array with set_ref linking
    -- Ordered by section, then question_number for determinism
    WITH sets AS (
        SELECT
            qs.id,
            COALESCE(
                qs.client_set_id,
                UPPER(qs.set_type) || '_' || LPAD(ROW_NUMBER() OVER (
                    PARTITION BY qs.paper_id
                    ORDER BY 
                        CASE qs.section WHEN 'VARC' THEN 1 WHEN 'DILR' THEN 2 WHEN 'QA' THEN 3 END,
                        qs.display_order,
                        qs.id
                )::TEXT, 3, '0')
            ) AS computed_client_set_id
        FROM public.question_sets qs
        WHERE qs.paper_id = p_paper_id
          AND qs.is_active = TRUE
    ), qrows AS (
        SELECT
            q.*,
            sets.computed_client_set_id AS computed_set_ref
        FROM public.questions q
        LEFT JOIN sets ON sets.id = q.set_id
        WHERE q.paper_id = p_paper_id
          AND q.is_active = TRUE
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'client_question_id', COALESCE(q.client_question_id, 'Q' || q.question_number::TEXT),
                'set_ref', COALESCE(q.computed_set_ref, 'ATOMIC_' || LPAD(q.question_number::TEXT, 3, '0')),
                'section', q.section,
                'question_number', q.question_number,
                'sequence_order', COALESCE(q.sequence_order, 1),
                'question_text', q.question_text,
                'question_type', q.question_type,
                'question_format', COALESCE(q.question_format, q.question_type),
                'taxonomy_type', q.taxonomy_type,
                'topic_tag', q.topic_tag,
                'difficulty_rationale', q.difficulty_rationale,
                'options', q.options,
                'correct_answer', q.correct_answer,
                'positive_marks', q.positive_marks,
                'negative_marks', q.negative_marks,
                'difficulty', q.difficulty,
                'topic', q.topic,
                'subtopic', q.subtopic,
                'solution_text', q.solution_text,
                'solution_image_url', q.solution_image_url,
                'video_solution_url', q.video_solution_url
            )
            ORDER BY 
                CASE q.section 
                    WHEN 'VARC' THEN 1 
                    WHEN 'DILR' THEN 2 
                    WHEN 'QA' THEN 3 
                END,
                q.question_number
        ),
        '[]'::jsonb
    ) INTO v_questions
    FROM qrows q;

    -- Build final result in Schema v3.0 format
    v_result := jsonb_build_object(
        'schema_version', 'v3.0',
        'exported_at', NOW(),
        'paper', jsonb_build_object(
            'slug', v_paper.slug,
            'title', v_paper.title,
            'description', v_paper.description,
            'year', v_paper.year,
            'total_questions', v_paper.total_questions,
            'total_marks', v_paper.total_marks,
            'duration_minutes', v_paper.duration_minutes,
            'sections', v_paper.sections,
            'default_positive_marks', v_paper.default_positive_marks,
            'default_negative_marks', v_paper.default_negative_marks,
            'difficulty_level', v_paper.difficulty_level,
            'is_free', v_paper.is_free,
            'published', v_paper.published,
            'allow_pause', v_paper.allow_pause,
            'attempt_limit', v_paper.attempt_limit,
            'paper_key', COALESCE(v_paper.paper_key, v_paper.slug)
        ),
        'question_sets', v_question_sets,
        'questions', v_questions
    );

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.export_paper_json_v3(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_paper_json_v3(uuid) TO service_role;

COMMENT ON FUNCTION public.export_paper_json_v3 IS 'Exports paper in Schema v3.0 sets-first format. Use for content creation context.';


-- ============================================================================
-- ROLLBACK SCRIPT (Run manually if needed)
-- ============================================================================
/*
-- Drop functions
DROP FUNCTION IF EXISTS export_paper_json_v3;
DROP FUNCTION IF EXISTS upsert_question_set;
DROP FUNCTION IF EXISTS upsert_question;
DROP FUNCTION IF EXISTS get_set_id_by_client_id;
DROP FUNCTION IF EXISTS get_question_id_by_client_id;

-- Drop indexes
DROP INDEX IF EXISTS papers_paper_key_unique;
DROP INDEX IF EXISTS question_sets_paper_client_set_id_unique;
DROP INDEX IF EXISTS questions_paper_client_question_id_unique;

-- Drop columns (CAREFUL - data loss!)
ALTER TABLE papers DROP COLUMN IF EXISTS paper_key;
ALTER TABLE question_sets DROP COLUMN IF EXISTS client_set_id;
ALTER TABLE questions DROP COLUMN IF EXISTS client_question_id;
*/
````

## File: docs/migrations/009_attempt_submit_rls.sql
````sql
-- ============================================================================
-- Migration: Allow submit transition for attempts
-- @blueprint Security Audit - RLS submit transition
-- ============================================================================
-- Purpose: Allow authenticated users to mark their own attempts as submitted
--          while keeping completed_at and other protected fields locked down.

DROP POLICY IF EXISTS "Users can update their own attempts" ON public.attempts;

CREATE POLICY "Users can update their own attempts" ON public.attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Default: no status/submitted/completed changes
            (
                status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
                AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow in_progress -> submitted transition for the owner
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'in_progress'
                AND status = 'submitted'
                AND submitted_at IS NOT NULL
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
        )
    );
````

## File: docs/migrations/010_force_resume_lenient.sql
````sql
-- ============================================================================
-- Migration: Force Resume Exam Session V2 (Lenient Stale Threshold)
-- @blueprint Security Audit - Phase 3 Fix - Lenient force-resume for real exams
-- ============================================================================
-- Purpose: Allow force resume even after long connectivity gaps during exams.
-- The 5-minute stale threshold was too aggressive for CAT-style 2-hour exams.
-- Now uses 180 minutes (3 hours) as the threshold - covers full exam + buffer.
-- ============================================================================

CREATE OR REPLACE FUNCTION force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
    v_status TEXT;
    v_last_activity TIMESTAMPTZ;
    -- Phase 3: Increased from 5 minutes to 180 minutes (3 hours)
    -- This accommodates full exam duration + connectivity hiccups
    v_stale_threshold INTERVAL := INTERVAL '180 minutes';
BEGIN
    SELECT user_id, status, last_activity_at
    INTO v_user_id, v_status, v_last_activity
    FROM attempts
    WHERE id = p_attempt_id;

    -- Ownership check
    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Status check
    IF v_status != 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress';
    END IF;

    -- Phase 3: Only reject if truly stale (>3 hours of inactivity)
    -- This prevents "FORCE_RESUME_STALE" during normal exam flow
    IF v_last_activity IS NOT NULL AND v_last_activity < NOW() - v_stale_threshold THEN
        RAISE EXCEPTION 'FORCE_RESUME_STALE';
    END IF;

    -- Rotate session token and update activity
    UPDATE attempts
    SET session_token = p_new_session_token,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN TRUE;
END;
$$;

-- Ensure authenticated users can execute
GRANT EXECUTE ON FUNCTION force_resume_exam_session(UUID, UUID) TO authenticated;

-- ============================================================================
-- Rollback (if needed)
-- Run the original 006_force_resume_session.sql to restore 5-minute threshold
-- ============================================================================
````

## File: docs/migrations/011_prevent_paper_delete_with_attempts.sql
````sql
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
````

## File: docs/migrations/012_phase1_security_hardening.sql
````sql
-- ==========================================================================
-- Migration 012: Phase 1 Security Hardening (Initial - DEPRECATED)
-- ==========================================================================
-- NOTE: This migration has been SUPERSEDED by 013_phase1_security_complete.sql
-- which provides a more comprehensive implementation of Phase 1 security.
--
-- Use migration 013 instead for new deployments.
-- This file is kept for reference and backwards compatibility with existing
-- deployments that already ran this migration.
-- ==========================================================================

-- 1) Disable legacy SQL scoring function (use TS scoring only)
DROP FUNCTION IF EXISTS public.finalize_attempt(UUID);

-- 2) Enforce per-user attempt limits (status != 'expired')
DROP POLICY IF EXISTS "Users can create their own attempts" ON public.attempts;
CREATE POLICY "Users can create attempts within limit" ON public.attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
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

-- 3) Column-level protection for sensitive fields
REVOKE SELECT (correct_answer) ON public.questions FROM authenticated;
REVOKE SELECT (session_token) ON public.attempts FROM authenticated;
REVOKE UPDATE (session_token) ON public.attempts FROM authenticated;
````

## File: docs/migrations/013_phase1_security_complete.sql
````sql
-- ==========================================================================
-- Migration 013: Phase 1 Security Hardening - Complete Implementation
-- Date: February 2026
-- ==========================================================================
-- This migration addresses all Phase 1 security requirements:
-- 1. Remove legacy SQL finalize_attempt (TS scoring is source of truth)
-- 2. Enforce attempt limits via RLS policy
-- 3. Protect sensitive columns (correct_answer, session_token)
-- 4. Add pause_exam_state RPC with allow_pause check
-- 5. Harden session token validation
-- ==========================================================================

-- ==========================================================================
-- STEP 1: Drop Legacy SQL Scoring Function
-- ==========================================================================
-- The TypeScript scoring engine in submitExam() is now the sole source of truth.
-- Remove any legacy SQL scoring paths to prevent divergent outcomes.

DROP FUNCTION IF EXISTS public.finalize_attempt(UUID);
DROP FUNCTION IF EXISTS public.score_attempt(UUID);
DROP FUNCTION IF EXISTS public.calculate_attempt_score(UUID);

-- ==========================================================================
-- STEP 2: Enforce Attempt Limits via RLS Policy
-- ==========================================================================
-- Users cannot create more attempts than the paper's attempt_limit allows.
-- Status != 'expired' are counted (in_progress, submitted, completed, abandoned).

DROP POLICY IF EXISTS "Users can create their own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can create attempts within limit" ON public.attempts;

CREATE POLICY "Users can create attempts within limit" ON public.attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- No limit set (NULL or 0 means unlimited)
            (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) IS NULL
            OR (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id) <= 0
            OR (
                -- Count existing non-expired attempts
                (
                    SELECT COUNT(*)
                    FROM public.attempts a
                    WHERE a.user_id = auth.uid()
                      AND a.paper_id = attempts.paper_id
                      AND a.status <> 'expired'
                ) < (SELECT attempt_limit FROM public.papers p WHERE p.id = attempts.paper_id)
            )
        )
    );

-- ==========================================================================
-- STEP 3: Protect Sensitive Columns
-- ==========================================================================
-- Revoke direct access to sensitive columns from authenticated users.
-- These can only be accessed via SECURITY DEFINER functions.

-- Prevent direct read of correct_answer (use questions_exam view during exam,
-- fetch_attempt_solutions RPC after completion)
REVOKE SELECT (correct_answer) ON public.questions FROM authenticated;
REVOKE SELECT (correct_answer) ON public.questions FROM anon;

-- Prevent direct read/write of session_token (managed by session RPCs only)
REVOKE SELECT (session_token) ON public.attempts FROM authenticated;
REVOKE UPDATE (session_token) ON public.attempts FROM authenticated;
REVOKE SELECT (session_token) ON public.attempts FROM anon;

-- Prevent direct write to scoring columns (managed by submitExam TS only)
REVOKE UPDATE (total_score, correct_count, incorrect_count, unanswered_count, 
               accuracy, attempt_rate, section_scores) ON public.attempts FROM authenticated;

-- ==========================================================================
-- STEP 4: Pause Exam RPC with allow_pause Enforcement
-- ==========================================================================
-- This RPC respects the paper's allow_pause flag.
-- If allow_pause is false, pausing is denied.

DROP FUNCTION IF EXISTS public.pause_exam_state(UUID, TEXT, INT);

CREATE OR REPLACE FUNCTION public.pause_exam_state(
    p_attempt_id UUID,
    p_current_section TEXT,
    p_current_question INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_allow_pause BOOLEAN;
BEGIN
    -- Fetch attempt with paper info
    SELECT a.id, a.user_id, a.status, a.paper_id, a.time_remaining,
           p.allow_pause
    INTO v_attempt
    FROM public.attempts a
    JOIN public.papers p ON p.id = a.paper_id
    WHERE a.id = p_attempt_id;

    -- Validate attempt exists
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    -- Validate ownership
    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Validate status
    IF v_attempt.status <> 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress' USING ERRCODE = '42501';
    END IF;

    -- Check if pausing is allowed for this paper
    v_allow_pause := COALESCE(v_attempt.allow_pause, FALSE);
    IF NOT v_allow_pause THEN
        RAISE EXCEPTION 'Pausing is not allowed for this exam' USING ERRCODE = '42501';
    END IF;

    -- Update attempt to paused state
    UPDATE public.attempts
    SET 
        status = 'paused',
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN jsonb_build_object('success', TRUE, 'paused_at', NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION public.pause_exam_state(UUID, TEXT, INT) TO authenticated;

-- ==========================================================================
-- STEP 5: Add 'paused' to attempt status enum
-- ==========================================================================
-- First check if the constraint exists and drop it, then recreate with 'paused'

DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_status_check;
    
    -- Add new constraint with 'paused' status
    ALTER TABLE public.attempts ADD CONSTRAINT attempts_status_check 
        CHECK (status IN ('in_progress', 'paused', 'submitted', 'completed', 'abandoned', 'expired'));
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not update status constraint: %', SQLERRM;
END $$;

-- ==========================================================================
-- STEP 6: Enhanced Session Token Validation
-- ==========================================================================
-- More robust validation with explicit error codes

DROP FUNCTION IF EXISTS public.validate_session_token(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION public.validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_stored_token UUID;
    v_user_id UUID;
    v_status TEXT;
BEGIN
    -- Get current attempt state
    SELECT session_token, user_id, status 
    INTO v_stored_token, v_user_id, v_status
    FROM public.attempts 
    WHERE id = p_attempt_id;
    
    -- Check if attempt exists
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check ownership
    IF v_user_id != p_user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check status (allow in_progress and paused)
    IF v_status NOT IN ('in_progress', 'paused') THEN
        RETURN FALSE;
    END IF;
    
    -- If no session token set yet (first request), accept and set it
    IF v_stored_token IS NULL THEN
        UPDATE public.attempts 
        SET session_token = p_session_token, 
            last_activity_at = NOW()
        WHERE id = p_attempt_id 
          AND user_id = p_user_id;
        RETURN TRUE;
    END IF;
    
    -- Validate token matches
    IF v_stored_token = p_session_token THEN
        -- Update activity timestamp
        UPDATE public.attempts 
        SET last_activity_at = NOW()
        WHERE id = p_attempt_id;
        RETURN TRUE;
    END IF;
    
    -- Token mismatch - possible multi-device attack
    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID) TO authenticated;

-- ==========================================================================
-- STEP 7: Force Resume Session (with staleness check)
-- ==========================================================================
-- Allows user to take over session from another device.
-- Rejects if session is too stale (configurable threshold).

DROP FUNCTION IF EXISTS public.force_resume_exam_session(UUID, UUID);

CREATE OR REPLACE FUNCTION public.force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_stale_threshold INTERVAL := INTERVAL '30 minutes';
BEGIN
    -- Get current attempt state
    SELECT id, user_id, status, session_token, last_activity_at, started_at
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate attempt exists
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    -- Validate ownership
    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Validate status (allow in_progress and paused)
    IF v_attempt.status NOT IN ('in_progress', 'paused') THEN
        RAISE EXCEPTION 'Attempt is not resumable (status: %)', v_attempt.status 
            USING ERRCODE = '42501';
    END IF;

    -- Check staleness (optional - can be disabled by setting threshold very high)
    -- If last_activity_at is very old, reject force resume
    IF v_attempt.last_activity_at IS NOT NULL 
       AND v_attempt.last_activity_at < (NOW() - v_stale_threshold) THEN
        -- Allow force resume but log it (don't block for now)
        -- In production, you might want to be stricter
        RAISE NOTICE 'FORCE_RESUME_STALE: Session inactive for > 30 minutes';
    END IF;

    -- Update session token and resume
    UPDATE public.attempts
    SET 
        session_token = p_new_session_token,
        status = CASE WHEN status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN p_new_session_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_resume_exam_session(UUID, UUID) TO authenticated;

-- ==========================================================================
-- STEP 8: Initialize Exam Session
-- ==========================================================================
-- Creates a new session token for an attempt.

DROP FUNCTION IF EXISTS public.initialize_exam_session(UUID, UUID);

CREATE OR REPLACE FUNCTION public.initialize_exam_session(
    p_attempt_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_new_token UUID;
BEGIN
    -- Fetch attempt
    SELECT id, user_id, status, session_token
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status NOT IN ('in_progress', 'paused') THEN
        RAISE EXCEPTION 'Attempt is not active' USING ERRCODE = '42501';
    END IF;

    -- Generate new token
    v_new_token := gen_random_uuid();

    -- Update attempt
    UPDATE public.attempts
    SET 
        session_token = v_new_token,
        status = CASE WHEN status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = p_user_id;

    RETURN v_new_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_exam_session(UUID, UUID) TO authenticated;

-- ==========================================================================
-- STEP 9: Questions RLS Policy Update
-- ==========================================================================
-- Ensure questions table RLS only allows reading for completed attempts.
-- During exam, use questions_exam view which excludes correct_answer.

DROP POLICY IF EXISTS "Users can read questions for their completed attempts" ON public.questions;

CREATE POLICY "Users can read questions for their completed attempts" ON public.questions
    FOR SELECT TO authenticated 
    USING (
        is_active = true
        AND (
            -- Admins can see all questions
            public.is_admin()
            OR
            -- Users can only see questions for papers they've completed
            paper_id IN (
                SELECT paper_id FROM public.attempts
                WHERE user_id = auth.uid()
                  AND status IN ('submitted', 'completed')
                  AND submitted_at IS NOT NULL
            )
        )
    );

-- ==========================================================================
-- STEP 10: Ensure questions_exam view is properly granted
-- ==========================================================================
-- This view excludes correct_answer and is safe for exam runtime.

-- Grant access to the secure exam view
GRANT SELECT ON public.questions_exam TO authenticated;
GRANT SELECT ON public.questions_exam TO anon;

-- ==========================================================================
-- STEP 11: Attempt UPDATE Policy Hardening
-- ==========================================================================
-- Restrict what fields can be updated and under what conditions.

DROP POLICY IF EXISTS "Users can update their own attempts" ON public.attempts;

CREATE POLICY "Users can update their own in-progress attempts" ON public.attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Allow normal progress updates (no status change)
            (
                status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
                AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow transition from in_progress to submitted
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'in_progress'
                AND status = 'submitted'
                AND submitted_at IS NOT NULL
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
        )
    );

-- ==========================================================================
-- STEP 12: Responses RLS Policy
-- ==========================================================================
-- Users can only see/modify responses for their own attempts.

DROP POLICY IF EXISTS "Users can view their own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can create their own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON public.responses;

CREATE POLICY "Users can view their own responses" ON public.responses
    FOR SELECT TO authenticated
    USING (
        attempt_id IN (
            SELECT id FROM public.attempts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own responses" ON public.responses
    FOR INSERT TO authenticated
    WITH CHECK (
        attempt_id IN (
            SELECT id FROM public.attempts 
            WHERE user_id = auth.uid() 
              AND status IN ('in_progress', 'paused')
        )
    );

CREATE POLICY "Users can update their own responses" ON public.responses
    FOR UPDATE TO authenticated
    USING (
        attempt_id IN (
            SELECT id FROM public.attempts 
            WHERE user_id = auth.uid() 
              AND status IN ('in_progress', 'paused')
        )
    );

-- ==========================================================================
-- STEP 13: Fetch Attempt Solutions RPC
-- ==========================================================================
-- Secure way to fetch solutions only for completed attempts.

DROP FUNCTION IF EXISTS public.fetch_attempt_solutions(UUID);

CREATE OR REPLACE FUNCTION public.fetch_attempt_solutions(p_attempt_id UUID)
RETURNS TABLE (
    question_id UUID,
    correct_answer TEXT,
    solution_text TEXT,
    solution_image_url TEXT,
    video_solution_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
BEGIN
    -- Get attempt info
    SELECT id, user_id, status, paper_id, submitted_at
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate attempt exists
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    -- Validate ownership
    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Validate attempt is completed
    IF v_attempt.status NOT IN ('submitted', 'completed') OR v_attempt.submitted_at IS NULL THEN
        RAISE EXCEPTION 'Solutions only available after submission' USING ERRCODE = '42501';
    END IF;

    -- Return solutions
    RETURN QUERY
    SELECT 
        q.id AS question_id,
        q.correct_answer,
        q.solution_text,
        q.solution_image_url,
        q.video_solution_url
    FROM public.questions q
    WHERE q.paper_id = v_attempt.paper_id
      AND q.is_active = TRUE
    ORDER BY q.section, q.question_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_attempt_solutions(UUID) TO authenticated;

-- ==========================================================================
-- VERIFICATION QUERIES (Run to verify migration)
-- ==========================================================================
-- SELECT * FROM pg_policies WHERE tablename = 'attempts';
-- SELECT * FROM pg_policies WHERE tablename = 'questions';
-- SELECT * FROM pg_policies WHERE tablename = 'responses';
-- SELECT proname FROM pg_proc WHERE proname LIKE '%session%' OR proname LIKE '%attempt%';
````

## File: docs/migrations/014_soften_submit_rls.sql
````sql
-- ==========================================================================
-- Migration 014: Soften Submit RLS (Allow scoring update)
-- Date: February 2026
-- ==========================================================================
-- Purpose:
-- 1) Allow authenticated users to transition submitted -> completed
-- 2) Allow authenticated users to update scoring columns
--
-- NOTE: This is a security relaxation. Apply only if you accept the risk.

-- --------------------------------------------------------------------------
-- STEP 1: Allow submitted -> completed transition
-- --------------------------------------------------------------------------
-- Replace the restrictive policy with a relaxed version that permits:
--  - in_progress -> submitted
--  - submitted -> completed

DROP POLICY IF EXISTS "Users can update their own in-progress attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can update their own attempts (relaxed)" ON public.attempts;

CREATE POLICY "Users can update their own attempts (relaxed)" ON public.attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Allow normal progress updates (no status change)
            (
                status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
                AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow transition from in_progress to submitted
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'in_progress'
                AND status = 'submitted'
                AND submitted_at IS NOT NULL
                AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
            )
            OR
            -- Allow transition from submitted to completed
            (
                (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'submitted'
                AND status = 'completed'
                AND completed_at IS NOT NULL
            )
        )
    );

-- --------------------------------------------------------------------------
-- STEP 2: Re-grant scoring column updates to authenticated users
-- --------------------------------------------------------------------------
-- WARNING: This enables clients to write scores directly.
-- If you can, prefer using service-role updates instead.

GRANT UPDATE (total_score, correct_count, incorrect_count, unanswered_count,
              accuracy, attempt_rate, section_scores, max_possible_score, time_taken_seconds)
ON public.attempts TO authenticated;
````

## File: docs/migrations/015_landing_assets.sql
````sql
-- ============================================================================
-- MIGRATION 015: Landing Assets (DB + Storage)
-- ============================================================================
-- Purpose: Provide a minimal landing asset layer for dynamic image swapping.
--
-- Table: public.landing_assets
-- Columns: key, storage_path, public_url, alt_text, updated_at, updated_by
-- RLS: public read, admin-only write
-- Storage: landing-assets bucket (public read), admin-only write
-- ============================================================================

-- ==========================================================================
-- STEP 1: Create landing_assets table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.landing_assets (
    key TEXT PRIMARY KEY,
    storage_path TEXT,
    public_url TEXT,
    alt_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_landing_assets_updated_at ON public.landing_assets(updated_at DESC);

COMMENT ON TABLE public.landing_assets IS 'Public landing page asset registry (image keys, URLs, alt text).';
COMMENT ON COLUMN public.landing_assets.key IS 'Unique asset key (hero_mock_ui, mentor_photo, feature_exam_ui, etc).';

-- ==========================================================================
-- STEP 2: Enable RLS
-- ==========================================================================
ALTER TABLE public.landing_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read landing assets" ON public.landing_assets;
DROP POLICY IF EXISTS "Admins can insert landing assets" ON public.landing_assets;
DROP POLICY IF EXISTS "Admins can update landing assets" ON public.landing_assets;
DROP POLICY IF EXISTS "Admins can delete landing assets" ON public.landing_assets;

-- Public read (anon + authenticated)
CREATE POLICY "Public read landing assets" ON public.landing_assets
    FOR SELECT USING (true);

-- Admin-only writes
CREATE POLICY "Admins can insert landing assets" ON public.landing_assets
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update landing assets" ON public.landing_assets
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete landing assets" ON public.landing_assets
    FOR DELETE USING (public.is_admin());

-- ==========================================================================
-- STEP 3: Storage bucket for landing assets
-- ==========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'landing-assets',
    'landing-assets',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access for landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete landing assets" ON storage.objects;

-- Public read
CREATE POLICY "Public read access for landing assets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'landing-assets');

-- Admin-only writes
CREATE POLICY "Admins can upload landing assets" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'landing-assets' AND public.is_admin());

CREATE POLICY "Admins can update landing assets" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'landing-assets' AND public.is_admin());

CREATE POLICY "Admins can delete landing assets" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'landing-assets' AND public.is_admin());

-- ==========================================================================
-- VERIFICATION QUERIES
-- ==========================================================================
-- SELECT * FROM public.landing_assets LIMIT 5;
-- SELECT * FROM storage.buckets WHERE id = 'landing-assets';
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = 'landing_assets';
````

## File: docs/migrations/016_bug_reports.sql
````sql
-- ============================================================================
-- MIGRATION 016: Bug Reports (DB + Storage)
-- ============================================================================
-- Purpose: Allow authenticated users to submit bug reports with optional screenshots.
--
-- Table: public.bug_reports
-- Columns: id, user_id, route, description, screenshot_path, meta, created_at
-- RLS: authenticated insert, admin read
-- Storage: bug-screenshots bucket (private), authenticated upload, admin read/delete
-- ============================================================================

-- ==========================================================================
-- STEP 1: Create bug_reports table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    route TEXT,
    description TEXT NOT NULL,
    screenshot_path TEXT,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);

COMMENT ON TABLE public.bug_reports IS 'User-submitted bug reports with optional screenshots.';

-- ==========================================================================
-- STEP 2: Enable RLS
-- ==========================================================================
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Admins can read bug reports" ON public.bug_reports;

CREATE POLICY "Users can insert bug reports" ON public.bug_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read bug reports" ON public.bug_reports
    FOR SELECT USING (public.is_admin());

-- ==========================================================================
-- STEP 3: Storage bucket for screenshots
-- ==========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'bug-screenshots',
    'bug-screenshots',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated upload bug screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins read bug screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete bug screenshots" ON storage.objects;

CREATE POLICY "Authenticated upload bug screenshots" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Admins read bug screenshots" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'bug-screenshots' AND public.is_admin());

CREATE POLICY "Admins delete bug screenshots" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'bug-screenshots' AND public.is_admin());

-- ==========================================================================
-- VERIFICATION QUERIES
-- ==========================================================================
-- SELECT * FROM public.bug_reports LIMIT 5;
-- SELECT * FROM storage.buckets WHERE id = 'bug-screenshots';
````

## File: docs/migrations/017_bug_report_status.sql
````sql
-- ============================================================================
-- MIGRATION 017: Bug Report Status (Admin Workflow)
-- ============================================================================
-- Purpose: Allow admins to track bug report status (unchecked/in_progress/resolved).
-- ============================================================================

ALTER TABLE public.bug_reports
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unchecked';

-- Enable admin updates for status changes
DROP POLICY IF EXISTS "Admins can update bug reports" ON public.bug_reports;

CREATE POLICY "Admins can update bug reports" ON public.bug_reports
    FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- SELECT id, status FROM public.bug_reports LIMIT 5;
````

## File: docs/migrations/018_purge_attempts_on_auth_delete.sql
````sql
-- ============================================================================
-- Migration 018: Purge Attempts/Responses on Auth User Deletion
-- ============================================================================
-- Purpose: Ensure attempts (and cascading responses) are deleted when a user
--          is removed from auth.users. This prevents stale results from
--          appearing after account deletion.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    -- Delete responses explicitly in case FK cascade is missing.
    DELETE FROM public.responses
    WHERE attempt_id IN (SELECT id FROM public.attempts WHERE user_id = OLD.id);

    -- Delete attempts for the auth user.
    DELETE FROM public.attempts WHERE user_id = OLD.id;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted_cleanup ON auth.users;
CREATE TRIGGER on_auth_user_deleted_cleanup
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_delete();

-- ============================================================================
-- Verification
-- ============================================================================
-- 1) Delete a user from auth.users in Supabase.
-- 2) Confirm their attempts are removed:
--    SELECT * FROM public.attempts WHERE user_id = '<deleted_user_id>';
````

## File: docs/migrations/019_force_resume_ultra_lenient.sql
````sql
-- ============================================================================
-- Migration 019: Force Resume Exam Session (Ultra-Lenient Threshold)
-- ============================================================================
-- Purpose: Allow force resume even after long gaps (e.g., next-day continuation).
-- This aligns with mock behavior where attempts can be resumed later.
-- ============================================================================

DROP FUNCTION IF EXISTS force_resume_exam_session(UUID, UUID);

CREATE FUNCTION force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
    v_status TEXT;
    v_last_activity TIMESTAMPTZ;
    -- Ultra-lenient: allow resume up to 7 days of inactivity.
    v_stale_threshold INTERVAL := INTERVAL '7 days';
BEGIN
    SELECT user_id, status, last_activity_at
    INTO v_user_id, v_status, v_last_activity
    FROM attempts
    WHERE id = p_attempt_id;

    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF v_status != 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress';
    END IF;

    IF v_last_activity IS NOT NULL AND v_last_activity < NOW() - v_stale_threshold THEN
        RAISE EXCEPTION 'FORCE_RESUME_STALE';
    END IF;

    UPDATE attempts
    SET session_token = p_new_session_token,
        last_activity_at = NOW()
    WHERE id = p_attempt_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION force_resume_exam_session(UUID, UUID) TO authenticated;

-- ============================================================================
-- Rollback
-- Run 010_force_resume_lenient.sql to restore 3-hour threshold.
-- ============================================================================
````

## File: docs/migrations/020_pause_tracking.sql
````sql
-- ============================================================================
-- Migration 020: Pause Tracking for Accurate Time Taken
-- ============================================================================
-- Purpose: Track total paused duration so scoring/analytics exclude pause time.
-- Adds:
--   - attempts.paused_at
--   - attempts.total_paused_seconds
-- Updates:
--   - pause_exam_state
--   - initialize_exam_session
--   - force_resume_exam_session
-- ============================================================================

ALTER TABLE public.attempts
    ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS total_paused_seconds INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.attempts.paused_at IS 'Timestamp when the attempt was last paused.';
COMMENT ON COLUMN public.attempts.total_paused_seconds IS 'Accumulated paused duration (seconds).';

-- Backfill paused_at for currently paused attempts (best-effort)
UPDATE public.attempts
SET paused_at = COALESCE(paused_at, last_activity_at, updated_at, NOW())
WHERE status = 'paused' AND paused_at IS NULL;

-- --------------------------------------------------------------------------
-- Pause RPC: set paused_at and keep total_paused_seconds unchanged
-- --------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.pause_exam_state(UUID, TEXT, INT);

CREATE OR REPLACE FUNCTION public.pause_exam_state(
    p_attempt_id UUID,
    p_current_section TEXT,
    p_current_question INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_allow_pause BOOLEAN;
BEGIN
    -- Fetch attempt with paper info
    SELECT a.id, a.user_id, a.status, a.paper_id, a.time_remaining, p.allow_pause
    INTO v_attempt
    FROM public.attempts a
    JOIN public.papers p ON p.id = a.paper_id
    WHERE a.id = p_attempt_id;

    -- Validate attempt exists
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    -- Validate ownership
    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Validate status
    IF v_attempt.status <> 'in_progress' THEN
        RAISE EXCEPTION 'Attempt is not in progress' USING ERRCODE = '42501';
    END IF;

    -- Check if pausing is allowed for this paper
    v_allow_pause := COALESCE(v_attempt.allow_pause, FALSE);
    IF NOT v_allow_pause THEN
        RAISE EXCEPTION 'Pausing is not allowed for this exam' USING ERRCODE = '42501';
    END IF;

    -- Update attempt to paused state
    UPDATE public.attempts
    SET
        status = 'paused',
        current_section = p_current_section,
        current_question = p_current_question,
        last_activity_at = NOW(),
        updated_at = NOW(),
        paused_at = NOW()
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN jsonb_build_object('success', TRUE, 'paused_at', NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION public.pause_exam_state(UUID, TEXT, INT) TO authenticated;

-- --------------------------------------------------------------------------
-- Initialize session: resume paused attempts and add pause duration
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.initialize_exam_session(
    p_attempt_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_new_token UUID;
    v_paused_delta INTEGER := 0;
BEGIN
    -- Fetch attempt
    SELECT id, user_id, status, session_token, paused_at, total_paused_seconds
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.user_id <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status NOT IN ('in_progress', 'paused') THEN
        RAISE EXCEPTION 'Attempt is not active' USING ERRCODE = '42501';
    END IF;

    IF v_attempt.status = 'paused' AND v_attempt.paused_at IS NOT NULL THEN
        v_paused_delta := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_attempt.paused_at))::INT);
    END IF;

    -- Generate new token
    v_new_token := gen_random_uuid();

    -- Update attempt
    UPDATE public.attempts
    SET
        session_token = v_new_token,
        status = CASE WHEN v_attempt.status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW(),
        paused_at = CASE WHEN v_attempt.status = 'paused' THEN NULL ELSE paused_at END,
        total_paused_seconds = COALESCE(total_paused_seconds, 0) + v_paused_delta
    WHERE id = p_attempt_id
      AND user_id = p_user_id;

    RETURN v_new_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_exam_session(UUID, UUID) TO authenticated;

-- --------------------------------------------------------------------------
-- Force resume: resume paused attempts and add pause duration
-- --------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.force_resume_exam_session(UUID, UUID);

CREATE OR REPLACE FUNCTION public.force_resume_exam_session(
    p_attempt_id UUID,
    p_new_session_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_attempt RECORD;
    v_paused_delta INTEGER := 0;
    v_stale_threshold INTERVAL := INTERVAL '7 days';
BEGIN
    -- Get current attempt state
    SELECT id, user_id, status, session_token, last_activity_at, paused_at, total_paused_seconds
    INTO v_attempt
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Validate attempt exists
    IF v_attempt.id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = 'P0002';
    END IF;

    -- Validate ownership
    IF v_attempt.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
    END IF;

    -- Validate status (allow in_progress and paused)
    IF v_attempt.status NOT IN ('in_progress', 'paused') THEN
        RAISE EXCEPTION 'Attempt is not resumable (status: %)', v_attempt.status
            USING ERRCODE = '42501';
    END IF;

    -- Check staleness (allow long gaps for mocks)
    IF v_attempt.last_activity_at IS NOT NULL
       AND v_attempt.last_activity_at < (NOW() - v_stale_threshold) THEN
        RAISE EXCEPTION 'FORCE_RESUME_STALE';
    END IF;

    IF v_attempt.status = 'paused' AND v_attempt.paused_at IS NOT NULL THEN
        v_paused_delta := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_attempt.paused_at))::INT);
    END IF;

    -- Update session token and resume
    UPDATE public.attempts
    SET
        session_token = p_new_session_token,
        status = CASE WHEN v_attempt.status = 'paused' THEN 'in_progress' ELSE status END,
        last_activity_at = NOW(),
        updated_at = NOW(),
        paused_at = CASE WHEN v_attempt.status = 'paused' THEN NULL ELSE paused_at END,
        total_paused_seconds = COALESCE(total_paused_seconds, 0) + v_paused_delta
    WHERE id = p_attempt_id
      AND user_id = auth.uid();

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_resume_exam_session(UUID, UUID) TO authenticated;
````

## File: docs/migrations/021_validate_session_token_atomic.sql
````sql
-- ============================================================================
-- Migration 021: Validate Session Token (Atomic Init)
-- ============================================================================
-- Purpose: Fix TOCTOU race when initializing session_token for the first time.
-- This makes the "token is NULL -> set token" branch atomic.
-- ============================================================================

DROP FUNCTION IF EXISTS public.validate_session_token(UUID, UUID, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS public.validate_session_token(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION public.validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_stored_token UUID;
    v_user_id UUID;
    v_status TEXT;
    v_rows_updated INTEGER := 0;
BEGIN
    -- Get current attempt state
    SELECT session_token, user_id, status
    INTO v_stored_token, v_user_id, v_status
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Check if attempt exists
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check ownership
    IF v_user_id != p_user_id THEN
        RETURN FALSE;
    END IF;

    -- Check status (allow in_progress and paused)
    IF v_status NOT IN ('in_progress', 'paused') THEN
        RETURN FALSE;
    END IF;

    -- If no session token set yet (first request), try to set it atomically
    IF v_stored_token IS NULL THEN
        UPDATE public.attempts
        SET session_token = p_session_token,
            last_activity_at = NOW()
        WHERE id = p_attempt_id
          AND user_id = p_user_id
          AND session_token IS NULL;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

        IF v_rows_updated > 0 THEN
            RETURN TRUE;
        END IF;

        -- Another request set the token first; re-read it.
        SELECT session_token INTO v_stored_token
        FROM public.attempts
        WHERE id = p_attempt_id;
    END IF;

    -- Validate token matches
    IF v_stored_token = p_session_token THEN
        UPDATE public.attempts
        SET last_activity_at = NOW()
        WHERE id = p_attempt_id;
        RETURN TRUE;
    END IF;

    -- Token mismatch
    RETURN FALSE;
END;
$$;

-- Overloaded signature used by API routes (keeps compatibility with named args)
CREATE OR REPLACE FUNCTION public.validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID,
    p_force_resume BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN public.validate_session_token(p_attempt_id, p_session_token, p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID, BOOLEAN) TO authenticated;
````

## File: docs/migrations/022_validate_session_token_single_signature.sql
````sql
-- ============================================================================
-- Migration 022: Validate Session Token (Single Signature)
-- ============================================================================
-- Purpose: Remove overloaded signatures to avoid PostgREST ambiguity.
-- Keeps the atomic init logic from migration 021.
-- ============================================================================

DROP FUNCTION IF EXISTS public.validate_session_token(UUID, UUID, UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION public.validate_session_token(
    p_attempt_id UUID,
    p_session_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_stored_token UUID;
    v_user_id UUID;
    v_status TEXT;
    v_rows_updated INTEGER := 0;
BEGIN
    -- Get current attempt state
    SELECT session_token, user_id, status
    INTO v_stored_token, v_user_id, v_status
    FROM public.attempts
    WHERE id = p_attempt_id;

    -- Check if attempt exists
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check ownership
    IF v_user_id != p_user_id THEN
        RETURN FALSE;
    END IF;

    -- Check status (allow in_progress and paused)
    IF v_status NOT IN ('in_progress', 'paused') THEN
        RETURN FALSE;
    END IF;

    -- If no session token set yet (first request), try to set it atomically
    IF v_stored_token IS NULL THEN
        UPDATE public.attempts
        SET session_token = p_session_token,
            last_activity_at = NOW()
        WHERE id = p_attempt_id
          AND user_id = p_user_id
          AND session_token IS NULL;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

        IF v_rows_updated > 0 THEN
            RETURN TRUE;
        END IF;

        -- Another request set the token first; re-read it.
        SELECT session_token INTO v_stored_token
        FROM public.attempts
        WHERE id = p_attempt_id;
    END IF;

    -- Validate token matches
    IF v_stored_token = p_session_token THEN
        UPDATE public.attempts
        SET last_activity_at = NOW()
        WHERE id = p_attempt_id;
        RETURN TRUE;
    END IF;

    -- Token mismatch
    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_session_token(UUID, UUID, UUID) TO authenticated;
````

## File: docs/migrations/023_access_control_foundations.sql
````sql
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
````

## File: docs/migrations/024_access_control_rls.sql
````sql
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
````

## File: docs/PHASE_0_LAYOUT_GUARDRAILS.md
````markdown
# Phase 0 — Layout Refactor Guardrails

## Goal
Ship layout changes safely with a feature-flagged UI path while preserving current runtime behavior.

## Feature Flag
- `NEXT_PUBLIC_EXAM_LAYOUT_MODE` controls the runtime layout.
- Allowed values:
  - `current` (default)
  - `three-column`

## Definition of Done (per phase)
Run all of the following before marking a phase complete:
1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm build`
````

## File: docs/README.md
````markdown
# Documentation Index

This folder contains all project documentation. Start here to understand the codebase.

## Core Documentation

| Document | Description |
|----------|-------------|
| [BLUEPRINT.md](BLUEPRINT.md) | Feature anchors, milestones, and implementation status |
| [DECISIONS.md](DECISIONS.md) | Architecture decisions and rationale |
| [SCHEMA_SUPABASE.sql](SCHEMA_SUPABASE.sql) | Database schema (source of truth) |
| [CONTENT-SCHEMA.md](CONTENT-SCHEMA.md) | Question/paper content format specification |

## Operational Docs

| Document | Description |
|----------|-------------|
| [Milestone_Change_Log.md](Milestone_Change_Log.md) | Release notes and milestone history |
| [AUDIT_QUERY_PATHS.md](AUDIT_QUERY_PATHS.md) | API and data flow audit notes |

## Migrations

SQL migration scripts in [`migrations/`](migrations/) folder:
- `002_session_locking.sql` - Session locking mechanism
- `003_question_container_architecture.sql` - Question container design
- `004_fetch_attempt_solutions.sql` - Solution fetching RPC
- `005_attempt_state_lockdown.sql` - Attempt state management
- `006_response_flags.sql` - Response flag system
- `006_force_resume_session.sql` - Force resume functionality

Standalone migration files (legacy):
- `MIGRATION_CONTEXTS.sql`, `MIGRATION_M5_SCORING.sql`, `MIGRATION_M6_RBAC.sql`, `MIGRATION_RLS_VIEWS.sql`, `MIGRATION_STATS.sql`

## Archived / Historical

Documents in [`archive/`](archive/) are kept for reference but are **not canonical**:
- `SCHEMA_FIREBASE.md` - Firebase fallback schema (not in use)

## Research

Documents in [`research/`](research/) capture initial explorations:
- `stack-evaluation.md` - Original stack comparison (deployment now on Vercel)
- `convert_paper_metadata.py` - Paper conversion utility script
````

## File: docs/REFACTOR_PLAN_5_PROMPTS.md
````markdown
# Complete Refactor Plan - 5 Copilot Agent Prompts

> **Goal**: Fix the exam submit "ATTEMPT_NOT_FOUND" error and clean up the codebase architecture
> 
> **Commit**: `191409b` - "fix: race condition fixes for exam submit + middleware rewrite"
> 
> **Date**: February 2, 2026

---

## Current Problems Summary

1. **Duplicate ExamClient Components** - Two versions exist causing confusion
2. **Race Conditions** - Timer auto-submit vs manual submit (partially fixed)
3. **Session Token Flow** - Complex validation with multiple failure points
4. **Supabase Client Sprawl** - Multiple clients created inconsistently
5. **RLS Policy Complexity** - Hard to debug which policy is blocking
6. **No Centralized Error Handling** - Errors scattered across components

---

## Prompt 1: Consolidate ExamClient & Create Single Source of Truth

```
TASK: Consolidate the two ExamClient components into one authoritative version

CONTEXT:
- src/app/exam/[attemptId]/ExamClient.tsx (app router version)
- src/features/exam-engine/lib/ExamClient.tsx (feature version)
- Both have similar logic with race condition fixes already applied

DO:
1. Keep src/features/exam-engine/lib/ExamClient.tsx as the SINGLE source
2. Update src/app/exam/[attemptId]/page.tsx to import from features
3. DELETE src/app/exam/[attemptId]/ExamClient.tsx entirely
4. Ensure all imports across the codebase point to the consolidated version
5. Verify the mutex lock pattern (submitLockRef) is preserved
6. Test that the exam page still renders correctly

VERIFY:
- Run `pnpm type-check` - no errors
- Run `pnpm lint` - no errors  
- Manually test /exam/[attemptId] loads correctly
```

---

## Prompt 2: Centralize Supabase Client Creation

```
TASK: Create a single, centralized Supabase client factory pattern

CONTEXT:
- Currently creating Supabase clients in: middleware.ts, actions.ts, API routes, components
- Each creates its own instance with different cookie handling
- This causes session state inconsistencies

DO:
1. Create src/lib/supabase/clients.ts with:
   - createBrowserClient() - for client components
   - createServerClient(cookies) - for server components/actions
   - createRouteHandlerClient(cookies) - for API routes
   - getServiceRoleClient() - for admin operations (already exists)

2. Update all files to use the centralized factories:
   - src/features/exam-engine/lib/actions.ts
   - src/app/api/submit/route.ts
   - src/app/api/save/route.ts
   - src/app/api/pause/route.ts
   - src/app/api/session/route.ts
   - All admin API routes

3. Add JSDoc comments explaining when to use each client type

VERIFY:
- Run `pnpm type-check`
- Grep for `createServerClient` outside src/lib/supabase - should be minimal
- Test auth flow works end-to-end
```

---

## Prompt 3: Simplify Submit Flow & Add Comprehensive Logging

```
TASK: Refactor the exam submit flow to be linear and debuggable

CONTEXT:
- Current flow: Timer → useExamTimer → ExamLayout → ExamClient → actions.ts → API
- Multiple entry points for submit (timer auto-submit, manual button, beforeunload)
- Hard to trace where failures occur

DO:
1. Create src/features/exam-engine/lib/submitExam.ts as the SINGLE entry point:
   ```typescript
   export async function submitExam(params: {
     attemptId: string;
     sessionToken: string;
     responses: Record<string, UserResponse>;
     source: 'timer' | 'manual' | 'beforeunload';
   }): Promise<SubmitResult>
   ```

2. Add structured logging at every step:
   - [SUBMIT:START] source, attemptId, responseCount
   - [SUBMIT:VALIDATE] sessionToken status
   - [SUBMIT:SAVE] saving responses
   - [SUBMIT:STATUS] updating attempt status
   - [SUBMIT:COMPLETE] or [SUBMIT:ERROR] with details

3. Update ExamClient and ExamLayout to use the new submitExam function

4. Remove duplicate submit logic from:
   - useExamTimer hook (it should only CALL submitExam)
   - ExamLayout (should only call submitExam)

5. Add a debug panel (only in dev) showing submit state

VERIFY:
- Console shows clear [SUBMIT:*] logs during submission
- Only ONE code path for actual submission
- Run `pnpm type-check`
```

---

## Prompt 4: Fix RLS & Database Layer

```
TASK: Audit and fix the Supabase RLS policies for exam attempts

CONTEXT:
- ATTEMPT_NOT_FOUND error suggests RLS is blocking the query
- Multiple migration files with overlapping policies
- Service role bypasses RLS, hiding issues during admin testing

DO:
1. Create docs/migrations/015_rls_audit_and_fix.sql with:
   - DROP all existing attempt-related policies
   - CREATE clean, minimal policies:
     - attempts_select_own: user can SELECT their own attempts
     - attempts_update_own_in_progress: user can UPDATE if status='in_progress'
     - attempts_submit_own: user can UPDATE status to 'submitted' if currently 'in_progress'

2. Create a test script scripts/test-rls-policies.mjs that:
   - Creates a test user
   - Creates an attempt as that user
   - Verifies SELECT works
   - Verifies UPDATE works for in_progress
   - Verifies UPDATE to 'submitted' works
   - Cleans up test data

3. Document the expected RLS behavior in docs/RLS_POLICIES.md

4. Update the submitExam action to include better error messages:
   - If attempt not found: check if attemptId exists at all (service role query)
   - If exists but query failed: "RLS policy blocked access"
   - Include user_id and attempt_id in error for debugging

VERIFY:
- Run the RLS test script against local Supabase
- Submit flow should show clear error if RLS blocks
```

---

## Prompt 5: End-to-End Testing & Cleanup

```
TASK: Add E2E tests for critical flows and clean up dead code

CONTEXT:
- No automated tests for the submit flow
- Dead code from previous iterations
- Need confidence the refactored code works

DO:
1. Create src/features/exam-engine/lib/__tests__/submitExam.test.ts:
   - Test successful submission
   - Test mutex lock prevents double submit
   - Test handles network errors gracefully
   - Test handles RLS errors with clear message

2. Create src/features/exam-engine/lib/__tests__/examFlow.integration.test.ts:
   - Mock Supabase responses
   - Test full flow: start exam → answer questions → submit → verify result

3. Remove dead code:
   - Delete src/utils/update-session.ts (no longer used by middleware)
   - Remove any orphaned imports
   - Remove commented-out code blocks

4. Update docs/BLUEPRINT.md with:
   - New architecture diagram showing single submit flow
   - Updated file locations after consolidation
   - Testing instructions

5. Final verification checklist:
   - [ ] `pnpm type-check` passes
   - [ ] `pnpm lint` passes
   - [ ] `pnpm test` passes (if vitest configured)
   - [ ] Manual test: start exam, answer, submit, see results
   - [ ] Manual test: let timer expire, auto-submit works
   - [ ] Manual test: refresh during exam, session restored

VERIFY:
- All tests pass
- No TypeScript errors
- Submit works end-to-end
```

---

## Execution Order

| Prompt | Focus Area | Risk Level | Estimated Files Changed |
|--------|------------|------------|------------------------|
| 1 | ExamClient consolidation | Medium | 3-5 files |
| 2 | Supabase client factory | Medium | 10-15 files |
| 3 | Submit flow simplification | High | 5-8 files |
| 4 | RLS policies | High | 2-3 SQL files + 1 script |
| 5 | Testing & cleanup | Low | 5-10 files |

---

## Pre-Requisites Before Starting

1. **Push to GitHub** (fix the credential issue first):
   ```bash
   # Option 1: Use SSH
   git remote set-url origin git@github.com:Aakarsh-Arya/cat_mock_website.git
   git push origin main
   
   # Option 2: Re-authenticate via GitHub CLI
   gh auth login
   git push origin main
   ```

2. **Verify local Supabase is running** for RLS testing

3. **Create a test branch**:
   ```bash
   git checkout -b refactor/exam-submit-fix
   ```

---

## Rollback Plan

If any prompt causes breaking changes:

```bash
# Return to known good state
git checkout main
git reset --hard 191409b

# Or revert specific prompt's changes
git revert HEAD
```

---

## Success Criteria

After all 5 prompts:
- ✅ Single ExamClient component
- ✅ Centralized Supabase client factory
- ✅ One linear submit flow with logging
- ✅ Clean RLS policies with test script
- ✅ E2E tests for critical paths
- ✅ No TypeScript/lint errors
- ✅ Exam submit works reliably
````

## File: docs/research/convert_paper_metadata.py
````python
#!/usr/bin/env python3
"""
Convert a CAT paper metadata DOCX into the JSON schema used by scripts/import-paper.mjs
and optionally upload it to Supabase.

Usage:
  python docs/research/convert_paper_metadata.py --docx "/path/to/PAPER METADATA_CAT2024_slot1.docx" --out data/cat-2024-slot1.json --publish

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

## File: docs/research/stack-evaluation.md
````markdown
# Stack Evaluation (SSOT Export)

> **Note:** This document captures initial stack research. Deployment platform is now **Vercel** (not Netlify as originally considered).

## Primary: Next.js + Supabase (Free Tier)
- Vercel serves the Next.js App Router with SSR/ISR; Supabase provides Auth, Postgres, and Storage.
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

## File: docs/ROOT_CAUSE_ANALYSIS_SUBMIT_ERROR.md
````markdown
# Root Cause Analysis: Exam Submit "Attempt Not Found" Error

## Executive Summary

After comprehensive analysis of the exam submission flow, I've identified **6 potential root causes** and **3 race conditions** that could lead to the "ATTEMPT_NOT_FOUND" or "This exam attempt was removed" error during submission.

---

## 🔴 Critical Finding: Multiple Submit Triggers Can Race

### The Problem

There are **TWO independent paths** that can trigger exam submission:

1. **Timer Auto-Submit** (`useExamTimer.ts` → `handleAutoSubmitExam`)
2. **Manual Click Submit** (`ExamClient.tsx` → `handleSubmitExam`)

Both can fire nearly simultaneously, causing race conditions.

---

## Root Cause Analysis

### 🔴 Root Cause #1: Timer Auto-Submit and Manual Submit Race Condition

**Location:** 
- [useExamTimer.ts#L133-L165](src/features/exam-engine/hooks/useExamTimer.ts#L133-L165)
- [ExamClient.tsx#L500-L700](src/app/exam/[attemptId]/ExamClient.tsx#L500-L700)

**Problem:**
When the timer expires AND the user clicks submit at the same time:

1. `useExamTimer` calls `handleSectionExpiry('QA')` → triggers `onExamComplete` → `handleAutoSubmitExam`
2. User clicks "Submit" → triggers `handleSubmitExam`
3. Both call `submitExam()` with the same `attemptId`

**Race Timeline:**
```
T+0ms:   Timer expires, QA section → handleSectionExpiry()
T+1ms:   setAutoSubmitting(true)
T+2ms:   User clicks submit (sees UI before state update)
T+3ms:   handleSubmitExam() starts (checks isAutoSubmitting - may be false in closure!)
T+50ms:  First submitExam() → status changes to 'submitted'
T+100ms: Second submitExam() → Attempt is now 'submitted', not 'in_progress' → ERROR
```

**Current Guard (Insufficient):**
```typescript
// ExamClient.tsx line 406
if (isSubmittingRef.current || isAutoSubmittingRef.current) return;
```

This guard uses refs, but there's a **window between checking the ref and setting it** where both paths can pass through.

---

### 🔴 Root Cause #2: Double Submit via Atomic Status Transition Failure

**Location:** [actions.ts#L650-L665](src/features/exam-engine/lib/actions.ts#L650-L665)

**Problem:**
The submit action uses an atomic status transition:

```typescript
let updateQuery = adminClient
    .from('attempts')
    .update({ status: 'submitted', submitted_at: submittedAt, submission_id: submissionId })
    .eq('id', normalizedAttemptId)
    .eq('status', 'in_progress');  // ← Only matches if still 'in_progress'
```

If two submits race:
1. First submit: Changes `in_progress` → `submitted` ✅
2. Second submit: `.eq('status', 'in_progress')` returns **no rows** because status is now `submitted`
3. `updatedAttempt` is `null` → Returns error: "Attempt already submitted by another request"

**But the actual error returned is:** `ATTEMPT_NOT_FOUND` or `Attempt not found`

This happens because of a **fallback lookup that fails** at line 500-530 in actions.ts.

---

### 🔴 Root Cause #3: Session Token Refresh During Submit

**Location:** [ExamClient.tsx#L504-L510](src/app/exam/[attemptId]/ExamClient.tsx#L504-L510)

**Problem:**
```typescript
const handleSubmitExam = useCallback(async () => {
    // ...
    setSubmitting(true);  // This is AFTER session check, not before!
    
    try {
        const activeSessionToken = await forceRefreshSessionToken();  // ← Can race
```

If `forceRefreshSessionToken()` is called by **two concurrent submits**:
1. First call: Gets new token, writes to DB
2. Second call: Gets different token, overwrites in DB
3. First submit uses old token → `validate_session_token` fails → SESSION_CONFLICT

---

### 🔴 Root Cause #4: Attempt Lookup Fails Before RLS Check

**Location:** [actions.ts#L487-L530](src/features/exam-engine/lib/actions.ts#L487-L530)

**The Actual Error Flow:**
```typescript
let { data: attempt, error: attemptError } = await adminClient
    .from('attempts')
    .select('user_id, status, paper_id, started_at, submission_id')
    .eq('id', normalizedAttemptId)
    .maybeSingle();

if (attemptError || !attempt) {
    // ... fallback logic ...
    return { success: false, error: 'Attempt not found' };  // ← This is your error!
}
```

**Why the lookup fails:**
1. **UUID mismatch**: The `attemptId` being passed is not a valid UUID format
2. **Wrong attempt ID**: Frontend sends stale/cached attemptId from localStorage
3. **Timing**: Attempt was deleted/modified between lookup and submit

---

### 🔴 Root Cause #5: localStorage State Mismatch

**Location:** [useExamStore.ts#L115-L130](src/features/exam-engine/model/useExamStore.ts#L115-L130)

**Problem:**
```typescript
// PHASE 1 FIX: Check if we're resuming the same attempt with persisted state
if (currentState.attemptId === attempt.id && currentState.hasHydrated) {
    examDebug.resume({...});
    return;  // ← Preserves OLD state including OLD attemptId
}
```

Scenario:
1. User starts exam → attemptId = `abc-123`
2. User closes browser mid-exam
3. Admin deletes/resets the attempt in Supabase
4. User returns → localStorage still has `attemptId = abc-123`
5. User submits → looks for non-existent attempt → ATTEMPT_NOT_FOUND

---

### 🔴 Root Cause #6: Concurrent API Calls via Refs Not Protecting Correctly

**Location:** [ExamClient.tsx#L145-L165](src/app/exam/[attemptId]/ExamClient.tsx#L145-L165)

```typescript
const isSubmittingRef = useRef(isSubmitting);
const isAutoSubmittingRef = useRef(isAutoSubmitting);

// Keep refs fresh every render
isSubmittingRef.current = isSubmitting;  // ← Updated on re-render, not immediately
```

**Problem:** Refs are updated on re-render, but the state change triggers re-render asynchronously. There's a gap where the ref still has the old value.

---

## 🟡 Race Condition Summary

### Race #1: Timer vs Manual Submit
```
useExamTimer.handleSectionExpiry() 
    → setAutoSubmitting(true)
    → expireSection()
    → onExamComplete()
        → ExamLayout.handleAutoSubmitExam()
            → syncPendingResponses()
            → onSubmitExam()
                → ExamClient.handleSubmitExam()
                    → submitExam()

CONCURRENT WITH:

User clicks Submit
    → ExamLayout.handleManualSubmitExam()
        → syncPendingResponses()
        → onSubmitExam()
            → ExamClient.handleSubmitExam()
                → submitExam()
```

### Race #2: Section Expire vs User Navigation
When QA section expires while user is clicking around, the section expiry handler runs, but user action handlers also run.

### Race #3: Session Token Refresh Collision
```
Call A: initializeExamSession() → generates token ABC
Call B: initializeExamSession() → generates token XYZ (overwrites ABC in DB)
Call A: submitExam(token: ABC) → validate_session_token fails → SESSION_CONFLICT
```

---

## ✅ Recommended Fixes

### Fix #1: Add Mutex/Lock for Submit Operations

```typescript
// In ExamClient.tsx, add a submission lock
const submitLockRef = useRef<boolean>(false);

const handleSubmitExam = useCallback(async () => {
    // CRITICAL: Atomic check-and-set
    if (submitLockRef.current) {
        console.log('Submit already in progress, ignoring duplicate');
        return;
    }
    submitLockRef.current = true;
    
    try {
        // ... existing submit logic
    } finally {
        submitLockRef.current = false;
    }
}, [...]);
```

### Fix #2: Coordinate Timer and Manual Submit

```typescript
// In useExamTimer.ts, before calling onExamComplete
const storeState = useExamStore.getState();
if (storeState.isSubmitting) {
    // Manual submit already in progress, skip auto-submit
    return;
}
```

### Fix #3: Validate attemptId Before Submit

```typescript
// In handleSubmitExam, validate attemptId matches server
const handleSubmitExam = useCallback(async () => {
    const aId = attemptIdRef.current ?? attempt.id;
    
    // Sanity check: verify attempt exists before proceeding
    const { data: checkAttempt } = await adminClient
        .from('attempts')
        .select('id, status')
        .eq('id', aId)
        .maybeSingle();
    
    if (!checkAttempt) {
        setUiError('Exam session not found. It may have been reset.');
        router.push('/dashboard');
        return;
    }
    
    if (checkAttempt.status !== 'in_progress') {
        // Already submitted/completed
        router.push(`/result/${aId}`);
        return;
    }
    
    // ... proceed with submit
}, [...]);
```

### Fix #4: Clear localStorage on Attempt Error

```typescript
// When ATTEMPT_NOT_FOUND is received, ensure full cleanup
if (result.error === 'ATTEMPT_NOT_FOUND') {
    // Clear ALL exam state, not just the specific key
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('cat-exam-state-')) {
            localStorage.removeItem(key);
        }
    });
    router.push('/dashboard');
    return;
}
```

### Fix #5: Server-Side Idempotency Check

```typescript
// In actions.ts submitExam, add better idempotency
if (attempt.status === 'completed' || attempt.status === 'submitted') {
    // Don't error - return success with existing data
    return { 
        success: true, 
        data: { 
            success: true, 
            already_submitted: true,
            // Include existing scores so UI can redirect properly
        } 
    };
}
```

### Fix #6: Single-Flight Session Token

```typescript
// Already implemented but verify it's used everywhere
const sessionTokenPromiseRef = useRef<Promise<string | null> | null>(null);

const ensureSessionToken = useCallback(async (): Promise<string | null> => {
    // De-dupe concurrent refreshes
    if (sessionTokenPromiseRef.current) {
        return sessionTokenPromiseRef.current;  // Return same promise, don't create new
    }
    // ...
}, [...]);
```

---

## 🔍 Diagnostic Steps to Identify Your Specific Issue

### Step 1: Check Browser Console
Look for these log messages before the error:
- `SUBMIT_ATTEMPT_ID_RECEIVED:` - What attemptId is being sent?
- `SUBMIT_ATTEMPT_QUERY_RESULT:` - Is the query returning data?
- `SUBMIT_ATTEMPT_QUERY_ERROR:` - Any database errors?

### Step 2: Check Supabase Logs
In Supabase Dashboard → Logs → API:
- Filter for your user ID
- Look for the sequence of calls around submission time
- Check if multiple submits are happening

### Step 3: Verify Attempt Status
```sql
SELECT id, status, submitted_at, completed_at, session_token, created_at
FROM attempts
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 5;
```

### Step 4: Check for Race Condition
Add temporary logging:
```typescript
// In handleSubmitExam
console.log('[SUBMIT] Starting', { 
    attemptId: aId, 
    isSubmitting: isSubmittingRef.current,
    isAutoSubmitting: isAutoSubmittingRef.current,
    timestamp: Date.now()
});
```

---

## 📋 Quick Checklist

- [ ] Is `isSubmitting` or `isAutoSubmitting` true when submit is called?
- [ ] Is the attemptId a valid UUID format?
- [ ] Does the attempt exist in Supabase with status `in_progress`?
- [ ] Is the session token valid (not expired)?
- [ ] Are there multiple submits in quick succession in the logs?
- [ ] Is localStorage holding stale attempt data?

---

## Next Steps

1. **Apply Fix #1** (mutex lock) - Prevents race conditions
2. **Add diagnostic logging** - Identify the specific race condition
3. **Test timer expiry scenario** - Let exam time out vs manual submit
4. **Verify environment** - Ensure service role key matches Supabase project
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
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.papers (
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
  allow_pause BOOLEAN DEFAULT FALSE,  -- Whether this paper allows pausing attempts
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
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
CREATE TABLE IF NOT EXISTS public.attempts (
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
CREATE TABLE IF NOT EXISTS public.responses (
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
CREATE TABLE IF NOT EXISTS public.leaderboard (
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
CREATE TABLE IF NOT EXISTS public.user_analytics (
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
    public.is_admin()
    OR (
      -- Published papers within availability window
      published = true
      AND (available_from IS NULL OR available_from <= NOW())
      AND (available_until IS NULL OR available_until >= NOW())
    )
  );

-- Questions policies (SECURITY HARDENED - Step 0.8)
-- Users can ONLY read questions (including correct_answer) for COMPLETED attempts.
-- This prevents answer leakage during in_progress exams.
-- For exam runtime, use the questions_exam view which excludes correct_answer.
CREATE POLICY "Users can read questions for their completed attempts" ON public.questions
  FOR SELECT TO authenticated 
  USING (
    is_active = true
    AND paper_id IN (
      SELECT paper_id FROM public.attempts
      WHERE user_id = auth.uid()
        AND status IN ('submitted', 'completed')
        AND submitted_at IS NOT NULL
    )
  );

-- Attempts policies
CREATE POLICY "Users can view their own attempts" ON public.attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create attempts within limit" ON public.attempts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
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

CREATE POLICY "Users can update their own attempts" ON public.attempts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (
        status = (SELECT status FROM public.attempts a WHERE a.id = attempts.id)
        AND submitted_at IS NOT DISTINCT FROM (SELECT submitted_at FROM public.attempts a WHERE a.id = attempts.id)
        AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
      )
      OR
      (
        (SELECT status FROM public.attempts a WHERE a.id = attempts.id) = 'in_progress'
        AND status = 'submitted'
        AND submitted_at IS NOT NULL
        AND completed_at IS NOT DISTINCT FROM (SELECT completed_at FROM public.attempts a WHERE a.id = attempts.id)
      )
    )
  );

-- Responses policies
CREATE POLICY "Users can view their own responses" ON public.responses
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.attempts WHERE id = attempt_id)
  );

-- Column-level security (restrict sensitive fields from direct client access)
REVOKE SELECT (correct_answer) ON public.questions FROM authenticated;
REVOKE SELECT (session_token) ON public.attempts FROM authenticated;
REVOKE UPDATE (session_token) ON public.attempts FROM authenticated;

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

-- ============================================================================
-- DEPRECATED — do not apply after MIGRATION_RLS_VIEWS.sql
-- The safe perimeter is enforced via questions_exam + fetch_attempt_solutions RPC.
-- Any solution-bearing view must NOT be granted to authenticated users.
-- ============================================================================

-- View for results/solutions: questions WITH answers (for post-submission review)
-- NOTE: This view is deprecated; do NOT grant to authenticated. Use RPC instead.
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

-- REVOKE ALL and rely on fetch_attempt_solutions RPC (see migrations/004_fetch_attempt_solutions.sql)
REVOKE ALL ON public.questions_with_solutions FROM PUBLIC;
REVOKE ALL ON public.questions_with_solutions FROM anon;
REVOKE ALL ON public.questions_with_solutions FROM authenticated;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SCORING FUNCTION (DEPRECATED)
-- ============================================================================
-- Legacy SQL scoring via public.finalize_attempt(attempt_id) is deprecated.
-- Scoring is now handled by the TypeScript scoring engine in submitExam().
-- If present in your database, drop it via migration 012_phase1_security_hardening.sql.

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

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

## File: paper_v3.json
````json
{
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "cat-2022-slot-1",
    "title": "CAT 2022 Slot 1",
    "slug": "cat-2022-slot-1",
    "description": "Official CAT 2022 Slot 1 Question Paper inferred from content",
    "year": 2022,
    "total_questions": 66,
    "total_marks": 198,
    "duration_minutes": 120,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ],
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "medium",
    "is_free": false,
    "published": false,
    "allow_pause": true,
    "attempt_limit": 0
  },
  "question_sets": [
    {
      "client_set_id": "VARC_RC_1",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 1,
      "context_type": "rc_passage",
      "context_title": "Stoicism & Emotions",
      "content_layout": "split_passage",
      "context_body": "Stoicism was founded in 300 BC by the Greek philosopher Zeno and survived into the Roman era until about AD 300\\. According to the Stoics, emotions consist of two movements. The first movement is the immediate feeling and other reactions (e.g., physiological response) that occur when a stimulus or event occurs. For instance, consider what could have happened if an army general accused Marcus Aurelius of treason in front of other officers. The first movement for Marcus may have been (internal) surprise and anger in response to this insult, accompanied perhaps by some involuntary physiological and expressive responses such as face flushing and a movement of the eyebrows. The second movement is what one does next about the emotion. Second movement behaviors occur after thinking and are under one’s control. Examples of second movements for Marcus might have included a plot to seek revenge, actions signifying deference and appeasement, or perhaps proceeding as he would have proceeded whether or not this event occurred: continuing to lead the Romans in a way that Marcus Aurelius believed best benefited them. In the Stoic view, choosing a reasoned, unemotional response as the second movement is the only appropriate response.\nThe Stoics believed that to live the good life and be a good person, we need to free ourselves of nearly all desires such as too much desire for money, power, or sexual gratification. Prior to second movements, we can consider what is important in life. Money, power, and excessive sexual gratification are not important. Character, rationality, and kindness are important. The Epicureans, first associated with the Greek philosopher Epicurus . . . held a similar view, believing that people should enjoy simple pleasures, such as good conversation, friendship, food, and wine, but not be indulgent in these pursuits and not follow passion for those things that hold no real value like power and money. As Oatley (2004) states, “the Epicureans articulated a view —enjoyment of relationship with friends, of things that are real rather than illusory, simple rather than artificially inflated, possible rather than vanishingly unlikely—that is certainly relevant today” . . .\nIn sum, these ancient Greek and Roman philosophers saw emotions, especially strong ones, as potentially dangerous. They viewed emotions as experiences that needed to be \\[reined\\] in and controlled. As Oatley (2004) points out, the Stoic idea bears some similarity to Buddhism. Buddha, living in India in the 6th century BC, argued for cultivating a certain attitude that decreases the probability of (in Stoic terms) destructive second movements. Through meditation and the right attitude, one allows emotions to happen to oneself (it is impossible to prevent this), but one is advised to observe the emotions without necessarily acting on them; one achieves some distance and decides what has value and what does not have value. Additionally, the Stoic idea of developing virtue in oneself, of becoming a good person, which the Stoics believed we could do because we have a touch of the divine, laid the foundation for the three monotheistic religions: Judaism, Christianity, and Islam . . . As with Stoicism, tenets of these religions include controlling our emotions lest we engage in sinful behavior."
    },
    {
      "client_set_id": "VARC_RC_2",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 2,
      "context_type": "rc_passage",
      "context_title": "Copies (East vs West)",
      "content_layout": "split_passage",
      "context_body": "The Chinese have two different concepts of a copy. Fangzhipin . . . are imitations where the difference from the original is obvious. These are small models or copies that can be purchased in a museum shop, for example. The second concept for a copy is fuzhipin . . . They are exact reproductions of the original, which, for the Chinese, are of equal value to the original. It has absolutely no negative connotations. The discrepancy with regard to the understanding of what a copy is has often led to misunderstandings and arguments between China and Western museums. The Chinese often send copies abroad instead of originals, in the firm belief that they are not essentially different from the originals. The rejection that then comes from the Western museums is perceived by the Chinese as an insult. . . .\nThe Far Eastern notion of identity is also very confusing to the Western observer. The Ise Grand Shrine \\[in Japan\\] is 1,300 years old for the millions of Japanese people who go there on pilgrimage every year. But in reality this temple complex is completely rebuilt from scratch every 20 years. . . . The cathedral of Freiburg Minster in southwest Germany is covered in scaffolding almost all year round. The sandstone from which it is built is a very soft, porous material that does not withstand natural erosion by rain and wind. After a while, it crumbles. As a result, the cathedral is continually being examined for damage, and eroded stones are replaced. And in the cathedral’s dedicated workshop, copies of the damaged sandstone figures are constantly being produced. Of course, attempts are made to preserve the stones from the Middle Ages for as long as possible. But at some point they, too, are removed and replaced with new stones. Fundamentally, this is the same operation as with the Japanese shrine, except in this case the production of a replica takes place very slowly and over long periods of time. . . .\nIn the field of art as well, the idea of an unassailable original developed historically in the Western world. Back in the 17th century \\[in the West\\], excavated artworks from antiquity were treated quite differently from today. They were not restored in a way that was faithful to the original. Instead, there was massive intervention in these works, changing their appearance. . . . It is probably this intellectual position that explains why Asians have far fewer scruples about cloning than Europeans. The South Korean cloning researcher Hwang Woo-suk, who attracted worldwide attention with his cloning experiments in 2004, is a Buddhist. He found a great deal of support and followers among Buddhists, while Christians called for a ban on human cloning. . . . Hwang legitimised his cloning experiments with his religious affiliation: ‘I am Buddhist, and I have no philosophical problem with cloning. And as you know, the basis of Buddhism is that life is recycled through reincarnation. In some ways, I think, therapeutic cloning restarts the circle of life.’"
    },
    {
      "client_set_id": "VARC_RC_3",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 3,
      "context_type": "rc_passage",
      "context_title": "The Undead",
      "content_layout": "split_passage",
      "context_body": "Stories concerning the Undead have always been with us. From out of the primal darkness of Mankind’s earliest years, come whispers of eerie creatures, not quite alive (or alive in a way which we can understand), yet not quite dead either. These may have been ancient and primitive deities who dwelt deep in the surrounding forests and in remote places, or simply those deceased who refused to remain in their tombs and who wandered about the countryside, physically tormenting and frightening those who were still alive. Mostly they were ill-defined—strange sounds in the night beyond the comforting glow of the fire, or a shape, half-glimpsed in the twilight along the edge of an encampment. They were vague and indistinct, but they were always there with the power to terrify and disturb. They had the power to touch the minds of our early ancestors and to fill them with dread. Such fear formed the basis of the earliest tales although the source and exact nature of such terrors still remained very vague.\nAnd as Mankind became more sophisticated, leaving the gloom of their caves and forming themselves into recognizable communities—towns, cities, whole cultures—so the Undead travelled with them, inhabiting their folklore just as they had in former times. Now they began to take on more definite shapes. They became walking cadavers; the physical embodiment of former deities and things which had existed alongside Man since the Creation. Some still remained vague and ill-defined but, as Mankind strove to explain the horror which it felt towards them, such creatures emerged more readily into the light. In order to confirm their abnormal status, many of the Undead were often accorded attributes, which defied the natural order of things—the power to transform themselves into other shapes, the ability to sustain themselves by drinking human blood, and the ability to influence human minds across a distance. Such powers—described as supernatural—only \\[lent\\] an added dimension to the terror that humans felt regarding them.\nAnd it was only natural, too, that the Undead should become connected with the practice of magic. From very early times, Shamans and witchdoctors had claimed at least some power and control over the spirits of departed ancestors, and this has continued down into more “civilized” times. Formerly, the invisible spirits and forces that thronged around men’s earliest encampments, had spoken “through” the tribal Shamans but now, as entities in their own right, they were subject to magical control and could be physically summoned by a competent sorcerer. However, the relationship between the magician and an Undead creature was often a very tenuous and uncertain one. Some sorcerers might have even become Undead entities once they died, but they might also have been susceptible to the powers of other magicians when they did. From the Middle Ages and into the Age of Enlightenment, theories of the Undead continued to grow and develop. Their names became more familiar—werewolf, vampire, ghoul—each one certain to strike fear into the hearts of ordinary humans."
    },
    {
      "client_set_id": "VARC_RC_4",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 4,
      "context_type": "rc_passage",
      "context_title": "Critical Theory of Technology",
      "content_layout": "split_passage",
      "context_body": "Critical theory of technology is a political theory of modernity with a normative dimension. It belongs to a tradition extending from Marx to Foucault and Habermas according to which advances in the formal claims of human rights take center stage while in the background centralization of ever more powerful public institutions and private organizations imposes an authoritarian social order. Marx attributed this trajectory to the capitalist rationalization of production. Today it marks many institutions besides the factory and every modern political system, including so-called socialist systems. This trajectory arose from the problems of command over a disempowered and deskilled labor force; but everywhere \\[that\\] masses are organized \\- whether it be Foucault’s prisons or Habermas’s public sphere \\- the same pattern prevails. Technological design and development is shaped by this pattern as the material base of a distinctive social order. Marcuse would later point to a “project” as the basis of what he called rather confusingly “technological rationality.” Releasing technology from this project is a democratic political task.\nIn accordance with this general line of thought, critical theory of technology regards technologies as an environment rather than as a collection of tools. We live today with and even within technologies that determine our way of life. Along with the constant pressures to build centers of power, many other social values and meanings are inscribed in technological design. A hermeneutics of technology must make explicit the meanings implicit in the devices we use and the rituals they script. Social histories of technologies such as the bicycle, artificial lighting or firearms have made important contributions to this type of analysis. Critical theory of technology attempts to build a methodological approach on the lessons of these histories.\nAs an environment, technologies shape their inhabitants. In this respect, they are comparable to laws and customs. Each of these institutions can be said to represent those who live under their sway through privileging certain dimensions of their human nature. Laws of property represent the interest in ownership and control. Customs such as parental authority represent the interest of childhood in safety and growth. Similarly, the automobile represents its users in so far as they are interested in mobility. Interests such as these constitute the version of human nature sanctioned by society.\nThis notion of representation does not imply an eternal human nature. The concept of nature as non-identity in the Frankfurt School suggests an alternative. On these terms, nature is what lies at the limit of history, at the point at which society loses the capacity to imprint its meanings on things and control them effectively. The reference here is, of course, not to the nature of natural science, but to the lived nature in which we find ourselves and which we are. This nature reveals itself as that which cannot be totally encompassed by the machinery of society. For the Frankfurt School, human nature, in all its transcending force, emerges out of a historical context as that context is \\[depicted\\] in illicit joys, struggles and pathologies. We can perhaps admit a less romantic . . . conception in which those dimensions of human nature recognized by society are also granted theoretical legitimacy."
    },
    {
      "client_set_id": "VARC_ATOMIC_1",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 5
    },
    {
      "client_set_id": "DILR_SET_1",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 1,
      "context_type": "dilr_set",
      "context_title": "Hockey Players",
      "content_layout": "split_table",
      "context_body": "The management of a university hockey team was evaluating performance of four women players \\- Amla, Bimla, Harita and Sarita for their possible selection in the university team for next year. For this purpose, the management was looking at the number of goals scored by them in the past 8 matches, numbered 1 through 8\\. The four players together had scored a total of 12 goals in these matches. In the 8 matches, each of them had scored at least one goal. No two players had scored the same total number of goals. The following facts are known about the goals scored by these four players only:\n1\\. Only one goal was scored in every even numbered match.\n2\\. Harita scored more goals than Bimla.\n3\\. The highest goal scorer scored goals in exactly 3 matches including Match 4 and Match 8\\.\n4\\. Bimla scored a goal in Match 1 and one each in three other consecutive matches.\n5\\. An equal number of goals were scored in Match 3 and Match 7, which was different from the number of goals scored in either Match 1 or Match 5\\.\n6\\. The match in which the highest number of goals was scored was unique and it was not Match 5\\."
    },
    {
      "client_set_id": "DILR_SET_2",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 2,
      "context_type": "dilr_set",
      "context_title": "Class Get-Together",
      "content_layout": "split_table",
      "context_body": "There are 15 girls and some boys among the graduating students in a class. They are planning a get-together, which can be either a 1-day event, or a 2-day event, or a 3-day event. There are 6 singers in the class, 4 of them are boys. There are 10 dancers in the class, 4 of them are girls. No dancer in the class is a singer. Some students are not interested in attending the get-together. Those students who are interested in attending a 3-day event are also interested in attending a 2-day event; those who are interested in attending a 2-day event are also interested in attending a 1-day event. The following facts are also known:\n1\\. All the girls and 80% of the boys are interested in attending a 1-day event. 60% of the boys are interested in attending a 2-day event.\n2\\. Some of the girls are interested in attending a 1-day event, but not a 2-day event; some of the other girls are interested in attending both.\n3\\. 70% of the boys who are interested in attending a 2-day event are neither singers nor dancers. 60% of the girls who are interested in attending a 2-day event are neither singers nor dancers.\n4\\. No girl is interested in attending a 3-day event. All male singers and 2 of the dancers are interested in attending a 3-day event.\n5\\. The number of singers interested in attending a 2-day event is one more than the number of dancers interested in attending a 2-day event."
    },
    {
      "client_set_id": "DILR_SET_3",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 3,
      "context_type": "dilr_set",
      "context_title": "Funding Tokens",
      "content_layout": "split_table",
      "context_body": "Adhara, Bithi, Chhaya, Dhanavi, Esther, and Fathima are the interviewers in a process that awards funding for new initiatives. Every interviewer individually interviews each of the candidates individually and awards a token only if she recommends funding. A token has a face value of 2, 3, 5, 7, 11, or 13\\. Each interviewer awards tokens of a single face value only. Once all six interviews are over for a candidate, the candidate receives a funding that is Rs.1000 times the product of the face values of all the tokens. For example, if a candidate has tokens with face values 2, 5, and 7, then they get a funding of Rs.1000 × (2 × 5 × 7\\) \\= Rs.70,000. Pragnyaa, Qahira, Rasheeda, Smera, and Tantra were five candidates who received funding. The funds they received, in descending order, were Rs.390,000, Rs.210,000, Rs.165,000, Rs.77,000, and Rs.66,000. The following additional facts are known:\n1\\. Fathima awarded tokens to everyone except Qahira, while Adhara awarded tokens to no one except Pragnyaa.\n2\\. Rasheeda received the highest number of tokens that anyone received, but she did not receive one from Esther.\n3\\. Bithi awarded a token to Smera but not to Qahira, while Dhanavi awarded a token to Qahira but not to Smera."
    },
    {
      "client_set_id": "DILR_SET_4",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 4,
      "context_type": "dilr_set",
      "context_title": "Metro Services",
      "content_layout": "split_table",
      "context_body": "Given above is the schematic map of the metro lines in a city with rectangles denoting terminal stations (e.g. A), diamonds denoting junction stations (e.g. R) and small filled-up circles denoting other stations. Each train runs either in east-west or north-south direction, but not both. All trains stop for 2 minutes at each of the junction stations on the way and for 1 minute at each of the other stations. It takes 2 minutes to reach the next station for trains going in east-west direction and 3 minutes to reach the next station for trains going in north-south direction. From each terminal station, the first train starts at 6 am; the last trains leave the terminal stations at midnight. Otherwise, during the service hours, there are metro service every 15 minutes in the north-south lines and every 10 minutes in the east-west lines. A train must rest for at least 15 minutes after completing a trip at the terminal station, before it can undertake the next trip in the reverse direction. (All questions are related to this metro service only. Assume that if someone reaches a station exactly at the time a train is supposed to leave, (s)he can catch that train.)"
    },
    {
      "client_set_id": "QA_ATOMIC_1",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 1
    }
  ],
  "questions": [
    {
      "client_question_id": "cat_2022_slot_1_Q1",
      "set_ref": "VARC_RC_1",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 1,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Inference & Conclusion",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "“Through meditation and the right attitude, one allows emotions to happen to oneself (it is impossible to prevent this), but one is advised to observe the emotions without necessarily acting on them; one achieves some distance and decides what has value and what does not have value.”\nIn the context of the passage, which one of the following is not a possible implication of the quoted statement?",
      "options": [
        {
          "id": "A",
          "text": "“Meditation and the right attitude”, in this instance, implies an initially passive reception of all experiences."
        },
        {
          "id": "B",
          "text": "Meditation allows certain out-of-body experiences that permit us to gain the distance necessary to control our emotions."
        },
        {
          "id": "C",
          "text": "The observation of emotions in a distant manner corresponds to the second movement referred to earlier in the passage."
        },
        {
          "id": "D",
          "text": "Emotional responses can make it difficult to distinguish valuable experiences from valueless experiences."
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q2",
      "set_ref": "VARC_RC_1",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 2,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Inference & Conclusion",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements would be an accurate inference from the example of Marcus Aurelius?",
      "options": [
        {
          "id": "A",
          "text": "Marcus Aurelius was humiliated by the accusation of treason in front of the other officers."
        },
        {
          "id": "B",
          "text": "Marcus Aurelius was a Stoic whose philosophy survived into the Roman era."
        },
        {
          "id": "C",
          "text": "Marcus Aurelius plotted revenge in his quest for justice."
        },
        {
          "id": "D",
          "text": "Marcus Aurelius was one of the leaders of the Roman army."
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q3",
      "set_ref": "VARC_RC_1",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 3,
      "question_type": "MCQ",
      "taxonomy_type": "rc_detail",
      "topic": "Reading Comprehension",
      "subtopic": "Fact-Based / Specific Detail",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements, if false, could be seen as contradicting the facts/arguments in the passage?",
      "options": [
        {
          "id": "A",
          "text": "Despite practising meditation and cultivating the right attitude, emotions cannot ever be controlled."
        },
        {
          "id": "B",
          "text": "The Greek philosopher Zeno survived into the Roman era until about AD 300\\."
        },
        {
          "id": "C",
          "text": "In the Epicurean view, indulging in simple pleasures is not desirable."
        },
        {
          "id": "D",
          "text": "In the Stoic view, choosing a reasoned, unemotional response as the first movement is an appropriate response to emotional situations."
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q4",
      "set_ref": "VARC_RC_1",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 4,
      "question_type": "MCQ",
      "taxonomy_type": "rc_detail",
      "topic": "Reading Comprehension",
      "subtopic": "Fact-Based / Specific Detail",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "On the basis of the passage, which one of the following statements can be regarded as true?",
      "options": [
        {
          "id": "A",
          "text": "The Stoics valorised the pursuit of money, power, and sexual gratification."
        },
        {
          "id": "B",
          "text": "The Stoic influences can be seen in multiple religions."
        },
        {
          "id": "C",
          "text": "The Epicureans believed in controlling all emotions."
        },
        {
          "id": "D",
          "text": "There were no Stoics in India at the time of the Roman civilisation."
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q5",
      "set_ref": "VARC_RC_2",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 5,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Inference & Conclusion",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Based on the passage, which one of the following copies would a Chinese museum be unlikely to consider as having less value than the original?",
      "options": [
        {
          "id": "A",
          "text": "Pablo Picasso’s painting of Vincent van Gogh’s original painting, bearing Picasso’s signature."
        },
        {
          "id": "B",
          "text": "Pablo Picasso’s painting of Vincent van Gogh’s original painting, identical in every respect."
        },
        {
          "id": "C",
          "text": "Pablo Picasso’s photograph of Vincent van Gogh’s original painting, printed to exactly the same scale."
        },
        {
          "id": "D",
          "text": "Pablo Picasso’s miniaturised, but otherwise faithful and accurate painting of Vincent van Gogh’s original painting."
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q6",
      "set_ref": "VARC_RC_2",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 6,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Inference & Conclusion",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following scenarios is unlikely to follow from the arguments in the passage?",
      "options": [
        {
          "id": "A",
          "text": "A 17th-century British painter would have no problem adding personal touches when restoring an ancient Roman painting."
        },
        {
          "id": "B",
          "text": "A 20th-century Japanese Buddhist monk would value a reconstructed shrine as the original."
        },
        {
          "id": "C",
          "text": "A 17th-century French artist who adhered to a Christian worldview would need to be completely true to the original intent of a painting when restoring it."
        },
        {
          "id": "D",
          "text": "A 21st-century Christian scientist is likely to oppose cloning because of his philosophical orientation."
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q7",
      "set_ref": "VARC_RC_2",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 7,
      "question_type": "MCQ",
      "taxonomy_type": "rc_detail",
      "topic": "Reading Comprehension",
      "subtopic": "Fact-Based / Specific Detail",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements does not correctly express the similarity between the Ise Grand Shrine and the cathedral of Freiburg Minster?",
      "options": [
        {
          "id": "A",
          "text": "Both were built as places of worship."
        },
        {
          "id": "B",
          "text": "Both can be regarded as very old structures."
        },
        {
          "id": "C",
          "text": "Both are continually undergoing restoration."
        },
        {
          "id": "D",
          "text": "Both will one day be completely rebuilt."
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q8",
      "set_ref": "VARC_RC_2",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 8,
      "question_type": "MCQ",
      "taxonomy_type": "rc_detail",
      "topic": "Reading Comprehension",
      "subtopic": "Fact-Based / Specific Detail",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The value that the modern West assigns to “an unassailable original” has resulted in all of the following EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "it discourages them from simultaneous displays of multiple copies of a painting."
        },
        {
          "id": "B",
          "text": "it allows regular employment for certain craftsmen."
        },
        {
          "id": "C",
          "text": "it discourages them from making interventions in ancient art."
        },
        {
          "id": "D",
          "text": "it discourages them from carrying out human cloning."
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q9",
      "set_ref": "VARC_RC_3",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 9,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Inference & Conclusion",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "“In order to confirm their abnormal status, many of the Undead were often accorded attributes, which defied the natural order of things . . .”\nWhich one of the following best expresses the claim made in this statement?",
      "options": [
        {
          "id": "A",
          "text": "Human beings conceptualise the Undead as possessing abnormal features."
        },
        {
          "id": "B",
          "text": "The Undead are deified in nature’s order by giving them divine attributes."
        },
        {
          "id": "C",
          "text": "The natural attributes of the Undead are rendered abnormal by changing their status."
        },
        {
          "id": "D",
          "text": "According the Undead an abnormal status is to reject the natural order of things."
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q10",
      "set_ref": "VARC_RC_3",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 10,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Inference & Conclusion",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following observations is a valid conclusion to draw from the statement, “From out of the primal darkness of Mankind’s earliest years, come whispers of eerie creatures, not quite alive (or alive in a way which we can understand), yet not quite dead either.”?",
      "options": [
        {
          "id": "A",
          "text": "Mankind’s early years were marked by a belief in the existence of eerie creatures that were neither quite alive nor dead."
        },
        {
          "id": "B",
          "text": "Long ago, eerie creatures used to whisper in the primal darkness that they were not quite dead."
        },
        {
          "id": "C",
          "text": "Mankind’s primal years were marked by creatures alive with eerie whispers, but seen only in the darkness."
        },
        {
          "id": "D",
          "text": "We can understand the lives of the eerie creatures in Mankind’s early years through their whispers in the darkness."
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q11",
      "set_ref": "VARC_RC_3",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 11,
      "question_type": "MCQ",
      "taxonomy_type": "rc_main_idea",
      "topic": "Reading Comprehension",
      "subtopic": "Main Idea / Central Theme",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements best describes what the passage is about?",
      "options": [
        {
          "id": "A",
          "text": "The writer discusses the transition from primitive thinking to the Age of Enlightenment."
        },
        {
          "id": "B",
          "text": "The passage discusses the evolution of theories of the Undead from primitive thinking to the Age of Enlightenment."
        },
        {
          "id": "C",
          "text": "The passage describes the failure of human beings to fully comprehend their environment."
        },
        {
          "id": "D",
          "text": "The writer describes the ways in which the Undead come to be associated with Shamans and the practice of magic."
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q12",
      "set_ref": "VARC_RC_3",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 12,
      "question_type": "MCQ",
      "taxonomy_type": "rc_detail",
      "topic": "Reading Comprehension",
      "subtopic": "Fact-Based / Specific Detail",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All of the following statements, if false, could be seen as being in accordance with the passage, EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "the Undead remained vague and ill-defined, even as Mankind strove to understand the horror they inspired."
        },
        {
          "id": "B",
          "text": "the transition from the Middle Ages to the Age of Enlightenment saw new theories of the Undead."
        },
        {
          "id": "C",
          "text": "the growing sophistication of Mankind meant that humans stopped believing in the Undead."
        },
        {
          "id": "D",
          "text": "the relationship between Shamans and the Undead was believed to be a strong and stable one."
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q13",
      "set_ref": "VARC_RC_4",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 13,
      "question_type": "MCQ",
      "taxonomy_type": "rc_main_idea",
      "topic": "Reading Comprehension",
      "subtopic": "Main Idea / Central Theme",
      "difficulty": "hard",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements best reflects the main argument of the fourth paragraph of the passage?",
      "options": [
        {
          "id": "A",
          "text": "Technology, laws, and customs are comparable, but dissimilar phenomena."
        },
        {
          "id": "B",
          "text": "Technological environments privilege certain dimensions of human nature as effectively as laws and customs."
        },
        {
          "id": "C",
          "text": "Automobiles represent the interest in mobility present in human nature."
        },
        {
          "id": "D",
          "text": "Technology, laws, and customs are not unlike each other if considered as institutions."
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q14",
      "set_ref": "VARC_RC_4",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 14,
      "question_type": "MCQ",
      "taxonomy_type": "rc_argument",
      "topic": "Reading Comprehension",
      "subtopic": "Author's Argument (Strengthen/Weaken)",
      "difficulty": "hard",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements could be inferred as supporting the arguments of the passage?",
      "options": [
        {
          "id": "A",
          "text": "It is not human nature, but human culture that is represented by institutions such as law and custom."
        },
        {
          "id": "B",
          "text": "Technologies form the environmental context and shape the contours of human society."
        },
        {
          "id": "C",
          "text": "Nature decides the point at which society loses its capacity to control history."
        },
        {
          "id": "D",
          "text": "The romantic conception of nature referred to by the passage is the one that requires theoretical legitimacy."
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q15",
      "set_ref": "VARC_RC_4",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 15,
      "question_type": "MCQ",
      "taxonomy_type": "rc_argument",
      "topic": "Reading Comprehension",
      "subtopic": "Author's Argument (Strengthen/Weaken)",
      "difficulty": "hard",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements contradicts the arguments of the passage?",
      "options": [
        {
          "id": "A",
          "text": "The problems of command over a disempowered and deskilled labour force gave rise to similar patterns of the capitalist rationalisation of production wherever masses were organised."
        },
        {
          "id": "B",
          "text": "Marx’s understanding of the capitalist rationalisation of production and Marcuse’s understanding of a “project” of “technological rationality” share theoretical inclinations."
        },
        {
          "id": "C",
          "text": "Masses are organised in patterns set by Foucault’s prisons and Habermas’ public sphere."
        },
        {
          "id": "D",
          "text": "Paradoxically, the capitalist rationalisation of production is a mark of so-called socialist systems as well."
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q16",
      "set_ref": "VARC_RC_4",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 16,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Inference & Conclusion",
      "difficulty": "hard",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All of the following claims can be inferred from the passage, EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "the significance of parental authority to children’s safety does not therefore imply that parental authority is a permanent aspect of human nature."
        },
        {
          "id": "B",
          "text": "the critical theory of technology argues that, as issues of human rights become more prominent, we lose sight of the ways in which the social order becomes more authoritarian."
        },
        {
          "id": "C",
          "text": "analyses of technologies must engage with their social histories to be able to reveal their implicit and explicit meanings for us."
        },
        {
          "id": "D",
          "text": "technologies seek to privilege certain dimensions of human nature at a high cost to lived nature."
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q17",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 17,
      "question_type": "MCQ",
      "taxonomy_type": "para_jumble",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Sentence Completion",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "There is a sentence that is missing in the paragraph below. Look at the paragraph and decide in which blank (option 1, 2, 3, or 4\\) the following sentence would best fit.\nSentence: Having made citizens more and less knowledgeable than their predecessors, the Internet has proved to be both a blessing and a curse.\nParagraph: Never before has a population, nearly all of whom has enjoyed at a least a secondary school education, been exposed to so much information, whether in newspapers and magazines or through YouTube, Google, and Facebook. (1). Yet it is not clear that people today are more knowledgeable than their barely literate predecessors. Contemporary advances in technology offered more serious and inquisitive students access to realms of knowledge previously unimaginable and unavailable. (2). But such readily available knowledge leads many more students away from serious study, the reading of actual texts, and toward an inability to write effectively and grammatically. (3). It has let people choose sources that reinforce their opinions rather than encouraging them to question inherited beliefs. (4).",
      "options": [
        {
          "id": "A",
          "text": "Option 1"
        },
        {
          "id": "B",
          "text": "Option 2"
        },
        {
          "id": "C",
          "text": "Option 3"
        },
        {
          "id": "D",
          "text": "Option 4"
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q18",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 18,
      "question_type": "MCQ",
      "taxonomy_type": "para_summary",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Para Summary",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage given below is followed by four alternate summaries. Choose the option that best captures the essence of the passage.\nPetitioning is an expeditious democratic tradition, used frequently in prior centuries, by which citizens can bring issues directly to governments. As expressions of collective voice, they support procedural democracy by shaping agendas. They can also recruit citizens to causes, give voice to the voteless, and apply the discipline of rhetorical argument that clarifies a point of view. By contrast, elections are limited in several respects: they involve only a few candidates, and thus fall far short of a representative democracy. Further, voters’ choices are not specific to particular policies or laws, and elections are episodic, whereas the voice of the people needs to be heard and integrated constantly into democratic government.",
      "options": [
        {
          "id": "A",
          "text": "By giving citizens greater control over shaping political and democratic agendas, political petitions are invaluable as they represent an ideal form of a representative democracy."
        },
        {
          "id": "B",
          "text": "Citizens become less inclined to petitioning as it enables vocal citizens to shape political agendas, but this needs to change to strengthen democracies today."
        },
        {
          "id": "C",
          "text": "Petitioning has been important to democratic functioning, as it supplements the electoral process by enabling ongoing engagement with the government."
        },
        {
          "id": "D",
          "text": "Petitioning is definitely more representative of the collective voice, and the functioning of democratic government could improve if we relied more on petitioning rather than holding periodic elections."
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q19",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 19,
      "question_type": "MCQ",
      "taxonomy_type": "para_jumble",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Sentence Completion",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "There is a sentence that is missing in the paragraph below. Look at the paragraph and decide in which blank (option 1, 2, 3, or 4\\) the following sentence would best fit.\nSentence: Easing the anxiety and pressure of having a “big day” is part of the appeal for many couples who marry in secret.\nParagraph: Wedding season is upon us and \\- after two years of Covid chaos that saw nuptials scaled back you may think the temptation would be to go all out. (1). But instead of expanding the guest list, many couples are opting to have entirely secret ceremonies. With Covid case numbers remaining high and the cost of living crisis meaning that many couples are feeling the pinch, it’s no wonder that some are less than eager to send out invites. (2). Plus, it can’t hurt that in celebrity circles getting married in secret is all the rage. (3). “I would definitely say that secret weddings are becoming more common,” says Landis Bejar, the founder of a therapy practice, which specialises in helping brides and grooms manage wedding stress. “People are looking for ways to get out of the spotlight and avoid the pomp and circumstance of weddings. (4). They just want to get to the part where they are married.”",
      "options": [
        {
          "id": "A",
          "text": "Option 1"
        },
        {
          "id": "B",
          "text": "Option 2"
        },
        {
          "id": "C",
          "text": "Option 3"
        },
        {
          "id": "D",
          "text": "Option 4"
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q20",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 20,
      "question_type": "MCQ",
      "taxonomy_type": "para_summary",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Para Summary",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage given below is followed by four alternate summaries. Choose the option that best captures the essence of the passage.\nIt’s not that modern historians of medieval Africa have been ignorant about contacts between Ethiopia and Europe; they just had the power dynamic reversed. The traditional narrative stressed Ethiopia as weak and in trouble in the face of aggression from external forces, so Ethiopia sought military assistance from their fellow Christians to the north. But the real story, buried in plain sight in medieval diplomatic texts, simply had not yet been put together by modern scholars. Recent research pushes scholars of medieval Europe to imagine a much more richly connected medieval world: at the beginning of the so-called Age of Exploration, there is evidence that the kings of Ethiopia were sponsoring their own missions of diplomacy, faith and commerce.",
      "options": [
        {
          "id": "A",
          "text": "Medieval texts have documented how strong connections between the Christian communities of Ethiopia and Europe were invaluable in establishing military and trade links between the two civilisations."
        },
        {
          "id": "B",
          "text": "Historians were under the illusion that Ethiopia needed military protection from their neighbours, but in fact the country had close commercial and religious connections with them."
        },
        {
          "id": "C",
          "text": "Medieval texts have been ‘cherry-picked’ to promote a view of Ethiopia as weak and in need of Europe’s military help with aggressive neighbours, but recent studies reveal it was a well-connected and outward looking culture."
        },
        {
          "id": "D",
          "text": "Medieval historical sources selectively promoted the narrative that powerful European forces were called on to protect weak African civilisations such as Ethiopia, but this is far from reality."
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q21",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 5,
      "section": "VARC",
      "question_number": 21,
      "question_type": "TITA",
      "taxonomy_type": "para_jumble",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Parajumbles",
      "difficulty": "medium",
      "correct_answer": "2143",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The four sentences (labelled 1, 2, 3 and 4\\) below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer:\nSome company leaders are basing their decisions on locating offices to foster innovation and growth, as their best-performing inventors suffered the greatest productivity losses when their commutes grew longer.\nShorter commutes support innovation by giving employees more time in the office and greater opportunities for in-person collaboration, while removing the physical strain of a long commute.\nThis is not always the case: remote work does not automatically lead to greater creativity and productivity as office water-cooler conversations are also very important for innovation.\nSome see the link between long commutes and productivity as support for work-from-home scenarios, as many workers have grown accustomed to their commute-free arrangements during the pandemic.",
      "solution_text": "The correct answer is 2143\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q22",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 6,
      "section": "VARC",
      "question_number": 22,
      "question_type": "TITA",
      "taxonomy_type": "para_jumble",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Parajumbles",
      "difficulty": "medium",
      "correct_answer": "3214",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The four sentences (labelled 1, 2, 3 and 4\\) below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer:\nThe creative element in product design has become of paramount importance as it is one of the few ways a firm or industry can sustain a competitive advantage over its rivals.\nIn fact, the creative element in the value of world industry would be larger still, if we added the contribution of the creative element in other industries, such as the design of tech accessories.\nThe creative industry is receiving a lot of attention today as its growth rate is faster than that of the world economy as a whole.\nIt is for this reason that today’s trade issues are increasingly involving intellectual property, as Western countries have an interest in protecting their revenues along with freeing trade in non-tangibles.",
      "solution_text": "The correct answer is 3214\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q23",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 7,
      "section": "VARC",
      "question_number": 23,
      "question_type": "MCQ",
      "taxonomy_type": "para_summary",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Para Summary",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage given below is followed by four alternate summaries. Choose the option that best captures the essence of the passage.\nAll that we think we know about how life hangs together is really some kind of illusion that we have perpetrated on ourselves because of our limited vision. What appear to be inanimate objects such as stones turn out not only to be alive in the same way that we are, but also in many infinitesimal ways to be affected by stimuli just as humans are. The distinction between animate and inanimate simply cannot be made when you enter the world of quantum mechanics and try to determine how those apparent subatomic particles, of which you and everything else in our universe is composed, are all tied together. The point is that physics and metaphysics show there is a pattern to the universe that goes beyond our capacity to grasp it with our brains.",
      "options": [
        {
          "id": "A",
          "text": "The effect of stimuli is similar in inanimate objects when compared to animate objects or living beings."
        },
        {
          "id": "B",
          "text": "Quantum physics indicates that an astigmatic view of reality results in erroneous assumptions about the universe."
        },
        {
          "id": "C",
          "text": "The inanimate world is both sentient and cognizant like its animate counterpart."
        },
        {
          "id": "D",
          "text": "Arbitrary distinctions between inanimate and animate objects disappear at the scale at which quantum mechanics works."
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q24",
      "set_ref": "VARC_ATOMIC_1",
      "sequence_order": 8,
      "section": "VARC",
      "question_number": 24,
      "question_type": "TITA",
      "taxonomy_type": "para_jumble",
      "topic": "Verbal Ability (VA)",
      "subtopic": "Parajumbles",
      "difficulty": "medium",
      "correct_answer": "2431",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The four sentences (labelled 1, 2, 3 and 4\\) below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer:\nFish skin collagen has excellent thermo-stability and tensile strength making it ideal for use as bandage that adheres to the skin and adjusts to body movements.\nCollagen, one of the main structural proteins in connective tissues in the human body, is well known for promoting skin regeneration.\nFish skin swims in here as diseases and bacteria that affect fish are different from most human pathogens.\nThe risk of introducing disease agents into other species through the use of pig and cow collagen proteins for wound healing has inhibited its broader applications in the medical field.",
      "solution_text": "The correct answer is 2431\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q25",
      "set_ref": "DILR_SET_1",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 25,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Caselets",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "How many goals were scored in Match 7?",
      "options": [
        {
          "id": "A",
          "text": "3"
        },
        {
          "id": "B",
          "text": "2"
        },
        {
          "id": "C",
          "text": "1"
        },
        {
          "id": "D",
          "text": "Cannot be determined"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q26",
      "set_ref": "DILR_SET_1",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 26,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Caselets",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following is the correct sequence of goals scored in matches 1, 3, 5 and 7?",
      "options": [
        {
          "id": "A",
          "text": "5, 1, 0, 1"
        },
        {
          "id": "B",
          "text": "3, 1, 2, 1"
        },
        {
          "id": "C",
          "text": "3, 2, 1, 2"
        },
        {
          "id": "D",
          "text": "4, 1, 2, 1"
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q27",
      "set_ref": "DILR_SET_1",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 27,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Caselets",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following statement(s) is/are true?\nStatement-1: Amla and Sarita never scored goals in the same match.\nStatement-2: Harita and Sarita never scored goals in the same match.",
      "options": [
        {
          "id": "A",
          "text": "Statement-1 only"
        },
        {
          "id": "B",
          "text": "Statement-2 only"
        },
        {
          "id": "C",
          "text": "Both the statements"
        },
        {
          "id": "D",
          "text": "None of the statements"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q28",
      "set_ref": "DILR_SET_1",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 28,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Caselets",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following statement(s) is/are false?\nStatement-1: In every match at least one player scored a goal.\nStatement-2: No two players scored goals in the same number of matches.",
      "options": [
        {
          "id": "A",
          "text": "None of the statements"
        },
        {
          "id": "B",
          "text": "Statement-1 only"
        },
        {
          "id": "C",
          "text": "Both the statements"
        },
        {
          "id": "D",
          "text": "Statement-2 only"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q29",
      "set_ref": "DILR_SET_1",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 29,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Caselets",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If Harita scored goals in one more match as compared to Sarita, which of the following statement(s) is/are necessarily true?\nStatement-1: Amla scored goals in consecutive matches.\nStatement-2: Sarita scored goals in consecutive matches.",
      "options": [
        {
          "id": "A",
          "text": "Statement-2 only"
        },
        {
          "id": "B",
          "text": "None of the statements"
        },
        {
          "id": "C",
          "text": "Statement-1 only"
        },
        {
          "id": "D",
          "text": "Both the statements"
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q30",
      "set_ref": "DILR_SET_2",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 30,
      "question_type": "TITA",
      "taxonomy_type": "di_venn",
      "topic": "Data Interpretation",
      "subtopic": "Set Theory",
      "difficulty": "medium",
      "correct_answer": "50",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many boys are there in the class?",
      "solution_text": "The correct answer is 50\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q31",
      "set_ref": "DILR_SET_2",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 31,
      "question_type": "MCQ",
      "taxonomy_type": "di_venn",
      "topic": "Data Interpretation",
      "subtopic": "Set Theory",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following can be determined from the given information?\nII. The number of female dancers who are interested in attending a 1-day event.",
      "options": [
        {
          "id": "I",
          "text": "The number of boys who are interested in attending a 1-day event and are neither dancers nor singers."
        },
        {
          "id": "A",
          "text": "Only I"
        },
        {
          "id": "B",
          "text": "Neither I nor II"
        },
        {
          "id": "C",
          "text": "Only II"
        },
        {
          "id": "D",
          "text": "Both I and II"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q32",
      "set_ref": "DILR_SET_2",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 32,
      "question_type": "MCQ",
      "taxonomy_type": "di_venn",
      "topic": "Data Interpretation",
      "subtopic": "Set Theory",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "What fraction of the class are interested in attending a 2-day event?",
      "options": [
        {
          "id": "A",
          "text": "7/10"
        },
        {
          "id": "B",
          "text": "7/13"
        },
        {
          "id": "C",
          "text": "9/1"
        },
        {
          "id": "D",
          "text": "2/3"
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q33",
      "set_ref": "DILR_SET_2",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 33,
      "question_type": "MCQ",
      "taxonomy_type": "di_venn",
      "topic": "Data Interpretation",
      "subtopic": "Set Theory",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "What BEST can be concluded about the number of male dancers who are interested in attending a 1-day event?",
      "options": [
        {
          "id": "A",
          "text": "5 or 6"
        },
        {
          "id": "B",
          "text": "6"
        },
        {
          "id": "C",
          "text": "5"
        },
        {
          "id": "D",
          "text": "4 or 6"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q34",
      "set_ref": "DILR_SET_2",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 34,
      "question_type": "MCQ",
      "taxonomy_type": "di_venn",
      "topic": "Data Interpretation",
      "subtopic": "Set Theory",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "How many female dancers are interested in attending a 2-day event?",
      "options": [
        {
          "id": "A",
          "text": "2"
        },
        {
          "id": "B",
          "text": "1"
        },
        {
          "id": "C",
          "text": "0"
        },
        {
          "id": "D",
          "text": "Cannot be determined"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q35",
      "set_ref": "DILR_SET_3",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 35,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Logical Reasoning",
      "subtopic": "Number Puzzles",
      "difficulty": "medium",
      "correct_answer": "2",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many tokens did Qahira receive?",
      "solution_text": "The correct answer is 2\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q36",
      "set_ref": "DILR_SET_3",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 36,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Logical Reasoning",
      "subtopic": "Number Puzzles",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Who among the following definitely received a token from Bithi but not from Dhanavi?",
      "options": [
        {
          "id": "A",
          "text": "Pragnyaa"
        },
        {
          "id": "B",
          "text": "Rasheeda"
        },
        {
          "id": "C",
          "text": "Qahira"
        },
        {
          "id": "D",
          "text": "Tantra"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q37",
      "set_ref": "DILR_SET_3",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 37,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Logical Reasoning",
      "subtopic": "Number Puzzles",
      "difficulty": "medium",
      "correct_answer": "3",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many tokens did Chhaya award?",
      "solution_text": "The correct answer is 3\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q38",
      "set_ref": "DILR_SET_3",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 38,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Logical Reasoning",
      "subtopic": "Number Puzzles",
      "difficulty": "medium",
      "correct_answer": "3",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many tokens did Smera receive?",
      "solution_text": "The correct answer is 3\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q39",
      "set_ref": "DILR_SET_3",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 39,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Logical Reasoning",
      "subtopic": "Number Puzzles",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following could be the amount of funding that Tantra received?\n(a) Rs. 66,000 (b) Rs. 165,000",
      "options": [
        {
          "id": "A",
          "text": "Neither (a) nor (b)"
        },
        {
          "id": "B",
          "text": "Only (b)"
        },
        {
          "id": "C",
          "text": "Only (a)"
        },
        {
          "id": "D",
          "text": "Both (a) and (b)"
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q40",
      "set_ref": "DILR_SET_4",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 40,
      "question_type": "MCQ",
      "taxonomy_type": "di_network",
      "topic": "Logical Reasoning",
      "subtopic": "Routes & Networks",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If Hari is ready to board a train at 8:05 am from station M, then when is the earliest that he can reach station N?",
      "options": [
        {
          "id": "A",
          "text": "9:11 am"
        },
        {
          "id": "B",
          "text": "9:06 am"
        },
        {
          "id": "C",
          "text": "9:01 am"
        },
        {
          "id": "D",
          "text": "9:13 am"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q41",
      "set_ref": "DILR_SET_4",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 41,
      "question_type": "MCQ",
      "taxonomy_type": "di_network",
      "topic": "Logical Reasoning",
      "subtopic": "Routes & Networks",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If Priya is ready to board a train at 10:25 am from station T, then when is the earliest that she can reach station S?",
      "options": [
        {
          "id": "A",
          "text": "11:12 am"
        },
        {
          "id": "B",
          "text": "11:22 am"
        },
        {
          "id": "C",
          "text": "11:07 am"
        },
        {
          "id": "D",
          "text": "11:28 am"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q42",
      "set_ref": "DILR_SET_4",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 42,
      "question_type": "MCQ",
      "taxonomy_type": "di_network",
      "topic": "Logical Reasoning",
      "subtopic": "Routes & Networks",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Haripriya is expected to reach station S late. What is the latest time by which she must be ready to board at station S if she must reach station B before 1 am via station R?",
      "options": [
        {
          "id": "A",
          "text": "11:39 pm"
        },
        {
          "id": "B",
          "text": "11:49 am"
        },
        {
          "id": "C",
          "text": "11:35 pm"
        },
        {
          "id": "D",
          "text": "11:43 pm"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q43",
      "set_ref": "DILR_SET_4",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 43,
      "question_type": "TITA",
      "taxonomy_type": "di_network",
      "topic": "Logical Reasoning",
      "subtopic": "Routes & Networks",
      "difficulty": "hard",
      "correct_answer": "8",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What is the minimum number of trains that are required to provide the service on the AB line (considering both north and south directions)?",
      "solution_text": "The correct answer is 8\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q44",
      "set_ref": "DILR_SET_4",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 44,
      "question_type": "TITA",
      "taxonomy_type": "di_network",
      "topic": "Logical Reasoning",
      "subtopic": "Routes & Networks",
      "difficulty": "hard",
      "correct_answer": "48",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What is the minimum number of trains that are required to provide the service in this city?",
      "solution_text": "The correct answer is 48\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q45",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 45,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Ratio, Proportion & Variation",
      "difficulty": "medium",
      "correct_answer": "43200",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "In a village, the ratio of the number of males to females is 5 : 4\\. The ratio of the number of literate males to literate females is 2 : 3\\. The ratio of the number of illiterate males to illiterate females is 4 : 3\\. If 3600 males in the village are literate, then the total number of females in the village is ______.",
      "solution_text": "The correct answer is 43200\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q46",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 2,
      "section": "QA",
      "question_number": 46,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Averages, Mixtures & Alligations",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The average weight of students in a class increases by 600 gm when some new students join the class. If the average weight of the new students is 3 kg more than the average weight of the original students, then the ratio of the number of original students to the number of new students is:",
      "options": [
        {
          "id": "A",
          "text": "1 : 4"
        },
        {
          "id": "B",
          "text": "1 : 2"
        },
        {
          "id": "C",
          "text": "4 : 1"
        },
        {
          "id": "D",
          "text": "3 : 1"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q47",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 3,
      "section": "QA",
      "question_number": 47,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Algebra",
      "subtopic": "Sequence & Series (AP, GP, HP)",
      "difficulty": "hard",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "For any natural number $n$, suppose the sum of the first $n$ terms of an arithmetic progression is $(n + 2n^2)$. If the $n^{th}$ term of the progression is divisible by 9, then the smallest possible value of $n$ is:",
      "options": [
        {
          "id": "A",
          "text": "9"
        },
        {
          "id": "B",
          "text": "4"
        },
        {
          "id": "C",
          "text": "7"
        },
        {
          "id": "D",
          "text": "8"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q48",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 4,
      "section": "QA",
      "question_number": 48,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Algebra",
      "subtopic": "Functions & Graphs",
      "difficulty": "hard",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Let $0 \\\\le a \\\\le x \\\\le 100$ and $f(x) \\= |x \\- a| + |x \\- 100| + |x \\- a \\- 50|$. Then the maximum value of $f(x)$ becomes 100 when $a$ is equal to:",
      "options": [
        {
          "id": "A",
          "text": "25"
        },
        {
          "id": "B",
          "text": "100"
        },
        {
          "id": "C",
          "text": "50"
        },
        {
          "id": "D",
          "text": "0"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q49",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 5,
      "section": "QA",
      "question_number": 49,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Time, Speed & Distance",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Trains A and B start traveling at the same time towards each other with constant speeds from stations X and Y, respectively. Train A reaches station Y in 10 minutes while train B takes 9 minutes to reach station X after meeting train A. Then the total time taken, in minutes, by train B to travel from station Y to station X is:",
      "options": [
        {
          "id": "A",
          "text": "6"
        },
        {
          "id": "B",
          "text": "15"
        },
        {
          "id": "C",
          "text": "10"
        },
        {
          "id": "D",
          "text": "12"
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q50",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 6,
      "section": "QA",
      "question_number": 50,
      "question_type": "TITA",
      "taxonomy_type": "qa_geometry",
      "topic": "Geometry & Mensuration",
      "subtopic": "Quadrilaterals & Polygons",
      "difficulty": "medium",
      "correct_answer": "66",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "A trapezium ABCD has side AD parallel to BC, $\\\\angle BAD \\= 90^\\\\circ$, $BC \\= 3$ cm and $AD \\= 8$ cm. If the perimeter of this trapezium is 36 cm, then its area, in sq. cm, is ______.",
      "solution_text": "The correct answer is 66\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q51",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 7,
      "section": "QA",
      "question_number": 51,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Profit, Loss & Discount",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Ankita buys 4 kg cashews, 14 kg peanuts and 6 kg almonds when the cost of 7 kg cashews is the same as that of 30 kg peanuts or 9 kg almonds. She mixes all the three nuts and marks a price for the mixture in order to make a profit of ₹1752. She sells 4 kg of the mixture at this marked price and the remaining at a 20% discount on the marked price, thus making a total profit of ₹744. Then the amount, in rupees, that she had spent in buying almonds is:",
      "options": [
        {
          "id": "A",
          "text": "1680"
        },
        {
          "id": "B",
          "text": "1176"
        },
        {
          "id": "C",
          "text": "2520"
        },
        {
          "id": "D",
          "text": "1440"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q52",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 8,
      "section": "QA",
      "question_number": 52,
      "question_type": "TITA",
      "taxonomy_type": "qa_number_system",
      "topic": "Number Systems",
      "subtopic": "Factors & Multiples (HCF/LCM)",
      "difficulty": "hard",
      "correct_answer": "82",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Let $A$ be the largest positive integer that divides all the numbers of the form $3^k + 4^k + 5^k$, and let $B$ be the largest positive integer that divides all the numbers of the form $4^k + 3(4^k) + 4^{k+2}$, where $k$ is any positive integer. Then $(A + B)$ equals ______.",
      "solution_text": "The correct answer is 82\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q53",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 9,
      "section": "QA",
      "question_number": 53,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Algebra",
      "subtopic": "Quadratic Equations",
      "difficulty": "hard",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Let $a, b, c$ be non-zero real numbers such that $b^2 \\< 4ac$ and $f(x) \\= ax^2 + bx + c$. If the set $S$ consists of all integers $m$ such that $f(m) \\< 0$, then the set $S$ must necessarily be:",
      "options": [
        {
          "id": "A",
          "text": "the set of all positive integers"
        },
        {
          "id": "B",
          "text": "the set of all integers"
        },
        {
          "id": "C",
          "text": "either the empty set or the set of all integers"
        },
        {
          "id": "D",
          "text": "the empty set"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q54",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 10,
      "section": "QA",
      "question_number": 54,
      "question_type": "TITA",
      "taxonomy_type": "qa_modern_math",
      "topic": "Modern Math",
      "subtopic": "Permutations & Combinations",
      "difficulty": "medium",
      "correct_answer": "84",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The number of ways of distributing 20 identical balloons among 4 children such that each child gets some balloons but no child gets an odd number of balloons, is ______.",
      "solution_text": "The correct answer is 84\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q55",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 11,
      "section": "QA",
      "question_number": 55,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Algebra",
      "subtopic": "Linear Equations",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Let $a$ and $b$ be natural numbers. If $a^2 + ab + a \\= 14$ and $b^2 + ab + b \\= 28$, then $(2a + b)$ equals:",
      "options": [
        {
          "id": "A",
          "text": "8"
        },
        {
          "id": "B",
          "text": "7"
        },
        {
          "id": "C",
          "text": "10"
        },
        {
          "id": "D",
          "text": "9"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q56",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 12,
      "section": "QA",
      "question_number": 56,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Profit, Loss & Discount",
      "difficulty": "medium",
      "correct_answer": "160",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Amal buys 110 kg of syrup and 120 kg of juice, syrup being 20% less costly than juice, per kg. He sells 10 kg of syrup at 10% profit and 20 kg of juice at 20% profit. Mixing the remaining juice and syrup, Amal sells the mixture at ₹ 308.32 per kg and makes an overall profit of 64%. Then, Amal’s cost price for syrup, in rupees per kg, is ______.",
      "solution_text": "The correct answer is 160\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q57",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 13,
      "section": "QA",
      "question_number": 57,
      "question_type": "MCQ",
      "taxonomy_type": "qa_geometry",
      "topic": "Geometry & Mensuration",
      "subtopic": "Quadrilaterals & Polygons",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All the vertices of a rectangle lie on a circle of radius $R$. If the perimeter of the rectangle is $P$, then the area of the rectangle is:",
      "options": [
        {
          "id": "A",
          "text": "$\\\\frac{P^2}{16} \\- R^2$"
        },
        {
          "id": "B",
          "text": "$\\\\frac{P^2}{8} \\- 2R^2$"
        },
        {
          "id": "C",
          "text": "$\\\\frac{P^2}{2} \\- 2PR$"
        },
        {
          "id": "D",
          "text": "$\\\\frac{P^2}{8} \\- \\\\frac{R^2}{2}$"
        }
      ],
      "solution_text": "The correct answer is B."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q58",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 14,
      "section": "QA",
      "question_number": 58,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Averages, Mixtures & Alligations",
      "difficulty": "easy",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The average of three integers is 13\\. When a natural number $n$ is included, the average of these four integers remains an odd integer. The minimum possible value of $n$ is:",
      "options": [
        {
          "id": "A",
          "text": "3"
        },
        {
          "id": "B",
          "text": "4"
        },
        {
          "id": "C",
          "text": "5"
        },
        {
          "id": "D",
          "text": "1"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q59",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 15,
      "section": "QA",
      "question_number": 59,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Averages, Mixtures & Alligations",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "A mixture contains lemon juice and sugar syrup in equal proportion. If a new mixture is created by adding this mixture and sugar syrup in the ratio 1 : 3, then the ratio of lemon juice and sugar syrup in the new mixture is:",
      "options": [
        {
          "id": "A",
          "text": "1 : 4"
        },
        {
          "id": "B",
          "text": "1 : 5"
        },
        {
          "id": "C",
          "text": "1 : 6"
        },
        {
          "id": "D",
          "text": "1 : 7"
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q60",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 16,
      "section": "QA",
      "question_number": 60,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Algebra",
      "subtopic": "Inequalities & Modulus",
      "difficulty": "hard",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The largest real value of $a$ for which the equation $|x + a| + |x \\- 1| \\= 2$ has an infinite number of solutions for $x$ is:",
      "options": [
        {
          "id": "A",
          "text": "\\-1"
        },
        {
          "id": "B",
          "text": "0"
        },
        {
          "id": "C",
          "text": "1"
        },
        {
          "id": "D",
          "text": "2"
        }
      ],
      "solution_text": "The correct answer is C."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q61",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 17,
      "section": "QA",
      "question_number": 61,
      "question_type": "MCQ",
      "taxonomy_type": "qa_modern_math",
      "topic": "Modern Math",
      "subtopic": "Set Theory",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "In a class of 100 students, 73 like coffee, 80 like tea and 52 like lemonade. It may be possible that some students do not like any of these three drinks. Then the difference between the maximum and minimum possible number of students who like all the three drinks is:",
      "options": [
        {
          "id": "A",
          "text": "47"
        },
        {
          "id": "B",
          "text": "53"
        },
        {
          "id": "C",
          "text": "52"
        },
        {
          "id": "D",
          "text": "48"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q62",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 18,
      "section": "QA",
      "question_number": 62,
      "question_type": "MCQ",
      "taxonomy_type": "qa_geometry",
      "topic": "Geometry & Mensuration",
      "subtopic": "Coordinate Geometry",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Let ABCD be a parallelogram such that the coordinates of its three vertices A, B, C are (1, 1), (3, 4\\) and (−2, 8), respectively. Then, the coordinates of the vertex D are:",
      "options": [
        {
          "id": "A",
          "text": "(0, 11\\)"
        },
        {
          "id": "B",
          "text": "(4, 5\\)"
        },
        {
          "id": "C",
          "text": "(−3, 4\\)"
        },
        {
          "id": "D",
          "text": "(-4, 5\\)"
        }
      ],
      "solution_text": "The correct answer is D."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q63",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 19,
      "section": "QA",
      "question_number": 63,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Algebra",
      "subtopic": "Linear Equations",
      "difficulty": "hard",
      "correct_answer": "34",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "For natural numbers $x, y$, and $z$, if $xy + yz \\= 19$ and $yz + xz \\= 51$, then the minimum possible value of $xyz$ is ______.",
      "solution_text": "The correct answer is 34\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q64",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 20,
      "section": "QA",
      "question_number": 64,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Simple & Compound Interest",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Alex invested his savings in two parts. The simple interest earned on the first part at 15% per annum for 4 years is the same as the simple interest earned on the second part at 12% per annum for 3 years. Then, the percentage of his savings invested in the first part is:",
      "options": [
        {
          "id": "A",
          "text": "37.5%"
        },
        {
          "id": "B",
          "text": "62.5%"
        },
        {
          "id": "C",
          "text": "60%"
        },
        {
          "id": "D",
          "text": "40%"
        }
      ],
      "solution_text": "The correct answer is A."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q65",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 21,
      "section": "QA",
      "question_number": 65,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Arithmetic",
      "subtopic": "Ratio, Proportion & Variation",
      "difficulty": "medium",
      "correct_answer": "111",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Pinky is standing in a queue at a ticket counter. Suppose the ratio of the number of persons standing ahead of Pinky to the number of persons standing behind her in the queue is 3 : 5\\. If the total number of persons in the queue is less than 300, then the maximum possible number of persons standing ahead of Pinky is ______.",
      "solution_text": "The correct answer is 111\\."
    },
    {
      "client_question_id": "cat_2022_slot_1_Q66",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 22,
      "section": "QA",
      "question_number": 66,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Algebra",
      "subtopic": "Functions & Graphs",
      "difficulty": "hard",
      "correct_answer": "44",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "For any real number $x$, let $\\[x\\]$ be the largest integer less than or equal to $x$. If $\\\\sum_{n=1}^{N} \\[\\\\frac{1}{5} + \\\\frac{n}{25}\\] \\= 25$, then $N$ is ______.",
      "solution_text": "The correct answer is 44\\."
    }
  ]
}
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

## File: .repomixignore
````
# Repomix ignore list
# Secrets and environment files
.env
.env.*
.env.local
.env.*.local
*.pem
*.key
*.p12
*.pfx
id_rsa*
service-account*.json

# Build artifacts and dependencies
.next/
node_modules/
.venv/

# Large/generated files
pnpm-lock.yaml
gemini_*.md
repomix-output*
VS_Codebase.md

# Temp export files
.export_sanitized/
.export_tmp/
.repomix-vs-codebase.json

# Original question paper data (use sanitized versions)
data/*.json
data/*.jsonc
````

## File: cat_2025_slot_1.json
````json
{
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "cat-2025-slot-1",
    "title": "CAT 2025 Slot 1",
    "slug": "cat-2025-slot-1",
    "description": "Official CAT 2025 Slot 1 Question Paper",
    "year": 2025,
    "total_questions": 68,
    "total_marks": 204,
    "duration_minutes": 120,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ],
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "hard",
    "is_free": false,
    "published": false,
    "allow_pause": true,
    "attempt_limit": 2
  },
  "question_sets": [
    {
      "client_set_id": "VARC_VA_1",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 1,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_RC_1",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 2,
      "context_type": "rc_passage",
      "context_title": "Electronic Music",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "Often the well intentioned music lover or the traditionally-minded professional composer asks two basic questions when faced with the electronic music phenomena: (1) is this type of artistic creation music at all? and, (2) given that the product is accepted as music of a new type or order, is not such music \"inhuman\"?... As Lejaren Hiller points out in his book Experimental Music (coauthor Leonard M. Isaacson), two questions which often arise when music is discussed are: (a) the substance of musical communication and its symbolic and semantic significance, if any, and (b) the particular processes, both mental and technical, which are involved in creating and responding to musical composition.\nThe ever-present popular concept of music as a direct, open, emotional expression and as a subjective form of communication from the composer, is, of course still that of the nineteenth century, when composers themselves spoke of music in those terms.... But since the third decade of our century many composers have preferred more objective definitions of music, epitomized in Stravinsky's description of it as \"a form of speculation in terms of sound and time\".\nAn acceptance of this more characteristic twentieth-century view of the art of musical composition will of course immediately bring the layman closer to an understanding of, and sympathetic response to, electronic music, even if the forms, sounds and approaches it uses will still be of a foreign nature to him. A communication problem however will still remain. The principal barrier that electronic music presents at large, in relation to the communication process, is that composers in this medium are employing a new language of forms where terms like 'densities', 'indefinite pitch relations', 'dynamic serialization', 'permutation', etc., are substitutes (or remote equivalents) for the traditional concepts of harmony, melody, rhythm, etc.... When the new structural procedures of electronic music are at last fully understood by the listener the barriers between him and the work he faces will be removed...\nThe medium of electronic music has of course tempted many kinds of composers to try their hand at it.... But the serious-minded composer approaches the world of electronic music with a more sophisticated and profound concept of creation. Although he knows that he can reproduce and employ melodic, rhythmic patterns and timbres of a traditional nature, he feels that it is in the exploration of sui generis languages and forms that the aesthetic magic of the new medium lies. And, conscientiously, he plunges into this search."
    },
    {
      "client_set_id": "VARC_VA_2",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 3,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_RC_2",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 4,
      "context_type": "rc_passage",
      "context_title": "Complex Systems and Tail Events",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "Understanding the key properties of complex systems can help us clarify and deal with many new and existing global challenges, from pandemics to poverty... A recent study in Nature Physics found transitions to orderly states such as schooling in fish (all fish swimming in the same direction), can be caused, paradoxically, by randomness, or 'noise' feeding back on itself. That is, a misalignment among the fish causes further misalignment, eventually inducing a transition to schooling. Most of us wouldn't guess that noise can produce predictable behaviour.\nThe result invites us to consider how technology such as contact-tracing apps, although informing us locally, might negatively impact our collective movement. If each of us changes our behaviour to avoid the infected, we might generate a collective pattern we had aimed to avoid: higher levels of interaction between the infected and susceptible, or high levels of interaction among the asymptomatic.\nComplex systems also suffer from a special vulnerability to events that don't follow a normal distribution or 'bell curve'. When events are distributed normally, most outcomes are familiar and don't seem particularly striking. Height is a good example: it's pretty unusual for a man to be over 7 feet tall; most adults are between 5 and 6 feet, and there is no known person over 9 feet tall. But in collective settings where contagion shapes behaviour - a run on the banks, a scramble to buy toilet paper - the probability distributions for possible events are often heavy-tailed. There is a much higher probability of extreme events, such as a stock market crash or a massive surge in infections. These events are still unlikely, but they occur more frequently and are larger than would be expected under normal distributions.\nWhat's more, once a rare but hugely significant 'tail' event takes place, this raises the probability of further tail events. We might call them second-order tail events; they include stock market gyrations after a big fall and earthquake aftershocks. The initial probability of second-order tail events is so tiny it's almost impossible to calculate - but once a first-order tail event occurs, the rules change, and the probability of a second-order tail event increases. The dynamics of tail events are complicated by the fact that they result from cascades of other unlikely events.\nWhen COVID-19 first struck, the stock market suffered stunning losses followed by an equally stunning recovery. Some of these dynamics are potentially attributable to former sports bettors, with no sports to bet on, entering the market as speculators rather than investors. The arrival of these new players might have increased inefficiencies and allowed savvy long-term investors to gain an edge over bettors with different goals. One reason a first-order tail event can induce further tail events is that it changes the perceived costs of our actions and changes the rules that we play by. This game-change is an example of another key complex systems concept: nonstationarity. A second, canonical example of nonstationarity is adaptation, as illustrated by the arms race involved in the coevolution of hosts and parasites [in which] each has to 'run' faster, just to keep up with the novel solutions the other one presents as they battle it out in evolutionary time."
    },
    {
      "client_set_id": "VARC_VA_3",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 5,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_RC_3",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 6,
      "context_type": "rc_passage",
      "context_title": "Criminal Responsibility and Mental Science",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "How can we know what someone else is thinking or feeling, let alone prove it in court? In his 1863 book, A General View of the Criminal Law of England, James Fitzjames Stephen, among the most celebrated legal thinkers of his generation, was of the opinion that the assessment of a person's mental state was an inference made with \"little consciousness.\" In a criminal case, jurors, doctors, and lawyers could watch defendants-scrutinizing clothing, mannerisms, tone of voice-but the best they could hope for were clues. Rounding these clues up to a judgment about a defendant's guilt, or a defendant's life, was an act of empathy and imagination.... The closer the resemblance between defendants and their judges, the easier it was to overlook the gap that inference filled. Conversely, when a defendant struck officials as unlike themselves, whether by dint of disease, gender, confession, or race, the precariousness of judgments about mental state was exposed.\nIn the nineteenth century, physicians who specialized in the study of madness and the care of the insane held themselves out as experts in the new field of mental science. Often called alienists or mad doctors, they were the predecessors of modern psychiatrists, neurologists, and psychologists. The opinions of family and neighbors had once been sufficient to sift the sane from the insane, but a growing belief that insanity was a subtle condition that required expert, medical diagnosis pushed physicians into the witness box.... Lawyers for both prosecution and defense began to recruit alienists to assess defendants' sanity and to testify to it in court.\nIrresponsibility and insanity were not identical, however. Criminal responsibility was a legal concept and not, fundamentally, a medical one. Stephen explained: \"The question 'What are the mental elements of responsibility?' is, and must be, a legal question. It cannot be anything else, for the meaning of responsibility is liability to punishment.\" ... Nonetheless, medical and legal accounts of what it meant to be mentally sound became entangled and mutually referential throughout the nineteenth century. Lawyers relied on medical knowledge to inform their opinions and arguments about the sanity of their clients. Doctors commented on the legal responsibility of their patients. Ultimately, the fields of criminal law and mental science were both invested in constructing an image of the broken and damaged psyche that could be contrasted with the whole and healthy one. This shared interest, and the shared space of the criminal courtroom, made it nearly impossible to consider responsibility without medicine, or insanity without law.\nPhysicians and lawyers shared more than just concern for the mind. Class, race, and gender bound these middle-class, white, professional men together, as did family ties, patriotism, Protestantism, business ventures, the alumni networks of elite schools and universities, and structures of political patronage. But for all their affinities, men of medicine and law were divided by contests over the borders of criminal responsibility, as much within each profession as between them. Alienists steadily pushed the boundaries of their field, developing increasingly complex and capacious definitions of insanity. Eccentricity and aggression came to be classified as symptoms of mental disease, at least by some."
    },
    {
      "client_set_id": "VARC_VA_4",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 7,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_RC_4",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 8,
      "context_type": "rc_passage",
      "context_title": "Income Inequality and Economic Growth",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "Studies showing that income inequality plays a positive role in economic growth are largely based on three arguments. The first argument focuses on investment indivisibilities wherein large sunk costs are required when implementing new fundamental innovations. Without stock markets and financial institutions to mobilize large sums of money, a high concentration of wealth is needed for individuals to undertake new industrial activities accompanied by high sunk costs... [One study] shows the relation between economic growth and income inequality for 45 countries during 1966-1995. [It was found that the increase in income inequality has a significant positive relationship with economic growth in the short and medium term. Using system GMM, [another study estimated] the relation between income inequality and economic growth for 106 countries during 1965-2005 period. The results show that income inequality has a positive impact on economic growth in the short run, but the two are negatively correlated in the long run.\nThe second argument is related to moral hazard and incentives... Because economic performance is determined by the unobservable level of effort that agents make, paying compensations without taking into account the economic performance achieved by individual agents will fail to elicit optimum effort from the agents. Thus, certain income inequalities contribute to growth by enhancing worker motivation. and by giving motivation to innovators and entrepreneurs... Finally, [another study] point[s] out that the concentration of wealth or stock ownership in relation to corporate governance contributes to growth. If stock ownership is distributed and owned by a large number of shareholders, it is not easy to make quick decisions due to the conflicting interests among shareholders, and this may also cause a free-rider problem in terms of monitoring and supervising managers and workers.\nVarious studies have examined the relationships between income inequality and economic growth, and most of these assert that a negative correlation exists between the two. Analyzing 159 countries for 1980-2012, they conclude that there exists a negative relation between income inequality and economic growth; when the income share of the richest 20% of population increases by 1%, the GDP decreases by 0.08%, whereas when the income share of the poorest 20% of population increases by 1%, the GDP increases by 0.38%. Some studies find that inequality has a negative impact on growth due to poor human capital accumulation and low fertility rates... while [others] point out that inequality creates political instability, resulting in lower investment.... [Some economists] argue that widening income inequality has a negative impact on economic growth because it negatively affects social consensus or social capital formation.\nOne important research topic is the correlation between democratization and income redistribution. [Some scholars] explain that social pressure for income redistribution rises as income inequality increases in a democratic society. In other words, when democratization extends suffrage to a wider class of people, the increased political power of low- and middle-income voters results in broader support for income redistribution and social welfare expansion. However... if the rich have more political influence than the poor, the democratic system actually worsens income inequality rather than improving it."
    },
    {
      "client_set_id": "VARC_VA_5",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 9,
      "context_image_url": null
    },
    {
      "client_set_id": "DILR_SET_1",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 1,
      "context_type": "dilr_set",
      "context_title": "Round Table Seating",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "A round table has seven chairs around it. The chairs are numbered 1 through 7 in a clockwise direction. Four friends, Aslam, Bashir, Chhavi, and Davies, sit on four of the chairs. In the starting position, Aslam and Chhavi are sitting next to each other, while for Bashir as well as Davies, there are empty chairs on either side of the chairs that are sitting on. The friends take turns moving either clockwise or counterclockwise from their chair. The friend who has to move in a turn occupies the first empty chair in whichever direction (s) he chooses to move.\nAslam moves first (Turn 1), followed by Bashir, Chhavi, and Davies (Turns 2, 3, and 4, respectively). Then Aslam moves again followed by Bashir, and Chhavi (Turns 5, 6, and 7, respectively).\nThe following information is known:\n1. The four friends occupy adjacent chairs only at the end of Turn 2 and Turn 6.\n2. Davies occupies Chair 2 after Turn 1 and Chair 4 after Turn 5, and Chhavi occupies Chair 7 after Turn 2."
    },
    {
      "client_set_id": "DILR_SET_2",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 2,
      "context_type": "dilr_set",
      "context_title": "InnovateX Ratings",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "At InnovateX, six employees, Asha, Bunty, Chintu, Dolly, Eklavya, and Falguni, were split into two groups of three each: Elite led by Manager Kuku, and Novice led by Manager Lalu. At the end of each quarter, Kuku and Lalu handed out ratings to all members in their respective groups. In each group, each employee received a distinct integer rating from 1 to 3. The score for an employee at the end of a quarter is defined as their cumulative rating from the beginning of the year.\nAt the end of each quarter the employee in Novice with the highest score was promoted to Elite, and the employee in Elite with the minimum score was demoted to Novice. If there was a tie in scores, the employee with a higher rating in the latest quarter was ranked higher.\nAsha, Bunty, and Chintu were in Elite at the beginning of Quarter 1. All of them were in Novice at the beginning of Quarter 4. Dolly and Falguni were the only employees who got the same rating across all the quarters.\nThe following is known about ratings given by Lalu:\n1. Bunty received a rating of 1 in Quarter 2.\n2. Asha and Dolly received ratings of 1 and 2, respectively, in Quarter 3."
    },
    {
      "client_set_id": "DILR_SET_3",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 3,
      "context_type": "dilr_set",
      "context_title": "Import Tariffs",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "Five countries engage in trade with each other. Each country levies import tariffs on the other countries. The import tariff levied by Country X on Country Y is calculated by multiplying the corresponding tariff percentage with the total imports of Country X from Country Y.\nThe radar chart (not shown) depicts different import tariff percentages charged by each of the five countries on the others. For example, US (the blue line in the chart) charges 20%, 40%, 30%, and 30% import tariff percentages on imports from France, India, Japan, and UK, respectively. The bar chart (not shown) depicts the import tariffs levied by each county on other countries. For example, US charged import tariff of 3 billion USD on UK.\nAssume that imports from one country to another equals the exports from the latter to the former. The trade surplus of Country X with Country Y is defined as: Exports from Country X to Country Y - Imports to Country X from Country Y."
    },
    {
      "client_set_id": "DILR_SET_4",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 4,
      "context_type": "dilr_set",
      "context_title": "Train Booking",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "A train travels from Station A to Station E, passing through stations B, C, and D, in that order. The train has a seating capacity of 200. A ticket may be booked from any station to any other station ahead on the route. A ticket reserves one seat on every intermediate segment. The occupancy factor for a segment is the total number of seats reserved in the segment as a percentage of the seating capacity.\nInformation:\n1. Segment C - D had an occupancy factor of 95%. Only segment B - C had a higher occupancy factor.\n2. Exactly 40 tickets were booked from B to C and 30 tickets were booked from B to E.\n3. Among the seats reserved on segment D - E, exactly four-sevenths were from stations before C.\n4. The number of tickets booked from A to C was equal to that booked from A to E, and it was higher than that from B to E.\n5. No tickets were booked from A to B, from B to D and from D to E.\n6. The number of tickets booked for any segment was a multiple of 10."
    },
    {
      "client_set_id": "DILR_SET_5",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 5,
      "context_type": "dilr_set",
      "context_title": "Foot Tapping Game",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "Alia, Badal, Clive, Dilshan, and Ehsaan played a game where each asks a unique question to all others, who respond by tapping feet: 1 tap (\"Yes\"), 2 taps (\"No\"), 3 taps (\"Maybe\").\nTotal taps = 40. Each question got at least one Yes, No, and Maybe.\nInformation:\n1. Alia tapped 6 times total and received 9 taps. She said \"Yes\" to Clive and Dilshan.\n2. Dilshan tapped 11 times, Ehsaan tapped 9 times. Dilshan said \"No\" to Badal.\n3. Badal, Dilshan, and Ehsaan received equal number of taps.\n4. No one said \"Yes\" more than twice.\n5. No one's answer to Alia matched Alia's answer to them. Same for Ehsaan.\n6. Clive tapped more times than Badal."
    },
    {
      "client_set_id": "QA_ATOMIC_47",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 1,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_48",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 2,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_49",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 3,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_50",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 4,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_51",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 5,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_52",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 6,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_53",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 7,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_54",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 8,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_55",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 9,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_56",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 10,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_57",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 11,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_58",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 12,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_59",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 13,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_60",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 14,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_61",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 15,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_62",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 16,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_63",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 17,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_64",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 18,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_65",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 19,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_66",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 20,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_67",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 21,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_68",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 22,
      "context_image_url": null
    }
  ],
  "questions": [
    {
      "client_question_id": "cat-2025-slot-1_Q1",
      "set_ref": "VARC_VA_1",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 1,
      "question_type": "TITA",
      "taxonomy_type": "va_odd_one",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles (Odd One Out)",
      "difficulty": "medium",
      "correct_answer": "4",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Five jumbled sentences (labelled 1, 2, 3, 4, and 5), related to a topic, are given below. Four of them can be put together to form a coherent paragraph. Identify the odd sentence out and key in the number of that sentence as your answer.\n1. Developments both technological and sociocultural have afforded us far greater freedom over death than we had in the past, and while we are still adapting ourselves to that freedom, we now appreciate the moral importance of this freedom.\n2. But I believe that a type of freedom we can call freedom over death that is, a freedom in which we shape the timing and circumstances of how we die - should be central to this conversation.\n3. Legalising assisted dying is but a further step in realising this freedom over death.\n4. Many people endorse, through their opinions or their choices, our freedom over death, encompassing a right to medical assistance in hastening our deaths.\n5. Freedom is a notoriously complex and contested philosophical notion, and I won't pretend to settle any of the big controversies it raises.",
      "solution_text": "The paragraph discusses \"freedom over death\" specifically in the context of assisted dying and shaping the timing of death (Sentences 1, 2, 3, 4). Sentence 5 discusses \"freedom\" as a general philosophical notion, which is too broad and disconnects from the specific argument about death and assisted dying."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q2",
      "set_ref": "VARC_RC_1",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 2,
      "question_type": "MCQ",
      "taxonomy_type": "rc_structure",
      "topic": "Reading Comprehension",
      "subtopic": "Music",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The goal of the author over the course of this passage is to:",
      "options": [
        {
          "id": "A",
          "text": "differentiate the modern composer from the nineteenth century composer"
        },
        {
          "id": "B",
          "text": "differentiate between electronic music and other forms of music."
        },
        {
          "id": "C",
          "text": "defend the \"serious-minded composer\" from Lejaren Hill and Stravinsky."
        },
        {
          "id": "D",
          "text": "defend electronic music from certain common charges."
        }
      ],
      "solution_text": "The author starts by listing charges against electronic music (is it music? is it inhuman?) and then addresses the definitions of music and the \"communication problem\" to bridge the gap for the listener, effectively defending the genre."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q3",
      "set_ref": "VARC_RC_1",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 3,
      "question_type": "MCQ",
      "taxonomy_type": "rc_structure",
      "topic": "Reading Comprehension",
      "subtopic": "Music",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "What relation does the \"communication problem\" mentioned in paragraph 2 have to the questions that the author recounts at the beginning of the passage?",
      "options": [
        {
          "id": "A",
          "text": "Unfamiliar forms and terms might get in the way of our seeing electronic music as music, but this can be overcome."
        },
        {
          "id": "B",
          "text": "Its unfamiliar \"language of forms\" and novel terms mean that we cannot see electronic music as music since it does not employ traditional musical concepts."
        },
        {
          "id": "C",
          "text": "None; they are unrelated to one another and form parts of different discussions."
        },
        {
          "id": "D",
          "text": "The communication problem is what allows us to see electronic music as music because music must be difficult to understand."
        }
      ],
      "solution_text": "The initial questions ask if it is music at all. The communication problem explains *why* it might not seem like music (unfamiliar language of forms) but argues that understanding these procedures removes the barrier."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q4",
      "set_ref": "VARC_RC_1",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 4,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Music",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The mention of Stravinsky's description of music in the first paragraph does all the following EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "help us determine which sounds are musical and which are not."
        },
        {
          "id": "B",
          "text": "respond to and expand upon earlier understandings of music."
        },
        {
          "id": "C",
          "text": "complicate our notion of what is communicated through music."
        },
        {
          "id": "D",
          "text": "allow us to classify electronic music as music."
        }
      ],
      "solution_text": "Stravinsky's definition (\"speculation in terms of sound and time\") is used to move away from 19th-century emotional definitions (B), allows for a broader view including electronic music (D), and shifts focus from subjective communication (C). It does not provide a rubric for determining which specific *sounds* are musical (A)."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q5",
      "set_ref": "VARC_RC_1",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 5,
      "question_type": "MCQ",
      "taxonomy_type": "rc_vocab",
      "topic": "Reading Comprehension",
      "subtopic": "Music",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "From the context in which it is placed, the phrase \"sui generis\" in paragraph 3 suggests which one of the following?",
      "options": [
        {
          "id": "A",
          "text": "Particular"
        },
        {
          "id": "B",
          "text": "Generic"
        },
        {
          "id": "C",
          "text": "Unaesthetic"
        },
        {
          "id": "D",
          "text": "Indescribable"
        }
      ],
      "solution_text": "\"Sui generis\" means unique or of its own kind/particular to itself. The context contrasts reproducing traditional patterns with exploring languages unique to the new medium."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q6",
      "set_ref": "VARC_VA_2",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 6,
      "question_type": "TITA",
      "taxonomy_type": "va_jumble",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles",
      "difficulty": "medium",
      "correct_answer": "2143",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The four sentences (labelled 1, 2, 3, and 4) given below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer.\n1. it can increase the effect of this function, by being linked closely with it;\n2. It can in fact be integrated into any function (education, medical treatment, production, punishment);\n3. it can establish a direct proportion between 'surplus power' and 'surplus production'.\n4. it can constitute a mixed mechanism in which relations of power (and of knowledge) may be precisely adjusted, in the smallest detail, to the processes that are to be supervised;\n[Context sentences provided in source for flow check, but strict sequencing relies on 1-4]:\n(Source text indicates: \"The panoptic mechanism is not simply... It's a case of 'it's easy once you've thought of it'...\" followed by the sentences).",
      "solution_text": "2 introduces the idea that \"it\" can be integrated into any function. 1 follows by saying it increases the effect of \"this function\" (linking back to 2). 4 expands on how it constitutes a mechanism within that function. 3 concludes with the result (surplus power/production)."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q7",
      "set_ref": "VARC_VA_2",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 7,
      "question_type": "MCQ",
      "taxonomy_type": "va_placement",
      "topic": "Verbal Ability",
      "subtopic": "Sentence Placement",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The given sentence is missing in the paragraph below. Decide where it best fits among the options 1, 2, 3, or 4 indicated in the paragraph.\nSentence: \"Everything is old-world, traditional techniques from Mexico,\" Ava emphasizes.\nParagraph: The sisters embrace the ways their great-grandfather built and repaired instruments. (1) When crafting a Mexican guitarron used in mariachi music, they use tacote wood for the top of the instrument. Once the wood is cut, they carve the neck and heel from a single block using tools like hand saws, chisels and sandpaper rather than modern power tools and believe that this traditional method improves the tone of the instrument. (2) Their store has a three-year waitlist for instruments that take months to create. (3) The family's artisanship has attracted stars like Los Lobos, who own custom guitars made by all three generations of the Delgado family. (4) For the sisters, involvement in the family business started at an early age. They each built their first instruments at age 9.",
      "options": [
        {
          "id": "A",
          "text": "Option 1"
        },
        {
          "id": "B",
          "text": "Option 4"
        },
        {
          "id": "C",
          "text": "Option 2"
        },
        {
          "id": "D",
          "text": "Option 3"
        }
      ],
      "solution_text": "The sentence mentions \"old-world, traditional techniques\". The sentence following (1) describes these techniques in detail (\"carve... hand saws... rather than modern power tools\"). Thus, the sentence introduces the description that follows immediately at (1)."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q8",
      "set_ref": "VARC_VA_2",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 8,
      "question_type": "MCQ",
      "taxonomy_type": "va_placement",
      "topic": "Verbal Ability",
      "subtopic": "Sentence Placement",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The given sentence is missing in the paragraph below. Decide where it best fits among the options 1, 2, 3, or 4 indicated in the paragraph.\nSentence: Historically, silver has been, and still is, an important element in the business of 'show' visible in private houses, churches, government and diplomacy.\nParagraph: (1) Timothy Schroder put it succinctly in suggesting that electric light and eating in the kitchen eroded this need. As he explained to the author, 'Silver, when illuminated by flickering candlelight, comes alive and almost dances before the eyes, but when lit by electric light, it becomes flat and dead.' (2) Domestic and economic changes may have worked against the market, but the London silver trade remained buoyant, thanks to the competition of collectors seeking grand display silver at the top end, and the buyers of 'collectables', like spoons and wine labels and 'novelties', at the bottom. (3) Another factor that came into play was the systematic collection building of certain American museums over the period. Boston, Huntington Art Gallery and Williamsburg, among others, were largely supplied by London dealers. (4)",
      "options": [
        {
          "id": "A",
          "text": "Option 4"
        },
        {
          "id": "B",
          "text": "Option 3"
        },
        {
          "id": "C",
          "text": "Option 1"
        },
        {
          "id": "D",
          "text": "Option 2"
        }
      ],
      "solution_text": "Option 3 is the correct answer (Key: B). The sentence introduces the historical importance of silver in \"show\". The paragraph following (1) discusses the decline of this need (electric light). The sentence actually seems to fit best as an intro, but given the options, placing it at (3) doesn't seem right contextually compared to the start. *Correction*: Let's re-read carefully. The sentence is about silver being an element of 'show'. (1) discusses the erosion of \"this need\" (implying the need for show/silver was mentioned prior). However, if we look at Option 3 (Source: B), the sentence might be unrelated to the museum factor. Let's look at the Official Answer provided in source. Source says `Correct Answer: B` which corresponds to `Option 3`."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q9",
      "set_ref": "VARC_RC_2",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 9,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology/Economics",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All of the following inferences are supported by the passage EXCEPT that:",
      "options": [
        {
          "id": "A",
          "text": "examples like runs on banks and toilet paper scrambles illustrate how contagion can amplify local choices into system-wide cascades that surprise participants and lead to patterns they did not intend to create."
        },
        {
          "id": "B",
          "text": "learning can change the rules that actors face. So, a rare shock can alter payoffs and raise the odds of subsequent large disturbances within the same system, which supports the idea of second-order tail events."
        },
        {
          "id": "C",
          "text": "heavy-tailed events make extreme outcomes more frequent and larger than bell curve expectations. This complicates forecasting and risk management in collective settings shaped by contagion and copying behaviour."
        },
        {
          "id": "D",
          "text": "the text attributes the COVID-19 pandemic rebound in financial markets solely to displaced sports bettors and treats their entry as the overriding cause of the rapid recovery across assets and time horizons."
        }
      ],
      "solution_text": "The text states \"Some of these dynamics are potentially attributable to former sports bettors...\" (probability/partial attribution), whereas Option D claims it attributes the rebound *solely* to them and treats it as the *overriding* cause. This is too strong and not supported."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q10",
      "set_ref": "VARC_RC_2",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 10,
      "question_type": "MCQ",
      "taxonomy_type": "rc_summary",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology/Economics",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the options below best summarises the passage?",
      "options": [
        {
          "id": "A",
          "text": "The passage explains how social outcomes generally follow normal distributions. So, extreme events are negligible, and policy should stabilise averages rather than learn from large shocks in fast-changing collective settings."
        },
        {
          "id": "B",
          "text": "The passage explains how noise can create order, then shows why complex systems with contagion are vulnerable to heavy-tailed cascades. It also explains why early shocks change rules through nonstationarity with a market illustration during the COVID-19 disruption."
        },
        {
          "id": "C",
          "text": "The passage explains how speculative entrants always produce inefficiency after health shocks. Therefore, long-term investors invariably profit when new participants push prices away from fundamentals under pandemic conditions and comparable crises."
        },
        {
          "id": "D",
          "text": "The passage explains how nonstationarity works in evolutionary biology and rejects applications in markets or public health because adaptation is exclusive to parasite-host systems and cannot arise in technology-mediated social dynamics."
        }
      ],
      "solution_text": "Option B captures the key points: noise creating order (fish/apps), vulnerability to heavy-tailed events (contagion), and nonstationarity (rules changing after shocks, COVID/market example)."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q11",
      "set_ref": "VARC_RC_2",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 11,
      "question_type": "MCQ",
      "taxonomy_type": "rc_strengthen",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology/Economics",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following observations would most strengthen the passage's claim that a first-order tail event raises the probability of further tail events in complex systems?",
      "options": [
        {
          "id": "A",
          "text": "In epidemic networks, initial super-spreading episodes are isolated spikes after which outbreak sizes match the baseline distribution from independent contact models across comparable cities with no rise in the frequency or size of later extreme clusters."
        },
        {
          "id": "B",
          "text": "River discharge records show water levels fit a normal distribution with thin tails that match laboratory data, regardless of storms or floods."
        },
        {
          "id": "C",
          "text": "After a major equity crash, researchers find dense clusters of large daily moves for several weeks, with extreme days occurring far more often than in normal circumstances for assets with customarily low volatility profiles."
        },
        {
          "id": "D",
          "text": "Following large earthquakes, regional seismic activity returns to baseline within hours with no aftershock sequence once data are adjusted for reporting effects, which suggests independence across events rather than any elevation in subsequent tail probabilities."
        }
      ],
      "solution_text": "The claim is that a first tail event *increases* the probability of subsequent ones (clustering). Option C explicitly describes this: after a crash (first event), extreme days occur \"far more often\" (increased probability of second-order events)."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q12",
      "set_ref": "VARC_RC_2",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 12,
      "question_type": "MCQ",
      "taxonomy_type": "rc_assumption",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology/Economics",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage suggests that contact tracing apps could inadvertently raise risky interactions by altering local behaviour. Which one of the assumptions below is most necessary for that suggestion to hold?",
      "options": [
        {
          "id": "A",
          "text": "Most users uninstall apps within a week, which leaves only highly exposed individuals participating. This neutralises any systematic bias in routing decisions and prevents any predictable change in aggregate contact patterns."
        },
        {
          "id": "B",
          "text": "Individuals base movement choices partly on observed infections and on the behaviour of others. So, local responses interact, which turns many small adjustments into large scale patterns that can frustrate the intended aim of risk reduction."
        },
        {
          "id": "C",
          "text": "App alerts always include precise location to within one metre and deliver real time updates for all users, which ensures that the data feed is perfectly accurate regardless of privacy settings, power limits, or network conditions."
        },
        {
          "id": "D",
          "text": "Urban networks have uniform traffic conditions at all hours, which allows perfectly predictable routing independent of personal choices, social signals, or crowd reactions and, therefore, makes interdependence negligible in city movement decisions."
        }
      ],
      "solution_text": "For local changes to generate a collective pattern (as argued in the passage), individuals must be reacting to the information (observed infections/others' behavior) and these reactions must interact to form the new pattern. Option B articulates this mechanism."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q13",
      "set_ref": "VARC_VA_3",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 13,
      "question_type": "TITA",
      "taxonomy_type": "va_jumble",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles",
      "difficulty": "medium",
      "correct_answer": "3421",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The four sentences (labelled 1, 2, 3, and 4) given below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer.\n1. But man, woman or otherwise, there is no denying that the quality of our life and character will be significantly shaped by the way we handle our anger.\n2. Once the taboos have been broken, women usually experience letting their fists fly as intensely liberating.\n3. Though this might seem a stereotype, women-unlike men, who are frequently applauded for unbridled aggression are often socialized to keep a lid on their ire.\n4. Many of them are so at odds with their aggressive feelings that, as a coach, I often have to stop them from pulling their punches and encourage them to extend their arms so their blows might actually reach their fleshy target.",
      "solution_text": "3 introduces the topic (women socialized to hide anger vs men). 4 elaborates on the consequence (pulling punches). 2 describes the result of overcoming this (liberating). 1 concludes with a general statement about handling anger."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q14",
      "set_ref": "VARC_VA_3",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 14,
      "question_type": "MCQ",
      "taxonomy_type": "va_summary",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Summary",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage given below is followed by four summaries. Choose the option that best captures the essence of the passage.\nZombie cells may contribute to age-related chronic inflammation: this finding could help scientists understand more about the aging process and why the immune system becomes less effective as we get older. Zombie or \"senescent\" cells are damaged cells that can no longer divide and grow like normal cells. Scientists think that these cells can contribute to chronic health problems when they accumulate in the body. In younger people, the immune system is more effective at clearing senescent cells from the body through a process called apoptosis, but as we age, this process becomes less efficient. As a result, there is an accumulation of senescent cells in different organs in the body, either through increased production or reduced clearance by the immune system. The zombie cells continue to use energy though they do not divide, and often secrete chemicals that cause inflammation, which if persistent for longer periods of time can damage healthy cells leading to chronic diseases.",
      "options": [
        {
          "id": "A",
          "text": "Senescent \"zombie\" cells are inactive or malfunctioning cells that can be found throughout the body."
        },
        {
          "id": "B",
          "text": "A younger person's immune system is healthy and is able to clear the damaged cells, but as people age, the zombie cells resist apoptosis, and start accumulating in the body."
        },
        {
          "id": "C",
          "text": "Aging leads to less effective apoptosis, and therefore zombie cells start to accumulate in the body, causing inflammation, which accelerates aging and leads to chronic diseases."
        },
        {
          "id": "D",
          "text": "Dead cells accelerate chronic inflammation weakening the immune system and lead to aging."
        }
      ],
      "solution_text": "Option C covers the causal chain: Aging -> less effective apoptosis -> accumulation of zombie cells -> inflammation -> chronic disease/aging."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q15",
      "set_ref": "VARC_RC_3",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 15,
      "question_type": "MCQ",
      "taxonomy_type": "rc_detail",
      "topic": "Reading Comprehension",
      "subtopic": "History/Law",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The last paragraph of the passage refers to \"middle-class, white, professional men\". Which one of the following qualities best describes the connection among them?",
      "options": [
        {
          "id": "A",
          "text": "The borders of criminal responsibility."
        },
        {
          "id": "B",
          "text": "The opinions of family and neighbours."
        },
        {
          "id": "C",
          "text": "Eccentricity and aggression."
        },
        {
          "id": "D",
          "text": "Empathy and imagination."
        }
      ],
      "solution_text": "The paragraph states they were bound by class, race, gender, etc., BUT \"divided by contests over the borders of criminal responsibility\". The question asks what describes the *connection*? Actually, looking at the options, A, B, C, D are phrases from the text. The question asks for the connection. The text says \"Class, race, and gender bound these... men together\". However, the options don't list those. Let's re-read carefully. The men were *divided* by \"contests over the borders of criminal responsibility\". This seems to be the point of *tension* or the defining professional struggle connecting their interaction in the courtroom. Wait, looking at the official answer A (\"The borders of criminal responsibility\"), it seems the question implies what issue connected/involved them professionally, even if it was a contest. Or perhaps it implies they were connected by the *debate* over it."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q16",
      "set_ref": "VARC_RC_3",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 16,
      "question_type": "MCQ",
      "taxonomy_type": "rc_factual",
      "topic": "Reading Comprehension",
      "subtopic": "History/Law",
      "difficulty": "easy",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "According to the passage, who or what was an \"alienist\"?",
      "options": [
        {
          "id": "A",
          "text": "Professionals who pushed the boundaries of their fields till they became unrecognisable in the nineteenth century."
        },
        {
          "id": "B",
          "text": "Physicians who specialised in the study of madness and the care of the insane in the nineteenth century."
        },
        {
          "id": "C",
          "text": "Physicians and lawyers who were responsible for the condition of immigrants or 'aliens' in the nineteenth century."
        },
        {
          "id": "D",
          "text": "Physicians and lawyers who were responsible for examining accounts of extraterrestrials or 'aliens' in the nineteenth century."
        }
      ],
      "solution_text": "Direct quote: \"physicians who specialized in the study of madness and the care of the insane... Often called alienists\"."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q17",
      "set_ref": "VARC_RC_3",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 17,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "History/Law",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Study the following sets of concepts and identify the set that is conceptually closest to the concerns and arguments of the passage.",
      "options": [
        {
          "id": "A",
          "text": "Empathy, Prosecution, Knowledge, Business."
        },
        {
          "id": "B",
          "text": "Judgement, Belief, Accounts, Patronage."
        },
        {
          "id": "C",
          "text": "Assessment, Empathy, Prosecution, Patriotism."
        },
        {
          "id": "D",
          "text": "Judgement, Insanity, Punishment, Responsibility."
        }
      ],
      "solution_text": "The passage discusses the judgment of mental states, the definition of insanity vs legal responsibility, and liability to punishment. Set D covers the core legal/medical intersection discussed."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q18",
      "set_ref": "VARC_RC_3",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 18,
      "question_type": "MCQ",
      "taxonomy_type": "rc_vocab",
      "topic": "Reading Comprehension",
      "subtopic": "History/Law",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "\"Conversely, when a defendant struck officials as unlike themselves, whether by dint of disease, gender, confession, or race, the precariousness of judgments about mental state was exposed.\" Which one of the following best describes the use of the word \"confession\" in this sentence?",
      "options": [
        {
          "id": "A",
          "text": "Referring to the practice of 'confession' in some faiths, here it is a metaphor for the religion of the defendant."
        },
        {
          "id": "B",
          "text": "Referring to the gender, race or disease claimed as a defence by the defendant, here it is a synonym for 'professing' a gender, race, or disease."
        },
        {
          "id": "C",
          "text": "Referring to the defendant's confession of his or her crime as false, because 'didn't' is an archaic form of 'didn't' or 'did not'."
        },
        {
          "id": "D",
          "text": "The defendants struck out at the officials and then confessed to the act."
        }
      ],
      "solution_text": "The list \"disease, gender, confession, or race\" refers to attributes that make the defendant \"unlike\" the officials (who are Protestant, white, men). \"Confession\" here likely refers to religious confession (Catholicism etc.), serving as a marker for religion/faith, contrasting with the \"Protestantism\" of the officials mentioned later."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q19",
      "set_ref": "VARC_VA_4",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 19,
      "question_type": "TITA",
      "taxonomy_type": "va_odd_one",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles (Odd One Out)",
      "difficulty": "medium",
      "correct_answer": "1",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Five jumbled sentences (labelled 1, 2, 3, 4, and 5), related to a topic, are given below. Four of them can be put together to form a coherent paragraph. Identify the odd sentence out and key in the number of that sentence as your answer.\n1. The Bayeux tapestry was, therefore, an obvious way to tell people about the downfall of the English and the rise of the Normans.\n2. So if we take expert in Anglo-Saxon culture Gale Owen-Crocker's idea that the tapestry was originally hung in a square with certain scenes facing each other, people would have stood in the centre.\n3. Art historian Linda Neagley has argued that pre-Renaissance people interacted with art visually, kinaesthetically (sensory perception through bodily movement) and physically.\n4. That would make it an 11th-century immersive space with scenes corresponding and echoing each other, drawing the viewer's attention, playing on their senses and understanding of the story they thought they knew.\n5. The Bayeux tapestry would have been hung at eye level to enable this.",
      "solution_text": "Sentences 3, 2, 4, 5 connect logically: 3 introduces how people interacted with art (visually/physically). 2 applies this to the Bayeux tapestry (hung in a square, people in center). 4 explains the effect (immersive space). 5 adds the detail about hanging at eye level to enable this interaction. Sentence 1 discusses the *content/purpose* (propaganda about Normans), which is distinct from the *physical experience/installation* theme of the other four."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q20",
      "set_ref": "VARC_RC_4",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 20,
      "question_type": "MCQ",
      "taxonomy_type": "rc_summary",
      "topic": "Reading Comprehension",
      "subtopic": "Economics",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the options below best summarises the passage?",
      "options": [
        {
          "id": "A",
          "text": "The passage claims that evaluating the effect of income inequality on economic growth without considering both short- and long-term consequences is misguided"
        },
        {
          "id": "B",
          "text": "The passage confines its discussion to financing gaps and corporate control while undercutting cross country evidence and overlooking the significance of concerns regarding human capital accumulation, fertility rates, and income redistribution under democratisation."
        },
        {
          "id": "C",
          "text": "The passage argues that income inequality accelerates economic growth while also emphasising the significance of concerns regarding human capital accumulation, fertility rates, and political instability."
        },
        {
          "id": "D",
          "text": "The passage outlines investment, incentive, and governance channels through which income inequality may support economic growth and reports short-term gains while noting longterm drawbacks"
        }
      ],
      "solution_text": "Option D covers the first half (investment, incentive, governance channels for positive growth) and the second half (short-term gains vs long-term negative correlations/drawbacks found in other studies)."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q21",
      "set_ref": "VARC_RC_4",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 21,
      "question_type": "MCQ",
      "taxonomy_type": "rc_vocab",
      "topic": "Reading Comprehension",
      "subtopic": "Economics",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage refers to \"democratization\". Choose the one option below that comes closest to the opposite of this process.",
      "options": [
        {
          "id": "A",
          "text": "After the emergency decree, the regime shifted toward authoritarianism as suffrage narrowed and opposition parties were deregistered."
        },
        {
          "id": "B",
          "text": "Corporate donations were capped and parties received public funding which was portrayed as establishing an oligarchy."
        },
        {
          "id": "C",
          "text": "Municipalities adopted participatory budgeting and recall elections which a press release called totalitarianism."
        },
        {
          "id": "D",
          "text": "The coalition imposed term limits and strengthened judicial review in order to further entrench autocratic rule."
        }
      ],
      "solution_text": "Democratization involves extending suffrage and political power to a wider class. Option A describes the opposite: narrowing suffrage and deregistering parties (authoritarianism)."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q22",
      "set_ref": "VARC_RC_4",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 22,
      "question_type": "MCQ",
      "taxonomy_type": "rc_structure",
      "topic": "Reading Comprehension",
      "subtopic": "Economics",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The primary function of the three-part case for a positive income inequality-economic growth link in the first half of the passage is to show that:",
      "options": [
        {
          "id": "A",
          "text": "inequality boosts growth in every period and type of economy, regardless of finance or governance conditions."
        },
        {
          "id": "B",
          "text": "mature stock markets make wealth concentration unnecessary, yet they might still be harmful to investment."
        },
        {
          "id": "C",
          "text": "inequality can aid short-term growth in settings with high sunk costs, incentive alignment, and concentrated ownership."
        },
        {
          "id": "D",
          "text": "dispersed ownership speeds corporate decision-making and removes free rider problems."
        }
      ],
      "solution_text": "The arguments focus on specific conditions: high sunk costs (investment indivisibilities), incentive alignment (moral hazard), and corporate governance (concentrated ownership). The studies cited mentioned positive impact in the \"short run\". Option C captures these specific conditions and the temporal aspect."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q23",
      "set_ref": "VARC_RC_4",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 23,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Economics",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "According to the incentive or moral hazard argument, which one of the designs below is most consistent with the claim that some inequality can raise growth?",
      "options": [
        {
          "id": "A",
          "text": "Pay rewards on verifiable performance for highly productive workers."
        },
        {
          "id": "B",
          "text": "Rents protected by market power that enlarge top incomes without linking pay to results."
        },
        {
          "id": "C",
          "text": "Wages are determined by tenure rather than output to ensure equity."
        },
        {
          "id": "D",
          "text": "A regime that concentrates stock ownership in relation to corporate governance."
        }
      ],
      "solution_text": "The text says: \"paying compensations without taking into account the economic performance... will fail to elicit optimum effort... income inequalities contribute to growth by enhancing worker motivation.\" Option A (rewards on performance) aligns with this logic."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q24",
      "set_ref": "VARC_VA_5",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 24,
      "question_type": "MCQ",
      "taxonomy_type": "va_summary",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Summary",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage given below is followed by four summaries. Choose the option that best captures the essence of the passage.\nIn the dynamic realm of creativity, artists often find themselves at the crossroads between drawing inspiration from diverse cultures and inadvertently crossing into the territory of cultural appropriation. Inspiration is the lifeblood of creativity, driving artists to create works that resonate across borders. The globalized nature of the modern world invites artists to draw from a vast array of cultural influences. When approached respectfully, inspiration becomes a bridge, fostering understanding and appreciation of cultural diversity. However, the line between inspiration and cultural appropriation can be thin and easily blurred. Cultural appropriation occurs when elements from a particular culture are borrowed without proper understanding, respect, or acknowledgement. This leads to the commodification of sacred symbols, the reinforcement of stereotypes, and the erasure of the cultural context from which these elements originated. It's essential to recognize that the impact of cultural appropriation extends beyond the realm of artistic expression, influencing societal perceptions and perpetuating power imbalances.",
      "options": [
        {
          "id": "A",
          "text": "Artists in a globalised world must navigate between drawing inspiration from diverse cultures respectfully and cultural appropriation that involves borrowing without proper acknowledgement which has broader societal impacts including perpetuating power imbalances."
        },
        {
          "id": "B",
          "text": "In today's world of creativity, artists have to decide between respectfully acknowledging works that are inspired by diverse cultures and appropriating elements without respect for their contexts."
        },
        {
          "id": "C",
          "text": "In a globalised world, artists must draw from diverse cultural influences to create works that appeal to all, and this results in instances of both inspiration and cultural appropriation."
        },
        {
          "id": "D",
          "text": "Artists must navigate the thin line between inspiration and cultural appropriation, where respectful inspiration fosters cultural understanding whereas appropriation involves borrowing without acknowledgement leading to commodification and reinforcement of stereotypes."
        }
      ],
      "solution_text": "Option A captures the balance (inspiration vs appropriation), the definition of appropriation (borrowing without acknowledgment), and the critical consequence (societal impacts/power imbalances), which is the concluding point of the passage. Option D is close but misses the \"power imbalances\" aspect mentioned in the final sentence."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q25",
      "set_ref": "DILR_SET_1",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 25,
      "question_type": "TITA",
      "taxonomy_type": "lr_arrangement",
      "topic": "Logical Reasoning",
      "subtopic": "Seating Arrangement",
      "difficulty": "hard",
      "correct_answer": "4",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What is the number of the chair initially occupied by Bashir?",
      "solution_text": "[cite_start]Based on the movement rules and the constraint that Bashir has empty chairs on both sides initially, tracing the moves backward from the known positions (Davies at 2 after Turn 1, etc.) reveals Bashir started at Chair 4[cite: 978]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q26",
      "set_ref": "DILR_SET_1",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 26,
      "question_type": "MCQ",
      "taxonomy_type": "lr_arrangement",
      "topic": "Logical Reasoning",
      "subtopic": "Seating Arrangement",
      "difficulty": "hard",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Who sits on the chair numbered 4 at the end of Turn 3?",
      "options": [
        {
          "id": "A",
          "text": "Bashir"
        },
        {
          "id": "B",
          "text": "Chhavi"
        },
        {
          "id": "C",
          "text": "Davies"
        },
        {
          "id": "D",
          "text": "No one"
        }
      ],
      "solution_text": "[cite_start]Tracing the movements to Turn 3, Chair 4 is unoccupied[cite: 980]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q27",
      "set_ref": "DILR_SET_1",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 27,
      "question_type": "MCQ",
      "taxonomy_type": "lr_arrangement",
      "topic": "Logical Reasoning",
      "subtopic": "Seating Arrangement",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the chairs are occupied at the end of Turn 6?",
      "options": [
        {
          "id": "A",
          "text": "Chairs numbered 4, 5, 6, and 7"
        },
        {
          "id": "B",
          "text": "Chairs numbered 1, 2, 3, and 4"
        },
        {
          "id": "C",
          "text": "Chairs numbered 2, 3, 4, and 5"
        },
        {
          "id": "D",
          "text": "Chairs numbered 1, 2, 6, and 7"
        }
      ],
      "solution_text": "At the end of Turn 6, the friends occupy a contiguous block of chairs (rule 1). [cite_start]The positions correspond to 4, 5, 6, and 7[cite: 987]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q28",
      "set_ref": "DILR_SET_1",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 28,
      "question_type": "MCQ",
      "taxonomy_type": "lr_arrangement",
      "topic": "Logical Reasoning",
      "subtopic": "Seating Arrangement",
      "difficulty": "hard",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following BEST describes the friends sitting on chairs adjacent to the one occupied by Bashir at the end of Turn 7?",
      "options": [
        {
          "id": "A",
          "text": "Chhavi only"
        },
        {
          "id": "B",
          "text": "Davies only"
        },
        {
          "id": "C",
          "text": "Chhavi and Davies"
        },
        {
          "id": "D",
          "text": "Aslam and Chhavi"
        }
      ],
      "solution_text": "[cite_start]After the final moves, only Davies is adjacent to Bashir[cite: 992]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q29",
      "set_ref": "DILR_SET_2",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 29,
      "question_type": "TITA",
      "taxonomy_type": "lr_ranking",
      "topic": "Logical Reasoning",
      "subtopic": "Ranking",
      "difficulty": "medium",
      "correct_answer": "4",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What was Eklavya's score at the end of Quarter 2?",
      "solution_text": "[cite_start]Calculating the cumulative scores based on promotions/demotions and known ratings yields 4[cite: 1010]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q30",
      "set_ref": "DILR_SET_2",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 30,
      "question_type": "TITA",
      "taxonomy_type": "lr_ranking",
      "topic": "Logical Reasoning",
      "subtopic": "Ranking",
      "difficulty": "medium",
      "correct_answer": "0",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many employees changed groups more than once up to the beginning of Quarter 4?",
      "solution_text": "[cite_start]Tracking the movements shows that no employee moved back and forth more than once[cite: 1012]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q31",
      "set_ref": "DILR_SET_2",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 31,
      "question_type": "TITA",
      "taxonomy_type": "lr_ranking",
      "topic": "Logical Reasoning",
      "subtopic": "Ranking",
      "difficulty": "medium",
      "correct_answer": "5",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What was Bunty's score at the end of Quarter 3?",
      "solution_text": "[cite_start]Bunty's cumulative score sums to 5[cite: 1014]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q32",
      "set_ref": "DILR_SET_2",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 32,
      "question_type": "TITA",
      "taxonomy_type": "lr_ranking",
      "topic": "Logical Reasoning",
      "subtopic": "Ranking",
      "difficulty": "medium",
      "correct_answer": "4",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "For how many employees can the scores at the end of Quarter 3 be determined with certainty?",
      "solution_text": "[cite_start]The scores can be uniquely determined for 4 employees[cite: 1016]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q33",
      "set_ref": "DILR_SET_2",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 33,
      "question_type": "MCQ",
      "taxonomy_type": "lr_ranking",
      "topic": "Logical Reasoning",
      "subtopic": "Ranking",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following statements is/are NECESSARILY true?\nII. Asha received a rating of 1 in Quarter 2.",
      "options": [
        {
          "id": "I",
          "text": "Asha received a rating of 2 in Quarter 1."
        },
        {
          "id": "A",
          "text": "Neither I nor II"
        },
        {
          "id": "B",
          "text": "Both I and II"
        },
        {
          "id": "C",
          "text": "Only I"
        },
        {
          "id": "D",
          "text": "Only II"
        }
      ],
      "solution_text": "[cite_start]Only statement II is necessarily true[cite: 1024]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q34",
      "set_ref": "DILR_SET_3",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 34,
      "question_type": "MCQ",
      "taxonomy_type": "di_calculation",
      "topic": "Data Interpretation",
      "subtopic": "Charts",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "How much is Japan's export to India worth?",
      "options": [
        {
          "id": "A",
          "text": "8.5 Billion USD"
        },
        {
          "id": "B",
          "text": "16.0 Billion USD"
        },
        {
          "id": "C",
          "text": "7.0 Billion USD"
        },
        {
          "id": "D",
          "text": "1.75 Billion USD"
        }
      ],
      "solution_text": "[cite_start]Calculated from the tariff percentage and total tariff value provided in the charts[cite: 1042]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q35",
      "set_ref": "DILR_SET_3",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 35,
      "question_type": "MCQ",
      "taxonomy_type": "di_calculation",
      "topic": "Data Interpretation",
      "subtopic": "Charts",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which among the following is the highest?",
      "options": [
        {
          "id": "A",
          "text": "Exports by Japan to UK"
        },
        {
          "id": "B",
          "text": "Imports by US from France"
        },
        {
          "id": "C",
          "text": "Exports by France to Japan"
        },
        {
          "id": "D",
          "text": "Imports by France from India"
        }
      ],
      "solution_text": "[cite_start]Comparing the calculated trade values shows Imports by US from France is the highest[cite: 1048]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q36",
      "set_ref": "DILR_SET_3",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 36,
      "question_type": "MCQ",
      "taxonomy_type": "di_calculation",
      "topic": "Data Interpretation",
      "subtopic": "Charts",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "What is the trade surplus/trade deficit of India with UK?",
      "options": [
        {
          "id": "A",
          "text": "Surplus of 15.0 Billion USD"
        },
        {
          "id": "B",
          "text": "Deficit of 15.0 Billion USD"
        },
        {
          "id": "C",
          "text": "Surplus of 10.0 Billion USD"
        },
        {
          "id": "D",
          "text": "Deficit of 10.0 Billion USD"
        }
      ],
      "solution_text": "[cite_start]India has a deficit of 15.0 Billion USD with the UK[cite: 1054]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q37",
      "set_ref": "DILR_SET_4",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 37,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Logical Reasoning",
      "difficulty": "hard",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "What was the occupancy factor for segment D - E?",
      "options": [
        {
          "id": "A",
          "text": "35%"
        },
        {
          "id": "B",
          "text": "70%"
        },
        {
          "id": "C",
          "text": "77%"
        },
        {
          "id": "D",
          "text": "84%"
        }
      ],
      "solution_text": "[cite_start]Based on the ticket distribution constraints, the occupancy factor is 70%[cite: 1075]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q38",
      "set_ref": "DILR_SET_4",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 38,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Logical Reasoning",
      "difficulty": "hard",
      "correct_answer": "50",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many tickets were booked from Station A to Station E?",
      "solution_text": "[cite_start]The number of tickets is 50[cite: 1077]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q39",
      "set_ref": "DILR_SET_4",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 39,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Logical Reasoning",
      "difficulty": "hard",
      "correct_answer": "80",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many tickets were booked from Station C?",
      "solution_text": "[cite_start]The total booked from C (to D and E) is 80[cite: 1079]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q40",
      "set_ref": "DILR_SET_4",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 40,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Logical Reasoning",
      "difficulty": "hard",
      "correct_answer": "40",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What is the difference between the number of tickets booked to Station C and the number of tickets booked to Station D?",
      "solution_text": "[cite_start]The difference is 40[cite: 1081]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q41",
      "set_ref": "DILR_SET_4",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 41,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Logical Reasoning",
      "difficulty": "hard",
      "correct_answer": "60",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many tickets were booked to travel in exactly one segment?",
      "solution_text": "[cite_start]Summing tickets for A-B (0), B-C, C-D, D-E (0) etc., yields 60[cite: 1083]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q42",
      "set_ref": "DILR_SET_5",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 42,
      "question_type": "TITA",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Games",
      "difficulty": "hard",
      "correct_answer": "7",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many taps did Clive receive for his question?",
      "solution_text": "[cite_start]Solving the grid of responses shows Clive received 7 taps[cite: 1100]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q43",
      "set_ref": "DILR_SET_5",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 43,
      "question_type": "MCQ",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Games",
      "difficulty": "hard",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which two people tapped an equal number of times in total?",
      "options": [
        {
          "id": "A",
          "text": "Badal and Dilshan"
        },
        {
          "id": "B",
          "text": "Clive and Ehsaan"
        },
        {
          "id": "C",
          "text": "Dilshan and Clive"
        },
        {
          "id": "D",
          "text": "Alia and Badal"
        }
      ],
      "solution_text": "[cite_start]Alia and Badal tapped the same number of times[cite: 1106]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q44",
      "set_ref": "DILR_SET_5",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 44,
      "question_type": "MCQ",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Games",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "What was Clive's response to Ehsaan's question?",
      "options": [
        {
          "id": "A",
          "text": "No"
        },
        {
          "id": "B",
          "text": "Maybe"
        },
        {
          "id": "C",
          "text": "Cannot be determined"
        },
        {
          "id": "D",
          "text": "Yes"
        }
      ],
      "solution_text": "[cite_start]Clive responded \"No\"[cite: 1112]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q45",
      "set_ref": "DILR_SET_5",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 45,
      "question_type": "TITA",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Games",
      "difficulty": "hard",
      "correct_answer": "6",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many \"Yes\" responses were received across all the questions?",
      "solution_text": "[cite_start]There were 6 \"Yes\" responses total[cite: 1114]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q46",
      "set_ref": "QA_ATOMIC_47",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 46,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Functions",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "A value of $c$ for which the minimum value of $f(x)=x^{2}-4cx+8c$ is greater than the maximum value of $g(x)=-x^{2}+3cx-2c,$ is",
      "options": [
        {
          "id": "A",
          "text": "$2$"
        },
        {
          "id": "B",
          "text": "$\\frac{1}{2}$"
        },
        {
          "id": "C",
          "text": "$-\\frac{1}{2}$"
        },
        {
          "id": "D",
          "text": "$-2$"
        }
      ],
      "solution_text": "Find the vertex of the parabolas. Min of $f(x)$ occurs at $x=2c$, value is $8c - 4c^2$. Max of $g(x)$ occurs at $x=1.5c$, value is $2.25c^2 - 2c$. [cite_start]Set inequality $8c - 4c^2 > 2.25c^2 - 2c$ and solve for $c$[cite: 1117]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q47",
      "set_ref": "QA_ATOMIC_48",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 47,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Time Speed Distance",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Shruti travels a distance of $224$ km in four parts for a total travel time of $3$ hours. Her speeds in these four parts follow an arithmetic progression, and the corresponding time taken to cover these four parts follow another arithmetic progression. If she travels at a speed of $960$ meters per minute for $30$ minutes to cover the first part, then the distance, in meters, she travels in the fourth part is",
      "options": [
        {
          "id": "A",
          "text": "$76800$"
        },
        {
          "id": "B",
          "text": "$112000$"
        },
        {
          "id": "C",
          "text": "$96000$"
        },
        {
          "id": "D",
          "text": "$86400$"
        }
      ],
      "solution_text": "Convert units to km/h or consistent metric. $S_1 = 960$ m/min. $T_1 = 30$ min. Total distance 224 km. [cite_start]Use sum of AP properties for speed and time to find variables [cite: 1125-1127]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q48",
      "set_ref": "QA_ATOMIC_49",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 48,
      "question_type": "TITA",
      "taxonomy_type": "qa_number_theory",
      "topic": "Quant",
      "subtopic": "Numbers",
      "difficulty": "medium",
      "correct_answer": "6",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "In a 3-digit number $N$, the digits are non-zero and distinct such that none of the digits is a perfect square, and only one of the digits is a prime number. Then, the number of factors of the minimum possible value of $N$ is",
      "solution_text": "Identify valid digits (non-zero, non-square: 2, 3, 5, 6, 7, 8). Primes: 2, 3, 5, 7. Non-primes: 6, 8. Construct min $N$ with one prime and distinct digits (e.g., using small digits). [cite_start]Calculate factors of that $N$[cite: 1135]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q49",
      "set_ref": "QA_ATOMIC_50",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 49,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Inequalities",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Let $3\\le x\\le6$ and $[x^{2}]=[x]^{2}$, where $[z]$ is the greatest integer not exceeding $z$. If set $S$ represents all feasible values of $x$, then a possible subset of $S$ is",
      "options": [
        {
          "id": "A",
          "text": "$[3,\\sqrt{10})\\cup[5,\\sqrt{26})\\cup\\{6\\}$"
        },
        {
          "id": "B",
          "text": "$[3,\\sqrt{10}]\\cup[5,\\sqrt{26}]$"
        },
        {
          "id": "C",
          "text": "$[3,\\sqrt{10}]\\cup[4,\\sqrt{17}]\\cup\\{6\\}$"
        },
        {
          "id": "D",
          "text": "$(4,\\sqrt{18})\\cup[5,\\sqrt{27})\\cup\\{6\\}$"
        }
      ],
      "solution_text": "Analyze intervals where $[x]$ is constant (3, 4, 5, 6). For $[x]=3$, require $[x^2]=9$. For $[x]=4$, require $[x^2]=16$. [cite_start]Check validity in range [cite: 1140-1141]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q50",
      "set_ref": "QA_ATOMIC_51",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 50,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Profit and Loss",
      "difficulty": "easy",
      "correct_answer": "15",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Stocks A, B and C are priced at rupees $120$, $90$ and $150$ per share, respectively. A trader holds a portfolio consisting of $10$ shares of stock A, and $20$ shares of stocks B and C put together. If the total value of her portfolio is rupees $3300$, then the number of shares of stock B that she holds, is",
      "solution_text": "Let $b$ be shares of B, then $c = 20-b$. Equation: $10(120) + 90b + 150(20-b) = 3300$. [cite_start]Solve for $b$ [cite: 1149-1151]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q51",
      "set_ref": "QA_ATOMIC_52",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 51,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Sequences",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "For any natural number $k$, let $a_{k}=3^{k}$. The smallest natural number $m$ for which $\\{(a_{1})^{1}\\times(a_{2})^{2}\\times...\\times(a_{20})^{20}\\}<\\{a_{21}\\times a_{22}\\times...\\times a_{20+m}\\},$ is",
      "options": [
        {
          "id": "A",
          "text": "$58$"
        },
        {
          "id": "B",
          "text": "$59$"
        },
        {
          "id": "C",
          "text": "$56$"
        },
        {
          "id": "D",
          "text": "$57$"
        }
      ],
      "solution_text": "Exponents of 3 form a sequence. LHS exponent is $\\sum k^2$. RHS exponent is arithmetic series sum. [cite_start]Set inequality and solve for min $m$[cite: 1155]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q52",
      "set_ref": "QA_ATOMIC_53",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 52,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Logarithms",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The number of distinct integers $n$ for which $\\log_{\\frac{1}{4}}(n^{2}-7n+11)>0$ is",
      "options": [
        {
          "id": "A",
          "text": "$2$"
        },
        {
          "id": "B",
          "text": "infinite"
        },
        {
          "id": "C",
          "text": "$1$"
        },
        {
          "id": "D",
          "text": "$0$"
        }
      ],
      "solution_text": "Inequality $\\log_{1/4}(A) > 0 \\implies 0 < A < 1$ (base < 1 reverses sign). [cite_start]Solve $0 < n^2-7n+11 < 1$ for integers $n$[cite: 1163]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q53",
      "set_ref": "QA_ATOMIC_54",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 53,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Inequalities",
      "difficulty": "medium",
      "correct_answer": "16",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The number of distinct pairs of integers $(x, y)$ satisfying the inequalities $x>y\\ge3$ and $x+y<14$ is",
      "solution_text": "[cite_start]Iterate through possible integer values of $y$ starting from 3 ($y=3, 4, 5...$) and find corresponding valid $x$ values ($y < x < 14-y$)[cite: 1171]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q54",
      "set_ref": "QA_ATOMIC_55",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 54,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Interest",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "At a certain simple rate of interest, a given sum amounts to Rs $13920$ in $3$ years, and to Rs $18960$ in $6$ years and $6$ months. If the same given sum had been invested for $2$ years at the same rate as before but with interest compounded every $6$ months, then the total interest earned, in rupees, would have been nearest to",
      "options": [
        {
          "id": "A",
          "text": "$3221$"
        },
        {
          "id": "B",
          "text": "$3180$"
        },
        {
          "id": "C",
          "text": "$3150$"
        },
        {
          "id": "D",
          "text": "$3096$"
        }
      ],
      "solution_text": "Find Principal $P$ and Rate $R$ from SI data (Difference in amount / difference in time = yearly interest). [cite_start]Then calculate CI for 2 years compounded semi-annually [cite: 1175-1176]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q55",
      "set_ref": "QA_ATOMIC_56",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 55,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Mixtures",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "A container holds $200$ litres of a solution of acid and water, having $30\\%$ acid by volume. Atul replaces $20\\%$ of this solution with water, then replaces $10\\%$ of the resulting solution with acid, and finally replaces $15\\%$ of the solution thus obtained, with water. The percentage of acid by volume in the final solution obtained after these three replacements, is nearest to",
      "options": [
        {
          "id": "A",
          "text": "$23$"
        },
        {
          "id": "B",
          "text": "$25$"
        },
        {
          "id": "C",
          "text": "$29$"
        },
        {
          "id": "D",
          "text": "$27$"
        }
      ],
      "solution_text": "Track the volume of acid remaining after each step. Step 1 (Water replace): Acid decreases. Step 2 (Acid replace): Acid increases. [cite_start]Step 3 (Water replace): Acid decreases [cite: 1184-1186]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q56",
      "set_ref": "QA_ATOMIC_57",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 56,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Word Problems",
      "difficulty": "medium",
      "correct_answer": "55",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "In a class, there were more than $10$ boys and a certain number of girls. After $40\\%$ of the girls and $60\\%$ of the boys left the class, the remaining number of girls was $8$ more than the remaining number of boys. Then, the minimum possible number of students initially in the class was",
      "solution_text": "Let $B, G$ be initial numbers. Remaining: $0.6G = 0.4B + 8$. Simplify equation ($3G = 2B + 40$). [cite_start]Find integer solutions for $B > 10$ that minimize $B+G$ [cite: 1194-1196]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q57",
      "set_ref": "QA_ATOMIC_58",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 57,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Permutations Combinations",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "A cafeteria offers $5$ types of sandwiches. Moreover, for each type of sandwich, a customer can choose one of $4$ breads and opt for either small or large sized sandwich. Optionally, the customer may also add up to $2$ out of $6$ available sauces. The number of different ways in which an order can be placed for a sandwich, is",
      "options": [
        {
          "id": "A",
          "text": "$880$"
        },
        {
          "id": "B",
          "text": "$840$"
        },
        {
          "id": "C",
          "text": "$800$"
        },
        {
          "id": "D",
          "text": "$600$"
        }
      ],
      "solution_text": "Main choices: $5 \\times 4 \\times 2 = 40$. Sauces: 0, 1, or 2 sauces from 6. Ways = $\\binom{6}{0} + \\binom{6}{1} + \\binom{6}{2}$. [cite_start]Total = Main $\\times$ Sauces [cite: 1200-1202]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q58",
      "set_ref": "QA_ATOMIC_59",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 58,
      "question_type": "MCQ",
      "taxonomy_type": "qa_number_theory",
      "topic": "Quant",
      "subtopic": "Progressions",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "In the set of consecutive odd numbers $\\{1,3,5,...,57\\}$, there is a number $k$ such that the sum of all the elements less than $k$ is equal to the sum of all the elements greater than $k$. Then, $k$ equals",
      "options": [
        {
          "id": "A",
          "text": "$41$"
        },
        {
          "id": "B",
          "text": "$39$"
        },
        {
          "id": "C",
          "text": "$43$"
        },
        {
          "id": "D",
          "text": "$37$"
        }
      ],
      "solution_text": "Series is arithmetic. Let $k$ be the $m$-th term. Sum of first $(m-1)$ terms equals sum of terms from $(m+1)$ to end. [cite_start]Solve for $k$ [cite: 1210-1211]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q59",
      "set_ref": "QA_ATOMIC_60",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 59,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Time and Work",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Arun, Varun and Tarun, if working alone, can complete a task in $24$, $21$, and $15$ days, respectively. They charge Rs $2160$, Rs $2400$, and Rs $2160$ per day, respectively, even if they are employed for a partial day. On any given day, any of the workers may or may not be employed to work. If the task needs to be completed in $10$ days or less, then the minimum possible amount, in rupees, required to be paid for the entire task is",
      "options": [
        {
          "id": "A",
          "text": "$38400$"
        },
        {
          "id": "B",
          "text": "$38880$"
        },
        {
          "id": "C",
          "text": "$34400$"
        },
        {
          "id": "D",
          "text": "$47040$"
        }
      ],
      "solution_text": "Calculate efficiency and cost per unit work for each. [cite_start]Optimize the mix of workers to finish $\\ge 1$ unit of work within 10 days at min cost [cite: 1219-1222]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q60",
      "set_ref": "QA_ATOMIC_61",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 60,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Interest",
      "difficulty": "medium",
      "correct_answer": "900",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Kamala divided her investment of Rs $100000$ between stocks, bonds, and gold. Her investment in bonds was $25\\%$ of her investment in gold. With annual returns of $10\\%$, $6\\%$, $8\\%$ on stocks, bonds, and gold, respectively, she gained a total amount of Rs $8200$ in one year. The amount, in rupees, that she gained from the bonds, was",
      "solution_text": "Let Gold $= G$, Bonds $= 0.25G$, Stocks $= 100000 - 1.25G$. Total return equation: $0.10(Stocks) + 0.06(Bonds) + 0.08(Gold) = 8200$. [cite_start]Solve for $G$ then Bond interest [cite: 1230-1232]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q61",
      "set_ref": "QA_ATOMIC_62",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 61,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Linear Equations",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If $a-6b+6c=4$ and $6a+3b-3c=50$ where $a, b$ and $c$ are real numbers, the value of $2a+3b-3c$ is",
      "options": [
        {
          "id": "A",
          "text": "$20$"
        },
        {
          "id": "B",
          "text": "$14$"
        },
        {
          "id": "C",
          "text": "$18$"
        },
        {
          "id": "D",
          "text": "$15$"
        }
      ],
      "solution_text": "Let $X = 3b-3c$. Rewrite equations: $a - 2X = 4$ and $6a + X = 50$. Solve system for $a$ and $X$. [cite_start]Evaluate $2a + X$[cite: 1237]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q62",
      "set_ref": "QA_ATOMIC_63",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 62,
      "question_type": "MCQ",
      "taxonomy_type": "qa_geometry",
      "topic": "Quant",
      "subtopic": "Coordinate Geometry",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The $(x, y)$ coordinates of vertices P, Q and R of a parallelogram PQRS are $(-3,-2)$, $(1, -5)$ and $(9, 1)$, respectively. If the diagonal SQ intersects the x-axis at $(a, 0)$, then the value of $a$ is",
      "options": [
        {
          "id": "A",
          "text": "$\\frac{27}{7}$"
        },
        {
          "id": "B",
          "text": "$\\frac{10}{3}$"
        },
        {
          "id": "C",
          "text": "$\\frac{13}{4}$"
        },
        {
          "id": "D",
          "text": "$\\frac{29}{9}$"
        }
      ],
      "solution_text": "Find vertex S using midpoint formula (midpoint of PR = midpoint of QS). Find equation of line SQ. [cite_start]Find x-intercept ($y=0$) [cite: 1245-1246]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q63",
      "set_ref": "QA_ATOMIC_64",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 63,
      "question_type": "MCQ",
      "taxonomy_type": "qa_geometry",
      "topic": "Quant",
      "subtopic": "Geometry",
      "difficulty": "hard",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "In a circle with center C and radius $6\\sqrt{2}$ cm, PQ and SR are two parallel chords separated by one of the diameters. If $\\angle PQC=45^{\\circ}$ and the ratio of the perpendicular distance of PQ and SR from C is $3: 2$, then the area, in sq. cm, of the quadrilateral PQRS is",
      "options": [
        {
          "id": "A",
          "text": "$4(3+\\sqrt{14})$"
        },
        {
          "id": "B",
          "text": "$4(3\\sqrt{2}+\\sqrt{7})$"
        },
        {
          "id": "C",
          "text": "$20(3+\\sqrt{14})$"
        },
        {
          "id": "D",
          "text": "$20(3\\sqrt{2}+\\sqrt{7})$"
        }
      ],
      "solution_text": "Use trigonometry to find chord lengths and perpendicular distances. [cite_start]Calculate area of trapezoid PQRS [cite: 1254-1255]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q64",
      "set_ref": "QA_ATOMIC_65",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 64,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Ratios",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The ratio of the number of students in the morning shift and afternoon shift of a school was $13: 9$. After $21$ students moved from the morning shift to the afternoon shift, this ratio became $19: 14$. Next, some new students joined the morning and afternoon shifts in the ratio $3: 8$ and then the ratio of the number of students in the morning shift and the afternoon shift became $5: 4$. The number of new students who joined is",
      "options": [
        {
          "id": "A",
          "text": "$110$"
        },
        {
          "id": "B",
          "text": "$88$"
        },
        {
          "id": "C",
          "text": "$121$"
        },
        {
          "id": "D",
          "text": "$99$"
        }
      ],
      "solution_text": "Use variables for initial students (13x, 9x). Apply transfer logic to find x. [cite_start]Then apply new joining ratio (3y, 8y) to find y and total new students (11y) [cite: 1263-1265]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q65",
      "set_ref": "QA_ATOMIC_66",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 65,
      "question_type": "TITA",
      "taxonomy_type": "qa_geometry",
      "topic": "Quant",
      "subtopic": "Geometry",
      "difficulty": "medium",
      "correct_answer": "60",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "If the length of a side of a rhombus is $36$ cm and the area of the rhombus is $396$ sq. cm, then the absolute value of the difference between the lengths, in cm, of the diagonals of the rhombus is",
      "solution_text": "Area $A = \\frac{1}{2} d_1 d_2 = 396$. Side $s = \\sqrt{(d_1/2)^2 + (d_2/2)^2} = 36$. [cite_start]Use identities to find $(d_1 - d_2)$[cite: 1274]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q66",
      "set_ref": "QA_ATOMIC_67",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 66,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Quadratic Equations",
      "difficulty": "medium",
      "correct_answer": "3",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The number of non-negative integer values of $k$ for which the quadratic equation $x^{2}-5x+k=0$ has only integer roots, is",
      "solution_text": "Discriminant $D = 25 - 4k$ must be a perfect square. [cite_start]Check non-negative integers $k$ satisfying this[cite: 1278]."
    },
    {
      "client_question_id": "cat-2025-slot-1_Q67",
      "set_ref": "QA_ATOMIC_68",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 67,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Profit and Loss",
      "difficulty": "medium",
      "correct_answer": "175",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "A shopkeeper offers a discount of $22\\%$ on the marked price of each chair, and gives $13$ chairs to a customer for the discounted price of $12$ chairs to earn a profit of $26\\%$ on the transaction. If the cost price of each chair is Rs $100$, then the marked price, in rupees, of each chair is",
      "solution_text": "Let MP be $M$. SP per chair (effectively) involves discount and free item logic. Total Revenue = $12 \\times 0.78M$. Total Cost = $13 \\times 100$. Profit = 26%. [cite_start]Equate and solve for $M$ [cite: 1282-1283]."
    }
  ]
}
````

## File: cat_2025_slot_1.md
````markdown
@P v=3.0 | key=cat-2025-slot-1 | title=CAT 2025 Slot 1 | slug=cat-2025-slot-1 | year=2025 | tq=68 | tm=204 | dur=120 | diff=hard | secs=VARC,DILR,QA | dm=3,1 | flags=is_free=false;published=false;allow_pause=true;attempt_limit=2 | desc=Official CAT 2025 Slot 1 Question Paper

@S VARC

@SET VARC_VA_1 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=va_odd_one | topic=Verbal Ability | sub=Para Jumbles (Odd One Out) | diff=medium | m=3,0 | ans=4
? Five jumbled sentences (labelled 1, 2, 3, 4, and 5), related to a topic, are given below. Four of them can be put together to form a coherent paragraph. Identify the odd sentence out and key in the number of that sentence as your answer.
1. Developments both technological and sociocultural have afforded us far greater freedom over death than we had in the past, and while we are still adapting ourselves to that freedom, we now appreciate the moral importance of this freedom.
2. But I believe that a type of freedom we can call freedom over death that is, a freedom in which we shape the timing and circumstances of how we die - should be central to this conversation.
3. Legalising assisted dying is but a further step in realising this freedom over death.
4. Many people endorse, through their opinions or their choices, our freedom over death, encompassing a right to medical assistance in hastening our deaths.
5. Freedom is a notoriously complex and contested philosophical notion, and I won't pretend to settle any of the big controversies it raises.
> The paragraph discusses "freedom over death" specifically in the context of assisted dying and shaping the timing of death (Sentences 1, 2, 3, 4). Sentence 5 discusses "freedom" as a general philosophical notion, which is too broad and disconnects from the specific argument about death and assisted dying.
@END_Q
@END_SET

@SET VARC_RC_1 | type=VARC | ctx=rc_passage | layout=text_only | title=Electronic Music
@CTX
Often the well intentioned music lover or the traditionally-minded professional composer asks two basic questions when faced with the electronic music phenomena: (1) is this type of artistic creation music at all? and, (2) given that the product is accepted as music of a new type or order, is not such music "inhuman"?... As Lejaren Hiller points out in his book Experimental Music (coauthor Leonard M. Isaacson), two questions which often arise when music is discussed are: (a) the substance of musical communication and its symbolic and semantic significance, if any, and (b) the particular processes, both mental and technical, which are involved in creating and responding to musical composition.

The ever-present popular concept of music as a direct, open, emotional expression and as a subjective form of communication from the composer, is, of course still that of the nineteenth century, when composers themselves spoke of music in those terms.... But since the third decade of our century many composers have preferred more objective definitions of music, epitomized in Stravinsky's description of it as "a form of speculation in terms of sound and time".

An acceptance of this more characteristic twentieth-century view of the art of musical composition will of course immediately bring the layman closer to an understanding of, and sympathetic response to, electronic music, even if the forms, sounds and approaches it uses will still be of a foreign nature to him. A communication problem however will still remain. The principal barrier that electronic music presents at large, in relation to the communication process, is that composers in this medium are employing a new language of forms where terms like 'densities', 'indefinite pitch relations', 'dynamic serialization', 'permutation', etc., are substitutes (or remote equivalents) for the traditional concepts of harmony, melody, rhythm, etc.... When the new structural procedures of electronic music are at last fully understood by the listener the barriers between him and the work he faces will be removed...

The medium of electronic music has of course tempted many kinds of composers to try their hand at it.... But the serious-minded composer approaches the world of electronic music with a more sophisticated and profound concept of creation. Although he knows that he can reproduce and employ melodic, rhythmic patterns and timbres of a traditional nature, he feels that it is in the exploration of sui generis languages and forms that the aesthetic magic of the new medium lies. And, conscientiously, he plunges into this search.
@END_CTX

@Q type=MCQ | tax=rc_structure | topic=Reading Comprehension | sub=Music | diff=medium | m=3,1 | ans=D
? The goal of the author over the course of this passage is to:
A. differentiate the modern composer from the nineteenth century composer
B. differentiate between electronic music and other forms of music.
C. defend the "serious-minded composer" from Lejaren Hill and Stravinsky.
D. defend electronic music from certain common charges.
> The author starts by listing charges against electronic music (is it music? is it inhuman?) and then addresses the definitions of music and the "communication problem" to bridge the gap for the listener, effectively defending the genre.

@Q type=MCQ | tax=rc_structure | topic=Reading Comprehension | sub=Music | diff=medium | m=3,1 | ans=A
? What relation does the "communication problem" mentioned in paragraph 2 have to the questions that the author recounts at the beginning of the passage?
A. Unfamiliar forms and terms might get in the way of our seeing electronic music as music, but this can be overcome.
B. Its unfamiliar "language of forms" and novel terms mean that we cannot see electronic music as music since it does not employ traditional musical concepts.
C. None; they are unrelated to one another and form parts of different discussions.
D. The communication problem is what allows us to see electronic music as music because music must be difficult to understand.
> The initial questions ask if it is music at all. The communication problem explains *why* it might not seem like music (unfamiliar language of forms) but argues that understanding these procedures removes the barrier.

@Q type=MCQ | tax=rc_inference | topic=Reading Comprehension | sub=Music | diff=medium | m=3,1 | ans=A
? The mention of Stravinsky's description of music in the first paragraph does all the following EXCEPT:
A. help us determine which sounds are musical and which are not.
B. respond to and expand upon earlier understandings of music.
C. complicate our notion of what is communicated through music.
D. allow us to classify electronic music as music.
> Stravinsky's definition ("speculation in terms of sound and time") is used to move away from 19th-century emotional definitions (B), allows for a broader view including electronic music (D), and shifts focus from subjective communication (C). It does not provide a rubric for determining which specific *sounds* are musical (A).

@Q type=MCQ | tax=rc_vocab | topic=Reading Comprehension | sub=Music | diff=medium | m=3,1 | ans=A
? From the context in which it is placed, the phrase "sui generis" in paragraph 3 suggests which one of the following?
A. Particular
B. Generic
C. Unaesthetic
D. Indescribable
> "Sui generis" means unique or of its own kind/particular to itself. The context contrasts reproducing traditional patterns with exploring languages unique to the new medium.
@END_Q
@END_SET

@SET VARC_VA_2 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=va_jumble | topic=Verbal Ability | sub=Para Jumbles | diff=medium | m=3,0 | ans=2143
? The four sentences (labelled 1, 2, 3, and 4) given below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer.
1. it can increase the effect of this function, by being linked closely with it;
2. It can in fact be integrated into any function (education, medical treatment, production, punishment);
3. it can establish a direct proportion between 'surplus power' and 'surplus production'.
4. it can constitute a mixed mechanism in which relations of power (and of knowledge) may be precisely adjusted, in the smallest detail, to the processes that are to be supervised;
[Context sentences provided in source for flow check, but strict sequencing relies on 1-4]:
(Source text indicates: "The panoptic mechanism is not simply... It's a case of 'it's easy once you've thought of it'..." followed by the sentences).
> 2 introduces the idea that "it" can be integrated into any function. 1 follows by saying it increases the effect of "this function" (linking back to 2). 4 expands on how it constitutes a mechanism within that function. 3 concludes with the result (surplus power/production).
@END_Q

@Q type=MCQ | tax=va_placement | topic=Verbal Ability | sub=Sentence Placement | diff=medium | m=3,1 | ans=A
? The given sentence is missing in the paragraph below. Decide where it best fits among the options 1, 2, 3, or 4 indicated in the paragraph.
Sentence: "Everything is old-world, traditional techniques from Mexico," Ava emphasizes.
Paragraph: The sisters embrace the ways their great-grandfather built and repaired instruments. (1) When crafting a Mexican guitarron used in mariachi music, they use tacote wood for the top of the instrument. Once the wood is cut, they carve the neck and heel from a single block using tools like hand saws, chisels and sandpaper rather than modern power tools and believe that this traditional method improves the tone of the instrument. (2) Their store has a three-year waitlist for instruments that take months to create. (3) The family's artisanship has attracted stars like Los Lobos, who own custom guitars made by all three generations of the Delgado family. (4) For the sisters, involvement in the family business started at an early age. They each built their first instruments at age 9.
A. Option 1
B. Option 4
C. Option 2
D. Option 3
> The sentence mentions "old-world, traditional techniques". The sentence following (1) describes these techniques in detail ("carve... hand saws... rather than modern power tools"). Thus, the sentence introduces the description that follows immediately at (1).

@Q type=MCQ | tax=va_placement | topic=Verbal Ability | sub=Sentence Placement | diff=medium | m=3,1 | ans=B
? The given sentence is missing in the paragraph below. Decide where it best fits among the options 1, 2, 3, or 4 indicated in the paragraph.
Sentence: Historically, silver has been, and still is, an important element in the business of 'show' visible in private houses, churches, government and diplomacy.
Paragraph: (1) Timothy Schroder put it succinctly in suggesting that electric light and eating in the kitchen eroded this need. As he explained to the author, 'Silver, when illuminated by flickering candlelight, comes alive and almost dances before the eyes, but when lit by electric light, it becomes flat and dead.' (2) Domestic and economic changes may have worked against the market, but the London silver trade remained buoyant, thanks to the competition of collectors seeking grand display silver at the top end, and the buyers of 'collectables', like spoons and wine labels and 'novelties', at the bottom. (3) Another factor that came into play was the systematic collection building of certain American museums over the period. Boston, Huntington Art Gallery and Williamsburg, among others, were largely supplied by London dealers. (4)
A. Option 4
B. Option 3
C. Option 1
D. Option 2
> Option 3 is the correct answer (Key: B). The sentence introduces the historical importance of silver in "show". The paragraph following (1) discusses the decline of this need (electric light). The sentence actually seems to fit best as an intro, but given the options, placing it at (3) doesn't seem right contextually compared to the start. *Correction*: Let's re-read carefully. The sentence is about silver being an element of 'show'. (1) discusses the erosion of "this need" (implying the need for show/silver was mentioned prior). However, if we look at Option 3 (Source: B), the sentence might be unrelated to the museum factor. Let's look at the Official Answer provided in source. Source says `Correct Answer: B` which corresponds to `Option 3`.
@END_Q
@END_SET

@SET VARC_RC_2 | type=VARC | ctx=rc_passage | layout=text_only | title=Complex Systems and Tail Events
@CTX
Understanding the key properties of complex systems can help us clarify and deal with many new and existing global challenges, from pandemics to poverty... A recent study in Nature Physics found transitions to orderly states such as schooling in fish (all fish swimming in the same direction), can be caused, paradoxically, by randomness, or 'noise' feeding back on itself. That is, a misalignment among the fish causes further misalignment, eventually inducing a transition to schooling. Most of us wouldn't guess that noise can produce predictable behaviour.

The result invites us to consider how technology such as contact-tracing apps, although informing us locally, might negatively impact our collective movement. If each of us changes our behaviour to avoid the infected, we might generate a collective pattern we had aimed to avoid: higher levels of interaction between the infected and susceptible, or high levels of interaction among the asymptomatic.

Complex systems also suffer from a special vulnerability to events that don't follow a normal distribution or 'bell curve'. When events are distributed normally, most outcomes are familiar and don't seem particularly striking. Height is a good example: it's pretty unusual for a man to be over 7 feet tall; most adults are between 5 and 6 feet, and there is no known person over 9 feet tall. But in collective settings where contagion shapes behaviour - a run on the banks, a scramble to buy toilet paper - the probability distributions for possible events are often heavy-tailed. There is a much higher probability of extreme events, such as a stock market crash or a massive surge in infections. These events are still unlikely, but they occur more frequently and are larger than would be expected under normal distributions.

What's more, once a rare but hugely significant 'tail' event takes place, this raises the probability of further tail events. We might call them second-order tail events; they include stock market gyrations after a big fall and earthquake aftershocks. The initial probability of second-order tail events is so tiny it's almost impossible to calculate - but once a first-order tail event occurs, the rules change, and the probability of a second-order tail event increases. The dynamics of tail events are complicated by the fact that they result from cascades of other unlikely events.

When COVID-19 first struck, the stock market suffered stunning losses followed by an equally stunning recovery. Some of these dynamics are potentially attributable to former sports bettors, with no sports to bet on, entering the market as speculators rather than investors. The arrival of these new players might have increased inefficiencies and allowed savvy long-term investors to gain an edge over bettors with different goals. One reason a first-order tail event can induce further tail events is that it changes the perceived costs of our actions and changes the rules that we play by. This game-change is an example of another key complex systems concept: nonstationarity. A second, canonical example of nonstationarity is adaptation, as illustrated by the arms race involved in the coevolution of hosts and parasites [in which] each has to 'run' faster, just to keep up with the novel solutions the other one presents as they battle it out in evolutionary time.
@END_CTX

@Q type=MCQ | tax=rc_inference | topic=Reading Comprehension | sub=Sociology/Economics | diff=medium | m=3,1 | ans=D
? All of the following inferences are supported by the passage EXCEPT that:
A. examples like runs on banks and toilet paper scrambles illustrate how contagion can amplify local choices into system-wide cascades that surprise participants and lead to patterns they did not intend to create.
B. learning can change the rules that actors face. So, a rare shock can alter payoffs and raise the odds of subsequent large disturbances within the same system, which supports the idea of second-order tail events.
C. heavy-tailed events make extreme outcomes more frequent and larger than bell curve expectations. This complicates forecasting and risk management in collective settings shaped by contagion and copying behaviour.
D. the text attributes the COVID-19 pandemic rebound in financial markets solely to displaced sports bettors and treats their entry as the overriding cause of the rapid recovery across assets and time horizons.
> The text states "Some of these dynamics are potentially attributable to former sports bettors..." (probability/partial attribution), whereas Option D claims it attributes the rebound *solely* to them and treats it as the *overriding* cause. This is too strong and not supported.

@Q type=MCQ | tax=rc_summary | topic=Reading Comprehension | sub=Sociology/Economics | diff=medium | m=3,1 | ans=B
? Which one of the options below best summarises the passage?
A. The passage explains how social outcomes generally follow normal distributions. So, extreme events are negligible, and policy should stabilise averages rather than learn from large shocks in fast-changing collective settings.
B. The passage explains how noise can create order, then shows why complex systems with contagion are vulnerable to heavy-tailed cascades. It also explains why early shocks change rules through nonstationarity with a market illustration during the COVID-19 disruption.
C. The passage explains how speculative entrants always produce inefficiency after health shocks. Therefore, long-term investors invariably profit when new participants push prices away from fundamentals under pandemic conditions and comparable crises.
D. The passage explains how nonstationarity works in evolutionary biology and rejects applications in markets or public health because adaptation is exclusive to parasite-host systems and cannot arise in technology-mediated social dynamics.
> Option B captures the key points: noise creating order (fish/apps), vulnerability to heavy-tailed events (contagion), and nonstationarity (rules changing after shocks, COVID/market example).

@Q type=MCQ | tax=rc_strengthen | topic=Reading Comprehension | sub=Sociology/Economics | diff=medium | m=3,1 | ans=C
? Which one of the following observations would most strengthen the passage's claim that a first-order tail event raises the probability of further tail events in complex systems?
A. In epidemic networks, initial super-spreading episodes are isolated spikes after which outbreak sizes match the baseline distribution from independent contact models across comparable cities with no rise in the frequency or size of later extreme clusters.
B. River discharge records show water levels fit a normal distribution with thin tails that match laboratory data, regardless of storms or floods.
C. After a major equity crash, researchers find dense clusters of large daily moves for several weeks, with extreme days occurring far more often than in normal circumstances for assets with customarily low volatility profiles.
D. Following large earthquakes, regional seismic activity returns to baseline within hours with no aftershock sequence once data are adjusted for reporting effects, which suggests independence across events rather than any elevation in subsequent tail probabilities.
> The claim is that a first tail event *increases* the probability of subsequent ones (clustering). Option C explicitly describes this: after a crash (first event), extreme days occur "far more often" (increased probability of second-order events).

@Q type=MCQ | tax=rc_assumption | topic=Reading Comprehension | sub=Sociology/Economics | diff=medium | m=3,1 | ans=B
? The passage suggests that contact tracing apps could inadvertently raise risky interactions by altering local behaviour. Which one of the assumptions below is most necessary for that suggestion to hold?
A. Most users uninstall apps within a week, which leaves only highly exposed individuals participating. This neutralises any systematic bias in routing decisions and prevents any predictable change in aggregate contact patterns.
B. Individuals base movement choices partly on observed infections and on the behaviour of others. So, local responses interact, which turns many small adjustments into large scale patterns that can frustrate the intended aim of risk reduction.
C. App alerts always include precise location to within one metre and deliver real time updates for all users, which ensures that the data feed is perfectly accurate regardless of privacy settings, power limits, or network conditions.
D. Urban networks have uniform traffic conditions at all hours, which allows perfectly predictable routing independent of personal choices, social signals, or crowd reactions and, therefore, makes interdependence negligible in city movement decisions.
> For local changes to generate a collective pattern (as argued in the passage), individuals must be reacting to the information (observed infections/others' behavior) and these reactions must interact to form the new pattern. Option B articulates this mechanism.
@END_Q
@END_SET

@SET VARC_VA_3 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=va_jumble | topic=Verbal Ability | sub=Para Jumbles | diff=medium | m=3,0 | ans=3421
? The four sentences (labelled 1, 2, 3, and 4) given below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer.
1. But man, woman or otherwise, there is no denying that the quality of our life and character will be significantly shaped by the way we handle our anger.
2. Once the taboos have been broken, women usually experience letting their fists fly as intensely liberating.
3. Though this might seem a stereotype, women-unlike men, who are frequently applauded for unbridled aggression are often socialized to keep a lid on their ire.
4. Many of them are so at odds with their aggressive feelings that, as a coach, I often have to stop them from pulling their punches and encourage them to extend their arms so their blows might actually reach their fleshy target.
> 3 introduces the topic (women socialized to hide anger vs men). 4 elaborates on the consequence (pulling punches). 2 describes the result of overcoming this (liberating). 1 concludes with a general statement about handling anger.
@END_Q

@Q type=MCQ | tax=va_summary | topic=Verbal Ability | sub=Paragraph Summary | diff=medium | m=3,1 | ans=C
? The passage given below is followed by four summaries. Choose the option that best captures the essence of the passage.
Zombie cells may contribute to age-related chronic inflammation: this finding could help scientists understand more about the aging process and why the immune system becomes less effective as we get older. Zombie or "senescent" cells are damaged cells that can no longer divide and grow like normal cells. Scientists think that these cells can contribute to chronic health problems when they accumulate in the body. In younger people, the immune system is more effective at clearing senescent cells from the body through a process called apoptosis, but as we age, this process becomes less efficient. As a result, there is an accumulation of senescent cells in different organs in the body, either through increased production or reduced clearance by the immune system. The zombie cells continue to use energy though they do not divide, and often secrete chemicals that cause inflammation, which if persistent for longer periods of time can damage healthy cells leading to chronic diseases.
A. Senescent "zombie" cells are inactive or malfunctioning cells that can be found throughout the body.
B. A younger person's immune system is healthy and is able to clear the damaged cells, but as people age, the zombie cells resist apoptosis, and start accumulating in the body.
C. Aging leads to less effective apoptosis, and therefore zombie cells start to accumulate in the body, causing inflammation, which accelerates aging and leads to chronic diseases.
D. Dead cells accelerate chronic inflammation weakening the immune system and lead to aging.
> Option C covers the causal chain: Aging -> less effective apoptosis -> accumulation of zombie cells -> inflammation -> chronic disease/aging.
@END_Q
@END_SET

@SET VARC_RC_3 | type=VARC | ctx=rc_passage | layout=text_only | title=Criminal Responsibility and Mental Science
@CTX
How can we know what someone else is thinking or feeling, let alone prove it in court? In his 1863 book, A General View of the Criminal Law of England, James Fitzjames Stephen, among the most celebrated legal thinkers of his generation, was of the opinion that the assessment of a person's mental state was an inference made with "little consciousness." In a criminal case, jurors, doctors, and lawyers could watch defendants-scrutinizing clothing, mannerisms, tone of voice-but the best they could hope for were clues. Rounding these clues up to a judgment about a defendant's guilt, or a defendant's life, was an act of empathy and imagination.... The closer the resemblance between defendants and their judges, the easier it was to overlook the gap that inference filled. Conversely, when a defendant struck officials as unlike themselves, whether by dint of disease, gender, confession, or race, the precariousness of judgments about mental state was exposed.

In the nineteenth century, physicians who specialized in the study of madness and the care of the insane held themselves out as experts in the new field of mental science. Often called alienists or mad doctors, they were the predecessors of modern psychiatrists, neurologists, and psychologists. The opinions of family and neighbors had once been sufficient to sift the sane from the insane, but a growing belief that insanity was a subtle condition that required expert, medical diagnosis pushed physicians into the witness box.... Lawyers for both prosecution and defense began to recruit alienists to assess defendants' sanity and to testify to it in court.

Irresponsibility and insanity were not identical, however. Criminal responsibility was a legal concept and not, fundamentally, a medical one. Stephen explained: "The question 'What are the mental elements of responsibility?' is, and must be, a legal question. It cannot be anything else, for the meaning of responsibility is liability to punishment." ... Nonetheless, medical and legal accounts of what it meant to be mentally sound became entangled and mutually referential throughout the nineteenth century. Lawyers relied on medical knowledge to inform their opinions and arguments about the sanity of their clients. Doctors commented on the legal responsibility of their patients. Ultimately, the fields of criminal law and mental science were both invested in constructing an image of the broken and damaged psyche that could be contrasted with the whole and healthy one. This shared interest, and the shared space of the criminal courtroom, made it nearly impossible to consider responsibility without medicine, or insanity without law.

Physicians and lawyers shared more than just concern for the mind. Class, race, and gender bound these middle-class, white, professional men together, as did family ties, patriotism, Protestantism, business ventures, the alumni networks of elite schools and universities, and structures of political patronage. But for all their affinities, men of medicine and law were divided by contests over the borders of criminal responsibility, as much within each profession as between them. Alienists steadily pushed the boundaries of their field, developing increasingly complex and capacious definitions of insanity. Eccentricity and aggression came to be classified as symptoms of mental disease, at least by some.
@END_CTX

@Q type=MCQ | tax=rc_detail | topic=Reading Comprehension | sub=History/Law | diff=medium | m=3,1 | ans=A
? The last paragraph of the passage refers to "middle-class, white, professional men". Which one of the following qualities best describes the connection among them?
A. The borders of criminal responsibility.
B. The opinions of family and neighbours.
C. Eccentricity and aggression.
D. Empathy and imagination.
> The paragraph states they were bound by class, race, gender, etc., BUT "divided by contests over the borders of criminal responsibility". The question asks what describes the *connection*? Actually, looking at the options, A, B, C, D are phrases from the text. The question asks for the connection. The text says "Class, race, and gender bound these... men together". However, the options don't list those. Let's re-read carefully. The men were *divided* by "contests over the borders of criminal responsibility". This seems to be the point of *tension* or the defining professional struggle connecting their interaction in the courtroom. Wait, looking at the official answer A ("The borders of criminal responsibility"), it seems the question implies what issue connected/involved them professionally, even if it was a contest. Or perhaps it implies they were connected by the *debate* over it.

@Q type=MCQ | tax=rc_factual | topic=Reading Comprehension | sub=History/Law | diff=easy | m=3,1 | ans=B
? According to the passage, who or what was an "alienist"?
A. Professionals who pushed the boundaries of their fields till they became unrecognisable in the nineteenth century.
B. Physicians who specialised in the study of madness and the care of the insane in the nineteenth century.
C. Physicians and lawyers who were responsible for the condition of immigrants or 'aliens' in the nineteenth century.
D. Physicians and lawyers who were responsible for examining accounts of extraterrestrials or 'aliens' in the nineteenth century.
> Direct quote: "physicians who specialized in the study of madness and the care of the insane... Often called alienists".

@Q type=MCQ | tax=rc_inference | topic=Reading Comprehension | sub=History/Law | diff=medium | m=3,1 | ans=D
? Study the following sets of concepts and identify the set that is conceptually closest to the concerns and arguments of the passage.
A. Empathy, Prosecution, Knowledge, Business.
B. Judgement, Belief, Accounts, Patronage.
C. Assessment, Empathy, Prosecution, Patriotism.
D. Judgement, Insanity, Punishment, Responsibility.
> The passage discusses the judgment of mental states, the definition of insanity vs legal responsibility, and liability to punishment. Set D covers the core legal/medical intersection discussed.

@Q type=MCQ | tax=rc_vocab | topic=Reading Comprehension | sub=History/Law | diff=medium | m=3,1 | ans=A
? "Conversely, when a defendant struck officials as unlike themselves, whether by dint of disease, gender, confession, or race, the precariousness of judgments about mental state was exposed." Which one of the following best describes the use of the word "confession" in this sentence?
A. Referring to the practice of 'confession' in some faiths, here it is a metaphor for the religion of the defendant.
B. Referring to the gender, race or disease claimed as a defence by the defendant, here it is a synonym for 'professing' a gender, race, or disease.
C. Referring to the defendant's confession of his or her crime as false, because 'didn't' is an archaic form of 'didn't' or 'did not'.
D. The defendants struck out at the officials and then confessed to the act.
> The list "disease, gender, confession, or race" refers to attributes that make the defendant "unlike" the officials (who are Protestant, white, men). "Confession" here likely refers to religious confession (Catholicism etc.), serving as a marker for religion/faith, contrasting with the "Protestantism" of the officials mentioned later.
@END_Q
@END_SET

@SET VARC_VA_4 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=va_odd_one | topic=Verbal Ability | sub=Para Jumbles (Odd One Out) | diff=medium | m=3,0 | ans=1
? Five jumbled sentences (labelled 1, 2, 3, 4, and 5), related to a topic, are given below. Four of them can be put together to form a coherent paragraph. Identify the odd sentence out and key in the number of that sentence as your answer.
1. The Bayeux tapestry was, therefore, an obvious way to tell people about the downfall of the English and the rise of the Normans.
2. So if we take expert in Anglo-Saxon culture Gale Owen-Crocker's idea that the tapestry was originally hung in a square with certain scenes facing each other, people would have stood in the centre.
3. Art historian Linda Neagley has argued that pre-Renaissance people interacted with art visually, kinaesthetically (sensory perception through bodily movement) and physically.
4. That would make it an 11th-century immersive space with scenes corresponding and echoing each other, drawing the viewer's attention, playing on their senses and understanding of the story they thought they knew.
5. The Bayeux tapestry would have been hung at eye level to enable this.
> Sentences 3, 2, 4, 5 connect logically: 3 introduces how people interacted with art (visually/physically). 2 applies this to the Bayeux tapestry (hung in a square, people in center). 4 explains the effect (immersive space). 5 adds the detail about hanging at eye level to enable this interaction. Sentence 1 discusses the *content/purpose* (propaganda about Normans), which is distinct from the *physical experience/installation* theme of the other four.
@END_Q
@END_SET

@SET VARC_RC_4 | type=VARC | ctx=rc_passage | layout=text_only | title=Income Inequality and Economic Growth
@CTX
Studies showing that income inequality plays a positive role in economic growth are largely based on three arguments. The first argument focuses on investment indivisibilities wherein large sunk costs are required when implementing new fundamental innovations. Without stock markets and financial institutions to mobilize large sums of money, a high concentration of wealth is needed for individuals to undertake new industrial activities accompanied by high sunk costs... [One study] shows the relation between economic growth and income inequality for 45 countries during 1966-1995. [It was found that the increase in income inequality has a significant positive relationship with economic growth in the short and medium term. Using system GMM, [another study estimated] the relation between income inequality and economic growth for 106 countries during 1965-2005 period. The results show that income inequality has a positive impact on economic growth in the short run, but the two are negatively correlated in the long run.

The second argument is related to moral hazard and incentives... Because economic performance is determined by the unobservable level of effort that agents make, paying compensations without taking into account the economic performance achieved by individual agents will fail to elicit optimum effort from the agents. Thus, certain income inequalities contribute to growth by enhancing worker motivation. and by giving motivation to innovators and entrepreneurs... Finally, [another study] point[s] out that the concentration of wealth or stock ownership in relation to corporate governance contributes to growth. If stock ownership is distributed and owned by a large number of shareholders, it is not easy to make quick decisions due to the conflicting interests among shareholders, and this may also cause a free-rider problem in terms of monitoring and supervising managers and workers.

Various studies have examined the relationships between income inequality and economic growth, and most of these assert that a negative correlation exists between the two. Analyzing 159 countries for 1980-2012, they conclude that there exists a negative relation between income inequality and economic growth; when the income share of the richest 20% of population increases by 1%, the GDP decreases by 0.08%, whereas when the income share of the poorest 20% of population increases by 1%, the GDP increases by 0.38%. Some studies find that inequality has a negative impact on growth due to poor human capital accumulation and low fertility rates... while [others] point out that inequality creates political instability, resulting in lower investment.... [Some economists] argue that widening income inequality has a negative impact on economic growth because it negatively affects social consensus or social capital formation.

One important research topic is the correlation between democratization and income redistribution. [Some scholars] explain that social pressure for income redistribution rises as income inequality increases in a democratic society. In other words, when democratization extends suffrage to a wider class of people, the increased political power of low- and middle-income voters results in broader support for income redistribution and social welfare expansion. However... if the rich have more political influence than the poor, the democratic system actually worsens income inequality rather than improving it.
@END_CTX

@Q type=MCQ | tax=rc_summary | topic=Reading Comprehension | sub=Economics | diff=medium | m=3,1 | ans=D
? Which one of the options below best summarises the passage?
A. The passage claims that evaluating the effect of income inequality on economic growth without considering both short- and long-term consequences is misguided
B. The passage confines its discussion to financing gaps and corporate control while undercutting cross country evidence and overlooking the significance of concerns regarding human capital accumulation, fertility rates, and income redistribution under democratisation.
C. The passage argues that income inequality accelerates economic growth while also emphasising the significance of concerns regarding human capital accumulation, fertility rates, and political instability.
D. The passage outlines investment, incentive, and governance channels through which income inequality may support economic growth and reports short-term gains while noting longterm drawbacks
> Option D covers the first half (investment, incentive, governance channels for positive growth) and the second half (short-term gains vs long-term negative correlations/drawbacks found in other studies).

@Q type=MCQ | tax=rc_vocab | topic=Reading Comprehension | sub=Economics | diff=medium | m=3,1 | ans=A
? The passage refers to "democratization". Choose the one option below that comes closest to the opposite of this process.
A. After the emergency decree, the regime shifted toward authoritarianism as suffrage narrowed and opposition parties were deregistered.
B. Corporate donations were capped and parties received public funding which was portrayed as establishing an oligarchy.
C. Municipalities adopted participatory budgeting and recall elections which a press release called totalitarianism.
D. The coalition imposed term limits and strengthened judicial review in order to further entrench autocratic rule.
> Democratization involves extending suffrage and political power to a wider class. Option A describes the opposite: narrowing suffrage and deregistering parties (authoritarianism).

@Q type=MCQ | tax=rc_structure | topic=Reading Comprehension | sub=Economics | diff=medium | m=3,1 | ans=C
? The primary function of the three-part case for a positive income inequality-economic growth link in the first half of the passage is to show that:
A. inequality boosts growth in every period and type of economy, regardless of finance or governance conditions.
B. mature stock markets make wealth concentration unnecessary, yet they might still be harmful to investment.
C. inequality can aid short-term growth in settings with high sunk costs, incentive alignment, and concentrated ownership.
D. dispersed ownership speeds corporate decision-making and removes free rider problems.
> The arguments focus on specific conditions: high sunk costs (investment indivisibilities), incentive alignment (moral hazard), and corporate governance (concentrated ownership). The studies cited mentioned positive impact in the "short run". Option C captures these specific conditions and the temporal aspect.

@Q type=MCQ | tax=rc_inference | topic=Reading Comprehension | sub=Economics | diff=medium | m=3,1 | ans=A
? According to the incentive or moral hazard argument, which one of the designs below is most consistent with the claim that some inequality can raise growth?
A. Pay rewards on verifiable performance for highly productive workers.
B. Rents protected by market power that enlarge top incomes without linking pay to results.
C. Wages are determined by tenure rather than output to ensure equity.
D. A regime that concentrates stock ownership in relation to corporate governance.
> The text says: "paying compensations without taking into account the economic performance... will fail to elicit optimum effort... income inequalities contribute to growth by enhancing worker motivation." Option A (rewards on performance) aligns with this logic.
@END_Q
@END_SET

@SET VARC_VA_5 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=va_summary | topic=Verbal Ability | sub=Paragraph Summary | diff=medium | m=3,1 | ans=A
? The passage given below is followed by four summaries. Choose the option that best captures the essence of the passage.
In the dynamic realm of creativity, artists often find themselves at the crossroads between drawing inspiration from diverse cultures and inadvertently crossing into the territory of cultural appropriation. Inspiration is the lifeblood of creativity, driving artists to create works that resonate across borders. The globalized nature of the modern world invites artists to draw from a vast array of cultural influences. When approached respectfully, inspiration becomes a bridge, fostering understanding and appreciation of cultural diversity. However, the line between inspiration and cultural appropriation can be thin and easily blurred. Cultural appropriation occurs when elements from a particular culture are borrowed without proper understanding, respect, or acknowledgement. This leads to the commodification of sacred symbols, the reinforcement of stereotypes, and the erasure of the cultural context from which these elements originated. It's essential to recognize that the impact of cultural appropriation extends beyond the realm of artistic expression, influencing societal perceptions and perpetuating power imbalances.
A. Artists in a globalised world must navigate between drawing inspiration from diverse cultures respectfully and cultural appropriation that involves borrowing without proper acknowledgement which has broader societal impacts including perpetuating power imbalances.
B. In today's world of creativity, artists have to decide between respectfully acknowledging works that are inspired by diverse cultures and appropriating elements without respect for their contexts.
C. In a globalised world, artists must draw from diverse cultural influences to create works that appeal to all, and this results in instances of both inspiration and cultural appropriation.
D. Artists must navigate the thin line between inspiration and cultural appropriation, where respectful inspiration fosters cultural understanding whereas appropriation involves borrowing without acknowledgement leading to commodification and reinforcement of stereotypes.
> Option A captures the balance (inspiration vs appropriation), the definition of appropriation (borrowing without acknowledgment), and the critical consequence (societal impacts/power imbalances), which is the concluding point of the passage. Option D is close but misses the "power imbalances" aspect mentioned in the final sentence.
@END_Q
@END_SET

@END_S



@S DILR

@SET DILR_SET_1 | type=DILR | ctx=dilr_set | layout=split_view | title=Round Table Seating
@CTX
A round table has seven chairs around it. The chairs are numbered 1 through 7 in a clockwise direction. Four friends, Aslam, Bashir, Chhavi, and Davies, sit on four of the chairs. In the starting position, Aslam and Chhavi are sitting next to each other, while for Bashir as well as Davies, there are empty chairs on either side of the chairs that are sitting on. The friends take turns moving either clockwise or counterclockwise from their chair. The friend who has to move in a turn occupies the first empty chair in whichever direction (s) he chooses to move.

Aslam moves first (Turn 1), followed by Bashir, Chhavi, and Davies (Turns 2, 3, and 4, respectively). Then Aslam moves again followed by Bashir, and Chhavi (Turns 5, 6, and 7, respectively).

The following information is known:
1. The four friends occupy adjacent chairs only at the end of Turn 2 and Turn 6.
2. Davies occupies Chair 2 after Turn 1 and Chair 4 after Turn 5, and Chhavi occupies Chair 7 after Turn 2.
@END_CTX

@Q type=TITA | tax=lr_arrangement | topic=Logical Reasoning | sub=Seating Arrangement | diff=hard | m=3,0 | ans=4
? What is the number of the chair initially occupied by Bashir?
> [cite_start]Based on the movement rules and the constraint that Bashir has empty chairs on both sides initially, tracing the moves backward from the known positions (Davies at 2 after Turn 1, etc.) reveals Bashir started at Chair 4[cite: 978].

@Q type=MCQ | tax=lr_arrangement | topic=Logical Reasoning | sub=Seating Arrangement | diff=hard | m=3,1 | ans=D
? Who sits on the chair numbered 4 at the end of Turn 3?
A. Bashir
B. Chhavi
C. Davies
D. No one
> [cite_start]Tracing the movements to Turn 3, Chair 4 is unoccupied[cite: 980].

@Q type=MCQ | tax=lr_arrangement | topic=Logical Reasoning | sub=Seating Arrangement | diff=hard | m=3,1 | ans=A
? Which of the chairs are occupied at the end of Turn 6?
A. Chairs numbered 4, 5, 6, and 7
B. Chairs numbered 1, 2, 3, and 4
C. Chairs numbered 2, 3, 4, and 5
D. Chairs numbered 1, 2, 6, and 7
> At the end of Turn 6, the friends occupy a contiguous block of chairs (rule 1). [cite_start]The positions correspond to 4, 5, 6, and 7[cite: 987].

@Q type=MCQ | tax=lr_arrangement | topic=Logical Reasoning | sub=Seating Arrangement | diff=hard | m=3,1 | ans=B
? Which of the following BEST describes the friends sitting on chairs adjacent to the one occupied by Bashir at the end of Turn 7?
A. Chhavi only
B. Davies only
C. Chhavi and Davies
D. Aslam and Chhavi
> [cite_start]After the final moves, only Davies is adjacent to Bashir[cite: 992].
@END_SET

@SET DILR_SET_2 | type=DILR | ctx=dilr_set | layout=split_view | title=InnovateX Ratings
@CTX
At InnovateX, six employees, Asha, Bunty, Chintu, Dolly, Eklavya, and Falguni, were split into two groups of three each: Elite led by Manager Kuku, and Novice led by Manager Lalu. At the end of each quarter, Kuku and Lalu handed out ratings to all members in their respective groups. In each group, each employee received a distinct integer rating from 1 to 3. The score for an employee at the end of a quarter is defined as their cumulative rating from the beginning of the year.

At the end of each quarter the employee in Novice with the highest score was promoted to Elite, and the employee in Elite with the minimum score was demoted to Novice. If there was a tie in scores, the employee with a higher rating in the latest quarter was ranked higher.

Asha, Bunty, and Chintu were in Elite at the beginning of Quarter 1. All of them were in Novice at the beginning of Quarter 4. Dolly and Falguni were the only employees who got the same rating across all the quarters.

The following is known about ratings given by Lalu:
1. Bunty received a rating of 1 in Quarter 2.
2. Asha and Dolly received ratings of 1 and 2, respectively, in Quarter 3.
@END_CTX

@Q type=TITA | tax=lr_ranking | topic=Logical Reasoning | sub=Ranking | diff=medium | m=3,0 | ans=4
? What was Eklavya's score at the end of Quarter 2?
> [cite_start]Calculating the cumulative scores based on promotions/demotions and known ratings yields 4[cite: 1010].

@Q type=TITA | tax=lr_ranking | topic=Logical Reasoning | sub=Ranking | diff=medium | m=3,0 | ans=0
? How many employees changed groups more than once up to the beginning of Quarter 4?
> [cite_start]Tracking the movements shows that no employee moved back and forth more than once[cite: 1012].

@Q type=TITA | tax=lr_ranking | topic=Logical Reasoning | sub=Ranking | diff=medium | m=3,0 | ans=5
? What was Bunty's score at the end of Quarter 3?
> [cite_start]Bunty's cumulative score sums to 5[cite: 1014].

@Q type=TITA | tax=lr_ranking | topic=Logical Reasoning | sub=Ranking | diff=medium | m=3,0 | ans=4
? For how many employees can the scores at the end of Quarter 3 be determined with certainty?
> [cite_start]The scores can be uniquely determined for 4 employees[cite: 1016].

@Q type=MCQ | tax=lr_ranking | topic=Logical Reasoning | sub=Ranking | diff=medium | m=3,1 | ans=D
? Which of the following statements is/are NECESSARILY true?
I. Asha received a rating of 2 in Quarter 1.
II. Asha received a rating of 1 in Quarter 2.
A. Neither I nor II
B. Both I and II
C. Only I
D. Only II
> [cite_start]Only statement II is necessarily true[cite: 1024].
@END_SET

@SET DILR_SET_3 | type=DILR | ctx=dilr_set | layout=split_view | title=Import Tariffs
@CTX
Five countries engage in trade with each other. Each country levies import tariffs on the other countries. The import tariff levied by Country X on Country Y is calculated by multiplying the corresponding tariff percentage with the total imports of Country X from Country Y.

The radar chart (not shown) depicts different import tariff percentages charged by each of the five countries on the others. For example, US (the blue line in the chart) charges 20%, 40%, 30%, and 30% import tariff percentages on imports from France, India, Japan, and UK, respectively. The bar chart (not shown) depicts the import tariffs levied by each county on other countries. For example, US charged import tariff of 3 billion USD on UK.

Assume that imports from one country to another equals the exports from the latter to the former. The trade surplus of Country X with Country Y is defined as: Exports from Country X to Country Y - Imports to Country X from Country Y.
@END_CTX

@Q type=MCQ | tax=di_calculation | topic=Data Interpretation | sub=Charts | diff=medium | m=3,1 | ans=C
? How much is Japan's export to India worth?
A. 8.5 Billion USD
B. 16.0 Billion USD
C. 7.0 Billion USD
D. 1.75 Billion USD
> [cite_start]Calculated from the tariff percentage and total tariff value provided in the charts[cite: 1042].

@Q type=MCQ | tax=di_calculation | topic=Data Interpretation | sub=Charts | diff=medium | m=3,1 | ans=B
? Which among the following is the highest?
A. Exports by Japan to UK
B. Imports by US from France
C. Exports by France to Japan
D. Imports by France from India
> [cite_start]Comparing the calculated trade values shows Imports by US from France is the highest[cite: 1048].

@Q type=MCQ | tax=di_calculation | topic=Data Interpretation | sub=Charts | diff=medium | m=3,1 | ans=B
? What is the trade surplus/trade deficit of India with UK?
A. Surplus of 15.0 Billion USD
B. Deficit of 15.0 Billion USD
C. Surplus of 10.0 Billion USD
D. Deficit of 10.0 Billion USD
> [cite_start]India has a deficit of 15.0 Billion USD with the UK[cite: 1054].
@END_SET

@SET DILR_SET_4 | type=DILR | ctx=dilr_set | layout=split_view | title=Train Booking
@CTX
A train travels from Station A to Station E, passing through stations B, C, and D, in that order. The train has a seating capacity of 200. A ticket may be booked from any station to any other station ahead on the route. A ticket reserves one seat on every intermediate segment. The occupancy factor for a segment is the total number of seats reserved in the segment as a percentage of the seating capacity.

Information:
1. Segment C - D had an occupancy factor of 95%. Only segment B - C had a higher occupancy factor.
2. Exactly 40 tickets were booked from B to C and 30 tickets were booked from B to E.
3. Among the seats reserved on segment D - E, exactly four-sevenths were from stations before C.
4. The number of tickets booked from A to C was equal to that booked from A to E, and it was higher than that from B to E.
5. No tickets were booked from A to B, from B to D and from D to E.
6. The number of tickets booked for any segment was a multiple of 10.
@END_CTX

@Q type=MCQ | tax=di_reasoning | topic=Data Interpretation | sub=Logical Reasoning | diff=hard | m=3,1 | ans=B
? What was the occupancy factor for segment D - E?
A. 35%
B. 70%
C. 77%
D. 84%
> [cite_start]Based on the ticket distribution constraints, the occupancy factor is 70%[cite: 1075].

@Q type=TITA | tax=di_reasoning | topic=Data Interpretation | sub=Logical Reasoning | diff=hard | m=3,0 | ans=50
? How many tickets were booked from Station A to Station E?
> [cite_start]The number of tickets is 50[cite: 1077].

@Q type=TITA | tax=di_reasoning | topic=Data Interpretation | sub=Logical Reasoning | diff=hard | m=3,0 | ans=80
? How many tickets were booked from Station C?
> [cite_start]The total booked from C (to D and E) is 80[cite: 1079].

@Q type=TITA | tax=di_reasoning | topic=Data Interpretation | sub=Logical Reasoning | diff=hard | m=3,0 | ans=40
? What is the difference between the number of tickets booked to Station C and the number of tickets booked to Station D?
> [cite_start]The difference is 40[cite: 1081].

@Q type=TITA | tax=di_reasoning | topic=Data Interpretation | sub=Logical Reasoning | diff=hard | m=3,0 | ans=60
? How many tickets were booked to travel in exactly one segment?
> [cite_start]Summing tickets for A-B (0), B-C, C-D, D-E (0) etc., yields 60[cite: 1083].
@END_SET

@SET DILR_SET_5 | type=DILR | ctx=dilr_set | layout=split_view | title=Foot Tapping Game
@CTX
Alia, Badal, Clive, Dilshan, and Ehsaan played a game where each asks a unique question to all others, who respond by tapping feet: 1 tap ("Yes"), 2 taps ("No"), 3 taps ("Maybe").
Total taps = 40. Each question got at least one Yes, No, and Maybe.

Information:
1. Alia tapped 6 times total and received 9 taps. She said "Yes" to Clive and Dilshan.
2. Dilshan tapped 11 times, Ehsaan tapped 9 times. Dilshan said "No" to Badal.
3. Badal, Dilshan, and Ehsaan received equal number of taps.
4. No one said "Yes" more than twice.
5. No one's answer to Alia matched Alia's answer to them. Same for Ehsaan.
6. Clive tapped more times than Badal.
@END_CTX

@Q type=TITA | tax=lr_logic | topic=Logical Reasoning | sub=Games | diff=hard | m=3,0 | ans=7
? How many taps did Clive receive for his question?
> [cite_start]Solving the grid of responses shows Clive received 7 taps[cite: 1100].

@Q type=MCQ | tax=lr_logic | topic=Logical Reasoning | sub=Games | diff=hard | m=3,1 | ans=D
? Which two people tapped an equal number of times in total?
A. Badal and Dilshan
B. Clive and Ehsaan
C. Dilshan and Clive
D. Alia and Badal
> [cite_start]Alia and Badal tapped the same number of times[cite: 1106].

@Q type=MCQ | tax=lr_logic | topic=Logical Reasoning | sub=Games | diff=hard | m=3,1 | ans=A
? What was Clive's response to Ehsaan's question?
A. No
B. Maybe
C. Cannot be determined
D. Yes
> [cite_start]Clive responded "No"[cite: 1112].

@Q type=TITA | tax=lr_logic | topic=Logical Reasoning | sub=Games | diff=hard | m=3,0 | ans=6
? How many "Yes" responses were received across all the questions?
> [cite_start]There were 6 "Yes" responses total[cite: 1114].
@END_SET

@END_S

@S QA

@SET QA_ATOMIC_47 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_algebra | topic=Quant | sub=Functions | diff=medium | m=3,1 | ans=B
? A value of $c$ for which the minimum value of $f(x)=x^{2}-4cx+8c$ is greater than the maximum value of $g(x)=-x^{2}+3cx-2c,$ is
A. $2$
B. $\frac{1}{2}$
C. $-\frac{1}{2}$
D. $-2$
> Find the vertex of the parabolas. Min of $f(x)$ occurs at $x=2c$, value is $8c - 4c^2$. Max of $g(x)$ occurs at $x=1.5c$, value is $2.25c^2 - 2c$. [cite_start]Set inequality $8c - 4c^2 > 2.25c^2 - 2c$ and solve for $c$[cite: 1117].
@END_Q
@END_SET

@SET QA_ATOMIC_48 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_arithmetic | topic=Quant | sub=Time Speed Distance | diff=medium | m=3,1 | ans=D
? Shruti travels a distance of $224$ km in four parts for a total travel time of $3$ hours. Her speeds in these four parts follow an arithmetic progression, and the corresponding time taken to cover these four parts follow another arithmetic progression. If she travels at a speed of $960$ meters per minute for $30$ minutes to cover the first part, then the distance, in meters, she travels in the fourth part is
A. $76800$
B. $112000$
C. $96000$
D. $86400$
> Convert units to km/h or consistent metric. $S_1 = 960$ m/min. $T_1 = 30$ min. Total distance 224 km. [cite_start]Use sum of AP properties for speed and time to find variables [cite: 1125-1127].
@END_Q
@END_SET

@SET QA_ATOMIC_49 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_number_theory | topic=Quant | sub=Numbers | diff=medium | m=3,0 | ans=6
? In a 3-digit number $N$, the digits are non-zero and distinct such that none of the digits is a perfect square, and only one of the digits is a prime number. Then, the number of factors of the minimum possible value of $N$ is
> Identify valid digits (non-zero, non-square: 2, 3, 5, 6, 7, 8). Primes: 2, 3, 5, 7. Non-primes: 6, 8. Construct min $N$ with one prime and distinct digits (e.g., using small digits). [cite_start]Calculate factors of that $N$[cite: 1135].
@END_Q
@END_SET

@SET QA_ATOMIC_50 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_algebra | topic=Quant | sub=Inequalities | diff=hard | m=3,1 | ans=A
? Let $3\le x\le6$ and $[x^{2}]=[x]^{2}$, where $[z]$ is the greatest integer not exceeding $z$. If set $S$ represents all feasible values of $x$, then a possible subset of $S$ is
A. $[3,\sqrt{10})\cup[5,\sqrt{26})\cup\{6\}$
B. $[3,\sqrt{10}]\cup[5,\sqrt{26}]$
C. $[3,\sqrt{10}]\cup[4,\sqrt{17}]\cup\{6\}$
D. $(4,\sqrt{18})\cup[5,\sqrt{27})\cup\{6\}$
> Analyze intervals where $[x]$ is constant (3, 4, 5, 6). For $[x]=3$, require $[x^2]=9$. For $[x]=4$, require $[x^2]=16$. [cite_start]Check validity in range [cite: 1140-1141].
@END_Q
@END_SET

@SET QA_ATOMIC_51 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_arithmetic | topic=Quant | sub=Profit and Loss | diff=easy | m=3,0 | ans=15
? Stocks A, B and C are priced at rupees $120$, $90$ and $150$ per share, respectively. A trader holds a portfolio consisting of $10$ shares of stock A, and $20$ shares of stocks B and C put together. If the total value of her portfolio is rupees $3300$, then the number of shares of stock B that she holds, is
> Let $b$ be shares of B, then $c = 20-b$. Equation: $10(120) + 90b + 150(20-b) = 3300$. [cite_start]Solve for $b$ [cite: 1149-1151].
@END_Q
@END_SET

@SET QA_ATOMIC_52 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_algebra | topic=Quant | sub=Sequences | diff=medium | m=3,1 | ans=A
? For any natural number $k$, let $a_{k}=3^{k}$. The smallest natural number $m$ for which $\{(a_{1})^{1}\times(a_{2})^{2}\times...\times(a_{20})^{20}\}<\{a_{21}\times a_{22}\times...\times a_{20+m}\},$ is
A. $58$
B. $59$
C. $56$
D. $57$
> Exponents of 3 form a sequence. LHS exponent is $\sum k^2$. RHS exponent is arithmetic series sum. [cite_start]Set inequality and solve for min $m$[cite: 1155].
@END_Q
@END_SET

@SET QA_ATOMIC_53 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_algebra | topic=Quant | sub=Logarithms | diff=medium | m=3,1 | ans=D
? The number of distinct integers $n$ for which $\log_{\frac{1}{4}}(n^{2}-7n+11)>0$ is
A. $2$
B. infinite
C. $1$
D. $0$
> Inequality $\log_{1/4}(A) > 0 \implies 0 < A < 1$ (base < 1 reverses sign). [cite_start]Solve $0 < n^2-7n+11 < 1$ for integers $n$[cite: 1163].
@END_Q
@END_SET

@SET QA_ATOMIC_54 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_algebra | topic=Quant | sub=Inequalities | diff=medium | m=3,0 | ans=16
? The number of distinct pairs of integers $(x, y)$ satisfying the inequalities $x>y\ge3$ and $x+y<14$ is
> [cite_start]Iterate through possible integer values of $y$ starting from 3 ($y=3, 4, 5...$) and find corresponding valid $x$ values ($y < x < 14-y$)[cite: 1171].
@END_Q
@END_SET

@SET QA_ATOMIC_55 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_arithmetic | topic=Quant | sub=Interest | diff=medium | m=3,1 | ans=A
? At a certain simple rate of interest, a given sum amounts to Rs $13920$ in $3$ years, and to Rs $18960$ in $6$ years and $6$ months. If the same given sum had been invested for $2$ years at the same rate as before but with interest compounded every $6$ months, then the total interest earned, in rupees, would have been nearest to
A. $3221$
B. $3180$
C. $3150$
D. $3096$
> Find Principal $P$ and Rate $R$ from SI data (Difference in amount / difference in time = yearly interest). [cite_start]Then calculate CI for 2 years compounded semi-annually [cite: 1175-1176].
@END_Q
@END_SET

@SET QA_ATOMIC_56 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_arithmetic | topic=Quant | sub=Mixtures | diff=medium | m=3,1 | ans=D
? A container holds $200$ litres of a solution of acid and water, having $30\%$ acid by volume. Atul replaces $20\%$ of this solution with water, then replaces $10\%$ of the resulting solution with acid, and finally replaces $15\%$ of the solution thus obtained, with water. The percentage of acid by volume in the final solution obtained after these three replacements, is nearest to
A. $23$
B. $25$
C. $29$
D. $27$
> Track the volume of acid remaining after each step. Step 1 (Water replace): Acid decreases. Step 2 (Acid replace): Acid increases. [cite_start]Step 3 (Water replace): Acid decreases [cite: 1184-1186].
@END_Q
@END_SET

@SET QA_ATOMIC_57 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_algebra | topic=Quant | sub=Word Problems | diff=medium | m=3,0 | ans=55
? In a class, there were more than $10$ boys and a certain number of girls. After $40\%$ of the girls and $60\%$ of the boys left the class, the remaining number of girls was $8$ more than the remaining number of boys. Then, the minimum possible number of students initially in the class was
> Let $B, G$ be initial numbers. Remaining: $0.6G = 0.4B + 8$. Simplify equation ($3G = 2B + 40$). [cite_start]Find integer solutions for $B > 10$ that minimize $B+G$ [cite: 1194-1196].
@END_Q
@END_SET

@SET QA_ATOMIC_58 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_arithmetic | topic=Quant | sub=Permutations Combinations | diff=medium | m=3,1 | ans=A
? A cafeteria offers $5$ types of sandwiches. Moreover, for each type of sandwich, a customer can choose one of $4$ breads and opt for either small or large sized sandwich. Optionally, the customer may also add up to $2$ out of $6$ available sauces. The number of different ways in which an order can be placed for a sandwich, is
A. $880$
B. $840$
C. $800$
D. $600$
> Main choices: $5 \times 4 \times 2 = 40$. Sauces: 0, 1, or 2 sauces from 6. Ways = $\binom{6}{0} + \binom{6}{1} + \binom{6}{2}$. [cite_start]Total = Main $\times$ Sauces [cite: 1200-1202].
@END_Q
@END_SET

@SET QA_ATOMIC_59 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_number_theory | topic=Quant | sub=Progressions | diff=medium | m=3,1 | ans=A
? In the set of consecutive odd numbers $\{1,3,5,...,57\}$, there is a number $k$ such that the sum of all the elements less than $k$ is equal to the sum of all the elements greater than $k$. Then, $k$ equals
A. $41$
B. $39$
C. $43$
D. $37$
> Series is arithmetic. Let $k$ be the $m$-th term. Sum of first $(m-1)$ terms equals sum of terms from $(m+1)$ to end. [cite_start]Solve for $k$ [cite: 1210-1211].
@END_Q
@END_SET

@SET QA_ATOMIC_60 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_arithmetic | topic=Quant | sub=Time and Work | diff=medium | m=3,1 | ans=A
? Arun, Varun and Tarun, if working alone, can complete a task in $24$, $21$, and $15$ days, respectively. They charge Rs $2160$, Rs $2400$, and Rs $2160$ per day, respectively, even if they are employed for a partial day. On any given day, any of the workers may or may not be employed to work. If the task needs to be completed in $10$ days or less, then the minimum possible amount, in rupees, required to be paid for the entire task is
A. $38400$
B. $38880$
C. $34400$
D. $47040$
> Calculate efficiency and cost per unit work for each. [cite_start]Optimize the mix of workers to finish $\ge 1$ unit of work within 10 days at min cost [cite: 1219-1222].
@END_Q
@END_SET

@SET QA_ATOMIC_61 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_arithmetic | topic=Quant | sub=Interest | diff=medium | m=3,0 | ans=900
? Kamala divided her investment of Rs $100000$ between stocks, bonds, and gold. Her investment in bonds was $25\%$ of her investment in gold. With annual returns of $10\%$, $6\%$, $8\%$ on stocks, bonds, and gold, respectively, she gained a total amount of Rs $8200$ in one year. The amount, in rupees, that she gained from the bonds, was
> Let Gold $= G$, Bonds $= 0.25G$, Stocks $= 100000 - 1.25G$. Total return equation: $0.10(Stocks) + 0.06(Bonds) + 0.08(Gold) = 8200$. [cite_start]Solve for $G$ then Bond interest [cite: 1230-1232].
@END_Q
@END_SET

@SET QA_ATOMIC_62 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_algebra | topic=Quant | sub=Linear Equations | diff=medium | m=3,1 | ans=C
? If $a-6b+6c=4$ and $6a+3b-3c=50$ where $a, b$ and $c$ are real numbers, the value of $2a+3b-3c$ is
A. $20$
B. $14$
C. $18$
D. $15$
> Let $X = 3b-3c$. Rewrite equations: $a - 2X = 4$ and $6a + X = 50$. Solve system for $a$ and $X$. [cite_start]Evaluate $2a + X$[cite: 1237].
@END_Q
@END_SET

@SET QA_ATOMIC_63 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_geometry | topic=Quant | sub=Coordinate Geometry | diff=medium | m=3,1 | ans=D
? The $(x, y)$ coordinates of vertices P, Q and R of a parallelogram PQRS are $(-3,-2)$, $(1, -5)$ and $(9, 1)$, respectively. If the diagonal SQ intersects the x-axis at $(a, 0)$, then the value of $a$ is
A. $\frac{27}{7}$
B. $\frac{10}{3}$
C. $\frac{13}{4}$
D. $\frac{29}{9}$
> Find vertex S using midpoint formula (midpoint of PR = midpoint of QS). Find equation of line SQ. [cite_start]Find x-intercept ($y=0$) [cite: 1245-1246].
@END_Q
@END_SET

@SET QA_ATOMIC_64 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_geometry | topic=Quant | sub=Geometry | diff=hard | m=3,1 | ans=C
? In a circle with center C and radius $6\sqrt{2}$ cm, PQ and SR are two parallel chords separated by one of the diameters. If $\angle PQC=45^{\circ}$ and the ratio of the perpendicular distance of PQ and SR from C is $3: 2$, then the area, in sq. cm, of the quadrilateral PQRS is
A. $4(3+\sqrt{14})$
B. $4(3\sqrt{2}+\sqrt{7})$
C. $20(3+\sqrt{14})$
D. $20(3\sqrt{2}+\sqrt{7})$
> Use trigonometry to find chord lengths and perpendicular distances. [cite_start]Calculate area of trapezoid PQRS [cite: 1254-1255].
@END_Q
@END_SET

@SET QA_ATOMIC_65 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=MCQ | tax=qa_arithmetic | topic=Quant | sub=Ratios | diff=medium | m=3,1 | ans=D
? The ratio of the number of students in the morning shift and afternoon shift of a school was $13: 9$. After $21$ students moved from the morning shift to the afternoon shift, this ratio became $19: 14$. Next, some new students joined the morning and afternoon shifts in the ratio $3: 8$ and then the ratio of the number of students in the morning shift and the afternoon shift became $5: 4$. The number of new students who joined is
A. $110$
B. $88$
C. $121$
D. $99$
> Use variables for initial students (13x, 9x). Apply transfer logic to find x. [cite_start]Then apply new joining ratio (3y, 8y) to find y and total new students (11y) [cite: 1263-1265].
@END_Q
@END_SET

@SET QA_ATOMIC_66 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_geometry | topic=Quant | sub=Geometry | diff=medium | m=3,0 | ans=60
? If the length of a side of a rhombus is $36$ cm and the area of the rhombus is $396$ sq. cm, then the absolute value of the difference between the lengths, in cm, of the diagonals of the rhombus is
> Area $A = \frac{1}{2} d_1 d_2 = 396$. Side $s = \sqrt{(d_1/2)^2 + (d_2/2)^2} = 36$. [cite_start]Use identities to find $(d_1 - d_2)$[cite: 1274].
@END_Q
@END_SET

@SET QA_ATOMIC_67 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_algebra | topic=Quant | sub=Quadratic Equations | diff=medium | m=3,0 | ans=3
? The number of non-negative integer values of $k$ for which the quadratic equation $x^{2}-5x+k=0$ has only integer roots, is
> Discriminant $D = 25 - 4k$ must be a perfect square. [cite_start]Check non-negative integers $k$ satisfying this[cite: 1278].
@END_Q
@END_SET

@SET QA_ATOMIC_68 | type=ATOMIC | ctx=atomic | layout=text_only
@Q type=TITA | tax=qa_arithmetic | topic=Quant | sub=Profit and Loss | diff=medium | m=3,0 | ans=175
? A shopkeeper offers a discount of $22\%$ on the marked price of each chair, and gives $13$ chairs to a customer for the discounted price of $12$ chairs to earn a profit of $26\%$ on the transaction. If the cost price of each chair is Rs $100$, then the marked price, in rupees, of each chair is
> Let MP be $M$. SP per chair (effectively) involves discount and free item logic. Total Revenue = $12 \times 0.78M$. Total Cost = $13 \times 100$. Profit = 26%. [cite_start]Equate and solve for $M$ [cite: 1282-1283].
@END_Q
@END_SET

@END_S
````

## File: data_sanitized/Cat_2023_slot_1.json
````json
{
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "cat-2023-slot-1",
    "title": "CAT 2023 Slot 1",
    "slug": "cat-2023-slot-1",
    "description": "Official CAT 2023 Slot 1 Question Paper",
    "year": 2023,
    "total_questions": 66,
    "total_marks": 198,
    "duration_minutes": 120,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ],
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "hard",
    "is_free": false,
    "published": false,
    "allow_pause": true,
    "attempt_limit": 0
  },
  "question_sets": [
    {
      "client_set_id": "VARC_RC_1",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 1,
      "context_type": "rc_passage",
      "context_title": "Postcolonial Literature and the Indian Ocean",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "For early postcolonial literature, the world of the novel was often the nation. Postcolonial novels were usually concerned with national questions. Sometimes the whole story of the novel was taken as an allegory of the nation, whether India or Tanzania. This was important for supporting anti-colonial nationalism, but could also be limiting \\- land-focused and inward-looking.\nMy new book \"Writing Ocean Worlds\" explores another kind of world of the novel: not the village or nation, but the Indian Ocean world. The book describes a set of novels in which the Indian Ocean is at the centre of the story. It focuses on the novelists Amitav Ghosh, Abdulrazak Gurnah, Lindsey Collen and Joseph Conrad who have centred the Indian Ocean world in the majority of their novels.... Their work reveals a world that is outward-looking \\- full of movement, border-crossing and south-south interconnection. They are all very different \\- from colonially inclined (Conrad) to radically anti-capitalist (Collen), but together draw on and shape a wider sense of Indian Ocean space through themes, images, metaphors and language. This has the effect of remapping the world in the reader's mind, as centred in the interconnected global south.\nThe Indian Ocean world is a term used to describe the very long-lasting connections among the coasts of East Africa, the Arab coasts, and South and East Asia. These connections were made possible by the geography of the Indian Ocean. For much of history, travel by sea was much easier than by land, which meant that port cities very far apart were often more easily connected to each other than to much closer inland cities. Historical and archaeological evidence suggests that what we now call globalisation first appeared in the Indian Ocean. This is the interconnected oceanic world referenced and produced by the novels in my book.... For their part Ghosh, Gurnah, Collen and even Conrad reference a different set of histories and geographies than the ones most commonly found in fiction in English. Those are mostly centred in Europe or the US, assume a background of Christianity and whiteness, and mention places like Paris and New York.\nThe novels in my book highlight instead a largely Islamic space, feature characters of colour and centralise the ports of Malindi, Mombasa, Aden, Java and Bombay.... It is a densely imagined, richly sensory image of a southern cosmopolitan culture which provides for an enlarged sense of place in the world. This remapping is particularly powerful for the representation of Africa. In the fiction, sailors and travellers are not all European.... African, as well as Indian and Arab characters, are traders, nakhodas (dhow ship captains), runaways, villains, missionaries and activists. This does not mean that Indian Ocean Africa is romanticised. Migration is often a matter of force; travel is portrayed as abandonment rather than adventure, freedoms are kept from women and slavery is rife. What it does mean is that the African part of the Indian Ocean world plays an active role in its long, rich history and therefore in that of the wider world."
    },
    {
      "client_set_id": "VARC_RC_2",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 2,
      "context_type": "rc_passage",
      "context_title": "Geographic Determinism",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "Many human phenomena and characteristics \\- such as behaviors, beliefs, economies, genes, incomes, life expectancies, and other things \\- are influenced both by geographic factors and by non-geographic factors. Geographic factors mean physical and biological factors tied to geographic location, including climate, the distributions of wild plant and animal species, soils, and topography. Non-geographic factors include those factors subsumed under the term culture, other factors subsumed under the term history, and decisions by individual people....\n\\[T\\]he differences between the current economies of North and South Korea... cannot be attributed to the modest environmental differences between \\[them\\]... They are instead due entirely to the different \\[government\\] policies... At the opposite extreme, the Inuit and other traditional peoples living north of the Arctic Circle developed warm fur clothes but no agriculture, while equatorial lowland peoples around the world never developed warm fur clothes but often did develop agriculture. The explanation is straightforwardly geographic, rather than a cultural or historical quirk unrelated to geography... Aboriginal Australia remained the sole continent occupied only by hunter/gatherers and with no indigenous farming or herding... \\[Here the\\] explanation is biogeographic: the Australian continent has no domesticable native animal species and few domesticable native plant species. Instead, the crops and domestic animals that now make Australia a food and wool exporter are all non-native (mainly Eurasian) species such as sheep, wheat, and grapes, brought to Australia by overseas colonists.\nToday, no scholar would be silly enough to deny that culture, history, and individual choices play a big role in many human phenomena. Scholars don't react to cultural, historical, and individual-agent explanations by denouncing \"cultural determinism,\" \"historical determinism,\" or \"individual determinism,\" and then thinking no further. But many scholars do react to any explanation invoking some geographic role, by denouncing \"geographic determinism\".\nSeveral reasons may underlie this widespread but nonsensical view. One reason is that some geographic explanations advanced a century ago were racist, thereby causing all geographic explanations to become tainted by racist associations in the minds of many scholars other than geographers. But many genetic, historical, psychological, and anthropological explanations advanced a century ago were also racist, yet the validity of newer non-racist genetic etc. explanations is widely accepted today.\nAnother reason for reflex rejection of geographic explanations is that historians have a tradition, in their discipline, of stressing the role of contingency (a favorite word among historians) based on individual decisions and chance. Often that view is warranted... But often, too, that view is unwarranted. The development of warm fur clothes among the Inuit living north of the Arctic Circle was not because one influential Inuit leader persuaded other Inuit in 1783 to adopt warm fur clothes, for no good environmental reason. A third reason is that geographic explanations usually depend on detailed technical facts of geography and other fields of scholarship... Most historians and economists don't acquire that detailed knowledge as part of the professional training."
    },
    {
      "client_set_id": "VARC_RC_3",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 3,
      "context_type": "rc_passage",
      "context_title": "Wolves in Lozère",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "RESIDENTS of Lozère, a hilly department in southern France, recite complaints familiar to many rural corners of Europe. In remote hamlets and villages, with names such as Le Bacon and Le Bacon Vieux, mayors grumble about a lack of local schools, jobs, or phone and internet connections. Farmers of grazing animals add another concern: the return of wolves. Eradicated from France last century, the predators are gradually creeping back to more forests and hillsides. \"The wolf must be taken in hand,\" said an aspiring parliamentarian, Francis Palombi, when pressed by voters in an election campaign early this summer. Tourists enjoy visiting a wolf park in Lozère, but farmers fret over their livestock and their livelihoods.\nAs early as the ninth century, the royal office of the Luparii—wolf-catchers—was created in France to tackle the predators. Those official hunters (and others) completed their job in the 1930s, when the last wolf disappeared from the mainland. Active hunting and improved technology such as rifles in the 19th century, plus the use of poison such as strychnine later on, caused the population collapse. But in the early 1990s the animals reappeared. They crossed the Alps from Italy, upsetting sheep farmers on the French side of the border. Wolves have since spread to areas such as Lozère, delighting environmentalists, who see the predators' presence as a sign of wider ecological health. Farmers, who say the wolves cause the deaths of thousands of sheep and other grazing animals, are less cheerful. They grumble that green activists and politically correct urban types have allowed the return of an old enemy.\nVarious factors explain the changes of the past few decades. Rural depopulation is part of the story. In Lozère, for example, farming and a once-flourishing mining industry supported a population of over 140,000 residents in the mid-19th century. Today the department has fewer than 80,000 people, many in its towns. As humans withdraw, forests are expanding. In France, between 1990 and 2015, forest cover increased by an average of 102,000 hectares each year, as more fields were given over to trees. Now, nearly one-third of mainland France is covered by woodland of some sort. The decline of hunting as a sport also means more forests fall quiet. In the mid-to-late 20th century over 2m hunters regularly spent winter weekends tramping in woodland, seeking boars, birds and other prey. Today the Fédération Nationale des Chasseurs, the national body, claims 1.1m people hold hunting licences, though the number of active hunters is probably lower.\nThe mostly protected status of the wolf in Europe—hunting them is now forbidden, other than when occasional culls are sanctioned by the state—plus the efforts of NGOs to track and count the animals, also contribute to the recovery of wolf populations. As the lupine population of Europe spreads westwards, with occasional reports of wolves seen closer to urban areas, expect to hear of more clashes between farmers and those who celebrate the predators' return. Farmers' losses are real, but are not the only economic story. Tourist venues, such as parks where wolves are kept and the animals' spread is discussed, also generate income and jobs in rural areas."
    },
    {
      "client_set_id": "VARC_RC_4",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 4,
      "context_type": "rc_passage",
      "context_title": "\"Original Affluent Society\"",
      "content_layout": "single_focus",
      "context_image_url": null,
      "context_body": "\\[Fifty\\] years after its publication in English \\[in 1972\\], and just a year since \\[Marshall\\] Sahlins himself died—we may ask: why did \\[his essay\\] \"Original Affluent Society\" have such an impact, and how has it fared since? Sahlins's principal argument was simple but counterintuitive: before being driven into marginal environments by colonial powers, hunter-gatherers, or foragers, were not engaged in a desperate struggle for meager survival. Quite the contrary, they satisfied their needs with far less work than people in agricultural and industrial societies, leaving them more time to use as they wished. Hunters, he quipped, keep bankers' hours. Refusing to maximize, many were \"more concerned with games of chance than with chances of game.\"\nThe so-called Neolithic Revolution, rather than improving life, imposed a harsher work regime and set in motion the long history of growing inequality... Moreover, foragers had other options. The contemporary Hadza of Tanzania, who had long been surrounded by farmers, knew they had alternatives and rejected them. To Sahlins, this showed that foragers are not simply examples of human diversity or victimhood but something more profound: they demonstrated that societies make real choices. Culture, a way of living oriented around a distinctive set of values, manifests a fundamental principle of collective self-determination.\nBut the point \\[of the essay\\] is not so much the empirical validity of the data—the real interest for most readers, after all, is not in foragers either today or in the Paleolithic—but rather its conceptual challenge to contemporary economic life and bourgeois individualism. The empirical served a philosophical and political project, a thought experiment and stimulus to the imagination of possibilities. With its title's nod toward The Affluent Society (1958), economist John Kenneth Galbraith's famously skeptical portrait of America's postwar prosperity and inequality, and dripping with New Left contempt for consumerism, \"The Original Affluent Society\" brought this critical perspective to bear on the contemporary world.\nIt did so through the classic anthropological move of showing that radical alternatives to the readers' lives really exist. If the capitalist world seeks wealth through ever greater material production to meet infinitely expansive desires, foraging societies follow \"the Zen road to affluence\": not by getting more, but by wanting less. If it seems that foragers have been left behind by \"progress,\" this is due only to the ethnocentric self-congratulation of the West. Rather than accumulate material goods, these societies are guided by other values: leisure, mobility, and above all, freedom.\nViewed in today's context, of course, not every aspect of the essay has aged well. While acknowledging the violence of colonialism, racism, and dispossession, it does not thematize them as heavily as we might today. Rebuking evolutionary anthropologists for treating present-day foragers as \"left behind\" by progress, it too can succumb to the temptation to use them as proxies for the Paleolithic. Yet these characteristics should not distract us from appreciating Sahlins's effort to show that if we want to conjure new possibilities, we need to learn about actually inhabitable worlds."
    },
    {
      "client_set_id": "VARC_VA_17",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 5,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_VA_18",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 6,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_VA_19",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 7,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_VA_20",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 8,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_VA_21",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 9,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_VA_22",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 10,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_VA_23",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 11,
      "context_image_url": null
    },
    {
      "client_set_id": "VARC_VA_24",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 12,
      "context_image_url": null
    },
    {
      "client_set_id": "DILR_SET_1",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 1,
      "context_type": "dilr_set",
      "context_title": "Visa Processing",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "A visa processing office (VPO) accepts visa applications in four categories \\- US, UK, Schengen, and Others. The applications are scheduled for processing in twenty 15-minute slots starting at 9:00 am and ending at 2:00 pm. Ten applications are scheduled in each slot. There are ten counters in the office, four dedicated to US applications, and two each for UK applications, Schengen applications and Others applications. Applicants are called in for processing sequentially on a first-come-first-served basis whenever a counter gets freed for their category. The processing time for an application is the same within each category. But it may vary across the categories. Each US and UK application requires 10 minutes of processing time. Depending on the number of applications in a category and time required to process an application for that category, it is possible that an applicant for a slot may be processed later.\nOn a particular day, Ira, Vijay and Nandini were scheduled for Schengen visa processing in that order. They had a 9:15 am slot but entered the VPO at 9:20 am. When they entered the office, exactly six out of the ten counters were either processing applications, or had finished processing one and ready to start processing the next. Mahira and Osman were scheduled in the 9:30 am slot on that day for visa processing in the Others category.\nThe following additional information is known about that day:\n1\\. All slots were full.\n2\\. The number of US applications was the same in all the slots. The same was true for the other three categories.\n3\\. 50% of the applications were US applications.\n4\\. All applicants except Ira, Vijay and Nandini arrived on time.\n5\\. Vijay was called to a counter at 9:25 am."
    },
    {
      "client_set_id": "DILR_SET_2",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 2,
      "context_type": "dilr_set",
      "context_title": "Housing Complex",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "The schematic diagram (not shown) describes 12 rectangular houses in a housing complex. House numbers are mentioned in the rectangles representing the houses. The houses are located in six columns \\- Column-A through Column-F, and two rows \\- Row-1 and Row-2. The houses are divided into two blocks \\- Block XX and Block YY.\nBlock XX: Row-1 (A1, B1, C1), Row-2 (A2, B2, C2)\nBlock YY: Row-1 (D1, E1, F1), Row-2 (D2, E2, F2)\nSome of the houses are occupied. The remaining ones are vacant and are the only ones available for sale.\nDefinitions:\n\\- Road Adjacency Value: The number of its sides adjacent to a road. (e.g., C2=2, F2=1, B1=0).\n\\- Neighbour Count: The number of sides of that house adjacent to occupied houses in the same block.\n\\- Pricing: Base price of a vacant house is Rs. 10 lakhs (no parking) or Rs. 12 lakhs (with parking).\n\\- Quoted Price: (base price) \\+ 5 \\* (road adjacency value) \\+ 3 \\* (neighbour count).\nAdditional Info:\n1\\. The maximum quoted price of a house in Block XX is Rs. 24 lakhs.\n2\\. The minimum quoted price of a house in block YY is Rs. 15 lakhs, and one such house is in Column-E.\n3\\. Row-1 has two occupied houses, one in each block.\n4\\. Both houses in Column-E are vacant. Each of Column-D and Column-F has at least one occupied house.\n5\\. There is only one house with parking space in Block YY."
    },
    {
      "client_set_id": "DILR_SET_3",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 3,
      "context_type": "dilr_set",
      "context_title": "Restaurant Ratings",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "Five restaurants, coded R1, R2, R3, R4 and R5 gave integer ratings to five gig workers \\- Ullas, Vasu, Waman, Xavier and Yusuf, on a scale of 1 to 5\\. The means of the ratings given by R1, R2, R3, R4 and R5 were 3.4, 2.2, 3.8, 2.8 and 3.4 respectively.\nAdditional Info:\n(a) R1 awarded a rating of 5 to Waman, as did R2 to Xavier, R3 to Waman and Xavier, and R5 to Vasu.\n(b) R1 awarded a rating of 1 to Ullas, as did R2 to Waman and Yusuf, and R3 to Yusuf."
    },
    {
      "client_set_id": "DILR_SET_4",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 4,
      "context_type": "dilr_set",
      "context_title": "Faculty Election",
      "content_layout": "split_table",
      "context_image_url": null,
      "context_body": "Faculty members belong to four departments: Finance and Accounting (F\\&A \\- 9 members), Marketing and Strategy (M\\&S \\- 7 members), Operations and Quants (O\\&Q \\- 5 members), and Behaviour and Human Resources (B\\&H \\- 3 members).\nCandidates for Dean: Prof. Pakrasi, Prof. Qureshi, Prof. Ramaswamy, and Prof. Samuel.\nRules & Results:\n\\- Only one candidate was from O\\&Q.\n\\- Every faculty member voted.\n\\- In each department, all non-candidates voted for the same candidate.\n\\- Max 2 candidates per department.\n\\- Candidates cannot vote for themselves.\n\\- Faculty cannot vote for a candidate from their own department.\nResults:\n\\- Pakrasi: 3 votes\n\\- Qureshi: 14 votes\n\\- Ramaswamy: 6 votes\n\\- Samuel: 1 vote\nCandidate Votes:\n\\- Pakrasi \\-\\> Ramaswamy\n\\- Qureshi \\-\\> Samuel\n\\- Ramaswamy \\-\\> Qureshi\n\\- Samuel \\-\\> Pakrasi"
    },
    {
      "client_set_id": "QA_ATOMIC_45",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 1,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_46",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 2,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_47",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 3,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_48",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 4,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_49",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 5,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_50",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 6,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_51",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 7,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_52",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 8,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_53",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 9,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_54",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 10,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_55",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 11,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_56",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 12,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_57",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 13,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_58",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 14,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_59",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 15,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_60",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 16,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_61",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 17,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_62",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 18,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_63",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 19,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_64",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 20,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_65",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 21,
      "context_image_url": null
    },
    {
      "client_set_id": "QA_ATOMIC_66",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 22,
      "context_image_url": null
    }
  ],
  "questions": [
    {
      "client_question_id": "cat-2023-slot-1_Q1",
      "set_ref": "VARC_RC_1",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 1,
      "question_type": "MCQ",
      "taxonomy_type": "rc_factual",
      "topic": "Reading Comprehension",
      "subtopic": "Literature & Culture",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements is not true about migration in the Indian Ocean world?",
      "options": [
        {
          "id": "A",
          "text": "The Indian Ocean world's migration networks connected the global north with the global south."
        },
        {
          "id": "B",
          "text": "Geographical location rather than geographical proximity determined the choice of destination for migrants."
        },
        {
          "id": "C",
          "text": "The Indian Ocean world's migration networks were shaped by religious and commercial histories of the region."
        },
        {
          "id": "D",
          "text": "Migration in the Indian Ocean world was an ambivalent experience."
        }
      ],
      "solution_text": "The passage discusses south-south interconnection and contrasts it with the global north (Europe/US). Option A claims connection between global north and south which contradicts the \"south-south\" focus mentioned."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q2",
      "set_ref": "VARC_RC_1",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 2,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Literature & Culture",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "On the basis of the nature of the relationship between the items in each pair below, choose the odd pair out:",
      "options": [
        {
          "id": "A",
          "text": "Indian Ocean novels: Outward-looking"
        },
        {
          "id": "B",
          "text": "Postcolonial novels: Border-crossing"
        },
        {
          "id": "C",
          "text": "Indian Ocean world: Slavery"
        },
        {
          "id": "D",
          "text": "Postcolonial novels: Anti-colonial nationalism"
        }
      ],
      "solution_text": "Postcolonial novels are described as \"inward-looking\" and concerned with the nation, whereas Indian Ocean novels are \"border-crossing\". Thus, pairing Postcolonial novels with Border-crossing is the odd one out (contradictory to passage description)."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q3",
      "set_ref": "VARC_RC_1",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 3,
      "question_type": "MCQ",
      "taxonomy_type": "rc_weakening",
      "topic": "Reading Comprehension",
      "subtopic": "Literature & Culture",
      "difficulty": "hard",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All of the following statements, if true, would weaken the passage's claim about the relationship between mainstream English-language fiction and Indian Ocean novels EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "the depiction of Africa in most Indian Ocean novels is driven by a postcolonial nostalgia for an idyllic past."
        },
        {
          "id": "B",
          "text": "the depiction of Africa in most Indian Ocean novels is driven by an Orientalist imagination of its cultural crudeness."
        },
        {
          "id": "C",
          "text": "very few mainstream English-language novels have historically been set in American and European metropolitan centres."
        },
        {
          "id": "D",
          "text": "most mainstream English-language novels have historically privileged the Christian, white, male experience of travel and adventure."
        }
      ],
      "solution_text": "Option D supports the passage's claim about mainstream fiction, so it does not weaken it. The others would contradict the distinctions drawn in the passage."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q4",
      "set_ref": "VARC_RC_1",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 4,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Literature & Culture",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All of the following claims contribute to the \"remapping\" discussed by the passage, EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "Indian Ocean novels have gone beyond the specifics of national concerns to explore rich regional pasts."
        },
        {
          "id": "B",
          "text": "the world of early international trade and commerce was not the sole domain of white Europeans."
        },
        {
          "id": "C",
          "text": "cosmopolitanism originated in the West and travelled to the East through globalisation."
        },
        {
          "id": "D",
          "text": "the global south, as opposed to the global north, was the first centre of globalisation."
        }
      ],
      "solution_text": "The passage suggests globalization and cosmopolitanism existed in the Indian Ocean (global south) first or independently (\"southern cosmopolitan culture\"). Option C claims it originated in the West, which contradicts the \"remapping\" discussed."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q5",
      "set_ref": "VARC_RC_2",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 5,
      "question_type": "MCQ",
      "taxonomy_type": "rc_factual",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All of the following are advanced by the author as reasons why non-geographers disregard geographic influences on human phenomena EXCEPT their:",
      "options": [
        {
          "id": "A",
          "text": "lingering impressions of past geographic analyses that were politically offensive."
        },
        {
          "id": "B",
          "text": "belief in the central role of humans, unrelated to physical surroundings, in influencing phenomena."
        },
        {
          "id": "C",
          "text": "disciplinary training which typically does not include technical knowledge of geography."
        },
        {
          "id": "D",
          "text": "dismissal of explanations that involve geographical causes for human behaviour."
        }
      ],
      "solution_text": "Options A, B, and C are reasons given (racist associations, focus on human contingency/agency, lack of technical training). Option D is a circular statement describing the disregard itself, not a reason for it."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q6",
      "set_ref": "VARC_RC_2",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 6,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The author criticises scholars who are not geographers for all of the following reasons EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "their rejection of the role of biogeographic factors in social and cultural phenomena."
        },
        {
          "id": "B",
          "text": "their outdated interpretations of past cultural and historical phenomena."
        },
        {
          "id": "C",
          "text": "the importance they place on the role of individual decisions when studying human phenomena."
        },
        {
          "id": "D",
          "text": "their labelling of geographic explanations as deterministic."
        }
      ],
      "solution_text": "The author criticizes them for rejecting geography (A), over-stressing individual decisions (C), and using the label \"deterministic\" (D). There is no mention of them having \"outdated interpretations\" of culture/history itself (B)."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q7",
      "set_ref": "VARC_RC_2",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 7,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "All of the following can be inferred from the passage EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "individual dictate and contingency were not the causal factors for the use of fur clothing in some very cold climates."
        },
        {
          "id": "B",
          "text": "agricultural practices changed drastically in the Australian continent after it was colonised."
        },
        {
          "id": "C",
          "text": "while most human phenomena result from culture and individual choice, some have bio-geographic origins."
        },
        {
          "id": "D",
          "text": "several academic studies of human phenomena in the past involved racist interpretations."
        }
      ],
      "solution_text": "The passage states \"Many human phenomena... are influenced both by geographic factors and by non-geographic factors.\" It does not assert that \"most\" result from culture/choice while only \"some\" have bio-geographic origins; it argues against ignoring the geographic ones."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q8",
      "set_ref": "VARC_RC_2",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 8,
      "question_type": "MCQ",
      "taxonomy_type": "rc_purpose",
      "topic": "Reading Comprehension",
      "subtopic": "Sociology",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The examples of the Inuit and Aboriginal Australians are offered in the passage to show:",
      "options": [
        {
          "id": "A",
          "text": "human resourcefulness across cultures in adapting to their surroundings."
        },
        {
          "id": "B",
          "text": "how physical circumstances can dictate human behaviour and cultures."
        },
        {
          "id": "C",
          "text": "that despite geographical isolation, traditional societies were self-sufficient and adaptive."
        },
        {
          "id": "D",
          "text": "how environmental factors lead to comparatively divergent paths in livelihoods and development."
        }
      ],
      "solution_text": "The examples illustrate cases where geography (cold, lack of domesticable species) determined the outcome (fur, hunter-gatherer status), supporting the role of physical circumstances."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q9",
      "set_ref": "VARC_RC_3",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 9,
      "question_type": "MCQ",
      "taxonomy_type": "rc_factual",
      "topic": "Reading Comprehension",
      "subtopic": "Ecology",
      "difficulty": "easy",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following has NOT contributed to the growing wolf population in Lozère?",
      "options": [
        {
          "id": "A",
          "text": "A decline in the rural population of Lozère."
        },
        {
          "id": "B",
          "text": "An increase in woodlands and forest cover in Lozère."
        },
        {
          "id": "C",
          "text": "The shutting down of the royal office of the Luparii."
        },
        {
          "id": "D",
          "text": "The granting of a protected status to wolves in Europe."
        }
      ],
      "solution_text": "The Luparii shut down in the 1930s when wolves were eradicated. Their shutdown didn't cause the \\*recent\\* growth; factors like depopulation, forest increase, and protected status did."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q10",
      "set_ref": "VARC_RC_3",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 10,
      "question_type": "MCQ",
      "taxonomy_type": "rc_factual",
      "topic": "Reading Comprehension",
      "subtopic": "Ecology",
      "difficulty": "easy",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The inhabitants of Lozère have to grapple with all of the following problems, EXCEPT:",
      "options": [
        {
          "id": "A",
          "text": "lack of educational facilities."
        },
        {
          "id": "B",
          "text": "poor rural communication infrastructure."
        },
        {
          "id": "C",
          "text": "livestock losses."
        },
        {
          "id": "D",
          "text": "decline in the number of hunting licences."
        }
      ],
      "solution_text": "The decline in hunting licenses is mentioned as a factor helping wolves, but not explicitly as a \"problem\" inhabitants grapple with (unlike schools, phone/internet, and livestock)."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q11",
      "set_ref": "VARC_RC_3",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 11,
      "question_type": "MCQ",
      "taxonomy_type": "rc_weakening",
      "topic": "Reading Comprehension",
      "subtopic": "Ecology",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which one of the following statements, if true, would weaken the author's claims?",
      "options": [
        {
          "id": "A",
          "text": "Having migrated out in the last century, wolves are now returning to Lozère."
        },
        {
          "id": "B",
          "text": "Unemployment concerns the residents of Lozère."
        },
        {
          "id": "C",
          "text": "Wolf attacks on tourists in Lozère are on the rise."
        },
        {
          "id": "D",
          "text": "The old mining sites of Lozère are now being used as grazing pastures for sheep."
        }
      ],
      "solution_text": "The author claims tourists enjoy wolf parks and they generate income/jobs (a positive economic story). If wolf attacks on tourists were rising (C), this positive aspect would be weakened."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q12",
      "set_ref": "VARC_RC_3",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 12,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Ecology",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The author presents a possible economic solution to an existing issue facing Lozère that takes into account the divergent and competing interests of:",
      "options": [
        {
          "id": "A",
          "text": "politicians and farmers."
        },
        {
          "id": "B",
          "text": "environmentalists and politicians."
        },
        {
          "id": "C",
          "text": "farmers and environmentalists."
        },
        {
          "id": "D",
          "text": "tourists and environmentalists."
        }
      ],
      "solution_text": "The issue is the clash between farmers (livestock loss) and environmentalists (celebrating wolves). The economic solution mentioned is tourism (wolf parks), attempting to balance or address the conflict by providing alternative income."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q13",
      "set_ref": "VARC_RC_4",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 13,
      "question_type": "MCQ",
      "taxonomy_type": "rc_main_idea",
      "topic": "Reading Comprehension",
      "subtopic": "Anthropology",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "We can infer that Sahlins's main goal in writing his essay was to:",
      "options": [
        {
          "id": "A",
          "text": "put forth the view that, despite egalitarian origins, economic progress brings greater inequality and social hierarchies."
        },
        {
          "id": "B",
          "text": "highlight the fact that while we started off as a fairly contented egalitarian people, we have progressively degenerated into materialism."
        },
        {
          "id": "C",
          "text": "hold a mirror to an acquisitive society, with examples of other communities that have chosen successfully to be non-materialistic."
        },
        {
          "id": "D",
          "text": "counter Galbraith's pessimistic view of the inevitability of a capitalist trajectory for economic growth."
        }
      ],
      "solution_text": "The passage states the essay's point was a \"conceptual challenge to contemporary economic life\" and to show that \"radical alternatives... really exist.\""
    },
    {
      "client_question_id": "cat-2023-slot-1_Q14",
      "set_ref": "VARC_RC_4",
      "sequence_order": 2,
      "section": "VARC",
      "question_number": 14,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Anthropology",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The author mentions Tanzania's Hadza community to illustrate:",
      "options": [
        {
          "id": "A",
          "text": "that hunter-gatherer communities' subsistence-level techniques equipped them to survive well into contemporary times."
        },
        {
          "id": "B",
          "text": "how pre-agrarian societies did not hamper the emergence of more advanced agrarian practices in contiguous communities."
        },
        {
          "id": "C",
          "text": "that forager communities' lifestyles derived not from ignorance about alternatives, but from their own choice."
        },
        {
          "id": "D",
          "text": "how two vastly different ways of living and working were able to coexist in proximity for centuries."
        }
      ],
      "solution_text": "The passage says the Hadza \"knew they had alternatives and rejected them... they demonstrated that societies make real choices.\""
    },
    {
      "client_question_id": "cat-2023-slot-1_Q15",
      "set_ref": "VARC_RC_4",
      "sequence_order": 3,
      "section": "VARC",
      "question_number": 15,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Anthropology",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The author of the passage mentions Galbraith's \"The Affluent Society\" to:",
      "options": [
        {
          "id": "A",
          "text": "show how Galbraith's theories refute Sahlins's thesis on the contentment of pre-hunter-gatherer communities."
        },
        {
          "id": "B",
          "text": "contrast the materialist nature of contemporary growth paths with the pacifist content ways of living among the foragers."
        },
        {
          "id": "C",
          "text": "document the influence of Galbraith's cynical views on modern consumerism on Sahlins's analysis of pre-historic societies."
        },
        {
          "id": "D",
          "text": "show how Sahlins's views complemented Galbraith's criticism of the consumerism and inequality of contemporary society."
        }
      ],
      "solution_text": "The title was a \"nod toward\" Galbraith's work, bringing its critical perspective on prosperity/inequality to bear, effectively complementing the criticism of consumerism."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q16",
      "set_ref": "VARC_RC_4",
      "sequence_order": 4,
      "section": "VARC",
      "question_number": 16,
      "question_type": "MCQ",
      "taxonomy_type": "rc_inference",
      "topic": "Reading Comprehension",
      "subtopic": "Anthropology",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The author of the passage criticises Sahlins's essay for its:",
      "options": [
        {
          "id": "A",
          "text": "cursory treatment of the effects of racism and colonialism on societies."
        },
        {
          "id": "B",
          "text": "outdated values regarding present-day foragers versus ancient foraging communities."
        },
        {
          "id": "C",
          "text": "critique of anthropologists who disparage the choices of foragers in today's society."
        },
        {
          "id": "D",
          "text": "failure to supplement its thesis with robust empirical data."
        }
      ],
      "solution_text": "The passage states: \"While acknowledging the violence of colonialism, racism, and dispossession, it does not thematize them as heavily as we might today.\""
    },
    {
      "client_question_id": "cat-2023-slot-1_Q17",
      "set_ref": "VARC_VA_17",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 17,
      "question_type": "MCQ",
      "taxonomy_type": "va_placement",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Completion",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Look at the paragraph and decide where (option 1, 2, 3, or 4\\) the following sentence would best fit.\nSentence: The discovery helps to explain archeological similarities between the Paleolithic peoples of China, Japan, and the Americas.\nParagraph: The researchers also uncovered an unexpected genetic link between Native Americans and Japanese people.\n_ (1) _ During the deglaciation period, another group branched out from northern coastal China and travelled to Japan.\n_ (2) _ . \"We were surprised to find that this ancestral source also contributed to the Japanese gene pool, especially the indigenous Ainus,\" says Li.\n_ (3) _ . They shared similarities in how they crafted stemmed projectile points for arrowheads and spears.\n_ (4) _ . \"This suggests that the Pleistocene connection among the Americas, China, and Japan was not confined to culture but also to genetics,\" says senior author Qing-Peng Kong, an evolutionary geneticist at the Chinese Academy of Sciences.",
      "options": [
        {
          "id": "A",
          "text": "Option 2"
        },
        {
          "id": "B",
          "text": "Option 3"
        },
        {
          "id": "C",
          "text": "Option 1"
        },
        {
          "id": "D",
          "text": "Option 4"
        }
      ],
      "solution_text": "The sentence mentions \"archeological similarities\". The sentence following (3) describes specific similarities (\"crafted stemmed projectile points\"). Thus, the sentence fits best at (3), introducing the similarities detailed next."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q18",
      "set_ref": "VARC_VA_18",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 18,
      "question_type": "MCQ",
      "taxonomy_type": "va_placement",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Completion",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Look at the paragraph and decide where (option 1, 2, 3, or 4\\) the following sentence would best fit.\nSentence: This philosophical cut at one's core beliefs, values, and way of life is difficult enough.\nParagraph: The experience of reading philosophy is often disquieting.\nWhen reading philosophy, the values around which one has heretofore organised one's life may come to look provincial, flatly wrong, or even evil.\n_ (1) _ When beliefs previously held as truths are rendered implausible, new beliefs, values, and ways of living may be required.\n_ (2) _ What's worse, philosophers admonish each other to remain unsutured until such time as a defensible new answer is revealed or constructed.\nSometimes, philosophical writing is even strictly critical in that it does not even attempt to provide an alternative after tearing down a cultural or conceptual citadel.\n_ (3) _ The reader of philosophy must be prepared for the possibility of this experience.\nWhile reading philosophy can help one clarify one's values, and even make one self-conscious for the first time of the fact that there are good reasons for believing what one believes, it can also generate unremediated doubt that is difficult to live with.\n_ (4) _",
      "options": [
        {
          "id": "A",
          "text": "Option 1"
        },
        {
          "id": "B",
          "text": "Option 4"
        },
        {
          "id": "C",
          "text": "Option 3"
        },
        {
          "id": "D",
          "text": "Option 2"
        }
      ],
      "solution_text": "The sentence mentions \"This philosophical cut... is difficult enough.\" The sentence following (2) starts with \"What's worse...\", suggesting an escalation from the \"difficult enough\" situation mentioned in the inserted sentence."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q19",
      "set_ref": "VARC_VA_19",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 19,
      "question_type": "TITA",
      "taxonomy_type": "va_odd_one",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles",
      "difficulty": "medium",
      "correct_answer": "2",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Five jumbled up sentences (labelled 1, 2, 3, 4 and 5), related to a topic, are given below. Four of them can be put together to form a coherent paragraph. Identify the odd sentence and key in the number of that sentence as your answer.\n1\\. Having an appreciation for the workings of another person's mind is considered a prerequisite for natural language acquisition, strategic social interaction, reflexive thought, and moral judgment.\n2\\. It is a 'theory of mind' though some scholars prefer to call it 'mentalizing' or 'mindreading', which is important for the development of one's cognitive abilities.\n3\\. Though we must speculate about its evolutionary origin, we do have indications that the capacity evolved sometime in the last few million years.\n4\\. This capacity develops from early beginnings in the first year of life to the adult's fast and often effortless understanding of others' thoughts, feelings, and intentions.\n5\\. One of the most fascinating human capacities is the ability to perceive and interpret other people's behaviour in terms of their mental states.",
      "solution_text": "Sentences 1, 3, 4, and 5 discuss the capacity to understand other minds (Theory of Mind), its importance, origin, and development. Sentence 2 defines the term but its structure (\"It is a 'theory of mind'...\") feels disconnected or repetitive in a specific way that doesn't fit the flow of 5-1-4-3 (Introduction of capacity \\-> Importance \\-> Development \\-> Evolution). Sentence 2 is often the odd one in such sets if it redundantly defines what is already being discussed descriptively. (Official answer is 2)."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q20",
      "set_ref": "VARC_VA_20",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 20,
      "question_type": "TITA",
      "taxonomy_type": "va_odd_one",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles",
      "difficulty": "medium",
      "correct_answer": "3",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Five jumbled up sentences (labelled 1, 2, 3, 4 and 5), related to a topic, are given below. Four of them can be put together to form a coherent paragraph. Identify the odd sentence and key in the number of that sentence as your answer.\n1\\. In English, there is no systematic rule for the naming of numbers;\n2\\. after ten, we have \"eleven\" and \"twelve\" and then the teens: \"thirteen\", \"fourteen\", \"fifteen\" and so on.\n3\\. Even more confusingly, some English words invert the numbers they refer to: the word \"fourteen\" puts the four first, even though it appears last.\n4\\. It can take children a while to learn all these words, and understand that \"fourteen\" is different from \"forty\".\n5\\. For multiples of 10, English speakers switch to a different pattern: \"twenty\", \"thirty\", \"forty\" and so on.\n6\\. If you didn't know the word for \"eleven\", you would be unable to just guess it \\- you might come up with something like \"one-teen\".",
      "solution_text": "Note: Source contained 5 sentences. The logic connects 1, 2, 5, 6 regarding the lack of rules/patterns. Sentence 3 is about inversion (\"fourteen\") which is a specific detail about one number type, while the others discuss the broader system inconsistencies (10s, 11/12, multiples). The official key is 3\\."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q21",
      "set_ref": "VARC_VA_21",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 21,
      "question_type": "TITA",
      "taxonomy_type": "va_jumble",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles",
      "difficulty": "medium",
      "correct_answer": "4123",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The four sentences (labelled 1, 2, 3 and 4\\) given below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer.\n1\\. What precisely are the \"unusual elements\" that make a particular case so attractive to a certain kind of audience?\n2\\. It might be a particularly savage or unfathomable level of depravity, very often it has something to do with the precise amount of mystery involved.\n3\\. Unsolved, and perhaps unsolvable cases offer something that \"ordinary\" murder doesn't.\n4\\. Why are some crimes destined for perpetual re-examination and others locked into permanent obscurity?",
      "solution_text": "4 poses the main question (Why some crimes?). 1 follows up asking what makes them attractive. 2 answers \"It might be...\". 3 concludes or expands on the mystery aspect. Sequence: 4-1-2-3."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q22",
      "set_ref": "VARC_VA_22",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 22,
      "question_type": "TITA",
      "taxonomy_type": "va_jumble",
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles",
      "difficulty": "medium",
      "correct_answer": "4123",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The four sentences (labelled 1, 2, 3 and 4\\) given below, when properly sequenced, would yield a coherent paragraph. Decide on the proper sequencing of the order of the sentences and key in the sequence of the four numbers as your answer.\n1\\. Algorithms hosted on the internet are accessed by many, so biases in AI models have resulted in much larger impact, adversely affecting far larger groups of people.\n2\\. Though \"algorithmic bias\" is the popular term, the foundation of such bias is not in algorithms, but in the data;\n3\\. algorithms are not biased, data is, as algorithms merely reflect persistent patterns that are present in the training data.\n4\\. The impact of biased decisions made by humans is localised and geographically confined, but with the advent of AI, the impact of such decisions is spread over a much wider scale.",
      "solution_text": "4 introduces the scale of impact (human vs AI). 1 expands on this \"larger impact\" due to internet hosting. 2 and 3 discuss the nature of the bias itself (data vs algo), usually coming after the context of impact is set, or 2-3 is a pair explaining the \"bias\" mentioned in 1\\. However, 4-1-2-3 is the official key."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q23",
      "set_ref": "VARC_VA_23",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 23,
      "question_type": "MCQ",
      "taxonomy_type": "va_summary",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Summary",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage given below is followed by four alternate summaries. Choose the option that best captures the essence of the passage.\nManipulating information was a feature of history long before modern journalism established rules of integrity. A record dates back to ancient Rome, when Antony met Cleopatra and his political enemy Octavian launched a smear campaign against him with \"short, sharp slogans written upon coins.\" The perpetrator became the first Roman Emperor and \"fake news had allowed Octavian to hack the republican system once and for all\". But the 21st century has seen the weaponization of information on an unprecedented scale. Powerful new technology makes the fabrication of content simple, and social networks amplify falsehoods peddled by States, populist politicians, and dishonest corporate entities. The platforms have become fertile ground for computational propaganda, 'trolling' and 'troll armies'.",
      "options": [
        {
          "id": "A",
          "text": "Disinformation, which is mediated by technology today, is not new and has existed since ancient times."
        },
        {
          "id": "B",
          "text": "People need to become critical of what they read, since historically, weaponization of information has led to corruption."
        },
        {
          "id": "C",
          "text": "Use of misinformation for attaining power, a practice that is as old as the Octavian era, is currently fueled by technology."
        },
        {
          "id": "D",
          "text": "Octavian used fake news to manipulate people and attain power and influence, just as people do today."
        }
      ],
      "solution_text": "The passage connects ancient manipulation (Octavian) with modern weaponization fueled by technology. Option C captures both the historical precedent and the modern fueling by technology."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q24",
      "set_ref": "VARC_VA_24",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 24,
      "question_type": "MCQ",
      "taxonomy_type": "va_summary",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Summary",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The passage given below is followed by four alternate summaries. Choose the option that best captures the essence of the passage.\nColonialism is not a modern phenomenon. World history is full of examples of one society gradually expanding by incorporating adjacent territory and settling its people on newly conquered territory. In the sixteenth century, colonialism changed decisively because of technological developments in navigation that began to connect more remote parts of the world. The modern European colonial project emerged when it became possible to move large numbers of people across the ocean and to maintain political control in spite of geographical dispersion. The term colonialism is used to describe the process of European settlement, violent dispossession and political domination over the rest of the world, including the Americas, Australia, and parts of Africa and Asia.",
      "options": [
        {
          "id": "A",
          "text": "As a result of developments in navigation technology, European colonialism led to the displacement of indigenous populations and global political changes in the 16th century."
        },
        {
          "id": "B",
          "text": "Colonialism, conceptualized in the 16th century, allowed colonizers to expand their territories, establish settlements, and exercise political power."
        },
        {
          "id": "C",
          "text": "Technological advancements in navigation in the 16th century, transformed colonialism, enabling Europeans to establish settlements and exert political dominance over distant regions."
        },
        {
          "id": "D",
          "text": "Colonialism surged in the 16th century due to advancements in navigation, enabling British settlements abroad and global dominance."
        }
      ],
      "solution_text": "The passage highlights how navigation technology \\*transformed\\* colonialism (which wasn't new) into the modern European project of distant settlement/dominance. Option C captures this transformation and the specific role of technology and European dominance."
    },
    {
      "client_question_id": "cat-2023-slot-1_Q25",
      "set_ref": "DILR_SET_1",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 25,
      "question_type": "TITA",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Scheduling",
      "difficulty": "medium",
      "correct_answer": "0",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many UK applications were scheduled on that day?",
      "solution_text": "\\[cite_start\\]The calculations based on the slot distribution and counter constraints reveal that 0 UK applications were scheduled. \\[cite: 323\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q26",
      "set_ref": "DILR_SET_1",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 26,
      "question_type": "TITA",
      "taxonomy_type": "di_calculation",
      "topic": "Data Interpretation",
      "subtopic": "Scheduling",
      "difficulty": "hard",
      "correct_answer": "200",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What is the maximum possible value of the total time (in minutes, nearest to its integer value) required to process all applications in the Others category on that day?",
      "solution_text": "\\[cite_start\\]Based on the optimization of processing times within the given slots, the maximum total time is 200 minutes. \\[cite: 325\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q27",
      "set_ref": "DILR_SET_1",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 27,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Scheduling",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following is the closest to the time when Nandini's application process got over?",
      "options": [
        {
          "id": "A",
          "text": "9:50 am"
        },
        {
          "id": "B",
          "text": "9:37 am"
        },
        {
          "id": "C",
          "text": "9:35 am"
        },
        {
          "id": "D",
          "text": "9:45 am"
        }
      ],
      "solution_text": "\\[cite_start\\]Nandini's application process finished closest to 9:45 am. \\[cite: 331\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q28",
      "set_ref": "DILR_SET_1",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 28,
      "question_type": "MCQ",
      "taxonomy_type": "di_reasoning",
      "topic": "Data Interpretation",
      "subtopic": "Scheduling",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following statements is false?",
      "options": [
        {
          "id": "A",
          "text": "The application process of Osman was completed before 9:45 am."
        },
        {
          "id": "B",
          "text": "The application process of Mahira started after Nandini's."
        },
        {
          "id": "C",
          "text": "The application process of Osman was completed before Vijay's."
        },
        {
          "id": "D",
          "text": "The application process of Mahira was completed before Nandini's."
        }
      ],
      "solution_text": "\\[cite_start\\]Statement B is false. \\[cite: 337\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q29",
      "set_ref": "DILR_SET_1",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 29,
      "question_type": "MCQ",
      "taxonomy_type": "di_calculation",
      "topic": "Data Interpretation",
      "subtopic": "Scheduling",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "When did the application processing for all US applicants get over on that day?",
      "options": [
        {
          "id": "A",
          "text": "2:05 pm"
        },
        {
          "id": "B",
          "text": "2:25 pm"
        },
        {
          "id": "C",
          "text": "2:00 pm"
        },
        {
          "id": "D",
          "text": "3:40 pm"
        }
      ],
      "solution_text": "\\[cite_start\\]The processing for all US applicants ended at 2:05 pm. \\[cite: 343\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q30",
      "set_ref": "DILR_SET_2",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 30,
      "question_type": "TITA",
      "taxonomy_type": "lr_constraint",
      "topic": "Logical Reasoning",
      "subtopic": "Spatial Reasoning",
      "difficulty": "medium",
      "correct_answer": "3",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many houses are vacant in Block XX?",
      "solution_text": "\\[cite_start\\]Logic deduction determines 3 houses are vacant in Block XX. \\[cite: 371\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q31",
      "set_ref": "DILR_SET_2",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 31,
      "question_type": "MCQ",
      "taxonomy_type": "lr_constraint",
      "topic": "Logical Reasoning",
      "subtopic": "Spatial Reasoning",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following houses is definitely occupied?",
      "options": [
        {
          "id": "A",
          "text": "A1"
        },
        {
          "id": "B",
          "text": "D2"
        },
        {
          "id": "C",
          "text": "B1"
        },
        {
          "id": "D",
          "text": "F2"
        }
      ],
      "solution_text": "\\[cite_start\\]House B1 is definitely occupied. \\[cite: 377\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q32",
      "set_ref": "DILR_SET_2",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 32,
      "question_type": "MCQ",
      "taxonomy_type": "lr_constraint",
      "topic": "Logical Reasoning",
      "subtopic": "Spatial Reasoning",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following options best describes the number of vacant houses in Row-2?",
      "options": [
        {
          "id": "A",
          "text": "Exactly 3"
        },
        {
          "id": "B",
          "text": "Either 3 or 4"
        },
        {
          "id": "C",
          "text": "Exactly 2"
        },
        {
          "id": "D",
          "text": "Either 2 or 3"
        }
      ],
      "solution_text": "\\[cite_start\\]The number of vacant houses in Row-2 is either 2 or 3\\. \\[cite: 383\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q33",
      "set_ref": "DILR_SET_2",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 33,
      "question_type": "TITA",
      "taxonomy_type": "lr_calculation",
      "topic": "Logical Reasoning",
      "subtopic": "Spatial Reasoning",
      "difficulty": "hard",
      "correct_answer": "21",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What is the maximum possible quoted price (in lakhs of Rs.) for a vacant house in Column-E?",
      "solution_text": "\\[cite_start\\]The maximum quoted price is 21 lakhs. \\[cite: 385\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q34",
      "set_ref": "DILR_SET_2",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 34,
      "question_type": "MCQ",
      "taxonomy_type": "lr_constraint",
      "topic": "Logical Reasoning",
      "subtopic": "Spatial Reasoning",
      "difficulty": "medium",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which house in Block YY has parking space?",
      "options": [
        {
          "id": "A",
          "text": "E1"
        },
        {
          "id": "B",
          "text": "F2"
        },
        {
          "id": "C",
          "text": "E2"
        },
        {
          "id": "D",
          "text": "F1"
        }
      ],
      "solution_text": "\\[cite_start\\]House E1 has the parking space. \\[cite: 391\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q35",
      "set_ref": "DILR_SET_3",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 35,
      "question_type": "TITA",
      "taxonomy_type": "lr_puzzle",
      "topic": "Logical Reasoning",
      "subtopic": "Statistics",
      "difficulty": "medium",
      "correct_answer": "0",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "How many individual ratings cannot be determined from the above information?",
      "solution_text": "\\[cite_start\\]All ratings can be determined, so 0\\. \\[cite: 403\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q36",
      "set_ref": "DILR_SET_3",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 36,
      "question_type": "TITA",
      "taxonomy_type": "lr_puzzle",
      "topic": "Logical Reasoning",
      "subtopic": "Statistics",
      "difficulty": "medium",
      "correct_answer": "0",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "To how many workers did R2 give a rating of 4?",
      "solution_text": "\\[cite_start\\]R2 gave a rating of 4 to 0 workers. \\[cite: 405\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q37",
      "set_ref": "DILR_SET_3",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 37,
      "question_type": "TITA",
      "taxonomy_type": "lr_puzzle",
      "topic": "Logical Reasoning",
      "subtopic": "Statistics",
      "difficulty": "medium",
      "correct_answer": "3",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What rating did R1 give to Xavier?",
      "solution_text": "\\[cite_start\\]R1 gave Xavier a rating of 3\\. \\[cite: 407\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q38",
      "set_ref": "DILR_SET_3",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 38,
      "question_type": "TITA",
      "taxonomy_type": "lr_puzzle",
      "topic": "Logical Reasoning",
      "subtopic": "Statistics",
      "difficulty": "medium",
      "correct_answer": "4",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "What is the median of the ratings given by R3 to the five workers?",
      "solution_text": "\\[cite_start\\]The median rating given by R3 is 4\\. \\[cite: 409\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q39",
      "set_ref": "DILR_SET_3",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 39,
      "question_type": "MCQ",
      "taxonomy_type": "lr_puzzle",
      "topic": "Logical Reasoning",
      "subtopic": "Statistics",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which among the following restaurants gave its median rating to exactly one of the workers?",
      "options": [
        {
          "id": "A",
          "text": "R2"
        },
        {
          "id": "B",
          "text": "R5"
        },
        {
          "id": "C",
          "text": "R4"
        },
        {
          "id": "D",
          "text": "R3"
        }
      ],
      "solution_text": "\\[cite_start\\]Restaurant R4 gave its median rating to exactly one worker. \\[cite: 415\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q40",
      "set_ref": "DILR_SET_4",
      "sequence_order": 1,
      "section": "DILR",
      "question_number": 40,
      "question_type": "MCQ",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Set Theory",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which two candidates can belong to the same department?",
      "options": [
        {
          "id": "A",
          "text": "Prof. Pakrasi and Prof. Qureshi"
        },
        {
          "id": "B",
          "text": "Prof. Pakrasi and Prof. Samuel"
        },
        {
          "id": "C",
          "text": "Prof. Qureshi and Prof. Ramaswamy"
        },
        {
          "id": "D",
          "text": "Prof. Ramaswamy and Prof. Samuel"
        }
      ],
      "solution_text": "\\[cite_start\\]Pakrasi and Qureshi can belong to the same department. \\[cite: 442\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q41",
      "set_ref": "DILR_SET_4",
      "sequence_order": 2,
      "section": "DILR",
      "question_number": 41,
      "question_type": "MCQ",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Set Theory",
      "difficulty": "hard",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following can be the number of votes that Prof. Qureshi received from a single department?",
      "options": [
        {
          "id": "A",
          "text": "7"
        },
        {
          "id": "B",
          "text": "6"
        },
        {
          "id": "C",
          "text": "8"
        },
        {
          "id": "D",
          "text": "9"
        }
      ],
      "solution_text": "\\[cite_start\\]Qureshi could have received 9 votes from a single department. \\[cite: 448\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q42",
      "set_ref": "DILR_SET_4",
      "sequence_order": 3,
      "section": "DILR",
      "question_number": 42,
      "question_type": "MCQ",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Set Theory",
      "difficulty": "hard",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If Prof. Samuel belongs to B\\&H, which of the following statements is/are true?\nStatement A: Prof. Pakrasi belongs to M\\&S.\nStatement B: Prof. Ramaswamy belongs to O\\&Q.",
      "options": [
        {
          "id": "A",
          "text": "Neither statement A nor statement B"
        },
        {
          "id": "B",
          "text": "Only statement B"
        },
        {
          "id": "C",
          "text": "Only statement A"
        },
        {
          "id": "D",
          "text": "Both statements A and B"
        }
      ],
      "solution_text": "\\[cite_start\\]Both statements A and B are true. \\[cite: 456\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q43",
      "set_ref": "DILR_SET_4",
      "sequence_order": 4,
      "section": "DILR",
      "question_number": 43,
      "question_type": "MCQ",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Set Theory",
      "difficulty": "hard",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "What best can be concluded about the candidate from O\\&Q?",
      "options": [
        {
          "id": "A",
          "text": "It was Prof. Samuel."
        },
        {
          "id": "B",
          "text": "It was either Prof. Ramaswamy or Prof. Samuel."
        },
        {
          "id": "C",
          "text": "It was Prof. Ramaswamy."
        },
        {
          "id": "D",
          "text": "It was either Prof. Pakrasi or Prof. Qureshi."
        }
      ],
      "solution_text": "\\[cite_start\\]The candidate from O\\&Q was either Prof. Ramaswamy or Prof. Samuel. \\[cite: 462\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q44",
      "set_ref": "DILR_SET_4",
      "sequence_order": 5,
      "section": "DILR",
      "question_number": 44,
      "question_type": "MCQ",
      "taxonomy_type": "lr_logic",
      "topic": "Logical Reasoning",
      "subtopic": "Set Theory",
      "difficulty": "hard",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Which of the following statements is/are true?\nStatement A: Non-candidates from M\\&S voted for Prof. Qureshi.\nStatement B: Non-candidates from F\\&A voted for Prof. Qureshi.",
      "options": [
        {
          "id": "A",
          "text": "Both statements A and B"
        },
        {
          "id": "B",
          "text": "Only statement B"
        },
        {
          "id": "C",
          "text": "Only statement A"
        },
        {
          "id": "D",
          "text": "Neither statement A nor statement B"
        }
      ],
      "solution_text": "\\[cite_start\\]Only statement B is true. \\[cite: 470\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q45",
      "set_ref": "QA_ATOMIC_45",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 45,
      "question_type": "MCQ",
      "taxonomy_type": "qa_number_theory",
      "topic": "Quant",
      "subtopic": "Number Systems",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Let $n$ be the least positive integer such that 168 is a factor of $1134^n$. If $m$ is the least positive integer such that $1134^n$ is a factor of $168^m$, then $m+n$ equals:",
      "options": [
        {
          "id": "A",
          "text": "9"
        },
        {
          "id": "B",
          "text": "15"
        },
        {
          "id": "C",
          "text": "12"
        },
        {
          "id": "D",
          "text": "24"
        }
      ],
      "solution_text": "Prime factorization: $168 \\= 2^3 \\\\times 3 \\\\times 7$ and $1134 \\= 2 \\\\times 3^4 \\\\times 7$. Solving for minimal $n$ and $m$ yields $n=3$ and $m=12$. \\[cite_start\\]Thus $m+n \\= 15$. \\[cite: 473, 474\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q46",
      "set_ref": "QA_ATOMIC_46",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 46,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Logarithms",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If $x$ and $y$ are positive real numbers such that $\\\\log_x(x^2 + 12\\) \\= 4$ and $3 \\\\log_y x \\= 1$, then $x + y$ equals:",
      "options": [
        {
          "id": "A",
          "text": "20"
        },
        {
          "id": "B",
          "text": "68"
        },
        {
          "id": "C",
          "text": "10"
        },
        {
          "id": "D",
          "text": "11"
        }
      ],
      "solution_text": "From $\\\\log_x(x^2 + 12\\) \\= 4$, we get $x^4 \\- x^2 \\- 12 \\= 0$, giving $x^2 \\= 4 \\\\implies x=2$ (since positive). From $3 \\\\log_y x \\= 1$, we substitute $x=2$ to find $y \\= 8$. \\[cite_start\\]Thus $x+y=10$. \\[cite: 481\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q47",
      "set_ref": "QA_ATOMIC_47",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 47,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Surds",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If $\\\\sqrt{5x+9} + \\\\sqrt{5x-9} \\= 3(2+\\\\sqrt{2})$, then $\\\\sqrt{10x+9}$ is equal to:",
      "options": [
        {
          "id": "A",
          "text": "$3\\\\sqrt{31}$"
        },
        {
          "id": "B",
          "text": "$4\\\\sqrt{5}$"
        },
        {
          "id": "C",
          "text": "$3\\\\sqrt{7}$"
        },
        {
          "id": "D",
          "text": "$2\\\\sqrt{7}$"
        }
      ],
      "solution_text": "By squaring or observing the structure, solving for $x$ allows substitution into $\\\\sqrt{10x+9}$. \\[cite_start\\]The value simplifies to $3\\\\sqrt{7}$. \\[cite: 488\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q48",
      "set_ref": "QA_ATOMIC_48",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 48,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Algebraic Identities",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "If $x$ and $y$ are real numbers such that $x^2 + (x \\- 2y \\- 1)^2 \\= \\-4y(x + y)$, then the value $x \\- 2y$ is:",
      "options": [
        {
          "id": "A",
          "text": "0"
        },
        {
          "id": "B",
          "text": "1"
        },
        {
          "id": "C",
          "text": "\\-1"
        },
        {
          "id": "D",
          "text": "2"
        }
      ],
      "solution_text": "Rearranging the equation reveals perfect squares sum to zero or a specific value. \\[cite_start\\]Solving for $x$ and $y$ yields $x-2y \\= 1$. \\[cite: 495\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q49",
      "set_ref": "QA_ATOMIC_49",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 49,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Modulus",
      "difficulty": "medium",
      "correct_answer": "3",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The number of integer solutions of equation $2|x|(x^{2}+1)=5x^{2}$ is:",
      "solution_text": "Case 1 ($x>0$): $2x(x^2+1)=5x^2 \\\\implies 2x^2 \\- 5x + 2 \\= 0 \\\\implies x=2$ (integer). Case 2 ($x\\<0$): $-2x(x^2+1)=5x^2 \\\\implies 2x^2 + 5x + 2 \\= 0 \\\\implies x=-2$ (integer). Case 3 ($x=0$): solution exists. \\[cite_start\\]Total 3 integer solutions. \\[cite: 502\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q50",
      "set_ref": "QA_ATOMIC_50",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 50,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Polynomials",
      "difficulty": "hard",
      "correct_answer": "2",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The equation $x^{3}+(2r+1)x^{2}+(4r-1)x+2=0$ has \\-2 as one of the roots. If the other two roots are real, then the minimum possible non-negative integer value of $r$ is:",
      "solution_text": "Substitute $x=-2$ to find the relationship, then use the discriminant condition $D \\\\ge 0$ for the remaining quadratic factor to find the range of $r$. \\[cite_start\\]Minimum non-negative integer is 2\\. \\[cite: 505, 506\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q51",
      "set_ref": "QA_ATOMIC_51",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 51,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Quadratic Equations",
      "difficulty": "medium",
      "correct_answer": "6",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Let $\\\\alpha$ and $\\\\beta$ be the two distinct roots of the equation $2x^{2}-6x+k=0$ such that $(\\\\alpha+\\\\beta)$ and $\\\\alpha\\\\beta$ are the distinct roots of the equation $x^{2}+px+p=0$. Then, the value of $8(k-p)$ is:",
      "solution_text": "From the first eq, $\\\\alpha+\\\\beta=3$ and $\\\\alpha\\\\beta=k/2$. These are roots of the second eq. Sum of roots $3 + k/2 \\= \\-p$ and product $3(k/2) \\= p$. \\[cite_start\\]Solving this system gives $k$ and $p$. \\[cite: 509\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q52",
      "set_ref": "QA_ATOMIC_52",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 52,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Mixtures",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "A mixture P is formed by removing a certain amount of coffee from a coffee jar and replacing the same amount with cocoa powder. The same amount is again removed from mixture P and replaced with same amount of cocoa powder to form a new mixture Q. If the ratio of coffee and cocoa in the mixture Q is 16:9, then the ratio of cocoa in mixture P to that in mixture Q is:",
      "options": [
        {
          "id": "A",
          "text": "1:3"
        },
        {
          "id": "B",
          "text": "1:2"
        },
        {
          "id": "C",
          "text": "5:9"
        },
        {
          "id": "D",
          "text": "4:9"
        }
      ],
      "solution_text": "Using the removal/replacement formula: Coffee fraction in Q is $16/25 \\= (1 \\- x/V)^2$. Thus removal fraction is $1/5$. \\[cite_start\\]Calculate coffee/cocoa in P and Q to find the ratio of cocoa components. \\[cite: 513, 514\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q53",
      "set_ref": "QA_ATOMIC_53",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 53,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Clocks",
      "difficulty": "medium",
      "correct_answer": "D",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The minor angle between the hours hand and minutes hand of a clock was observed at 8:48 am. The minimum duration, in minutes, after 8:48 am when this angle increases by 50% is:",
      "options": [
        {
          "id": "A",
          "text": "$36/11$"
        },
        {
          "id": "B",
          "text": "2"
        },
        {
          "id": "C",
          "text": "4"
        },
        {
          "id": "D",
          "text": "$24/11$"
        }
      ],
      "solution_text": "Calculate initial angle at 8:48. Increase it by 50%. \\[cite_start\\]Use relative speed of hands ($11/2$ degrees per min) to find time required to reach the new separation. \\[cite: 521, 522\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q54",
      "set_ref": "QA_ATOMIC_54",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 54,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Profit and Loss",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Gita sells two objects A and B at the same price such that she makes a profit of 20% on object A and a loss of 10% on object B. If she increases the selling price such that objects A and B are still sold at an equal price and a profit of 10% is made on object B, then the profit made on object A will be nearest to:",
      "options": [
        {
          "id": "A",
          "text": "42%"
        },
        {
          "id": "B",
          "text": "45%"
        },
        {
          "id": "C",
          "text": "47%"
        },
        {
          "id": "D",
          "text": "49%"
        }
      ],
      "solution_text": "Use ratios of CP and SP. Initial SP is same. \\[cite_start\\]New SP is defined by 10% profit on B. Calculate new profit on A given its fixed CP. \\[cite: 529\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q55",
      "set_ref": "QA_ATOMIC_55",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 55,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Time Speed Distance",
      "difficulty": "hard",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Brishti went on an 8-hour trip in a car. Before the trip, the car had travelled a total of $x$ km till then, where $x$ is a whole number and is palindromic. At the end of the trip, the car had travelled a total of 26862 km till then, this number again being palindromic. If Brishti never drove at more than $110\\~km/h$, then the greatest possible average speed at which she drove during the trip, in $km/h$, was:",
      "options": [
        {
          "id": "A",
          "text": "110"
        },
        {
          "id": "B",
          "text": "90"
        },
        {
          "id": "C",
          "text": "100"
        },
        {
          "id": "D",
          "text": "80"
        }
      ],
      "solution_text": "Max distance possible \\= $8 \\\\times 110 \\= 880$ km. Initial reading $x$ must be a palindrome in range $\\[26862-880, 26862\\]$. \\[cite_start\\]Identify valid palindromes (e.g., 26062\\) and calculate average speed. \\[cite: 536, 537\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q56",
      "set_ref": "QA_ATOMIC_56",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 56,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Averages",
      "difficulty": "hard",
      "correct_answer": "A",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "In an examination, the average marks of 4 girls and 6 boys is 24\\. Each of the girls has the same marks while each of the boys has the same marks. If the marks of any girl is at most double the marks of any boy, but not less than the marks of any boy, then the number of possible distinct integer values of the total marks of 2 girls and 6 boys is:",
      "options": [
        {
          "id": "A",
          "text": "21"
        },
        {
          "id": "B",
          "text": "20"
        },
        {
          "id": "C",
          "text": "22"
        },
        {
          "id": "D",
          "text": "19"
        }
      ],
      "solution_text": "Total marks \\= 240\\. Let $g$ and $b$ be marks. $4g + 6b \\= 240$. Constraints: $b \\\\le g \\\\le 2b$. \\[cite_start\\]Find integer solutions for $(g, b)$ and calculate distinct values of $2g + 6b$. \\[cite: 545, 546\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q57",
      "set_ref": "QA_ATOMIC_57",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 57,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Ratios and Percentages",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The salaries of three friends Sita, Gita and Mita are initially in the ratio 5: 6: 7, respectively. In the first year, they get salary hikes of 20%, 25% and 20%, respectively. In the second year, Sita and Mita get salary hikes of 40% and 25%, respectively, and the salary of Gita becomes equal to the mean salary of the three friends. The salary hike of Gita in the second year is:",
      "options": [
        {
          "id": "A",
          "text": "25%"
        },
        {
          "id": "B",
          "text": "28%"
        },
        {
          "id": "C",
          "text": "26%"
        },
        {
          "id": "D",
          "text": "30%"
        }
      ],
      "solution_text": "Compute salaries after year 1 (6, 7.5, 8.4). Apply year 2 hikes to Sita and Mita. \\[cite_start\\]Calculate the mean, set equal to Gita's new salary, and find her hike percentage. \\[cite: 553, 555\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q58",
      "set_ref": "QA_ATOMIC_58",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 58,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Time Speed Distance",
      "difficulty": "medium",
      "correct_answer": "972",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Arvind travels from town A to town B, and Surbhi from town B to town A, both starting at the same time along the same route. After meeting each other, Arvind takes 6 hours to reach town B while Surbhi takes 24 hours to reach town A. If Arvind travelled at a speed of $54\\~km/h$, then the distance, in km, between town A and town B is:",
      "solution_text": "Use the formula for meeting time $t \\= \\\\sqrt{t_1 t_2} \\= \\\\sqrt{6 \\\\times 24} \\= 12$ hours. Total time for Arvind \\= $12+6 \\= 18$ hours. \\[cite_start\\]Distance \\= $Speed \\\\times Time \\= 54 \\\\times 18$. \\[cite: 563, 564\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q59",
      "set_ref": "QA_ATOMIC_59",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 59,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Interest",
      "difficulty": "medium",
      "correct_answer": "20808",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "Anil invests Rs. 22000 for 6 years in a certain scheme with 4% interest per annum, compounded half-yearly. Sunil invests in the same scheme for 5 years, and then reinvests the entire amount received at the end of 5 years for one year at 10% simple interest. If the amounts received by both at the end of 6 years are same, then the initial investment made by Sunil, in rupees, is:",
      "solution_text": "Equate the final amounts. Anil: $22000(1.02)^{12}$. Sunil: $P(1.02)^{10}(1.10)$. \\[cite_start\\]Solve for $P$. \\[cite: 567, 568\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q60",
      "set_ref": "QA_ATOMIC_60",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 60,
      "question_type": "TITA",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Time and Work",
      "difficulty": "hard",
      "correct_answer": "27",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "The amount of job that Amal, Sunil and Kamal can individually do in a day, are in harmonic progression. Kamal takes twice as much time as Amal to do the same amount of job. If Amal and Sunil work for 4 days and 9 days, respectively, Kamal needs to work for 16 days to finish the remaining job. Then the number of days Sunil will take to finish the job working alone, is:",
      "solution_text": "Let rates be $a, s, k$. $a, s, k$ in HP means $1/a, 1/s, 1/k$ in AP. Time relationship implies $k \\= a/2$. \\[cite_start\\]Use work equation $4a + 9s + 16k \\= Total Work$ to solve for $s$. \\[cite: 572, 574\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q61",
      "set_ref": "QA_ATOMIC_61",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 61,
      "question_type": "MCQ",
      "taxonomy_type": "qa_geometry",
      "topic": "Quant",
      "subtopic": "Coordinate Geometry",
      "difficulty": "hard",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "Let C be the circle $x^{2}+y^{2}+4x-6y-3=0$ and L be the locus of the point of intersection of a pair of tangents to C with the angle between the two tangents equal to $60^{\\\\circ}$. Then, the point at which L touches the line $x=6$ is:",
      "options": [
        {
          "id": "A",
          "text": "(6,6)"
        },
        {
          "id": "B",
          "text": "(6,3)"
        },
        {
          "id": "C",
          "text": "(6,8)"
        },
        {
          "id": "D",
          "text": "(6,4)"
        }
      ],
      "solution_text": "Center of C is $(-2, 3)$, radius $r=4$. Locus of point with $60^\\\\circ$ tangent angle is a concentric circle (director circle variation) with radius $R \\= r / \\\\sin(30^\\\\circ) \\= 8$. Locus equation: $(x+2)^2 + (y-3)^2 \\= 8^2$. \\[cite_start\\]Substitute $x=6$ to find $y$. \\[cite: 578\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q62",
      "set_ref": "QA_ATOMIC_62",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 62,
      "question_type": "MCQ",
      "taxonomy_type": "qa_geometry",
      "topic": "Quant",
      "subtopic": "Geometry",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "A quadrilateral ABCD is inscribed in a circle such that $AB:CD=2:1$ and $BC:AD=5:4$. If AC and BD intersect at the point E, then AE: CE equals:",
      "options": [
        {
          "id": "A",
          "text": "2:1"
        },
        {
          "id": "B",
          "text": "1:2"
        },
        {
          "id": "C",
          "text": "8:5"
        },
        {
          "id": "D",
          "text": "5:8"
        }
      ],
      "solution_text": "For cyclic quadrilateral, ratio of diagonals' segments is related to product of adjacent sides. $AE/CE \\= (AB \\\\cdot AD) / (CB \\\\cdot CD)$. \\[cite_start\\]Substitute given ratios. \\[cite: 586, 587\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q63",
      "set_ref": "QA_ATOMIC_63",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 63,
      "question_type": "TITA",
      "taxonomy_type": "qa_geometry",
      "topic": "Quant",
      "subtopic": "Geometry",
      "difficulty": "hard",
      "correct_answer": "2",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "In a right-angled triangle $\\\\triangle ABC$, the altitude AB is 5 cm, and the base BC is 12 cm. P and Q are two points on BC such that the areas of $\\\\triangle ABP$, $\\\\triangle ABQ$ and $\\\\triangle ABC$ are in arithmetic progression. If the area of $\\\\triangle ABC$ is 1.5 times the area of $\\\\triangle ABP$, the length of PQ, in cm, is:",
      "solution_text": "Area $\\\\triangle ABC \\= 0.5 \\\\times 5 \\\\times 12 \\= 30$. Area $\\\\triangle ABP \\= 30 / 1.5 \\= 20$. Since areas are in AP, find Area $\\\\triangle ABQ$ and deduce bases BP and BQ. \\[cite_start\\]$PQ \\= |BP \\- BQ|$. \\[cite: 594, 595\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q64",
      "set_ref": "QA_ATOMIC_64",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 64,
      "question_type": "MCQ",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Sequences",
      "difficulty": "medium",
      "correct_answer": "B",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "For some positive and distinct real numbers x , y and z, if $\\\\frac{1}{\\\\sqrt{x}+\\\\sqrt{y}}, \\\\frac{1}{\\\\sqrt{y}+\\\\sqrt{z}}, \\\\frac{1}{\\\\sqrt{z}+\\\\sqrt{x}}$ are in arithmetic progression, then the relationship which will always hold true, is:",
      "options": [
        {
          "id": "A",
          "text": "$\\\\sqrt{x}, \\\\sqrt{z}$ and $\\\\sqrt{y}$ are in arithmetic progression"
        },
        {
          "id": "B",
          "text": "y, x and z are in arithmetic progression"
        },
        {
          "id": "C",
          "text": "x, y and z are in arithmetic progression"
        },
        {
          "id": "D",
          "text": "$\\\\sqrt{x}, \\\\sqrt{y}$ and $\\\\sqrt{z}$ are in arithmetic progression"
        }
      ],
      "solution_text": "Rationalize the denominators and apply condition $2b \\= a+c$. \\[cite_start\\]Simplifying the terms leads to $x, y, z$ relationship. \\[cite: 599\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q65",
      "set_ref": "QA_ATOMIC_65",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 65,
      "question_type": "MCQ",
      "taxonomy_type": "qa_arithmetic",
      "topic": "Quant",
      "subtopic": "Permutations Combinations",
      "difficulty": "medium",
      "correct_answer": "C",
      "positive_marks": 3,
      "negative_marks": 1,
      "question_text": "The number of all natural numbers up to 1000 with non-repeating digits is:",
      "options": [
        {
          "id": "A",
          "text": "504"
        },
        {
          "id": "B",
          "text": "648"
        },
        {
          "id": "C",
          "text": "738"
        },
        {
          "id": "D",
          "text": "585"
        }
      ],
      "solution_text": "Calculate 1-digit (9), 2-digit ($9 \\\\times 9$), and 3-digit ($9 \\\\times 9 \\\\times 8$) numbers with distinct digits. \\[cite_start\\]Sum them up. \\[cite: 606\\]"
    },
    {
      "client_question_id": "cat-2023-slot-1_Q66",
      "set_ref": "QA_ATOMIC_66",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 66,
      "question_type": "TITA",
      "taxonomy_type": "qa_algebra",
      "topic": "Quant",
      "subtopic": "Sequences",
      "difficulty": "medium",
      "correct_answer": "19",
      "positive_marks": 3,
      "negative_marks": 0,
      "question_text": "A lab experiment measures the number of organisms at 8 am every day. Starting with 2 organisms on the first day, the number of organisms on any day is equal to 3 more than twice the number on the previous day. If the number of organisms on the nth day exceeds one million, then the lowest possible value of $n$ is:",
      "solution_text": "Recurrence: $a_n \\= 2a_{n-1} + 3$. General term is $a_n \\= 5(2^{n-1}) \\- 3$. \\[cite_start\\]Solve $5(2^{n-1}) \\- 3 > 1,000,000$. \\[cite: 614, 615\\]"
    }
  ]
}
````

## File: data_sanitized/CAT-2023-Slot-2-v3.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ schema_version: string, paper: object, question_sets: object, questions: object }",
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "CAT_2023_SLOT2",
    "title": "CAT 2023 Slot 2",
    "slug": "cat-2023-slot-2",
    "description": "Converted from PDF to structured markdown",
    "year": 2023,
    "total_questions": 66,
    "total_marks": 198,
    "duration_minutes": 120,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ],
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "cat-level",
    "is_free": true,
    "published": false,
    "allow_pause": true,
    "attempt_limit": 0
  },
  "question_sets": [
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_01",
      "set_type": "VARC",
      "display_order": 1,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_02",
      "set_type": "VARC",
      "display_order": 2,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_03",
      "set_type": "VARC",
      "display_order": 3,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_04",
      "set_type": "VARC",
      "display_order": 4,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SA_01",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SA_02",
      "set_type": "ATOMIC",
      "display_order": 6,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SA_03",
      "set_type": "ATOMIC",
      "display_order": 7,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SA_04",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SA_05",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SA_06",
      "set_type": "ATOMIC",
      "display_order": 10,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SA_07",
      "set_type": "ATOMIC",
      "display_order": 11,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_SET_01",
      "set_type": "DILR",
      "display_order": 1,
      "content_layout": "single_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_SET_02",
      "set_type": "DILR",
      "display_order": 2,
      "content_layout": "single_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_SET_03",
      "set_type": "DILR",
      "display_order": 3,
      "content_layout": "single_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_SET_04",
      "set_type": "DILR",
      "display_order": 4,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_01",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_02",
      "set_type": "ATOMIC",
      "display_order": 2,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_03",
      "set_type": "ATOMIC",
      "display_order": 3,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_04",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_05",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_06",
      "set_type": "ATOMIC",
      "display_order": 6,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_07",
      "set_type": "ATOMIC",
      "display_order": 7,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_08",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_09",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_10",
      "set_type": "ATOMIC",
      "display_order": 10,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_11",
      "set_type": "ATOMIC",
      "display_order": 11,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_12",
      "set_type": "ATOMIC",
      "display_order": 12,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_13",
      "set_type": "ATOMIC",
      "display_order": 13,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_14",
      "set_type": "ATOMIC",
      "display_order": 14,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_15",
      "set_type": "ATOMIC",
      "display_order": 15,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_16",
      "set_type": "ATOMIC",
      "display_order": 16,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_17",
      "set_type": "ATOMIC",
      "display_order": 17,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_18",
      "set_type": "ATOMIC",
      "display_order": 18,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_19",
      "set_type": "ATOMIC",
      "display_order": 19,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_20",
      "set_type": "ATOMIC",
      "display_order": 20,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_21",
      "set_type": "ATOMIC",
      "display_order": 21,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_22",
      "set_type": "ATOMIC",
      "display_order": 22,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    }
  ],
  "questions": [
    {
      "set_ref": "VARC_RC_01",
      "section": "VARC",
      "client_question_id": "VARC_RC_01_Q1",
      "question_number": 1,
      "sequence_order": 1,
      "question_type": "MCQ",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "options": [
        "Archaeology helps historians to locate the oldest civilisations in history.",
        "Archaeology helps historians to ascertain factual accuracy.",
        "Archaeology helps historians to carry out their primary duty.",
        "Archaeology helps historians to interpret historical facts."
      ],
      "correct_answer": "<ANSWER_OMITTED>",
      "topic": "Reading Comprehension",
      "subtopic": "Inference",
      "difficulty": "medium",
      "difficulty_rationale": "Requires identifying the role of auxiliary sciences as described in the passage.",
      "solution_text": "<SOLUTION_TEXT_OMITTED>",
      "positive_marks": 3,
      "negative_marks": 1
    },
    {
      "_NOTE": "... 65 more items omitted (total: 66) ..."
    }
  ]
}
````

## File: data_sanitized/cat-2024-mock-1-full.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ paper: object, contexts: object, questions: object }",
  "paper": {
    "slug": "cat-2024-slot-1",
    "title": "CAT 2024 Slot 1",
    "description": "CAT 2024 Slot 1 actual exam with 66 questions across VARC, DILR, and QA sections.",
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
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "cat-level",
    "is_free": true,
    "published": true,
    "available_from": null,
    "available_until": null
  },
  "contexts": [
    {
      "id": "varc-passage-1",
      "title": "Bandicoots",
      "section": "VARC",
      "text": "<TEXT_OMITTED>"
    },
    {
      "_NOTE": "... 13 more items omitted (total: 14) ..."
    }
  ],
  "questions": [
    {
      "section": "DILR",
      "question_number": 1,
      "context_id": "<CONTEXT_ID_OMITTED>",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "question_type": "TITA",
      "options": null,
      "correct_answer": "<ANSWER_OMITTED>",
      "positive_marks": 3,
      "negative_marks": 0,
      "difficulty": "medium",
      "is_active": true
    },
    {
      "_NOTE": "... 65 more items omitted (total: 66) ..."
    }
  ]
}
````

## File: data_sanitized/CAT-2024-Slot-1-parsed.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ schema_version: string, paper: object, question_sets: object, questions: object }",
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "CAT_2024_SLOT1",
    "slug": "cat-2024-slot-1",
    "title": "CAT 2024 Slot 1",
    "year": 2024,
    "duration_minutes": 120,
    "total_questions": 67,
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "total_marks": 198,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ]
  },
  "question_sets": [
    {
      "client_set_id": "VARC_RC_01",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 1,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 2,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_02",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 3,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_OO_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 6,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_03",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 7,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_03",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_OO_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 10,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_04",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 11,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_01",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 12,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "notes": "Includes a candlestick chart converted to table data",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_02",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 13,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_03",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 14,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_04",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 15,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_05",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 16,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "QA_47",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 17,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_48",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 18,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_49",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 19,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_50",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 20,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_51",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 21,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_52",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 22,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_53",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 23,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_54",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 24,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_55",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 25,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_56",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 26,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_57",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 27,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_58",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 28,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_59",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 29,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_60",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 30,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_61",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 31,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_62",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 32,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_63",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 33,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_64",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 34,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_65",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 35,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_66",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 36,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_67",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 37,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_68",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 38,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    }
  ],
  "questions": [
    {
      "client_question_id": "VARC_RC_01_Q1",
      "question_number": 1,
      "sequence_order": 1,
      "question_type": "MCQ",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "correct_answer": "<ANSWER_OMITTED>",
      "topic": "Reading Comprehension",
      "subtopic": "Inference",
      "difficulty": "medium",
      "options": [
        {
          "id": "A",
          "text": "<TEXT_OMITTED>"
        },
        {
          "_NOTE": "... 3 more items omitted (total: 4) ..."
        }
      ],
      "set_ref": "VARC_RC_01",
      "section": "VARC"
    },
    {
      "_NOTE": "... 66 more items omitted (total: 67) ..."
    }
  ]
}
````

## File: data_sanitized/cat-2024-slot-1-varc.jsonc
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ paper: object, contexts: object, questions: object }",
  "paper": {
    "slug": "cat-2024-slot-1",
    "title": "CAT 2024 Slot 1",
    "description": "CAT 2024 Slot 1 actual exam with 66 questions across VARC, DILR, and QA sections.",
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
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "cat-level",
    "is_free": true,
    "published": true,
    "available_from": null,
    "available_until": null
  },
  "contexts": [
    {
      "id": "dilr-set-1",
      "title": "Web Surfers and Bloggers",
      "section": "DILR",
      "text": "<TEXT_OMITTED>"
    },
    {
      "_NOTE": "... 10 more items omitted (total: 11) ..."
    }
  ],
  "questions": [
    {
      "section": "DILR",
      "question_number": 1,
      "context_id": "<CONTEXT_ID_OMITTED>",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "question_type": "TITA",
      "options": null,
      "correct_answer": "<ANSWER_OMITTED>",
      "positive_marks": 3,
      "negative_marks": 0,
      "difficulty": "medium",
      "is_active": true
    },
    {
      "_NOTE": "... 65 more items omitted (total: 66) ..."
    }
  ]
}
````

## File: data_sanitized/cat-2024-slot-1.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ paper: object, contexts: object, questions: object }",
  "paper": {
    "slug": "cat-2024-slot-1",
    "title": "CAT 2024 Slot 1",
    "description": "CAT 2024 Slot 1 actual exam with 66 questions across VARC, DILR, and QA sections.",
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
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "cat-level",
    "is_free": true,
    "published": true,
    "available_from": null,
    "available_until": null
  },
  "contexts": [
    {
      "id": "varc-passage-1",
      "title": "Bandicoots",
      "section": "VARC",
      "text": "<TEXT_OMITTED>"
    },
    {
      "_NOTE": "... 8 more items omitted (total: 9) ..."
    }
  ],
  "questions": [
    {
      "section": "VARC",
      "question_number": 1,
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "question_type": "MCQ",
      "options": [
        "Option 2",
        "Option 4",
        "Option 1",
        "Option 3"
      ],
      "correct_answer": "<ANSWER_OMITTED>",
      "positive_marks": 3,
      "negative_marks": 1,
      "difficulty": "medium",
      "is_active": true
    },
    {
      "_NOTE": "... 65 more items omitted (total: 66) ..."
    }
  ]
}
````

## File: data_sanitized/CAT-2024-Slot-2-parsed.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ schema_version: string, paper: object, question_sets: object, questions: object }",
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "CAT_2024_SLOT2",
    "slug": "cat-2024-slot-2",
    "title": "CAT 2024 Slot 2",
    "year": 2024,
    "duration_minutes": 120,
    "total_questions": 68,
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "total_marks": 198,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ]
  },
  "question_sets": [
    {
      "client_set_id": "VARC_PJ_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_OO_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 2,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 3,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_03",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 6,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_01",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 7,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_03",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_OO_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_02",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 10,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_03",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 11,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_04",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 12,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_01",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 13,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_02",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 14,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_03",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 15,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_04",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 16,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "notes": "Scatter Plot Interpretation",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_05",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 17,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "QA_47",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 18,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_48",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 19,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_49",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 20,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_50",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 21,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_51",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 22,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_52",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 23,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_53",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 24,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_54",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 25,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_55",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 26,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_56",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 27,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_57",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 28,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_58",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 29,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_59",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 30,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_60",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 31,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_61",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 32,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_62",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 33,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_63",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 34,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_64",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 35,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_65",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 36,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_66",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 37,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_67",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 38,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_68",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 39,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    }
  ],
  "questions": [
    {
      "client_question_id": "VARC_PJ_01_Q1",
      "question_number": 1,
      "sequence_order": 1,
      "question_type": "MCQ",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "correct_answer": "<ANSWER_OMITTED>",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Completion",
      "difficulty": "medium",
      "options": [
        {
          "id": "A",
          "text": "<TEXT_OMITTED>"
        },
        {
          "_NOTE": "... 3 more items omitted (total: 4) ..."
        }
      ],
      "set_ref": "VARC_PJ_01",
      "section": "VARC"
    },
    {
      "_NOTE": "... 67 more items omitted (total: 68) ..."
    }
  ]
}
````

## File: data_sanitized/CAT-2024-Slot-3-parsed.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ schema_version: string, paper: object, question_sets: object, questions: object }",
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "CAT_2024_SLOT3",
    "slug": "cat-2024-slot-3",
    "title": "CAT 2024 Slot 3",
    "year": 2024,
    "duration_minutes": 120,
    "total_questions": 68,
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "total_marks": 198,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ]
  },
  "question_sets": [
    {
      "client_set_id": "VARC_PJ_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_01",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 2,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 3,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_OO_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_02",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 5,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_03",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 6,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_03",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 7,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_OO_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 10,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_03",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 11,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_04",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 12,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_01",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 13,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_02",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 14,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_03",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 15,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_04",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 16,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "notes": "Calculation intensive data interpretation involving growth rates and ratios.",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "DILR_05",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 17,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "QA_47",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 18,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_48",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 19,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_49",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 20,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_50",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 21,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_51",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 22,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_52",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 23,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_53",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 24,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_54",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 25,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_55",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 26,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_56",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 27,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_57",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 28,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_58",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 29,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_59",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 30,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_60",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 31,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_61",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 32,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_62",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 33,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_63",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 34,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_64",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 35,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_65",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 36,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_66",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 37,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_67",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 38,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    },
    {
      "client_set_id": "QA_68",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 39,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>"
    }
  ],
  "questions": [
    {
      "client_question_id": "VARC_PJ_01_Q1",
      "question_number": 1,
      "sequence_order": 1,
      "question_type": "MCQ",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "correct_answer": "<ANSWER_OMITTED>",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Completion",
      "difficulty": "medium",
      "options": [
        {
          "id": "A",
          "text": "<TEXT_OMITTED>"
        },
        {
          "_NOTE": "... 3 more items omitted (total: 4) ..."
        }
      ],
      "set_ref": "VARC_PJ_01",
      "section": "VARC"
    },
    {
      "_NOTE": "... 67 more items omitted (total: 68) ..."
    }
  ]
}
````

## File: data_sanitized/cat-2024-slot1.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ paper: object, questions: object }",
  "paper": {
    "slug": "cat-2024-slot-1",
    "title": "CAT 2024 Slot 1 (Actual)",
    "description": "Official CAT 2024 Slot 1 Question Paper covering VARC, DILR, and QA.",
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
    "default_positive_marks": 3,
    "default_negative_marks": 1,
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
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "question_type": "MCQ",
      "options": [
        "A",
        "B",
        "C",
        "D"
      ],
      "correct_answer": "<ANSWER_OMITTED>",
      "positive_marks": 3,
      "negative_marks": 1,
      "difficulty": "medium",
      "topic": "Reading Comprehension",
      "subtopic": null,
      "solution_text": "<SOLUTION_TEXT_OMITTED>"
    },
    {
      "_NOTE": "... 67 more items omitted (total: 68) ..."
    }
  ]
}
````

## File: data_sanitized/CAT-2025-Slot-1-parsed.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ schema_version: string, paper: object, question_sets: object, questions: object }",
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "CAT_2025_SLOT1",
    "slug": "cat-2025-slot-1",
    "title": "CAT 2025 Slot 1 Question Paper",
    "year": 2025,
    "duration_minutes": 120,
    "total_questions": 68,
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "total_marks": 204,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ],
    "available_from": "2025-11-24T00:00:00Z",
    "difficulty_level": "Hard",
    "is_free": false
  },
  "question_sets": [
    {
      "client_set_id": "VARC_PJ_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_RC_01",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 2,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 3,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_PC_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_PC_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_RC_02",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 6,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_03",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 7,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_SUM_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_RC_03",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 9,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_PJ_04",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 10,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_RC_04",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 11,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_SUM_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 12,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "LRDI_SET_01",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 1,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_02",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 2,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_03",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 3,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_04",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 4,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_05",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 5,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "QA_SET_01",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_02",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 2,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_03",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 3,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_04",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_05",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_06",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 6,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_07",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 7,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_08",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_09",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_10",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 10,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_11",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 11,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_12",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 12,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_13",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 13,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_14",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 14,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_15",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 15,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_16",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 16,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_17",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 17,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_18",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 18,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_19",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 19,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_20",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 20,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_21",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 21,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "QA_SET_22",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 22,
      "content_layout": "single_focus"
    }
  ],
  "questions": [
    {
      "client_question_id": "VARC_Q01",
      "question_number": 1,
      "sequence_order": 1,
      "question_type": "TITA",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "correct_answer": "<ANSWER_OMITTED>",
      "negative_marks": 0,
      "topic": "Verbal Ability",
      "subtopic": "Para Jumbles (Odd One Out)",
      "difficulty": "medium",
      "difficulty_rationale": "Sentences 5, 1, 2, and 3 form a philosophical argument about the concept of freedom over death. Sentence 4 is descriptive about public opinion and breaks the philosophical flow.",
      "solution_text": "<SOLUTION_TEXT_OMITTED>",
      "set_ref": "VARC_PJ_01",
      "section": "VARC"
    },
    {
      "_NOTE": "... 67 more items omitted (total: 68) ..."
    }
  ]
}
````

## File: data_sanitized/CAT-2025-Slot-1.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ paper: object, contexts: object, questions: object }",
  "paper": {
    "slug": "cat-2025-slot-1",
    "title": "CAT 2025 Slot 1",
    "description": "CAT 2025 Slot 1 Actual Paper. Features 68 questions across VARC, DILR, and QA.",
    "year": 2025,
    "total_questions": 68,
    "total_marks": 204,
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
        "questions": 22,
        "time": 40,
        "marks": 66
      },
      {
        "name": "QA",
        "questions": 22,
        "time": 40,
        "marks": 66
      }
    ],
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "cat-level",
    "is_free": true,
    "published": true
  },
  "contexts": [
    {
      "id": "varc-rc-1",
      "section": "VARC",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "title": "Electronic Music & Aesthetics",
      "content": "Often the well intentioned music lover or the traditionally-minded professional composer asks two basic questions when faced with the electronic music phenomena: (1) is this type of artistic creation music at all? and, (2) given that the product is accepted as music of a new type or order, is not such music \"inhuman\"?...\n\nAs Lejaren Hiller points out in his book Experimental Music (coauthor Leonard M. Isaacson), two questions which often arise when music is discussed are: (a) the substance of musical communication and its symbolic and semantic significance, if any, and (b) the particular processes, both mental and technical, which are involved in creating and responding to musical composition.\n\nThe ever-present popular concept of music as a direct, open, emotional expression and as a subjective form of communication from the composer, is, of course still that of the nineteenth century, when composers themselves spoke of music in those terms.... But since the third decade of our century many composers have preferred more objective definitions of music, epitomized in Stravinsky's description of it as \"a form of speculation in terms of sound and time\". An acceptance of this more characteristic twentieth-century view of the art of musical composition will of course immediately bring the layman closer to an understanding of, and sympathetic response to, electronic music, even if the forms, sounds and approaches it uses will still be of a foreign nature to him.\n\nA communication problem however will still remain. The principal barrier that electronic music presents at large, in relation to the communication process, is that composers in this medium are employing a new language of forms where terms like 'densities', 'indefinite pitch relations', 'dynamic serialization', 'permutation', etc., are substitutes (or remote equivalents) for the traditional concepts of harmony, melody, rhythm, etc.... When the new structural procedures of electronic music are at last fully understood by the listener the barriers between him and the work he faces will be removed...\n\nThe medium of electronic music has of course tempted many kinds of composers to try their hand at it.... But the serious-minded composer approaches the world of electronic music with a more sophisticated and profound concept of creation. Although he knows that he can reproduce and employ melodic, rhythmic patterns and timbres of a traditional nature, he feels that it is in the exploration of sui generis languages and forms that the aesthetic magic of the new medium lies. And, conscientiously, he plunges into this search.\n\nThe second objection usually levelled against electronic music is much more innocent in nature. When people speak—sometimes very vehemently—of the 'inhuman' quality of this music they seem to forget that the composer is the one who fires the machines, collects the sounds, manipulates them, pushes the buttons, programs the computer, filters the sounds, establishes pitches and scales, splices tape, thinks of forms, and rounds up the over-all structure of the piece, as well as every detail of it."
    },
    {
      "_NOTE": "... 8 more items omitted (total: 9) ..."
    }
  ],
  "questions": [
    {
      "section": "VARC",
      "question_number": 1,
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "question_type": "TITA",
      "options": null,
      "correct_answer": "<ANSWER_OMITTED>",
      "positive_marks": 3,
      "negative_marks": 0,
      "difficulty": "medium",
      "topic": "Parajumbles",
      "subtopic": "Odd One Out",
      "context_id": null
    },
    {
      "_NOTE": "... 67 more items omitted (total: 68) ..."
    }
  ]
}
````

## File: data_sanitized/CAT-2025-Slot-2-parsed.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ schema_version: string, paper: object, question_sets: object, questions: object }",
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "CAT_2025_SLOT2_CRACKU",
    "slug": "cat-2025-slot-2",
    "title": "CAT 2025 Slot 2 Question Paper",
    "year": 2025,
    "duration_minutes": 120,
    "total_questions": 68,
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "total_marks": 204,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ]
  },
  "question_sets": [
    {
      "client_set_id": "VARC_ATOMIC_01",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_RC_01",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 2,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_ATOMIC_02",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 3,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_RC_02",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 4,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_ATOMIC_03",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "VARC_RC_03",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 6,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_RC_04",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 7,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "VARC_ATOMIC_04",
      "section": "VARC",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus"
    },
    {
      "client_set_id": "LRDI_SET_01",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 1,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_02",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 2,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_03",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 3,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_04",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 4,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "LRDI_SET_05",
      "section": "DILR",
      "set_type": "DILR",
      "display_order": 5,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "client_set_id": "QA_ATOMIC_01",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus"
    }
  ],
  "questions": [
    {
      "client_question_id": "VARC_Q01",
      "question_number": 1,
      "sequence_order": 1,
      "question_type": "MCQ",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "correct_answer": "<ANSWER_OMITTED>",
      "topic": "Verbal Ability",
      "subtopic": "Paragraph Completion",
      "difficulty": "hard",
      "solution_text": "<SOLUTION_TEXT_OMITTED>",
      "options": [
        {
          "id": "A",
          "text": "<TEXT_OMITTED>"
        },
        {
          "_NOTE": "... 3 more items omitted (total: 4) ..."
        }
      ],
      "set_ref": "VARC_ATOMIC_01",
      "section": "VARC"
    },
    {
      "_NOTE": "... 67 more items omitted (total: 68) ..."
    }
  ]
}
````

## File: data_sanitized/CAT-2025-Slot-3-v3.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ schema_version: string, paper: object, question_sets: object, questions: object }",
  "schema_version": "v3.0",
  "paper": {
    "paper_key": "CAT_2025_SLOT3",
    "title": "CAT 2025 Slot 3",
    "slug": "cat-2025-slot-3",
    "description": "Converted from PDF. Advertisements removed. Tables converted to Markdown. Answers mapped from key.",
    "year": 2025,
    "total_questions": 68,
    "total_marks": 198,
    "duration_minutes": 120,
    "sections": [
      "VARC",
      "DILR",
      "QA"
    ],
    "default_positive_marks": 3,
    "default_negative_marks": 1,
    "difficulty_level": "cat-level",
    "is_free": true,
    "published": false,
    "allow_pause": true,
    "attempt_limit": 0
  },
  "question_sets": [
    {
      "section": "VARC",
      "client_set_id": "VARC_PJ_01",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          2
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SUM_02",
      "set_type": "ATOMIC",
      "display_order": 2,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          2
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_01",
      "set_type": "VARC",
      "display_order": 3,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          2,
          3
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_MS_03",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          4
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_PJ_04",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          4
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_02",
      "set_type": "VARC",
      "display_order": 6,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          5,
          6
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_PJ_05",
      "set_type": "ATOMIC",
      "display_order": 7,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          6
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_PJ_06",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          6,
          7
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_MS_07",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          7
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_03",
      "set_type": "VARC",
      "display_order": 10,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          7,
          8
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_SUM_08",
      "set_type": "ATOMIC",
      "display_order": 11,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          9
        ]
      }
    },
    {
      "section": "VARC",
      "client_set_id": "VARC_RC_04",
      "set_type": "VARC",
      "display_order": 12,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          9,
          10
        ]
      }
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_CIRCULAR_01",
      "set_type": "DILR",
      "display_order": 1,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>"
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_TRAVEL_02",
      "set_type": "DILR",
      "display_order": 2,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          13
        ]
      }
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_PUZZLE_03",
      "set_type": "DILR",
      "display_order": 3,
      "content_layout": "split_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          14
        ]
      }
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_TRADE_04",
      "set_type": "DILR",
      "display_order": 4,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          15
        ]
      }
    },
    {
      "section": "DILR",
      "client_set_id": "DILR_MOBILE_05",
      "set_type": "DILR",
      "display_order": 5,
      "content_layout": "split_focus",
      "context_type": "<CONTEXT_TYPE_OMITTED>",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          16
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_47",
      "set_type": "ATOMIC",
      "display_order": 1,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          16,
          17
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_48",
      "set_type": "ATOMIC",
      "display_order": 2,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          17
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_49",
      "set_type": "ATOMIC",
      "display_order": 3,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          18
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_50",
      "set_type": "ATOMIC",
      "display_order": 4,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          18
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_51",
      "set_type": "ATOMIC",
      "display_order": 5,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          18
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_52",
      "set_type": "ATOMIC",
      "display_order": 6,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          19
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_53",
      "set_type": "ATOMIC",
      "display_order": 7,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          19
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_54",
      "set_type": "ATOMIC",
      "display_order": 8,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          19
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_55",
      "set_type": "ATOMIC",
      "display_order": 9,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          20
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_56",
      "set_type": "ATOMIC",
      "display_order": 10,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          20
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_57",
      "set_type": "ATOMIC",
      "display_order": 11,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          21
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_58",
      "set_type": "ATOMIC",
      "display_order": 12,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          21
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_59",
      "set_type": "ATOMIC",
      "display_order": 13,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          21
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_60",
      "set_type": "ATOMIC",
      "display_order": 14,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          22
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_61",
      "set_type": "ATOMIC",
      "display_order": 15,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          22
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_62",
      "set_type": "ATOMIC",
      "display_order": 16,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          22
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_63",
      "set_type": "ATOMIC",
      "display_order": 17,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          23
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_64",
      "set_type": "ATOMIC",
      "display_order": 18,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          23
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_65",
      "set_type": "ATOMIC",
      "display_order": 19,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          23
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_66",
      "set_type": "ATOMIC",
      "display_order": 20,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          23
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_67",
      "set_type": "ATOMIC",
      "display_order": 21,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          24
        ]
      }
    },
    {
      "section": "QA",
      "client_set_id": "QA_ATOMIC_68",
      "set_type": "ATOMIC",
      "display_order": 22,
      "content_layout": "single_focus",
      "context_title": "<CONTEXT_TITLE_OMITTED>",
      "context_body": "<CONTEXT_BODY_OMITTED>",
      "metadata": {
        "source_pages": [
          24
        ]
      }
    }
  ],
  "questions": [
    {
      "set_ref": "VARC_PJ_01",
      "section": "VARC",
      "client_question_id": "VARC_PJ_01_Q01",
      "question_number": 1,
      "sequence_order": 1,
      "question_type": "TITA",
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "options": null,
      "correct_answer": "<ANSWER_OMITTED>",
      "solution_text": "<SOLUTION_TEXT_OMITTED>",
      "topic": "Verbal Ability",
      "subtopic": "Odd One Out",
      "difficulty": "medium",
      "positive_marks": 3,
      "negative_marks": 0
    },
    {
      "_NOTE": "... 67 more items omitted (total: 68) ..."
    }
  ]
}
````

## File: data_sanitized/paper_schema_v3.template.json
````json
{
    "schema_version": "v3.0",
    "paper": {
        "paper_key": "cat-2024-slot-1",
        "title": "CAT 2024 Slot 1",
        "slug": "cat-2024-slot-1",
        "description": "Official CAT 2024 Slot 1 Question Paper",
        "year": 2024,
        "total_questions": 66,
        "total_marks": 198,
        "duration_minutes": 120,
        "sections": [
            "VARC",
            "DILR",
            "QA"
        ],
        "default_positive_marks": 3,
        "default_negative_marks": 1,
        "difficulty_level": "hard",
        "is_free": false,
        "published": false,
        "allow_pause": true,
        "attempt_limit": 0
    },
    "question_sets": [
        {
            "client_set_id": "VARC_RC_1",
            "section": "VARC",
            "set_type": "VARC",
            "display_order": 1,
            "context_type": "rc_passage",
            "context_title": "Reading Comprehension Passage 1",
            "context_body": "The passage text goes here. This is a reading comprehension passage that multiple questions will reference. It can contain **Markdown** formatting and $KaTeX$ math expressions.\n\nParagraph 2 of the passage continues here with more content for students to analyze.",
            "content_layout": "text_only"
        },
        {
            "client_set_id": "VARC_RC_2",
            "section": "VARC",
            "set_type": "VARC",
            "display_order": 2,
            "context_type": "rc_passage",
            "context_title": "Reading Comprehension Passage 2",
            "context_body": "Another passage for reading comprehension. This demonstrates that each RC passage is a separate question_set with its own client_set_id."
        },
        {
            "client_set_id": "VARC_ATOMIC_1",
            "section": "VARC",
            "set_type": "ATOMIC",
            "display_order": 3
        },
        {
            "client_set_id": "DILR_SET_1",
            "section": "DILR",
            "set_type": "DILR",
            "display_order": 1,
            "context_type": "dilr_set",
            "context_title": "Data Interpretation Set 1",
            "context_body": "Table showing sales data for Company XYZ:\n\n| Year | Revenue | Profit |\n|------|---------|--------|\n| 2020 | 100     | 10     |\n| 2021 | 120     | 15     |\n| 2022 | 150     | 20     |",
            "context_image_url": "https://example.com/chart.png"
        },
        {
            "client_set_id": "QA_ATOMIC_1",
            "section": "QA",
            "set_type": "ATOMIC",
            "display_order": 1
        },
        {
            "client_set_id": "QA_ATOMIC_2",
            "section": "QA",
            "set_type": "ATOMIC",
            "display_order": 2
        }
    ],
    "questions": [
        {
            "client_question_id": "Q1",
            "set_ref": "VARC_RC_1",
            "sequence_order": 1,
            "section": "VARC",
            "question_number": 1,
            "question_text": "What is the main argument presented in the passage?",
            "question_type": "MCQ",
            "taxonomy_type": "rc_main_idea",
            "options": [
                {
                    "id": "A",
                    "text": "Option A text"
                },
                {
                    "id": "B",
                    "text": "Option B text"
                },
                {
                    "id": "C",
                    "text": "Option C text"
                },
                {
                    "id": "D",
                    "text": "Option D text"
                }
            ],
            "correct_answer": "B",
            "positive_marks": 3,
            "negative_marks": 1,
            "difficulty": "medium",
            "topic": "Reading Comprehension",
            "solution_text": "The correct answer is B because the passage explicitly states..."
        },
        {
            "client_question_id": "Q2",
            "set_ref": "VARC_RC_1",
            "sequence_order": 2,
            "section": "VARC",
            "question_number": 2,
            "question_text": "Which of the following can be inferred from paragraph 2?",
            "question_type": "MCQ",
            "taxonomy_type": "rc_inference",
            "options": [
                {
                    "id": "A",
                    "text": "Inference option A"
                },
                {
                    "id": "B",
                    "text": "Inference option B"
                },
                {
                    "id": "C",
                    "text": "Inference option C"
                },
                {
                    "id": "D",
                    "text": "Inference option D"
                }
            ],
            "correct_answer": "C",
            "positive_marks": 3,
            "negative_marks": 1,
            "difficulty": "hard"
        },
        {
            "client_question_id": "Q3",
            "set_ref": "VARC_RC_2",
            "sequence_order": 1,
            "section": "VARC",
            "question_number": 3,
            "question_text": "The author's tone in the passage can best be described as:",
            "question_type": "MCQ",
            "taxonomy_type": "rc_tone",
            "options": [
                {
                    "id": "A",
                    "text": "Optimistic"
                },
                {
                    "id": "B",
                    "text": "Critical"
                },
                {
                    "id": "C",
                    "text": "Neutral"
                },
                {
                    "id": "D",
                    "text": "Pessimistic"
                }
            ],
            "correct_answer": "B",
            "positive_marks": 3,
            "negative_marks": 1,
            "difficulty": "medium"
        },
        {
            "client_question_id": "Q4",
            "set_ref": "VARC_ATOMIC_1",
            "sequence_order": 1,
            "section": "VARC",
            "question_number": 4,
            "question_text": "The four sentences (labelled 1, 2, 3, 4) given below...\n\n1. First sentence here.\n2. Second sentence here.\n3. Third sentence here.\n4. Fourth sentence here.\n\nArrange in proper sequence:",
            "question_type": "TITA",
            "taxonomy_type": "para_jumble",
            "correct_answer": "3142",
            "positive_marks": 3,
            "negative_marks": 0,
            "difficulty": "medium",
            "topic": "Para Jumbles"
        },
        {
            "client_question_id": "Q5",
            "set_ref": "DILR_SET_1",
            "sequence_order": 1,
            "section": "DILR",
            "question_number": 5,
            "question_text": "What was the percentage increase in revenue from 2020 to 2022?",
            "question_type": "TITA",
            "taxonomy_type": "di_percentage",
            "correct_answer": "50",
            "positive_marks": 3,
            "negative_marks": 0,
            "difficulty": "easy",
            "topic": "Data Interpretation",
            "solution_text": "Increase = (150-100)/100 × 100 = 50%"
        },
        {
            "client_question_id": "Q6",
            "set_ref": "DILR_SET_1",
            "sequence_order": 2,
            "section": "DILR",
            "question_number": 6,
            "question_text": "In which year was the profit margin highest?",
            "question_type": "MCQ",
            "taxonomy_type": "di_comparison",
            "options": [
                {
                    "id": "A",
                    "text": "2020"
                },
                {
                    "id": "B",
                    "text": "2021"
                },
                {
                    "id": "C",
                    "text": "2022"
                },
                {
                    "id": "D",
                    "text": "Cannot be determined"
                }
            ],
            "correct_answer": "C",
            "positive_marks": 3,
            "negative_marks": 1,
            "difficulty": "medium"
        },
        {
            "client_question_id": "Q7",
            "set_ref": "QA_ATOMIC_1",
            "sequence_order": 1,
            "section": "QA",
            "question_number": 7,
            "question_text": "If $x^2 + y^2 = 25$ and $xy = 12$, find the value of $(x + y)^2$.",
            "question_type": "TITA",
            "taxonomy_type": "algebra_equations",
            "correct_answer": "49",
            "positive_marks": 3,
            "negative_marks": 0,
            "difficulty": "medium",
            "topic": "Algebra",
            "subtopic": "Quadratic Equations",
            "solution_text": "$(x+y)^2 = x^2 + 2xy + y^2 = 25 + 2(12) = 49$"
        },
        {
            "client_question_id": "Q8",
            "set_ref": "QA_ATOMIC_2",
            "sequence_order": 1,
            "section": "QA",
            "question_number": 8,
            "question_text": "A train traveling at 60 km/h crosses a platform in 30 seconds...",
            "question_type": "MCQ",
            "taxonomy_type": "arithmetic_speed",
            "options": [
                {
                    "id": "A",
                    "text": "200 meters"
                },
                {
                    "id": "B",
                    "text": "250 meters"
                },
                {
                    "id": "C",
                    "text": "300 meters"
                },
                {
                    "id": "D",
                    "text": "350 meters"
                }
            ],
            "correct_answer": "C",
            "positive_marks": 3,
            "negative_marks": 1,
            "difficulty": "easy",
            "topic": "Arithmetic",
            "subtopic": "Time, Speed, Distance"
        }
    ]
}
````

## File: data_sanitized/sample-paper-template.json
````json
{
  "_SCHEMA_NOTE": "This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.",
  "_ORIGINAL_STRUCTURE": "{ paper: object, questions: object }",
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
    "default_positive_marks": 3,
    "default_negative_marks": 1,
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
      "question_text": "<QUESTION_TEXT_OMITTED>",
      "question_type": "MCQ",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correct_answer": "<ANSWER_OMITTED>",
      "positive_marks": 3,
      "negative_marks": 1,
      "difficulty": "medium",
      "topic": "Reading Comprehension",
      "subtopic": "Main Idea",
      "solution_text": "<SOLUTION_TEXT_OMITTED>"
    },
    {
      "_NOTE": "... 5 more items omitted (total: 6) ..."
    }
  ]
}
````

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
- `/api/submit` — server action/function to submit + score via TypeScript (no SQL finalize_attempt)
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

## 4b) RBAC Hook Verification

**Enable JWT Hook (Supabase Dashboard)**
1. Go to **Authentication → Hooks**.
2. Enable **Customize Access Token (JWT)**.
3. Select the function **public.custom_access_token_hook**.

**Sanity Check (after sign-in)**
- In the app, call `supabase.auth.getSession()` and confirm `session.user.app_metadata.user_role` is set.
- Optionally decode the JWT and confirm `user_role` exists at the root claim.

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

## File: knip.json
````json
{
    "$schema": "https://unpkg.com/knip@5/schema.json",
    "project": [
        "tsconfig.json"
    ],
    "entry": [
        "middleware.ts",
        "src/app/**/*.{ts,tsx}",
        "src/features/**/*.{ts,tsx}",
        "src/lib/**/*.ts",
        "src/types/**/*.ts"
    ],
    "ignore": [
        "**/*.test.*",
        "**/*.spec.*",
        "**/node_modules/**",
        ".next/**",
        "dist/**",
        "build/**"
    ],
    "ignoreDependencies": [
        "@types/*"
    ]
}
````

## File: next-env.d.ts
````typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
````

## File: next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
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

## File: schemas/paper_schema_v3.json
````json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://nexams.com/schemas/paper_schema_v3.json",
    "title": "CAT Paper Schema v3.0 (Sets-First)",
    "description": "Canonical ingestion format: paper → question_sets → questions. Questions reference sets via set_ref (client_set_id).",
    "type": "object",
    "required": [
        "schema_version",
        "paper",
        "question_sets",
        "questions"
    ],
    "properties": {
        "schema_version": {
            "type": "string",
            "const": "v3.0",
            "description": "Must be 'v3.0' for sets-first format"
        },
        "paper": {
            "type": "object",
            "required": [
                "title",
                "slug"
            ],
            "properties": {
                "paper_key": {
                    "type": "string",
                    "description": "Stable semantic key for idempotent imports (e.g., 'cat-2024-slot-1')"
                },
                "title": {
                    "type": "string",
                    "minLength": 1
                },
                "slug": {
                    "type": "string",
                    "pattern": "^[a-z0-9-]+$"
                },
                "description": {
                    "type": "string"
                },
                "year": {
                    "type": "integer"
                },
                "total_questions": {
                    "type": "integer",
                    "minimum": 1
                },
                "total_marks": {
                    "type": "number"
                },
                "duration_minutes": {
                    "type": "integer",
                    "minimum": 1
                },
                "sections": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "VARC",
                            "DILR",
                            "QA"
                        ]
                    }
                },
                "default_positive_marks": {
                    "type": "number",
                    "default": 3
                },
                "default_negative_marks": {
                    "type": "number",
                    "default": 1
                },
                "difficulty_level": {
                    "type": "string",
                    "enum": [
                        "easy",
                        "medium",
                        "hard"
                    ]
                },
                "is_free": {
                    "type": "boolean",
                    "default": false
                },
                "published": {
                    "type": "boolean",
                    "default": false
                },
                "allow_pause": {
                    "type": "boolean",
                    "default": true
                },
                "attempt_limit": {
                    "type": "integer",
                    "minimum": 0,
                    "default": 0
                }
            }
        },
        "question_sets": {
            "type": "array",
            "description": "Parent containers for questions. Inserted FIRST, then questions reference them.",
            "items": {
                "type": "object",
                "required": [
                    "client_set_id",
                    "section",
                    "set_type",
                    "display_order"
                ],
                "properties": {
                    "client_set_id": {
                        "type": "string",
                        "description": "Stable human-readable ID (e.g., 'VARC_RC_1', 'DILR_SET_3'). Used by questions.set_ref to link.",
                        "pattern": "^[A-Z0-9_]+$"
                    },
                    "section": {
                        "type": "string",
                        "enum": [
                            "VARC",
                            "DILR",
                            "QA"
                        ]
                    },
                    "set_type": {
                        "type": "string",
                        "enum": [
                            "VARC",
                            "DILR",
                            "CASELET",
                            "ATOMIC"
                        ],
                        "description": "VARC/DILR/CASELET require context_body. ATOMIC is for standalone questions."
                    },
                    "display_order": {
                        "type": "integer",
                        "minimum": 0,
                        "description": "Order within section for deterministic export"
                    },
                    "context_title": {
                        "type": "string",
                        "description": "Optional title for the passage/set"
                    },
                    "context_body": {
                        "type": "string",
                        "description": "Required for VARC/DILR/CASELET sets. The passage or data content."
                    },
                    "context_image_url": {
                        "type": "string",
                        "format": "uri",
                        "description": "Optional image URL for DI sets"
                    },
                    "context_additional_images": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "uri"
                        }
                    },
                    "context_type": {
                        "type": "string",
                        "enum": [
                            "rc_passage",
                            "dilr_set",
                            "caselet",
                            "data_table",
                            "graph",
                            "other_shared_stimulus"
                        ],
                        "description": "Explicit categorization for analytics"
                    },
                    "content_layout": {
                        "type": "string",
                        "enum": [
                            "split_passage",
                            "split_chart",
                            "split_table",
                            "single_focus",
                            "image_top"
                        ],
                        "default": "single_focus"
                    },
                    "metadata": {
                        "type": "object",
                        "description": "Arbitrary metadata for the set"
                    }
                },
                "if": {
                    "properties": {
                        "set_type": {
                            "enum": [
                                "VARC",
                                "DILR",
                                "CASELET"
                            ]
                        }
                    }
                },
                "then": {
                    "required": [
                        "context_body"
                    ],
                    "properties": {
                        "context_body": {
                            "minLength": 1
                        }
                    }
                }
            }
        },
        "questions": {
            "type": "array",
            "description": "Questions reference sets via set_ref (matches client_set_id)",
            "items": {
                "type": "object",
                "required": [
                    "client_question_id",
                    "set_ref",
                    "sequence_order",
                    "question_number",
                    "question_text",
                    "question_type"
                ],
                "properties": {
                    "client_question_id": {
                        "type": "string",
                        "description": "Stable human-readable ID (e.g., 'Q1', 'VARC_RC1_Q3'). Unique within paper.",
                        "pattern": "^[A-Za-z0-9_]+$"
                    },
                    "set_ref": {
                        "type": "string",
                        "description": "References a question_set by client_set_id. Must exist in question_sets[].",
                        "pattern": "^[A-Z0-9_]+$"
                    },
                    "sequence_order": {
                        "type": "integer",
                        "minimum": 1,
                        "description": "Order within the set (1-based)"
                    },
                    "section": {
                        "type": "string",
                        "enum": [
                            "VARC",
                            "DILR",
                            "QA"
                        ]
                    },
                    "question_number": {
                        "type": "integer",
                        "minimum": 1,
                        "description": "Global question number in the paper"
                    },
                    "question_text": {
                        "type": "string",
                        "minLength": 1
                    },
                    "question_type": {
                        "type": "string",
                        "enum": [
                            "MCQ",
                            "TITA"
                        ],
                        "description": "Answer format"
                    },
                    "question_format": {
                        "type": "string",
                        "enum": [
                            "MCQ",
                            "TITA"
                        ],
                        "description": "Alias for question_type (DB uses this)"
                    },
                    "taxonomy_type": {
                        "type": "string",
                        "description": "Semantic category (e.g., rc_inference, para_summary, di_table_analysis)"
                    },
                    "topic_tag": {
                        "type": "string",
                        "description": "Fine-grained topic for analytics"
                    },
                    "difficulty_rationale": {
                        "type": "string",
                        "description": "Explanation for difficulty rating"
                    },
                    "options": {
                        "type": "array",
                        "description": "Required for MCQ questions",
                        "items": {
                            "type": "object",
                            "required": [
                                "id",
                                "text"
                            ],
                            "properties": {
                                "id": {
                                    "type": "string"
                                },
                                "text": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "correct_answer": {
                        "type": [
                            "string",
                            "number",
                            "array"
                        ],
                        "description": "MCQ: option id(s). TITA: numeric or string answer."
                    },
                    "positive_marks": {
                        "type": "number",
                        "default": 3
                    },
                    "negative_marks": {
                        "type": "number",
                        "default": 1
                    },
                    "difficulty": {
                        "type": "string",
                        "enum": [
                            "easy",
                            "medium",
                            "hard"
                        ]
                    },
                    "topic": {
                        "type": "string"
                    },
                    "subtopic": {
                        "type": "string"
                    },
                    "solution_text": {
                        "type": "string"
                    },
                    "solution_image_url": {
                        "type": "string",
                        "format": "uri"
                    },
                    "video_solution_url": {
                        "type": "string",
                        "format": "uri"
                    }
                },
                "if": {
                    "properties": {
                        "question_type": {
                            "const": "MCQ"
                        }
                    }
                },
                "then": {
                    "required": [
                        "options"
                    ]
                }
            }
        }
    }
}
````

## File: scripts/ajv-validator.mjs
````javascript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'schemas', 'paper_schema_v3.json');
const paperSchema = JSON.parse(readFileSync(schemaPath, 'utf8'));

function buildAjv() {
    const ajv = new Ajv({
        allErrors: true,
        strict: false,
        verbose: true
    });

    addFormats(ajv);
    return ajv;
}

const ajv = buildAjv();
const validate = ajv.compile(paperSchema);

export function validatePaperSchema(data) {
    const valid = validate(data);
    return {
        valid: Boolean(valid),
        errors: valid ? undefined : validate.errors || []
    };
}
````

## File: scripts/backfill-paper-versions.mjs
````javascript
#!/usr/bin/env node
/**
 * @fileoverview Backfill Paper Versions Script
 * @description Creates initial ingest run records for existing papers
 * @usage node scripts/backfill-paper-versions.mjs [options]
 * 
 * This script:
 * 1. Finds all papers without a latest_ingest_run_id
 * 2. Calls export_paper_json() to assemble current state
 * 3. Creates a paper_ingest_runs record as version 1
 * 4. Updates papers.latest_ingest_run_id
 * 
 * Options:
 *   --dry-run    Show what would be done without making changes
 *   --paper-id   Backfill only a specific paper
 *   --help, -h   Show help message
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// HASH FUNCTION
// =============================================================================

function computeJsonHash(data) {
    const jsonStr = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(jsonStr).digest('hex');
}

// =============================================================================
// BACKFILL FUNCTIONS
// =============================================================================

async function getPapersNeedingBackfill(specificPaperId = null) {
    let query = supabase
        .from('papers')
        .select('id, slug, title, latest_ingest_run_id');

    if (specificPaperId) {
        query = query.eq('id', specificPaperId);
    } else {
        query = query.is('latest_ingest_run_id', null);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch papers: ${error.message}`);
    }

    return data || [];
}

async function backfillPaper(paper, dryRun = false) {
    console.log(`\n📄 Processing: ${paper.title} (${paper.slug})`);
    console.log(`   Paper ID: ${paper.id}`);

    // Export current state using SQL function
    const { data: exportedJson, error: exportError } = await supabase.rpc('export_paper_json', {
        p_paper_id: paper.id
    });

    if (exportError) {
        console.error(`   ❌ Export failed: ${exportError.message}`);
        return { success: false, error: exportError.message };
    }

    if (exportedJson?.error) {
        console.error(`   ❌ Export returned error: ${exportedJson.error}`);
        return { success: false, error: exportedJson.error };
    }

    // Calculate hash
    const canonicalHash = computeJsonHash(exportedJson);
    console.log(`   Hash: ${canonicalHash.substring(0, 16)}...`);

    // Check if already has ingest runs
    const { data: existingRuns } = await supabase
        .from('paper_ingest_runs')
        .select('id, version_number')
        .eq('paper_id', paper.id)
        .order('version_number', { ascending: false })
        .limit(1);

    if (existingRuns && existingRuns.length > 0) {
        console.log(`   ⚠️  Paper already has ${existingRuns.length} ingest run(s)`);

        if (!paper.latest_ingest_run_id) {
            // Just need to update the pointer
            if (!dryRun) {
                await supabase
                    .from('papers')
                    .update({ latest_ingest_run_id: existingRuns[0].id })
                    .eq('id', paper.id);
                console.log(`   ✅ Updated latest_ingest_run_id pointer`);
            } else {
                console.log(`   [DRY RUN] Would update latest_ingest_run_id to ${existingRuns[0].id}`);
            }
        }
        return { success: true, skipped: true };
    }

    // Count contexts and questions
    const contextCount = Array.isArray(exportedJson?.contexts) ? exportedJson.contexts.length : 0;
    const questionCount = Array.isArray(exportedJson?.questions) ? exportedJson.questions.length : 0;
    console.log(`   Contexts: ${contextCount}, Questions: ${questionCount}`);

    if (dryRun) {
        console.log(`   [DRY RUN] Would create ingest run v1`);
        return { success: true, dryRun: true };
    }

    // Create ingest run
    const { data: ingestRun, error: insertError } = await supabase
        .from('paper_ingest_runs')
        .insert({
            paper_id: paper.id,
            schema_version: 'v1.0',
            version_number: 1,
            canonical_paper_json: exportedJson,
            canonical_json_hash: canonicalHash,
            import_notes: 'Backfill from existing database state'
        })
        .select()
        .single();

    if (insertError) {
        console.error(`   ❌ Insert failed: ${insertError.message}`);
        return { success: false, error: insertError.message };
    }

    // Update paper's latest_ingest_run_id
    const { error: updateError } = await supabase
        .from('papers')
        .update({ latest_ingest_run_id: ingestRun.id })
        .eq('id', paper.id);

    if (updateError) {
        console.error(`   ❌ Update failed: ${updateError.message}`);
        return { success: false, error: updateError.message };
    }

    console.log(`   ✅ Created ingest run v1 (${ingestRun.id})`);
    return { success: true, ingestRunId: ingestRun.id };
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║              Paper Versions Backfill Tool                            ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/backfill-paper-versions.mjs [options]

Options:
  --dry-run          Show what would be done without making changes
  --paper-id <id>    Backfill only a specific paper
  --all              Include papers that already have ingest runs
  --help, -h         Show this help message

Examples:
  # Preview what would be backfilled
  node scripts/backfill-paper-versions.mjs --dry-run

  # Backfill all papers without ingest runs
  node scripts/backfill-paper-versions.mjs

  # Backfill a specific paper
  node scripts/backfill-paper-versions.mjs --paper-id abc-123-def

What this does:
  1. Finds papers without latest_ingest_run_id
  2. Exports current state using export_paper_json()
  3. Creates paper_ingest_runs record as version 1
  4. Updates papers.latest_ingest_run_id
`);
        process.exit(0);
    }

    const dryRun = args.includes('--dry-run');
    const paperIdIdx = args.indexOf('--paper-id');
    const specificPaperId = paperIdIdx !== -1 ? args[paperIdIdx + 1] : null;

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║              Paper Versions Backfill Tool                            ║
╚══════════════════════════════════════════════════════════════════════╝
`);

    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    try {
        // Get papers needing backfill
        const papers = await getPapersNeedingBackfill(specificPaperId);

        if (papers.length === 0) {
            console.log('✅ No papers need backfilling');
            console.log('   All papers already have ingest run records.');
            return;
        }

        console.log(`📋 Found ${papers.length} paper(s) to backfill:\n`);

        for (const paper of papers) {
            console.log(`   - ${paper.slug} (${paper.id.substring(0, 8)}...)`);
        }

        // Process each paper
        const results = {
            success: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };

        for (const paper of papers) {
            const result = await backfillPaper(paper, dryRun);

            if (result.success) {
                if (result.skipped || result.dryRun) {
                    results.skipped++;
                } else {
                    results.success++;
                }
            } else {
                results.failed++;
                results.errors.push({ paper: paper.slug, error: result.error });
            }
        }

        // Summary
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                         Backfill Summary                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  Total Papers:     ${papers.length.toString().padStart(4)}
║  Successfully:     ${results.success.toString().padStart(4)}
║  Skipped:          ${results.skipped.toString().padStart(4)}
║  Failed:           ${results.failed.toString().padStart(4)}
╚══════════════════════════════════════════════════════════════════════╝
`);

        if (results.errors.length > 0) {
            console.log('Errors:');
            for (const err of results.errors) {
                console.log(`  - ${err.paper}: ${err.error}`);
            }
        }

        if (dryRun) {
            console.log('\n💡 Run without --dry-run to apply changes.');
        }

    } catch (err) {
        console.error(`\n❌ Fatal error: ${err.message}`);
        process.exit(1);
    }
}

main();
````

## File: scripts/export-paper.mjs
````javascript
#!/usr/bin/env node
/**
 * @fileoverview Paper Export Script
 * @description CLI tool to export papers from Supabase to JSON files
 * @usage node scripts/export-paper.mjs <paper_id> [options]
 * 
 * Options:
 *   --out <path>        Output file path (default: ./exports/paper_<id>.json)
 *   --version <n>       Export specific version number
 *   --run <uuid>        Export specific ingest run ID
 *   --assembled         Force assembly from current DB state (ignore snapshots)
 *   --list-versions     List all versions for this paper
 *   --help, -h          Show help message
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Set them in .env.local or pass via environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// HELP
// =============================================================================

function showHelp() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    CAT Paper Export Tool                             ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/export-paper.mjs <paper_id> [options]

Options:
  --out <path>        Output file path (default: ./exports/<slug>.json)
  --version <n>       Export specific version number
  --run <uuid>        Export specific ingest run ID
  --assembled         Force assembly from current DB state (ignore snapshots)
  --list-versions     List all available versions for this paper
  --list             List all papers
  --help, -h          Show this help message

Examples:
  # Export latest version of a paper
  node scripts/export-paper.mjs abc-123-def

  # Export to specific file
  node scripts/export-paper.mjs abc-123-def --out ./my-paper.json

  # Export specific version
  node scripts/export-paper.mjs abc-123-def --version 2

  # List all versions
  node scripts/export-paper.mjs abc-123-def --list-versions

  # List all papers
  node scripts/export-paper.mjs --list

Environment Variables:
  Load from .env.local:
  Get-Content .env.local | ForEach-Object { if ($_ -match '^(\\w+)=(.*)$') { $name=$matches[1]; $value=$matches[2]; Set-Item -Path Env:$name -Value $value } }
`);
}

// =============================================================================
// LIST PAPERS
// =============================================================================

async function listPapers() {
    console.log('\n📋 Listing all papers...\n');

    const { data: papers, error } = await supabase
        .from('papers')
        .select('id, slug, title, published, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }

    if (!papers || papers.length === 0) {
        console.log('No papers found.');
        return;
    }

    console.log('ID                                    | Slug                      | Title                           | Published');
    console.log('─'.repeat(120));

    for (const paper of papers) {
        const slug = (paper.slug || '-').padEnd(25);
        const title = (paper.title || '-').substring(0, 30).padEnd(30);
        const published = paper.published ? '✓' : '✗';
        console.log(`${paper.id} | ${slug} | ${title} | ${published}`);
    }

    console.log(`\nTotal: ${papers.length} papers`);
}

// =============================================================================
// LIST VERSIONS
// =============================================================================

async function listVersions(paperId) {
    console.log(`\n📋 Listing versions for paper: ${paperId}\n`);

    // First get paper info
    const { data: paper, error: paperError } = await supabase
        .from('papers')
        .select('id, slug, title, latest_ingest_run_id')
        .eq('id', paperId)
        .single();

    if (paperError || !paper) {
        console.error(`❌ Paper not found: ${paperId}`);
        process.exit(1);
    }

    console.log(`Paper: ${paper.title} (${paper.slug})`);
    console.log(`Latest Ingest Run: ${paper.latest_ingest_run_id || 'None'}\n`);

    // Get all versions
    const { data: versions, error } = await supabase
        .from('paper_ingest_runs')
        .select('id, version_number, schema_version, created_at, import_notes')
        .eq('paper_id', paperId)
        .order('version_number', { ascending: false });

    if (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }

    if (!versions || versions.length === 0) {
        console.log('No versioned imports found. Use --assembled to export current DB state.');
        return;
    }

    console.log('Version | Ingest Run ID                        | Schema  | Created At           | Notes');
    console.log('─'.repeat(110));

    for (const v of versions) {
        const isLatest = v.id === paper.latest_ingest_run_id ? ' *' : '  ';
        const notes = (v.import_notes || '').substring(0, 30);
        const created = new Date(v.created_at).toISOString().substring(0, 19);
        console.log(`${String(v.version_number).padStart(4)}${isLatest} | ${v.id} | ${v.schema_version.padEnd(7)} | ${created} | ${notes}`);
    }

    console.log(`\n* = Latest version`);
    console.log(`Total: ${versions.length} versions`);
}

// =============================================================================
// EXPORT PAPER
// =============================================================================

async function exportPaper(paperId, options) {
    const { outPath, version, runId, assembled } = options;

    console.log(`\n📦 Exporting paper: ${paperId}`);

    let exportData;
    let filename;

    if (assembled) {
        console.log('   Mode: Assembled from current database state');
        const { data, error } = await supabase.rpc('export_paper_json', {
            p_paper_id: paperId
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;
        filename = `paper_${paperId}_assembled.json`;
    } else if (runId) {
        console.log(`   Mode: Specific ingest run (${runId})`);
        const { data, error } = await supabase.rpc('export_paper_json_versioned', {
            p_paper_id: paperId,
            p_ingest_run_id: runId
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;
        filename = `paper_${paperId}_run_${runId}.json`;
    } else if (version) {
        console.log(`   Mode: Specific version (v${version})`);

        // Get run ID for this version
        const { data: runData, error: runError } = await supabase
            .from('paper_ingest_runs')
            .select('id')
            .eq('paper_id', paperId)
            .eq('version_number', parseInt(version, 10))
            .single();

        if (runError || !runData) {
            console.error(`❌ Version ${version} not found for paper ${paperId}`);
            process.exit(1);
        }

        const { data, error } = await supabase.rpc('export_paper_json_versioned', {
            p_paper_id: paperId,
            p_ingest_run_id: runData.id
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;
        filename = `paper_${paperId}_v${version}.json`;
    } else {
        console.log('   Mode: Latest version (canonical snapshot preferred)');
        const { data, error } = await supabase.rpc('export_paper_json_versioned', {
            p_paper_id: paperId,
            p_ingest_run_id: null
        });

        if (error) {
            console.error(`❌ Export error: ${error.message}`);
            process.exit(1);
        }

        exportData = data;

        // Get paper slug for filename
        const { data: paperData } = await supabase
            .from('papers')
            .select('slug')
            .eq('id', paperId)
            .single();

        const slug = paperData?.slug || paperId;
        filename = `${slug}.json`;
    }

    // Check for errors in response
    if (exportData && typeof exportData === 'object' && 'error' in exportData) {
        console.error(`❌ Export error: ${exportData.error}`);
        process.exit(1);
    }

    // Determine output path
    const finalPath = outPath || resolve(process.cwd(), 'exports', filename);

    // Ensure directory exists
    const dir = dirname(finalPath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    // Write file
    const jsonString = JSON.stringify(exportData, null, 2);
    writeFileSync(finalPath, jsonString, 'utf-8');

    // Summary
    const stats = {
        contexts: Array.isArray(exportData?.contexts) ? exportData.contexts.length : 0,
        questions: Array.isArray(exportData?.questions) ? exportData.questions.length : 0,
        fileSize: (Buffer.byteLength(jsonString) / 1024).toFixed(2)
    };

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                         Export Complete!                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  Paper:       ${exportData?.paper?.title || paperId}
║  Slug:        ${exportData?.paper?.slug || '-'}
║  Contexts:    ${stats.contexts}
║  Questions:   ${stats.questions}
║  File Size:   ${stats.fileSize} KB
║  Output:      ${finalPath}
╚══════════════════════════════════════════════════════════════════════╝
`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    const flags = {
        help: args.includes('--help') || args.includes('-h'),
        list: args.includes('--list'),
        listVersions: args.includes('--list-versions'),
        assembled: args.includes('--assembled'),
        outPath: null,
        version: null,
        runId: null,
        paperId: null
    };

    // Parse --out
    const outIdx = args.indexOf('--out');
    if (outIdx !== -1 && args[outIdx + 1]) {
        flags.outPath = args[outIdx + 1];
    }

    // Parse --version
    const versionIdx = args.indexOf('--version');
    if (versionIdx !== -1 && args[versionIdx + 1]) {
        flags.version = args[versionIdx + 1];
    }

    // Parse --run
    const runIdx = args.indexOf('--run');
    if (runIdx !== -1 && args[runIdx + 1]) {
        flags.runId = args[runIdx + 1];
    }

    // Get paper ID (first non-flag argument)
    for (const arg of args) {
        if (!arg.startsWith('--') && !arg.startsWith('-')) {
            // Check if it's not the value for a flag
            const prevIdx = args.indexOf(arg) - 1;
            if (prevIdx >= 0 && ['--out', '--version', '--run'].includes(args[prevIdx])) {
                continue;
            }
            flags.paperId = arg;
            break;
        }
    }

    // Handle commands
    if (flags.help || (args.length === 0)) {
        showHelp();
        process.exit(0);
    }

    if (flags.list) {
        await listPapers();
        process.exit(0);
    }

    if (!flags.paperId) {
        console.error('❌ Paper ID required. Use --help for usage.');
        process.exit(1);
    }

    if (flags.listVersions) {
        await listVersions(flags.paperId);
        process.exit(0);
    }

    // Export paper
    await exportPaper(flags.paperId, {
        outPath: flags.outPath,
        version: flags.version,
        runId: flags.runId,
        assembled: flags.assembled
    });
}

main().catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}`);
    process.exit(1);
});
````

## File: scripts/export-vs-codebase-v2.mjs
````javascript
#!/usr/bin/env node
/**
 * export-vs-codebase-v2.mjs
 * 
 * Generates VS_Codebase_v2.md with full repo context while:
 * 1. Excluding environment variables and secret files
 * 2. Excluding this export script and output files
 * 3. Adding a REDACTIONS section at the top
 * 
 * Usage: pnpm run export:vs_codebase:v2
 * 
 * This script orchestrates:
 * 1. Secrets scanning (best-effort grep if gitleaks/trufflehog unavailable)
 * 2. Repomix execution with minimal ignore patterns (env + export artifacts)
 * 3. Post-processing to add REDACTIONS header
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
    outputFile: 'VS_Codebase_v2.md',
    tempRepomixConfig: '.repomix-vs-codebase-v2.json',
    exportScriptPath: 'scripts/export-vs-codebase-v2.mjs',
};

// Secret patterns to scan for (regex patterns)
const SECRET_PATTERNS = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}/g },
    { name: 'GitHub Token', pattern: /gh[ps]_[A-Za-z0-9]{36,}/g },
    { name: 'Generic API Key', pattern: /['"]?api[_-]?key['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
    { name: 'Generic Secret', pattern: /['"]?secret['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
    { name: 'Supabase Key', pattern: /eyJ[A-Za-z0-9_-]{100,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
    { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/g },
];

// Files that should never be included
const EXCLUDED_FILES = [
    '.env',
    '.env.local',
    '.env.*.local',
    '.env.development',
    '.env.production',
    '*.pem',
    '*.key',
    '*.p12',
    '*.pfx',
    'id_rsa*',
    '*.jks',
    'service-account*.json',
];

/**
 * Check if gitleaks or trufflehog is available
 */
function checkSecretsScannerAvailable() {
    try {
        execSync('gitleaks version', { stdio: 'ignore' });
        return 'gitleaks';
    } catch {
        try {
            execSync('trufflehog --version', { stdio: 'ignore' });
            return 'trufflehog';
        } catch {
            return null;
        }
    }
}

/**
 * Run secrets scan using available tool or best-effort grep
 */
function runSecretsCheck() {
    console.log('\n🔍 Step 1: Scanning for secrets...\n');

    const scanner = checkSecretsScannerAvailable();
    const secretsFound = [];

    if (scanner === 'gitleaks') {
        console.log('  Using gitleaks for secrets detection...');
        try {
            execSync('gitleaks detect --source . --no-git', { cwd: ROOT_DIR, stdio: 'pipe' });
        } catch (error) {
            if (error.stdout) {
                secretsFound.push({ file: 'detected by gitleaks', pattern: error.stdout.toString() });
            }
        }
    } else if (scanner === 'trufflehog') {
        console.log('  Using trufflehog for secrets detection...');
        try {
            execSync('trufflehog filesystem .', { cwd: ROOT_DIR, stdio: 'pipe' });
        } catch (error) {
            if (error.stdout) {
                secretsFound.push({ file: 'detected by trufflehog', pattern: error.stdout.toString() });
            }
        }
    } else {
        console.log('  No dedicated secrets scanner found, using best-effort pattern matching...');
        secretsFound.push(...runPatternBasedSecretsScan());
    }

    if (secretsFound.length > 0) {
        console.log(`\n⚠️  Found ${secretsFound.length} potential secret(s):`);
        secretsFound.forEach(s => console.log(`    - ${s.file}: ${s.pattern}`));
    } else {
        console.log('  ✅ No secrets detected');
    }

    return secretsFound;
}

/**
 * Pattern-based secrets scanning for files that will be included
 */
function runPatternBasedSecretsScan() {
    const secretsFound = [];
    const extensionsToScan = ['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.sql', '.css'];

    function scanDirectory(dir, relativePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relativePath, entry.name);

            // Skip excluded directories
            if (entry.isDirectory()) {
                if (['node_modules', '.git', '.next', '.export_sanitized', '.venv'].includes(entry.name)) {
                    continue;
                }
                scanDirectory(fullPath, relPath);
                continue;
            }

            // Skip non-scannable files
            const ext = path.extname(entry.name).toLowerCase();
            if (!extensionsToScan.includes(ext)) continue;

            // Skip env files
            if (entry.name.startsWith('.env')) continue;

            try {
                const content = fs.readFileSync(fullPath, 'utf-8');

                for (const { name, pattern } of SECRET_PATTERNS) {
                    const matches = content.match(pattern);
                    if (matches) {
                        const filtered = matches.filter(m => {
                            if (m.includes('EXAMPLE') || m.includes('PLACEHOLDER') || m.includes('YOUR_')) return false;
                            if (m.includes('secret') && m.includes('//')) return false;
                            if (name === 'Supabase Key' && m.length < 150) return false;
                            return true;
                        });

                        if (filtered.length > 0) {
                            secretsFound.push({
                                file: relPath,
                                pattern: name,
                                count: filtered.length,
                            });
                        }
                    }
                }
            } catch {
                // Skip files that can't be read
            }
        }
    }

    scanDirectory(ROOT_DIR);
    return secretsFound;
}

/**
 * Create temporary Repomix config
 */
function createRepomixConfig() {
    console.log('\n⚙️  Step 2: Creating Repomix configuration...\n');

    const config = {
        output: {
            filePath: CONFIG.outputFile,
            style: 'markdown',
            headerText: '',
            showLineNumbers: false,
        },
        ignore: {
            customPatterns: [
                // Secret files
                ...EXCLUDED_FILES,
                // Build artifacts
                '.next/**',
                'node_modules/**',
                '.venv/**',
                // Temp files
                '.export_sanitized/**',
                '.export_tmp/**',
                // This script + output files
                CONFIG.tempRepomixConfig,
                CONFIG.exportScriptPath,
                'VS_Codebase.md',
                CONFIG.outputFile,
            ],
            // Best-effort: avoid external ignore files for a complete export
            useGitignore: false,
            useRepomixIgnore: false,
        },
        include: [
            '**/*',
        ],
    };

    const configPath = path.join(ROOT_DIR, CONFIG.tempRepomixConfig);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`  Created: ${CONFIG.tempRepomixConfig}`);

    return configPath;
}

/**
 * Run Repomix to generate the codebase export
 */
function runRepomix(configPath) {
    console.log('\n📦 Step 3: Running Repomix...\n');

    try {
        execSync(`npx repomix --config "${configPath}"`, {
            cwd: ROOT_DIR,
            stdio: 'inherit',
            encoding: 'utf-8',
        });
        return true;
    } catch (error) {
        console.error('❌ Repomix failed:', error.message);
        return false;
    }
}

/**
 * Get list of redacted files and what was redacted
 */
function getRedactionsList() {
    const redactions = [];

    redactions.push({
        file: '.env, .env.local, .env.*.local',
        redacted: 'All content',
        reason: 'Environment files may contain secrets (API keys, database credentials)',
    });

    redactions.push({
        file: CONFIG.exportScriptPath,
        redacted: 'Entire file excluded',
        reason: 'Exclude the export process file itself from the export output',
    });

    redactions.push({
        file: CONFIG.outputFile,
        redacted: 'Entire file excluded',
        reason: 'Exclude the generated export file from the export output',
    });

    redactions.push({
        file: 'VS_Codebase.md',
        redacted: 'Entire file excluded',
        reason: 'Avoid nesting previous exports into this export',
    });

    return redactions;
}

/**
 * Add header with REDACTIONS section to the output file
 */
function addRedactionsHeader() {
    console.log('\n✏️  Step 4: Adding REDACTIONS header...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);

    if (!fs.existsSync(outputPath)) {
        console.error(`❌ Output file not found: ${CONFIG.outputFile}`);
        return false;
    }

    const content = fs.readFileSync(outputPath, 'utf-8');
    const redactions = getRedactionsList();
    const timestamp = new Date().toISOString();

    const header = `# VS_Codebase_v2.md

## Generation Info

- **Repository**: cat_website_execution
- **Generated**: ${timestamp}
- **Command**: \`pnpm run export:vs_codebase:v2\`

## REDACTIONS

The following content has been intentionally redacted from this export:

| File Path | What Was Redacted | Reason |
|-----------|-------------------|--------|
${redactions.map(r => `| ${r.file} | ${r.redacted} | ${r.reason} |`).join('\n')}

---

`;

    const newContent = header + content;

    fs.writeFileSync(outputPath, newContent);
    console.log(`  ✅ Added REDACTIONS header to ${CONFIG.outputFile}`);

    return true;
}

/**
 * Run post-pass to redact any remaining secrets in output
 */
function runPostPassRedaction() {
    console.log('\n🔒 Step 5: Running post-pass redaction...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);
    let content = fs.readFileSync(outputPath, 'utf-8');
    let redactedCount = 0;

    const postPassPatterns = [
        { pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, name: 'JWT Token' },
        { pattern: /sk_live_[A-Za-z0-9]{24,}/g, name: 'Stripe Live Key' },
        { pattern: /sk_test_[A-Za-z0-9]{24,}/g, name: 'Stripe Test Key' },
        { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },
    ];

    for (const { pattern, name } of postPassPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, '<REDACTED_SECRET>');
            redactedCount += matches.length;
            console.log(`  Redacted ${matches.length} ${name}(s)`);
        }
    }

    if (redactedCount > 0) {
        fs.writeFileSync(outputPath, content);
        console.log(`  ✅ Redacted ${redactedCount} potential secret(s)`);
    } else {
        console.log('  ✅ No additional secrets found in output');
    }

    return true;
}

/**
 * Cleanup temporary files
 */
function cleanup() {
    console.log('\n🧹 Step 6: Cleanup...\n');

    const configPath = path.join(ROOT_DIR, CONFIG.tempRepomixConfig);
    if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        console.log(`  Removed: ${CONFIG.tempRepomixConfig}`);
    }
}

/**
 * Verify the output
 */
function verifyOutput() {
    console.log('\n✅ Step 7: Verification...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);

    if (!fs.existsSync(outputPath)) {
        console.error(`  ❌ Output file not found: ${CONFIG.outputFile}`);
        return false;
    }

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`  📄 Output: ${CONFIG.outputFile}`);
    console.log(`  📏 Size: ${sizeKB} KB (${sizeMB} MB)`);

    const content = fs.readFileSync(outputPath, 'utf-8');

    if (!content.includes('## REDACTIONS')) {
        console.error('  ❌ REDACTIONS section missing');
        return false;
    }
    console.log('  ✅ REDACTIONS section present');

    const envValuePatterns = [
        /SUPABASE_SERVICE_ROLE_KEY=eyJ[A-Za-z0-9_\-\.]+/,
        /NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[A-Za-z0-9_\-\.]+/,
        /SUPABASE_URL=https:\/\/[a-z0-9]+\.supabase\.co/,
    ];

    let envLeakDetected = false;
    for (const pattern of envValuePatterns) {
        if (pattern.test(content)) {
            console.error(`  ❌ Environment variable value detected: ${pattern.source}`);
            envLeakDetected = true;
        }
    }

    if (!envLeakDetected) {
        console.log('  ✅ No environment variable values leaked');
    } else {
        return false;
    }

    return true;
}

/**
 * Main orchestration
 */
async function main() {
    console.log('═'.repeat(60));
    console.log('  VS_Codebase_v2.md Export Tool');
    console.log('═'.repeat(60));
    console.log();

    const startTime = Date.now();

    const secretsFound = runSecretsCheck();
    if (secretsFound.length > 0) {
        console.log('\n⚠️  Secrets were detected. Review the findings above.');
        console.log('   Continuing with export (secrets will be excluded via ignore patterns)...');
    }

    const configPath = createRepomixConfig();

    if (!runRepomix(configPath)) {
        process.exit(1);
    }

    if (!addRedactionsHeader()) {
        process.exit(1);
    }

    runPostPassRedaction();

    cleanup();

    const verified = verifyOutput();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log();
    console.log('═'.repeat(60));
    if (verified) {
        console.log(`  ✅ Export complete! (${elapsed}s)`);
        console.log(`  📄 Output: ${CONFIG.outputFile}`);
        console.log();
        console.log('  Next steps:');
        console.log('  1. Review VS_Codebase_v2.md for any remaining sensitive content');
        console.log('  2. Use it for deep research and root cause analysis');
    } else {
        console.log(`  ❌ Export completed with warnings (${elapsed}s)`);
        console.log('  Please review the output manually.');
    }
    console.log('═'.repeat(60));

    process.exit(verified ? 0 : 1);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
````

## File: scripts/sanitize-question-data.mjs
````javascript
#!/usr/bin/env node
/**
 * sanitize-question-data.mjs
 * 
 * Sanitizes question paper JSON/JSONC files by replacing actual content
 * with placeholders while preserving the schema structure.
 * 
 * Usage: node scripts/sanitize-question-data.mjs
 * 
 * This script:
 * 1. Reads all JSON/JSONC files from /data
 * 2. Detects question paper files (by keys like paper, questions, contexts)
 * 3. Replaces sensitive text fields with placeholders
 * 4. Truncates arrays to 1 example + note
 * 5. Writes sanitized copies to .export_sanitized/data/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUTPUT_DIR = path.join(ROOT_DIR, 'data_sanitized');

// Fields that should be redacted (contain actual question/passage content)
const SENSITIVE_TEXT_FIELDS = [
    'question_text',
    'text',
    'passage',
    'passage_text',
    'solution_text',
    'explanation',
    'hint',
    'context_text',
];

// Fields that are options arrays
const OPTIONS_FIELDS = ['options'];

// Fields that are answers
const ANSWER_FIELDS = ['correct_answer', 'answer', 'correct_option'];

/**
 * Strip JSONC comments and parse as JSON
 */
function parseJsonc(content) {
    // Remove single-line comments (// ...)
    let cleaned = content.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments (/* ... */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(cleaned);
}

/**
 * Check if a file looks like a question paper JSON
 */
function isQuestionPaperFile(data) {
    if (typeof data !== 'object' || data === null) return false;

    // Check for common question paper keys
    const hasQuestions = 'questions' in data ||
        (Array.isArray(data) && data.some(item => 'question_text' in item));
    const hasPaper = 'paper' in data;
    const hasContexts = 'contexts' in data;

    return hasQuestions || hasPaper || hasContexts;
}

/**
 * Sanitize a single value based on its key
 */
function sanitizeValue(key, value) {
    const lowerKey = key.toLowerCase();

    // Check if it's a sensitive text field - redact regardless of length
    if (SENSITIVE_TEXT_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
        if (typeof value === 'string') {
            return `<${key.toUpperCase()}_OMITTED>`;
        }
    }

    // Check if it's an options field
    if (OPTIONS_FIELDS.some(field => lowerKey === field.toLowerCase())) {
        if (Array.isArray(value) && value.length > 0) {
            return ['<OPTION_A>', '<OPTION_B>', '<OPTION_C>', '<OPTION_D>'].slice(0, Math.min(value.length, 4));
        }
    }

    // Check if it's an answer field
    if (ANSWER_FIELDS.some(field => lowerKey === field.toLowerCase())) {
        return '<ANSWER_OMITTED>';
    }

    return value;
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj, depth = 0) {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        if (obj.length === 0) return obj;

        // For question/context arrays, keep only first item with a note
        const firstItemKeys = typeof obj[0] === 'object' && obj[0] !== null ? Object.keys(obj[0]) : [];
        const isQuestionOrContextArray = firstItemKeys.some(k =>
            ['question_text', 'text', 'question_number', 'id', 'title'].includes(k)
        );

        if (isQuestionOrContextArray && obj.length > 1) {
            const sanitizedFirst = sanitizeObject(obj[0], depth + 1);
            return [
                sanitizedFirst,
                { '_NOTE': `... ${obj.length - 1} more items omitted (total: ${obj.length}) ...` }
            ];
        }

        return obj.map(item => sanitizeObject(item, depth + 1));
    }

    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                result[key] = sanitizeObject(value, depth + 1);
            } else {
                result[key] = sanitizeValue(key, value);
            }
        }
        return result;
    }

    return obj;
}

/**
 * Generate a schema description for the file
 */
function generateSchemaDescription(data) {
    const schema = {
        _SCHEMA_NOTE: 'This file has been sanitized. Question text, options, answers, and passages have been replaced with placeholders.',
        _ORIGINAL_STRUCTURE: describeStructure(data)
    };
    return schema;
}

/**
 * Describe the structure of data for schema documentation
 */
function describeStructure(data, depth = 0) {
    if (depth > 3) return '...';

    if (data === null) return 'null';
    if (Array.isArray(data)) {
        if (data.length === 0) return '[]';
        return `Array<${describeStructure(data[0], depth + 1)}> (${data.length} items)`;
    }
    if (typeof data === 'object') {
        const keys = Object.keys(data).slice(0, 10);
        const desc = keys.map(k => `${k}: ${typeof data[k]}`).join(', ');
        return `{ ${desc}${Object.keys(data).length > 10 ? ', ...' : ''} }`;
    }
    return typeof data;
}

/**
 * Process a single file
 */
function processFile(filePath, fileName) {
    console.log(`  Processing: ${fileName}`);

    const content = fs.readFileSync(filePath, 'utf-8');
    let data;

    try {
        // Try JSONC first (handles comments)
        data = parseJsonc(content);
    } catch (e) {
        console.log(`    Warning: Failed to parse ${fileName}: ${e.message}`);
        return null;
    }

    if (!isQuestionPaperFile(data)) {
        console.log(`    Skipping: Not a question paper file`);
        return null;
    }

    // Generate sanitized version
    const sanitized = {
        ...generateSchemaDescription(data),
        ...sanitizeObject(data)
    };

    return sanitized;
}

/**
 * Main function
 */
function main() {
    console.log('🧹 Sanitizing question paper data...\n');

    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Get all JSON/JSONC files from data directory
    const files = fs.readdirSync(DATA_DIR).filter(f =>
        f.endsWith('.json') || f.endsWith('.jsonc')
    );

    if (files.length === 0) {
        console.log('  No JSON/JSONC files found in /data');
        return { processed: [], skipped: [] };
    }

    const processed = [];
    const skipped = [];

    for (const fileName of files) {
        const filePath = path.join(DATA_DIR, fileName);
        const sanitized = processFile(filePath, fileName);

        if (sanitized) {
            // Write sanitized file
            const outputPath = path.join(OUTPUT_DIR, fileName);
            fs.writeFileSync(outputPath, JSON.stringify(sanitized, null, 2));
            processed.push(fileName);
            console.log(`    ✅ Sanitized: ${fileName}`);
        } else {
            skipped.push(fileName);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Processed: ${processed.length} files`);
    console.log(`  Skipped: ${skipped.length} files`);
    console.log(`  Output: ${OUTPUT_DIR}`);

    return { processed, skipped };
}

// Run if called directly
main();

export { main, sanitizeObject, parseJsonc, isQuestionPaperFile };
````

## File: scripts/transform-cat-2025-slot-3-md.mjs
````javascript
#!/usr/bin/env node
/**
 * Parse CAT 2025 Slot 3 structured markdown and emit schema v3 JSON.
 * Handles both plain text format and markdown format with escaped characters.
 * Usage: node scripts/transform-cat-2025-slot-3-md.mjs <input.md> <output.json>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const VALID_CONTEXT_TYPES = new Set([
    'rc_passage',
    'dilr_set',
    'caselet',
    'data_table',
    'graph',
    'other_shared_stimulus',
]);

/**
 * Unescape markdown-escaped characters (e.g., \_ -> _, \[ -> [)
 */
function unescapeMarkdown(text) {
    if (!text) return text;
    return text
        .replace(/\\_/g, '_')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\-/g, '-')
        .replace(/\\>/g, '>')
        .replace(/\\\*/g, '*')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\=/g, '=')
        .replace(/\\#/g, '#')
        .replace(/\\!/g, '!')
        .replace(/\\~/g, '~');
}

function stripQuotes(value) {
    const trimmed = value.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return unescapeMarkdown(trimmed.slice(1, -1));
    }
    return unescapeMarkdown(trimmed);
}

function parseNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
}

function normalizeBlockLine(line) {
    return unescapeMarkdown(line)
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .trim();
}

function isBlockStart(line) {
    const normalized = normalizeBlockLine(line);
    return normalized.startsWith('Section:') || normalized === 'SET' || normalized === 'QUESTION';
}

function isKeyLine(line) {
    // Handle escaped keys like client\_set\_id: as well as client_set_id:
    return /^[A-Za-z_\\]+:\s*/.test(line);
}

function parseMultilineValue(lines, startIndex) {
    const collected = [];
    let i = startIndex;

    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trimEnd();

        if (isBlockStart(line)) break;
        if (isKeyLine(line)) break;

        // Preserve raw line (including tables) but unescape markdown
        collected.push(unescapeMarkdown(raw.replace(/\r$/, '')));
        i += 1;
    }

    return { value: collected.join('\n').trimEnd(), nextIndex: i };
}

function parseHeader(lines) {
    const header = {};
    let i = 0;

    for (; i < lines.length; i += 1) {
        const raw = lines[i];
        const line = raw.trim();

        if (!line) continue;
        if (normalizeBlockLine(line).startsWith('Section:')) break;
        if (line === '________________________________________') continue;
        if (line.startsWith('Here is the structured')) continue;
        if (line.startsWith('•')) continue;
        // Skip markdown header lines like "# CAT 2025..."
        if (line.startsWith('#')) continue;
        // Skip markdown separators (including escaped front-matter markers)
        if (line === '---' || line === '\\---' || line === '***') continue;

        // Handle escaped keys like paper\_key: value
        const match = line.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
        if (match) {
            const key = unescapeMarkdown(match[1]);
            const value = stripQuotes(match[2]);
            header[key] = parseNumber(value);
        }
    }

    return { header, nextIndex: i };
}

function normalizeContextType(value) {
    if (!value) return undefined;
    const normalized = value.trim();
    if (!VALID_CONTEXT_TYPES.has(normalized)) {
        return undefined;
    }
    return normalized;
}

function parseSetsAndQuestions(lines, startIndex, defaults) {
    const questionSets = [];
    const questions = [];

    let currentSection = null;
    let currentSet = null;
    let i = startIndex;

    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trim();

        if (!line) {
            i += 1;
            continue;
        }

        // Handle both "Section: VARC" and "**Section: VARC**"
        if (normalizeBlockLine(line).startsWith('Section:')) {
            const sectionText = normalizeBlockLine(line).replace('Section:', '').trim();
            currentSection = sectionText;
            i += 1;
            continue;
        }

        if (normalizeBlockLine(line) === 'SET') {
            currentSet = { section: currentSection };
            i += 1;

            while (i < lines.length) {
                const row = lines[i].trim();
                if (!row) {
                    i += 1;
                    continue;
                }
                if (isBlockStart(row)) break;

                if (row.startsWith('metadata:') || row.startsWith('metadata\\_:')) {
                    i += 1;
                    while (i < lines.length) {
                        const metaLine = lines[i].trim();
                        if (!metaLine) {
                            i += 1;
                            continue;
                        }
                        if (isBlockStart(metaLine)) break;
                        const metaMatch = metaLine.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
                        if (!metaMatch) break;
                        i += 1;
                    }
                    continue;
                }

                // Handle escaped keys like client\_set\_id:
                const match = row.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
                if (!match) {
                    i += 1;
                    continue;
                }

                const key = unescapeMarkdown(match[1]);
                const value = match[2];

                if (value === '|') {
                    const { value: blockValue, nextIndex } = parseMultilineValue(lines, i + 1);
                    currentSet[key] = blockValue;
                    i = nextIndex;
                    continue;
                }

                currentSet[key] = stripQuotes(value);
                i += 1;
            }

            if (currentSet) {
                if (!currentSet.section && currentSection) currentSet.section = currentSection;
                if (currentSet.display_order !== undefined) {
                    currentSet.display_order = Number(currentSet.display_order);
                }
                if (currentSet.context_type) {
                    const normalized = normalizeContextType(String(currentSet.context_type));
                    if (!normalized) {
                        delete currentSet.context_type;
                    } else {
                        currentSet.context_type = normalized;
                    }
                }

                questionSets.push(currentSet);
            }
            continue;
        }

        if (normalizeBlockLine(line) === 'QUESTION') {
            const question = { set_ref: currentSet?.client_set_id, section: currentSection };
            i += 1;

            while (i < lines.length) {
                const row = lines[i].trim();
                if (!row) {
                    i += 1;
                    continue;
                }
                if (isBlockStart(row)) break;

                // Handle escaped keys like client\_question\_id:
                const match = row.match(/^([A-Za-z0-9_\\]+):\s*(.*)$/);
                if (!match) {
                    i += 1;
                    continue;
                }

                const key = unescapeMarkdown(match[1]);
                const value = match[2];

                if (key === 'options') {
                    if (value.trim() === 'null') {
                        question.options = null;
                        i += 1;
                        continue;
                    }

                    const opts = [];
                    i += 1;
                    while (i < lines.length) {
                        const optLine = lines[i].trim();
                        if (!optLine) {
                            i += 1;
                            continue;
                        }

                        const optMatch = optLine.match(/^([A-D]):\s*(.*)$/);
                        if (optMatch) {
                            // Store as plain text string (DB expects string array, not {id, text} objects)
                            opts.push(stripQuotes(optMatch[2]));
                            i += 1;
                            continue;
                        }

                        if (isBlockStart(optLine) || isKeyLine(optLine)) break;
                        i += 1;
                    }
                    question.options = opts.length ? opts : null;
                    continue;
                }

                if (value === '|') {
                    const { value: blockValue, nextIndex } = parseMultilineValue(lines, i + 1);
                    question[key] = blockValue;
                    i = nextIndex;
                    continue;
                }

                question[key] = stripQuotes(value);
                i += 1;
            }

            if (!question.section && currentSection) question.section = currentSection;
            if (question.question_number !== undefined) question.question_number = Number(question.question_number);
            if (question.sequence_order !== undefined) question.sequence_order = Number(question.sequence_order);

            const defaultPositive = Number(defaults.default_positive_marks ?? 3);
            const defaultNegative = Number(defaults.default_negative_marks ?? 1);

            question.positive_marks = Number.isFinite(defaultPositive) ? defaultPositive : 3;
            question.negative_marks = question.question_type === 'TITA' ? 0 : (Number.isFinite(defaultNegative) ? defaultNegative : 1);

            if (question.difficulty) {
                const normalized = String(question.difficulty).trim().toLowerCase();
                if (normalized === 'difficult') {
                    question.difficulty = 'hard';
                } else if (['easy', 'medium', 'hard'].includes(normalized)) {
                    question.difficulty = normalized;
                } else {
                    delete question.difficulty;
                }
            }

            questions.push(question);
            continue;
        }

        i += 1;
    }

    const setMap = new Map(questionSets.map(set => [set.client_set_id, set]));
    for (const question of questions) {
        if (question.section === 'VARC' && typeof question.subtopic === 'string') {
            const subtopic = question.subtopic.toLowerCase();
            if (subtopic.includes('para jumble')) {
                const set = setMap.get(question.set_ref);
                if (set) {
                    set.context_body = '';
                    set.context_title = '';
                    delete set.context_type;
                }
            }
        }
    }

    return { questionSets, questions };
}

function buildPaper(header, defaults) {
    return {
        paper_key: header.paper_key ?? 'CAT_2025_SLOT3',
        title: header.title ?? 'CAT 2025 Slot 3',
        slug: header.slug ?? 'cat-2025-slot-3',
        description: header.import_notes ?? header.source_pdf ?? 'CAT 2025 Slot 3 Question Paper',
        year: Number(header.year ?? 2025),
        total_questions: Number(header.total_questions ?? 68),
        total_marks: Number(header.total_marks ?? 198),
        duration_minutes: Number(header.duration_minutes ?? 120),
        sections: ['VARC', 'DILR', 'QA'],
        default_positive_marks: Number(defaults.default_positive_marks ?? 3),
        default_negative_marks: Number(defaults.default_negative_marks ?? 1),
        difficulty_level: 'cat-level',
        is_free: true,
        published: false,
        allow_pause: true,
        attempt_limit: 0,
    };
}

function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3] ?? 'data/CAT-2025-Slot-3-v3.json';

    if (!inputPath) {
        console.error('Usage: node scripts/transform-cat-2025-slot-3-md.mjs <input.txt> <output.json>');
        process.exit(1);
    }

    const resolvedInput = resolve(process.cwd(), inputPath);
    if (!existsSync(resolvedInput)) {
        console.error(`❌ File not found: ${resolvedInput}`);
        process.exit(1);
    }

    const resolvedOutput = resolve(process.cwd(), outputPath);

    const raw = readFileSync(resolvedInput, 'utf-8').replace(/\r\n/g, '\n');
    const lines = raw.split('\n');

    const { header, nextIndex } = parseHeader(lines);
    const defaults = {
        default_positive_marks: header.default_positive_marks ?? 3,
        default_negative_marks: header.default_negative_marks ?? 1,
    };

    const { questionSets, questions } = parseSetsAndQuestions(lines, nextIndex, defaults);

    const output = {
        schema_version: 'v3.0',
        paper: buildPaper(header, defaults),
        question_sets: questionSets,
        questions,
    };

    writeFileSync(resolvedOutput, JSON.stringify(output, null, 2));
    console.log(`✅ Parsed ${questionSets.length} sets and ${questions.length} questions.`);
    console.log(`📄 Output: ${resolvedOutput}`);
}

main();
````

## File: scripts/export-vs-codebase.mjs
````javascript
#!/usr/bin/env node
/**
 * export-vs-codebase.mjs
 * 
 * Generates VS_Codebase.md with full repo context while:
 * 1. Excluding exam paper JSON/JSONC files
 * 2. Excluding secrets and sensitive files
 * 3. Adding a REDACTIONS section at the top
 * 
 * Usage: pnpm run export:vs_codebase
 * 
 * This script orchestrates:
 * 1. Secrets scanning (best-effort grep if gitleaks/trufflehog unavailable)
 * 2. Repomix execution with proper ignore patterns
 * 3. Post-processing to add REDACTIONS header
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
    outputFile: 'VS_Codebase.md',
    dataDir: 'data',
    tempRepomixConfig: '.repomix-vs-codebase.json',
};

// Secret patterns to scan for (regex patterns)
const SECRET_PATTERNS = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}/g },
    { name: 'GitHub Token', pattern: /gh[ps]_[A-Za-z0-9]{36,}/g },
    { name: 'Generic API Key', pattern: /['"]?api[_-]?key['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
    { name: 'Generic Secret', pattern: /['"]?secret['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi },
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
    { name: 'Supabase Key', pattern: /eyJ[A-Za-z0-9_-]{100,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
    { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/g },
];

// Files that should never be included (handled by .gitignore and repomix config)
// NOTE: Patterns moved to repomix config ignore list

/**
 * Run the sanitization script
 */
/**
 * Check if gitleaks or trufflehog is available
 */
function checkSecretsScannerAvailable() {
    try {
        execSync('gitleaks version', { stdio: 'ignore' });
        return 'gitleaks';
    } catch {
        try {
            execSync('trufflehog --version', { stdio: 'ignore' });
            return 'trufflehog';
        } catch {
            return null;
        }
    }
}

/**
 * Run secrets scan using available tool or best-effort grep
 */
function runSecretsCheck() {
    console.log('\n🔍 Step 1: Scanning for secrets...\n');

    const scanner = checkSecretsScannerAvailable();
    const secretsFound = [];

    if (scanner === 'gitleaks') {
        console.log('  Using gitleaks for secrets detection...');
        try {
            execSync('gitleaks detect --source . --no-git', { cwd: ROOT_DIR, stdio: 'pipe' });
        } catch (error) {
            // gitleaks returns non-zero if secrets found
            if (error.stdout) {
                secretsFound.push({ file: 'detected by gitleaks', pattern: error.stdout.toString() });
            }
        }
    } else if (scanner === 'trufflehog') {
        console.log('  Using trufflehog for secrets detection...');
        try {
            execSync('trufflehog filesystem .', { cwd: ROOT_DIR, stdio: 'pipe' });
        } catch (error) {
            if (error.stdout) {
                secretsFound.push({ file: 'detected by trufflehog', pattern: error.stdout.toString() });
            }
        }
    } else {
        console.log('  No dedicated secrets scanner found, using best-effort pattern matching...');
        secretsFound.push(...runPatternBasedSecretsScan());
    }

    if (secretsFound.length > 0) {
        console.log(`\n⚠️  Found ${secretsFound.length} potential secret(s):`);
        secretsFound.forEach(s => console.log(`    - ${s.file}: ${s.pattern}`));
    } else {
        console.log('  ✅ No secrets detected');
    }

    return secretsFound;
}

/**
 * Pattern-based secrets scanning for files that will be included
 */
function runPatternBasedSecretsScan() {
    const secretsFound = [];
    const extensionsToScan = ['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.sql', '.css'];

    function scanDirectory(dir, relativePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relativePath, entry.name);

            // Skip excluded directories
            if (entry.isDirectory()) {
                if (['node_modules', '.git', '.next', '.export_sanitized', '.venv'].includes(entry.name)) {
                    continue;
                }
                scanDirectory(fullPath, relPath);
                continue;
            }

            // Skip non-scannable files
            const ext = path.extname(entry.name).toLowerCase();
            if (!extensionsToScan.includes(ext)) continue;

            // Skip env files
            if (entry.name.startsWith('.env')) continue;

            try {
                const content = fs.readFileSync(fullPath, 'utf-8');

                for (const { name, pattern } of SECRET_PATTERNS) {
                    const matches = content.match(pattern);
                    if (matches) {
                        // Filter out false positives (common patterns that aren't secrets)
                        const filtered = matches.filter(m => {
                            // Skip if it's a placeholder or example
                            if (m.includes('EXAMPLE') || m.includes('PLACEHOLDER') || m.includes('YOUR_')) return false;
                            // Skip if it's in a comment about secrets
                            if (m.includes('secret') && m.includes('//')) return false;
                            // Skip JWT-like patterns that are clearly not real (too short)
                            if (name === 'Supabase Key' && m.length < 150) return false;
                            return true;
                        });

                        if (filtered.length > 0) {
                            secretsFound.push({
                                file: relPath,
                                pattern: name,
                                count: filtered.length
                            });
                        }
                    }
                }
            } catch (_error) {
                // Skip files that can't be read
            }
        }
    }

    scanDirectory(ROOT_DIR);
    return secretsFound;
}

/**
 * Create temporary Repomix config
 */
function createRepomixConfig() {
    console.log('\n⚙️  Step 2: Creating Repomix configuration...\n');

    const config = {
        output: {
            filePath: CONFIG.outputFile,
            style: 'markdown',
            headerText: '', // Will be added in post-processing
            showLineNumbers: false,
        },
        ignore: {
            customPatterns: [
                // Exclude ALL exam paper JSON/JSONC files from data/
                'data/*.json',
                'data/*.jsonc',
                // Exclude sanitized data as well
                'data_sanitized/*.json',
                'data_sanitized/*.jsonc',
                // Secret files
                '.env',
                '.env.*',
                '.env.local',
                '.env.*.local',
                '*.pem',
                '*.key',
                '*.p12',
                '*.pfx',
                'id_rsa*',
                // Build artifacts
                '.next/**',
                'node_modules/**',
                '.venv/**',
                // Temp files
                '.export_sanitized/**',
                '.export_tmp/**',
                '.repomix-vs-codebase.json',
                // Output file
                'VS_Codebase.md',
            ],
        },
        include: [
            '**/*',
            // Only include the schema template from schemas/
            'schemas/paper_schema_v3.json',
        ],
    };

    const configPath = path.join(ROOT_DIR, CONFIG.tempRepomixConfig);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`  Created: ${CONFIG.tempRepomixConfig}`);

    return configPath;
}

/**
 * Run Repomix to generate the codebase export
 */
function runRepomix(configPath) {
    console.log('\n📦 Step 3: Running Repomix...\n');

    try {
        execSync(`npx repomix --config "${configPath}"`, {
            cwd: ROOT_DIR,
            stdio: 'inherit',
            encoding: 'utf-8'
        });
        return true;
    } catch (error) {
        console.error('❌ Repomix failed:', error.message);
        return false;
    }
}

/**
 * Get list of redacted files and what was redacted
 */
function getRedactionsList() {
    const redactions = [];

    // List all question paper JSON files that are excluded
    const dataDir = path.join(ROOT_DIR, CONFIG.dataDir);
    if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') || f.endsWith('.jsonc'));
        for (const file of files) {
            redactions.push({
                file: `data/${file}`,
                redacted: 'Entire file excluded',
                reason: 'Question paper content - contains actual exam questions and answers',
            });
        }
    }

    // Note about schema inclusion
    redactions.push({
        file: 'schemas/paper_schema_v3.json',
        redacted: 'INCLUDED (not redacted)',
        reason: 'Schema template showing data structure without actual exam content',
    });

    // Add standard exclusions
    redactions.push({
        file: '.env, .env.local, .env.*.local',
        redacted: 'All content',
        reason: 'Environment files may contain secrets (API keys, database credentials)',
    });

    return redactions;
}

/**
 * Add header with REDACTIONS section to the output file
 */
function addRedactionsHeader() {
    console.log('\n✏️  Step 4: Adding REDACTIONS header...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);

    if (!fs.existsSync(outputPath)) {
        console.error(`❌ Output file not found: ${CONFIG.outputFile}`);
        return false;
    }

    const content = fs.readFileSync(outputPath, 'utf-8');
    const redactions = getRedactionsList();
    const timestamp = new Date().toISOString();

    const header = `# VS_Codebase.md

## Generation Info

- **Repository**: cat_website_execution
- **Generated**: ${timestamp}
- **Command**: \`pnpm run export:vs_codebase\`

## REDACTIONS

The following content has been intentionally redacted from this export:

| File Path | What Was Redacted | Reason |
|-----------|-------------------|--------|
${redactions.map(r => `| ${r.file} | ${r.redacted} | ${r.reason} |`).join('\n')}

### Notes on Exam Paper JSON/JSONC

Exam paper JSON/JSONC files from \`/data\` are excluded entirely from this export.
Only the schema template is included for reference.

---

`;

    // Find where the actual repomix content starts and prepend our header
    // Repomix typically starts with "# " or similar
    const newContent = header + content;

    fs.writeFileSync(outputPath, newContent);
    console.log(`  ✅ Added REDACTIONS header to ${CONFIG.outputFile}`);

    return true;
}

/**
 * Run post-pass to redact any remaining secrets in output
 */
function runPostPassRedaction() {
    console.log('\n🔒 Step 5: Running post-pass redaction...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);
    let content = fs.readFileSync(outputPath, 'utf-8');
    let redactedCount = 0;

    // Patterns that look like real secrets (not examples)
    const postPassPatterns = [
        { pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, name: 'JWT Token' },
        { pattern: /sk_live_[A-Za-z0-9]{24,}/g, name: 'Stripe Live Key' },
        { pattern: /sk_test_[A-Za-z0-9]{24,}/g, name: 'Stripe Test Key' },
        { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },
    ];

    for (const { pattern, name } of postPassPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, '<REDACTED_SECRET>');
            redactedCount += matches.length;
            console.log(`  Redacted ${matches.length} ${name}(s)`);
        }
    }

    if (redactedCount > 0) {
        fs.writeFileSync(outputPath, content);
        console.log(`  ✅ Redacted ${redactedCount} potential secret(s)`);
    } else {
        console.log('  ✅ No additional secrets found in output');
    }

    return true;
}

/**
 * Cleanup temporary files
 */
function cleanup() {
    console.log('\n🧹 Step 6: Cleanup...\n');

    const configPath = path.join(ROOT_DIR, CONFIG.tempRepomixConfig);
    if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        console.log(`  Removed: ${CONFIG.tempRepomixConfig}`);
    }

    // No temp directories to keep
}

/**
 * Verify the output
 */
function verifyOutput() {
    console.log('\n✅ Step 7: Verification...\n');

    const outputPath = path.join(ROOT_DIR, CONFIG.outputFile);

    if (!fs.existsSync(outputPath)) {
        console.error(`  ❌ Output file not found: ${CONFIG.outputFile}`);
        return false;
    }

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`  📄 Output: ${CONFIG.outputFile}`);
    console.log(`  📏 Size: ${sizeKB} KB (${sizeMB} MB)`);

    // Quick content verification
    const content = fs.readFileSync(outputPath, 'utf-8');

    // Check for REDACTIONS section
    if (!content.includes('## REDACTIONS')) {
        console.error('  ❌ REDACTIONS section missing');
        return false;
    }
    console.log('  ✅ REDACTIONS section present');

    // Check that no actual .env values leaked (look for actual key=value patterns with real values)
    // We check for patterns like KEY=eyJ... or KEY="actual-long-value"
    const envValuePatterns = [
        /SUPABASE_SERVICE_ROLE_KEY=eyJ[A-Za-z0-9_\-\.]+/,
        /NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[A-Za-z0-9_\-\.]+/,
        /SUPABASE_URL=https:\/\/[a-z0-9]+\.supabase\.co/,
    ];

    let envLeakDetected = false;
    for (const pattern of envValuePatterns) {
        if (pattern.test(content)) {
            console.error(`  ❌ Environment variable value detected: ${pattern.source}`);
            envLeakDetected = true;
        }
    }

    if (!envLeakDetected) {
        console.log('  ✅ No environment variable values leaked');
    } else {
        return false;
    }

    // Check that sanitized data is used (look for placeholders)
    if (content.includes('paper_schema_v3.json')) {
        console.log('  ✅ Schema file included');
    } else {
        console.log('  ⚠️  Schema file not found in output');
    }

    // Check that question paper files are NOT included
    const questionPaperPatterns = [
        'CAT-2023-Slot',
        'CAT-2024-Slot',
        'CAT-2025-Slot',
        'cat-2024-mock',
        'sample-paper-template',
    ];
    let _questionPaperFound = false;
    for (const pattern of questionPaperPatterns) {
        if (content.includes(pattern) && !content.includes('REDACTIONS')) {
            // Check if it's just in the redactions table
            const afterRedactions = content.split('---')[1] || '';
            if (afterRedactions.includes(pattern)) {
                console.log(`  ⚠️  Found '${pattern}' in output - may be a reference only`);
            }
        }
    }

    return true;
}

/**
 * Main orchestration
 */
async function main() {
    console.log('═'.repeat(60));
    console.log('  VS_Codebase.md Export Tool');
    console.log('═'.repeat(60));
    console.log();

    const startTime = Date.now();

    // Step 1: Secrets check
    const secretsFound = runSecretsCheck();
    if (secretsFound.length > 0) {
        console.log('\n⚠️  Secrets were detected. Review the findings above.');
        console.log('   Continuing with export (secrets will be excluded via ignore patterns)...');
    }

    // Step 2: Create Repomix config
    const configPath = createRepomixConfig();

    // Step 3: Run Repomix
    if (!runRepomix(configPath)) {
        process.exit(1);
    }

    // Step 4: Add REDACTIONS header
    if (!addRedactionsHeader()) {
        process.exit(1);
    }

    // Step 5: Post-pass redaction
    runPostPassRedaction();

    // Step 6: Cleanup
    cleanup();

    // Step 7: Verify
    const verified = verifyOutput();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log();
    console.log('═'.repeat(60));
    if (verified) {
        console.log(`  ✅ Export complete! (${elapsed}s)`);
        console.log(`  📄 Output: ${CONFIG.outputFile}`);
        console.log();
        console.log('  Next steps:');
        console.log('  1. Review VS_Codebase.md for any remaining sensitive content');
        console.log('  2. Copy contents to your Word document');
        console.log('  3. Upload with your GOA plan to ChatGPT');
    } else {
        console.log(`  ❌ Export completed with warnings (${elapsed}s)`);
        console.log('  Please review the output manually.');
    }
    console.log('═'.repeat(60));

    process.exit(verified ? 0 : 1);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
````

## File: scripts/import-paper-v3.mjs
````javascript
#!/usr/bin/env node
/**
 * @fileoverview Paper Import Script v3 (Sets-First)
 * @description CLI tool to import papers using Schema v3.0 (question_sets → questions)
 * @usage node scripts/import-paper-v3.mjs <path-to-json-file> [options]
 * 
 * Schema v3.0 Structure:
 *   - paper: Paper metadata
 *   - question_sets[]: Parent containers (inserted FIRST)
 *   - questions[]: Children that reference sets via set_ref
 * 
 * Options:
 *   --publish             Publish the paper immediately after import
 *   --dry-run             Validate and show what would be done, but don't write
 *   --upsert              Use upsert mode (requires semantic keys in DB)
 *   --notes <text>        Import notes (optional)
 *   --skip-if-duplicate   Skip import if JSON hash already exists
 *   --help, -h            Show help message
 */

import { readFileSync } from 'fs';
import { createHash, randomUUID } from 'crypto';
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
    console.error('Set them in .env.local or pass via environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// =============================================================================
// SCHEMA V3 VALIDATION (Phase 3)
// =============================================================================

const VALID_SECTIONS = ['VARC', 'DILR', 'QA'];
const VALID_SET_TYPES = ['VARC', 'DILR', 'CASELET', 'ATOMIC'];
const VALID_QUESTION_TYPES = ['MCQ', 'TITA'];
const VALID_CONTEXT_TYPES = [
    'rc_passage', 'dilr_set', 'caselet', 'data_table', 'graph', 'other_shared_stimulus'
];
const VALID_CONTENT_LAYOUTS = [
    'split_passage', 'split_chart', 'split_table', 'single_focus', 'image_top'
];
const COMPOSITE_SET_TYPES = ['VARC', 'DILR', 'CASELET'];

class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

function validateSchemaVersion(data) {
    if (data.schema_version !== 'v3.0') {
        throw new ValidationError(
            `Schema version must be 'v3.0' for sets-first import. Got: ${data.schema_version || 'undefined'}`,
            ['Use schema_version: "v3.0" for the sets-first importer']
        );
    }
}

function validatePaper(paper) {
    const errors = [];
    const required = ['slug', 'title'];

    for (const field of required) {
        if (!paper[field]) {
            errors.push(`paper.${field} is required`);
        }
    }

    if (paper.slug && !/^[a-z0-9-]+$/.test(paper.slug)) {
        errors.push(`paper.slug must be lowercase alphanumeric with hyphens: ${paper.slug}`);
    }

    if (paper.sections && !Array.isArray(paper.sections)) {
        errors.push('paper.sections must be an array');
    }

    if (errors.length > 0) {
        throw new ValidationError('Paper validation failed', errors);
    }

    return true;
}

function validateQuestionSets(sets) {
    const errors = [];
    const clientSetIds = new Set();

    if (!Array.isArray(sets)) {
        throw new ValidationError('question_sets must be an array');
    }

    sets.forEach((set, index) => {
        const prefix = `question_sets[${index}]`;

        // Required fields
        if (!set.client_set_id) {
            errors.push(`${prefix}.client_set_id is required`);
        } else if (!/^[A-Z0-9_]+$/.test(set.client_set_id)) {
            errors.push(`${prefix}.client_set_id must be uppercase alphanumeric with underscores: ${set.client_set_id}`);
        } else if (clientSetIds.has(set.client_set_id)) {
            errors.push(`${prefix}.client_set_id is duplicate: ${set.client_set_id}`);
        } else {
            clientSetIds.add(set.client_set_id);
        }

        if (!set.section) {
            errors.push(`${prefix}.section is required`);
        } else if (!VALID_SECTIONS.includes(set.section)) {
            errors.push(`${prefix}.section must be one of ${VALID_SECTIONS.join(', ')}: ${set.section}`);
        }

        if (!set.set_type) {
            errors.push(`${prefix}.set_type is required`);
        } else if (!VALID_SET_TYPES.includes(set.set_type)) {
            errors.push(`${prefix}.set_type must be one of ${VALID_SET_TYPES.join(', ')}: ${set.set_type}`);
        }

        if (set.display_order === undefined || set.display_order === null) {
            errors.push(`${prefix}.display_order is required`);
        }

        // Composite sets require context_body
        if (COMPOSITE_SET_TYPES.includes(set.set_type)) {
            if (!set.context_body || set.context_body.trim() === '') {
                errors.push(`${prefix}.context_body is required for ${set.set_type} sets`);
            }
        }

        // Validate context_type if provided
        if (set.context_type && !VALID_CONTEXT_TYPES.includes(set.context_type)) {
            errors.push(`${prefix}.context_type must be one of ${VALID_CONTEXT_TYPES.join(', ')}: ${set.context_type}`);
        }

        // Validate content_layout if provided
        if (set.content_layout && !VALID_CONTENT_LAYOUTS.includes(set.content_layout)) {
            errors.push(`${prefix}.content_layout must be one of ${VALID_CONTENT_LAYOUTS.join(', ')}: ${set.content_layout}`);
        }
    });

    if (errors.length > 0) {
        throw new ValidationError('Question sets validation failed', errors);
    }

    return clientSetIds;
}

function validateQuestions(questions, validSetRefs) {
    const errors = [];
    const clientQuestionIds = new Set();

    if (!Array.isArray(questions)) {
        throw new ValidationError('questions must be an array');
    }

    questions.forEach((q, index) => {
        const prefix = `questions[${index}]`;

        // Required fields
        if (!q.client_question_id) {
            errors.push(`${prefix}.client_question_id is required`);
        } else if (clientQuestionIds.has(q.client_question_id)) {
            errors.push(`${prefix}.client_question_id is duplicate: ${q.client_question_id}`);
        } else {
            clientQuestionIds.add(q.client_question_id);
        }

        if (!q.set_ref) {
            errors.push(`${prefix}.set_ref is required`);
        } else if (!validSetRefs.has(q.set_ref)) {
            errors.push(`${prefix}.set_ref references non-existent set: ${q.set_ref}`);
        }

        if (!q.sequence_order && q.sequence_order !== 0) {
            errors.push(`${prefix}.sequence_order is required`);
        }

        if (!q.question_number && q.question_number !== 0) {
            errors.push(`${prefix}.question_number is required`);
        }

        if (!q.question_text) {
            errors.push(`${prefix}.question_text is required`);
        }

        if (!q.question_type) {

            if (q.question_format && !VALID_QUESTION_TYPES.includes(q.question_format)) {
                errors.push(`${prefix}.question_format must be one of ${VALID_QUESTION_TYPES.join(', ')}: ${q.question_format}`);
            }

            if (q.correct_answer !== undefined && q.correct_answer !== null) {
                if (q.question_type === 'MCQ') {
                    const isString = typeof q.correct_answer === 'string';
                    const isStringArray = Array.isArray(q.correct_answer) && q.correct_answer.every(a => typeof a === 'string');
                    if (!isString && !isStringArray) {
                        errors.push(`${prefix}.correct_answer must be a string or string[] for MCQ questions`);
                    }
                }
                if (q.question_type === 'TITA') {
                    const isString = typeof q.correct_answer === 'string';
                    const isNumber = typeof q.correct_answer === 'number';
                    if (!isString && !isNumber) {
                        errors.push(`${prefix}.correct_answer must be a string or number for TITA questions`);
                    }
                }
            }
            errors.push(`${prefix}.question_type is required`);
        } else if (!VALID_QUESTION_TYPES.includes(q.question_type)) {
            errors.push(`${prefix}.question_type must be one of ${VALID_QUESTION_TYPES.join(', ')}: ${q.question_type}`);
        }

        // MCQ requires options
        if (q.question_type === 'MCQ') {
            if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                errors.push(`${prefix}.options is required for MCQ questions`);
            } else {
                // Accept either string array ["A text", "B text"] or object array [{id, text}]
                const firstOpt = q.options[0];
                const isObjectFormat = typeof firstOpt === 'object' && firstOpt !== null;

                if (isObjectFormat) {
                    q.options.forEach((opt, optIdx) => {
                        if (!opt.id) {
                            errors.push(`${prefix}.options[${optIdx}].id is required`);
                        }
                        if (!opt.text && opt.text !== '') {
                            errors.push(`${prefix}.options[${optIdx}].text is required`);
                        }
                    });
                }
                // String format is valid as-is
            }
        }

        // Section validation
        if (q.section && !VALID_SECTIONS.includes(q.section)) {
            errors.push(`${prefix}.section must be one of ${VALID_SECTIONS.join(', ')}: ${q.section}`);
        }
    });

    if (errors.length > 0) {
        throw new ValidationError('Questions validation failed', errors);
    }

    return true;
}

function validateV3Data(data) {
    console.log('🔍 Validating Schema v3.0 payload...\n');

    // Check schema version
    validateSchemaVersion(data);

    // Check required root keys
    if (!data.paper) {
        throw new ValidationError('Missing required root key: paper');
    }
    if (!data.question_sets) {
        throw new ValidationError('Missing required root key: question_sets');
    }
    if (!data.questions) {
        throw new ValidationError('Missing required root key: questions');
    }

    // Validate paper
    validatePaper(data.paper);
    console.log('   ✅ paper validated');

    // Validate question_sets and collect valid client_set_ids
    const validSetRefs = validateQuestionSets(data.question_sets);
    console.log(`   ✅ question_sets validated (${data.question_sets.length} sets)`);

    // Validate questions against valid set refs
    validateQuestions(data.questions, validSetRefs);
    console.log(`   ✅ questions validated (${data.questions.length} questions)`);

    console.log('\n✅ All validation passed\n');
    return true;
}

// =============================================================================
// HASH FUNCTIONS
// =============================================================================

function computeJsonHash(data) {
    const jsonStr = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(jsonStr).digest('hex');
}

// =============================================================================
// IMPORT FUNCTIONS (Phase 2 - Sets-First)
// =============================================================================

async function importPaperV3(paperData, options = {}) {
    const { upsert = false, dryRun = false } = options;

    console.log(`📄 ${dryRun ? '[DRY RUN] ' : ''}Importing paper: ${paperData.title}`);

    if (dryRun) {
        console.log(`   Would create/update paper with slug: ${paperData.slug}`);
        return { id: 'dry-run-id', slug: paperData.slug };
    }

    // Check if paper exists
    const { data: existing } = await supabase
        .from('papers')
        .select('id')
        .eq('slug', paperData.slug)
        .single();

    const paperPayload = {
        slug: paperData.slug,
        title: paperData.title,
        description: paperData.description || null,
        year: paperData.year || new Date().getFullYear(),
        total_questions: paperData.total_questions || 0,
        total_marks: paperData.total_marks || 198,
        duration_minutes: paperData.duration_minutes || 120,
        sections: paperData.sections || ['VARC', 'DILR', 'QA'],
        default_positive_marks: paperData.default_positive_marks || 3.0,
        default_negative_marks: paperData.default_negative_marks || 1.0,
        difficulty_level: paperData.difficulty_level || 'medium',
        is_free: paperData.is_free ?? false,
        published: paperData.published ?? false,
        allow_pause: paperData.allow_pause ?? true,
        attempt_limit: paperData.attempt_limit ?? 0,
    };

    // Add paper_key if using upsert mode
    if (upsert && paperData.paper_key) {
        paperPayload.paper_key = paperData.paper_key;
    }

    if (existing) {
        console.log(`   ⚠️  Paper exists (id: ${existing.id}), updating...`);

        const { data, error } = await supabase
            .from('papers')
            .update(paperPayload)
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    const { data, error } = await supabase
        .from('papers')
        .insert(paperPayload)
        .select()
        .single();

    if (error) throw error;
    console.log(`   ✅ Paper created with id: ${data.id}`);
    return data;
}

async function importQuestionSetsV3(paperId, sets, options = {}) {
    const { upsert = false, dryRun = false } = options;

    console.log(`\n📋 ${dryRun ? '[DRY RUN] ' : ''}Importing ${sets.length} question_sets (SETS-FIRST)...`);

    // Build client_set_id → UUID map
    const setIdMap = {};

    if (dryRun) {
        sets.forEach(set => {
            setIdMap[set.client_set_id] = `dry-run-uuid-${set.client_set_id}`;
            console.log(`   Would create set: ${set.client_set_id} (${set.set_type})`);
        });
        return { count: sets.length, setIdMap };
    }

    // Delete existing sets (unless upsert mode)
    if (!upsert) {
        const { error: deleteError } = await supabase
            .from('question_sets')
            .delete()
            .eq('paper_id', paperId);

        if (deleteError) {
            console.warn(`   ⚠️  Could not delete existing question_sets: ${deleteError.message}`);
        }
    }

    // Prepare sets for insertion
    const setsToInsert = sets.map(set => {
        const newId = randomUUID();
        setIdMap[set.client_set_id] = newId;

        // Infer context_type from set_type if not provided
        let contextType = set.context_type;
        if (!contextType && set.set_type !== 'ATOMIC') {
            contextType = {
                'VARC': 'rc_passage',
                'DILR': 'dilr_set',
                'CASELET': 'caselet'
            }[set.set_type] || 'other_shared_stimulus';
        }

        // Infer content_layout
        let contentLayout = set.content_layout || 'single_focus';
        if (!set.content_layout) {
            if (set.context_image_url) {
                contentLayout = 'image_top';
            } else if (set.set_type === 'VARC') {
                contentLayout = 'split_passage';
            } else if (set.set_type === 'DILR') {
                contentLayout = 'split_chart';
            } else if (set.set_type === 'CASELET') {
                contentLayout = 'split_table';
            } else {
                contentLayout = 'single_focus';
            }
        }

        return {
            id: newId,
            paper_id: paperId,
            section: set.section,
            set_type: set.set_type,
            context_type: contextType,
            content_layout: contentLayout,
            context_title: set.context_title || null,
            context_body: set.context_body || null,
            context_image_url: set.context_image_url || null,
            context_additional_images: set.context_additional_images || null,
            display_order: set.display_order,
            is_active: set.is_active ?? true,
            is_published: true, // Sets must be published to be visible through question_sets_with_questions view
            metadata: set.metadata || {},
            client_set_id: set.client_set_id, // Store for upsert support
        };
    });

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < setsToInsert.length; i += batchSize) {
        const batch = setsToInsert.slice(i, i + batchSize);
        const { error } = await supabase
            .from('question_sets')
            .insert(batch);

        if (error) throw error;
        inserted += batch.length;
    }

    console.log(`   ✅ Created ${inserted} question_sets`);
    console.log(`   📍 Set ID map built: ${Object.keys(setIdMap).length} entries`);

    return { count: inserted, setIdMap };
}

async function importQuestionsV3(paperId, questions, setIdMap, options = {}) {
    const { upsert = false, dryRun = false } = options;

    console.log(`\n📝 ${dryRun ? '[DRY RUN] ' : ''}Importing ${questions.length} questions (using set_ref → set_id mapping)...`);

    if (dryRun) {
        questions.forEach(q => {
            const setId = setIdMap[q.set_ref];
            console.log(`   Q${q.question_number}: ${q.client_question_id} → set ${q.set_ref} (${setId ? '✅' : '❌'})`);
        });
        return questions.length;
    }

    // Delete existing questions (unless upsert mode)
    if (!upsert) {
        const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('paper_id', paperId);

        if (deleteError) {
            console.warn(`   ⚠️  Could not delete existing questions: ${deleteError.message}`);
        }
    }

    // Prepare questions for insertion
    const questionsToInsert = questions.map(q => {
        const setId = setIdMap[q.set_ref];
        if (!setId) {
            throw new Error(`Question ${q.client_question_id} references unknown set: ${q.set_ref}`);
        }

        // Convert options from {id, text} format to string[] format
        // The MCQRenderer expects options as string array: ["Option A text", "Option B text", ...]
        let normalizedOptions = null;
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            const firstOpt = q.options[0];
            if (typeof firstOpt === 'object' && firstOpt !== null && 'text' in firstOpt) {
                // Convert {id, text}[] to string[]
                // Sort by id (A, B, C, D) to ensure correct order
                const sorted = [...q.options].sort((a, b) => a.id.localeCompare(b.id));
                normalizedOptions = sorted.map(opt => opt.text);
            } else {
                // Already string[] format
                normalizedOptions = q.options;
            }
        }

        return {
            id: randomUUID(),
            paper_id: paperId,
            section: q.section,
            question_number: q.question_number,
            question_text: q.question_text,
            question_type: q.question_type,
            question_format: q.question_format || q.question_type,
            taxonomy_type: q.taxonomy_type || null,
            topic_tag: q.topic_tag || null,
            difficulty_rationale: q.difficulty_rationale || null,
            options: normalizedOptions,
            correct_answer: q.correct_answer,
            positive_marks: q.positive_marks ?? 3.0,
            negative_marks: q.negative_marks ?? (q.question_type === 'TITA' ? 0 : 1.0),
            difficulty: q.difficulty || null,
            topic: q.topic || null,
            subtopic: q.subtopic || null,
            solution_text: q.solution_text || null,
            solution_image_url: q.solution_image_url || null,
            video_solution_url: q.video_solution_url || null,
            set_id: setId,
            sequence_order: q.sequence_order,
            is_active: true,
            client_question_id: q.client_question_id, // Store for upsert support
        };
    });

    // Insert in batches
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

async function createIngestRun(paperId, canonicalJson, options = {}) {
    const { notes = null, skipIfDuplicate = false, dryRun = false } = options;

    if (dryRun) {
        console.log(`\n📦 [DRY RUN] Would create ingest run record`);
        return { dryRun: true };
    }

    console.log(`\n📦 Creating ingest run record...`);

    const canonicalHash = computeJsonHash(canonicalJson);

    if (skipIfDuplicate) {
        const { data: existing } = await supabase
            .from('paper_ingest_runs')
            .select('id, version_number')
            .eq('paper_id', paperId)
            .eq('canonical_json_hash', canonicalHash)
            .single();

        if (existing) {
            console.log(`   ⚠️  Duplicate detected - same JSON already imported as version ${existing.version_number}`);
            return { skipped: true, existing };
        }
    }

    // Get next version number
    const { data: maxVersion } = await supabase
        .from('paper_ingest_runs')
        .select('version_number')
        .eq('paper_id', paperId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

    const nextVersion = (maxVersion?.version_number || 0) + 1;

    const { data: ingestRun, error } = await supabase
        .from('paper_ingest_runs')
        .insert({
            paper_id: paperId,
            schema_version: 'v3.0',
            version_number: nextVersion,
            canonical_paper_json: canonicalJson,
            canonical_json_hash: canonicalHash,
            import_notes: notes || 'Imported via v3 sets-first importer',
        })
        .select()
        .single();

    if (error) throw error;

    // Update paper's latest_ingest_run_id
    await supabase
        .from('papers')
        .update({ latest_ingest_run_id: ingestRun.id })
        .eq('id', paperId);

    console.log(`   ✅ Created ingest run v${nextVersion} (${ingestRun.id})`);
    return { ingestRun, version: nextVersion };
}

async function publishPaper(paperId, shouldPublish, dryRun = false) {
    if (!shouldPublish) {
        console.log(`\n📋 Paper saved as draft (use --publish to publish)`);
        return;
    }

    if (dryRun) {
        console.log(`\n🚀 [DRY RUN] Would publish paper`);
        return;
    }

    const { error: paperError } = await supabase
        .from('papers')
        .update({ published: true })
        .eq('id', paperId);

    if (paperError) throw paperError;

    const { error: setsError } = await supabase
        .from('question_sets')
        .update({ is_published: true })
        .eq('paper_id', paperId);

    if (setsError) {
        console.warn(`   ⚠️  Could not publish question_sets: ${setsError.message}`);
    }

    console.log(`\n🚀 Paper published!`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║            CAT Paper Import Tool v3 (Sets-First)                     ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/import-paper-v3.mjs <path-to-json-file> [options]

Options:
  --publish             Publish the paper immediately after import
  --dry-run             Validate and show what would be done, but don't write
  --upsert              Use upsert mode (requires semantic keys in DB)
  --notes <text>        Import notes (optional)
  --skip-if-duplicate   Skip import if JSON hash already exists
  --help, -h            Show this help message

Schema v3.0 (Sets-First) Structure:
  {
    "schema_version": "v3.0",
    "paper": { ... },
    "question_sets": [
      { "client_set_id": "VARC_RC_1", "section": "VARC", "set_type": "VARC", ... }
    ],
    "questions": [
      { "client_question_id": "Q1", "set_ref": "VARC_RC_1", ... }
    ]
  }

Import Flow:
  1. Validate schema version = v3.0
  2. Validate paper metadata
  3. Validate question_sets (all client_set_id unique)
  4. Validate questions (all set_ref exist in question_sets)
  5. Insert paper
  6. Insert question_sets FIRST (build client_set_id → UUID map)
  7. Insert questions using set_ref → set_id mapping
  8. Create ingest run for versioning

Examples:
  # Dry run to validate
  node scripts/import-paper-v3.mjs data/paper-v3.json --dry-run

  # Import and publish
  node scripts/import-paper-v3.mjs data/paper-v3.json --publish

  # Import with notes
  node scripts/import-paper-v3.mjs data/paper-v3.json --notes "Initial v3 import"

Reference:
  - Schema: schemas/paper_schema_v3.json
  - Template: data_sanitized/paper_schema_v3.template.json
  - Docs: docs/CONTENT-SCHEMA.md
`);
        process.exit(0);
    }

    // Parse arguments
    const jsonPath = args.find(a => !a.startsWith('--'));
    const shouldPublish = args.includes('--publish');
    const dryRun = args.includes('--dry-run');
    const upsert = args.includes('--upsert');
    const skipIfDuplicate = args.includes('--skip-if-duplicate');

    let notes = null;
    const notesIdx = args.indexOf('--notes');
    if (notesIdx !== -1 && args[notesIdx + 1]) {
        notes = args[notesIdx + 1];
    }

    if (!jsonPath) {
        console.error('❌ Please provide a path to the JSON file');
        process.exit(1);
    }

    try {
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║            CAT Paper Import Tool v3 (Sets-First)                     ║
╚══════════════════════════════════════════════════════════════════════╝
`);

        if (dryRun) {
            console.log('🔍 DRY RUN MODE - No changes will be made\n');
        }

        // Read and parse JSON
        console.log(`📂 Reading ${jsonPath}...`);
        const content = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(content);

        // Validate v3 schema
        validateV3Data(data);

        // Import paper
        const paper = await importPaperV3(data.paper, { upsert, dryRun });

        // Import question_sets FIRST
        const { count: setCount, setIdMap } = await importQuestionSetsV3(
            paper.id,
            data.question_sets,
            { upsert, dryRun }
        );

        // Import questions using set_ref → set_id mapping
        const questionCount = await importQuestionsV3(
            paper.id,
            data.questions,
            setIdMap,
            { upsert, dryRun }
        );

        // Create ingest run
        const ingestResult = await createIngestRun(paper.id, data, {
            notes,
            skipIfDuplicate,
            dryRun
        });

        if (ingestResult.skipped) {
            console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                     Import Skipped (Duplicate)                       ║
╠══════════════════════════════════════════════════════════════════════╣
║  Paper ID:    ${paper.id}
║  Slug:        ${paper.slug}
║  Existing:    Version ${ingestResult.existing.version_number}
╚══════════════════════════════════════════════════════════════════════╝
`);
            return;
        }

        // Publish if requested
        await publishPaper(paper.id, shouldPublish, dryRun);

        // Summary
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    Import Complete! ${dryRun ? '(DRY RUN)' : ''}                          
╠══════════════════════════════════════════════════════════════════════╣
║  Paper ID:    ${paper.id}
║  Slug:        ${data.paper.slug}
║  Version:     ${ingestResult.version || 'N/A (dry run)'}
║  Sets:        ${setCount}
║  Questions:   ${questionCount}
║  Published:   ${shouldPublish ? 'Yes' : 'No (draft)'}
╚══════════════════════════════════════════════════════════════════════╝
`);

    } catch (err) {
        if (err instanceof ValidationError) {
            console.error(`\n❌ Validation failed: ${err.message}`);
            if (err.errors && err.errors.length > 0) {
                console.error('\nErrors:');
                err.errors.forEach(e => console.error(`   • ${e}`));
            }
        } else {
            console.error(`\n❌ Import failed: ${err.message}`);
        }
        process.exit(1);
    }
}

main();
````

## File: scripts/markdown_to_json_parser_v3.mjs
````javascript
#!/usr/bin/env node
/*
 * markdown_to_json_parser_v3.mjs
 *
 * Parses CPM-AUTO (Compact Paper Markup — Auto Numbering) into JSON schema v3.0.
 * Usage:
 *   node scripts/markdown_to_json_parser_v3.mjs <input.md> [output.json]
 */

import fs from 'fs';
import path from 'path';
import { validatePaperSchema } from './ajv-validator.mjs';

function toBool(value) {
    if (value === undefined || value === null) return undefined;
    const v = String(value).trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
}

function toInt(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
}

function normalizeLine(line) {
    return line
        .replace(/\\_/g, '_')
        .replace(/\\>/g, '>')
        .replace(/\\\+/g, '+')
        .replace(/\\#/g, '#')
        .trim();
}

function parsePipeKeyValues(input) {
    const result = {};
    const parts = input.split('|').map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
        const eqIndex = part.indexOf('=');
        if (eqIndex === -1) continue;
        const key = part.slice(0, eqIndex).trim();
        const value = part.slice(eqIndex + 1).trim();
        result[key] = value;
    }
    return result;
}

function parsePaperLine(line) {
    const payload = line.replace(/^@P\s*/, '').trim();
    const data = parsePipeKeyValues(payload);
    const dm = (data.dm || '').split(',').map((s) => s.trim());
    const flags = {};
    if (data.flags) {
        for (const entry of data.flags.split(';')) {
            const [k, v] = entry.split('=').map((s) => s.trim());
            if (!k) continue;
            const boolVal = toBool(v);
            flags[k] = boolVal !== undefined ? boolVal : v;
        }
    }

    const schemaVersionRaw = data.v || '3.0';
    const schema_version = schemaVersionRaw.startsWith('v') ? schemaVersionRaw : `v${schemaVersionRaw}`;

    return {
        schema_version,
        paper: {
            paper_key: data.key,
            title: data.title,
            slug: data.slug,
            description: data.desc,
            year: toInt(data.year),
            total_questions: toInt(data.tq),
            total_marks: toInt(data.tm),
            duration_minutes: toInt(data.dur),
            sections: data.secs ? data.secs.split(',').map((s) => s.trim()).filter(Boolean) : [],
            default_positive_marks: toInt(dm[0]),
            default_negative_marks: toInt(dm[1]),
            difficulty_level: data.diff,
            is_free: toBool(flags.is_free) ?? undefined,
            published: toBool(flags.published) ?? undefined,
            allow_pause: toBool(flags.allow_pause) ?? undefined,
            attempt_limit: toInt(flags.attempt_limit)
        }
    };
}

function parseSetLine(line) {
    const payload = line.replace(/^@SET\s*/, '').trim();
    const firstSplit = payload.split('|');
    const setId = firstSplit[0].trim();
    const rest = firstSplit.slice(1).join('|');
    const data = parsePipeKeyValues(rest);
    return {
        setId,
        data
    };
}

function normalizeToken(value) {
    if (value === undefined || value === null) return value;
    return String(value).replace(/\\/g, '').trim();
}

function normalizeContextType(raw) {
    const value = normalizeToken(raw);
    if (!value) return undefined;
    return value;
}

function normalizeContentLayout(raw) {
    const value = normalizeToken(raw);
    if (!value) return undefined;
    if (value === 'text_only') return 'split_passage';
    if (value === 'split_view') return 'split_table';
    return value;
}

function parseQuestionLine(line) {
    const payload = line.replace(/^@Q\s*/, '').trim();
    const data = parsePipeKeyValues(payload);
    return data;
}

function parseMarkdownToV3(markdownText) {
    const lines = markdownText.split(/\r?\n/);

    let schema_version = 'v3.0';
    let paper = null;
    const question_sets = [];
    const questions = [];

    let currentSection = null;
    let currentSet = null;
    let sectionSetOrder = {};
    let setQuestionOrder = 0;
    let globalQuestionNumber = 0;

    let inContext = false;
    let contextBuffer = [];

    let inQuestion = false;
    let questionData = null;
    let questionTextLines = [];
    let solutionLines = [];
    let options = [];
    let inSolution = false;

    function finalizeContext() {
        if (currentSet && contextBuffer.length) {
            currentSet.context_body = contextBuffer.join('\n').trim();
        }
        contextBuffer = [];
        inContext = false;
    }

    function finalizeQuestion() {
        if (!questionData) return;
        const question_text = questionTextLines.join('\n').trim();
        const solution_text = solutionLines.join('\n').trim();
        const question = {
            ...questionData,
            question_text
        };
        if (options.length) {
            question.options = options;
        }
        if (solution_text) {
            question.solution_text = solution_text;
        }
        questions.push(question);

        inQuestion = false;
        inSolution = false;
        questionData = null;
        questionTextLines = [];
        solutionLines = [];
        options = [];
    }

    for (const rawLine of lines) {
        const line = normalizeLine(rawLine);
        if (!line || line.startsWith('#')) {
            continue;
        }

        if (line === '@END_CTX') {
            finalizeContext();
            continue;
        }

        if (line === '@END_Q') {
            finalizeQuestion();
            continue;
        }

        if (line === '@END_SET') {
            currentSet = null;
            setQuestionOrder = 0;
            continue;
        }

        if (line === '@END_S') {
            currentSection = null;
            continue;
        }

        if (line === '@CTX') {
            inContext = true;
            continue;
        }

        if (line.startsWith('@P ')) {
            const paperPayload = parsePaperLine(line);
            schema_version = paperPayload.schema_version;
            paper = paperPayload.paper;
            continue;
        }

        if (line.startsWith('@S ')) {
            currentSection = line.replace(/^@S\s*/, '').trim();
            if (!sectionSetOrder[currentSection]) {
                sectionSetOrder[currentSection] = 0;
            }
            continue;
        }

        if (line.startsWith('@SET ')) {
            finalizeContext();
            const { setId, data } = parseSetLine(line);
            const order = (sectionSetOrder[currentSection] || 0) + 1;
            sectionSetOrder[currentSection] = order;
            const normalizedSetId = normalizeToken(setId);
            const normalizedContextType = normalizeContextType(data.ctx);
            const normalizedContentLayout = normalizeContentLayout(data.layout);
            const normalizedSetType = normalizeToken(data.type);
            currentSet = {
                client_set_id: normalizedSetId,
                section: currentSection,
                set_type: normalizedSetType,
                display_order: order,
                context_type: normalizedContextType,
                context_title: data.title,
                content_layout: normalizedContentLayout
            };

            // Only include context_image_url if it has a valid value (schema requires URI format)
            if (data.image_url) {
                currentSet.context_image_url = data.image_url;
            }

            if (normalizedSetType === 'ATOMIC') {
                delete currentSet.context_type;
                delete currentSet.content_layout;
            }

            question_sets.push(currentSet);
            setQuestionOrder = 0;
            continue;
        }

        if (line.startsWith('@Q ')) {
            finalizeQuestion();
            const data = parseQuestionLine(line);
            setQuestionOrder += 1;
            globalQuestionNumber += 1;
            const dm = (data.m || '').split(',').map((s) => s.trim());
            const sanitizedKey = paper?.paper_key ? paper.paper_key.replace(/[^A-Za-z0-9_]/g, '_') : null;
            const client_question_id = data.id || (sanitizedKey ? `${sanitizedKey}_Q${globalQuestionNumber}` : `Q${globalQuestionNumber}`);
            questionData = {
                client_question_id,
                set_ref: currentSet?.client_set_id,
                sequence_order: setQuestionOrder,
                section: currentSection,
                question_number: globalQuestionNumber,
                question_type: data.type,
                taxonomy_type: data.tax,
                topic: data.topic,
                subtopic: data.sub,
                difficulty: data.diff,
                correct_answer: data.ans,
                positive_marks: toInt(dm[0]) ?? paper?.default_positive_marks,
                negative_marks: toInt(dm[1]) ?? paper?.default_negative_marks
            };
            inQuestion = true;
            inSolution = false;
            continue;
        }

        if (inContext) {
            contextBuffer.push(rawLine.replace(/\r?\n?$/, ''));
            continue;
        }

        if (inQuestion) {
            if (line.startsWith('?')) {
                questionTextLines.push(line.replace(/^\?\s?/, ''));
                continue;
            }
            if (/^[A-Z]\./.test(line)) {
                const optionId = line[0];
                const optionText = line.slice(2).trim();
                options.push({ id: optionId, text: optionText });
                continue;
            }
            if (line.startsWith('>')) {
                inSolution = true;
                solutionLines.push(line.replace(/^>\s?/, ''));
                continue;
            }
            if (inSolution) {
                solutionLines.push(line);
                continue;
            }
            if (questionTextLines.length) {
                questionTextLines.push(line);
            }
        }
    }

    finalizeContext();
    finalizeQuestion();

    return {
        schema_version,
        paper,
        question_sets,
        questions
    };
}

function formatAjvErrors(errors = []) {
    return errors.map((err) => {
        const path = err.instancePath || '(root)';
        const message = err.message || err.keyword || 'schema validation error';
        return `${path} ${message}`.trim();
    });
}

function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3];

    if (!inputPath) {
        console.error('Usage: node scripts/markdown_to_json_parser_v3.mjs <input.md> [output.json]');
        process.exit(1);
    }

    const markdownText = fs.readFileSync(inputPath, 'utf8');
    const result = parseMarkdownToV3(markdownText);
    const ajvResult = validatePaperSchema(result);
    const ajvErrors = ajvResult.valid ? [] : formatAjvErrors(ajvResult.errors);

    if (ajvErrors.length > 0) {
        console.error('❌ AJV schema validation errors:');
        ajvErrors.forEach((e) => console.error(`   - ${e}`));
        console.error('');
        console.log('⚠️  Writing output anyway for debugging...');
    }

    const output = JSON.stringify(result, null, 2);

    if (outputPath) {
        fs.writeFileSync(outputPath, output, 'utf8');
    } else {
        const derivedPath = path.join(process.cwd(), 'paper_v3.json');
        fs.writeFileSync(derivedPath, output, 'utf8');
        console.log(`Wrote ${derivedPath}`);
    }

    if (ajvErrors.length > 0) {
        process.exit(1);
    }
}

if (process.argv[1] && process.argv[1].includes('markdown_to_json_parser_v3.mjs')) {
    main();
}

export { parseMarkdownToV3 };
````

## File: scripts/parse-md-to-v3.mjs
````javascript
#!/usr/bin/env node
/**
 * @fileoverview Markdown to Schema v3.0 JSON Parser
 * @description Parses custom markdown format CAT papers to v3.0 JSON schema
 * @usage node scripts/parse-md-to-v3.mjs <input.md> [output.json]
 */

import { readFileSync, writeFileSync } from 'fs';
import { validatePaperSchema } from './ajv-validator.mjs';

// =============================================================================
// YAML FRONTMATTER PARSER
// =============================================================================

function parseYamlFrontmatter(content) {
    // Handle escaped format (with backslashes) and regular format
    let yamlMatch = content.match(/^(?:YAML\s*\n)?\\?---\s*([\s\S]*?)\\?---/);
    if (!yamlMatch) {
        throw new Error('No YAML frontmatter found');
    }

    const yamlContent = yamlMatch[1];
    const paper = {};
    const lines = yamlContent.split('\n');

    let currentKey = null;
    let inArray = false;
    let arrayItems = [];

    for (let line of lines) {
        // Clean up escaped underscores and backslashes
        line = line.replace(/\\_/g, '_').replace(/\\\*/g, '*').trim();

        if (!line || line.startsWith('#')) continue;

        // Array item
        if (line.startsWith('- ') || line.startsWith('\\- ')) {
            const item = line.replace(/^\\?-\s*/, '').trim();
            if (item.includes(':')) {
                // Object in array like "section: VARC"
                const [k, v] = item.split(':').map(s => s.trim());
                if (inArray && currentKey === 'sections') {
                    // For sections array with objects, extract section name
                    if (k === 'section') {
                        arrayItems.push(v);
                    }
                }
            } else {
                arrayItems.push(item);
            }
            continue;
        }

        // Key-value pair
        const kvMatch = line.match(/^([a-z_]+):\s*(.*)$/i);
        if (kvMatch) {
            // Save previous array if any
            if (inArray && currentKey) {
                paper[currentKey] = arrayItems;
                arrayItems = [];
                inArray = false;
            }

            currentKey = kvMatch[1].toLowerCase();
            let value = kvMatch[2].trim();

            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');

            if (!value) {
                // Check if next line starts array
                inArray = true;
                arrayItems = [];
            } else {
                // Parse value type
                if (value === 'true') paper[currentKey] = true;
                else if (value === 'false') paper[currentKey] = false;
                else if (/^\d+$/.test(value)) paper[currentKey] = parseInt(value, 10);
                else if (/^\d+\.\d+$/.test(value)) paper[currentKey] = parseFloat(value);
                else paper[currentKey] = value;
            }
        }
    }

    // Save last array if any
    if (inArray && currentKey) {
        paper[currentKey] = arrayItems;
    }

    return paper;
}

// =============================================================================
// MARKDOWN CONTENT PARSER
// =============================================================================

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\\_/g, '_')
        .replace(/\\\*/g, '*')
        .replace(/\\#/g, '#')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\-/g, '-')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .trim();
}

function parseSetBlock(block) {
    const set = {};
    const lines = block.split('\n');

    let contextBodyLines = [];
    let inContextBody = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Check for key: value pattern
        const kvMatch = line.match(/^([a-z_]+):\s*(.*)$/i);

        if (kvMatch && !inContextBody) {
            const key = cleanText(kvMatch[1]).toLowerCase();
            let value = cleanText(kvMatch[2]).trim();

            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');

            if (key === 'context_body') {
                if (value === '|' || value === '' || value === '""') {
                    inContextBody = true;
                    continue;
                } else {
                    set[key] = value;
                }
            } else if (key === 'display_order') {
                set[key] = parseInt(value, 10);
            } else if (key === 'metadata') {
                // Skip metadata for now, handle separately if needed
            } else if (key === 'source_pages') {
                // Skip
            } else {
                set[key] = value;
            }
        } else if (inContextBody) {
            // Check if this line starts a new field
            if (/^[a-z_]+:\s*/i.test(line) && !line.startsWith('  ')) {
                inContextBody = false;
                i--; // Re-process this line
            } else {
                contextBodyLines.push(cleanText(line));
            }
        }
    }

    if (contextBodyLines.length > 0) {
        set.context_body = contextBodyLines.join('\n').trim();
    }

    return set;
}

function parseQuestionBlock(block, currentSetId) {
    const question = {};
    const lines = block.split('\n');

    let questionTextLines = [];
    let _optionsLines = [];
    let solutionLines = [];
    let inQuestionText = false;
    let inOptions = false;
    let inSolution = false;
    let currentOptions = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const cleanLine = cleanText(line);

        // Check for option lines first (they may look like key: value)
        // Pattern: "  A: text" or "A: text" or "  A: "text""
        const optionMatch = cleanLine.match(/^\s*([A-D]):\s*(.+)$/i);
        if (optionMatch && inOptions) {
            let optText = optionMatch[2].replace(/^["']|["']$/g, '').trim();
            currentOptions.push({
                id: optionMatch[1].toUpperCase(),
                text: optText
            });
            continue;
        }

        // Check for key: value pattern
        const kvMatch = cleanLine.match(/^([a-z_]+):\s*(.*)$/i);

        if (kvMatch) {
            const key = kvMatch[1].toLowerCase();
            let value = kvMatch[2].trim();

            // End any multi-line sections
            if (inQuestionText && key !== 'question_text') {
                question.question_text = questionTextLines.join('\n').trim();
                questionTextLines = [];
                inQuestionText = false;
            }
            if (inOptions && key !== 'options' && !['a', 'b', 'c', 'd'].includes(key)) {
                inOptions = false;
            }
            if (inSolution && key !== 'solution_text') {
                question.solution_text = solutionLines.join('\n').trim();
                solutionLines = [];
                inSolution = false;
            }

            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');

            switch (key) {
                case 'client_question_id':
                    question.client_question_id = value;
                    break;
                case 'question_number':
                    question.question_number = parseInt(value, 10);
                    break;
                case 'sequence_order':
                    question.sequence_order = parseInt(value, 10);
                    break;
                case 'question_type':
                    question.question_type = value.toUpperCase();
                    break;
                case 'question_text':
                    if (value === '|' || value === '') {
                        inQuestionText = true;
                    } else {
                        question.question_text = value;
                    }
                    break;
                case 'options':
                    inOptions = true;
                    break;
                case 'a':
                case 'b':
                case 'c':
                case 'd':
                    // Option in key: value format
                    currentOptions.push({
                        id: key.toUpperCase(),
                        text: value
                    });
                    break;
                case 'correct_answer':
                    question.correct_answer = value.replace(/^["']|["']$/g, '');
                    break;
                case 'topic':
                    question.topic = value;
                    break;
                case 'subtopic':
                    question.subtopic = value;
                    break;
                case 'difficulty':
                    // Normalize difficulty values
                    let diff = value.toLowerCase();
                    if (diff === 'difficult') diff = 'hard';
                    question.difficulty = diff;
                    break;
                case 'solution_text':
                    if (value === '|' || value === '') {
                        inSolution = true;
                    } else {
                        question.solution_text = value;
                    }
                    break;
                case 'scoring':
                case 'negative_marks':
                case 'positive_marks':
                    if (key === 'negative_marks' && value === '0') {
                        question.negative_marks = 0;
                    }
                    break;
                case 'difficulty_rationale':
                    question.difficulty_rationale = value;
                    break;
            }
        } else if (inQuestionText) {
            questionTextLines.push(cleanLine);
        } else if (inOptions) {
            // Parse option lines like "A: "text"" or "A: text" with leading whitespace
            const optMatch = cleanLine.match(/^\s*([A-D]):\s*(.+)$/i);
            if (optMatch) {
                let optText = optMatch[2].replace(/^["']|["']$/g, '').trim();
                currentOptions.push({
                    id: optMatch[1].toUpperCase(),
                    text: optText
                });
            }
        } else if (inSolution) {
            solutionLines.push(cleanLine);
        }
    }

    // Finalize multi-line fields
    if (inQuestionText && questionTextLines.length > 0) {
        question.question_text = questionTextLines.join('\n').trim();
    }
    if (inSolution && solutionLines.length > 0) {
        question.solution_text = solutionLines.join('\n').trim();
    }
    if (currentOptions.length > 0) {
        question.options = currentOptions;
    }

    // Set the set_ref
    question.set_ref = currentSetId;

    return question;
}

function parseMarkdownContent(content, _paperMeta) {
    const question_sets = [];
    const questions = [];

    // Remove YAML frontmatter
    content = content.replace(/^(?:YAML\s*\n)?\\?---[\s\S]*?\\?---/, '');

    // Clean the content
    content = cleanText(content);

    // Split by section headers
    const _sectionPattern = /^#\s*\*{0,2}Section:\s*(\w+)\*{0,2}/gim;
    const _setPattern = /^#{1,2}\s*\*{0,2}SET\*{0,2}/gim;
    const _questionPattern = /^#{2,3}\s*\*{0,2}QUESTION\*{0,2}/gim;

    let currentSection = null;
    let currentSetId = null;
    let setDisplayOrder = 0;

    // Split content into blocks
    const blocks = content.split(/(?=^#{1,3}\s)/m);

    for (const block of blocks) {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) continue;

        // Check for section header
        const sectionMatch = trimmedBlock.match(/^#\s*\*{0,2}Section:\s*(\w+)/i);
        if (sectionMatch) {
            currentSection = sectionMatch[1].toUpperCase();
            // Normalize LRDI to DILR
            if (currentSection === 'LRDI') currentSection = 'DILR';
            continue;
        }

        // Check for SET block
        if (/^#{1,2}\s*\*{0,2}SET\*{0,2}/i.test(trimmedBlock)) {
            setDisplayOrder++;
            const setData = parseSetBlock(trimmedBlock);

            // Normalize section
            if (setData.section === 'LRDI') setData.section = 'DILR';

            // Use parsed section or current section
            if (!setData.section && currentSection) {
                setData.section = currentSection;
            }

            // Ensure display_order
            if (!setData.display_order) {
                setData.display_order = setDisplayOrder;
            }

            // Normalize client_set_id
            if (setData.client_set_id) {
                setData.client_set_id = setData.client_set_id.toUpperCase().replace(/-/g, '_');
            }

            // Set defaults
            if (!setData.set_type) setData.set_type = 'ATOMIC';
            if (!setData.content_layout) setData.content_layout = 'single_focus';
            if (setData.context_body === '' || setData.context_body === '""') {
                delete setData.context_body;
            }

            currentSetId = setData.client_set_id;
            question_sets.push(setData);
            continue;
        }

        // Check for QUESTION block
        if (/^#{2,3}\s*\*{0,2}QUESTION\*{0,2}/i.test(trimmedBlock)) {
            if (!currentSetId) {
                console.warn('Warning: Question without a SET, skipping');
                continue;
            }

            const questionData = parseQuestionBlock(trimmedBlock, currentSetId);

            // Add section from current set
            const currentSet = question_sets.find(s => s.client_set_id === currentSetId);
            if (currentSet) {
                questionData.section = currentSet.section;
            }

            // Normalize client_question_id
            if (questionData.client_question_id) {
                questionData.client_question_id = questionData.client_question_id.replace(/-/g, '_');
            }

            questions.push(questionData);
        }
    }

    return { question_sets, questions };
}

// =============================================================================
// POST-PROCESSING & VALIDATION
// =============================================================================

function postProcess(paper, question_sets, questions) {
    // Normalize paper fields
    // Ensure sections is a simple array of strings
    if (paper.sections && !Array.isArray(paper.sections)) {
        paper.sections = [paper.sections];
    }

    // If sections were parsed incorrectly, extract them from question_sets
    const sectionsFromSets = [...new Set(question_sets.map(s => s.section).filter(Boolean))];
    if (!paper.sections || paper.sections.length === 0 || paper.sections.length < sectionsFromSets.length) {
        // Normalize LRDI to DILR
        paper.sections = sectionsFromSets.map(s => s === 'LRDI' ? 'DILR' : s);
    } else {
        paper.sections = paper.sections.map(s => {
            if (typeof s === 'object') return s.section || s;
            return s;
        }).filter(Boolean);

        // Normalize LRDI to DILR
        paper.sections = paper.sections.map(s => s === 'LRDI' ? 'DILR' : s);
    }

    // Ensure standard CAT sections order
    const sectionOrder = ['VARC', 'DILR', 'QA'];
    paper.sections = sectionOrder.filter(s => paper.sections.includes(s));

    // Ensure required paper fields
    if (!paper.schema_version) paper.schema_version = 'v3.0';
    if (!paper.duration_minutes) paper.duration_minutes = 120;
    if (paper.default_positive_marks === undefined) paper.default_positive_marks = 3;
    if (paper.default_negative_marks === undefined) paper.default_negative_marks = 1;

    // Clean paper fields
    delete paper.schema_version; // Will be top-level
    delete paper.version_number;
    delete paper.source_pdf;
    delete paper.import_notes;
    delete paper.availability;
    delete paper.ingestion;
    delete paper.display_order; // Remove unwanted field from sections parsing
    delete paper.question_count; // Remove unwanted field from sections parsing

    // Fix question sets
    for (const set of question_sets) {
        // Ensure VARC/DILR/CASELET sets have context_body
        if (['VARC', 'DILR', 'CASELET'].includes(set.set_type)) {
            if (!set.context_body || set.context_body.trim() === '') {
                // Downgrade to ATOMIC if no context
                set.set_type = 'ATOMIC';
            }
        }

        // Clean up
        delete set.metadata;
        delete set.context_type;
        if (set.context_body === '' || set.context_body === 'none') {
            delete set.context_body;
        }
    }

    // Fix questions
    let questionNum = 0;
    for (const q of questions) {
        questionNum++;

        // Ensure question_number
        if (!q.question_number) {
            q.question_number = questionNum;
        }

        // Ensure sequence_order
        if (!q.sequence_order) {
            q.sequence_order = 1;
        }

        // Ensure client_question_id
        if (!q.client_question_id) {
            q.client_question_id = `Q${q.question_number}`;
        }

        // Clean question text
        if (q.question_text) {
            q.question_text = q.question_text.trim();
        }

        // Ensure MCQ has options
        if (q.question_type === 'MCQ' && (!q.options || q.options.length === 0)) {
            console.warn(`Warning: MCQ question ${q.client_question_id} has no options`);
        }

        // Clean empty solution text
        if (q.solution_text === '' || q.solution_text === '""') {
            delete q.solution_text;
        }

        // Ensure correct_answer format
        if (q.correct_answer) {
            q.correct_answer = String(q.correct_answer).replace(/^["']|["']$/g, '');
        }
    }

    // Update total_questions
    paper.total_questions = questions.length;

    return { paper, question_sets, questions };
}

function validateOutput(data) {
    const errors = [];

    // Check schema version
    if (data.schema_version !== 'v3.0') {
        errors.push(`schema_version must be 'v3.0'`);
    }

    // Check paper
    if (!data.paper.slug) errors.push('paper.slug is required');
    if (!data.paper.title) errors.push('paper.title is required');

    // Check sets
    const setIds = new Set();
    for (const set of data.question_sets) {
        if (!set.client_set_id) {
            errors.push('question_set missing client_set_id');
        } else if (setIds.has(set.client_set_id)) {
            errors.push(`Duplicate client_set_id: ${set.client_set_id}`);
        } else {
            setIds.add(set.client_set_id);
        }

        if (!set.section) errors.push(`Set ${set.client_set_id} missing section`);
        if (!set.set_type) errors.push(`Set ${set.client_set_id} missing set_type`);
        if (set.display_order === undefined) errors.push(`Set ${set.client_set_id} missing display_order`);
    }

    // Check questions
    const questionIds = new Set();
    for (const q of data.questions) {
        if (!q.client_question_id) {
            errors.push('question missing client_question_id');
        } else if (questionIds.has(q.client_question_id)) {
            errors.push(`Duplicate client_question_id: ${q.client_question_id}`);
        } else {
            questionIds.add(q.client_question_id);
        }

        if (!q.set_ref) {
            errors.push(`Question ${q.client_question_id} missing set_ref`);
        } else if (!setIds.has(q.set_ref)) {
            errors.push(`Question ${q.client_question_id} references non-existent set: ${q.set_ref}`);
        }

        if (!q.question_text) errors.push(`Question ${q.client_question_id} missing question_text`);
        if (!q.question_type) errors.push(`Question ${q.client_question_id} missing question_type`);

        if (q.question_type === 'MCQ' && (!q.options || q.options.length < 2)) {
            errors.push(`MCQ question ${q.client_question_id} needs at least 2 options`);
        }
    }

    return errors;
}

function formatAjvErrors(errors = []) {
    return errors.map((err) => {
        const path = err.instancePath || '(root)';
        const message = err.message || err.keyword || 'schema validation error';
        return `${path} ${message}`.trim();
    });
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node scripts/parse-md-to-v3.mjs <input.md> [output.json]

Parses custom markdown format CAT papers to v3.0 JSON schema.

Arguments:
  input.md      Path to the markdown file to parse
  output.json   Optional output path (default: same name with .json extension)

Options:
  --help, -h    Show this help message
`);
        process.exit(0);
    }

    const inputPath = args[0];
    const outputPath = args[1] || inputPath.replace(/\.md$/i, '.json');

    console.log(`📖 Reading: ${inputPath}`);
    const content = readFileSync(inputPath, 'utf-8');

    console.log('📋 Parsing YAML frontmatter...');
    const paperMeta = parseYamlFrontmatter(content);

    console.log('📝 Parsing markdown content...');
    const { question_sets, questions } = parseMarkdownContent(content, paperMeta);

    console.log(`   Found ${question_sets.length} question sets`);
    console.log(`   Found ${questions.length} questions`);

    console.log('🔧 Post-processing...');
    const processed = postProcess(paperMeta, question_sets, questions);

    const output = {
        schema_version: 'v3.0',
        paper: processed.paper,
        question_sets: processed.question_sets,
        questions: processed.questions
    };

    console.log('✅ Validating output (custom + AJV)...');
    const errors = validateOutput(output);
    const ajvResult = validatePaperSchema(output);
    const ajvErrors = ajvResult.valid ? [] : formatAjvErrors(ajvResult.errors);
    const allErrors = [...errors, ...ajvErrors];

    if (errors.length > 0) {
        console.error('❌ Custom validation errors:');
        errors.forEach(e => console.error(`   - ${e}`));
        console.error('');
    }

    if (ajvErrors.length > 0) {
        console.error('❌ AJV schema validation errors:');
        ajvErrors.forEach(e => console.error(`   - ${e}`));
        console.error('');
    }

    if (allErrors.length > 0) {
        console.log('⚠️  Writing output anyway for debugging...');
    } else {
        console.log('✅ Validation passed!');
    }

    console.log(`💾 Writing: ${outputPath}`);
    writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    // Summary
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Paper: ${output.paper.title}`);
    console.log(`   Slug: ${output.paper.slug}`);
    console.log(`   Year: ${output.paper.year}`);
    console.log(`   Questions: ${output.questions.length}`);
    console.log(`   Question Sets: ${output.question_sets.length}`);
    console.log(`   Sections: ${output.paper.sections?.join(', ') || 'N/A'}`);

    // Question type breakdown
    const mcqCount = output.questions.filter(q => q.question_type === 'MCQ').length;
    const titaCount = output.questions.filter(q => q.question_type === 'TITA').length;
    console.log(`   MCQ: ${mcqCount}, TITA: ${titaCount}`);

    if (allErrors.length > 0) {
        process.exit(1);
    }
}

main();
````

## File: .nvmrc
````
20
````

## File: eslint.config.mjs
````javascript
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";

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
      "unused-imports": unusedImports,
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
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
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

const BLUEPRINT_FILE = 'docs/BLUEPRINT.md';
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
          if git ls-files | grep -E '(^|/).*\.env($|\.)' | grep -v -E '(^|/)\.env(\.[^/]+)?\.example$' ; then
            echo "Error: .env files should not be committed. Use .env.example and environment secrets instead." >&2
            exit 1
          fi
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
````

## File: scripts/check-bundle.mjs
````javascript
#!/usr/bin/env node

/**
 * Bundle Budget Checker
 * Analyzes bundle size and enforces size limits
 */

import { execSync } from 'child_process';
const BUDGET_MB = 10; // 10 MB budget (total .next JS files; First Load JS per route is ~100-150 KB)


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

## File: .gitignore
````
# --- Security & Secrets ---
.env
.env.local
.env.*.local
*.pem
*.key
service-account*.json

# --- Data Protection ---
data/*
!data/sample-paper-template.json

# --- Dependencies & Build ---
node_modules/
.pnpm-store/
.next/
out/
build/
dist/
.venv/

# --- Generated Reports ---
gemini_*.md
VS_Codebase*.md
repomix-output*
.export_sanitized/
.export_tmp/
.repomix-vs-codebase.json

# --- System ---
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
.DS_Store
Thumbs.db
````

## File: middleware.ts
````typescript
/**
 * @fileoverview Next.js Middleware
 * @description Auth session management and security headers
 * @blueprint Security Audit - P0 Fix - Security Headers
 * 
 * CRITICAL FIX (2026-02-02): 
 * - Avoid double Supabase client creation (was causing cookie race conditions)
 * - Skip session refresh for API routes (they handle their own auth)
 * - Single client instance for protected route checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { fetchAccessStatus, resolveIsAdmin } from '@/lib/access-control';
import { incrementMetric } from '@/lib/telemetry';

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

/**
 * Get Supabase configuration from environment
 */
function getSupabaseConfig(): { url: string; anonKey: string } | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.error('Middleware: Missing Supabase configuration');
        return null;
    }

    return { url, anonKey };
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // =========================================================================
    // API ROUTES: Skip middleware auth entirely - APIs handle their own auth
    // This prevents token refresh race conditions during exam submit
    // =========================================================================
    if (pathname.startsWith('/api/')) {
        const res = NextResponse.next({ request: { headers: req.headers } });
        applySecurityHeaders(res);
        return res;
    }

    // =========================================================================
    // PAGE ROUTES: Handle session refresh and protection
    // =========================================================================

    // Create response object
    const res = NextResponse.next({ request: { headers: req.headers } });
    applySecurityHeaders(res);

    // Block test login in production
    if (pathname.startsWith('/auth/test-login') && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }

    // Determine if route needs protection
    const isProtected = pathname.startsWith('/exam/') ||
        pathname.startsWith('/result/') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/mocks') ||
        pathname.startsWith('/mock/');
    const isAdminRoute = pathname.startsWith('/admin');

    // Only create Supabase client if we need to check auth
    if (!isProtected && !isAdminRoute) {
        return res;
    }

    // Get Supabase config
    const config = getSupabaseConfig();
    if (!config) {
        // Allow request to proceed - let page handle the error
        return res;
    }

    try {
        // Create SINGLE Supabase client for this request
        const supabase = createServerClient(config.url, config.anonKey, {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookies.set({ name, value, ...options });
                    });
                },
            },
        });

        // Get user (this also refreshes session if needed)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            // Not authenticated - redirect to sign in
            const redirect = new URL('/auth/sign-in', req.url);
            const returnTo = pathname + (req.nextUrl.search || '');
            redirect.searchParams.set('redirect_to', returnTo);
            return NextResponse.redirect(redirect);
        }

        const env = process.env.NODE_ENV;
        const skipAdminCheck =
            process.env.SKIP_ADMIN_CHECK === 'true' && (env === 'development' || env === 'test');

        const isAdmin = skipAdminCheck ? true : await resolveIsAdmin(supabase, user);

        // Admin routes require admin role
        if (isAdminRoute && !skipAdminCheck && !isAdmin) {
            const redirect = new URL('/dashboard', req.url);
            redirect.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(redirect);
        }

        // Access gating for protected routes (non-admins only)
        if (isProtected && !isAdmin) {
            const accessStatus = await fetchAccessStatus(supabase, user.id);
            if (accessStatus !== 'active') {
                const redirect = new URL('/coming-soon', req.url);
                const returnTo = pathname + (req.nextUrl.search || '');
                redirect.searchParams.set('redirect_to', returnTo);
                return NextResponse.redirect(redirect);
            }
        }

        return res;
    } catch (err) {
        console.error('Middleware error:', err);
        incrementMetric('middleware_error');
        // On error, allow request to proceed - let page handle the error
        return res;
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/exam/:path*',
        '/result/:path*',
        '/mocks/:path*',
        '/mock/:path*',
        '/admin/:path*',
        '/coming-soon',
        '/auth/test-login',
        // API routes included only for security headers - auth skipped
        '/api/:path*',
    ],
};
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
    "lint": "eslint",
    "lint:unused": "eslint --max-warnings=0",
    "test": "vitest run",
    "knip": "knip",
    "depcheck": "depcheck",
    "ts-prune": "ts-prune -p tsconfig.json",
    "export:vs_codebase": "node scripts/export-vs-codebase.mjs",
    "export:vs_codebase:v2": "node scripts/export-vs-codebase-v2.mjs"
  },
  "dependencies": {
    "@supabase/ssr": "^0.4.1",
    "@supabase/supabase-js": "^2.75.0",
    "ajv": "^8.17.1",
    "ajv-formats": "^2.1.1",
    "jwt-decode": "^4.0.0",
    "katex": "^0.16.25",
    "next": "16.1.3",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-katex": "^3.1.0",
    "react-markdown": "^10.1.0",
    "rehype-raw": "^7.0.0",
    "remark-gfm": "^4.0.1",
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
    "depcheck": "^1.4.7",
    "dotenv": "^17.2.3",
    "eslint": "^9",
    "eslint-config-next": "16.1.3",
    "eslint-plugin-unused-imports": "^4.1.4",
    "knip": "^5.51.0",
    "netlify-cli": "^23.9.1",
    "postcss": "^8.5.6",
    "source-map-explorer": "^2.5.3",
    "tailwindcss": "^3.4.0",
    "ts-prune": "^0.10.3",
    "typescript": "^5",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^1.6.0"
  },
  "engines": {
    "node": ">=20"
  }
}
````
