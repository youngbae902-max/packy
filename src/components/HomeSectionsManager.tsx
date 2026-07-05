import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, Save, X, Check, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useHomeSectionsAdmin } from '@/hooks/useHomeSections';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';

export function HomeSectionsManager() {
  const { sections, createSection, updateSection, deleteSection, setSectionPacks } = useHomeSectionsAdmin();
  const { allApprovedPacks } = useSupabasePacks();
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredPacks = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = allApprovedPacks;
    if (!q) return list.slice(0, 200);
    return list.filter(p =>
      p.title.toLowerCase().includes(q) || (p.author_name || '').toLowerCase().includes(q)
    ).slice(0, 200);
  }, [allApprovedPacks, search]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createSection({ title: newTitle.trim(), display_order: sections.length + 1 });
      setNewTitle('');
      toast.success('Seção criada');
    } catch { toast.error('Erro ao criar seção'); }
  };

  const togglePackInSection = async (sectionId: string, packId: string) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    const has = sec.pack_ids.includes(packId);
    const next = has ? sec.pack_ids.filter(id => id !== packId) : [...sec.pack_ids, packId];
    try {
      await setSectionPacks({ sectionId, packIds: next });
    } catch { toast.error('Erro ao atualizar packs'); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <p className="text-[13px] font-bold mb-1">Nova seção da Home</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Crie carrosséis personalizados que aparecem na Home logo abaixo de "Projetos Premium".
        </p>
        <div className="flex gap-2">
          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Meus Favoritos" />
          <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1" /> Criar</Button>
        </div>
      </div>

      {sections.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">Nenhuma seção criada ainda.</p>
      )}

      {sections.map(sec => (
        <div key={sec.id} className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            {editingId === sec.id ? (
              <>
                <Input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} className="h-9" />
                <Button size="sm" onClick={async () => { await updateSection({ id: sec.id, title: editingTitle }); setEditingId(null); toast.success('Renomeada'); }}><Save className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <p className="flex-1 text-[15px] font-bold truncate">{sec.title}</p>
                <span className="text-[11px] text-muted-foreground">#{sec.display_order}</span>
                <Switch checked={sec.is_active} onCheckedChange={async v => { await updateSection({ id: sec.id, is_active: v }); }} />
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(sec.id); setEditingTitle(sec.title); }}><Edit3 className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={async () => { if (confirm('Excluir esta seção?')) { await deleteSection(sec.id); toast.success('Excluída'); } }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground">{sec.pack_ids.length} pack(s) selecionado(s)</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={sec.display_order}
                onChange={e => updateSection({ id: sec.id, display_order: Number(e.target.value) || 0 })}
                className="w-20 h-8 text-xs"
                title="Ordem"
              />
              <Button size="sm" variant="outline" onClick={() => setPickerFor(pickerFor === sec.id ? null : sec.id)}>
                {pickerFor === sec.id ? 'Fechar' : 'Escolher packs'}
              </Button>
            </div>
          </div>

          {pickerFor === sec.id && (
            <div className="border-t border-border/30 pt-3 space-y-3">
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pack por nome ou autor…" className="h-9" />
              <div className="max-h-[320px] overflow-y-auto pr-1 space-y-1">
                {filteredPacks.map(p => {
                  const checked = sec.pack_ids.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePackInSection(sec.id, p.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition ${checked ? 'bg-foreground/10 border border-foreground/40' : 'bg-transparent hover:bg-foreground/5 border border-transparent'}`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold truncate">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{p.author_name || '—'}</p>
                      </div>
                      {checked && <Check className="w-4 h-4 text-foreground" />}
                    </button>
                  );
                })}
                {filteredPacks.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">Nada encontrado.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
