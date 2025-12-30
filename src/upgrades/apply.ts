import { Upgrade, UpgradeEffect } from './types';
import { getUpgradesByIds } from './catalog';
import { Bet } from '../game/bets';

export function getTotalExtraSpins(ownedUpgrades: string[]): number {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  return upgrades.reduce((total, u) => {
    if (u.effect.type === 'extra_spins_per_round') {
      return total + u.effect.value;
    }
    return total;
  }, 0);
}

export function getRoundStartBonus(ownedUpgrades: string[]): number {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  return upgrades.reduce((total, u) => {
    if (u.effect.type === 'round_start_bonus') {
      return total + u.effect.amount;
    }
    return total;
  }, 0);
}

export function getCompoundInterestBonus(chips: number, ownedUpgrades: string[]): number {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  let bonus = 0;
  upgrades.forEach(u => {
    if (u.effect.type === 'compound_interest') {
      const amount = Math.floor(chips * u.effect.rate);
      bonus += Math.min(u.effect.baseAmount, amount);
    }
  });
  return bonus;
}

export function hasUpgrade(ownedUpgrades: string[], upgradeId: string): boolean {
  return ownedUpgrades.includes(upgradeId);
}

export function getUpgradeEffect(ownedUpgrades: string[], effectType: UpgradeEffect['type']): UpgradeEffect | undefined {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  const upgrade = upgrades.find(u => u.effect.type === effectType);
  return upgrade?.effect;
}

export function getAllUpgradeEffects(ownedUpgrades: string[], effectType: UpgradeEffect['type']): UpgradeEffect[] {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  return upgrades.filter(u => u.effect.type === effectType).map(u => u.effect);
}

export function getStraightPayoutBonus(ownedUpgrades: string[]): number {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  let bonus = 0;
  upgrades.forEach(u => {
    if (u.effect.type === 'straight_payout_bonus') {
      bonus += u.effect.value;
    }
    if (u.effect.type === 'illegal_mode') {
      bonus += u.effect.payoutBonus;
    }
  });
  return bonus;
}

export function getOutsideWinMultiplier(ownedUpgrades: string[]): number {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  let multiplier = 1.0;
  upgrades.forEach(u => {
    if (u.effect.type === 'outside_win_multiplier') {
      multiplier *= u.effect.value;
    }
  });
  return multiplier;
}

export function getLossRefund(ownedUpgrades: string[]): number {
  const upgrades = getUpgradesByIds(ownedUpgrades);
  let refund = 0;
  upgrades.forEach(u => {
    if (u.effect.type === 'loss_refund') {
      refund += u.effect.value;
    }
  });
  return refund;
}

export function selectRandomFavoredKind(): string {
  const kinds = ['straight', 'red', 'black', 'even', 'odd', 'low', 'high', 'dozen', 'column'];
  return kinds[Math.floor(Math.random() * kinds.length)];
}

export function isOutsideBet(kind: string): boolean {
  return ['red', 'black', 'even', 'odd', 'low', 'high', 'dozen', 'column'].includes(kind);
}

export function hasRedBet(bets: Bet[]): boolean {
  return bets.some(b => b.kind === 'red');
}

export function getStraightBets(bets: Bet[]): Bet[] {
  return bets.filter(b => b.kind === 'straight');
}

export function hasOutsideBets(bets: Bet[]): boolean {
  return bets.some(b => isOutsideBet(b.kind));
}
