import { useState, useMemo, useEffect, useRef } from 'react';
import { Upload, Search, Crown, Mic, Folder, Inbox, Menu, Gift, X } from 'lucide-react';
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
import { useAppLogo } from '@/hooks/useAppLogo';
import { useProfileSearch } from '@/hooks/useSocial';
import { useCustomPages } from '@/hooks/useCustomPages';

type FilterType = 'free' | 'premium' | 'acapellas' | 'projetos';

const FILTERS: { id: FilterType; label: string; icon: typeof Gift; keywords: string[] }[] = [
  { id: 'free', label: 'Grátis', icon: Gift, keywords: ['gratis', 'grátis', 'free'] },
  { id: 'premium', label: 'Premium', icon: Crown, keywords: ['premium', 'pago', 'pro'] },
  { id: 'acapellas', label: 'Acapellas', icon: Mic, keywords: ['acapella', 'acapellas', 'voz', 'vocal'] },
  { id: 'projetos', label: 'Projetos', icon: Folder, keywords: ['projeto', 'projetos', 'flp', 'project'] },
];

const Packs = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState<FilterType>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [logoBubble, setLogoBubble] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const { approvedPacks, premiumPacks, projectPacks, addPack, isLoading } = useSupabasePacks();
  const { acapellas, isLoading: acapellasLoading } = useAcapellas();
  const { activeEvents } = useSiteEvents();
  const { hasUnread } = useInbox();
  const { logoUrl } = useAppLogo();
  const { data: searchedProfiles = [] } = useProfileSearch(searchQuery);
  const { pages } = useCustomPages();

  const q = searchQuery.toLowerCase().trim();

  // Suggested filter from query (matches a keyword)
  const suggestedFilter = useMemo(() => {
    if (!q) return null;
    return FILTERS.find(f => f.keywords.some(k => k.includes(q) || q.includes(k))) ?? null;
  }, [q]);

  // Open popup whenever the user types and there's something to suggest
  useEffect(() => {
    setPopupOpen(q.length > 0);
  }, [q]);

  // Click outside closes popup
  useEffect(() => {
    if (!popupOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [popupOpen]);

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

  const pickFilter = (id: FilterType) => {
    setFilter(id);
    setPopupOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header: only icons */}
        <header className="flex items-center justify-between py-2">
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 -ml-2 rounded-full bg-[hsl(0,0%,4%)] border border-border/50 hover:bg-[hsl(0,0%,8%)] transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={() => { setLogoBubble(true); setTimeout(() => setLogoBubble(false), 2200); }} className="relative z-[90]">
            {logoUrl ? <img src={logoUrl} alt="Logo do app" className="w-9 h-9 rounded-xl object-cover border border-border/40" /> : <h1 className="text-2xl font-black tracking-tighter">PACKY</h1>}
            {logoBubble && <span className="absolute top-full left-1/2 z-[100] -translate-x-1/2 mt-2 whitespace-nowrap rounded-2xl bg-foreground text-background px-3 py-1.5 text-xs font-black shadow-xl">obgg por usar</span>}
          </button>
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

        {pages.filter(page => page.is_active && page.placement === 'home').length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide my-4">
            {pages.filter(page => page.is_active && page.placement === 'home').map(page => (
              <Link key={page.id} to={`/pagina/${page.slug}`} className="shrink-0 rounded-full border border-border/50 bg-[hsl(0,0%,5%)] px-4 py-2 text-sm font-bold text-foreground">
                {page.title}
              </Link>
            ))}
          </div>
        )}

        {/* Search + discreet add button + floating filter popup */}
        <div className="flex items-center gap-2 mt-4 mb-5 relative" ref={popupRef}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => q.length > 0 && setPopupOpen(true)}
              className="w-full bg-[hsl(0,0%,5%)] border border-border/50 rounded-full pl-11 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
              placeholder="Buscar..."
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setPopupOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/10 text-muted-foreground"
                aria-label="Limpar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {showAddButton && (
            <button
              onClick={handleNewPack}
              aria-label="Enviar pack"
              className="shrink-0 w-10 h-10 rounded-full bg-[hsl(0,0%,6%)] border border-border/60 flex items-center justify-center text-foreground/80 hover:bg-[hsl(0,0%,9%)] hover:text-foreground transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}

          {/* Floating filter popup */}
          {popupOpen && (
            <div
               className="absolute top-full left-0 right-0 mt-2 z-[80] rounded-2xl border border-border/60 bg-[hsl(0,0%,3%)]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-3 animate-fade-in"
            >
              {suggestedFilter && (
                <div className="mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1.5">Sugestão</p>
                  <button
                    onClick={() => pickFilter(suggestedFilter.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      filter === suggestedFilter.id
                        ? 'bg-foreground text-background'
                        : 'bg-[hsl(0,0%,7%)] text-foreground hover:bg-[hsl(0,0%,10%)]'
                    }`}
                  >
                    <suggestedFilter.icon className="w-4 h-4" />
                    Mostrar {suggestedFilter.label}
                  </button>
                </div>
              )}

              <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1.5">Filtrar por</p>
              {searchedProfiles.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1.5">Usuários</p>
                  <div className="space-y-1.5">
                    {searchedProfiles.map(profile => (
                      <Link
                        key={profile.user_id}
                        to={`/perfil/${profile.user_id}`}
                        className="flex items-center gap-2 rounded-xl bg-[hsl(0,0%,7%)] px-3 py-2 text-sm font-semibold hover:bg-[hsl(0,0%,10%)] transition"
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-muted" />
                        )}
                        <span className="truncate">@{profile.username || profile.artist_name || 'usuário'}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {FILTERS.map(f => {
                  const Icon = f.icon;
                  const active = filter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => pickFilter(f.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-[hsl(0,0%,5%)] text-muted-foreground border-border/40 hover:text-foreground hover:bg-[hsl(0,0%,8%)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
