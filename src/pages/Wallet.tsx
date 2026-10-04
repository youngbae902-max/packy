import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Eye, EyeOff, Wallet as WalletIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AuthModal } from '@/components/AuthModal';

export default function Wallet() {
  const { user, profile } = useAuth();
  const [show, setShow] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

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
    <div className="wallet-page min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-5">
        <header className="flex items-center justify-between mb-6">
          <Link to="/conta?settings=1" className="w-11 h-11 -ml-2 flex items-center justify-center" aria-label="Voltar">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">Carteira</h1>
          <button onClick={() => setShow(s => !s)} className="w-11 h-11 flex items-center justify-center text-muted-foreground" aria-label="Mostrar/Ocultar">
            {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </header>

        <div className="wallet-balance-panel rounded-[26px] border border-white/[0.07] bg-[#151515] p-5 text-left">
          <div className="flex items-center gap-3 mb-7"><div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center"><WalletIcon className="w-4 h-4 text-foreground/70" /></div><div><p className="text-[11px] font-semibold text-muted-foreground">Carteira</p><p className="text-[10px] text-muted-foreground/60">Saldo disponível</p></div></div>
          <p className="text-[34px] font-black tabular-nums leading-none">
            {show ? `R$ ${formatted}` : '••••••'}
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
