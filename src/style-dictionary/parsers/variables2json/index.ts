import { ExportType, Variable, ExplicitVariable, ParsingResult as ParsingResult } from "./types"
import { logWarning } from "../../../utils/logger";
import { DesignToken, DesignTokens, TokenType } from "../../types"
import { addTokenIntoRoute } from "../utils";
import lodash from "lodash";
import { Variables2JsonArgs } from "../../../types";
import { writeFile } from "fs";
import { parseFigmaStyle } from "./styleParsing";
import { toJSON } from "../../../utils/utils";
import VariableRecord, { RecordedVariable } from "./VariableRecord";
import { NAME_DIVIDER, getVarType } from "./utils";
import { parseAliasVariable, PendingAlias } from "./aliasResolution";

/**
 * Construct the route into the result token object from a variable
 * 
 * Considers the collection, modes and name parts
 * @param param0 - Variable
 * @returns Every step of the route as an array
 */
function getRoute({ name, collectionName, modeName }: Variable): string[] {
  return [collectionName, modeName, ...name.split(NAME_DIVIDER)]
    .filter(x => x !== undefined) as string[];
}

/**
 * Adds the parsed `token` into the `result` token object into the specified `route`
 * @param param0 - \{route, token, result\}
 * @returns New result token object.
 */
function addToResult(
  { token, result }: { token: ParsingResult, result: DesignTokens }
): DesignTokens {
  if (!token) { return result; }
  if (Array.isArray(token)) {
    let _result = { ...result };
    /* It's an array of tokens */
    token.forEach((singleToken) => {
      const route = singleToken.route;
      if(singleToken.type === "typography") {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        _result = addTokenIntoRoute(result, [...route, singleToken.type!], singleToken as DesignToken)
        return;
      }

      console.log(toJSON(singleToken))
      _result = addTokenIntoRoute(result, route, singleToken as DesignToken)
    })

    return _result;
  }

  /* If it's a single token */
  const route = token.route;
  return addTokenIntoRoute(result, route, token as DesignToken)
}

export function parseVariables2JSON(data: ExportType): DesignTokens {
  let result: DesignTokens = {};

  function parseExplicitVariable(variable: ExplicitVariable): ParsingResult {
    const { type, value } = variable;
    const route = getRoute(variable);

    /* If it's a Figma Style */
    if (type === "typography" || type === "effect" || type === "grid") {
      return {
        ...parseFigmaStyle(variable),
        route
      };
    }

    const tokenType = getVarType(variable)
    if (!tokenType) return;

    return {
      value,
      type: tokenType,
      route
    }
  }

  // Add each variable to the record (it filters Figma Styles)
  VariableRecord.recordSingleton.createRecord(data);

  data.collections.forEach(({ modes, name: collectionName }) => {
    modes.forEach((mode) => {
      const modeName = mode.name
      mode.variables.forEach((variable) => {
        const _variable = { ...variable, collectionName }
        if (modes.length > 1) {
          _variable.modeName = modeName;
        }
        let token: ParsingResult;
        if (!_variable.isAlias) {
          token = parseExplicitVariable(_variable);
          result = addToResult({ token, result })
          return;
        }
        
        // If it's an alias..
        token = parseAliasVariable(_variable)
        result = addToResult({ token, result })
      })
    })
  })


  /** Number to keep track if we reduce the pending list with each pass */
  let lastPendingCount = PendingAlias.pending.length + 1;

  while (PendingAlias.pending.length > 0) {
    // If we didn't reduced the pending list on the last pass
    // the remaining tokens are unresolvable
    if (lastPendingCount === PendingAlias.pending.length) {
      logWarning(`Unresolved alias tokens without base ${JSON.stringify(PendingAlias.pending.map(x => x.name))}`)
      return result;
    }

    lastPendingCount = pending.length;
    const _pending = [...PendingAlias.pending];
    PendingAlias.pending = [];
    _pending.forEach((variable) => {
      const token = parseAliasVariable(variable);
      if (!token) return;
      result = addToResult({ token, result })
    })
  }

  const parsedTokensFile = (global?.tokenEngineConfig as Variables2JsonArgs)?.parsedTokensFile
  if (parsedTokensFile) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    writeFile(parsedTokensFile, toJSON(result), () => { });
  }

  return result;
}

// Testing
//import fs from "fs";
///* eslint-disable no-var */
//declare global {
//  var tokenEngineConfig: TokenEngineConfigType
//  var useAPI: boolean
//  var dryRun: boolean
//  var sdConfigFile: string | undefined
//}
//const filename = "../../../../variables2json/foundations_n-modes_w-alias_w-styles.json";
//const variablesData = JSON.parse(fs.readFileSync(filename).toString());
//const tokens = parseVariables2JSON(variablesData);
//fs.writeFileSync("../../../../variables2json/parsed_tokens.json",JSON.stringify(tokens,undefined,2))