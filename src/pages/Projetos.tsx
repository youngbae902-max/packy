import { useState } from 'react';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { AuthModal } from '@/components/AuthModal';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAuth } from '@/contexts/AuthContext';

const Projetos = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { projectPacks, addPack, isLoadingProjects } = useSupabasePacks();

  const filteredPacks = projectPacks.filter((pack) =>
    (pack.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewProject = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#111111] pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="text-center py-6">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 text-primary" />
          <h1 className="text-2xl font-black">PROJECTS</h1>
          <p className="text-sm text-muted-foreground">FL Studio, Ableton and other project files</p>
        </header>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="input-field pl-10"
          />
        </div>

        <button onClick={handleNewProject} className="btn-primary w-full mb-6">
          <Plus className="w-4 h-4 mr-2" />
          Upload Project
        </button>

        <div className="space-y-3">
          {isLoadingProjects ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : filteredPacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No projects found</p>
          ) : (
            filteredPacks.map((pack) => (
              <div key={pack.id} className="rounded-2xl border border-white/[0.06] bg-[#151515] p-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1d1d1d] shrink-0">
                  {pack.cover_url ? (
                    <img src={pack.cover_url} alt={pack.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{pack.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {pack.author_name || 'Unknown creator'}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider text-white/35">Project</span>
                </div>
              </div>
            ))
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
