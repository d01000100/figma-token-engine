import { logEvent } from './../utils/logger'
import { getFigmaStyles } from './../figma-api'
import { start as startStyleDictionary } from './../style-dictionary'
import { setUpMobileGlobals, setUpWebGlobals } from '../web-mobile';

export async function processFigmaStyles() {
  logEvent(`Figma Styles`)

  // Step 1: Get [FigmaStyles] from the Figma API and transform them to be ready for token-transform
  if(!(await getFigmaStyles(global.tokenEngineConfig.inputFile))) {
    return; // we return if there are no styles defined on the file
  }
    
  // Step 3.1: Transfom [FigmaStyles] using StyleDictionary for web
  setUpWebGlobals();
  startStyleDictionary(global.tokenEngineConfig)

  // Step 3.2: Transfom [FigmaStyles] using StyleDictionary for mobile
  setUpMobileGlobals();
  startStyleDictionary(global.tokenEngineConfig)

  // Step 4: Done
  logEvent(`Done!`)
}
