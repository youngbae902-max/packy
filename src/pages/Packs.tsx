import { useState } from 'react';
import { Plus, Search, Crown, Mic, Folder, Inbox, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { PackCardV2 } from '@/components/PackCardV2';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { AuthModal } from '@/components/AuthModal';
import { EventCard } from '@/components/EventCard';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAcapellas } from '@/hooks/useAcapellas';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useInbox } from '@/hooks/useInbox';
import { Badge } from '@/components/ui/badge';

type ContentTab = 'packs' | 'acapellas' | 'projetos';

const Packs = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [contentTab, setContentTab] = useState<ContentTab>('packs');
  const [activeSection, setActiveSection] = useState<'free' | 'premium'>('free');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { approvedPacks, premiumPacks, projectPacks, addPack, isLoading } = useSupabasePacks();
  const { acapellas, isLoading: acapellasLoading } = useAcapellas();
  const { activeEvents } = useSiteEvents();
  const { hasUnread } = useInbox();

  const currentPacks = activeSection === 'free' ? approvedPacks : premiumPacks;
  
  const filteredPacks = currentPacks.filter(pack => 
    pack.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pack.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projectPacks.filter(pack =>
    pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAcapellas = acapellas.filter(a =>
    a.artist_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewPack = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  const contentTabs = [
    { id: 'packs' as const, label: 'Packs', icon: Star },
    { id: 'acapellas' as const, label: 'Acapellas', icon: Mic },
    { id: 'projetos' as const, label: 'Projetos', icon: Folder },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header with Inbox */}
        <header className="flex items-center justify-between py-4">
          <div className="flex-1" />
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter">PACKY</h1>
            <p className="text-sm text-muted-foreground mt-1">Packs para os mano de produtora</p>
          </div>
          <div className="flex-1 flex justify-end">
            <Link to="/inbox" className="relative p-2">
              <Inbox className="w-6 h-6" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
              )}
            </Link>
          </div>
        </header>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-2 mb-4">
            {activeEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="input-field pl-10" 
            placeholder="Buscar..." 
          />
        </div>

        {/* Content Tabs */}
        <div className="flex gap-2 mb-4">
          {contentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setContentTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                contentTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Packs Content */}
        {contentTab === 'packs' && (
          <>
            <button onClick={handleNewPack} className="btn-primary w-full mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pack
            </button>

            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setActiveSection('free')} 
                className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase ${
                  activeSection === 'free' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card text-muted-foreground'
                }`}
              >
                Grátis
              </button>
              <button 
                onClick={() => setActiveSection('premium')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase ${
                  activeSection === 'premium' 
                    ? 'bg-premium text-white' 
                    : 'bg-card text-muted-foreground'
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
                filteredPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)
              )}
            </div>
          </>
        )}

        {/* Acapellas Content */}
        {contentTab === 'acapellas' && (
          <div className="space-y-4">
            {acapellasLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filteredAcapellas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma acapella encontrada</p>
            ) : (
              filteredAcapellas.map(acapella => (
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
        )}

        {/* Projects Content */}
        {contentTab === 'projetos' && (
          <>
            <button onClick={handleNewPack} className="btn-primary w-full mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </button>

            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : filteredProjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum projeto encontrado</p>
              ) : (
                filteredProjects.map(pack => <PackCardV2 key={pack.id} pack={pack} />)
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />

      {user && (
        <AddPackModalV2 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addPack}
          isProject={contentTab === 'projetos'}
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Packs;
