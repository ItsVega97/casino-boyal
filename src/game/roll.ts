import { Bet, RED_NUMBERS, BLACK_NUMBERS } from './bets';
import { hasUpgrade, getUpgradeEffect, hasRedBet, getStraightBets, hasOutsideBets } from '../upgrades/apply';
import { RngFunction } from './rng';

export interface RollContext {
  ownedUpgrades: string[];
  bets: Bet[];
  streak: { winsInRow: number; lossesInRow: number };
  rigged_counter_losses: number;
  vision_excluded?: number[];
}

function randomNumber(rng: RngFunction, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFromArray<T>(rng: RngFunction, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function rollWinningNumber(rng: RngFunction, context: RollContext): number {
  const { ownedUpgrades, bets, streak, rigged_counter_losses, vision_excluded } = context;

  let baseNumber = randomNumber(rng, 0, 36);

  if (vision_excluded && vision_excluded.length > 0) {
    let attempts = 0;
    while (vision_excluded.includes(baseNumber) && attempts < 100) {
      baseNumber = randomNumber(rng, 0, 36);
      attempts++;
    }
  }

  const straightBiasEffect = getUpgradeEffect(ownedUpgrades, 'straight_bias');
  if (straightBiasEffect && straightBiasEffect.type === 'straight_bias') {
    const straightBets = getStraightBets(bets);
    if (straightBets.length > 0) {
      if (rng() < straightBiasEffect.value) {
        const targetBet = straightBets.reduce((max, bet) => bet.amount > max.amount ? bet : max);
        if (targetBet.numbers && targetBet.numbers.length > 0) {
          const forcedNumber = randomFromArray(rng, targetBet.numbers);
          if (!vision_excluded || !vision_excluded.includes(forcedNumber)) {
            return forcedNumber;
          }
        }
      }
    }
  }

  const redBiasEffect = getUpgradeEffect(ownedUpgrades, 'red_bias');
  if (redBiasEffect && redBiasEffect.type === 'red_bias') {
    if (hasRedBet(bets)) {
      if (rng() < redBiasEffect.value) {
        const redNumbers = RED_NUMBERS.filter(n => !vision_excluded || !vision_excluded.includes(n));
        if (redNumbers.length > 0) {
          return randomFromArray(rng, redNumbers);
        }
      }
    }
  }

  let outsideBonusProb = 0;

  const luckyBeginnerEffect = getUpgradeEffect(ownedUpgrades, 'probability_outside');
  if (luckyBeginnerEffect && luckyBeginnerEffect.type === 'probability_outside') {
    if (hasOutsideBets(bets)) {
      outsideBonusProb += luckyBeginnerEffect.value;
    }
  }

  const hotTableEffect = getUpgradeEffect(ownedUpgrades, 'hot_table');
  if (hotTableEffect && hotTableEffect.type === 'hot_table') {
    if (streak.winsInRow >= hotTableEffect.streakRequired && hasOutsideBets(bets)) {
      outsideBonusProb += hotTableEffect.bonusProb;
    }
  }

  const riggedCounterEffect = getUpgradeEffect(ownedUpgrades, 'rigged_counter');
  if (riggedCounterEffect && riggedCounterEffect.type === 'rigged_counter') {
    if (hasOutsideBets(bets)) {
      outsideBonusProb += rigged_counter_losses * riggedCounterEffect.probPerLoss;
    }
  }

  if (outsideBonusProb > 0 && rng() < outsideBonusProb) {
    const winningNumbers: number[] = [];

    bets.forEach(bet => {
      if (bet.kind === 'red') winningNumbers.push(...RED_NUMBERS);
      if (bet.kind === 'black') winningNumbers.push(...BLACK_NUMBERS);
      if (bet.kind === 'even') winningNumbers.push(...[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36]);
      if (bet.kind === 'odd') winningNumbers.push(...[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35]);
      if (bet.kind === 'low') winningNumbers.push(...Array.from({length: 18}, (_, i) => i + 1));
      if (bet.kind === 'high') winningNumbers.push(...Array.from({length: 18}, (_, i) => i + 19));
      if (bet.kind === 'dozen' && bet.meta?.dozen) {
        const start = (bet.meta.dozen - 1) * 12 + 1;
        winningNumbers.push(...Array.from({length: 12}, (_, i) => start + i));
      }
      if (bet.kind === 'column' && bet.meta?.column) {
        for (let i = bet.meta.column; i <= 36; i += 3) {
          winningNumbers.push(i);
        }
      }
    });

    const uniqueWinning = [...new Set(winningNumbers)].filter(n => !vision_excluded || !vision_excluded.includes(n));
    if (uniqueWinning.length > 0) {
      return randomFromArray(rng, uniqueWinning);
    }
  }

  return baseNumber;
}

export function generateVisionExclusions(): number[] {
  const excluded: number[] = [];
  while (excluded.length < 3) {
    const num = Math.floor(Math.random() * 37);
    if (!excluded.includes(num)) {
      excluded.push(num);
    }
  }
  return excluded;
}
