import type { IPromptResult } from '..'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { generate as uuid } from 'short-uuid'
import { generateLeanIXFiles } from './leanix'

let targetDir = ''
const testId = uuid()

beforeAll(async () => {
  targetDir = await mkdtemp(`${tmpdir()}${sep}`)
  await writeFile(join(targetDir, 'package.json'), JSON.stringify({ testId }))
})

it('it updates package.json and generates lxr.json files', async () => {
  const result: IPromptResult = {
    targetDir,
    packageName: uuid(),
    author: uuid(),
    description: uuid(),
    id: uuid(),
    title: uuid(),
    host: uuid(),
    apitoken: uuid(),
    proxyURL: uuid()
  }
  await generateLeanIXFiles({ targetDir, result })
  const lxrJson = await readFile(join(targetDir, 'lxr.json'))
    .then(buffer => JSON.parse(buffer.toString()))
  const packageJson = await readFile(join(targetDir, 'package.json'))
    .then(buffer => JSON.parse(buffer.toString()))

  expect(lxrJson)
    .toEqual({
      host: result.host,
      apitoken: result.apitoken,
      proxyURL: result.proxyURL
    })

  expect(packageJson)
    .toMatchObject({
      name: result.packageName,
      version: '0.0.0',
      author: result.author,
      description: result.description
    })
})
