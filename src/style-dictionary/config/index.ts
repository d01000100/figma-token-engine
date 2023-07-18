import StyleDictionary from "style-dictionary"
import { registerFormatters } from "../formatters"
import { registerTransformGroups } from "../transform-groups"
import { registerFileHeaders } from "../file-headers"
import { registerFilters } from "../filters"
import path from "path"
import { logError } from "../../utils/logger"
import tokensStudioSDConfig from "./tokensStudio";
import figmaStylesSDConfig from "./figmaStyles";
import figmaVariablesSDConfig from "./figmaVariables";
import { TokenEngineConfigType } from "../../types"

function readCustomConfig(file: string) {
  let sdConfig;
  try {
    sdConfig = require(path.resolve(process.cwd(), file));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e : any) {
    logError(`Couldn't read style dictionary configuration file at ${file}`)
    return;
  }

  return sdConfig;
}

/**
 * Creates and configures a StyleDictionary instance for the token-engine pipeline
 *
 * @remarks
 * Registers the custom transformers, transform groups, formatters and other tools
 * before extending StyleDictionary with the configuration
 *
 * @param tokensSource - Location of the file containing the raw tokens
 * @param outputFolder - Directory where to output the stylesheets and other exports
 * @param parser - Optional. Parser to transform the tokens before starting the pipeline
 */
export function buildStyleDictionary(
  tokensSource: string,
  outputFolder: string,
  tokenFormat: TokenEngineConfigType["tokenFormat"],
): StyleDictionary.Core {
  registerFormatters()
  registerTransformGroups()
  registerFileHeaders()
  registerFilters()
  // If the user provided a custon StyleDictionary config file, use that one
  if (global.sdConfigFile) {
    const config = readCustomConfig(global.sdConfigFile);
    return StyleDictionary.extend(config);
  }

  // Choose the correct StyleDictionary config file
  // according to the tokenFormat
  let buildConfigFn;
  switch (tokenFormat) {
    case "FigmaStyles":
      buildConfigFn = figmaStylesSDConfig;
      break;
    case "FigmaVariables":
      buildConfigFn = figmaVariablesSDConfig;
      break;
    case "TokensStudio":
    case "FigmaTokens":
      buildConfigFn = tokensStudioSDConfig;
      break;
  }
  const config = buildConfigFn(tokensSource, outputFolder)
  return StyleDictionary.extend(config)
}