import { Rectangle } from "figma-js";
import { ShadowEffect } from ".";
import { SimpleDesignToken, TokenType } from "../../../types";
import { StyleNode } from "../../types/figmaStyleType";
import { FIGMA_STYLES_NAME_DIVIDER } from "..";
import { rgbaToHex } from "../../utils";
import { camelCase } from "lodash"

function getShadowValueByType(
  effect: ShadowEffect,
  type: TokenType
): SimpleDesignToken["value"] {
  switch (type) {
    case TokenType.shadowBlur:
      return effect.radius;
    case TokenType.shadowOffsetX:
      return effect.offset?.x ?? 0;
    case TokenType.shadowOffsetY:
      return effect.offset?.y ?? 0;
    case TokenType.shadowSpread:
      return effect.spread ?? 0;
    case TokenType.color:
      return rgbaToHex(effect.color ?? { r: 0, g: 0, b: 0, a: 0 })
    case TokenType.shadowType:
      return camelCase(effect.type)
    default:
      // here be dragons
      return "";
  }
}

function getShadowTokenByType(
  effect: ShadowEffect,
  tokenType: TokenType,
  name?: string,
  description?: string,
  index?: number
): SimpleDesignToken {
  const value: string | number = getShadowValueByType(effect, tokenType)
  let fullName = name;
  let fullDescription = description;
  if (index === undefined) {
    // there's only one effect building this shadow
    fullName += `${FIGMA_STYLES_NAME_DIVIDER}${tokenType}`;
    fullDescription += ` - ${tokenType}`
  } else {
    // there's a lot of effects building this shadow
    fullName += `${FIGMA_STYLES_NAME_DIVIDER}${index}${FIGMA_STYLES_NAME_DIVIDER}${tokenType}`;
    fullDescription += ` - ${index}th ${tokenType}`
  }
  return {
    value,
    description: fullDescription,
    name: fullName,
    type: tokenType
  }
}

function parseShadowEffect(
  effect: ShadowEffect,
  name?: string,
  description?: string,
  index?: number
): SimpleDesignToken[] {
  const shadowTypes = [
    TokenType.shadowBlur,
    TokenType.shadowOffsetX,
    TokenType.shadowOffsetY,
    TokenType.shadowSpread,
    TokenType.shadowType,
    TokenType.color
  ]
  return shadowTypes.map(type => (
    getShadowTokenByType(effect, type, name, description, index))
  )
}

export function parseExpandedShadowStyle(style: StyleNode): SimpleDesignToken[] {
  const effects = (style as Rectangle).effects
  // for some reason, there's no shadow data
  if (effects.length === 0) return []

  if (effects.length > 1) {
    // this shadow effect is made up of several shadow values
    const multipleShadowsTokens: SimpleDesignToken[][] = effects.map((effect, index) =>
    (
      parseShadowEffect(effect, style.name, style.description, index)
    ))
    return multipleShadowsTokens.flat()
  }

  // this shadow effect is just one shadow
  return parseShadowEffect(effects[0], style.name, style.description)
}