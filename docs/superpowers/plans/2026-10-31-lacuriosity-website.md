# LaCuriosity Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static Next.js site on lacuriosity.com that renders published articles and pillars from Supabase.

**Architecture:** Next.js App Router with `output: 'export'`. All Supabase reads happen at build time in `lib/data.ts`; pure formatting lives in `lib/content.ts`. GitHub Actions builds and deploys `out/` to GitHub Pages daily and on push.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4 (tokens only; styles in `globals.css`), `@supabase/supabase-js`, `marked`, Vitest.

Spec: `docs/superpowers/specs/2026-10-31-lacuriosity-website-design.md`

---

### Task 1: Repo + scaffold

**Files:** `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `public/CNAME`

- [ ] `git init -b main`, remote `https://github.com/Rutvij-Projects/lacuriosity.git`
- [ ] Initial commit on `main`: `.gitignore`, `docs/` (spec, plan, mockup). Push `main`.
- [ ] `git checkout -b phase-1/site`
- [ ] Write config files; `npm install next react react-dom @supabase/supabase-js marked` and dev deps `typescript @types/react @types/node tailwindcss @tailwindcss/postcss vitest`
- [ ] `next.config.ts`: `{ output: 'export', images: { unoptimized: true }, trailingSlash: true }`
- [ ] `public/CNAME` = `lacuriosity.com`
- [ ] Commit `chore: scaffold Next.js static site`

### Task 2: Content helpers (TDD)

**Files:** Create `lib/content.ts`, Test `lib/content.test.ts`

- [ ] Write failing tests:

```ts
import { describe, it, expect } from 'vitest';
import { readingTime, groupByPillar, formatDate, renderMarkdown } from './content';

const pillars = [
  { id: 'p1', slug: 'human-mind', name: 'Human Mind', color: '#7c3aed', description: '' },
  { id: 'p2', slug: 'the-planet', name: 'The Planet', color: '#16a34a', description: '' },
];
const a = (id: string, pillarId: string, publishedAt: string) => ({
  id, slug: id, title: id, excerpt: '', body: '', coverUrl: null, pillarId, publishedAt,
});

describe('readingTime', () => {
  it('rounds up at 220 wpm with a 1 minute floor', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('word '.repeat(221))).toBe(2);
  });
});

describe('groupByPillar', () => {
  it('keeps every pillar, newest first, even when empty', () => {
    const g = groupByPillar([a('x', 'p1', '2026-10-01'), a('y', 'p1', '2026-10-02')], pillars);
    expect(g.map(x => x.pillar.slug)).toEqual(['human-mind', 'the-planet']);
    expect(g[0].articles.map(x => x.id)).toEqual(['y', 'x']);
    expect(g[1].articles).toEqual([]);
  });
});

describe('formatDate', () => {
  it('formats as "31 Oct 2026" in UTC', () => {
    expect(formatDate('2026-10-31T23:30:00Z')).toBe('31 Oct 2026');
  });
});

describe('renderMarkdown', () => {
  it('renders headings and paragraphs', () => {
    expect(renderMarkdown('## Hi\n\nThere')).toContain('<h2>Hi</h2>');
  });
});
```

- [ ] `npx vitest run` → FAIL (module missing)
- [ ] Implement `lib/content.ts` with types `Pillar`, `Article` and the four functions
- [ ] `npx vitest run` → PASS; commit `feat: content helpers`

### Task 3: Data layer

**Files:** Create `lib/supabase.ts`, `lib/data.ts`

- [ ] `lib/supabase.ts`: client from `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; throw `Missing Supabase env` if absent
- [ ] `lib/data.ts`: `getPillars()` (active, ordered by created_at, name), `getArticles()` (status=published, `slug not null`, order published_at desc), `getArticle(slug)`; map snake_case → `Pillar`/`Article`; throw on Supabase error so builds fail loudly
- [ ] Commit `feat: supabase data layer`

### Task 4: Styles + layout

**Files:** `app/globals.css`, `app/layout.tsx`, `components/Masthead.tsx`, `components/ThemeToggle.tsx`, `components/Footer.tsx`

- [ ] Port tokens, riso styles, dark theme, motion rules from `docs/mockup/index.html`; pillar colours via `--base` + `color-mix`
- [ ] `layout.tsx`: fonts via `next/font/google` (Fraunces, Newsreader, IBM Plex Mono); inline pre-paint theme script; Masthead with pillar nav from DB; Footer
- [ ] Commit `feat: layout, theme and riso styles`

### Task 5: Pages

**Files:** `components/Cover.tsx`, `components/ArticleCard.tsx`, `app/page.tsx`, `app/pillar/[slug]/page.tsx`, `app/articles/[slug]/page.tsx`, `app/about/page.tsx`, `app/not-found.tsx`

- [ ] Implement per spec "Pages" table; `generateStaticParams` + `dynamicParams = false`; per-page `metadata`
- [ ] `npm run build` with 0 articles → succeeds (empty states)
- [ ] Commit `feat: home, pillar, article, about pages`

### Task 6: Migration + seed

**Files:** `supabase/migrations/001_site_columns.sql`

- [ ] Columns, RLS policy, three placeholder articles (full Markdown bodies)
- [ ] User runs it in SQL editor; verify via REST that 3 rows are readable
- [ ] `npm run build` with 3 articles → succeeds; browser check all routes light/dark/mobile
- [ ] Commit `feat: site columns migration and placeholder articles`

### Task 7: Deploy + README

**Files:** `.github/workflows/deploy.yml`, `README.md`

- [ ] Workflow per spec "Deploy"
- [ ] README: overview, stack, local dev, env, schema + pipeline contract, deploy/rebuild, DNS
- [ ] Commit, push branch, open PR to `main`
- [ ] Owner: add secrets, enable Pages (GitHub Actions), merge PR, DNS, enforce HTTPS
