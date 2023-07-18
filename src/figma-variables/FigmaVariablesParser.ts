import { kebabCase } from "lodash";
import { DesignTokenValue, DesignTokens, SimpleDesignToken, TokenType } from "../style-dictionary/types";
import { CollectionObj, VariableAPIResponse, VariableObj } from "./types";
import { getTypeFromName } from "../style-dictionary/parsers/common";
import { addTokenIntoRoute, rgbaToHex } from "../style-dictionary/parsers/utils";
import { logError, logEvent } from "../utils/logger";

export type ParsedVariables = DesignTokens & {
  modes?: DesignTokens,
}

/**
 * Class to encapsulate and coordinate the pipeline for parsing Figma Variables
 * into a StyleDictionary-friendly design tokens object
 */
export class FigmaVariablesParser {

  constructor(data: VariableAPIResponse) {
    this.rawData = data;
    this.collections = data.meta.variableCollections;
  }

  /**
   * The raw data read from the FigmaAPI endpoint of Variables
   */
  public rawData: VariableAPIResponse;
  /**
   * The collections extracted from the FigmaAPI response
   */
  public collections: CollectionObj;
  /**
   * Set of the modes identified on the supported Variables+
   * This set is filled up by calling getModes
   */
  public modesSet: Set<string> = new Set<string>();
  /**
   * Result of parsed tokens from the Figma Variables
   * This object is filled up by calling `parseVariables`
   */
  public result: ParsedVariables = {};

  public static supportedVariableTypes: VariableResolvedDataType[] = [
    "COLOR",
    "FLOAT"
  ]
  public static groupDivider = "/"

  /* =================
     === Filtering ===
     ================= */
  private getSupportedVariables(variableObj: VariableObj): Variable[] {
    const variables = Object.values(variableObj);
    return variables.filter((variable) => (FigmaVariablesParser.supportedVariableTypes.includes(variable.resolvedType)))
  }

  /**
   * Checks if any of the values (per mode) of variable, is a reference to another variable
   * @param variable 
   * @param modeID 
   */
  private isAliasVariable(variable: Variable): boolean {
    const values = Object.values(variable.valuesByMode)
    const isAlias = values.some((value: VariableValue) => {
      return typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS"
    })
    return isAlias;
  }

  /* ====================================
     === Single Variable Parsing Prep ===
     ==================================== */

  private getModes(variables: Variable[]): Set<string> {
    const modeSet = new Set<string>;
    variables.forEach((variable) => {
      const variableCollection = this.getVariableCollection(variable);
      const modes = variableCollection.modes
      if (modes.length <= 1) return;
      // We just add the mode, if the variable has more than 1
      modes.forEach((mode) => modeSet.add(mode.name))
    })
    return modeSet;
  }

  private getVariableCollection(variable: Variable): VariableCollection {
    return this.collections[variable.variableCollectionId];
  }

  /**
   * Get the route/location that the Variable will have inside the DesignTokens result
   * @param variable 
   * @param collection 
   * @returns An array of strings, with each step on the route on each entry
   */
  private getVariableRoute(variable: Variable, collection: VariableCollection): string[] {
    const collectionName = kebabCase(collection.name);
    const groupsAndName = variable.name.split(FigmaVariablesParser.groupDivider)
    return [collectionName, ...groupsAndName]
  }

  /* =====================================
     === Single Variable Parsing Utils ===
     ===================================== */

  /**
   * Gets our custom TokenType equivalent of the Variable, according to the
   * VariableResolvedDataType and keywords on the route
   * 
   * Valid keywords are the values of the enum Category on
   * src/style-dictionary/parsers/types/nameStandard.ts
   * @param varType 
   * @param route 
   * @returns May return undefined of the data type is not compatible and the
   * route doesn't contain any appropiate keyword
   */
  private parseVariableTypeToTokenType(varType: VariableResolvedDataType, route: string[]): TokenType | undefined {
    switch (varType) {
      case "COLOR":
        return TokenType.color;
      case "FLOAT":
        // this is more complex ¿according to the name?
        return getTypeFromName(route);
      default:
        return;
    }
  }

  /**
   * Gets and transforms the value from Variable at the specified mode
   * 
   * - Transforms the color into 8-byte hexcode
   * @param variable 
   * @param modeID 
   * @returns 
   */
  private getValueFromMode(variable: Variable, modeID: string): VariableValue | undefined {
    return variable.valuesByMode[modeID];
  }

