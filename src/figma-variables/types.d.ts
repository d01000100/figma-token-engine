/**
 * Raw response from the Figma HTTP API when querying the Variables of a file
 */
export type VariableAPIResponse = {
  status: number,
  error: unknown,
  meta: {
    variableCollections: CollectionObj,
    variables: VariableObj
  }
}

export type CollectionObj = {
  [collectionID : string] : VariableCollection
}

export type VariableObj = {
  [variableID : string] : Variable
}

/**
 * Named type of a mode inside a VariableCollection
 * 
 * This is a copy of the in-line type description of the field
 * `modes` of Figma's VariableCollection type
 */
export type Mode = {
  modeId: string,
  name: string
}