# AI Analysis Export — Integration Map & Implementation Plan

> **Generated**: 2026-02-10
> **Phase**: 0 (Reconnaissance) + Phase 1 (DB lifecycle)
> **Schema version**: `1.0.0`

---

## A) Reuse Patterns

### 1. Admin Auth Guard

| Aspect | Detail |
|---|---|
| **Reference file** | `src/app/api/admin/papers/[paperId]/export/route.ts` L64–L102 |
| **Functions** | `verifyAdmin()` → `verifyAdminRole()` |
| **How it works** | Creates SSR client via `createActionClient()` (anon key + cookies). Calls `getUser()`, falls back to `getSession()`. Checks `app_metadata.user_role` for `'admin'` / `'dev'`. Falls back to JWT decode, then `is_admin` RPC. Dev bypass: `SKIP_ADMIN_CHECK=true` (non-production only). |
| **Pattern to copy** | The `verifyAdmin()` + `verifyAdminRole()` block (~40 lines). Self-contained, battle-tested. |
| **Note** | Middleware (L68–L72) **skips** `/api/` routes — API routes must self-guard. |

### 2. Paper Export Route Structure (file download)

| Aspect | Detail |
|---|---|
| **Handler signature** | `export async function GET(req: NextRequest, { params }: { params: Promise<{ paperId: string }> })` |
| **Content-Type** | `application/json` |
| **Content-Disposition** | `attachment; filename="${filename}"` |
| **Cache-Control** | `no-store` |
| **Filename convention** | `${slug}_v3.json`, `paper_${id}_assembled.json`, etc. |
| **Response** | `new NextResponse(jsonString, { status: 200, headers: {...} })` |
| **Error pattern** | `NextResponse.json({ error: message }, { status: 4xx/5xx })` |
| **For AI export** | Same pattern. Filename: `${slug}_attempt_${attemptId}_ai_context.json` |

### 3. Supabase Admin Client (service role)

| Aspect | Detail |
|---|---|
| **Shared module** | `src/lib/supabase/service-role.ts` → `getServiceRoleClient()` |
| **Import guard** | `import 'server-only'` prevents client-side import |
| **Inline version** | Paper export has its own `getAdminClient()` at L22–L35 (identical logic) |
| **SSR client** | `src/lib/supabase/server.ts` → `sbSSR()` (cookie-aware, user-scoped) |
| **For AI export** | Use `getServiceRoleClient()` to fetch questions with correct answers (bypasses `questions_exam` view that strips answers). Use SSR client for auth check only. |

### 4. Result Tabs / CTA Insertion Point

| Aspect | Detail |
|---|---|
| **File** | `src/app/result/[attemptId]/page.tsx` L500–L524 |
| **Action buttons div** | `<div className="flex flex-wrap justify-center gap-4 pt-4">` with "Back to Dashboard" + "Take Another Mock" links |
| **CTA placement** | Add a third button/link after "Take Another Mock" for "Export AI Context" |
| **Data available** | `attempt.id`, `attempt.paper_id`, user is authenticated at this point |
| **Implementation** | `<a href="/api/result/${attempt.id}/export-ai-context" download>` or client-side fetch + blob download |

### 5. Paper Version Snapshot

| Aspect | Detail |
|---|---|
| **papers table** | Has `latest_ingest_run_id UUID` (FK to `paper_ingest_runs(id)`) — added in migration 007 |
| **paper_ingest_runs** | Has `version_number`, `canonical_paper_json JSONB`, `schema_version`, `canonical_json_hash` |
| **Attempt-time snapshot** | Currently **not captured**. Must store `paper_ingest_run_id` on `attempts` at creation time to freeze the paper version. |

---

## B) Minimal New Files

| # | File Path | Purpose |
|---|---|---|
| 1 | `src/app/api/result/[attemptId]/export-ai-context/route.ts` | **API route** — GET handler. Auth check (own attempt OR admin), assembles composite JSON, returns as file download. |
| 2 | `src/features/exam-engine/lib/generateCompositeContext.ts` | **Service function** — `generateCompositeContextPacket()`. Queries attempt + paper + questions (with answers) + responses + contexts. Returns typed export object. |
| 3 | `docs/migrations/031_add_ai_analysis_columns.sql` | **Migration** — Adds `ai_analysis_status` enum, lifecycle columns, `paper_ingest_run_id` snapshot on `attempts`. |

No new type files needed — extend `src/types/exam.ts` with `AIAnalysisStatus` and updated `Attempt` interface.

---

## C) Existing Files to Modify

| # | File | Change | Location |
|---|---|---|---|
| 1 | `src/app/result/[attemptId]/page.tsx` | Add "Export AI Context" CTA button in action buttons div | After "Take Another Mock" link (~L519) |
| 2 | `src/types/exam.ts` | Add `AIAnalysisStatus` type + new fields on `Attempt` interface | After `AttemptStatus` type (~L362) and within `Attempt` interface (~L370) |
| 3 | `src/features/exam-engine/lib/actions.ts` | Set `paper_ingest_run_id` when creating attempt (Phase 2/3) | In `startExam` or equivalent attempt creation logic |

---

