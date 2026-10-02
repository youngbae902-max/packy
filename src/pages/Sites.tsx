import { useState, useRef } from 'react';
import { Globe, ExternalLink, Trash2, Pencil, X, Upload, } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useSites, Site } from '@/hooks/useSites';
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
          <Link to="/" className="p-1.5 -ml-2 rounded-xl hover:bg-foreground/5 transition-colors" aria-label="Voltar">
            <span className="text-xl leading-none">&lt;</span>
          </Link>
        </header>

        <div className="space-y-2.5 mt-5">
          {isLoading ? (
            <div className="space-y-2.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-lg bg-[#1B1B1D] border border-[#2B2B2F] overflow-hidden animate-pulse">
                  <div className="h-36 w-full bg-[#151517]" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-foreground/10" />
                    <div className="h-3 w-2/3 rounded bg-foreground/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : sites.length === 0 ? (
            <div className="text-center py-20 rounded-xl border border-dashed border-border/60">
              <Globe className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum site ainda</p>
            </div>
          ) : (
            sites.map((s) => (
              <article
                key={s.id}
                className="group rounded-lg bg-[#1B1B1D] border border-[#2B2B2F] overflow-hidden transition-colors hover:border-[#3A3A3F]"
              >
                <a href={s.site_url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative h-36 w-full bg-[#151517] overflow-hidden">
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Globe className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </a>

                <div className="p-3.5">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-foreground truncate">{s.name}</h3>
                    {s.description && (
                      <p className="mt-1 text-[13px] text-muted-foreground leading-[1.45] line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-muted-foreground/60 truncate">{s.site_url}</p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#29292D]">
                    <a
                      href={s.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-foreground hover:underline"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </a>
                    {isAdmin && (
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-[#252529] transition-colors"
                          aria-label="Editar site"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Excluir site"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>     </div>


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
