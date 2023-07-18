import { TokenEngineConfigType } from './../types'

/**
 * Base template for config file
 * @returns
 */
export function generateTemplate(): TokenEngineConfigType {
  return {
    tokenFormat: 'TokensStudio',
    figmaFileId: '',
    inputFile: './tokens-studio.json',
    outputDir: './src/styles/tokens'
  }
}
