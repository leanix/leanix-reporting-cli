import * as chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import * as varReplace from 'variable-replacer';
import { getProjectDirectoryPath, getTemplateDirectoryPath } from './path.helpers';
import { UserInitInput } from "./interfaces";

export class TemplateExtractor {

  public extractTemplateFiles(answers: UserInitInput): void {
    console.log(chalk.green('Extracting template files...'));
    const templateDir = getTemplateDirectoryPath();
    this.extractTemplateDir(templateDir, answers);
  }

  private extractTemplateDir(templateDir: string, answers: UserInitInput) {
    fs.readdirSync(templateDir)
    .forEach(file => {
      const filePath = path.resolve(templateDir, file);
      const isDir = fs.lstatSync(filePath).isDirectory();
      if (isDir) {
        this.extractTemplateDir(filePath, answers);
      } else {
        this.extractTemplateFile(filePath, answers);
      }
    });
  }

  private extractTemplateFile(source: string, answers: UserInitInput) {
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
