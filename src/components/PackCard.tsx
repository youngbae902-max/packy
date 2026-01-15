import { useState } from 'react';
import { Pack, packTypeLabels } from '@/types/pack';
import { Download, Star, Image as ImageIcon, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DownloadConfirmDialog } from './DownloadConfirmDialog';

interface PackCardProps {
  pack: Pack;
}

export function PackCard({ pack }: PackCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const formattedDate = format(pack.createdAt, "dd/MM/yyyy", { locale: ptBR });
  const displayAuthor = pack.isAnonymous ? 'Anônimo' : pack.author;

  const handleDownloadClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDownload = () => {
    window.open(pack.downloadUrl, '_blank');
    setShowConfirm(false);
  };

  return (
    <>
      <div className="pack-card animate-fade-in overflow-hidden">
        {pack.coverUrl ? (
          <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden rounded-t-xl">
            <img 
              src={pack.coverUrl} 
              alt={pack.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
          </div>
        ) : (
          <div className="relative -mx-5 -mt-5 mb-4 h-24 overflow-hidden rounded-t-xl bg-muted flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}
        
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="badge-exclusive">
              {packTypeLabels[pack.type]}
            </span>
            
            {pack.isExclusive && (
              <span className="badge-star">
                <Star className="w-3 h-3 fill-warning" />
                Exclusivo
              </span>
            )}

            {pack.isPremium && (
              <span className="badge-premium">
                <Crown className="w-3 h-3" />
                R$ {pack.price?.toFixed(2)}
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-black uppercase tracking-tight">
            {pack.title}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            @{displayAuthor} • {formattedDate}
          </p>
          
          <button 
            onClick={handleDownloadClick}
            className="btn-download mt-2"
          >
            <Download className="w-4 h-4 mr-2" />
            BAIXAR
          </button>
        </div>
      </div>

      <DownloadConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDownload}
        authorName={pack.author}
        isAnonymous={pack.isAnonymous}
      />
    </>
  );
}
