import StyleDictionary from 'style-dictionary'
import { TransformGroup, Transformer } from './types'
import { registerTransformers } from './transformers'

const globalTransformers = [
  // Style Dictionary default transformers
  Transformer.customCTI,
  Transformer.toLowerCase,
]

const stylesheetTransformers = [
  Transformer.webStylesheetNameTransform,
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
      Transformer.addFontFamilyDoubleQuotes,
      Transformer.fontWeightToNumber,
      Transformer.parseShadowValueWeb,
      Transformer.addShadowTypeDoubleQuotes,
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
      Transformer.addFontFamilyDoubleQuotes,
      Transformer.addShadowTypeDoubleQuotes,
    ],
  })

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.androidResources,
    transforms: [
      ...globalTransformers,
      'name/cti/snake',
      'color/hex8android',
      'size/pxToRem',
      'size/remToDp',
      'size/remToSp',
      Transformer.fontWeightToNumber
    ],
  })
}
