import { ExportType, Variable } from "./types"
import { DesignTokens } from "../../types"
import { DesignToken } from "style-dictionary";
import { addTokenIntoRoute } from "../utils";

const NAME_DIVIDER = "/"

function parseVariable({name, type, isAlias, value} : Variable) : DesignToken | undefined {
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
  return {
    value,
    attributes
  }
}

export function parseVariables2JSON(data : ExportType) : DesignTokens {
  let tokens : DesignTokens = {};

  data.collections.forEach(({modes,name : collectionName}) => {
    if (modes.length === 1) {
      modes[0].variables.forEach((variable) => {
        const token = parseVariable(variable)
        if (!token) return;
        const route = [collectionName, ...variable.name.split(NAME_DIVIDER)]
        tokens = addTokenIntoRoute(tokens,route,token)
      })
    }
  })

  return tokens;
}

// Testing
//import fs from "fs";
//const variablesData = JSON.parse(fs.readFileSync("../../../../variables2json/foundations_1mode_no-alias_no-styles.json").toString());
//const tokens = parseVariables2JSON(variablesData);
//fs.writeFileSync("../../../../variables2json/tokens.json",JSON.stringify(tokens,undefined,2))