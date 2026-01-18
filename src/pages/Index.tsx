import { useState } from 'react';
import { Plus, Settings, Crown, Instagram, Search, Filter, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PackCardV2 } from '@/components/PackCardV2';
import { SupportCard } from '@/components/SupportCard';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { EventCard } from '@/components/EventCard';
import { BottomNav } from '@/components/BottomNav';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'free' | 'premium'>('free');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  
  const { allApprovedPacks, premiumPacks, isLoading } = useSupabasePacks();
  const { activeEvents } = useSiteEvents();
  const { isAdmin } = useAuth();

  // Filter out project packs for this page
  const freePacks = allApprovedPacks.filter(p => p.pack_type !== 'project' && !p.is_premium);
  const paidPacks = premiumPacks.filter(p => p.pack_type !== 'project');
  
  const currentPacks = activeSection === 'free' ? freePacks : paidPacks;

  // Apply search and filters
  const filteredPacks = currentPacks.filter(pack => {
    const matchesSearch = !searchTerm || 
      pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pack.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || pack.pack_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Sort: pinned first
  const sortedPacks = [...filteredPacks].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Top Bar */}
        <div className="flex items-center justify-between pt-4 mb-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowOrderDialog(true)}
            className="text-xs"
          >
            <ShoppingBag className="w-3 h-3 mr-1" />
            Encomendar packs
          </Button>
          
          <div className="flex gap-2">
            <a
              href="https://www.instagram.com/mathewdcarmo?igsh=N2p5dXZlOHlhYThl"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted transition-colors text-pink-500"
            >
              <Instagram className="w-5 h-5" />
            </a>
            {isAdmin && (
              <Link 
                to="/admin"
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        <Header />

        {/* Events/Announcements */}
        {activeEvents.length > 0 && (
          <div className="mb-6 space-y-2">
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-full text-sm uppercase tracking-wide"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pack
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar packs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="mb-4 p-3 bg-card rounded-lg border">
            <label className="text-sm font-medium mb-2 block">Tipo de Pack</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="samples">Samples</SelectItem>
                <SelectItem value="presets">Presets</SelectItem>
                <SelectItem value="drumkit">Drumkit</SelectItem>
                <SelectItem value="loops">Loops</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

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

        {/* Packs Grid - Horizontal on Desktop */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPacks.map((pack) => (
              <PackCardV2 key={pack.id} pack={pack} />
            ))}
          </div>
        )}

        {sortedPacks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum pack encontrado.' : activeSection === 'free' 
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

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encomendar Packs</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Em breve...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidade estará disponível em breve!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <AddPackModalV2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <BottomNav />
    </div>
  );
};

export default Index;
