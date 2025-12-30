import React, { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { ACHIEVEMENT_CATALOG } from '../achievements/catalog';
import { getUnlockedAchievements } from '../achievements/system';

interface AchievementsScreenProps {
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const unlockedIds = getUnlockedAchievements();

  const filteredAchievements = ACHIEVEMENT_CATALOG.filter((achievement) => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const totalAchievements = ACHIEVEMENT_CATALOG.length;
  const unlockedCount = unlockedIds.length;
  const percentage = Math.round((unlockedCount / totalAchievements) * 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'rounds': return 'border-cyan-600 bg-cyan-600/10';
      case 'upgrades': return 'border-purple-600 bg-purple-600/10';
      case 'roulettes': return 'border-green-600 bg-green-600/10';
      case 'gameplay': return 'border-yellow-600 bg-yellow-600/10';
      case 'special': return 'border-red-600 bg-red-600/10';
      default: return 'border-gray-600 bg-gray-600/10';
    }
  };

  return (
    <div className="min-h-dvh w-full bg-black">
      <div className="mx-auto max-w-6xl p-3 md:p-6">
        <div className="min-h-[calc(100dvh-3rem)] flex flex-col">
          <div className="bg-gray-950 rounded-xl border-4 border-yellow-600 p-4 md:p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-black text-yellow-400 tracking-wider font-mono">
                [ LOGROS ]
              </h1>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-all active:scale-95 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                VOLVER
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg border-2 border-yellow-600 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-400 font-bold text-lg">PROGRESO</span>
                <span className="text-yellow-300 font-black text-xl">
                  {unlockedCount} / {totalAchievements}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm font-mono mt-2 text-center">
                {percentage}% completado
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 'unlocked', 'locked'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 font-bold text-sm rounded border-2 transition-all active:scale-95 ${
                    filter === filterOption
                      ? 'bg-yellow-600 border-yellow-800 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'
                  }`}
                >
                  {filterOption === 'all' ? 'TODOS' : filterOption === 'unlocked' ? 'DESBLOQUEADOS' : 'BLOQUEADOS'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-950 rounded-xl border-4 border-green-600 p-4 flex-1 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-380px)]">
              {filteredAchievements.map((achievement) => {
                const isUnlocked = unlockedIds.includes(achievement.id);
                const categoryColor = getCategoryColor(achievement.category);

                return (
                  <div
                    key={achievement.id}
                    className={`bg-gray-900 rounded-lg border-2 ${categoryColor} p-4 transition-all hover:scale-105 ${
                      !isUnlocked ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {!isUnlocked ? (
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="w-6 h-6 text-gray-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
                          🏆
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-yellow-400 font-bold text-sm mb-1">
                          {isUnlocked ? achievement.name : '???'}
                        </h3>
                        <p className="text-gray-300 text-xs leading-relaxed">
                          {isUnlocked ? achievement.description : 'Logro bloqueado'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-500 font-mono uppercase">
                        {achievement.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
