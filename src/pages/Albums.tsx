import { useState } from 'react';
import { Music, ExternalLink, ChevronRight, Plus } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useAlbums } from '@/hooks/useAlbums';
import { useAlbumLinks } from '@/hooks/useAlbumLinks';
import { useAuth } from '@/contexts/AuthContext';
import { AddAlbumModal } from '@/components/AddAlbumModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">ÁLBUNS</h1>
            <p className="text-sm text-muted-foreground mt-1">Coleções especiais</p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          )}
        </header>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : approvedAlbums.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum álbum disponível</p>
            </div>
          ) : (
            approvedAlbums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album.id)}
                className="w-full pack-card flex items-center gap-4 text-left hover:border-primary/50 transition-all"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {album.cover_url ? (
                    <img 
                      src={album.cover_url} 
                      alt={album.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{album.title}</h3>
                  {album.style && (
                    <p className="text-sm text-muted-foreground">{album.style}</p>
                  )}
                  {album.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{album.description}</p>
                  )}
                  <p className="text-xs text-primary mt-2">
                    {getAlbumLinks(album.id).length} links
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Album Detail Modal */}
      <Dialog open={!!selectedAlbum} onOpenChange={() => setSelectedAlbum(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {currentAlbum?.cover_url && (
                <img 
                  src={currentAlbum.cover_url} 
                  alt="" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="text-left">{currentAlbum?.title}</p>
                {currentAlbum?.style && (
                  <p className="text-sm font-normal text-muted-foreground">{currentAlbum.style}</p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {currentAlbum?.description && (
            <p className="text-sm text-muted-foreground">{currentAlbum.description}</p>
          )}

          <div className="space-y-3 mt-4">
            {albumLinks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum link disponível</p>
            ) : (
              albumLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {link.name}
                    </p>
                    {link.description && (
                      <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </a>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddAlbumModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <BottomNav />
    </div>
  );
};

export default Albums;
