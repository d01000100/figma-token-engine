import { DesignToken } from "../../types";

export interface AliasValue {
  collection?: string,
  name: string,
}

export type VariableType = "color" | "number" | "boolean" | "text" | "grid";

interface BaseVariable {
  name: string,
  fullName?: string,
  collectionName?: string,
  modeName?: string,
}

export interface AliasVariable extends BaseVariable {
  isAlias: true,
  type: VariableType,
  value: AliasValue
}

export interface SimpleVariable extends BaseVariable {
  isAlias: false,
  type: VariableType,
  value: string | number,
}

export interface TypographyStyleVariable extends BaseVariable {
  type: "typography",
  isAlias: false,
  value: {
    fontSize: number,
    fontFamily: string,
    fontWeight: string,
    lineHeight: number,
    lineHeightUnit: string,
    letterSpacing: number,
    letterSpacingUnit: string,
    textCase: string,
    textDecoration: string
  }
}

export interface ShadowStyleVariable extends BaseVariable {
  type: "effect",
  isAlias: false,
  value: {
    effects: {
      "type": string,
      "color": {
        "r": number,
        "g": number,
        "b": number,
        "a": number
      },
      "offset": {
        "x": number,
        "y": number,
      },
      "radius": number,
      "spread": number,
    }[]
  }
}

export type ExplicitVariable = SimpleVariable | TypographyStyleVariable | ShadowStyleVariable;

export type Variable = AliasVariable | ExplicitVariable;

export type ParsedVariable =  Omit<DesignToken, "route"> & Required<Pick<DesignToken, "route">>

/**
 * A result when parsing a Variable to token(s).
 * 
 * It may be:
 * - a single token
 * - an array of tokens (from a typography style)
 * - or undefined, in case it's a not supported variable
 */
export type ParsingResult = ParsedVariable | ParsedVariable[] | undefined;

export interface Mode {
  name: string,
  variables: Variable[]
}

export interface Collection {
  name: string,
  modes: Mode[]
}

export interface ExportType {
  collections: Collection[]
}