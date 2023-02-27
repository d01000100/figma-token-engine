import StyleDictionary, { Config, DesignTokens } from 'style-dictionary'
import { ParserOptions } from 'style-dictionary/types/Parser'
import { registerFileHeaders } from './file-headers'
import { registerFormatters } from './formatters'
import { registerTransformGroups } from './transform-groups'
import { FileHeader, TransformGroup } from './types'

/** Creates the necessary config of StyleDictioanry for the token-engine pipeline
 *
 * @remarks
 * Configures the options of each of the platforms defined for the token-engine:
 * - Output directories
 * - Formatters
 * - Transformers
 * - File Headers
 *
 * @param tokensSource - Location of the file containing the raw tokens
 * @param outputFolder - Directory where to output the stylesheets and other exports
 * @param parser - Optional. Parser to transform the tokens before starting the pipeline
 */
export function createStyleDictionaryConfig(
  tokensSource: string,
  outputFolder: string,
  parser?: (tokens: object) => DesignTokens
): Config {
  const _outputFolder = outputFolder.startsWith('/')
    ? outputFolder
    : `${outputFolder}/`

  /* If I recieve a custom parser, I create an object to merge into the config 
    with that parser */
  const parserObj = parser
    ? {
        parsers: [
          {
            pattern: new RegExp(tokensSource),
            parse: ({ contents }: ParserOptions) => {
              const compiledTokens = JSON.parse(contents)
              return parser(compiledTokens)
            },
          },
        ],
      }
    : {}

  return {
    source: [tokensSource],
    ...parserObj,
    platforms: {
      ['css']: {
        transformGroup: TransformGroup.webCSS,
        buildPath: _outputFolder,
        files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ],
      },
      ['cssAutocomplete']: {
        transformGroup: TransformGroup.webCSS,
        buildPath: _outputFolder,
        files: [
          {
            destination: 'tokens-autocomplete-config.json',
            format: 'cssAutocomplete',
          },
        ],
      },
      ['scss']: {
        transformGroup: TransformGroup.webSCSS,
        buildPath: _outputFolder,
        files: [
          {
            destination: 'tokens.scss',
            format: 'scss/variables',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ],
      },
      ['scssMap']: {
        transformGroup: TransformGroup.webSCSS,
        buildPath: _outputFolder,
        files: [
          {
            destination: 'tokensMap.scss',
            format: 'scss/map-flat',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ],
      },
      ['less']: {
        transformGroup: TransformGroup.webLESS,
        buildPath: _outputFolder,
        files: [
          {
            destination: 'tokens.less',
            format: 'less/variables',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ],
      },
      ['js']: {
        transformGroup: TransformGroup.webJS,
        buildPath: _outputFolder,
        files: [
          {
            destination: 'tokens.js',
            format: 'javascript/es6',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ],
      },
      ['ts']: {
        transformGroup: TransformGroup.webJS,
        buildPath: _outputFolder,
        files: [
          {
            destination: 'tokens.ts',
            format: 'javascript/es6',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ],
      },
      ['json']: {
        transformGroup: TransformGroup.webJS,
        buildPath: _outputFolder,
        files: [
          {
            format: 'json/nested',
            destination: 'tokens.json',
          },
        ],
      },
    },
  }
}

/**
 * Creates and configures a StyleDictionary instance for the token-engine pipeline
 *
 * @remarks
 * Registers the custom transformers, transform groups, formatters and other tools
 * before extending StyleDictionary with the configuration
 *
 * @param tokensSource - Location of the file containing the raw tokens
 * @param outputFolder - Directory where to output the stylesheets and other exports
 * @param parser - Optional. Parser to transform the tokens before starting the pipeline
 */
export function buildStyleDictionary(
  tokensSource: string,
  outputFolder: string,
  parser?: (tokens: object) => DesignTokens
): StyleDictionary.Core {
  registerFormatters()
  registerTransformGroups()
  registerFileHeaders()
  const config = createStyleDictionaryConfig(tokensSource, outputFolder, parser)
  return StyleDictionary.extend(config)
}
