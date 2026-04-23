import { useState } from 'react';
import { Plus, Search, Crown, Mic, Folder, Inbox, Star, Menu, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { SideMenu } from '@/components/SideMenu';
import { PackCardV2 } from '@/components/PackCardV2';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { AuthModal } from '@/components/AuthModal';
import { EventCard } from '@/components/EventCard';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAcapellas } from '@/hooks/useAcapellas';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useInbox } from '@/hooks/useInbox';

type FilterType = 'free' | 'premium' | 'acapellas' | 'projetos';

const FILTERS: { id: FilterType; label: string; icon: typeof Gift }[] = [
  { id: 'free', label: 'Grátis', icon: Gift },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'acapellas', label: 'Acapellas', icon: Mic },
  { id: 'projetos', label: 'Projetos', icon: Folder },
];

const Packs = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState<FilterType>('free');
  const [searchQuery, setSearchQuery] = useState('');

  const { approvedPacks, premiumPacks, projectPacks, addPack, isLoading } = useSupabasePacks();
  const { acapellas, isLoading: acapellasLoading } = useAcapellas();
  const { activeEvents } = useSiteEvents();
  const { hasUnread } = useInbox();

  const q = searchQuery.toLowerCase();
  const filteredFree = approvedPacks.filter(p => p.title.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q));
  const filteredPremium = premiumPacks.filter(p => p.title.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q));
  const filteredProjects = projectPacks.filter(p => p.title.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q));
  const filteredAcapellas = acapellas.filter(a => a.artist_name.toLowerCase().includes(q));

  const handleNewPack = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  const showAddButton = filter === 'free' || filter === 'premium' || filter === 'projetos';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header: only icons */}
        <header className="flex items-center justify-between py-2">
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 -ml-2 rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tighter">PACKY</h1>
          <Link to="/inbox" className="relative p-2 -mr-2" aria-label="Caixa de entrada">
            <Inbox className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
            )}
          </Link>
        </header>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-2 my-4">
            {activeEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Search + discreet add button */}
        <div className="flex items-center gap-2 mt-4 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              placeholder="Buscar..."
            />
          </div>
          {showAddButton && (
            <button
              onClick={handleNewPack}
              aria-label="Adicionar"
              className="shrink-0 w-10 h-10 rounded-full bg-[hsl(0,0%,6%)] border border-border/60 flex items-center justify-center text-foreground/80 hover:bg-[hsl(0,0%,9%)] hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter chips (inside search area) */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {FILTERS.map(f => {
            const Icon = f.icon;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-[hsl(0,0%,5%)] text-muted-foreground border-border/60 hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {filter === 'free' && (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filteredFree.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum pack encontrado</p>
            ) : (
              filteredFree.map(pack => <PackCardV2 key={pack.id} pack={pack} />)
            )}
          </div>
        )}

        {filter === 'premium' && (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filteredPremium.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum pack premium encontrado</p>
            ) : (
              filteredPremium.map(pack => <PackCardV2 key={pack.id} pack={pack} />)
            )}
          </div>
        )}

        {filter === 'acapellas' && (
          <div className="space-y-4">
            {acapellasLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filteredAcapellas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma acapella encontrada</p>
            ) : (
              filteredAcapellas.map(acapella => (
                <AudioPlayer
                  key={acapella.id}
                  artistName={acapella.artist_name}
                  audioUrl={acapella.audio_url}
                  downloadUrl={acapella.download_url}
                  duration={acapella.duration_seconds || undefined}
                />
              ))
            )}
          </div>
        )}

        {filter === 'projetos' && (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filteredProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum projeto encontrado</p>
            ) : (
              filteredProjects.map(pack => <PackCardV2 key={pack.id} pack={pack} />)
            )}
          </div>
        )}
      </div>

      <BottomNav />
      <SideMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

      {user && (
        <AddPackModalV2
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addPack}
          isProject={filter === 'projetos'}
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Packs;
