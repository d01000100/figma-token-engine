import { logEvent } from '../utils/logger'
import { getTokensStudio } from '../figma-api'
import { start as startTokenTransform } from '../token-transform'
import { start as startStyleDictionary } from '../style-dictionary'
import { TokensStudioArgs } from '../types'

export async function processTokensStudio() {
  logEvent(`Figma Tokens`)

  const opts = global.tokenEngineConfig

  // Step 1: Get [FigmaTokens] from the Figma API and transform them to be ready for token-transform
  if(!(await getTokensStudio(opts.inputFile))) {
   return; // we return if there's no tokens
  }

  // Step 2: Transfom [FigmaTokens] using tokens-tranform, to be ready for StyleDictionary
  opts.inputFile =
    (await startTokenTransform(opts as TokensStudioArgs)) ?? opts.inputFile

  // Step 3: Transfom [FigmaTokens] using StyleDictionary, to be ready for css/js tools
  startStyleDictionary(opts)

  // Step 4: Done
  logEvent(`Done!`)
}
