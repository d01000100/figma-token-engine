import { generateTemplate } from './config'

test('generateTemplate returns consistent configuration file', (): void => {
  const generateTemplateResult = JSON.stringify(generateTemplate())

  const hardcodedTemplateResult = JSON.stringify({
    tokenFormat: 'TokensStudio',
    figmaFileId: '',
    inputFile: './tokens-studio.json',
    outputDir: './src/styles/tokens'
  })

  expect(generateTemplateResult).toBe(hardcodedTemplateResult)
})
