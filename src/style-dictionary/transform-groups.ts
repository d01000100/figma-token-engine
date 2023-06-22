import StyleDictionary from 'style-dictionary'
import { TransformGroup, Transformer } from './types'
import { registerTransformers } from './transformers'

const globalTransformers = [
  // Style Dictionary default transformers
  Transformer.customCTI,
  Transformer.toLowerCase,
]

const stylesheetTransformers = [
  'name/cti/kebab',
  Transformer.addFontFamilySingleQuotes,
]

const webTransformers = [
  Transformer.addUnitMs,
  Transformer.addUnitPixels,
  Transformer.parseAspectRatio,
  Transformer.parseShadowValueWeb,
  Transformer.toLowerCase,
  Transformer.fontWeightToNumber
]

const mobileTransformers = [
  'name/cti/camel',
  'size/pxToRem',
  Transformer.addFontFamilyDoubleQuotes,
  Transformer.addShadowTypeDoubleQuotes,
  Transformer.fontWeightToNumber
]

/**
 * Register web transform groups
 * @returns
 */
export function registerTransformGroups(): void {
  registerTransformers()

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.webCSS,
    transforms: [
      ...globalTransformers,
      ...stylesheetTransformers,
      ...webTransformers,
    ],
  })

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.webLESS,
    transforms: [
      ...globalTransformers,
      ...stylesheetTransformers,
      ...webTransformers,
    ],
  })

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.webSCSS,
    transforms: [
      ...globalTransformers,
      ...stylesheetTransformers,
      ...webTransformers,
    ],
  })

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.webJS,
    transforms: [
      ...globalTransformers,
      ...webTransformers,
      'name/cti/constant',
    ],
  })

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.compose,
    transforms: [
      ...globalTransformers,
      ...mobileTransformers,
      'color/composeColor',
      'size/compose/remToSp',
      'size/compose/remToDp',
      Transformer.addFontFamilyDoubleQuotes
    ],
  })

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.swift,
    transforms: [
      ...globalTransformers,
      ...mobileTransformers,
      'color/UIColorSwift',
      'content/swift/literal',
      'asset/swift/literal',
      'size/swift/remToCGFloat',
      'font/swift/literal',
      Transformer.parseAspectRatio,
      Transformer.durationToSeconds,
      Transformer.numberToCGFloat,
    ],
  })

  
}
