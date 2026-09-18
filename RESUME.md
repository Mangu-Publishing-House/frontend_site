# MANGU Publishers — Session Resume / Handoff

> **Last updated:** 2026-09-18
> **Branch:** feat/grok-workspace-tanstack
> **Working base:** Next.js 14 on GitHub `main` (ADR-003)

---

## What This Branch Is

`feat/grok-workspace-tanstack` integrates governance documents, RUNBOOKS, and
architectural decisions from the Grok/TanStack workspace prototype into the
Next.js working base. It does NOT switch the stack to TanStack — see ADR-003.

---

## Files Created This Session

| File                                         | Purpose                                                           |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `MSFT-INTEGRATION.md`                        | 25-item Microsoft 365 catalog — verdicts, architecture, licensing |
| `docs/adr/ADR-003-working-base-and-stack.md` | Next.js vs TanStack decision record                               |
| `RISK.md`                                    | 14-item risk register with mitigations                            |
| `FLAGS.md`                                   | Feature flag inventory                                            |
| `ANALYTICS.md`                               | Analytics stack + AI recommendations roadmap                      |
| `RUNBOOKS/rollback.md`                       | Production rollback procedures                                    |
| `RUNBOOKS/copilot-studio.md`                 | Copilot Studio Author Concierge setup                             |
| `RUNBOOKS/password-reset-mailer.md`          | Resend password reset runbook                                     |
| `RUNBOOKS/manuscript-upload-av.md`           | Manuscript upload + AV scanning                                   |
| `FEATURES.md`                                | Full feature inventory (shipped / in progress / planned)          |
| `PROGRESS.md`                                | Sprint tracker with Phoenix migration status                      |
| `RESUME.md`                                  | This file                                                         |

## Code Changes This Session

| File                       | Change                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `next.config.js`           | Added `optimizePackageImports` for framer-motion, lucide-react, recharts, Radix UI (PERF-PHASE3-1) |
| `app/providers.tsx`        | Lazy-loaded `AudioPlayerProvider` + `MiniPlayer` via `next/dynamic` (PERF-PHASE3-2)                |
| `.github/workflows/ci.yml` | Added bundle budget gate: fails CI if main chunk > 150 KB raw (PERF-PHASE3-3)                      |

---

## Priority Queue for Next Session

### 1. Verify bundle size reduction ⚡ (15 min)

```bash
ANALYZE=true npm run build
# Open .next/analyze/client.html
# Check main chunk size vs 150 KB budget
```

If still over budget: look at the `app/providers.tsx` client graph — likely candidate
is framer-motion in `components/shared/Footer.tsx` (used on every page).
Fix: convert FooterLink hover to CSS transitions instead of `motion.div`.

### 2. Password Reset Mailer — Resend domain (HUMAN GATE)

- Runbook: `RUNBOOKS/password-reset-mailer.md`
- Human must: verify `mangu.app` domain in Resend dashboard + add DNS records
- Code is complete — `lib/auth.ts` + `emails/reset.tsx` + `lib/email/send.ts`
- After human gate: smoke test via `npm run auth:request-password-reset -- --email test@example.com`

### 3. Copilot Studio Author Concierge (HUMAN GATE)

- Runbook: `RUNBOOKS/copilot-studio.md`
- Human must: provision Copilot Studio bot, set `COPILOT_DIRECT_LINE_SECRET` in Vercel
- ✅ Code done: `app/api/copilot/token/route.ts` token endpoint (returns 503 until secret set)
- Still to write: author portal embed page at `app/dashboard/author/copilot/page.tsx`
- See MSFT-INTEGRATION.md item 1

### 4. Power Automate Flows (HUMAN GATE)

- Documented: `MSFT-INTEGRATION.md` → Top 10 Flows section
- Human must: purchase Power Automate per-user Premium license + create flows
- Webhook endpoints on MANGU side are mostly already present (Stripe, manuscript, order events)

### 5. Dataverse Core Tables (HUMAN GATE)

- Documented: `MSFT-INTEGRATION.md` → Dataverse Core Tables section
- Human must: provision Power Platform environment + create tables
- 6 tables: `mangu_author`, `mangu_manuscript`, `mangu_royalty_agreement`, `mangu_partner`, `mangu_payout`, `mangu_order_log`

---

## Phoenix Migration Remaining (from HUMAN_TASKS.md)

- **C0.0:** Merge Phoenix WS2d PR #349 to `main` — BLOCKED ON HUMAN
- **WS3:** Storage migration script `scripts/migrate-storage.ts` — needs SUPABASE_SERVICE_ROLE_KEY
- **WS4:** Supabase purge — blocked on WS3 merge
- **WS5/WS6:** Tests + observability — blocked on WS4

---

## Environment Variables Needed

| Var                          | Purpose               | Status                               |
| ---------------------------- | --------------------- | ------------------------------------ |
| `RESEND_API_KEY`             | Transactional email   | HUMAN GATE (in `.env.local.example`) |
| `BETTER_AUTH_SECRET`         | Auth signing          | HUMAN GATE                           |
| `BETTER_AUTH_URL`            | Auth base URL         | HUMAN GATE                           |
| `MONGODB_URI`                | MongoDB Atlas         | HUMAN GATE                           |
| `COPILOT_DIRECT_LINE_SECRET` | Copilot Studio        | HUMAN GATE (new)                     |
| `NEXT_PUBLIC_CLARITY_ID`     | Microsoft Clarity     | HUMAN GATE (new)                     |
| `AZURE_OPENAI_ENDPOINT`      | Azure OpenAI (future) | Planned                              |

---

## Quick Commands

```bash
# Run tests (must stay 127/127)
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build with bundle analysis
ANALYZE=true npm run build

# Request single password reset
npm run auth:request-password-reset -- --email user@example.com

# Batch forced resets (dry run first)
npm run phoenix:forced-resets -- --dry-run
```

---

_Next session: start with Priority 1 (bundle verification), then move to Priority 3 (Copilot token endpoint — the only code item that isn't a human gate)._
