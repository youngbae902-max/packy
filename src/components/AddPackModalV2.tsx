import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const packTypes = [
  { value: 'samples', label: 'Samples' },
  { value: 'drumkit', label: 'Drumkit' },
  { value: 'loops', label: 'Loops' },
  { value: 'presets', label: 'Presets' },
  { value: 'project', label: 'Projeto' },
  { value: 'other', label: 'Outros' },
];

interface AddPackModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pack: any) => Promise<any>;
  isProject?: boolean;
}

export function AddPackModalV2({ isOpen, onClose, onAdd, isProject = false }: AddPackModalV2Props) {
  const { user, profile } = useAuth();
  const [authorName, setAuthorName] = useState(profile?.artist_name || '');
  const [title, setTitle] = useState('');
  const [packType, setPackType] = useState<string>(isProject ? 'project' : 'samples');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [creditChannelUrl, setCreditChannelUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isExclusive, setIsExclusive] = useState(false);
  const [requiresShortener, setRequiresShortener] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);
      
      setCoverPreview(publicUrl);
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !downloadUrl.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Apply user's pack-name template: "PREFIXO | NOME EMOJI"
    const prefix = (profile as any)?.pack_name_prefix?.trim();
    const emoji = (profile as any)?.pack_name_emoji?.trim();
    const baseName = title.trim();
    const composed = [
      prefix ? `${prefix} | ${baseName}` : baseName,
      emoji || '',
    ].filter(Boolean).join(' ');

    try {
      await onAdd({
        title: composed,
        author_name: isAnonymous ? null : (authorName.trim() || profile?.artist_name || 'Anônimo'),
        pack_type: packType,
        download_url: downloadUrl.trim(),
        cover_url: coverPreview,
        credit_channel_url: creditChannelUrl.trim() || null,
        is_exclusive: isExclusive,
        is_anonymous: isAnonymous,
        is_premium: false,
        is_admin_pack: false,
        is_pinned: false,
        requires_shortener: requiresShortener,
        price: null,
      });

      toast.success('Pack enviado para análise!');
      
      // Reset form
      setAuthorName('');
      setTitle('');
      setPackType(isProject ? 'project' : 'samples');
      setDownloadUrl('');
      setCreditChannelUrl('');
      setCoverPreview(null);
      setIsExclusive(false);
      setRequiresShortener(false);
      setIsAnonymous(false);
      onClose();
    } catch (error) {
      toast.error('Erro ao enviar pack');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
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
          {isProject ? 'Enviar Projeto' : 'Postar Pack'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Teu Vulgo</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Ex: JVXT"
              className="input-field"
              disabled={isAnonymous}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">
              Postar como Anônimo
            </label>
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
            {((profile as any)?.pack_name_prefix || (profile as any)?.pack_name_emoji) && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Será publicado como:{' '}
                <span className="font-mono text-foreground/80">
                  {(profile as any)?.pack_name_prefix ? `${(profile as any).pack_name_prefix} | ` : ''}
                  {title || 'NOME'}
                  {(profile as any)?.pack_name_emoji ? ` ${(profile as any).pack_name_emoji}` : ''}
                </span>
              </p>
            )}
          </div>

          {!isProject && (
            <div>
              <label className="label-field">Tipo de Conteúdo</label>
              <Select value={packType} onValueChange={setPackType}>
                <SelectTrigger className="input-field border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {packTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="label-field">
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Capa do Pack (opcional)
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
                {isUploading ? 'Enviando...' : 'Carregar imagem'}
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
                    onClick={() => setCoverPreview(null)}
                    className="absolute top-2 right-2 p-1 bg-black/80 rounded-full hover:bg-black transition-colors"
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
              placeholder="Mediafire ou Google Drive"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Link para Dar Crédito (opcional)</label>
            <input
              type="url"
              value={creditChannelUrl}
              onChange={(e) => setCreditChannelUrl(e.target.value)}
              placeholder="YouTube, TikTok, Instagram..."
              className="input-field"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Quem baixar precisará acessar seu canal primeiro
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="exclusive"
              checked={isExclusive}
              onCheckedChange={(checked) => setIsExclusive(checked === true)}
            />
            <label htmlFor="exclusive" className="text-sm text-muted-foreground cursor-pointer">
              Marcar como Exclusivo ⭐
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="shortener"
              checked={requiresShortener}
              onCheckedChange={(checked) => setRequiresShortener(checked === true)}
            />
            <label htmlFor="shortener" className="text-sm text-muted-foreground cursor-pointer">
              Passar pelo encurtador
            </label>
          </div>

          <button type="submit" className="btn-primary w-full text-sm uppercase tracking-wide">
            Enviar para Análise
          </button>
        </form>
      </div>
    </div>
  );
}
