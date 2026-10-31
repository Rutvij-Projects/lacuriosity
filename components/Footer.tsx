import Link from 'next/link';
import type { Pillar } from '@/lib/content';

export function Footer({ pillars }: { pillars: Pillar[] }) {
  return (
    <footer className="wrap site">
      <div>
        <div className="logo">LaCuriosity</div>
        <p className="soft" style={{ marginTop: 10, fontStyle: 'italic' }}>Learn something new, every day.</p>
      </div>
      <div>
        <span className="mono">Streams</span>
        <ul>{pillars.map(p => <li key={p.id}><Link href={`/pillar/${p.slug}/`}>{p.name}</Link></li>)}</ul>
      </div>
      <div>
        <span className="mono">More</span>
        <ul>
          <li><Link href="/about/">About</Link></li>
          <li>© {new Date().getFullYear()} LaCuriosity</li>
        </ul>
      </div>
    </footer>
  );
}
