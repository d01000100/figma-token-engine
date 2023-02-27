import { generateTemplate } from './config'

test('generateTemplate returns consistent configuration file', (): void => {
  const generateTemplateResult = JSON.stringify(generateTemplate())

  const hardcodedTemplateResult = JSON.stringify({
    tokenFormat: 'FigmaTokens',
    figmaFileId: '',
    inputFile: './figma-tokens.json',
    outputDir: './src/styles/tokens',
    platforms: [
      'css',
      'cssAutocomplete',
      'scss',
      'scssMap',
      'less',
      'js',
      'ts',
      'json',
    ],
  })

  expect(generateTemplateResult).toBe(hardcodedTemplateResult)
})
