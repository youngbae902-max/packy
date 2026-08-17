import { useEffect, useState } from 'react';

/**
 * Placeholder animado estilo "máquina de escrever":
 * escreve uma palavra, apaga, escreve a próxima, em loop.
 */
export function useTypedPlaceholder(words: string[], enabled = true) {
  const [text, setText] = useState(words[0] || '');

  useEffect(() => {
    if (!enabled || words.length === 0) return;
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const word = words[wordIndex];
      if (deleting) {
        charIndex -= 1;
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      } else {
        charIndex += 1;
        if (charIndex >= word.length) {
          deleting = true;
          timer = setTimeout(tick, 1400);
          setText(word);
          return;
        }
      }
      setText(words[wordIndex].slice(0, Math.max(charIndex, 0)));
      timer = setTimeout(tick, deleting ? 55 : 95);
    };

    timer = setTimeout(tick, 1400);
    return () => clearTimeout(timer);
  }, [enabled, words.join('|')]);

  return text;
}
