import { getFigmaAPICredentials } from './credentials'
import { getFigmaFilePluginsData, getFigmaFileStylesData } from './services'
import { processFigmaAPIResponse } from './process'
import { writeFigmaAPITokensExport } from './storage'
import { FigmaAPICredentialsType } from './types'

/**
 * Start Figma API with Tokens Studio
 */
export async function getTokensStudio(tokensExportFile: string): Promise<boolean> {
  // Get ENV variables for the Figma API
  const credentials: FigmaAPICredentialsType = getFigmaAPICredentials()

  // Call the Figma API fetching File Data
  const figmaApiResponse = await getFigmaFilePluginsData(credentials)

  if(!figmaApiResponse) {
    return false; // There's no tokens detected on the plugin data
  }

  // Transform the API Response into the same format as the manual export
  const exportedTokens = processFigmaAPIResponse(figmaApiResponse)

  // Save exported tokens into destination file
  await writeFigmaAPITokensExport(tokensExportFile, exportedTokens)

  return true;
}

/**
 * Start Figma API with Figma Styles
 */
export async function getFigmaStyles(tokensExportFile: string): Promise<boolean> {
  // Get ENV variables for the Figma API
  const credentials: FigmaAPICredentialsType = getFigmaAPICredentials()

  // Call the Figma API fetching File Data
  const figmaApiResponse = await getFigmaFileStylesData(credentials)

  if(!figmaApiResponse) {
    // if no styels on file, we end early
    return false;
  }

  // Save exported tokens into destination file
  await writeFigmaAPITokensExport(tokensExportFile, figmaApiResponse)

  return true;
}
