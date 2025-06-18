import { join, resolve } from 'node:path'

export function getProjectDirectoryPath(path = ''): string {
  return resolve(process.cwd(), path)
}

export function getTemplateDirectoryPath(): string {
  return join(__dirname, '../template')
}
