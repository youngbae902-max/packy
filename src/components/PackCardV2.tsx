import { useState } from 'react';
import { Pack } from '@/hooks/useSupabasePacks';
import {
  Image as ImageIcon, Crown, Heart, Bookmark, ExternalLink, Pin,
  MoreHorizontal, Download, X, User, BadgeCheck, ArrowDownToLine
} from 'lucide-react';
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
  other: 'Outros',
};

interface PackCardV2Props {
  pack: Pack;
  showAdminBadge?: boolean;
}

export function PackCardV2({ pack, showAdminBadge = false }: PackCardV2Props) {
  const { user } = useAuth();
  const {
    hasLiked, hasFavorited, isDownloadUnlocked,
    toggleLike, toggleFavorite, unlockDownload,
  } = usePackInteractions(pack.id);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreditFlow, setShowCreditFlow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  const isOwner = (pack.author_name || '').toLowerCase().replace(/^@/, '') === 'goat';
  const formattedDate = format(new Date(pack.created_at), 'dd/MM/yyyy', { locale: ptBR });
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

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    if (pack.credit_channel_url && !isDownloadUnlocked) {
      setShowCreditFlow(true);
      return;
    }
    setShowDownloadConfirm(true);
  };

  const confirmDownload = () => {
    setShowDownloadConfirm(false);
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

  const needsCredit = pack.credit_channel_url && !isDownloadUnlocked && user;

  return (
    <>
      {/* Card vertical — design anterior */}
      <div className="pack-card animate-fade-in overflow-hidden">
        {pack.cover_url ? (
          <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden rounded-t-xl">
            <img 
              src={pack.cover_url} 
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
              {packTypeLabels[pack.pack_type] || pack.pack_type}
            </span>
            
            {pack.is_exclusive && (
              <span className="badge-star">
                ⭐ Exclusivo
              </span>
            )}

            {pack.is_premium && (
              <span className="badge-premium">
                <Crown className="w-3 h-3" />
                R$ {pack.price?.toFixed(2)}
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-black uppercase tracking-tight">
            {pack.title}
          </h3>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            @{displayAuthor}
            {isOwner && !pack.is_anonymous && (
              <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20" aria-label="Dono verificado" />
            )}
            <span className="text-muted-foreground/40">·</span>
            {formattedDate}
          </p>
          
          <button 
            onClick={handleDownloadClick}
            className="btn-download mt-2"
          >
            <Download className="w-4 h-4 mr-2" />
            {needsCredit ? 'Dar Crédito' : 'BAIXAR'}
          </button>
        </div>
      </div>

      {/* Credit Flow Modal */}
      {showCreditFlow && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
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
            <button
              onClick={() => setShowCreditFlow(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mt-3 text-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Download confirm */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowDownloadConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-[hsl(0,0%,4%)] border border-border/40 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-4">
              <Download className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground text-center mb-1">
              Baixar este pack?
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Você quer mesmo baixar <span className="text-foreground font-semibold">{pack.title}</span> de @{displayAuthor}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDownloadConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[hsl(0,0%,7%)] border border-border/40 text-muted-foreground text-sm font-semibold hover:text-foreground transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDownload}
                className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Baixar
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}