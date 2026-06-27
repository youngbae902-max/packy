import { useState, useMemo, useEffect, useRef } from 'react';
import { Upload, Search, Menu, Inbox, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { SideMenu } from '@/components/SideMenu';
import { PackCardV2 } from '@/components/PackCardV2';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { AuthModal } from '@/components/AuthModal';
import { EventCard } from '@/components/EventCard';
import { HorizontalCarousel } from '@/components/HorizontalCarousel';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAcapellas } from '@/hooks/useAcapellas';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useInbox } from '@/hooks/useInbox';
import { useAppLogo } from '@/hooks/useAppLogo';
import { useProfileSearch } from '@/hooks/useSocial';
import { useCustomPages } from '@/hooks/useCustomPages';
import { useCategories } from '@/hooks/useCategories';

const Packs = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const { approvedPacks, premiumPacks, projectPacks, addPack, isLoading } = useSupabasePacks();
  const { acapellas, isLoading: acapellasLoading } = useAcapellas();
  const { activeEvents } = useSiteEvents();
  const { hasUnread } = useInbox();
  const { logoUrl } = useAppLogo();
  const { data: searchedProfiles = [] } = useProfileSearch(searchQuery);
  const { pages } = useCustomPages();
  const { categories } = useCategories();

  const q = searchQuery.toLowerCase().trim();

  // Open popup whenever the user types
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

  const handleNewPack = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  const searchedPacks = useMemo(() => {
    if (!q) return [];
    return [...approvedPacks, ...premiumPacks, ...projectPacks].filter(p => 
      p.title.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q)
    );
  }, [q, approvedPacks, premiumPacks, projectPacks]);

  // Use categories from DB if available, otherwise fallback to standard sections
  const hasCategories = categories && categories.length > 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Search Header for Desktop */}
      <header className="hidden md:flex sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 px-8 py-4 items-center justify-between gap-6">
        <div className="flex-1 max-w-2xl relative" ref={popupRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => q.length > 0 && setPopupOpen(true)}
            className="w-full bg-[hsl(0,0%,5%)] border border-border/50 rounded-full pl-12 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            placeholder="O que você quer ouvir ou baixar?"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPopupOpen(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/10 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Desktop Search Dropdown */}
          {popupOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-[80] rounded-2xl border border-border/60 bg-[hsl(0,0%,3%)]/95 backdrop-blur-xl shadow-2xl p-3 animate-fade-in max-h-96 overflow-y-auto">
              {searchedProfiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2 font-bold">Usuários</p>
                  <div className="space-y-1">
                    {searchedProfiles.map(profile => (
                      <Link
                        key={profile.user_id}
                        to={`/perfil/${profile.user_id}`}
                        className="flex items-center gap-3 rounded-xl hover:bg-[hsl(0,0%,10%)] px-3 py-2 transition"
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted" />
                        )}
                        <span className="font-semibold text-sm">@{profile.username || profile.artist_name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {searchedPacks.length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2 font-bold">Packs & Projetos</p>
                  <div className="space-y-2">
                    {searchedPacks.slice(0, 5).map(pack => (
                      <div key={pack.id} className="transform scale-95 origin-left">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : q.length > 0 && searchedProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum resultado encontrado.</p>
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/inbox" className="relative p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Caixa de entrada">
            <Inbox className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
            )}
          </Link>
          <button
            onClick={handleNewPack}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Publicar
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center justify-between py-2">
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 -ml-2 rounded-full text-foreground hover:bg-foreground/10 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative z-10 pointer-events-none">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-border/40" /> : <h1 className="text-2xl font-black tracking-tighter">PACKY</h1>}
          </div>
          <Link to="/inbox" className="relative p-2 -mr-2">
            <Inbox className="w-6 h-6" />
            {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />}
          </Link>
        </header>

        {/* Mobile Search */}
        <div className="flex items-center gap-2 mt-4 mb-5 relative" ref={popupRef}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[hsl(0,0%,5%)] border border-border/50 rounded-full pl-11 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="Buscar..."
            />
          </div>
          <button
            onClick={handleNewPack}
            className="shrink-0 w-10 h-10 rounded-full bg-[hsl(0,0%,6%)] border border-border/60 flex items-center justify-center text-foreground hover:bg-[hsl(0,0%,9%)] transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8">
        
        {/* Banners / Eventos */}
        {activeEvents.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Main Feed Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><p className="text-muted-foreground animate-pulse font-semibold">Carregando conteúdo...</p></div>
        ) : (
          <div className="space-y-4">
            
            <HorizontalCarousel title="Lançamentos">
              {approvedPacks.slice(0, 10).map(pack => (
                <div key={pack.id} className="min-w-[140px] max-w-[140px] md:min-w-[180px] md:max-w-[180px] shrink-0 snap-start">
                  <PackCardV2 pack={pack} />
                </div>
              ))}
            </HorizontalCarousel>

            {hasCategories ? (
              categories.map(category => (
                <HorizontalCarousel key={category.id} title={category.name}>
                  {/* For now we just show random packs until we bind pack_categories in the hook */}
                  {premiumPacks.slice(0, 8).map(pack => (
                    <div key={pack.id} className="min-w-[140px] max-w-[140px] md:min-w-[180px] md:max-w-[180px] shrink-0 snap-start">
                      <PackCardV2 pack={pack} />
                    </div>
                  ))}
                </HorizontalCarousel>
              ))
            ) : (
              /* Fallback sections if no categories are setup yet */
              <>
                {premiumPacks.length > 0 && (
                  <HorizontalCarousel title="Premium & Exclusivos">
                    {premiumPacks.map(pack => (
                      <div key={pack.id} className="min-w-[140px] max-w-[140px] md:min-w-[180px] md:max-w-[180px] shrink-0 snap-start">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </HorizontalCarousel>
                )}

                {projectPacks.length > 0 && (
                  <HorizontalCarousel title="Projetos e FLPs">
                    {projectPacks.map(pack => (
                      <div key={pack.id} className="min-w-[140px] max-w-[140px] md:min-w-[180px] md:max-w-[180px] shrink-0 snap-start">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </HorizontalCarousel>
                )}

                {acapellas.length > 0 && (
                  <HorizontalCarousel title="Acapellas & Vozes">
                    {acapellas.slice(0, 8).map(acapella => (
                      <div key={acapella.id} className="min-w-[280px] max-w-[320px] shrink-0 snap-start">
                        <AudioPlayer
                          artistName={acapella.artist_name}
                          audioUrl={acapella.audio_url}
                          downloadUrl={acapella.download_url}
                          duration={acapella.duration_seconds || undefined}
                        />
                      </div>
                    ))}
                  </HorizontalCarousel>
                )}
              </>
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
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Packs;
