import { cache } from 'react';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getClient } from './supabase';
import { parseArticleFile, type Article, type Pillar } from './content';

// The only file that knows where content lives: pillars in Supabase, articles on disk.

const ARTICLES_DIR = join(process.cwd(), 'content', 'articles');

type PillarRow = {
  id: string;
  slug: string;
  display_name: string;
  accent_color: string;
  description: string | null;
};

const toPillar = (r: PillarRow): Pillar => ({
  id: r.id,
  slug: r.slug,
  name: r.display_name,
  color: r.accent_color,
  description: r.description ?? '',
});

// All pillars share one created_at, so the editorial order is fixed here; unknown pillars go last.
const STREAM_ORDER = ['physical-world', 'human-mind', 'the-construct', 'the-abstract', 'the-planet'];
const rank = (p: Pillar) => (STREAM_ORDER.indexOf(p.slug) + 1 || STREAM_ORDER.length + 1);
const byStreamOrder = (a: Pillar, b: Pillar) => rank(a) - rank(b) || a.name.localeCompare(b.name);

// Fails the build loudly instead of publishing an empty site by accident.
function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase: could not load ${what}: ${res.error.message}`);
  return res.data as T;
}

export const getPillars = cache(async (): Promise<Pillar[]> => {
  const res = await getClient()
    .from('pillars')
    .select('id, slug, display_name, accent_color, description')
    .eq('is_active', true);
  return unwrap<PillarRow[]>(res, 'pillars').map(toPillar).sort(byStreamOrder);
});

// Articles are Markdown files in content/articles (one file per article, filename = slug).
export const getArticles = cache(async (): Promise<Article[]> => {
  const pillars = await getPillars();
  const files = (await readdir(ARTICLES_DIR)).filter(f => f.endsWith('.md'));
  const articles = await Promise.all(
    files.map(async f => parseArticleFile(f.replace(/\.md$/, ''), await readFile(join(ARTICLES_DIR, f), 'utf8'), pillars)),
  );
  return articles.sort((x, y) => y.publishedAt.localeCompare(x.publishedAt));
});

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getArticles()).find(a => a.slug === slug);
}

export async function getPillar(slug: string): Promise<Pillar | undefined> {
  return (await getPillars()).find(p => p.slug === slug);
}
