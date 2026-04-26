import { useState } from 'react';
import { Download, Heart, Image as ImageIcon, MoreHorizontal, Repeat2, X } from 'lucide-react';
import { Pack } from '@/hooks/useSupabasePacks';
import { useAuth } from '@/contexts/AuthContext';
import { usePackInteractions } from '@/hooks/usePackInteractions';
import { useRepost } from '@/hooks/useSocial';
import { AuthModal } from './AuthModal';
import { toast } from 'sonner';

export function ProfilePackRow({ pack }: { pack: Pack }) {
  const { user } = useAuth();
  const { hasLiked, toggleLike } = usePackInteractions(pack.id);
  const { hasReposted, toggleRepost } = useRepost(pack.id);
  const [showActions, setShowActions] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireUser = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireUser()) return;
    try { await toggleLike(); } catch { toast.error('Erro ao curtir'); }
  };

  const handleRepost = async () => {
    if (!requireUser()) return;
    try { await toggleRepost(); } catch { toast.error('Erro ao republicar'); }
  };

  return (
    <>
      <div className="flex items-center gap-3 py-2.5">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[hsl(0,0%,7%)] border border-border/40 shrink-0">
          {pack.cover_url ? <img src={pack.cover_url} alt={pack.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground/40" /></div>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground truncate">{pack.title}</p>
          <p className="text-xs text-muted-foreground truncate">@{pack.author_name || 'desconhecido'} · {pack.likes_count || 0} curtidas</p>
        </div>
        <button onClick={() => setShowActions(true)} className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-foreground/10 hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {showActions && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center" onClick={() => setShowActions(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-t-3xl border-t border-border/50 bg-[hsl(0,0%,3%)] p-4 pb-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowActions(false)} className="absolute right-4 top-4 text-muted-foreground"><X className="w-5 h-5" /></button>
            <div className="w-10 h-1 rounded-full bg-foreground/20 mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(0,0%,7%)] shrink-0">{pack.cover_url && <img src={pack.cover_url} alt="" className="w-full h-full object-cover" />}</div>
              <p className="font-bold truncate">{pack.title}</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => window.open(pack.download_url, '_blank')} className="w-full flex items-center gap-3 rounded-2xl bg-[hsl(0,0%,7%)] px-4 py-3 text-sm font-bold"><Download className="w-4 h-4" /> Baixar</button>
              <button onClick={handleRepost} className="w-full flex items-center gap-3 rounded-2xl bg-[hsl(0,0%,7%)] px-4 py-3 text-sm font-bold"><Repeat2 className="w-4 h-4" /> {hasReposted ? 'Remover republicação' : 'Republicar'}</button>
              <button onClick={handleLike} className="w-full flex items-center gap-3 rounded-2xl bg-[hsl(0,0%,7%)] px-4 py-3 text-sm font-bold"><Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} /> {hasLiked ? 'Descurtir' : 'Curtir'}</button>
            </div>
          </div>
        </div>
      )}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}