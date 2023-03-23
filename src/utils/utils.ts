/* eslint-disable @typescript-eslint/no-explicit-any */
const digitsRE = /[-+]?\d+(\.\d+)?/;

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
    const digitMatch = value.match(digitsRE)
    if (!digitMatch) {
      return 0
    }
    return parseFloat(digitMatch[0])
  }
}

/**
 * Adds 'px' at the end of `value` only if `value` != 0
 * @param value 
 * @return string `${value}px` or `${value}` if it's 0
 */
export function addPxUnit(value : number | string): string {
  if (typeof value === 'number') {
    return value === 0 ? `${value}` : `${value}px`;
  }

  // It's a string
  const onlyNumbers = value.match(digitsRE);
  if (!onlyNumbers) {
    // If it already has a unit (not just a number) we don't add anything
    return value;
  }

  return value === '0' ? value : `${value}px`
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