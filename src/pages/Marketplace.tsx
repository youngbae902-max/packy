import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ChevronLeft, ChevronRight, Crown, Store, Upload, Wallet,
  LayoutGrid, Tag, Disc3, BadgeCheck,
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAlbums } from '@/hooks/useAlbums';
import { useCategories } from '@/hooks/useCategories';
import { useAppLogo } from '@/hooks/useAppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { PackCardV2 } from '@/components/PackCardV2';
import { PackImagePlaceholder } from '@/components/PackImagePlaceholder';
import { BottomNav } from '@/components/BottomNav';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { AuthModal } from '@/components/AuthModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

function SectionHead({
  title,
  to,
  onPrev,
  onNext,
}: {
  title: string;
  to?: string;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h2 className="text-[17px] md:text-xl font-bold tracking-tight">{title}</h2>
      <div className="flex items-center gap-2">
        {to && (
          <Link
            to={to}
            className="text-[11px] font-semibold tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            VER TUDO
          </Link>
        )}
        {onPrev && onNext && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={onPrev}
              aria-label="Anterior"
              className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              aria-label="Próximo"
              className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const steps = [
  { icon: Wallet, title: 'Crie sua conta', desc: 'Cadastre-se em segundos e personalize seu perfil de produtor.' },
  { icon: LayoutGrid, title: 'Monte sua coleção', desc: 'Organize seus packs, projetos e acapellas em álbuns.' },
  { icon: Upload, title: 'Envie seus packs', desc: 'Suba capa, link e categoria. A equipe aprova rapidinho.' },
  { icon: Tag, title: 'Venda ou libere', desc: 'Defina um preço premium ou libere grátis com link de crédito.' },
];

const Marketplace = () => {
  const { user } = useAuth();
  const { logoUrl } = useAppLogo();
  const { approvedPacks, premiumPacks, isLoading } = useSupabasePacks();
  const { approvedAlbums } = useAlbums();
  const { categories } = useCategories();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [visible, setVisible] = useState(12);
  const [showAdd, setShowAdd] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const featured = useScroller();
  const creatorsScroller = useScroller();

  const allPacks = useMemo(() => [...premiumPacks, ...approvedPacks], [premiumPacks, approvedPacks]);

  const { data: creators = [] } = useQuery({
    queryKey: ['marketplace', 'creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, artist_name, avatar_url, has_spotify_badge')
        .limit(60);
      if (error) throw error;
      return data as CreatorRow[];
    },
  });

  const topCreators = useMemo(() => {
    const counts = new Map<string, number>();
    allPacks.forEach((p) => {
      if (p.user_id && !p.is_anonymous) counts.set(p.user_id, (counts.get(p.user_id) || 0) + 1);
    });
    return creators
      .map((c) => ({ ...c, count: counts.get(c.user_id) || 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 14);
  }, [creators, allPacks]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allPacks.filter((p) => {
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.author_name || '').toLowerCase().includes(q);
      const matchC = category === 'all' || p.pack_type === category;
      return matchQ && matchC;
    });
  }, [allPacks, query, category]);

  const handleUpload = () => (user ? setShowAdd(true) : setShowAuth(true));

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-10">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="PACKY" className="h-7 w-auto" />
            ) : (
              <span className="font-bold tracking-tight">PACKY</span>
            )}
          </Link>
          <span className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
            <Store className="w-3.5 h-3.5" /> Marketplace
          </span>
          <div className="relative flex-1 max-w-md ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar packs, criadores..."
              className="w-full rounded-full bg-secondary border border-border pl-9 pr-4 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
          <button
            onClick={handleUpload}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-[12.5px] font-bold hover:opacity-90 transition-opacity"
          >
            <Upload className="w-3.5 h-3.5" /> Enviar pack
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6">
        {/* HERO */}
        <section className="py-10 md:py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-[30px] md:text-[46px] font-bold leading-[1.05] tracking-tight">
              Descubra, baixe e
              <br />
              <span className="text-muted-foreground">venda packs</span>
              <br />
              da cena.
            </h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
              Samples, drumkits, loops, presets, projetos e acapellas enviados por produtores da comunidade PACKY.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#todos"
                className="rounded-full border border-border bg-secondary px-6 py-2.5 text-[13px] font-bold hover:bg-accent transition-colors"
              >
                Explorar
              </a>
              <button
                onClick={handleUpload}
                className="rounded-full bg-foreground text-background px-6 py-2.5 text-[13px] font-bold hover:opacity-90 transition-opacity"
              >
                Enviar pack
              </button>
            </div>
            <div className="mt-8 flex gap-8">
              {[
                { label: 'Packs', value: allPacks.length },
                { label: 'Premium', value: premiumPacks.length },
                { label: 'Criadores', value: topCreators.length },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:grid grid-cols-2 gap-3">
            {allPacks.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className={`rounded-2xl overflow-hidden border border-border bg-card aspect-square ${
                  i % 3 === 0 ? 'translate-y-4' : ''
                }`}
              >
                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <PackImagePlaceholder className="w-full h-full" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* PREMIUM */}
        {premiumPacks.length > 0 && (
          <section className="py-8">
            <SectionHead title="Premium & Exclusivos" onPrev={() => featured.scroll(-1)} onNext={() => featured.scroll(1)} />
            <div ref={featured.ref} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 nft-no-scrollbar">
              {premiumPacks.map((p) => (
                <div key={p.id} className="snap-start shrink-0 w-[46%] sm:w-[220px]">
                  <PackCardV2 pack={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TOP CRIADORES */}
        {topCreators.length > 0 && (
          <section className="py-8">
            <SectionHead
              title="Top criadores"
              onPrev={() => creatorsScroller.scroll(-1)}
              onNext={() => creatorsScroller.scroll(1)}
            />
            <div ref={creatorsScroller.ref} className="flex gap-5 overflow-x-auto pb-2 nft-no-scrollbar">
              {topCreators.map((c) => (
                <Link key={c.user_id} to={`/perfil/${c.user_id}`} className="shrink-0 w-[86px] text-center group">
                  <div className="relative mx-auto w-16 h-16">
                    <Avatar className="w-16 h-16 border border-border">
                      <AvatarImage src={c.avatar_url || undefined} alt={c.username || 'Criador'} />
                      <AvatarFallback className="bg-secondary text-xs">
                        {(c.artist_name || c.username || '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {c.has_spotify_badge && (
                      <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-foreground fill-background" />
                    )}
                  </div>
                  <p className="mt-2 text-[12px] font-semibold truncate group-hover:text-foreground text-foreground/90">
                    {c.artist_name || c.username || 'Criador'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{c.count} packs</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* TODOS OS PACKS */}
        <section id="todos" className="py-8 scroll-mt-20">
          <SectionHead title="Escolhas de hoje" to="/" />
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <button
              onClick={() => setCategory('all')}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
                category === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos
            </button>
            {categories.map((c: { id: string; label: string }) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-full border px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  category === c.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Nenhum pack encontrado.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.slice(0, visible).map((p) => (
                  <PackCardV2 key={p.id} pack={p} />
                ))}
              </div>
              {visible < filtered.length && (
                <div className="flex justify-center mt-7">
                  <button
                    onClick={() => setVisible((v) => v + 12)}
                    className="rounded-full border border-border bg-secondary px-7 py-2.5 text-[13px] font-bold hover:bg-accent transition-colors"
                  >
                    Carregar mais
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* COLEÇÕES / ÁLBUNS */}
        {approvedAlbums.length > 0 && (
          <section className="py-8">
            <SectionHead title="Coleções populares" to="/albuns" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedAlbums.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  to="/albuns"
                  className="group rounded-2xl border border-border bg-card p-3 hover:bg-accent/40 transition-colors"
                >
                  <div className="rounded-xl overflow-hidden aspect-video bg-secondary">
                    {a.cover_url ? (
                      <img
                        src={a.cover_url}
                        alt={a.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc3 className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Disc3 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-bold truncate">{a.title}</h3>
                      <p className="text-[11px] text-muted-foreground truncate">{a.style || 'Coleção'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* COMO VENDER */}
        <section className="py-10 md:py-14">
          <h2 className="text-[17px] md:text-xl font-bold tracking-tight mb-6">Crie e venda seus packs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-4">
                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-foreground" />
                </div>
                <h3 className="mt-3 text-[14px] font-bold">{title}</h3>
                <p className="mt-1.5 text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RODAPÉ */}
        <footer className="border-t border-border py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {logoUrl ? <img src={logoUrl} alt="PACKY" className="h-6 w-auto" /> : <span className="font-bold">PACKY</span>}
            <span className="text-[11px] text-muted-foreground">Marketplace</span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Explorar</Link>
            <Link to="/projetos" className="hover:text-foreground transition-colors">Projetos</Link>
            <Link to="/desejos" className="hover:text-foreground transition-colors">Desejos</Link>
            <Link to="/conta" className="hover:text-foreground transition-colors">Conta</Link>
          </div>
          <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} PACKY</p>
        </footer>
      </main>

      <BottomNav />

      {showAdd && <AddPackModalV2 isOpen={showAdd} onClose={() => setShowAdd(false)} />}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default Marketplace;
