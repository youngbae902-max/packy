import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Settings, Instagram, MoreVertical, Search,
  Download, ChevronRight, Sparkles, ChevronsUpDown,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { PackCardV2 } from '@/components/PackCardV2';
import { SupportCard } from '@/components/SupportCard';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { PackImagePlaceholder } from '@/components/PackImagePlaceholder';
import { useSupabasePacks, type Pack } from '@/hooks/useSupabasePacks';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useHomeSections } from '@/hooks/useHomeSections';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const packTypeLabel: Record<string, string> = {
  samples: 'Sample Pack', drumkit: 'Drum Kit', loops: 'Loops',
  presets: 'Presets', project: 'Projeto', other: 'Outros',
};

const SEARCH_FILTERS = [
  { id: 'all', label: 'Tudo' },
  { id: 'samples', label: 'Samples' },
  { id: 'presets', label: 'Presets' },
  { id: 'drumkit', label: 'Drum Kits' },
  { id: 'loops', label: 'Loops' },
  { id: 'project', label: 'Projetos' },
  { id: 'other', label: 'Outros' },
] as const;
type SearchFilter = typeof SEARCH_FILTERS[number]['id'];

function CardShell({ pack }: { pack: Pack }) {
  return (
    <div className="snap-start shrink-0 w-[250px] sm:w-[280px] md:w-[300px]">
      <PackCardV2 pack={pack} />
    </div>
  );
}

