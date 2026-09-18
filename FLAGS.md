# MANGU Publishers — Feature Flags

> **Last updated:** 2026-09-18 | **Owner:** accounting@mangu-publishers.com
> **Implementation:** `lib/flags.ts` + environment variables

---

## Active Flags

| Flag               | Env Var                   | Default    | Purpose                                             | Owner         |
| ------------------ | ------------------------- | ---------- | --------------------------------------------------- | ------------- |
| `authProvider`     | `AUTH_PROVIDER`           | `supabase` | Switch between Supabase Auth and Better Auth        | Phoenix WS1   |
| `databaseProvider` | `DATABASE_PROVIDER`       | `supabase` | Switch between Supabase DB and MongoDB              | Phoenix WS2   |
| `legacyResetCopy`  | `AUTH_LEGACY_RESET_COPY`  | `false`    | Use "Welcome to the new Mangu" copy in reset emails | Phoenix WS1.7 |
| `analyzeBundle`    | `ANALYZE`                 | `false`    | Enable `@next/bundle-analyzer` on build             | PERF          |
| `emailEnabled`     | `RESEND_API_KEY` presence | dynamic    | Enable transactional email features                 | WS1           |

---

## Planned Flags

| Flag            | Env Var                                 | Planned For      | Purpose                                            |
| --------------- | --------------------------------------- | ---------------- | -------------------------------------------------- |
| `copilotStudio` | `COPILOT_DIRECT_LINE_SECRET` presence   | MSFT integration | Enable Copilot Studio Author Concierge embed       |
| `dataverse`     | `DATAVERSE_URL` + `DATAVERSE_CLIENT_ID` | MSFT integration | Enable Dataverse sync flows                        |
| `bundleBudget`  | `BUNDLE_BUDGET_BYTES`                   | PERF Phase 3     | Fail CI if main chunk exceeds budget               |
| `eqs001`        | `ENABLE_EQS_001`                        | Grok port        | Enable EQS-001 rubric engine for manuscript review |
| `returnApp`     | `ENABLE_RETURN_APP`                     | Grok port        | Enable the MANGU Return reading app routes         |

---

## Flag Implementation

Flags are read from environment variables at runtime in `lib/flags.ts`:

```typescript
export const flags = {
  authProvider: (process.env.AUTH_PROVIDER ?? 'supabase') as 'supabase' | 'better-auth',
  databaseProvider: (process.env.DATABASE_PROVIDER ?? 'supabase') as 'supabase' | 'mongodb',
  legacyResetCopy: process.env.AUTH_LEGACY_RESET_COPY === '1',
  analyzeBundle: process.env.ANALYZE === 'true',
  emailEnabled: Boolean(process.env.RESEND_API_KEY),
  copilotStudioEnabled: Boolean(process.env.COPILOT_DIRECT_LINE_SECRET),
};
```

---

## Flag Safety Rules

1. **Never flip `AUTH_PROVIDER=better-auth` in production** until Phase 11 forced-reset
   readiness is confirmed (human gate P11.6).
2. **Never flip `DATABASE_PROVIDER=mongodb` in production** until all Phoenix WS2 PRs are
   merged and Atlas ping confirms connectivity.
3. Feature flags are not a substitute for code review — a flag that hides broken code is
   still broken code.
4. Remove flags (and their environment variables) within 30 days of the feature going GA.

---

_See also: `docs/FEATURE_FLAG_AND_ENV_SCHEMA.md` for the Zod validation schema._
