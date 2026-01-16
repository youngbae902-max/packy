import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddAcapellaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (acapella: any) => Promise<any>;
}

export function AddAcapellaModal({ isOpen, onClose, onAdd }: AddAcapellaModalProps) {
  const { user, isAdmin } = useAuth();
  const [artistName, setArtistName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('acapellas')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('acapellas')
        .getPublicUrl(fileName);
      
      setAudioUrl(publicUrl);
      toast.success('Áudio enviado!');
    } catch (error) {
      toast.error('Erro ao fazer upload do áudio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artistName.trim() || !audioUrl || !downloadUrl.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await onAdd({
        artist_name: artistName.trim(),
        audio_url: audioUrl,
        download_url: downloadUrl.trim(),
        duration_seconds: null,
      });

      toast.success('Acapella adicionada!');
      
      // Reset form
      setArtistName('');
      setAudioUrl('');
      setDownloadUrl('');
      onClose();
    } catch (error) {
      toast.error('Erro ao adicionar acapella');
    }
  };

  if (!isOpen || !isAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-tight">
          Adicionar Acapella
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Nome do Artista</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Ex: MC Cabelinho"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Arquivo de Áudio (MP3)</label>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-xl px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Enviando...' : audioUrl ? 'Áudio enviado ✓' : 'Carregar áudio'}
            </button>
          </div>

          <div>
            <label className="label-field">Link de Download</label>
            <input
              type="url"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="Link para download externo"
              className="input-field"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full text-sm uppercase tracking-wide"
            disabled={!audioUrl}
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
