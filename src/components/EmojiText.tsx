import { useMemo } from 'react';
import { useCustomEmojis } from '@/hooks/useCustomEmojis';

export function EmojiText({ text, className = '' }: { text: string; className?: string }) {
  const { emojis } = useCustomEmojis();

  const parts = useMemo(() => {
    if (!text) return [];
    const map = new Map(emojis.map((emoji) => [emoji.shortcode, emoji]));
    return text.split(/(:[a-zA-Z0-9_-]+:)/g).map((part, index) => {
      const key = part.replace(/:/g, '').toLowerCase();
      const emoji = map.get(key);
      if (!emoji) return <span key={index}>{part}</span>;
      return (
        <img
          key={`${emoji.id}-${index}`}
          src={emoji.image_url}
          alt={emoji.name}
          title={`:${emoji.shortcode}:`}
          className="inline-block h-5 w-5 align-[-0.25em] object-contain mx-0.5"
          loading="lazy"
        />
      );
    });
  }, [emojis, text]);

  return <span className={className}>{parts}</span>;
}
