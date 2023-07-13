/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises as fs } from 'fs'
import path from 'path'
import { logError } from '../utils/logger'

export async function createDir(dir : string) {
  try {
    await fs.mkdir(dir, {recursive: true})
  } catch(error) {
      logError(`Couldn't create directory ${dir}`)
      logError(`${error}`)
  }
}

export async function writeToFile(outFile: string, data: any) {
  
  const completeOutLocation = path.join(process.cwd(),outFile)
  const completeOutDir = path.dirname(completeOutLocation);

  await createDir(completeOutDir);

  try {
    await fs.writeFile(outFile, JSON.stringify(data, null, 2))
  } catch (error) {
    if (error) {
      logError(`Couldn't save file at set directory. Tried to save in: ${completeOutLocation}`)
      logError(`${error}`)
      return;
    }
  }
}
