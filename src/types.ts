/** Union of all specific app arguments */
export type TokenEngineConfigType = FigmaTokensArgs | FigmaStylesArgs

export type TokenFormat = 'FigmaTokens' | 'FigmaStyles'

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
] as const

export type PlatformsType = typeof Platforms[number]

interface AppArgs {
  brandPrefix?: string
  inputFile: string
  outputDir: string
  platforms?: Array<PlatformsType>
  tokenFormat: TokenFormat
}

export interface FigmaTokensArgs extends AppArgs {
  figmaFileId: string
  excludes?: string[]
  sets?: string[]
  transformerOutput?: string
}

export interface FigmaStylesArgs extends AppArgs {
  figmaFileId: string
}
