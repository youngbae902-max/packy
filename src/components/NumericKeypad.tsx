import { useState } from 'react';
import { X, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface NumericKeypadProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  recipient?: string;
  onConfirm: (amount: number, reason: string, isDebit: boolean) => Promise<void> | void;
}

export function NumericKeypad({ open, onClose, title = 'Ajustar saldo', recipient, onConfirm }: NumericKeypadProps) {
  const [value, setValue] = useState('0');
  const [reason, setReason] = useState('');
  const [isDebit, setIsDebit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleKey = (k: string) => {
    if (k === 'back') {
      setValue(v => (v.length <= 1 ? '0' : v.slice(0, -1)));
      return;
    }
    if (k === '.') {
      if (value.includes('.')) return;
      setValue(v => v + '.');
      return;
    }
    setValue(v => {
      if (v === '0') return k;
      // limit decimal to 2
      if (v.includes('.') && v.split('.')[1].length >= 2) return v;
      return v + k;
    });
  };

  const reset = () => { setValue('0'); setReason(''); setIsDebit(false); };

  const handleSubmit = async () => {
    const amt = parseFloat(value);
    if (!amt || isNaN(amt)) return;
    setSubmitting(true);
    try {
      await onConfirm(isDebit ? -amt : amt, reason.trim(), isDebit);
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const keys = ['1','2','3','4','5','6','7','8','9','.','0','back'];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="bg-background border-border rounded-[2rem] p-0 max-w-sm overflow-hidden">
        <div className="bg-black p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <button onClick={() => { reset(); onClose(); }} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {recipient && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-xs text-white/50">Para</span>
              <span className="text-xs font-bold text-white">@{recipient}</span>
            </div>
          )}

          <div className="text-center my-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-white/60 text-2xl font-bold">R$</span>
              <span className="text-white text-5xl font-black tabular-nums tracking-tight">{value}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setIsDebit(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${!isDebit ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/60'}`}
            >+ Creditar</button>
            <button
              onClick={() => setIsDebit(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${isDebit ? 'bg-rose-500 text-white' : 'bg-white/5 text-white/60'}`}
            >− Debitar</button>
          </div>

          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl mb-4"
          />

          <div className="grid grid-cols-3 gap-2">
            {keys.map(k => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-xl font-bold transition-colors flex items-center justify-center"
              >
                {k === 'back' ? <Delete className="w-5 h-5" /> : k}
              </button>
            ))}
          </div>

          <Button
            disabled={submitting || value === '0'}
            onClick={handleSubmit}
            className="w-full h-12 mt-4 rounded-2xl bg-white text-black font-bold hover:bg-white/90"
          >
            {submitting ? 'Aplicando...' : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
