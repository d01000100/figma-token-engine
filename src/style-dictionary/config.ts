import StyleDictionary, { Config, DesignTokens, Platform } from 'style-dictionary'
import { ParserOptions } from 'style-dictionary/types/Parser'
import { registerFileHeaders } from './file-headers'
import { registerFormatters } from './formatters'
import { registerTransformGroups } from './transform-groups'
import { FileHeader, Filter, TransformGroup } from './types'
import path from 'path'
import { logError } from '../utils/logger'
import { omit } from '../utils/utils'
import { registerFilters, registerTokensByColor, registerTokensByFont, registerTokensBySpacing, registerTokensByOthers } from './filters'

function readCustomConfig(file: string) {
  let sdConfig;
  try {
    sdConfig = require(path.resolve(process.cwd(), file));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e : any) {
    logError(`Couldn't read style dictionary configuration file at ${file}`)
    return;
  }

  StyleDictionary.extend(sdConfig)

  return sdConfig;
}

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

/**
 * Adds buildPath and fileHeader to a customPlatform, if it doesn't 
 * specify one
 * @param customPlatform - A user defined Platform
 * @returns The custom platform with buildPath and fileHeader added
 */
function configurePlatform(customPlatform: Platform, outputFolder?: string): Platform {
  
  const files = customPlatform.files?.map(file => {
    return {
      options: {
        fileHeader: FileHeader.generatedByTokenEngine,
        ...file.options
      },
      ...file
    }
  })
  return {
    buildPath: outputFolder,
    ...{
      ...customPlatform,
      files
    }
  }
}

/**
 * Carefully combines default and custom configuration for StyleDictionary, in order to
 * not lose configuration the FTE adds, unless explicitly overwritten by the user
 * 
 * @remarks
 * This function assumes the user has provided a customConfig. 
 * 
 * @param defaultConfig - The default configuration FTE uses for StyleDictionary.
 * Generated by `createStyleDictionaryConfig`
 * @param customConfig - The configuration a user has provided.
 * @returns The combined configuration
 */
function combineCustomConfig(defaultConfig: Config, customConfig: Config): Config {
  /** Custom configs that are not the fields that FTE sets on SD */
  const nonDefaultConfigs = omit(customConfig, "source", "parsers", "platforms")
  /** We take outputFolder from the FTE generated config */
  const outputFolder = defaultConfig.platforms.css.buildPath;
  const configuredPlatformsEntries = Object.entries(customConfig.platforms).map(
    ([name, platform]) => [name, configurePlatform(platform, outputFolder)]
  )
  const configuredPlatforms = Object.fromEntries(configuredPlatformsEntries);
  return {
    // User can add more token sources
    source: [...defaultConfig.source ?? [], ...customConfig.source ?? []],
    // User can add more parsers
    parsers: [...defaultConfig.parsers ?? [], ...customConfig.parsers ?? []],
    // The user can add more platforms
    platforms: {
      ...defaultConfig.platforms,
      ...configuredPlatforms
    },
    // All other fields are just added
    ...nonDefaultConfigs
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
  registerFilters()
  const defaultConfig = createStyleDictionaryConfig(tokensSource, outputFolder, parser)
  let config = defaultConfig;
  if (global.sdConfigFile) {
    const customConfig = readCustomConfig(global.sdConfigFile);
    config = combineCustomConfig(defaultConfig, customConfig)
  }
  return StyleDictionary.extend(config)
}
