/* eslint-disable no-var */
import { FigmaVariablesArgs, TokenEngineConfigType } from "../types";
import { logSuccessElement } from "../utils/logger";
import { createTmpDir, writeToFile } from "../utils/storage";
import { setUpMobileGlobals, setUpWebGlobals } from "../web-mobile";
import { FigmaVariablesParser } from "./FigmaVariablesParser";
import { readVariablesFromFile } from "./storage";
import { start as startStyleDictionary } from '../style-dictionary'
import path from "path";
import { VariableAPIResponse } from "./types";

type ParsedVariablesMeta = {
  variableFile: string,
  outputSubDir?: string,
}

async function parseVariablesIntoFiles(variablesResponse: VariableAPIResponse): Promise<ParsedVariablesMeta[] | boolean> {
  const { parsedVariablesDir } = global.tokenEngineConfig as FigmaVariablesArgs
  const tokenFilenames: ParsedVariablesMeta[] = [];

  // Parse variables into JSON
  const variableParser = new FigmaVariablesParser(variablesResponse)
  variableParser.parseVariables();

  // Write parsed variables into files, for StyleDictionary to read from
  const completeOutDir = parsedVariablesDir ? path.join(process.cwd(), parsedVariablesDir) : createTmpDir();
  
  // TODO: Delete if exploration about merging modes into one file is successfull
  //const modeDir = "./modes/";
  //const completeModeDir = path.join(completeOutDir, modeDir);

  //if (variableParser.result.modes) {
  //  await createDir(completeModeDir)
  //  logSuccessElement("Created dir for modes")

  //  const parsedModes = Object.entries(variableParser.result.modes ?? {});
  //  await Promise.all(parsedModes.map(async ([theme, tokens]) => {
  //    const themeFile = path.join(completeModeDir, `${theme}.json`);
  //    await writeToFile(themeFile, tokens)
  //    tokenFilenames.push({
  //      variableFile: themeFile,
  //      outputSubDir: theme,
  //    });
  //    logSuccessElement(`Wrote tokens from ${theme} theme`)
  //  }))
  //}

  //delete variableParser.result.modes;

  const noThemeFilename = path.join(completeOutDir, "parsed-variables.json");
  await writeToFile(noThemeFilename, variableParser.result)
  // We add the modes found on the variables to global!
  global.modes = Array.from(variableParser.modesSet)
  tokenFilenames.push({
    variableFile: noThemeFilename
  });
  logSuccessElement(`Wrote parsed variables into tokens on ${noThemeFilename}`)

  return tokenFilenames;
}

// TODO: Delete if expolration of merging modes into single file works out
function processVariableFile({ variableFile, outputSubDir }: ParsedVariablesMeta): boolean {

  const { outputDir, noModeOutputSubDir } = global.tokenEngineConfig as FigmaVariablesArgs;
  // If we don't have outputSubdir in the meta data, it means we're processing the variables without
  // a mode. We use `noModeOutputSubDir` from the config if we have one
  const currentOutputDir = path.join(outputDir, outputSubDir ?? noModeOutputSubDir ?? "")

  // 3.1.1 Prepare configurations for current token file and web outputs
  setUpWebGlobals();
  let config: TokenEngineConfigType = {
    ...global.tokenEngineConfig,
    inputFile: variableFile,
    outputDir: currentOutputDir
  }
  // 3.1.2 Run StyleDictionary for current token file and web outputs
  startStyleDictionary(config)

  // 3.2.1 Prepare configurations for current token file and mobile outputs
  setUpMobileGlobals()
  config = {
    ...global.tokenEngineConfig,
    inputFile: variableFile,
    outputDir: currentOutputDir
  }
  // 3.2.2 Run StyleDictionary for current token file and mobile outputs
  startStyleDictionary(config)
  return true;
}

export async function processFigmaVariables() {
  // 1. Read the Variables TODO: Use the Figma API for this
  const figmaApiResponse = readVariablesFromFile(global.tokenEngineConfig.inputFile);
  if (!figmaApiResponse) {
    return;
  }

  // 2. Process the variables to generate multiple token files and output dirs (for modes)
  parseVariablesIntoFiles(figmaApiResponse).then((parsedVariablesMeta) => {
    if(parsedVariablesMeta) {
      // 3. For each mode (and one extra time for variables without a mode)
      // run style dictionary pipeline to generate platform outputs.
      (parsedVariablesMeta as ParsedVariablesMeta[]).forEach((metaData) => {
        const globalTmp = global;
        processVariableFile(metaData);
        global = globalTmp;
      })
    }
  });
}

// processFigmaVariables();