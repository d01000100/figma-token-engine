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
import { addPxUnit, toNumber } from '../utils/utils'

const typesWithDefaultPxUnit: TokenType[] = [
  TokenType.borderRadius,
  TokenType.borderWidth,
  TokenType.breakpoint,
  TokenType.fontSize,
  TokenType.letterSpacing,
  TokenType.lineHeight,
  TokenType.size,
  TokenType.space,
]

const typesWithRemUnit: TokenType[] = [
  TokenType.borderRadius,
  TokenType.borderWidth,
  TokenType.breakpoint,
  TokenType.fontSize,
  TokenType.letterSpacing,
  TokenType.lineHeight,
  TokenType.size,
  TokenType.space,
]

const typesWithMsDefaultUnit: TokenType[] = [TokenType.motionDuration]

const typesWithKeywordValues: TokenType[] = [
  TokenType.fontWeight,
  TokenType.letterSpacing,
  TokenType.lineHeight,
  TokenType.motionEasing,
  TokenType.textTransform,
  TokenType.textDecoration,
]

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
 * Adds category and type attributes according to custom "type"
 * property deduced from original source
 * @param token 
 */
function customCTI(token: TransformedToken) {
  const originalToken = token.original as DesignToken
  let category : string | undefined;
  let type : string | undefined;

  switch (originalToken.type) {
    case TokenType.fontSize:
    case TokenType.letterSpacing:
    case TokenType.lineHeight:
      category = 'size',
      type = 'font'
      break;
    case TokenType.size:
    case TokenType.space:
    case TokenType.borderRadius:
      category = 'size';
      break;
    case TokenType.motionDuration:
      category = 'time';
      break;
    default:
      category = originalToken.type
  }

  return {
    ...token.attributes,
    category,
    type,
  }
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
  const offsetX = addPxUnit(shadowValue.x)
  const offsetY = addPxUnit(shadowValue.y)
  const blur = addPxUnit(shadowValue.blur)
  const color = shadowValue.color
  const spread = shadowValue.spread
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
   * Adds single quotes around a Font Family token
   */
  StyleDictionary.registerTransform({
    name: Transformer.addFontFamilySingleQuotes,
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
   * Adds double quotes around a Font Family token
   */
  StyleDictionary.registerTransform({
    name: Transformer.addFontFamilyDoubleQuotes,
    type: 'value',
    matcher: token => {
      const originalToken = token.original as DesignToken
      return originalToken.type === TokenType.fontFamily
    },
    transformer(token) {
      return `"${token.original.value}"`
    },
  })
  /**
   * Adds category and type attributes according to custom "type"
   * property deduced from original source
   */
  StyleDictionary.registerTransform({
    name: Transformer.customCTI,
    type: 'attribute',
    transformer: customCTI,
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

  /**
   * Transforms fontweight tokens from keywords to numbers 
   */
    StyleDictionary.registerTransform({
      name: Transformer.fontWeightToNumber,
      type: 'value',
      matcher: (token: TransformedToken) => {
        const originalToken = token.original as DesignToken
        return originalToken.type === TokenType.fontWeight &&
          typeof originalToken.value === 'string' &&
          // Tiene algo que no es un número
          !originalToken.value.match(/[0-9]*/);
      },
      transformer(token) {
        /* Because of the matcher, we know that token.value:
          - Is a string
          - And contains something that is not a number */
        /* 1. Obtener el valor */
        /* 2. Pasarlo por un switch de los valores posibles para un peso de fuente */
        /* 3. Devolver el número adecuado */
        return token.value
      },
    })
}
