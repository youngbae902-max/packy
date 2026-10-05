import { Edit, ExternalLink, Plus, Smartphone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApplications, Application } from '@/hooks/useApplications';

export function AdminApplicationsManager() {
  const { applications, isLoading, saveApplication, deleteApplication } = useApplications();
  const [editing, setEditing] = useState<Application | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  return (
    <section className="mt-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Aplicativos</h2>
          <p className="text-sm text-muted-foreground">Cadastre os aplicativos e links exibidos para os usuários.</p>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Carregando...</div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <Smartphone className="mx-auto h-7 w-7 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhum aplicativo cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-[#1B1B1B] flex items-center justify-center">
                {app.icon_url ? <img src={app.icon_url} alt="" className="h-full w-full object-cover" /> : <Smartphone className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{app.name}</p>
                <p className="text-xs text-muted-foreground truncate">{app.app_url}</p>
                <p className="text-[11px] mt-1 text-muted-foreground">{app.is_active ? 'Visível' : 'Oculto'}</p>
              </div>
              <div className="flex gap-1">
                <a href={app.app_url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 hover:bg-foreground/[0.06]">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button onClick={() => { setEditing(app); setOpen(true); }} className="rounded-lg p-2 hover:bg-foreground/[0.06]">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm('Remover este aplicativo?')) void deleteApplication(app.id); }} className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApplicationDialog
        application={editing}
        open={open}
        onOpenChange={setOpen}
        onSave={saveApplication}
      />
    </section>
  );
}

function ApplicationDialog({
  application,
  open,
  onOpenChange,
  onSave,
}: {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (application: Partial<Application> & { name: string; app_url: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    setName(application?.name || '');
    setDescription(application?.description || '');
    setAppUrl(application?.app_url || '');
    setIconUrl(application?.icon_url || '');
    setActive(application?.is_active ?? true);
  }, [application, open]);

  const submit = async () => {
    if (!name.trim() || !appUrl.trim()) return;
    await onSave({
      id: application?.id,
      name,
      description,
      app_url: appUrl,
      icon_url: iconUrl,
      is_active: active,
      display_order: application?.display_order ?? 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{application ? 'Editar aplicativo' : 'Adicionar aplicativo'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nome *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Koala Sampler" /></div>
          <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que é esse aplicativo?" rows={3} /></div>
          <div><Label>Link do aplicativo *</Label><Input value={appUrl} onChange={(e) => setAppUrl(e.target.value)} placeholder="https://..." /></div>
          <div><Label>URL do ícone (opcional)</Label><Input value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://..." /></div>
          <Button type="button" variant={active ? 'default' : 'outline'} className="w-full" onClick={() => setActive(!active)}>
            {active ? 'Visível para usuários' : 'Oculto para usuários'}
          </Button>
          <Button className="w-full" onClick={submit} disabled={!name.trim() || !appUrl.trim()}>Salvar aplicativo</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
