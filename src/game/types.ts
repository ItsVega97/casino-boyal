export type BetType =
  | 'red'
  | 'black'
  | 'even'
  | 'odd'
  | 'low'
  | 'high'
  | 'column1'
  | 'column2'
  | 'column3'
  | 'dozen1'
  | 'dozen2'
  | 'dozen3'
  | 'exact';

export interface Bet {
  type: BetType;
  amount: number;
  value?: number;
}

export interface ItemEffect {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'passive' | 'active';
  effect: () => void;
  isActive?: boolean;
}

export interface GameState {
  round: number;
  chips: number;
  tickets: number;
  objective: number;
  accumulated: number;
  spinsRemaining: number;
  gameOver: boolean;
  items: ItemEffect[];
  highScore: number;
}

export interface RoundConfig {
  objective: number;
  spinsAllowed: number;
  startingChips: number;
  hasSecondZero?: boolean;
}
