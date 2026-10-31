# LaCuriosity — How the Website Was Built

This document explains how the LaCuriosity website was designed and built: the context it was built in, the decisions behind each layer, what those decisions cost, how the system fails, and where it goes next. The [README](../README.md) is the short version.

---

## 1. Context

LaCuriosity is an automated editorial publication. Behind it sits a content engine built on Make.com: a daily trigger fans out across **five editorial streams**, each driven by its own Claude persona with a research mandate and a voice. The engine researches demand signals (Tavily, Reddit), drafts and fact-checks with multiple agents, generates Risograph-style illustrations with Gemini, records narration with ElevenLabs, assembles video with Creatomate, and until now distributed through Ghost CMS, email and social. One trigger, 55 nodes, no human in the loop.

![LaCuriosity AI automation orchestration framework in Make](images/make-pipeline.jpg)

The reading surface had stopped working. **lacuriosity.com was failing with an SSL error**, and the Ghost site behind it was no longer serving readers. The brief for this project was narrow on purpose:

1. Build a new front end from scratch, with a new visual identity.
2. Get it **live on lacuriosity.com with articles to show**.
3. Document it properly.

No new features. Shipping a working, beautiful site mattered more than wiring every system together on day one.

## 2. Constraints

| Constraint | Consequence |
|---|---|
| One developer, no ops budget | No servers to patch, no database to babysit, nothing billed per request |
| Must be live quickly | Reuse a stack already proven in the owner's portfolio (Next.js + GitHub Pages) |
| The repo lives in an org where the developer has write, not admin | Anything needing admin (Pages settings, DNS, secrets) must be minimal and clearly documented |
| Content is long-form and read far more than written | Optimise for reading speed, typography and search indexing over write-time convenience |
| Readers split between light-mode and dark-mode devices | Both themes are first-class, not an afterthought |

## 3. Architecture

```
┌──────────────────────── repository ────────────────────────┐
│  content/articles/*.md   content/pillars.ts   public/covers │
│                │                 │                 │       │
│                └──────► lib/data.ts ◄──────────────┘       │
│                              │  (pure helpers: lib/content.ts)
│                              ▼                             │
│            app/  (pages, generated at build time)          │
└──────────────────────────────┬─────────────────────────────┘
                               │ next build → out/ (static HTML, CSS, fonts, images)
                               ▼
        GitHub Actions ──► GitHub Pages ──► lacuriosity.com ──► readers
        (push · daily 14:00 UTC · manual)
```

Everything a reader receives is a file that existed before they asked for it. There is no runtime code path that can fail under load, no API key in the browser, and no request that waits on a database.

### Why a static export

A publication is the textbook case for pre-rendering: content changes once a day, readers arrive all the time. Static HTML is the fastest thing a browser can load, every page is indexable with proper metadata and link previews, and GitHub Pages serves it for free with HTTPS.

**Cost:** an article appears only after a rebuild. With a daily publishing cadence and a one-minute build, that delay is irrelevant.

**Rejected alternatives:**
- *Client-side app fetching content in the browser.* Instant updates, but poor SEO and link previews for an editorial site, a loading state on every page, and GitHub Pages can't route `/articles/<slug>` without workarounds.
- *Astro.* Excellent for content sites, but a new framework for no real gain when the goal was "live, quickly".

## 4. The content layer

### Articles are Markdown files

Each article is `content/articles/<slug>.md`: front matter (`title`, `pillar`, `excerpt`, `cover`, `publishedAt`) plus a Markdown body. The filename is the URL.

This was not the first plan. The original design read articles from the Supabase project behind the content engine. Investigating that database showed:

- The `articles` table held **metadata only** (title, topic, cover URL, a link back to Ghost). The article text had only ever lived in Ghost.
- The table was **empty**.
- Adding the needed columns required a migration that, in practice, did not apply cleanly from the SQL editor.

Rather than block the launch on database work, content moved into the repository. That turned out to be the better v1 anyway: publishing is a commit with a diff and a history, and the build needs no credentials at all.

### Streams live in code

`content/pillars.ts` defines the five streams (name, slug, colour, description) in editorial order. The values were taken from the content engine's `pillars` table so the two stay aligned.

### One module owns "where content lives"

