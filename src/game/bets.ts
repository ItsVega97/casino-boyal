export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export const COLUMN_1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
export const COLUMN_2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
export const COLUMN_3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

export type BetKind =
  | 'straight'
  | 'split'
  | 'street'
  | 'corner'
  | 'sixline'
  | 'red'
  | 'black'
  | 'even'
  | 'odd'
  | 'low'
  | 'high'
  | 'dozen'
  | 'column';

export interface Bet {
  id: string;
  kind: BetKind;
  amount: number;
  numbers?: number[];
  meta?: {
    dozen?: 1 | 2 | 3;
    column?: 1 | 2 | 3;
  };
}

export const getBetDescription = (bet: Bet): string => {
  switch (bet.kind) {
    case 'straight':
      return `Straight ${bet.numbers?.[0]}`;
    case 'split':
      return `Split ${bet.numbers?.join('-')}`;
    case 'street':
      return `Street ${bet.numbers?.[0]}-${bet.numbers?.[1]}-${bet.numbers?.[2]}`;
    case 'corner':
      return `Corner ${bet.numbers?.slice(0, 2).join('-')}`;
    case 'sixline':
      return `Six Line ${bet.numbers?.[0]}-${bet.numbers?.[5]}`;
    case 'red':
      return 'Red';
    case 'black':
      return 'Black';
    case 'even':
      return 'Even';
    case 'odd':
      return 'Odd';
    case 'low':
      return 'Low (1-18)';
    case 'high':
      return 'High (19-36)';
    case 'dozen':
      return `${bet.meta?.dozen}st Dozen`;
    case 'column':
      return `Column ${bet.meta?.column}`;
    default:
      return 'Unknown';
  }
};

export const getPayoutMultiplier = (kind: BetKind): number => {
  switch (kind) {
    case 'straight':
      return 35;
    case 'split':
      return 17;
    case 'street':
      return 11;
    case 'corner':
      return 8;
    case 'sixline':
      return 5;
    case 'red':
    case 'black':
    case 'even':
    case 'odd':
    case 'low':
    case 'high':
      return 1;
    case 'dozen':
    case 'column':
      return 2;
    default:
      return 0;
  }
};

export const validateSplit = (num1: number, num2: number): boolean => {
  const diff = Math.abs(num1 - num2);
  if (diff === 1) {
    const row1 = Math.floor((num1 - 1) / 3);
    const row2 = Math.floor((num2 - 1) / 3);
    return row1 === row2;
  }
  if (diff === 3) {
    return true;
  }
  return false;
};

export const getStreetNumbers = (startNum: number): number[] | null => {
  if (startNum < 1 || startNum > 34) return null;
  const row = Math.floor((startNum - 1) / 3);
  if ((startNum - 1) % 3 !== 0) return null;
  return [startNum, startNum + 1, startNum + 2];
};

export const getCornerNumbers = (topLeft: number): number[] | null => {
  if (topLeft < 1 || topLeft > 32) return null;
  const col = (topLeft - 1) % 3;
  if (col === 2) return null;

  return [topLeft, topLeft + 1, topLeft + 3, topLeft + 4];
};

export const getSixLineNumbers = (startNum: number): number[] | null => {
  if (startNum < 1 || startNum > 31) return null;
  if ((startNum - 1) % 3 !== 0) return null;

  return [startNum, startNum + 1, startNum + 2, startNum + 3, startNum + 4, startNum + 5];
};
