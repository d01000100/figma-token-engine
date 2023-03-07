/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs'
import path from 'path'

import { logEvent, logError, logSuccessElement } from '../utils/logger'

export function writeFigmaAPITokensExport(outFile: string, data: any) {
  logEvent('Figma API - Write Figma API Tokens Export')

  const completeOutLocation = path.join(process.cwd(), outFile)

  const completeOutDir = path.dirname(completeOutLocation);

  try {
    fs.mkdirSync(completeOutDir, {recursive: true})
    fs.writeFileSync(outFile, JSON.stringify(data, null, 2))
    logSuccessElement(`Saved tokens at ${completeOutLocation}`)
  } catch (error) {
    logError(
      `Couldn't save file at set directory. Tried to save in: ${completeOutLocation}` +
        error
    )
  }
}
