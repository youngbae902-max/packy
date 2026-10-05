import { Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AudioPlayerProps {
  acapellaId: string;
  artistName: string;
  imageUrl?: string | null;
  audioUrl: string | null;
  downloadUrl: string;
  duration?: number;
}

export function AudioPlayer({ acapellaId, artistName, imageUrl }: AudioPlayerProps) {
  const navigate = useNavigate();

  return (
      <button
        type="button"
        onClick={() => navigate(`/mcs/${acapellaId}`)}
        aria-label={`Abrir acapella de ${artistName}`}
        className="flex flex-col items-center gap-4 px-2 text-center"
      >
        <div className="aspect-square w-32 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted transition-colors duration-300 sm:w-36 hover:border-primary/50">
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
