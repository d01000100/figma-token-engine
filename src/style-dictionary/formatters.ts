import StyleDictionary, { Formatter, formatHelpers } from 'style-dictionary'
import { TransformedToken } from 'style-dictionary'
import { FormatterArguments } from 'style-dictionary/types/Format'
import { PlatformsType } from '../types'
import { formatJSON } from '../utils/json-formatter'
import { DesignToken, Format } from './types'
import { paramCase } from 'change-case'

/**
 * Compares two design tokens according to the alphabetical order of their `path`s
 * @param a TransformedToken
 * @param b TransformedToken
 * @returns -1 | 0 1
 */
function compareTokens(a: TransformedToken, b: TransformedToken): -1 | 0 | 1 {
  const pathA = a.path.join('_').toUpperCase()
  const pathB = b.path.join('_').toUpperCase()
  if (pathA < pathB) {
    return -1
  }

  if (pathA > pathB) {
    return 1
  }

  return 0
}

/**
 * Constructs a description string from a design token
 * @param token TransformedToken
 * @returns string
 */
function tokenDescription(token: TransformedToken): string {
  const originalToken = token.original as DesignToken
  const description = originalToken.description
    ? `${originalToken.description}\n`
    : ''
  const categoryMessage = token.attributes?.category
    ? `\nUnder ${token.attributes.category} category.`
    : ''
  return `${description}Value: ${token.value}${categoryMessage}`
}

/**
 * Generates a css auto-complete configuration file content from all the tokens
 * @param param0 FormatterArguments. https://amzn.github.io/style-dictionary/#/formats?id=formatter
 * @returns The contesnts of the auto-complete configuration file.
 */
function cssAutocompleteFormatter({ dictionary }: FormatterArguments): string {
  const autocomplete: Record<
    string,
    { prefix: string; body: string[]; description: string }
  > = {}
  const tokens = dictionary.allTokens.sort(compareTokens)
  tokens.forEach(token => {
    let description = tokenDescription(token)
    description = description.replace(/\n/g, '\\n')
    autocomplete[`--${token.name}`] = {
      prefix: `--${token.name}`,
      body: [`var(--${token.name})`],
      description,
    }
  })
  return formatJSON(autocomplete)
}

const cssThemed : Formatter = (args) => {
  const { dictionary, options, platform, file } = args;
  const mode = options.mode ? paramCase(options.mode) : undefined;
  let content = '';
  // 1. Add the generic file header
  content += formatHelpers.fileHeader({file});
  // 2. Add the selector
  if (mode) {  
    content += `:root .${mode},
:root [data-theme="${mode}"] {`
  } else {
    // Just in case...
    content += `:root {`
  }
  content += `\n`;
  // 3. Print the tokens transformed to css custom variables
  content += formatHelpers.formattedVariables({
    format: 'css',
    dictionary,
    outputReferences: options.outputReferences
  })
  // x. Finish the selector
  content += `\n}`
  return content;
}

/* Register custom formats to StyleDictionary configuration
 * Before creating a custom format, remember to check if any of the pre-defined format fit your need
 * https://amzn.github.io/style-dictionary/#/formats?id=pre-defined-formats
 * Also remember to use the custom format helpers StyleDictionary provides in your custom formats
 * https://amzn.github.io/style-dictionary/#/formats?id=custom-format-helpers */
export function registerFormatters(): void {
  StyleDictionary.registerFormat({
    name: Format.cssAutocomplete,
    formatter: cssAutocompleteFormatter,
  })


  StyleDictionary.registerFormat({
    name: Format.cssThemed,
    formatter: cssThemed,
  })
}
