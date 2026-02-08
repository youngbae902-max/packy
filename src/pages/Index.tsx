import { useState } from 'react';
import { Plus, Settings, Crown, Instagram, Search, Filter, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
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
  
  const { allApprovedPacks, premiumPacks, isLoading, addPack } = useSupabasePacks();
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 pt-6 pb-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">PACKY</h1>
                <p className="text-xs text-muted-foreground">Sua central de packs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/mathewdcarmo?igsh=N2p5dXZlOHlhYThl"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-pink-500"
              >
                <Instagram className="w-5 h-5" />
              </a>
              {isAdmin && (
                <Link 
                  to="/admin"
                  className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-secondary/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">Packs Grátis</span>
              </div>
              <p className="text-2xl font-bold">{freePacks.length}</p>
            </div>
            <div className="bg-gradient-to-br from-warning/20 to-warning/5 backdrop-blur-sm rounded-2xl p-4 border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-warning" />
                <span className="text-xs text-muted-foreground">Premium</span>
              </div>
              <p className="text-2xl font-bold">{paidPacks.length}</p>
            </div>
          </div>

          {/* Quick Order Button */}
          <Button 
            variant="outline" 
            onClick={() => setShowOrderDialog(true)}
            className="w-full mb-4 h-12 rounded-2xl border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary/50"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Encomendar packs personalizados
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Events/Announcements */}
        {activeEvents.length > 0 && (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Eventos Ativos
            </h3>
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Add Pack Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full mb-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Enviar Novo Pack
        </button>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar packs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-2xl bg-secondary border-0"
            />
          </div>
          <Button 
            variant="secondary" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 w-12 rounded-2xl"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-secondary rounded-2xl">
            <label className="text-sm font-medium mb-2 block">Tipo de Pack</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="rounded-xl">
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
        <div className="flex gap-2 mb-6 p-1.5 bg-secondary rounded-2xl">
          <button
            onClick={() => setActiveSection('free')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeSection === 'free'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Grátis
          </button>
          <button
            onClick={() => setActiveSection('premium')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeSection === 'premium'
                ? 'bg-gradient-to-r from-warning to-warning/80 text-warning-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="w-4 h-4" />
            Premium
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <SupportCard />
        </div>

        {/* Packs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPacks.map((pack) => (
              <PackCardV2 key={pack.id} pack={pack} />
            ))}
          </div>
        )}

        {sortedPacks.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-secondary/30 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
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
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Encomendar Packs</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
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
        onAdd={addPack}
      />
      
      <BottomNav />
    </div>
  );
};

export default Index;
