import { useMemo, useState } from 'react';
import { Search, LayoutGrid, List, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/BottomNav';
import { useAcapellas } from '@/hooks/useAcapellas';

type LayoutMode = 'grid' | 'list';

const MCs = () => {
  const { acapellas, isLoading } = useAcapellas();
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<LayoutMode>('grid');

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return acapellas;
    return acapellas.filter((item) => item.artist_name.toLowerCase().includes(query));
  }, [acapellas, searchTerm]);

  const layoutButton = (mode: LayoutMode, label: string, Icon: typeof LayoutGrid) => (
    <button
      type="button"
      onClick={() => setLayout(mode)}
      aria-label={label}
      title={label}
      aria-pressed={layout === mode}
      className={`rounded-xl p-2 transition-colors ${layout === mode ? 'bg-white/15 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-2xl px-6 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <Input
              placeholder="Buscar MC..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 rounded-2xl border-white/5 bg-[#141414] pl-11 text-sm focus-visible:ring-1 focus-visible:ring-white/20"
            />
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-white/10 bg-[#141414] p-1">
            {layoutButton('grid', 'Grade', LayoutGrid)}
            {layoutButton('list', 'Lista', List)}
          </div>
        </div>

        <p className="mb-5 px-1 text-[11px] font-bold uppercase tracking-widest text-foreground/40">
          Acapella · {filtered.length} {filtered.length === 1 ? 'MC' : 'MCs'}
        </p>

        {isLoading ? (
          <p className="py-8 text-center text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {searchTerm ? 'Nenhum MC encontrado' : 'Nenhum MC disponível'}
          </p>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4">
            {filtered.map((mc) => (
              <a
                key={mc.id}
                href={mc.download_url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center gap-2.5"
              >
                <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-[#1B1B1B] transition-transform group-hover:scale-105 sm:h-28 sm:w-28">
                  {mc.image_url ? (
                    <img src={mc.image_url} alt={mc.artist_name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-8 w-8 text-white/25" />
                    </div>
                  )}
                </div>
                <span className="max-w-full truncate text-center text-xs font-bold text-foreground/90">
                  {mc.artist_name}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((mc) => (
              <a
                key={mc.id}
                href={mc.download_url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#141414] p-3 transition-colors hover:bg-[#1B1B1B]"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#1B1B1B]">
                  {mc.image_url ? (
                    <img src={mc.image_url} alt={mc.artist_name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-5 w-5 text-white/25" />
                    </div>
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground/90">
                  {mc.artist_name}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default MCs;
