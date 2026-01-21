import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlbumLink } from '@/hooks/useAlbumLinks';

interface AlbumLinkEditModalProps {
  link: AlbumLink | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { name?: string; link_url?: string; description?: string }) => void;
}

export function AlbumLinkEditModal({ link, isOpen, onClose, onSave }: AlbumLinkEditModalProps) {
  const [name, setName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (link) {
      setName(link.name);
      setLinkUrl(link.link_url);
      setDescription(link.description || '');
    }
  }, [link]);

  const handleSave = () => {
    if (!link || !name.trim() || !linkUrl.trim()) return;
    onSave(link.id, {
      name: name.trim(),
      link_url: linkUrl.trim(),
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do Link</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do pack/link" />
          </div>
          <div>
            <Label>URL</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Descrição (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do link" rows={3} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">Salvar</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
