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
import { processFigmaVariables } from './figma-variables'

/**
 * Runs the whole FTE pipeline depending of the entry format
 * inputted on the config file
 * (Assumes the config file info is already saved on global)
 */
export async function processByInputFormat() {

  switch (global.tokenEngineConfig.tokenFormat) {
    case 'FigmaStyles':
      await processFigmaStyles();
      break;      
    case 'TokensStudio':
    case 'FigmaTokens': // left here for retro compatibility purposes
      await processTokensStudio()
      break;
    case 'FigmaVariables':
      await processFigmaVariables();
      break;
    default:
      return false;
  }

  return true
}

export async function runTokenEngine(
  opts: TokenEngineConfigType,
  { useAPI, dryRun, sdConfigFile }: { useAPI: boolean; dryRun: boolean, sdConfigFile?: string }
) {
  printAppName()

  global.tokenEngineConfig = opts
  global.useAPI = useAPI
  global.dryRun = dryRun
  global.sdConfigFile = sdConfigFile
  global.originalPlatforms = opts.platforms

  logEvent('Start Figma Token Engine')

  // Check if you want to dry-run the command
  if (global.dryRun) {
    logEvent(`Dry Run`)
  }

  return processByInputFormat();
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
