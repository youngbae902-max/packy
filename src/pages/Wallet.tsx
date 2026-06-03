import { useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, TrendingUp, TrendingDown, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { WalletCard } from '@/components/WalletCard';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AuthModal } from '@/components/AuthModal';


export default function Wallet() {
  const { user, profile } = useAuth();
  const { transactions } = useWallet(user?.id);
  const [show, setShow] = useState(true);
  const [showAuth, setShowAuth] = useState(false);


  const stats = useMemo(() => {
    let credit = 0, debit = 0;
    transactions.forEach(t => {
      const v = Number(t.amount) || 0;
      if (t.type === 'credit') credit += v; else debit += v;
    });
    return { credit, debit, count: transactions.length };
  }, [transactions]);

  const balance = Number((profile as any)?.wallet_balance || 0);
  const formatted = balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!user) {
    return (
      <>
        <WelcomeScreen onStart={() => setShowAuth(true)} />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="signup" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center justify-between mb-6">
          <Link to="/conta?settings=1" className="w-11 h-11 -ml-2 flex items-center justify-center" aria-label="Voltar">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">Carteira</h1>
          <button onClick={() => setShow(s => !s)} className="w-11 h-11 flex items-center justify-center text-muted-foreground" aria-label="Mostrar/Ocultar">
            {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </header>

        <div className="mb-6">
          <WalletCard />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatBox label="Saldo" value={show ? `R$ ${formatted}` : '••••'} accent="text-foreground" />
          <StatBox label="Entradas" value={show ? `+R$ ${stats.credit.toFixed(2)}` : '••••'} icon={<TrendingUp className="w-3 h-3" />} accent="text-emerald-400" />
          <StatBox label="Saídas" value={show ? `-R$ ${stats.debit.toFixed(2)}` : '••••'} icon={<TrendingDown className="w-3 h-3" />} accent="text-rose-400" />
        </div>

        <section className="rounded-3xl border border-border/40 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-[14px] font-bold tracking-tight">Histórico</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">{stats.count} {stats.count === 1 ? 'transação' : 'transações'}</span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">Sem transações ainda</p>
          ) : (
            <ul className="divide-y divide-border/20">
              {transactions.map(tx => (
                <li key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {tx.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-foreground truncate leading-tight">{tx.description || (tx.type === 'credit' ? 'Crédito' : 'Débito')}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{new Date(tx.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <span className={`text-[14px] font-black tabular-nums ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}R$ {Number(tx.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

function StatBox({ label, value, icon, accent }: { label: string; value: string; icon?: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">{icon}{label}</p>
      <p className={`text-[14px] font-black tabular-nums truncate ${accent || 'text-foreground'}`}>{value}</p>
    </div>
  );
}
