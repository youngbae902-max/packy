import { useState } from 'react';
import { Music, ExternalLink, ChevronRight, Plus, Disc, Play } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useAlbums } from '@/hooks/useAlbums';
import { useAlbumLinks } from '@/hooks/useAlbumLinks';
import { useAuth } from '@/contexts/AuthContext';
import { AddAlbumModal } from '@/components/AddAlbumModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const Albums = () => {
  const { approvedAlbums, isLoading } = useAlbums();
  const { getAlbumLinks } = useAlbumLinks();
  const { isAdmin } = useAuth();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentAlbum = approvedAlbums.find(a => a.id === selectedAlbum);
  const albumLinks = selectedAlbum ? getAlbumLinks(selectedAlbum) : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
        
        <div className="relative max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Disc className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">ÁLBUNS</h1>
                <p className="text-sm text-muted-foreground">Coleções especiais</p>
              </div>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => setShowAddModal(true)}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-2">
        {/* Albums Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : approvedAlbums.length === 0 ? (
          <div className="text-center py-16 bg-secondary/30 rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Music className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">Nenhum álbum disponível</p>
            <p className="text-sm text-muted-foreground mt-2">Em breve novas coleções!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {approvedAlbums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album.id)}
                className="group relative overflow-hidden rounded-2xl bg-secondary border border-border hover:border-primary/50 transition-all text-left"
              >
                {/* Cover */}
                <div className="aspect-square relative overflow-hidden">
                  {album.cover_url ? (
                    <img 
                      src={album.cover_url} 
                      alt={album.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Music className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate">{album.title}</h3>
                  {album.style && (
                    <p className="text-xs text-muted-foreground truncate">{album.style}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary">{getAlbumLinks(album.id).length} links</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Album Detail Modal */}
      <Dialog open={!!selectedAlbum} onOpenChange={() => setSelectedAlbum(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl">
          {/* Album Header */}
          {currentAlbum && (
            <>
              <div className="relative h-48 overflow-hidden">
                {currentAlbum.cover_url ? (
                  <img 
                    src={currentAlbum.cover_url} 
                    alt={currentAlbum.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                    <Music className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-black text-foreground">{currentAlbum.title}</h2>
                  {currentAlbum.style && (
                    <p className="text-sm text-muted-foreground">{currentAlbum.style}</p>
                  )}
                </div>
              </div>

              <div className="p-4">
                {currentAlbum.description && (
                  <p className="text-sm text-muted-foreground mb-4">{currentAlbum.description}</p>
                )}

                <ScrollArea className="h-[40vh]">
                  <div className="space-y-2 pr-4">
                    {albumLinks.length === 0 ? (
                      <div className="text-center py-8">
                        <ExternalLink className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Nenhum link disponível</p>
                      </div>
                    ) : (
                      albumLinks.map((link, index) => (
                        <a
                          key={link.id}
                          href={link.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/50 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {link.name}
                            </p>
                            {link.description && (
                              <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                        </a>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AddAlbumModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <BottomNav />
    </div>
  );
};

export default Albums;
