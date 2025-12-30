import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './gameEngine';
import { PixelRenderer } from './pixelRenderer';
import { SoundSystem } from './soundSystem';
import { ShopOverlay } from '../components/ShopOverlay';
import { Bet } from './types';

interface GameCanvasProps {
  onGameOver?: (round: number, score: number) => void;
}

const BASE_WIDTH = 256;
const BASE_HEIGHT = 144;

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine>(new GameEngine());
  const rendererRef = useRef<PixelRenderer | null>(null);
  const soundRef = useRef<SoundSystem>(new SoundSystem());
  const [gameState, setGameState] = useState(gameEngineRef.current.getState());
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState<Bet['type']>('red');
  const [lastWinningNumber, setLastWinningNumber] = useState<number | undefined>();
  const [showShop, setShowShop] = useState(false);
  const [spinResult, setSpinResult] = useState<{ payout: number; won: boolean } | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const animationFrameRef = useRef<number>();

  const gameEngine = gameEngineRef.current;

  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const scaleX = Math.floor(containerWidth / BASE_WIDTH);
    const scaleY = Math.floor(containerHeight / BASE_HEIGHT);
    const scale = Math.max(1, Math.min(scaleX, scaleY));

    const scaledWidth = BASE_WIDTH * scale;
    const scaledHeight = BASE_HEIGHT * scale;

    canvas.style.width = `${scaledWidth}px`;
    canvas.style.height = `${scaledHeight}px`;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = BASE_WIDTH * dpr;
    canvas.height = BASE_HEIGHT * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    if (rendererRef.current) {
      rendererRef.current = new PixelRenderer(canvas, 1);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    fitCanvas();

    rendererRef.current = new PixelRenderer(canvas, 1);
    gameEngine.startRound();
    setGameState(gameEngine.getState());

    const render = () => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      renderer.clear();
      drawGameUI(renderer, gameState, spinning, lastWinningNumber);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    window.addEventListener('resize', fitCanvas);
    window.addEventListener('orientationchange', fitCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', fitCanvas);
      window.removeEventListener('orientationchange', fitCanvas);
    };
  }, [gameEngine, gameState, spinning, lastWinningNumber, fitCanvas]);

  const drawGameUI = (
    renderer: PixelRenderer,
    state: ReturnType<typeof gameEngine.getState>,
    isSpinning: boolean,
    winningNumber?: number,
  ) => {
    const centerX = BASE_WIDTH / 2;
    const centerY = BASE_HEIGHT / 2.2;
    const rouletteRadius = 50;

    renderer.drawRoulette(centerX, centerY, rouletteRadius, winningNumber);

    const hudY = centerY + rouletteRadius + 15;
    renderer.drawText(`RND:${state.round}`, 20, hudY, '#00ff00', 7);
    renderer.drawText(`$${state.chips}`, 60, hudY, '#ffff00', 7);
    renderer.drawText(`OBJ:$${state.objective}`, 110, hudY, '#ffaa00', 7);
    renderer.drawText(`ACC:$${state.accumulated}`, 190, hudY, '#00ffff', 7);

    const spinsY = hudY + 12;
    renderer.drawText(`SPINS:${state.spinsRemaining}`, 20, spinsY, '#ff9999', 7);
    renderer.drawText(`TICKETS:${state.tickets}`, 110, spinsY, '#ff99ff', 7);

    const barY = spinsY + 12;
    renderer.drawText('GOAL:', 20, barY, '#ffffff', 6);
    renderer.drawBar(
      60,
      barY - 1,
      150,
      8,
      Math.min(1, state.accumulated / state.objective),
      '#00ff00',
    );

    const betY = barY + 20;
    drawBetSection(renderer, betY, selectedBet, betAmount);

    if (!isSpinning && state.spinsRemaining > 0 && !state.gameOver && !showShop) {
      renderer.drawButton(200, betY + 30, 52, 12, 'SPIN!', true);
    }

    if (spinResult && state.spinsRemaining > 0 && !showShop) {
      const resultText = spinResult.won ? `WIN+$${spinResult.payout}` : 'LOST';
      const resultColor = spinResult.won ? '#00ff00' : '#ff0000';
      renderer.drawText(resultText, centerX - 30, hudY - 10, resultColor, 8);
    }

    if (state.spinsRemaining === 0 && !state.gameOver && !showShop) {
      renderer.drawButton(180, betY + 50, 72, 14, 'NEXT ROUND', true);
    }

    if (state.gameOver) {
      renderer.drawText('GAME OVER!', centerX - 35, centerY - 20, '#ff0000', 10);
      renderer.drawText(`REACHED ROUND ${state.round}`, centerX - 50, centerY, '#ffff00', 8);
      renderer.drawButton(centerX - 35, centerY + 20, 70, 14, 'RESTART', true);
    }
  };

  const drawBetSection = (
    renderer: PixelRenderer,
    y: number,
    selected: Bet['type'],
    amount: number,
  ) => {
    const bets = [
      { label: 'RED', value: 'red' as const },
      { label: 'BLK', value: 'black' as const },
      { label: 'ODD', value: 'odd' as const },
      { label: 'EVN', value: 'even' as const },
    ];

    renderer.drawText('BET:', 20, y, '#ffffff', 6);

    bets.forEach((btn, i) => {
      const x = 45 + i * 40;
      const isSelected = btn.value === selected;
      renderer.ctx.fillStyle = isSelected ? '#ff6b6b' : '#444444';
      renderer.ctx.fillRect(x, y - 2, 38, 10);

      renderer.ctx.strokeStyle = '#ffffff';
      renderer.ctx.lineWidth = 1;
      renderer.ctx.strokeRect(x, y - 2, 38, 10);

      renderer.ctx.fillStyle = '#ffffff';
      renderer.ctx.font = 'bold 5px monospace';
      renderer.ctx.textAlign = 'center';
      renderer.ctx.textBaseline = 'middle';
      renderer.ctx.fillText(btn.label, x + 19, y + 3);
    });

    renderer.drawText(`AMT:$${amount}`, 200, y, '#ffffff', 6);
  };

  const handleSpin = async () => {
    if (spinning || gameState.spinsRemaining <= 0 || gameState.gameOver) return;

    const bet: Bet = {
      type: selectedBet,
      amount: betAmount,
    };

    if (!gameEngine.placeBet(bet)) return;

    setSpinning(true);
    setSpinResult(null);
    soundRef.current.playSpinSound();

    await new Promise((resolve) => setTimeout(resolve, 300));

    const { winningNumber, result } = gameEngine.spin();
    setLastWinningNumber(winningNumber);

    if (result.payout > 0) {
      soundRef.current.playWinSound();
    } else {
      soundRef.current.playLoseSound();
    }

    setSpinResult({
      payout: result.payout,
      won: result.payout > 0,
    });
    setGameState(gameEngine.getState());

    setSpinning(false);
  };

  const handleNextRound = () => {
    const endResult = gameEngine.endRound();

    if (endResult === 'lose') {
      setGameState(gameEngine.getState());
      onGameOver?.(gameState.round, gameState.highScore);
    } else {
      gameEngine.startRound();
      setLastWinningNumber(undefined);
      setSpinResult(null);
      setGameState(gameEngine.getState());
    }
  };

  const handleRestart = () => {
    gameEngine.resetGame();
    gameEngine.startRound();
    setGameState(gameEngine.getState());
    setLastWinningNumber(undefined);
    setSpinResult(null);
    setSpinning(false);
    setShowShop(false);
    setPurchasedItems([]);
  };

  const handlePurchaseItem = (itemId: string) => {
    if (gameEngine.purchaseItem(itemId)) {
      soundRef.current.playClickSound();
      setPurchasedItems([...purchasedItems, itemId]);
      setGameState(gameEngine.getState());
    }
  };

  const handleCanvasPointer = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || showShop) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = BASE_WIDTH / rect.width;
      const scaleY = BASE_HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const betOptions = [
        { x: 45, label: 'red' },
        { x: 85, label: 'black' },
        { x: 125, label: 'odd' },
        { x: 165, label: 'even' },
      ];

      for (const bet of betOptions) {
        if (x > bet.x && x < bet.x + 38 && y > 108 && y < 118) {
          setSelectedBet(bet.label as Bet['type']);
          soundRef.current.playClickSound();
          return;
        }
      }

      if (x > 200 && x < 252 && y > 138 && y < 150) {
        if (!spinning && gameState.spinsRemaining > 0 && !gameState.gameOver) {
          handleSpin();
        } else if (!spinning && gameState.spinsRemaining === 0 && !gameState.gameOver) {
          handleNextRound();
        } else if (gameState.gameOver) {
          handleRestart();
        }
      }
    },
    [gameState, spinning, showShop],
  );

  return (
    <div className="min-h-dvh w-full flex flex-col bg-black overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-6 p-3 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col gap-3">
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-950 to-black rounded-xl border-4 border-yellow-600 shadow-2xl overflow-hidden min-h-[300px] md:min-h-[400px]"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handleCanvasPointer}
              className="cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap gap-2 bg-gray-950 rounded-lg border-2 border-yellow-600 p-3">
            <div className="flex-1 min-w-[120px] bg-gray-900 rounded p-2 border border-cyan-500">
              <p className="text-xs text-cyan-400 font-mono">ROUND</p>
              <p className="text-lg font-bold text-cyan-200">{gameState.round}</p>
            </div>
            <div className="flex-1 min-w-[120px] bg-gray-900 rounded p-2 border border-yellow-500">
              <p className="text-xs text-yellow-400 font-mono">CHIPS</p>
              <p className="text-lg font-bold text-yellow-200">${gameState.chips}</p>
            </div>
            <div className="flex-1 min-w-[120px] bg-gray-900 rounded p-2 border border-green-500">
              <p className="text-xs text-green-400 font-mono">OBJECTIVE</p>
              <p className="text-lg font-bold text-green-200">${gameState.objective}</p>
            </div>
            <div className="flex-1 min-w-[120px] bg-gray-900 rounded p-2 border border-purple-500">
              <p className="text-xs text-purple-400 font-mono">TICKETS</p>
              <p className="text-lg font-bold text-purple-200">{gameState.tickets}</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col gap-3">
          <div className="bg-gray-950 rounded-xl border-2 border-yellow-600 p-4">
            <h3 className="text-sm font-bold text-yellow-400 mb-3">[ CONTROLS ]</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">BET TYPE</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['red', 'black', 'odd', 'even'] as const).map((type) => (
                    <button
                      key={type}
                      onPointerDown={() => {
                        setSelectedBet(type);
                        soundRef.current.playClickSound();
                      }}
                      className={`py-3 px-4 rounded font-bold text-sm transition-all active:scale-95 ${
                        selectedBet === type
                          ? 'bg-red-600 text-white border-2 border-red-400'
                          : 'bg-gray-800 text-gray-300 border-2 border-gray-700 active:bg-gray-700'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">BET AMOUNT</p>
                <div className="flex gap-2">
                  <button
                    onPointerDown={() => setBetAmount(Math.max(5, betAmount - 5))}
                    className="px-4 py-3 bg-gray-800 text-white rounded font-bold active:bg-gray-700 transition-all active:scale-95"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-gray-900 rounded border-2 border-yellow-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-yellow-400">${betAmount}</span>
                  </div>
                  <button
                    onPointerDown={() => setBetAmount(Math.min(gameState.chips, betAmount + 5))}
                    className="px-4 py-3 bg-gray-800 text-white rounded font-bold active:bg-gray-700 transition-all active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {!gameState.gameOver && gameState.spinsRemaining > 0 && !spinning && (
                <button
                  onPointerDown={handleSpin}
                  disabled={spinning}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-lg transition-all active:scale-95 border-4 border-red-900 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SPIN!
                </button>
              )}

              {gameState.spinsRemaining === 0 && !gameState.gameOver && (
                <button
                  onPointerDown={handleNextRound}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-lg transition-all active:scale-95 border-4 border-green-900 shadow-lg"
                >
                  NEXT ROUND
                </button>
              )}

              {gameState.gameOver && (
                <button
                  onPointerDown={handleRestart}
                  className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-black text-lg rounded-lg transition-all active:scale-95 border-4 border-yellow-900 shadow-lg"
                >
                  RESTART
                </button>
              )}

              <button
                onPointerDown={() => setShowShop(true)}
                disabled={gameState.gameOver || gameState.spinsRemaining === 0}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🛍 SHOP ({gameState.tickets} tickets)
              </button>
            </div>
          </div>

          <div className="bg-gray-950 rounded-xl border-2 border-cyan-600 p-4">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">[ STATUS ]</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-300">
                <span>Spins Left:</span>
                <span className="text-red-400 font-bold">{gameState.spinsRemaining}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Accumulated:</span>
                <span className="text-green-400 font-bold">${gameState.accumulated}</span>
              </div>
              <div className="w-full bg-gray-800 h-4 rounded overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(100, (gameState.accumulated / gameState.objective) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShopOverlay
        isOpen={showShop}
        tickets={gameState.tickets}
        availableItems={gameEngine.getAvailableItems()}
        purchasedItems={purchasedItems}
        onPurchase={handlePurchaseItem}
        onClose={() => setShowShop(false)}
      />
    </div>
  );
};
