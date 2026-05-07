import { Eye, EyeOff, History, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { useAppLogo } from '@/hooks/useAppLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function WalletCard() {
  const { user, profile } = useAuth();
  const { logoUrl } = useAppLogo();
  const { transactions } = useWallet(user?.id);
  const [show, setShow] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const balance = Number((profile as any)?.wallet_balance || 0);
  const formatted = balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const masked = '$' + '•'.repeat(Math.max(formatted.replace(/\D/g, '').length, 4));

  const last4 = (user?.id || '0000').replace(/\D/g, '').slice(-4).padStart(4, '0');
  const idTail = (user?.id || '0000').slice(-4).toUpperCase();

  return (
    <>
      <div
        className="relative w-full rounded-3xl p-5 overflow-hidden border border-white/5"
        style={{
          background:
            'radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0) 70%), linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          boxShadow: '0 20px 50px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-7 h-7 rounded-md object-contain" />
            ) : (
              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center text-[11px] font-black">P</div>
            )}
            <span className="text-sm font-medium text-white/90 tracking-tight">Wallet</span>
          </div>
          <button
            onClick={() => setOpenHistory(true)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors"
            aria-label="Histórico"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* Name */}
        <p className="text-white/60 text-base font-medium mb-1 tracking-tight">
          {profile?.artist_name || profile?.username || 'Conta'}
        </p>

        {/* Balance */}
        <div className="flex items-end justify-between mt-6">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-3xl font-black tabular-nums tracking-tight">
              {show ? `R$ ${formatted}` : masked}
            </h2>
            <button
              onClick={() => setShow(s => !s)}
              className="w-8 h-8 rounded-full text-white/60 hover:text-white flex items-center justify-center"
              aria-label="Mostrar saldo"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Mastercard-like circles */}
          <div className="relative w-12 h-7 flex items-center">
            <span className="absolute left-0 w-7 h-7 rounded-full bg-[#EB001B]" />
            <span className="absolute left-5 w-7 h-7 rounded-full bg-[#F79E1B] mix-blend-screen" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-3">
          <p className="text-white/50 text-xs tracking-wider">Account •• {last4}</p>
          <p className="text-white/30 text-xs tracking-[0.25em] font-mono">•••• {idTail}</p>
        </div>
      </div>

      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogContent className="bg-card border-border rounded-[2rem] max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <History className="w-4 h-4" /> Histórico
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {transactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Sem transações ainda</p>
            )}
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-sm border-b border-border/30 py-2">
                <div className="min-w-0 mr-2">
                  <p className="truncate text-foreground">{tx.description || (tx.type === 'credit' ? 'Crédito' : 'Débito')}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <span className={tx.type === 'credit' ? 'text-emerald-400 font-bold tabular-nums' : 'text-rose-400 font-bold tabular-nums'}>
                  {tx.type === 'credit' ? '+' : '-'}R$ {Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
