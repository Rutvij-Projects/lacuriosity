# LaCuriosity

**Learn something new, every day.** LaCuriosity publishes long-form articles across five streams of curiosity:

| Stream | What it covers |
| --- | --- |
| Physical World | Physics, chemistry, biology, earth sciences |
| Human Mind | Psychology, neuroscience, cognition |
| The Construct | Society, culture, history, the systems we've built |
| The Abstract | Mathematics, philosophy, logic, pure ideas |
| The Planet | Environment, ecology, climate |

Live at **[lacuriosity.com](https://lacuriosity.com)**.

---

## How it works

```
content/articles/*.md ──┐
                        ├─► next build (static export) ─► out/ ─► GitHub Pages ─► lacuriosity.com
Supabase `pillars` ─────┘        ▲
                                 └─ GitHub Actions: on push to main, daily 14:00 UTC, or manual run
```

- **Articles** are Markdown files in [`content/articles/`](content/articles). One file per article; the filename is the URL slug.
- **Pillars** (names, slugs, colours, descriptions) are read from Supabase at build time with the publishable key. Nothing talks to Supabase from the reader's browser.
- The whole site is **static HTML**, so it's fast and costs nothing to host.

## Stack

Next.js 16 (App Router, `output: 'export'`) · React 19 · TypeScript · Tailwind CSS v4 · Supabase JS · `marked` · Vitest · GitHub Pages

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit tests for the content helpers |
| `npm run build` | Static export to `out/` |
| `npm start` | Serve `out/` locally |

### Environment

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The **publishable** key (Project Settings → API). Never the secret / service_role key. |

## Adding an article

Create `content/articles/<slug>.md`:

```markdown
---
title: The Forest Beneath the Forest
pillar: the-planet
excerpt: One sentence shown under the headline and on cards.
cover: https://…/covers/image.png
publishedAt: 2026-10-29T08:00:00Z
---

Article body in Markdown. `## Headings`, **bold**, > quotes and lists are all styled.
```

- `pillar` must be one of: `physical-world`, `human-mind`, `the-construct`, `the-abstract`, `the-planet` (the build fails with a clear error otherwise).
- `cover` is optional. Leave it empty and the site draws a halftone cover in the pillar's colour.
- The newest `publishedAt` becomes the home page hero.

Commit to `main` and the site redeploys in about a minute.

## Project layout

```
app/
  page.tsx                 Home: latest article + one band per pillar
  articles/[slug]/page.tsx Article page
  pillar/[slug]/page.tsx   Pillar page
  about/page.tsx           About
  not-found.tsx            404
  globals.css              Riso design system: tokens, light/dark, motion
components/                Masthead, ThemeToggle, ArticleCard, Cover, Footer
content/articles/          The articles (Markdown)
lib/
  content.ts               Pure helpers: front matter, reading time, grouping, dates, Markdown
  data.ts                  Loads pillars (Supabase) and articles (disk)
  supabase.ts              Build-time Supabase client
docs/                      Design spec, implementation plan, approved UI mockup
```

## Design

Risograph editorial: warm paper, Fraunces headlines, Newsreader body, IBM Plex Mono labels, solid colour blocks per pillar.

- **Light and dark mode.** Follows the reader's OS setting; the ☾/☀ toggle overrides it and is remembered. The theme is applied before first paint, so there is no flash.
- **Pillar colours come from Supabase.** Each `accent_color` is the base; CSS `color-mix` derives a readable accent and a deep "ink" block for each theme. Change a colour in the DB and the whole site follows on the next build.
- **Motion** follows Emil Kowalski's design-engineering principles: a custom ease-out curve, press feedback, hover effects only on hover-capable devices, a short one-time entrance, and `prefers-reduced-motion` support.

## Deployment

`.github/workflows/deploy.yml` tests, builds and deploys `out/` to GitHub Pages.

One-time setup (repo admin):

1. **Settings → Secrets and variables → Actions**: add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. **Settings → Pages → Source: GitHub Actions.**
3. **Custom domain:** `public/CNAME` already contains `lacuriosity.com`. At the domain registrar add:

   | Type | Host | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | rutvij-projects.github.io |

4. Once the certificate is issued, tick **Enforce HTTPS** under Settings → Pages.

## Roadmap

- Move articles into Supabase (`slug`, `excerpt`, `body_markdown` columns on `articles`) so the Make.com pipeline can publish directly. Only `lib/data.ts` needs to change.
