# Code structure — `my_publishing` @ `cb3950c7`

## Root

```
my_publishing/
├── app/                    # Next.js App Router (pages + API)
├── components/             # UI verticals
├── lib/                    # business logic, providers, data, integrations
├── types/                  # TypeScript contracts
├── supabase/migrations/    # ordered SQL
├── scripts/                # CI, env, Phoenix/Mongo, ops
├── tests/                  # unit + e2e
├── emails/                 # React Email
├── public/
├── tools/
├── docs/                   # existing project docs
├── .github/workflows/
├── .claude/                # agent skills + reviewers
├── middleware.ts           # Edge auth + rate limits
├── next.config.js          # standalone + CSP + Sentry
├── package.json            # mangu-publishers@1.2.0
├── Dockerfile
├── cloudbuild.yaml         # legacy Cloud Run
├── vercel.json             # canonical host
├── instrumentation.ts
├── sentry.client.config.ts
├── sentry.edge.config.ts
└── sentry.server.config.ts
```

Root also contains operator/agent files: `AGENTS.md`, `CLAUDE.md`, `HUMAN_TASKS.md`, `COMPLETE_FILE_LIST.md` (partially stale), `QUICK_START.md`, setup/verify shell scripts.

## Tech stack (`package.json`)

- Frontend: Next 14.2.35, React 18.3.1, TypeScript, Tailwind, Radix, Framer Motion
- Backend: Supabase (`@supabase/ssr`, `@supabase/supabase-js`) and MongoDB (`mongodb`)
- Auth: Supabase Auth + Better Auth (`better-auth`)
- Payments: Stripe
- AI: OpenAI embeddings (Resonance Engine; heuristic fallback)
- Email: Resend + `@react-email/components`
- Rate limit: `@upstash/ratelimit` + `@upstash/redis`
- Observability: `@sentry/nextjs`
- Storage (Phoenix WS3): `@vercel/blob`
- MCP: `@modelcontextprotocol/sdk`, `mcp-handler`

### npm scripts

`dev` (validate-env then next dev), `build` (prebuild env gate), `start`, `lint` (`eslint app components lib`), `type-check`, `test`, `test:e2e`, `db:seed|migrate|atlas:bootstrap|mongo:*`, `phoenix:export|transform|migrate-storage|verify|forced-resets|delta`, `gates:compile`, `qa:crawl`, `health:check`, `seo:check`.

## `app/` routing

| Area | Paths | Notes |
| --- | --- | --- |
| Root | `layout.tsx`, `page.tsx`, `providers.tsx`, `globals.css`, `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts`, OG/Twitter images | Site chrome + SEO |
| Auth | `app/(auth)/` → `/login`, `/register`, `/reset-password(/confirm)`, `/verify-email`, `/callback` | Dual-provider confirm forms |
| Consumer | `app/(consumer)/` → books, authors, genres, library, reading, discover, audio, comics, papers, readers-hub, marketing/legal | `/library` and `/reading` auth-gated |
| Portals | `app/(portals)/author/*`, `app/(portals)/partner/*` | Role-gated |
| Admin | `app/admin/*` dashboard, books, users, orders, manuscripts, health + `_lib` + `actions.ts` | Role-gated admin |
| Dashboard | `app/dashboard/*` | Signed-in reader account |
| API | `app/api/*` | See below |

### `(auth)` files

```
app/(auth)/layout.tsx
app/(auth)/callback/route.ts
app/(auth)/login/{page.tsx, LoginForm.tsx, actions.ts}
app/(auth)/register/{page.tsx, RegisterForm.tsx, actions.ts}
app/(auth)/reset-password/{page.tsx, ResetPasswordForm.tsx, actions.ts}
app/(auth)/reset-password/confirm/{page.tsx, layout.tsx,
  BetterAuthResetPasswordConfirmForm.tsx,
  SupabaseResetPasswordConfirmForm.tsx}
app/(auth)/verify-email/{page.tsx, ResendVerificationForm.tsx, actions.ts}
```

### `(consumer)` files (tree sample)

```
about/page.tsx
audio/{page.tsx,[id]/page.tsx}
authors/{page.tsx,[id]/page.tsx}
blog/page.tsx
book-clubs/page.tsx
books/{page.tsx, BookFilters.tsx, [slug]/page.tsx, [slug]/loading.tsx}
careers/page.tsx
comics/{page.tsx,[slug]/page.tsx}
components/{BookListItem,BookListStream,BooksSkeleton}.tsx
contact/{page.tsx, ContactForm.tsx, actions.ts}
cookies/page.tsx
discover/{page.tsx, book-clubs/page.tsx, recommendations/page.tsx}
faqs/page.tsx
genres/{page.tsx,[genre]/page.tsx}
help/page.tsx
layout.tsx
library/page.tsx
```

