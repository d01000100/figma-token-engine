/* Code copied from
  https://github.com/tokens-studio/sd-transforms/blob/main/src/transformFontWeights.ts */

interface StringMap {
  [name: string]: number;
}

export const fontWeightMap : StringMap = {
  thin: 100,
  extralight: 200,
  ultralight: 200,
  extraleicht: 200,
  light: 300,
  leicht: 300,
  normal: 400,
  regular: 400,
  buch: 400,
  medium: 500,
  kraeftig: 500,
  kräftig: 500,
  semibold: 600,
  demibold: 600,
  halbfett: 600,
  bold: 700,
  dreiviertelfett: 700,
  extrabold: 800,
  ultabold: 800,
  fett: 800,
  black: 900,
  heavy: 900,
  super: 900,
  extrafett: 900,
};

/**
 * Helper: Transforms fontweight keynames to fontweight numbers (100, 200, 300 ... 900)
 */
export function transformFontWeights(
  value: string | undefined | number,
): number | string | undefined {
  if (value === undefined) {
    return value;
  }
  const mapped = fontWeightMap[`${value}`.toLowerCase()];

  return mapped ?? value;
}