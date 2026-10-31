import type { Pillar } from '@/lib/content';

// The five streams, in editorial order. `color` is the base for each pillar's
// accent and colour block; the light/dark tones are derived from it in CSS.
export const pillars: Pillar[] = [
  {
    id: 'physical-world',
    slug: 'physical-world',
    name: 'Physical World',
    color: '#2563eb',
    description: 'The science of the natural world — physics, chemistry, biology, earth sciences',
  },
  {
    id: 'human-mind',
    slug: 'human-mind',
    name: 'Human Mind',
    color: '#7c3aed',
    description: 'Psychology, neuroscience, cognition, and what makes us human',
  },
  {
    id: 'the-construct',
    slug: 'the-construct',
    name: 'The Construct',
    color: '#dc2626',
    description: "Society, culture, history, and the systems we've built",
  },
  {
    id: 'the-abstract',
    slug: 'the-abstract',
    name: 'The Abstract',
    color: '#d97706',
    description: 'Mathematics, philosophy, logic, and pure ideas',
  },
  {
    id: 'the-planet',
    slug: 'the-planet',
    name: 'The Planet',
    color: '#16a34a',
    description: 'Environment, ecology, climate, and our relationship with Earth',
  },
];
