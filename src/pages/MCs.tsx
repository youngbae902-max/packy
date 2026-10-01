import { BottomNav } from '@/components/BottomNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useAcapellas } from '@/hooks/useAcapellas';

const MCs = () => {
  const { acapellas, isLoading } = useAcapellas();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
          {isLoading ? (
            <p className="col-span-full text-center text-muted-foreground py-8">Carregando...</p>
          ) : acapellas.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">Nenhuma acapella disponível</p>
          ) : (
            acapellas.map((acapella) => (
              <AudioPlayer
                key={acapella.id}
                artistName={acapella.artist_name}
                imageUrl={acapella.image_url}
                audioUrl={acapella.audio_url}
                downloadUrl={acapella.download_url}
                duration={acapella.duration_seconds || undefined}
              />
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MCs;
