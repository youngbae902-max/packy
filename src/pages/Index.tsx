import { useMemo, useState } from 'react';
import { Plus, Settings, Instagram, Search, ShoppingBag, MoreVertical, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PackCardV2 } from '@/components/PackCardV2';
import { SupportCard } from '@/components/SupportCard';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { HorizontalCarousel } from '@/components/HorizontalCarousel';
import { CompactPackRow } from '@/components/CompactPackRow';
import { CreatorRow, Creator } from '@/components/CreatorRow';
import { useSupabasePacks, Pack } from '@/hooks/useSupabasePacks';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CHIPS: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'drumkit', label: 'Drum Kits' },
  { key: 'samples', label: 'Samples' },
  { key: 'presets', label: 'Presets' },
  { key: 'loops', label: 'Loops' },
  { key: 'project', label: 'Projetos' },
];

function CarouselItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[260px] shrink-0 snap-start">{children}</div>;
}

function CompactSection({ title, packs }: { title: string; packs: Pack[] }) {
  if (packs.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-black tracking-tight mb-3 px-2">{title}</h2>
      <div className="bg-[hsl(0,0%,4%)] rounded-2xl border border-border/40 p-2 divide-y divide-border/20">
        {packs.map((p) => (<CompactPackRow key={p.id} pack={p} />))}
      </div>
    </section>
  );
}

function CreatorsSection({ title, creators }: { title: string; creators: Creator[] }) {
  if (creators.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-black tracking-tight mb-3 px-2">{title}</h2>
      <div className="bg-[hsl(0,0%,4%)] rounded-2xl border border-border/40 p-2 divide-y divide-border/20">
        {creators.map((c) => (<CreatorRow key={c.user_id} creator={c} />))}
      </div>
    </section>
  );
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chip, setChip] = useState<string>('all');
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const { allApprovedPacks, premiumPacks, isLoading, addPack } = useSupabasePacks();
  const { activeEvents } = useSiteEvents();
  const { isAdmin } = useAuth();

  const freePacks = useMemo(
    () => allApprovedPacks.filter(p => p.pack_type !== 'project' && !p.is_premium),
    [allApprovedPacks]
  );

  // If searching, show flat filtered results
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [] as Pack[];
    return allApprovedPacks.filter(p =>
      p.title.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q)
    );
  }, [searchTerm, allApprovedPacks]);

  const byType = (type: Pack['pack_type']) => freePacks.filter(p => p.pack_type === type);

  const lancamentos = useMemo(
    () => [...freePacks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 12),
    [freePacks]
  );
  const emAlta = useMemo(
    () => [...freePacks].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 5),
    [freePacks]
  );
  const quentinho = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return [...freePacks]
      .filter(p => new Date(p.created_at).getTime() > weekAgo)
      .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      .slice(0, 5);
  }, [freePacks]);

  // Top creators (by pack count)
  const { data: creators = [] } = useQuery({
    queryKey: ['top-creators'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('user_id, username, artist_name, avatar_url')
        .limit(50);
      const profiles = (data || []) as any[];
      const counts = new Map<string, number>();
      allApprovedPacks.forEach(p => {
        if (p.user_id) counts.set(p.user_id, (counts.get(p.user_id) || 0) + 1);
      });
      return profiles
        .map(p => ({ ...p, packs_count: counts.get(p.user_id) || 0 }))
        .filter(p => p.packs_count > 0)
        .sort((a, b) => b.packs_count - a.packs_count)
        .slice(0, 6) as Creator[];
    },
    enabled: allApprovedPacks.length > 0,
  });

  const filteredByChip = chip === 'all' ? [] : freePacks.filter(p => p.pack_type === chip);

  const showSearchOrChip = !!searchTerm.trim() || chip !== 'all';
  const visibleFlat = searchTerm.trim() ? searchResults : filteredByChip;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {/* Top Bar */}
        <div className="flex items-center justify-between pt-4 mb-2">
          <button onClick={() => setShowOrderDialog(true)} aria-label="Encomendar" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ShoppingBag className="w-5 h-5" />
          </button>
          <div className="flex gap-1 items-center">
            <a href="https://www.instagram.com/mathewdcarmo?igsh=N2p5dXZlOHlhYThl" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-full hover:bg-muted transition-colors text-pink-500">
              <Instagram className="w-5 h-5" />
            </a>
            {isAdmin && (
              <Link to="/admin" aria-label="Admin" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Settings className="w-5 h-5" />
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Mais" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[hsl(0,0%,4%)] border-border/60">
                <DropdownMenuItem onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> Novo pack
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Header />

        {activeEvents.length > 0 && (
          <div className="mb-6 space-y-2">
            {activeEvents.map((event) => (<EventCard key={event.id} event={event} />))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar packs, criadores…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-full h-11 bg-[hsl(0,0%,5%)] border-border/40"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1" style={{ scrollbarWidth: 'none' }}>
          {CHIPS.map(c => (
            <button
              key={c.key}
              onClick={() => setChip(c.key)}
              className={`shrink-0 h-9 px-4 rounded-full text-sm font-semibold transition-colors border ${
                chip === c.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-[hsl(0,0%,5%)] text-muted-foreground border-border/40 hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mb-6"><SupportCard /></div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : showSearchOrChip ? (
          visibleFlat.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum pack encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleFlat.map(p => <PackCardV2 key={p.id} pack={p} />)}
            </div>
          )
        ) : (
          <>
            <HorizontalCarousel title="Lançamentos">
              {lancamentos.map(p => (
                <CarouselItem key={p.id}><PackCardV2 pack={p} /></CarouselItem>
              ))}
            </HorizontalCarousel>

            <CompactSection title="Em alta" packs={emAlta} />
            <CompactSection title="Quentinho" packs={quentinho} />
            <CreatorsSection title="Top creators" creators={creators} />

            <HorizontalCarousel title="Drum Kits">
              {byType('drumkit').slice(0, 12).map(p => (
                <CarouselItem key={p.id}><PackCardV2 pack={p} /></CarouselItem>
              ))}
            </HorizontalCarousel>

            <HorizontalCarousel title="Samples">
              {byType('samples').slice(0, 12).map(p => (
                <CarouselItem key={p.id}><PackCardV2 pack={p} /></CarouselItem>
              ))}
            </HorizontalCarousel>

            <HorizontalCarousel title="Presets essenciais">
              {byType('presets').slice(0, 12).map(p => (
                <CarouselItem key={p.id}><PackCardV2 pack={p} /></CarouselItem>
              ))}
            </HorizontalCarousel>

            <HorizontalCarousel title="Loops">
              {byType('loops').slice(0, 12).map(p => (
                <CarouselItem key={p.id}><PackCardV2 pack={p} /></CarouselItem>
              ))}
            </HorizontalCarousel>

            {premiumPacks.length > 0 && (
              <HorizontalCarousel title="Prateleira premium">
                {premiumPacks.filter(p => p.pack_type !== 'project').slice(0, 12).map(p => (
                  <CarouselItem key={p.id}><PackCardV2 pack={p} /></CarouselItem>
                ))}
              </HorizontalCarousel>
            )}
          </>
        )}
      </div>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Encomendar Packs</DialogTitle></DialogHeader>
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Em breve...</p>
          </div>
        </DialogContent>
      </Dialog>

      <AddPackModalV2 isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addPack} />
      <BottomNav />
    </div>
  );
};

export default Index;
