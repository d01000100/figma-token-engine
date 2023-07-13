/* eslint-disable no-var */
import { PlatformsType, TokenEngineConfigType } from "../types";
import { logEvent, logSuccessElement } from "../utils/logger";
import { createDir, writeToFile } from "../utils/storage";
import { setUpMobileGlobals, setUpWebGlobals } from "../web-mobile";
import { FigmaVariablesParser } from "./FigmaVariablesParser";
import { readVariablesFromFile } from "./storage";
import { start as startStyleDictionary } from '../style-dictionary'
import path from "path";
import { VariableAPIResponse } from "./types";
declare global {
  var tokenEngineConfig: TokenEngineConfigType
  var originalPlatforms: PlatformsType[] | undefined
  var modes : string[]
  var useAPI: boolean
  var dryRun: boolean
  var sdConfigFile: string | undefined
  var expandShadows: boolean
}

// simulating the config file reading
global.tokenEngineConfig = {
  outputDir: "./tmp/",
  figmaFileId: "",
  inputFile: "variables.json",
  tokenFormat: "FigmaVariables",
  platforms: undefined
}

type ParsedVariablesMeta = {
  variableFile: string,
  outputSubDir?: string,
}

async function parseVariablesIntoFiles(variablesResponse : VariableAPIResponse) : Promise<ParsedVariablesMeta[] | boolean> {
  const { outputDir } = global.tokenEngineConfig
  const tokenFilenames : ParsedVariablesMeta[] = [];  

  const variableParser = new FigmaVariablesParser(variablesResponse)

  variableParser.divideAliasAndExplicitVariables();

  logEvent("Parsing explicit variables")
  variableParser.explicitVariables.forEach(variableParser.parseVariable, variableParser)
  logEvent("Parsing alias variables")
  variableParser.aliasVariables.forEach(variableParser.parseVariable, variableParser)


  const completeOutDir = path.join(process.cwd(),outputDir)
  const modeDir = "./modes/";
  const completeModeDir = path.join(completeOutDir,"modes");

  if (variableParser.result.modes) {
    await createDir(completeModeDir).then(() => {
      logSuccessElement("Created dir for modes")
    
      Object.entries(variableParser.result.modes ?? {}).forEach(async ([theme, tokens]) => {
        const themeFile = path.join(outputDir, modeDir,`${theme}.json`);
        await writeToFile(themeFile, tokens)
        tokenFilenames.push({
          variableFile: themeFile,
          outputSubDir: theme,
        });
        logSuccessElement(`Wrote tokens from ${theme} theme`)
      })
    })
  }

  delete variableParser.result.modes;
  const noThemeFilename = path.join(completeOutDir,"variables_no_theme.json");
  await writeToFile(noThemeFilename,variableParser.result)
  tokenFilenames.push({
    variableFile: noThemeFilename
  });
  logSuccessElement(`Wrote tokens with no theme`)

  return tokenFilenames;
}

function processVariableFile({ variableFile, outputSubDir } : ParsedVariablesMeta) : boolean {
  
  const { outputDir } = global.tokenEngineConfig;
  const currentOutputDir = outputSubDir ? path.join(outputDir,outputSubDir) : outputDir

  // 3.1.1 Prepare configurations for current token file and web outputs
  setUpWebGlobals();
  let config : TokenEngineConfigType = {
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
  const tokenFilenames = await parseVariablesIntoFiles(figmaApiResponse);
  
  if(tokenFilenames) {
    // 3. For each mode (and one extra time for variables without a mode)
    // run style dictionary pipeline to generate platform outputs.
    (tokenFilenames as ParsedVariablesMeta[]).forEach((metaData) => {
      const globalTmp = global;
      processVariableFile(metaData);
      global = globalTmp;
    })
  }
}

// processFigmaVariables();