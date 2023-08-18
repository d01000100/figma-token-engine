import { DesignTokens } from 'style-dictionary'
import { TokenEngineConfigType } from '../types'
import { logEvent } from '../utils/logger'
import { buildStyleDictionary } from './config'
import { parseFigmaStyles } from './parsers/figmaStylesParser'
import { parseTokensStudio } from './parsers/tokensStudioParser'

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

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let parser: (tokens: any) => DesignTokens = (tokens) => tokens

  switch (tokenFormat) {
    case 'FigmaStyles':
      parser = parseFigmaStyles
      break
    case 'TokensStudio':
    case 'FigmaTokens':
      parser = parseTokensStudio
      break
  }

  const generator = buildStyleDictionary(inputFile, outputDir, parser)

  if (platforms) {
    platforms.forEach(platform => {
      generator.buildPlatform(platform)
    })
  } else {
    generator.buildAllPlatforms()
  }
}
