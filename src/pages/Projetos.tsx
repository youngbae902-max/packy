import { useState } from 'react';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PackCardV2 } from '@/components/PackCardV2';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { AuthModal } from '@/components/AuthModal';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAuth } from '@/contexts/AuthContext';

const Projetos = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { approvedPacks, addPack, isLoading } = useSupabasePacks();

  const projectPacks = approvedPacks.filter(p => p.pack_type === 'project');
  const filteredPacks = projectPacks.filter(pack => 
    pack.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewProject = () => {
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
          <FolderOpen className="w-10 h-10 mx-auto mb-2 text-primary" />
          <h1 className="text-2xl font-black">PROJETOS</h1>
          <p className="text-sm text-muted-foreground">Projetos de FL Studio, Ableton...</p>
        </header>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar projetos..."
            className="input-field pl-10"
          />
        </div>

        <button onClick={handleNewProject} className="btn-primary w-full mb-6">
          <Plus className="w-4 h-4 mr-2" />
          Enviar Projeto
        </button>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filteredPacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum projeto encontrado</p>
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
          isProject
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Projetos;
