// Online indicator shape presets.
// Picked by each user in Configurações → Personalização.

export type OnlineShape =
  | 'pill'
  | 'dot'
  | 'star'
  | 'square'
  | 'rounded-square'
  | 'rectangle'
  | 'rounded-rectangle';

export const ONLINE_SHAPES: { id: OnlineShape; label: string }[] = [
  { id: 'pill', label: 'Pill' },
  { id: 'dot', label: 'Bolinha' },
  { id: 'star', label: 'Estrela' },
  { id: 'square', label: 'Quadrado' },
  { id: 'rounded-square', label: 'Quadrado arred.' },
  { id: 'rectangle', label: 'Retângulo' },
  { id: 'rounded-rectangle', label: 'Retângulo arred.' },
];
