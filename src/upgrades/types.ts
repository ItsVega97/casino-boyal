export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  tier: 1 | 2 | 3 | 4;
  description: string;
  effect: UpgradeEffect;
}

export type UpgradeEffect =
  | { type: 'probability_outside'; value: number }
  | { type: 'straight_payout_bonus'; value: number }
  | { type: 'extra_spins_per_round'; value: number }
  | { type: 'outside_win_multiplier'; value: number }
  | { type: 'loss_refund'; value: number }
  | { type: 'red_bias'; value: number }
  | { type: 'straight_bias'; value: number }
  | { type: 'compound_interest'; baseAmount: number; rate: number }
  | { type: 'free_repeat_after_win' }
  | { type: 'double_or_nothing'; winMultiplier: number; lossMultiplier: number }
  | { type: 'zero_push_outside' }
  | { type: 'hot_table'; streakRequired: number; bonusProb: number }
  | { type: 'hidden_multiplier'; bonusPayout: number }
  | { type: 'rigged_counter'; probPerLoss: number }
  | { type: 'first_loss_free' }
  | { type: 'round_start_bonus'; amount: number }
  | { type: 'double_outcome' }
  | { type: 'straight_jackpot'; bonus: number }
  | { type: 'future_vision'; excludeCount: number }
  | { type: 'illegal_mode'; payoutBonus: number };

export interface UpgradeState {
  rigged_counter_losses: number;
  first_loss_used: boolean;
  favored_kind?: string;
  vision_excluded?: number[];
}
