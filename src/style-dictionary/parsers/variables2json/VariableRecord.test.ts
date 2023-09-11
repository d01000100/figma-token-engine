/* eslint-disable @typescript-eslint/no-non-null-assertion */
import VariableRecord, { RecordedVariable } from "./VariableRecord";

const BASE_COLOR: RecordedVariable = {
  name: "foo/100",
  isAlias: false,
  type: "color",
  value: "#AAFF00",
  collectionName: "base",
  modes: []
}

const BASE_COLOR_LIGHT: RecordedVariable = {
  name: "foo/100",
  isAlias: false,
  type: "color",
  value: "#AAFF00",
  collectionName: "theme",
  modes: ["onLight"]
}

const BASE_COLOR_DARK: RecordedVariable = {
  name: "foo/100",
  isAlias: false,
  type: "color",
  value: "#AAFF00",
  collectionName: "theme",
  modes: ["onDark"]
}

const ALIAS_COLOR: RecordedVariable = {
  name: "button/foo",
  isAlias: true,
  type: "color",
  value: {
    name: "foo/100"
  },
  collectionName: "alias",
}

test('add a variable', () => {
  const record = new VariableRecord()
  record.createRecord({ collections: [] })

  record.addVariable(BASE_COLOR);

  const { matches } = record.getMatches({ name: BASE_COLOR.name })

  expect(matches).toContain(BASE_COLOR)
})

test('single match', () => {
  const record = new VariableRecord()
  record.createRecord({ collections: [] })

  record.addVariable(BASE_COLOR);
  record.addVariable(ALIAS_COLOR);

  const { matches: baseMatches } = record.getMatches({ name: BASE_COLOR.name })
  expect(baseMatches).toContain(BASE_COLOR)
  expect(baseMatches).not.toContain(ALIAS_COLOR)
})

test('multiple match', () => {
  const record = new VariableRecord()
  record.createRecord({ collections: [] })

  record.addVariable(BASE_COLOR);
  record.addVariable(BASE_COLOR_LIGHT);
  record.addVariable(ALIAS_COLOR);

  const { matches: baseMatches } = record.getMatches({ name: BASE_COLOR.name })
  expect(baseMatches).toContain(BASE_COLOR)
  expect(baseMatches).toContain(BASE_COLOR_LIGHT)
  expect(baseMatches).not.toContain(ALIAS_COLOR)

})

test('mode count', () => {
  const record = new VariableRecord()
  record.createRecord({ collections: [] })

  record.addVariable(BASE_COLOR_DARK);
  record.addVariable(BASE_COLOR_LIGHT);
  record.addVariable(ALIAS_COLOR);

  const { modes } = record.getMatches({ name: BASE_COLOR_DARK.name })
  expect(modes).toContain(BASE_COLOR_DARK.modes![0])
  expect(modes).toContain(BASE_COLOR_LIGHT.modes![0])

})

test('match with collection', () => {
  const record = new VariableRecord()
  record.createRecord({ collections: [] })

  record.addVariable(BASE_COLOR);
  record.addVariable(BASE_COLOR_LIGHT);

  const { matches: baseMatches } = record.getMatches({ name: BASE_COLOR.name, collection: BASE_COLOR.collectionName })
  expect(baseMatches).toContain(BASE_COLOR)
  expect(baseMatches).not.toContain(BASE_COLOR_LIGHT)

})

test('remove a variable with different name', () => {
  const record = new VariableRecord()
  record.createRecord({ collections: [] })

  record.addVariable(BASE_COLOR);
  record.addVariable(ALIAS_COLOR);
  record.removeVariable(BASE_COLOR)

  const { matches: baseMatches } = record.getMatches({ name: BASE_COLOR.name })
  const { matches: aliasMatches } = record.getMatches({ name: ALIAS_COLOR.name })

  expect(aliasMatches).toContain(ALIAS_COLOR)
  expect(baseMatches).not.toContain(BASE_COLOR)
})

test('remove a variable with same name and different mode', () => {
  const record = new VariableRecord()
  record.createRecord({ collections: [] })

  record.addVariable(BASE_COLOR);
  record.addVariable(BASE_COLOR_LIGHT);
  record.removeVariable(BASE_COLOR)

  const { matches } = record.getMatches({ name: BASE_COLOR.name })

  expect(matches).toContain(BASE_COLOR_LIGHT)
  expect(matches).not.toContain(BASE_COLOR)
})