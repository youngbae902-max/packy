import { Download, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Pack } from '@/hooks/useSupabasePacks';
import { PackImagePlaceholder } from './PackImagePlaceholder';
import { useAuth } from '@/contexts/AuthContext';
import { usePackInteractions } from '@/hooks/usePackInteractions';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
import { toast } from 'sonner';

export function CompactPackRow({ pack }: { pack: Pack }) {
  const { user } = useAuth();
  const { hasLiked, toggleLike, isDownloadUnlocked } = usePackInteractions(pack.id);
  const [showAuth, setShowAuth] = useState(false);

  const onLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setShowAuth(true);
    try { await toggleLike(); } catch { toast.error('Erro ao curtir'); }
  };

  const onDownload = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setShowAuth(true);
    if (pack.credit_channel_url && !isDownloadUnlocked) {
      window.open(pack.credit_channel_url, '_blank');
      return;
    }
    window.open(pack.download_url, '_blank');
  };

  return (
    <>
      <div className="flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-[hsl(0,0%,6%)] transition-colors">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(0,0%,7%)] border border-border/40 shrink-0">
          {pack.cover_url ? (
            <img src={pack.cover_url} alt={pack.title} className="w-full h-full object-cover" />
          ) : (
            <PackImagePlaceholder />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-foreground truncate leading-tight">{pack.title}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">@{pack.author_name || 'anônimo'}</p>
        </div>
        <button onClick={onDownload} aria-label="Baixar" className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={onLike} aria-label="Curtir" className={`flex items-center gap-1 h-8 px-2 rounded-full text-xs ${hasLiked ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
          <span className="tabular-nums">{pack.likes_count || 0}</span>
        </button>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
