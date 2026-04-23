import { useRef, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import { toast } from 'sonner';

export function AppLogoSettings() {
  const { logoUrl, uploadLogo, isUploading, clearLogo } = useAppLogo();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Envie um arquivo de imagem');
      return;
    }
    setPreview(URL.createObjectURL(file));
    try {
      await uploadLogo(file);
      toast.success('Logo atualizada!');
    } catch {
      toast.error('Erro ao enviar logo');
    } finally {
      setPreview(null);
    }
  };

  const handleClear = async () => {
    try {
      await clearLogo();
      toast.success('Logo removida');
    } catch {
      toast.error('Erro ao remover logo');
    }
  };

  const display = preview || logoUrl;

  return (
    <div className="rounded-2xl border border-border/40 bg-[hsl(0,0%,4%)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <ImageIcon className="w-4 h-4 text-foreground" />
        <h3 className="text-sm font-bold text-foreground">Logo do aplicativo</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Aparece no lugar de "PACKY" na Home. Use uma imagem 1:1 (4:4) para melhor resultado.
      </p>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-[hsl(0,0%,2%)] border border-border/40 flex items-center justify-center overflow-hidden flex-shrink-0">
          {display ? (
            <img src={display} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-90 transition disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" /> {logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </>
            )}
          </button>
          {logoUrl && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[hsl(0,0%,7%)] border border-border/40 text-muted-foreground text-xs font-semibold hover:text-foreground transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remover
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
