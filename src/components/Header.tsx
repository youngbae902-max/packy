import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="text-center py-8 px-4">
      <div className="flex items-center justify-center gap-1 mb-4">
        <span className="text-3xl md:text-4xl font-black tracking-tighter">
          PACK
        </span>
        <span className="text-3xl md:text-4xl font-light tracking-tighter text-muted-foreground">
          STORAGE
        </span>
        <Zap className="w-6 h-6 text-warning fill-warning" />
      </div>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Seu upload passará por revisão. Caso seja aceito, aparecerá aqui na galeria principal.
      </p>
    </header>
  );
}
