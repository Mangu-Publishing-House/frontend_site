# PHOENIX RECON — Phase 0 refresh

**Date:** 2026-09-10  
**Repo:** `Mangu-Publishing-House/my_publishing`  
**Baseline SHA:** `00db905` (`main`, also `copilot/create-clean-duplicate-repo`)  
**Contract:** `docs/PROJECT_PHOENIX.md` v4.0.3  
**Prior recon:** `docs/PHOENIX_RECON.md` on main (baseline `9320407` / 2026-07-18) — **STALE**

---

## Verdict

Phase 0 planning is done. Dual-run **code is already on `main`**.  
You do **not** need a greenfield rewrite. You need:

1. This recon frozen (this file).
2. Human secrets + `db:mongo:ping` against Atlas staging.
3. Rebase/merge the open Phoenix slice PRs instead of recreating them.
4. Do **not** flip `AUTH_PROVIDER` / `DATABASE_PROVIDER` / `STORAGE_PROVIDER` off `supabase` in production.
5. PR #4 (`grep @supabase` = 0) stays **last**.

Old recon claimed: *“Zero MongoDB / Better Auth / Vercel Blob application code is merged.”*  
That is false on current `main`.

---

## Executive snapshot (`main` @ `00db905`)

| Dimension | Reality now |
| --- | --- |
| Router | App Router. `app/` is authoritative. |
| Auth live | Supabase Auth (default). Better Auth server + client **wired** behind `AUTH_PROVIDER`. |
| Data live | Supabase Postgres (default). Mongo client + `lib/data/*` + `lib/mongo-*` **present**. |
| Storage live | Supabase Storage (default). `lib/storage/provider.ts` + `@vercel/blob` **present**. |
| Phoenix deps | `better-auth ^1.6.25`, `mongodb ^7.5.0`, `@vercel/blob ^0.27.0`, `@supabase/ssr ^0.12.3`, `@supabase/supabase-js ^2.110.7` |
| Scripts | `phoenix:*` and `db:mongo:*` **exist and are wired** in `package.json` |
| Hosting | Vercel + legacy Cloud Run still in repo |
| Roles | `reader \| author \| partner \| admin` (no `editor`) |
| Feature freeze | In effect. Flags in `lib/flags.ts` default OFF for comics/papers/audio/reviews/clubs/wishlist/follows |

---

## 0.A Routing

- Authoritative tree is `app/` (route groups `(auth)`, `(consumer)`, `(portals)`, plus `admin/`, `api/`, `checkout/`, `dashboard/`).
- Legacy `pages/` if present is leftover (`_document.tsx` only in prior recon). Do not add Pages Router routes.
- Middleware already imports **both** `getSessionCookie` (Better Auth) and `getEdgeAuthUser` (Supabase). Dual-run at the edge is started.

Protected surfaces that WS1 must keep working on supabase default:  
`/reading*`, `/library*`, `/author*`, `/partner*`, `/admin*`, `/dashboard*`.

---

## 0.B Branches & PRs — do not recreate

Open Phoenix-related PRs (rebase onto current `main`, do not fork new implementations):

| PR | Branch | Slice |
| --- | --- | --- |
| #396 | `feat/phoenix-ws2b-checkout-dual-run-auth` | Checkout session dual-run |
| #397 | `feat/phoenix-ws3-blob-csp-env-parity` | Blob CSP + env docs |
| #398 | `chore/phoenix-ws4-dead-export-chain` | Dead Supabase export delete |
| #399 | `feat/phoenix-ws2d-sitemap-dual-run` | Sitemap dual-run |
| #400 | `feat/phoenix-ws2d-genres-soft-404` | Genres soft-404 |
| #408 | `fix/phoenix-webhook-idempotency-dual-run` | Webhook idempotency ledger |
| #409 | `feat/phoenix-ws3-upload-unification` | Remaining uploads → Blob |
| #410 | `chore/repo-audit-dead-file-sweep-f8` | Dead file sweep |
| #411 | `chore/phoenix-secret-scan-gate-f6-3` | Secret-scan CI gate |

Also present: `cursor/mongodb-scaffold-dffa` was the original scaffold; its assets (`lib/mongodb.ts`, `db:mongo:*` scripts) are **already on main**.

Fixed merge order remains:  
**#1 auth → #2a–#2d data → #3 blob → #5 tests → #6 obs → #4 purge last.**

---

## 0.C Pinned packages (from `package.json` ranges on main)

| Package | Declared |
| --- | --- |
| next | 14.2.35 |
| react | 18.3.1 |
| @supabase/ssr | ^0.12.3 |
| @supabase/supabase-js | ^2.110.7 |
| better-auth | ^1.6.25 |
| mongodb | ^7.5.0 |
| @vercel/blob | ^0.27.0 |
| @upstash/ratelimit | 1.1.3 |
| @upstash/redis | ^1.32.0 |
| @sentry/nextjs | ^10.66.0 |
| stripe | ^14.25.0 |
| resend | ^6.18.0 |
| node engines | >=22.22.1 |

