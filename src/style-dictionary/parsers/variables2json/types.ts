export interface Variable {
  name: string,
  type: "color" | "number" | "boolean" | "text",
  isAlias: boolean,
  value: string | number | boolean,
}

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