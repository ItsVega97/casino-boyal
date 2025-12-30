import { Bet } from './bets';
import { resolveBetsWithUpgrades, BetResult } from './resolveBets';
import { pick3UpgradesNotOwned } from '../shop/shopLogic';
import { getTotalExtraSpins, getRoundStartBonus, selectRandomFavoredKind, hasUpgrade } from '../upgrades/apply';
import { generateVisionExclusions } from './roll';
import { getRoundTarget, getRoundSpinsBase } from './progression';
import { RouletteVariantId, getRouletteVariant } from '../rouletteVariants/catalog';

export type Phase = 'betting' | 'spinning' | 'resolving' | 'roundEnd' | 'gameOver';

export interface LastResult {
  winningNumber: number;
  totalDelta: number;
  betResults: BetResult[];
}

export interface GameState {
  round: number;
  spinsLeft: number;
  chips: number;
  targetChips: number;
  tickets: number;
  bets: Bet[];
  lockedBets: Bet[] | null;
  lastResult: LastResult | null;
  phase: Phase;
  triggerSpinToken: number;
  pendingWinningNumber: number | null;
  highScore: number;
  ownedUpgrades: string[];
  shopOffers: string[];
  selectedVariantId: RouletteVariantId;
  meta: {
    bestRunRoundsCleared: number;
  };
  run: {
    roundsCleared: number;
  };
  runStats: {
    maxChips: number;
  };
  ui: {
    screen: 'intro' | 'menu' | 'game' | 'shop' | 'gameOver' | 'history' | 'wiki' | 'achievements';
  };
  streak: {
    winsInRow: number;
    lossesInRow: number;
  };
  upgradeState: {
    rigged_counter_losses: number;
    first_loss_used: boolean;
    favored_kind?: string;
    vision_excluded?: number[];
  };
  repeatNextSpinFree: boolean;
}

