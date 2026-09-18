# RUNBOOK: Production Rollback

**Owner:** Release Manager / Solo Operator
**Scope:** Next.js app on Vercel + MongoDB Atlas + Better Auth

---

## When to use this runbook

- Production is returning 5xx errors on core flows (auth, checkout, book display)
- A Phoenix WS1–WS6 PR introduced a regression visible in Sentry
- Health endpoint `/api/health?ready=1` returns `{"ready": false}` or HTTP 5xx
- On-call alert fires (Sentry error spike, Upstash 429 storm, Atlas connection failures)

---

## 1. Assess blast radius (< 2 minutes)

```bash
# Check health endpoint
curl -s "https://www.mangu-publishers.com/api/health?ready=1" | jq .

# Check Sentry for error spike
# Dashboard: https://sentry.io (org: mangu-publishers)

# Check Vercel deployment status
# Dashboard: https://vercel.com/mangu-publishing-house/my-publishing
```

**If health is green and errors are isolated:** do not roll back — patch forward.
**If health is red OR checkout/auth is broken:** proceed to rollback.

---

## 2. Vercel instant rollback (fastest path — < 1 minute)

1. Go to **Vercel Dashboard → my-publishing → Deployments**
2. Find the last known-good deployment (before the bad commit)
3. Click **⋯ → Promote to Production**
4. Confirm — traffic switches instantly via Vercel's edge network

> **Note:** This rolls back the Next.js code only. MongoDB data and Better Auth sessions
> are unaffected (stateless rollback). If the bad PR included a DB migration, see §4.

---

## 3. Git revert (when Vercel rollback is not sufficient)

```bash
# Identify the bad commit
git log --oneline main | head -10

# Revert it (creates a new commit, preserving history)
git revert <bad-commit-sha> --no-edit

# Push — triggers Vercel redeploy
git push origin main
```

> Never `git reset --hard` on `main` — this rewrites shared history and will confuse
> other operators and Vercel's deployment tracking.

---

## 4. Database rollback (if a migration shipped with the bad PR)

Phoenix migrations are applied manually by the operator. If a WS2 index or schema
change needs to be reverted:

```bash
# Check which migrations were applied
mongosh "$MONGODB_URI" --eval "db.migrations.find({},{name:1,appliedAt:1}).sort({appliedAt:-1}).limit(5)"

# Drop a bad index (example)
mongosh "$MONGODB_URI" --eval "db.books.dropIndex('bad_index_name')"
```

For MongoDB document schema changes: because MongoDB is schemaless, the app simply
stops writing the bad fields after the code rollback. No schema revert is needed
unless a field was renamed (in which case run a one-off update script).

---

## 5. Better Auth session rollback

Better Auth sessions are stored in MongoDB (`sessions` collection). A session format
change that broke existing sessions can be cleared:

```bash
# Clear all sessions (users will need to log in again)
mongosh "$MONGODB_URI" --eval "db.sessions.deleteMany({})"
```

> **Only do this if sessions are causing active login failures.** Users in active
> checkout flows will be interrupted.

---

## 6. Supabase fallback (if AUTH_PROVIDER needs to revert)

Current default: `AUTH_PROVIDER=supabase` (Phoenix cutover not yet complete).
If Better Auth is toggled to production and needs to roll back:

1. In Vercel → Settings → Environment Variables: set `AUTH_PROVIDER=supabase`
2. Trigger a redeploy (push an empty commit or click "Redeploy" in Vercel)
3. Verify `/api/auth/ok` responds from Supabase path

---

## 7. Post-rollback actions

- [ ] File a Sentry issue (or link the existing one) with: bad commit SHA, error, rollback action taken
- [ ] Update `docs/OPERATOR_QA_LOG.md` with the incident
- [ ] Create a GitHub issue for the root cause fix
- [ ] Notify the team in Teams → #engineering channel
- [ ] Do not re-deploy the rolled-back code without a fix and CI green

---

## Emergency contacts

| Role                | Contact                         |
| ------------------- | ------------------------------- |
| Operator / Solo Dev | accounting@mangu-publishers.com |
| Vercel Support      | https://vercel.com/support      |
| Atlas Support       | https://support.mongodb.com     |
| Stripe Dashboard    | https://dashboard.stripe.com    |

---

_Runbook v1.0 — 2026-09-18_
