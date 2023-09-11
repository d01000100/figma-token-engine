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

export interface ExplicitVariable extends BaseVariable {
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

export type Variable = AliasVariable | ExplicitVariable | TypographyStyleVariable | ShadowStyleVariable;

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