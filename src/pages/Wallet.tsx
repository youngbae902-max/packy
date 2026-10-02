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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center justify-between mb-6">
          <Link to="/conta?settings=1" className="w-11 h-11 -ml-2 flex items-center justify-center" aria-label="Voltar">
            <span className="inline-block w-3 h-3 border-l border-b border-current -rotate-45" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">Carteira</h1>
          <button onClick={() => setShow(s => !s)} className="w-11 h-11 flex items-center justify-center text-muted-foreground" aria-label="Mostrar/Ocultar">
            {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </header>

        <div className="rounded-3xl border border-border/40 bg-card p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border/40 flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-5 h-5 text-foreground/70" />
          </div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Saldo disponível</p>
          <p className="text-[34px] font-black tabular-nums leading-none mt-2">
            {show ? `R$ ${formatted}` : '••••••'}
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
