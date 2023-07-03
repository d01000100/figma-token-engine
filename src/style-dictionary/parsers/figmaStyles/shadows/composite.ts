import { Rectangle } from "figma-js"
import { ShadowEffect } from "."
import { ShadowDesignToken, ShadowTokenSingleValue, ShadowType } from "../../../types"
import { StyleNode } from "../../types/figmaStyleType"
import { rgbaToHex } from "../../utils"

function parseShadowValue(
  shadow: ShadowEffect
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
    color: rgbaToHex(shadow.color ?? { r: 0, g: 0, b: 0, a: 0 }),
    type: figmaShadowTypeToParsed[shadow.type as string],
    x: shadow.offset?.x ?? 0,
    y: shadow.offset?.y ?? 0,
    blur: shadow.radius,
    spread: shadow.spread ?? 0,
  }
}

export function parseCompositeShadowStyle(style: StyleNode): ShadowDesignToken {
  const styleNode = style as Rectangle
  return {
    type: 'boxShadow',
    value: styleNode.effects.map(parseShadowValue),
    name: style.name,
  }
}