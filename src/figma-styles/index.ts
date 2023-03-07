import { logEvent } from './../utils/logger'
import { getFigmaStyles } from './../figma-api'
import { start as startStyleDictionary } from './../style-dictionary'

export async function processFigmaStyles() {
  logEvent(`Figma Styles`)

  const opts = global.tokenEngineConfig

  // Step 1: Get [FigmaStyles] from the Figma API and transform them to be ready for token-transform
  await getFigmaStyles(opts.inputFile)

  // Step 3: Transfom [TokensStudio] using StyleDictionary, to be ready for css/js tools
  startStyleDictionary(opts)

  // Step 4: Done
  logEvent(`Done!`)
}
