import { useState } from 'react';
import { Plus, Mic } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AddAcapellaModal } from '@/components/AddAcapellaModal';
import { useAcapellas } from '@/hooks/useAcapellas';
import { useAuth } from '@/contexts/AuthContext';

const MCs = () => {
  const { isAdmin } = useAuth();
  const { acapellas, isLoading, addAcapella } = useAcapellas();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="text-center py-6">
          <Mic className="w-10 h-10 mx-auto mb-2 text-primary" />
          <h1 className="text-2xl font-black">MCs</h1>
          <p className="text-sm text-muted-foreground">Acapellas para produção</p>
        </header>

        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary w-full mb-6">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Acapella
          </button>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : acapellas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma acapella disponível</p>
          ) : (
            acapellas.map((acapella) => (
              <AudioPlayer
                key={acapella.id}
                artistName={acapella.artist_name}
                audioUrl={acapella.audio_url}
                downloadUrl={acapella.download_url}
                duration={acapella.duration_seconds || undefined}
              />
            ))
          )}
        </div>
      </div>

      <BottomNav />
      <AddAcapellaModal isOpen={showModal} onClose={() => setShowModal(false)} onAdd={addAcapella} />
    </div>
  );
};

export default MCs;
