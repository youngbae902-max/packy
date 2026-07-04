import { useState, useMemo } from 'react';
import { useHomeSections } from '@/hooks/useHomeSections';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowUp, ArrowDown, X, Search, Eye, EyeOff } from 'lucide-react';

export function HomeSectionsAdmin() {
  const {
    sections, sectionPacks, isLoading,
    createSection, updateSection, deleteSection,
    addPackToSection, removePackFromSection,
  } = useHomeSections();
  const { allApprovedPacks, projectPacks } = useSupabasePacks();

  const allPacks = useMemo(
    () => [...allApprovedPacks, ...projectPacks],
    [allApprovedPacks, projectPacks]
  );

  const [newTitle, setNewTitle] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const packsBySection = useMemo(() => {
    const m = new Map<string, typeof sectionPacks>();
    for (const sp of sectionPacks) {
      const arr = m.get(sp.section_id) || [];
      arr.push(sp);
      m.set(sp.section_id, arr);
    }
    return m;
  }, [sectionPacks]);

  if (isLoading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...sections].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(s => s.id === id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    updateSection({ id, display_order: swap.display_order });
    updateSection({ id: swap.id, display_order: sorted[idx].display_order });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-bold text-sm mb-2">Nova Seção da Home</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Lançamentos, Projetos, Bombando..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!newTitle.trim()) return;
              createSection({ title: newTitle.trim(), display_order: sections.length });
              setNewTitle('');
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Criar
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Sem seções. Crie uma acima para começar.
          </p>
        )}
        {[...sections].sort((a, b) => a.display_order - b.display_order).map((s) => {
          const items = (packsBySection.get(s.id) || []).sort((a, b) => a.display_order - b.display_order);
          const packLookup = new Map(allPacks.map(p => [p.id, p]));
          const isOpen = expanded === s.id;
          const filtered = search.trim()
            ? allPacks.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
            : allPacks.slice(0, 20);

          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <Input
                  value={s.title}
                  onChange={(e) => updateSection({ id: s.id, title: e.target.value })}
                  className="font-bold text-base flex-1"
                />
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => move(s.id, -1)}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => move(s.id, 1)}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateSection({ id: s.id, is_active: !s.is_active })}
                    title={s.is_active ? 'Ocultar' : 'Mostrar'}
                  >
                    {s.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remover seção "${s.title}"?`)) deleteSection(s.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-2">
                {items.length} pack(s) · Ordem #{s.display_order}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {items.map((sp) => {
                  const p = packLookup.get(sp.pack_id);
                  return (
                    <div key={sp.id} className="inline-flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1 text-xs">
                      <span className="truncate max-w-[160px]">{p?.title || '(pack removido)'}</span>
                      <button onClick={() => removePackFromSection(sp.id)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpanded(isOpen ? null : s.id)}
              >
                <Plus className="w-4 h-4 mr-1" /> {isOpen ? 'Fechar' : 'Adicionar packs'}
              </Button>

              {isOpen && (
                <div className="mt-3 border-t pt-3">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pack..."
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filtered.map(p => {
                      const already = items.some(i => i.pack_id === p.id);
                      return (
                        <button
                          key={p.id}
                          disabled={already}
                          onClick={() => addPackToSection({ section_id: s.id, pack_id: p.id, display_order: items.length })}
                          className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-secondary text-sm disabled:opacity-40"
                        >
                          <div className="w-8 h-8 bg-muted rounded overflow-hidden shrink-0">
                            {p.cover_url && <img src={p.cover_url} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <span className="truncate flex-1">{p.title}</span>
                          {already && <span className="text-[10px] text-muted-foreground">já adicionado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
