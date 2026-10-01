import { Download, Music } from 'lucide-react';

interface AudioPlayerProps {
  artistName: string;
  imageUrl?: string | null;
  audioUrl: string | null;
  downloadUrl: string;
  duration?: number;
}

export function AudioPlayer({ artistName, imageUrl, downloadUrl }: AudioPlayerProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all hover:border-primary/40">
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Foto de ${artistName}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-3">
        <h3 className="truncate text-center text-sm font-bold uppercase tracking-tight">{artistName}</h3>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Baixar acapella de ${artistName}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    </article>
  );
}
