const ROUND_TARGETS: Record<number, number> = {
  1: 30,
  2: 40,
  3: 55,
  4: 75,
  5: 100,
  6: 135,
  7: 180,
  8: 240,
  9: 320,
  10: 420,
  11: 550,
  12: 720,
};

export function getRoundTarget(round: number): number {
  if (round >= 1 && round <= 12) {
    return ROUND_TARGETS[round];
  }

  return Math.floor(720 * Math.pow(1.35, round - 12));
}

export function getRoundSpinsBase(round: number, spinsPerRoundDelta: number = 0): number {
  let baseSpins = 5;

  if (round >= 1 && round <= 3) {
    baseSpins = 5;
  } else if (round >= 4 && round <= 6) {
    baseSpins = 6;
  } else if (round >= 7 && round <= 9) {
    baseSpins = 7;
  } else {
    baseSpins = 8;
  }

  return Math.max(1, baseSpins + spinsPerRoundDelta);
}
