import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { UPGRADE_CATALOG } from '../upgrades/catalog';

interface UpgradeWikiScreenProps {
  onBack: () => void;
  ownedUpgrades: string[];
}

export const UpgradeWikiScreen: React.FC<UpgradeWikiScreenProps> = ({ onBack, ownedUpgrades }) => {
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3 | 4>('all');

  const filteredUpgrades = filter === 'all'
    ? UPGRADE_CATALOG
    : UPGRADE_CATALOG.filter(u => u.tier === filter);

  return (
    <div className="min-h-dvh w-full bg-black">
      <div className="mx-auto max-w-6xl p-3 md:p-6">
        <div className="min-h-[calc(100dvh-3rem)] flex flex-col">
          <div className="bg-gray-950 rounded-xl border-4 border-yellow-600 p-4 md:p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-black text-yellow-400 tracking-wider font-mono">
                [ WIKI DE MEJORAS ]
              </h1>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-all active:scale-95 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                VOLVER
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 1, 2, 3, 4] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilter(tier)}
                  className={`px-4 py-2 font-bold text-sm rounded border-2 transition-all active:scale-95 ${
                    filter === tier
                      ? 'bg-yellow-600 border-yellow-800 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'
                  }`}
                >
                  {tier === 'all' ? 'TODAS' : `TIER ${tier}`}
                </button>
              ))}
            </div>

            <div className="mt-3 bg-gray-900 rounded border-2 border-gray-700 p-3">
              <p className="text-gray-400 text-sm font-mono">
                {filteredUpgrades.length} mejoras disponibles
              </p>
            </div>
          </div>

          <div className="bg-gray-950 rounded-xl border-4 border-purple-600 p-4 flex-1 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-320px)]">
              {filteredUpgrades.map((upgrade) => {
                const isOwned = ownedUpgrades.includes(upgrade.id);
                const tierColor =
                  upgrade.tier === 1 ? 'border-gray-600' :
                  upgrade.tier === 2 ? 'border-green-600' :
                  upgrade.tier === 3 ? 'border-blue-600' :
                  'border-purple-600';

                return (
                  <div
                    key={upgrade.id}
                    className={`bg-gray-900 rounded-lg border-2 ${tierColor} p-4 ${
                      isOwned ? 'opacity-100' : 'opacity-60'
                    } transition-all hover:scale-105`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-yellow-400 font-bold text-sm flex-1">
                        {upgrade.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isOwned && (
                          <span className="text-green-400 text-xs font-mono">✓ COMPRADA</span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                      {upgrade.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-500 font-mono">
                        TIER {upgrade.tier}
                      </span>
                      <span className="text-yellow-300 font-bold text-sm">
                        {upgrade.cost} 🎫
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
