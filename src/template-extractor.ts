import type * as inquirer from 'inquirer'
import * as fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import chalk from 'chalk'
import { render } from 'ejs'
import { sync as mkdirpSync } from 'mkdirp'
import { getProjectDirectoryPath } from './path.helpers'

export class TemplateExtractor {
  public extractTemplateFiles(baseTemplateDir: string, answers: inquirer.Answers): void {
    console.log(chalk.green('Extracting template files...'))
    this.extractTemplateDir(baseTemplateDir, baseTemplateDir, answers)
  }

  private extractTemplateDir(templateDir: string, baseTemplateDir: string, answers: inquirer.Answers) {
    fs.readdirSync(templateDir).forEach((file) => {
      const filePath = resolve(templateDir, file)
      const isDir = fs.lstatSync(filePath).isDirectory()
      if (isDir) {
        this.extractTemplateDir(filePath, baseTemplateDir, answers)
      }
      else {
        this.extractTemplateFile(filePath, baseTemplateDir, answers)
      }
    })
  }

  private extractTemplateFile(sourcePath: string, baseTemplateDir: string, answers: inquirer.Answers) {
    const destPath = sourcePath.replace(baseTemplateDir, getProjectDirectoryPath()).replace(/\.ejs$/, '')

    console.log(sourcePath, destPath)

    const template = fs.readFileSync(sourcePath).toString('utf-8')
    const result = render(template, answers)
    mkdirpSync(dirname(destPath))
    fs.writeFileSync(destPath, result)
  }
}
