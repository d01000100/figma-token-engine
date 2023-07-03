import { logEvent } from '../utils/logger'
import { getTokensStudio } from '../figma-api'
import { start as startTokenTransform } from '../token-transform'
import { TokensStudioArgs } from '../types'
import { setUpMobileGlobals, setUpWebGlobals } from '../web-mobile'
import { start as startStyleDictionary } from '../style-dictionary'

export async function processTokensStudio() {
  logEvent(`Figma Tokens`)

  const inputFile = global.tokenEngineConfig.inputFile;

  // Step 1: Get [FigmaTokens] from the Figma API and transform them to be ready for token-transform
  if(!(await getTokensStudio(global.tokenEngineConfig.inputFile))) {
   return; // we return if there's no tokens
  }

  // Step 2.1: Transfom [FigmaTokens] using tokens-tranform, to be ready for StyleDictionary
  // for web outputs
  setUpWebGlobals()
  global.tokenEngineConfig.inputFile =
    (await startTokenTransform(global.tokenEngineConfig as TokensStudioArgs)) ?? global.tokenEngineConfig.inputFile

  // Step 2.2: Transfom [FigmaTokens] using StyleDictionary for web outputs
  startStyleDictionary(global.tokenEngineConfig)

  global.tokenEngineConfig.inputFile = inputFile;

  // Step 3.1: Transfom [FigmaTokens] using tokens-tranform, to be ready for StyleDictionary
  // for web outputs
  setUpMobileGlobals()
  global.tokenEngineConfig.inputFile =
    (await startTokenTransform(global.tokenEngineConfig as TokensStudioArgs)) ?? global.tokenEngineConfig.inputFile

  // Step 3.2: Transfom [FigmaTokens] using StyleDictionary for web outputs
  startStyleDictionary(global.tokenEngineConfig)

  // Step 4: Done
  logEvent(`Done!`)
}
