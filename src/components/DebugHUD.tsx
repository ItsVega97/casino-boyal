import React from 'react';
import { GameState } from '../game/types';

interface DebugHUDProps {
  state: GameState;
}

export const DebugHUD: React.FC<DebugHUDProps> = ({ state }) => {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-2 right-2 bg-black/90 border-2 border-yellow-500 rounded-lg p-3 text-xs font-mono z-[100] max-w-xs">
      <div className="text-yellow-400 font-bold mb-2 border-b border-yellow-700 pb-1">
        DEBUG HUD
      </div>
      <div className="space-y-1 text-gray-300">
        <div>
          <span className="text-yellow-500">Screen:</span>{' '}
          <span className="text-white font-bold">{state.ui.screen}</span>
        </div>
        <div>
          <span className="text-yellow-500">Phase:</span>{' '}
          <span className="text-white font-bold">{state.phase}</span>
        </div>
        <div>
          <span className="text-yellow-500">Round:</span>{' '}
          <span className="text-white font-bold">{state.round}</span>
        </div>
        <div>
          <span className="text-yellow-500">Tickets:</span>{' '}
          <span className="text-white font-bold">{state.tickets}</span>
        </div>
        <div>
          <span className="text-yellow-500">Shop Offers:</span>{' '}
          <span className="text-white font-bold">
            {Array.isArray(state.shopOffers) ? state.shopOffers.length : 'INVALID'}
          </span>
        </div>
        <div>
          <span className="text-yellow-500">Owned Upgrades:</span>{' '}
          <span className="text-white font-bold">
            {Array.isArray(state.ownedUpgrades) ? state.ownedUpgrades.length : 'INVALID'}
          </span>
        </div>
        <div>
          <span className="text-yellow-500">Balance:</span>{' '}
          <span className="text-white font-bold">{state.balance}</span>
        </div>
      </div>
    </div>
  );
};
