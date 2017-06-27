import * as chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import * as varReplace from 'variable-replacer';
import { PathHelper } from './path-helper';

export class TemplateExtractor {

  private pathHelper = new PathHelper();

  public extractTemplateFiles(answers: any) {
    console.log(chalk.green('Extracting template files...'));
    const templateDir = this.pathHelper.getTemplateDirectory();
    this.extractTemplateDir(templateDir, answers);
  }

  private extractTemplateDir(templateDir: string, answers: any) {
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

  private extractTemplateFile(source: string, answers: any) {
    const dest = source.replace(this.pathHelper.getTemplateDirectory(), this.pathHelper.getTargetDirectory());

    console.log(source, dest);

    varReplace({
      source,
      dest,
      inlineData: answers,
      logLevel: 'none' // info
    });
  }

}
