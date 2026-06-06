import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ImageCropModal } from '@/components/ImageCropModal';
import { toast } from 'sonner';
import { useUserBeats } from '@/hooks/useUserBeats';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function formatSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function deriveNameFromFile(fileName: string) {
  return fileName.replace(/\.zip$/i, '').replace(/[_\-]+/g, ' ').trim();
}

export function AddBeatModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const { create } = useUserBeats();

  const [tab, setTab] = useState<'upload' | 'link'>('upload');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [externalSize, setExternalSize] = useState<string>('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTab('upload');
    setCoverPreview(null);
    setCropSrc(null);
    setName('');
    setExternalUrl('');
    setExternalSize('');
    setZipFile(null);
  }

  function close() { reset(); onClose(); }

  function handleCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleCropDone(blob: Blob) {
    if (!user) return;
    const path = `${user.id}/beat-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('covers').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) { toast.error('Erro ao salvar capa'); return; }
    const { data } = supabase.storage.from('covers').getPublicUrl(path);
    setCoverPreview(data.publicUrl);
    setCropSrc(null);
  }

  function handleZipPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setZipFile(f);
    if (!name) setName(deriveNameFromFile(f.name));
  }

  async function handleSubmit() {
    if (!user) return;
    if (!name.trim()) { toast.error('Dê um nome ao beat'); return; }

    if (tab === 'upload' && !zipFile) { toast.error('Selecione um arquivo .zip'); return; }
    if (tab === 'link' && !externalUrl.trim()) { toast.error('Cole o link do arquivo'); return; }

    setSubmitting(true);
    try {
      if (tab === 'upload' && zipFile) {
        const path = `${user.id}/${Date.now()}-${zipFile.name.replace(/[^\w.\-]/g, '_')}`;
        const { error } = await supabase.storage.from('beats-files').upload(path, zipFile, { upsert: false });
        if (error) throw error;
        await create({
          name: name.trim(),
          cover_url: coverPreview,
          external_url: null,
          storage_path: path,
          size_bytes: zipFile.size,
        });
      } else {
        await create({
          name: name.trim(),
          cover_url: coverPreview,
          external_url: externalUrl.trim(),
          storage_path: null,
          size_bytes: null,
        });
      }
      toast.success('Beat adicionado');
      close();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Novo beat</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 1. Cover */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Capa do single</p>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="relative w-full aspect-square rounded-xl bg-[hsl(0,0%,4%)] border border-border/60 overflow-hidden flex items-center justify-center hover:bg-[hsl(0,0%,6%)] transition"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-xs">Toque pra escolher</span>
                  </div>
                )}
                {coverPreview && (
                  <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-foreground" />
                  </span>
                )}
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
            </div>

            {/* 2. Name */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Nome do beat</p>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Trap Sad — Vol. 1" className="bg-secondary border-border" />
            </div>

            {/* 3. File or Link */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Arquivo</p>
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid grid-cols-2 w-full bg-secondary">
                  <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1.5" /> Upload .zip</TabsTrigger>
                  <TabsTrigger value="link"><LinkIcon className="w-4 h-4 mr-1.5" /> Link</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-3">
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="w-full rounded-xl border border-dashed border-border/60 bg-[hsl(0,0%,3%)] p-4 text-center hover:bg-[hsl(0,0%,5%)] transition"
                  >
                    {zipFile ? (
                      <div className="text-sm">
                        <p className="font-semibold text-foreground truncate">{zipFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatSize(zipFile.size)}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" /> Selecionar arquivo .zip
                      </div>
                    )}
                  </button>
                  <input ref={zipInputRef} type="file" accept=".zip,application/zip" className="hidden" onChange={handleZipPick} />
                </TabsContent>

                <TabsContent value="link" className="mt-3 space-y-2">
                  <Input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} placeholder="https://drive.google.com/..." className="bg-secondary border-border" />
                  <Input value={externalSize} onChange={e => setExternalSize(e.target.value)} placeholder="Tamanho (opcional, ex: 250 MB)" className="bg-secondary border-border text-xs" />
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={close} className="flex-1"><X className="w-4 h-4 mr-1.5" /> Cancelar</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar beat'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {cropSrc && (
        <ImageCropModal
          isOpen={!!cropSrc}
          onClose={() => setCropSrc(null)}
          imageSrc={cropSrc}
          onCropComplete={handleCropDone}
          aspectRatio={1}
          title="Ajustar capa"
        />
      )}
    </>
  );
}
