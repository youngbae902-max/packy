import { useState } from 'react';
import { Plus, Settings, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PackCard } from '@/components/PackCard';
import { SupportCard } from '@/components/SupportCard';
import { AddPackModal } from '@/components/AddPackModal';
import { usePacks } from '@/hooks/usePacks';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'free' | 'premium'>('free');
  const { approvedPacks, premiumPacks, addPack } = usePacks();

  const currentPacks = activeSection === 'free' ? approvedPacks : premiumPacks;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pb-12">
        <div className="flex justify-end pt-4">
          <Link 
            to="/admin"
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        <Header />

        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-full text-sm uppercase tracking-wide"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pack
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection('free')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeSection === 'free'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Packs Grátis
          </button>
          <button
            onClick={() => setActiveSection('premium')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeSection === 'premium'
                ? 'bg-premium text-premium-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Crown className="w-4 h-4" />
            Premium
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <SupportCard />
        </div>

        <div className="space-y-4">
          {currentPacks.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>

        {currentPacks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {activeSection === 'free' 
                ? 'Nenhum pack aprovado ainda.' 
                : 'Nenhum pack premium disponível.'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {activeSection === 'free' 
                ? 'Envie seu pack e aguarde a aprovação!' 
                : 'Em breve novos packs premium!'}
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
