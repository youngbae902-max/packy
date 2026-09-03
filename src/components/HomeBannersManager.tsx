import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, ImagePlus, Loader2, Pencil, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useHomeBannersAdmin, HomeBanner } from '@/hooks/useHomeBanners';

export function HomeBannersManager() {
  const { banners, uploadBanner, createBanner, updateBanner, deleteBanner } = useHomeBannersAdmin();
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<HomeBanner>>({});
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

  const handleReplace = async (file?: File | null) => {
    if (!file || !replacingId) return;
    const id = replacingId;
    setUploading(true);
    try {
      const url = await uploadBanner(file);
      await updateBanner({ id, image_url: url });
      toast.success('Foto do banner atualizada');
    } catch {
      toast.error('Erro ao trocar a foto');
    } finally {
      setUploading(false);
      setReplacingId(null);
      if (replaceRef.current) replaceRef.current.value = '';
    }
  };

  const startEdit = (b: HomeBanner) => {
    setEditingId(b.id);
    setDraft({ title: b.title, subtitle: b.subtitle, link_url: b.link_url });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateBanner({
        id: editingId,
        title: (draft.title || '')?.toString().trim() || null,
        subtitle: (draft.subtitle || '')?.toString().trim() || null,
        link_url: (draft.link_url || '')?.toString().trim() || null,
      });
      toast.success('Banner atualizado');
      setEditingId(null);
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleReplace(e.target.files?.[0])}
      />

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

      <div className="space-y-3">
        {banners.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum banner cadastrado.</p>
        )}
        {banners.map(b => (
          <div key={b.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="relative aspect-[16/9] w-full bg-muted/30">
              <img src={b.image_url} alt={b.title || 'Banner'} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setReplacingId(b.id); replaceRef.current?.click(); }}
                disabled={uploading}
                className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur text-xs font-semibold border border-border/60 hover:bg-background"
              >
                {uploading && replacingId === b.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5" />}
                Trocar foto
              </button>
            </div>

            <div className="p-3 space-y-3">
              {editingId === b.id ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Título"
                    value={draft.title ?? ''}
                    onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  />
                  <Input
                    placeholder="Subtítulo"
                    value={draft.subtitle ?? ''}
                    onChange={e => setDraft(d => ({ ...d, subtitle: e.target.value }))}
                  />
                  <Input
                    placeholder="Link"
                    value={draft.link_url ?? ''}
                    onChange={e => setDraft(d => ({ ...d, link_url: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1.5" onClick={saveEdit}>
                      <Check className="w-3.5 h-3.5" /> Salvar
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{b.title || 'Sem título'}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.subtitle || b.link_url || 'Sem link'}</p>
                  </div>
                  <button
                    onClick={() => startEdit(b)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label="Editar banner"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1 border-t border-border/50">
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] text-muted-foreground">Ordem</span>
                  <Input
                    type="number"
                    value={b.display_order}
                    onChange={e => updateBanner({ id: b.id, display_order: Number(e.target.value) })}
                    className="w-16 h-8"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 ml-auto">
                  <span className="text-[11px] text-muted-foreground">Ativo</span>
                  <Switch checked={b.is_active} onCheckedChange={v => updateBanner({ id: b.id, is_active: v })} />
                </div>
                <button
                  onClick={() => deleteBanner(b.id)}
                  className="p-2 mt-2 text-muted-foreground hover:text-destructive"
                  aria-label="Excluir banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
