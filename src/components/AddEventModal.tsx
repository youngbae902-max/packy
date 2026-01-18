import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSiteEvents, SiteEvent } from '@/hooks/useSiteEvents';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent?: SiteEvent | null;
}

export function AddEventModal({ isOpen, onClose, editingEvent }: AddEventModalProps) {
  const { addEvent, updateEvent } = useSiteEvents();
  const [type, setType] = useState<SiteEvent['type']>(editingEvent?.type || 'text');
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [content, setContent] = useState(editingEvent?.content || '');
  const [linkUrl, setLinkUrl] = useState(editingEvent?.link_url || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      if (editingEvent) {
        updateEvent({
          id: editingEvent.id,
          type,
          title: title.trim(),
          content: content.trim() || null,
          link_url: linkUrl.trim() || null,
        });
      } else {
        addEvent({
          type,
          title: title.trim(),
          content: content.trim() || null,
          link_url: linkUrl.trim() || null,
          is_active: true,
          display_order: 0,
        });
      }
      onClose();
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setType('text');
    setTitle('');
    setContent('');
    setLinkUrl('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Editar' : 'Nova'} Divulgação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <Select value={type} onValueChange={(v) => setType(v as SiteEvent['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="text_link">Texto + Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da divulgação"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Conteúdo (opcional)</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descrição ou mensagem..."
            />
          </div>

          {(type === 'youtube' || type === 'instagram' || type === 'whatsapp' || type === 'text_link') && (
            <div>
              <label className="text-sm font-medium mb-2 block">Link</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Salvando...' : editingEvent ? 'Salvar' : 'Criar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
