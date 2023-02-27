import StyleDictionary, { TransformedToken } from 'style-dictionary'
import {
  Transformer,
  SimpleDesignToken,
  ShadowDesignToken,
  DesignToken,
  TokenType,
  ShadowTokenSingleValue,
  ShadowType,
} from './types'
import { toNumber } from '../utils/utils'

const typesWithDefaultPxUnit: TokenType[] = []

const typesWithRemUnit: TokenType[] = [
  TokenType.borderRadius,
  TokenType.borderWidth,
  TokenType.size,
  TokenType.space,
  TokenType.fontSize,
  TokenType.lineHeight,
  TokenType.letterSpacing,
  TokenType.breakpoint,
]

const typesWithMsDefaultUnit: TokenType[] = [TokenType.motionDuration]

const typesWithKeywordValues: TokenType[] = [
  TokenType.letterSpacing,
  TokenType.textTransform,
  TokenType.lineHeight,
  TokenType.fontWeight,
  TokenType.motionEasing,
]

/*
  - Transform px to rems in typography, spaces and sizes
  - Add px to breakpoints
  
  - Shadow
  - Typography
*/

/**
 * Checks if a token should be added the 'px' unit at the end
 * @param token SingleTokenObjectParsed. The signature is `any` in order to use it in the transformer
 * @returns boolean
 */
function addUnitPixelsMatcher(token: TransformedToken): boolean {
  const originalToken = token.original as SimpleDesignToken
  return (
    typeof originalToken.value === 'number' &&
    typesWithDefaultPxUnit.includes(originalToken.type) &&
    originalToken.value !== 0
  )
}

/**
 * Checks if a token should be added the 'ms' unit at the end
 * @param token SingleTokenObjectParsed. The signature is `any` in order to use it in the transformer
 * @returns boolean
 */
function addUnitMsMatcher(token: TransformedToken): boolean {
  const originalToken = token.original as SimpleDesignToken
  return (
    typeof originalToken.value === 'number' &&
    typesWithMsDefaultUnit.includes(originalToken.type) &&
    originalToken.value !== 0
  )
}

/**
 * Checks if a token should be converted into 'rem'
 * Assumes all values come in pxs
 * @param token SingleTokenObjectParsed. The signature is `any` in order to use it in the transformer
 * @returns boolean
 */
function transformToRemMatcher(token: TransformedToken): boolean {
  const originalToken = token.original as SimpleDesignToken
  if (!typesWithRemUnit.includes(originalToken.type)) {
    return false
  }
  if (typeof originalToken.value === 'number') {
    return true
  }
  if ((originalToken.value as string).includes('px')) {
    return true
  }
  return false
}

/**
 * Transforms a single shadow value to a web representation
 * @param shadowValue ShadowTokenSingleValue
 * @return string
 */
function transformSingleShadowValueWeb(
  shadowValue: ShadowTokenSingleValue
): string {
  const offsetX = transformToRem(shadowValue.x)
  const offsetY = transformToRem(shadowValue.y)
  const blur = transformToRem(shadowValue.blur)
  const color = shadowValue.color
  const spread = transformToRem(shadowValue.spread)
  const insetString =
    shadowValue.type === ShadowType.innerShadow ? 'inset ' : ''
  return `${insetString}${offsetX} ${offsetY} ${blur} ${spread} ${color}`
}

/**
 * Matches tokens whose values are expected to be text based keywords
 * @param token SingleTokenObjectParsed. The signature is `any` in order to use it in the transform
 * @returns boolean
 */
function toLowerCaseMatcher(token: TransformedToken): boolean {
  const originalToken = token.original as DesignToken
  return (
    typeof originalToken.value === 'string' &&
    typesWithKeywordValues.includes(originalToken.type as TokenType)
  )
}

/**
 * Transforms a Shadow Token into a web representation of its values.
 * @param token SingleTokenObjectParsed. The signature is `any` in order to use it in the transformer
 * @returns string | The web representation of a shadow style.
 */
function transformShadowTokenWeb(token: TransformedToken): string {
  const originalToken = token.original as ShadowDesignToken
  if ('type' in originalToken.value) {
    // If it has a single shadow value, just parse it
    return `(${transformSingleShadowValueWeb(originalToken.value)})`
  } else {
    // If it has multiple shadow values, parse all of them and concatenate them
    return `(${originalToken.value
      .map(transformSingleShadowValueWeb)
      .join(', ')})`
  }
}

/**
 * Transforms to web a value of a token, either a string or a number
 * @param valuePx The value of the token, in pxs
 * @returns string - The value of the token in rem, with 'rem' appended
 */
function transformToRem(valuePx: number | string): string {
  // TODO: Set this value in StyleDictionary configuration
  const remScale = 16
  const numericValue = toNumber(valuePx)
  const valueRem = numericValue / remScale
  return `${valueRem}rem`
}

export function registerTransformers(): void {
  /**
   * Adds quotes around a Font Family token
   */
  StyleDictionary.registerTransform({
    name: Transformer.addFontFamilyQuotes,
    type: 'value',
    matcher: token => {
      const originalToken = token.original as DesignToken
      return originalToken.type === TokenType.fontFamily
    },
    transformer(token) {
      return `'${token.original.value}'`
    },
  })
  /**
   * Adds 'px' to the end of numeric values of the token types whose
   * default unit are 'px's in web.
   */
  StyleDictionary.registerTransform({
    name: Transformer.addUnitPixels,
    type: 'value',
    matcher: addUnitPixelsMatcher,
    transformer(token) {
      return `${token.original.value}px`
    },
  })
  /**
   * Adds 'ms' to the end of numeric values of the token types whose
   * default unit are 'ms's in web.
   */
  StyleDictionary.registerTransform({
    name: Transformer.addUnitMs,
    type: 'value',
    matcher: addUnitMsMatcher,
    transformer(token) {
      return `${token.original.value}ms`
    },
  })
  /**
   * Parse the value of an aspect ratio token to a web representation.
   */
  StyleDictionary.registerTransform({
    name: Transformer.parseAspectRatioWeb,
    type: 'value',
    matcher: token => {
      const originalToken = token.original as DesignToken
      return (
        originalToken.type === 'ratio' &&
        typeof originalToken.value === 'string'
      )
    },
    transformer: token => {
      const ratioValue = token.original.value as string
      const [numerator, denominator] = ratioValue.split(':')
      return Number((parseInt(numerator) / parseInt(denominator)).toFixed(2))
    },
  })
  /**
   * Parse the value of a drop shadow token from an object or array of objects to a string.
   */
  StyleDictionary.registerTransform({
    name: Transformer.parseShadowValueWeb,
    type: 'value',
    matcher: token => {
      const originalToken = token.original as DesignToken
      return originalToken.type === TokenType.boxShadow
    },
    transformer: transformShadowTokenWeb,
  })
  /**
   * Converts to `rem` all values describing size or space of something in web
   */
  StyleDictionary.registerTransform({
    name: Transformer.transformToRem,
    type: 'value',
    matcher: transformToRemMatcher,
    transformer(token) {
      return transformToRem(token.value)
    },
  })

  /**
   * Transforms tokens whose values may be text keywords to lower case
   */
  StyleDictionary.registerTransform({
    name: Transformer.toLowerCase,
    type: 'value',
    matcher: toLowerCaseMatcher,
    transformer(token) {
      return (token.original.value as string).toLowerCase()
    },
  })
}
