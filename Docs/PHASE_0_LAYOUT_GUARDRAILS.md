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
