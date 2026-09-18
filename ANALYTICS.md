# MANGU Publishers — Analytics & AI Recommendations

> **Last updated:** 2026-09-18 | **Owner:** accounting@mangu-publishers.com

---

## Analytics Stack

| Layer                | Tool                        | Status                            |
| -------------------- | --------------------------- | --------------------------------- |
| Web analytics        | Vercel Analytics            | Active                            |
| Error monitoring     | Sentry                      | Active (DSN required)             |
| UX heatmaps          | Microsoft Clarity           | Planned (MSFT-INTEGRATION.md #19) |
| Publishing dashboard | Power BI                    | Planned (MSFT-INTEGRATION.md #6)  |
| Reader engagement    | Custom MongoDB aggregations | Active                            |
| AI recommendations   | OpenAI / Azure OpenAI       | Active (heuristic scoring)        |

---

## Key Metrics

### Reader Metrics

- **Books viewed** — tracked via `GET /api/books/[slug]` response (no PII)
- **Books purchased** — `orders` collection; `stripe_payment_intent_id` as idempotency key
- **Reviews submitted** — `reviews` collection; `avg_rating` + `review_count` maintained on `books`
- **Reading progress** — `reading_progress` collection; % read per user per book

### Author Metrics

- **Manuscripts submitted** — `manuscripts` collection (status: `submitted → in_review → accepted/rejected`)
- **Royalty paid** — tracked in `royalty_agreements` + payout Dataverse table
- **EQS-001 scores** — rubric score breakdown per manuscript dimension

### Platform Metrics

- **Bundle size** — main JS chunk must be < 150 KB gzip (enforced in CI via PERF-PHASE3)
- **Core Web Vitals** — LCP, CLS, FID monitored via Vercel Analytics
- **API latency** — logged via `lib/logger.ts` JSON structured logs

---

## AI Recommendations (Current Implementation)

Located in `lib/resonance/` — heuristic scoring without ML embeddings.

### Current algorithm (`lib/resonance/score.ts`)

```
score = (avg_rating * 0.4) + (review_count_normalized * 0.2) + (recency_score * 0.2) + (genre_match * 0.2)
```

### Planned: OpenAI Embedding Upgrade (see mangu-ai-recommendations skill)

When the product team allocates budget for AI ranking:

1. **Embed books** at publish time:

   ```typescript
   const embedding = await openai.embeddings.create({
     model: 'text-embedding-3-small',
     input: `${book.title} ${book.description} ${book.genre}`,
   });
   await db.books.updateOne({ _id }, { $set: { embedding: embedding.data[0].embedding } });
   ```

2. **Store embeddings** in MongoDB with a vector index (Atlas Vector Search).

3. **At recommendation time**, embed the reader's reading history and find nearest neighbors:

   ```typescript
   const results = await db.books.aggregate([
     {
       $vectorSearch: {
         index: 'book_embeddings',
         path: 'embedding',
         queryVector: readerEmbedding,
         numCandidates: 100,
         limit: 10,
       },
     },
   ]);
   ```

4. **Azure OpenAI** option: use Azure endpoint for enterprise SLA + VNet binding:
   ```typescript
   const openai = new AzureOpenAI({
     endpoint: process.env.AZURE_OPENAI_ENDPOINT,
     apiKey: process.env.AZURE_OPENAI_KEY,
     apiVersion: '2024-02-01',
   });
   ```

---

## Microsoft Clarity Setup (Planned)

```html
<!-- app/layout.tsx — add to <head> -->
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");
    `,
  }}
/>
```

Required env: `NEXT_PUBLIC_CLARITY_ID` (from Clarity dashboard).

---

## Power BI Connection (Planned)

1. Create a Power BI workspace in the M365 tenant
2. Use **MongoDB Atlas Connector** (or ODBC with Atlas Data Federation)
3. Connect to the `mangu_publishers` database
4. Build reports on: `books`, `orders`, `reviews`, `reading_progress`

Key datasets:

- Sales by genre (monthly) — `orders LEFT JOIN books ON book_id`
- Reader engagement by author — `reading_progress GROUP BY author_id`
- Average rating trends — `books.avg_rating` over time via `audit_logs`

---

## Reporting Cadence

| Report          | Frequency         | Audience | Delivery                        |
| --------------- | ----------------- | -------- | ------------------------------- |
| Weekly sales    | Monday 08:00      | Operator | Power Automate flow #4 → Teams  |
| Monthly royalty | Last day of month | Authors  | Power Automate flow #10 → email |
| Bundle size     | Every PR          | Dev      | CI check (PERF-PHASE3)          |
| Error spike     | Real-time         | On-call  | Sentry alert                    |

---

_See MSFT-INTEGRATION.md for full Microsoft analytics tool evaluations._
