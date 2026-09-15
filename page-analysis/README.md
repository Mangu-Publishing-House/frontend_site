# MANGU page-analysis HTML kit

Static HTML snapshots of every `page.tsx` route in `my_publishing` (commit `cb3950c7`, 62 pages).

These are **analysis canvases**, not a live render of Next.js. Use them to mark current UI, gaps, and features to add per page without running the app.

## Open locally

```bash
# from repo root
open page-analysis/index.html
# or
python3 -m http.server 4173 --directory page-analysis
```

Then visit `http://localhost:4173`.

## What you get

- `index.html` — hub + sidebar of every route
- `styles.css` — shared MANGU analysis chrome
- `pages.js` — route inventory + current blocks + feature slots
- `page.html` — per-page canvas (hash or `?p=`)

## How to use

1. Pick a route in the sidebar.
2. Read **Now** (what the TSX actually does).
3. Fill **Add features** checkboxes / notes.
4. Copy notes into issues or `docs/ENHANCEMENT_LEDGER.md`.

Do not merge this folder to production unless you want the kit in the repo. Safe as a working branch.
