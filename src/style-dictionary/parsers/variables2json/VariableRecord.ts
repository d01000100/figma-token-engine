import { writeFileSync } from "fs";
import { toJSON } from "../../../utils/utils";
import { ExportType, Variable } from "./types";
import lodash from "lodash";

/**
 * Variable Type plus additional data needed for the alias resolution algorithm * 
*/
 export type RecordedVariable = Variable & {
  /**
   * Aggregate of modes of the variable and the referenced variables
   */
  modes?: string[]
}

class VariableRecord {
  private record: RecordedVariable[] = [];

  public static recordSingleton : VariableRecord = new VariableRecord();

  /**
   * Fills the record from the variables data
   * @param data - The export of variables2json
   * (after combining the collections if you have multiple files)
   */
  createRecord(data: ExportType) {
    this.record = [];
    data.collections.forEach((collection) => {
      const { name : collectionName } = collection
      const { modes } = collection;
      const multipleModes = modes.length > 1;
      modes.forEach((mode) => {
        const { name: modeName, variables } = mode;
        variables
          // We filter variables generated by Figma Styles
          .filter(({ type }) => (type !== "grid" && type !== "typography" && type !== "effect"))
          .forEach(variable => {
            this.record.push({
              ...variable,
              collectionName,
              modes: (multipleModes ? [modeName] : [])
            })
          })
      })
    })
    writeFileSync("./VariableRecord.json", toJSON(this.record))
  }

  /**
   * Adds a variable to the record
   * @param variable - The RecordedVariable to add
   */
  addVariable(variable: RecordedVariable) {
    this.record.push(variable)
  }

  private _isVariableEqual(v1 : RecordedVariable, v2 : RecordedVariable) : boolean {
    return v1.name === v2.name && v1.collectionName === v2.collectionName && lodash.isEqual(v1.modes, v2.modes)
  }

  /**
   * Removes a variable from the record
   * 
   * It matches the variable by the name, the collection and the modes
   * @param variable - The RecordedVariable to match and remove
   */
  removeVariable(variable: RecordedVariable) {
    this.record = this.record.filter(x => !this._isVariableEqual(x, variable))
  }

  /**
   * Get all the variables in the record that match the provided name and (optional) collection
   * @param prop -  \{name, collection?\} Both strings to match on the recorded variables
   * @returns \{matches : RecordedVariable[], modes : string[]\}
   *  Matches: The variables that match the name and collection
   *  modes: List without repeats of the non-null modes found on those matches
   */
  getMatches({ name, collection }: { name: string, collection?: string })
    : { matches: RecordedVariable[], modes: string[] } {
    const matches = this.record.filter(x => (
      // The name must match.
      // If there's a collection specified, it should also match 
      x.name === name && (!collection || x.collectionName === collection)
    ))

    // We count all the unique non-null modes from the matches
    const modes = Array.from(new Set(matches.map(v => v.modes).flat().filter(Boolean))) as string[]

    return { matches, modes }
  }
}

export default VariableRecord;