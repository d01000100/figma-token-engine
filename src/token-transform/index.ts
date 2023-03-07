import { execSync } from 'child_process'
import {
  logEvent,
  logExternalLibrary,
  logSuccessElement,
} from '../utils/logger'
import { TokensStudioArgs } from '../types'
import { fileExists } from '../utils/files'
import * as tmp from 'tmp'

/**
 * Runs the `token-transform` CLI to transform the tokens on `inputFile`
 * @param param0 : Pick<TokensStudioArgs, 'inputFile' | 'sets' | 'excludes'>
 *  - inputFile: File to transform
 *  - transformerOutput: Optional. The file in which to print the result. If undefined, will create a tmp file.
 *  - sets: Optional. The token sets from the FigmaToken data consider in the transformation. If undefined, uses all sets.
 *  - excludes: Optional. The tokens sets from the FigmaToken data to export.
 * @returns string. Name of the file where the tokens are written.
 * @throws Error if the `inputFile` does not exist
 */
export async function start({
  inputFile,
  sets,
  transformerOutput,
  excludes,
}: Pick<
  TokensStudioArgs,
  'inputFile' | 'sets' | 'excludes' | 'transformerOutput'
>): Promise<string | undefined> {
  logEvent('Token Transform')

  if (!fileExists(inputFile)) {
    return undefined
  }

  let resultFile = transformerOutput
  if (transformerOutput === undefined) {
    /* Creating temporal file to write the tokens to */
    const tmpobj = tmp.fileSync()
    resultFile = tmpobj.name
  }

  // `token-transformer` is only exported with a CLI, so we need to execute it from the "terminal"
  const transformerLog = execSync(
    `token-transformer ${inputFile} ${resultFile} ${sets ?? ''} ${
      excludes ?? ''
    } --expandTypography=true`
  )
  logExternalLibrary(transformerLog.toString().trim())

  if (transformerLog.toString().includes('done')) {
    logSuccessElement('Done using token-transform')
  }

  return resultFile
}
