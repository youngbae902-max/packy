import { useState } from 'react';
import { Disc, ExternalLink, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        <header className="flex items-center justify-between py-4">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-foreground/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2">
              <Disc className="w-6 h-6" /> Álbuns
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Coleções especiais</p>
          </div>
          {isAdmin ? (
            <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1">
              <Plus className="w-4 h-4" /> Novo
            </Button>
          ) : (
            <div className="w-10" />
          )}
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Carregando...</p>
        ) : approvedAlbums.length === 0 ? (
          <div className="text-center py-16">
            <Disc className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum álbum disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {approvedAlbums.map((album) => {
              const linksCount = getAlbumLinks(album.id).length;
              return (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbum(album.id)}
                  className="group flex flex-col text-left rounded-2xl bg-[hsl(0,0%,4%)] border border-border overflow-hidden hover:border-foreground/30 transition-colors"
                >
                  <div className="relative aspect-square w-full bg-[hsl(0,0%,2%)] overflow-hidden">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/70 text-white backdrop-blur-sm">
                      {linksCount} {linksCount === 1 ? 'link' : 'links'}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm truncate text-foreground">{album.title}</h3>
                    {album.style && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{album.style}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Album Detail Modal */}
      <Dialog open={!!selectedAlbum} onOpenChange={() => setSelectedAlbum(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[hsl(0,0%,4%)] border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {currentAlbum?.cover_url && (
                <img
                  src={currentAlbum.cover_url}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover"
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

          <div className="space-y-2 mt-4">
            {albumLinks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum link disponível</p>
            ) : (
              albumLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(0,0%,6%)] border border-border hover:border-foreground/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-foreground transition-colors">
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
