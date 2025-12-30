export type RouletteVariantId = "classic" | "jade" | "abyss";

export type RouletteVariant = {
  id: RouletteVariantId;
  name: string;
  description: string;
  bonus: string;
  unlockRoundsCleared: number;
  modifiers: {
    payoutOutsideWinMult?: number;
    payoutInsideWinMult?: number;
    spinsPerRoundDelta?: number;
    builtInDoubleOutcome?: boolean;
  };
};

export const ROULETTE_VARIANTS: RouletteVariant[] = [
  {
    id: "classic",
    name: "Ruleta Boyal Clásica",
    description: "La mesa original. Sin favores, sin milagros.",
    bonus: "Equilibrada: reglas estándar.",
    unlockRoundsCleared: 0,
    modifiers: {}
  },
  {
    id: "jade",
    name: "Ruleta de Jade",
    description: "Neón verde, sonrisas falsas. Aquí lo seguro paga.",
    bonus: "Favor del Neón: Outside +20% ganancias, Inside -10% ganancias.",
    unlockRoundsCleared: 10,
    modifiers: { payoutOutsideWinMult: 1.20, payoutInsideWinMult: 0.90 }
  },
  {
    id: "abyss",
    name: "Ruleta del Abismo",
    description: "La casa tiembla… pero tú también. Una tirada menos.",
    bonus: "Dos Destinos: 2 resultados por spin (elige el mejor), pero -1 spin por ronda.",
    unlockRoundsCleared: 25,
    modifiers: { builtInDoubleOutcome: true, spinsPerRoundDelta: -1 }
  }
];

export function getRouletteVariant(id: RouletteVariantId): RouletteVariant {
  return ROULETTE_VARIANTS.find(v => v.id === id) || ROULETTE_VARIANTS[0];
}

export function isRouletteUnlocked(variantId: RouletteVariantId, bestRunRoundsCleared: number): boolean {
  const variant = getRouletteVariant(variantId);
  return bestRunRoundsCleared >= variant.unlockRoundsCleared;
}
