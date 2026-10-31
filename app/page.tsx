import Link from 'next/link';
import { getArticles, getPillars } from '@/lib/data';
import { formatDate, groupByPillar, readingTime } from '@/lib/content';
import { ArticleCard } from '@/components/ArticleCard';
import { Cover } from '@/components/Cover';
import { pillarStyle } from '@/components/pillarStyle';

export default async function Home() {
  const [articles, pillars] = await Promise.all([getArticles(), getPillars()]);
  const latest = articles[0];
  const latestPillar = latest && pillars.find(p => p.id === latest.pillarId);

  // The hero isn't repeated below. Pillars with articles come first (most recent first), then the
  // ones still waiting for their first issue; a pillar whose only article is the hero gets no band.
  const groups = groupByPillar(articles.slice(1), pillars);
  const filled = groups.filter(g => g.articles.length).sort((a, b) => b.articles[0].publishedAt.localeCompare(a.articles[0].publishedAt));
  const waiting = groups.filter(g => !g.articles.length && g.pillar.id !== latest?.pillarId);

  return (
    <main>
      {latest ? (
        <section className="wrap hero pc" style={pillarStyle(latestPillar?.color)}>
          <Link href={`/articles/${latest.slug}/`} className="enter" aria-label={latest.title}>
            <Cover src={latest.coverUrl} pillar={latestPillar} priority />
          </Link>
          <div className="enter">
            <span className="mono soft">Today&apos;s article</span>
            <div style={{ marginTop: 18 }}>{latestPillar && <span className="tag">{latestPillar.name}</span>}</div>
            <h1>{latest.title}</h1>
            {latest.excerpt && <p className="dek">{latest.excerpt}</p>}
            <div className="meta mono"><span>{formatDate(latest.publishedAt)}</span><span>·</span><span>{readingTime(latest.body)} min read</span></div>
            <Link className="readlink" href={`/articles/${latest.slug}/`}>Read the article →</Link>
          </div>
        </section>
      ) : (
        <section className="wrap hero">
          <div className="empty enter" style={{ gridColumn: '1 / -1' }}>
            <strong>The first issue is on the press.</strong>
            <span className="mono">New articles land daily</span>
          </div>
        </section>
      )}

      {filled.map((g, i) => (
        <section key={g.pillar.id} className={`band pc${i % 2 === 0 ? ' colored' : ''}`} style={pillarStyle(g.pillar.color)}>
          <div className="wrap">
            <div className="band-head">
              <h2><Link href={`/pillar/${g.pillar.slug}/`}>{g.pillar.name}</Link></h2>
              <p>{g.pillar.description}</p>
            </div>
            <div className="grid">
              {g.articles.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} pillar={g.pillar} />)}
            </div>
          </div>
        </section>
      ))}

      {waiting.map(g => (
        <section key={g.pillar.id} className="band pc" style={pillarStyle(g.pillar.color)}>
          <div className="wrap">
            <div className="band-head">
              <h2><Link href={`/pillar/${g.pillar.slug}/`}>{g.pillar.name}</Link></h2>
              <p>{g.pillar.description}</p>
            </div>
            <div className="empty"><strong>First issue soon.</strong><span className="mono">New articles land daily</span></div>
          </div>
        </section>
      ))}
    </main>
  );
}
