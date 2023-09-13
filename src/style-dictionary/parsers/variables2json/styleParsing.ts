import { Effect } from "figma-js"
import { ShadowTokenSingleValue, ShadowType, TokenType } from "../../types"
import { ParsedVariable, ParsingResult, ShadowStyleVariable, TypographyStyleVariable, Variable } from "./types"
import { getRoute } from "./utils"
import { rgbaToHex_255 } from "../utils"

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


function parseShadowValue(
  shadow: Effect & { spread?: number }
): ShadowTokenSingleValue {
  /* {
        "type": "DROP_SHADOW",
        "visible": true,
        "color": {
          "r": 0.7411764860153198,
          "g": 0.7411764860153198,
          "b": 0.7411764860153198,
          "a": 1
        },
        "blendMode": "NORMAL",
        "offset": {
          "x": 0,
          "y": 2
        },
        "radius": 10,
        "spread": 2,
        "showShadowBehindNode": true
      }
      */
  const figmaShadowTypeToParsed: Record<string, ShadowType> = {
    ['DROP_SHADOW']: ShadowType.dropShadow,
    ['INNER_SHADOW']: ShadowType.innerShadow,
  }

  return {
    color: rgbaToHex_255(shadow.color ?? { r: 0, g: 0, b: 0, a: 0 }),
    type: figmaShadowTypeToParsed[shadow.type as string],
    x: shadow.offset?.x ?? 0,
    y: shadow.offset?.y ?? 0,
    blur: shadow.radius,
    spread: shadow.spread ?? 0,
  }
}

function parseShadowStyle(variable: ShadowStyleVariable): ParsedVariable {
  const route = getRoute(variable);
  return {
    type: TokenType.boxShadow,
    value: variable.value.effects.map(
      (shadowValue) => {
        try {
          return parseShadowValue(shadowValue as Effect & { spread?: number })
        } catch (error) {
          console.log({variable, shadowValue})
          throw error;
        }
      }
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