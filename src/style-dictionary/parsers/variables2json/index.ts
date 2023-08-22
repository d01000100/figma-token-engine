import { ExportType, Variable } from "./types"
import { logError, logWarning } from "../../../utils/logger";
import { DesignTokens } from "../../types"
import { DesignToken } from "style-dictionary";
import { addTokenIntoRoute } from "../utils";
import lodash from "lodash";

const NAME_DIVIDER = "/"

function parseVarAttributes({type} : Variable) : DesignToken["attributes"] | undefined {
  // Determine attributes according to type
  let attributes : DesignToken["attributes"];
  switch(type) {
    case "color":
      attributes = { category: "color"}
      break;
    case "number":
      attributes = { category: "size"}
      break;
    default:
      // We don't support any other type of variable
      return;
  }
 return attributes;
}

export function parseVariables2JSON(data : ExportType) : DesignTokens {
  let result : DesignTokens = {};
  let pending : Variable[] = [];

  function parseVariable(variable : Variable) : DesignToken | undefined {
    const {name, type, isAlias, value} = variable;
    const attributes = parseVarAttributes(variable)
    if (!attributes) return;

    if (!isAlias) {
      return {
        value,
        attributes
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
      attributes
    }
  }

  data.collections.forEach(({modes,name : collectionName}) => {
    if (modes.length === 1) {
      modes[0].variables.forEach((variable) => {
        const _variable = {...variable, collectionName}
        const token = parseVariable(_variable)
        if (!token) return;
        const route = [collectionName, ..._variable.name.split(NAME_DIVIDER)]
        result = addTokenIntoRoute(result,route,token)
      })
    }
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
      const { collectionName, name } = variable;
      const token = parseVariable(variable);
      if (!token) return;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const route = [collectionName!, ...name.split(NAME_DIVIDER)]
      result = addTokenIntoRoute(result,route,token)
    })
  }

  return result;
}

// Testing
//import fs from "fs";
//const filename = "../../../../variables2json/foundations_1mode_w-alias_no-styles.json";
//const variablesData = JSON.parse(fs.readFileSync(filename).toString());
//const tokens = parseVariables2JSON(variablesData);
//fs.writeFileSync("../../../../variables2json/tokens.json",JSON.stringify(tokens,undefined,2))