import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Acapella } from '@/hooks/useAcapellas';

interface EditAcapellaModalProps {
  isOpen: boolean;
  acapella: Acapella | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Acapella>) => Promise<void>;
}

export function EditAcapellaModal({ isOpen, acapella, onClose, onSave }: EditAcapellaModalProps) {
  const [artistName, setArtistName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (acapella) {
      setArtistName(acapella.artist_name);
      setDownloadUrl(acapella.download_url);
    }
  }, [acapella]);

  if (!isOpen || !acapella) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(acapella.id, {
        artist_name: artistName,
        download_url: downloadUrl,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black uppercase">Editar Acapella</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nome do Artista</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Link de Download</label>
            <input
              type="url"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}