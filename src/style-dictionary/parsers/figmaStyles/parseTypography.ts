import { Text } from 'figma-js'
import { SimpleDesignToken, TokenType } from "../../types"
import { StyleNode } from "../types/figmaStyleType"
import { FIGMA_STYLES_NAME_DIVIDER } from '.'

function parseTextCaseValue(value: string): string {
  const figma2css: Record<string, string> = {
    ['TITLE']: 'capitalize',
    ['UPPER']: 'uppercase',
    ['LOWER']: 'lowercase',
  }
  return figma2css[value] ?? 'none'
}

function parseSingleTypographyToken(
  style: StyleNode,
  tokenType: TokenType
): SimpleDesignToken | null {
  const textNode = style as Text
  const typeStyle = textNode.style
  /* Some font properties have different names in CSS and in Figma Styles.
    This map translates from TokenTypeParsed properties to Figma Styles properties */
  const TokenTypeParsed2FigmaStyles: Record<string, string> = {
    [TokenType.lineHeight]: 'lineHeightPx',
    [TokenType.textTransform]: 'textCase',
  }
  const typeProperty = TokenTypeParsed2FigmaStyles[tokenType] ?? tokenType
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let typeValue = (typeStyle as any)[typeProperty]
  if (typeValue === undefined) {
    return null
  }
  if (tokenType === TokenType.textTransform) {
    typeValue = parseTextCaseValue(typeValue)
  }
  return {
    type: tokenType,
    value: typeValue,
    description: style.description
      ? `${style.description} - ${tokenType}`
      : undefined,
    name: `${style.name}${FIGMA_STYLES_NAME_DIVIDER}${tokenType}`,
  }
}

export function parseTypographyStyle(style: StyleNode): SimpleDesignToken[] {
  /*
    "fontFamily": "Roboto",
    "fontPostScriptName": null,
    "fontWeight": 300,
    "textCase": "TITLE",
    "textAutoResize": "WIDTH_AND_HEIGHT",
    "textDecoration": "UNDERLINE",
    "fontSize": 96,
    "textAlignHorizontal": "LEFT",
    "textAlignVertical": "TOP",
    "letterSpacing": -1.5,
    "lineHeightPx": 104,
    "lineHeightPercent": 92.44444274902344,
    "lineHeightPercentFontSize": 108.33333587646484,
    "lineHeightUnit": "PIXELS"
  */
  const typographyTypes = [
    TokenType.fontFamily,
    TokenType.fontSize,
    TokenType.fontWeight,
    TokenType.letterSpacing,
    TokenType.lineHeight,
    TokenType.textTransform,
  ]
  return typographyTypes
    .map(type => parseSingleTypographyToken(style, type))
    .filter(Boolean) as SimpleDesignToken[]
}