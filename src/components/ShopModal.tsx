import React, { useState } from 'react';
import { ShoppingCart, Ticket } from 'lucide-react';
import { getUpgradeById } from '../upgrades/catalog';
import { useFlavorText } from '../lore/useFlavorText';
import { FlavorBanner } from './FlavorBanner';

interface ShopModalProps {
  tickets: number;
  shopOffers: string[];
  ownedUpgrades: string[];
  onBuyUpgrade: (upgradeId: string, cost: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  tickets,
  shopOffers,
  ownedUpgrades,
  onBuyUpgrade,
  onClose,
}) => {
  const [lastPurchase, setLastPurchase] = useState<string | null>(null);

  const safeShopOffers = Array.isArray(shopOffers) ? shopOffers : [];
  const safeOwnedUpgrades = Array.isArray(ownedUpgrades) ? ownedUpgrades : [];

  const offers = safeShopOffers
    .map(id => {
      const upgrade = getUpgradeById(id);
      if (!upgrade && import.meta.env.DEV) {
        console.warn(`ShopModal: Upgrade with id "${id}" not found in catalog`);
      }
      return upgrade;
    })
    .filter((u): u is NonNullable<typeof u> => u !== undefined);

  const shopFlavor = useFlavorText('shop', safeShopOffers.join(','));
  const buyUpgradeFlavor = useFlavorText('buyUpgrade', lastPurchase || 'none');

  const handleBuy = (upgradeId: string, cost: number) => {
    if (import.meta.env.DEV) {
      console.log('🛒 ShopModal: handleBuy called', { upgradeId, cost });
    }
    onBuyUpgrade(upgradeId, cost);
    setLastPurchase(upgradeId);
    setTimeout(() => setLastPurchase(null), 3000);
  };

  if (import.meta.env.DEV) {
    console.log('🏪 ShopModal render:', {
      tickets,
      offersCount: offers.length,
      safeShopOffersCount: safeShopOffers.length,
      ownedCount: safeOwnedUpgrades.length,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-gray-900 to-black border-4 border-yellow-600 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto my-auto">
        <div className="sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 border-b-4 border-yellow-600 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-black text-yellow-400">UPGRADE SHOP</h2>
            </div>
            <div className="flex items-center gap-2 bg-gray-950 px-4 py-2 rounded-lg border-2 border-yellow-600">
              <Ticket className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-black text-yellow-400">{tickets}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Choose up to 3 upgrades to enhance your gameplay. Spend your tickets wisely!</p>
        </div>

        <div className="px-6 pt-4">
          <FlavorBanner text={shopFlavor} variant="shop" />
          {lastPurchase && (
            <div className="mt-2">
              <FlavorBanner text={buyUpgradeFlavor} variant="success" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500 font-bold">No hay mejoras disponibles</p>
              <p className="text-sm text-gray-600 mt-2">Pulsa Continue para la siguiente ronda</p>
            </div>
          ) : (
            offers.map((upgrade) => {
              if (!upgrade) return null;

              const isOwned = safeOwnedUpgrades.includes(upgrade.id);
              const canAfford = tickets >= upgrade.cost;
              const isDisabled = isOwned || !canAfford;

              const tierColors = {
                1: 'border-gray-500 bg-gray-800/50',
                2: 'border-blue-500 bg-blue-900/20',
                3: 'border-purple-500 bg-purple-900/20',
                4: 'border-orange-500 bg-orange-900/20',
              };

              const tierBadgeColors = {
                1: 'bg-gray-600 text-gray-100',
                2: 'bg-blue-600 text-blue-100',
                3: 'bg-purple-600 text-purple-100',
                4: 'bg-orange-600 text-orange-100',
              };

              return (
                <div
                  key={upgrade.id}
                  className={`border-2 rounded-xl p-4 transition-all ${tierColors[upgrade.tier]} ${
                    isDisabled ? 'opacity-60' : 'hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${tierBadgeColors[upgrade.tier]}`}>
                          TIER {upgrade.tier}
                        </span>
                        <h3 className="text-xl font-black text-white">{upgrade.name}</h3>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{upgrade.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Ticket className="w-4 h-4 text-yellow-400" />
                          <span className="text-lg font-bold text-yellow-400">{upgrade.cost}</span>
                        </div>
                        {isOwned && (
                          <span className="px-3 py-1 bg-green-700 text-green-100 text-xs font-bold rounded">
                            OWNED
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuy(upgrade.id, upgrade.cost)}
                      disabled={isDisabled}
                      className={`px-6 py-3 font-black rounded-lg transition-all border-2 ${
                        isDisabled
                          ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white border-green-900 active:scale-95'
                      }`}
                    >
                      {isOwned ? 'OWNED' : !canAfford ? 'NOT ENOUGH' : 'BUY'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-gray-900/95 border-t-4 border-yellow-600 p-6">
          <button
            onClick={onClose}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-black font-black text-xl rounded-lg transition-all active:scale-95 border-4 border-yellow-900 shadow-lg"
          >
            CONTINUE TO NEXT ROUND
          </button>
        </div>
      </div>
    </div>
  );
};
