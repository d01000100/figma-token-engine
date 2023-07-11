import { FigmaVariablesParser } from "./FigmaVariablesParser";
import { readVariablesFromFile, writeParsedVariables } from "./storage";

// For testing
const figmaApiResponse = readVariablesFromFile("variables.json");
if (!figmaApiResponse) {
  process.exit(1)
}

const variableParser = new FigmaVariablesParser(figmaApiResponse)

variableParser.divideAliasAndExplicitVariables();

variableParser.explicitVariables.forEach(variableParser.parseVariable, variableParser)

writeParsedVariables("./tmp/parsed_variables.json",variableParser.result)

//console.log({alias: JSON.stringify(variableParser.aliasVariables,undefined,2)})
//console.log({explicit: JSON.stringify(variableParser.explicitVariables,undefined,2)})

//function testNameTransform(name : string) {
//  console.log({name, result: kebabCase(name)})
//}

//testNameTransform("[ Text ] - Example")