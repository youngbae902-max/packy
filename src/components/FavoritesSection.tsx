import { useState } from 'react';
import { Bookmark, ChevronRight, Image as ImageIcon, Heart, Download } from 'lucide-react';
import { useUserFavorites } from '@/hooks/usePackInteractions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PackCardV2 } from './PackCardV2';

export function FavoritesSection() {
  const { favorites, isLoading } = useUserFavorites();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-secondary/50 border border-border text-center">
        <Bookmark className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhum favorito ainda</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Salve packs para acessar rapidamente</p>
      </div>
    );
  }

  const displayFavorites = favorites.slice(0, 5);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold text-foreground">Favoritos</span>
          </div>
          {favorites.length > 5 && (
            <button 
              onClick={() => setShowAll(true)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Ver todos ({favorites.length})
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {displayFavorites.map((pack: any) => (
          <button
            key={pack.id}
            onClick={() => setShowAll(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/60 border border-border/50 hover:border-border hover:bg-secondary transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {pack.cover_url ? (
                <img 
                  src={pack.cover_url} 
                  alt={pack.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{pack.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-muted-foreground truncate">
                  @{pack.is_anonymous ? 'Anônimo' : pack.author_name || 'Desconhecido'}
                </span>
                {pack.likes_count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3" />
                    {pack.likes_count}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Bookmark className="w-5 h-5 text-warning" />
              Meus Favoritos ({favorites.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {favorites.map((pack: any) => (
              <PackCardV2 key={pack.id} pack={pack} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
