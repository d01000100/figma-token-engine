/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs'
import path from 'path'

import { logEvent, logError, logSuccessElement } from '../utils/logger'
import { VariableAPIResponse } from './types'

/**
 * This function is for testing. It should be replaced with an actual call to the API
 * @param inFile 
 * @returns 
 */
export function readVariablesFromFile(inFile : string) : VariableAPIResponse | undefined {
  logEvent('Figma Variables - Reading from file')
  
  const completeInLocation = path.join(process.cwd(), inFile)
  
  try {
    const apiResponse = JSON.parse(fs.readFileSync(completeInLocation).toLocaleString())
    logSuccessElement(`Tokens read!`)
    return apiResponse;
  } catch (error) {
    logError(
      `Couldn't read and parse file. Tried to read from: ${completeInLocation}` +
        error
    )
  }
}