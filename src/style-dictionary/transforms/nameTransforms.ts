import * as ChangeCase from "change-case";
import { NameTransform } from "style-dictionary/types/Transform";
import { TransformGroup } from "../types";

function joinAsKebabCase(parts : string[]) : string {
  return ChangeCase.paramCase(parts.join(" "))
}

function joinAsCamelCase(parts : string[]) : string {
  return ChangeCase.camelCase(parts.join(" "))
}

function joinAsConstantCase(parts : string[]) : string {
  return ChangeCase.constantCase(parts.join(" "))
}

type NameTransformer = NameTransform["transformer"];

/**
 * Name transform for web stylesheets
 * - Removes the mode (if any) from the beginning of the path
 * - Adds a prefix (if any)
 * - Joins the path in kebab-case
 * @param token 
 * @param options 
 */
export const webStylesheetNameTransform : NameTransformer = (token, options) : string => {
  // We get the modes from all the options for each file this transformer is used on
  const modes = options.files?.map((file) => file.options?.mode).filter(x => x !== undefined);
  const prefix = options.prefix;
  let path = token.path;
  if (modes?.length) {
    const firstStep = path[0];
    // If the path begins with one of the modes detected, we remove that part of the name
    if (modes.includes(firstStep)) {
      path = path.slice(1)
    }
  }
  if (prefix) {
    path = [prefix, ...path]
  }
  return joinAsKebabCase(path)
} 