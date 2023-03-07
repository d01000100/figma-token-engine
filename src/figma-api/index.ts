import { getFigmaAPICredentials } from './credentials'
import { getFigmaFilePluginsData, getFigmaFileStylesData } from './services'
import { processFigmaAPIResponse } from './process'
import { writeFigmaAPITokensExport } from './storage'
import { FigmaAPICredentialsType } from './types'

/**
 * Start Figma API with Tokens Studio
 */
export async function getTokensStudio(tokensExportFile: string): Promise<void> {
  // Get ENV variables for the Figma API
  const credentials: FigmaAPICredentialsType = getFigmaAPICredentials()

  // Call the Figma API fetching File Data
  const figmaApiResponse = await getFigmaFilePluginsData(credentials)

  // Transform the API Response into the same format as the manual export
  const exportedTokens = processFigmaAPIResponse(figmaApiResponse)

  // Save exported tokens into destination file
  writeFigmaAPITokensExport(tokensExportFile, exportedTokens)
}

/**
 * Start Figma API with Figma Styles
 */
export async function getFigmaStyles(tokensExportFile: string): Promise<void> {
  // Get ENV variables for the Figma API
  const credentials: FigmaAPICredentialsType = getFigmaAPICredentials()

  // Call the Figma API fetching File Data
  const figmaApiResponse = await getFigmaFileStylesData(credentials)

  // Save exported tokens into destination file
  writeFigmaAPITokensExport(tokensExportFile, figmaApiResponse)
}
