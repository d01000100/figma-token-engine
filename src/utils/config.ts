import { TokenEngineConfigType } from './../types'

/**
 * Base template for config file
 * @returns
 */
export function generateTemplate(): TokenEngineConfigType {
  return {
    tokenFormat: 'FigmaTokens',
    figmaFileId: '',
    inputFile: './figma-tokens.json',
    outputDir: './tmp',
    platforms: [
      'css',
      'cssAutocomplete',
      'scss',
      'scssMap',
      'less',
      'js',
      'ts',
      'json',
    ],
  }
}
