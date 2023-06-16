/**
 * Example of how to define a filter to include in the StyleDictionary pipeline
 *
 * This baseline of the design token engine doesn't need one, but it's likely that a specific project does.
 */
import StyleDictionary from 'style-dictionary';
import { TransformedToken } from 'style-dictionary/types/TransformedToken';
import { Filter, SimpleDesignToken, TokenType } from './types';

/* This should be defined in types.ts */
// export enum Filter {
//   exampleFilter = 'exampleFilter',
// }

/**
 * Detects elevation tokens
 * @param token
 * @returns boolean
 */
function isElevation(token: TransformedToken): boolean {
  const originalToken = token.original as SimpleDesignToken;
  return originalToken.type === TokenType.elevation;
}

/**
 * Detects breakpoint tokens
 * @param token
 * @returns boolean
 */
function isBreakpoint(token: TransformedToken): boolean {
  const originalToken = token.original as SimpleDesignToken;
  return originalToken.type === TokenType.breakpoint;
}


/**
 * Checks if `token` is of type `type`
 * @param token 
 * @param type 
 * @returns Boolean
 */
function isTokenType(token: TransformedToken, type: TokenType) {
  const originalToken = token.original as SimpleDesignToken;
  return originalToken.type === type;
}

export function registerFilters(): void {
  StyleDictionary.registerFilter({
    name: Filter.compose,
    matcher: (token) => {
      return !(isElevation(token) || isBreakpoint(token))
    },
  });
  StyleDictionary.registerFilter({
    name: Filter.swift,
    matcher: (token) => {
      return !(
        isElevation(token) || 
        isBreakpoint(token) || 
        isTokenType(token, TokenType.boxShadow)
      )
    },
  });
}

/**
 * The next steps after defining a new filter are:
 * 1. Call the `registreFilters` function in the body of `createStyleDictionaryConfig` in `index.ts`
 * 2. Add the filter name to the file configurations that require them:
      files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
            filter: Filter.exampleFilter,
          },
        ]
 */
