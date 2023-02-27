/**
 * Specific settin of JSON.stringify for output token files
 * @param obj - JSON object to stringify
 * @returns Stringified JSON object
 */
export function formatJSON(obj: object): string {
  return JSON.stringify(obj, null, '\t') + '\n'
}
