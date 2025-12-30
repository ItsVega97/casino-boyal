export type RngFunction = () => number;

export function makeRng(seed: number): RngFunction {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
