# Figma Token Engine

The FTE is a Node.js devtool with a CLI that configures an instance of StyleDictionary and creates a full pipeline to process tokens from Figma into usable code.

The engine has the following major parts, which are called in this order:

1. The CLI entry point on `bin/figma-token-engine.js`. It process the arguments, read the configuration file, and fires up the relevant code pieces
   - `src/types.ts` Defines the types of the arguments the CLI receives and the application will be using these types whenever in need to read the arguments
2. Orchestration functions on `src/index.ts`, `src/figma-styles`, `src/token-studio`, and `src/variables2json`

   - `src/index.ts` Analyzes the configuration arguments and chooses which pipeline to execute
     - It also stores the configuration arguments on a global state defined in `util/state.ts`
   - `src/figma-styles`, `src/token-studio`, `src/variables2json` (and in the future `src/figma-variables`) Call the Figma API to get the data or read the files they need, execute middleware (like `token-transform` for token studio, or parsing for Figma Variables) and executes StyleDictionary with their respective configuration

3. `src/figma-api` Figma API calls and file management
4. `src/style-dictionary` Configuration, custom functions and types for the StyleDictionary pipeline
   1. `index.ts` checks the configuration, chooses the appropiate parser, builds the StyleDictionary configuration, and executes the StyleDictionary pipeline for the platforms specified
    - `config.ts` Builds the StyleDictionary configuration according to the configuration, registering and appending all the custom functions we need.
   2. `parsers/*` Define the parsers that need to be run before or just at the beginning of the StyleDictionary pipeline.

   A parser is an optional stage of the [StyleDictionary pipeline](https://amzn.github.io/style-dictionary/#/parsers) meant to transform data from any format to the expected format SD

   Each parser defines the types of the data it expects to read

   The parsers "endpoints" are:
      - `parseVariables2JSON` defined on `variables2json/index.ts`
      - `parseTokensStudio` defined on `tokensStudioParser.ts`
      - `parseFigmaStyles` defined on `figmaStylesParser.ts`

      > TODO: Add parser for Figma Variables

   > There are a couple of util and common functions from previous versions that are most likely obsolete now:
   > - `common.ts`
   > - `types/nameStandard.ts`
   > TODO: Check if those are really obsolete

   3. **Transforms and Transform groups**

      [Transforms are functions in the SD pipeline](https://amzn.github.io/style-dictionary/#/transforms) that transforms or add metadata to individual tokens.

      [Transform groups define a collection of transforms to apply (and in what order) to a specific context](https://amzn.github.io/style-dictionary/#/transform_groups).

      Style Dictionary has a lot of pre-defined transforms and transform groups for common outputs and formats. However, we need to define several transforms for some customization the FTE does to the metadata and to custom formats we output

      - The custom transforms are defined on `transformers.ts` and on `transformers/*`.

        The function `registerTransformers()` needs to be called when configuring StyleDictionary for the custom transform to exist in the pipeline
      - The custom transform groups are defined on `transform-groups.ts`

        You need to run `registerTransformGroups()` after registering the the transforms for the transform groups to be available to StyleDictionary
   4. **Formats**

      [A format is the final output of useful code that StyleDictionary will generate from the design tokens.](https://amzn.github.io/style-dictionary/#/formats).

      We mostly use the built-in formats, although we do define a couple on `formatters.ts`. As always, you need to call `registerFormatters()` to use the formats before running the SD instance

> TODO:
> - Mobile additional loop (not now, maybe not necessary anymore)
> - FigmaVariables pipeline