import { Rectangle, Color, Paint, Effect, Text } from 'figma-js'
import { addTokenIntoRoute, rgbaToHex_1 } from './utils'
import { StyleNode } from './types/figmaStyleType'
import {
  SimpleDesignToken,
  DesignTokens,
  TokenType,
  DesignToken,
  ShadowDesignToken,
  ShadowTokenSingleValue,
  ShadowType,
} from '../types'
import { logWarning } from '../../utils/logger'

const NAME_DIVIDER = '/'

function parseSolidColor(color: Color): SimpleDesignToken {
  return {
    value: rgbaToHex_1(color),
    type: TokenType.color,
  }
}

function parseGradientLinear(color: Paint): SimpleDesignToken | null {
  /*
  {
    "blendMode": "NORMAL",
    "type": "GRADIENT_LINEAR",
    "gradientHandlePositions": [
      {
        "x": 0.5,
        "y": 3.0616171314629196e-17
      },
      {
        "x": 0.5,
        "y": 1
      },
      {
        "x": 0,
        "y": 6.123234262925839e-17
      }
    ],
    "gradientStops": [
      {
        "color": {
          "r": 0.6078431606292725,
          "g": 0.5647059082984924,
          "b": 0.9529411792755127,
          "a": 0.7900000214576721
        },
        "position": 0
      },
      {
        "color": {
          "r": 0.7686274647712708,
          "g": 0.7686274647712708,
          "b": 0.7686274647712708,
          "a": 0
        },
        "position": 1
      }
    ]
  }
  linear-gradient(180deg, rgba(155, 144, 243, 0.79) 0%, rgba(196, 196, 196, 0) 100%);
  linear-gradient(254.5deg, #C4C4C4 15.15%, rgba(255, 0, 0, 0.319437) 35.3%, rgba(196, 196, 196, 0) 53.96%)
  */
  if (
    color.gradientHandlePositions === undefined ||
    color.gradientStops === undefined
  ) {
    logWarning(`Gradient color token without enough data`)
    return null
  }
  const diffVector = {
    x: color.gradientHandlePositions[1].x - color.gradientHandlePositions[0].x,
    y: color.gradientHandlePositions[1].y - color.gradientHandlePositions[0].y,
  }
  const theta = (
    (180 * Math.atan2(diffVector.y, diffVector.x)) / Math.PI +
    90
  ).toFixed(2)
  /* TODO: Consider the overall geometry of the handle positions in the coordinate space
    to correctly transform the percentage of every step.
    This only works for gradients that go from one end of the space to another */
  const colorSteps = color.gradientStops
    .map(step => {
      return `${rgbaToHex_1(step.color)} ${(step.position * 100).toFixed(2)}%`
    })
    .join(', ')
  return {
    value: `linear-gradient(${theta}deg, ${colorSteps})`,
    type: TokenType.gradient,
  }
}

function parseColorStyle(style: StyleNode): SimpleDesignToken | null {
  /* Color styles are codes as rectangles in figma */
  /* They look like
    {
      "id": "4843:5976",
      "name": "base/color/yellow200",
      "type": "RECTANGLE",
      ...
      "fills": [
        {
          "blendMode": "NORMAL",
          "type": "SOLID",
          "color": {
            "r": 0.772549033164978,
            "g": 0.6392157077789307,
            "b": 0.239215686917305,
            "a": 1
          }
        }
      ],
      "style_type": "FILL"
    }
  */
  const colorNode = style as Rectangle
  const color = colorNode.fills[0]
  switch (color.type) {
    case 'SOLID':
      if (color.color) {
        return parseSolidColor(color.color)
      }
      break
    case 'GRADIENT_LINEAR':
      return parseGradientLinear(color)
    case 'GRADIENT_ANGULAR':
    case 'GRADIENT_DIAMOND':
    case 'GRADIENT_RADIAL':
    default:
      logWarning(`Unsopported color type ${color.type} on token ${style.name}`)
  }
  return null
}

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
    name: `${style.name}${NAME_DIVIDER}${tokenType}`,
  }
}

function parseTypographyStyle(style: StyleNode): SimpleDesignToken[] {
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
    color: rgbaToHex_1(shadow.color ?? { r: 0, g: 0, b: 0, a: 0 }),
    type: figmaShadowTypeToParsed[shadow.type as string],
    x: shadow.offset?.x ?? 0,
    y: shadow.offset?.y ?? 0,
    blur: shadow.radius,
    spread: shadow.spread ?? 0,
  }
}

function parseShadowStyle(style: StyleNode): ShadowDesignToken {
  const styleNode = style as Rectangle
  return {
    type: 'boxShadow',
    value: styleNode.effects.map(parseShadowValue),
    name: style.name,
  }
}

function buildTokenGroup(tokens: DesignToken[]): DesignTokens {
  return tokens.reduce((tokenGroup, token) => {
    const route = token.name?.split(NAME_DIVIDER) ?? []
    return addTokenIntoRoute(tokenGroup, route, token)
  }, {} as DesignTokens)
}

/**
 * Parses a list of StyleNodes, read from Figma, into DesignTokens
 * @param styles - List of Figma Styles
 * @returns A multilevel object of DesignTokens
 */
function parseFigmaStyles(styles: StyleNode[]): DesignTokens {
  const parsedStyles = styles
    .map(style => {
      let parsedToken: DesignToken | null
      switch (style.style_type) {
        case 'FILL':
          parsedToken = parseColorStyle(style)
          break
        case 'EFFECT':
          parsedToken = parseShadowStyle(style)
          break
        default:
          return null
      }
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
  return buildTokenGroup([...parsedStyles, ...typographyStyles])
}

export { parseFigmaStyles, parseShadowValue }