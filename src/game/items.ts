import { ItemEffect } from './types';

export class ItemSystem {
  private items: Map<string, ItemEffect> = new Map();
  private activeItems: Set<string> = new Set();
  private payoutMultiplier = 1;
  private redBias = 0;
  private extraSpins = 0;
  private insuranceActive = false;

  constructor() {
    this.initializeItems();
  }

  private initializeItems(): void {
    const items: ItemEffect[] = [
      {
        id: 'hidden-magnet',
        name: 'Hidden Magnet',
        description: 'Increases red probability by 15%',
        cost: 5,
        type: 'passive',
        effect: () => {
          this.redBias += 0.15;
        },
      },
      {
        id: 'insurance',
        name: 'Insurance Policy',
        description: 'Recover 50% of lost bet amounts',
        cost: 4,
        type: 'passive',
        effect: () => {
          this.insuranceActive = true;
        },
      },
      {
        id: 'payout-boost',
        name: 'Lucky Charm',
        description: 'Increase all winnings by 25%',
        cost: 6,
        type: 'passive',
        effect: () => {
          this.payoutMultiplier *= 1.25;
        },
      },
      {
        id: 'extra-spin',
        name: 'Extra Spins',
        description: '+2 spins per round',
        cost: 3,
        type: 'passive',
        effect: () => {
          this.extraSpins += 2;
        },
      },
      {
        id: 'chip-boost',
        name: 'Chip Stack',
        description: '+50 starting chips per round',
        cost: 4,
        type: 'passive',
        effect: () => {},
      },
      {
        id: 'risk-taker',
        name: 'Risk Taker',
        description: '+1 Ticket when you exceed objective by 50%',
        cost: 3,
        type: 'passive',
        effect: () => {},
      },
    ];

    items.forEach((item) => this.items.set(item.id, item));
  }

  getAvailableItems(): ItemEffect[] {
    return Array.from(this.items.values());
  }

  purchaseItem(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    item.effect();
    this.activeItems.add(itemId);
    return true;
  }

  getPayoutMultiplier(): number {
    return this.payoutMultiplier;
  }

  getRedBias(): number {
    return this.redBias;
  }

  getExtraSpins(): number {
    return this.extraSpins;
  }

  getInsuranceActive(): boolean {
    return this.insuranceActive;
  }

  hasItem(itemId: string): boolean {
    return this.activeItems.has(itemId);
  }

  getActiveItems(): ItemEffect[] {
    return Array.from(this.activeItems).map((id) => this.items.get(id)!);
  }

  reset(): void {
    this.activeItems.clear();
    this.payoutMultiplier = 1;
    this.redBias = 0;
    this.extraSpins = 0;
    this.insuranceActive = false;
  }
}
