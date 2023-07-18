import { Color, Paint, Rectangle } from "figma-js"
import { SimpleDesignToken, TokenType } from "../../types"
import { rgbaToHex } from "../utils"
import { logWarning } from "../../../utils/logger"
import { StyleNode } from "../types/figmaStyleType"

function parseSolidColor(color: Color): SimpleDesignToken {
  return {
    value: rgbaToHex(color),
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
      return `${rgbaToHex(step.color)} ${(step.position * 100).toFixed(2)}%`
    })
    .join(', ')
  return {
    value: `linear-gradient(${theta}deg, ${colorSteps})`,
    type: TokenType.gradient,
  }
}

export function parseColorStyle(style: StyleNode): SimpleDesignToken | null {
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