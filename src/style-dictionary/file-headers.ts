import StyleDictionary from 'style-dictionary'
import { FileHeader } from './types'

/* Defines the content of a header for file outputs.
https://amzn.github.io/style-dictionary/#/formats?id=file-headers */
export function registerFileHeaders(): void {
  StyleDictionary.registerFileHeader({
    name: FileHeader.generatedByTokenEngine,
    fileHeader: () => {
      return ['File generated by the Figma Token Engine','Do not edit directly']
    },
  })
}
