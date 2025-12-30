import React from 'react';
import { Lock } from 'lucide-react';
import { ROULETTE_VARIANTS, RouletteVariantId, isRouletteUnlocked } from '../rouletteVariants/catalog';

interface RouletteMenuScreenProps {
  bestRunRoundsCleared: number;
  onSelectVariant: (variantId: RouletteVariantId) => void;
}

export const RouletteMenuScreen: React.FC<RouletteMenuScreenProps> = ({
  bestRunRoundsCleared,
  onSelectVariant,
}) => {
  return (
    <div className="min-h-dvh w-full bg-black">
      <div className="mx-auto max-w-6xl p-3 md:p-6">
        <div className="min-h-[calc(100dvh-3rem)] flex flex-col justify-center">
          <div className="bg-gray-950 rounded-xl border-2 border-red-600 p-4 md:p-6 mb-4">
            <div className="text-center mb-2">
              <h1 className="text-3xl md:text-5xl font-black text-yellow-400 glow-text mb-2" style={{ textShadow: '4px 4px 0 #ff3333' }}>
                CASINO
              </h1>
              <h2 className="text-3xl md:text-5xl font-black text-red-500 mb-4" style={{ textShadow: '4px 4px 0 #ffff00' }}>
                BOYAL
              </h2>
              <p className="text-yellow-300 text-xs md:text-sm tracking-widest">~ PIXEL ART ROGUELIKE ROULETTE ~</p>
            </div>
            <p className="text-sm text-yellow-400 font-mono text-center mt-1">
              [ Elige tu ruleta ]
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {ROULETTE_VARIANTS.map((variant) => {
              const unlocked = isRouletteUnlocked(variant.id, bestRunRoundsCleared);
              const borderColor = unlocked
                ? variant.id === 'classic'
                  ? 'border-yellow-600'
                  : variant.id === 'jade'
                  ? 'border-emerald-600'
                  : 'border-purple-600'
                : 'border-gray-700';

              return (
                <div
                  key={variant.id}
                  className={`relative bg-gray-950 rounded-xl border-2 ${borderColor} overflow-hidden transition-all hover:scale-105`}
                >
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                      <Lock className="w-10 h-10 text-gray-600 mb-2" />
                      <p className="text-gray-400 text-xs text-center font-mono">
                        Desbloquea completando {variant.unlockRoundsCleared} rondas
                      </p>
                    </div>
                  )}

                  <div className="p-4">
                    <h2 className="text-lg md:text-xl font-black text-yellow-400 mb-2 font-mono">
                      {variant.name}
                    </h2>
                    <p className="text-gray-300 text-xs md:text-sm font-mono leading-relaxed mb-3">
                      {variant.description}
                    </p>

                    <div className="bg-gray-900 border border-gray-700 rounded p-2 mb-3">
                      <p className="text-xs text-cyan-400 font-mono mb-1">BONUS:</p>
                      <p className="text-xs text-cyan-200 font-mono leading-relaxed">
                        {variant.bonus}
                      </p>
                    </div>

                    {unlocked ? (
                      <button
                        onClick={() => onSelectVariant(variant.id)}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-black text-base rounded-lg border-4 border-green-900 shadow-lg transition-all active:scale-95 font-mono"
                      >
                        ELEGIR
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 bg-gray-800 text-gray-600 font-black text-base rounded-lg border-2 border-gray-700 cursor-not-allowed font-mono"
                      >
                        BLOQUEADA
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-950 rounded-xl border-2 border-cyan-600 p-3 mt-4">
            <p className="text-xs text-gray-400 font-mono text-center">
              MEJOR RUN: <span className="text-cyan-400 font-bold">{bestRunRoundsCleared} RONDAS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
