import { useState } from 'react';
import { Pack } from '@/hooks/useSupabasePacks';
import { Image as ImageIcon, Crown, Heart, Bookmark, ExternalLink, Pin, MoreHorizontal, Download, X, User } from 'lucide-react';
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

export function PackCardV2({ pack, showAdminBadge = false }: PackCardV2Props) {
  const { user } = useAuth();
  const { hasLiked, hasFavorited, isDownloadUnlocked, toggleLike, toggleFavorite, unlockDownload } = usePackInteractions(pack.id);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreditFlow, setShowCreditFlow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formattedDate = format(new Date(pack.created_at), "dd/MM/yyyy", { locale: ptBR });
  const displayAuthor = pack.is_anonymous ? 'Anônimo' : pack.author_name || 'Desconhecido';

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    try { await toggleLike(); } catch { toast.error('Erro ao curtir'); }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    try {
      await toggleFavorite();
      toast.success(hasFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch { toast.error('Erro ao favoritar'); }
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    if (pack.credit_channel_url && !isDownloadUnlocked) { setShowCreditFlow(true); return; }
    window.open(pack.download_url, '_blank');
  };

  const handleCreditVisit = async () => {
    window.open(pack.credit_channel_url!, '_blank');
    try {
      await unlockDownload();
      setShowCreditFlow(false);
      toast.success('Download liberado!');
    } catch { toast.error('Erro ao liberar download'); }
  };

  return (
    <>
      <div className="group relative rounded-2xl overflow-hidden bg-[hsl(0,0%,4%)] transition-all">
        {/* Banner image */}
        <div className="relative w-full aspect-[16/9]">
          {pack.cover_url ? (
            <img 
              src={pack.cover_url} 
              alt={pack.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[hsl(0,0%,8%)] flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}

          {/* Gradient fade on right edge for favorite button */}
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[hsl(0,0%,0%)/0.7] to-transparent pointer-events-none" />

          {/* Favorite button - white icon with blur at top right */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 flex items-center justify-center transition-all"
          >
            <Bookmark className={`w-5 h-5 drop-shadow-lg ${
              hasFavorited ? 'text-foreground fill-current' : 'text-foreground/90'
            }`} />
          </button>
          
          {/* Pin icon overlay */}
          {pack.is_pinned && (
            <div className="absolute top-3 left-3 z-10">
              <Pin className="w-4 h-4 text-foreground drop-shadow-lg" />
            </div>
          )}

          {/* Premium badge */}
          {pack.is_premium && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-premium/90 text-premium-foreground px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm">
              <Crown className="w-3 h-3" />
              R$ {pack.price?.toFixed(2)}
            </div>
          )}

          {/* Bottom gradient for text readability */}
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[hsl(0,0%,4%)] to-transparent pointer-events-none" />
        </div>

        {/* Info below banner */}
        <div className="px-3 pt-2 pb-3 bg-[hsl(0,0%,4%)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-foreground truncate">{pack.title}</h3>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">@{displayAuthor}</p>
            </div>
            
            {/* 3 dots menu */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetails(true); }}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownloadClick}
            className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-foreground/10 border border-border/50 text-foreground text-xs font-bold uppercase tracking-wide hover:bg-foreground/15 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {pack.credit_channel_url && !isDownloadUnlocked && user ? 'Dar Crédito' : 'Baixar'}
          </button>
        </div>
      </div>

      {/* Details Bottom Sheet */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowDetails(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-lg bg-[hsl(0,0%,3%)] border-t border-border rounded-t-2xl p-5 pb-8 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-foreground/20 rounded-full mx-auto mb-5" />
            
            <button 
              onClick={() => setShowDetails(false)} 
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[hsl(0,0%,2%)] flex-shrink-0">
                {pack.cover_url ? (
                  <img src={pack.cover_url} alt={pack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-lg">{pack.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3" />
                  @{displayAuthor}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="badge-exclusive text-xs">
                {packTypeLabels[pack.pack_type] || pack.pack_type}
              </span>
              {pack.is_exclusive && (
                <span className="badge-star text-xs">⭐ Exclusivo</span>
              )}
              {pack.is_premium && (
                <span className="badge-premium text-xs">
                  <Crown className="w-3 h-3" /> R$ {pack.price?.toFixed(2)}
                </span>
              )}
              {pack.is_pinned && (
                <span className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2.5 py-1 rounded-full text-xs font-bold">
                  <Pin className="w-3 h-3" /> Fixado
                </span>
              )}
              {showAdminBadge && pack.is_admin_pack && (
                <span className="inline-flex items-center gap-1 bg-destructive/20 text-destructive px-2.5 py-1 rounded-full text-xs font-bold">ADM</span>
              )}
            </div>

            <div className="text-sm text-muted-foreground mb-5">
              Publicado em {formattedDate}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-5">
              <button 
                onClick={handleLikeClick} 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  hasLiked ? 'bg-foreground/15 text-foreground' : 'bg-[hsl(0,0%,6%)] text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                {pack.likes_count || 0}
              </button>
              <button 
                onClick={handleFavoriteClick} 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  hasFavorited ? 'bg-foreground/15 text-foreground' : 'bg-[hsl(0,0%,6%)] text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${hasFavorited ? 'fill-current' : ''}`} />
                Salvar
              </button>
            </div>

            <button
              onClick={handleDownloadClick}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {pack.credit_channel_url && !isDownloadUnlocked && user ? 'Dar Crédito para Baixar' : 'Baixar Pack'}
            </button>
          </div>
        </div>
      )}

      {/* Credit Flow Modal */}
      {showCreditFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowCreditFlow(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-black uppercase text-center mb-4">Liberar Download</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Para baixar este pack, você precisa acessar o canal do criador.
            </p>
            <button onClick={handleCreditVisit} className="btn-primary w-full flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Acessar Canal
            </button>
            <button onClick={() => setShowCreditFlow(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mt-3 text-center">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
