import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticles, getPillar, getPillars } from '@/lib/data';
import { formatDate } from '@/lib/content';
import { Cover } from '@/components/Cover';
import { pillarStyle } from '@/components/pillarStyle';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPillars()).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pillar = await getPillar((await params).slug);
  return pillar ? { title: pillar.name, description: pillar.description } : {};
}

export default async function PillarPage({ params }: Props) {
  const { slug } = await params;
  const [pillar, pillars, all] = await Promise.all([getPillar(slug), getPillars(), getArticles()]);
  if (!pillar) notFound();

  const index = pillars.findIndex(p => p.id === pillar.id) + 1;
  const articles = all.filter(a => a.pillarId === pillar.id);
  const [first, ...rest] = pillar.name.split(' ');

  return (
    <main className="pc" style={pillarStyle(pillar.color)}>
      <section className="pillar-hero">
        <div className="wrap enter">
          <span className="mono">Stream {String(index).padStart(2, '0')} of {String(pillars.length).padStart(2, '0')}</span>
          <h1>{rest.length ? <>{first}<br />{rest.join(' ')}</> : first}</h1>
          <p>{pillar.description}</p>
        </div>
        <span className="count mono">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</span>
      </section>
      <div className="wrap list">
        {articles.length === 0 && (
          <div className="empty" style={{ marginTop: 30 }}><strong>First issue soon.</strong><span className="mono">New articles land daily</span></div>
        )}
        {articles.map(a => (
          <Link key={a.id} className="row" href={`/articles/${a.slug}/`}>
            <span className="mono soft date">{formatDate(a.publishedAt)}</span>
            <div><h3>{a.title}</h3>{a.excerpt && <p>{a.excerpt}</p>}</div>
            <Cover src={a.coverUrl} pillar={pillar} />
          </Link>
        ))}
      </div>
    </main>
  );
}
