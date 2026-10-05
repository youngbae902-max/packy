import { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface AcapellaPollDialogProps {
  open: boolean;
  onClose: () => void;
  acapellaId: string;
  artistName: string;
  imageUrl?: string | null;
  downloadUrl: string;
}

const OPTIONS = ['ZN', 'ZS', 'Automotivo', 'BH', 'Capixaba', 'Nenhum desses'] as const;

export function AcapellaPollDialog({
  open,
  onClose,
  acapellaId,
  artistName,
  imageUrl,
  downloadUrl,
}: AcapellaPollDialogProps) {
  const [choice, setChoice] = useState<(typeof OPTIONS)[number] | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [step, setStep] = useState<'poll' | 'download'>('poll');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleAdvance = async () => {
    if (!choice || saving) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    await (supabase as any).from('acapella_votes').insert({
      acapella_id: acapellaId,
      choice,
      suggestion: suggestion.trim() || null,
      user_id: user?.id ?? null,
    });

    setSaving(false);
    setStep('download');
  };

  const reset = () => {
    setChoice(null);
    setSuggestion('');
    setStep('poll');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[28px] border border-white/[0.08] bg-[#151515] p-6 shadow-none">
        <button
          type="button"
          onClick={reset}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {imageUrl ? (
            <img src={imageUrl} alt={artistName} className="size-28 rounded-full object-cover border border-white/[0.08]" />
          ) : (
            <div className="size-28 rounded-full bg-muted" />
          )}
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Acapella</p>
          <h2 className="mt-1 text-xl font-semibold">{artistName}</h2>
        </div>

        {step === 'poll' ? (
          <>
            <div className="mt-7">
              <p className="mb-3 text-sm font-semibold">Com que a voz da {artistName} combina?</p>

              <div className="grid grid-cols-2 gap-2">
                {OPTIONS.map(option => {
                  const selected = choice === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setChoice(option)}
                      className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-sm transition ${
                        selected
                          ? 'border-foreground/40 bg-foreground text-background'
                          : 'border-white/[0.07] bg-white/[0.025] text-foreground hover:bg-white/[0.05]'
                      }`}
                    >
                      <span>{option}</span>
                      {selected && <Check className="size-4" />}
                    </button>
                  );
                })}
              </div>

              <input
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
                placeholder="Fale aqui..."
                maxLength={120}
                className="mt-3 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/[0.15]"
              />
            </div>

            <Button
              type="button"
              onClick={handleAdvance}
              disabled={!choice || saving}
              className="mt-5 h-11 w-full rounded-xl"
            >
              {saving ? 'Salvando...' : 'Avançar'}
              {!saving && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </>
        ) : (
          <div className="mt-7 text-center">
            <p className="text-sm text-muted-foreground">Votação registrada. Agora você pode baixar a acapella.</p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background transition hover:opacity-90"
            >
              Baixar acapella
              <ArrowRight className="ml-2 size-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
