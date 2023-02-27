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
