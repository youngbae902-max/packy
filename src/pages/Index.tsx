import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { PackCard } from '@/components/PackCard';
import { SupportCard } from '@/components/SupportCard';
import { AddPackModal } from '@/components/AddPackModal';
import { usePacks } from '@/hooks/usePacks';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { packs, addPack } = usePacks();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pb-12">
        <Header />

        <div className="mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-full text-sm uppercase tracking-wide"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pack
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <SupportCard
            name="Pack Storage"
            description="Apoie o projeto para mantermos o site online!"
            channelUrl="https://youtube.com"
          />
        </div>

        <div className="space-y-4">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>

        {packs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum pack adicionado ainda.
            </p>
          </div>
        )}
      </div>

      <AddPackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addPack}
      />
    </div>
  );
};

export default Index;
