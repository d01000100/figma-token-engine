import { logEvent, logError, logSuccessElement } from '../utils/logger'

import { FigmaAPICredentialsType } from './types'

const LOGGER_MESSAGES = {
  API_KEY: {
    error: 'The Figma Personal Access Token is missing, check your .env file',
    success: 'FIGMA_PERSONAL_ACCESS_TOKEN in .env',
  },
  FILE_URL: {
    error: 'The Figma File URL is missing, check your .env file',
    success: 'FIGMA_FILE_URL in .env',
  },
}

/**
 * Get Figma API ENV Credentials
 */
export function getFigmaAPICredentials(): FigmaAPICredentialsType {
  logEvent('Figma API - Get Figma API Credentials')

  const FIGMA_PERSONAL_ACCESS_TOKEN =
    process.env.FIGMA_PERSONAL_ACCESS_TOKEN || ''

  const FIGMA_FILE_URL = process.env.FIGMA_FILE_URL || ''

  // Check FIGMA_PERSONAL_ACCESS_TOKEN
  !FIGMA_PERSONAL_ACCESS_TOKEN
    ? logError(LOGGER_MESSAGES.API_KEY.error)
    : logSuccessElement(LOGGER_MESSAGES.API_KEY.success)

  // Check FIGMA_FILE_URL
  !FIGMA_FILE_URL
    ? logError(LOGGER_MESSAGES.FILE_URL.error)
    : logSuccessElement(LOGGER_MESSAGES.FILE_URL.success)

  const FIGMA_FILE_ID = FIGMA_FILE_URL.includes('https://www.figma.com/file/')
    ? FIGMA_FILE_URL.replace('https://www.figma.com/file/', '').split('/')[0]
    : FIGMA_FILE_URL

  return { FIGMA_PERSONAL_ACCESS_TOKEN, FIGMA_FILE_ID }
}
