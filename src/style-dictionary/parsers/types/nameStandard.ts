import { TokenType } from '../../types'

/**
 * Specification of the relevant parts of the standarized name of a token that helps
 * identify the type of token
 */

export const NORMALIZED_TOKEN_NAME_DIVIDER = '-'

/** Main section on a token name that indicates what type of token it describes */
export enum Category {
  breakpoint = 'breakpoint',
  borderWidth = 'borderWidth',
  color = 'color',
  elevation = 'elevation',
  fontStyle = 'fontStyle',
  gradient = 'gradient',
  motion = 'motion',
  ratio = 'ratio',
  radii = 'radii',
  innerShadow = 'innerShadow',
  dropShadow = 'dropShadow',
  size = 'size',
  space = 'space',
  opacity = 'opacity',
}

export enum ColorVariants {
  gradientLinear = 'gradientLinear',
  gradientRadial = 'gradientRadial',
  gradientAngular = 'gradientAngular',
  gradientDiamond = 'gradientDiamond',
}

export enum FontVariant {
  decoration = 'decoration',
  style = 'style',
}

export enum MotionVariant {
  duration = 'duration',
  easing = 'easing',
}

/**
 * Some component tokens don't have a Category. Instead they have a more precise Property
 * Each one relate to a Category
 */
export enum Property {
  background = 'background',
  duration = 'duration',
  easing = 'easing',
  gap = 'gap',
  height = 'height',
  margin = 'margin',
  padding = 'padding',
  radii = 'radii',
  weight = 'weight',
  width = 'width',
}

/**
 * Relations between properties (of component-level tokens) and the types they refer to
 */
export const PropertyToType: Record<Property, TokenType> = {
  [Property.background]: TokenType.color,
  [Property.duration]: TokenType.motionDuration,
  [Property.easing]: TokenType.motionEasing,
  [Property.gap]: TokenType.space,
  [Property.height]: TokenType.size,
  [Property.margin]: TokenType.space,
  [Property.padding]: TokenType.space,
  [Property.radii]: TokenType.borderRadius,
  [Property.weight]: TokenType.fontWeight,
  [Property.width]: TokenType.size,
}
