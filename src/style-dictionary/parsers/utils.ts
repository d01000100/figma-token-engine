import { DesignToken, DesignTokens } from '../types'

function rgbHex(
  red?: number | string,
  green?: number | string,
  blue?: number | string,
  alpha?: number | string
): string {
  const isPercent = (String(red) + (String(alpha) || ''))
    .toString()
    .includes('%')

  if (typeof red === 'string' && red !== null) {
    const results = red
      .match(/(0?\.?\d{1,3})%?\b/g)
      ?.map(component => Number(component))

    red = results ? [0] && results[0] : red
    green = results ? [1] && results[1] : green
    blue = results ? [2] && results[2] : blue
    alpha = results ? [3] && results[3] : alpha
  } else if (alpha !== undefined) {
    alpha = Number.parseFloat('' + alpha)
  }

  if (
    typeof red !== 'number' ||
    typeof green !== 'number' ||
    typeof blue !== 'number' ||
    red > 255 ||
    green > 255 ||
    blue > 255
  ) {
    throw new TypeError('Expected three numbers below 256')
  }

  if (typeof alpha === 'number') {
    if (!isPercent && alpha >= 0 && alpha <= 1) {
      alpha = Math.round(255 * alpha)
    } else if (isPercent && alpha >= 0 && alpha <= 100) {
      alpha = Math.round((255 * alpha) / 100)
    } else {
      throw new TypeError(
        `Expected alpha value (${alpha}) as a fraction or percentage`
      )
    }

    alpha = (alpha | (1 << 8)).toString(16).slice(1) // eslint-disable-line no-mixed-operators
  } else {
    alpha = ''
  }

  return (
    (blue | (green << 8) | (red << 16) | (1 << 24)).toString(16).slice(1) +
    alpha
  )
}

/**
 * Transform 4 numeric RGBA values into a hexcode
 * @param param0 - {r,g,b,a} All numeric
 * @returns Hexcode. String starting with #
 * TODO: tests
 */
export function rgbaToHex({
  r,
  g,
  b,
  a,
}: {
  r: number
  g: number
  b: number
  a?: number
}): string {
  const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(
    g * 255
  )}, ${Math.round(b * 255)}, ${a?.toFixed(2) ?? 1})`
  return `#${rgbHex(rgba)}`
}

/**
 * Adds a new token inside a token group, in the path specified
 * @param tokenGroup TokenGroupParsed - The original TokenGroup
 * @param route string[] - The levels of structure inside the token group to add the new token
 * @param value SingleTokenObjectParsed - The token to add
 * @returns TokenGroupParsed - Copy of tokenGroup with the new value added
 * TODO: tests
 */
export function addTokenIntoRoute(
  tokenGroup: DesignTokens,
  route: string[],
  value: DesignToken
): DesignTokens {
  const res = { ...tokenGroup }
  // Current step we're visiting on the path
  // We start at the base of the `dataTree`
  let currentStep = res
  route.forEach((nextLevel, levelIndex, path) => {
    if (!currentStep[nextLevel]) {
      // If the nextLevel of the path does not exist in currentStep
      // we create it as an empty object
      currentStep[nextLevel] = {}
    }

    // If we are at the last level and we received a value to set
    if (levelIndex === path.length - 1 && value) {
      // We assign it as the value of the last level
      currentStep[nextLevel] = value
    }

    // We advance to the next step
    currentStep = currentStep[nextLevel] as DesignTokens
  })

  // We return the copy with the levels added
  return res
}
