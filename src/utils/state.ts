/* eslint-disable no-var */

import { TokenEngineConfigType } from './../types'

/*
  Register Global state objects, it should only be used
  for CLI options and global configuration.
  */
declare global {
  var tokenEngineConfig: TokenEngineConfigType
  var useAPI: boolean
  var dryRun: boolean
}
