import { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useReleasesSection } from '@/hooks/useReleasesSection';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';

export function ReleasesSectionManager() {
  const { config, saveConfig, isSaving } = useReleasesSection();
  const { allApprovedPacks } = useSupabasePacks();
  const [title, setTitle] = useState(config.title);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = allApprovedPacks.filter(p => p.pack_type !== 'project');
    if (!q) return list.slice(0, 100);
    return list
      .filter(p => p.title.toLowerCase().includes(q) || (p.author_name || '').toLowerCase().includes(q))
      .slice(0, 100);
  }, [allApprovedPacks, search]);

  const update = async (next: Parameters<typeof saveConfig>[0], msg = 'Salvo') => {
    try {
      await saveConfig(next);
      toast.success(msg);
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const togglePack = (id: string) => {
    const has = config.pack_ids.includes(id);
    const pack_ids = has ? config.pack_ids.filter(p => p !== id) : [...config.pack_ids, id];
    update({ pack_ids }, has ? 'Pack removido' : 'Pack adicionado');
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold">Mostrar seção</p>
            <p className="text-[11px] text-muted-foreground">Exibir "{config.title}" na Home</p>
          </div>
          <Switch checked={config.visible} onCheckedChange={v => update({ visible: v })} />
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">Título da seção</p>
          <div className="flex gap-2">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Lançamentos" />
            <Button size="sm" disabled={isSaving || !title.trim()} onClick={() => update({ title: title.trim() }, 'Título atualizado')}>
              Salvar
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">Quantidade de packs (modo automático)</p>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => update({ limit: n }, 'Quantidade atualizada')}
                className={`flex-1 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
                  config.limit === n ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border/40 text-muted-foreground'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">Modo</p>
          <div className="flex gap-2">
            {([
              { id: 'auto' as const, label: 'Automático (mais recentes)' },
              { id: 'manual' as const, label: 'Manual (escolher packs)' },
            ]).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => update({ mode: m.id }, 'Modo atualizado')}
                className={`flex-1 py-2 px-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                  config.mode === m.id ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border/40 text-muted-foreground'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {config.mode === 'manual' && (
        <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold">Packs selecionados ({config.pack_ids.length})</p>
            {config.pack_ids.length > 0 && (
              <button className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => update({ pack_ids: [] }, 'Seleção limpa')}>
                Limpar
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pack..." className="pl-9" />
          </div>

          <div className="max-h-72 overflow-y-auto rounded-xl border border-border/40 divide-y divide-border/40">
            {filtered.map(p => {
              const active = config.pack_ids.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePack(p.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary/60 transition-colors"
                >
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${active ? 'bg-foreground border-foreground' : 'border-border'}`}>
                    {active && <Check className="w-3.5 h-3.5 text-background" />}
                  </span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary shrink-0">
                    {p.cover_url && <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" />}
                  </div>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-medium truncate">{p.title}</span>
                    <span className="block text-[11px] text-muted-foreground truncate">{p.author_name}</span>
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && <p className="text-[12px] text-muted-foreground p-3">Nenhum pack encontrado.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
