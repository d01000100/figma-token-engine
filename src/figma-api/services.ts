import { Client } from 'figma-js'
import axios from 'axios'

import {
  logEvent,
  logError,
  logSuccessElement,
  logLoaderPlanet,
  logWarning,
} from '../utils/logger'

import { FigmaAPICredentialsType } from './types'

import type {
  StyleNode,
  StyleNodesDataObj,
} from '../style-dictionary/parsers/types/figmaStyleType'

/**
 * Get Data from the Figma File
 */
export async function getFigmaFilePluginsData({
  FIGMA_PERSONAL_ACCESS_TOKEN,
  FIGMA_FILE_ID,
}: FigmaAPICredentialsType) {
  logEvent('Figma API - Get Figma File Plugin Data')

  const { start, stop } = logLoaderPlanet('Fetch Figma API')

  start()

  try {
    const { data } = await axios(
      `https://api.figma.com/v1/files/${FIGMA_FILE_ID}?plugin_data=shared&depth=1`,
      {
        headers: {
          'X-Figma-Token': FIGMA_PERSONAL_ACCESS_TOKEN,
        },
      }
    )
    stop()

    logSuccessElement('Figma API responded with success')
    
    if (data?.document?.sharedPluginData?.tokens) {
      logSuccessElement('Plugin data present in API response')
    } else {
      logWarning(`No tokens found on plugin data on Figma file ${FIGMA_FILE_ID}`)
      stop();
      return;
    }

    return data.document.sharedPluginData.tokens
  } catch (error) {
    stop()
    logError(String(error))
  }
}

/**
 * Get Data from the Figma File
 */
export async function getFigmaFileStylesData({
  FIGMA_PERSONAL_ACCESS_TOKEN,
  FIGMA_FILE_ID,
}: FigmaAPICredentialsType) {
  logEvent('Figma API - Get Figma File Plugin Data')

  const { start, stop } = logLoaderPlanet('Fetch Figma API')

  start()

  const client = Client({
    personalAccessToken: FIGMA_PERSONAL_ACCESS_TOKEN,
  })

  try {
    const stylesResponse = await client.fileStyles(FIGMA_FILE_ID)
    const stylesMeta = stylesResponse.data.meta.styles

    if (!stylesMeta?.length) {
      logWarning(`There are no published styles defined in the Figma File ${FIGMA_FILE_ID}`)
      stop();
      return;
    }

    const styleNodeIDs = stylesMeta.map(
      (styleMeta: { node_id: string }) => styleMeta.node_id
    )

    const nodesResponse = await client.fileNodes(FIGMA_FILE_ID, {
      ids: styleNodeIDs,
    })

    const styleDataObj = nodesResponse.data.nodes

    const styleDataObjTyped = stylesMeta.reduce(
      (
        styleNodeObj: StyleNodesDataObj,
        styleMeta: { node_id: string; style_type: string; description: string }
      ) => {
        const styleNodeId = styleMeta.node_id
        const styleData = {
          ...styleDataObj[styleNodeId]?.document,
          style_type: styleMeta.style_type,
          description: styleMeta.description,
        } as StyleNode
        return {
          ...styleNodeObj,
          [styleNodeId]: styleData,
        }
      },
      {}
    )
    stop()
    return Object.values(styleDataObjTyped)
  } catch (error) {
    stop()
    logError(String(error))
  }
}
