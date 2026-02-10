# BUGFIX 9 Feb Checklist

Use this checklist to manually verify the Phase 0/1/2 fixes.

## 1) Request Access loop (/coming-soon)
Steps to verify:
1. Sign in with a waitlisted account (status pending).
2. Visit `/coming-soon`.
3. Click "Request access".
4. Expected: stay on `/coming-soon`, see "Access request received"; no redirect to `/auth/sign-in`.

## 2) Exam header overlap + remove Sync button
Steps to verify:
1. Start any exam attempt.
2. Confirm the Back button does not overlap the section tabs/label (e.g., VARC/LRDI/Quant).
3. Confirm there is no "Sync" button visible anywhere in the exam header.

## 3) MCQ options radio layout
Steps to verify:
1. Open a MCQ question.
2. Confirm all options render with aligned radio controls and consistent spacing.
3. Resize the window (desktop ? tablet width) and confirm layout remains intact.

## 4) Hide topic labels during exam (keep in analysis)
Steps to verify:
1. During an active exam, confirm topic labels are not shown.
2. After submitting, open Result/Analysis view and confirm topic labels are visible there.
