import { Config } from 'style-dictionary'
import { FileHeader, Filter, Format, TransformGroup } from '../types'
import { parseTokensStudio } from '../parsers/tokensStudioParser'
import { ParserOptions } from 'style-dictionary/types/Parser'

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
 */
export default function createStyleDictionaryConfig(
  tokensSource: string,
  outputFolder: string
): Config {
  const _outputFolder = outputFolder.startsWith('/')
    ? outputFolder
    : `${outputFolder}/`

  return {
    source: [tokensSource],
    parsers: [
      {
        pattern: new RegExp(tokensSource),
        parse: ({ contents }: ParserOptions) => {
          const compiledTokens = JSON.parse(contents)
          return parseTokensStudio(compiledTokens)
        },
      },
    ],
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
            format: Format.cssAutocomplete,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine
            }
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
      ['compose']: {
        transformGroup: TransformGroup.compose,
        buildPath: _outputFolder,        
        files: [
          {
            packageName: 'com.example.tokens',
            className: 'Tokens',
            format: 'compose/object',
            destination: 'tokens.kt',
            filter: Filter.compose
          }
        ]
      },
      ['android/resources']: {
        transformGroup: TransformGroup.androidResources,
        buildPath: _outputFolder,        
        files: [
          {
            format: 'android/resources',
            destination: 'android_resources.xml',
            filter: Filter.androidResources,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
          {
            format: 'android/resources',
            destination: 'colors.xml',
            filter: Filter.color,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
          {
            format: 'android/resources',
            destination: 'fonts.xml',
            filter: Filter.font,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
          {
            format: 'android/resources',
            destination: 'spacing.xml',
            filter: Filter.spacing,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
          {
            format: 'android/resources',
            destination: 'others.xml',
            filter: Filter.others,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          }
        ]
      },
      ['ios-swift/class.swift']: {
        transformGroup: TransformGroup.swift,
        buildPath: _outputFolder,        
        files: [
          {
            format: 'ios-swift/class.swift',
            destination: 'tokens.swift',
            filter: Filter.swift,
            className: 'Tokens',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
              outputReferences: true,
            },
          }
        ]
      }
    }
  }
}
