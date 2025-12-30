import { Upgrade } from './types';

export const UPGRADE_CATALOG: Upgrade[] = [
  {
    id: 'lucky_beginner',
    name: 'Suerte del principiante',
    cost: 1,
    tier: 1,
    description: '+5% probabilidad de ganar en apuestas outside',
    effect: { type: 'probability_outside', value: 0.05 }
  },
  {
    id: 'marked_chips',
    name: 'Fichas marcadas',
    cost: 1,
    tier: 1,
    description: 'Apuestas straight pagan +1 extra (35→36)',
    effect: { type: 'straight_payout_bonus', value: 1 }
  },
  {
    id: 'extra_spin',
    name: 'Una tirada más',
    cost: 2,
    tier: 1,
    description: '+1 spin al inicio de cada ronda',
    effect: { type: 'extra_spins_per_round', value: 1 }
  },
  {
    id: 'generous_house',
    name: 'Casa generosa',
    cost: 2,
    tier: 1,
    description: 'Ganancias outside +10%',
    effect: { type: 'outside_win_multiplier', value: 1.10 }
  },
  {
    id: 'safety_cushion',
    name: 'Colchón de seguridad',
    cost: 3,
    tier: 1,
    description: 'Al perder, recuperas 10% de la apuesta',
    effect: { type: 'loss_refund', value: 0.10 }
  },
  {
    id: 'red_bias',
    name: 'Enfocado al rojo',
    cost: 4,
    tier: 2,
    description: 'Si apuestas a rojo, +10% probabilidad de salir rojo',
    effect: { type: 'red_bias', value: 0.10 }
  },
  {
    id: 'straight_bias',
    name: 'Bola caprichosa',
    cost: 4,
    tier: 2,
    description: 'Con apuesta straight, +15% probabilidad de salir ese número',
    effect: { type: 'straight_bias', value: 0.15 }
  },
  {
    id: 'compound_interest',
    name: 'Interés compuesto',
    cost: 5,
    tier: 2,
    description: 'Al completar ronda: +5% de tus fichas (máx 50)',
    effect: { type: 'compound_interest', baseAmount: 50, rate: 0.05 }
  },
  {
    id: 'free_repeat_after_win',
    name: 'Repetir apuesta',
    cost: 5,
    tier: 2,
    description: 'Tras ganar, mantén las mismas apuestas para el próximo spin',
    effect: { type: 'free_repeat_after_win' }
  },
  {
    id: 'double_or_nothing',
    name: 'Todo o nada',
    cost: 6,
    tier: 2,
    description: 'Ganancias x2, pero pérdidas x1.5',
    effect: { type: 'double_or_nothing', winMultiplier: 2, lossMultiplier: 1.5 }
  },
  {
    id: 'bribed_croupier',
    name: 'Crupier sobornado',
    cost: 8,
    tier: 3,
    description: 'Si sale 0, apuestas outside empatan (no pierdes)',
    effect: { type: 'zero_push_outside' }
  },
  {
    id: 'hot_table',
    name: 'Mesa caliente',
    cost: 8,
    tier: 3,
    description: 'Tras 2 victorias seguidas, +25% prob. outside',
    effect: { type: 'hot_table', streakRequired: 2, bonusProb: 0.25 }
  },
  {
    id: 'hidden_multiplier',
    name: 'Multiplicador oculto',
    cost: 9,
    tier: 3,
    description: 'Cada ronda, un tipo de apuesta aleatorio paga +3',
    effect: { type: 'hidden_multiplier', bonusPayout: 3 }
  },
  {
    id: 'rigged_counter',
    name: 'Contador amañado',
    cost: 10,
    tier: 3,
    description: 'Cada pérdida: +5% prob. outside. Se resetea al ganar',
    effect: { type: 'rigged_counter', probPerLoss: 0.05 }
  },
  {
    id: 'first_loss_free',
    name: 'Seguro total',
    cost: 12,
    tier: 3,
    description: 'La primera apuesta perdida de cada ronda no resta fichas',
    effect: { type: 'first_loss_free' }
  },
  {
    id: 'casino_favor',
    name: 'Favor del casino',
    cost: 13,
    tier: 4,
    description: 'Al inicio de cada ronda: +20 fichas',
    effect: { type: 'round_start_bonus', amount: 20 }
  },
  {
    id: 'double_outcome',
    name: 'Distorsión del destino',
    cost: 14,
    tier: 4,
    description: 'Cada spin genera 2 resultados y elige el mejor para ti',
    effect: { type: 'double_outcome' }
  },
  {
    id: 'straight_jackpot',
    name: 'Jackpot oculto',
    cost: 15,
    tier: 4,
    description: 'Ganar straight: +50 fichas de bonus',
    effect: { type: 'straight_jackpot', bonus: 50 }
  },
  {
    id: 'future_vision',
    name: 'Visión futura',
    cost: 18,
    tier: 4,
    description: 'Antes de apostar, ves 3 números que NO saldrán',
    effect: { type: 'future_vision', excludeCount: 3 }
  },
  {
    id: 'illegal_mode',
    name: 'Modo ilegal',
    cost: 20,
    tier: 4,
    description: 'Todas las ganancias +1 payout. Si sale 0, no pierdes',
    effect: { type: 'illegal_mode', payoutBonus: 1 }
  }
];

export function getUpgradeById(id: string): Upgrade | undefined {
  return UPGRADE_CATALOG.find(u => u.id === id);
}

export function getUpgradesByIds(ids: string[]): Upgrade[] {
  return ids.map(id => getUpgradeById(id)).filter((u): u is Upgrade => u !== undefined);
}
