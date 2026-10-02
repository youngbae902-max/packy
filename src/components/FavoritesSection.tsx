import { useState } from 'react';
import { Bookmark, ChevronDown, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useUserFavorites } from '@/hooks/usePackInteractions';
import { ProfilePackRow } from './ProfilePackRow';

export function FavoritesSection() {
  const { favorites, isLoading } = useUserFavorites();
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left group"
      >
        <div className="flex items-end justify-between px-1 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="w-4 h-4 text-foreground" />
              <span className="text-base font-semibold text-foreground tracking-tight">Favoritos</span>
              <span className="text-[11px] text-muted-foreground">/{favorites.length}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Sua coleção pessoal</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-border/50 bg-secondary/60 flex items-center justify-center group-hover:bg-secondary transition-colors">
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <div className="h-px bg-border/50 relative">
          <div className={`absolute left-0 top-0 h-px bg-foreground transition-all duration-300 ${open ? 'w-16' : 'w-8'}`} />
        </div>
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-border/40 bg-card/70 overflow-hidden">
          <div className="px-3 py-2.5 flex items-center gap-2 border-b border-border/30">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">Salvos por você</span>
          </div>
          <div className="px-3 pb-3 pt-1 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 pt-2">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />)}
              </div>
            ) : favorites.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-secondary/70 border border-border/40 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Nada salvo ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Os packs que você salvar aparecem aqui.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {favorites.map((pack: any) => <ProfilePackRow key={pack.id} pack={pack} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