export type GameAction =
  | { type: 'ADD_BET'; bet: Bet }
  | { type: 'REMOVE_BET'; betId: string }
  | { type: 'CLEAR_BETS' }
  | { type: 'START_SPIN'; winningNumber: number }
  | { type: 'SPIN_FINISHED'; winningNumber: number }
  | { type: 'RESOLVE_SPIN' }
  | { type: 'OPEN_SHOP' }
  | { type: 'BUY_UPGRADE'; upgradeId: string; cost: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_RUN' }
  | { type: 'GO_TO_INTRO' }
  | { type: 'GO_TO_MENU' }
  | { type: 'SELECT_VARIANT'; variantId: RouletteVariantId }
  | { type: 'START_NEW_RUN_WITH_VARIANT'; variantId: RouletteVariantId }
  | { type: 'START_NEW_RUN_FROM_INTRO' }
  | { type: 'OPEN_HISTORY' }
  | { type: 'OPEN_WIKI' }
  | { type: 'OPEN_ACHIEVEMENTS' }
  | { type: 'BACK_TO_MAIN_MENU' };

export const createInitialState = (): GameState => {
  const savedHighScore = localStorage.getItem('casinoBoyal_highScore');
  const savedBestRunRoundsCleared = localStorage.getItem('casinoBoyal_bestRunRoundsCleared');
  const initialVariant = getRouletteVariant('classic');

  return {
    round: 1,
    spinsLeft: getRoundSpinsBase(1, initialVariant.modifiers.spinsPerRoundDelta || 0),
    chips: 20,
    targetChips: getRoundTarget(1),
    tickets: 0,
    bets: [],
    lockedBets: null,
    lastResult: null,
    phase: 'betting',
    triggerSpinToken: 0,
    pendingWinningNumber: null,
    highScore: savedHighScore ? parseInt(savedHighScore, 10) : 1,
    ownedUpgrades: [],
    shopOffers: [],
    selectedVariantId: 'classic',
    meta: {
      bestRunRoundsCleared: savedBestRunRoundsCleared ? parseInt(savedBestRunRoundsCleared, 10) : 0,
    },
    run: {
      roundsCleared: 0,
    },
    runStats: {
      maxChips: 20,
    },
    ui: {
      screen: 'intro',
    },
    streak: {
      winsInRow: 0,
      lossesInRow: 0,
    },
    upgradeState: {
      rigged_counter_losses: 0,
      first_loss_used: false,
    },
    repeatNextSpinFree: false,
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ADD_BET': {
      if (state.phase !== 'betting') return state;

      const totalBetAmount = state.bets.reduce((sum, bet) => sum + bet.amount, 0);
      if (totalBetAmount + action.bet.amount > state.chips) {
        return state;
      }

      return {
        ...state,
        bets: [...state.bets, action.bet],
      };
    }

    case 'REMOVE_BET': {
      if (state.phase !== 'betting') return state;

      return {
        ...state,
        bets: state.bets.filter((bet) => bet.id !== action.betId),
      };
    }

    case 'CLEAR_BETS': {
      if (state.phase !== 'betting') return state;

      return {
        ...state,
        bets: [],
      };
    }

    case 'START_SPIN': {
      if (state.phase !== 'betting' || state.bets.length === 0) {
        return state;
      }

      let newUpgradeState = { ...state.upgradeState };

      if (hasUpgrade(state.ownedUpgrades, 'future_vision') && !state.upgradeState.vision_excluded) {
        newUpgradeState.vision_excluded = generateVisionExclusions();
      }

      return {
        ...state,
        phase: 'spinning',
        triggerSpinToken: state.triggerSpinToken + 1,
        pendingWinningNumber: action.winningNumber,
        lockedBets: [...state.bets],
        lastResult: null,
        upgradeState: newUpgradeState,
      };
    }

    case 'SPIN_FINISHED': {
      return {
        ...state,
        phase: 'resolving',
      };
    }

    case 'RESOLVE_SPIN': {
      if (state.phase !== 'resolving' || !state.lockedBets || state.pendingWinningNumber === null) {
        return state;
      }

      const winningNumber = state.pendingWinningNumber;
      const variant = getRouletteVariant(state.selectedVariantId);
      const resolution = resolveBetsWithUpgrades(winningNumber, state.lockedBets, state.ownedUpgrades, state.upgradeState, variant.modifiers);

      const newChips = state.chips + resolution.totalDelta;
      const newMaxChips = Math.max(state.runStats.maxChips, newChips);
      const newSpinsLeft = state.spinsLeft - 1;

      let newStreak = { ...state.streak };
      let newUpgradeState = { ...state.upgradeState };

      if (resolution.totalDelta > 0) {
        newStreak.winsInRow++;
        newStreak.lossesInRow = 0;
        newUpgradeState.rigged_counter_losses = 0;
      } else {
        newStreak.winsInRow = 0;
        newStreak.lossesInRow++;
        if (hasUpgrade(state.ownedUpgrades, 'rigged_counter')) {
          newUpgradeState.rigged_counter_losses++;
        }
      }

      if (newStreak.winsInRow >= 5) unlockAchievement('five_streak');
      if (newChips >= 500) unlockAchievement('rich_man');
      if (newChips >= 1000) unlockAchievement('millionaire');

      newUpgradeState.vision_excluded = undefined;

      let newBets = [];
      let newRepeatNextSpinFree = false;
      if (hasUpgrade(state.ownedUpgrades, 'free_repeat_after_win') && resolution.totalDelta > 0 && state.repeatNextSpinFree === false) {
        newBets = [...state.lockedBets];
        newRepeatNextSpinFree = true;
      }

      let newPhase: Phase = 'betting';

      if (newChips <= 0) {
        newPhase = 'gameOver';
      } else if (newChips >= state.targetChips) {
        newPhase = 'roundEnd';
      } else if (newSpinsLeft <= 0) {
        newPhase = 'gameOver';
      }

      if (newPhase === 'gameOver') {
        return {
          ...state,
          chips: newChips,
          spinsLeft: newSpinsLeft,
          bets: [],
          lockedBets: null,
          lastResult: {
            winningNumber,
            totalDelta: resolution.totalDelta,
            betResults: resolution.results,
          },
          phase: newPhase,
          pendingWinningNumber: null,
          streak: newStreak,
          upgradeState: newUpgradeState,
          repeatNextSpinFree: false,
          runStats: {
            maxChips: newMaxChips,
          },
          ui: {
            screen: 'gameOver',
          },
        };
      }

      return {
        ...state,
        chips: newChips,
        spinsLeft: newSpinsLeft,
        bets: newBets,
        lockedBets: null,
        lastResult: {
          winningNumber,
          totalDelta: resolution.totalDelta,
          betResults: resolution.results,
        },
        phase: newPhase,
        pendingWinningNumber: null,
        streak: newStreak,
        upgradeState: newUpgradeState,
        repeatNextSpinFree: newRepeatNextSpinFree,
        runStats: {
          maxChips: newMaxChips,
        },
      };
    }

    case 'OPEN_SHOP': {
      if (state.phase !== 'roundEnd') {
        return state;
      }

      const ticketsGained = Math.ceil(state.round * 0.75);
      const newTickets = state.tickets + ticketsGained;
      const newShopOffers = pick3UpgradesNotOwned(state.ownedUpgrades, state.round, state.selectedVariantId);

      if (import.meta.env.DEV) {
        console.log('🛍️ OPEN_SHOP:', {
          phase: state.phase,
          round: state.round,
          ticketsGained,
          newTickets,
          newShopOffersLength: newShopOffers.length,
          prevScreen: state.ui.screen,
        });
      }

      return {
        ...state,
        tickets: newTickets,
        shopOffers: newShopOffers,
        ui: {
          screen: 'shop',
        },
      };
    }

    case 'BUY_UPGRADE': {
      if (import.meta.env.DEV) {
        console.log('🛒 BUY_UPGRADE:', {
          upgradeId: action.upgradeId,
          cost: action.cost,
          screen: state.ui.screen,
          phase: state.phase,
          tickets: state.tickets,
          shopOffersLength: Array.isArray(state.shopOffers) ? state.shopOffers.length : 'INVALID',
          ownedUpgradesLength: Array.isArray(state.ownedUpgrades) ? state.ownedUpgrades.length : 'INVALID',
        });
      }

      if (state.ui.screen !== 'shop') {
        console.warn('BUY_UPGRADE: Not in shop screen, ignoring');
        return state;
      }

      const currentOffers = Array.isArray(state.shopOffers) ? state.shopOffers : [];
      const currentOwned = Array.isArray(state.ownedUpgrades) ? state.ownedUpgrades : [];

      if (state.tickets < action.cost) {
        console.warn('BUY_UPGRADE: Not enough tickets');
        return state;
      }

      if (currentOwned.includes(action.upgradeId)) {
        console.warn('BUY_UPGRADE: Already owned');
        return state;
      }

      addUpgradeToHistory(action.upgradeId);
      unlockAchievement('first_upgrade');

      const newShopOffers = currentOffers.filter(id => id !== action.upgradeId);
      const newOwnedUpgrades = [...currentOwned, action.upgradeId];

      const newState = {
        ...state,
        tickets: state.tickets - action.cost,
        ownedUpgrades: newOwnedUpgrades,
        shopOffers: newShopOffers,
        ui: {
          ...state.ui,
          screen: 'shop',
        },
      };

      if (import.meta.env.DEV) {
        console.log('✅ BUY_UPGRADE SUCCESS:', {
          newTickets: newState.tickets,
          newShopOffersLength: newShopOffers.length,
          newOwnedLength: newOwnedUpgrades.length,
          uiScreen: newState.ui.screen,
        });
      }

      return newState;
    }

    case 'NEXT_ROUND': {
      if (import.meta.env.DEV) {
        console.log('➡️ NEXT_ROUND:', {
          currentScreen: state.ui.screen,
          currentRound: state.round,
          phase: state.phase,
        });
      }

      if (state.ui.screen !== 'shop') {
        console.warn('NEXT_ROUND: Not in shop screen, ignoring');
        return state;
      }

      const newRound = state.round + 1;
      const newRoundsCleared = state.round;

      const newHighScore = Math.max(state.highScore, newRound);
      if (newHighScore > state.highScore) {
        localStorage.setItem('casinoBoyal_highScore', newHighScore.toString());
      }

      const newBestRunRoundsCleared = Math.max(state.meta.bestRunRoundsCleared, newRoundsCleared);
      if (newBestRunRoundsCleared > state.meta.bestRunRoundsCleared) {
        localStorage.setItem('casinoBoyal_bestRunRoundsCleared', newBestRunRoundsCleared.toString());
      }

      if (newRoundsCleared >= 1) unlockAchievement('first_win');
      if (newRoundsCleared >= 5) unlockAchievement('five_rounds');
      if (newRoundsCleared >= 10) unlockAchievement('ten_rounds');
      if (newRoundsCleared >= 20) unlockAchievement('twenty_rounds');
      if (newRoundsCleared >= 30) unlockAchievement('thirty_rounds');

      const extraSpins = getTotalExtraSpins(state.ownedUpgrades);
      const roundBonus = getRoundStartBonus(state.ownedUpgrades);
      const variant = getRouletteVariant(state.selectedVariantId);

      let newUpgradeState = {
        rigged_counter_losses: 0,
        first_loss_used: false,
        favored_kind: undefined as string | undefined,
        vision_excluded: undefined as number[] | undefined,
      };

      if (hasUpgrade(state.ownedUpgrades, 'hidden_multiplier')) {
        newUpgradeState.favored_kind = selectRandomFavoredKind();
      }

      const newChipsForRound = state.chips + roundBonus;
      const newMaxChips = Math.max(state.runStats.maxChips, newChipsForRound);

      return {
        ...state,
        round: newRound,
        spinsLeft: getRoundSpinsBase(newRound, variant.modifiers.spinsPerRoundDelta || 0) + extraSpins,
        chips: newChipsForRound,
        targetChips: getRoundTarget(newRound),
        phase: 'betting',
        lastResult: null,
        highScore: newHighScore,
        meta: {
          bestRunRoundsCleared: newBestRunRoundsCleared,
        },
        run: {
          roundsCleared: newRoundsCleared,
        },
        runStats: {
          maxChips: newMaxChips,
        },
        ui: {
          screen: 'game',
        },
        shopOffers: [],
        upgradeState: newUpgradeState,
        repeatNextSpinFree: false,
        streak: {
          winsInRow: 0,
          lossesInRow: 0,
        },
      };
    }

    case 'RESET_RUN': {
      const variant = getRouletteVariant(state.selectedVariantId);

      return {
        ...state,
        round: 1,
        spinsLeft: getRoundSpinsBase(1, variant.modifiers.spinsPerRoundDelta || 0),
        chips: 20,
        targetChips: getRoundTarget(1),
        tickets: 0,
        bets: [],
        lockedBets: null,
        lastResult: null,
        phase: 'betting',
        triggerSpinToken: 0,
        pendingWinningNumber: null,
        ownedUpgrades: [],
        shopOffers: [],
        run: {
          roundsCleared: 0,
        },
        runStats: {
          maxChips: 20,
        },
        ui: {
          screen: 'menu',
        },
        streak: {
          winsInRow: 0,
          lossesInRow: 0,
        },
        upgradeState: {
          rigged_counter_losses: 0,
          first_loss_used: false,
        },
        repeatNextSpinFree: false,
      };
    }

    case 'GO_TO_INTRO': {
      return {
        ...state,
        ui: {
          screen: 'intro',
        },
      };
    }

    case 'GO_TO_MENU': {
      return {
        ...state,
        ui: {
          screen: 'menu',
        },
      };
    }

    case 'START_NEW_RUN_WITH_VARIANT': {
      const variant = getRouletteVariant(action.variantId);
      const spinsPerRoundDelta = variant.modifiers.spinsPerRoundDelta || 0;

      if (action.variantId === 'jade') unlockAchievement('use_jade');
      if (action.variantId === 'shadow') unlockAchievement('use_shadow');

      return {
        ...state,
        selectedVariantId: action.variantId,
        round: 1,
        spinsLeft: getRoundSpinsBase(1, spinsPerRoundDelta),
        chips: 20,
        targetChips: getRoundTarget(1),
        tickets: 0,
        bets: [],
        lockedBets: null,
        lastResult: null,
        phase: 'betting',
        triggerSpinToken: 0,
        pendingWinningNumber: null,
        ownedUpgrades: [],
        shopOffers: [],
        run: {
          roundsCleared: 0,
        },
        runStats: {
          maxChips: 20,
        },
        ui: {
          screen: 'game',
        },
        streak: {
          winsInRow: 0,
          lossesInRow: 0,
        },
        upgradeState: {
          rigged_counter_losses: 0,
          first_loss_used: false,
        },
        repeatNextSpinFree: false,
      };
    }

    case 'SELECT_VARIANT': {
      const variant = getRouletteVariant(action.variantId);

      if (action.variantId === 'jade') unlockAchievement('use_jade');
      if (action.variantId === 'shadow') unlockAchievement('use_shadow');

      return {
        ...state,
        selectedVariantId: action.variantId,
        round: 1,
        spinsLeft: getRoundSpinsBase(1, variant.modifiers.spinsPerRoundDelta || 0),
        chips: 20,
        targetChips: getRoundTarget(1),
        tickets: 0,
        bets: [],
        lockedBets: null,
        lastResult: null,
        phase: 'betting',
        triggerSpinToken: 0,
        pendingWinningNumber: null,
        ownedUpgrades: [],
        shopOffers: [],
        run: {
          roundsCleared: 0,
        },
        runStats: {
          maxChips: 20,
        },
        ui: {
          screen: 'game',
        },
        streak: {
          winsInRow: 0,
          lossesInRow: 0,
        },
        upgradeState: {
          rigged_counter_losses: 0,
          first_loss_used: false,
        },
        repeatNextSpinFree: false,
      };
    }

    case 'START_NEW_RUN_FROM_INTRO': {
      return {
        ...state,
        ui: {
          screen: 'menu',
        },
      };
    }

    case 'OPEN_HISTORY': {
      return {
        ...state,
        ui: {
          screen: 'history',
        },
      };
    }

    case 'OPEN_WIKI': {
      return {
        ...state,
        ui: {
          screen: 'wiki',
        },
      };
    }

    case 'OPEN_ACHIEVEMENTS': {
      return {
        ...state,
        ui: {
          screen: 'achievements',
        },
      };
    }

    case 'BACK_TO_MAIN_MENU': {
      return {
        ...state,
        ui: {
          screen: 'intro',
        },
      };
    }

    default:
      return state;
  }
};
