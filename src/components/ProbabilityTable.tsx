import React, { useEffect, useState, useRef, useMemo } from 'react';
import { GameState } from '../game/gameReducer';
import { Bet } from '../game/bets';
import { estimateProbabilities, ProbabilityResult } from '../game/probabilities';
import { getRouletteVariant } from '../rouletteVariants/catalog';

interface ProbabilityTableProps {
  state: GameState;
  bets: Bet[];
}

export const ProbabilityTable: React.FC<ProbabilityTableProps> = ({ state, bets }) => {
  const [result, setResult] = useState<ProbabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const upgradesKey = useMemo(() => {
    return (state.ownedUpgrades || []).slice().sort().join('|');
  }, [state.ownedUpgrades]);

  const betsKey = useMemo(() => {
    return (bets || [])
      .map(b => `${b.kind}:${b.amount}:${(b.numbers || []).join(',')}:${JSON.stringify(b.meta || {})}`)
      .join(';');
  }, [bets]);

  const visionKey = useMemo(() => {
    return (state.upgradeState?.vision_excluded || []).join(',');
  }, [state.upgradeState?.vision_excluded]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    setError(null);

    timeoutRef.current = window.setTimeout(() => {
      try {
        const variant = getRouletteVariant(state.selectedVariantId);
        const context = {
          ownedUpgrades: state.ownedUpgrades || [],
          bets: bets || [],
          streak: state.streak || { winsInRow: 0, lossesInRow: 0 },
          rigged_counter_losses: state.upgradeState?.rigged_counter_losses || 0,
          vision_excluded: state.upgradeState?.vision_excluded,
          variantModifiers: variant.modifiers,
        };

        const computed = estimateProbabilities(context);
        setResult(computed);
        setLoading(false);
      } catch (err) {
        console.error('Error calculating probabilities:', err);
        setError('Error al calcular probabilidades');
        setLoading(false);
      }
    }, 0);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    state.round,
    upgradesKey,
    betsKey,
    visionKey,
    state.streak?.winsInRow,
    state.streak?.lossesInRow,
    state.upgradeState?.rigged_counter_losses,
  ]);

  const formatPercent = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  const getTop3Numbers = (perNumber: number[]): number[] => {
    const indexed = perNumber.map((prob, num) => ({ num, prob }));
    indexed.sort((a, b) => b.prob - a.prob);
    return indexed.slice(0, 3).map(x => x.num);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="p-4 bg-red-900 border-2 border-red-500 rounded max-w-sm">
          <div className="text-center text-red-200 text-sm font-bold">{error}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="p-4 bg-gray-900 border-2 border-gray-700 rounded max-w-sm">
          <div className="text-center text-gray-400 text-sm">Calculando probabilidades...</div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const top3 = getTop3Numbers(result.perNumber);

  return (
    <div className="h-full overflow-y-auto">
      <h3 className="text-yellow-400 text-base md:text-lg font-bold mb-3 text-center font-mono">
        PROBABILIDADES ACTUALES
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 mb-3 text-xs">
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">Rojo</div>
          <div className="text-red-400 font-bold">{formatPercent(result.aggregates.red)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">Negro</div>
          <div className="text-white font-bold">{formatPercent(result.aggregates.black)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">Par</div>
          <div className="text-blue-400 font-bold">{formatPercent(result.aggregates.even)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">Impar</div>
          <div className="text-blue-400 font-bold">{formatPercent(result.aggregates.odd)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">1-18</div>
          <div className="text-green-400 font-bold">{formatPercent(result.aggregates.low)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">19-36</div>
          <div className="text-green-400 font-bold">{formatPercent(result.aggregates.high)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-3 text-xs">
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">D1</div>
          <div className="text-purple-400 font-bold">{formatPercent(result.aggregates.dozen1)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">D2</div>
          <div className="text-purple-400 font-bold">{formatPercent(result.aggregates.dozen2)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">D3</div>
          <div className="text-purple-400 font-bold">{formatPercent(result.aggregates.dozen3)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">C1</div>
          <div className="text-cyan-400 font-bold">{formatPercent(result.aggregates.col1)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">C2</div>
          <div className="text-cyan-400 font-bold">{formatPercent(result.aggregates.col2)}</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded p-1.5">
          <div className="text-gray-400">C3</div>
          <div className="text-cyan-400 font-bold">{formatPercent(result.aggregates.col3)}</div>
        </div>
      </div>

      {result.aggregates.anyBetWins !== undefined && (
        <div className="bg-green-900 border border-green-600 rounded p-2 mb-3">
          <div className="text-xs text-green-300">Prob. ganar alguna apuesta:</div>
          <div className="text-green-400 font-bold text-lg">{formatPercent(result.aggregates.anyBetWins)}</div>
        </div>
      )}

      <div className="mt-3 mb-2">
        <h4 className="text-yellow-400 text-xs font-bold mb-1.5 font-mono">Prob. por Número (Top 3 en verde)</h4>
        <div className="border border-gray-700 rounded">
          <div className="grid grid-cols-6 gap-0.5 p-1.5 text-xs">
            {result.perNumber.map((prob, num) => {
              const isTop3 = top3.includes(num);
              return (
                <div
                  key={num}
                  className={`p-1.5 rounded text-center ${
                    isTop3
                      ? 'bg-green-800 border border-green-500'
                      : 'bg-gray-800 border border-gray-600'
                  }`}
                >
                  <div className={`font-bold font-mono ${isTop3 ? 'text-green-300' : 'text-gray-300'}`}>
                    {num}
                  </div>
                  <div className={`font-mono ${isTop3 ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                    {formatPercent(prob)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
