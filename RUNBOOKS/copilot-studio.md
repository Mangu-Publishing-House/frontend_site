# RUNBOOK: Copilot Studio — Author Concierge Bot

**Owner:** accounting@mangu-publishers.com
**Integration:** MSFT-INTEGRATION.md item 1
**Status:** Planning — not yet provisioned

---

## Purpose

The Author Concierge bot answers author questions about:

- Manuscript submission status
- Royalty queries and payout timelines
- EQS-001 rubric scoring explanations
- Editorial calendar and review deadlines
- Publishing process guidance

The bot is embedded in the MANGU author portal (`/dashboard/author` route) via a Direct Line iframe.

---

## Prerequisites

- [ ] Microsoft 365 subscription with Power Platform access
- [ ] Copilot Studio license (per-bot or M365 Copilot E5 add-on)
- [ ] Power Automate per-user Premium license (for HTTP connector)
- [ ] MANGU API key for the bot HTTP connector (add to HUMAN_TASKS.md)

---

## Step 1: Provision the Copilot Studio bot

1. Go to [make.powerapps.com](https://make.powerapps.com) → **Chatbots → New chatbot**
2. Name: `MANGU Author Concierge`
3. Language: `English (United States)`
4. Select the environment where your Dataverse tables live (or create a new environment)
5. Click **Create**

---

## Step 2: Build the bot topics

### Topic: Manuscript Status

```
Trigger phrases:
  - "What's the status of my manuscript?"
  - "manuscript update"
  - "how is my book coming along"

Action:
  1. Ask: "What is your manuscript title or submission ID?"
  2. Call Power Automate flow: GetManuscriptStatus(author_email, manuscript_id)
  3. Reply with status + reviewer notes (if any)
```

### Topic: Royalty Query

```
Trigger phrases:
  - "royalty payment"
  - "when do I get paid"
  - "earnings"

Action:
  1. Authenticate via Entra ID (SSO) to get author email
  2. Call Power Automate flow: GetRoyaltyBalance(author_email)
  3. Reply with current balance, last payout date, next scheduled payout
```

### Topic: EQS Rubric Explanation

```
Trigger phrases:
  - "EQS score"
  - "what does my score mean"
  - "rubric"

Action:
  1. Ask: "Which manuscript would you like to discuss?"
  2. Call Power Automate flow: GetEQSScore(manuscript_id)
  3. Return score breakdown by dimension (Structure, Voice, Pacing, etc.)
  4. Offer to explain any dimension in detail
```

### Topic: Submission Guide

```
Trigger phrases:
  - "how do I submit"
  - "submission requirements"
  - "file format"

Action: Reply with static content from knowledge base (Word count, format, genres accepted, timeline)
```

---

## Step 3: Create Power Automate flows

### Flow: GetManuscriptStatus

```
Trigger: Copilot Studio (HTTP request from bot)
Steps:
  1. Compose: build MANGU API URL = MANGU_API_BASE + "/api/manuscripts/status?id=" + manuscript_id
  2. HTTP GET to MANGU API with Authorization header (API key from env)
  3. Parse JSON response
  4. Return: { title, status, submitted_at, reviewer_notes }
```

### Flow: GetRoyaltyBalance

```
Trigger: Copilot Studio (HTTP request from bot)
Steps:
  1. HTTP GET to MANGU API "/api/royalties/balance?email=" + author_email
  2. Parse JSON
  3. Return: { balance, last_payout_date, next_payout_date }
```

---

## Step 4: Configure Direct Line channel

1. In Copilot Studio: **Settings → Channels → Custom Website (Direct Line)**
2. Copy the **Direct Line secret** (store in Vercel env as `COPILOT_DIRECT_LINE_SECRET`)
3. Optionally: create a token endpoint (`/api/copilot/token`) to avoid exposing the secret client-side:

```typescript
// app/api/copilot/token/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const secret = process.env.COPILOT_DIRECT_LINE_SECRET;
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });
  const data = await res.json();
  return NextResponse.json({ token: data.token });
}
```

---

## Step 5: Embed in the author portal

```tsx
// app/dashboard/author/copilot/page.tsx (draft)
'use client';

import { useEffect, useState } from 'react';

export default function AuthorConcierge() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/copilot/token', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => setToken(d.token));
  }, []);

  if (!token) return <div className="p-4 text-muted-foreground">Loading concierge…</div>;

  return (
    <iframe
      title="Author Concierge"
      src={`https://webchat.botframework.com/embed/MANGU-Author-Concierge?t=${token}`}
      className="h-[600px] w-full rounded-lg border"
    />
  );
}
```

---

## Step 6: Publish and test

1. In Copilot Studio: **Publish** the bot
2. Test in the **Test bot** pane: ask each trigger phrase
3. Test the Direct Line embed in a staging Vercel preview deployment
4. Confirm Power Automate flows fire correctly by checking flow run history

---

## Human Gates (add to HUMAN_TASKS.md)

- [ ] Provision Copilot Studio environment and create bot (Step 1)
- [ ] Obtain Direct Line secret and add to Vercel env as `COPILOT_DIRECT_LINE_SECRET`
- [ ] Obtain MANGU API key for Power Automate HTTP connector
- [ ] Publish bot to production channel

---

_Runbook v1.0 — 2026-09-18_
