// Avatar shape preset → tailwind className utility.
// 5 shape options the user can pick in Editar Perfil.

export type AvatarShape =
  | 'circle'
  | 'rounded-strong'
  | 'rounded-soft'
  | 'square'
  | 'square-bordered';

export function avatarShapeClasses(shape?: string | null): string {
  switch ((shape || 'circle') as AvatarShape) {
    case 'square':
      return 'rounded-none';
    case 'square-bordered':
      return 'rounded-none border-2 border-foreground/80';
    case 'rounded-soft':
      return 'rounded-xl';
    case 'rounded-strong':
      return 'rounded-3xl';
    case 'circle':
    default:
      return 'rounded-full';
  }
}

export const AVATAR_SHAPES: { id: AvatarShape; label: string }[] = [
  { id: 'circle', label: 'Círculo' },
  { id: 'rounded-strong', label: 'Quadrado arredondado' },
  { id: 'rounded-soft', label: 'Levemente arredondado' },
  { id: 'square', label: 'Quadrado' },
  { id: 'square-bordered', label: 'Quadrado com borda' },
];
