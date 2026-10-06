import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Menu, Inbox, X, Mic, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { SideMenu } from '@/components/SideMenu';
import { PackCardV2 } from '@/components/PackCardV2';
import { AudioPlayer } from '@/components/AudioPlayer';
import { EventCard } from '@/components/EventCard';
import { HorizontalCarousel } from '@/components/HorizontalCarousel';
import { HomeBannerCarousel } from '@/components/HomeBannerCarousel';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAcapellas } from '@/hooks/useAcapellas';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useInbox } from '@/hooks/useInbox';
import { useAppLogo } from '@/hooks/useAppLogo';
import { useProfileSearch } from '@/hooks/useSocial';
import { useCustomPages } from '@/hooks/useCustomPages';
import { useCategories } from '@/hooks/useCategories';
import { useHomeSectionsWithPacks } from '@/hooks/useHomeSections';
import { useTypedPlaceholder } from '@/hooks/useTypedPlaceholder';
import { useReleasesSection } from '@/hooks/useReleasesSection';


const Packs = () => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inicio' | 'geral' | 'pagos'>('inicio');
  const [selectedAcapella, setSelectedAcapella] = useState<typeof acapellas[number] | null>(null);
  const [pollChoice, setPollChoice] = useState('');
  const [pollText, setPollText] = useState('');
  const desktopPopupRef = useRef<HTMLDivElement>(null);
  const mobilePopupRef = useRef<HTMLDivElement>(null);

  const { approvedPacks, premiumPacks, projectPacks, isLoading } = useSupabasePacks();
  const { acapellas } = useAcapellas();
  const { activeEvents } = useSiteEvents();
  const { hasUnread } = useInbox();
  const { logoUrl } = useAppLogo();
  const { data: searchedProfiles = [] } = useProfileSearch(searchQuery);
  const { pages } = useCustomPages();
  const { categories } = useCategories();
  const { data: customSections = [] } = useHomeSectionsWithPacks();
  const { config: releases } = useReleasesSection();

  const releasePacks = useMemo(() => {
    if (releases.mode === 'manual') {
      const byId = new Map(approvedPacks.map(p => [p.id, p]));
      return releases.pack_ids.map(id => byId.get(id)).filter(Boolean) as typeof approvedPacks;
    }
    return approvedPacks.slice(0, releases.limit);
  }, [approvedPacks, releases]);

  const query = searchQuery.toLowerCase().trim();

  // Open popup whenever the user types
  useEffect(() => {
    setPopupOpen(query.length > 0);
  }, [query]);

  // Click outside closes popup
  useEffect(() => {
    if (!popupOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        desktopPopupRef.current && !desktopPopupRef.current.contains(e.target as Node) &&
        mobilePopupRef.current && !mobilePopupRef.current.contains(e.target as Node)
      ) {
        setPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [popupOpen]);

  const searchedPacks = useMemo(() => {
    if (!query) return [];
    return [...approvedPacks, ...premiumPacks, ...projectPacks].filter(p => 
      p.title.toLowerCase().includes(query) || p.author_name?.toLowerCase().includes(query)
    );
  }, [query, approvedPacks, premiumPacks, projectPacks]);

  const searchedMCs = useMemo(() => {
    if (!query) return [];
    return acapellas.filter(mc => mc.artist_name.toLowerCase().includes(query));
  }, [query, acapellas]);

  const allPacks = useMemo(() => {
    const seen = new Set<string>();
    return [...approvedPacks, ...premiumPacks, ...projectPacks].filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [approvedPacks, premiumPacks, projectPacks]);

  // Use categories from DB if available, otherwise fallback to standard sections
  const hasCategories = categories && categories.length > 0;

  const animatedPlaceholder = useTypedPlaceholder(
    ['Buscar...', 'dj arana...', 'blakes...', 'drum kit...'],
    searchQuery.length === 0
  );

  return (
    <div className="min-h-screen bg-[#111111] text-foreground pb-20 md:pb-8">
      {/* Search Header for Desktop */}
      <header className="hidden md:flex sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/40 px-8 py-4 items-center justify-between gap-6">
        <div className="flex-1 max-w-2xl relative" ref={desktopPopupRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => query.length > 0 && setPopupOpen(true)}
            className="w-full bg-[#111111] border border-white/[0.05] rounded-xl pl-12 pr-10 py-3 text-sm text-[#F5F5F5] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-1 focus:ring-white/[0.08] focus:border-white/[0.10] transition-all shadow-none"
            placeholder="What do you want to hear or download?"
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
            <div className="absolute top-full left-0 right-0 mt-2 z-[80] rounded-2xl border border-white/[0.06] bg-[#111111]/98 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.35)] p-3 animate-fade-in max-h-96 overflow-y-auto">
              {searchedProfiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2 font-bold">Users</p>
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
              {searchedMCs.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2 font-bold">MCs</p>
                  <div className="space-y-1">
                    {searchedMCs.map(mc => (
                      <a key={mc.id} href={mc.download_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl hover:bg-muted px-3 py-2">
                        {mc.image_url ? <img src={mc.image_url} alt="" className="w-20 h-20 min-w-20 min-h-20 rounded-full object-cover" /> : <span className="w-20 h-20 min-w-20 min-h-20 rounded-full bg-muted flex items-center justify-center"><Mic className="size-6" /></span>}
                        <span className="font-semibold text-sm">{mc.artist_name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {searchedPacks.length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2 font-bold">Packs & Projects</p>
                  <div className="space-y-2">
                    {searchedPacks.slice(0, 5).map(pack => (
                      <div key={pack.id} className="transform scale-95 origin-left">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : query.length > 0 && searchedProfiles.length === 0 && searchedMCs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No results found.</p>
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
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center justify-between py-2">
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 -ml-2 rounded-full text-foreground hover:bg-foreground/10 transition-colors"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
          <div className="relative z-10 pointer-events-none">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-border/40" /> : <h1 className="text-2xl font-black tracking-tighter">PACKY</h1>}
          </div>
          <Link to="/inbox" className="relative p-2 -mr-2">
            <Inbox className="w-[18px] h-[18px]" />
            {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />}
          </Link>
        </header>

        {/* Mobile Search */}
        <div className="flex items-center gap-2 mt-7 mb-7 relative" ref={mobilePopupRef}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9E9E9E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-[50px] bg-[#111111] border border-white/[0.05] rounded-2xl pl-12 pr-10 text-[14px] text-[#F5F5F5] placeholder:text-[#8A8A8A] focus:outline-none focus:border-white/[0.10] focus:ring-1 focus:ring-white/[0.08] transition-all"
              placeholder={animatedPlaceholder}
            />
          </div>
        </div>
      </div>

      <div className="packs-page relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8">

        {query.length === 0 && (
          <nav className="mb-9 flex w-full min-w-0 items-center justify-center overflow-hidden" aria-label="Navegação de packs">
            <div className="flex items-center justify-center gap-7 md:gap-9">
              {[
                ['inicio', 'Home'],
                ['geral', 'All Packs'],
                ['pagos', 'Paid Packs'],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'inicio' | 'geral' | 'pagos')}
                  className={`relative px-1 pb-3 text-[12px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                  {activeTab === tab && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full bg-foreground" />
                  )}
                </button>
              ))}
            </div>
          </nav>
        )}

        {query.length === 0 && activeTab === 'inicio' && <div className="mb-9 rounded-[18px] overflow-hidden bg-card shadow-[0_12px_40px_rgba(0,0,0,0.12)]"><HomeBannerCarousel /></div>}

        {/* Banners / Eventos */}
        {activeTab === 'inicio' && activeEvents.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Main Feed Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 py-16">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[0.9] rounded-2xl bg-white/[0.04] animate-pulse" />)}</div>
        ) : query.length > 0 ? (
          <div>
            <h2 className="text-lg md:text-2xl font-display font-bold mb-4 px-1">
              Results for "{searchQuery}" <span className="text-muted-foreground font-bold">({searchedPacks.length})</span>
            </h2>
            {searchedMCs.length > 0 && (
              <div className="mb-7">
                <p className="text-xs uppercase text-muted-foreground font-bold mb-3">MCs</p>
                <div className="space-y-2">
                  {searchedMCs.map(mc => (
                    <a key={mc.id} href={mc.download_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
                      {mc.image_url ? <img src={mc.image_url} alt="" className="w-32 h-32 min-w-32 min-h-32 rounded-full object-cover" /> : <span className="w-32 h-32 min-w-32 min-h-32 rounded-full bg-muted flex items-center justify-center"><Mic className="size-10" /></span>}
                      <span className="font-display font-bold">{mc.artist_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {searchedPacks.length === 0 && searchedMCs.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No packs found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {searchedPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}
              </div>
            )}
          </div>
        ) : activeTab === 'pagos' ? (
          <div>
            <div className="mb-5 px-1">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Paid</p>
              <h2 className="text-xl md:text-2xl font-normal tracking-tight">Paid Packs</h2>
              <p className="text-sm text-muted-foreground mt-1">{premiumPacks.length} packs available</p>
            </div>
            {premiumPacks.length === 0 ? <p className="text-center py-16 text-muted-foreground">No paid packs available yet.</p> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {premiumPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} hidePremiumBadge />)}
              </div>
            )}
          </div>
        ) : activeTab === 'geral' ? (
          <div>
            <div className="mb-5 px-1">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Library</p>
              <h2 className="text-xl md:text-2xl font-normal tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>All Packs</h2>
              <p className="text-sm text-muted-foreground mt-1">{allPacks.length} packs available</p>
            </div>
            {allPacks.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No packs available yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {allPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 md:space-y-12">
            
            {releases.visible && releasePacks.length > 0 && (
              <HorizontalCarousel
                title={releases.title}
              >
                {releasePacks.map(pack => (
                  <div key={pack.id} className="min-w-[180px] max-w-[180px] md:min-w-[240px] md:max-w-[240px] shrink-0 snap-start">
                    <PackCardV2 pack={pack} />
                  </div>
                ))}
              </HorizontalCarousel>
            )}



            {/* Seções personalizadas da Home (admin) */}
            {customSections
              .filter(({ section }) => !['efeitos', 'lançamentos', 'presets essenciais'].includes(section.title.trim().toLocaleLowerCase('pt-BR')))
              .map(({ section, packs }) => (
              packs.length > 0 && (
                <div key={section.id} className="bg-[#111111] border-0 rounded-none">
                  <HorizontalCarousel title={section.title === 'Acapellas' ? 'MCs' : section.title}>
                    {packs.map(pack => (
                      <div key={pack.id} className="min-w-[180px] max-w-[180px] md:min-w-[240px] md:max-w-[240px] shrink-0 snap-start">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </HorizontalCarousel>
                </div>
              )
            ))}

            {hasCategories ? (
              categories
                .filter(category => !['efeitos', 'lançamentos', 'presets essenciais'].includes(category.name.trim().toLocaleLowerCase('pt-BR')))
                .map(category => (
                  <div key={category.id} className="pt-1">
                    <HorizontalCarousel title={category.name}>
                      {premiumPacks.slice(0, 8).map(pack => (
                        <div key={pack.id} className="min-w-[180px] max-w-[180px] md:min-w-[240px] md:max-w-[240px] shrink-0 snap-start">
                          <PackCardV2 pack={pack} />
                        </div>
                      ))}
                    </HorizontalCarousel>
                  </div>
                ))
            ) : (
              <>
                {premiumPacks.length > 0 && (
                  <HorizontalCarousel title="Paid & Exclusive">
                    {premiumPacks.map(pack => (
                      <div key={pack.id} className="min-w-[180px] max-w-[180px] md:min-w-[240px] md:max-w-[240px] shrink-0 snap-start">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </HorizontalCarousel>
                )}

                {projectPacks.length > 0 && (
                  <HorizontalCarousel title="Projects & FLPs">
                    {projectPacks.map(pack => (
                      <div key={pack.id} className="min-w-[180px] max-w-[180px] md:min-w-[240px] md:max-w-[240px] shrink-0 snap-start">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </HorizontalCarousel>
                )}
              </>
            )}

            {acapellas.length > 0 && (
              <div className="flex justify-center">
                <div className="w-full max-w-3xl">
                  <HorizontalCarousel title="Acapellas" centered>
                {acapellas.slice(0, 8).map(acapella => (
                  <div key={acapella.id} className="min-w-[150px] max-w-[150px] md:min-w-[180px] md:max-w-[180px] shrink-0 snap-start">
                    <AudioPlayer
                      artistName={acapella.artist_name}
                      imageUrl={acapella.image_url}
                      audioUrl={acapella.audio_url}
                      downloadUrl={acapella.download_url}
                      duration={acapella.duration_seconds ?? undefined}
                      onSelect={() => { setSelectedAcapella(acapella); setPollChoice(''); setPollText(''); }}
                    />
                  </div>
                ))}
                  </HorizontalCarousel>
                </div>
              </div>
            )}
          </div>
        )}

      </div>


      {selectedAcapella && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" onClick={() => setSelectedAcapella(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#151515] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative p-5 pb-3">
              <button type="button" onClick={() => setSelectedAcapella(null)} className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70 hover:bg-white/15">Close</button>
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-2xl border border-white/10 bg-[#1B1B1B]">
                {selectedAcapella.image_url ? <img src={selectedAcapella.image_url} alt={selectedAcapella.artist_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Mic className="h-9 w-9 text-white/25" /></div>}
              </div>
              <h2 className="mt-4 text-center text-xl font-bold">{selectedAcapella.artist_name}</h2>
            </div>
            <div className="space-y-3 px-5 pb-5">
              <p className="text-base font-semibold">Com que a voz da {selectedAcapella.artist_name} combina?</p>
              <div className="grid grid-cols-2 gap-2">
                {['ZN', 'ZS', 'Automotivo', 'BH', 'Capixaba', 'Nenhum desses'].map(option => (
                  <button key={option} type="button" onClick={() => setPollChoice(option)} className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${pollChoice === option ? 'border-white/30 bg-white/15 text-white' : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07]'}`}>{option}</button>
                ))}
              </div>
              <textarea value={pollText} onChange={event => setPollText(event.target.value)} placeholder="Fala aqui..." rows={3} className="w-full resize-none rounded-2xl border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/20" />
              <button type="button" disabled={!pollChoice && !pollText.trim()} onClick={() => setSelectedAcapella(null)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-30">Avançar <ArrowRight className="h-4 w-4" /></button>
              <p className="text-center text-[11px] text-white/35">A votação permanece aberta.</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <SideMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

    </div>
  );
};

export default Packs;
