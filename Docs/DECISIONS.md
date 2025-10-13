# DECISIONS.md – Architecture & SSOT Freeze (v0.1)

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
