import { join } from 'node:path'
import { readJsonFile } from './file.helpers'

const packageJson = readJsonFile(join(__dirname, '..', 'package.json')) as { version: string }
export const version = packageJson.version
