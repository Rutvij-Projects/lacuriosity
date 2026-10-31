import type { Pillar } from '@/lib/content';

// Short mark for the halftone fallback: "The Planet" → "Pl."
const mark = (name: string) => `${name.split(' ').pop()!.slice(0, 2)}.`;

export function Cover({ src, pillar, priority = false }: { src: string | null; pillar?: Pillar; priority?: boolean }) {
  return (
    <div className="cover">
      {src ? (
        // Static export: no image optimiser, so a plain img is correct here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading={priority ? 'eager' : 'lazy'} decoding="async" />
      ) : (
        <div className="fallback" aria-hidden>
          <span className="big">{mark(pillar?.name ?? 'LaCuriosity')}</span>
          <span className="lbl">{pillar?.name ?? 'LaCuriosity'}</span>
        </div>
      )}
    </div>
  );
}
