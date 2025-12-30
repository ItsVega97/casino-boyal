import { BetType, Bet } from './types';

export class Roulette {
  private wheelSize: number;
  private hasSecondZero: boolean;

  constructor(hasSecondZero = false) {
    this.hasSecondZero = hasSecondZero;
    this.wheelSize = hasSecondZero ? 38 : 37;
  }

  spin(): number {
    if (this.hasSecondZero && Math.random() < 1 / 38) {
      return -1;
    }
    return Math.floor(Math.random() * 37);
  }

  isRed(num: number): boolean {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num);
  }

  isBlack(num: number): boolean {
    return num !== 0 && !this.isRed(num);
  }

  calculatePayout(bet: Bet, winningNumber: number, payoutMultiplier = 1): number {
    if (!this.isBetWinner(bet, winningNumber)) {
      return 0;
    }

    const basePayouts: Record<BetType, number> = {
      red: 1,
      black: 1,
      even: 1,
      odd: 1,
      low: 1,
      high: 1,
      column1: 2,
      column2: 2,
      column3: 2,
      dozen1: 2,
      dozen2: 2,
      dozen3: 2,
      exact: 35,
    };

    const payout = basePayouts[bet.type] || 0;
    return Math.floor(bet.amount * payout * payoutMultiplier);
  }

  private isBetWinner(bet: Bet, winningNumber: number): boolean {
    if (winningNumber === 0 || winningNumber === -1) {
      return bet.type === 'exact' && bet.value === 0;
    }

    switch (bet.type) {
      case 'red':
        return this.isRed(winningNumber);
      case 'black':
        return this.isBlack(winningNumber);
      case 'even':
        return winningNumber % 2 === 0;
      case 'odd':
        return winningNumber % 2 === 1;
      case 'low':
        return winningNumber >= 1 && winningNumber <= 18;
      case 'high':
        return winningNumber >= 19 && winningNumber <= 36;
      case 'column1':
        return winningNumber % 3 === 1;
      case 'column2':
        return winningNumber % 3 === 2;
      case 'column3':
        return winningNumber % 3 === 0;
      case 'dozen1':
        return winningNumber >= 1 && winningNumber <= 12;
      case 'dozen2':
        return winningNumber >= 13 && winningNumber <= 24;
      case 'dozen3':
        return winningNumber >= 25 && winningNumber <= 36;
      case 'exact':
        return winningNumber === bet.value;
      default:
        return false;
    }
  }

  getWheelSize(): number {
    return this.wheelSize;
  }
}
