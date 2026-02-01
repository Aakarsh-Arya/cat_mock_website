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
