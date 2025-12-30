const STORAGE_KEY = 'casinoBoyal_upgradesHistory';

export const getUpgradesHistory = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const addUpgradeToHistory = (upgradeId: string): void => {
  const history = getUpgradesHistory();

  if (!history.includes(upgradeId)) {
    history.push(upgradeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
};

export const clearUpgradesHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
