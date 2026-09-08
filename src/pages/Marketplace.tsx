import { useRef, useState } from 'react';
import {
  Search, Menu, X, ChevronDown, ChevronLeft, ChevronRight, Heart,
  Wallet, LayoutGrid, Tag, Coins, Boxes, SlidersHorizontal, History,
  Gavel, Flame, Facebook, Twitter, Instagram, Youtube, BadgeCheck, Send,
} from 'lucide-react';

import heroArt from '@/assets/nft-hero.png';
import art1 from '@/assets/nft-1.jpg';
import art2 from '@/assets/nft-2.jpg';
import art3 from '@/assets/nft-3.jpg';

const arts = [art1, art2, art3];

const navItems: { label: string; children?: string[] }[] = [
  { label: 'Home' },
  { label: 'Explore', children: ['Explore Style 1', 'Explore Style 2', 'Explore Style 3', 'Live Auctions', 'Item Details'] },
  { label: 'Activity', children: ['All Activity', 'Bids', 'Sales'] },
  { label: 'Community', children: ['Blog', 'Forum', 'Discord'] },
  { label: 'Pages', children: ['Authors', 'Collection', 'Author Profile'] },
  { label: 'Contact', children: ['Support', 'Help Center'] },
];

const auctions = [
  { title: 'Hamlet Contemplates...', author: 'SalvadorDali', time: '06 : 12 : 07 : 45', likes: 100, price: '4.89 ETH' },
  { title: 'Triumphant Awakening', author: 'Trista Francis', time: '01 : 16 : 25 : 45', likes: 220, price: '4.89 ETH' },
  { title: 'Living Vase 01 By Lanza', author: 'Freddie Carpenter', time: '12 : 02 : 47 : 25', likes: 90, price: '4.89 ETH' },
  { title: 'Flame Dress By Balmain', author: 'Tyler Covington', time: '07 : 12 : 31 : 21', likes: 145, price: '4.89 ETH' },
  { title: 'Cyber Doberman #766', author: 'Mason Woodward', time: '03 : 09 : 11 : 02', likes: 78, price: '5.20 ETH' },
];

const sellers = [
  { name: 'Crispin Berry', eth: '214.2 ETH' },
  { name: 'Samson Frost', eth: '205.43 ETH' },
  { name: 'Tommy Alvarez', eth: '170.3 ETH' },
  { name: 'Windsor Lane', eth: '120.7 ETH' },
  { name: 'Andy Hurlburt', eth: '82.79 ETH' },
  { name: 'Blake Banks', eth: '68.2 ETH' },
  { name: 'Monica Lucas', eth: '52.8 ETH' },
  { name: 'Matt Ramos', eth: '38.4 ETH' },
  { name: 'Harper Wilcher', eth: '29.2 ETH' },
];

const picks = [
  { title: 'The RenaiXance Rising', author: 'SalvadorDali', price: '4.89 ETH', tag: null },
  { title: 'Space Babe - Night 2/25', author: 'SalvadorDali', price: '4.89 ETH', tag: 'Coming Soon' },
  { title: 'CyberPrimal 042 LAN', author: 'SalvadorDali', price: '4.89 ETH', tag: null },
  { title: 'Crypto Egg Stamp #5', author: 'SalvadorDali', price: '4.89 ETH', tag: null },
  { title: 'Travel Monkey Club #45', author: 'Ralph Garraway', price: '4.89 ETH', tag: null },
  { title: 'Sir. Lion Swag #371', author: 'Mason Woodward', price: '4.89 ETH', tag: null },
  { title: 'Cyber Doberman #766', author: 'Freddie Carpenter', price: '4.89 ETH', tag: null },
  { title: 'Living Vase 01 By Lanza', author: 'Tyler Covington', price: '4.89 ETH', tag: null },
];

const collections = [
  { name: 'Creative Art Collection', by: 'Ralph Garraway' },
  { name: 'Colorful Abstract', by: 'Mason Woodward' },
  { name: 'Modern Art Collection', by: 'Freddie Carpenter' },
];

