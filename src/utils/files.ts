import fs from 'fs'
import { logError } from './logger'

/**
 * Checks if `filePath` exists, if not throws an error with `errorMessage` or default message
 * @param filePath string. The file to check
 * @param errorMessage? string. Custom error message
 * @returns boolea. If the file exists
 */
export function fileExists(filePath: string, errorMessage?: string): boolean {
  const exists = fs.existsSync(filePath)
  if (exists) return true
  logError(errorMessage ?? `File ${filePath} does not exist`)
  return false
}

/**
 * Checks if a file is not empty. Throws an Error if it is with `errorMessage` or default message.
 * Assumes the file exists
 * @param filePath string. The file to check
 * @param errorMessage? string. Custom error message
 * @returns boolean. If the file is not empty.
 */
export function isFileNotEmpty(
  filePath: string,
  errorMessage?: string
): boolean {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    if (fileContents.length > 0) return true
    logError(errorMessage ?? `File ${filePath} is empty`)
  } catch (error) {
    logError(String(error))
  }
  return false
}
