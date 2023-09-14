/** Union of all specific app arguments */
export type TokenEngineConfigType = TokensStudioArgs | FigmaStylesArgs | Variables2JsonArgs

export type TokenFormat = 'FigmaTokens' | 'TokensStudio' | 'FigmaStyles' | 'variables2json'

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

export interface TokensStudioArgs extends AppArgs {
  figmaFileId: string
  excludes?: string[]
  sets?: string[]
  transformerOutput?: string
}

export interface FigmaStylesArgs extends AppArgs {
  figmaFileId: string
}

export interface Variables2JsonArgs extends AppArgs {
  parsedTokensFile?: string
  variableFiles : string | string[]
}