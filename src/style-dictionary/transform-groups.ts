import StyleDictionary from 'style-dictionary'
import { TransformGroup, Transformer } from './types'
import { registerTransformers } from './transformers'

const globalTransformers = [
  // Style Dictionary default transformers
  'attribute/cti',
  Transformer.toLowerCase,
]

const stylesheetTransformers = [
  'name/cti/kebab',
  Transformer.addFontFamilyQuotes,
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
}
