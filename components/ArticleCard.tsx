import Link from 'next/link';
import type { Article, Pillar } from '@/lib/content';
import { formatDate, readingTime } from '@/lib/content';
import { Cover } from './Cover';
import { pillarStyle } from './pillarStyle';

export function ArticleCard({ article, pillar, showTag = false }: { article: Article; pillar?: Pillar; showTag?: boolean }) {
  return (
    <Link className="card pc" href={`/articles/${article.slug}/`} style={pillarStyle(pillar?.color)}>
      <Cover src={article.coverUrl} pillar={pillar} />
      {showTag && pillar ? <span className="tag">{pillar.name}</span> : (
        <span className="mono soft">{formatDate(article.publishedAt)} · {readingTime(article.body)} min</span>
      )}
      <h3>{article.title}</h3>
      {article.excerpt && <p>{article.excerpt}</p>}
    </Link>
  );
}
