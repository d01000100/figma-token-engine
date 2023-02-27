import { green, yellow } from 'colorette'
import clear from 'clear'
import figlet from 'figlet'

const version = '0.1.0'

export function printAppName() {
  clear()
  const today = new Date()
  const month = today.getMonth() + 1

  console.log(
    green(
      figlet.textSync('Token Engine', {
        font: month === 10 ? 'Ghost' : 'Big Money-ne',
        verticalLayout: 'fitted',
        width: month === 10 ? 80 : 60,
        horizontalLayout: 'full',
        whitespaceBreak: true,
      })
    )
  )

  console.log(
    yellow(
      figlet.textSync(`ver. ${version}`, {
        font: 'Stop',
      })
    )
  )
}
