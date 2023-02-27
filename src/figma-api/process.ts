/* eslint-disable @typescript-eslint/no-explicit-any */
import { logEvent, logError, logSuccessElement } from '../utils/logger'
// import * as fs from 'fs'
// import { formatJSON } from '../utils/json-formatter'

/**
 * Process the Figma API Response into something token-transform can use
 */
export function processFigmaAPIResponse(tokensFileData: any) {
  logEvent('Figma API - Process Figma API Response')

  const transformedTokens = JSON.parse(tokensFileData.values)
  // fs.writeFileSync('./tmp/raw_tokens_api.json', formatJSON(transformedTokens), 'utf-8')
  const tokenSet = Object.keys(transformedTokens)

  let final: any = {}

  try {
    final = tokenSet.reduce((prev: any, singleSet: string) => {
      prev[singleSet] = getAllTokensFromSet(transformedTokens[singleSet])
      return prev
    }, {})
    logSuccessElement('API Response Processed without errors')
  } catch (error) {
    logError(
      'Error trying to transform the API Response, check with maintenance' +
        error
    )
  }

  final['$themes'] = []
  final['$metadata'] = { tokenSetOrder: tokenSet }

  return final
}

/**
 *  Create an object structure based in the set's array of token names
 * */
function getAllTokensFromSet(set: any) {
  const jsonSchema: any = {}
  set.map((singleToken: any) => {
    const deepProperties = singleToken.name.split('.')
    deepProperties.reduce((prev: any, current: string, index: number) => {
      let propertyValue = {}
      if (index + 1 === deepProperties.length) {
        propertyValue = {
          value: singleToken.value,
          type: singleToken.type,
          description: singleToken.description,
        }
      }
      return (prev[current] = prev[current] || propertyValue)
    }, jsonSchema)
  })

  return jsonSchema
}
