import { useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, Upload, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Pack } from '@/hooks/useSupabasePacks';

interface BulkCoversManagerProps {
  packs: Pack[];
  onDone?: () => void;
}

export function BulkCoversManager({ packs, onDone }: BulkCoversManagerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = useMemo(
    () => [...packs].sort((a, b) => (a.title || '').localeCompare(b.title || '')),
    [packs]
  );

  const targets = selected.length ? list.filter(p => selected.includes(p.id)) : list;

  const toggle = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));

  const removeCovers = async () => {
    if (!targets.length) return;
    if (!window.confirm(`Remover a capa de ${targets.length} pack(s)?`)) return;
    setBusy(true);
    let ok = 0;
    for (const p of targets) {
      const { error } = await supabase.from('packs').update({ cover_url: null }).eq('id', p.id);
      if (!error) ok++;
      setProgress(`Removendo ${ok}/${targets.length}`);
    }
    setBusy(false);
    setProgress(null);
    toast.success(`${ok} capa(s) removida(s)`);
    onDone?.();
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (!targets.length) {
      toast.error('Nenhum pack selecionado');
      return;
    }

    setBusy(true);
    let ok = 0;
    const count = Math.min(files.length, targets.length);
    for (let i = 0; i < count; i++) {
      const file = files[i];
      const pack = targets[i];
      setProgress(`Enviando ${i + 1}/${count}`);
      try {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `bulk/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('covers')
          .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('covers').getPublicUrl(path);
        const { error } = await supabase.from('packs').update({ cover_url: data.publicUrl }).eq('id', pack.id);
        if (error) throw error;
        ok++;
      } catch {
        /* continua para os próximos */
      }
    }
    setBusy(false);
    setProgress(null);
    toast.success(`${ok} capa(s) aplicada(s)`);
    if (files.length > targets.length) {
      toast.info(`${files.length - targets.length} imagem(ns) não usada(s) — mais imagens do que packs`);
    }
    onDone?.();
  };

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground">
        As imagens são aplicadas na ordem escolhida no dispositivo, uma para cada pack da lista
        (ou apenas nos selecionados).
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setSelected(list.map(p => p.id))} disabled={busy}>
          Selecionar todos
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSelected([])} disabled={busy}>
          Limpar seleção
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-2xl border border-[#252525] bg-[#1C1C1C] divide-y divide-[#1E1E1E]">
        {list.map(p => {
          const isSel = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#232323] transition-colors"
            >
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                  isSel ? 'bg-foreground border-foreground text-background' : 'border-[#333]'
                }`}
              >
                {isSel && <Check className="w-3 h-3" />}
              </span>
              {p.cover_url ? (
                <img src={p.cover_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <span className="w-9 h-9 rounded-lg bg-[#232323] flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </span>
              )}
              <span className="text-[13px] text-foreground truncate">{p.title}</span>
            </button>
          );
        })}
        {!list.length && <p className="p-4 text-[13px] text-muted-foreground">Nenhum pack.</p>}
      </div>

      <p className="text-[12px] text-muted-foreground">
        Alvo atual: <span className="text-foreground font-medium">{targets.length}</span> pack(s)
        {selected.length ? ' (selecionados)' : ' (todos)'}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <div className="flex flex-col gap-2">
        <Button onClick={() => fileRef.current?.click()} disabled={busy} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          {busy ? progress || 'Processando...' : 'Enviar fotos do dispositivo'}
        </Button>
        <Button variant="outline" onClick={removeCovers} disabled={busy} className="w-full text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Remover capas
        </Button>
      </div>
    </div>
  );
}
