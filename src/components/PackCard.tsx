import { Pack, packTypeLabels } from '@/types/pack';
import { Download, Rocket, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PackCardProps {
  pack: Pack;
}

export function PackCard({ pack }: PackCardProps) {
  const formattedDate = format(pack.createdAt, "dd/MM/yyyy", { locale: ptBR });

  const handleDownload = () => {
    window.open(pack.downloadUrl, '_blank');
  };

  return (
    <div className="pack-card animate-fade-in overflow-hidden">
      {pack.coverUrl ? (
        <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden">
          <img 
            src={pack.coverUrl} 
            alt={pack.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      ) : (
        <div className="relative -mx-6 -mt-6 mb-4 h-24 overflow-hidden bg-muted flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        </div>
      )}
      
      <div className="flex flex-col items-center text-center gap-3">
        {pack.isExclusive && (
          <span className="badge-exclusive">
            <Rocket className="w-3 h-3" />
            {packTypeLabels[pack.type]}
          </span>
        )}
        
        <h3 className="text-xl font-black uppercase tracking-tight">
          {pack.title}
        </h3>
        
        <p className="text-sm text-muted-foreground">
          @{pack.author} • {formattedDate}
        </p>
        
        <button 
          onClick={handleDownload}
          className="btn-download mt-2"
        >
          <Download className="w-4 h-4 mr-2" />
          BAIXAR
        </button>
      </div>
    </div>
  );
}
