import { ReactNode, useRef } from 'react';

interface HorizontalCarouselProps {
  title?: string;
  children: ReactNode;
}

export function HorizontalCarousel({ title, children }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full bg-transparent p-0 m-0 border-0 shadow-none">
      {title && (
        <h2 className="mb-3 px-0 text-[15px] md:text-base font-medium tracking-tight text-foreground/85">
          {title}
        </h2>
      )}

      <div
        ref={scrollRef}
        className="flex w-full gap-3 md:gap-4 overflow-x-auto overflow-y-hidden px-0 py-0 m-0 bg-transparent border-0 shadow-none snap-x snap-mandatory scroll-smooth scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  );
}
