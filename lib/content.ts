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

// Bodies come from our own pipeline, so the HTML is trusted.
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
