import { describe, it, expect } from 'vitest';
import { readingTime, groupByPillar, formatDate, renderMarkdown, type Article, type Pillar } from './content';

const pillars: Pillar[] = [
  { id: 'p1', slug: 'human-mind', name: 'Human Mind', color: '#7c3aed', description: '' },
  { id: 'p2', slug: 'the-planet', name: 'The Planet', color: '#16a34a', description: '' },
];
const a = (id: string, pillarId: string, publishedAt: string): Article => ({
  id, slug: id, title: id, excerpt: '', body: '', coverUrl: null, pillarId, publishedAt,
});

describe('readingTime', () => {
  it('rounds up at 220 wpm with a 1 minute floor', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('word '.repeat(220))).toBe(1);
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

  it('drops articles whose pillar is unknown', () => {
    const g = groupByPillar([a('z', 'nope', '2026-10-01')], pillars);
    expect(g.flatMap(x => x.articles)).toEqual([]);
  });
});

describe('formatDate', () => {
  it('formats as "31 Oct 2026" in UTC', () => {
    expect(formatDate('2026-10-31T23:30:00Z')).toBe('31 Oct 2026');
  });
});

describe('renderMarkdown', () => {
  it('renders headings, paragraphs and quotes', () => {
    const html = renderMarkdown('## Hi\n\nThere\n\n> Quote');
    expect(html).toContain('<h2>Hi</h2>');
    expect(html).toContain('<p>There</p>');
    expect(html).toContain('<blockquote>');
  });
});
