import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as varReplace from 'variable-replacer';
import * as fs from 'fs';
import * as path from 'path';
import { getProjectDirectoryPath, getTemplateDirectoryPath } from './path.helpers';

export class TemplateExtractor {
  public extractTemplateFiles(answers: inquirer.Answers): void {
    console.log(chalk.green('Extracting template files...'));
    const templateDir = getTemplateDirectoryPath();
    this.extractTemplateDir(templateDir, answers);
  }

  private extractTemplateDir(templateDir: string, answers: inquirer.Answers) {
    fs.readdirSync(templateDir).forEach((file) => {
      const filePath = path.resolve(templateDir, file);
      const isDir = fs.lstatSync(filePath).isDirectory();
      if (isDir) {
        this.extractTemplateDir(filePath, answers);
      } else {
        this.extractTemplateFile(filePath, answers);
      }
    });
  }

  private extractTemplateFile(source: string, answers: inquirer.Answers) {
    let dest = source.replace(getTemplateDirectoryPath(), getProjectDirectoryPath());

    if (path.basename(source) === 'gitignore') {
      dest = getProjectDirectoryPath('.gitignore');
    }

    console.log(source, dest);

    varReplace({
      source,
      dest,
      inlineData: answers,
      logLevel: 'none' // info
    });
  }
}
