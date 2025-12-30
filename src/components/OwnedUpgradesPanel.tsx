import React from 'react';
import { getUpgradesByIds } from '../upgrades/catalog';

interface OwnedUpgradesPanelProps {
  ownedUpgrades: string[];
}

export const OwnedUpgradesPanel: React.FC<OwnedUpgradesPanelProps> = ({ ownedUpgrades }) => {
  const upgrades = getUpgradesByIds(ownedUpgrades);

  return (
    <div className="bg-gray-950 rounded-xl border-2 border-green-600 p-4">
      <h3 className="text-sm font-bold text-green-400 mb-3">[ MEJORAS ]</h3>
      {upgrades.length > 0 ? (
        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {upgrades.map((upgrade) => (
            <div
              key={upgrade.id}
              className="bg-gray-900 p-2 rounded border border-green-700 hover:border-green-500 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-300">{upgrade.name}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{upgrade.description}</p>
                </div>
                <span className="text-xs text-green-500 font-mono bg-gray-800 px-2 py-1 rounded">
                  T{upgrade.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center">Aún no tienes mejoras</p>
      )}
    </div>
  );
};
