import { useState } from 'react';
import { Bookmark, ChevronDown, Image as ImageIcon, Heart } from 'lucide-react';
import { useUserFavorites } from '@/hooks/usePackInteractions';
import { ProfilePackRow } from './ProfilePackRow';

export function FavoritesSection() {
  const { favorites, isLoading } = useUserFavorites();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-border/50 bg-card overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-foreground/80" />
          <span className="text-sm font-bold text-foreground">Favoritos</span>
          <span className="text-xs text-muted-foreground">({favorites.length})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="p-6 text-center">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum favorito ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((pack: any) => <ProfilePackRow key={pack.id} pack={pack} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

