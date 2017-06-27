import * as chalk from 'chalk';
import * as fs from 'fs';
import * as varReplace from 'variable-replacer';
import { PathHelper } from './path-helper';

export class TemplateExtractor {

  private pathHelper = new PathHelper();

  public extractTemplateFiles(answers: any) {
    console.log(chalk.green('Extracting template files...'));

    const templateDir = this.pathHelper.getTemplateDirectory()
    fs.readdirSync(templateDir).forEach(file => {
      console.log(' -- ', file);
      this.extractTemplateFile(file, answers);
    });
  }

  private extractTemplateFile(filename: string, answers: any) {
    const source = this.pathHelper.getTemplateSourcePath(filename);
    const dest = this.pathHelper.getTargetFolderPath(filename);

    console.log(source, dest);

    varReplace({
      source,
      dest,
      inlineData: answers,
      logLevel: 'none' // info
    });
  }

}
