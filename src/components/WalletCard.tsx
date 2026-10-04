import { Eye, EyeOff, History } from 'lucide-react';
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
      <div className="wallet-card-compact relative w-full rounded-[26px] p-4 overflow-hidden border border-white/[0.07]" style={{background:'linear-gradient(145deg,#181818 0%,#0d0d0d 100%)',boxShadow:'0 24px 60px -28px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.045)'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoUrl ? <img src={logoUrl} alt="" className="w-8 h-8 rounded-xl object-contain bg-white/[0.04]" /> : <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-[10px] font-black">P</div>}
            <div className="min-w-0"><p className="text-[11px] font-semibold text-white/55">Carteira</p><p className="text-[13px] font-semibold text-white truncate">{profile?.artist_name || profile?.username || 'Conta'}</p></div>
          </div>
          <button onClick={() => setOpenHistory(true)} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-white/65" aria-label="Histórico"><History className="w-4 h-4" /></button>
        </div>
        <div className="mt-7"><p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Saldo disponível</p><div className="mt-1 flex items-center gap-2.5"><h2 className="text-white text-[32px] leading-none font-black tracking-[-0.04em] tabular-nums">{show ? `R$ ${formatted}` : masked}</h2><button onClick={() => setShow(s => !s)} className="w-7 h-7 rounded-full text-white/45 flex items-center justify-center" aria-label="Mostrar saldo">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
        <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-3"><p className="text-[10px] text-white/35">Conta •• {last4}</p><p className="text-[10px] text-white/25 font-mono tracking-[0.18em]">•••• {idTail}</p></div>
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
