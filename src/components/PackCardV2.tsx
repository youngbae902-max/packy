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
      {/* Feed card — large image, black base, subtle gray border */}
      <article className="group relative overflow-hidden rounded-[2rem] bg-card border border-border/60 transition-colors hover:border-border">
        <button
          onClick={() => setShowDetails(true)}
          className="relative block w-full aspect-[4/3] overflow-hidden bg-secondary/30 text-left"
        >
          {pack.cover_url ? (
            <img
              src={pack.cover_url}
              alt={pack.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-secondary/40">
              <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/65 to-transparent" />

          <button
            onClick={handleFavoriteClick}
            aria-label="Favoritar"
            className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground drop-shadow-lg transition-transform hover:scale-105"
          >
            <Bookmark className={`w-7 h-7 stroke-[2.5] ${hasFavorited ? 'fill-current' : ''}`} />
          </button>

          {pack.is_pinned && (
            <span className="absolute top-4 left-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/80 border border-border/50 backdrop-blur-md">
              <Pin className="w-4 h-4 text-foreground" />
            </span>
          )}

          {pack.is_premium && (
            <span className="absolute left-4 bottom-4 z-10 inline-flex items-center gap-1 rounded-full bg-premium/90 text-premium-foreground px-3 py-1 text-xs font-bold backdrop-blur-md">
              <Crown className="w-3.5 h-3.5" />
              R$ {pack.price?.toFixed(2)}
            </span>
          )}
        </button>

        <div className="p-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-black leading-tight text-foreground line-clamp-2 break-words">
                {pack.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground truncate">
                <span className="truncate">@{displayAuthor}</span>
                {isOwner && !pack.is_anonymous && (
                  <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20 flex-shrink-0" aria-label="Dono verificado" />
                )}
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setShowDetails(true); }}
              aria-label="Ver detalhes"
              className="mt-2 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-foreground hover:bg-secondary/80 transition-colors"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={handleDownloadClick}
            className="mt-5 inline-flex h-14 w-full items-center justify-center gap-3 rounded-[1.35rem] bg-secondary text-foreground text-base font-black uppercase tracking-wide hover:bg-secondary/80 transition-colors"
          >
            <ArrowDownToLine className="w-5 h-5" />
            {needsCredit ? 'Crédito' : 'Baixar'}
          </button>
        </div>
      </div>

      {/* Details Bottom Sheet */}
      {showDetails && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center" onClick={() => setShowDetails(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-[hsl(0,0%,3%)] border-t border-border rounded-t-2xl p-5 pb-8 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
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
                  {isOwner && !pack.is_anonymous && (
                    <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20 ml-0.5" aria-label="Dono verificado" />
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="badge-exclusive text-xs">
                {packTypeLabels[pack.pack_type] || pack.pack_type}
              </span>
              {pack.is_exclusive && <span className="badge-star text-xs">⭐ Exclusivo</span>}
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
                <span className="inline-flex items-center gap-1 bg-destructive/20 text-destructive px-2.5 py-1 rounded-full text-xs font-bold">
                  ADM
                </span>
              )}
            </div>

            {isOwner && !pack.is_anonymous && (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-sky-400">
                <BadgeCheck className="w-4 h-4 fill-sky-400/20" />
                <span className="font-semibold">Dono do aplicativo</span>
              </div>
            )}

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
              {needsCredit ? 'Dar Crédito para Baixar' : 'Baixar Pack'}
            </button>
          </div>
        </div>
      )}

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
