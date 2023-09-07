import { ExportType, Variable } from "./types"
import { logWarning } from "../../../utils/logger";
import { DesignTokens, TokenType } from "../../types"
import { DesignToken } from "style-dictionary";
import { addTokenIntoRoute } from "../utils";
import lodash from "lodash";
import { Variables2JsonArgs } from "../../../types";
import { writeFile } from "fs";

const NAME_DIVIDER = "/"

function getVarType({type} : Variable) : TokenType | undefined {
  // Determine attributes according to type
  switch(type) {
    case "color":
      return TokenType.color
    case "number":
      return TokenType.number
    default:
      // We don't support any other type of variable
      return;
  }
}

function getRoute({name, collectionName, modeName} : Variable) : string[] {
  return [collectionName, modeName, ...name.split(NAME_DIVIDER)]
    .filter(x => x !== undefined) as string[];
}

export function parseVariables2JSON(data : ExportType) : DesignTokens {
  let result : DesignTokens = {};
  let pending : Variable[] = [];

  function parseVariable(variable : Variable) : DesignToken | undefined {
    const {name, type, isAlias, value} = variable;
    const tokenType = getVarType(variable)
    if (!tokenType) return;

    if (!isAlias) {
      return {
        value,
        type: tokenType
      }
    }

    // If it's an alias token, we search for it's referenced token on the result
    const route = [value.collection, ...value.name.split(NAME_DIVIDER)]
    const baseToken = lodash.get(result,route);
    if (!baseToken) {
      // If we haven't parsed the base token, we add it to pending
      pending.push(variable);
      return;
    }

    // If we have parsed the base token, we use its value
    return {
      value: baseToken.value,
      type: tokenType
    }
  }

  data.collections.forEach(({modes,name : collectionName}) => {
    modes.forEach((mode) => {
      const modeName = mode.name
      mode.variables.forEach((variable) => {
        const _variable = {...variable, collectionName}
        if (modes.length > 1) {
          _variable.modeName = modeName
        }
        const token = parseVariable(_variable)
        if (!token) return;
        const route = getRoute(_variable)
        result = addTokenIntoRoute(result,route,token)
      })
    })
  })


  /** Number to keep track if we reduce the pending list with each pass */
  let lastPendingCount = pending.length + 1;

  while(pending.length > 0) {
    // If we didn't reduced the pending list on the last pass
    // the remaining tokens are unresolvable
    if (lastPendingCount === pending.length) {
      logWarning(`Unresolved alias tokens without base ${JSON.stringify(pending.map(x => x.name))}`)
      return result;
    }

    lastPendingCount = pending.length;
    const _pending = [...pending];
    pending = [];
    _pending.forEach((variable) => {
      const token = parseVariable(variable);
      if (!token) return;
      const route = getRoute(variable)
      result = addTokenIntoRoute(result,route,token)
    })
  }

  const parsedTokensFile = (global.tokenEngineConfig as Variables2JsonArgs).parsedTokensFile
  if(parsedTokensFile) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    writeFile(parsedTokensFile, JSON.stringify(result,undefined,2),() => {});
  }

  return result;
}

// Testing
//import fs from "fs";
//const filename = "../../../../variables2json/foundations-2modes-w-alias_no-styles.json";
//const variablesData = JSON.parse(fs.readFileSync(filename).toString());
//const tokens = parseVariables2JSON(variablesData);
//fs.writeFileSync("../../../../variables2json/tokens.json",JSON.stringify(tokens,undefined,2))