/* eslint-disable @typescript-eslint/no-explicit-any */
import { logEvent, logSuccessElement } from '../utils/logger'
import { writeToFile } from '../utils/storage'

export async function writeFigmaAPITokensExport(outFile: string, data: any) {
  logEvent('Figma API - Write Figma API Tokens Export')

  await writeToFile(outFile, data);
  logSuccessElement(`Saved tokens at ${outFile}`)
}
