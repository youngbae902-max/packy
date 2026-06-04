import { ArrowRight } from 'lucide-react';
import logoG from '@/assets/packy-logo-g.png';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-10">
      {/* Hero logo */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative mb-10">
          <div className="absolute inset-0 blur-3xl bg-foreground/10 rounded-full" />
          <img
            src={logoG}
            alt="PACKY"
            className="relative w-40 h-40 object-contain opacity-90 select-none"
            draggable={false}
          />
        </div>

        <h1 className="text-[44px] leading-[1] font-black tracking-tighter mb-4">PACKY</h1>
        <p className="text-[15px] text-muted-foreground max-w-xs leading-relaxed">
          A plataforma feita para a comunidade de editores compartilhar, descobrir e
          organizar packs.
        </p>
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm mx-auto space-y-3">
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-4 rounded-2xl text-[15px] hover:opacity-90 transition-opacity"
        >
          Começar
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[11px] text-muted-foreground">
          Tudo gratuito · Feito por editores, para editores
        </p>
      </div>
    </div>
  );
}
