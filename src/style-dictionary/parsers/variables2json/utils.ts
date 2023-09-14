import { TokenType } from "../../types";
import { Variable } from "./types";

/**
 * Divider on the names of variables
 */
export const NAME_DIVIDER = "/"

/**
 * Transforms the type of a Variable into a TokenType
 * @param param0 - Variable
 * @returns 
 */
export function getVarType({ type }: Variable): TokenType | undefined {
  // Determine attributes according to type
  switch (type) {
    case "color":
      return TokenType.color
    case "number":
      return TokenType.number
    default:
      // We don't support any other type of variable
      return;
  }
}

/**
 * Construct the route into the result token object from a variable
 * 
 * Considers the collection, modes and name parts
 * @param param0 - Variable
 * @returns Every step of the route as an array
 */
export function getRoute({ name, collectionName, modeName }: Variable): string[] {
  return [collectionName, modeName, ...name.split(NAME_DIVIDER)]
    .filter(x => x !== undefined) as string[];
}