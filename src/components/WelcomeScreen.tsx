import { ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';
import packySymbol from '@/assets/packy-symbol.png.asset.json';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startX.current = e.clientX;
    currentX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || !trackRef.current) return;
    currentX.current = e.clientX;
    const rect = trackRef.current.getBoundingClientRect();
    const max = rect.width - 42;
    const distance = Math.max(0, Math.min(max, e.clientX - rect.left - 21));
    setProgress(max > 0 ? distance / max : 0);
  };

  const finishDrag = () => {
    if (!dragging) return;
    const shouldEnter = progress >= 0.72;
    setDragging(false);
    if (shouldEnter) {
      setProgress(1);
      onStart();
    } else {
      setProgress(0);
    }
  };

  return (
    <main
      className="h-[100dvh] min-h-[100dvh] w-full overflow-hidden overscroll-none bg-background text-foreground select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="h-full w-full flex flex-col items-center px-6">
        <div className="w-full max-w-sm text-center pt-[25vh]">
          <img
            src={packySymbol.url}
            alt="PACKY"
            className="mx-auto w-12 h-12 object-contain select-none"
            draggable={false}
          />

          <h1 className="mt-4 text-[20px] leading-none font-semibold tracking-[-0.03em]">
            PACKY
          </h1>

          <p className="mt-3 mx-auto max-w-[290px] text-[12px] leading-[1.55] text-muted-foreground">
            A plataforma feita para a comunidade de editores compartilhar, descobrir e organizar packs.
          </p>

          <div className="mt-8 flex flex-col items-center">
            <div
              ref={trackRef}
              className="relative w-[190px] h-11 rounded-full border border-border/60 bg-secondary/50 overflow-hidden"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground/[0.06] transition-[width] duration-100"
                style={{ width: \`calc(\${progress * 100}% + 22px)\` }}
              />
              <button
                type="button"
                aria-label="Arraste para entrar"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                onLostPointerCapture={finishDrag}
                className="absolute top-1/2 left-1 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm transition-transform duration-100 active:scale-95"
                style={{ transform: \`translate(\${progress * 146}px, -50%)\` }}
              >
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
              </button>
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-medium text-muted-foreground">
                Arraste para entrar
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
