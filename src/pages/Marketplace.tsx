import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Menu, X, ChevronDown, ChevronLeft, ChevronRight, Heart,
  Upload, LayoutGrid, Tag, Coins, Boxes, SlidersHorizontal, Download,
  Crown, BadgeCheck, Disc3, Wallet, Instagram, Youtube, Send, Music2,
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useSupabasePacks, Pack } from '@/hooks/useSupabasePacks';
import { useAlbums } from '@/hooks/useAlbums';
import { useAppLogo } from '@/hooks/useAppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { PackImagePlaceholder } from '@/components/PackImagePlaceholder';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { AuthModal } from '@/components/AuthModal';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const packTypeLabels: Record<string, string> = {
  samples: 'Samples', drumkit: 'Drumkit', loops: 'Loops',
  presets: 'Presets', project: 'Projetos', other: 'Outros',
};

const navItems: { label: string; to?: string; children?: { label: string; to: string }[] }[] = [
  { label: 'Início', to: '/' },
  {
    label: 'Explorar',
    children: [
      { label: 'Todos os packs', to: '/' },
      { label: 'Projetos', to: '/projetos' },
      { label: 'Acapellas', to: '/mcs' },
      { label: 'Álbuns', to: '/albuns' },
    ],
  },
  {
    label: 'Comunidade',
    children: [
      { label: 'Sites parceiros', to: '/sites' },
      { label: 'Lista de desejos', to: '/desejos' },
      { label: 'Caixa de entrada', to: '/inbox' },
    ],
  },
  {
    label: 'Conta',
    children: [
      { label: 'Meu perfil', to: '/conta' },
      { label: 'Carteira', to: '/carteira' },
    ],
  },
];

const steps = [
  { icon: Wallet, title: 'Crie sua conta', desc: 'Cadastre-se em segundos e personalize seu perfil de produtor.' },
  { icon: LayoutGrid, title: 'Monte sua coleção', desc: 'Organize packs, projetos e acapellas dentro de álbuns.' },
  { icon: Upload, title: 'Envie seus packs', desc: 'Suba capa, link e categoria — a equipe aprova rapidinho.' },
  { icon: Tag, title: 'Venda ou libere', desc: 'Defina um preço premium ou libere grátis com link de crédito.' },
];

interface CreatorRow {
  user_id: string;
  username: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  has_spotify_badge: boolean | null;
}

function useScroller() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) =>
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' });
  return { ref, scroll };
}

function SectionHead({ title, to }: { title: string; to?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <h2 className="text-xl md:text-3xl font-bold tracking-tight">{title}</h2>
      {to && (
        <Link
          to={to}
          className="text-[11px] font-semibold tracking-widest text-muted-foreground hover:text-foreground border-b border-border pb-0.5 transition-colors"
        >
          VER TUDO
        </Link>
      )}
    </div>
  );
}

function Cover({ pack, className = '' }: { pack?: Pack; className?: string }) {
  if (pack?.cover_url) {
    return (
      <img
        src={pack.cover_url}
        alt={pack.title}
        loading="lazy"
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
      />
    );
  }
  return <PackImagePlaceholder className={className} />;
}

