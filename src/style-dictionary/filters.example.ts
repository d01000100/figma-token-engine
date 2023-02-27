/**
 * Example of how to define a filter to include in the StyleDictionary pipeline
 *
 * This baseline of the design token engine doesn't need one, but it's likely that a specific project does.
 */
// import StyleDictionary from 'style-dictionary';
// import { TransformedToken } from 'style-dictionary/types/TransformedToken';
// import { SingleTokenObjectParsed } from './parser/types/tokens';
// import { AdditionalTypesParsed } from './parser/types/valueTypes';

/* This should be defined in types.ts */
// export enum Filter {
//   exampleFilter = 'exampleFilter',
// }

/**
 * This example filter, only selects breakpoints tokens.
 * @param token
 * @returns
 */
// function filterExample(token: TransformedToken): boolean {
//   const originalToken = token.original as SingleTokenObjectParsed;
//   return originalToken.type === AdditionalTypesParsed.breakpoint;
// }

// export function registerFilters(): void {
//   StyleDictionary.registerFilter({
//     name: Filter.exampleFilter,
//     matcher: filterExample,
//   });
// }

/**
 * The next steps after defining a new filter are:
 * 1. Call the `registreFilters` function in the body of `createStyleDictionaryConfig` in `index.ts`
 * 2. Add the filter name to the file configurations that require them:
      files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: {
              fileHeader: FileHeader.generatedByTokenEngine,
            },
            filter: Filter.exampleFilter,
          },
        ]
 */