`lib/data.ts` is the only module that touches the filesystem: `getPillars`, `getArticles`, `getArticle`, `getPillar`. Pages call these and nothing else. When articles move into a database (see [Roadmap](#roadmap)), this file changes and the pages don't.

`lib/content.ts` holds the pure, tested helpers: front-matter parsing, reading time (220 wpm, rounded up, minimum one minute), grouping by stream, date formatting (UTC, so build machines in any timezone agree), and Markdown rendering.

**Validation happens at build time.** An article that names a stream that doesn't exist throws `Article "<slug>": unknown pillar "<value>"`, which fails the deploy. A broken page can't ship.

## 5. Pages

| Route | Composition |
|---|---|
| `/` | Today's article (newest `publishedAt`) as a hero. Then one band per stream with articles, newest first, alternating solid colour blocks and paper. The hero article is not repeated below it. Streams with no articles yet show "First issue soon." |
| `/pillar/<slug>/` | Full-bleed colour hero ("Stream 03 of 05"), article count, then a dated list with thumbnails |
| `/articles/<slug>/` | Stream tag, headline, standfirst, date and reading time, cover (or halftone fallback), body, end mark, "More curiosities" |
| `/about/` | What LaCuriosity is, and the five streams as colour cards |
| 404 | A styled "This page wandered off" with a route home |

All dynamic routes use `generateStaticParams` with `dynamicParams = false`, so every page is enumerated at build time and unknown URLs fall through to the 404.

## 6. Design system

The visual direction came out of a design review with three candidates (Risograph editorial, dark cinematic, minimal reader) and an interactive mockup, which is preserved in [`docs/mockup/index.html`](mockup/index.html).

### Risograph editorial

Risograph printing uses spot-colour inks laid down one at a time, slightly out of register, on uncoated paper. The site borrows that vocabulary:

- **Paper:** a warm off-white (`#F3EDE2`) with an SVG fractal-noise grain.
- **Ink:** near-black text, thick rules between sections, a newspaper-style masthead.
- **Misregistration:** the wordmark carries a blue offset copy of itself, the way a second ink pass lands a few pixels off.
- **Halftone:** articles without an illustration get a dot-screen cover in the stream's colour with a large overprinted mark ("Pl." for The Planet).
- **Type:** Fraunces for display (an expressive variable serif), Newsreader for long reading, IBM Plex Mono for labels and dates.

### Colour: one value per stream, derived per theme

Each stream has one base colour. Pages set it as a CSS custom property (`--base`) on the element, and CSS derives the rest with `color-mix` in OKLab:

| Token | Light theme | Dark theme |
|---|---|---|
| `--accent` (headings, drop caps, quotes, dots) | base mixed 12% toward ink | base mixed 40% toward cream |
| `--block` (bands, stream hero, tags, halftone) | base mixed 20% toward ink | base at 42% over the dark paper |

This came from a specific piece of feedback: in the first dark-mode pass, the red stream block was "too bright for the dark theme". Hand-picking darker shades would have fixed one colour; deriving them fixed all five and keeps working if a colour changes. In dark mode the blocks become deep inks (oxblood, navy, aubergine, umber, forest) that hold cream text comfortably, while accents become soft pastels that read on near-black without vibrating.

### Light and dark

The theme follows `prefers-color-scheme` unless the reader picks one with the toggle; the choice is stored in `localStorage`. A tiny inline script in `<head>` applies a stored choice **before first paint**, so dark-mode readers never see a white flash. The palette swaps instantly; only the toggle icon animates (a short rotate with a 2px blur to bridge the glyph change). Animating the whole page's colours was tried and rejected: the body faded while colour blocks snapped, so two themes were briefly visible at once.

### Motion

The interface was reviewed against Emil Kowalski's design-engineering principles and revised before it was built. The rules that made it in:

| Rule | Where it shows up |
|---|---|
| Strong custom ease-out, `cubic-bezier(0.23, 1, 0.32, 1)`, never `ease-in` | All interactive transitions |
| Pressable things respond to press | Buttons and nav scale to 0.97; the "Read the article" button's offset shadow collapses like ink stamping into paper |
| Frequent interactions stay quiet | Cards don't lift on hover (readers hover them constantly); the cover image zooms 3% inside its frame instead |
| Hover only where hover exists | All hover effects sit behind `(hover: hover) and (pointer: fine)`, so taps on phones don't leave stuck states |
| Only animate `transform` and `opacity` | No layout-triggering animation anywhere |
| Short, once | A 420ms staggered entrance (60ms apart) on page load, nothing on scroll |
| Reduced motion means fewer, gentler | Under `prefers-reduced-motion` the entrance becomes a 200ms fade and all movement is removed |
| Visible keyboard focus | `:focus-visible` draws a 2px ink outline in the same printed-rule language |

Performance got the same scrutiny. The paper grain originally used a fixed full-screen layer with `mix-blend-mode`, which forces a repaint on every scroll frame on mobile. It became a static tile with `contain: strict`; it looks the same.

### Layout details

- A 1240px page width, a 680px reading measure, and a single column under 860px.
- Grid tracks use `minmax(0, 1fr)`. Plain `1fr` lets a long headline widen its track past the viewport on phones, which `overflow-x: hidden` would silently clip. This was found from screenshots and fixed.
- The masthead shows the full date on desktop and a short date on phones.

## 7. Build and deploy

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. `npm ci`
2. `npm test` (the deploy stops if any test fails)
3. `npm run build` (the deploy stops if any article is malformed)
4. Upload `out/` as a Pages artifact and deploy it

Triggers: every push to `main`, daily at 14:00 UTC (keeps the masthead's edition date current), and manually from the Actions tab. Concurrent runs cancel each other so the newest commit always wins.

`public/CNAME` pins the custom domain. GitHub Pages issues the HTTPS certificate once DNS points at it. The repo-admin steps are in the [README](../README.md#deployment).

Work happened on the `phase-1/site` branch and lands on `main` through a pull request, so `main` is always what is deployed.

## 8. Testing

| Layer | How it's tested |
|---|---|
| Content helpers (`lib/content.ts`) | Vitest unit tests: front matter and the unknown-stream error, reading-time boundaries, grouping (including empty streams and unknown stream ids), UTC date formatting, Markdown output |
| Every route | Generated by the build; a failure fails the deploy |
| Visual and interaction | Manual browser QA in light and dark, desktop and 375px phone, keyboard focus and reduced motion, plus a check that every local link and asset on a page returns 200 |

There is no end-to-end suite. For a static site with five templates, that trade-off is deliberate.

## 9. Failure modes

| What breaks | What happens |
|---|---|
| An article names an unknown stream, or has no front matter | The build fails with the article's slug in the message; the live site keeps serving the last good version |
| An article has no cover | The halftone cover renders in the stream's colour (all three launch articles have illustrations) |
| A stream has no articles | Its band and page show "First issue soon." |
| No articles at all | The front page shows "The first issue is on the press." |
| A test fails | The deploy stops before building |
| JavaScript is disabled | Everything reads and navigates; only the theme toggle is unavailable (the OS theme still applies) |
| GitHub Actions is down | The live site is unaffected; the next run catches up |

## 10. Security

The build uses no credentials and the site ships no secrets. There is nothing to leak, rotate or misconfigure.

During the investigation of the content engine's Supabase project, the public key was found able to read an `accounts` table that holds a social-media access token. Public access to that table was revoked, and verified, before any website work continued. It's recorded here because it is the kind of exposure the "no secrets in the site" decision is meant to rule out.

## 11. Known gaps

- **Publishing is manual.** Articles arrive by commit, not from the content engine.
- **Masthead date is the build date**, refreshed daily by the scheduled run rather than live.
- **No RSS feed, sitemap or per-article social images yet.**
- **Narration and video aren't on the site**, even though the engine produces them.
- **No analytics.** There's no way to see what readers read.

## Roadmap

1. **Connect the content engine.** Either the Make.com pipeline commits a Markdown file to this repo (the smallest change: one GitHub API module, and the existing workflow publishes it), or articles move into Supabase (`slug`, `excerpt`, `body_markdown` on `articles`) and `lib/data.ts` reads them at build time, with the pipeline triggering a rebuild.
2. **RSS, sitemap and Open Graph images** for sharing and discovery.
3. **Audio narration** player on article pages, using the ElevenLabs output the pipeline already creates.
4. **Lightweight, privacy-friendly analytics.**

## 12. How this was built

The project ran as a short, structured design-to-ship loop:

1. **Discovery.** Read the existing material (the portfolio's engineering page, the pipeline diagrams), checked the live domain (down), and probed the database through its public API to learn the real schema.
2. **Brainstorm and decide.** One question at a time: where content lives, hosting, visual direction, scope, domain, build approach. Each decision was made with trade-offs on the table.
3. **Design in the browser.** An interactive HTML mockup with all four page types, iterated live: light/dark mode added, the dark palette reworked after feedback, then a full design-engineering review applied.
4. **Spec and plan.** A written spec and a task-by-task implementation plan, both in `docs/superpowers/`.
5. **Build, test first where it counts.** The content helpers were written test-first; pages were built against them and verified in the browser at each step.
6. **Adapt.** When the database path stalled, content moved into the repo; when Supabase stopped being needed at all, it was removed so the build needs no secrets.
7. **Ship.** A pull request into `main`, with the deploy workflow and documentation in the same change.