## D) Risk List

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **Paper snapshot mismatch** — Questions edited after attempt taken. Export uses current DB state, not snapshot. | **Medium** | Store `paper_ingest_run_id` on `attempts` at creation time (migration 031). Add `_warning` field in export metadata noting potential drift for older attempts without snapshot. |
| 2 | **RLS bypass risk** — Export needs `correct_answer`, `solution_text` which are stripped by `questions_exam` view. | **High** | Use `getServiceRoleClient()` with explicit paper_id filter. **Never expose service-role to client.** Use existing `fetch_attempt_solutions` RPC as alternative (already scoped). |
| 3 | **Authorization — viewing others' attempts** | **High** | API route MUST verify `attempt.user_id === session.user.id` (or user is admin). Copy pattern from `fetchExamResults` in `actions.ts`. |
| 4 | **Size / token risk** — RC passages + 66 questions + solutions + responses ≈ 50–150KB JSON. | **Low-Medium** | Add `compact` query param that omits `solution_text` and passage bodies. Include `token_estimate` in export metadata. |
| 5 | **Telemetry columns may not exist** | **Low** | Migration 030 adds `telemetry_log` on `attempts` and `answer_history` on `responses`. If not applied, use `COALESCE` or omit gracefully (nullable fields in type). |
| 6 | **Rate limiting / abuse** | **Low** | No rate limiting on API routes currently. Consider simple throttle (5 exports/user/hour) in Phase 2+. |

---

## E) Acceptance Checklist

### Phase 0 (this doc) ✅
- [x] Integration map written with exact file paths and function names
- [x] Reuse patterns identified (auth guard, export headers, Supabase client)
- [x] CTA insertion point identified (result page action buttons)
- [x] Risk list with mitigations documented

### Phase 1 (migration + types)
- [ ] Migration `031_add_ai_analysis_columns.sql` is idempotent (`IF NOT EXISTS`, `DO $$` blocks)
- [ ] Enum `ai_analysis_status_type` created: `none`, `requested`, `exported`, `processed`, `failed`
- [ ] Columns added to `attempts`: `ai_analysis_status`, `ai_analysis_requested_at`, `ai_analysis_exported_at`, `ai_analysis_error`, `paper_ingest_run_id`
- [ ] Existing rows backfilled with `ai_analysis_status = 'none'`
- [ ] Composite index added: `(ai_analysis_status, submitted_at DESC)`
- [ ] `paper_ingest_run_id` FK added to `paper_ingest_runs(id)` (nullable, no cascade)
- [ ] TypeScript types updated in `src/types/exam.ts`
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] No RLS policies widened or changed
- [ ] Existing migrations unaffected (migration numbering consistent)

### Phase 2+ (API route + service + CTA)
- [ ] GET `/api/result/[attemptId]/export-ai-context` returns 401 for unauthenticated
- [ ] Returns 403 if `attempt.user_id !== session.user.id` and user is not admin
- [ ] Admin users can export any attempt
- [ ] Response has `Content-Disposition: attachment` header
- [ ] Response has `Cache-Control: no-store`
- [ ] Export includes: paper metadata, all questions with correct answers/solutions, responses with timing/visit data, attempt summary, passage/context bodies, schema version + export timestamp
- [ ] Result page shows "Export AI Context" CTA
- [ ] No regression on existing result page, paper export, or exam flow
- [ ] `pnpm lint` passes
- [ ] `node scripts/check-bundle.mjs` passes

---

## Appendix: Composite Context JSON Schema (Draft)

```jsonc
{
  "_meta": {
    "schema_version": "1.0.0",
    "exported_at": "2026-02-10T12:00:00Z",
    "export_format": "composite_context",
    "paper_snapshot_warning": "Paper may have been edited after attempt. paper_ingest_run_id captures version at attempt time.",
    "token_estimate": 12500
  },
  "attempt": {
    "id": "uuid",
    "user_id": "uuid",
    "paper_id": "uuid",
    "paper_ingest_run_id": "uuid | null",
    "status": "submitted",
    "started_at": "iso8601",
    "completed_at": "iso8601",
    "time_taken_seconds": 7200,
    "total_score": 42,
    "max_possible_score": 198,
    "correct_count": 20,
    "incorrect_count": 10,
    "unanswered_count": 36,
    "accuracy": 0.667,
    "attempt_rate": 0.455,
    "percentile": 85.5,
    "section_scores": { "VARC": {}, "DILR": {}, "QA": {} },
    "telemetry_log": [],
    "ai_analysis_status": "exported"
  },
  "paper": {
    "id": "uuid",
    "title": "CAT 2025 Slot 1",
    "slug": "cat-2025-slot-1",
    "year": 2025,
    "sections": [],
    "total_questions": 66,
    "total_marks": 198,
    "duration_minutes": 120
  },
  "questions": [
    {
      "id": "uuid",
      "section": "VARC",
      "question_number": 1,
      "question_type": "MCQ",
      "question_text": "...",
      "options": [],
      "correct_answer": "B",
      "solution_text": "...",
      "positive_marks": 3,
      "negative_marks": 1,
      "topic": "Reading Comprehension",
      "difficulty_level": "medium",
      "ideal_time_seconds": 180,
      "context_id": "uuid | null"
    }
  ],
  "responses": [
    {
      "question_id": "uuid",
      "answer": "A",
      "is_correct": false,
      "marks_obtained": -1,
      "status": "answered",
      "time_spent_seconds": 120,
      "visit_count": 3,
      "is_marked_for_review": false,
      "answer_history": []
    }
  ],
  "contexts": [
    {
      "id": "uuid",
      "title": "Passage 1",
      "content_text": "...",
      "content_type": "passage",
      "section": "VARC"
    }
  ],
  "user_summary": {
    "total_attempts": 5,
    "average_score": 55.2,
    "strongest_section": "QA",
    "weakest_section": "VARC"
  }
}
```
