import * as dotenv from 'dotenv'

dotenv.config()

const NODE_ENV = process.env.NODE_ENV || 'development'
const NODE_API = process.env.NODE_API || false

import { printAppName } from './utils/title'
import { logEvent } from './utils/logger'
import { generateTemplate } from './utils/config'

import { processFigmaTokens } from './figma-tokens'
import { processFigmaStyles } from './figma-styles'

import { TokenEngineConfigType } from './types'

export async function runTokenEngine(
  opts: TokenEngineConfigType,
  { useAPI, dryRun }: { useAPI: boolean; dryRun: boolean }
) {
  printAppName()

  global.tokenEngineConfig = opts
  global.useAPI = useAPI
  global.dryRun = dryRun

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
  if (global.tokenEngineConfig.tokenFormat === 'FigmaTokens') {
    await processFigmaTokens()
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
