# Bug Reproduction Checklist

> Phase 0 Safety Rails: Use this checklist to verify fixes before and after each change.
> Last updated: 2026-02-07

---

## Issue 1: Mock Session Resume vs Restart
Status: Fixed (2026-02-07)

Description (pre-fix)
When a user started a mock while another attempt was in progress, the session restarted from Q1 instead of resuming.

Current behavior
- /mocks shows "Continue Mock" when an in-progress attempt with remaining time exists.
- /mock/[paperId] shows "Start New Attempt" which abandons any in-progress attempt for that paper.

Verification steps
1. Start a mock test and answer a few questions.
2. Close the tab without submitting.
3. Go to /mocks and click "Continue Mock".
4. Expected: resume at the last saved section/question.

Optional validation
- From /mock/[paperId], click "Start New Attempt".
- Expected: previous in-progress attempt is marked abandoned and a new attempt is created.

Verification checklist
- DevTools -> Application -> Local Storage
- Key `cat-exam-state-{attemptId}` exists (not `cat-exam-state-temp`)
- `currentSectionIndex` and `currentQuestionIndex` are preserved
- With `NEXT_PUBLIC_EXAM_DEBUG=true`, look for `[EXAM_DEBUG] Resume detection`

---

## Issue 2: TITA Double-Fire / Duplicate Script Execution
Status: Fixed (Phase 3.4)

Description (pre-fix)
TITA keypad input fired twice due to a useEffect sync loop.

Verification steps
1. Open any TITA question.
2. DevTools -> Console.
3. Press a keypad digit.

Expected
- One input change and one log line per keypress.

Verification checklist
- `[EXAM_DEBUG] TITA input` appears once per keypress
- No duplicate renders or state updates in React DevTools

---

## Issue 3: Mark for Review & Next Behavior
Status: Fixed (Phase 2)

Description (pre-fix)
"Mark for Review & Next" could incorrectly mark unanswered questions as answered_marked.

Current status categories
1. Answered (green, hexagon-up)
2. Not Answered/Visited (red, hexagon-down)
3. Not Visited (gray, square)
4. Marked for Review (purple, circle)
5. Attempted & Marked (answered_marked)

Test matrix
| Starting State | Action | Expected Status | Expected Answer |
|----------------|--------|-----------------|-----------------|
| not_visited | Mark & Next | marked | null |
| visited (no answer) | Mark & Next | marked | null |
| answered | Mark & Next | answered_marked | preserved |
| marked | Unmark | visited | null |
| answered_marked | Unmark | answered | preserved |

Verification checklist
- Palette color matches expected status
- `[EXAM_DEBUG] Mark for Review` shows correct newStatus
- `[EXAM_DEBUG] Response status change` aligns with transitions

---

## Issue 4: Quant Section Submission Failure
Status: Mitigated (2026-02-07)

Description (pre-fix)
Submissions in QA sometimes returned "Failed to submit exam" due to races or stale attempt IDs.

Current behavior
- `/api/submit` is idempotent; repeated submits return success with `already_submitted`.
- Session conflicts return `SESSION_CONFLICT` and can be force-resumed.
- `ATTEMPT_NOT_FOUND` triggers localStorage cleanup and redirects to `/dashboard`.

Potential causes (if still reproducible)
- Multi-device/tab session conflict
- Rate limiting on submit
- Attempt deleted server-side

Verification steps
1. Complete all sections (VARC, DILR, QA).
2. Submit from the last QA question.
3. Check the `/api/submit` response in Network tab.

Verification checklist
- `/api/submit` returns 200 on success, or 409 with `SESSION_CONFLICT` when applicable
- If `ATTEMPT_NOT_FOUND`, exam state keys are cleared and user is redirected to `/dashboard`
- Server logs show `SUBMIT_*` diagnostics when debugging

---

## Debug Mode Instructions

### Enabling Debug Logging
Set in `.env.local`:
```bash
NEXT_PUBLIC_EXAM_DEBUG=true
```

### Debug Log Outputs
With debug mode enabled, check console for:
- `[EXAM_DEBUG] Store initialized` - attemptId, storeName, sessionToken, section, question
- `[EXAM_DEBUG] Resume detection` - attemptId, section, question, preservedState
- `[EXAM_DEBUG] Response status change` - questionId, status, hasAnswer, isMarked
- `[EXAM_DEBUG] Mark for Review` - questionId, newStatus, isMarking
- `[EXAM_DEBUG] TITA input` - key, oldValue, newValue
- `[EXAM_DEBUG] Submit attempt` - attemptId, submissionId, responses
- `[EXAM_DEBUG] Submit result` - success, error, attemptId

### LocalStorage Keys to Monitor
- `cat-exam-state-{attemptId}` - per-attempt state
- `cat-exam-state-temp` - should not exist for real attempts; cleaned up on startup if stale

---

## Quick Verification Commands

```bash
# Check localStorage in browser console
localStorage.getItem('cat-exam-state-temp')  // Should be null for real attempts
Object.keys(localStorage).filter(k => k.startsWith('cat-exam-state'))

# Force clear all exam state (for testing)
Object.keys(localStorage).filter(k => k.startsWith('cat-exam-state')).forEach(k => localStorage.removeItem(k))
```
