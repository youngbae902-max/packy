import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Settings, Instagram, MoreVertical, Search,
  Flame, Sparkles, Download, ChevronRight, Users, Play, Star, TrendingUp
} from 'lucide-react';
import { Header } from '@/components/Header';
import { PackCardV2 } from '@/components/PackCardV2';
import { SupportCard } from '@/components/SupportCard';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { HorizontalCarousel } from '@/components/HorizontalCarousel';
import { useHomeSectionsWithPacks } from '@/hooks/useHomeSections';
import { ListMusic } from 'lucide-react';
import { PackImagePlaceholder } from '@/components/PackImagePlaceholder';
import { useSupabasePacks, type Pack } from '@/hooks/useSupabasePacks';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const packTypeLabel: Record<string, string> = {
  samples: 'Sample Pack', drumkit: 'Drum Kit', loops: 'Loops',
  presets: 'Presets', project: 'Projeto', other: 'Outros',
};

function CardShell({ pack }: { pack: Pack }) {
  return (
    <div className="snap-start shrink-0 w-[260px] sm:w-[280px] md:w-[300px]">
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
        <p className="text-sm md:text-base text-foreground/70 line-clamp-2 max-w-xl">
          Por @{pack.is_anonymous ? 'Anônimo' : (pack.author_name || 'Desconhecido')} · Pack em destaque da plataforma
        </p>
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

function SectionTitle({ icon: Icon, title, badge }: { icon: any; title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-foreground/80" />
        <h2 className="text-xl md:text-2xl font-black tracking-tight">{title}</h2>
        {badge && (
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest bg-foreground/10 text-foreground/80 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
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

function TopCreatorsRow({ packs }: { packs: Pack[] }) {
  const creators = useMemo(() => {
    const map = new Map<string, { user_id: string; name: string; count: number; likes: number }>();
    for (const p of packs) {
      if (!p.user_id || p.is_anonymous) continue;
      const key = p.user_id;
      const cur = map.get(key) || { user_id: key, name: p.author_name || 'Criador', count: 0, likes: 0 };
      cur.count += 1;
      cur.likes += p.likes_count || 0;
      map.set(key, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count || b.likes - a.likes).slice(0, 10);
  }, [packs]);

  const ids = creators.map(c => c.user_id);
  const { data: profiles = [] } = useQuery({
    queryKey: ['top-creators-profiles', ids.join(',')],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data } = await supabase.from('profiles').select('id,username,artist_name,avatar_url').in('id', ids);
      return data || [];
    },
    enabled: ids.length > 0,
  });

  if (!creators.length) return null;

  return (
    <section className="mb-12">
      <SectionTitle icon={Users} title="Top Creators" />
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-2" style={{ scrollbarWidth: 'none' }}>
        {creators.map((c) => {
          const prof = profiles.find((p: any) => p.id === c.user_id);
          const displayName = prof?.artist_name || prof?.username || c.name;
          return (
            <Link
              to={`/perfil/${c.user_id}`}
              key={c.user_id}
              className="snap-start shrink-0 w-[160px] rounded-2xl bg-[#141414] border border-white/5 p-4 hover:bg-[#1B1B1B] hover:scale-[1.02] transition-all duration-200"
            >
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarImage src={prof?.avatar_url || undefined} />
                <AvatarFallback className="bg-[#1B1B1B]"><Users className="w-6 h-6" /></AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="text-sm font-bold truncate">@{displayName}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{c.count} packs</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-foreground/70">Ver perfil</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CreatorSpotlight({ packs }: { packs: Pack[] }) {
  const top = useMemo(() => {
    const map = new Map<string, { user_id: string; name: string; count: number; likes: number; sample?: Pack }>();
    for (const p of packs) {
      if (!p.user_id || p.is_anonymous) continue;
      const cur = map.get(p.user_id) || { user_id: p.user_id, name: p.author_name || 'Criador', count: 0, likes: 0, sample: p };
      cur.count += 1;
      cur.likes += p.likes_count || 0;
      if (!cur.sample?.cover_url && p.cover_url) cur.sample = p;
      map.set(p.user_id, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.likes - a.likes || b.count - a.count)[0];
  }, [packs]);

  const { data: prof } = useQuery({
    queryKey: ['spotlight-profile', top?.user_id],
    queryFn: async () => {
      if (!top?.user_id) return null;
      const { data } = await supabase.from('profiles').select('id,username,artist_name,avatar_url,bio').eq('id', top.user_id).maybeSingle();
      return data;
    },
    enabled: !!top?.user_id,
  });

  if (!top) return null;

  return (
    <section className="mb-12 px-2">
      <SectionTitle icon={Star} title="Destaque de Creator" />
      <Link
        to={`/perfil/${top.user_id}`}
        className="relative flex items-center gap-4 md:gap-6 rounded-3xl overflow-hidden border border-white/5 bg-[#141414] p-5 md:p-8 hover:bg-[#181818] transition-all group"
      >
        {top.sample?.cover_url && (
          <div className="absolute inset-0 opacity-30">
            <img src={top.sample.cover_url} alt="" className="w-full h-full object-cover blur-2xl scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
          </div>
        )}
        <Avatar className="relative w-20 h-20 md:w-28 md:h-28 ring-2 ring-white/10 shrink-0">
          <AvatarImage src={prof?.avatar_url || undefined} />
          <AvatarFallback className="bg-[#1B1B1B]"><Users className="w-8 h-8" /></AvatarFallback>
        </Avatar>
        <div className="relative min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1">Criador em destaque</div>
          <div className="text-lg md:text-2xl font-black truncate">@{prof?.artist_name || prof?.username || top.name}</div>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1 max-w-lg">
            {prof?.bio || `${top.count} packs publicados e ${top.likes} curtidas na comunidade.`}
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold rounded-full bg-white/10 px-3 py-1.5 group-hover:bg-white/15 transition">
            Conhecer <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </section>
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
            <li><span className="text-foreground/40">Suporte</span></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Social</div>
          <ul className="space-y-2 text-foreground/80">
            <li><a href="https://www.instagram.com/mathewdcarmo" target="_blank" rel="noreferrer" className="hover:text-foreground">Instagram</a></li>
            <li><span className="text-foreground/40">Discord</span></li>
            <li><span className="text-foreground/40">YouTube</span></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/5 text-[11px] text-foreground/50 space-y-2">
        <p className="leading-relaxed">
          Copyright © {new Date().getFullYear()} PACKY — Todos os direitos reservados.
          Feito por editores, para editores. Sample packs, presets, drum kits, projetos e acapellas
          compartilhados por criadores da comunidade. Nenhum arquivo é hospedado diretamente pela plataforma —
          todos os links são de terceiros e a responsabilidade pelos conteúdos é dos respectivos criadores.
        </p>
        <div className="flex flex-wrap gap-3 justify-between pt-2">
          <span>© {new Date().getFullYear()} PACKY · packy.lovable.app</span>
          <span>Termos · Política de Privacidade · Direitos Autorais</span>
        </div>
      </div>
    </footer>
  );
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { approvedPacks, premiumPacks, isLoading, addPack } = useSupabasePacks();
  const { activeEvents } = useSiteEvents();
  const { isAdmin } = useAuth();
  const { data: customSections = [] } = useHomeSectionsWithPacks();

  const allPacks = useMemo(() => {
    return [...approvedPacks, ...premiumPacks].filter(p => p.pack_type !== 'project');
  }, [approvedPacks, premiumPacks]);

  // Search overlay: when searching, replace sections with a filtered grid
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const q = searchTerm.toLowerCase();
    return allPacks.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.author_name || '').toLowerCase().includes(q)
    );
  }, [searchTerm, allPacks]);

  const hero = useMemo(() => {
    return allPacks.find(p => p.is_pinned && p.cover_url) || allPacks.find(p => p.cover_url) || allPacks[0];
  }, [allPacks]);

  const releases = useMemo(() => allPacks.slice(0, 12), [allPacks]);
  const trending = useMemo(
    () => [...allPacks].sort((a: any, b: any) => (b.trending_score ?? 0) - (a.trending_score ?? 0)).slice(0, 12),
    [allPacks]
  );
  const beloved = useMemo(
    () => [...allPacks].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 12),
    [allPacks]
  );
  const monthHot = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return [...allPacks]
      .filter(p => new Date(p.created_at).getTime() > cutoff)
      .sort((a: any, b: any) => (b.trending_score ?? 0) - (a.trending_score ?? 0))
      .slice(0, 12);
  }, [allPacks]);
  const presets = useMemo(() => allPacks.filter(p => p.pack_type === 'presets').slice(0, 12), [allPacks]);
  const projectsPremium = useMemo(() => premiumPacks.slice(0, 12), [premiumPacks]);
  const samples = useMemo(() => allPacks.filter(p => p.pack_type === 'samples').slice(0, 12), [allPacks]);
  const drumkits = useMemo(() => allPacks.filter(p => p.pack_type === 'drumkit').slice(0, 12), [allPacks]);

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

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <Input
            placeholder="Buscar packs, criadores, categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 rounded-2xl bg-[#141414] border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-foreground/50">Carregando...</div>
        ) : searchResults ? (
          <div className="mb-10">
            <SectionTitle icon={Search} title={`Resultados (${searchResults.length})`} />
            {searchResults.length === 0 ? (
              <p className="text-center py-12 text-foreground/50">Nada encontrado para "{searchTerm}".</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-2">
                {searchResults.map(p => <PackCardV2 key={p.id} pack={p} />)}
              </div>
            )}
          </div>
        ) : (
          <>
            <HeroBanner pack={hero} />

            <div className="mb-10"><SupportCard /></div>

            {releases.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={Sparkles} title="Lançamentos" />
                <Carousel>{releases.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
            )}

            {trending.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={Flame} title="Em Alta" badge="🔥" />
                <Carousel>{trending.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
            )}

            {beloved.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={Star} title="Queridinhos" />
                <Carousel>{beloved.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
            )}

            <TopCreatorsRow packs={allPacks} />

            {monthHot.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={TrendingUp} title="Bombando no Mês" badge="Trending" />
                <Carousel>{monthHot.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
            )}

            <CreatorSpotlight packs={allPacks} />

            {presets.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={Play} title="Presets Essenciais" />
                <Carousel>{presets.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
            )}

            {projectsPremium.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={Sparkles} title="Projetos Premium" />
                <Carousel>{projectsPremium.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
            )}

            {customSections.map(({ section, packs }) => (
              packs.length > 0 && (
                <section key={section.id} className="mb-12">
                  <SectionTitle icon={ListMusic} title={section.title} />
                  <Carousel>{packs.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
                </section>
              )
            ))}

            {samples.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={Play} title="Sample Packs" />
                <Carousel>{samples.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
            )}

            {drumkits.length > 0 && (
              <section className="mb-12">
                <SectionTitle icon={Play} title="Drum Kits" />
                <Carousel>{drumkits.map(p => <CardShell key={p.id} pack={p} />)}</Carousel>
              </section>
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
