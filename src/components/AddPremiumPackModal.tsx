import { useState, useRef } from 'react';
import { X, ArrowLeft, Image as ImageIcon, Upload, Crown } from 'lucide-react';
import { Pack, PackType, packTypeLabels } from '@/types/pack';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddPremiumPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pack: Omit<Pack, 'id' | 'createdAt' | 'status' | 'isPremium'>) => void;
}

export function AddPremiumPackModal({ isOpen, onClose, onAdd }: AddPremiumPackModalProps) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PackType>('samples');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverPreview(result);
        setCoverUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author.trim() || !title.trim() || !downloadUrl.trim() || !price) {
      return;
    }

    onAdd({
      title: title.trim(),
      author: author.trim(),
      type,
      downloadUrl: downloadUrl.trim(),
      coverUrl: coverUrl || undefined,
      price: parseFloat(price),
    });

    // Reset form
    setAuthor('');
    setTitle('');
    setType('samples');
    setDownloadUrl('');
    setCoverUrl('');
    setCoverPreview(null);
    setPrice('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Crown className="w-6 h-6 text-premium" />
          <h2 className="text-2xl font-black text-center uppercase tracking-tight">
            Pack Premium
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Autor</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nome do autor"
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
              placeholder="Ex: Premium Drumkit"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 9.99"
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
            <label className="label-field">
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Capa do Pack
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-xl px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Carregar imagem
              </button>
              
              {coverPreview && (
                <div className="relative h-32 rounded-xl overflow-hidden">
                  <img 
                    src={coverPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreview(null);
                      setCoverUrl('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label-field">Link de Download</label>
            <input
              type="url"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="Link do arquivo"
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full text-sm uppercase tracking-wide bg-premium hover:bg-premium/90">
            <Crown className="w-4 h-4 mr-2" />
            Adicionar Pack Premium
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
