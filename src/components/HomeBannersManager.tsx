import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useHomeBannersAdmin } from '@/hooks/useHomeBanners';

export function HomeBannersManager() {
  const { banners, uploadBanner, createBanner, updateBanner, deleteBanner } = useHomeBannersAdmin();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBanner(file);
      await createBanner({
        image_url: url,
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
        link_url: linkUrl.trim() || null,
        display_order: banners.length + 1,
        is_active: true,
      });
      setTitle(''); setSubtitle(''); setLinkUrl('');
      toast.success('Banner adicionado');
    } catch {
      toast.error('Erro ao enviar banner');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Novo banner da Home</h3>
        <Input placeholder="Título (opcional)" value={title} onChange={e => setTitle(e.target.value)} />
        <Input placeholder="Subtítulo (opcional)" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        <Input placeholder="Link (opcional)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full gap-2">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {uploading ? 'Enviando...' : 'Enviar imagem (16:9)'}
        </Button>
      </div>

      <div className="space-y-2">
        {banners.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum banner cadastrado.</p>
        )}
        {banners.map(b => (
          <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-2">
            <img src={b.image_url} alt={b.title || 'Banner'} className="w-24 h-14 object-cover rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{b.title || 'Sem título'}</p>
              <p className="text-xs text-muted-foreground truncate">{b.link_url || 'Sem link'}</p>
            </div>
            <Input
              type="number"
              value={b.display_order}
              onChange={e => updateBanner({ id: b.id, display_order: Number(e.target.value) })}
              className="w-16 h-9"
            />
            <Switch
              checked={b.is_active}
              onCheckedChange={v => updateBanner({ id: b.id, is_active: v })}
            />
            <button
              onClick={() => deleteBanner(b.id)}
              className="p-2 text-muted-foreground hover:text-destructive"
              aria-label="Excluir banner"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
