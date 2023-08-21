import * as dotenv from 'dotenv'

dotenv.config()

const NODE_ENV = process.env.NODE_ENV || 'development'
const NODE_API = process.env.NODE_API || false

import { printAppName } from './utils/title'
import { logEvent } from './utils/logger'
import { generateTemplate } from './utils/config'

import { processTokensStudio } from './tokens-studio'
import { processFigmaStyles } from './figma-styles'

import { TokenEngineConfigType } from './types'

import { start as startStyleDictionary } from "./style-dictionary"

export async function runTokenEngine(
  opts: TokenEngineConfigType,
  { useAPI, dryRun, sdConfigFile }: { useAPI: boolean; dryRun: boolean, sdConfigFile?: string }
) {
  printAppName()

  global.tokenEngineConfig = opts
  global.useAPI = useAPI
  global.dryRun = dryRun
  global.sdConfigFile = sdConfigFile

  logEvent('Start Figma Token Engine')

  // Check if you want to dry-run the command
  if (global.dryRun) {
    logEvent(`Dry Run`)
  }

  // Start Figma Styles Process
  if (global.tokenEngineConfig.tokenFormat === 'FigmaStyles') {
    await processFigmaStyles()
  }

  // Start Figma tokens Process
  if (global.tokenEngineConfig.tokenFormat === 'TokensStudio' ||
    // left here for retro compatibility purposes
    global.tokenEngineConfig.tokenFormat === 'FigmaTokens') {
    await processTokensStudio()
  }

  if(global.tokenEngineConfig.tokenFormat === 'variables2json') {
    // No fetching or preprocessing necessary. Export from plugin is stored in inputFile
    startStyleDictionary(global.tokenEngineConfig)
  }

  return true
}

export function generateTokenTemplate() {
  return generateTemplate()
}

/* This will only run in debug environment */
if (NODE_ENV === 'debug') {
  runTokenEngine(generateTemplate(), {
    useAPI: Boolean(NODE_API),
    dryRun: false,
  })
}
