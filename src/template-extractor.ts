import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as varReplace from 'variable-replacer';
import * as fs from 'fs';
import * as path from 'path';
import { getProjectDirectoryPath } from './path.helpers';

export class TemplateExtractor {
  public extractTemplateFiles(baseTemplateDir: string, answers: inquirer.Answers): void {
    console.log(chalk.green('Extracting template files...'));
    this.extractTemplateDir(baseTemplateDir, baseTemplateDir, answers);
  }

  private extractTemplateDir(templateDir: string, baseTemplateDir: string, answers: inquirer.Answers) {
    fs.readdirSync(templateDir).forEach((file) => {
      const filePath = path.resolve(templateDir, file);
      const isDir = fs.lstatSync(filePath).isDirectory();
      if (isDir) {
        this.extractTemplateDir(filePath, baseTemplateDir, answers);
      } else {
        this.extractTemplateFile(filePath, baseTemplateDir, answers);
      }
    });
  }

  private extractTemplateFile(sourcePath: string, baseTemplateDir: string, answers: inquirer.Answers) {
    let destPath = sourcePath.replace(baseTemplateDir, getProjectDirectoryPath());

    if (path.basename(sourcePath) === 'gitignore') {
      destPath = getProjectDirectoryPath('.gitignore');
    }

    console.log(sourcePath, destPath);

    varReplace({
      source: sourcePath,
      dest: destPath,
      inlineData: answers,
      logLevel: 'none' // info
    });
  }
}
