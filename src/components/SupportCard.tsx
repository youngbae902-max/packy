import { Zap, ExternalLink } from 'lucide-react';

export function SupportCard() {
  return (
    <div className="pack-card">
      <div className="flex flex-col items-center text-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          Inscreva-se
        </span>
        
        <h3 className="text-xl font-black flex items-center gap-2">
          PACKY
          <Zap className="w-5 h-5 text-warning fill-warning" />
        </h3>
        
        <p className="text-sm text-muted-foreground">
          Apoie o projeto para mantermos o site online!
        </p>
        
        <a 
          href="https://youtube.com/@mathewdcarmo?si=8gABoE4cqYvcpBja"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-2 text-sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          ABRIR CANAL
        </a>
      </div>
    </div>
  );
}
