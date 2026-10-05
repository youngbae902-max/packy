import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, Music, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/BottomNav';
import { useAcapellas, Acapella } from '@/hooks/useAcapellas';

type LayoutMode = 'grid' | 'list';

const MCs = () => {
  const { acapellas, isLoading } = useAcapellas();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [selectedMc, setSelectedMc] = useState<Acapella | null>(null);
  const [pollChoice, setPollChoice] = useState('');
  const [pollText, setPollText] = useState('');

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return acapellas;
    return acapellas.filter((item) => item.artist_name.toLowerCase().includes(query));
  }, [acapellas, searchTerm]);

  const openPoll = (event: React.MouseEvent, mc: Acapella) => {
    event.preventDefault();
    navigate(`/mcs/${mc.id}`);
  };

  const continueToAcapella = () => {
    if (!selectedMc?.download_url) return;
    window.open(selectedMc.download_url, '_blank', 'noopener,noreferrer');
  };

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
              <button
                type="button"
                key={mc.id}
                onClick={(event) => openPoll(event, mc)}
                className="group flex flex-col items-center gap-2.5"
              >
                <div className="h-[100px] w-[100px] aspect-square overflow-hidden rounded-full border border-white/10 bg-[#1B1B1B] transition-transform group-hover:scale-105" data-mc-avatar="100px" data-lovable-sync="1">
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
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((mc) => (
              <button
                type="button"
                key={mc.id}
                onClick={(event) => openPoll(event, mc)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-[#141414] p-3 text-left transition-colors hover:bg-[#1B1B1B]"
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
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />

      {selectedMc && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img src={selectedMc.image_url || '/placeholder.svg'} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Acapella</p>
                  <h2 className="truncate text-base font-bold">{selectedMc.artist_name}</h2>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedMc(null)} className="rounded-full p-2 text-white/50 hover:bg-white/5 hover:text-white" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="mb-3 text-sm font-bold">Com que a voz da {selectedMc.artist_name} combina?</h3>
            <div className="grid grid-cols-2 gap-2">
              {['ZN', 'ZS', 'Automotivo', 'BH', 'Capixaba', 'Nenhum desses'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPollChoice(option)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${pollChoice === option ? 'border-white bg-white text-black' : 'border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]'}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {pollChoice === 'Nenhum desses' && (
              <input
                value={pollText}
                onChange={(event) => setPollText(event.target.value)}
                placeholder="Fale aqui qual combina..."
                className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
              />
            )}

            <button
              type="button"
              disabled={!pollChoice || (pollChoice === 'Nenhum desses' && !pollText.trim())}
              onClick={continueToAcapella}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              Avançar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCs;
