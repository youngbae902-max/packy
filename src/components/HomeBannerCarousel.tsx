import { useEffect, useState } from 'react';
import { useHomeBanners } from '@/hooks/useHomeBanners';

export function HomeBannerCarousel() {
  const { data: banners = [] } = useHomeBanners();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIndex(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    if (index >= banners.length) setIndex(0);
  }, [banners.length, index]);

  if (banners.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card aspect-[16/9] md:aspect-[21/7]">
        {banners.map((b, i) => {
          const content = (
            <>
              <img
                src={b.image_url}
                alt={b.title || 'Banner'}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
              />
              {(b.title || b.subtitle) && (
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-background/90 to-transparent">
                  {b.title && <h3 className="text-base md:text-2xl font-semibold text-foreground">{b.title}</h3>}
                  {b.subtitle && <p className="text-xs md:text-sm text-muted-foreground">{b.subtitle}</p>}
                </div>
              )}
            </>
          );
          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {b.link_url ? (
                <a href={b.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}

        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                aria-label={`Banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-foreground' : 'w-1.5 bg-foreground/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
