import { useState } from 'react';
import { Disc, Plus, ChevronRight } from 'lucide-react';
import { useAlbums } from '@/hooks/useAlbums';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PackCardV2 } from '@/components/PackCardV2';
import { AddAlbumModal } from '@/components/AddAlbumModal';

export default function Albums() {
  const { albums, albumPacks, isLoading } = useAlbums();
  const { allApprovedPacks } = useSupabasePacks();
  const { isAdmin } = useAuth();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getPacksForAlbum = (albumId: string) => {
    const packIds = albumPacks
      .filter(ap => ap.album_id === albumId)
      .map(ap => ap.pack_id);
    return allApprovedPacks.filter(p => packIds.includes(p.id));
  };

  const selectedAlbumData = albums.find(a => a.id === selectedAlbum);
  const selectedAlbumPacks = selectedAlbum ? getPacksForAlbum(selectedAlbum) : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Disc className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Álbuns</h1>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Novo
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-12">
            <Disc className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum álbum disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {albums.map((album) => {
              const packsCount = albumPacks.filter(ap => ap.album_id === album.id).length;
              
              return (
                <Card
                  key={album.id}
                  className="overflow-hidden cursor-pointer hover:ring-2 ring-primary/50 transition-all"
                  onClick={() => setSelectedAlbum(album.id)}
                >
                  <div className="aspect-square bg-muted relative">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <h3 className="font-bold text-white truncate">{album.title}</h3>
                      <p className="text-xs text-white/70">{packsCount} packs</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Album Detail Modal */}
      <Dialog open={!!selectedAlbum} onOpenChange={() => setSelectedAlbum(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Disc className="w-5 h-5" />
              {selectedAlbumData?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlbumData?.cover_url && (
            <div className="aspect-video rounded-lg overflow-hidden mb-4">
              <img
                src={selectedAlbumData.cover_url}
                alt={selectedAlbumData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {selectedAlbumData?.description && (
            <p className="text-muted-foreground mb-4">{selectedAlbumData.description}</p>
          )}
          
          {selectedAlbumData?.style && (
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Estilo:</span>
              <span className="ml-2 text-sm font-medium">{selectedAlbumData.style}</span>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              Packs do Álbum
              <ChevronRight className="w-4 h-4" />
            </h4>
            {selectedAlbumPacks.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum pack neste álbum ainda.</p>
            ) : (
              <div className="space-y-3">
                {selectedAlbumPacks.map((pack) => (
                  <PackCardV2 key={pack.id} pack={pack} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddAlbumModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
}
