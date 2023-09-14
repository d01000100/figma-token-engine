<div align="center">
  <a href="https://github.com/d01000100/figma-token-engine">
    <img src=".docs/logo.svg" alt="Logo" alt="Logo" width="256" height="256">
  </a>

  <h3 align="center"><strong>Figma Tokens Engine</strong></h3>
  <p align="center">
    Transform design tokens in Figma into usable styles
  </p>

</div>

<br/>

## 🚛 About Figma Token Engine

The Figma Token Engine is a project dependency that transforms design tokens (either as Figma Styles, from [Token Studio](https://tokens.studio/), or [variables2json](https://www.figma.com/community/plugin/1253571037276959291/variables2json)) into CSS styles using [style-dictionary](https://github.com/amzn/style-dictionary).

<div align="center">
  <img src=".docs/engine-diagram.svg" alt="Logo" alt="Logo">
</div>

<details>
  <summary><b>Why variables2json plugin?</b></summary>

  For all the other input formats, I'm using the [Figma API](https://www.figma.com/developers/api) to fetch the information I need directly from the Figma File. This is very useful to create automatic pipelines that don't require direct access (or even installing) to Figma.

  However, at the time of this version, Figma Variables API is only for Enterprise Accounts, and I don't have access to one. That's why I had to rely on Figma plugins to extract and somewhat parse the variables data. Unfortunately, this makes the process more manual, as it requires someone to open the Figma file(s), run the plugin, save the token file and run the token engine.

  I chose variables2json because it exports an easy to process format and the process to export it is straightforward enough. Also, because in cases where you're referencing a file's variables in another file, variables2json doesn't try to resolve it and mantains the name of the connection, which I need.

  I was working on a version using the Figma Variable API output, from a brief moment I had access to an Enterprise account. The branch is [feature/variables-input](https://github.com/d01000100/figma-token-engine/tree/feature/variables-input) and if you have an enterprise account and are willing to check it out and continue the work, I'd be very grateful.
</details>

<br/>

## 📓 Config Files

The Figma Token Engine (FTE) requires two files which can be created using `npx figma-token-engine --init`.

The two files helps the FTE to access the Figma API and to know where to find and save the files you need.

### .tokens.config.json

First, `.tokens.config.json` has the custom configuration of the FTE pipeline:

- **tokenFormat:** The type of data we're going to read from the Figma file. The current version supports the following formats:
  - **FigmaStyles** The Style library published by the Figma file. It read the colors, typographies and shadows and uses the name of the styles as is to name the generated variables.
  - **TokensStudio** Reads the tokens from the [Tokens Studio plugin](tokens.studio). The current version combines all tokens sets into the same output and does not support themes or theme groups.
  - **variables2json** Reads the export(s) from the [Figma plugin variables2json](https://www.figma.com/community/plugin/1253571037276959291/variables2json). Parses the color and numeric variables. It also includes the Figma Styles.
- **inputFile** The file where the tokens read from Figma will be written to and read by StyleDictionary
- **outputDir** The location where the FTE will output the processed tokens.
- **platforms** *optional* The specified platforms (called [formats on StyleDictionary](https://amzn.github.io/style-dictionary/#/formats)) that the FTE will generate. The current version supports:
  - `css`. Using css custom variables. Outputs to `tokens.css`
  - `scss`. Outputs to `tokens.scss`
  - `scssMap`. Creates a sass map with the tokens names as keys and the tokens values as the map values. Outputs to `tokensMap.scss`
  - `less`. Outputs to `tokens.less`
  - `jsp`. Outputs js variables to `tokens.js`
  - `ts`. Outputs ts variables to `tokens.ts`
  - `json`. Outputs a JSON, whose structure is the same as the source. Outputs to `tokens.json`

*Example*

```json
{
  "tokenFormat": "FigmaStyles",
  "inputFile": "./raw_styles.json",
  "outputDir": "./src/styles/tokens",
  "platforms": [
    "css",
    "scss",
    "scssMap",
    "less",
    "js",
    "ts",
    "json"
  ]
}
```

#### Specific input format arguments

Some input format may recieve additional arguments that configure how that specific format is processed or what data is logged into additional files

<details>
  <summary>Tokens Studio</summary>

  - **sets**: Optional string[]. What sets will be included to parse and to resolve alias values. If undefined, all token sets will be parsed.
  - **excludes** Optional string[]. What token sets will be excluded from the result. This may be useful to include sets for token resolution but exclude them from the final outputs. If undefined, no token sets will be excluded.
  - **transformerOutput**: Optional string. Filename and location, either absolute or relative to the fte process, to write the output of the token-transformer. It has the tokens as they entery StyleDictionary pipeline. Useful for debugging. If undefined, it will be written to a temporary file.

  _[See more](https://www.npmjs.com/package/token-transformer)_

  ```json
  {
    "tokenFormat": "TokensStudio",
    "inputFile": "./raw_tokens.json",
    "outputDir": "./src/styles/tokens",
    "platforms": [
      "css",
      "scss",
      "scssMap",
      "less",
      "js",
      "ts",
      "json"
    ],
    "sets": ["base", "dark", "light"],
    "excludes": ["base"],
    "transformerOutput": "./tmp/transformed_tokens.json"
  }
  ```
</details>

<details>
  <summary>variables2json</summary>

  - **variableFiles**. **Required** string | string[]. File or files of exports from variables2json. It receives more than one in the case you are using variables from multiple files. Even if they're alias between files!
  - **parsedTokensFile**: Optional string. Filename and location to write the parsed variables into. They're the data just before entering the StyleDictionary pipeline. Useful when debugging. If undefined, it will be written on a temporary file.

  ```json
  {
    "tokenFormat": "variables2json",
    "variableFiles": ["./global-tokens.json", "./component-tokens.json"],
    "outputDir": "./src/styles/tokens",
    "platforms": [
      "css",
      "scss",
      "scssMap",
      "less",
      "js",
      "ts",
      "json"
    ],
    "parsedTokenFile": "./tmp/parsed-variables.json"
  }
  ```
</details>

### .env

Secondly, the `.env` exposes sensitive data we might not want to have in our repository such as the Figma API Key and the Figma file which we are pulling data from.

```sh
# Your personal Figma Personal Access token https://www.figma.com/developers/api#access-tokens
FIGMA_PERSONAL_ACCESS_TOKEN=""

# URL of the Figma file with the design tokens
FIGMA_FILE_URL=""
```

<br/>

## 🚀 How to use

> You can also check out the more practical [Quick Guide at Medium](https://medium.com/@jdanielca/figma-token-engine-quick-start-b6e0bc08a388)

Install Figma Token Engine to your project:

```sh
npm i figma-token-engine
```

Generate .env anc config files:

```sh
npx figma-token-engine --init
```

Add your Figma API KEY, Document URL and configuration to the `.env` file and the `.tokens.config.json` files.

Run the token engine using npm scripts:

```json
{
  ...
  "scripts": {
    "token-engine:fetch": "figma-token-engine",
  },
}
```

### CLI params

- **`figma-token-engine TOKEN_CONFIG_FILENAME`** A single flagless param will specify a custom `.tokens.config.json` file to read the FTE configuration from.
- **`--init`**: Create necessary environment files (.env, .tokens.config.json) to run the token engine with example content.
- **`--sd-config-file SD_CONFIG_FILENAME`**: Location of a [StyleDictionary configuration file](https://amzn.github.io/style-dictionary/#/config) to merge with the one FTE uses. This can be used to extend platforms, filters, tokens location, etc.
  
  Example of a config file:

  <details>
    <summary>As an js module</summary>

    ```js
    module.exports = {
      "platforms": {
        "swift": {
          "transformGroup": "ios-swift",
          "buildPath": "./ios/",
          "files": [
            {
              "destination": "ios",
              "format": "ios-swift/enum.swift",
              "options": {
                "fileHeader": () => ["This is a custom header"]
              }
            }
          ]
        },
        "android": {
          "transformGroup": "android",
          "files": [
            {
              "destination": "android",
              "format": 'android/resources',
              "options": {
                "fileHeader": () => ["This is a custom header"]
              }
            }
          ]
        }
      }
    }
    ```
  </details>

  <details>
    <summary>As a JSON:</summary>

    ```json
    {
      "platforms": {
        "swift": {
          "transformGroup": "ios-swift",
          "buildPath": "./ios/",
          "files": [
            {
              "destination": "ios",
              "format": "ios-swift/enum.swift",
              "options": {
                "fileHeader": "This is a custom header"
              }
            }
          ]
        },
        "android": {
          "transformGroup": "android",
          "files": [
            {
              "destination": "android",
              "format": "android/resources",
            }
          ]
        }
      }
    }
    ```

    The custom configuration file will have priority over FTE's configuration, however some fields will be appended, rather than overwritten:
    - Sources will be appended. StyleDictionary will still fetch the source specified in the .tokens.config.json
    - Parsers will be appended. StyleDictionary will still run FTE's parsers
    - Platforms will be appended and extended. FTE's premade platforms will still be configured. Custom configruation can add platforms or overwrite them, if specified. Also, FTE's buildPath (from the .tokens.config.json) and fileHeader will be added if not specified.
    - All other settings are added without modifications
  </details>

<br/>

## Architecture

*TODO: Complete architecutre documentation of the pipeline*

*[Go to architecture](./docs/architecture.md)*

## 📝 Example: Create a React App and install Figma token Engine

First follow the instructions detailed in "How To Use". Then, we will create a fresh React app and will init the Figma Token Engine.

```sh
npx create-react-app@latest app-react
cd app-react
npx figma-token-engine --init
```

This will create or update two files: `.tokens.config.json` and `.env`, which are required for the tool to work. Add the required information in both files to continue.

If you added the FIGMA_PERSONAL_ACCESS_TOKEN and FIGMA_FILE_URL you can fetch the tokens into the `inputFile` file defined at the token file config `.tokens.config.json`.

```sh
npx figma-token-engine
```

*More detailed guide: [Quick Guide at Medium](https://medium.com/@jdanielca/figma-token-engine-quick-start-b6e0bc08a388)*

<br/>

## 🧰 Development

To start development of this tool, you need to take into account two thigs: The shell interaction happens in the file `bin/fte.js` while the rest of the project is a Typescript Node Tool.

### Development Environment

Simple development environment:

```sh
npm run dev
```

Development environment with API Fetch:

```sh
npm run dev:api
```

Development environment of the init option:

```sh
npm run dev:init
```

<br/>

## 🤝 Contribute

Contributions will open after the alpha release of this stack. Contact us if you have any questions.

<br/>

## 🧑‍💻 Team

- [daniel.casado](mailto:jdanielca@gmail.com) - [GitHub](https://github.com/d01000100) (Sr. Design Technologist at frog)
- [jose.lugo](mailto:me@joselugo.dev) - [GitHub](https://github.com/chepetime)

<br/>