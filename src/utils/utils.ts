/**
 * Consolidates a value that may be a string or a number (token) into a number,
 * extracting only the digits from a string
 * @param value The value of a token, that contains a number
 * @returns number - The numeric value
 */
export function toNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value
  } else {
    const digitMatch = value.match(/[-+]?\d+(\.\d+)?/)
    if (!digitMatch) {
      return 0
    }
    return parseFloat(digitMatch[0])
  }
}
