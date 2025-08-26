import type { ExecaSyncReturnValue, SyncOptions } from 'execa'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execaCommandSync } from 'execa'
import { mkdirpSync, readdirSync, statSync, writeFileSync } from 'fs-extra'
import { generate as uuid } from 'short-uuid'
import pkg from '../package.json' with { type: 'json' }

const CLI_PATH = resolve(__dirname, '..', pkg.bin)
const projectName = 'test-app'
const genPath = resolve(__dirname, projectName)

const run = (
  args: string[],
  options: SyncOptions = {}
): ExecaSyncReturnValue => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(' ')}`, options)
}

// Helper to create a non-empty directory
const createNonEmptyDir = (): void => {
  // Create the temporary directory
  mkdirpSync(genPath)

  // Create a package.json file
  const pkgJson = join(genPath, 'package.json')
  writeFileSync(pkgJson, '{ "foo": "bar" }')
}

// Get all file names in a directory, recursively
const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
  readdirSync(dirPath).forEach((file) => {
    statSync(`${dirPath}/${file}`).isDirectory()
      ? arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles)
      : arrayOfFiles.push(file)
  })
  return arrayOfFiles
}

const getPackageJson = (dirPath: string): any => JSON.parse(readFileSync(join(dirPath, 'package.json')).toString())

// Vue 3 starter template plus 1 generated file: 'lxr.json'
const templateFiles = [...getAllFiles(resolve(CLI_PATH, '..', 'templates', 'vue')), 'lxr.json']
  .map(file => file === '_gitignore' ? '.gitignore' : file)
  .sort()

beforeEach(() => {
  if (existsSync(genPath)) {
    rmSync(genPath, { recursive: true })
  }
})
afterAll(() => {
  if (existsSync(genPath)) {
    rmSync(genPath, { recursive: true })
  }
})

it('prompts for the project name if none supplied', () => {
  const { stdout } = run([])
  expect((stdout as string)?.includes('Project name:')).toBe(true)
})

it('prompts for the framework if none supplied', () => {
  const { stdout } = run([projectName])
  expect((stdout as string)?.includes('Select a framework:')).toBe(true)
})

it('prompts for the framework on not supplying a value for --template', () => {
  const { stdout } = run([projectName, '--template'])
  expect((stdout as string)?.includes('Select a framework:')).toBe(true)
})

it('prompts for the framework on supplying an invalid template', () => {
  const { stdout } = run([projectName, '--framework', 'unknown'])
  expect((stdout as string)?.includes('"unknown" isn\'t a valid framework. Please choose from below:')).toBe(true)
})

it('asks to overwrite non-empty target directory', () => {
  createNonEmptyDir()
  const { stdout } = run([projectName], { cwd: __dirname })
  expect((stdout as string)?.includes(`Target directory "${projectName}" is not empty.`)).toBe(true)
})

it('asks to overwrite non-empty current directory', () => {
  createNonEmptyDir()
  const { stdout } = run(['.'], { cwd: genPath, input: 'test-app\n' })
  expect((stdout as string)?.includes('Current directory is not empty.')).toBe(true)
})

it('successfully scaffolds a project based on vue starter template', async () => {
  const template = 'vue'
  const variant = 'vue'
  const reportId = uuid()
  const author = uuid()
  const title = uuid()
  const description = uuid()
  const host = uuid()
  const apitoken = uuid()
  const proxyURL = uuid()

  const args = [
    '--overwrite',
    '--framework',
    template,
    '--variant',
    variant,
    '--id',
    reportId,
    '--author',
    author,
    '--title',
    title,
    '--description',
    description,
    '--host',
    host,
    '--apitoken',
    apitoken,
    '--proxyURL',
    proxyURL
  ]

  const { stdout, stderr } = run([projectName, ...args], { cwd: resolve(__dirname, '..') })
  expect(typeof stderr).toEqual('string')

  const targetPath = resolve(__dirname, '..', projectName)
  const generatedFiles = getAllFiles(targetPath).sort()

  // Assertions
  expect((stdout as string)?.includes(`Scaffolding project in ${targetPath}`)).toBe(true)
  expect(generatedFiles).toEqual(templateFiles)

  const pkg = getPackageJson(targetPath)
  expect(pkg.name).toEqual(projectName)
  expect(pkg.author).toEqual(author)
  expect(pkg.description).toEqual(description)
  expect(pkg.version).toEqual('0.0.0')
  expect(pkg?.leanixReport?.id).toEqual(reportId)
  expect(pkg?.leanixReport?.title).toEqual(title)
  expect(typeof pkg?.leanixReport.defaultConfig).toEqual('object')
})
