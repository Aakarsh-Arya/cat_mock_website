# Stack Evaluation (SSOT Export)

## Primary: Next.js + Supabase (Free Tier)
- Netlify serves the Next.js App Router with SSR/ISR; Supabase provides Auth, Postgres, and Storage.
- Free tier covers 50k MAU, 500 MB database, 1 GB storage, and 5 GB egress, which supports roughly 200 concurrent exam takers.
- Row-Level Security and signed URLs secure exam data while the JS SDK avoids maintaining custom servers.

## Fallback: Firebase (Firestore + Auth + Storage)
- Daily quotas of 50k reads, 20k writes, 1 GB storage, and 10 GB egress remain sufficient if autosave is optimized.
- Strong real-time and offline support is available, but strict daily limits require monitoring under sudden spikes.

## Deferred: Cloudflare Workers + D1
- Free plan allows about 100k requests per day with global edge delivery, yet D1 is still beta and would add engineering overhead.
- Kept as a future consideration once the MVP stabilizes or if multi-region scaling is required.

## Cost Posture
- All primary services stay within ₹0/month now; a ₹500/month reserve covers Supabase Pro or Firestore Blaze upgrades if usage increases.
