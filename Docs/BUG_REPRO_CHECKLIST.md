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
