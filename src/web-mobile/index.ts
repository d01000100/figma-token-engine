import { PlatformsType } from "../types";
import { logEvent } from "../utils/logger";

const webPlatforms : PlatformsType[] = [
  'css',
  'cssAutocomplete',
  'scss',
  'scssMap',
  'less',
  'js',
  'ts',
  'json'
]

const mobilePlatforms : PlatformsType[] = [
  'compose',
  'ios-swift/class.swift',
  'android/resources'
]

/**
 * Sets up platforms and shadow expansion (not) for web outputs
 */
export function setUpWebGlobals() {
  logEvent("Setting up web globals")
  global.tokenEngineConfig.platforms = global.tokenEngineConfig.platforms?.filter(
    platform => webPlatforms.includes(platform)
  ) ?? webPlatforms;
  global.expandShadows = false;
}
/**
 * Sets up platforms and shadow expansion (yes) for mobile outputs
 */
export function setUpMobileGlobals() {
  logEvent("Setting up mobile globals")
  global.tokenEngineConfig.platforms = global.originalPlatforms?.filter(
    platform => mobilePlatforms.includes(platform)
    ) ?? mobilePlatforms;
  global.expandShadows = true;
}