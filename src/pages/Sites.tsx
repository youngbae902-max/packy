import { useState, useRef } from 'react';
import { Globe, Plus, ExternalLink, Trash2, Pencil, X, Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useSites, Site } from '@/hooks/useSites';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Sites = () => {
  const { isAdmin } = useAuth();
  const { sites, isLoading, addSite, updateSite, deleteSite, uploadSiteImage } = useSites();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setName(''); setDescription(''); setSiteUrl(''); setImageUrl('');
    setIsFormOpen(true);
  };

  const openEdit = (s: Site) => {
    setEditing(s);
    setName(s.name);
    setDescription(s.description || '');
    setSiteUrl(s.site_url);
    setImageUrl(s.image_url || '');
    setIsFormOpen(true);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(f);
      setImageUrl(url);
      toast.success('Imagem enviada');
    } catch {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !siteUrl.trim()) return toast.error('Preencha nome e link');
    try {
      if (editing) {
        await updateSite({ id: editing.id, name, description, site_url: siteUrl, image_url: imageUrl });
        toast.success('Site atualizado');
      } else {
        await addSite({ name, description, site_url: siteUrl, image_url: imageUrl, display_order: 0 });
        toast.success('Site adicionado');
      }
      setIsFormOpen(false);
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este site?')) return;
    try {
      await deleteSite(id);
      toast.success('Site removido');
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-5">
        <header className="flex items-center gap-3 py-2">
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-foreground/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight leading-none">Sites</h1>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">Sites parceiros e ferramentas</p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={openNew} className="gap-1.5 rounded-xl h-9">
              <Plus className="w-4 h-4" /> Novo
            </Button>
          )}
        </header>

        <div className="space-y-3 mt-5">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-2xl bg-[#1C1C1C] border border-border/60 overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] w-full bg-foreground/5" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-foreground/10" />
                    <div className="h-3 w-2/3 rounded bg-foreground/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : sites.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border/60">
              <Globe className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum site ainda</p>
            </div>
          ) : (
            sites.map((s) => (
              <article
                key={s.id}
                className="group rounded-2xl bg-[#1C1C1C] border border-border/60 overflow-hidden transition-colors hover:border-foreground/25"
              >
                <a href={s.site_url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative aspect-[16/9] w-full bg-[#141414] overflow-hidden">
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Globe className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <h3 className="absolute left-4 bottom-3 right-4 text-[15px] font-semibold tracking-tight truncate">
                      {s.name}
                    </h3>
                  </div>
                </a>

                <div className="p-4 pt-3">
                  {s.description && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">{s.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <a
                      href={s.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[13px] py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Ir pro site <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                          aria-label="Editar site"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                          aria-label="Excluir site"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>


      {/* Admin form */}
      {isFormOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black uppercase mb-6">
              {editing ? 'Editar Site' : 'Novo Site'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Imagem</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="" className="w-full aspect-[16/9] object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/70 text-white text-xs rounded-lg"
                    >
                      Trocar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 bg-muted/50 border border-border border-dashed rounded-xl px-4 py-6 text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Enviando...' : 'Carregar imagem'}
                  </button>
                )}
              </div>
              <div>
                <label className="label-field">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Descrição / O que faz</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="label-field">Link do site</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                {editing ? 'Salvar' : 'Adicionar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Sites;
