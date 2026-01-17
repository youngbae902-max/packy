import { useState } from 'react';
import { X, Upload, Disc } from 'lucide-react';
import { useAlbums } from '@/hooks/useAlbums';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAlbumModal({ isOpen, onClose }: AddAlbumModalProps) {
  const { addAlbum } = useAlbums();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Digite o título do álbum');
      return;
    }

    setIsUploading(true);

    try {
      let cover_url: string | undefined;

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(fileName);
        
        cover_url = publicUrl;
      }

      addAlbum({
        title: title.trim(),
        description: description.trim() || undefined,
        style: style.trim() || undefined,
        cover_url,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setStyle('');
      setCoverFile(null);
      setCoverPreview(null);
      onClose();
    } catch (error: any) {
      toast.error('Erro ao criar álbum: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStyle('');
    setCoverFile(null);
    setCoverPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Disc className="w-5 h-5" />
            Novo Álbum
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Packs ZN"
            />
          </div>

          <div>
            <Label>Estilo</Label>
            <Input
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Ex: Funk ZN"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do álbum..."
            />
          </div>

          <div>
            <Label>Capa do Álbum</Label>
            <div className="mt-2">
              {coverPreview ? (
                <div className="relative aspect-square max-w-[200px] rounded-lg overflow-hidden">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Clique para upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading} className="flex-1">
              {isUploading ? 'Criando...' : 'Criar Álbum'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
