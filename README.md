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

The Figma Token Engine is a project dependency that transforms design tokens (either as Figma Styles of from [Token Studio](https://tokens.studio/) into CSS styles using [token-transformer](https://www.npmjs.com/package/token-transformer) and [style-dictionary](https://github.com/amzn/style-dictionary).

<div align="center">
  <img src=".docs/engine-diagram.svg" alt="Logo" alt="Logo">
</div>

<br/>

## 📓 Config Files

The Figma Token Engine (FTE) requires two files which can be created using `npx figma-token-engine --init`.

The two files helps the FTE to access the Figma API and to know where to find and save the files you need.

First, `.tokens.config.json` tells the FTE which approach will use (TokensStudio or FigmaStyles), the output directory and the platforms we need to support.

```json
{
  "tokenFormat": "TokenStudio",
  "figmaFileId": "",
  "inputFile": "./tokens-studio.json",
  "outputDir": "./src/styles/tokens",
  "platforms": [
    "css",
    "cssAutocomplete",
    "scss",
    "scssMap",
    "less",
    "js",
    "ts",
    "json"
  ]
}
```

Secondly, the `.env` exposes sensitive data we might not want to have in our repository such as the Figma API Key and the Figma file which we are pulling data from.

```sh
# Your personal Figma Personal Access token https://www.figma.com/developers/api#access-tokens
FIGMA_PERSONAL_ACCESS_TOKEN=""

# URL of the Figma file with the design tokens
FIGMA_FILE_URL=""
```

<br/>

## 🚀 How to use

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

- **--init**: Create necessary environment files (.env, .tokens.config.json) to run the token engine with example content.
- **--sd-config-file**: Location of a [StyleDictionary configuration file](https://amzn.github.io/style-dictionary/#/config) to merge with the one FTE uses. This can be used to extend formats, formatters, transformers and more.
  
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

## 💻 Commands

### **Default**

Use the default tool configuration with:

```sh
npx figma-token-engine
```

> If you don't have the `.tokens.config.js`file and the needed environment secrets in the `.env` you will need to initialize the project with the --init option.

<br/>

### **Initialize project**

```sh
npx figma-token-engine --init
```

This will create or update two files: `.tokens.config.json` and `.env`, which are required for the tool to work.

Update the configuration file and the enviroment variables with your current project needs.

<br/>

### **Custom Configuration file**

You can also pass your custom configuration file:

```sh
npx figma-token-engine --config .dev-tokens.config.json
```

<br/>

### **Multiple custom Configuration file**

Or pass an array for multiple projects:

```sh
npx figma-token-engine --config .angular-tokens.config.json .react-tokens.config.json .android-tokens.config.json
```

<br/>

### **Fetch API Data**

If you want to fetch data from the Figma API, use:

```sh
npx figma-token-engine
```

<br/>

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
- [jose.lugo](mailto:me@joselugo.dev) - [GitHub](https://github.com/chepetime) (Associate Technology Director at frog)

<br/>
