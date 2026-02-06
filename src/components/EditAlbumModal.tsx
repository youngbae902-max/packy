import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import type { Album } from '@/hooks/useAlbums';

interface EditAlbumModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Album>) => void;
}

export function EditAlbumModal({ album, isOpen, onClose, onSave }: EditAlbumModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (album) {
      setTitle(album.title);
      setDescription(album.description || '');
      setStyle(album.style || '');
      setCoverUrl(album.cover_url || '');
    }
  }, [album]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileName = `albums/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('covers').upload(fileName, file);
      
      if (error) throw error;
      
      const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
      setCoverUrl(data.publicUrl);
      toast.success('Capa atualizada!');
    } catch {
      toast.error('Erro ao fazer upload da capa');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!album || !title.trim()) return;
    
    onSave(album.id, {
      title: title.trim(),
      description: description.trim() || null,
      style: style.trim() || null,
      cover_url: coverUrl || null,
    });
    onClose();
  };

  if (!album) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Álbum</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Cover Image */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sem capa
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                disabled={isUploading}
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Clique na imagem para alterar a capa do álbum
              </p>
            </div>
          </div>

          <div>
            <Label>Título do Álbum *</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Nome do álbum" 
            />
          </div>

          <div>
            <Label>Estilo</Label>
            <Input 
              value={style} 
              onChange={(e) => setStyle(e.target.value)} 
              placeholder="Ex: Funk, Trap, Hip-Hop..." 
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Descrição do álbum..." 
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1" disabled={!title.trim()}>
              Salvar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
