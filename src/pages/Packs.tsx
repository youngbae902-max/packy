import { useState } from 'react';
import { Plus, Search, Crown } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PackCardV2 } from '@/components/PackCardV2';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { AuthModal } from '@/components/AuthModal';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAuth } from '@/contexts/AuthContext';

const Packs = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'free' | 'premium'>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const { approvedPacks, premiumPacks, addPack, isLoading } = useSupabasePacks();

  const currentPacks = activeSection === 'free' ? approvedPacks : premiumPacks;
  const filteredPacks = currentPacks.filter(pack => 
    pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewPack = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="text-center py-6">
          <h1 className="text-3xl font-black tracking-tighter">PACKY</h1>
          <p className="text-sm text-muted-foreground mt-1">Packs para produtores</p>
        </header>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar packs..."
            className="input-field pl-10"
          />
        </div>

        <button onClick={handleNewPack} className="btn-primary w-full mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pack
        </button>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection('free')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase ${
              activeSection === 'free' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
            }`}
          >
            Grátis
          </button>
          <button
            onClick={() => setActiveSection('premium')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase ${
              activeSection === 'premium' ? 'bg-premium text-white' : 'bg-card text-muted-foreground'
            }`}
          >
            <Crown className="w-4 h-4" />
            Premium
          </button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filteredPacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum pack encontrado</p>
          ) : (
            filteredPacks.map((pack) => <PackCardV2 key={pack.id} pack={pack} />)
          )}
        </div>
      </div>

      <BottomNav />

      {user && (
        <AddPackModalV2
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addPack}
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Packs;
