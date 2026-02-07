import { useState } from 'react';
import { Bookmark, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useUserFavorites } from '@/hooks/usePackInteractions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PackCardV2 } from './PackCardV2';

export function FavoritesSection() {
  const { favorites, isLoading } = useUserFavorites();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-secondary border border-border animate-pulse">
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-secondary border border-border">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Bookmark className="w-5 h-5" />
          <span className="text-sm">Nenhum favorito ainda</span>
        </div>
      </div>
    );
  }

  const displayFavorites = favorites.slice(0, 4);

  return (
    <>
      <button 
        onClick={() => setShowAll(true)}
        className="w-full p-4 rounded-2xl bg-secondary border border-border hover:border-primary/30 transition-all text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-warning" />
            <span className="font-bold text-foreground">Meus Favoritos</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-sm">{favorites.length}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-hidden">
          {displayFavorites.map((pack: any) => (
            <div 
              key={pack.id} 
              className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0"
            >
              {pack.cover_url ? (
                <img 
                  src={pack.cover_url} 
                  alt={pack.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {favorites.length > 4 && (
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted-foreground">+{favorites.length - 4}</span>
            </div>
          )}
        </div>
      </button>

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
