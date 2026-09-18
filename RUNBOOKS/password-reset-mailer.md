# RUNBOOK: Password Reset Mailer (Resend)

**Owner:** accounting@mangu-publishers.com
**Stack:** Better Auth + Resend + `emails/reset.tsx`

---

## Current State

Password reset is fully implemented. Key files:

| File                                | Purpose                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `lib/auth.ts`                       | Better Auth config with `sendResetPassword` via Resend       |
| `lib/email/send.ts`                 | `sendEmail()` using Resend SDK; `sendPasswordReset()` helper |
| `emails/reset.tsx`                  | React Email template for reset emails                        |
| `scripts/request-password-reset.ts` | CLI script for manual/batch resets                           |
| `scripts/send-forced-resets.ts`     | Phoenix WS1.7 — batch forced resets for legacy users         |

---

## Environment Variables Required

| Variable             | Description                                                   | Where to set              |
| -------------------- | ------------------------------------------------------------- | ------------------------- |
| `RESEND_API_KEY`     | Resend API key (starts with `re_`)                            | Vercel env + `.env.local` |
| `BETTER_AUTH_URL`    | Full URL of the app (e.g. `https://www.mangu-publishers.com`) | Vercel env                |
| `BETTER_AUTH_SECRET` | Random string ≥ 32 chars                                      | Vercel env                |

The reset URL in the email is constructed as:
`${BETTER_AUTH_URL}/reset-password/confirm?token=<token>`

---

## Testing password reset locally

1. Set up `.env.local` with your Resend test key:

   ```
   RESEND_API_KEY=re_xxxxxxxxxx
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=<your-secret-32-chars>
   MONGODB_URI=<your-atlas-uri>
   ```

2. Start the dev server: `npm run dev`

3. Go to `/forgot-password` and enter a test email

4. Check the Resend dashboard (https://resend.com/emails) for the sent email

---

## Manual single-user reset (CLI)

```bash
# Reset one user's password (triggers Resend email)
npm run auth:request-password-reset -- --email user@example.com

# Legacy reset (shows "Welcome to the new Mangu" copy in the email)
npm run auth:request-password-reset -- --email user@example.com --legacy
```

---

## Batch forced reset for legacy users (Phoenix WS1.7)

This sends a reset email to every imported legacy user. **The human operator runs this
after Phase 11 import is complete** (not before — users must exist in MongoDB).

```bash
# Dry run — shows what would be sent without sending
npm run phoenix:forced-resets -- --dry-run

# Live run — sends emails; rate-limited to 10 req/s to avoid Resend limits
npm run phoenix:forced-resets

# Check results
cat export/forced-reset-report.json | jq '{total, sent, failed, skipped}'
```

---

## Email template

The `emails/reset.tsx` template is a React Email component. To preview it:

```bash
# Install react-email (dev tool, not in package.json):
npx react-email dev

# Open http://localhost:3000 to preview reset.tsx
```

### Customising the template

The template accepts:

```typescript
interface ResetEmailProps {
  userName?: string; // Shown as "Hi, {name}" if provided
  resetUrl: string; // The password reset link
  legacyWelcome?: boolean; // Changes subject + copy for forced-reset batch
}
```

---

## Resend domain configuration (HUMAN GATE)

For production, the `from` address is `noreply@mangu.app`. This requires:

1. Add `mangu.app` domain in the Resend dashboard → Domains → Add Domain
2. Add the DNS records Resend provides (TXT + MX) to your DNS provider (Cloudflare)
3. Verify domain in Resend (usually takes < 5 minutes)
4. Confirm `from: 'MANGU <noreply@mangu.app>'` in `lib/email/send.ts` matches the verified domain

> If the domain is not verified, Resend will reject sends from that address. Use
> `onboarding@resend.dev` for testing (Resend's default domain) by temporarily
> changing `from` in `lib/email/send.ts`.

---

## Troubleshooting

| Symptom                          | Likely Cause                                                         | Fix                                                 |
| -------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| Email not sent, no error in logs | `RESEND_API_KEY` not set                                             | Add to `.env.local` or Vercel env                   |
| Resend 422 error                 | `from` domain not verified                                           | Verify domain in Resend dashboard                   |
| Reset link expired               | Better Auth default token TTL is 1 hour                              | User must request a new reset                       |
| Reset link invalid               | `BETTER_AUTH_URL` mismatch between token generation and verification | Ensure `BETTER_AUTH_URL` is consistent              |
| Batch reset hangs                | Rate limit hit                                                       | Script is rate-limited; reduce `BATCH_SIZE` env var |

---

_Runbook v1.0 — 2026-09-18_
