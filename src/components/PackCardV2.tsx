import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pack } from '@/hooks/useSupabasePacks';
import { Image as ImageIcon, Crown, Heart, Bookmark, ExternalLink, Pin, MoreHorizontal, Download, X, User, BadgeCheck, Repeat2, MessageCircle, Send, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { usePackInteractions } from '@/hooks/usePackInteractions';
import { AuthModal } from './AuthModal';
import { toast } from 'sonner';
import { usePackComments, useRepost } from '@/hooks/useSocial';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmojiText } from '@/components/EmojiText';
import { PackImagePlaceholder } from './PackImagePlaceholder';

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
  const { user, isAdmin } = useAuth();
  const { hasLiked, hasFavorited, isDownloadUnlocked, toggleLike, toggleFavorite, unlockDownload } = usePackInteractions(pack.id);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreditFlow, setShowCreditFlow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const { hasReposted, toggleRepost } = useRepost(pack.id);
  const { comments, addComment, updateComment, deleteComment, pinComment } = usePackComments(pack.id);

  const isOwner = (pack.author_name || '').toLowerCase().replace(/^@/, '') === 'goat';

  const formattedDate = format(new Date(pack.created_at), "dd/MM/yyyy", { locale: ptBR });
  const displayAuthor = pack.is_anonymous ? 'Anônimo' : pack.author_name || 'Desconhecido';
  const authorProfileUrl = pack.user_id && !pack.is_anonymous ? `/perfil/${pack.user_id}` : null;

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
    if (pack.credit_channel_url && !isDownloadUnlocked) { setShowCreditFlow(true); return; }
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

  const handleRepostClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    try { await toggleRepost(); } catch { toast.error('Erro ao republicar'); }
  };

  const handleAddComment = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!commentText.trim()) return;
    try {
      await addComment(commentText);
      setCommentText('');
    } catch { toast.error('Erro ao comentar'); }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editingComment.content.trim()) return;
    try {
      await updateComment({ id: editingComment.id, content: editingComment.content });
      setEditingComment(null);
    } catch { toast.error('Erro ao editar comentário'); }
  };

  const timeAgo = formatDistanceToNowStrict(new Date(pack.created_at), { locale: ptBR })
    .replace(' segundos', 's').replace(' segundo', 's')
    .replace(' minutos', 'min').replace(' minuto', 'min')
    .replace(' horas', 'h').replace(' hora', 'h')
    .replace(' dias', ' DIAS').replace(' dia', ' DIA')
    .replace(' meses', ' MESES').replace(' mês', ' MÊS')
    .replace(' anos', ' ANOS').replace(' ano', ' ANO')
    .toUpperCase();

  const categoryLabel = (packTypeLabels[pack.pack_type] || pack.pack_type || '').toUpperCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDetails(true)}
        className="group relative text-left w-full rounded-2xl overflow-hidden bg-[hsl(0,0%,4%)] border border-border/40 transition-all p-2.5 flex flex-col"
      >
        {/* Square cover */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[hsl(0,0%,2%)]">
          {pack.cover_url ? (
            <img src={pack.cover_url} alt={pack.title} className="w-full h-full object-cover" />
          ) : (
            <PackImagePlaceholder />
          )}

          {/* time-ago pill (bottom-left over image) */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm text-foreground px-1.5 py-0.5 rounded-md text-[10px] font-bold">
            <span>{formatDistanceToNowStrict(new Date(pack.created_at), { locale: ptBR, addSuffix: false })
              .replace(' segundos','s').replace(' segundo','s')
              .replace(' minutos','min').replace(' minuto','min')
              .replace(' horas','h').replace(' hora','h')
              .replace(' dias','d').replace(' dia','d')
              .replace(' meses','mes').replace(' mês','mes')
              .replace(' anos','a').replace(' ano','a')}
            </span>
            <BadgeCheck className="w-3 h-3" />
          </div>

          {pack.is_pinned && (
            <div className="absolute top-2 left-2">
              <Pin className="w-3.5 h-3.5 text-foreground drop-shadow-lg" />
            </div>
          )}
          {pack.is_premium && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-premium/90 text-premium-foreground px-1.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm">
              <Crown className="w-3 h-3" />
              R$ {pack.price?.toFixed(2)}
            </div>
          )}
        </div>

        {/* Title — up to 2 lines, proportional */}
        <h3 className="mt-2.5 text-[15px] leading-tight font-bold text-foreground line-clamp-2 min-h-[2.6em]">
          {pack.title}
        </h3>

        {/* Author (visible) */}
        <p className="text-[12px] truncate mt-1 text-muted-foreground flex items-center gap-1">
          <span className="truncate">{displayAuthor}</span>
          {isOwner && !pack.is_anonymous && (
            <BadgeCheck className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 shrink-0" aria-label="Verificado" />
          )}
        </p>

        {/* Footer meta */}
        <div className="mt-2 pt-2 border-t border-border/30 text-[10px] font-bold tracking-wider text-muted-foreground">
          {categoryLabel} <span className="mx-1">·</span> {timeAgo}
        </div>
      </button>

      {/* Details Bottom Sheet */}
      {showDetails && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center" onClick={() => setShowDetails(false)}>
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
                  <PackImagePlaceholder />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-lg">{pack.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3" />
                  {authorProfileUrl ? (
                    <Link to={authorProfileUrl} className="hover:text-foreground transition" onClick={(e) => e.stopPropagation()}>@{displayAuthor}</Link>
                  ) : (
                    <>@{displayAuthor}</>
                  )}
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
              {pack.requires_shortener && (
                <span className="inline-flex items-center gap-1 bg-foreground text-background px-2.5 py-1 rounded-full text-xs font-bold">
                  <LinkIcon className="w-3 h-3" /> Passar pelo encurtador
                </span>
              )}
              {showAdminBadge && pack.is_admin_pack && (
                <span className="inline-flex items-center gap-1 bg-destructive/20 text-destructive px-2.5 py-1 rounded-full text-xs font-bold">ADM</span>
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
              <button 
                onClick={handleRepostClick} 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  hasReposted ? 'bg-foreground/15 text-foreground' : 'bg-[hsl(0,0%,6%)] text-muted-foreground hover:text-foreground'
                }`}
              >
                <Repeat2 className="w-4 h-4" />
                Republicar
              </button>
            </div>

{/* "Ver perfil do criador" removido a pedido */}

            <div className="mb-5 border-t border-border/40 pt-4">
              <div className="flex items-center gap-2 mb-4 text-base font-black text-foreground">
                <MessageCircle className="w-4 h-4" /> Comentários
              </div>
              <div className="flex items-start gap-2 mb-3">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Dar feedback..."
                  className="min-h-[46px] rounded-2xl bg-transparent border-border/40 resize-none"
                />
                <button onClick={handleAddComment} className="h-[46px] w-11 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">Ainda sem comentários</p>
                ) : comments.map((comment) => {
                  const canEdit = user?.id === comment.user_id;
                  const canDelete = canEdit || isAdmin;
                  const name = comment.profiles?.username || comment.profiles?.artist_name || 'Usuário';
                  return (
                    <div key={comment.id} className="bg-transparent">
                      <div className="flex items-start gap-2">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                          <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold truncate">@{name}</span>
                              {comment.is_pinned && <span className="text-[10px] text-primary font-bold">Fixado</span>}
                          </div>
                          {editingComment?.id === comment.id ? (
                            <div className="mt-2 space-y-2">
                              <Textarea value={editingComment.content} onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })} className="min-h-[52px] rounded-xl bg-background" />
                              <div className="flex gap-2">
                                <button onClick={handleUpdateComment} className="text-xs font-bold text-foreground">Salvar</button>
                                <button onClick={() => setEditingComment(null)} className="text-xs text-muted-foreground">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap leading-snug"><EmojiText text={comment.content} /></p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {isAdmin && (
                            <button onClick={() => pinComment({ id: comment.id, pinned: !comment.is_pinned })} className="p-1 text-muted-foreground hover:text-foreground">
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEdit && (
                            <button onClick={() => setEditingComment({ id: comment.id, content: comment.content })} className="p-1 text-muted-foreground hover:text-foreground">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => deleteComment(comment.id)} className="p-1 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleDownloadClick}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[hsl(0,0%,2%)] border border-border/60 text-foreground py-3 font-bold hover:bg-[hsl(0,0%,6%)] transition"
            >
              <Download className="w-4 h-4" />
              {pack.credit_channel_url && !isDownloadUnlocked && user ? 'Dar Crédito para Baixar' : 'Baixar Pack'}
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
            <button onClick={() => setShowCreditFlow(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mt-3 text-center">
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
