import { bgRed, blue, bold, magenta, white, yellow } from 'colorette'
import { loading } from 'cli-loading-animation'
import spinners from 'cli-spinners'

export function getTime() {
  function formatConsoleDate(date: Date) {
    const hour = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const milliseconds = date.getMilliseconds()

    return (
      `${('00' + hour).slice(-2)}:` +
      `${('00' + minutes).slice(-2)}:` +
      `${('00' + seconds).slice(-2)}.` +
      ('00' + milliseconds).slice(-3)
    )
  }

  return formatConsoleDate(new Date())
}

export function logStep(str: string) {
  console.log(blue(`${str}`))
}

export function logEvent(str: string) {
  console.log(white(`[${getTime()} - Event] ${str}`))
}

export function logWarning(str: string) {
  console.warn(yellow(`[${getTime()} - Warning] ${str}`))
}

export function logError(str: string) {
  console.log(bgRed(bold(`\n[${getTime()} - Error] ${str} \n`)))
  throw new Error(str)
}

export function logSuccessElement(str: string) {
  console.log(blue(bold(`✅ ${str}`)))
}

export function logExternalLibrary(str: string) {
  console.log(magenta(str))
}

export function logLoaderPlanet(str: string) {
  const { start, stop } = loading(blue(bold(str)), {
    clearOnEnd: false,
    spinner: spinners.earth,
  })
  return { start, stop }
}

export function logGroup(children: () => void) {
  children()
}