Resolved lockfile versions were **not** re-read in this remote recon. Run `npm ls better-auth mongodb @vercel/blob @supabase/supabase-js` locally and paste into this section before the human gate.

---

## 0.D Supabase footprint

Prior recon (July): **643 hits / 96 files** under `app/ lib/ components/ types/`.

This refresh did **not** re-run grep on a full clone. That July number is the last frozen numerator.  
**Action:** owner runs:

```bash
grep -rin '@supabase' app lib components types --include='*.ts' --include='*.tsx' | wc -l
```

Do not drive that number to zero until PR #4.

Keep-during-dual-run:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (scripts / admin client only)
- `lib/supabase/*`

Purge-at-PR-#4:
- All `@supabase` imports
- `lib/supabase/` directory
- `@supabase/*` packages

---

## 0.E Scripts inventory (wired in `package.json`)

| Script | File | On main? |
| --- | --- | --- |
| `db:mongo:ping` | `scripts/mongo-ping.ts` | yes |
| `db:mongo:indexes` | `scripts/mongo-ensure-indexes.ts` | yes |
| `db:mongo:up` | `scripts/mongo-up.ts` | yes |
| `db:atlas:bootstrap` | `scripts/atlas-bootstrap.ts` | yes |
| `phoenix:export` | `scripts/export-supabase.sh` | yes |
| `phoenix:transform` | `scripts/transform-data.ts` + `scripts/lib/transform.ts` | yes |
| `phoenix:migrate-storage` | `scripts/migrate-storage.ts` | yes |
| `phoenix:verify` | `scripts/verify-migration.mongo.js` | yes |
| `phoenix:forced-resets` | `scripts/send-forced-resets.ts` | yes |
| `phoenix:delta` | `scripts/export-delta.ts` | yes |
| `auth:request-password-reset` | `scripts/request-password-reset.ts` | yes |
| `validate-env` | `scripts/validate-env.ts` | yes |

Human-gate before any of these hit production: dry-run flags, backups, forced-reset approval.

---

## 0.F / 0.G Tests & infra (not executed here)

Cannot be closed from this session:

- `npm test` / Playwright need a clean checkout + secrets.
- `npm run db:mongo:ping` needs `MONGODB_URI`.
- Vercel Blob write check needs `BLOB_READ_WRITE_TOKEN`.
- Vercel env key list needs dashboard/CLI.

Prior recon claimed Jest 24/24 suites 127/127 at that SHA. Re-run on `00db905` before WS5.

---

## Files that MUST NOT be recreated

WS1/WS2/WS3 agents keep breaking Phoenix by rewriting these. Audit and patch only:

```
lib/auth.ts
lib/auth-client.ts
lib/auth/provider.ts
lib/auth/better-auth-actions.ts
lib/auth/roles.ts
lib/auth/require-role.ts
lib/db/provider.ts
lib/storage/provider.ts
lib/mongodb.ts
lib/mongodb-config.ts
lib/mongo.ts
lib/mongo-queries.ts
lib/mongo-books.ts
lib/mongo-profiles.ts
lib/mongo-reviews.ts
lib/data/*
lib/supabase/*
middleware.ts
lib/middleware/auth.ts
scripts/mongo-*.ts
scripts/transform-data.ts
scripts/migrate-storage.ts
scripts/send-forced-resets.ts
scripts/validate-env.ts
```

---

## What is actually left (work, not architecture)

| Workstream | Status on main | Remaining |
| --- | --- | --- |
| WS1 Auth | Dual-run libs + middleware imports both providers | Finish any login/register/reset actions still supabase-only; `?next=` redirects; do not call Mongo from Edge |
| WS2 Data | Provider + mongo helpers + `lib/data/*` | Merge #396 #399 #408; finish any actions still hitting supabase client directly when `DATABASE_PROVIDER=mongodb` |
| WS3 Storage | Provider + blob package | Merge #397 #409; do not run migrate-storage on prod |
| WS5 Tests | Jest/Playwright exist | Replace supabase mocks after dual-run compiles |
| WS6 Obs | logger, Sentry, Upstash already in deps | Merge #411; confirm 429 tests |
| WS4 Purge | Must stay last | `grep=0` only after everything else + human gate |
| Cutover | Scripts exist | Backups, dry-run Atlas, forced resets, DNS — humans + secrets |

---

## Human gate block (not signed)

```
Phase 0 Exit Gate: PENDING
Reviewers: [Lead Engineer / Engineering Manager]
Date: 2026-09-10
Status: Recon refreshed against main@00db905.
Authorization to write NEW dual-run files: NO — extend existing files only.
Authorization to flip production providers off supabase: NO.
Authorization to merge PR #4: NO.
Next: owner runs grep count + npm ls + db:mongo:ping; rebase open Phoenix PRs.
```

---

## Constraints (re-stated)

1. Feature freeze.
2. No secrets in git.
3. Do not migrate password hashes. Forced reset only.
4. Keep Supabase live until cutover.
5. Zero `@supabase` imports only at final PR #4.
