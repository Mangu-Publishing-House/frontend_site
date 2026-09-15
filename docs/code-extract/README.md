# Code extract — MANGU Publishers (`my_publishing`)

**Repo:** https://github.com/Mangu-Publishing-House/my_publishing  
**Tree SHA:** `cb3950c7eac6bae91d2410394cb72670ffa0134f`  
**Extracted:** 2026-09-15  
**Package:** `mangu-publishers` `1.2.0` · Next.js `14.2.35` · Node `>=22.22.1`

This folder is a **readable extract** of structure + architectural source. It is not a clone of every blob.

| File | Contents |
| --- | --- |
| [STRUCTURE.md](./STRUCTURE.md) | Annotated tree: `app/`, `components/`, `lib/`, `types/`, API, middleware contract |
| [SOURCE_CORE.md](./SOURCE_CORE.md) | Full source of provider switches + `middleware.ts` + pointers to layout/home/config |

## What was intentionally not dumped

| Path | Approx size | Reason |
| --- | --- | --- |
| `package-lock.json` | 709 KB | generated |
| `Kimi_Agent_Book prep for InDesign.zip` | 4.1 MB | binary |
| `WAW_v7_Standalone_FLAWLESS.jsx` | 394 KB | InDesign script, not the web app |
| `We_Are_Wolf_InDesign_Production_Guide.docx.pdf` | 510 KB | binary |
| `1d (1).docx` | 216 KB | binary |
| `.env*` live files | — | secrets never belong in docs |
| existing `docs/**` | large | already documentation |

Full copy:

```bash
git clone https://github.com/Mangu-Publishing-House/my_publishing.git
cd my_publishing
git checkout cb3950c7eac6bae91d2410394cb72670ffa0134f
```

## Canonical facts (do not invent)

- App Router under `app/` is authoritative.
- Auth switch: `AUTH_PROVIDER=supabase|better-auth` → `lib/auth/provider.ts` (default supabase).
- Data switch: `DATABASE_PROVIDER=supabase|mongodb` → `lib/db/provider.ts` (default supabase).
- Canonical production: Vercel (ADR-001). Cloud Run / Amplify are legacy.
- Launch authority: `docs/NEXT_GO.md` (G1–G13). README is CCR-001 subordinate.
- Readiness probe: `GET /api/health?ready=1`.
