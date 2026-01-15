import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Pack, PackType, packTypeLabels } from '@/types/pack';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pack: Omit<Pack, 'id' | 'createdAt'>) => void;
}

export function AddPackModal({ isOpen, onClose, onAdd }: AddPackModalProps) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PackType>('samples');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author.trim() || !title.trim() || !downloadUrl.trim()) {
      return;
    }

    onAdd({
      title: title.trim(),
      author: author.trim(),
      type,
      downloadUrl: downloadUrl.trim(),
      isExclusive: true,
    });

    // Reset form
    setAuthor('');
    setTitle('');
    setType('samples');
    setDownloadUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-card rounded-3xl p-8 shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-tight">
          Postar Pack
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Teu Vulgo</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex: JVXT"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Nome do Pack</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Drumkit Vol. 1"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Tipo de Conteúdo</label>
            <Select value={type} onValueChange={(value) => setType(value as PackType)}>
              <SelectTrigger className="input-field border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(packTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="label-field">Link de Download</label>
            <input
              type="url"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="Mediafire ou Google Drive"
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full text-sm uppercase tracking-wide">
            Enviar para Análise
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à Galeria
          </button>
        </form>
      </div>
    </div>
  );
}
