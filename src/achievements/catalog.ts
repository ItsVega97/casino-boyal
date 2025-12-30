export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'rounds' | 'upgrades' | 'roulettes' | 'gameplay' | 'special';
}

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  {
    id: 'first_win',
    name: 'Primera victoria',
    description: 'Completa tu primera ronda',
    category: 'rounds',
  },
  {
    id: 'five_rounds',
    name: 'Veterano',
    description: 'Completa 5 rondas en una partida',
    category: 'rounds',
  },
  {
    id: 'ten_rounds',
    name: 'Maestro',
    description: 'Completa 10 rondas en una partida',
    category: 'rounds',
  },
  {
    id: 'twenty_rounds',
    name: 'Leyenda',
    description: 'Completa 20 rondas en una partida',
    category: 'rounds',
  },
  {
    id: 'thirty_rounds',
    name: 'Inmortal',
    description: 'Completa 30 rondas en una partida',
    category: 'rounds',
  },
  {
    id: 'first_upgrade',
    name: 'Compra inteligente',
    description: 'Compra tu primera mejora',
    category: 'upgrades',
  },
  {
    id: 'five_upgrades',
    name: 'Coleccionista',
    description: 'Compra 5 mejoras diferentes',
    category: 'upgrades',
  },
  {
    id: 'ten_upgrades',
    name: 'Acaparador',
    description: 'Compra 10 mejoras diferentes',
    category: 'upgrades',
  },
  {
    id: 'all_tier1',
    name: 'Tier 1 completo',
    description: 'Compra todas las mejoras de Tier 1',
    category: 'upgrades',
  },
  {
    id: 'all_upgrades',
    name: 'Perfeccionista',
    description: 'Compra todas las mejoras del juego',
    category: 'upgrades',
  },
  {
    id: 'use_jade',
    name: 'Ruleta de jade',
    description: 'Juega una partida con la ruleta Jade Fortune',
    category: 'roulettes',
  },
  {
    id: 'use_shadow',
    name: 'Ruleta sombría',
    description: 'Juega una partida con la ruleta Shadow',
    category: 'roulettes',
  },
  {
    id: 'straight_win',
    name: 'Golpe de suerte',
    description: 'Gana con una apuesta straight',
    category: 'gameplay',
  },
  {
    id: 'five_streak',
    name: 'Racha increíble',
    description: 'Consigue 5 victorias seguidas',
    category: 'gameplay',
  },
  {
    id: 'rich_man',
    name: 'Hombre rico',
    description: 'Alcanza 500 fichas en una partida',
    category: 'gameplay',
  },
  {
    id: 'millionaire',
    name: 'Millonario',
    description: 'Alcanza 1000 fichas en una partida',
    category: 'gameplay',
  },
  {
    id: 'zero_win',
    name: 'Verde ganador',
    description: 'Gana apostando al 0',
    category: 'gameplay',
  },
  {
    id: 'last_spin_clutch',
    name: 'Al límite',
    description: 'Completa una ronda en el último giro',
    category: 'gameplay',
  },
  {
    id: 'perfect_round',
    name: 'Ronda perfecta',
    description: 'Completa una ronda sin perder ninguna apuesta',
    category: 'special',
  },
  {
    id: 'first_death',
    name: 'Todos caemos',
    description: 'Pierde tu primera partida',
    category: 'special',
  },
  {
    id: 'ten_runs',
    name: 'Persistente',
    description: 'Completa 10 partidas',
    category: 'special',
  },
  {
    id: 'comeback',
    name: 'Regreso épico',
    description: 'Gana una ronda teniendo menos de 50 fichas',
    category: 'special',
  },
  {
    id: 'big_bet',
    name: 'Alto riesgo',
    description: 'Haz una apuesta de 50 fichas o más',
    category: 'gameplay',
  },
  {
    id: 'all_bet_types',
    name: 'Experimentador',
    description: 'Usa todos los tipos de apuesta al menos una vez',
    category: 'gameplay',
  },
  {
    id: 'shop_rush',
    name: 'Compras compulsivas',
    description: 'Compra 3 mejoras en una sola visita a la tienda',
    category: 'special',
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_CATALOG.find(a => a.id === id);
}
