import { Effect } from "figma-js"
import { StyleNode } from "../../types/figmaStyleType"
import { ShadowDesignToken, SimpleDesignToken } from "../../../types"
import { parseCompositeShadowStyle } from "./composite"
import { parseExpandedShadowStyle } from "./expanded"

export type ShadowEffect = Effect & { spread?: number }

export function parseShadowStyle(style: StyleNode): ShadowDesignToken | SimpleDesignToken[] {
  if (global.expandShadows) {
    const expanded = parseExpandedShadowStyle(style)
    return expanded;
  } else {
    return parseCompositeShadowStyle(style)
  }
}