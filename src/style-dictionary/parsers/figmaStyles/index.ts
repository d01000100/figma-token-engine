import { addTokenIntoRoute } from '../utils'
import { StyleNode } from '../types/figmaStyleType'
import {
  SimpleDesignToken,
  DesignTokens,
  DesignToken,
} from '../../types'
import { parseColorStyle } from './parseColors'
import { parseTypographyStyle } from './parseTypography'
import { parseShadowStyle } from './shadows'

export const FIGMA_STYLES_NAME_DIVIDER = '/'

function buildTokenGroup(tokens: DesignToken[]): DesignTokens {
  return tokens.reduce((tokenGroup, token) => {
    const route = token.name?.split(FIGMA_STYLES_NAME_DIVIDER) ?? []
    return addTokenIntoRoute(tokenGroup, route, token)
  }, {} as DesignTokens)
}

/**
 * Parses a list of StyleNodes, read from Figma, into DesignTokens
 * @param styles - List of Figma Styles
 * @returns A multilevel object of DesignTokens
 */
export function parseFigmaStyles(styles: StyleNode[]): DesignTokens {
  const colorStyles = styles
    .filter(style => style.style_type === 'FILL')
    .map(style => {
      const parsedToken = parseColorStyle(style)
      if (parsedToken) {
        parsedToken.description = style.description
        parsedToken.name = style.name
      }
      return parsedToken
    })
    .filter(Boolean) as SimpleDesignToken[] // Return only "truthy" values
  const typographyStyles = styles
    .filter(style => style.style_type === 'TEXT')
    .map(parseTypographyStyle)
    .flat()
  const shadowStyles = styles
    .filter(style => style.style_type === 'EFFECT')
    .map(parseShadowStyle)
    .flat()
  return buildTokenGroup([...colorStyles, ...typographyStyles, ...shadowStyles])
}
