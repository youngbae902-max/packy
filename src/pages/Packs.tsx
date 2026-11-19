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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
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

  const q = searchQuery.toLowerCase().trim();

  // Open popup whenever the user types
  useEffect(() => {
    setPopupOpen(q.length > 0);
  }, [q]);

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
    if (!q) return [];
    return [...approvedPacks, ...premiumPacks, ...projectPacks].filter(p => 
      p.title.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q)
    );
  }, [q, approvedPacks, premiumPacks, projectPacks]);

  const searchedMCs = useMemo(() => {
    if (!q) return [];
    return acapellas.filter(mc => mc.artist_name.toLowerCase().includes(q));
  }, [q, acapellas]);

  const allPacks = useMemo(() => {
    const seen = new Set<string>();
    return [...approvedPacks, ...premiumPacks, ...projectPacks].filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [approvedPacks, premiumPacks, projectPacks]);

  const categoryFilters = useMemo(() => {
    const labels: Record<string, string> = { samples: 'Samples', drumkit: 'Drumkits', loops: 'Loops', presets: 'Presets', project: 'Projetos', other: 'Outros' };
    return [...new Set(allPacks.map(pack => pack.pack_type).filter(Boolean))]
      .map(type => ({ value: type, label: labels[type] || type }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }, [allPacks]);

  const categoryPacks = useMemo(() => allPacks.filter(pack => pack.pack_type === categoryFilter), [allPacks, categoryFilter]);
  const latestPacks = useMemo(() => [...allPacks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [allPacks]);

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
            onFocus={() => q.length > 0 && setPopupOpen(true)}
            className="w-full bg-[#111111] border border-white/[0.05] rounded-xl pl-12 pr-10 py-3 text-sm text-[#F5F5F5] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-1 focus:ring-white/[0.08] focus:border-white/[0.10] transition-all shadow-none"
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
            <div className="absolute top-full left-0 right-0 mt-2 z-[80] rounded-2xl border border-white/[0.06] bg-[#111111]/98 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.35)] p-3 animate-fade-in max-h-96 overflow-y-auto">
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2 font-bold">Packs & Projetos</p>
                  <div className="space-y-2">
                    {searchedPacks.slice(0, 5).map(pack => (
                      <div key={pack.id} className="transform scale-95 origin-left">
                        <PackCardV2 pack={pack} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : q.length > 0 && searchedProfiles.length === 0 && searchedMCs.length === 0 ? (
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
        {q.length === 0 && (
          <>
            <nav className="mb-5 flex items-center gap-6 overflow-x-auto border-b border-border/40 pb-3" aria-label="Navegação principal">
              {[
                ['inicio', 'Início'],
                ['geral', 'Todos os packs'],
                ['pagos', 'Premium'],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab as 'inicio' | 'geral' | 'pagos'); setCategoryFilter(null); }}
                  className={`relative shrink-0 pb-1 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab && !categoryFilter ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                  {activeTab === tab && !categoryFilter && <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] rounded-full bg-foreground" />}
                </button>
              ))}
            </nav>
            {activeTab === 'inicio' && (
              <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Categorias">
                <button onClick={() => setCategoryFilter(null)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${!categoryFilter ? 'border-foreground/30 bg-foreground text-background' : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>Todas</button>
                {categoryFilters.map(category => (
                  <button key={category.value} onClick={() => { setCategoryFilter(category.value); setActiveTab('inicio'); }} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${categoryFilter === category.value ? 'border-foreground/30 bg-foreground text-background' : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>
                    {category.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 py-16">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[0.9] rounded-2xl bg-white/[0.04] animate-pulse" />)}</div>
        ) : q.length > 0 ? (
          <div>
            <h2 className="text-lg md:text-2xl font-display font-bold mb-4 px-1">Resultados para "{searchQuery}" <span className="text-muted-foreground font-bold">({searchedPacks.length})</span></h2>
            {searchedMCs.length > 0 && <div className="mb-7"><p className="text-xs uppercase text-muted-foreground font-bold mb-3">Acapellas</p><div className="space-y-2">{searchedMCs.map(mc => <a key={mc.id} href={mc.download_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">{mc.image_url ? <img src={mc.image_url} alt="" className="w-16 h-16 rounded-full object-cover" /> : <span className="w-16 h-16 rounded-full bg-muted flex items-center justify-center"><Mic className="size-6" /></span>}<span className="font-display font-bold">{mc.artist_name}</span></a>)}</div></div>}
            {searchedPacks.length === 0 && searchedMCs.length === 0 ? <p className="text-center py-16 text-muted-foreground">Nenhum produto encontrado.</p> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">{searchedPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}</div>}
          </div>
        ) : categoryFilter && activeTab === 'inicio' ? (
          <section>
            <div className="mb-5 px-1"><p className="text-xs font-semibold text-muted-foreground mb-1">Categoria</p><h2 className="text-xl md:text-2xl font-normal tracking-tight">{categoryFilters.find(category => category.value === categoryFilter)?.label || categoryFilter}</h2><p className="text-sm text-muted-foreground mt-1">{categoryPacks.length} produtos disponíveis</p></div>
            {categoryPacks.length === 0 ? <p className="text-center py-16 text-muted-foreground">Nenhum pack nesta categoria.</p> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">{categoryPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}</div>}
          </section>
        ) : activeTab === 'pagos' ? (
          <section>
            <div className="mb-5 px-1"><p className="text-xs font-semibold text-muted-foreground mb-1">Seleção premium</p><h2 className="text-xl md:text-2xl font-normal tracking-tight">Packs premium</h2><p className="text-sm text-muted-foreground mt-1">{premiumPacks.length} produtos disponíveis</p></div>
            {premiumPacks.length === 0 ? <p className="text-center py-16 text-muted-foreground">Nenhum pack premium disponível ainda.</p> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">{premiumPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} hidePremiumBadge />)}</div>}
          </section>
        ) : activeTab === 'geral' ? (
          <section>
            <div className="mb-5 px-1"><p className="text-xs font-semibold text-muted-foreground mb-1">Catálogo completo</p><h2 className="text-xl md:text-2xl font-normal tracking-tight">Todos os packs</h2><p className="text-sm text-muted-foreground mt-1">{allPacks.length} produtos disponíveis</p></div>
            {allPacks.length === 0 ? <p className="text-center py-16 text-muted-foreground">Nenhum pack disponível ainda.</p> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">{allPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}</div>}
          </section>
        ) : (
          <div className="space-y-9 md:space-y-12">
            <section>
              <div className="mb-4 px-1"><h2 className="text-lg md:text-xl font-semibold tracking-tight">Em destaque</h2><p className="text-sm text-muted-foreground mt-1">Seleções e novidades do marketplace.</p></div>
              <div className="overflow-hidden rounded-[18px] bg-transparent"><HomeBannerCarousel /></div>
            </section>

            {categoryFilters.length > 0 && (
              <section>
                <div className="mb-4 px-1"><h2 className="text-lg md:text-xl font-semibold tracking-tight">Explore por categoria</h2></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {categoryFilters.map(category => (
                    <button key={category.value} onClick={() => setCategoryFilter(category.value)} className="flex min-h-16 items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-4 py-3 text-left text-sm font-medium text-foreground/85 transition hover:bg-card">
                      <span>{category.label}</span><span className="text-xs text-muted-foreground">{allPacks.filter(pack => pack.pack_type === category.value).length}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {releasePacks.length > 0 && (
              <section>
                <div className="mb-4 px-1 flex items-end justify-between gap-3"><div><h2 className="text-lg md:text-xl font-semibold tracking-tight">{releases.title || 'Destaques da loja'}</h2><p className="text-sm text-muted-foreground mt-1">Packs selecionados para seus próximos projetos.</p></div><button onClick={() => setActiveTab('geral')} className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors">Ver tudo</button></div>
                <HorizontalCarousel title="">{releasePacks.map(pack => <div key={pack.id} className="min-w-[160px] max-w-[160px] md:min-w-[210px] md:max-w-[210px] shrink-0 snap-start"><PackCardV2 pack={pack} /></div>)}</HorizontalCarousel>
              </section>
            )}

            {premiumPacks.length > 0 && (
              <section>
                <div className="mb-4 px-1 flex items-end justify-between gap-3"><div><h2 className="text-lg md:text-xl font-semibold tracking-tight">Packs premium</h2><p className="text-sm text-muted-foreground mt-1">Conteúdos exclusivos da comunidade.</p></div><button onClick={() => setActiveTab('pagos')} className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors">Ver tudo</button></div>
                <HorizontalCarousel title="">{premiumPacks.slice(0, 10).map(pack => <div key={pack.id} className="min-w-[160px] max-w-[160px] md:min-w-[210px] md:max-w-[210px] shrink-0 snap-start"><PackCardV2 pack={pack} hidePremiumBadge /></div>)}</HorizontalCarousel>
              </section>
            )}

            {projectPacks.length > 0 && <section><HorizontalCarousel title="Projetos e FLPs">{projectPacks.map(pack => <div key={pack.id} className="min-w-[160px] max-w-[160px] md:min-w-[210px] md:max-w-[210px] shrink-0 snap-start"><PackCardV2 pack={pack} /></div>)}</HorizontalCarousel></section>}

            {customSections.filter(({ packs: sectionPacks }) => sectionPacks.length > 0).map(({ section, packs: sectionPacks }) => <section key={section.id}><HorizontalCarousel title={section.title === 'Acapellas' ? 'Acapellas' : section.title}>{sectionPacks.map(pack => <div key={pack.id} className="min-w-[160px] max-w-[160px] md:min-w-[210px] md:max-w-[210px] shrink-0 snap-start"><PackCardV2 pack={pack} /></div>)}</HorizontalCarousel></section>)}

            {acapellas.length > 0 && <section><HorizontalCarousel title="Acapellas">{acapellas.slice(0, 8).map(acapella => <div key={acapella.id} className="min-w-[150px] max-w-[150px] md:min-w-[180px] md:max-w-[180px] shrink-0 snap-start"><AudioPlayer artistName={acapella.artist_name} imageUrl={acapella.image_url} audioUrl={acapella.audio_url} downloadUrl={acapella.download_url} duration={acapella.duration_seconds ?? undefined} onSelect={() => { setSelectedAcapella(acapella); setPollChoice(''); setPollText(''); }} /></div>)}</HorizontalCarousel></section>}

            {latestPacks.length > 0 && (
              <section>
                <div className="mb-4 px-1"><h2 className="text-lg md:text-xl font-semibold tracking-tight">Novidades</h2><p className="text-sm text-muted-foreground mt-1">Os produtos mais recentes da comunidade.</p></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">{latestPacks.slice(0, 10).map(pack => <PackCardV2 key={pack.id} pack={pack} />)}</div>
              </section>
            )}

            {allPacks.length > 0 && (
              <section>
                <div className="mb-4 px-1 flex items-end justify-between gap-3"><div><h2 className="text-lg md:text-xl font-semibold tracking-tight">Explorar catálogo</h2><p className="text-sm text-muted-foreground mt-1">{allPacks.length} produtos disponíveis</p></div><button onClick={() => setActiveTab('geral')} className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors">Ver tudo</button></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">{allPacks.slice(0, 10).map(pack => <PackCardV2 key={pack.id} pack={pack} />)}</div>
              </section>
            )}
          </div>
        )}
      </div>


      {selectedAcapella && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" onClick={() => setSelectedAcapella(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#151515] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative p-5 pb-3">
              <button type="button" onClick={() => setSelectedAcapella(null)} className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70 hover:bg-white/15">Fechar</button>
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
