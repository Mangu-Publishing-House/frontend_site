# ADR-003: Working Base and Stack Alignment

**Date:** 2026-09-18
**Status:** Accepted
**Deciders:** accounting@mangu-publishers.com

---

## Context

MANGU Publishers has two active codebases:

1. **GitHub `main` (Next.js 14 / React 18)** — production-deployed on Vercel, has full
   CI/CD, ops infrastructure (Phoenix migration, Better Auth, MongoDB, Vercel Blob), 22 HUMAN_TASKS,
   and the active Project Phoenix migration WS1–WS6 in flight.

2. **Grok ZIP workspace (TanStack Start / React 19 / Tailwind 4)** — newer stack with the
   full MANGU Return app, EQS-001 rubric engine, 60+ routes, Better Auth, and governance docs.
   This workspace was developed as a greenfield prototype.

The question is: which codebase is the working base for ongoing development?

---

## Decision

**We continue on the Next.js 14 / React 18 GitHub `main` codebase as the single working base.**

The Grok/TanStack workspace is treated as a specification and reference, with its features,
governance documents, and architectural decisions ported in as the Next.js codebase is ready.
A dedicated branch `feat/grok-workspace-tanstack` is used to bring in assets from the Grok workspace.

---

## Rationale

### Forces

| Factor                | Next.js (GitHub main)               | TanStack (Grok ZIP) |
| --------------------- | ----------------------------------- | ------------------- |
| CI/CD                 | Full GitHub Actions, Vercel preview | None                |
| Production deployment | Live on Vercel + Supabase           | Not deployed        |
| Migration in-flight   | Phoenix WS1–WS6, complex            | Not applicable      |
| Auth                  | Better Auth fully wired             | Better Auth wired   |
| Database              | MongoDB + Supabase dual-run         | MongoDB only        |
| Bundle tooling        | `@next/bundle-analyzer`             | Vite/TanStack       |
| Test coverage         | Jest 127 tests + Playwright         | Unknown             |
| Ops runbooks          | 22 human tasks tracked              | None                |
| React version         | 18 (stable, Vercel-supported)       | 19 (RC/canary)      |

### Reasons for choosing Next.js as working base

1. **Production is live.** Switching the stack while production is on Next.js would require
   a full re-deployment and DNS/infra migration — the blast radius exceeds the benefit at this stage.

2. **Phoenix migration is active.** WS1–WS6 is partially complete and depends on Next.js
   App Router patterns (middleware, server actions, route handlers). Abandoning mid-migration
   would create a debt pile larger than the migration itself.

3. **CI/CD and ops exist.** GitHub Actions, Sentry, Vercel preview deployments, and 22 tracked
   human tasks are built around the Next.js repo. The Grok workspace has none of this.

4. **React 19 risk.** TanStack Start with React 19 is not yet stable on Vercel. Adopting it
   for a production publishing platform introduces unnecessary risk.

5. **Feature parity is portable.** The EQS-001 rubric engine, Return app, and governance docs
   from the Grok workspace can be ported route-by-route into the Next.js App Router without
   a full stack switch.

### What we adopt from the Grok workspace

- Governance documents: RISK.md, FLAGS.md, ANALYTICS.md, FEATURES.md, PROGRESS.md, RESUME.md
- MSFT-INTEGRATION.md (25-item Microsoft catalog)
- RUNBOOKS: rollback, copilot-studio, password-reset-mailer, manuscript-upload-av
- EQS-001 rubric engine (port to Next.js server action / API route)
- Return app UI (port to Next.js App Router under `app/(portals)/return/`)
- TanStack Query patterns (already available as `swr` in Next.js codebase)

---

## Consequences

**Positive:**

- Zero deployment risk — production stays on known-good stack.
- Phoenix migration can complete without re-architecture.
- All existing CI/CD, monitoring, and ops tooling remains valid.

**Negative:**

- Cannot use TanStack Start features (file-based routing, RSC streaming patterns differ).
- React 19 features (use(), async server components improvements) deferred until Next.js
  adopts them or Phoenix migration completes and a stack upgrade is planned.
- Grok workspace cannot be run as-is; it must be ported route by route.

**Mitigation:**

- The `feat/grok-workspace-tanstack` branch tracks porting progress.
- A future ADR will revisit the React 19 / TanStack upgrade once Phoenix WS6 ships.

---

## Alternatives Considered

### Option A: Adopt TanStack Start as primary

Rejected. Production is live on Next.js; migration has 22 open human gates; React 19
on Vercel is not GA. Risk outweighs the DX improvement.

### Option B: Maintain both codebases in parallel

Rejected. Duplicate maintenance of auth, data layer, and CI/CD is unsustainable for
a small team. One working base is required.

---

_Supersedes: No prior ADR addresses this question. Complements ADR-001 (Vercel canonical platform) and ADR-002 (MongoDB data platform)._