const steps = [
  { icon: Wallet, title: 'Set Up Your Wallet', desc: 'Conecte sua carteira favorita, adicione fundos e comece a colecionar em poucos segundos.' },
  { icon: LayoutGrid, title: 'Create Your Collection', desc: 'Monte sua coleção, defina nome, descrição, capa e organize seus itens.' },
  { icon: Boxes, title: 'Add Your NFTs', desc: 'Envie suas artes, escolha propriedades e prepare tudo para a venda.' },
  { icon: Tag, title: 'List Them For Sale', desc: 'Preço fixo ou leilão: você escolhe como e quando vender.' },
];

const avatarGradients = [
  'from-[#f97316] to-[#facc15]', 'from-[#22c55e] to-[#14b8a6]', 'from-[#6366f1] to-[#a855f7]',
  'from-[#ec4899] to-[#f43f5e]', 'from-[#06b6d4] to-[#3b82f6]', 'from-[#eab308] to-[#f97316]',
  'from-[#8b5cf6] to-[#d946ef]', 'from-[#10b981] to-[#84cc16]', 'from-[#f43f5e] to-[#8b5cf6]',
];

function Avatar({ i, className = 'w-7 h-7' }: { i: number; className?: string }) {
  return (
    <div className={`${className} rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} shrink-0 ring-2 ring-background`} />
  );
}

