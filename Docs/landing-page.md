# Landing v2 integration note (Phase 0)

## Current landing entry + structure
- Route entry: `src/app/page.tsx`
  - Wraps `src/components/landing/LandingPageClient.tsx` (hero, mentor, roadmap, CAT hub, footer).
  - Dynamic images via `useLandingAssets` with skeleton placeholders and safe fallbacks.
- App shell: `src/app/layout.tsx`
  - Global styles via Tailwind (`src/app/globals.css`).
  - KaTeX CSS is globally included.
- Styling system: Tailwind utility classes (no component library). `src/app/page.module.css` exists but is not used by the landing route.

## Auth modal location (current)
- Auth modal lives in `src/components/landing/LandingPageClient.tsx` (Google OAuth only).
- Sign-in is a dedicated page: `src/app/auth/sign-in/page.tsx`.
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
- Reuse the existing Auth modal and OAuth redirect flow from `src/app/auth/sign-in/page.tsx`.

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
