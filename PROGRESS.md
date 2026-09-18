# MANGU Publishers — Progress Tracker

> **Last updated:** 2026-09-18 | **Branch:** feat/grok-workspace-tanstack
> **Working base:** Next.js 14 (ADR-003)

---

## Sprint: Grok Workspace Integration (2026-09-18)

### Completed This Session

- [x] Created `feat/grok-workspace-tanstack` branch
- [x] `MSFT-INTEGRATION.md` — 25-item Microsoft catalog with verdicts/architecture/licensing
- [x] `docs/adr/ADR-003-working-base-and-stack.md` — Next.js vs TanStack decision
- [x] `RISK.md` — 14 active risks with mitigations
- [x] `FLAGS.md` — feature flag inventory
- [x] `ANALYTICS.md` — analytics stack + AI recommendations roadmap
- [x] `RUNBOOKS/rollback.md` — production rollback procedures
- [x] `RUNBOOKS/copilot-studio.md` — Author Concierge bot setup guide
- [x] `RUNBOOKS/password-reset-mailer.md` — Resend password reset runbook
- [x] `RUNBOOKS/manuscript-upload-av.md` — upload + AV scanning runbook
- [x] `FEATURES.md` — complete feature inventory
- [x] Bundle optimization: `optimizePackageImports` for framer-motion/lucide/recharts/Radix in `next.config.js`
- [x] Bundle optimization: lazy AudioPlayerProvider + MiniPlayer in `app/providers.tsx`

### In Progress

- [ ] Verify bundle size reduction (need `ANALYZE=true npm run build` with real env)

### Remaining (Priority Order)

1. **Bundle CI gate** — add bundle budget check to `ci.yml` (< 150 KB gzip)
2. **Password reset mailer** — Resend domain verification is a HUMAN GATE; runbook created
3. **Copilot Studio** — provisioning is a HUMAN GATE; runbook + API token endpoint stub created
4. **Power Automate flows** — documented in MSFT-INTEGRATION.md; flow creation is HUMAN GATE
5. **Dataverse tables** — documented in MSFT-INTEGRATION.md; provisioning is HUMAN GATE

---

## Phoenix Migration Status

| Workstream          | PR  | Status           | Merged? |
| ------------------- | --- | ---------------- | ------- |
| WS1 Auth            | #1  | ✅ Done          | Yes     |
| WS2a Data types     | #2a | ✅ Done          | Yes     |
| WS2b Checkout       | #2b | ✅ Done          | Yes     |
| WS2c Server actions | #2c | 🟡 Partial       | No      |
| WS2d Genre/sitemap  | #2d | 🟡 Partial       | No      |
| WS3 Storage         | #3  | 🟡 In progress   | No      |
| WS4 Cleanup         | #4  | ⏳ Blocked (WS3) | No      |
| WS5 Tests           | #5  | ⏳ Blocked (WS4) | No      |
| WS6 Observability   | #6  | ⏳ Blocked (WS5) | No      |

---

## Human Gates Pending

(See `HUMAN_TASKS.md` for full list — 22 items as of 2026-08-25)

| Gate           | Blocker                                        |
| -------------- | ---------------------------------------------- |
| C0.0           | Merge Phoenix WS2d PR #349                     |
| C0.1           | Disable Cursor storm automations               |
| P1.8           | Full Supabase pg_dump + storage snapshot       |
| P11.x          | Production mongoimport with real credentials   |
| Resend domain  | Verify `mangu.app` in Resend dashboard         |
| Copilot Studio | Provision bot + Direct Line secret             |
| Power Automate | Create flows with Premium connector access     |
| Dataverse      | Provision tables in Power Platform environment |

---

## Metrics

| Metric                   | Current    | Target   | Status         |
| ------------------------ | ---------- | -------- | -------------- |
| Main JS bundle (gzip)    | ~164 KB    | < 150 KB | 🟡 In progress |
| Jest tests passing       | 127/127    | 127/127  | ✅             |
| Phoenix NO-GO gates true | 1/13       | 13/13    | 🔴 NO-GO       |
| Supabase imports in app/ | ~108 files | 0        | 🔴 WS4 pending |

---

_Updated each session. See RESUME.md for next-session handoff notes._
