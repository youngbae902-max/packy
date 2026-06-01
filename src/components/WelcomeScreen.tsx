import { Share2, Compass, UserCog, Users } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const FEATURES = [
  { icon: Share2, label: 'Compartilhe seus packs' },
  { icon: Compass, label: 'Descubra novos conteúdos' },
  { icon: UserCog, label: 'Personalize seu perfil' },
  { icon: Users, label: 'Conecte-se com outros editores' },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-10">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        <div className="pt-10 pb-8 text-center">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-white text-black items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl font-black tracking-tight">P</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">Bem-vindo ao PACKY</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Uma plataforma criada para ajudar pequenos e grandes editores a compartilhar,
            descobrir e organizar packs de forma simples e gratuita.
          </p>
        </div>

        <div className="flex-1 space-y-3 py-2">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card px-4 py-3.5"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground py-6">
          Tudo isso de forma gratuita e feita para a comunidade.
        </p>

        <button
          onClick={onStart}
          className="w-full bg-white text-black font-bold py-4 rounded-2xl text-base hover:bg-white/90 transition-colors"
        >
          Começar
        </button>
      </div>
    </div>
  );
}
