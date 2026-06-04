import { useState } from 'react';
import { Plus, Settings, Crown, Instagram, Search, Filter, ShoppingBag, MoreVertical, Music2 } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'free' | 'premium'>('free');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  
  const { allApprovedPacks, approvedPacks, premiumPacks, isLoading, addPack } = useSupabasePacks();
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
        {/* Top Bar — icon-only */}
        <div className="flex items-center justify-between pt-4 mb-2">
          <button
            onClick={() => setShowOrderDialog(true)}
            aria-label="Encomendar packs"
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>

          <div className="flex gap-1 items-center">
            <a
              href="https://www.instagram.com/mathewdcarmo?igsh=N2p5dXZlOHlhYThl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full hover:bg-muted transition-colors text-pink-500"
            >
              <Instagram className="w-5 h-5" />
            </a>
            {isAdmin && (
              <Link
                to="/admin"
                aria-label="Admin"
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Mais" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[hsl(0,0%,4%)] border-border/60">
                <DropdownMenuItem onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> Novo pack
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        {/* Section Tabs — icon-only */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection('free')}
            aria-label="Packs grátis"
            className={`flex-1 flex items-center justify-center py-3 rounded-xl transition-all ${
              activeSection === 'free'
                ? 'bg-[hsl(0,0%,8%)] text-foreground border border-border'
                : 'bg-[hsl(0,0%,4%)] text-muted-foreground hover:text-foreground'
            }`}
          >
            <Music2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveSection('premium')}
            aria-label="Premium"
            className={`flex-1 flex items-center justify-center py-3 rounded-xl transition-all ${
              activeSection === 'premium'
                ? 'bg-[hsl(0,0%,8%)] text-foreground border border-border'
                : 'bg-[hsl(0,0%,4%)] text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <SupportCard />
        </div>

        {/* Packs Grid - Masonry Layout */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
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
        onAdd={addPack}
      />
      
      <BottomNav />
    </div>
  );
};

export default Index;
