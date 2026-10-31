import { cache } from 'react';
import { getClient } from './supabase';
import type { Article, Pillar } from './content';

// The only file that knows the Supabase schema.

type PillarRow = {
  id: string;
  slug: string;
  display_name: string;
  accent_color: string;
  description: string | null;
};

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_markdown: string | null;
  cover_image_url: string | null;
  pillar_id: string;
  published_at: string | null;
  created_at: string;
};

const toPillar = (r: PillarRow): Pillar => ({
  id: r.id,
  slug: r.slug,
  name: r.display_name,
  color: r.accent_color,
  description: r.description ?? '',
});

const toArticle = (r: ArticleRow): Article => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt ?? '',
  body: r.body_markdown ?? '',
  coverUrl: r.cover_image_url,
  pillarId: r.pillar_id,
  publishedAt: r.published_at ?? r.created_at,
});

// Fails the build loudly instead of publishing an empty site by accident.
function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase: could not load ${what}: ${res.error.message}`);
  return res.data as T;
}

export const getPillars = cache(async (): Promise<Pillar[]> => {
  const res = await getClient()
    .from('pillars')
    .select('id, slug, display_name, accent_color, description')
    .eq('is_active', true)
    .order('created_at')
    .order('display_name');
  return unwrap<PillarRow[]>(res, 'pillars').map(toPillar);
});

export const getArticles = cache(async (): Promise<Article[]> => {
  const res = await getClient()
    .from('articles')
    .select('id, slug, title, excerpt, body_markdown, cover_image_url, pillar_id, published_at, created_at')
    .eq('status', 'published')
    .not('slug', 'is', null)
    .order('published_at', { ascending: false, nullsFirst: false });
  return unwrap<ArticleRow[]>(res, 'articles').map(toArticle);
});

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getArticles()).find(a => a.slug === slug);
}

export async function getPillar(slug: string): Promise<Pillar | undefined> {
  return (await getPillars()).find(p => p.slug === slug);
}
