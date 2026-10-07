import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, useRef } from 'react';

interface HorizontalCarouselProps {
  title: string;
  children: ReactNode;
  showArrows?: boolean;
  centered?: boolean;
}

export function HorizontalCarousel({ title, children, showArrows = true, centered = false }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-10 relative group bg-transparent border-0 shadow-none">
      <div className="relative flex items-center justify-between mb-2.5 px-1 bg-transparent">
        <h2 className="text-[17px] md:text-[18px] font-semibold tracking-[-0.02em] text-foreground"> {title}</h2>
        {showArrows && (
          <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => scroll('left')} className="p-1.5 rounded-full bg-transparent text-foreground/70 hover:bg-transparent transition" aria-label="Rolar para a esquerda">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="p-1.5 rounded-full bg-transparent text-foreground/70 hover:bg-transparent transition" aria-label="Rolar para a direita">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto overflow-y-visible scrollbar-hide py-2.5 px-1 snap-x snap-mandatory scroll-smooth bg-transparent select-none touch-pan-x ${centered ? "justify-center" : ""}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitUserSelect: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
