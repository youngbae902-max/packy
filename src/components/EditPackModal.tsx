import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, Image as ImageIcon, Upload, Star } from 'lucide-react';
import { Pack } from '@/hooks/useSupabasePacks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

const packTypeLabels: Record<string, string> = {
  samples: 'Samples',
  drumkit: 'Drumkit',
  loops: 'Loops',
  presets: 'Presets',
  project: 'Projeto',
  other: 'Outros',
};

interface EditPackModalProps {
  isOpen: boolean;
  pack: Pack | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Pack>) => Promise<void>;
}

export function EditPackModal({ isOpen, pack, onClose, onSave }: EditPackModalProps) {
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [packType, setPackType] = useState<Pack['pack_type']>('samples');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [creditChannelUrl, setCreditChannelUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isExclusive, setIsExclusive] = useState(false);
  const [requiresShortener, setRequiresShortener] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pack) {
      setAuthorName(pack.author_name || '');
      setTitle(pack.title);
      setPackType(pack.pack_type);
      setDownloadUrl(pack.download_url);
      setCreditChannelUrl(pack.credit_channel_url || '');
      setCoverUrl(pack.cover_url || '');
      setCoverPreview(pack.cover_url || null);
      setIsExclusive(pack.is_exclusive);
      setRequiresShortener(!!pack.requires_shortener);
      setIsPremium(pack.is_premium);
      setPrice(pack.price?.toString() || '');
    }
  }, [pack]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('covers')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);
      
      setCoverUrl(urlData.publicUrl);
      setCoverPreview(urlData.publicUrl);
    } catch (error) {
      console.error('Error uploading cover:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pack || !title.trim() || !downloadUrl.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(pack.id, {
        title: title.trim(),
        author_name: authorName.trim() || null,
        pack_type: packType,
        download_url: downloadUrl.trim(),
        credit_channel_url: creditChannelUrl.trim() || null,
        cover_url: coverUrl || null,
        is_exclusive: isExclusive,
        requires_shortener: requiresShortener,
        is_premium: isPremium,
        price: price ? parseFloat(price) : null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !pack) return null;

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

        <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-tight">
          Editar Pack
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Autor</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="input-field"
              placeholder="Nome do autor"
            />
          </div>

          <div>
            <label className="label-field">Nome do Pack</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Tipo de Conteúdo</label>
            <Select value={packType} onValueChange={(value) => setPackType(value as Pack['pack_type'])}>
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
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-xl px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Enviando...' : 'Alterar imagem'}
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
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Link do Canal (Crédito)</label>
            <input
              type="url"
              value={creditChannelUrl}
              onChange={(e) => setCreditChannelUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="input-field"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="exclusive-edit"
                checked={isExclusive}
                onCheckedChange={(checked) => setIsExclusive(checked === true)}
              />
              <label htmlFor="exclusive-edit" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1">
                <Star className="w-3 h-3 text-warning" />
                Marcar como Exclusivo
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="shortener-edit"
                checked={requiresShortener}
                onCheckedChange={(checked) => setRequiresShortener(checked === true)}
              />
              <label htmlFor="shortener-edit" className="text-sm text-muted-foreground cursor-pointer">
                Passar pelo encurtador
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="premium-edit"
                checked={isPremium}
                onCheckedChange={(checked) => setIsPremium(checked === true)}
              />
              <label htmlFor="premium-edit" className="text-sm text-muted-foreground cursor-pointer">
                Pack Premium (Pago)
              </label>
            </div>

            {isPremium && (
              <div>
                <label className="label-field">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field"
                  required={isPremium}
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="btn-primary w-full text-sm uppercase tracking-wide"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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