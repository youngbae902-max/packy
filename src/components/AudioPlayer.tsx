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
      className="group flex flex-col items-center gap-2 text-center"
    >
      <div className="aspect-square w-36 overflow-hidden rounded-full border border-border/50 bg-muted transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/50 sm:w-40">
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
    </a>
  );
}
