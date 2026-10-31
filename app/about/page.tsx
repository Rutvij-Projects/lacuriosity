import type { Metadata } from 'next';
import Link from 'next/link';
import { getPillars } from '@/lib/data';
import { pillarStyle } from '@/components/pillarStyle';

export const metadata: Metadata = { title: 'About' };

export default async function About() {
  const pillars = await getPillars();
  return (
    <main className="wrap">
      <header className="art-head enter">
        <span className="mono soft">About</span>
        <h1>A daily dose of wonder.</h1>
        <p className="dek">LaCuriosity publishes one long-form article a day across five streams of human knowledge.</p>
      </header>
      <article className="prose enter" style={{ '--accent': 'var(--ink)' } as React.CSSProperties}>
        <p>Each stream has its own editor — a specialised AI writer with its own voice and research mandate. Every piece starts from what people are actually curious about, then gets researched, drafted, fact-checked and illustrated in a Risograph style before it reaches this page.</p>
        <p>The whole pipeline runs on its own once a day. The goal is simple: give you one thing worth knowing, every day, written well enough to finish.</p>
      </article>
      <div className="pillar-cards">
        {pillars.map(p => (
          <Link key={p.id} href={`/pillar/${p.slug}/`} className="pc" style={pillarStyle(p.color)}>
            <strong>{p.name}</strong>
            <span>{p.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