function SectionHead({ title, action = 'EXPLORE MORE' }: { title: string; action?: string | null }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <h2 className="text-xl md:text-3xl font-black tracking-tight">{title}</h2>
      {action && (
        <button className="text-[11px] font-bold tracking-widest text-muted-foreground hover:text-foreground border-b border-border pb-0.5 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

function useScroller() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' });
  return { ref, scroll };
}

const Marketplace = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const auctionScroller = useScroller();
  const sellerScroller = useScroller();

  return (
    <div className="nft-scope min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 font-black text-lg tracking-tight shrink-0">
            <Flame className="w-5 h-5 text-[hsl(var(--nft-accent-2))]" />
            Axies
          </a>

          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                  className="flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {item.children && openMenu === item.label && (
                  <div className="absolute left-0 top-full w-52 rounded-xl border border-border bg-[hsl(var(--secondary))] p-1.5 shadow-2xl animate-fade-in">
                    {item.children.map((c) => (
                      <a key={c} href="#" className="block rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                        {c}
                      </a>
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
            <button className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-[hsl(var(--secondary))] px-4 py-2 text-[13px] font-bold hover:border-[hsl(var(--nft-accent))] transition-colors">
              <Wallet className="w-4 h-4" />
              Wallet connect
            </button>
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" className="lg:hidden p-2 rounded-full hover:bg-foreground/10">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border/60 px-4 md:px-8 py-3 animate-fade-in">
            <div className="max-w-7xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search items, collections and accounts"
                className="w-full rounded-full bg-[hsl(var(--secondary))] border border-border pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--nft-accent))]/40"
              />
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="lg:hidden border-t border-border/60 px-4 py-3 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                  className="w-full flex items-center justify-between px-2 py-2.5 text-sm font-semibold"
                >
                  {item.label}
                  {item.children && <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === item.label ? 'rotate-180' : ''}`} />}
                </button>
                {item.children && openMenu === item.label && (
                  <div className="pl-4 pb-2 space-y-1">
                    {item.children.map((c) => (
                      <a key={c} href="#" className="block px-2 py-1.5 text-[13px] text-muted-foreground">{c}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className="w-full mt-2 flex items-center justify-center gap-2 rounded-full border border-border bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-bold">
              <Wallet className="w-4 h-4" /> Wallet connect
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 nft-glow pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-[34px] md:text-[54px] font-black leading-[1.05] tracking-tight">
              Discover, find,
              <br />
              <span className="nft-gradient-text italic">Sell extraordinary</span>
              <br />
              Monster NFTs
            </h1>
            <p className="mt-5 text-sm md:text-[15px] text-muted-foreground max-w-md leading-relaxed">
              Marketplace for monster character collections — non fungible token NFTs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full border border-border bg-[hsl(var(--secondary))] px-7 py-3 text-sm font-bold hover:border-[hsl(var(--nft-accent))] transition-colors">
                Explore
              </button>
              <button className="rounded-full bg-foreground text-background px-7 py-3 text-sm font-bold hover:opacity-90 transition-opacity">
                Create
              </button>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border border-[hsl(var(--nft-accent))]/25" />
            <div className="absolute w-[230px] h-[230px] md:w-[300px] md:h-[300px] rounded-full border border-dashed border-[hsl(var(--nft-accent-2))]/25 animate-[spin_40s_linear_infinite]" />
            <span className="absolute top-4 right-8 w-4 h-4 rounded-full bg-[hsl(var(--nft-accent-2))]/70 animate-pulse" />
            <span className="absolute bottom-10 left-4 w-6 h-6 rounded-full bg-[hsl(var(--nft-accent))]/60" />
            <span className="absolute top-1/2 -left-2 w-3 h-3 rounded-full bg-[hsl(var(--nft-accent-2))]" />
            <span className="absolute bottom-4 right-10 w-2.5 h-2.5 rounded-full bg-foreground/40" />
            <img
              src={heroArt}
              alt="Personagem NFT em destaque"
              width={1024}
              height={1024}
              className="relative w-[260px] md:w-[400px] drop-shadow-[0_25px_60px_hsl(var(--nft-accent)/0.35)] select-none"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* LIVE AUCTIONS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead title="Live Auctions" />
        <div ref={auctionScroller.ref} className="flex gap-4 overflow-x-auto snap-x snap-mandatory nft-no-scrollbar pb-2">
          {auctions.map((a, i) => (
            <article
              key={a.title}
              className="group snap-start shrink-0 w-[260px] md:w-[290px] rounded-2xl border border-border bg-[hsl(var(--card))] p-3 hover:border-[hsl(var(--nft-accent))]/60 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative rounded-xl overflow-hidden">
                <img src={arts[i % arts.length]} alt={a.title} loading="lazy" width={768} height={768}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-1 text-[11px] font-bold">
                  <Heart className="w-3 h-3" /> {a.likes}
                </span>
                <button className="absolute inset-x-0 bottom-9 mx-auto w-fit rounded-full bg-foreground text-background px-4 py-1.5 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Place Bid
                </button>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[11px] font-bold tabular-nums">
                  {a.time}
                </span>
              </div>
              <h3 className="mt-3 text-[14px] font-bold truncate">{a.title}</h3>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar i={i} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">Creator</p>
                    <p className="text-[12px] font-semibold truncate">{a.author}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">Current Bid</p>
                  <p className="text-[12px] font-bold">{a.price}</p>
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

      {/* TOP SELLERS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-3xl font-black tracking-tight">Top Seller</h2>
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
          {sellers.map((s, i) => (
            <div key={s.name} className="shrink-0 w-[92px] text-center group cursor-pointer">
              <div className="relative mx-auto w-16 h-16">
                <Avatar i={i} className="w-16 h-16" />
                <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-[hsl(var(--nft-accent))] fill-background" />
              </div>
              <p className="mt-2 text-[12px] font-semibold truncate group-hover:text-[hsl(var(--nft-accent))] transition-colors">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">{s.eth}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TODAY'S PICKS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead title="Today's Picks" />
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { icon: LayoutGrid, label: 'Category' },
            { icon: Coins, label: 'Price range' },
            { icon: Gavel, label: 'Sale type' },
            { icon: Boxes, label: 'Blockchain' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-2 rounded-full border border-border bg-[hsl(var(--secondary))] px-4 py-2 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground hover:border-[hsl(var(--nft-accent))]/60 transition-colors">
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
          <button className="ml-auto flex items-center gap-2 rounded-full border border-border bg-[hsl(var(--secondary))] px-4 py-2 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sort By: Recently Added
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {picks.map((p, i) => (
            <article key={p.title} className="group rounded-2xl border border-border bg-[hsl(var(--card))] p-3 hover:border-[hsl(var(--nft-accent))]/60 hover:-translate-y-1 transition-all duration-300">
              <div className="relative rounded-xl overflow-hidden">
                <img src={arts[i % arts.length]} alt={p.title} loading="lazy" width={768} height={768}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" />
                {p.tag && (
                  <span className="absolute top-2 left-2 rounded-full bg-[hsl(var(--nft-accent))] px-2.5 py-1 text-[10px] font-bold text-white">{p.tag}</span>
                )}
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-1 text-[11px] font-bold">
                  <Heart className="w-3 h-3" /> 100
                </span>
              </div>
              <h3 className="mt-3 text-[13.5px] font-bold truncate">{p.title}</h3>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar i={i + 2} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">Owned By</p>
                    <p className="text-[11.5px] font-semibold truncate">{p.author}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">Price</p>
                  <p className="text-[11.5px] font-bold">{p.price}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-foreground text-background py-2 text-[11.5px] font-bold hover:opacity-90 transition-opacity">
                  <Gavel className="w-3.5 h-3.5" /> Place Bid
                </button>
                <button className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  <History className="w-3.5 h-3.5" /> History
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button className="rounded-full border border-border bg-[hsl(var(--secondary))] px-8 py-3 text-sm font-bold hover:border-[hsl(var(--nft-accent))] transition-colors">
            Load More
          </button>
        </div>
      </section>

      {/* POPULAR COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead title="Popular Collection" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((c, i) => (
            <article key={c.name} className="group rounded-2xl border border-border bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--nft-accent))]/60 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar i={i + 3} className="w-10 h-10" />
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold truncate">{c.name}</h3>
                  <p className="text-[11px] text-muted-foreground truncate">Created by {c.by}</p>
                </div>
                <span className="ml-auto flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-[11px] font-bold">
                  <Heart className="w-3 h-3" /> 100
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 grid-rows-2 gap-2 h-[220px]">
                <img src={arts[i % 3]} alt="" loading="lazy" className="col-span-2 row-span-2 w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]" />
                <img src={arts[(i + 1) % 3]} alt="" loading="lazy" className="w-full h-full object-cover rounded-xl" />
                <img src={arts[(i + 2) % 3]} alt="" loading="lazy" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground">Floor price</span>
                <span className="font-bold">1.2{i} ETH</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CREATE AND SELL */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <h2 className="text-xl md:text-3xl font-black tracking-tight mb-8">Create And Sell Your NFTs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${avatarGradients[i]} `}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="mt-4 text-[15px] font-bold">{title}</h3>
              <p className="mt-2 text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-[hsl(var(--card))]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-black text-lg tracking-tight">
              <Flame className="w-5 h-5 text-[hsl(var(--nft-accent-2))]" /> Axies
            </div>
            <p className="mt-3 text-[12.5px] text-muted-foreground max-w-xs leading-relaxed">
              Marketplace de colecionáveis digitais: descubra, compre e venda NFTs de artistas do mundo inteiro.
            </p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="Rede social" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--nft-accent))] transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'My Account', links: ['Authors', 'Collection', 'Author Profile', 'Create Collection'] },
            { title: 'Resources', links: ['Help & Support', 'Live Auctions', 'Item Details', 'Activity'] },
            { title: 'Company', links: ['About Us', 'Contact Us', 'Our Blog', 'Discover'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
          <h4 className="text-[13px] font-bold mb-3">Subscribe Us</h4>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-sm">
            <input
              type="email"
              placeholder="info@yourgmail.com"
              className="flex-1 rounded-full bg-[hsl(var(--secondary))] border border-border px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--nft-accent))]/40"
            />
            <button aria-label="Inscrever" className="w-10 h-10 rounded-full bg-[hsl(var(--nft-accent))] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-8 text-[11.5px] text-muted-foreground">© {new Date().getFullYear()} Axies. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;
