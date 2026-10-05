import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, useRef } from 'react';

interface HorizontalCarouselProps {
  title: string;
  children: ReactNode;
  showArrows?: boolean;
}

export function HorizontalCarousel({ title, children, showArrows = true }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-9 relative group bg-transparent border-0 shadow-none">
      <div className="relative flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-foreground/80" />
          <div className="flex flex-col">
            <h2 className="text-[16px] md:text-[17px] font-semibold tracking-[-0.02em] text-foreground">
              {title}
            </h2>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55">
              PACKS
            </span>
          </div>
        </div>

        {showArrows && (
          <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-transparent text-foreground/55 hover:text-foreground transition"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-transparent text-foreground/55 hover:text-foreground transition"
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto overflow-y-visible scrollbar-hide py-3 px-2 snap-x snap-mandatory scroll-smooth bg-transparent"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
