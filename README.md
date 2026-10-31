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
content/articles/*.md ─┐
content/pillars.ts ────┼─► next build (static export) ─► out/ ─► GitHub Pages ─► lacuriosity.com
public/covers/*.jpg ───┘        ▲
                                └─ GitHub Actions: on push to main, daily 14:00 UTC, or manual run
```

- **Articles** are Markdown files in [`content/articles/`](content/articles). One file per article; the filename is the URL slug.
- **Pillars** (names, slugs, colours, descriptions) live in [`content/pillars.ts`](content/pillars.ts).
- **Cover images** live in [`public/covers/`](public/covers).
- Everything is in this repo: no database, no API keys, no secrets. The whole site is **static HTML**, so it's fast and costs nothing to host.

## Stack

Next.js 16 (App Router, `output: 'export'`) · React 19 · TypeScript · Tailwind CSS v4 · `marked` · Vitest · GitHub Pages

## Run it locally

```bash
npm install
npm run dev     # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit tests for the content helpers |
| `npm run build` | Static export to `out/` |
| `npm start` | Serve `out/` locally |

## Adding an article

Create `content/articles/<slug>.md`:

```markdown
---
title: The Forest Beneath the Forest
pillar: the-planet
excerpt: One sentence shown under the headline and on cards.
cover: /covers/the-forest-beneath-the-forest.jpg
publishedAt: 2026-10-29T08:00:00Z
---

Article body in Markdown. `## Headings`, **bold**, > quotes and lists are all styled.
```

- `pillar` must be one of: `physical-world`, `human-mind`, `the-construct`, `the-abstract`, `the-planet` (the build fails with a clear error otherwise).
- `cover` is optional: put the image in `public/covers/` (JPEG, about 1600px wide) and reference it as `/covers/<file>`. Leave it empty and the site draws a halftone cover in the pillar's colour.
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
content/
  articles/                The articles (Markdown)
  pillars.ts               The five pillars: name, slug, colour, description
lib/
  content.ts               Pure helpers: front matter, reading time, grouping, dates, Markdown
  data.ts                  Loads pillars and articles for the pages
public/covers/             Cover images
docs/                      Design spec, implementation plan, approved UI mockup
```

## Design

Risograph editorial: warm paper, Fraunces headlines, Newsreader body, IBM Plex Mono labels, solid colour blocks per pillar.

- **Light and dark mode.** Follows the reader's OS setting; the ☾/☀ toggle overrides it and is remembered. The theme is applied before first paint, so there is no flash.
- **One colour per pillar drives everything.** Each pillar's `color` in `content/pillars.ts` is the base; CSS `color-mix` derives a readable accent and a deep "ink" block for each theme. Change one hex value and the whole site follows.
- **Motion** follows Emil Kowalski's design-engineering principles: a custom ease-out curve, press feedback, hover effects only on hover-capable devices, a short one-time entrance, and `prefers-reduced-motion` support.

## Deployment

`.github/workflows/deploy.yml` tests, builds and deploys `out/` to GitHub Pages.

One-time setup (repo admin):

1. **Settings → Pages → Source: GitHub Actions.**
2. **Custom domain:** `public/CNAME` already contains `lacuriosity.com`. At the domain registrar add:

   | Type | Host | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | rutvij-projects.github.io |

3. Once the certificate is issued, tick **Enforce HTTPS** under Settings → Pages.

## Roadmap

- Read articles and pillars from Supabase so the Make.com pipeline can publish directly. Only `lib/data.ts` needs to change; the pages don't.
