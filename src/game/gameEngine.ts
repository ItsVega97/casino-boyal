import { GameState, RoundConfig, Bet } from './types';
import { Roulette } from './roulette';
import { ItemSystem } from './items';

export class GameEngine {
  private state: GameState;
  private roulette: Roulette;
  private itemSystem: ItemSystem;
  private roundConfig: RoundConfig;
  private currentBets: Bet[] = [];

  constructor() {
    this.state = {
      round: 1,
      chips: 100,
      tickets: 0,
      objective: 200,
      accumulated: 0,
      spinsRemaining: 5,
      gameOver: false,
      items: [],
      highScore: this.loadHighScore(),
    };

    this.roulette = new Roulette(false);
    this.itemSystem = new ItemSystem();
    this.roundConfig = this.generateRoundConfig(1);
  }

  private generateRoundConfig(round: number): RoundConfig {
    const hasSecondZero = round > 5;
    const objective = 150 + round * 40;
    const baseSpins = Math.max(3, 8 - Math.floor(round / 3));
    const extraSpins = this.itemSystem.getExtraSpins();
    const spinsAllowed = baseSpins + extraSpins;
    const baseChips = 75 + round * 15;
    const chipBoost = this.itemSystem.hasItem('chip-boost') ? 50 : 0;
    const startingChips = baseChips + chipBoost;

    return {
      objective,
      spinsAllowed,
      startingChips,
      hasSecondZero,
    };
  }

  startRound(): void {
    this.roundConfig = this.generateRoundConfig(this.state.round);
    this.roulette = new Roulette(this.roundConfig.hasSecondZero);

    this.state.objective = this.roundConfig.objective;
    this.state.spinsRemaining = this.roundConfig.spinsAllowed;
    this.state.accumulated = 0;
    this.state.chips = this.roundConfig.startingChips;
    this.currentBets = [];
  }

  placeBet(bet: Bet): boolean {
    if (bet.amount > this.state.chips) return false;

    this.currentBets.push(bet);
    this.state.chips -= bet.amount;
    return true;
  }

  spin(): { winningNumber: number; result: SpinResult } {
    if (this.state.spinsRemaining <= 0) {
      return { winningNumber: -2, result: { payout: 0, betsWon: 0, betsLost: 0 } };
    }

    const winningNumber = this.roulette.spin();
    let totalPayout = 0;
    let betsWon = 0;
    let betsLost = 0;

    for (const bet of this.currentBets) {
      const payout = this.roulette.calculatePayout(
        bet,
        winningNumber,
        this.itemSystem.getPayoutMultiplier(),
      );

      if (payout > 0) {
        totalPayout += payout;
        this.state.chips += payout;
        betsWon++;
      } else if (this.itemSystem.hasItem('insurance')) {
        const insurance = Math.floor(bet.amount * 0.5);
        this.state.chips += insurance;
      } else {
        betsLost++;
      }
    }

    this.state.accumulated += totalPayout;
    this.state.spinsRemaining--;
    this.currentBets = [];

    return {
      winningNumber,
      result: { payout: totalPayout, betsWon, betsLost },
    };
  }

  depositChips(amount: number): boolean {
    if (amount > this.state.chips) return false;

    this.state.accumulated += amount;
    this.state.chips -= amount;
    return true;
  }

  endRound(): 'win' | 'lose' {
    if (this.state.accumulated >= this.state.objective) {
      let ticketsEarned = 1;

      if (this.state.accumulated > this.state.objective * 1.5) {
        ticketsEarned += 1;
      }

      if (this.itemSystem.hasItem('risk-taker') && this.state.accumulated > this.state.objective * 1.5) {
        ticketsEarned += 1;
      }

      this.state.tickets += ticketsEarned;
      this.state.round++;
      this.state.chips += this.state.accumulated;

      if (this.state.round > this.state.highScore) {
        this.state.highScore = this.state.round;
        this.saveHighScore(this.state.round);
      }

      return 'win';
    }

    this.state.gameOver = true;
    return 'lose';
  }

  purchaseItem(itemId: string): boolean {
    if (this.state.tickets < 1) return false;
    if (!this.itemSystem.purchaseItem(itemId)) return false;

    this.state.tickets--;
    this.state.items = this.itemSystem.getActiveItems();
    return true;
  }

  getState(): Readonly<GameState> {
    return { ...this.state };
  }

  getAvailableItems() {
    return this.itemSystem.getAvailableItems();
  }

  getItemSystem(): ItemSystem {
    return this.itemSystem;
  }

  getRoulette(): Roulette {
    return this.roulette;
  }

  resetGame(): void {
    this.state = {
      round: 1,
      chips: 100,
      tickets: 0,
      objective: 200,
      accumulated: 0,
      spinsRemaining: 5,
      gameOver: false,
      items: [],
      highScore: this.state.highScore,
    };

    this.itemSystem.reset();
    this.currentBets = [];
    this.roulette = new Roulette(false);
    this.roundConfig = this.generateRoundConfig(1);
  }

  private loadHighScore(): number {
    const saved = localStorage.getItem('casinoBoyal_highScore');
    return saved ? parseInt(saved, 10) : 1;
  }

  private saveHighScore(score: number): void {
    localStorage.setItem('casinoBoyal_highScore', score.toString());
  }
}

export interface SpinResult {
  payout: number;
  betsWon: number;
  betsLost: number;
}
