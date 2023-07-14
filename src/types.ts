/** Union of all specific app arguments */
export type TokenEngineConfigType = TokensStudioArgs | FigmaStylesArgs | FigmaVariablesArgs

export type TokenFormat = 'FigmaTokens' | 'TokensStudio' | 'FigmaStyles' | 'FigmaVariables'

export const Platforms = [
  '',
  'css',
  'cssAutocomplete',
  'scss',
  'scssMap',
  'less',
  'js',
  'ts',
  'json',
  'compose',
  'swift',
  'android/resources',
  'ios-swift/class.swift'
] as const

export type PlatformsType = typeof Platforms[number]

interface AppArgs {
  brandPrefix?: string
  inputFile: string
  outputDir: string
  figmaFileId: string
  platforms?: Array<PlatformsType>
}

export interface TokensStudioArgs extends AppArgs {
  tokenFormat: 'TokensStudio' | 'FigmaTokens'
  excludes?: string[]
  sets?: string[]
  transformerOutput?: string
}

export interface FigmaStylesArgs extends AppArgs {
  tokenFormat: 'FigmaStyles'
}

export interface FigmaVariablesArgs extends AppArgs {
  tokenFormat: 'FigmaVariables',
  parsedVariablesDir?: string,
  noModeOutputSubDir?: string,
}