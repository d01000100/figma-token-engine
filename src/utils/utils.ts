/* eslint-disable @typescript-eslint/no-explicit-any */
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

/**
 * Returns a copy of `object` without `omittedKeys`
 * @example
 * // returns {"foo": 1, "bar", 2}
 * const obj = {foo: 1, bar: 2, baz: 3}
 * omit(obj, "baz")
 * @param object
 * @param omittedKeys
 */
export function omit(object: any, ...omittedKeys: string[]): any {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !omittedKeys.includes(key))
  );
}

/**
 * Returns a copy of `object` just with `pickedKeys`
 * @example
 * // returns {"foo": 1, "baz", 3}
 * const obj = {foo: 1, bar: 2, baz: 3}
 * omit(obj, "foo","baz")
 * @param object
 * @param pickedKeys
 * @returns
 */
export function pick(object: any, ...pickedKeys: string[]): any {
  return Object.fromEntries(
    pickedKeys.filter((key) => key in object).map((key) => [key, object[key]])
  );
}