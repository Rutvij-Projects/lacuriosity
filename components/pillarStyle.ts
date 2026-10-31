import type { CSSProperties } from 'react';

// Feeds the DB colour into the .pc class, which derives --accent and --block per theme.
export function pillarStyle(color: string | undefined): CSSProperties {
  return { '--base': color ?? '#1B1815' } as CSSProperties;
}
