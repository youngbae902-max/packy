import { Music } from 'lucide-react';

interface AudioPlayerProps {
  artistName: string;
  imageUrl?: string | null;
  audioUrl: string | null;
  downloadUrl: string;
  duration?: number;
}

export function AudioPlayer({ artistName, imageUrl, downloadUrl }: AudioPlayerProps) {
  return (
    <a
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir link de ${artistName}`}
      className="flex flex-col items-center gap-3 px-2 text-center"
    >
      <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted transition-colors duration-300 sm:w-28 hover:border-primary/50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Foto de ${artistName}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="max-w-full truncate text-sm font-bold uppercase tracking-tight">{artistName}</h3>
    </a>
  );
}
