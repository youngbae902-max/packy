import { Pack, packTypeLabels } from '@/types/pack';
import { Download, Rocket } from 'lucide-react';
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
    <div className="pack-card animate-fade-in">
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
