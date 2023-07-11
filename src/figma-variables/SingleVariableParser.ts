import { FigmaVariablesParser } from "./FigmaVariablesParser"
import { Mode } from "./types"

/**
 * Class to encapsulate and coordinate the data and processes to 
 * transform a Variable into a StyleDictionary-friendly DesignToken
 */
export class SingleVariableParser {
  variable : Variable
  collection : VariableCollection
  modes : Mode[]
  parserInstance : FigmaVariablesParser

  constructor(variable : Variable, collection : VariableCollection, parser : FigmaVariablesParser) {
    this.variable = variable;
    this.collection = collection;
    this.modes = collection.modes;
    this.parserInstance = parser;
  }


}