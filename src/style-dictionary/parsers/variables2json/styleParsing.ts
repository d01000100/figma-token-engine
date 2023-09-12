import { Effect } from "figma-js"
import { TokenType } from "../../types"
import { parseShadowValue } from "../figmaStylesParser"
import { ParsedVariable, ParsingResult, ShadowStyleVariable, TypographyStyleVariable, Variable } from "./types"
import { getRoute } from "./utils"

function parseTextCaseValue(value: string): string {
  const figma2css: Record<string, string> = {
    ['TITLE']: 'capitalize',
    ['UPPER']: 'uppercase',
    ['LOWER']: 'lowercase',
  }
  return figma2css[value] ?? 'none'
}

function parseSingleTypographyToken(
  variable: Variable,
  tokenType: TokenType
): ParsedVariable | null {
  /*
    {
      "name": "display/lg",
      "type": "typography",
      "isAlias": false,
      "value": {
        "fontSize": 80,
        "fontFamily": "DM Sans",
        "fontWeight": "Regular",
        "lineHeight": 120,
        "lineHeightUnit": "PIXELS",
        "letterSpacing": 0,
        "letterSpacingUnit": "PIXELS",
        "textCase": "ORIGINAL",
        "textDecoration": "NONE"
      }
    }
  */
  const typeValues = variable.value
  /* Some font properties have different names in CSS and in Figma Styles.
    This map translates from TokenTypeParsed properties to Figma Styles properties */
  const TokenTypeParsed2FigmaStyles: Record<string, string> = {
    [TokenType.textTransform]: 'textCase',
  }
  const typeProperty = TokenTypeParsed2FigmaStyles[tokenType] ?? tokenType
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let typeValue = (typeValues as any)[typeProperty]
  if (typeValue === undefined) {
    return null
  }
  if (tokenType === TokenType.textTransform) {
    typeValue = parseTextCaseValue(typeValue)
  }
  const route = getRoute(variable);
  return {
    type: tokenType,
    value: typeValue,
    route: [...route, tokenType]
  }
}

function parseTypographyStyle(variable: TypographyStyleVariable): ParsedVariable[] {
  /*
    {
      "name": "display/lg",
      "type": "typography",
      "isAlias": false,
      "value": {
        "fontSize": 80,
        "fontFamily": "DM Sans",
        "fontWeight": "Regular",
        "lineHeight": 120,
        "lineHeightUnit": "PIXELS",
        "letterSpacing": 0,
        "letterSpacingUnit": "PIXELS",
        "textCase": "ORIGINAL",
        "textDecoration": "NONE"
      }
    }
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
    .map(type => parseSingleTypographyToken(variable, type))
    .filter(Boolean) as ParsedVariable[]
}

function parseShadowStyle(variable: ShadowStyleVariable): ParsedVariable {
  const route = getRoute(variable);
  return {
    type: TokenType.boxShadow,
    value: variable.value.effects.map(
      (shadowValue) =>
        parseShadowValue(shadowValue as Effect & { spread?: number })
      ),
    route,
  }
}

function parseFigmaStyle(variable: Variable): ParsingResult {
  const { type } = variable

  switch (type) {
    case "typography":
      return parseTypographyStyle(variable)
    case "effect":
      return parseShadowStyle(variable)
    case "grid":
    default:
      return;
  }
}

export { parseFigmaStyle }