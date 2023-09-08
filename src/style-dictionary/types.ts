import { DesignToken as SDDesignToken } from 'style-dictionary'

/** Custom Transform Groups configured for StyleDictionary */
export enum TransformGroup {
  webCSS = 'web-css/custom',
  webSCSS = 'web-scss/custom',
  webLESS = 'web-less/custom',
  webJS = 'web-js/custom',
}

/** Customm transformer names configured for StyleDictionary */

export enum Transformer {
  addFontFamilyQuotes = 'addQuotes',
  addUnitPixels = 'addUnitPixels',
  addUnitMs = 'addUnitMs',
  customCTI = 'attribute/customCTI',
  parseAspectRatioWeb = 'parseAspectRatio',
  parseShadowValueWeb = 'shadowValue',
  transformToRem = 'transformToRem',
  toLowerCase = 'toLowerCase',
  fontWeightToNumber = "value/fontWeightToNumber"
}

/** File header names implemented for style dictionary */
export enum FileHeader {
  generatedByTokenEngine = 'generatedByTokenEngine',
}

/*=== Custom Design Tokens ====*/
/* Mimic StyleDictionary's design token type, but with specific `type` and `value`
  property types */
/** Valid types for the design tokens */

export enum TokenType {
  borderRadius = 'borderRadius',
  borderWidth = 'borderWidth',
  boxShadow = 'boxShadow',
  shadowBlur = 'blur',
  shadowOffsetX = 'x',
  shadowOffsetY = 'y',
  shadowSpread = 'spread',
  shadowType = 'type',
  breakpoint = 'breakpoint',
  color = 'color',
  elevation = 'elevation',
  fontFamily = 'fontFamily',
  fontSize = 'fontSize',
  fontWeight = 'fontWeight',
  gradient = 'gradient',
  letterSpacing = 'letterSpacing',
  lineHeight = 'lineHeight',
  motionDuration = 'motionDuration',
  motionEasing = 'motionEasing',
  ratio = 'ratio',
  size = 'size',
  space = 'space',
  textTransform = 'textTransform',
  textDecoration = 'textDecoration',
  opacity = 'opacity',
  number = "number"
}

export enum ShadowType {
  dropShadow = 'dropShadow',
  innerShadow = 'innerShadow',
}

export type ShadowTokenSingleValue = {
  color: string
  type: ShadowType
  x: string | number
  y: string | number
  blur: string | number
  spread: string | number
}

interface DesignTokenCommon extends SDDesignToken {
  description?: string
}

export type ShadowDesignToken = DesignTokenCommon & {
  type: 'boxShadow'
  value: ShadowTokenSingleValue[] | ShadowTokenSingleValue
}

export type DesignTokenValue = string | number

export type SimpleDesignToken = DesignTokenCommon & {
  type?: TokenType
  value: DesignTokenValue
}

export type DesignToken = ShadowDesignToken | SimpleDesignToken

export interface DesignTokens {
  [key: string]: DesignToken | DesignTokens
}
