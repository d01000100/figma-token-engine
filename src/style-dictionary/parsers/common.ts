import { logWarning } from '../../utils/logger'
import { TokenType } from '../types'
import {
  Category,
  MotionVariant,
  NORMALIZED_TOKEN_NAME_DIVIDER,
  Property,
  PropertyToType,
} from './types/nameStandard'

function getMotionTokenType(name: string[]): TokenType | undefined {
  if (name.includes(MotionVariant.duration)) {
    return TokenType.motionDuration
  }
  if (name.includes(MotionVariant.easing)) {
    return TokenType.motionEasing
  }
}

/**
 * Get the type of a token from its name, deconstructed
 * @param name string[] : The parts of the token name, following the naming standard for design tokens.
 * @return TokenTypeParsed : The type of the token, that StyleDictionary will work with.
 */
export function getTypeFromName(name: string[]): TokenType | undefined {
  /* First all the categories that doesn't have variants */
  if (name.includes(Category.borderWidth)) {
    return TokenType.borderWidth
  }
  if (name.includes(Category.breakpoint)) {
    return TokenType.breakpoint
  }
  if (name.includes(Category.color)) {
    return TokenType.color
  }
  if (name.includes(Category.dropShadow)) {
    return TokenType.boxShadow
  }
  if (name.includes(Category.elevation)) {
    return TokenType.elevation
  }
  if (name.includes(Category.gradient)) {
    return TokenType.gradient
  }
  if (name.includes(Category.innerShadow)) {
    return TokenType.boxShadow
  }
  if (name.includes(Category.radii)) {
    return TokenType.borderRadius
  }
  if (name.includes(Category.ratio)) {
    return TokenType.ratio
  }
  if (name.includes(Category.size)) {
    return TokenType.size
  }
  if (name.includes(Category.space)) {
    return TokenType.space
  }
  if (name.includes(Category.opacity)) {
    return TokenType.opacity
  }

  /* Now categories with possible variants */
  if (name.includes(Category.motion)) {
    return getMotionTokenType(name)
  }
  if (name.includes(Category.fontStyle)) {
    // Fonts are dealt in the parser of each tool
    return
  }

  const property = name.find(namePart =>
    Object.values(Property).includes(namePart as Property)
  ) as Property

  if (property) {
    return PropertyToType[property]
  }

  logWarning(
    `Token name without identifiable category: ${name.join(
      NORMALIZED_TOKEN_NAME_DIVIDER
    )}`
  )
}

/* These functions were an attempt to expand shadows just before entering the StyleDictionary pipeline,
  after the parsers.
  
  The problem with this is that I kept over writting other values on the DesignTokens object or putting
  the expanded data inside the composite token object, and StyleDictionary won't search for tokens inside
  tokens.
  
  I leave this here, for if I (or someone) ever figures out where to put the expanded shadow tokens so that
  the composite and the expanded tokens could coexist in the DesignTokens object and StyleDictionary parse
  both */

///**
// * Map between the keys of a shadow token and the type of the simple token
// * representing that value
// */
//export const shadowTypeMap = {
//  blur: TokenType.shadowBlur,
//  type: TokenType.shadowType,
//  x: TokenType.shadowOffsetX,
//  y: TokenType.shadowOffsetY,
//  spread: TokenType.shadowSpread,
//  color: TokenType.color
//}

//function _expandSingleShadowToken(token : ShadowTokenSingleValue) : DesignTokens {
//  const res : DesignTokens = {};
//  Object.entries(token).forEach(([key, value]) => {
//    res[key] = {
//      value: `${value}`,
//      type: shadowTypeMap[key],
//    };
//  });
//  return res;
//}

///**
// * Expands an object shadow token into several simple tokens
// * @param token 
// * @return An object whose leaf-level entries are simple design tokens
// */
//export function expandShadowToken(token : ShadowDesignToken) : DesignTokens {
//  if (Array.isArray(token.value)) {
//    // It's a shadow consisting of several values
//    const res : DesignTokens = {};
//    token.value.forEach((singleShadow, index) => {
//      res[index] = _expandSingleShadowToken(singleShadow)
//    })
//    return res;
//  }

//  // it's a single shadow
//  return _expandSingleShadowToken(token.value)
//}