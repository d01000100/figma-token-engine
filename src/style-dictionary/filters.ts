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
  * Detects colors tokens
  * @param token
  * @returns boolean
  */
   function isColor(token: TransformedToken): boolean {
    const originalToken = token.original as SimpleDesignToken;
    return originalToken.type === TokenType.color;
  }

  /**
  * Detects font family tokens
  * @param token
  * @returns boolean
  */
    function isFontFamily(token: TransformedToken): boolean {
      const originalToken = token.original as SimpleDesignToken;
      return originalToken.type === TokenType.fontFamily;
    }
  
  /**
  * Detects font weight tokens
  * @param token
  * @returns boolean
  */
      function isFontWeight(token: TransformedToken): boolean {
        const originalToken = token.original as SimpleDesignToken;
        return originalToken.type === TokenType.fontWeight;
    }

  /**
  * Detects font size tokens
  * @param token
  * @returns boolean
  */
      function isFontSize(token: TransformedToken): boolean {
        const originalToken = token.original as SimpleDesignToken;
        return originalToken.type === TokenType.fontSize;
    }

  /**
  * Detects font size tokens
  * @param token
  * @returns boolean
  */
      function isSpacing(token: TransformedToken): boolean {
        const originalToken = token.original as SimpleDesignToken;
        return originalToken.type === TokenType.letterSpacing;
    }

  /**
  * Detects others lineHeight tokens
  * @param token
  * @returns boolean
  */
    function isLineheight(token: TransformedToken): boolean {
      const originalToken = token.original as SimpleDesignToken;
      return originalToken.type === TokenType.lineHeight;
  }

  /**
  * Detects others lineHeight tokens
  * @param token
  * @returns boolean
  */
    function isShadow(token: TransformedToken): boolean {
      const originalToken = token.original as SimpleDesignToken;
      return (originalToken.type === TokenType.boxShadow || 
        originalToken.type === TokenType.shadowBlur ||
        originalToken.type === TokenType.shadowOffsetX ||
        originalToken.type === TokenType.shadowOffsetY ||
        originalToken.type === TokenType.shadowSpread ||
        originalToken.type === TokenType.shadowType);
  }

   /**
   * Register tokens filtered by Color
   */
 export function registerTokensByColor(): void {
  StyleDictionary.registerFilter({
    name: Filter.color,
    matcher: (token) => {
     return (isColor(token))
    },
  });
}
 /**
   * Register tokens filtered by Font
   */
 export function registerTokensByFont(): void {
  StyleDictionary.registerFilter({
    name: Filter.font,
    matcher: (token) => {
     return (isFontFamily(token) || isFontSize(token) || isFontWeight(token))
    },
  });
}

 /**
   * Register tokens filtered by Spacing
   */
 export function registerTokensBySpacing(): void {
  StyleDictionary.registerFilter({
    name: Filter.spacing,
    matcher: (token) => {
     return (isSpacing(token))
    },
  });
}

 /**
   * Register tokens filtered by Others
   */
 export function registerTokensByOthers(): void {
  StyleDictionary.registerFilter({
    name: Filter.others,
    matcher: (token) => {
     return (isLineheight(token) || isShadow(token))
    }
  })
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
        isTokenType(token, TokenType.textDecoration) ||
        isTokenType(token, TokenType.textTransform)
      )
    },
  });
}
