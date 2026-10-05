import { Music } from 'lucide-react';
import { useRef } from 'react';

interface AudioPlayerProps {
  artistName: string;
  imageUrl?: string | null;
  audioUrl: string | null;
  downloadUrl: string;
  duration?: number;
  onSelect?: () => void;
}

export function AudioPlayer({ artistName, imageUrl, onSelect }: AudioPlayerProps) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  return (
    <button
      type="button"
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
        moved.current = false;
      }}
      onPointerMove={(event) => {
        if (!pointerStart.current) return;
        const dx = Math.abs(event.clientX - pointerStart.current.x);
        const dy = Math.abs(event.clientY - pointerStart.current.y);
        if (dx > 8 || dy > 8) moved.current = true;
      }}
      onPointerUp={() => {
        pointerStart.current = null;
      }}
      onClick={() => {
        if (!moved.current) onSelect?.();
        moved.current = false;
      }}
      aria-label={`Abrir acapella de ${artistName}`}
      className="group flex flex-col items-center gap-4 px-2 text-center touch-pan-x select-none"
    >
      <div className="aspect-square w-36 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted transition-colors duration-200 group-hover:border-primary/50 sm:w-40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Foto de ${artistName}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="max-w-full truncate text-sm font-bold uppercase tracking-tight">{artistName}</h3>
    </button>
  );
}
