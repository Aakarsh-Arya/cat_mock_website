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
