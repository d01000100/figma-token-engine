/* eslint-disable no-var */

import { PlatformsType, TokenEngineConfigType } from './../types'

/*
  Register Global state objects, it should only be used
  for CLI options and global configuration.
  */
declare global {
  var tokenEngineConfig: TokenEngineConfigType
  var originalPlatforms: PlatformsType[] | undefined
  var useAPI: boolean
  var dryRun: boolean
  var sdConfigFile: string | undefined
  var expandShadows: boolean
}
