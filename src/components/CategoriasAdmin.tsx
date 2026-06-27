import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function CategoriasAdmin() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [newCatName, setNewCatName] = useState('');
  const [newCatOrder, setNewCatOrder] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState('0');
  const [editActive, setEditActive] = useState(true);

  if (isLoading) return <p className="text-muted-foreground">Carregando categorias...</p>;

  const handleCreate = async () => {
    if (!newCatName.trim()) return;
    await createCategory({
      name: newCatName.trim(),
      display_order: parseInt(newCatOrder) || 0,
      is_active: true
    });
    setNewCatName('');
    setNewCatOrder('0');
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditOrder(cat.display_order.toString());
    setEditActive(cat.is_active);
  };

  const handleSave = async (id: string) => {
    await updateCategory({
      id,
      name: editName.trim(),
      display_order: parseInt(editOrder) || 0,
      is_active: editActive
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-bold mb-4">Adicionar Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Nome</Label>
            <Input 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              placeholder="Ex: Lançamentos" 
            />
          </div>
          <div>
            <Label>Ordem de Exibição</Label>
            <Input 
              type="number" 
              value={newCatOrder} 
              onChange={e => setNewCatOrder(e.target.value)} 
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold">Categorias Atuais</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada.</p>
        ) : (
          categories.map(cat => (
            <Card key={cat.id} className="p-4 flex items-center justify-between">
              {editingId === cat.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-2">
                    <Input 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Input 
                      type="number" 
                      value={editOrder} 
                      onChange={e => setEditOrder(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editActive} onCheckedChange={setEditActive} />
                    <span className="text-xs">Ativo</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(cat.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{cat.name}</h4>
                      {!cat.is_active && <span className="text-[10px] uppercase bg-destructive/20 text-destructive px-2 py-0.5 rounded-full font-bold">Inativa</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Ordem: {cat.display_order}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(cat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
