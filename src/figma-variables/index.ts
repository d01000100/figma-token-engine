/* eslint-disable no-var */
import { FigmaVariablesArgs, PlatformsType, TokenEngineConfigType } from "../types";
import { logEvent, logSuccessElement } from "../utils/logger";
import { createDir, createTmpDir, writeToFile } from "../utils/storage";
import { setUpMobileGlobals, setUpWebGlobals } from "../web-mobile";
import { FigmaVariablesParser } from "./FigmaVariablesParser";
import { readVariablesFromFile } from "./storage";
import { start as startStyleDictionary } from '../style-dictionary'
import path from "path";
import { VariableAPIResponse } from "./types";
import { DesignTokens } from "../style-dictionary/types";
declare global {
  var tokenEngineConfig: TokenEngineConfigType
  var originalPlatforms: PlatformsType[] | undefined
  var modes: string[]
  var useAPI: boolean
  var dryRun: boolean
  var sdConfigFile: string | undefined
  var expandShadows: boolean
}

type ParsedVariablesMeta = {
  variableFile: string,
  outputSubDir?: string,
}

async function parseVariablesIntoFiles(variablesResponse: VariableAPIResponse): Promise<ParsedVariablesMeta[] | boolean> {
  const { parsedVariablesDir } = global.tokenEngineConfig as FigmaVariablesArgs
  const tokenFilenames: ParsedVariablesMeta[] = [];

  // Parse variables into JSON
  const variableParser = new FigmaVariablesParser(variablesResponse)
  variableParser.divideAliasAndExplicitVariables();
  logEvent("Parsing explicit variables")
  variableParser.explicitVariables.forEach(variableParser.parseVariable, variableParser)
  logEvent("Parsing alias variables")
  variableParser.aliasVariables.forEach(variableParser.parseVariable, variableParser)

  // Write parsed variables into files, for StyleDictionary to read from
  const completeOutDir = parsedVariablesDir ? path.join(process.cwd(), parsedVariablesDir) : createTmpDir();
  const modeDir = "./modes/";
  const completeModeDir = path.join(completeOutDir, modeDir);

  if (variableParser.result.modes) {
    await createDir(completeModeDir)
    logSuccessElement("Created dir for modes")

    const parsedModes = Object.entries(variableParser.result.modes ?? {});
    await Promise.all(parsedModes.map(async ([theme, tokens]) => {
      const themeFile = path.join(completeModeDir, `${theme}.json`);
      await writeToFile(themeFile, tokens)
      tokenFilenames.push({
        variableFile: themeFile,
        outputSubDir: theme,
      });
      logSuccessElement(`Wrote tokens from ${theme} theme`)
    }))
  }

  delete variableParser.result.modes;
  const noThemeFilename = path.join(completeOutDir, "variables_no_theme.json");
  await writeToFile(noThemeFilename, variableParser.result)
  tokenFilenames.push({
    variableFile: noThemeFilename
  });
  logSuccessElement(`Wrote tokens with no theme`)

  return tokenFilenames;
}

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