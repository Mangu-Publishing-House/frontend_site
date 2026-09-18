# MANGU Publishers — Feature Inventory

> **Last updated:** 2026-09-18 | **Status:** Next.js 14 working base

---

## Shipped Features

### Auth & Identity

- [x] Better Auth with MongoDB adapter (WS1)
- [x] Email + password login / registration
- [x] Email verification (Resend)
- [x] Password reset flow (Resend)
- [x] Forced password reset for legacy users (`scripts/send-forced-resets.ts`)
- [x] Role system: `reader | author | editor | admin`
- [x] Session management (cookie-based, edge-safe)
- [x] Supabase Auth dual-run (default until Phoenix cutover)

### Book Catalog

- [x] Book listing with pagination (`lib/mongo-queries.ts`)
- [x] Book detail page with slug routing
- [x] Full-text search (`$text` index on `books`)
- [x] Genre filtering
- [x] Author profiles
- [x] Cover image storage (Vercel Blob)
- [x] Review system with atomic avg_rating recompute

### Commerce

- [x] Stripe Checkout integration
- [x] Webhook idempotency (`orders.stripe_payment_intent_id` unique index)
- [x] Purchase confirmation email (Resend)
- [x] Order history dashboard

### Reading Experience

- [x] Manuscript secure download (`/api/files/[id]` — auth + purchase check)
- [x] Reading progress tracking (`reading_progress` collection)
- [x] Audio player (Web Audio API — `components/audio/`)
- [x] Notes panel (`components/reader/NotesPanel`)
- [x] Highlights (`components/reader/HighlightPopover`)

### Author Portal

- [x] Manuscript upload (Vercel Blob)
- [x] Book creation / editing
- [x] Dashboard: sales, reviews, reading progress stats

### Admin

- [x] User management (role change, suspend)
- [x] Book approval workflow
- [x] Audit log (`lib/audit.ts` → `audit_logs` collection)
- [x] Health endpoint (`/api/health?ready=1`)
- [x] Rate limiting (Upstash: 100 req/60s, 10 req/60s on auth routes)

### Infrastructure

- [x] MongoDB singleton (`lib/mongo.ts`)
- [x] Vercel Blob storage (WS3)
- [x] Sentry error monitoring
- [x] Structured JSON logging (`lib/logger.ts`)
- [x] CSP security headers
- [x] HSTS (production only)
- [x] Bundle analyzer (`ANALYZE=true`)

---

## In Progress

### Phoenix Migration (WS1–WS6)

- [x] WS1: Better Auth fully wired (dual-run active)
- [x] WS2a: MongoDB type definitions + query layer
- [x] WS2b: Checkout API routes (MongoDB)
- [~] WS2c: Server actions + avg_rating recompute
- [~] WS2d: Genre soft-404, sitemap (MongoDB)
- [~] WS3: Storage migration script + blob CSP
- [ ] WS4: Supabase purge + env cleanup
- [ ] WS5: Test suite migration (Jest mocks)
- [ ] WS6: Observability + rate limiting finalization

### Bundle Optimization (PERF-PHASE3)

- [x] `optimizePackageImports` for framer-motion, lucide-react, recharts, Radix UI
- [x] AudioPlayerProvider + MiniPlayer lazy-loaded (`next/dynamic`)
- [ ] Bundle budget CI check (< 150 KB gzip on main chunk)
- [ ] Verify savings via `ANALYZE=true npm run build`

---

## Planned Features

### Microsoft Integration

- [ ] Copilot Studio Author Concierge bot (RUNBOOKS/copilot-studio.md)
- [ ] Top 10 Power Automate flows (MSFT-INTEGRATION.md)
- [ ] Dataverse core tables (MSFT-INTEGRATION.md)
- [ ] Power BI publishing analytics
- [ ] Microsoft Clarity heatmaps

### Grok Workspace Port

- [ ] EQS-001 rubric engine (manuscript quality scoring)
- [ ] MANGU Return reading app (60+ routes)
- [ ] Enhanced recommendations (OpenAI embeddings)

### Future

- [ ] EPUB reader (in-browser)
- [ ] Book clubs
- [ ] Author subscription tiers
- [ ] Newsletter integration (Resend audiences)

---

_See PROGRESS.md for current sprint status._
