import type { Node, StyleType } from 'figma-js'

/**
 * Object of Figma Nodes, with keys as their id's
 */
export type NodesDataObj = {
  readonly [key: string]: { document: Node } | null
}

/**
 * Extension of a Figma Node with a style type and description added
 */
export type StyleNode = Node & {
  style_type: StyleType
  description?: string
}

/**
 * Record of StyleNodes with their id's as values
 */
export type StyleNodesDataObj = {
  readonly [key: string]: StyleNode
}
