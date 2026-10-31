import Link from 'next/link';
import type { Pillar } from '@/lib/content';
import { formatDate, formatLongDate } from '@/lib/content';
import { ThemeToggle } from './ThemeToggle';
import { pillarStyle } from './pillarStyle';

export function Masthead({ pillars, buildDate }: { pillars: Pillar[]; buildDate: string }) {
  return (
    <header className="masthead">
      <div className="wrap">
        <div className="topbar mono">
          <span className="edition">Daily edition</span>
          <span><span className="date-long">{formatLongDate(buildDate)}</span><span className="date-short">{formatDate(buildDate)}</span></span>
          <span className="topbar-right">
            <Link href="/about/">About</Link>
            <ThemeToggle />
          </span>
        </div>
        <div className="brand-row">
          <Link href="/" className="logo" aria-label="LaCuriosity home">
            <span className="riso" data-t="LaCuriosity">La<span className="r">C</span>uriosity</span>
          </Link>
          <p className="tagline">Learn something new, every day. Five streams of curiosity, one article at a time.</p>
        </div>
        <nav className="pillars mono" aria-label="Pillars">
          {pillars.map(p => (
            <Link key={p.id} href={`/pillar/${p.slug}/`} className="pc" style={pillarStyle(p.color)}>
              <span className="dot" />{p.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
