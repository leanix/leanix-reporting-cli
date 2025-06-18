import { exec } from 'node:child_process'
import { writeFile } from 'node:fs'
import { promisify } from 'node:util'
import { rimraf } from 'rimraf'

export const execAsync = promisify(exec)
export const writeFileAsync = promisify(writeFile)
export const rimrafAsync = rimraf