function HeroBanner({ pack }: { pack: Pack | undefined }) {
  if (!pack) return null;
  return (
    <section className="relative w-full rounded-3xl overflow-hidden border border-white/5 bg-[hsl(0,0%,8%)] mb-10 aspect-[16/9] md:aspect-[21/9]">
      {pack.cover_url ? (
        <img src={pack.cover_url} alt={pack.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0"><PackImagePlaceholder /></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-10 gap-3 max-w-3xl">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground/70">
          <Sparkles className="w-3.5 h-3.5" /> Destaque · {packTypeLabel[pack.pack_type] || pack.pack_type}
        </div>
        <h1 className="text-2xl md:text-5xl font-black tracking-tight text-foreground leading-none">
          {pack.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <a
            href={pack.download_url}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background font-bold px-5 py-2.5 text-sm hover:opacity-90 transition"
          >
            <Download className="w-4 h-4" /> Baixar Agora
          </a>
          {pack.user_id && !pack.is_anonymous && (
            <Link
              to={`/perfil/${pack.user_id}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-foreground font-semibold px-5 py-2.5 text-sm hover:bg-white/15 transition"
            >
              Ver Coleção <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-4 px-2">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
    </div>
  );
}

function Carousel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 snap-x px-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {children}
    </div>
  );
}

/** WAVS-style search bar with left-side category selector */
function SearchBar({
  filter, setFilter, value, setValue,
}: {
  filter: SearchFilter;
  setFilter: (f: SearchFilter) => void;
  value: string;
  setValue: (v: string) => void;
}) {
  const current = SEARCH_FILTERS.find(f => f.id === filter)!;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0 h-14 rounded-full border border-white/10 bg-[hsl(0,0%,6%)] pl-1 pr-5 overflow-hidden focus-within:border-white/25 transition-colors">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 pl-5 pr-4 h-full text-[15px] font-medium text-foreground/90 hover:text-foreground"
            >
              {current.label}
              <ChevronsUpDown className="w-3.5 h-3.5 text-foreground/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-[#141414] border-white/10">
            {SEARCH_FILTERS.map(f => (
              <DropdownMenuItem key={f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

        <Search className="w-4 h-4 text-foreground/60 ml-3 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Buscar ${current.label.toLowerCase()}`}
          className="flex-1 h-full bg-transparent border-0 outline-none px-3 text-[15px] text-foreground placeholder:text-foreground/50"
        />
      </div>
    </div>
  );
}

function FooterNav() {
  return (
    <footer className="border-t border-white/5 mt-16 pt-10 pb-24 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Explorar</div>
          <ul className="space-y-2 text-foreground/80">
            <li><Link to="/" className="hover:text-foreground">Início</Link></li>
            <li><Link to="/packs" className="hover:text-foreground">Packs</Link></li>
            <li><Link to="/projetos" className="hover:text-foreground">Projetos</Link></li>
            <li><Link to="/mcs" className="hover:text-foreground">Creators</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Conta</div>
          <ul className="space-y-2 text-foreground/80">
            <li><Link to="/conta" className="hover:text-foreground">Perfil</Link></li>
            <li><Link to="/wishlist" className="hover:text-foreground">Favoritos</Link></li>
            <li><Link to="/carteira" className="hover:text-foreground">Carteira</Link></li>
            <li><Link to="/up" className="hover:text-foreground">Biblioteca</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Ajuda</div>
          <ul className="space-y-2 text-foreground/80">
            <li><Link to="/inbox" className="hover:text-foreground">Inbox</Link></li>
            <li><span className="text-foreground/40">FAQ</span></li>
            <li><span className="text-foreground/40">Contato</span></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Social</div>
          <ul className="space-y-2 text-foreground/80">
            <li><a href="https://www.instagram.com/mathewdcarmo" target="_blank" rel="noreferrer" className="hover:text-foreground">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/5 text-[11px] text-foreground/40 flex flex-wrap gap-4 justify-between">
        <span>© {new Date().getFullYear()} PACKY — Feito por editores, para editores.</span>
        <span>Termos · Política de Privacidade</span>
      </div>
    </footer>
  );
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

  const { approvedPacks, premiumPacks, isLoading, addPack } = useSupabasePacks();
  const { activeEvents } = useSiteEvents();
  const { sections, sectionPacks } = useHomeSections();
  const { isAdmin } = useAuth();

  const allPacks = useMemo(
    () => [...approvedPacks, ...premiumPacks],
    [approvedPacks, premiumPacks]
  );
  const packMap = useMemo(() => new Map(allPacks.map(p => [p.id, p])), [allPacks]);

  // Search overlay
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term && searchFilter === 'all') return null;
    let pool = allPacks;
    if (searchFilter !== 'all') pool = pool.filter(p => p.pack_type === searchFilter);
    if (!term) return pool;
    return pool.filter(p =>
      p.title.toLowerCase().includes(term) ||
      (p.author_name || '').toLowerCase().includes(term)
    );
  }, [searchTerm, searchFilter, allPacks]);

  const hero = useMemo(
    () => allPacks.find(p => p.is_pinned && p.cover_url) || allPacks.find(p => p.cover_url) || allPacks[0],
    [allPacks]
  );

  // Admin-managed sections, if any
  const activeSections = useMemo(
    () => sections.filter(s => s.is_active).sort((a, b) => a.display_order - b.display_order),
    [sections]
  );

  const packsForSection = (sectionId: string): Pack[] => {
    return sectionPacks
      .filter(sp => sp.section_id === sectionId)
      .sort((a, b) => a.display_order - b.display_order)
      .map(sp => packMap.get(sp.pack_id))
      .filter((p): p is Pack => !!p);
  };

  // Fallback default sections when admin hasn't configured any
  const fallbackReleases = useMemo(
    () => allPacks.filter(p => p.pack_type !== 'project').slice(0, 12),
    [allPacks]
  );
  const fallbackProjects = useMemo(
    () => allPacks.filter(p => p.pack_type === 'project').slice(0, 12),
    [allPacks]
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-20">
      <div className="max-w-6xl mx-auto px-3 md:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-4 mb-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60">Explorar</div>
          <div className="flex gap-1 items-center">
            <a
              href="https://www.instagram.com/mathewdcarmo"
              target="_blank" rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full hover:bg-white/5 transition-colors text-pink-500"
            >
              <Instagram className="w-5 h-5" />
            </a>
            {isAdmin && (
              <Link to="/admin" aria-label="Admin" className="p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/70 hover:text-foreground">
                <Settings className="w-5 h-5" />
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Mais" className="p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/70 hover:text-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#141414] border-white/10">
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
            {activeEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}

        <SearchBar
          filter={searchFilter}
          setFilter={setSearchFilter}
          value={searchTerm}
          setValue={setSearchTerm}
        />

        {isLoading ? (
          <div className="text-center py-20 text-foreground/50">Carregando...</div>
        ) : searchResults ? (
          <div className="mb-10">
            <SectionTitle title={`Resultados (${searchResults.length})`} />
            {searchResults.length === 0 ? (
              <p className="text-center py-12 text-foreground/50">Nada encontrado.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-2">
                {searchResults.map(p => <PackCardV2 key={p.id} pack={p} />)}
              </div>
            )}
          </div>
        ) : (
          <>
            <HeroBanner pack={hero} />

            <div className="mb-10"><SupportCard /></div>

            {activeSections.length > 0 ? (
              activeSections.map(section => {
                const packs = packsForSection(section.id);
                if (packs.length === 0) return null;
                return (
                  <section key={section.id} className="mb-12">
                    <SectionTitle title={section.title} />
                    <Carousel>{packs.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
                  </section>
                );
              })
            ) : (
              <>
                {fallbackReleases.length > 0 && (
                  <section className="mb-12">
                    <SectionTitle title="Lançamentos" />
                    <Carousel>{fallbackReleases.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
                  </section>
                )}
                {fallbackProjects.length > 0 && (
                  <section className="mb-12">
                    <SectionTitle title="Projetos" />
                    <Carousel>{fallbackProjects.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
                  </section>
                )}
              </>
            )}

            {allPacks.length === 0 && (
              <div className="text-center py-20">
                <p className="text-foreground/60">Nenhum pack aprovado ainda.</p>
                <p className="text-sm text-foreground/40 mt-2">Envie seu pack e aguarde a aprovação!</p>
              </div>
            )}
          </>
        )}
      </div>

      <FooterNav />

      <AddPackModalV2 isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addPack} />
      <BottomNav />
    </div>
  );
};

export default Index;
