import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { getRunHistory } from '../game/runHistory';
import { getRouletteVariant } from '../rouletteVariants/catalog';

interface RunHistoryScreenProps {
  onBack: () => void;
}

export const RunHistoryScreen: React.FC<RunHistoryScreenProps> = ({ onBack }) => {
  const history = getRunHistory();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-dvh w-full bg-black">
      <div className="mx-auto max-w-6xl p-3 md:p-6">
        <div className="min-h-[calc(100dvh-3rem)] flex flex-col">
          <div className="bg-gray-950 rounded-xl border-4 border-yellow-600 p-4 md:p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-black text-yellow-400 tracking-wider font-mono">
                [ HISTORIAL DE PARTIDAS ]
              </h1>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-all active:scale-95 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                VOLVER
              </button>
            </div>

            <div className="bg-gray-900 rounded border-2 border-gray-700 p-3">
              <p className="text-gray-400 text-sm font-mono">
                Últimas {history.length} partidas guardadas (máximo 50)
              </p>
            </div>
          </div>

          <div className="bg-gray-950 rounded-xl border-4 border-cyan-600 p-4 flex-1 overflow-hidden flex flex-col">
            {history.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg font-mono mb-2">No hay partidas registradas</p>
                  <p className="text-gray-600 text-sm font-mono">Juega una partida para verla aquí</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                {history.map((run) => {
                  const variant = getRouletteVariant(run.rouletteVariantId);
                  const reasonText = run.defeatedReason === 'outOfSpins' ? 'Sin giros' : 'Sin fichas';

                  return (
                    <div
                      key={run.id}
                      className="bg-gray-900 rounded-lg border-2 border-gray-700 p-4 hover:border-yellow-600 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-yellow-400 text-sm font-mono font-bold">
                              {variant.name}
                            </span>
                            <span className="text-gray-500 text-xs font-mono">
                              {formatDate(run.date)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="bg-gray-800 rounded p-2 border border-cyan-600">
                              <p className="text-xs text-cyan-400 font-mono">RONDAS</p>
                              <p className="text-lg font-bold text-cyan-200">{run.roundsCompleted}</p>
                            </div>
                            <div className="bg-gray-800 rounded p-2 border border-green-600">
                              <p className="text-xs text-green-400 font-mono">MAX $</p>
                              <p className="text-lg font-bold text-green-200">${run.maxChips}</p>
                            </div>
                            <div className="bg-gray-800 rounded p-2 border border-purple-600">
                              <p className="text-xs text-purple-400 font-mono">TICKETS</p>
                              <p className="text-lg font-bold text-purple-200">{run.ticketsEarned}</p>
                            </div>
                            <div className="bg-gray-800 rounded p-2 border border-red-600">
                              <p className="text-xs text-red-400 font-mono">DERROTA</p>
                              <p className="text-sm font-bold text-red-200">{reasonText}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
