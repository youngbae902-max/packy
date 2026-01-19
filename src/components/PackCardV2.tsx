import { useState } from 'react';
import { Pack } from '@/hooks/useSupabasePacks';
import { Star, Image as ImageIcon, Crown, Heart, Bookmark, ExternalLink, Pin, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { usePackInteractions } from '@/hooks/usePackInteractions';
import { AuthModal } from './AuthModal';
import { toast } from 'sonner';
const packTypeLabels: Record<string, string> = {
  samples: 'Samples',
  drumkit: 'Drumkit',
  loops: 'Loops',
  presets: 'Presets',
  project: 'Projeto',
  other: 'Outros'
};
interface PackCardV2Props {
  pack: Pack;
  showAdminBadge?: boolean;
}
export function PackCardV2({
  pack,
  showAdminBadge = false
}: PackCardV2Props) {
  const {
    user
  } = useAuth();
  const {
    hasLiked,
    hasFavorited,
    isDownloadUnlocked,
    toggleLike,
    toggleFavorite,
    unlockDownload
  } = usePackInteractions(pack.id);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreditFlow, setShowCreditFlow] = useState(false);
  const formattedDate = format(new Date(pack.created_at), "dd/MM/yyyy", {
    locale: ptBR
  });
  const displayAuthor = pack.is_anonymous ? 'Anônimo' : pack.author_name || 'Desconhecido';
  const handleLikeClick = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await toggleLike();
    } catch (error) {
      toast.error('Erro ao curtir');
    }
  };
  const handleFavoriteClick = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await toggleFavorite();
      toast.success(hasFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch (error) {
      toast.error('Erro ao favoritar');
    }
  };
  const handleDownloadClick = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // If pack has credit channel and download not unlocked yet
    if (pack.credit_channel_url && !isDownloadUnlocked) {
      setShowCreditFlow(true);
      return;
    }

    // Direct download
    window.open(pack.download_url, '_blank');
  };
  const handleCreditVisit = async () => {
    // Open channel in new tab
    window.open(pack.credit_channel_url!, '_blank');

    // Unlock download for this user
    try {
      await unlockDownload();
      setShowCreditFlow(false);
      toast.success('Download liberado!');
    } catch (error) {
      toast.error('Erro ao liberar download');
    }
  };
  return <>
      <div className="pack-card animate-fade-in overflow-hidden">
        {pack.cover_url ? <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden rounded-t-xl">
            <img src={pack.cover_url} alt={pack.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
          </div> : <div className="relative -mx-5 -mt-5 mb-4 h-24 overflow-hidden rounded-t-xl bg-muted flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          </div>}
        
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pack.is_pinned && <span className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <Pin className="w-3 h-3" />
                Fixado
              </span>}
            
            <span className="badge-exclusive">
              {packTypeLabels[pack.pack_type] || pack.pack_type}
            </span>
            
            {pack.is_exclusive && <span className="badge-star">
                <Star className="w-3 h-3 fill-warning" />
                Exclusivo
              </span>}

            {pack.is_premium && <span className="badge-premium">
                <Crown className="w-3 h-3" />
                R$ {pack.price?.toFixed(2)}
              </span>}

            {showAdminBadge && pack.is_admin_pack && <span className="inline-flex items-center gap-1 bg-destructive/20 text-destructive px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                ADM
              </span>}
          </div>
          
          <h3 className="text-xl font-black uppercase tracking-tight">
            {pack.title}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            @{displayAuthor} • {formattedDate}
          </p>

          {/* Interaction buttons */}
          <div className="flex items-center gap-4">
            <button onClick={handleLikeClick} className={`flex items-center gap-1 text-sm transition-colors ${hasLiked ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}>
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{pack.likes_count}</span>
            </button>
            
            <button onClick={handleFavoriteClick} className={`flex items-center gap-1 text-sm transition-colors ${hasFavorited ? 'text-warning' : 'text-muted-foreground hover:text-foreground'}`}>
              <Bookmark className={`w-5 h-5 ${hasFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <button onClick={handleDownloadClick} className="btn-download mt-2 w-full text-sm font-sans border-primary-foreground border-0">
            <Minus className="w-4 h-4 mr-2" />
            {pack.credit_channel_url && !isDownloadUnlocked && user ? 'DAR CRÉDITO' : 'BAIXAR'}
          </button>
        </div>
      </div>

      {/* Credit Flow Modal */}
      {showCreditFlow && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowCreditFlow(false)} />
          
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-black uppercase text-center mb-4">
              Liberar Download
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Para baixar este pack, você precisa acessar o canal do criador.
              Após visitar, o download será liberado automaticamente.
            </p>
            
            <button onClick={handleCreditVisit} className="btn-primary w-full flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Acessar Canal
            </button>
            
            <button onClick={() => setShowCreditFlow(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mt-3 text-center">
              Cancelar
            </button>
          </div>
        </div>}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>;
}