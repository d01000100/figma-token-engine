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
  Transformer.parseAspectRatioWeb,
  Transformer.parseShadowValueWeb,
  Transformer.toLowerCase,
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
      'name/cti/camel',
      'color/composeColor',
      'size/pxToRem',
      'size/compose/remToSp',
      'size/compose/remToDp',
      Transformer.addFontFamilyDoubleQuotes,
      Transformer.fontWeightToNumber,
      Transformer.parseShadowValueWeb
    ],
  })

  StyleDictionary.registerTransformGroup({
    name: TransformGroup.androidResources,
    transforms: [
      ...globalTransformers,
      'name/cti/snake',
      'color/hex8android',
      'size/pxToRem',
      'size/compose/remToSp',
      'size/compose/remToDp',
      Transformer.fontWeightToNumber
    ],
  })
}
