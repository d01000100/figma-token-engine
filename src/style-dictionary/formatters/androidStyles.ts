import { Formatter, TransformedToken, formatHelpers } from "style-dictionary";
import { DesignToken, TokenType } from "../types";
import { snakeCase } from "change-case";

function getModesFromTokens(tokens: TransformedToken[]): string[] {
  const modes = new Set<string>()
  tokens.forEach((token) => {
    const ogToken = token.original as DesignToken;
    if (ogToken.mode) {
      modes.add(ogToken.mode)
    }
  })
  return Array.from(modes)
}

/**
 * If the tokens have modes, gets a single copy of the tokens for the first mode
 * and removes the mode from their names (in snake case)
 * 
 * If there are no modes, returns the tokens as they are.
 * @param tokens 
 */
function getModelessTokens(tokens: TransformedToken[]): TransformedToken[] {
  const modes = getModesFromTokens(tokens);
  // 0. Get a single copy of the tokens for one mode, without the mode on their name
  if (!modes?.length) {
    return tokens
  }

  const mode = modes[0];
  return tokens
    .filter(token => (token.original as DesignToken).mode === mode)
    .map(token => {
      const pathWithoutMode = token.path.filter(step => step != mode);
      const nameWithoutMode = snakeCase(pathWithoutMode.join(" "))
      return {
        ...token,
        name: nameWithoutMode
      }
    })
    .sort(formatHelpers.sortByName)
}

export const androidAttrs: Formatter = (args) => {
  const { dictionary, file } = args;
  const tokens = dictionary.allTokens;
  // 0. Get a single copy of the tokens for one mode, without the mode on their name
  const modelessTokens = getModelessTokens(tokens);
  // 1. Add the fileHeader
  let content = formatHelpers.fileHeader({ file })
  // 2. Add the xml meta data
  content += `<?xml version="1.0" encoding="utf-8"?>\n`
  // 3. Begin the resources rows
  content += `<resources>\n`;
  // 4. For each token...
  modelessTokens.forEach((token) => {
    const ogToken = token.original as DesignToken;
    // 4.1 Detect their xml format
    const format = ogToken.type === TokenType.color ? "reference|color" : "dimension";
    // 4.2 Generate the `<attr>` line
    content += `  <attr name="${token.name}" format="${format}" />\n`;
  })
  // 5. Close the resources
  content += `</resources>`;
  return content;
}

function androidStyleForMode(modelessTokens : TransformedToken[], modeName : string, baseThemeName : string) {
  // 1. Open the style tag
  let content = `  <style name="${modeName}" parent="${baseThemeName}">\n`;
  // 2. For each token...
  modelessTokens.forEach((token) => {
    // 2.1 Determine the prefix
    const ogToken = token.original as DesignToken;
    const prefix = ogToken.type === TokenType.color ? "@color" : "@dimen";
    const snakeMode = snakeCase(modeName);
    // 2.2 Create the item row
    content += `    <item name="${token.name}">${prefix}/${snakeMode}_${token.name}</item>\n`;
  })
  // 3. Close style tag
  content += `  </style>\n`
  return content;
}

export const androidStyles: Formatter = (args) => {
  const { dictionary, file } = args;
  const tokens = dictionary.allTokens;
  // 0. Get a single copy of the tokens for one mode, without the mode on their name
  const modes = getModesFromTokens(tokens);
  const modelessTokens = getModelessTokens(tokens);
  // 1. Add the fileHeader
  let content = formatHelpers.fileHeader({ file })
  // 2. Add the xml meta data
  content += `<?xml version="1.0" encoding="utf-8"?>\n`
  // 3. Begin the resources rows
  content += `<resources>\n`;
  // 4. Begin the BaseTokensTheme declaration, and its constants items
  // TODO: Get from token.config?
  const baseThemeName = "BaseTokensTheme";
  content += `  <style name="${baseThemeName}" parent="Theme.AppCompat.DayNight.DarkActionBar">
    <item name="windowActionBar">false</item>
    <item name="windowNoTitle">true</item>\n`
  // 5. For each mode-less token...
  modelessTokens.forEach((token) => {
    // 5.2 Generate the item declaration
    content += `    <item name="${token.name}">?attr/${token.name}</item>\n`
  })
  // Close the BaseTokenTheme declaration
  content += `  </style>\n\n`
  // 6. For each mode
  modes.forEach((mode) => {
    // 6.1 Generate the style declaration for that mode
    content += androidStyleForMode(modelessTokens,mode,baseThemeName);
  })
  // Close the resources
  content += `</resources>`
  return content;
}