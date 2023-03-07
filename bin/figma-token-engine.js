#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const { Command } = require('commander')
const { version } = require('../package.json')

const { runTokenEngine, generateTokenTemplate } = require('../build')

const program = new Command()

const DEFAULT_CONFIG_FILENAME = '.tokens.config.json'
const DEFAULT_ENV_FILENAME = '.env'

const DEFAULT_ENV_PARAMS = [
  [
    'FIGMA_PERSONAL_ACCESS_TOKEN',
    '',
    '# Your personal Figma Personal Access token https://www.figma.com/developers/api#access-tokens',
  ],
  [
    'FIGMA_FILE_URL',
    '',
    '# URL of the Figma file with the tokens',
  ],
]

program
  .name('figma-token-engine')
  .description('Transform design tokens into usable development code')
  .version(version)
  .arguments('[PATH...]')
  .option('--init', 'Init Figma Token Engine config files')
  .option('--config', 'Read token config file')
  .option('--api', 'Read data from Figma API')
  .option(
    '--dry-run',
    'Run Figma Token Engine without writing files in the system'
  )
  .action(start)
  .parse(process.argv)

function start(str, options) {
  // Check if you want init or just run
  if (options?.init) {
    return writeConfigFile()
  }

  const useAPI = options?.api
  const dryRun = options?.dryRun

  // Check if we have a readable file
  const globs =
    str.length > 0 ? str : [path.join(process.cwd(), DEFAULT_CONFIG_FILENAME)]

  Promise.all(globs.map(globToPaths))
    .then(pathReducer)
    .then(paths =>
      Promise.all(
        paths.map(filepath => processConfigFile(filepath, { useAPI, dryRun }))
      )
    )
}

/**
 * Create a new Figma Token Enfine Config File
 */
function writeConfigFile() {
  /* Write Config File */
  fs.writeFileSync(
    path.join(process.cwd(), DEFAULT_CONFIG_FILENAME),
    JSON.stringify(generateTokenTemplate(), null, 2)
  )

  /* Extend .env file */
  const stream = fs.createWriteStream(
    path.join(process.cwd(), DEFAULT_ENV_FILENAME),
    {
      flags: 'a',
    }
  )

  /* Add .env params */
  stream.once('open', () => {
    stream.write('\n')
    stream.write('# Added by Figma Token Engine')
    DEFAULT_ENV_PARAMS.map(([key, value, comment]) =>
      stream.write(`\n${key}="${value}" ${comment}\r`)
    )
  })
}

function globToPaths(arg) {
  return new Promise((resolve, reject) => {
    glob(arg, (err, files) => (err ? reject(err) : resolve(files)))
  })
}

function pathReducer(matches) {
  return matches.reduce((state, match) => [...state, ...match], [])
}

async function processConfigFile(filepath, options) {
  try {
    const json = await JSON.parse(fs.readFileSync(filepath))
    runTokenEngine(json, options)
  } catch (error) {
    return { filepath, error }
  }
}
