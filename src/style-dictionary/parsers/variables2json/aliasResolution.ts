/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { logWarning } from "../../../utils/logger";
import { toJSON } from "../../../utils/utils";
import VariableRecord from "./VariableRecord";
import { AliasVariable, ParsedVariable, ParsingResult } from "./types";
import { NAME_DIVIDER, getVarType } from "./utils";

class PendingAlias {
  public static pending : AliasVariable[] = [];
}


function warningUnresolved(variable : AliasVariable) {
  logWarning(`Unresolved alias token ${toJSON({
    aliasName: variable.name,
    referredToken: variable.value.name
  })}`)
}

function parseAliasVariable(variable : AliasVariable) : ParsingResult {
  const { modeName, collectionName, name } = variable;
  const referredVariable = variable.value

  const { matches, modes : matchedModes } = VariableRecord.recordSingleton.getMatches(referredVariable);

  
  if(matches.length === 0) {
    warningUnresolved(variable);
    return;
  }

  // We don't resolve a variable until all its matches are resolved
  if(matches.some(match => match.isAlias)) {
    PendingAlias.pending.push(variable)
    return;
  }

  VariableRecord.recordSingleton.removeVariable(variable)

  const results : ParsedVariable[] = [];

  const isReferenceMultiMode = matchedModes.length > 1;

  matches.forEach((match) => {
    const route = [
      collectionName!,
      ...(modeName ? [modeName] : []),
      ...(isReferenceMultiMode ? match.modes! : []),
      ...name.split(NAME_DIVIDER),
    ]

    const resolvedModes = [
      ...(modeName ? [modeName] : []),
      ...(match.modes?.length ? match.modes : [])
    ]

    const token : ParsedVariable = {
      route,
      value: match.value as string | number,
      collection: collectionName,
      modes: resolvedModes,
      type: getVarType(variable)
    }

    results.push(token);

    VariableRecord.recordSingleton.addVariable({
      ...variable,
      isAlias: false,
      value: match.value as string | number,
      collectionName,
      modes: resolvedModes
    })
  })

  return results;
}

export { parseAliasVariable, PendingAlias }