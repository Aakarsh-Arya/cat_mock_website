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
