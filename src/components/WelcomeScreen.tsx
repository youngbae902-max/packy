import { ArrowRight } from 'lucide-react';
import packySymbol from '@/assets/packy-symbol.png.asset.json';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-10 pb-8">
      {/* Hero logo */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <img
            src={packySymbol.url}
            alt="PACKY"
            className="relative w-24 h-24 object-contain select-none"
            draggable={false}
          />
        </div>

        <h1 className="text-[34px] leading-none font-black mb-3">PACKY</h1>
        <p className="text-[15px] text-muted-foreground max-w-xs leading-relaxed">
          A plataforma feita para a comunidade de editores compartilhar, descobrir e
          organizar packs.
        </p>
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm mx-auto space-y-3">
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
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
