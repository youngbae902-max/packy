import { useMemo, useState } from 'react';
import { Search, LayoutGrid, Rows3, List, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/BottomNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useAcapellas } from '@/hooks/useAcapellas';

type LayoutMode = 'grid' | 'horizontal' | 'vertical';

const MCs = () => {
  const { acapellas, isLoading } = useAcapellas();
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<LayoutMode>('grid');

  const filteredAcapellas = useMemo(() => {
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
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <Input
              placeholder="Buscar MCs..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 rounded-2xl border-white/5 bg-[#141414] pl-11 text-sm focus-visible:ring-1 focus-visible:ring-white/20"
            />
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-white/10 bg-[#141414] p-1">
            {layoutButton('grid', 'Grade', LayoutGrid)}
            {layoutButton('horizontal', 'Horizontal', Rows3)}
            {layoutButton('vertical', 'Vertical', List)}
          </div>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-muted-foreground">Carregando...</p>
        ) : filteredAcapellas.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {searchTerm ? 'Nenhum MC encontrado' : 'Nenhuma acapella disponível'}
          </p>
        ) : (
          <div className={
            layout === 'grid'
              ? 'grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4'
              : layout === 'horizontal'
                ? 'flex gap-5 overflow-x-auto pb-4'
                : 'flex flex-col gap-5'
          }>
            {filteredAcapellas.map((acapella) => (
              <div key={acapella.id} className={layout === 'vertical' ? 'flex items-center gap-4 rounded-2xl bg-[#141414] p-3' : layout === 'horizontal' ? 'w-24 shrink-0' : ''}>
                <AudioPlayer
                  artistName={acapella.artist_name}
                  imageUrl={acapella.image_url}
                  audioUrl={acapella.audio_url}
                  downloadUrl={acapella.download_url}
                  duration={acapella.duration_seconds || undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default MCs;
