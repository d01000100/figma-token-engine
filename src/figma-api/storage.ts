/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs'
import path from 'path'

import { logEvent, logError, logSuccessElement } from '../utils/logger'

export function writeFigmaAPITokensExport(outDir: string, data: any) {
  logEvent('Figma API - Write Figma API Tokens Export')

  const completeOutDir = path.join(process.cwd(), outDir)

  try {
    fs.writeFileSync(outDir, JSON.stringify(data, null, 2))
    logSuccessElement(`Saved tokens at ${completeOutDir}`)
  } catch (error) {
    logError(
      `Couldn't save file at set directory. Tried to save in: ${completeOutDir}` +
        error
    )
  }
}
