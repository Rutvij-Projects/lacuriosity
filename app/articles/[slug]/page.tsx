import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle, getArticles, getPillars } from '@/lib/data';
import { formatDate, readingTime, renderMarkdown } from '@/lib/content';
import { ArticleCard } from '@/components/ArticleCard';
import { Cover } from '@/components/Cover';
import { pillarStyle } from '@/components/pillarStyle';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getArticles();
  // An empty DB still needs one param for the export; it renders the 404.
  return articles.length ? articles.map(a => ({ slug: a.slug })) : [{ slug: '_' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: 'article', images: article.coverUrl ? [article.coverUrl] : [] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, articles, pillars] = await Promise.all([getArticle(slug), getArticles(), getPillars()]);
  if (!article) notFound();

  const pillar = pillars.find(p => p.id === article.pillarId);
  const more = articles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <main className="pc" style={pillarStyle(pillar?.color)}>
      <div className="wrap">
        <header className="art-head enter">
          {pillar && <span className="tag">{pillar.name}</span>}
          <h1>{article.title}</h1>
          {article.excerpt && <p className="dek">{article.excerpt}</p>}
          <div className="meta mono"><span>{formatDate(article.publishedAt)}</span><span>·</span><span>{readingTime(article.body)} min read</span></div>
        </header>
        <figure className="art-cover enter">
          <Cover src={article.coverUrl} pillar={pillar} priority />
          <figcaption className="caption">Illustration · LaCuriosity</figcaption>
        </figure>
        <article className="prose enter" dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }} />
        <div className="endmark" aria-hidden>■</div>
      </div>
      {more.length > 0 && (
        <section className="more">
          <div className="wrap">
            <div className="band-head"><h2 style={{ color: 'var(--ink)' }}>More curiosities</h2></div>
            <div className="grid">
              {more.map(a => <ArticleCard key={a.id} article={a} pillar={pillars.find(p => p.id === a.pillarId)} showTag />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
