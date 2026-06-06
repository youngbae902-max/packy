import { useState } from 'react';
import { ArrowLeft, Plus, Download, Edit2, Trash2, FileArchive, ImageIcon, Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserBeats, UserBeat } from '@/hooks/useUserBeats';
import { AddBeatModal } from '@/components/AddBeatModal';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

function formatSize(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function Up() {
  const { user, isLoading: authLoading } = useAuth();
  const { beats, loading, update, remove, getDownloadUrl } = useUserBeats();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<UserBeat | null>(null);
  const [editName, setEditName] = useState('');
  const [pending, setPending] = useState<string | null>(null);

  if (authLoading) return null;
  if (!user) return <Navigate to="/conta" replace />;

  async function handleDownload(beat: UserBeat) {
    setPending(beat.id);
    try {
      const url = await getDownloadUrl(beat);
      if (!url) { toast.error('Não foi possível obter o arquivo'); return; }
      window.open(url, '_blank');
    } finally { setPending(null); }
  }

  async function handleDelete(beat: UserBeat) {
    if (!confirm(`Excluir "${beat.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await remove(beat);
      toast.success('Beat removido');
    } catch { toast.error('Erro ao remover'); }
  }

  async function handleSaveEdit() {
    if (!editing || !editName.trim()) return;
    try {
      await update(editing.id, { name: editName.trim() });
      toast.success('Atualizado');
      setEditing(null);
    } catch { toast.error('Erro ao salvar'); }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 rounded-full hover:bg-foreground/10 text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-foreground" />
              <h1 className="text-2xl font-black tracking-tight">Up</h1>
            </div>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="rounded-full">
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mb-5 px-1">
          Sua biblioteca privada de beats. Ninguém além de você consegue ver, listar ou baixar esses arquivos.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : beats.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl">
            <FileArchive className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Você ainda não enviou nenhum beat.</p>
            <Button onClick={() => setShowAdd(true)} className="mt-4" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar beat
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {beats.map(beat => (
              <div key={beat.id} className="rounded-2xl bg-[hsl(0,0%,4%)] border border-border/40 overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div className="w-20 h-20 rounded-lg bg-[hsl(0,0%,2%)] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {beat.cover_url ? (
                      <img src={beat.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{beat.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {beat.storage_path ? formatSize(beat.size_bytes) : 'Link externo'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {format(new Date(beat.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-border/40 text-xs">
                  <button
                    onClick={() => handleDownload(beat)}
                    disabled={pending === beat.id}
                    className="flex items-center justify-center gap-1 py-2.5 text-foreground/90 hover:bg-foreground/5 transition"
                  >
                    {pending === beat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    Baixar
                  </button>
                  <button
                    onClick={() => { setEditing(beat); setEditName(beat.name); }}
                    className="flex items-center justify-center gap-1 py-2.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition border-l border-border/40"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(beat)}
                    className="flex items-center justify-center gap-1 py-2.5 text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition border-l border-border/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddBeatModal isOpen={showAdd} onClose={() => setShowAdd(false)} />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>Editar beat</DialogTitle></DialogHeader>
          <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-secondary border-border" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