  /**
   * Resolves the referenced value of an alias variable, from the rawData variables
   * @param variable 
   * @param modeID 
   * @returns 
   */
  private getReferencedValue(variable: Variable, modeID: string): VariableValue | undefined {
    const referenceForMode = variable.valuesByMode[modeID] as VariableAlias;
    if (!referenceForMode) return;
    const baseVariableID = referenceForMode.id;
    const baseVariable = this.rawData.meta.variables[baseVariableID]
    if (!baseVariable) {
      logError(`Can't find the base variable ${baseVariableID}, that variable ${variable.name} references to`)
      return;
    }
    return this.getValueFromMode(baseVariable, modeID);
  }

  private transformValue(value: VariableValue, type: VariableResolvedDataType): DesignTokenValue {
    if (type === "COLOR") {
      return rgbaToHex(value as RGB | RGBA)
    }
    return value as number;
  }

  /**
   * Gets and transforms all the relevant properties to parse a Variable into a SimpleDesignToken
   * @param variable 
   * @param route 
   * @param modeID 
   * @param modeName Optional. Pass to add the mode name to the token data. If the token only has one mode,
   * do not pass it.
   * @returns 
   */
  parseVariableToToken(variable: Variable, route: string[], modeID: string, modeName?: string): SimpleDesignToken | undefined {
    const tokenType = this.parseVariableTypeToTokenType(variable.resolvedType, route)
    if (!tokenType) return;
    let value: VariableValue | undefined;
    if (this.isAliasVariable(variable)) {
      value = this.getReferencedValue(variable, modeID);
    } else {
      value = this.getValueFromMode(variable, modeID)
    }
    if (!value) return;
    return {
      value: this.transformValue(value, variable.resolvedType),
      description: variable.description,
      type: tokenType,
      mode: modeName,
    }
  }

  /**
   * Adds a parsed token to the Token Object result, on the position specified by route
   * prefixing a mode, if any
   * @param token 
   * @param route 
   * @param modeName 
   * @returns Nothing. The result is stored in this.result
   */
  addToResult(token: SimpleDesignToken, route: string[]) {
    this.result = addTokenIntoRoute(this.result, route, token)

    // TODO: Delete this if the merging of modes exploration is successfull
    //if (!modeName) {
    //  this.result = addTokenIntoRoute(this.result, route, token)
    //  return;
    //}

    //// If there is a mode
    //if (!this.result["modes"]) {
    //  this.result.modes = {}
    //}

    //this.result.modes = addTokenIntoRoute(this.result.modes, [modeName, ...route], token)
  }

  /* ================================
     === Variable parsing pipeline ===
     ================================ */
  /**
   * Full process to parse a variable and add it to the result TokenObject
   * 
   * Assumes `this.modesSet` is filled before by `this.getModes`
   * @param variable   
   *  
   */
  private parseVariable(variable: Variable) {
    const collection = this.getVariableCollection(variable)
    const modes = collection.modes;
    const route = this.getVariableRoute(variable, collection)

    if (modes.length > 1) {
      modes.forEach((mode) => {
        const token = this.parseVariableToToken(
          variable,
          route,
          mode.modeId,
          mode.name
        );
        if (!token) return;
        this.addToResult(token, [mode.name, ...route])
      })
      return;
    }

    // If the variable's collection only has 1 mode, we create a token
    // from that variable for every mode that we detected on the Variables
    const singleMode = modes[0];
    this.modesSet.forEach((modeName) => {
      const token = this.parseVariableToToken(
        variable,
        route,
        singleMode.modeId,
        modeName
      )
      if (!token) return;
      this.addToResult(token, [modeName, ...route])
    })
  }

  /**
   * Full pipeline to parse all variables found on `variablesResponse` into `result`
   */
  parseVariables() {
    // 1. Filter the unsupported variables out
    // They get stored in `self.supportedVariables`
    const supportedVariables = this.getSupportedVariables(this.rawData.meta.variables);
    // 2. Get all the modes of the supported variables
    this.modesSet = this.getModes(supportedVariables)
    // 3. Divide explicit and alias variables
    const explicitVariables = supportedVariables.filter((variable) => !this.isAliasVariable(variable))
    const aliasVariables = supportedVariables.filter(this.isAliasVariable)
    // 4. Parse into tokens each of the arrays of variables
    // these methods fill up `this.result`!
    logEvent("Parsing explicit variables")
    explicitVariables.forEach(this.parseVariable, this)
    logEvent("Parsing alias variables")
    aliasVariables.forEach(this.parseVariable, this)
  }
}