export interface RunRecord {
  id: string;
  date: string;
  rouletteVariantId: string;
  roundsCompleted: number;
  maxChips: number;
  ticketsEarned: number;
  defeatedReason: 'outOfSpins' | 'outOfChips';
}

const MAX_RUNS = 50;
const STORAGE_KEY = 'casinoBoyal_runHistory';

export const saveRunRecord = (record: Omit<RunRecord, 'id' | 'date'>): void => {
  const history = getRunHistory();

  const newRecord: RunRecord = {
    id: `${Date.now()}-${Math.random()}`,
    date: new Date().toISOString(),
    ...record,
  };

  history.unshift(newRecord);

  if (history.length > MAX_RUNS) {
    history.splice(MAX_RUNS);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const getRunHistory = (): RunRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const clearRunHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
