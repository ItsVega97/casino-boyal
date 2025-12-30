const STORAGE_KEY = 'casinoBoyal_achievements';

export const getUnlockedAchievements = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const unlockAchievement = (achievementId: string): boolean => {
  const unlocked = getUnlockedAchievements();

  if (unlocked.includes(achievementId)) {
    return false;
  }

  unlocked.push(achievementId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  return true;
};

export const isAchievementUnlocked = (achievementId: string): boolean => {
  return getUnlockedAchievements().includes(achievementId);
};

export const clearAchievements = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
