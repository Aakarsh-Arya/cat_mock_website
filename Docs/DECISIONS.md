# DECISIONS.md – Architecture & SSOT Freeze (v0.1)

## Changelog

### 2026-01-22: Mirror Principle Admin Editor (M6+)
- **Added**: `EditableExamLayout.tsx` - Admin editor that mirrors exam UI exactly
- **Added**: `ImageUploadZone` component with Supabase Storage integration
- **Added**: Back button navigation throughout admin panel
- **Added**: Toast notifications for save success/error feedback
- **Updated**: `MIGRATION_M6_RBAC.sql` - Added `question-images` Storage bucket with RLS policies
- **Changed**: "Pause" button → "Exit Mock" with red styling in exam interface
- **UI**: Editor now matches student exam view 1:1 (Mirror Principle)
- **Storage**: Images upload to `question-images` bucket (5MB limit, admin-only upload)

### 2026-01-21: M6+ RBAC Implementation
- **Added**: `MIGRATION_M6_RBAC.sql` - Complete RBAC migration script
- **Added**: `user_roles` table with `app_role` ENUM
- **Added**: `custom_access_token_hook` for JWT claims injection
- **Added**: RLS policies for admin-only write access
- **Updated**: Middleware to check JWT claims for admin routes
- **Updated**: Admin layout with RBAC enforcement + dev bypass

---

## 1. Tech Stack Choice
**Frontend:** Next.js 14 (App Router)  
**Backend/DB:** Supabase (Auth + Database + Storage)  
**UI Styling:** TailwindCSS  
**TypeScript:** Yes  
**Deployment:** Netlify (Next.js on Netlify + serverless functions) + Supabase (DB/Auth/Storage)  

**Rationale:**  
Next.js App Router allows clean SSR + static hybrid. Supabase offers integrated Auth and SQL DB for free tier. Both integrate smoothly with GitHub for CI/CD.

**Netlify note:** Use the Netlify Next.js runtime/plugin with `netlify.toml`. Env vars live in Netlify → Site settings → Environment.
---

## 2. Trade-offs
| Choice | Advantage | Limitation |
|--------|------------|-------------|
| Supabase | Quick setup, Auth, SQL | Slight vendor lock-in |
| Next.js | SEO + Performance | Learning curve for routing |

---

## 3. Next Steps
- Freeze data model & routes in `BLUEPRINT.md`
- Define performance budget & sign-off as SSOT
