import { readFile, readFileSync } from "fs";
import { getTokensStudio } from "../figma-api";
import { ExportType } from "../style-dictionary/parsers/variables2json/types";
import { TokensStudioArgs, Variables2JsonArgs } from "../types";
import { logError, logEvent } from "../utils/logger";
import { writeFigmaAPITokensExport } from "../figma-api/storage";
import { createTmpFile, writeToFile } from "../utils/storage";
import { start as startStyleDictionary } from './../style-dictionary'

export async function processVariables2JSON() {
  logEvent(`variables2json`)

  const opts = global.tokenEngineConfig as Variables2JsonArgs

  // Step 1: Read all the tokenFiles, combining them if necessary
  function readTokenFiles(opts : Variables2JsonArgs) : ExportType {
    try {

      const _variableFiles = Array.isArray(opts.variableFiles) ? opts.variableFiles : [opts.variableFiles];
      const [firstFile, ...rest] = _variableFiles;
      // 1.1 We read the first file and parse it as is
      const baseData = JSON.parse(readFileSync(firstFile, 'utf8')) as ExportType;
      
      // 1.2 For the rest of the files
      rest.forEach((fileName) => {
        const additionalData = JSON.parse(readFileSync(fileName, 'utf8')) as ExportType;
        // We append the collection of those files to the base collection
        baseData.collections = baseData.collections.concat(additionalData.collections)
      })

      return baseData;
      
    } catch (error) {
      logError(String(error))
      throw error;
    }
  }
  
  const data = readTokenFiles(opts);

  // Step 2: write the combined data into a file 
  const inputFile = opts.inputFile ?? createTmpFile(".json");
  await writeToFile(inputFile, data);

  // Step 3: Transfom [Variables] using StyleDictionary, to be ready for css/js tools
  startStyleDictionary({...opts, inputFile})

  // Step 4: Done
  logEvent(`Done!`)
}
