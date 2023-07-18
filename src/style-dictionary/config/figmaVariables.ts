import { Config, File } from 'style-dictionary'
import { DesignToken, FileHeader, Filter, Format, TransformGroup } from '../types'

/**
 * Builds file configs for web platforms according to how many modes
 * were detected on the Variables
 * 
 * @remarks
 * - The modes are stored on global.modes
 * - If there are no modes, the same `singleFileConfig` will be returned
 * - A directory will be added to each destination with the name of the mode
 * 
 * @param singeFileConfig | Config that will be used as a base to create
 * the config array
 */
function buildWebFileConfigsFromModes(singeFileConfig: File): File[] {
  const modes = global.modes;

  // If there are no modes, we return the same File config
  if (!modes) {
    return [{
      ...singeFileConfig,
      destination: `web/${singeFileConfig.destination}`
    }]
  }

  return modes.map((modeName) => {
    return {
      ...singeFileConfig,
      filter: (token) => {
        const originalToken = token.original as DesignToken;
        return originalToken.mode === modeName;
      },
      destination: `web/${modeName}/${singeFileConfig.destination}`,
      options: {
        ...singeFileConfig.options,
        mode: modeName
      }
    }
  })
}

/**
 * Creates the necessary config of StyleDictioanry for the token-engine pipeline
 * for tokens read from Figma Variables
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
export default function createStyleDictionaryConfig(
  tokensSource: string,
  outputFolder: string
): Config {
  const _outputFolder = outputFolder.startsWith('/')
    ? outputFolder
    : `${outputFolder}/`

  return {
    source: [tokensSource],
    // TODO: Add figmaVariablesParser as parser
    platforms: {
      ['css']: {
        transformGroup: TransformGroup.webCSS,
        buildPath: _outputFolder,
        files: buildWebFileConfigsFromModes(
          {
            destination: 'tokens.css',
            format: Format.cssThemed,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ),
      },
      ['cssAutocomplete']: {
        transformGroup: TransformGroup.webCSS,
        buildPath: _outputFolder,
        files: buildWebFileConfigsFromModes(
          {
            destination: 'tokens-autocomplete-config.json',
            format: Format.cssAutocomplete,
            options: {
              fileHeader: FileHeader.generatedByTokenEngine
            }
          },
        ),
      },
      ['scss']: {
        transformGroup: TransformGroup.webSCSS,
        buildPath: _outputFolder,
        files: buildWebFileConfigsFromModes(
          {
            destination: 'tokens.scss',
            format: 'scss/variables',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ),
      },
      ['scssMap']: {
        transformGroup: TransformGroup.webSCSS,
        buildPath: _outputFolder,
        files: buildWebFileConfigsFromModes(
          {
            destination: 'tokensMap.scss',
            format: 'scss/map-flat',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ),
      },
      ['less']: {
        transformGroup: TransformGroup.webLESS,
        buildPath: _outputFolder,
        files: buildWebFileConfigsFromModes(
          {
            destination: 'tokens.less',
            format: 'less/variables',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ),
      },
      ['js']: {
        transformGroup: TransformGroup.webJS,
        buildPath: _outputFolder,
        files: buildWebFileConfigsFromModes(
          {
            destination: 'tokens.js',
            format: 'javascript/es6',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ),
      },
      ['ts']: {
        transformGroup: TransformGroup.webJS,
        buildPath: _outputFolder,
        files: buildWebFileConfigsFromModes(
          {
            destination: 'tokens.ts',
            format: 'javascript/es6',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
          },
        ),
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
