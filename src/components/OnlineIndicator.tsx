import { Star } from 'lucide-react';
import type { OnlineShape } from '@/lib/onlineShape';

interface Props {
  shape?: OnlineShape | string | null;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Online/active indicator. Solid green. Shape is per-user.
 * Default = pill (per project memory).
 */
export function OnlineIndicator({ shape, size = 'sm', className = '' }: Props) {
  const s = (shape || 'pill') as OnlineShape;
  const base = 'inline-block bg-[hsl(var(--destructive))] shrink-0';
  const dim = size === 'sm' ? 'h-1.5' : 'h-2';

  if (s === 'star') {
    return <Star aria-hidden className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-[hsl(var(--destructive))] fill-current ${className}`} />;
  }
  if (s === 'dot') {
    return <span aria-hidden className={`${base} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full ${className}`} />;
  }
  if (s === 'square') {
    return <span aria-hidden className={`${base} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-none ${className}`} />;
  }
  if (s === 'rounded-square') {
    return <span aria-hidden className={`${base} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-[2px] ${className}`} />;
  }
  if (s === 'rectangle') {
    return <span aria-hidden className={`${base} ${dim} ${size === 'sm' ? 'w-3' : 'w-4'} rounded-none ${className}`} />;
  }
  if (s === 'rounded-rectangle') {
    return <span aria-hidden className={`${base} ${dim} ${size === 'sm' ? 'w-3' : 'w-4'} rounded-[3px] ${className}`} />;
  }
  // pill (default)
  return <span aria-hidden className={`${base} ${dim} ${size === 'sm' ? 'w-3' : 'w-4'} rounded-full ${className}`} />;
}