Also present in the live app (repo-map): `reading/[bookId]`, `readers-hub`, `papers`, legal pages.

### `app/api/`

```
analytics/  audio/  auth/  bookmarks/  books/
checkout/   email/  files/ follows/    health/route.ts
highlights/ live/   mcp/   newsletter/ resonance/
reviews/    session/ upload/ webhook/  webhooks/  wishlist/
```

`/api/health?ready=1` is the G7 readiness contract. `/api/files*` is middleware-gated. `/api/webhook` is the canonical Stripe webhook. `/api/auth` includes the Better Auth catch-all handler.

## `lib/`

| Path | Role |
| --- | --- |
| `lib/auth/provider.ts` | Auth switch |
| `lib/db/provider.ts` | Data switch |
| `lib/auth.ts`, `lib/auth-client.ts` | Better Auth server/client |
| `lib/auth/*` | roles, require-role, password-policy, origin, errors |
| `lib/supabase/*` | clients, edge-auth, queries |
| `lib/mongodb.ts`, `lib/mongodb-config.ts` | Mongo singleton |
| `lib/mongo-books.ts`, `mongo-profiles.ts`, `mongo-queries.ts`, `mongo-reviews.ts` | Phoenix data |
| `lib/stripe/` | checkout + webhooks |
| `lib/resonance/` | embeddings + recommendations |
| `lib/email/` | Resend send, templates, newsletter, preferences, triggers |
| `lib/rate-limit.ts` | Upstash sliding window, fail-closed |
| `lib/actions/` | books (~37 KB), reviews, upload, users, payouts, follows, revenue, analytics, export |
| `lib/data/` | books (~32 KB), reviews (~23 KB), genres, library, reading, authors, admin-* |
| `lib/reading/` | engagement + entitlement |
| `lib/mcp/` | catalog + guard |
| `lib/uploads/`, `storage/`, `services/`, `validations/`, `hooks/`, `seo/`, `sentry/`, `utils/` | feature verticals |

## `components/`

```
admin/        Sidebar
analytics/    dashboards, charts, LiveReaders, AIInsightsPanel
animation/    CountUp, FadeIn, HoverScale, Parallax, ScrollReveal, Stagger
audio/        use-audio-engine.ts (~21 KB), MiniPlayer, progress-store
books/        review suite + BookUploadForm
cards/        BookCard, GenreCard, AuthorCard, ManuscriptCard
common/       ErrorBoundary
email/        EmailPreferences
forms/        CreateBookForm
home/         Featured, Trending, GenreExplorer, Rails, Newsletter, Stats
layout/       AuthGuard, Container, Grid, Hero, Section
library/      LibraryExperience + rails/cards
players/      AudioPlayer (~21 KB), VimeoPlayer, VideoHero
providers/    auth, theme, toast
reader/       highlights, notes, wishlist, follows
seo/
shared/       Header, Footer, Navigation, UserMenu, SearchBar
social/
ui/           Radix primitives
```

## `types/`

`index.ts`, `database.ts`, `books.ts`, `engine.ts`, `stripe.ts`, `analytics.ts`, `revenue.ts`, `export.ts`, `manuscripts.ts`, `mongo.ts`, `upload.ts`, `webhook.ts`, `digest-fetch.d.ts`

## Data & migrations

- `supabase/migrations/` — timestamped `YYYYMMDDHHMMSS_slug.sql`. Never invent out-of-order names.
- Legacy buckets: `book-covers`, `manuscripts`, `published-epubs`.
- Phoenix WS3 storage target: Vercel Blob (`scripts/migrate-storage.ts`).

## Middleware contract

`middleware.ts` (Edge):

1. Rate-limit fail-closed on `/api/auth`, auth page POSTs, `/api/upload`, POST `/api/newsletter` and `/api/checkout`.
2. If `AUTH_PROVIDER=better-auth`: session-cookie presence only. `mangu-role` cookie is unsigned presentation state — **not** an authorization decision.
3. If supabase: `getEdgeAuthUser` + `getEdgeUserRole` for `/admin`, `/author`, `/partner`.
4. Protected prefixes: `/reading*`, `/library*`, `/author(/)*` (not public `/authors`), `/partner(/)*`, `/admin*`, `/dashboard*`, `/api/files*`.
5. Matcher is scoped so public catalog routes never invoke middleware.
6. Missing Supabase env on the legacy path **fails closed** (503) on protected routes.

Better Auth role checks live in layouts (`app/admin/layout.tsx`, portal layouts), not Edge.

## Existing docs to keep using

- `docs/NEXT_GO.md` — launch gates
- `docs/MANGU_PUBLISHERS_END_TO_END.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`, `docs/CANONICAL_PRODUCTION.md`
- `.claude/skills/mangu-navigator/references/repo-map.md`
- `CLAUDE.md`, `AGENTS.md`, `HUMAN_TASKS.md`
