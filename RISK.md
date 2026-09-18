# MANGU Publishers — Risk Register

> **Last updated:** 2026-09-18 | **Owner:** accounting@mangu-publishers.com

---

## Active Risks

| ID    | Category    | Risk                                                                                            | Likelihood | Impact   | Mitigation                                                                                                 | Status            |
| ----- | ----------- | ----------------------------------------------------------------------------------------------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------- | ----------------- |
| R-001 | Migration   | Phoenix migration incomplete at production cutover — legacy Supabase Auth fails for new users   | Medium     | Critical | WS1 dual-run: Better Auth active but Supabase remains default; NO-GO gate G1 blocks cutover                | OPEN              |
| R-002 | Security    | Forced password reset not triggered for all legacy users — legacy bcrypt accounts remain usable | Medium     | High     | Phoenix WS1.7: `scripts/send-forced-resets.ts` batch job; accounts locked with `!locked:` prefix           | OPEN              |
| R-003 | Data        | MongoDB Atlas connection pool exhaustion during peak traffic                                    | Low        | High     | `MongoClient` singleton + `globalThis._mongoClientPromise`; Atlas auto-scale configured                    | MITIGATED         |
| R-004 | Data        | Stripe webhook processed twice — duplicate order created                                        | Low        | High     | Unique index on `orders.stripe_payment_intent_id`; upsert with `$setOnInsert`; always 200 on duplicate     | MITIGATED         |
| R-005 | Operations  | Vercel Blob storage migration leaves broken `cover_url`/`manuscript_url` references             | Medium     | High     | `scripts/migrate-storage.ts` is idempotent; reports `{migrated, failed, skipped}`; human verifies 0 failed | OPEN (WS3)        |
| R-006 | Compliance  | GDPR: reader email/profile data in MongoDB not mapped to a data subject deletion flow           | Medium     | High     | `scripts/export-delta.ts` tracks changes; user deletion flow needed (WS6 followup)                         | OPEN              |
| R-007 | Performance | Main JS bundle exceeds 150 KB gzip target — slower FCP on mobile                                | High       | Medium   | `optimizePackageImports` for framer-motion/lucide/recharts; lazy AudioPlayer; budget enforced in CI        | IN PROGRESS       |
| R-008 | Operations  | `RESEND_API_KEY` not set in production — password reset emails silently dropped                 | Medium     | High     | `isEmailConfigured()` guard logs warning; health endpoint checks Resend config                             | MITIGATED         |
| R-009 | Integration | Copilot Studio bot not provisioned — author concierge unavailable                               | High       | Low      | Tracked in RUNBOOKS/copilot-studio.md + HUMAN_TASKS.md                                                     | OPEN              |
| R-010 | Cost        | Resend email volume exceeds free tier (3,000 emails/month) during forced-reset batch            | Medium     | Low      | Batch is a one-time operation; upgrade Resend plan if needed                                               | OPEN              |
| R-011 | Security    | Edge middleware uses Mongo driver (blocked by Edge runtime) — session check fails               | Low        | Critical | Guardrail: middleware uses cookie-only session check; full validation in server components                 | MITIGATED         |
| R-012 | Security    | CSP allows `'unsafe-inline'` for scripts — XSS risk                                             | Medium     | High     | Required by Next.js 14 hydration; nonce-based CSP deferred to post-Phoenix                                 | ACCEPTED          |
| R-013 | Operations  | Cloud Run standby not maintained 48h post-cutover — no rollback target                          | Medium     | Medium   | Rollback runbook (RUNBOOKS/rollback.md); Cloud Run stays on standby per Phoenix §8.4                       | OPEN              |
| R-014 | Data        | Supabase pg_dump not taken before cutover — no restore point                                    | Medium     | Critical | Human gate: P1.8 full backup required before any cutover action                                            | OPEN (HUMAN GATE) |

---

## Risk Colour Key

| Colour      | Meaning                                              |
| ----------- | ---------------------------------------------------- |
| 🔴 Critical | Production outage or unrecoverable data loss         |
| 🟠 High     | Major feature unavailability or compliance violation |
| 🟡 Medium   | Degraded experience or elevated cost                 |
| 🟢 Low      | Minor inconvenience                                  |

---

## Closed Risks

| ID    | Risk                                       | Closed Date | Resolution                                              |
| ----- | ------------------------------------------ | ----------- | ------------------------------------------------------- |
| R-C01 | MongoDB driver imported in Edge middleware | 2026-07-19  | Cookie-only session check in middleware (ADR guardrail) |
| R-C02 | Stripe webhook not idempotent              | 2026-08-01  | Unique sparse index + upsert pattern (Phoenix WS2b)     |

---

_Update this register when new risks are identified or mitigations change status._