const Marketplace = () => {
  const { user } = useAuth();
  const { logoUrl } = useAppLogo();
  const { approvedPacks, premiumPacks, addPack } = useSupabasePacks();
  const { approvedAlbums } = useAlbums();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [visible, setVisible] = useState(8);
  const [showAdd, setShowAdd] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const auctionScroller = useScroller();
  const sellerScroller = useScroller();

  const allPacks = useMemo(() => [...premiumPacks, ...approvedPacks], [premiumPacks, approvedPacks]);
  const auctions = useMemo(
    () => (premiumPacks.length ? [...premiumPacks, ...approvedPacks] : approvedPacks).slice(0, 10),
    [premiumPacks, approvedPacks],
  );

  const { data: creators = [] } = useQuery({
    queryKey: ['marketplace', 'creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, artist_name, avatar_url, has_spotify_badge')
        .limit(80);
      if (error) throw error;
      return data as CreatorRow[];
    },
  });

  const topSellers = useMemo(() => {
    const counts = new Map<string, number>();
    allPacks.forEach((p) => {
      if (p.user_id && !p.is_anonymous) counts.set(p.user_id, (counts.get(p.user_id) || 0) + 1);
    });
    return creators
      .map((c) => ({ ...c, count: counts.get(c.user_id) || 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [creators, allPacks]);

  const picks = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allPacks.filter((p) => {
      const matchQ = !q || p.title.toLowerCase().includes(q) || (p.author_name || '').toLowerCase().includes(q);
      const matchC = category === 'all' || p.pack_type === category;
      return matchQ && matchC;
    });
  }, [allPacks, query, category]);

  const heroPacks = allPacks.slice(0, 3);
  const handleUpload = () => (user ? setShowAdd(true) : setShowAuth(true));

  const authorOf = (p: Pack) => (p.is_anonymous ? 'Anônimo' : p.author_name || 'Desconhecido');
  const priceOf = (p: Pack) => (p.is_premium && p.price ? `R$ ${p.price.toFixed(2)}` : 'Grátis');

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
            {logoUrl ? <img src={logoUrl} alt="PACKY" className="h-7 w-auto" /> : <><Music2 className="w-5 h-5" /> PACKY</>}
          </Link>

          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                {item.to ? (
                  <Link to={item.to} className="flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                    className="flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
                {item.children && openMenu === item.label && (
                  <div className="absolute left-0 top-full w-52 rounded-xl border border-border bg-secondary p-1.5 shadow-2xl animate-fade-in">
                    {item.children.map((c) => (
                      <Link
                        key={c.label}
                        to={c.to}
                        className="block rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <button onClick={() => setSearchOpen((v) => !v)} aria-label="Pesquisar" className="p-2 rounded-full hover:bg-foreground/10 transition-colors">
              <Search className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={handleUpload}
              className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-[13px] font-bold hover:bg-accent transition-colors"
            >
              <Upload className="w-4 h-4" />
              Enviar pack
            </button>
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" className="lg:hidden p-2 rounded-full hover:bg-foreground/10">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border px-4 md:px-8 py-3 animate-fade-in">
            <div className="max-w-7xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar packs, criadores e categorias"
                className="w-full rounded-full bg-secondary border border-border pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/25"
              />
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="lg:hidden border-t border-border px-4 py-3 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.to ? (
                  <Link to={item.to} className="block px-2 py-2.5 text-sm font-semibold">{item.label}</Link>
                ) : (
                  <button
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-2 py-2.5 text-sm font-semibold"
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === item.label ? 'rotate-180' : ''}`} />
                  </button>
                )}
                {item.children && openMenu === item.label && (
                  <div className="pl-4 pb-2 space-y-1">
                    {item.children.map((c) => (
                      <Link key={c.label} to={c.to} className="block px-2 py-1.5 text-[13px] text-muted-foreground">{c.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button onClick={handleUpload} className="w-full mt-2 flex items-center justify-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5 text-sm font-bold">
              <Upload className="w-4 h-4" /> Enviar pack
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-[34px] md:text-[54px] font-bold leading-[1.05] tracking-tight">
              Descubra, baixe,
              <br />
              <span className="text-muted-foreground italic">venda packs raros</span>
              <br />
              da cena.
            </h1>
            <p className="mt-5 text-sm md:text-[15px] text-muted-foreground max-w-md leading-relaxed">
              Marketplace de samples, drumkits, loops, presets, projetos e acapellas da comunidade PACKY.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#picks" className="rounded-full border border-border bg-secondary px-7 py-3 text-sm font-bold hover:bg-accent transition-colors">
                Explorar
              </a>
              <button onClick={handleUpload} className="rounded-full bg-foreground text-background px-7 py-3 text-sm font-bold hover:opacity-90 transition-opacity">
                Enviar
              </button>
            </div>
            <div className="mt-9 flex gap-8">
              {[
                { label: 'Packs', value: allPacks.length },
                { label: 'Premium', value: premiumPacks.length },
                { label: 'Criadores', value: topSellers.length },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center items-center min-h-[300px] md:min-h-[420px]">
            <div className="absolute w-[300px] h-[300px] md:w-[420px] md:h-[420px] rounded-full border border-border" />
            <div className="absolute w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full border border-dashed border-border animate-[spin_40s_linear_infinite]" />
            <span className="absolute top-4 right-8 w-4 h-4 rounded-full bg-foreground/25 animate-pulse" />
            <span className="absolute bottom-10 left-4 w-6 h-6 rounded-full bg-foreground/10" />
            <span className="absolute top-1/2 -left-2 w-3 h-3 rounded-full bg-foreground/40" />
            <span className="absolute bottom-4 right-10 w-2.5 h-2.5 rounded-full bg-foreground/20" />

            <div className="relative w-[230px] md:w-[320px] group">
              <div className="rounded-3xl overflow-hidden border border-border bg-card aspect-square shadow-2xl">
                <Cover pack={heroPacks[0]} />
              </div>
              {heroPacks[1] && (
                <div className="absolute -left-10 md:-left-16 bottom-6 w-[100px] md:w-[130px] rounded-2xl overflow-hidden border border-border bg-card aspect-square shadow-xl rotate-[-6deg]">
                  <Cover pack={heroPacks[1]} />
                </div>
              )}
              {heroPacks[2] && (
                <div className="absolute -right-8 md:-right-14 -top-6 w-[90px] md:w-[120px] rounded-2xl overflow-hidden border border-border bg-card aspect-square shadow-xl rotate-[7deg]">
                  <Cover pack={heroPacks[2]} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* EM DESTAQUE (Live Auctions) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead title="Em destaque" to="/" />
        <div ref={auctionScroller.ref} className="flex gap-4 overflow-x-auto snap-x snap-mandatory nft-no-scrollbar pb-2">
          {auctions.map((p) => (
            <article
              key={p.id}
              className="group snap-start shrink-0 w-[260px] md:w-[290px] rounded-2xl border border-border bg-card p-3 hover:border-foreground/25 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative rounded-xl overflow-hidden aspect-square">
                <Cover pack={p} />
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-1 text-[11px] font-bold">
                  <Heart className="w-3 h-3" /> {p.likes_count ?? 0}
                </span>
                <a
                  href={p.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-x-0 bottom-9 mx-auto w-fit rounded-full bg-foreground text-background px-4 py-1.5 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Baixar
                </a>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[11px] font-bold tracking-wider">
                  {(packTypeLabels[p.pack_type] || 'Pack').toUpperCase()}
                </span>
              </div>
              <h3 className="mt-3 text-[14px] font-bold truncate">{p.title}</h3>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-7 h-7 border border-border">
                    <AvatarFallback className="bg-secondary text-[10px]">{authorOf(p).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">Criador</p>
                    <p className="text-[12px] font-semibold truncate">{authorOf(p)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">Preço</p>
                  <p className="text-[12px] font-bold">{priceOf(p)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => auctionScroller.scroll(-1)} aria-label="Anterior" className="p-2 rounded-full border border-border hover:bg-foreground/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => auctionScroller.scroll(1)} aria-label="Próximo" className="p-2 rounded-full border border-border hover:bg-foreground/10 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* TOP CRIADORES */}
      {topSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">Top criadores</h2>
            <div className="flex gap-2">
              <button onClick={() => sellerScroller.scroll(-1)} aria-label="Anterior" className="p-2 rounded-full border border-border hover:bg-foreground/10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => sellerScroller.scroll(1)} aria-label="Próximo" className="p-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div ref={sellerScroller.ref} className="flex gap-6 overflow-x-auto nft-no-scrollbar pb-2">
            {topSellers.map((s) => (
              <Link key={s.user_id} to={`/perfil/${s.user_id}`} className="shrink-0 w-[92px] text-center group">
                <div className="relative mx-auto w-16 h-16">
                  <Avatar className="w-16 h-16 border border-border">
                    <AvatarImage src={s.avatar_url || undefined} alt={s.username || 'Criador'} />
                    <AvatarFallback className="bg-secondary text-xs">
                      {(s.artist_name || s.username || '?').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {s.has_spotify_badge && (
                    <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-foreground fill-background" />
                  )}
                </div>
                <p className="mt-2 text-[12px] font-semibold truncate group-hover:text-foreground text-foreground/90">
                  {s.artist_name || s.username || 'Criador'}
                </p>
                <p className="text-[11px] text-muted-foreground">{s.count} packs</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ESCOLHAS DE HOJE */}
      <section id="picks" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 scroll-mt-20">
        <SectionHead title="Escolhas de hoje" to="/" />
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setCategory('all')}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors ${
              category === 'all' ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Todos
          </button>
          {Object.entries(packTypeLabels).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                category === id ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-[12.5px] font-semibold text-muted-foreground">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Mais recentes
          </span>
        </div>

        {picks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Nenhum pack encontrado.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {picks.slice(0, visible).map((p) => (
                <article key={p.id} className="group rounded-2xl border border-border bg-card p-3 hover:border-foreground/25 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative rounded-xl overflow-hidden aspect-square">
                    <Cover pack={p} />
                    {p.is_premium && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-bold">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    )}
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-1 text-[11px] font-bold">
                      <Heart className="w-3 h-3" /> {p.likes_count ?? 0}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[13.5px] font-bold truncate">{p.title}</h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-7 h-7 border border-border">
                        <AvatarFallback className="bg-secondary text-[10px]">{authorOf(p).slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground">Enviado por</p>
                        <p className="text-[11.5px] font-semibold truncate">{authorOf(p)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">Preço</p>
                      <p className="text-[11.5px] font-bold">{priceOf(p)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <a
                      href={p.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-foreground text-background py-2 text-[11.5px] font-bold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar
                    </a>
                    {p.user_id && !p.is_anonymous && (
                      <Link to={`/perfil/${p.user_id}`} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <Coins className="w-3.5 h-3.5" /> Perfil
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {visible < picks.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisible((v) => v + 8)}
                  className="rounded-full border border-border bg-secondary px-8 py-3 text-sm font-bold hover:bg-accent transition-colors"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* COLEÇÕES POPULARES */}
      {approvedAlbums.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <SectionHead title="Coleções populares" to="/albuns" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {approvedAlbums.slice(0, 3).map((a, i) => (
              <article key={a.id} className="group rounded-2xl border border-border bg-card p-4 hover:border-foreground/25 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                    <Disc3 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold truncate">{a.title}</h3>
                    <p className="text-[11px] text-muted-foreground truncate">{a.style || 'Coleção PACKY'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 grid-rows-2 gap-2 h-[220px]">
                  <div className="col-span-2 row-span-2 rounded-xl overflow-hidden bg-secondary">
                    {a.cover_url ? (
                      <img src={a.cover_url} alt={a.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <Cover pack={allPacks[i]} />
                    )}
                  </div>
                  <div className="rounded-xl overflow-hidden bg-secondary">
                    <Cover pack={allPacks[(i + 1) % Math.max(allPacks.length, 1)]} />
                  </div>
                  <div className="rounded-xl overflow-hidden bg-secondary">
                    <Cover pack={allPacks[(i + 2) % Math.max(allPacks.length, 1)]} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11.5px]">
                  <span className="text-muted-foreground">Ver coleção</span>
                  <Link to="/albuns" className="font-bold hover:underline">Abrir</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* CRIE E VENDA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-8">Crie e venda seus packs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-secondary border border-border">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-[15px] font-bold">{title}</h3>
              <p className="mt-2 text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              {logoUrl ? <img src={logoUrl} alt="PACKY" className="h-7 w-auto" /> : <><Music2 className="w-5 h-5" /> PACKY</>}
            </div>
            <p className="mt-3 text-[12.5px] text-muted-foreground max-w-xs leading-relaxed">
              Plataforma de packs, projetos e acapellas: descubra, baixe e compartilhe material de produtores do Brasil inteiro.
            </p>
            <div className="mt-5 flex gap-2">
              {[Instagram, Youtube, Send].map((Icon, i) => (
                <span key={i} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                  <Icon className="w-4 h-4" />
                </span>
              ))}
            </div>
          </div>

          {[
            { title: 'Minha conta', links: [{ label: 'Perfil', to: '/conta' }, { label: 'Carteira', to: '/carteira' }, { label: 'Caixa de entrada', to: '/inbox' }] },
            { title: 'Recursos', links: [{ label: 'Packs', to: '/' }, { label: 'Projetos', to: '/projetos' }, { label: 'Acapellas', to: '/mcs' }] },
            { title: 'Comunidade', links: [{ label: 'Álbuns', to: '/albuns' }, { label: 'Sites', to: '/sites' }, { label: 'Desejos', to: '/desejos' }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border py-5 text-center text-[11.5px] text-muted-foreground">
          © {new Date().getFullYear()} PACKY. Todos os direitos reservados.
        </div>
      </footer>

      <BottomNav />

      {showAdd && <AddPackModalV2 isOpen={showAdd} onClose={() => setShowAdd(false)} onAdd={addPack} />}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default Marketplace;
