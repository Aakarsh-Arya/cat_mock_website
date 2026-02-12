-- ============================================================================
-- Migration 035: Persist NexAI Per-Question Performance Reasons
-- ============================================================================
-- Purpose:
--   Store the "Reason for Performance" tags selected in Mirror View so they can
--   be included in the NexAI export packet at request time.
--
-- Column:
--   attempts.ai_analysis_question_reasons JSONB
--   Shape: { "<question_id>": "concept_gap" | "careless_error" | "time_pressure" | "guess" }
-- ============================================================================

ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS ai_analysis_question_reasons JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.attempts.ai_analysis_question_reasons IS
    'Snapshot of per-question performance reasons captured when NexAI insight is requested.';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'attempts_ai_analysis_question_reasons_is_object'
    ) THEN
        ALTER TABLE public.attempts
        ADD CONSTRAINT attempts_ai_analysis_question_reasons_is_object
        CHECK (jsonb_typeof(ai_analysis_question_reasons) = 'object');
    END IF;
END $$;

-- Optional verification:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'attempts'
--   AND column_name = 'ai_analysis_question_reasons';
Mobile-Friendliness Assessment of User Dashboard
After examining the dashboard code (page.tsx), the user dashboard is not mobile-friendly. Here's the analysis:

Current Issues
Header Layout: Uses display: flex with justifyContent: 'space-between' for the title and action buttons. On mobile screens (< 768px), the three buttons ("Admin Panel", "Take New Mock", "Logout") will overflow horizontally or wrap awkwardly.

Stats Cards Grid: Fixed gridTemplateColumns: 'repeat(4, 1fr)' creates 4 equally-sized cards. On mobile, each card becomes ~20-25% width, making text unreadable and numbers cramped.

Attempts Table: A traditional HTML table with 8 columns. Tables don't adapt well to mobile:

Columns squeeze to unreadable widths
No horizontal scrolling implemented
Poor touch interaction for links
Status badges and data become illegible
Padding and Spacing: Fixed padding: 24 (24px) on all sides is excessive on mobile screens (typically 320-414px wide), reducing usable content area.

No Responsive Design: All styles are inline and fixed-width, with no media queries or breakpoints.

Browser-Specific Considerations
Android Browsers (Chrome, Firefox, Samsung Internet): Touch targets need minimum 44px height/width. Current buttons are 12px vertical padding (likely ~48px total), which is borderline. Tables are especially problematic on Android due to smaller screens and varied device sizes.

iOS Browsers (Safari, Chrome): Similar touch target issues. iOS Safari has stricter scrolling behavior for tables. The fixed max-width (1000px) leaves excessive whitespace on iPhone screens.

Mobile-Friendly Fix Plan
Phase 1: Convert to Tailwind CSS Classes
Replace all inline styles with Tailwind classes for consistency and responsiveness
Enable responsive utilities (sm:, md:, lg:)
Phase 2: Responsive Header
Desktop: Horizontal layout with buttons on right
Mobile: Stack title and buttons vertically, center-align buttons
Ensure button text doesn't wrap; use shorter labels if needed ("Admin", "New Mock", "Logout")
Phase 3: Responsive Stats Grid
Mobile (< 640px): Single column stack
Tablet (640px+): 2 columns
Desktop (1024px+): 4 columns
Increase card padding on mobile for better touch targets
Phase 4: Mobile-First Table Replacement
Mobile (< 768px): Replace table with card-based list layout
Each attempt as a card with key-value pairs
Status as colored badge
Action buttons as full-width touch-friendly links
Tablet/Desktop (768px+): Keep table but make it horizontally scrollable
Add proper table responsiveness with overflow-x: auto
Phase 5: Spacing and Typography Adjustments
Reduce container padding: p-4 sm:p-6 lg:p-8 (16px → 24px → 32px)
Adjust font sizes: Smaller on mobile, larger on desktop
Ensure minimum touch targets: 44px height for buttons/links
Phase 6: Testing and Polish
Test on actual devices/simulators for Android (Chrome) and iOS (Safari)
Verify horizontal scrolling works on narrow screens
Check accessibility: Color contrast, focus states for keyboard navigation
Implementation Priority
High: Header and stats grid responsiveness (immediate visual impact)
High: Table → cards on mobile (usability blocker)
Medium: Spacing/typography refinements
Low: Advanced features (swipe gestures, etc.)
This plan will make the dashboard fully functional and visually appealing on both Android and iOS browsers, with proper touch interactions and readable content at all screen sizes.