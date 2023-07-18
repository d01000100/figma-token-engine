import { TokenEngineConfigType } from '../types'
import { logEvent } from '../utils/logger'
import { buildStyleDictionary } from './config'

/**
 *
 * @param inputFile
 * @param outputDir
 * @param platforms
 */
export function start({
  tokenFormat,
  inputFile,
  outputDir,
  platforms,
}: Pick<
  TokenEngineConfigType,
  'inputFile' | 'outputDir' | 'tokenFormat' | 'platforms'
>) {
  logEvent('Style Dictionary')

  const generator = buildStyleDictionary(inputFile, outputDir, tokenFormat)

  if (platforms) {
    platforms.forEach(platform => {
      generator.buildPlatform(platform)
    })
  } else {
    generator.buildAllPlatforms()
  }
}
