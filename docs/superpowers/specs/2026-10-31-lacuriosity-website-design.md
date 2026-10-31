# LaCuriosity Website — Design Spec

**Date:** 2026-10-31 · **Repo:** `Rutvij-Projects/lacuriosity` · **Domain:** lacuriosity.com

## Goal

Replace the dead Ghost site with a new static site that reads articles from Supabase and is live on lacuriosity.com. Core pages only — no new features.

## Decisions

| Topic | Decision |
| --- | --- |
| Source of truth | Supabase project `mskwqqbigtauakojpyhn` (Ghost retired) |
| Framework | Next.js (App Router) with `output: 'export'`, TypeScript, Tailwind v4 |
| Data access | `@supabase/supabase-js` with the publishable key, **at build time only** |
| Hosting | GitHub Pages via GitHub Actions; custom domain via `public/CNAME` |
| Rebuilds | push to `main`, daily cron (14:00 UTC), manual `workflow_dispatch` |
| Visual | Risograph editorial — approved mockup at `docs/mockup/index.html` |
| Themes | Light + dark; OS preference by default, toggle persisted in `localStorage`, set before first paint |

## Data

> **Revised 2026-10-31:** the SQL migration failed to apply, so articles moved to static Markdown files in `content/articles/` (front matter: `title, pillar, excerpt, cover, publishedAt`). Pillars are still read from Supabase. The migration below is kept as the roadmap for moving articles into the DB later.

### Existing tables (read)

- `pillars`: `id, name, display_name, slug, accent_color, description, is_active, created_at` — 5 rows, publicly readable.
- `articles`: `id, pillar_id, title, topic, ghost_post_id, ghost_post_url, cover_image_url, cover_storage_path, status (article_status_enum: draft|published|failed), published_at, created_at, updated_at` — currently empty.

### Migration (`supabase/migrations/001_site_columns.sql`, run in the SQL editor)

1. Add `slug text unique`, `excerpt text`, `body_markdown text` to `articles`.
2. Enable RLS on `articles`; policy `anon` may `select` rows where `status = 'published'`.
3. Insert three placeholder articles (status `published`):
   - Human Mind — *Why Your Brain Is Built to Forget* — cover `covers/2026-04-17T07:02:16.297Z.png`
   - The Construct — *Every Program Is Slowly Falling Apart* — cover `covers/Gemini_Generated_Image_hwg7nmhwg7nmhwg7.png`
   - The Planet — *The Forest Beneath the Forest* — no cover (exercises the halftone fallback)

### Pipeline contract (documented in README, not built now)

For new articles to appear, the Make.com pipeline must write `slug`, `excerpt`, `body_markdown`, `pillar_id`, `title`, `published_at`, `cover_image_url`, and set `status = 'published'`.

## Pages

| Route | Content |
| --- | --- |
| `/` | Latest article as hero; one band per active pillar with its latest 3 articles; empty pillars show "First issue soon." |
| `/pillar/[slug]` | Full-bleed pillar hero; list of that pillar's articles |
| `/articles/[slug]` | Tag, headline, excerpt, meta (date, reading time), cover or halftone fallback, Markdown body, "More curiosities" (3 others) |
| `/about` | What LaCuriosity is, the five pillars, how the pipeline works |
| 404 | `not-found.tsx` |

All pages are generated at build time (`generateStaticParams`). An empty DB must still build.

## Units

- `lib/supabase.ts` — creates the client from env; throws a clear error if env is missing.
- `lib/data.ts` — `getPillars()`, `getArticles()`, `getArticle(slug)`; maps DB rows to `Pillar` / `Article` types. The only file that knows the schema.
- `lib/content.ts` — pure helpers: `readingTime(markdown)`, `groupByPillar(articles, pillars)`, `formatDate(iso)`, `renderMarkdown(md)` (via `marked`). Unit-tested.
- `components/` — `Masthead`, `ThemeToggle`, `ArticleCard`, `Cover` (image or halftone fallback), `PillarBand`, `Footer`.
- `app/globals.css` — tokens + Riso styles ported from the mockup.

## Colour system

Each pillar's DB `accent_color` is the base. Pages set `--base` per pillar; CSS derives:

- light: accent = `color-mix(in oklab, base 88%, #1B1815)`, block = `color-mix(in oklab, base 80%, #1B1815)`
- dark: accent = `color-mix(in oklab, base 60%, #EDE6D8)`, block = `color-mix(in oklab, base 42%, #14120F)`

## Motion (Emil pass, approved)

Custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; press states (`scale(0.97)`, stamp-in button); hovers gated by `(hover: hover) and (pointer: fine)`; one-time staggered entrance; instant theme swap; `prefers-reduced-motion` keeps fades only; `:focus-visible` outlines.

## Deploy

`.github/workflows/deploy.yml`: checkout → Node 22 → `npm ci` → `npm test` → `npm run build` (env from repo secrets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) → `actions/upload-pages-artifact` (`out/`) → `actions/deploy-pages`.

Owner actions (need repo admin / registrar): enable Pages with source "GitHub Actions"; add repo secrets; DNS A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and `www` CNAME → `rutvij-projects.github.io`; enforce HTTPS.

## Testing

- Vitest unit tests for `lib/content.ts` (reading time, grouping incl. empty, date format, markdown).
- `npm run build` succeeds with 0 and with 3 articles.
- Browser check of every route in light + dark, desktop + mobile.

## Out of scope

Audio player, video, search, newsletter, Ghost import, Make.com changes.
