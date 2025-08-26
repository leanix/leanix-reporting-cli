import type { IPromptResult } from '..'
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export interface IDeployTemplateParams {
  targetDir: string
  defaultProjectName: string
  result: IPromptResult
}

const renameFiles: Record<string, string> = {
  _gitignore: '.gitignore'
}

const copyDir = (srcDir: string, destDir: string): void => {
  mkdirSync(destDir, { recursive: true })
  const files = readdirSync(srcDir)
  for (const file of files) {
    const srcFile = resolve(srcDir, file)
    const destFile = resolve(destDir, file)
    // eslint-disable-next-line ts/no-use-before-define
    copy(srcFile, destFile)
  }
}

const copy = (src: string, dest: string): void => {
  const _stat = statSync(src)
  if (_stat.isDirectory()) {
    copyDir(src, dest)
  }
  else { copyFileSync(src, dest) }
}

export const deployTemplate = (params: IDeployTemplateParams): void => {
  const { targetDir, result } = params
  const { variant, framework } = result
  if (targetDir === null) {
    throw new Error('invalid target dir')
  }
  // determine template
  const template = variant ?? framework?.name ?? null
  if (template === null) {
    throw new Error('unknown template')
  }

  const templateDir = join(__dirname, 'templates', template)
  const write = (file: string, content?: string): void => {
    const targetPath = join(targetDir, renameFiles[file] ?? file)
    if (content !== undefined) {
      writeFileSync(pathToFileURL(targetPath), content)
    }
    else { copy(join(templateDir, file), targetPath) }
  }

  const templateFiles = readdirSync(pathToFileURL(templateDir))
  for (const file of templateFiles /* .filter(f => f !== 'package.json') */) {
    write(file)
  }
}
