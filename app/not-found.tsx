import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap">
      <header className="art-head">
        <span className="mono soft">404</span>
        <h1>This page wandered off.</h1>
        <p className="dek">Curiosity sometimes leads nowhere. Try today&apos;s article instead.</p>
        <Link className="readlink" href="/">Back to the front page →</Link>
      </header>
      <div style={{ height: 60 }} />
    </main>
  );
}
