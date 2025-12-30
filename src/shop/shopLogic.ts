import { UPGRADE_CATALOG } from '../upgrades/catalog';
import { RouletteVariantId, getRouletteVariant } from '../rouletteVariants/catalog';

export function pick3UpgradesNotOwned(ownedUpgrades: string[], round: number = 1, selectedVariantId: RouletteVariantId = 'classic'): string[] {
  const variant = getRouletteVariant(selectedVariantId);

  let available = UPGRADE_CATALOG.filter(u => !ownedUpgrades.includes(u.id));

  if (variant.modifiers.builtInDoubleOutcome) {
    available = available.filter(u => u.id !== 'double_outcome');
  }

  if (available.length === 0) {
    return [];
  }

  if (available.length <= 3) {
    return available.map(u => u.id);
  }

  const isFirstShop = round === 1;

  if (isFirstShop) {
    const tier1Available = available.filter(u => u.cost === 1);
    const otherAvailable = available.filter(u => u.cost !== 1);

    if (tier1Available.length > 0) {
      const guaranteedTier1 = tier1Available[Math.floor(Math.random() * tier1Available.length)];

      const remaining = otherAvailable.sort(() => Math.random() - 0.5).slice(0, 2);

      const allPicks = [guaranteedTier1, ...remaining];

      return allPicks.sort(() => Math.random() - 0.5).map(u => u.id);
    }
  }

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(u => u.id);
}

export function canAffordUpgrade(tickets: number, cost: number): boolean {
  return tickets >= cost;
}
