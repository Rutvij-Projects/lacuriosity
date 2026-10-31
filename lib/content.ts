import { marked } from 'marked';

export type Pillar = {
  id: string;
  slug: string;
  name: string;
  color: string;
  description: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  pillarId: string;
  publishedAt: string;
};

export type PillarGroup = { pillar: Pillar; articles: Article[] };

const WORDS_PER_MINUTE = 220;

export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const byNewest = (x: Article, y: Article) => y.publishedAt.localeCompare(x.publishedAt);

// Every pillar is kept, so empty pillars can render their "first issue soon" state.
export function groupByPillar(articles: Article[], pillars: Pillar[]): PillarGroup[] {
  return pillars.map(pillar => ({
    pillar,
    articles: articles.filter(a => a.pillarId === pillar.id).sort(byNewest),
  }));
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

// Article files are Markdown with simple `key: value` front matter between --- lines.
// `pillar` is the pillar's slug from content/pillars.ts.
export function parseArticleFile(slug: string, source: string, pillars: Pillar[]): Article {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Article "${slug}": missing front matter`);

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }

  const pillar = pillars.find(p => p.slug === meta.pillar);
  if (!pillar) throw new Error(`Article "${slug}": unknown pillar "${meta.pillar}"`);

  return {
    id: slug,
    slug,
    title: meta.title,
    excerpt: meta.excerpt ?? '',
    body: match[2].trim(),
    coverUrl: meta.cover || null,
    pillarId: pillar.id,
    publishedAt: meta.publishedAt,
  };
}

// Bodies are our own files, so the HTML is trusted.
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false, gfm: true });
}

const longDateFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatLongDate(iso: string): string {
  return longDateFormat.format(new Date(iso));
}
