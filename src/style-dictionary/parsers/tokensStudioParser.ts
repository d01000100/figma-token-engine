import { getTypeFromName } from './common'
import {
  DesignToken as SDDesignToken,
  DesignTokens as SDDesignTokens,
} from 'style-dictionary'
import { DesignToken, DesignTokens, TokenType } from '../types'

/**
 * Parses a `token-transfomer` design token into the token engine format.
 *
 * @remarks
 * Filters some types and adds correct `type` to the tokens.
 *
 * @param token
 * @param route - The location of the token in the global token object
 * @returns - The parsed token
 */
function parseDesignToken(
  token: SDDesignToken,
  route: string[]
): DesignToken | null {
  let parsedType: TokenType | undefined

  switch (token.type) {
    case 'spacing':
      parsedType = TokenType.space
      break
    case 'sizing':
      parsedType = TokenType.size
      break
    case 'textCase':
      parsedType = TokenType.textTransform
      break
    case 'paragraphSpacing':
    case 'implicit':
    case 'textDecoration':
      return null
    case 'other':
      /** The "other" tokens are identified by a keyword on their name */
      parsedType = getTypeFromName(route)
      break
    default:
      /** No type transformation required */
      return token as DesignToken
  }

  if (parsedType !== undefined) {
    return {
      ...token,
      type: parsedType,
    } as DesignToken
  }

  return token as DesignToken
}

/**
 * Recursively parses a token object (outputted by `token-transformer`) and returns an object with the same structure with the tokens parsed
 * @param tokens TokenGroup
 * @param route - The location of the "current token" on the token object. Optional. Used for recursive calls.
 * @returns TokenGroupParsed
 */
export function parseTokensStudio(
  tokens: SDDesignTokens,
  route: string[] = []
): DesignTokens {
  // Remove "tokenSetOrder" if we have it
  delete tokens.tokenSetOrder
  // Recursively navigate the tokens to find the actual tokens inside the tree
  const parsedTokensArray: DesignTokens[] = Object.entries(tokens).map(
    ([name, token]): DesignTokens => {
      if ('value' in token) {
        // If we find an actual token, we parse it
        const parsedToken = parseDesignToken(token as SDDesignToken, [
          ...route,
          name,
        ])
        if (parsedToken) {
          return {
            [name]: parsedToken,
          }
        } else {
          return {}
        }
      } else {
        return { [name]: parseTokensStudio(token, [...route, name]) }
      }
    }
  )
  // We recombine the parsed tokens into one big object
  const parsedTokens = parsedTokensArray.reduce((parsedTokens, nextToken) => {
    return {
      ...parsedTokens,
      ...nextToken,
    }
  })
  return parsedTokens
}
