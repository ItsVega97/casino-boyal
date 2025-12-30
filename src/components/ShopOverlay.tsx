import React from 'react';
import { X } from 'lucide-react';
import { ItemEffect } from '../game/types';

interface ShopOverlayProps {
  isOpen: boolean;
  tickets: number;
  availableItems: ItemEffect[];
  purchasedItems: string[];
  onPurchase: (itemId: string) => void;
  onClose: () => void;
}

export const ShopOverlay: React.FC<ShopOverlayProps> = ({
  isOpen,
  tickets,
  availableItems,
  purchasedItems,
  onPurchase,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border-4 border-yellow-500 rounded-lg p-4 md:p-8 max-w-2xl w-full shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-black text-yellow-400">ITEM SHOP</h2>
          <button
            onPointerDown={onClose}
            className="p-2 active:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
          </button>
        </div>

        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-800 border-2 border-gray-700 rounded text-center">
          <p className="text-gray-400 text-xs md:text-sm font-mono">TICKETS AVAILABLE</p>
          <p className="text-3xl md:text-4xl font-black text-yellow-400">{tickets}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
          {availableItems.map((item) => {
            const isPurchased = purchasedItems.includes(item.id);
            const canAfford = tickets >= item.cost && !isPurchased;

            return (
              <div
                key={item.id}
                className={`p-3 md:p-4 border-2 rounded-lg transition-all ${
                  isPurchased
                    ? 'border-green-500 bg-green-900 bg-opacity-20'
                    : canAfford
                      ? 'border-yellow-500 bg-gray-800'
                      : 'border-gray-600 bg-gray-900 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-yellow-400 text-sm md:text-base">{item.name}</h3>
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono whitespace-nowrap ml-2">
                    {isPurchased ? 'OWNED' : `${item.cost} 🎫`}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-300 mb-2 md:mb-3 leading-relaxed">{item.description}</p>
                <p className="text-xs text-gray-400 mb-2 md:mb-3 italic">
                  {item.type === 'passive' ? 'Passive Effect' : 'Active Ability'}
                </p>
                {!isPurchased && canAfford && (
                  <button
                    onPointerDown={() => onPurchase(item.id)}
                    className="w-full bg-yellow-600 active:bg-yellow-700 text-white font-bold py-2 md:py-3 px-4 rounded transition-all active:scale-95"
                  >
                    BUY
                  </button>
                )}
                {isPurchased && (
                  <div className="w-full bg-green-600 text-white font-bold py-2 md:py-3 px-4 rounded text-center text-sm">
                    EQUIPPED
                  </div>
                )}
                {!canAfford && !isPurchased && (
                  <div className="w-full bg-gray-600 text-gray-400 font-bold py-2 md:py-3 px-4 rounded text-center text-sm">
                    LOCKED
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onPointerDown={onClose}
          className="w-full bg-red-600 active:bg-red-700 text-white font-black text-base md:text-lg py-3 md:py-4 rounded-lg transition-all active:scale-95 border-2 border-red-900"
        >
          CLOSE SHOP
        </button>
      </div>
    </div>
  );
};
