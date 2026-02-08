# Bug Repro Steps (Phase 0)

Last reviewed: 2026-02-07
Status: Unverified (re-run after admin editor changes)

Keep these steps up to date so regressions are easy to spot.

## Editor refresh bug

Scenario: "Edit Q -> refresh -> jumps to VARC Q1".

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

Scenario: "Do X -> UI freezes (Editor + Preview)".

Steps:
1. Open the admin editor for any paper.
2. Rapidly change sections and questions (palette clicks + section tab changes).
3. Keep typing in the editor for 10-20 seconds.

Expected:
- UI remains responsive; no long stalls.

Observed bug:
- Editor and preview freeze or become unresponsive.

## Duplication bug

Scenario: "Edit Q text (delete + rewrite) -> Preview/Mock shows old + new".

Steps:
1. Open the admin editor for any paper.
2. Select a question with text in the stem.
3. Delete the entire question text and retype a new sentence.
4. Open Admin Preview or Mock view for the same paper.

Expected:
- Preview/Mock shows only the new text.

Observed bug:
- Preview/Mock shows both the old and new text.
