/** Union of all specific app arguments */
export type TokenEngineConfigType = TokensStudioArgs | FigmaStylesArgs

export type TokenFormat = 'FigmaTokens' | 'TokensStudio' | 'FigmaStyles'

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
  'ios-swift/class.swift',
  'android/resources'
] as const

export type PlatformsType = typeof Platforms[number]

interface AppArgs {
  brandPrefix?: string
  inputFile: string
  outputDir: string
  platforms?: Array<PlatformsType>
  tokenFormat: TokenFormat
}

export interface TokensStudioArgs extends AppArgs {
  figmaFileId: string
  excludes?: string[]
  sets?: string[]
  transformerOutput?: string
}

export interface FigmaStylesArgs extends AppArgs {
  figmaFileId: string
}