import React, { useReducer, useState } from 'react';
import { RouletteCanvas } from './RouletteCanvas';
import { ShopModal } from './ShopModal';
import { OwnedUpgradesPanel } from './OwnedUpgradesPanel';
import { ProbabilityTable } from './ProbabilityTable';
import { IntroLetterScreen } from './IntroLetterScreen';
import { FlavorBanner } from './FlavorBanner';
import { ResultToast } from './ResultToast';
import { gameReducer, createInitialState } from '../game/gameReducer';
import { Bet, BetKind, getBetDescription } from '../game/bets';
import { rollWinningNumber } from '../game/roll';
import { hasUpgrade } from '../upgrades/apply';
import { resolveBetsWithUpgrades } from '../game/resolveBets';
import { makeRng } from '../game/rng';
import { useFlavorText } from '../lore/useFlavorText';
import { getRouletteVariant } from '../rouletteVariants/catalog';
import { RouletteMenuScreen } from './RouletteMenuScreen';
import { RouletteCardFlip } from './RouletteCardFlip';

interface GameScreenProps {
  onGameOver: (round: number, highScore: number) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const [betAmount, setBetAmount] = useState(5);
  const [activeTab, setActiveTab] = useState<'outside' | 'inside'>('outside');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastNumber, setToastNumber] = useState<number | null>(null);

  const handleAddBet = (kind: BetKind, numbers?: number[], meta?: Bet['meta']) => {
    const bet: Bet = {
      id: `${Date.now()}-${Math.random()}`,
      kind,
      amount: betAmount,
      numbers,
      meta,
    };
    dispatch({ type: 'ADD_BET', bet });
  };

  const handleRemoveBet = (betId: string) => {
    dispatch({ type: 'REMOVE_BET', betId });
  };

  const handleSpin = () => {
    if (state.phase !== 'betting' || state.bets.length === 0) return;

    const rollContext = {
      ownedUpgrades: state.ownedUpgrades,
      bets: state.bets,
      streak: state.streak,
      rigged_counter_losses: state.upgradeState.rigged_counter_losses,
      vision_excluded: state.upgradeState.vision_excluded,
    };

    const rng = makeRng(Date.now() ^ state.round ^ state.tickets);
    let winningNumber = rollWinningNumber(rng, rollContext);

    const variant = getRouletteVariant(state.selectedVariantId);
    const hasDoubleOutcome = hasUpgrade(state.ownedUpgrades, 'double_outcome') || variant.modifiers.builtInDoubleOutcome;

    if (hasDoubleOutcome) {
      const number2 = rollWinningNumber(rng, rollContext);
      const result1 = resolveBetsWithUpgrades(winningNumber, state.bets, state.ownedUpgrades, state.upgradeState, variant.modifiers);
      const result2 = resolveBetsWithUpgrades(number2, state.bets, state.ownedUpgrades, state.upgradeState, variant.modifiers);

      if (result2.totalDelta > result1.totalDelta) {
        winningNumber = number2;
      }
    }

    dispatch({ type: 'START_SPIN', winningNumber });
  };

  const handleSpinComplete = (winningNumber: number) => {
    setToastNumber(winningNumber);
    setToastOpen(true);
    dispatch({ type: 'SPIN_FINISHED', winningNumber });
    setTimeout(() => {
      dispatch({ type: 'RESOLVE_SPIN' });
    }, 100);
  };

  const handleNextRound = () => {
    dispatch({ type: 'OPEN_SHOP' });
  };

  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    dispatch({ type: 'BUY_UPGRADE', upgradeId, cost });
  };

  const handleCloseShop = () => {
    dispatch({ type: 'NEXT_ROUND' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_RUN' });
  };

  const handleGameOverClick = () => {
    const defeatedReason = state.spinsLeft <= 0 ? 'outOfSpins' : 'outOfChips';
    const { saveRunRecord } = require('../game/runHistory');
    saveRunRecord({
      rouletteVariantId: state.selectedVariantId,
      roundsCompleted: state.run.roundsCleared,
      maxChips: state.chips,
      ticketsEarned: state.tickets,
      defeatedReason,
    });

    const { unlockAchievement } = require('../achievements/system');
    unlockAchievement('first_death');

    onGameOver(state.round, state.highScore);
  };

  const handleStartFromIntro = () => {
    dispatch({ type: 'START_NEW_RUN_FROM_INTRO' });
  };

  const canSpin = state.phase === 'betting' && state.bets.length > 0;
  const isSpinning = state.phase === 'spinning' || state.phase === 'resolving';

  const totalBetAmount = state.bets.reduce((sum, bet) => sum + bet.amount, 0);

  const roundStartFlavor = useFlavorText('roundStart', state.round);
  const roundWinFlavor = useFlavorText('roundWin', state.round);
  const gameOverFlavor = useFlavorText('gameOver', state.round + 1000);

  if (state.ui.screen === 'intro') {
    return <IntroLetterScreen onStart={handleStartFromIntro} />;
  }

  if (state.ui.screen === 'menu') {
    return (
      <RouletteMenuScreen
        bestRunRoundsCleared={state.meta.bestRunRoundsCleared}
        onSelectVariant={(variantId) => dispatch({ type: 'START_NEW_RUN_WITH_VARIANT', variantId })}
      />
    );
  }

  if (state.ui.screen === 'history' || state.ui.screen === 'wiki' || state.ui.screen === 'achievements') {
    return (
      <div className="min-h-dvh w-full bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-yellow-400 text-xl mb-4">Screen: {state.ui.screen}</p>
          <p className="text-gray-400 mb-4">Esta pantalla no está implementada en este contexto</p>
          <button
            onClick={() => dispatch({ type: 'GO_TO_MENU' })}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  if (state.ui.screen === 'gameOver') {
    return (
      <div className="min-h-dvh w-full bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">GAME OVER</p>
          <button
            onClick={handleGameOverClick}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded"
          >
            Volver al Menú Principal
          </button>
        </div>
      </div>
    );
  }

  if (state.ui.screen !== 'game' && state.ui.screen !== 'shop') {
    return (
      <div className="min-h-dvh w-full bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">ERROR: Screen desconocida</p>
          <p className="text-gray-400 mb-2">state.ui.screen = {state.ui.screen}</p>
          <p className="text-gray-400 mb-4">Este es un estado inválido</p>
          <button
            onClick={() => dispatch({ type: 'GO_TO_MENU' })}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  const currentVariant = getRouletteVariant(state.selectedVariantId);

  return (
    <div className="min-h-dvh w-full bg-black">
      <div className="mx-auto max-w-6xl p-3 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:gap-6">
          <section className="w-full md:flex-[2] flex flex-col gap-3">
            <RouletteCardFlip
              frontContent={
                <RouletteCanvas
                  widthBase={480}
                  heightBase={480}
                  winningNumber={state.pendingWinningNumber}
                  phase={isSpinning ? 'spinning' : 'idle'}
                  onSpinComplete={handleSpinComplete}
                  triggerSpinToken={state.triggerSpinToken}
                />
              }
              backContent={<ProbabilityTable state={state} bets={state.bets} />}
            />

            {state.phase === 'betting' && (
              <FlavorBanner text={roundStartFlavor} variant="default" />
            )}

            {state.phase === 'roundEnd' && (
              <FlavorBanner text={roundWinFlavor} variant="success" />
            )}

            {state.phase === 'gameOver' && (
              <FlavorBanner text={gameOverFlavor} variant="danger" />
            )}

            <div className="bg-gray-950 rounded-lg border-2 border-purple-600 p-3 text-center">
              <p className="text-xs text-purple-400 font-mono mb-1">RULETA ACTIVA</p>
              <p className="text-sm font-bold text-purple-200">{currentVariant.name}</p>
            </div>

          <div className="flex flex-wrap gap-2 bg-gray-950 rounded-lg border-2 border-yellow-600 p-3">
            <div className="flex-1 min-w-[90px] bg-gray-900 rounded p-2 border border-cyan-500">
              <p className="text-xs text-cyan-400 font-mono">ROUND</p>
              <p className="text-lg font-bold text-cyan-200">{state.round}</p>
            </div>
            <div className="flex-1 min-w-[90px] bg-gray-900 rounded p-2 border border-yellow-500">
              <p className="text-xs text-yellow-400 font-mono">CHIPS</p>
              <p className="text-lg font-bold text-yellow-200">${state.chips}</p>
            </div>
            <div className="flex-1 min-w-[90px] bg-gray-900 rounded p-2 border border-green-500">
              <p className="text-xs text-green-400 font-mono">TARGET</p>
              <p className="text-lg font-bold text-green-200">${state.targetChips}</p>
            </div>
            <div className="flex-1 min-w-[90px] bg-gray-900 rounded p-2 border border-red-500">
              <p className="text-xs text-red-400 font-mono">SPINS</p>
              <p className="text-lg font-bold text-red-200">{state.spinsLeft}</p>
            </div>
          </div>

          {state.lastResult && (
            <div
              className={`bg-gray-950 rounded-lg border-2 p-3 ${
                state.lastResult.totalDelta >= 0 ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <p className="text-sm font-mono text-gray-300 text-center">
                Number: <span className="text-yellow-400 font-bold text-xl">{state.lastResult.winningNumber}</span>
              </p>
              <p
                className={`text-xl font-black text-center ${
                  state.lastResult.totalDelta >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {state.lastResult.totalDelta >= 0
                  ? `WON +$${state.lastResult.totalDelta}!`
                  : `LOST $${Math.abs(state.lastResult.totalDelta)}`}
              </p>
            </div>
          )}
          </section>

          <aside className="w-full md:flex-[1] flex flex-col gap-3">
            <div className="bg-gray-950 rounded-xl border-2 border-yellow-600 p-4 overflow-y-auto max-h-[60dvh] md:max-h-[75dvh]">
            <h3 className="text-sm font-bold text-yellow-400 mb-3">[ BETTING ]</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">BET AMOUNT</p>
                <div className="flex gap-2">
                  <button
                    onPointerDown={() => setBetAmount(Math.max(5, betAmount - 5))}
                    disabled={isSpinning}
                    className="px-4 py-3 bg-gray-800 text-white rounded font-bold active:bg-gray-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-gray-900 rounded border-2 border-yellow-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-yellow-400">${betAmount}</span>
                  </div>
                  <button
                    onPointerDown={() => setBetAmount(Math.min(state.chips - totalBetAmount, betAmount + 5))}
                    disabled={isSpinning}
                    className="px-4 py-3 bg-gray-800 text-white rounded font-bold active:bg-gray-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-2 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('outside')}
                  className={`flex-1 py-2 font-bold text-sm transition-colors ${
                    activeTab === 'outside'
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-gray-500'
                  }`}
                >
                  OUTSIDE
                </button>
                <button
                  onClick={() => setActiveTab('inside')}
                  className={`flex-1 py-2 font-bold text-sm transition-colors ${
                    activeTab === 'inside'
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-gray-500'
                  }`}
                >
                  INSIDE
                </button>
              </div>

              {activeTab === 'outside' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onPointerDown={() => handleAddBet('red')}
                      disabled={isSpinning || state.phase !== 'betting'}
                      className="py-3 px-2 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded transition-all active:scale-95 disabled:opacity-50"
                    >
                      RED
                    </button>
                    <button
                      onPointerDown={() => handleAddBet('black')}
                      disabled={isSpinning || state.phase !== 'betting'}
                      className="py-3 px-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm rounded transition-all active:scale-95 disabled:opacity-50"
                    >
                      BLACK
                    </button>
                    <button
                      onPointerDown={() => handleAddBet('even')}
                      disabled={isSpinning || state.phase !== 'betting'}
                      className="py-3 px-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded transition-all active:scale-95 disabled:opacity-50"
                    >
                      EVEN
                    </button>
                    <button
                      onPointerDown={() => handleAddBet('odd')}
                      disabled={isSpinning || state.phase !== 'betting'}
                      className="py-3 px-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded transition-all active:scale-95 disabled:opacity-50"
                    >
                      ODD
                    </button>
                    <button
                      onPointerDown={() => handleAddBet('low')}
                      disabled={isSpinning || state.phase !== 'betting'}
                      className="py-3 px-2 bg-green-700 hover:bg-green-800 text-white font-bold text-sm rounded transition-all active:scale-95 disabled:opacity-50"
                    >
                      1-18
                    </button>
                    <button
                      onPointerDown={() => handleAddBet('high')}
                      disabled={isSpinning || state.phase !== 'betting'}
                      className="py-3 px-2 bg-green-700 hover:bg-green-800 text-white font-bold text-sm rounded transition-all active:scale-95 disabled:opacity-50"
                    >
                      19-36
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((dozen) => (
                      <button
                        key={`dozen-${dozen}`}
                        onPointerDown={() => handleAddBet('dozen', undefined, { dozen: dozen as 1 | 2 | 3 })}
                        disabled={isSpinning || state.phase !== 'betting'}
                        className="py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded transition-all active:scale-95 disabled:opacity-50"
                      >
                        D{dozen}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((column) => (
                      <button
                        key={`column-${column}`}
                        onPointerDown={() => handleAddBet('column', undefined, { column: column as 1 | 2 | 3 })}
                        disabled={isSpinning || state.phase !== 'betting'}
                        className="py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded transition-all active:scale-95 disabled:opacity-50"
                      >
                        C{column}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'inside' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Select a number for straight bet:</p>
                  <div className="grid grid-cols-6 gap-1 max-h-[200px] overflow-y-auto">
                    {[0, ...Array.from({ length: 36 }, (_, i) => i + 1)].map((num) => (
                      <button
                        key={num}
                        onPointerDown={() => handleAddBet('straight', [num])}
                        disabled={isSpinning || state.phase !== 'betting'}
                        className={`py-2 font-bold text-xs rounded transition-all active:scale-95 disabled:opacity-50 ${
                          num === 0
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-800 text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.phase === 'betting' && (
                <>
                  {state.bets.length > 0 && (
                    <button
                      onPointerDown={() => dispatch({ type: 'CLEAR_BETS' })}
                      className="w-full py-2 bg-gray-700 text-white font-bold rounded transition-all active:scale-95"
                    >
                      CLEAR ALL
                    </button>
                  )}
                  <button
                    onPointerDown={handleSpin}
                    disabled={!canSpin}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-lg transition-all active:scale-95 border-4 border-red-900 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    SPIN!
                  </button>
                </>
              )}

              {state.phase === 'roundEnd' && (
                <button
                  onPointerDown={handleNextRound}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-lg transition-all active:scale-95 border-4 border-green-900 shadow-lg"
                >
                  NEXT ROUND
                </button>
              )}

              {state.phase === 'gameOver' && (
                <>
                  <div className="bg-red-900 border-2 border-red-500 rounded p-3 text-center">
                    <p className="text-red-200 text-sm font-bold mb-1">GAME OVER</p>
                    <p className="text-white text-xs">Reached Round {state.round}</p>
                  </div>
                  <button
                    onPointerDown={handleRestart}
                    className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-black text-lg rounded-lg transition-all active:scale-95 border-4 border-yellow-900 shadow-lg"
                  >
                    RESTART
                  </button>
                  <button
                    onPointerDown={handleGameOverClick}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded transition-all active:scale-95"
                  >
                    BACK TO MENU
                  </button>
                </>
              )}

            </div>
          </div>

            <div className="bg-gray-950 rounded-xl border-2 border-cyan-600 p-4 mt-3">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">[ ACTIVE BETS ]</h3>
              {state.bets.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {state.bets.map((bet) => (
                    <div key={bet.id} className="flex items-center justify-between bg-gray-900 p-2 rounded">
                      <div className="flex-1">
                        <p className="text-xs text-yellow-400 font-bold">{getBetDescription(bet)}</p>
                        <p className="text-xs text-gray-400">${bet.amount}</p>
                      </div>
                      <button
                        onPointerDown={() => handleRemoveBet(bet.id)}
                        disabled={isSpinning}
                        className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded transition-all active:scale-95 disabled:opacity-50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <p className="text-sm font-bold text-white">
                      Total: <span className="text-yellow-400">${totalBetAmount}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center">No bets placed</p>
              )}
            </div>

            <OwnedUpgradesPanel ownedUpgrades={state.ownedUpgrades} />
          </aside>
        </div>
      </div>

      {state.ui.screen === 'shop' && (
        <ShopModal
          tickets={state.tickets}
          shopOffers={state.shopOffers}
          ownedUpgrades={state.ownedUpgrades}
          onBuyUpgrade={handleBuyUpgrade}
          onClose={handleCloseShop}
        />
      )}

      <ResultToast
        open={toastOpen}
        winningNumber={toastNumber}
        onClose={() => setToastOpen(false)}
      />

      {import.meta.env.DEV && (
        <div className="fixed bottom-2 left-2 bg-black/90 border border-yellow-500 p-2 text-xs font-mono text-yellow-400 rounded z-50 max-w-xs">
          <div className="font-bold mb-1 text-green-400">DEBUG INFO:</div>
          <div>screen: {state.ui.screen}</div>
          <div>phase: {state.phase}</div>
          <div>round: {state.round}</div>
          <div>chips: {state.chips}</div>
          <div>target: {state.targetChips}</div>
          <div>spins: {state.spinsLeft}</div>
          <div>variant: {state.selectedVariantId}</div>
        </div>
      )}
    </div>
  );
};
