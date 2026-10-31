import { cache } from 'react';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pillars } from '@/content/pillars';
import { parseArticleFile, type Article, type Pillar } from './content';

// The only file that knows where content lives: content/pillars.ts and content/articles/*.md.

const ARTICLES_DIR = join(process.cwd(), 'content', 'articles');

export async function getPillars(): Promise<Pillar[]> {
  return pillars;
}

// One Markdown file per article; the filename is the slug.
export const getArticles = cache(async (): Promise<Article[]> => {
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
  return pillars.find(p => p.slug === slug);
}
