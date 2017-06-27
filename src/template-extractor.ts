import * as chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import * as varReplace from 'variable-replacer';
import * as _ from 'lodash';
import { PathHelper } from './path-helper';
import { UserInitInput } from "./interfaces";

export class TemplateExtractor {

  private pathHelper = new PathHelper();

  public extractTemplateFiles(answers: UserInitInput) {
    console.log(chalk.green('Extracting template files...'));
    const templateDir = this.pathHelper.getTemplateDirectory();
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
    const dest = source.replace(this.pathHelper.getTemplateDirectory(), this.pathHelper.getProjectDirectory());

    console.log(source, dest);

    answers = _.defaults(answers, {
      host: 'app.leanix.net'
    });

    varReplace({
      source,
      dest,
      inlineData: answers,
      logLevel: 'info' // info
    });
  }

}
