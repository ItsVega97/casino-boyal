import { useRef, useMemo } from 'react';
import { FLAVOR_LINES, FlavorCategory } from './loreText';

const lastPicks: Record<FlavorCategory, number> = {
  roundStart: -1,
  roundWin: -1,
  shop: -1,
  buyUpgrade: -1,
  gameOver: -1,
  spin: -1,
};

function pickRandom(category: FlavorCategory, seed: number): string {
  const lines = FLAVOR_LINES[category];
  if (lines.length === 0) return '';

  let index = Math.floor((seed * 9301 + 49297) % 233280 / 233280 * lines.length);

  if (lines.length > 1 && index === lastPicks[category]) {
    index = (index + 1) % lines.length;
  }

  lastPicks[category] = index;
  return lines[index];
}

export function useFlavorText(category: FlavorCategory, trigger: number | string): string {
  const seedRef = useRef(0);

  const text = useMemo(() => {
    seedRef.current = typeof trigger === 'number' ? trigger : trigger.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return pickRandom(category, seedRef.current);
  }, [category, trigger]);

  return text;
}
