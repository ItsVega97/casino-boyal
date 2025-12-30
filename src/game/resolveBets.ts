import { Bet, RED_NUMBERS, BLACK_NUMBERS, COLUMN_1, COLUMN_2, COLUMN_3, getPayoutMultiplier } from './bets';
import {
  hasUpgrade,
  getStraightPayoutBonus,
  getOutsideWinMultiplier,
  getLossRefund,
  isOutsideBet,
  getUpgradeEffect
} from '../upgrades/apply';
import { UpgradeState } from '../upgrades/types';
import { RouletteVariant } from '../rouletteVariants/catalog';

export interface BetResult {
  betId: string;
  won: boolean;
  delta: number;
}

export interface ResolutionResult {
  totalDelta: number;
  results: BetResult[];
}

const isWinningBet = (bet: Bet, winningNumber: number): boolean => {
  if (winningNumber === 0) {
    if (bet.kind === 'straight' && bet.numbers?.includes(0)) {
      return true;
    }
    return false;
  }

  switch (bet.kind) {
    case 'straight':
    case 'split':
    case 'street':
    case 'corner':
    case 'sixline':
      return bet.numbers?.includes(winningNumber) ?? false;

    case 'red':
      return RED_NUMBERS.includes(winningNumber);

    case 'black':
      return BLACK_NUMBERS.includes(winningNumber);

    case 'even':
      return winningNumber % 2 === 0;

    case 'odd':
      return winningNumber % 2 === 1;

    case 'low':
      return winningNumber >= 1 && winningNumber <= 18;

    case 'high':
      return winningNumber >= 19 && winningNumber <= 36;

    case 'dozen':
      if (bet.meta?.dozen === 1) return winningNumber >= 1 && winningNumber <= 12;
      if (bet.meta?.dozen === 2) return winningNumber >= 13 && winningNumber <= 24;
      if (bet.meta?.dozen === 3) return winningNumber >= 25 && winningNumber <= 36;
      return false;

    case 'column':
      if (bet.meta?.column === 1) return COLUMN_1.includes(winningNumber);
      if (bet.meta?.column === 2) return COLUMN_2.includes(winningNumber);
      if (bet.meta?.column === 3) return COLUMN_3.includes(winningNumber);
      return false;

    default:
      return false;
  }
};

export const resolveBets = (winningNumber: number, bets: Bet[]): ResolutionResult => {
  let totalDelta = 0;
  const results: BetResult[] = [];

  for (const bet of bets) {
    const won = isWinningBet(bet, winningNumber);
    const multiplier = getPayoutMultiplier(bet.kind);

    let delta: number;
    if (won) {
      delta = bet.amount * multiplier;
    } else {
      delta = -bet.amount;
    }

    totalDelta += delta;
    results.push({
      betId: bet.id,
      won,
      delta,
    });
  }

  return { totalDelta, results };
};

export const resolveBetsWithUpgrades = (
  winningNumber: number,
  bets: Bet[],
  ownedUpgrades: string[],
  upgradeState: UpgradeState,
  variantModifiers?: RouletteVariant['modifiers']
): ResolutionResult => {
  let totalDelta = 0;
  const results: BetResult[] = [];
  let firstLossHandled = upgradeState.first_loss_used;
  let hasStraightWin = false;

  const zeroPushOutside = hasUpgrade(ownedUpgrades, 'bribed_croupier');

  for (const bet of bets) {
    let won = isWinningBet(bet, winningNumber);
    let multiplier = getPayoutMultiplier(bet.kind);

    if (bet.kind === 'straight' && won) {
      multiplier += getStraightPayoutBonus(ownedUpgrades);
    }

    const favoredKind = upgradeState.favored_kind;
    if (favoredKind && bet.kind === favoredKind && won && hasUpgrade(ownedUpgrades, 'hidden_multiplier')) {
      const hiddenEffect = getUpgradeEffect(ownedUpgrades, 'hidden_multiplier');
      if (hiddenEffect && hiddenEffect.type === 'hidden_multiplier') {
        multiplier += hiddenEffect.bonusPayout;
      }
    }

    if (hasUpgrade(ownedUpgrades, 'illegal_mode') && won) {
      const illegalEffect = getUpgradeEffect(ownedUpgrades, 'illegal_mode');
      if (illegalEffect && illegalEffect.type === 'illegal_mode') {
        multiplier += illegalEffect.payoutBonus;
      }
    }

    let delta: number;
    if (won) {
      delta = bet.amount * multiplier;

      if (isOutsideBet(bet.kind)) {
        const outsideMultiplier = getOutsideWinMultiplier(ownedUpgrades);
        delta = Math.floor(delta * outsideMultiplier);
      }

      if (hasUpgrade(ownedUpgrades, 'double_or_nothing')) {
        const doubleEffect = getUpgradeEffect(ownedUpgrades, 'double_or_nothing');
        if (doubleEffect && doubleEffect.type === 'double_or_nothing') {
          delta = Math.floor(delta * doubleEffect.winMultiplier);
        }
      }

      if (bet.kind === 'straight') {
        hasStraightWin = true;
      }
    } else {
      if (winningNumber === 0 && isOutsideBet(bet.kind) && zeroPushOutside) {
        delta = 0;
      } else {
        delta = -bet.amount;

        if (hasUpgrade(ownedUpgrades, 'double_or_nothing')) {
          const doubleEffect = getUpgradeEffect(ownedUpgrades, 'double_or_nothing');
          if (doubleEffect && doubleEffect.type === 'double_or_nothing') {
            delta = -Math.floor(bet.amount * doubleEffect.lossMultiplier);
          }
        }

        const refund = getLossRefund(ownedUpgrades);
        if (refund > 0) {
          delta += Math.floor(bet.amount * refund);
        }

        if (hasUpgrade(ownedUpgrades, 'first_loss_free') && !firstLossHandled && delta < 0) {
          delta = 0;
          firstLossHandled = true;
        }
      }
    }

    if (variantModifiers && delta > 0) {
      if (isOutsideBet(bet.kind) && variantModifiers.payoutOutsideWinMult) {
        delta = Math.floor(delta * variantModifiers.payoutOutsideWinMult);
      } else if (!isOutsideBet(bet.kind) && variantModifiers.payoutInsideWinMult) {
        delta = Math.floor(delta * variantModifiers.payoutInsideWinMult);
      }
    }

    totalDelta += delta;
    results.push({
      betId: bet.id,
      won,
      delta,
    });
  }

  if (hasStraightWin && hasUpgrade(ownedUpgrades, 'straight_jackpot')) {
    const jackpotEffect = getUpgradeEffect(ownedUpgrades, 'straight_jackpot');
    if (jackpotEffect && jackpotEffect.type === 'straight_jackpot') {
      totalDelta += jackpotEffect.bonus;
    }
  }

  if (winningNumber === 0 && hasUpgrade(ownedUpgrades, 'illegal_mode')) {
    totalDelta = Math.max(0, totalDelta);
  }

  return { totalDelta, results };
};
