import { Bet, RED_NUMBERS, BLACK_NUMBERS } from './bets';
import { rollWinningNumber, RollContext } from './roll';
import { makeRng } from './rng';
import { resolveBetsWithUpgrades } from './resolveBets';
import { RouletteVariant } from '../rouletteVariants/catalog';

const EVEN_NUMBERS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
const ODD_NUMBERS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
const LOW_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 1);
const HIGH_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 19);
const DOZEN1 = Array.from({ length: 12 }, (_, i) => i + 1);
const DOZEN2 = Array.from({ length: 12 }, (_, i) => i + 13);
const DOZEN3 = Array.from({ length: 12 }, (_, i) => i + 25);
const COL1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
const COL2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const COL3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

export interface ProbabilityResult {
  perNumber: number[];
  aggregates: {
    red: number;
    black: number;
    even: number;
    odd: number;
    low: number;
    high: number;
    dozen1: number;
    dozen2: number;
    dozen3: number;
    col1: number;
    col2: number;
    col3: number;
    anyBetWins?: number;
  };
}

interface EstimateContext {
  ownedUpgrades: string[];
  bets: Bet[];
  streak: { winsInRow: number; lossesInRow: number };
  rigged_counter_losses: number;
  vision_excluded?: number[];
  variantModifiers?: RouletteVariant['modifiers'];
}

export function estimateProbabilities(
  context: EstimateContext,
  samples: number = 20000
): ProbabilityResult {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const actualSamples = isMobile ? Math.min(samples, 10000) : samples;

  const seed = 123456789 + (context.ownedUpgrades?.length || 0) * 17 + (context.bets?.length || 0) * 7;

  const counts = new Array(37).fill(0);
  let anyBetWinsCount = 0;

  const rollContext: RollContext = {
    ownedUpgrades: context.ownedUpgrades || [],
    bets: context.bets || [],
    streak: context.streak || { winsInRow: 0, lossesInRow: 0 },
    rigged_counter_losses: context.rigged_counter_losses || 0,
    vision_excluded: context.vision_excluded,
  };

  for (let i = 0; i < actualSamples; i++) {
    const simRng = makeRng(seed + i);
    const number = rollWinningNumber(simRng, rollContext);
    counts[number]++;

    if (context.bets && context.bets.length > 0) {
      const result = resolveBetsWithUpgrades(
        number,
        context.bets,
        context.ownedUpgrades || [],
        {
          rigged_counter_losses: context.rigged_counter_losses || 0,
          first_loss_used: false,
          vision_excluded: context.vision_excluded
        },
        context.variantModifiers
      );
      if (result.totalDelta > 0) {
        anyBetWinsCount++;
      }
    }
  }

  const perNumber = counts.map(count => count / actualSamples);

  const aggregates = {
    red: RED_NUMBERS.reduce((sum, n) => sum + perNumber[n], 0),
    black: BLACK_NUMBERS.reduce((sum, n) => sum + perNumber[n], 0),
    even: EVEN_NUMBERS.reduce((sum, n) => sum + perNumber[n], 0),
    odd: ODD_NUMBERS.reduce((sum, n) => sum + perNumber[n], 0),
    low: LOW_NUMBERS.reduce((sum, n) => sum + perNumber[n], 0),
    high: HIGH_NUMBERS.reduce((sum, n) => sum + perNumber[n], 0),
    dozen1: DOZEN1.reduce((sum, n) => sum + perNumber[n], 0),
    dozen2: DOZEN2.reduce((sum, n) => sum + perNumber[n], 0),
    dozen3: DOZEN3.reduce((sum, n) => sum + perNumber[n], 0),
    col1: COL1.reduce((sum, n) => sum + perNumber[n], 0),
    col2: COL2.reduce((sum, n) => sum + perNumber[n], 0),
    col3: COL3.reduce((sum, n) => sum + perNumber[n], 0),
    anyBetWins: context.bets && context.bets.length > 0 ? anyBetWinsCount / actualSamples : undefined,
  };

  return { perNumber, aggregates };
}
